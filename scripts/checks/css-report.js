// Size report of dist/css/root.css: how much of it is shared design system and how much belongs to few pages.
//   central   tokens/THEME, blocks used by 10+ pages, the components of @layer ds
//   family    blocks used by 2-9 pages
//   page      blocks used by one page
//   utility   the generated u-* utilities (one-off classes, to be replaced by components)
// Usage: node scripts/checks/css-report.js [--blocks]   (--blocks lists every block with its size and page count)
const fs = require('fs');
const { pageFiles } = require('../lib/pages');
const lines = fs.readFileSync('dist/css/root.css', 'utf8').split(/\r?\n/);
const use = new Map();
for (const f of pageFiles()) {
  const m = fs.readFileSync(f, 'utf8').match(/<html[^>]*data-css="([^"]*)"/);
  if (m) for (const b of new Set(m[1].split(/\s+/))) use.set(b, (use.get(b) || 0) + 1);
}
const ds = lines.findIndex(l => /^@layer ds\s*\{/.test(l));
const gs = lines.findIndex(l => l.startsWith('  /* ---- generated utilities'));
const ge = lines.findIndex(l => l.startsWith('  /* ---- end of generated utilities'));
const sum = { central: 0, family: 0, page: 0, utility: 0 };
const blocks = new Map();
let cur = null;
lines.forEach((l, i) => {
  if (i >= ds) { sum[i > gs && i < ge ? 'utility' : 'central']++; return; }
  const m = l.match(/^\/\* =====.*\[data-css~="([^"]+)"\]/) || l.match(/^\/\* =====.*\[data-css\]/);
  if (m) cur = m[1] || 'reset';
  if (!cur) { sum.central++; return; }
  const n = cur === 'reset' ? 999 : use.get(cur) || 0;
  sum[n >= 10 ? 'central' : n >= 2 ? 'family' : 'page']++;
  blocks.set(cur, blocks.get(cur) || { lines: 0, pages: n }); blocks.get(cur).lines++;
});
const total = lines.length;
const pct = n => (100 * n / total).toFixed(1) + '%';
console.log(`root.css ${total} lines: central ${sum.central} (${pct(sum.central)}), family ${sum.family} (${pct(sum.family)}), ` +
  `page ${sum.page} (${pct(sum.page)}), utilities ${sum.utility} (${pct(sum.utility)})`);
if (process.argv.includes('--blocks'))
  [...blocks].sort((a, b) => b[1].lines - a[1].lines).forEach(([k, v]) => console.log(String(v.lines).padStart(6), String(v.pages).padStart(4), k));
