const assert = require('node:assert/strict');
const { test } = require('node:test');
const sourceLoader = require('./load-source.cjs');

test('initial custom section scrolls only the modal body and a selection cancels pending scroll', () => {
  const effects = [];
  const frames = [];
  const previous = { window: global.window, requestAnimationFrame: global.requestAnimationFrame, cancelAnimationFrame: global.cancelAnimationFrame };
  global.window = { matchMedia: () => ({ matches: false }) };
  global.requestAnimationFrame = (callback) => { frames.push(callback); return frames.length; };
  global.cancelAnimationFrame = () => {};
  try {
    const load = sourceLoader({ react: { useRef: (value) => ({ current: value }), useCallback: (fn) => fn, useEffect: (fn) => effects.push(fn) } });
    const { useSortSectionScroll } = load('common/hooks/useSortSectionScroll.ts');
    const sections = useSortSectionScroll(true, true);
    const calls = [];
    sections.scrollRef.current = { scrollTop: 20, getBoundingClientRect: () => ({ top: 100 }), scrollTo: (options) => calls.push(options) };
    sections.standardRef.current = { getBoundingClientRect: () => ({ top: 80 }) };
    sections.customRef.current = { getBoundingClientRect: () => ({ top: 500 }) };
    effects[0]();
    frames.shift()();
    assert.deepEqual(calls.shift(), { top: 420, behavior: 'smooth' });
    sections.cancelInitialScroll();
    assert.equal(calls.length, 0);
  } finally {
    global.window = previous.window;
    global.requestAnimationFrame = previous.requestAnimationFrame;
    global.cancelAnimationFrame = previous.cancelAnimationFrame;
  }
});
