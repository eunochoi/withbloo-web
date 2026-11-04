const assert = require('node:assert/strict');
const { test } = require('node:test');
const sourceLoader = require('./load-source.cjs');
const load = sourceLoader();
const { itemAccentColors } = load('common/functions/itemAccentColors.ts');
const { HABIT_ICON_COLORS } = load('common/constants/habitIconColors.ts');
const { sortSobers, formatSoberGoal } = load('common/functions/sober.ts');

const luminance = (hex) => [1, 3, 5].map((offset) => {
  const channel = parseInt(hex.slice(offset, offset + 2), 16) / 255;
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}).reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);

test('pale item colors remain readable on both surfaces in light and dark modes', () => {
  for (const mode of ['light', 'dark']) {
    const surface = mode === 'light' ? '#ffffff' : '#262626';
    for (const color of ['#8CADE2', ...Object.values(HABIT_ICON_COLORS).map((entry) => entry.value)]) {
      const accent = itemAccentColors(color, surface, mode);
      assert.equal(accent.color, color);
      for (const base of [surface, accent.background]) {
        const light = luminance(accent.text);
        const dark = luminance(base);
        assert.ok((Math.max(light, dark) + 0.05) / (Math.min(light, dark) + 0.05) >= 4.5, `${mode}: ${color}`);
      }
    }
  }
});

test('list and home use priority, current duration and creation order without mutating the cache', () => {
  const start = new Date('2026-10-01T00:00:00Z');
  const base = { initialStartedAt: start, createdAt: start, restarts: [], goalMode: 'AUTO', goalDays: null, isPriority: false };
  const items = [{ ...base, id: 1 }, { ...base, id: 2, initialStartedAt: new Date('2026-10-20T00:00:00Z'), isPriority: true }, { ...base, id: 3, createdAt: new Date('2026-10-02T00:00:00Z') }];
  const now = Date.parse('2026-10-31T00:00:00Z');
  assert.deepEqual(sortSobers(items, {}, now).map((item) => item.id), [3, 1, 2]);
  assert.deepEqual(sortSobers(items, { priorityFirst: true }, now).map((item) => item.id), [2, 3, 1]);
  assert.deepEqual(sortSobers(items, { recordSort: 'ASC', sort: 'ASC' }, now).map((item) => item.id), [2, 1, 3]);
  assert.deepEqual(sortSobers(items, { sort: 'SHORT' }, now).map((item) => item.id), [2, 3, 1]);
  assert.deepEqual(sortSobers(items, { sort: 'CUSTOM', customOrder: [2, 1], priorityFirst: true }, now).map((item) => item.id), [2, 1, 3]);
  assert.deepEqual(sortSobers(items, { sort: 'CUSTOM', customOrder: [] }, now).map((item) => item.id), [3, 1, 2]);
  assert.deepEqual(items.map((item) => item.id), [1, 2, 3]);
  assert.equal(formatSoberGoal(14), '2주');
  assert.equal(formatSoberGoal(30), '1개월');
  assert.equal(formatSoberGoal(11), '11일');
});

function find(node, predicate) {
  if (!node || typeof node !== 'object') return undefined;
  if (Array.isArray(node)) return node.map((child) => find(child, predicate)).find(Boolean);
  return predicate(node) ? node : find(node.props?.children, predicate) ?? find(node.props?.header, predicate);
}

test('custom goal validates before confirming and does not apply drafts until the final action', () => {
  const state = [];
  let cursor = 0;
  const applied = [];
  const Component = sourceLoader({ react: { useState: (initial) => {
    const index = cursor++;
    if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial;
    return [state[index], (value) => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
  } } })('common/components/features/Sober/SoberGoalPicker.tsx').default;
  const render = () => { cursor = 0; return Component({ mode: 'AUTO', days: 7, onClose: () => {}, onApply: (...args) => applied.push(args) }); };
  find(render(), (node) => node.type === 'button' && find(node.props.children, (child) => child.type === 'span' && child.props.children === '직접 입력')).props.onClick();
  find(render(), (node) => node.type === 'input').props.onChange({ target: { value: '0' } });
  assert.equal(find(render(), (node) => node.type === 'button' && node.props.children === '완료').props.disabled, true);
  find(render(), (node) => node.type === 'input').props.onChange({ target: { value: '14' } });
  find(render(), (node) => node.type === 'button' && node.props.children === '완료').props.onClick();
  assert.deepEqual(applied, []);
  find(render(), (node) => node.type === 'button' && node.props.children === '이 목표로 설정하기').props.onClick();
  assert.deepEqual(applied, [['MANUAL', 14]]);
});
