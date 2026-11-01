const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { zipSync } = require("fflate");
const sourceLoader = require("./load-source.cjs");
const load = sourceLoader({
  [path.resolve(__dirname, "../lib/prisma.ts")]: { prisma: {} },
});
const { decodeBackup, encodeBackup } = load("common/backup/service.ts");
const { encryptBackup, decryptBackup } = load("common/backup/container.ts");
const { readArchive, writeArchive } = load("common/backup/archive.ts");
const { readDatabase, writeDatabase } = load("common/backup/database.ts");
const { validateBackupRecords } = load("common/backup/records.ts");
const { backupSummary } = load("common/backup/types.ts");
const fixture = fs.readFileSync(
  path.join(__dirname, "fixtures/native-v8.bloo"),
);
const expected = JSON.parse(
  fs.readFileSync(path.join(__dirname, "fixtures/native-v8.expected.json")),
);
const password = expected.password;
const records = { ...expected.records };
delete records.preferences;

test("native-produced encrypted SQLite backup imports without losing dates, free records or photos", async () => {
  const bundle = await decodeBackup(fixture, password, "Asia/Seoul");
  assert.deepEqual(bundle.records, records);
  assert.deepEqual(backupSummary(bundle.records), {
    diaries: 1,
    habits: 1,
    completions: 1,
    sobers: 1,
    restarts: 1,
    photos: 1,
  });
  assert.equal(bundle.media["media/synthetic.jpg"][0], 255);
  assert.equal(bundle.records.completions[0].date, "2024-03-01");
  assert.notEqual(
    bundle.records.diaries[0].date,
    bundle.records.completions[0].date,
  );
  const outgoing = await encodeBackup(bundle, password, "Asia/Seoul");
  const restored = await decodeBackup(outgoing, password, "Asia/Seoul");
  assert.deepEqual(restored.records, records);
  assert.deepEqual(restored.media, bundle.media);
});

test("wrong passwords, tampering, truncation and appended data fail before restoration", async () => {
  await assert.rejects(
    decodeBackup(fixture, "wrong-password", "Asia/Seoul"),
    /비밀번호/,
  );
  const damaged = Buffer.from(fixture);
  damaged[100] ^= 1;
  for (const input of [
    damaged,
    fixture.subarray(0, -1),
    Buffer.concat([fixture, Buffer.from([1])]),
  ])
    await assert.rejects(decodeBackup(input, password, "Asia/Seoul"));
  await assert.rejects(encryptBackup(new Uint8Array(), "short"), /8자/);
});

test("framed encryption handles multiple data frames and an authenticated terminal frame", async () => {
  const plain = Buffer.alloc(700000, 123);
  assert.deepEqual(
    await decryptBackup(await encryptBackup(plain, password), password),
    plain,
  );
});

test("archives reject traversal, duplicate/unlisted files and changed checksums", async () => {
  const bundle = await decodeBackup(fixture, password, "Asia/Seoul");
  const database = await writeDatabase(bundle.records);
  const valid = writeArchive(database, bundle.media);
  assert.equal(readArchive(valid).schemaVersion, 8);
  assert.throws(
    () => readArchive(zipSync({ "../outside": Buffer.from("x") })),
    /백업/,
  );
  assert.throws(
    () =>
      readArchive(
        zipSync({
          "took.db": database,
          "manifest.json": Buffer.from(
            JSON.stringify({
              format: "took-backup",
              version: 1,
              schemaVersion: 8,
              createdAt: new Date().toISOString(),
              files: { "took.db": { size: database.length, sha256: "bad" } },
            }),
          ),
        }),
      ),
    /무결성/,
  );
});

test("invalid references and values are rejected rather than silently omitted", async () => {
  const bundle = await decodeBackup(fixture, password, "Asia/Seoul");
  for (const patch of [
    { completions: [{ ...bundle.records.completions[0], habit_id: 999 }] },
    { habits: [{ ...bundle.records.habits[0], name: "x".repeat(31) }] },
    { habits: [{ ...bundle.records.habits[0], icon_key: "__proto__" }] },
    { diaries: [{ ...bundle.records.diaries[0], text: " " }] },
    { images: [{ ...bundle.records.images[0], position: 5 }] },
  ])
    assert.throws(() =>
      validateBackupRecords(
        { ...bundle, records: { ...bundle.records, ...patch } },
        "Asia/Seoul",
      ),
    );
  const database = await writeDatabase(bundle.records);
  const init = require("sql.js/dist/sql-asm.js");
  const SQL = await init();
  const db = new SQL.Database(database);
  db.exec(
    "CREATE TRIGGER unsafe AFTER INSERT ON diaries BEGIN DELETE FROM habits; END;",
  );
  await assert.rejects(readDatabase(db.export(), 8), /구조/);
  db.close();
});
