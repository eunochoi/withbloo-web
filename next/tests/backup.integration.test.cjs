const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs/promises");
const { PrismaClient } = require("@prisma/client");
const CryptoJS = require("crypto-js");
const sourceLoader = require("./load-source.cjs");
const url = process.env.HABIT_TEST_DATABASE_URL;
if (url) {
  const parsed = new URL(url);
  assert.ok(["localhost", "127.0.0.1"].includes(parsed.hostname));
  assert.equal(parsed.pathname, "/took_habit_test");
}
test("web export includes only the current account and never changes existing records", { skip: !url }, async () => {
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  const users = await Promise.all(["backup", "other"].map((name) => prisma.user.create({ data: { email: `${name}-${process.pid}@test.local`, provider: "test" } })));
  const [user, other] = users;
  const photo = Buffer.from([255, 216, 255, 217]);
  const load = sourceLoader({
    [path.resolve(__dirname, "../lib/prisma.ts")]: { prisma },
    [path.resolve(__dirname, "../src/common/utils/getEnvValue.ts")]: { getEnvValue: () => "test-only-backup-secret" },
    [path.resolve(__dirname, "../src/common/actions/image/utils/index.ts")]: { createS3Client: () => ({ send: async (command) => {
      assert.equal(command.constructor.name, "GetObjectCommand");
      assert.equal(command.input.Key, "synthetic-photo.jpg");
      return { ContentLength: photo.length, Body: (async function* () { yield photo; })() };
    } }) },
  });
  const service = load("common/backup/service.ts");
  const workspace = await load("common/backup/files.ts").createBackupWorkspace();
  try {
    const diaries = await Promise.all(users.map((owner) => prisma.diary.create({ data: {
      userId: owner.id, email: owner.email, date: "2024-02-29", emotion: 10,
      text: CryptoJS.AES.encrypt(owner === user ? "Export me" : "Other account", "test-only-backup-secret").toString(),
    } })));
    const habit = await prisma.habit.create({ data: { userId: user.id, email: user.email, name: "Free reading", priority: 0, iconKey: "reading", iconColor: "lavender", initialStartedAt: new Date("2024-01-01T00:00:00Z") } });
    await prisma.habitCompletion.create({ data: { habitId: habit.id, date: "2024-03-01" } });
    const sober = await prisma.sober.create({ data: { userId: user.id, name: "Less coffee", iconKey: "phone", iconColor: "lavender", initialStartedAt: new Date("2024-01-01T00:00:00Z"), goalMode: "AUTO" } });
    await prisma.soberRestart.create({ data: { soberId: sober.id, restartedAt: new Date("2024-02-01T00:00:00Z"), memo: "A fresh start" } });
    const content = await prisma.imageContent.create({ data: { id: `backup-fixture-${process.pid}`, contentHash: `backup-hash-${process.pid}`, storagePath: "synthetic-photo.jpg", contentType: "image/jpeg", size: photo.length, status: "READY" } });
    await prisma.image.create({ data: { diaryId: diaries[0].id, imageContentId: content.id, order: 0 } });
    const before = JSON.stringify(await prisma.user.findMany({ where: { id: { in: users.map((row) => row.id) } }, include: { diaries: { include: { images: true } }, habits: { include: { completions: true } }, sobers: { include: { restarts: true } } }, orderBy: { id: "asc" } }));
    const exported = await service.exportBackupFile({ userId: user.id, email: user.email }, "synthetic-password", "Asia/Seoul", workspace.directory);
    const bundle = await service.decodeBackup(await fs.readFile(exported.path), "synthetic-password", "Asia/Seoul");
    assert.equal(bundle.records.diaries.length, 1);
    assert.equal(bundle.records.diaries[0].text, "Export me");
    assert.equal(bundle.records.habits[0].priority, 0);
    assert.equal(bundle.records.completions[0].date, "2024-03-01");
    assert.equal(bundle.records.completions[0].habit_id, bundle.records.habits[0].id);
    assert.equal(bundle.records.soberRestarts[0].sober_id, bundle.records.sobers[0].id);
    assert.equal(bundle.records.images[0].diary_id, bundle.records.diaries[0].id);
    assert.deepEqual(Buffer.from(Object.values(bundle.media)[0]), photo);
    const after = JSON.stringify(await prisma.user.findMany({ where: { id: { in: users.map((row) => row.id) } }, include: { diaries: { include: { images: true } }, habits: { include: { completions: true } }, sobers: { include: { restarts: true } } }, orderBy: { id: "asc" } }));
    assert.equal(after, before);
    assert.equal("restoreBackup" in service, false);
    await prisma.user.deleteMany({ where: { id: { in: users.map((row) => row.id) } } });
    await prisma.imageContent.delete({ where: { id: content.id } });
  } finally {
    await prisma.user.deleteMany({ where: { id: { in: users.map((row) => row.id) } } });
    await workspace.dispose();
    await prisma.$disconnect();
  }
});
