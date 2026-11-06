/**
 * Keep only class="bh-hero-title" on hero H1s.
 * Remove data-reference-hero-title and any other leftover attrs that pull old CSS.
 */
const fs = require('fs');
const path = require('path');

const DIST = 'dist';
let pages = 0;
let hits = 0;

for (const f of fs.readdirSync(DIST).filter((x) => x.endsWith('.html'))) {
  const p = path.join(DIST, f);
  let html = fs.readFileSync(p, 'utf8');
  const before = html;

  html = html.replace(/<h1\b([^>]*)>/gi, (full, attrs) => {
    if (!/\bbh-hero-title\b/.test(attrs) && !/\bbh-hero-title\b/.test(full)) {
      return full;
    }
    hits++;
    // Preserve only class="bh-hero-title"
    return '<h1 class="bh-hero-title">';
  });

  // Also normalize multiline openings already partially converted
  html = html.replace(
    /<h1\s*\n\s*class="bh-hero-title"\s*>/g,
    '<h1 class="bh-hero-title">'
  );

  if (html !== before) {
    fs.writeFileSync(p, html);
    pages++;
  }
}

console.log(JSON.stringify({ pages, hits }, null, 2));
