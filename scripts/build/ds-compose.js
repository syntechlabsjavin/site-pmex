// Replaces groups of generated u-* utility classes with named design-system components.
//
// The components are listed in scripts/build/ds-components.js: each one names the u-* combinations (the u-* part
// of a class attribute, any order) it replaces. Running the script
//   1. rewrites every class attribute in dist/**/*.html and dist/js/*.js whose u-* part equals one of those
//      combinations: the u-* classes go, the component class takes their place, other classes stay;
//   2. writes the CSS of a component that root.css does not define yet into the @layer ds section named by its
//      `group`. The CSS is built from the u-* rules it replaces (or taken from `css` when the spec gives it):
//      declarations merged, Tailwind's --tw-* variables resolved to plain values, media queries and states nested
//      inside the component. From then on the CSS belongs to root.css and is edited there;
//   3. deletes the u-* rules that no page, partial or script uses any more.
//
// Usage: node scripts/build/ds-compose.js [--dry]            apply every component of the spec
//        node scripts/build/ds-compose.js --todo [scope...]   most used u-* combinations left (scope: folder or page)
//        node scripts/build/ds-compose.js --css <u-classes>   print the CSS that a combination compiles to
const fs = require('fs'), path = require('path');

const FILE = 'dist/css/root.css';
const START = '  /* ---- generated utilities', END = '  /* ---- end of generated utilities ---- */';
const args = process.argv.slice(2);
const DRY = args.includes('--dry');

