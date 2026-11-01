const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const { PrismaClient } = require('@prisma/client');
const sourceLoader = require('./load-source.cjs');
const url = process.env.HABIT_TEST_DATABASE_URL;

// This suite only runs against an explicitly supplied, disposable local database.
if (url) {
  const parsed = new URL(url);
  assert.equal(parsed.pathname, '/took_habit_test');
  assert.ok(['localhost', '127.0.0.1'].includes(parsed.hostname));
  process.env.DATABASE_URL = url;
}

test('PostgreSQL migration preserves old priorities and is safe to rerun', { skip: !url }, () => {
  const schema = `habit_migration_${process.pid}`;
  const psqlUrl = new URL(url); psqlUrl.searchParams.delete('schema');
  const psql = (sql, isolated = true) => execFileSync('psql', ['-X', '-v', 'ON_ERROR_STOP=1', '-At'], {
    input: sql, encoding: 'utf8', env: { ...process.env, PGHOST: psqlUrl.hostname, PGPORT: psqlUrl.port || '5432', PGUSER: decodeURIComponent(psqlUrl.username), PGPASSWORD: decodeURIComponent(psqlUrl.password), PGDATABASE: psqlUrl.pathname.slice(1), PGOPTIONS: isolated ? `-c search_path=${schema}` : '' }, stdio: ['pipe', 'pipe', 'pipe'],
  });
  psql(`CREATE SCHEMA ${schema};`, false);
  try {
    psql(`CREATE TABLE "Habit" ("id" SERIAL PRIMARY KEY, "priority" INTEGER NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL);
      INSERT INTO "Habit" ("priority", "createdAt") VALUES (0, '2024-01-01'), (1, '2024-02-01'), (2, '2024-03-01');`);
    const migration = fs.readFileSync(path.join(__dirname, '../prisma/sql/add_habit_record_options.sql'), 'utf8');
    psql(migration);
    assert.equal(psql('SELECT string_agg("priority"::text, \',\' ORDER BY "id") FROM "Habit";').trim(), '1,2,3');
    assert.equal(psql('SELECT bool_and("initialStartedAt" = "createdAt" AND "iconColor" = \'theme\') FROM "Habit";').trim(), 't');
    psql(`INSERT INTO "Habit" ("priority", "createdAt", "iconColor") VALUES (0, '2024-04-01', 'mint');`);
    psql(migration);
    assert.equal(psql('SELECT string_agg("priority"::text, \',\' ORDER BY "id") FROM "Habit";').trim(), '1,2,3,0');
    assert.equal(psql('SELECT count(*) FROM "_TookDataMigration";').trim(), '1');
  } finally {
    psql(`DROP SCHEMA ${schema} CASCADE;`, false);
  }
});

