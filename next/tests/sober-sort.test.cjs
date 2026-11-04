const assert = require('node:assert/strict');
const { test } = require('node:test');
const sourceLoader = require('./load-source.cjs');

function find(node, predicate) {
  if (!node || typeof node !== 'object') return undefined;
  if (Array.isArray(node)) return node.map((child) => find(child, predicate)).find(Boolean);
  return predicate(node) ? node : find(node.props?.children, predicate);
}

test('custom mode applies dragged order without changing it before apply', () => {
  const state = [];
  let cursor = 0;
  const applied = [];
  const load = sourceLoader({
    react: { useState: (initial) => { const i = cursor++; if (!(i in state)) state[i] = typeof initial === 'function' ? initial() : initial; return [state[i], (next) => { state[i] = typeof next === 'function' ? next(state[i]) : next; }]; }, useEffect: () => {} },
    '@/common/hooks/useSortSectionScroll': { useSortSectionScroll: () => ({ scrollRef: {}, standardRef: {}, customRef: {}, cancelInitialScroll: () => {} }) },
    'framer-motion': { AnimatePresence: 'AnimatePresence' },
    '@dnd-kit/core': { DndContext: 'DndContext', KeyboardSensor: 'KeyboardSensor', MouseSensor: 'MouseSensor', TouchSensor: 'TouchSensor', useSensor: () => ({}), useSensors: () => [] },
    '@dnd-kit/modifiers': { restrictToParentElement: () => {}, restrictToVerticalAxis: () => {} },
    '@dnd-kit/sortable': { SortableContext: 'SortableContext', sortableKeyboardCoordinates: () => {}, verticalListSortingStrategy: () => {}, arrayMove: (items, from, to) => { const result = [...items]; result.splice(to, 0, result.splice(from, 1)[0]); return result; } },
    '@/common/components/ui/Dialog/PanelDialog': { PanelDialog: 'PanelDialog' },
    '@/common/components/ui/Dialog/PanelDialog/PanelBody': { PanelBody: 'PanelBody' },
    '@/common/components/ui/Dialog/PanelDialog/PanelHeader': { PanelHeader: 'PanelHeader' },
    '@/common/components/ui/Dialog/PanelDialog/PanelSubmitButton': { PanelSubmitButton: 'PanelSubmitButton' },
    '@/common/components/ui/InfoNotice': { __esModule: true, default: 'InfoNotice' },
  });
  const { SoberSortModal } = load('common/components/features/Sober/SoberSortModal.tsx');
  const base = { initialStartedAt: '2025-01-01', createdAt: '2025-01-01', restarts: [], goalMode: 'AUTO', goalDays: null, isPriority: false };
  const items = [1, 2, 3].map((id) => ({ ...base, id, name: String(id) }));
  const props = { items, isError: false, onRetry() {}, sort: 'DESC', recordSort: 'DESC', priorityFirst: false, customOrder: [], now: Date.now(), onClose() {}, onApply: (...args) => applied.push(args) };
  const render = () => { cursor = 0; return SoberSortModal(props); };
  find(render(), (node) => node.type === 'input' && node.props.type === 'radio' && node.props.checked === false).props.onChange();
  let tree = render();
  find(tree, (node) => node.type === 'DndContext').props.onDragEnd({ active: { id: 1 }, over: { id: 3 } });
  assert.equal(applied.length, 0);
  tree = render();
  const header = find(tree, (node) => node.type === 'PanelHeader');
  assert.equal(header.props.headerRight.props.disabled, false);
  header.props.headerRight.props.onClick();
  assert.deepEqual(applied, [['CUSTOM', false, 'DESC', [2, 3, 1]]]);
});
