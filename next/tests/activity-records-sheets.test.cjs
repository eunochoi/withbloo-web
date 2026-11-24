const test = require('node:test');
const assert = require('node:assert/strict');
const loadSource = require('./load-source.cjs');

function scenario(view) {
  const slots = [];
  const requests = [];
  let cursor = 0;
  const jsx = (type, props) => ({ type, props: props ?? {} });
  const mocks = {
    react: {
      useState: (initial) => {
        const index = cursor++;
        if (!(index in slots)) slots[index] = initial;
        return [slots[index], (value) => { slots[index] = value; }];
      },
      useRef: (initial) => ({ current: initial }),
    },
    'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'Fragment' },
    '@tanstack/react-query': {
      useQueryClient: () => ({ invalidateQueries: async () => {} }),
      useQuery: () => ({ data: [], isPending: false }),
      useInfiniteQuery: () => ({ data: { pages: [{ items: [] }] }, isPending: false }),
    },
    '@/common/actions/records': {},
    '@/common/auth/authAction': {},
    '@/common/components/ui/ContentTopButton': { ContentTopButton: 'ContentTopButton', ContentTopButtons: 'ContentTopButtons' },
    '@/common/components/ui/BottomSheet/BottomSheet': { BottomSheet: 'BottomSheet' },
    '@/common/components/ui/BottomSheet/BottomSheetBody': { BottomSheetBody: 'BottomSheetBody' },
    '@/common/components/ui/BottomSheet/BottomSheetHeading': { BottomSheetHeading: 'BottomSheetHeading' },
    '@/common/components/ui/BottomSheet/BottomSheetPicker': { BottomSheetPicker: 'BottomSheetPicker' },
    '@/common/components/ui/BottomSheet/BottomSheetTitle': { BottomSheetTitle: 'BottomSheetTitle' },
    '@/common/components/ui/ImageAttachments/uploadImagesAndCollectIds': {},
    '@/common/components/ui/SortPicker': { default: 'SortPicker' },
    '@/common/constants/appIcons': { AddIcon: 'AddIcon', MoreIcon: 'MoreIcon', SortIcon: 'SortIcon' },
    'react-icons/pi': { PiClockCounterClockwise: 'Clock' },
    '../DiaryDetail/DiaryDetailGallery': { DiaryDetailGallery: 'Gallery' },
    './ActivityRecordActions': { __esModule: true, default: 'ActivityRecordActions' },
    './ActivityRecordForm': { __esModule: true, default: 'ActivityRecordForm' },
  };
  const Component = loadSource(mocks)('common/components/features/ActivityRecords/ActivityRecordListModal.tsx').default;
  const render = () => { cursor = 0; return Component({ scope: 'sober', parentId: 1, name: '커피', day: view.mode === 'day' ? view.date : null, onOpenForm: (record, day) => requests.push({ record, day }), onClose() {} }); };
  return { render, requests };
}

function nodes(node) {
  if (!node || typeof node !== 'object') return [];
  if (Array.isArray(node)) return node.flatMap(nodes);
  return [node, ...nodes(node.props?.children)];
}

test('list requests a regular form without removing its sheet', () => {
  const ui = scenario({ mode: 'list' });
  const before = ui.render();
  const sheet = nodes(before).find((node) => node.type === 'BottomSheet');
  const add = nodes(before).find((node) => node.type === 'ContentTopButton');
  add.props.onClick();
  assert.equal(ui.requests[0].record.type, 'MEMO');
  assert.equal(ui.requests[0].day, null);
  assert(nodes(ui.render()).some((node) => node.type === sheet.type));
});

test('day list requests a restart form for the selected day', () => {
  const ui = scenario({ mode: 'day', date: '2024-01-10' });
  nodes(ui.render()).find((node) => node.type === 'ContentTopButton').props.onClick();
  assert.equal(ui.requests[0].record.type, 'RESTART');
  assert.equal(ui.requests[0].day, '2024-01-10');
});
