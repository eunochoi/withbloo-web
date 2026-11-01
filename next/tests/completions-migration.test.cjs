const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
require("@prisma/client");

test(
  "completion migration preserves every link, removes only placeholder diaries and reruns safely",
  { skip: process.env.RUN_LOCAL_DB_TESTS !== "1" },
  () => {
    const url = new URL(process.env.DATABASE_URL);
    assert.ok(["localhost", "127.0.0.1"].includes(url.hostname));
    const schema = `completion_migration_${process.pid}`;
    const env = {
      ...process.env,
      PGHOST: url.hostname,
      PGPORT: url.port || "5432",
      PGUSER: decodeURIComponent(url.username),
      PGPASSWORD: decodeURIComponent(url.password),
      PGDATABASE: url.pathname.slice(1),
    };
    const run = (sql, isolated = true) =>
      execFileSync("psql", ["-X", "-v", "ON_ERROR_STOP=1", "-At"], {
        input: sql,
        encoding: "utf8",
        env: { ...env, PGOPTIONS: isolated ? `-c search_path=${schema}` : "" },
        stdio: ["pipe", "pipe", "pipe"],
      });
    run(`CREATE SCHEMA ${schema}`, false);
    try {
      run(`CREATE TABLE "Habit" (id INT PRIMARY KEY, "UserId" INT NOT NULL);
      CREATE TABLE "Diary" (id INT PRIMARY KEY, "UserId" INT NOT NULL, date VARCHAR(10), visible BOOLEAN, text TEXT, "createdAt" TIMESTAMP(3));
      CREATE TABLE "Image" (id INT PRIMARY KEY, "diaryId" INT REFERENCES "Diary"(id) ON DELETE CASCADE);
      CREATE TABLE "_DiaryHabit" ("A" INT REFERENCES "Diary"(id) ON DELETE CASCADE, "B" INT REFERENCES "Habit"(id) ON DELETE CASCADE);
      INSERT INTO "Habit" VALUES (1,1),(2,1),(3,2);
      INSERT INTO "Diary" VALUES (10,1,'2024-01-01',true,'encrypted','2024-01-01'),(11,1,'2024-01-02',false,'-','2024-01-02'),(12,2,'2024-01-01',false,'','2024-01-01');
      INSERT INTO "Image" VALUES (1,10);
      INSERT INTO "_DiaryHabit" VALUES (10,1),(10,2),(11,1),(12,3);`);
      const sql = fs.readFileSync(
        path.join(__dirname, "../prisma/sql/separate_habit_completions.sql"),
        "utf8",
      );
      run(sql);
      assert.equal(run('SELECT count(*) FROM "HabitCompletion"').trim(), "4");
      assert.equal(
        run(
          "SELECT string_agg(id::text,',' ORDER BY id) FROM \"Diary\"",
        ).trim(),
        "10",
      );
      assert.equal(run('SELECT count(*) FROM "Image"').trim(), "1");
      run(sql);
      assert.equal(run('SELECT count(*) FROM "HabitCompletion"').trim(), "4");
      run('DELETE FROM "Diary" WHERE id=10');
      assert.equal(run('SELECT count(*) FROM "HabitCompletion"').trim(), "4");
      run('DELETE FROM "Habit" WHERE id=1');
      assert.equal(run('SELECT count(*) FROM "HabitCompletion"').trim(), "2");
    } finally {
      run(`DROP SCHEMA ${schema} CASCADE`, false);
    }
  },
);
