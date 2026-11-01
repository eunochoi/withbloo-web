const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const load = require("./load-source.cjs")({
  [path.resolve(__dirname, "../lib/prisma.ts")]: { prisma: {} },
});
const { createBackupWorkspace, cryptBackupFile, hashBackupFile, writeArchiveFile } = load("common/backup/files.ts");
const { decodeBackup } = load("common/backup/service.ts");
const { decryptBackup } = load("common/backup/container.ts");
const { MAX_BACKUP_BYTES, MAX_ENCRYPTED_BACKUP_BYTES } = load("common/backup/types.ts");
const fixturePath = path.join(__dirname, "fixtures/native-v8.bloo");
const expected = require("./fixtures/native-v8.expected.json");
const password = expected.password;

test("streamed export remains compatible with native framing, SQLite and photos", async () => {
  const workspace = await createBackupWorkspace();
  try {
    const bundle = await decodeBackup(await fs.readFile(fixturePath), password, "Asia/Seoul");
    const media = {};
    for (const [name, bytes] of Object.entries(bundle.media)) {
      const source = path.join(workspace.directory, "photo.jpg");
      await fs.writeFile(source, bytes);
      media[name] = source;
    }
    const out = path.join(workspace.directory, "out.zip");
    const nativePlain = await decryptBackup(await fs.readFile(fixturePath), password);
    const original = load("common/backup/archive.ts").readArchive(nativePlain);
    const db = path.join(workspace.directory, "db");
    await fs.writeFile(db, original.files["took.db"]);
    await writeArchiveFile(out, { "took.db": db, ...media });
    const encrypted = path.join(workspace.directory, "out.bloo");
    await cryptBackupFile(out, encrypted, password, true);
    const contents = load("common/backup/archive.ts").readArchive(await decryptBackup(await fs.readFile(encrypted), password));
    assert.deepEqual(contents.files, original.files);
    const broken = path.join(workspace.directory, "broken.bloo");
    const bytes = await fs.readFile(encrypted);
    bytes[80] ^= 1;
    await fs.writeFile(broken, bytes);
    await assert.rejects(cryptBackupFile(broken, path.join(workspace.directory, "broken.zip"), password, false), /비밀번호/);
    await assert.rejects(cryptBackupFile(encrypted, path.join(workspace.directory, "wrong.zip"), "wrong-password", false), /비밀번호/);
  } finally { await workspace.dispose(); }
  await assert.rejects(fs.stat(workspace.directory));
});

test("native 1GB payload limit and encrypted framing allowance match, including files above the old 128MB limit", async () => {
  assert.equal(MAX_BACKUP_BYTES, 1024 ** 3);
  assert.equal(MAX_ENCRYPTED_BACKUP_BYTES, MAX_BACKUP_BYTES + 1024 ** 2);
  const workspace = await createBackupWorkspace();
  try {
    const source = path.join(workspace.directory, "large.zip");
    const handle = await fs.open(source, "wx");
    await handle.truncate(process.env.RUN_LARGE_BACKUP_TESTS === "1" ? MAX_BACKUP_BYTES : 130 * 1024 * 1024);
    await handle.close();
    const encrypted = path.join(workspace.directory, "large.bloo");
    const restored = path.join(workspace.directory, "restored.zip");
    await cryptBackupFile(source, encrypted, password, true);
    assert.ok((await fs.stat(encrypted)).size <= MAX_ENCRYPTED_BACKUP_BYTES);
    await cryptBackupFile(encrypted, restored, password, false);
    assert.equal(await hashBackupFile(restored), await hashBackupFile(source));
    const oversized = path.join(workspace.directory, "oversized.zip");
    const file = await fs.open(oversized, "wx");
    await file.truncate(MAX_BACKUP_BYTES + 1);
    await file.close();
    await assert.rejects(cryptBackupFile(oversized, path.join(workspace.directory, "oversized.bloo"), password, true), /1GB/);
  } finally { await workspace.dispose(); }
});


test("photo archive export preserves all records and media in the app-compatible format", async () => {
  const workspace = await createBackupWorkspace();
  try {
    const sample = await load("common/backup/service.ts").decodeBackup(await fs.readFile(fixturePath), password, "Asia/Seoul");
    const records = structuredClone(sample.records);
    records.diaries = Array.from({ length: 26 }, (_, index) => ({ ...records.diaries[0], id: index + 1, date: `2024-01-${String(index + 1).padStart(2, "0")}` }));
    records.images = records.diaries.map((diary) => ({ id: diary.id, diary_id: diary.id, file_name: `synthetic-${diary.id}.jpg`, position: 0 }));
    const photo = Buffer.alloc(256 * 1024);
    Buffer.from(sample.media["media/synthetic.jpg"]).copy(photo);
    const photoPath = path.join(workspace.directory, "photo.jpg");
    const dbPath = path.join(workspace.directory, "records.db");
    await fs.writeFile(photoPath, photo);
    await fs.writeFile(dbPath, await load("common/backup/database.ts").writeDatabase(records));
    const media = Object.fromEntries(records.images.map((image) => [`media/${image.file_name}`, photoPath]));
    const archive = path.join(workspace.directory, "photos.zip");
    const encrypted = path.join(workspace.directory, "photos.bloo");
    await writeArchiveFile(archive, { "took.db": dbPath, ...media });
    await cryptBackupFile(archive, encrypted, password, true);
    const decoded = await decodeBackup(await fs.readFile(encrypted), password, "Asia/Seoul");
    assert.deepEqual(decoded.records, records);
    assert.equal(Object.keys(decoded.media).length, 26);
    for (const bytes of Object.values(decoded.media)) assert.equal(bytes.length, photo.length);
  } finally { await workspace.dispose(); }
});
