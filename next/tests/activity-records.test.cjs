const test = require('node:test');
const assert = require('node:assert/strict');
const loadSource = require('./load-source.cjs');
function harness(auth = { ok: true, userId: 5 }) {
  const writes = [];
  const parent = { id: 1, userId: 5, initialStartedAt: new Date('2024-01-01T00:00:00.000Z') };
  let existing = { id: 7, habitId: 1, soberId: 1, isRestart: false };
  const delegate = {
    create: async (args) => {
      writes.push(args);
      return { id: 7 };
    },
    updateMany: async ({ where, data }) => {
      const match =
        where.id === existing.id &&
        (where.habitId ?? where.soberId) === 1 &&
        (where.isRestart === undefined || where.isRestart === existing.isRestart);
      if (match) writes.push({ where, data });
      return { count: match ? 1 : 0 };
    },
    deleteMany: async (args) => {
      writes.push(args);
      return { count: 1 };
    },
    findMany: async (args) => {
      writes.push(args);
      return [];
    },
  };
  const tx = {
    habit: {
      findFirst: async ({ where }) => (where.id === 1 && where.userId === 5 ? parent : null),
    },
    sober: {
      findFirst: async ({ where }) => (where.id === 1 && where.userId === 5 ? parent : null),
    },
    habitRecord: delegate,
    soberRecord: delegate,
    habitRecordImage: { deleteMany: async (args) => { writes.push(args); }, createMany: async (args) => { writes.push(args); } },
    soberRecordImage: { deleteMany: async (args) => { writes.push(args); }, createMany: async (args) => { writes.push(args); } },
  };
  const load = loadSource({
    '../../../../lib/prisma': { prisma: { ...tx, $transaction: (fn) => fn(tx) } },
    '@/common/auth/getAuth': { getAuth: async () => auth },
    '@/common/actions/diary/utils': { validateAccessibleImageContents: async (_tx, ids) => { if (ids.includes('unowned')) throw new Error('IMAGE_NOT_OWNED'); } },
    '@/common/actions/image/utils': { createImageSignedUrl: async (path) => path },
  });
  return {
    actions: load('common/actions/records/index.ts'),
    writes,
    setExisting: (row) => {
      existing = row;
    },
  };
}
const memo = { type: 'MEMO', recordedAt: '2024-01-10T10:00:00.000Z', memo: '오늘의 마음' };

test('memo saves are independent and reject empty, future, pre-start and unsupported inputs', async () => {
  const { actions, writes } = harness();
  assert.equal((await actions.saveActivityRecord('habit', 1, { ...memo, memo: ' ' })).message, '내용을 입력해주세요.');
  for (const patch of [
    { memo: ' ' },
    { memo: 'x'.repeat(501) },
    { recordedAt: '2099-01-01T00:00:00Z' },
    { recordedAt: '2023-12-31T00:00:00Z' },
    { type: 'RESTART' },
  ])
    assert.equal((await actions.saveActivityRecord('habit', 1, { ...memo, ...patch })).ok, false);
  assert.equal(writes.length, 0);
  assert.equal((await actions.saveActivityRecord('habit', 1, memo)).ok, true);
  assert.equal(writes[0].data.memo, memo.memo);
  assert.equal(writes[0].data.habitId, 1);
  assert.equal(writes[0].data.recordedAt.toISOString(), memo.recordedAt);
});

test('records enforce ownership and allow sober type changes', async () => {
  const { actions, writes, setExisting } = harness();
  assert.equal((await actions.saveActivityRecord('habit', 99, memo)).ok, false);
  assert.equal((await actions.saveActivityRecord('sober', 1, { ...memo, id: 7, type: 'RESTART' })).ok, true);
  assert.equal(writes[0].data.isRestart, true);
  assert.equal(writes[0].where.isRestart, undefined);
  setExisting({ id: 7, habitId: 1, soberId: 1, isRestart: true });
  assert.equal((await actions.saveActivityRecord('sober', 1, { ...memo, id: 7 })).ok, true);
  assert.equal(writes[1].data.isRestart, false);
  await actions.deleteActivityRecord('sober', 1, 7);
  assert.deepEqual(writes[2].where.sober, { userId: 5 });
  const unauthenticated = harness({ ok: false, code: 'UNAUTHORIZED' });
  assert.equal((await unauthenticated.actions.saveActivityRecord('habit', 1, memo)).ok, false);
  assert.equal(unauthenticated.writes.length, 0);
});

test('paged and day queries scope ownership, bound the interval and use timestamp plus id cursors', async () => {
  const { actions, writes } = harness();
  await actions.getActivityRecords('sober', 1, 'DESC', { id: 7, recordedAt: memo.recordedAt });
  assert.deepEqual(writes[0].where.sober, { userId: 5 });
  assert.equal(writes[0].where.OR[1].id.lt, 7);
  assert.deepEqual(writes[0].orderBy, [{ restartedAt: 'desc' }, { id: 'desc' }]);
  assert.equal(writes[0].take, 21);
  assert.equal((await actions.getActivityDay('habit', 1, '2024-01-01', '2024-02-01')).ok, false);
  assert.equal(
    (await actions.getActivityDay('habit', 1, '2024-01-01T00:00:00Z', '2024-01-02T00:00:00Z')).ok,
    true,
  );
});

test('photo changes validate ownership and preserve the selected order', async () => {
  const { actions, writes } = harness();
  assert.equal((await actions.saveActivityRecord('habit', 1, { ...memo, imageContentIds: ['unowned'] })).ok, false);
  assert.equal(writes.length, 0);
  assert.equal((await actions.saveActivityRecord('habit', 1, { ...memo, imageContentIds: ['first', 'second'] })).ok, true);
  assert.deepEqual(writes[2].data.map((item) => [item.imageContentId, item.position]), [['first', 0], ['second', 1]]);
});
