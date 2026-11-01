const assert = require('node:assert/strict');
const { test } = require('node:test');
const load = require('./load-source.cjs')();
const { getHabitDaySummary, isValidHabitStartedAt } = load('common/functions/habitStats.ts');
const { getHabitMonthSummary } = load('common/actions/habit/utils/getHabitMonthSummary.ts');
const { isHabitIconColor, resolveHabitIconColor } = load('common/constants/habitIconColors.ts');

test('free records and not-yet-started habits never inflate completion rates', () => {
  const habits = [
    { id: 1, priority: 1, startedDate: '2024-02-28' },
    { id: 2, priority: 3, startedDate: '2024-02-29' },
    { id: 3, priority: 0, startedDate: '2024-02-28' },
  ];
  assert.deepEqual(getHabitDaySummary('2024-02-28', habits, new Set([1, 2, 3, 99])), {
    total: 1, completed: 1, excludedCompleted: 1, percent: 100,
  });
  assert.equal(getHabitDaySummary('2024-02-29', habits, new Set([1, 3])).percent, 50);
  assert.deepEqual(getHabitDaySummary('2024-02-28', [habits[2]], new Set([3])), {
    total: 0, completed: 0, excludedCompleted: 1, percent: null,
  });
  assert.equal(getHabitDaySummary('2024-02-27', habits, new Set()).percent, null);
});

test('monthly totals respect start, leap day, today and unique dates', () => {
  const params = { monthStart: '2024-02-01', monthEnd: '2024-02-29', startedDate: '2024-02-28', today: '2024-03-01', completedDates: ['2024-02-27', '2024-02-28', '2024-02-28', '2024-02-29', '2024-03-01'] };
  const summary = getHabitMonthSummary(params);
  assert.equal(summary.targetDays, 2);
  assert.equal(summary.completedCount, 2);
  assert.equal(summary.completionRate, 100);
  assert.equal(summary.missedCount, 0);
  assert.equal(getHabitMonthSummary({ ...params, today: '2024-02-28' }).completedCount, 1);
  assert.equal(getHabitMonthSummary({ ...params, startedDate: '2024-03-01' }).completionRate, null);
  const free = getHabitMonthSummary({ ...params, isFree: true });
  assert.equal(free.completedCount, 2);
  assert.equal(free.averageInterval, 1);
  assert.equal(free.completionRate, null);
  assert.equal(free.missedCount, null);
  assert.equal(getHabitMonthSummary({ ...params, completedDates: [], isFree: true }).averageInterval, null);
});

test('start time validation rejects normalized invalid dates, missing offsets and future times', () => {
  const now = Date.parse('2024-03-01T00:00:00.000Z');
  assert.equal(isValidHabitStartedAt('2024-02-29T00:00:00.000Z', now), true);
  for (const value of ['2024-02-30T00:00:00.000Z', '2024-03-01T00:00', '2024-03-01T00:00:00.001Z', '1899-12-31T23:59:59.999Z', null, {}, 'invalid']) {
    assert.equal(isValidHabitStartedAt(value, now), false);
  }
});

test('icon color keys are allowlisted and theme follows the current CSS color', () => {
  assert.equal(isHabitIconColor('lavender'), true);
  assert.equal(isHabitIconColor('theme'), true);
  assert.equal(isHabitIconColor('__proto__'), false);
  assert.equal(isHabitIconColor('#ffffff'), false);
  assert.equal(resolveHabitIconColor('theme'), 'rgb(var(--theme-accent))');
  assert.equal(resolveHabitIconColor('lavender'), '#B8AED3');
  assert.equal(resolveHabitIconColor(null), 'rgb(var(--theme-accent))');
});

test('saving a priority/color change invalidates home, calendar and diary projections', async () => {
  const path = require('node:path');
  const { QueryClient } = require('@tanstack/react-query');
  const queryClient = new QueryClient();
  const keys = [
    ['habit', 'today-stat', '2024-02-29'], ['habit', 'flow', '2024-02-29'],
    ['habits', 'page', '2024-02-29'], ['stats', 'habit', 2024],
    ['diary-habit', 'month', '2024-02'], ['diary', 'id', '1'],
  ];
  for (const key of keys) queryClient.setQueryData(key, { old: true });
  const loadHook = require('./load-source.cjs')({
    react: { useState: () => [false, () => {}] },
    '@tanstack/react-query': { useQueryClient: () => queryClient },
    [path.resolve(__dirname, '../src/common/components/ui/Notice/notice.ts')]: { showNotice: () => {} },
  });
  const { useHabitSubmission } = loadHook('common/components/features/HabitForm/hooks/useHabitSubmission.ts');
  let saved = false;
  await useHabitSubmission({
    name: '자유', priority: 0, saveHabit: async () => ({ id: 1, priority: 0, iconColor: 'blue' }),
    onSuccess: () => { saved = true; }, successMessage: '', failureMessage: '',
  }).handleSubmit();
  assert.equal(saved, true);
  for (const key of keys) assert.equal(queryClient.getQueryState(key).isInvalidated, true, JSON.stringify(key));
  queryClient.clear();
});

test('habit names accept up to 30 characters', () => {
  const { isValidHabitName } = load('common/actions/habit/utils/index.ts');
  assert.equal(isValidHabitName('a'.repeat(30)), true);
  assert.equal(isValidHabitName('한'.repeat(30)), true);
  assert.equal(isValidHabitName('a'.repeat(31)), false);
  assert.equal(isValidHabitName(' '.repeat(30)), false);
});
