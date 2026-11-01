const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const ts = require('typescript');

// Compile the actual TS source in memory, replacing only environment boundaries.
module.exports = function sourceLoader(mocks = {}) {
  const root = path.resolve(__dirname, '../src');
  const cache = new Map();
  function load(filename) {
    if (Object.hasOwn(mocks, filename)) return mocks[filename];
    if (!filename.startsWith(`${root}${path.sep}`)) throw new Error(`Unmocked environment dependency: ${filename}`);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} };
    cache.set(filename, module);
    const localRequire = createRequire(filename);
    const requireSource = (specifier) => {
      if (Object.hasOwn(mocks, specifier)) return mocks[specifier];
      if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return localRequire(specifier);
      const base = specifier.startsWith('@/') ? path.join(root, specifier.slice(2)) : path.resolve(path.dirname(filename), specifier);
      const resolved = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`].find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
      if (!resolved) throw new Error(`Cannot resolve ${specifier} from ${filename}`);
      return load(resolved);
    };
    const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
      fileName: filename,
    }).outputText;
    new Function('require', 'module', 'exports', output)(requireSource, module, module.exports);
    return module.exports;
  }
  return (relative) => load(path.join(root, relative));
};
