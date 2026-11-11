// Replaces Tailwind utility combinations in the pages with design-system classes.
//
// The mapping lives in scripts/build/tw-map.json: { "<utility classes, in page order>": "new classes" }.
// A class attribute is migrated when its Tailwind utilities, in order, equal a key; its other classes are kept and
// the new classes are added. Mapping is exact on purpose: the CSS for each new class is written by hand in the
// design-system blocks of root.css (use --css to get a starting point).
//
// Usage:
//   node scripts/build/tw-migrate.js                  apply the map to every page and partial
//   node scripts/build/tw-migrate.js --dry            only count
//   node scripts/build/tw-migrate.js --todo[=40]      list the most used combinations not migrated yet, with context
//   node scripts/build/tw-migrate.js --css "<classes>" [selector]   print plain CSS for a utility combination
const fs = require('fs'), path = require('path');
const tw = require('../lib/tailwind');
const rules = require('./tw-rules');
const { pageFiles } = require('../lib/pages');
const MAP_FILE = path.join(__dirname, 'tw-map.json');
const args = process.argv.slice(2);

if (args[0] === '--css') {
  console.log(tw.clean(tw.compile(args[1].split(/\s+/), args[2] || '.x')));
  process.exit(0);
}

const map = fs.existsSync(MAP_FILE) ? JSON.parse(fs.readFileSync(MAP_FILE, 'utf8')) : {};
const files = [...pageFiles(), ...fs.readdirSync('dist/partials').map(f => path.join('dist/partials', f))];
const DRY = args.includes('--dry'), TODO = args.find(a => a.startsWith('--todo'));

// --fallback: every utility not covered by the map or the rules becomes its own u-* class. Its CSS is generated
// from the Tailwind rule (exact values, --tw-* plumbing kept) into the generated section of the ds layer, in
// Tailwind's own order so that overrides such as "p-4 pt-0" keep working. scripts/build/tw-utils.json keeps
// the name -> utility registry; the section is rebuilt from the classes the pages use.
const FALLBACK = args.includes('--fallback');
const REG_FILE = path.join(__dirname, 'tw-utils.json');
const registry = fs.existsSync(REG_FILE) ? JSON.parse(fs.readFileSync(REG_FILE, 'utf8')) : {};
const byUtil = new Map(Object.entries(registry).map(([n, u]) => [u, n]));
const VARIANT = { hover: 'hov', focus: 'foc', 'focus-visible': 'fv', 'focus-within': 'fw', active: 'act', 'group-hover': 'gh', first: 'first', last: 'last', placeholder: 'ph', disabled: 'dis', before: 'bef', after: 'aft' };
function slug(u) {
  if (byUtil.has(u)) return byUtil.get(u);
  const parts = u.split(/:(?![^\[]*\])/);
  const base = parts.pop();
  let b = base.replace(/^!/, 'imp-').replace(/^-/, 'n').replace(/\[-/g, '[n')
    .replace(/var\(--c-([0-9A-Fa-f]{6})(-a[\d_]+)?\)/g, '$1$2')
    .replace(/(^|-)(\d+)\/(\d+)$/, (a, p, x, y) => +x < +y && +y <= 12 ? p + Math.round(x / y * 1000) / 10 + 'pct' : a)
    .replace(/\/(\d+)$/, '-a$1')
    .replace(/%/g, 'pct').replace(/[^\w-]+/g, '-').replace(/_/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (b.length > 28) b = b.slice(0, 18) + '-' + require('crypto').createHash('md5').update(base).digest('hex').slice(0, 6);
  const pre = parts.map(p => VARIANT[p] || p.replace(/[^\w]+/g, '')).join('-');
  let name = 'u-' + (pre ? pre + '-' : '') + b;
  if (registry[name] && registry[name] !== u) name += '-' + require('crypto').createHash('md5').update(u).digest('hex').slice(0, 4);
  registry[name] = u; byUtil.set(u, name);
  return name;
}

const todo = new Map(), removed = new Map(); let done = 0, left = 0, changedFiles = 0;
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const next = html.replace(/(<([a-zA-Z][\w-]*)\b[^>]*?\sclass=")([^"]*)(")/g, (all, a, tag, list, z) => {
    const cls = list.split(/\s+/).filter(Boolean), util = cls.filter(c => tw.isUtility(c));
    if (!util.length) return all;
    const key = util.join(' ');
    let mapped = map[key] !== undefined ? map[key] : rules(util), viaFallback = false;
    if ((mapped === null || mapped === undefined) && FALLBACK) { mapped = util.map(slug).join(' '); viaFallback = true; }
    if (mapped === null || mapped === undefined) {
      left++;
      if (TODO) { if (!todo.has(key)) todo.set(key, { n: 0, tags: new Set(), pages: new Set(), other: new Set() }); const t = todo.get(key); t.n++; t.tags.add(tag); t.pages.add(path.basename(f)); cls.filter(c => !tw.isUtility(c)).forEach(c => t.other.add(c)); }
      return all;
    }
    done++;
    for (const u of util) {
      if (!removed.has(u)) removed.set(u, new Set());
      // a mapped list stands for all its new classes at once (compound selector), a rule list per utility
      const c = viaFallback ? slug(u) : map[key] !== undefined ? map[key].trim().split(/\s+/).filter(Boolean).join('.') : rules.classFor(u, util);
      if (c) removed.get(u).add(c);
    }
    const out = [...cls.filter(c => !tw.isUtility(c)), ...mapped.split(/\s+/).filter(Boolean)];
    return a + [...new Set(out)].join(' ') + z;
  }).replace(/\sclass=""/g, '');
  if (next !== html) { changedFiles++; if (!DRY && !TODO) fs.writeFileSync(f, next); }
}

