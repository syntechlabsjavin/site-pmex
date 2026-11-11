// Replaces inline copies of the logo marquee (<div data-specialty-marquee ...>) with the shared loader tag,
// <script src="/js/site-shell.js" data-include="marquee"></script>, on every page whose copy matches
// dist/partials/marquee.html (whitespace and comments ignored). Copies that differ are listed and left alone.
//
// Usage: node scripts/build/use-marquee-partial.js [--check]
const fs = require('fs'), path = require('path');
const { pageFiles } = require('../lib/pages');
const CHECK = process.argv.includes('--check');
const LOADER = '<script src="/js/site-shell.js" data-include="marquee"></script>';
const norm = t => t.replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').replace(/> </g, '><').trim();
const partial = norm(fs.readFileSync('dist/partials/marquee.html', 'utf8'));

function divEnd(text, start) {
  const re = /<div\b|<\/div\s*>/gi; re.lastIndex = start; let depth = 0, m;
  const masked = text.replace(/<!--[\s\S]*?-->/g, c => ' '.repeat(c.length));
  re.lastIndex = start;
  while ((m = re.exec(masked))) { if (m[0][1] === '/') { if (--depth === 0) return m.index + m[0].length; } else depth++; }
  return -1;
}

let changed = 0, differ = [];
for (const f of pageFiles()) {
  let html = fs.readFileSync(f, 'utf8'), out = '', last = 0, n = 0;
  const re = /<div\b[^>]*\bdata-specialty-marquee\b[^>]*>/g; let m;
  while ((m = re.exec(html))) {
    const end = divEnd(html, m.index); if (end < 0) break;
    if (norm(html.slice(m.index, end)) === partial) { out += html.slice(last, m.index) + LOADER; last = end; n++; }
    else differ.push(path.relative('dist', f));
    re.lastIndex = end;
  }
  if (n) { changed++; if (!CHECK) fs.writeFileSync(f, out + html.slice(last)); }
}
console.log(`${changed} pages ${CHECK ? 'carry an inline marquee' : 'now load the marquee partial'}`);
if (differ.length) console.log('inline copies that differ from the partial (left alone):', [...new Set(differ)].join(' '));
process.exit(CHECK && changed ? 1 : 0);