// ---------------------------------------------------------------- files
function files(dir = 'dist', out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!['css', 'img', 'fonts', 'icons'].includes(e.name)) files(p, out); }
    else if (/\.(html|js)$/.test(e.name)) out.push(p);
  }
  return out;
}
// u-* classes that scripts add, remove or look for (u-hidden, u-flex, u-opacity-0 ...) and the classes scripts use to
// find elements. An element a script may own (it has an id, a class a script selects, or its markup is built by a
// script) keeps its u-* classes when one of them is such a state class: the script toggles it.
const STATE = new Set(), SCRIPT_CLASSES = new Set();
for (const f of files()) {
  const t = fs.readFileSync(f, 'utf8');
  for (const m of t.matchAll(/(?:classList\.\w+|querySelector(?:All)?|closest|matches|getElementsByClassName)\(([^)]*)\)/g)) {
    for (const u of m[1].matchAll(/u-[\w-]+/g)) STATE.add(u[0]);
    for (const c of m[1].matchAll(/\.([A-Za-z_][\w-]*)/g)) SCRIPT_CLASSES.add(c[1]);
    if (m[0].startsWith('getElementsByClassName')) for (const c of m[1].matchAll(/[\w-]+/g)) SCRIPT_CLASSES.add(c[0]);
  }
}
const isU = t => t.startsWith('u-');
const TAG = /<[a-zA-Z][^<>]*?\bclass(?:Name)?\s*=\s*(["'])([^"'<>]*?)\1[^<>]*>|(\bclassName\s*=\s*)(["'])([^"'<>]*?)\4/g;
const owned = (tag, toks, isScript) => isScript || /\sid\s*=/.test(tag) || toks.some(t => SCRIPT_CLASSES.has(t));
const locked = (tag, toks, isScript) => toks.some(t => STATE.has(t)) && owned(tag, toks, isScript);

// ---------------------------------------------------------------- CSS of the u-* rules
let css = fs.readFileSync(FILE, 'utf8');
const nl = css.includes('\r\n') ? '\r\n' : '\n';

function parse(text) { // tiny CSS parser: [{sel, decls}] | [{at, children}]
  const out = []; let i = 0;
  const skipWs = () => { while (i < text.length && /\s/.test(text[i])) i++; };
  while (true) {
    skipWs(); if (i >= text.length || text[i] === '}') break;
    let j = i, depth = 0;
    while (j < text.length && !(text[j] === '{' && depth === 0)) { if (text[j] === '(') depth++; if (text[j] === ')') depth--; j++; }
    const head = text.slice(i, j).trim(); i = j + 1;
    if (head.startsWith('@')) { const sub = parseBody(); out.push({ at: head, children: parse(sub) }); }
    else { const body = parseBody(); out.push({ sel: head, decls: decls(body) }); }
  }
  return out;
  function parseBody() { let d = 1, s = i; while (i < text.length && d) { if (text[i] === '{') d++; else if (text[i] === '}') d--; i++; } return text.slice(s, i - 1); }
}
function decls(body) {
  const out = []; let cur = '', depth = 0;
  for (const ch of body) { if (ch === '(') depth++; if (ch === ')') depth--; if (ch === ';' && !depth) { push(); continue; } cur += ch; }
  push(); return out;
  function push() { const t = cur.trim(); cur = ''; if (!t) return; const k = t.indexOf(':'); out.push([t.slice(0, k).trim(), t.slice(k + 1).trim()]); }
}

const genStart = css.indexOf(START), genEnd = css.indexOf(END);
const genLines = css.slice(genStart, genEnd).split(/\r?\n/).slice(1);
const RULES = new Map(); // u-class -> [{media:[...], sel, decls, order}]
genLines.forEach((line, order) => {
  const flat = [];
  (function walk(nodes, media) { for (const n of nodes) { if (n.at) { if (!n.at.startsWith('@supports')) walk(n.children, [...media, n.at]); } else flat.push({ media, sel: n.sel, decls: n.decls }); } })(parse(line), []);
  for (const r of flat) {
    const m = r.sel.match(/\.(u-[\w-]+)/); if (!m) continue;
    const sel = r.sel.replace(new RegExp('\\.' + m[1] + '(?![\\w-])', 'g'), '&');
    if (!RULES.has(m[1])) RULES.set(m[1], []);
    RULES.get(m[1]).push({ media: r.media, sel, decls: r.decls, order });
  }
});

// initial values of the --tw-* variables (@property and the properties-layer fallback)
const DEFAULTS = new Map();
for (const m of css.matchAll(/@property (--tw-[\w-]+)\s*\{[^}]*?initial-value:\s*([^;]+);/g)) DEFAULTS.set(m[1], m[2].trim());
for (const m of css.matchAll(/^\s*(--tw-[\w-]+):\s*([^;]+);/gm)) if (!DEFAULTS.has(m[1])) DEFAULTS.set(m[1], m[2].trim());

function resolve(value, env, depth = 0) { // substitute var(--tw-*) with values from env; null = invalid
  if (depth > 20) return value;
  let out = '', i = 0;
  while (i < value.length) {
    const k = value.indexOf('var(--tw-', i);
    if (k < 0) { out += value.slice(i); break; }
    out += value.slice(i, k);
    let j = k + 4, d = 1; while (j < value.length && d) { if (value[j] === '(') d++; else if (value[j] === ')') d--; j++; }
    const inner = value.slice(k + 4, j - 1); let c = -1, dd = 0;
    for (let q = 0; q < inner.length; q++) { if (inner[q] === '(') dd++; else if (inner[q] === ')') dd--; else if (inner[q] === ',' && !dd) { c = q; break; } }
    const name = (c < 0 ? inner : inner.slice(0, c)).trim(), fallback = c < 0 ? null : inner.slice(c + 1);
    let v = env.has(name) ? env.get(name) : DEFAULTS.get(name);
    if (v === undefined || v === 'initial') { if (fallback === null) return null; v = fallback; }
    const r = resolve(v, env, depth + 1); if (r === null) return null;
    out += r; i = j;
  }
  return out;
}
const tidy = (prop, v) => {
  v = v.replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').replace(/\s+,/g, ',').trim()
    .replace(/calc\(([\d.]+(?:px|rem)) \+ 0px\)/g, '$1')
    .replace(/calc\((\d+) \/ (\d+) \* 100%\)/g, (m, a, b) => +(a / b * 100).toFixed(4) + '%')
    .replace(/^repeat\(1, minmax\(0, 1fr\)\)$/, 'minmax(0, 1fr)').replace(/calc\(infinity \* 1px\)/g, '9999px')
    .replace(/calc\(([\d.]+(?:px|rem|%)) \* calc\(1 - 0\)\)/g, '$1').replace(/calc\([\d.]+(?:px|rem|%) \* 0\)/g, '0');
  if (/box-shadow$/.test(prop)) {
    const parts = splitTop(v).map(s => s.trim()).filter(s => !/^0 0 (#0000|var\(--c-000000-a0\)|transparent)$/.test(s));
    v = parts.length ? parts.join(', ') : '0 0 #0000';
  }
  if (/^(-webkit-)?(backdrop-)?filter$/.test(prop) && !v) v = 'none';
  return v;
};
function splitTop(v) { const out = []; let cur = '', d = 0; for (const ch of v) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && !d) { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out; }

const cond = media => ({
  minw: Math.max(0, ...media.map(m => +((m.match(/min-width:\s*(\d+)px/) || m.match(/width >= (\d+)px/) || [0, 0])[1]))),
  hover: media.some(m => m.includes('(hover: hover)')),
});
function compile(classes, name) {
  const missing = classes.filter(c => !RULES.has(c));
  if (missing.length) throw new Error(`${name}: no rule for ${missing.join(' ')}`);
  // groups keyed by media chain + selector, in the order of the source rules (keeps the cascade)
  const rules = classes.flatMap(c => RULES.get(c)).sort((a, b) => a.order - b.order);
  const groups = new Map();
  for (const r of rules) {
    const key = r.media.join(' ') + ' | ' + r.sel;
    if (!groups.has(key)) groups.set(key, { media: r.media, sel: r.sel, decls: new Map(), order: r.order, ...cond(r.media) });
    for (const [p, v] of r.decls) { groups.get(key).decls.delete(p); groups.get(key).decls.set(p, v); }
  }
  const list = [...groups.values()];
  const applies = (g, k) => g.minw <= k.minw && (!g.hover || k.hover) && (g.sel === '&' || g.sel === k.sel);
  for (const k of list) {
    const env = new Map();
    for (const g of list) if (applies(g, k)) for (const [p, v] of g.decls) if (p.startsWith('--tw-')) env.set(p, v);
    const own = new Set([...k.decls.keys()].filter(p => p.startsWith('--tw-')));
    const out = new Map();
    // a state that only changes a variable (hover:from-*) re-emits the properties that read it
    if (own.size) for (const g of list) if (g !== k && applies(g, k)) for (const [p, v] of g.decls)
      if (!p.startsWith('--tw-') && [...own].some(o => v.includes(o))) out.set(p, v);
    for (const [p, v] of k.decls) if (!p.startsWith('--tw-')) { out.delete(p); out.set(p, v); }
    k.out = [];
    for (const [p, v] of out) { const r = resolve(v, env); if (r !== null) k.out.push([p, tidy(p, r)]); }
  }
  return list.filter(g => g.out.length);
}
function render(name, groups, indent = '  ') {
  // tree: media queries and states nested inside the component, each at-rule printed once
  const root = { decls: [], kids: new Map() };
  for (const g of groups) {
    let node = root;
    for (const step of [...g.media, ...(g.sel === '&' ? [] : [g.sel])]) {
      if (!node.kids.has(step)) node.kids.set(step, { decls: [], kids: new Map() });
      node = node.kids.get(step);
    }
    node.decls.push(...g.out);
  }
  const print = (head, node, pad) => {
    const inner = wrap(pad + '  ', node.decls.map(([p, v]) => p + ': ' + v + ';'));
    for (const [k, kid] of node.kids) inner.push(...print(k, kid, pad + '  '));
    if (inner.length === 1 && (pad + head + ' { ' + inner[0].trim() + ' }').length <= 120) return [pad + head + ' { ' + inner[0].trim() + ' }'];
    return [pad + head + ' {', ...inner, pad + '}'];
  };
  return print('.' + name, root, indent);
}
function wrap(pad, parts) { const out = []; let cur = ''; for (const p of parts) { if (cur && (pad + cur + ' ' + p).length > 120) { out.push(pad + cur); cur = p; } else cur = cur ? cur + ' ' + p : p; } if (cur) out.push(pad + cur); return out; }

// ---------------------------------------------------------------- --css / --todo
if (args[0] === '--css') {
  const cls = args.slice(1).join(' ').split(/\s+/).filter(Boolean);
  console.log(render('component', compile(cls, 'component')).join('\n'));
  process.exit(0);
}
// each class list of the markup: {val, toks, locked}; edit(val) -> new value or null
function eachClassList(file, fn) {
  const isScript = file.endsWith('.js');
  return fs.readFileSync(file, 'utf8').replace(TAG, (all, q1, v1, pre2, q2, v2) => {
    const val = v1 !== undefined ? v1 : v2;
    const toks = val.split(/\s+/).filter(Boolean);
    const next = fn(toks, locked(all, toks, isScript || v2 !== undefined));
    if (next == null) return all;
    return all.replace(val, next);
  });
}
if (args[0] === '--todo') {
  const scope = args.slice(1).filter(a => !a.startsWith('--'));
  const top = +((args.find(a => a.startsWith('--top=')) || '--top=60').split('=')[1]);
  const counts = new Map(); let lockedN = 0;
  for (const f of files()) {
    const rel = f.split(path.sep).join('/');
    if (scope.length && !scope.some(s => rel.includes(s))) continue;
    eachClassList(f, (toks, isLocked) => {
      const u = toks.filter(isU); if (!u.length) return null;
      if (isLocked) { lockedN++; return null; }
      const k = [...u].sort().join(' ');
      if (!counts.has(k)) counts.set(k, { n: 0, pages: new Set(), sample: toks.join(' ') });
      counts.get(k).n++; counts.get(k).pages.add(rel);
      return null;
    });
  }
  const rows = [...counts.entries()].sort((a, b) => b[1].pages.size - a[1].pages.size || b[1].n - a[1].n);
  console.log(`${rows.length} combinations, ${rows.reduce((s, r) => s + r[1].n, 0)} elements (+${lockedN} owned by scripts)`);
  for (const [, v] of rows.slice(0, top)) console.log(String(v.pages.size).padStart(4), String(v.n).padStart(5), v.sample);
  process.exit(0);
}

// ---------------------------------------------------------------- apply
const SPEC = require('./ds-components.js');
const byKey = new Map();
for (const c of SPEC) for (const f of [].concat(c.from || [])) {
  const k = f.split(/\s+/).filter(isU).sort().join(' ');
  if (byKey.has(k) && byKey.get(k) !== c) throw new Error(`combination listed twice: ${k}`);
  byKey.set(k, c);
}

// 1. markup
// The service and platform template pages are restyled by injury-billing-bh / pmex-platform-bh, whose selectors hook on
// the u-* class names (.u-x in :is() lists, [class*=...]); renaming their classes breaks those pages. They are left
// alone until phase 6 replaces those blocks (see docs/DESIGN-SYSTEM-PLAN.md).
const TEMPLATE_PAGE = /data-bh-imported|data-platform-family/;
const used = new Map(); let changedFiles = 0;
for (const f of files()) {
  const src = fs.readFileSync(f, 'utf8');
  if (TEMPLATE_PAGE.test(src)) continue;
  const next = eachClassList(f, (toks, isLocked) => {
    const u = toks.filter(isU); if (!u.length || isLocked) return null;
    const c = byKey.get([...u].sort().join(' ')); if (!c) return null;
    used.set(c.name, (used.get(c.name) || 0) + 1);
    const at = toks.findIndex(isU);
    // `drop`: legacy hook classes whose look the component now carries itself
    const keep = toks.filter(t => !isU(t) && !(c.drop || []).includes(t));
    keep.splice(Math.min(at, keep.length), 0, ...c.name.split(' '));
    return [...new Set(keep)].join(' ');
  });
  if (next !== src) { changedFiles++; if (!DRY) fs.writeFileSync(f, next); }
}

// 2. CSS of new components
let added = 0;
const dsStart = css.search(/^@layer ds\s*\{/m);
for (const c of SPEC) {
  const main = c.define || c.name.split(' ')[0];
  if (new RegExp('\\.' + main + '(?![\\w-])').test(css.slice(dsStart))) continue;
  const source = c.cssFrom || [].concat(c.from)[0];
  const body = c.css ? c.css.replace(/^\n+|\s+$/g, '').split('\n').map(l => '  ' + l) :
    render(main, compile(source.split(/\s+/).filter(t => t.startsWith('u-')), main));
  const lines = [...(c.note ? [`  /* ${c.note} */`] : []), ...body];
  const header = `  /* ---- ${c.group} ---- */`;
  let at = css.indexOf(header, dsStart);
  if (at < 0) { // new section right before the generated utilities (they must stay last: scripts toggle them)
    const gs = css.indexOf(START);
    css = css.slice(0, gs) + header + nl + css.slice(gs); at = css.indexOf(header, dsStart);
  }
  // end of the section: next section header or the end of the layer
  const after = at + header.length;
  const nextHdr = css.slice(after).search(/\r?\n  \/\* ---- /);
  const end = after + nextHdr;
  css = css.slice(0, end) + nl + lines.join(nl) + css.slice(end);
  added++;
}

// 2b. page blocks hook on utilities inside :is() lists (div:is(.rounded-2xl, .u-rounded-2xl) {...}). For a block
// used by a few pages only, a component that replaced such a utility on those pages joins the list, so the
// page keeps its look. Shared blocks (style, reference-typography ...) are not touched: what they gave a
// component is written into the component instead.
const PAGE_BLOCK_MAX = 10;
let hooks = 0;
{
  const pages = files().filter(f => f.endsWith('.html') && !f.includes('partials'));
  const blockPages = new Map(), pageClasses = new Map();
  for (const f of pages) {
    const t = fs.readFileSync(f, 'utf8');
    const m = t.match(/<html[^>]*data-css="([^"]*)"/); if (!m) continue;
    for (const b of m[1].split(/\s+/)) { if (!blockPages.has(b)) blockPages.set(b, []); blockPages.get(b).push(f); }
    const cls = new Set(); for (const a of t.matchAll(/class="([^"]*)"/g)) for (const x of a[1].split(/\s+/)) cls.add(x);
    pageClasses.set(f, cls);
  }
  // components that `drop` a legacy hook class carry their final look (brand fill): page hooks must not restyle them
  const comps = SPEC.filter(c => !c.drop).map(c => ({
    names: c.name.split(' '), sel: '.' + c.name.split(' ').join('.'),
    u: new Set([].concat(c.from || []).flatMap(f => f.split(/\s+/).filter(isU)).map(u => '.' + u)),
  }));
  const end = css.search(/^@layer ds\s*\{/m);
  const head = css.slice(0, end).split(nl).map(line => {
    const blk = (line.match(/\[data-css~="([^"]+)"\]/) || [])[1];
    const pg = blk && blockPages.get(blk);
    if (!pg || pg.length > PAGE_BLOCK_MAX || !line.includes(':is(')) return line;
    const here = comps.filter(c => pg.some(p => c.names.every(n => pageClasses.get(p).has(n))));
    let out = '', i = 0;
    while (true) {
      const k = line.indexOf(':is(', i);
      if (k < 0) { out += line.slice(i); break; }
      let j = k + 4, d = 1, q = null, items = [], from = j;
      for (; j < line.length && d; j++) {
        const ch = line[j];
        if (q) { if (ch === q) q = null; }
        else if (ch === '"' || ch === "'") q = ch;
        else if (ch === '(') d++;
        else if (ch === ')') { if (--d === 0) items.push(line.slice(from, j)); }
        else if (ch === ',' && d === 1) { items.push(line.slice(from, j)); from = j + 1; }
      }
      if (d) { out += line.slice(i); break; }
      items = items.map(s => s.trim());
      const add = [...new Set(here.filter(c => !items.includes(c.sel) && items.some(it => c.u.has(it))).map(c => c.sel))];
      out += line.slice(i, j - 1) + (add.length ? ', ' + add.join(', ') : '') + ')';
      hooks += add.length; i = j;
    }
    return out;
  });
  css = head.join(nl) + css.slice(end);
}

// 3. drop u-* rules nothing uses
const words = new Set();
for (const f of files()) {
  const t = DRY ? null : fs.readFileSync(f, 'utf8');
  for (const m of (t || '').matchAll(/u-[\w-]+/g)) words.add(m[0]);
}
let removed = 0;
if (!DRY) {
  const gs = css.indexOf(START), ge = css.indexOf(END);
  const kept = css.slice(gs, ge).split(nl).filter((l, i) => {
    if (i === 0) return true;
    const m = l.match(/\.(u-[\w-]+)/);
    if (m && !words.has(m[1])) { removed++; return false; }
    return true;
  });
  css = css.slice(0, gs) + kept.join(nl) + css.slice(ge);
  fs.writeFileSync(FILE, css);
}
console.log(`${changedFiles} files rewritten; ${[...used.values()].reduce((a, b) => a + b, 0)} elements -> ${used.size} components; ` +
  `${added} components added to root.css; ${hooks} page-block hooks extended; ${removed} u-* rules removed; root.css ${css.split(nl).length} lines`);
