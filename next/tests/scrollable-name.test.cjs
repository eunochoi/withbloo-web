const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');

test('long names enable scrolling on click while short names preserve their parent action', () => {
  let expanded = false;
  const ref = { current: { scrollWidth: 100, clientWidth: 100 } };
  const exports = {};
  const jsx = (type, props) => ({ type, props });
  const code = ts.transpileModule(fs.readFileSync('src/common/components/ui/ScrollableName/index.tsx', 'utf8'), { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(code, { exports, require: (id) => {
    if (id === 'react') return { useRef: () => ref, useState: () => [expanded, (value) => { expanded = value; }], useEffect: () => {} };
    if (id === 'react/jsx-runtime') return { jsx, jsxs: jsx };
    if (id === '@/common/utils/cn') return { cn: (...values) => values.filter(Boolean).join(' ') };
    throw Error(id);
  } });
  let prevented = 0;
  let stopped = 0;
  const event = { preventDefault: () => prevented++, stopPropagation: () => stopped++ };
  exports.default({ name: 'Short' }).props.onClick(event);
  assert.equal(expanded, false);
  assert.equal(stopped, 0);
  ref.current.scrollWidth = 180;
  exports.default({ name: 'A long habit name' }).props.onClick(event);
  assert.equal(expanded, true);
  assert.equal(prevented, 1);
  assert.equal(stopped, 1);
  assert.match(exports.default({ name: 'A long habit name' }).props.className, /overflow-x-auto/);
  ref.current.scrollLeft = 40;
  exports.default({ name: 'A long habit name' }).props.onClick(event);
  assert.equal(expanded, false);
  assert.equal(ref.current.scrollLeft, 0);
  assert.equal(stopped, 2);
  assert.match(exports.default({ name: 'A long habit name' }).props.className, /truncate/);
});
