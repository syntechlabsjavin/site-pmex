// Removes rules of dist/css/root.css that can never match.
// A rule is removed only when both are true:
//   1. css-coverage.js saw it unused on every page at every width (.regression/css-coverage.json), and
//   2. each of its selectors names a class or id that appears nowhere in the pages, partials or scripts
//      (so a hidden modal, a closed menu or a script-added state cannot need it).
// Usage: node scripts/checks/css-coverage.js && node scripts/build/remove-dead-css.js [--dry]
const fs = require('fs'), path = require('path');
const DRY = process.argv.includes('--dry');
const FILE = 'dist/css/root.css';
const cov = JSON.parse(fs.readFileSync('.regression/css-coverage.json', 'utf8'));
let css = fs.readFileSync(FILE, 'utf8');

// every token that could be a class or id in markup or scripts
const text = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (e.name !== 'css') walk(p); } else if (/\.(html|js)$/.test(e.name)) text.push(fs.readFileSync(p, 'utf8')); } })('dist');
// names in class/id attributes, and every word inside string literals of scripts (classList, querySelector, markup)
const words = new Set();
const WORD = /(?<![\w-])[A-Za-z_][\w-]*/g; // not the tail of a custom property such as --c-505050
for (const t of text) {
  for (const m of t.matchAll(/\s(?:class|id|for|data-[\w-]+)="([^"]*)"/g)) m[1].split(/\s+/).forEach(w => w && words.add(w));
  for (const block of t.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) for (const s of block[1].matchAll(/(['"`])((?:\\.|(?!\1)[^\\])*)\1/g)) (s[2].match(WORD) || []).forEach(w => words.add(w));
}
for (const f of fs.readdirSync('dist/js')) for (const s of fs.readFileSync(path.join('dist/js', f), 'utf8').matchAll(/(['"`])((?:\\.|(?!\1)[^\\])*)\1/g)) (s[2].match(WORD) || []).forEach(w => words.add(w));
const exists = name => words.has(name);

// a selector can match only if every class and id it requires exists; :not(...) and :is/:where alternatives are optional
function canMatch(sel) {
  // drop optional parts from the innermost outwards (they nest: :has(>:is(...):is(...)))
  let required = sel.replace(/\[[^\]]*\]/g, ''), prev;
  do { prev = required; required = required.replace(/:(not|is|where|has)\([^()]*\)/g, ''); } while (required !== prev);
  for (const m of required.matchAll(/[.#]((?:\\.|[\w-])+)/g)) { const n = m[1].replace(/\\(.)/g, '$1'); if (!/^\d/.test(n) && !exists(n)) return false; }
  return true;
}
const splitList = s => { const out = []; let d = 0, cur = ''; for (const ch of s) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && !d) { out.push(cur); cur = ''; } else cur += ch; } out.push(cur); return out.map(x => x.trim()).filter(Boolean); };

const lines = css.split('\n');
// locate each rule by its line and selector text, remove "selector { ... }"
let removed = 0, removedLines = 0;
const offsets = []; let off = 0; for (const l of lines) { offsets.push(off); off += l.length + 1; }
// the coverage report shortens long selectors: read the whole selector from root.css
const fullSelector = r => {
  const start = css.indexOf(r.selector.slice(0, 60), offsets[r.line - 1] - 5);
  if (start < 0 || start > offsets[r.line - 1] + 400) return null;
  return css.slice(start, css.indexOf('{', start)).trim();
};
const dead = cov.dead.filter(r => { const sel = fullSelector(r); return sel && splitList(sel).every(s => !canMatch(s)); });
const cuts = [];
for (const r of dead) {
  const start = css.indexOf(r.selector.slice(0, 60), offsets[r.line - 1] - 5);
  if (start < 0 || start > offsets[r.line - 1] + 400) continue;
  const open = css.indexOf('{', start); let d = 1, j = open + 1;
  for (; j < css.length && d; j++) { if (css[j] === '{') d++; else if (css[j] === '}') d--; }
  if (css.slice(open + 1, j - 1).includes('{')) continue; // never cut a block with nested rules
  cuts.push([start, j]);
}
cuts.sort((a, b) => b[0] - a[0]);
for (const [a, b] of cuts) { removedLines += css.slice(a, b).split('\n').length - 1; css = css.slice(0, a) + css.slice(b); removed++; }
// empty @media / @supports / @layer wrappers left behind, and blank lines
for (let k = 0; k < 3; k++) css = css.replace(/@(media|supports|layer)[^{;]*\{\s*\}/g, '');
css = css.replace(/\n[ \t]*\n(?=[ \t]*\n)/g, '\n');
console.log(`coverage-unused: ${cov.dead.length}, impossible to match: ${dead.length}, removed: ${removed}`);
if (process.argv.includes("--list")) for (const r of dead) console.log(r.line, r.selector.slice(0, 110));
if (!DRY) fs.writeFileSync(FILE, css);
console.log(`root.css: ${lines.length} -> ${css.split('\n').length} lines`);
