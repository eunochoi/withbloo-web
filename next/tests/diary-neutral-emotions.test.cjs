const test = require('node:test');
const assert = require('node:assert/strict');
const loadSource = require('./load-source.cjs');

const emotions = Array.from({ length: 12 }, (_, id) => ({ id }));

test('new neutral emotions contribute to yearly and half-year statistics', async () => {
  const load = loadSource({
    '@/common/constants/emotions': { EMOTIONS: emotions },
    '../../../../lib/prisma': { prisma: { diary: { findMany: async () => [{ date: '2026-02-01', emotion: 10 }, { date: '2026-09-01', emotion: 11 }] } } },
    '../../auth/getAuth': { getAuth: async () => ({ ok: true, email: 'test@example.com' }) },
    './utils': { getYearRange: () => ({ startDate: '2026-01-01', endDate: '2026-12-31' }), getOrComputeStreak: async () => ({ currentStreak: 0, longestStreak: 0 }), daysToUnits: () => ({}), createServerErrorResult: () => ({ ok: false }) },
  });
  const result = await load('common/actions/stats/getDiaryStats.ts').getDiaryStats({ year: 2026 });
  assert.equal(result.ok, true);
  assert.equal(result.data.emotionCounts[10], 1);
  assert.equal(result.data.emotionCounts[11], 1);
  assert.equal(result.data.halfYearEmotionCounts[0][10], 1);
  assert.equal(result.data.halfYearEmotionCounts[1][11], 1);
});

test('neutral filter includes both native emotions', () => {
  const load = loadSource();
  assert.deepEqual([...load('common/constants/diaryFilters.ts').DIARY_EMOTION_GROUPS.neutral.emotions], [4, 9, 10, 11]);
});
