import { createHash } from "node:crypto";
import { Unzip, UnzipInflate, zipSync } from "fflate";
import {
  BACKUP_SCHEMA_VERSION,
  BackupError,
  MAX_BACKUP_BYTES,
  MAX_DATABASE_BYTES,
} from "./types";
export const checksum = (bytes: Uint8Array | string) =>
  createHash("sha256").update(bytes).digest("hex");
const validName = (name: string) =>
  name === "manifest.json" ||
  name === "took.db" ||
  /^media\/[a-zA-Z0-9_-]+\.jpg$/.test(name);
export function writeArchive(
  database: Uint8Array,
  media: Record<string, Uint8Array>,
): Uint8Array {
  const files = { "took.db": database, ...media };
  const metadata = Object.fromEntries(
    Object.entries(files).map(([name, bytes]) => [
      name,
      { size: bytes.length, sha256: checksum(bytes) },
    ]),
  );
  const manifest = {
    format: "took-backup",
    version: 1,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    files: metadata,
  };
  if (
    database.length > MAX_DATABASE_BYTES ||
    Object.values(files).reduce((sum, bytes) => sum + bytes.length, 0) >
      MAX_BACKUP_BYTES
  )
    throw new BackupError(
      "웹에서 처리할 수 있는 백업 크기를 초과했어요. (파일 1GB, 기록 DB 64MB)",
    );
  const archive = zipSync(
    { ...files, "manifest.json": Buffer.from(JSON.stringify(manifest)) },
    { level: 0 },
  );
  if (archive.length > MAX_BACKUP_BYTES)
    throw new BackupError("웹 백업은 최대 1GB까지 지원해요.");
  return archive;
}
export function readArchive(bytes: Uint8Array): {
  files: Record<string, Uint8Array>;
  schemaVersion: number;
} {
  const files: Record<string, Uint8Array> = Object.create(null);
  const pending = new Set<string>();
  const seen = new Set<string>();
  let total = 0;
  const unzip = new Unzip((entry) => {
    if (
      !validName(entry.name) ||
      seen.has(entry.name) ||
      seen.size >= 20000 ||
      ![0, 8].includes(entry.compression)
    )
      throw new BackupError("백업 파일 목록이 올바르지 않습니다.");
    const limit =
      entry.name === "took.db"
        ? MAX_DATABASE_BYTES
        : entry.name === "manifest.json"
          ? 4 * 1024 * 1024
          : MAX_BACKUP_BYTES;
    if ((entry.originalSize ?? 0) > limit)
      throw new BackupError("백업 내용이 웹 복원 크기 제한을 초과합니다.");
    seen.add(entry.name);
    pending.add(entry.name);
    const chunks: Uint8Array[] = [];
    let size = 0;
    entry.ondata = (error, data, final) => {
      if (error) throw new BackupError("압축된 백업이 손상되었습니다.");
      size += data.length;
      total += data.length;
      if (size > limit || total > MAX_BACKUP_BYTES)
        throw new BackupError("백업 내용이 웹 복원 크기 제한을 초과합니다.");
      chunks.push(data.slice());
      if (final) {
        files[entry.name] = Buffer.concat(chunks);
        pending.delete(entry.name);
      }
    };
    entry.start();
  });
  unzip.register(UnzipInflate);
  try {
    for (let offset = 0; offset < bytes.length; offset += 16384)
      unzip.push(bytes.subarray(offset, offset + 16384));
    unzip.push(new Uint8Array(), true);
  } catch (error) {
    if (error instanceof BackupError) throw error;
    throw new BackupError("백업 압축 파일이 올바르지 않습니다.");
  }
  if (pending.size || !files["manifest.json"] || !files["took.db"])
    throw new BackupError("백업에 필요한 파일이 없습니다.");
  let manifest;
  try {
    manifest = JSON.parse(Buffer.from(files["manifest.json"]).toString("utf8"));
  } catch {
    throw new BackupError("백업 정보가 손상되었습니다.");
  }
  if (
    manifest.format !== "took-backup" ||
    manifest.version !== 1 ||
    manifest.set ||
    ![5, 6, 7, 8].includes(manifest.schemaVersion) ||
    typeof manifest.createdAt !== "string" ||
    !Number.isFinite(Date.parse(manifest.createdAt)) ||
    !manifest.files ||
    typeof manifest.files !== "object" ||
    Array.isArray(manifest.files)
  )
    throw new BackupError(
      "지원하지 않는 백업 형식입니다. 단일 .bloo 파일을 선택해주세요.",
    );
  delete files["manifest.json"];
  if (Object.keys(manifest.files).length !== Object.keys(files).length)
    throw new BackupError("백업 파일 목록이 일치하지 않습니다.");
  for (const [name, file] of Object.entries(files)) {
    const meta = manifest.files[name];
    if (meta?.size !== file.length || meta?.sha256 !== checksum(file))
      throw new BackupError("백업 파일의 무결성 검사에 실패했습니다.");
    if (
      name.startsWith("media/") &&
      (file[0] !== 255 || file[1] !== 216 || file[2] !== 255)
    )
      throw new BackupError("백업에 올바르지 않은 사진이 있습니다.");
  }
  return { files, schemaVersion: manifest.schemaVersion };
}
