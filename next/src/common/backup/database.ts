import initSqlJs from "sql.js/dist/sql-asm.js";
import type { Database, SqlJsStatic, SqlValue } from "sql.js";
import {
  BACKUP_SCHEMA_VERSION,
  BackupError,
  MAX_DATABASE_BYTES,
  type BackupRecords,
} from "./types";
import { recordColumns } from "./records";
let runtime: Promise<SqlJsStatic> | undefined;
const sqlite = () => (runtime ??= initSqlJs());
const tables = {
  diaries: "diaries",
  habits: "habits",
  sobers: "sobers",
  soberRestarts: "sober_restarts",
  completions: "habit_completions",
  images: "diary_images",
};
const schema = `
PRAGMA foreign_keys=ON;
CREATE TABLE diaries (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT NOT NULL UNIQUE CHECK(length(date)=10), emotion INTEGER NOT NULL CHECK(emotion BETWEEN 0 AND 11), text TEXT NOT NULL CHECK(length(trim(text)) BETWEEN 1 AND 500), created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE habits (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE CHECK(length(trim(name)) BETWEEN 1 AND 30), priority INTEGER NOT NULL CHECK(priority BETWEEN 0 AND 3), icon_key TEXT NOT NULL, icon_color TEXT NOT NULL DEFAULT 'theme', initial_started_at TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE habit_completions (habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE, date TEXT NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY(habit_id,date));
CREATE INDEX completion_date ON habit_completions(date);
CREATE TABLE diary_images (id INTEGER PRIMARY KEY AUTOINCREMENT, diary_id INTEGER NOT NULL REFERENCES diaries(id) ON DELETE CASCADE, file_name TEXT NOT NULL UNIQUE, position INTEGER NOT NULL CHECK(position BETWEEN 0 AND 4), UNIQUE(diary_id,position));
CREATE TABLE settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
CREATE TABLE sobers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE CHECK(length(trim(name)) BETWEEN 1 AND 30), description TEXT CHECK(description IS NULL OR length(description)<=500), icon_key TEXT NOT NULL, icon_color TEXT NOT NULL DEFAULT 'theme', is_priority INTEGER NOT NULL DEFAULT 0 CHECK(is_priority IN (0,1)), initial_started_at TEXT NOT NULL, goal_mode TEXT NOT NULL CHECK(goal_mode IN ('AUTO','MANUAL')), goal_days INTEGER, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, CHECK((goal_mode='AUTO' AND goal_days IS NULL) OR (goal_mode='MANUAL' AND goal_days IS NOT NULL AND goal_days BETWEEN 1 AND 36500)));
CREATE TABLE sober_restarts (id INTEGER PRIMARY KEY AUTOINCREMENT, sober_id INTEGER NOT NULL REFERENCES sobers(id) ON DELETE CASCADE, restarted_at TEXT NOT NULL, memo TEXT CHECK(memo IS NULL OR length(memo)<=500), created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE INDEX sober_restart_time ON sober_restarts(sober_id,restarted_at);
PRAGMA user_version=${BACKUP_SCHEMA_VERSION};`;
export async function writeDatabase(
  records: BackupRecords,
): Promise<Uint8Array> {
  const SQL = await sqlite();
  const db = new SQL.Database();
  try {
    db.exec(schema);
    db.exec("BEGIN");
    for (const key of Object.keys(tables) as Array<keyof BackupRecords>) {
      const columns = recordColumns[key];
      const statement = db.prepare(
        `INSERT INTO ${tables[key]} (${columns.join(",")}) VALUES (${columns.map(() => "?").join(",")})`,
      );
      try {
        for (const row of records[key])
          statement.run(
            columns.map(
              (column) => (row as unknown as Record<string, SqlValue>)[column],
            ),
          );
      } finally {
        statement.free();
      }
    }
    db.exec("COMMIT");
    const bytes = db.export();
    if (bytes.length > MAX_DATABASE_BYTES)
      throw new BackupError("기록 DB는 최대 64MB까지 지원해요.");
    return bytes;
  } finally {
    db.close();
  }
}
function readRows(db: Database, query: string): Record<string, SqlValue>[] {
  const statement = db.prepare(query);
  const rows: Record<string, SqlValue>[] = [];
  try {
    while (statement.step()) {
      if (rows.length >= 200000)
        throw new BackupError("한 번에 복원할 수 있는 기록 수를 초과했어요.");
      rows.push(statement.getAsObject());
    }
  } finally {
    statement.free();
  }
  return rows;
}
export async function readDatabase(
  input: Uint8Array,
  schemaVersion: number,
): Promise<BackupRecords> {
  if (
    input.length > MAX_DATABASE_BYTES ||
    Buffer.from(input.subarray(0, 16)).toString() !== "SQLite format 3\0"
  )
    throw new BackupError("올바른 SQLite 기록 파일이 아닙니다.");
  const SQL = await sqlite();
  const bytes = input.slice();
  bytes[18] = 1;
  bytes[19] = 1;
  let db: Database | undefined;
  try {
    db = new SQL.Database(bytes);
    db.exec(
      "PRAGMA query_only=ON; PRAGMA trusted_schema=OFF; PRAGMA foreign_keys=ON;",
    );
    if (
      db.exec("PRAGMA user_version")[0]?.values[0][0] !== schemaVersion ||
      db.exec("PRAGMA quick_check")[0]?.values[0][0] !== "ok"
    )
      throw new BackupError("백업 DB 버전 또는 무결성이 올바르지 않습니다.");
    const objects = readRows(
      db,
      "SELECT type,name FROM sqlite_master WHERE name NOT LIKE 'sqlite_%'",
    );
    const allowed = [...Object.values(tables), "settings"];
    if (
      objects.some((o) => !["table", "index"].includes(String(o.type))) ||
      objects.filter((o) => o.type === "table").length !== allowed.length ||
      objects.some(
        (o) => o.type === "table" && !allowed.includes(String(o.name)),
      )
    )
      throw new BackupError("'위블' 기록 구조와 일치하지 않습니다.");
    if (db.exec("PRAGMA foreign_key_check").length)
      throw new BackupError("백업 기록의 연결이 손상되었습니다.");
    return Object.fromEntries(
      (Object.keys(tables) as Array<keyof BackupRecords>).map((key) => [
        key,
        readRows(
          db!,
          `SELECT ${recordColumns[key].join(",")} FROM ${tables[key]} ORDER BY ${key === "completions" ? "habit_id,date" : "id"} LIMIT 200001`,
        ),
      ]),
    ) as unknown as BackupRecords;
  } catch (error) {
    if (error instanceof BackupError) throw error;
    throw new BackupError("백업 DB를 읽을 수 없습니다.");
  } finally {
    db?.close();
  }
}
