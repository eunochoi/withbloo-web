const assert = require('node:assert/strict');
const { test } = require('node:test');
const sourceLoader = require('./load-source.cjs');

function pickerHarness(name, props, folder = 'HabitForm') {
  const state = [];
  let cursor = 0;
  const load = sourceLoader({ '@/common/components/ui/ScrollContainer': { ScrollContainer: 'div' }, '@/common/components/ui/PickerGridItem': { __esModule: true, default: 'button' }, '@/common/components/ui/PickerInfoCard': { __esModule: true, default: 'div' }, react: {
    forwardRef: (render) => render,
    useState: (initial) => {
      const index = cursor++;
      if (!(index in state)) state[index] = typeof initial === 'function' ? initial() : initial;
      return [state[index], (value) => { state[index] = value; }];
    },
    useRef: () => ({ current: null }),
    useEffect: () => {},
  } });
  const Component = load(`common/components/features/${folder}/${name}.tsx`).default;
  return () => { cursor = 0; return Component(props); };
}

function find(node, predicate) {
  if (!node) return undefined;
  if (Array.isArray(node)) return node.map((child) => find(child, predicate)).find(Boolean);
  if (typeof node !== 'object') return undefined;
  if (predicate(node)) return node;
  return find(node.props?.children, predicate);
}

for (const [name, value, selection] of [
  ['HabitFormColorPicker', 'theme', '라벤더'],
  ['HabitFormIconPicker', 'goal', '기본 2'],
]) {
  test(`${name}: draft selection applies only on confirmation and closing cancels`, () => {
    const applied = [];
    let closed = false;
    const render = pickerHarness(name, { value, iconColor: 'mint', onApply: (item) => applied.push(item), onClose: () => { closed = true; } });
    const getLabel = (node) => node.props?.['aria-label'] ?? node.props?.label ?? find(node.props?.children, (child) => child.type === 'span' && child.props.children === selection)?.props.children;
    find(render(), (node) => node.type === 'button' && (getLabel(node) === selection || find(node.props?.children, (child) => child.type === 'span' && child.props.children === selection))).props.onClick();
    assert.deepEqual(applied, []);
    render().props.onClose();
    assert.equal(closed, true);
    assert.deepEqual(applied, []);
    render().props.onApply();
    assert.deepEqual(applied, [name === 'HabitFormColorPicker' ? 'lavender' : name === 'HabitFormIconPicker' ? 'target' : 0]);
    const reopened = pickerHarness(name, { value, iconColor: 'mint', onApply: (item) => applied.push(item), onClose: () => {} });
    reopened().props.onApply();
    assert.equal(applied[1], value);
  });
}

test('native icon categories cover every selectable icon once, with readable labels', () => {
  const load = sourceLoader();
  const { HABIT_ICON_CATEGORIES } = load('common/constants/habitIconCategories.ts');
  const { HABIT_ICON_LABELS } = load('common/constants/habitIconLabels.ts');
  const { HABIT_ICON_KEYS } = load('common/constants/habitIcons.ts');
  assert.deepEqual(HABIT_ICON_CATEGORIES.map((item) => item.label), ['기본', '작은 돌봄', '하루 가꾸기', '몸 움직이기', '마음과 연결', '배움과 즐거움']);
  const keys = HABIT_ICON_CATEGORIES.flatMap((item) => item.keys);
  assert.equal(keys.length, 54);
  assert.equal(new Set(keys).size, keys.length);
  assert.deepEqual([...keys].sort(), [...HABIT_ICON_KEYS].sort());
  assert.ok(keys.every((key) => HABIT_ICON_LABELS[key]));
});

test('habit priority keeps the daily star selection when switching modes', () => {
  const applied = [];
  const render = pickerHarness('HabitFormPriorityPicker', { value: 1, onClose() {}, onApply: (value) => applied.push(value) });
  const selectMode = (title) => find(render(), (node) => node.props?.title === title && node.props.toggle).props.toggle.onChange(true);
  find(render(), (node) => node.props?.['aria-label'] === '높음 · 매일 기록').props.onClick();
  selectMode('자유 기록');
  selectMode('매일 기록');
  assert.equal(find(render(), (node) => node.props?.['aria-pressed'])?.props['aria-label'], '높음 · 매일 기록');
  assert.deepEqual(applied, []);
  selectMode('자유 기록');
  render().props.onApply();
  assert.deepEqual(applied, [0]);
});

test('the goal picker retains period and custom drafts and only applies a valid selection', () => {
  const applied = [];
  const render = pickerHarness('SoberGoalPicker', { mode: 'AUTO', days: 7, onClose() {}, onApply: (...args) => applied.push(args) }, 'Sober');
  const selectMode = (title) => find(render(), (node) => node.props?.title === title && node.props.toggle).props.toggle.onChange(true);
  const apply = () => find(render().props.header, (node) => node.type === 'button').props;
  selectMode('기간 설정');
  find(render(), (node) => node.type === 'button' && node.props.children === '1개월').props.onClick();
  selectMode('직접 입력');
  const setDays = (value) => find(render(), (node) => node.type === 'input' && node.props.inputMode === 'numeric').props.onChange({ target: { value } });
  setDays('0');
  assert.equal(apply().disabled, true);
  apply().onClick();
  assert.deepEqual(applied, []);
  setDays('12');
  selectMode('기간 설정');
  apply().onClick();
  selectMode('직접 입력');
  apply().onClick();
  assert.deepEqual(applied, [['MANUAL', 30], ['MANUAL', 12]]);
});

test('color picker previews three icons for each record type using the draft color', () => {
  for (const [kind, names] of [['habit', ['water', 'walking', 'reading']], ['sober', ['phone', 'coffee', 'shopping']]]) {
    const render = pickerHarness('HabitFormColorPicker', { value: 'theme', kind, onApply() {}, onClose() {} });
    const select = find(render(), (node) => node.type === 'button' && node.props?.label === '라벤더');
    select.props.onClick();
    const card = render().props.fixedContent;
    for (const name of names) {
      const icon = find(card, (node) => node.props?.iconKey === name || node.props?.name === name);
      assert.ok(icon, `${kind}: ${name}`);
      assert.equal(icon.props.iconColor ?? icon.props.color, 'lavender');
    }
  }
});
