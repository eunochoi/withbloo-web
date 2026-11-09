const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');

test('ellipsis follows complete character boundaries while preserving scrolling and parent clicks', () => {
  let markerLeft = null;
  let measure;
  let refIndex = 0;
  const characters = Array.from({ length: 18 }, (_, index) => ({
    getBoundingClientRect: () => ({ right: (index + 1) * 10 - element.scrollLeft }),
  }));
  const element = { scrollWidth: 180, clientWidth: 100, scrollLeft: 0, firstElementChild: { children: characters }, getBoundingClientRect: () => ({ left: 0, right: 100 }), addEventListener: (_, fn) => { measure = fn; }, removeEventListener: () => {} };
  const marker = { getBoundingClientRect: () => ({ width: 15 }) };
  const exports = {};
  const jsx = (type, props) => ({ type, props });
  const code = ts.transpileModule(fs.readFileSync('src/common/components/ui/ScrollableName/index.tsx', 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(code, { exports, document: {}, Intl, require: (id) => {
    if (id === 'react') return { useRef: () => ({ current: refIndex++ % 2 === 0 ? element : marker }), useState: () => [markerLeft, value => { markerLeft = value; }], useEffect: fn => fn() };
    if (id === 'react/jsx-runtime') return { jsx, jsxs: jsx };
    if (id === '@/common/utils/cn') return { cn: (...values) => values.filter(Boolean).join(' ') };
    throw Error(id);
  } });
  exports.default({ name: 'Long name' });
  assert.equal(markerLeft, 80);
  element.scrollLeft = 5;
  measure();
  assert.equal(markerLeft, 85);
  const tree = exports.default({ name: 'Long name' });
  assert.equal(tree.props.onClick, undefined);
  assert.equal(tree.props.children[2].props.children, '…');
  element.scrollLeft = 80;
  measure();
  assert.equal(markerLeft, null);
});