// --js (with --fallback): Tailwind classes that scripts add, remove or test become their u-* names too.
// Only class contexts are touched: classList.*(...) arguments, className values, class="..." inside strings,
// and string literals or arrays made only of utilities (at least one with a dash), e.g. 'opacity-0 translate-y-5'.
if (FALLBACK && args.includes('--js') && !DRY && !TODO) {
  const swap = list => list.replace(/[^\s]+/g, t => tw.isUtility(t) ? slug(t) : t);
  const allUtil = s => { const t = s.trim().split(/\s+/).filter(Boolean); return t.length && t.every(x => tw.isUtility(x)) && t.some(x => /[-:\[]/.test(x)); };
  const STR = /(['"`])((?:\\.|(?!\1)[^\\\n])*)\1/g;
  const fixCode = code => code
    .replace(/(classList\.(?:add|remove|toggle|contains|replace)\s*\()([^)]*)\)/g, (a, h, inner) => h + inner.replace(STR, (s, q, v) => q + swap(v) + q) + ')')
    .replace(/(className\s*(?:\+?=|:)\s*)(['"`])((?:\\.|(?!\2)[^\\])*)\2/g, (a, h, q, v) => h + q + swap(v) + q)
    .replace(/class=\\?"([^"\\]*)\\?"/g, (a, v) => a.replace(v, swap(v)))
    .replace(STR, (s, q, v) => allUtil(v) ? q + swap(v) + q : s);
  let jsFiles = 0;
  for (const f of fs.readdirSync('dist/js').filter(x => x.endsWith('.js')).map(x => path.join('dist/js', x))) {
    const src = fs.readFileSync(f, 'utf8'), out = fixCode(src);
    if (out !== src) { jsFiles++; fs.writeFileSync(f, out); }
  }
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    const out = src.replace(/(<script(?![^>]*\bsrc=)[^>]*>)([\s\S]*?)(<\/script>)/g, (a, o, code, c) => o + fixCode(code) + c);
    if (out !== src) { jsFiles++; fs.writeFileSync(f, out); }
  }
  console.log(`scripts updated: ${jsFiles} files`);
}

if (TODO) {
  const n = Number(TODO.split('=')[1] || 40);
  for (const [k, t] of [...todo].sort((a, b) => b[1].n - a[1].n).slice(0, n))
    console.log(`${t.n}x <${[...t.tags].join('|')}> ${t.pages.size}p ${t.other.size ? '[' + [...t.other].slice(0, 4).join(' ') + '] ' : ''}${k}`);
}
console.log(`migrated elements: ${done}, Tailwind elements left: ${left}, files ${DRY || TODO ? 'to change' : 'changed'}: ${changedFiles}`);

// CSS selectors outside the Tailwind block that still point at a migrated utility also match its new class:
//   .uppercase              -> :is(.uppercase, .t-caps)
//   [class*="text-center"]  -> :is([class*="text-center"], .ta-center)
if (!DRY && !TODO && removed.size) {
  const CSS = path.join(__dirname, '../../dist/css/root.css');
  const css = fs.readFileSync(CSS, 'utf8');
  const s = css.indexOf('[data-css~="tailwind"] ====='), e = css.indexOf('\n/* ===== ', s + 10);
  const esc = n => n.replace(/[^\w-]/g, ch => '\\' + ch);
  const extra = cs => [...cs].filter(Boolean).map(c => '.' + c.trim().split(/[\s.]+/).join('.'));
  let hooks = 0;
  const rewrite = text => text
    .replace(/(?<!:is\()\.((?:\\.|[\w-])+)(?![\w\\-])/g, (all, name) => {
      const u = name.replace(/\\(.)/g, '$1'), cs = removed.get(u);
      if (!cs || !cs.size) return all;
      hooks++; return `:is(${all}, ${extra(cs).join(', ')})`;
    })
    .replace(/(?<!:is\()\[class([*~])="([^"]+)"\]/g, (all, op, sub) => {
      const cs = new Set();
      for (const [u, set] of removed) if (op === '~' ? u === sub : u.includes(sub)) set.forEach(c => cs.add(c));
      if (!cs.size) return all;
      hooks++; return `:is(${all}, ${extra(cs).join(', ')})`;
    });
  // only selectors: rewrite the text in front of each "{"
  const fix = part => part.replace(/([^{}]+)(\{)/g, (all, sel, b) => (/^\s*@/.test(sel) ? sel : rewrite(sel)) + b);
  fs.writeFileSync(CSS, fix(css.slice(0, s)) + css.slice(s, e) + fix(css.slice(e)));
  console.log(`CSS selectors that pointed at migrated utilities: ${hooks} now also match the new classes`);
}

// Generated utilities: rebuilt from every u-* class the pages use, in Tailwind's order, inside the ds layer.
// The Tailwind block was removed on 2026-11-11: the generated section is now plain, owned CSS and is not rebuilt.
if (FALLBACK && !DRY && !TODO && tw.load().rules.size === 0) console.log('Tailwind block is gone: generated utilities are kept as they are');
else if (FALLBACK && !DRY && !TODO) {
  const sorted = Object.fromEntries(Object.entries(registry).sort((a, b) => a[0].localeCompare(b[0])));
  fs.writeFileSync(REG_FILE, JSON.stringify(sorted, null, 1) + '\n');
  const used = new Set();
  for (const f of files) for (const m of fs.readFileSync(f, 'utf8').matchAll(/class="([^"]*)"/g)) m[1].split(/\s+/).forEach(c => registry[c] && used.add(c));
  for (const f of fs.readdirSync('dist/js')) for (const m of fs.readFileSync(path.join('dist/js', f), 'utf8').matchAll(/\bu-[\w-]+/g)) if (registry[m[0]]) used.add(m[0]);
  const index = new Map([...tw.load().rules.keys()].map((u, i) => [u, i]));
  const body = [...used].sort((a, b) => index.get(registry[a]) - index.get(registry[b]))
    // one line per rule: machine-written, read by name
    .map(n => tw.clean(tw.compile([registry[n]], '.' + n), { keepTw: true }).trim().replace(/\s*\n\s*/g, ' ')).filter(Boolean).join('\n')
    .replace(/^/gm, '  ');
  const START = '  /* ---- generated utilities (node scripts/build/tw-migrate.js --fallback): do not edit by hand ---- */';
  const END = '  /* ---- end of generated utilities ---- */';
  const CSS = path.join(__dirname, '../../dist/css/root.css');
  let css = fs.readFileSync(CSS, 'utf8');
  const block = `${START}\n${body}\n${END}`;
  if (css.includes(START)) css = css.slice(0, css.indexOf(START)) + block + css.slice(css.indexOf(END) + END.length);
  else { const i = css.lastIndexOf('}'); css = css.slice(0, i) + block + '\n' + css.slice(i); }
  fs.writeFileSync(CSS, css);
  console.log(`generated utilities: ${used.size} classes, ${body.split('\n').length} lines`);
}
