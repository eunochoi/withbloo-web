const test = require('node:test');
const assert = require('node:assert/strict');
const loadSource = require('./load-source.cjs');

function harness() {
  const rows = [];
  const tx = { $queryRaw: async () => [], sober: {
    count: async () => rows.length,
    findFirst: async ({ where }) => rows.find((row) => row.id === where.id && row.userId === where.userId) ?? null,
    create: async ({ data }) => { const item = { id: rows.length + 1, ...data }; rows.push(item); return item; },
    update: async ({ where, data }) => Object.assign(rows.find((row) => row.id === where.id), data),
  }, soberRestart: { create: async ({ data }) => ({ id: 7, ...data }), updateMany: async () => ({ count: 0 }) } };
  const load = loadSource({ '../../../../lib/prisma': { prisma: { $transaction: (fn) => fn(tx) } }, '@/common/auth/getAuth': { getAuth: async () => ({ ok: true, userId: 5 }) }, '@/common/constants/habitIconColors': { isHabitIconColor: (value) => value === 'theme' } });
  return { actions: load('common/actions/sober/index.ts'), rows };
}
const input = { name: '커피', description: '', iconKey: 'favorite', iconColor: 'theme', isPriority: false, initialStartedAt: '2020-01-01T00:00:00.000Z', goalMode: 'AUTO', goalDays: null };

test('creation is user scoped and enforces the count limit', async () => {
  const { actions, rows } = harness();
  const result = await actions.saveSober(input);
  assert.equal(result.ok, true); assert.equal(rows[0].userId, 5);
  while (rows.length < 10) rows.push({ id: rows.length + 1, userId: 5 });
  const limited = await actions.saveSober({ ...input, name: '다른 이름' });
  assert.equal(limited.ok, false);
});

test('rejects invalid options and restarts before start', async () => {
  const { actions } = harness();
  assert.equal((await actions.saveSober({ ...input, iconKey: 'missing' })).ok, false);
  assert.equal((await actions.saveSober({ ...input, goalMode: 'MANUAL', goalDays: 0 })).ok, false);
  assert.equal((await actions.saveSober(input)).ok, true);
  assert.equal((await actions.saveSoberRestart({ soberId: 1, restartedAt: '2019-01-01T00:00:00Z', memo: '' })).ok, false);
  assert.equal((await actions.saveSoberRestart({ soberId: 1, restartedAt: '2021-01-01T00:00:00Z', memo: '다시' })).ok, true);
});

test('sober names accept 30 characters and reject 31 characters on create and update', async () => {
  const { actions, rows } = harness();
  assert.equal((await actions.saveSober({ ...input, name: 'a'.repeat(30) })).ok, true);
  assert.equal((await actions.saveSober({ ...input, name: 'b'.repeat(31) })).ok, false);
  assert.equal((await actions.saveSober({ ...input, id: rows[0].id, name: '한'.repeat(30) })).ok, true);
  assert.equal((await actions.saveSober({ ...input, id: rows[0].id, name: '한'.repeat(31) })).ok, false);
});
