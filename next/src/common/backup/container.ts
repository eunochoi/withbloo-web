import {
  createCipheriv,
  createDecipheriv,
  hkdfSync,
  pbkdf2,
  randomBytes,
} from "node:crypto";
import { promisify } from "node:util";
import { BackupError, MAX_ENCRYPTED_BACKUP_BYTES } from "./types";
const derive = promisify(pbkdf2);
const MAGIC = Buffer.from("BLOO0001");
const CHUNK_BYTES = 256 * 1024;
const integer = (value: number) => {
  const result = Buffer.alloc(4);
  result.writeUInt32BE(value);
  return result;
};
export function validateBackupPassword(
  password: unknown,
): asserts password is string {
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    Buffer.byteLength(password) > 1024
  )
    throw new BackupError("백업 비밀번호는 8자 이상으로 입력해주세요.");
}
export async function fileKey(password: string, header: Buffer) {
  const master = await derive(
    password,
    header.subarray(8, 24),
    600000,
    32,
    "sha256",
  );
  try {
    return Buffer.from(
      hkdfSync(
        "sha256",
        master,
        header.subarray(24),
        Buffer.from("BlooLog backup v1"),
        32,
      ),
    );
  } finally {
    master.fill(0);
  }
}
// Same framed AES-256-GCM container as native: nonce(12), ciphertext, tag(16).
export async function encryptBackup(
  plain: Uint8Array,
  password: string,
): Promise<Buffer> {
  validateBackupPassword(password);
  const header = Buffer.concat([MAGIC, randomBytes(16), randomBytes(32)]);
  const key = await fileKey(password, header);
  const output: Buffer[] = [header];
  let sequence = 0;
  const frame = (bytes: Uint8Array) => {
    const length = integer(bytes.length + 28);
    const nonce = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", key, nonce);
    cipher.setAAD(Buffer.concat([header, integer(sequence++), length]));
    output.push(
      length,
      nonce,
      cipher.update(bytes),
      cipher.final(),
      cipher.getAuthTag(),
    );
  };
  try {
    for (let offset = 0; offset < plain.length; offset += CHUNK_BYTES)
      frame(plain.subarray(offset, offset + CHUNK_BYTES));
    frame(new Uint8Array());
    if (
      output.reduce((size, bytes) => size + bytes.length, 0) > MAX_ENCRYPTED_BACKUP_BYTES
    )
      throw new BackupError("웹 백업은 최대 1GB까지 지원해요.");
    return Buffer.concat(output);
  } finally {
    key.fill(0);
  }
}
export async function decryptBackup(
  input: Uint8Array,
  password: string,
): Promise<Buffer> {
  validateBackupPassword(password);
  if (input.length > MAX_ENCRYPTED_BACKUP_BYTES)
    throw new BackupError("웹 복원은 최대 1GB 파일까지 지원해요.");
  const bytes = Buffer.from(input.buffer, input.byteOffset, input.byteLength);
  if (bytes.length < 88 || !bytes.subarray(0, 8).equals(MAGIC))
    throw new BackupError("암호화된 .bloo 백업 파일을 선택해주세요.");
  const header = bytes.subarray(0, 56);
  const key = await fileKey(password, header);
  const output: Buffer[] = [];
  let offset = 56;
  let sequence = 0;
  try {
    while (offset + 4 <= bytes.length) {
      const lengthBytes = bytes.subarray(offset, offset + 4);
      const length = lengthBytes.readUInt32BE();
      offset += 4;
      if (
        length < 28 ||
        length > CHUNK_BYTES + 28 ||
        offset + length > bytes.length
      )
        throw new BackupError("백업 파일이 손상되었습니다.");
      const sealed = bytes.subarray(offset, offset + length);
      offset += length;
      let plain: Buffer;
      try {
        const cipher = createDecipheriv(
          "aes-256-gcm",
          key,
          sealed.subarray(0, 12),
        );
        cipher.setAAD(
          Buffer.concat([header, integer(sequence++), lengthBytes]),
        );
        cipher.setAuthTag(sealed.subarray(length - 16));
        plain = Buffer.concat([
          cipher.update(sealed.subarray(12, length - 16)),
          cipher.final(),
        ]);
      } catch {
        throw new BackupError(
          "비밀번호가 다르거나 백업 파일이 손상되었습니다.",
        );
      }
      if (length === 28) {
        if (offset !== bytes.length)
          throw new BackupError("백업 파일의 끝이 올바르지 않습니다.");
        return Buffer.concat(output);
      }
      output.push(plain);
    }
    throw new BackupError("백업 파일이 끝까지 저장되지 않았습니다.");
  } finally {
    key.fill(0);
  }
}
