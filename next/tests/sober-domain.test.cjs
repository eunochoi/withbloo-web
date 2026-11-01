const test = require('node:test');
const assert = require('node:assert/strict');
const load = require('./load-source.cjs')();
const { getSoberSummary, SOBER_DAY_MS } = load('common/functions/sober.ts');

test('current progress and milestones use sorted restart timestamps', () => {
  const start = Date.parse('2026-01-01T00:00:00Z');
  const sober = { initialStartedAt: new Date(start), goalMode: 'AUTO', goalDays: null };
  const restarts = [{ id: 2, restartedAt: new Date(start + 10 * SOBER_DAY_MS), memo: null }, { id: 1, restartedAt: new Date(start + 5 * SOBER_DAY_MS), memo: null }];
  const result = getSoberSummary(sober, restarts, start + 14 * SOBER_DAY_MS);
  assert.equal(result.current.duration, 4 * SOBER_DAY_MS);
  assert.equal(result.goalDays, 7);
  assert.equal(result.longest, 5 * SOBER_DAY_MS);
  assert.deepEqual(result.achievements.map((entry) => entry.days), [3, 3, 3]);
});

test('manual goal and deletion recalculate continuous time', () => {
  const start = Date.parse('2026-01-01T00:00:00Z');
  const sober = { initialStartedAt: new Date(start), goalMode: 'MANUAL', goalDays: 2 };
  const now = start + 4 * SOBER_DAY_MS;
  assert.equal(getSoberSummary(sober, [{ id: 1, restartedAt: new Date(start + 3 * SOBER_DAY_MS), memo: null }], now).progress, 50);
  assert.equal(getSoberSummary(sober, [], now).progress, 100);
});

test('duration distribution places each current record in exactly one interval at boundaries', () => {
  const { getSoberDurationDistribution } = load('common/functions/sober.ts');
  const now = Date.parse('2026-10-31T00:00:00Z');
  const item = (days) => ({ initialStartedAt: new Date(now - days * SOBER_DAY_MS), goalMode: 'AUTO', goalDays: null, restarts: [] });
  assert.deepEqual(getSoberDurationDistribution([item(0), item(2.99), item(3), item(7), item(14), item(30), item(90)], now), [2, 1, 1, 1, 1, 1]);
  const restarted = { ...item(100), restarts: [{ id: 1, restartedAt: new Date(now - 2 * SOBER_DAY_MS), memo: null }] };
  assert.deepEqual(getSoberDurationDistribution([restarted], now), [1, 0, 0, 0, 0, 0]);
});
