// Merges rules that repeat the same declarations in different page blocks into one shared block ("page-kit").
// A group qualifies when its rules sit in different blocks used by at most MAX_PAGES pages each, no page loads two
// of those blocks (so moving a rule cannot change which of two copies wins), every selector is scoped to its own
// block ([data-css~="block"] ...), and the rules share the same @media context. The merged rule keeps every
// original selector, so specificity stays the same; only its position changes, which the regression check covers.
// The new block goes right before the first block it serves, and every page of those blocks lists it in data-css.
// Usage: node scripts/build/merge-duplicate-rules.js [--dry] [--min=3] [--skip=text,text]
//   min: declarations per rule; skip: leave groups alone whose selectors contain one of the texts (cascade clashes
//   the regression check found: the rule must keep its place).
const fs = require('fs');
const { pageFiles } = require('../lib/pages');
const FILE = 'dist/css/root.css', NAME = 'page-kit', MAX_PAGES = 9;
const DRY = process.argv.includes('--dry');
const MIN = +((process.argv.find(a => a.startsWith('--min=')) || '--min=3').split('=')[1]);
const SKIP = ((process.argv.find(a => a.startsWith('--skip=')) || '--skip=').slice(7)).split(',').filter(Boolean);
const lines = fs.readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n').split('\n'); // git may check it out with CRLF
const ds = lines.findIndex(l => /^@layer ds\s*\{/.test(l));
if (lines.some(l => l.includes(`[data-css~="${NAME}"]`))) { console.log(`${NAME} exists: merge into it by hand or rename`); }

// pages per block
const pagesOf = new Map(), pageBlocks = new Map();
for (const f of pageFiles()) {
  const m = fs.readFileSync(f, 'utf8').match(/<html[^>]*data-css="([^"]*)"/); if (!m) continue;
  const b = m[1].split(/\s+/); pageBlocks.set(f, b);
  for (const x of b) { if (!pagesOf.has(x)) pagesOf.set(x, new Set()); pagesOf.get(x).add(f); }
}
// one-line rules with their block and @media context
const rules = []; let block = null, media = null;
lines.forEach((l, i) => {
  if (i >= ds) return;
  const h = l.match(/^\/\* =====.*\[data-css~="([^"]+)"\]/); if (h) block = h[1];
  if (/^@media [^{]*\{$/.test(l)) { media = l.trim(); return; }
  if (l === '}') { media = null; return; }
  const indent = media ? '  ' : '';
  const r = l.match(/^(\s*)([^{@/\s][^{]*?) \{ (.*) \}$/);
  if (!r || r[1] !== indent || !block) return;
  const d = r[3].split('; ').map(x => x.replace(/;$/, '').trim()).filter(Boolean);
  if (d.length < MIN) return;
  const sels = r[2].split(/,\s*(?![^()]*\))/);
  if (!sels.every(s => s.includes(`[data-css~="${block}"]`))) return;
  rules.push({ i, block, media, sel: r[2], key: (media || '') + '|' + [...d].sort().join('; '), decl: d.join('; ') });
});
const groups = new Map();
for (const r of rules) { if (!groups.has(r.key)) groups.set(r.key, []); groups.get(r.key).push(r); }
const take = [];
for (const g of groups.values()) {
  const blocks = [...new Set(g.map(r => r.block))];
  if (blocks.length < 2 || g.length !== blocks.length) continue; // one copy per block
  if (blocks.some(b => !pagesOf.has(b) || pagesOf.get(b).size > MAX_PAGES)) continue;
  const clash = [...pageBlocks.values()].some(bs => blocks.filter(b => bs.includes(b)).length > 1);
  if (clash) continue;
  if (g.some(r => SKIP.some(t => r.sel.includes(t)))) continue;
  take.push(g);
}
const removed = new Set(take.flatMap(g => g.map(r => r.i)));
const served = [...new Set(take.flatMap(g => g.map(r => r.block)))];
console.log(`${take.length} groups, ${removed.size} rules -> ${take.length}; blocks served: ${served.join(' ')}`);
if (DRY || !take.length) process.exit(0);

// the shared block, @media groups last (same order as the originals: plain rules first)
const plain = take.filter(g => !g[0].media), byMedia = new Map();
for (const g of take.filter(g => g[0].media)) { if (!byMedia.has(g[0].media)) byMedia.set(g[0].media, []); byMedia.get(g[0].media).push(g); }
const rule = (g, ind) => ind + g.map(r => r.sel).join(', ') + ' { ' + g[0].decl + '; }';
const kit = [`/* ===== shared by the reference service and company pages  [data-css~="${NAME}"] ===== */`,
  '/* Rules these pages repeated word for word (scripts/build/merge-duplicate-rules.js). Each selector keeps its page scope. */',
  ...plain.map(g => rule(g, '')),
  ...[...byMedia].flatMap(([m, gs]) => [m, ...gs.map(g => rule(g, '  ')), '}'])];
// insert before the first served block
const firstBlock = lines.findIndex(l => served.some(b => l.includes(`[data-css~="${b}"] =====`)));
const out = [];
lines.forEach((l, i) => { if (i === firstBlock) out.push(...kit); if (!removed.has(i)) out.push(l); });
// drop @media wrappers left empty
let text = out.join('\n').replace(/^@media [^{\n]*\{\n\}\n/gm, '');
fs.writeFileSync(FILE, text);
// pages: list the block before the first served block they load
let pagesChanged = 0;
for (const [f, bs] of pageBlocks) {
  const at = bs.findIndex(b => served.includes(b)); if (at < 0 || bs.includes(NAME)) continue;
  const next = [...bs.slice(0, at), NAME, ...bs.slice(at)].join(' ');
  const t = fs.readFileSync(f, 'utf8');
  fs.writeFileSync(f, t.replace(/(<html[^>]*data-css=")[^"]*"/, `$1${next}"`)); pagesChanged++;
}
console.log(`root.css ${lines.length} -> ${text.split('\n').length} lines; ${pagesChanged} pages list ${NAME}`);
