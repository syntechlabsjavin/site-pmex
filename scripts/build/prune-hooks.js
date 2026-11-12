// Shortens the :is() / :where() / :not() selector lists of the older blocks of dist/css/root.css without changing
// what they match:
//   - an item ".x" is dropped when the same list has [class*="y"] and "x" contains "y" (the attribute test
//     already matches every element that has class x);
//   - an item made of classes is dropped when one of its classes appears nowhere in the pages, partials or
//     scripts (it cannot match), unless that would empty the list.
// Usage: node scripts/build/prune-hooks.js [--dry]
const fs = require('fs'), path = require('path');
const FILE = 'dist/css/root.css';
const DRY = process.argv.includes('--dry');
let css = fs.readFileSync(FILE, 'utf8');
const end = css.search(/^@layer ds\s*\{/m);

// every word that can be a class: class/id attributes of pages and partials, string literals of scripts
const words = new Set();
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!['css', 'img', 'fonts', 'icons'].includes(e.name)) walk(p); continue; }
    if (!/\.(html|js)$/.test(e.name)) continue;
    const t = fs.readFileSync(p, 'utf8');
    for (const m of t.matchAll(/\b(?:class|className)\s*[=:]\s*["'`]([^"'`]*)["'`]/g)) m[1].split(/\s+/).forEach(w => w && words.add(w));
    // scripts: any word-like token (classList.add('x'), template markup, selectors)
    if (e.name.endsWith('.js') || /<script/.test(t)) for (const m of t.matchAll(/[A-Za-z_][\w-]*/g)) words.add(m[0]);
  }
})('dist');

// split "a, b, c" at top level, quote aware
function splitTop(s) {
  const out = []; let cur = '', q = null, d = 0;
  for (const ch of s) {
    if (q) { cur += ch; if (ch === q) q = null; continue; }
    if (ch === '"' || ch === "'") q = ch;
    else if (ch === '(' || ch === '[') d++;
    else if (ch === ')' || ch === ']') d--;
    else if (ch === ',' && !d) { out.push(cur); cur = ''; continue; }
    cur += ch;
  }
  out.push(cur);
  return out.map(x => x.trim());
}
let dropped = 0;
function pruneList(inner) {
  const items = splitTop(inner);
  const subs = items.map(it => (it.match(/^\[class\*=(["'])([^"']*)\1\]$/) || [])[2]).filter(Boolean);
  const keep = items.filter(it => {
    if (!/^(\.[\w-]+)+$/.test(it)) return true; // only plain class items are judged
    const cls = it.slice(1).split('.');
    if (cls.length === 1 && subs.some(sb => cls[0].includes(sb))) return false;
    if (cls.some(c => !words.has(c))) return false;
    return true;
  });
  if (!keep.length) return inner;
  dropped += items.length - keep.length;
  return keep.join(', ');
}
// rewrite every :is( :where( :not( list, innermost first
function rewrite(text) {
  let out = '', i = 0;
  while (true) {
    const m = /:(is|where|not)\(/g; m.lastIndex = i;
    const r = m.exec(text);
    if (!r) { out += text.slice(i); break; }
    const open = r.index + r[0].length;
    let j = open, d = 1, q = null;
    for (; j < text.length && d; j++) {
      const ch = text[j];
      if (q) { if (ch === q) q = null; continue; }
      if (ch === '"' || ch === "'") q = ch; else if (ch === '(') d++; else if (ch === ')') d--;
    }
    if (d) { out += text.slice(i); break; }
    const inner = rewrite(text.slice(open, j - 1));
    out += text.slice(i, open) + pruneList(inner) + ')';
    i = j;
  }
  return out;
}
// only selector parts (before "{") of each line
const head = css.slice(0, end).split('\n').map(line => {
  const k = line.indexOf('{');
  if (k < 0 || !/:(is|where|not)\(/.test(line.slice(0, k))) return line;
  return rewrite(line.slice(0, k)) + line.slice(k);
}).join('\n');
const next = head + css.slice(end);
console.log(`list items dropped: ${dropped}; root.css ${(css.length / 1024).toFixed(0)} KB -> ${(next.length / 1024).toFixed(0)} KB`);
if (!DRY) fs.writeFileSync(FILE, next);
