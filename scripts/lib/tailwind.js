// Reads the frozen Tailwind block of dist/css/root.css and turns utility class lists into plain CSS.
// Used by the migration scripts: a repeated class combination becomes one component rule.
//
//   const tw = require('./tailwind');
//   tw.isUtility('px-5')                       -> true
//   tw.compile(['px-5', 'sm:px-8', 'hover:bg-[var(--c-F8FBF0)]'], '.faq-q')  -> CSS text
const fs = require('fs'), path = require('path');
const FILE = path.join(__dirname, '../../dist/css/root.css');

let cache = null;
function load() {
  if (cache) return cache;
  const css = fs.readFileSync(FILE, 'utf8');
  const s = css.indexOf('[data-css~="tailwind"] =====');
  const e = css.indexOf('\n/* ===== ', s + 10);
  const block = s < 0 ? '' : css.slice(s, e < 0 ? css.length : e);
  const rules = new Map(); // class -> [{ conds: [..], decls: [..] }]
  const strip = t => t.replace(/\/\*[\s\S]*?\*\//g, '');
  // walk nested CSS; conds collects @media/@supports and &:state preludes
  function walk(text, conds, owner) {
    let i = 0;
    while (i < text.length) {
      const open = text.indexOf('{', i), semi = text.indexOf(';', i);
      if (open < 0 || (semi >= 0 && semi < open)) {
        if (semi < 0) break;
        const d = text.slice(i, semi).trim();
        if (d && owner) add(owner, conds, d);
        i = semi + 1; continue;
      }
      const prelude = text.slice(i, open).trim().replace(/\s+/g, ' ');
      let depth = 1, j = open + 1;
      for (; j < text.length && depth; j++) { if (text[j] === '{') depth++; else if (text[j] === '}') depth--; }
      const body = text.slice(open + 1, j - 1);
      const m = prelude.match(/^\[data-css~="tailwind"\] \.((?:\\.|[\w-])+)((?::[\w-]+(?:\([^)]*\))?)*)$/);
      if (m) walk(body, m[2] ? [...conds, '&' + m[2]] : conds, m[1].replace(/\\(.)/g, '$1'));
      else if (owner) walk(body, [...conds, prelude], owner);
      else if (/^@(layer|media|supports)/.test(prelude)) walk(body, conds, null);
      i = j;
    }
  }
  function add(cls, conds, decl) {
    if (!rules.has(cls)) rules.set(cls, []);
    const list = rules.get(cls), key = conds.join(' | ');
    let r = list.find(x => x.key === key);
    if (!r) { r = { key, conds, decls: [] }; list.push(r); }
    r.decls.push(decl);
  }
  walk(strip(block), [], null);
  return (cache = { rules, block });
}

const isUtility = cls => load().rules.has(cls);

// Breakpoints of the frozen build, smallest first (Tailwind v4 uses width >= X rem).
const BP = { '40rem': 'sm', '48rem': 'md', '64rem': 'lg', '80rem': 'xl', '96rem': '2xl' };

