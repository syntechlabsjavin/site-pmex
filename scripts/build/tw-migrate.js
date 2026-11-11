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

const todo = new Map(), removed = new Map(); let done = 0, left = 0, changedFiles = 0;
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const next = html.replace(/(<([a-zA-Z][\w-]*)\b[^>]*?\sclass=")([^"]*)(")/g, (all, a, tag, list, z) => {
    const cls = list.split(/\s+/).filter(Boolean), util = cls.filter(c => tw.isUtility(c));
    if (!util.length) return all;
    const key = util.join(' ');
    const mapped = map[key] !== undefined ? map[key] : rules(util);
    if (mapped === null || mapped === undefined) {
      left++;
      if (TODO) { if (!todo.has(key)) todo.set(key, { n: 0, tags: new Set(), pages: new Set(), other: new Set() }); const t = todo.get(key); t.n++; t.tags.add(tag); t.pages.add(path.basename(f)); cls.filter(c => !tw.isUtility(c)).forEach(c => t.other.add(c)); }
      return all;
    }
    done++;
    for (const u of util) {
      if (!removed.has(u)) removed.set(u, new Set());
      // a mapped list stands for all its new classes at once (compound selector), a rule list per utility
      const c = map[key] !== undefined ? map[key].trim().split(/\s+/).filter(Boolean).join('.') : rules.classFor(u, util);
      if (c) removed.get(u).add(c);
    }
    const out = [...cls.filter(c => !tw.isUtility(c)), ...mapped.split(/\s+/).filter(Boolean)];
    return a + [...new Set(out)].join(' ') + z;
  }).replace(/\sclass=""/g, '');
  if (next !== html) { changedFiles++; if (!DRY && !TODO) fs.writeFileSync(f, next); }
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
