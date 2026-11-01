import { createHash, createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { createReadStream, closeSync, openSync, writeSync } from "node:fs";
import { mkdtemp, chmod, rm, stat, open, statfs } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { Zip, ZipPassThrough } from "fflate";
import { fileKey, validateBackupPassword } from "./container";
import { BACKUP_SCHEMA_VERSION, BackupError, MAX_BACKUP_BYTES, MAX_DATABASE_BYTES, MAX_ENCRYPTED_BACKUP_BYTES } from "./types";
const chunkSize = 256 * 1024;
const integer = (value: number) => {
  const bytes = Buffer.alloc(4);
  bytes.writeUInt32BE(value);
  return bytes;
};
export async function createBackupWorkspace() {
  const directory = await mkdtemp(join(tmpdir(), "bloolog-"));
  await chmod(directory, 0o700);
  return { directory, dispose: () => rm(directory, { recursive: true, force: true }) };
}
export async function requireBackupSpace(directory: string, bytes: number) {
  const disk = await statfs(directory);
  if (disk.bavail * disk.bsize < bytes + 16 * 1024 * 1024)
    throw new BackupError("백업 작업을 위한 저장 공간이 부족해요.");
}
export async function hashBackupFile(path: string) {
  const hash = createHash("sha256");
  for await (const bytes of createReadStream(path)) hash.update(bytes);
  return hash.digest("hex");
}
export function backupFileResponse(path: string, filename: string, dispose: () => Promise<void>) {
  const source = createReadStream(path);
  source.once("close", () => { void dispose(); });
  return new Response(Readable.toWeb(source) as ReadableStream<Uint8Array>, {
    headers: {
      "Content-Type": "application/x-bloolog-backup",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
// Framed crypto reads/writes at most one native-sized frame at a time.
export async function cryptBackupFile(source: string, destination: string, password: string, encrypt: boolean) {
  validateBackupPassword(password);
  const size = (await stat(source)).size;
  if (size > (encrypt ? MAX_BACKUP_BYTES : MAX_ENCRYPTED_BACKUP_BYTES))
    throw new BackupError("단일 백업은 최대 1GB까지 지원해요.");
  await requireBackupSpace(destination.substring(0, destination.lastIndexOf("/")), size + 1024 * 1024);
  const input = await open(source, "r");
  const output = await open(destination, "wx", 0o600).catch(async (error) => {
    await input.close();
    throw error;
  });
  let position = 0;
  let key: Buffer | undefined;
  const read = async (length: number) => {
    const bytes = Buffer.alloc(length);
    let offset = 0;
    while (offset < length) {
      const result = await input.read(bytes, offset, length - offset, position);
      if (!result.bytesRead) throw new BackupError("백업 파일이 끝까지 저장되지 않았어요.");
      position += result.bytesRead;
      offset += result.bytesRead;
    }
    return bytes;
  };
  try {
    const header = encrypt
      ? Buffer.concat([Buffer.from("BLOO0001"), randomBytes(16), randomBytes(32)])
      : await read(56);
    if (!header.subarray(0, 8).equals(Buffer.from("BLOO0001")))
      throw new BackupError("지원하지 않거나 불완전한 .bloo 백업이에요.");
    key = await fileKey(password, header);
    if (encrypt) await output.writeFile(header);
    let sequence = 0;
    let total = 0;
    while (true) {
      const lengthBytes = encrypt ? integer(Math.min(chunkSize, size - position) + 28) : await read(4);
      const length = lengthBytes.readUInt32BE();
      if (length < 28 || length > chunkSize + 28 || (!encrypt && position + length > size))
        throw new BackupError("지원하지 않거나 불완전한 .bloo 백업이에요.");
      const aad = Buffer.concat([header, integer(sequence++), lengthBytes]);
      if (encrypt) {
        const bytes = await read(length - 28);
        const nonce = randomBytes(12);
        const cipher = createCipheriv("aes-256-gcm", key, nonce);
        cipher.setAAD(aad);
        await output.writeFile(Buffer.concat([lengthBytes, nonce, cipher.update(bytes), cipher.final(), cipher.getAuthTag()]));
      } else {
        const sealed = await read(length);
        try {
          const cipher = createDecipheriv("aes-256-gcm", key, sealed.subarray(0, 12));
          cipher.setAAD(aad);
          cipher.setAuthTag(sealed.subarray(-16));
          const plain = Buffer.concat([cipher.update(sealed.subarray(12, -16)), cipher.final()]);
          total += plain.length;
          if (total > MAX_BACKUP_BYTES) throw new BackupError("단일 백업은 최대 1GB까지 지원해요.");
          await output.writeFile(plain);
        } catch (error) {
          if (error instanceof BackupError) throw error;
          throw new BackupError("비밀번호가 다르거나 백업 파일이 손상됐어요.");
        }
      }
      if (length === 28) {
        if (position !== size) throw new BackupError("백업 파일의 끝이 올바르지 않아요.");
        break;
      }
    }
  } finally {
    key?.fill(0);
    await Promise.all([input.close(), output.close()]);
  }
}
export async function writeArchiveFile(path: string, files: Record<string, string>) {
  if (Object.keys(files).length + 1 > 20000) throw new BackupError("백업 파일 개수 제한을 초과했어요.");
  const metadata: Record<string, { size: number; sha256: string }> = {};
  let total = 0;
  for (const [name, source] of Object.entries(files)) {
    const size = (await stat(source)).size;
    total += size;
    if (total > MAX_BACKUP_BYTES || (name === "took.db" && size > MAX_DATABASE_BYTES))
      throw new BackupError("단일 백업은 최대 1GB까지 지원해요.");
    metadata[name] = { size, sha256: await hashBackupFile(source) };
  }
  const manifest = Buffer.from(JSON.stringify({ format: "took-backup", version: 1, schemaVersion: BACKUP_SCHEMA_VERSION, createdAt: new Date().toISOString(), files: metadata }));
  if (manifest.length > 4 * 1024 * 1024) throw new BackupError("백업 정보의 크기 제한을 초과했어요.");
  await requireBackupSpace(path.substring(0, path.lastIndexOf("/")), total + 8 * 1024 * 1024);
  const handle = openSync(path, "wx", 0o600);
  let written = 0;
  const zip = new Zip((error, bytes) => {
    if (error) throw error;
    written += bytes.length;
    if (written > MAX_BACKUP_BYTES) throw new BackupError("단일 백업은 최대 1GB까지 지원해요.");
    writeSync(handle, bytes);
  });
  try {
    for (const [name, source] of Object.entries(files)) {
      const entry = new ZipPassThrough(name);
      zip.add(entry);
      for await (const bytes of createReadStream(source, { highWaterMark: chunkSize })) entry.push(bytes);
      entry.push(new Uint8Array(), true);
    }
    const entry = new ZipPassThrough("manifest.json");
    zip.add(entry);
    entry.push(manifest, true);
    zip.end();
  } finally { closeSync(handle); }
}
