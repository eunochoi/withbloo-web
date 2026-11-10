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
records.habitMemos = [];
records.habitMemoImages = [];
records.soberRecordImages = [];
records.soberRestarts = records.soberRestarts.map((row) => ({ ...row, type: 'RESTART' }));
records.habits = records.habits.map((habit) => ({ ...habit, description: null }));

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
  assert.equal(readArchive(valid).schemaVersion, 12);
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
  await assert.rejects(readDatabase(db.export(), 12), /구조/);
  db.close();
});


test("habit descriptions survive the current backup and reject overlong text", async () => {
  const bundle = await decodeBackup(fixture, password, "Asia/Seoul");
  bundle.records.habits[0].description = "매일 조금씩";
  const result = await decodeBackup(await encodeBackup(bundle, password, "Asia/Seoul"), password, "Asia/Seoul");
  assert.equal(result.records.habits[0].description, "매일 조금씩");
  bundle.records.habits[0].description = "x".repeat(501);
  assert.throws(() => validateBackupRecords(bundle, "Asia/Seoul"));
});

test('multiple timed habit memos and both sober record types survive encrypted backup', async () => {
  const bundle = await decodeBackup(fixture, password, 'Asia/Seoul');
  const timestamp = '2024-02-01T10:00:00.000Z';
  bundle.records.habitMemos = [1, 2].map((id) => ({ id, habit_id: 21, recorded_at: timestamp, memo: `메모 ${id}`, created_at: timestamp, updated_at: timestamp }));
  bundle.records.soberRestarts.push({ id: 52, sober_id: 41, type: 'MEMO', restarted_at: timestamp, memo: '일반 메모', created_at: timestamp, updated_at: timestamp });
  const restored = await decodeBackup(await encodeBackup(bundle, password, 'Asia/Seoul'), password, 'Asia/Seoul');
  assert.deepEqual(restored.records, bundle.records);
  assert.equal(backupSummary(restored.records).restarts, 1);
  for (const patch of [
    { habitMemos: [{ ...bundle.records.habitMemos[0], habit_id: 999 }] },
    { habitMemos: [{ ...bundle.records.habitMemos[0], memo: ' ' }] },
    { soberRestarts: [{ ...bundle.records.soberRestarts[1], memo: null }] },
    { soberRestarts: [{ ...bundle.records.soberRestarts[1], type: 'INVALID' }] },
  ]) assert.throws(() => validateBackupRecords({ ...bundle, records: { ...bundle.records, ...patch } }, 'Asia/Seoul'));
});

test('activity photos survive encrypted backup in native-compatible tables', async () => {
  const bundle = await decodeBackup(fixture, password, 'Asia/Seoul');
  const timestamp = '2024-02-01T10:00:00.000Z';
  bundle.records.habitMemos = [{ id: 3, habit_id: 21, recorded_at: timestamp, memo: '메모', created_at: timestamp, updated_at: timestamp }];
  bundle.records.habitMemoImages = [{ id: 1, habit_memo_id: 3, file_name: 'habit.jpg', position: 0 }];
  bundle.records.soberRecordImages = [{ id: 1, sober_record_id: 51, file_name: 'sober.jpg', position: 0 }];
  bundle.media['media/habit.jpg'] = bundle.media['media/synthetic.jpg'];
  bundle.media['media/sober.jpg'] = bundle.media['media/synthetic.jpg'];
  const result = await decodeBackup(await encodeBackup(bundle, password, 'Asia/Seoul'), password, 'Asia/Seoul');
  assert.deepEqual(result.records.habitMemoImages, bundle.records.habitMemoImages);
  assert.deepEqual(result.records.soberRecordImages, bundle.records.soberRecordImages);
  assert.equal(backupSummary(result.records).photos, 3);
});

test('native version 13 record tables are read with restart flags and photo links intact', async () => {
  const bundle = await decodeBackup(fixture, password, 'Asia/Seoul');
  bundle.records.habitMemos = [{ id: 3, habit_id: 21, recorded_at: '2024-02-01T10:00:00.000Z', memo: '기록', created_at: '2024-02-01T10:00:00.000Z', updated_at: '2024-02-01T10:00:00.000Z' }];
  bundle.records.habitMemoImages = [{ id: 4, habit_memo_id: 3, file_name: 'habit.jpg', position: 0 }];
  const SQL = await require('sql.js/dist/sql-asm.js')();
  const db = new SQL.Database(await writeDatabase(bundle.records));
  db.exec(`PRAGMA foreign_keys=OFF;
    ALTER TABLE habit_memos RENAME TO habit_records;
    ALTER TABLE habit_records RENAME COLUMN memo TO text;
    ALTER TABLE habit_memo_images RENAME TO habit_record_images;
    ALTER TABLE habit_record_images RENAME COLUMN habit_memo_id TO habit_record_id;
    ALTER TABLE sober_restarts RENAME TO sober_records;
    DROP INDEX sober_record_type_time;
    ALTER TABLE sober_records ADD COLUMN is_restart INTEGER NOT NULL DEFAULT 0;
    UPDATE sober_records SET is_restart = CASE WHEN type = 'RESTART' THEN 1 ELSE 0 END;
    ALTER TABLE sober_records DROP COLUMN type;
    ALTER TABLE sober_records RENAME COLUMN restarted_at TO recorded_at;
    ALTER TABLE sober_records RENAME COLUMN memo TO text;
    PRAGMA user_version=13;`);
  const restored = await readDatabase(db.export(), 13);
  assert.deepEqual(restored.habitMemos, bundle.records.habitMemos);
  assert.deepEqual(restored.habitMemoImages, bundle.records.habitMemoImages);
  assert.equal(restored.soberRestarts[0].type, 'RESTART');
  db.close();
});
