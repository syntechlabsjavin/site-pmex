// Removes exact duplicate blocks from dist/css/root.css.
// Two blocks are duplicates when their rules are identical once the block name is ignored
// (site-faq-accordion-2 ... -5, site-motion ... -4). The first block of each group is kept; the others are
// deleted and every page that listed a deleted name in <html data-css="..."> lists the kept name instead.
// Empty blocks are deleted together with their data-css entries.
//
// Usage: node scripts/build/dedupe-css-blocks.js [--dry]
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { pageRels, pagePath } = require('../lib/pages');
const FILE = path.join(__dirname, '../../dist/css/root.css');
const DRY = process.argv.includes('--dry');

const lines = fs.readFileSync(FILE, 'utf8').split('\n');
const HEAD = /^\/\* ===== .*\[data-css~="([^"]+)"\]/;
const blocks = []; let cur = null;
lines.forEach((l, i) => {
  const m = l.match(HEAD);
  if (m) { cur = { name: m[1], start: i, end: i + 1 }; blocks.push(cur); } else if (cur) cur.end = i + 1;
});
// several sections can share one name (pmex-common); a name is a unit
const byName = new Map();
for (const b of blocks) { if (!byName.has(b.name)) byName.set(b.name, []); byName.get(b.name).push(b); }
const body = name => byName.get(name).map(b => lines.slice(b.start + 1, b.end).join('\n')).join('\n').split(`"${name}"`).join('"X"');

const rename = new Map(), drop = new Set(), seen = new Map();
for (const name of byName.keys()) {
  const text = body(name);
  if (!text.replace(/\/\*[\s\S]*?\*\//g, '').trim()) { drop.add(name); continue; }
  const h = crypto.createHash('md5').update(text).digest('hex');
  if (seen.has(h)) { rename.set(name, seen.get(h)); drop.add(name); } else seen.set(h, name);
}

const removeLines = new Set();
for (const name of drop) for (const b of byName.get(name)) for (let i = b.start; i < b.end; i++) removeLines.add(i);
console.log('duplicate blocks:', [...rename].map(([a, b]) => `${a} -> ${b}`).join(', ') || 'none');
console.log('empty blocks:', [...drop].filter(n => !rename.has(n)).join(', ') || 'none');
console.log(`root.css: ${removeLines.size} lines removed`);

let pages = 0;
for (const rel of pageRels()) {
  const file = pagePath(rel), html = fs.readFileSync(file, 'utf8');
  const next = html.replace(/(<html\b[^>]*\bdata-css=")([^"]*)(")/, (all, a, list, z) => {
    const out = [];
    for (const n of list.split(/\s+/).filter(Boolean)) {
      const k = rename.get(n) || (drop.has(n) ? null : n);
      if (k && !out.includes(k)) out.push(k);
    }
    return a + out.join(' ') + z;
  });
  if (next !== html) { pages++; if (!DRY) fs.writeFileSync(file, next); }
}
console.log(`${pages} pages updated`);
if (!DRY) fs.writeFileSync(FILE, lines.filter((_, i) => !removeLines.has(i)).join('\n'));