// Group the declarations of all classes by condition and print them as CSS for `selector`.
// Classes that are not utilities are ignored. `--tw-*` helper variables are kept only when used.
function compile(classes, selector) {
  const { rules } = load();
  const groups = new Map();
  for (const c of classes) for (const r of rules.get(c) || []) {
    if (!groups.has(r.key)) groups.set(r.key, { conds: r.conds, decls: [] });
    groups.get(r.key).decls.push(...r.decls);
  }
  const order = k => { const m = k.match(/width >= ([\d.]+rem)/); return (m ? parseFloat(m[1]) : 0) * 10 + (k.includes('&') ? 1 : 0); };
  let out = '';
  for (const [key, g] of [...groups].sort((a, b) => order(a[0]) - order(b[0]))) {
    let sel = selector, wrap = [];
    for (const c of g.conds) { if (c.startsWith('&')) sel += c.slice(1); else wrap.push(c); }
    const decls = [...new Map(g.decls.map(d => [d.slice(0, d.indexOf(':')).trim(), d])).values()];
    let inner = `${sel} {\n${decls.map(d => '  ' + d + ';').join('\n')}\n}`;
    for (const w of wrap.reverse()) inner = `${w} {\n${inner.replace(/^/gm, '  ')}\n}`;
    out += inner + '\n';
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------
// clean(): turns compiled Tailwind CSS into plain CSS
//   --tw-* helper variables are resolved (from the same rule, the base rule and @property initial values),
//   Tailwind theme variables become values, legacy --c-HEX colors become --theme-* where they are equal.
let env = null;
function themeEnv() {
  if (env) return env;
  const { block } = load(), css = fs.readFileSync(FILE, 'utf8');
  env = { props: {}, theme: {}, colors: {} };
  for (const m of css.matchAll(/@property (--tw-[\w-]+)\s*\{[^}]*?initial-value:\s*([^;]*);/g)) env.props[m[1]] = m[2].trim();
  const th = block.slice(block.indexOf('@layer theme'), block.indexOf('@layer base'));
  for (const m of th.matchAll(/(--[\w-]+):\s*([^;]+);/g)) env.theme[m[1]] = m[2].trim().replace(/\s+/g, ' ');
  for (const m of css.matchAll(/^\s*--c-([0-9A-F]{6}(?:-a[\d_]+)?):\s*var\((--theme-[\w-]+)\);/gm)) env.colors['--c-' + m[1]] = m[2];
  return env;
}

// replace var(--name, fallback) using lookup(name) -> value | undefined
function subst(value, lookup) {
  for (let guard = 0; guard < 20; guard++) {
    let changed = false;
    value = value.replace(/var\((--[\w-]+)\s*(?:,((?:[^()]|\([^()]*(?:\([^()]*\))*[^()]*\))*))?\)/g, (all, name, fb) => {
      const v = lookup(name);
      if (v !== undefined) { changed = true; return v; }
      if (name.startsWith('--tw-')) { changed = true; return fb !== undefined ? fb.trim() : ''; }
      return all;
    });
    if (!changed) break;
  }
  return value;
}
const num = n => +(+n).toFixed(4);
function tidy(prop, v) {
  v = v.replace(/calc\(0\.25rem \* (-?[\d.]+)\)/g, (a, n) => n == 0 ? '0' : num(n * 0.25) + 'rem')
    .replace(/calc\((-?[\d.]+) \/ (-?[\d.]+)\)/g, (a, x, y) => String(num(x / y)))
    .replace(/calc\(infinity \* 1px\)/g, 'var(--radius-full)')
    .replace(/color-mix\(in oklab, (var\(--[\w-]+\)) ([\d.]+)%, transparent\)/g, 'rgb(from $1 r g b / $2%)')
    .replace(/,\s*,/g, ',').replace(/\s{2,}/g, ' ').trim();
  if (prop === 'filter' || prop === 'backdrop-filter' || prop === '-webkit-backdrop-filter') v = v.replace(/\s+/g, ' ').trim() || 'none';
  if (prop === 'box-shadow') v = v.split(/,(?![^(]*\))/).map(s => s.trim()).filter(s => s && !/^0 0 (#0000|transparent)$/.test(s)).join(', ') || 'none';
  if (prop === 'scale' || prop === 'translate' || prop === 'rotate') v = v.replace(/\s+/g, ' ');
  return v;
}
function clean(css) {
  const E = themeEnv();
  // per rule body: collect --tw vars of this body (and of the base rule for hover/focus/media copies)
  const baseVars = new Map();
  return css.replace(/([^{}\n][^{}]*)\{([^{}]*)\}/g, (all, sel, body) => {
    const decls = body.split(';').map(d => d.trim()).filter(Boolean).map(d => [d.slice(0, d.indexOf(':')).trim(), d.slice(d.indexOf(':') + 1).trim()]);
    const s = sel.trim(), base = s.replace(/:[\w-]+(\([^)]*\))?/g, '');
    const local = new Map(decls.filter(([p]) => p.startsWith('--tw-')));
    if (s === base) baseVars.set(base, local);
    const vars = new Map([...(baseVars.get(base) || []), ...local]);
    const lookup = name => vars.has(name) ? vars.get(name) : name.startsWith('--tw-') ? E.props[name] : E.theme[name] !== undefined && !name.startsWith('--color-') ? E.theme[name] : E.colors[name] ? `var(${E.colors[name]})` : name === '--color-white' ? 'var(--theme-white)' : name === '--color-black' ? 'var(--theme-black)' : undefined;
    const out = [];
    for (const [p, v] of decls) {
      if (p.startsWith('--tw-')) continue;
      out.push([p, tidy(p, subst(v, lookup))]);
    }
    // transition shorthand
    const tp = out.find(d => d[0] === 'transition-property');
    if (tp) {
      const dur = (out.find(d => d[0] === 'transition-duration') || [, '150ms'])[1], ease = (out.find(d => d[0] === 'transition-timing-function') || [, 'ease'])[1];
      const props = tp[1] === 'all' ? ['all'] : tp[1].split(',').map(x => x.trim()).filter(x => !x.startsWith('--'));
      for (const k of ['transition-property', 'transition-duration', 'transition-timing-function']) { const i = out.findIndex(d => d[0] === k); if (i >= 0) out.splice(i, 1); }
      const e = { 'cubic-bezier(0.4, 0, 0.2, 1)': 'var(--ease)', 'cubic-bezier(0, 0, 0.2, 1)': 'ease-out', 'cubic-bezier(0.4, 0, 1, 1)': 'ease-in' }[ease] || ease;
      out.push(['transition', `${props.length > 1 ? props.filter(x => !['outline-color', 'text-decoration-color', 'fill', 'stroke'].includes(x)).join(', ') : props[0]} ${dur} ${e}`.replace(/^(.*,.*) (\S+) (\S+)$/, (a, list, d, t) => list.split(', ').map(x => `${x} ${d} ${t}`).join(', '))]);
    }
    if (!out.length) return '';
    const ind = (sel.match(/^\s*/) || [''])[0].replace(/\n/g, '');
    return `${sel}{\n${out.map(([p, v]) => `${ind}  ${p}: ${v};`).join('\n')}\n${ind}}`;
  }).replace(/@media \(width >= ([\d.]+)rem\)/g, (a, r) => `@media (min-width: ${r * 16}px)`)
    .replace(/@media \(width < ([\d.]+)rem\)/g, (a, r) => `@media (max-width: ${r * 16 - 0.02}px)`)
    .replace(/^[^\S\n]*@media[^{]*\{\s*\}\n?/gm, '');
}

module.exports = { load, isUtility, compile, clean, BP };
