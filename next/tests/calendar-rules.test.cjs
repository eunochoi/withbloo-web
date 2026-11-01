const assert = require('node:assert/strict');
const { test } = require('node:test');
const sourceLoader = require('./load-source.cjs');
const load = sourceLoader();
const { makeMonthCalendarDays } = load('common/components/ui/Calendar/useMonthCalendar.ts');

test('four-, five- and six-week months always render six Monday-first rows', () => {
  for (const month of ['2021-02', '2024-02', '2026-08', '2026-11', '2026-12']) {
    const days = makeMonthCalendarDays(month);
    assert.equal(days.length, 42);
    assert.equal(days[0].weekday, 1);
    assert.equal(days[41].weekday, 0);
    assert.equal(new Set(days.map((day) => day.dateKey)).size, 42);
    assert.ok(days.filter((day) => !day.isOutsideMonth).every((day) => day.dateKey.startsWith(month)));
  }
  assert.equal(makeMonthCalendarDays('2024-02').filter((day) => !day.isOutsideMonth).length, 29);
});

function harness(initial, bounds) {
  let stored;
  const hook = sourceLoader({ react: {
    useMemo: (fn) => fn(),
    useState: (initialValue) => {
      stored ??= typeof initialValue === 'function' ? initialValue() : initialValue;
      return [stored, (value) => { stored = value; }];
    },
  } })('common/components/ui/Calendar/useMonthCalendar.ts').useMonthCalendar;
  return () => hook(initial, bounds);
}

test('arrows and direct month jumps respect start month and current month', () => {
  const render = harness('2026-10-30', { minDate: '2026-09-15', maxDate: '2026-10-30' });
  assert.equal(render().canGoNext, false);
  render().goNextMonth();
  assert.equal(render().visibleMonth, '2026-10');
  render().goPreviousMonth();
  assert.equal(render().visibleMonth, '2026-09');
  assert.equal(render().canGoPrevious, false);
  render().goPreviousMonth();
  assert.equal(render().visibleMonth, '2026-09');
  render().showDate('2026-08-31');
  assert.equal(render().visibleMonth, '2026-09');
  render().showDate('2026-11-01');
  assert.equal(render().visibleMonth, '2026-09');
  render().showDate('2026-10-30');
  assert.equal(render().visibleMonth, '2026-10');
  render().showDate('2026-02-30');
  assert.equal(render().visibleMonth, '2026-10');
});

test('dates before habit start and after today are unavailable, including adjacent-month cells', () => {
  const render = harness('2026-09-15', { minDate: '2026-09-15', maxDate: '2026-10-30' });
  assert.equal(render().isDateAvailable('2026-09-14'), false);
  assert.equal(render().isDateAvailable('2026-09-15'), true);
  assert.equal(render().isDateAvailable('2026-10-30'), true);
  assert.equal(render().isDateAvailable('2026-10-31'), false);
  assert.equal(render().isDateAvailable('2026-11-01'), false);
  assert.equal(render().isDateAvailable('invalid'), false);
  const future = harness('2027-01-01', { maxDate: '2026-10-30' });
  assert.equal(future().visibleMonth, '2026-10');
});