test('habit actions and all home aggregates against PostgreSQL', { skip: !url }, async (t) => {
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  const email = `habit-${process.pid}@test.local`;
  const user = await prisma.user.create({ data: { email, provider: 'test' } });
  let authenticated = true;
  let timezone = 'Asia/Seoul';
  const load = sourceLoader({
    [path.resolve(__dirname, '../src/common/constants/emotions.ts')]: { EMOTIONS: Array.from({ length: 12 }, (_, id) => ({ id })) },
    [path.resolve(__dirname, '../lib/prisma.ts')]: { prisma },
    [path.resolve(__dirname, '../src/common/auth/getAuth.ts')]: { getAuth: async () => authenticated ? { ok: true, userId: user.id, email } : { ok: false, code: 'NEED_LOGIN', message: 'login' } },
    [path.resolve(__dirname, '../src/common/utils/getEnvValue.ts')]: { getEnvValue: (key) => { assert.equal(key, 'DATA_SECRET_KEY'); return 'test-only-key'; } },
    'next/headers': { cookies: () => ({ get: () => ({ value: encodeURIComponent(timezone) }) }) },
  });
  const actions = load('common/actions/habit/index.ts');
  const { getHabitStats } = load('common/actions/stats/getHabitStats.ts');
  const { getDiaryHabitMonthData } = load('common/actions/diary/getDiaryHabitMonthData.ts');
  const { createDiary } = load('common/actions/diary/createDiary.ts');
  const { updateDiary } = load('common/actions/diary/updateDiary.ts');
  const { deleteDiary } = load('common/actions/diary/deleteDiary.ts');
  const { formatDateInTimezone, addDaysToDateString } = load('common/utils/date/userTimezone.ts');
  const today = formatDateInTimezone(new Date(), timezone);
  const year = Number(today.slice(0, 4));
  const value = (result) => { assert.equal(result.ok, true, JSON.stringify(result)); return result.data; };
  const input = { habitName: '일반', priority: 1, iconKey: 'goal', iconColor: 'mint', initialStartedAt: '2024-01-01T00:00:00.000Z' };
  let regular;
  let free;
  try {
    await t.test('create, validation, immutable start and edit preservation', async () => {
      regular = value(await actions.createHabit(input));
      free = value(await actions.createHabit({ ...input, habitName: '자유', priority: 0, iconColor: 'lavender' }));
      assert.equal(regular.initialStartedAt, input.initialStartedAt);
      assert.equal(free.priority, 0);
      assert.equal(free.iconColor, 'lavender');
      for (const patch of [{ priority: 4 }, { priority: -1 }, { priority: 1.5 }, { iconColor: '__proto__' }, { initialStartedAt: new Date(Date.now() + 86400000).toISOString() }, { initialStartedAt: '2024-02-30T00:00:00.000Z' }]) {
        assert.equal((await actions.createHabit({ ...input, habitName: '잘못된 입력', ...patch })).ok, false);
      }
      assert.equal((await actions.updateHabit({ ...input, habitId: regular.id, initialStartedAt: '2023-01-01T00:00:00.000Z' })).code, 'HABIT_START_IMMUTABLE');
      value(await actions.updateHabit({ habitId: regular.id, habitName: '일반', priority: 3 }));
      const updated = value(await actions.getHabitById({ id: regular.id }));
      assert.equal(updated.initialStartedAt, input.initialStartedAt);
      assert.equal(updated.iconColor, 'mint');
      authenticated = false;
      assert.equal((await actions.getHabitList()).ok, false);
      authenticated = true;
      assert.equal((await actions.updateHabit({ ...input, habitId: 2147483647 })).code, 'HABIT_NOT_FOUND');
    });

    await t.test('checks are idempotent, start-aware and limited to the last four days', async () => {
      value(await actions.checkHabit({ habitId: regular.id, date: today }));
      value(await actions.checkHabit({ habitId: regular.id, date: today }));
      value(await actions.checkHabit({ habitId: free.id, date: today }));
      value(await actions.checkHabit({ habitId: regular.id, date: addDaysToDateString(today, -3) }));
      assert.equal((await actions.checkHabit({ habitId: regular.id, date: addDaysToDateString(today, -4) })).code, 'HABIT_DATE_NOT_EDITABLE');
      assert.equal((await actions.checkHabit({ habitId: regular.id, date: addDaysToDateString(today, 1) })).code, 'FUTURE_HABIT_DATE');
      const startedToday = value(await actions.createHabit({ ...input, habitName: '오늘 시작', initialStartedAt: new Date().toISOString() }));
      for (const action of [actions.checkHabit, actions.uncheckHabit]) {
        assert.equal((await action({ habitId: startedToday.id, date: addDaysToDateString(today, -1) })).code, 'HABIT_DATE_BEFORE_START');
      }
      const yesterday = value(await actions.getHabitsByDate({ date: addDaysToDateString(today, -1) }));
      assert.equal(yesterday.habits.some((habit) => habit.id === startedToday.id), false);
      value(await actions.deleteHabit({ habitId: startedToday.id }));
    });

    await t.test('home progress, both rankings, flow and calendar consistently exclude free records', async () => {
      assert.deepEqual(value(await actions.getTodayHabitStat()), { createdHabits: 1, todayDoneHabits: 1, excludedCompleted: 1 });
      const ranking = value(await getHabitStats({ year }));
      for (const list of [ranking.topHabits, ranking.bottomHabits]) {
        assert.deepEqual(list.map((habit) => habit.id), [regular.id]);
        assert.equal(list[0].iconColor, 'mint');
      }
      const flow = value(await actions.getHabitFlow({ date: today })).at(-1);
      assert.equal(flow.total, 1);
      assert.equal(flow.completed, 1);
      assert.equal(flow.excludedCompleted, 1);
      const calendar = value(await getDiaryHabitMonthData({ month: today.slice(0, 7) })).daysByDate[today];
      assert.equal(calendar.completedHabitCount, 2);
      assert.equal(calendar.countedHabitCount, 1);
      assert.equal(calendar.totalHabitCount, 1);
      assert.equal(value(await actions.getHabitById({ id: free.id })).latestRecordedDate, today);
      const byDate = value(await actions.getHabitsByDate({ date: today }));
      assert.equal(byDate.habits.find((habit) => habit.id === free.id).iconColor, 'lavender');
      assert.equal(byDate.summary.total, 1);
      assert.equal(byDate.summary.completed, 1);
      assert.equal(byDate.summary.excludedCompleted, 1);
      assert.equal(await prisma.diary.count({ where: { userId: user.id } }), 0);
      const diary = value(await createDiary({ date: today, text: 'real diary', emotion: 0, imageContentIds: [] }));
      assert.equal(diary.Habits.find((habit) => habit.id === free.id).iconColor, 'lavender');
      const moved = value(await updateDiary({ diaryId: String(diary.id), date: addDaysToDateString(today, -1), text: 'moved diary', emotion: 1, imageContentIds: [] }));
      assert.equal(moved.Habits.length, 0);
      assert.equal(await prisma.habitCompletion.count({ where: { habit: { userId: user.id }, date: today } }), 2);
      value(await deleteDiary({ id: diary.id }));
      assert.equal(await prisma.diary.count({ where: { userId: user.id } }), 0);
      assert.equal(await prisma.habitCompletion.count({ where: { habit: { userId: user.id }, date: today } }), 2);

    });

    await t.test('switching an existing habit to free recomputes all home aggregates without losing records', async () => {
      value(await actions.updateHabit({ habitId: regular.id, habitName: '일반', priority: 0, iconColor: 'blue' }));
      assert.deepEqual(value(await actions.getTodayHabitStat()), { createdHabits: 0, todayDoneHabits: 0, excludedCompleted: 2 });
      assert.deepEqual(value(await getHabitStats({ year })), { topHabits: [], bottomHabits: [] });
      const flow = value(await actions.getHabitFlow({ date: today })).at(-1);
      assert.equal(flow.total, 0);
      assert.equal(flow.completed, 0);
      assert.equal(flow.excludedCompleted, 2);
      const month = value(await actions.getHabitMonthData({ id: String(regular.id), month: today.slice(0, 7) }));
      assert.ok(month.summary.completedCount >= 1);
      assert.equal(month.summary.completionRate, null);
      assert.equal(month.summary.missedCount, null);
      assert.ok(month.summary.averageInterval > 0);
      const annual = value(await actions.getHabitYearlyStatus({ id: String(regular.id), year: String(year) }));
      assert.equal(annual.rate, null);
      assert.equal(annual.missed, null);
      value(await actions.updateHabit({ habitId: regular.id, habitName: '일반', priority: 2 }));
      assert.equal(value(await actions.getTodayHabitStat()).todayDoneHabits, 1);
      assert.equal(value(await getHabitStats({ year })).topHabits[0].iconColor, 'blue');
      value(await actions.uncheckHabit({ habitId: free.id, date: today }));
      assert.equal(value(await actions.getTodayHabitStat()).excludedCompleted, 0);
      assert.equal(value(await actions.getHabitById({ id: free.id })).latestRecordedDate, null);
    });

    await t.test('monthly/yearly statistics use the chosen start, not creation, including timezone boundaries', async () => {
      const boundary = value(await actions.createHabit({ ...input, habitName: '경계', initialStartedAt: '2024-02-28T15:00:00.000Z' }));
      for (const date of ['2024-02-28', '2024-02-29', '2024-03-01']) {
        await prisma.habitCompletion.create({ data: { habitId: boundary.id, date } });
      }
      const month = value(await actions.getHabitMonthData({ id: String(boundary.id), month: '2024-02' }));
      assert.equal(month.startedDate, '2024-02-29');
      assert.equal(month.summary.targetDays, 1);
      assert.equal(month.summary.completedCount, 1);
      assert.equal(month.summary.completionRate, 100);
      assert.equal(value(await actions.getHabitsByDate({ date: '2024-02-28' })).summary.completed, 0);
      const annual = value(await actions.getHabitYearlyStatus({ id: String(boundary.id), year: '2024' }));
      assert.equal(annual.completed, 2);
      assert.equal(annual.monthly[1], 1);
      assert.equal(annual.monthly[2], 1);
      assert.equal(value(await getHabitStats({ year: 2024 })).topHabits[0].count, 2);
      timezone = 'America/Los_Angeles';
      assert.equal(value(await actions.getHabitById({ id: boundary.id })).startedDate, '2024-02-28');
      assert.equal(value(await actions.getHabitMonthData({ id: String(boundary.id), month: '2024-02' })).summary.completedCount, 2);
      timezone = 'Asia/Seoul';
    });
  } finally {
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.$disconnect();
  }
});
