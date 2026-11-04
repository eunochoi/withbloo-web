const assert = require('node:assert/strict');
const { test } = require('node:test');
const sourceLoader = require('./load-source.cjs');

function find(node, predicate) {
  if (!node) return undefined;
  if (Array.isArray(node)) return node.map((child) => find(child, predicate)).find(Boolean);
  if (typeof node !== 'object') return undefined;
  if (predicate(node)) return node;
  return find(node.props?.children, predicate);
}

function renderManual(habits) {
  const states = [true, habits, false, 'CUSTOM', false];
  let index = 0;
  const load = sourceLoader({
    react: { useState: () => [states[index++], () => {}], useEffect: () => {} },
    'framer-motion': { AnimatePresence: 'AnimatePresence', motion: { div: 'motion.div' }, useReducedMotion: () => false },
    '@/common/hooks/useSortSectionScroll': { useSortSectionScroll: () => ({ scrollRef: {}, standardRef: {}, customRef: {}, cancelInitialScroll: () => {} }) },
    '@tanstack/react-query': { useQuery: () => ({ data: habits, isPending: false, isError: false }) },
    '@/common/auth/authAction': { authAction: () => {} },
    '@/common/queries/habitQueries': { habitQueries: { list: () => ({}) } },
    '@/common/components/ui/Dialog/PanelDialog': { PanelDialog: 'PanelDialog' },
    '@/common/components/ui/Dialog/PanelDialog/PanelBody': { PanelBody: 'PanelBody' },
    '@/common/components/ui/Dialog/PanelDialog/PanelHeader': { PanelHeader: 'PanelHeader' },
    '@/common/components/ui/Dialog/PanelDialog/PanelSubmitButton': { PanelSubmitButton: 'PanelSubmitButton' },
    '@/common/components/ui/Notice/notice': { showNotice: () => {} },
    '@/common/components/ui/AppDotTabs': { __esModule: true, default: 'AppDotTabs' },
    '@/common/components/ui/InfoNotice': { __esModule: true, default: 'InfoNotice' },
    '@/common/components/ui/ScrollContainer': { ScrollContainer: 'ScrollContainer' },
    './HabitManualSortList': { HabitManualSortList: 'HabitManualSortList' },
  });
  const { HabitSortModal } = load('common/components/features/HabitSort/HabitSortModal.tsx');
  return HabitSortModal({ onClose() {}, sortValue: 'CUSTOM', priorityFirst: false, customHabitOrder: [], setCustomHabitOrder() {}, setSort() {}, isStorageReady: true });
}

test('both sort sections share the modal scroll area and disable the inactive section', () => {
  for (const count of [0, 3, 30]) {
    const habits = Array.from({ length: count }, (_, id) => ({ id, name: `habit ${id}`, priority: 1, createdAt: '2026-01-01' }));
    const tree = renderManual(habits);
    const body = find(tree, (node) => node.type === 'PanelBody');
    const list = find(body, (node) => node.type === 'HabitManualSortList');
    assert.equal(body.props.showScrollFade, true);
    assert.equal(list.props.tempHabits.length, count);
    assert.equal(list.props.disabled, false);
    assert.ok(find(body, (node) => node.type === 'fieldset' && /opacity-40/.test(node.props.className) && node.props.disabled));
    assert.ok(find(body, (node) => node.type === 'input' && node.props.type === 'radio' && node.props.name === 'habit-sort-mode' && node.props.checked));
    assert.equal(find(tree, (node) => node.type === 'AppDotTabs'), undefined);
  }
});

test('manual list uses the enclosing modal scroll area', () => {
  const load = sourceLoader({
    '@dnd-kit/core': { DndContext: 'DndContext', closestCenter: () => {}, KeyboardSensor: 'KeyboardSensor', MouseSensor: 'MouseSensor', TouchSensor: 'TouchSensor', useSensor: () => ({}), useSensors: () => [] },
    '@dnd-kit/modifiers': { restrictToParentElement: () => {}, restrictToVerticalAxis: () => {} },
    '@dnd-kit/sortable': { SortableContext: 'SortableContext', sortableKeyboardCoordinates: () => {}, verticalListSortingStrategy: () => {} },
    './HabitManualSortItem': { HabitManualSortItem: 'HabitManualSortItem' },
  });
  const { HabitManualSortList } = load('common/components/features/HabitSort/HabitManualSortList.tsx');
  const habits = [{ id: 1, name: '습관', priority: 1, createdAt: '2026-01-01' }];
  const tree = HabitManualSortList({ tempHabits: habits, onOrderChange() {}, disabled: true });
  assert.equal(tree.type, 'div');
  assert.equal(tree.props.inert, true);
  assert.equal(find(tree, (node) => node.type === 'HabitManualSortItem').props.habit, habits[0]);
});

test('busy panels keep a disabled handle while intentionally locked panels may hide it', () => {
  const load = sourceLoader({
    react: { useLayoutEffect: () => {}, useRef: () => ({ current: null }) },
    'framer-motion': { motion: { div: 'motion.div' }, useIsPresent: () => true, useReducedMotion: () => false },
    '../useSheetDismiss': { useSheetDismiss: () => ({ get: () => 0 }) },
    '../DialogBackdrop': { DialogBackdrop: 'DialogBackdrop' },
    '../SheetHandle': { SheetHandle: 'SheetHandle' },
  });
  const { PanelDialog } = load('common/components/ui/Dialog/PanelDialog/index.tsx');
  const busy = PanelDialog({ ariaLabel: '저장', onClose() {}, dismissible: false, preserveHandle: true });
  assert.equal(find(busy, (node) => node.type === 'SheetHandle').props.disabled, true);
  const locked = PanelDialog({ ariaLabel: '안내', onClose() {}, dismissible: false });
  assert.equal(find(locked, (node) => node.type === 'SheetHandle'), undefined);
});
