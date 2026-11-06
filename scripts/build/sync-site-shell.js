// Site shell: header (with the Specialties and Services dropdowns), logo marquee and footer.
//
// The markup lives once, in dist/partials/:
//   header.html   header with the dropdowns (#homepage-reference-nav)
//   marquee.html  logo marquee that sits directly under the hero (and, on some pages, above the footer)
//   footer.html   footer
// Pages do not contain a copy. They contain a loader tag where the block belongs:
//   <script src="/js/site-shell.js" data-include="header"></script>      (also "marquee" and "footer")
// which dist/js/site-shell.js replaces with the partial while the page is parsed.
//
// This script converts pages that still carry an inline header, marquee or footer (for example a freshly imported
// page) into loader tags, and checks that no page carries an inline copy.
//
// Usage (from the repo root):
//   node scripts/build/sync-site-shell.js              convert every page
//   node scripts/build/sync-site-shell.js a.html b.html   convert the named pages only
//   node scripts/build/sync-site-shell.js --check      report pages that still carry inline blocks, exit 1 if any
const fs = require('fs');
const path = require('path');

const { pageFiles, pagePath } = require('../lib/pages');
const HERO_MARKER = 'hero-bg-gradient';
const MARQUEE_SCRIPT = '<script src="/js/marquee-track.js" defer data-specialty-marquee-script></script>';
const PARTIALS = ['header', 'marquee', 'footer'];
const include = name => `<script src="/js/site-shell.js" data-include="${name}"></script>`;

const maskComments = t => t.replace(/<!--[\s\S]*?-->/g, c => ' '.repeat(c.length));

// End index (exclusive) of the element that starts at `start`, balancing the given tag.
function elementEnd(text, start, tag) {
  const m = maskComments(text);
  const re = new RegExp('<' + tag + '\\b|</' + tag + '\\s*>', 'gi');
  re.lastIndex = start;
  let depth = 0, x;
  while ((x = re.exec(m))) {
    if (x[0][1] === '/') {
      depth--;
      if (depth === 0) return x.index + x[0].length;
    } else depth++;
  }
  throw new Error('unbalanced <' + tag + '>');
}

function findHeader(html) {
  // Once the page has the header include, only a leftover copy of the site header counts, not a <header> inside the content.
  const re = /data-include="header"/.test(html) ? /<header\b[^>]*id="homepage-reference-nav"/i : /<header\b/i;
  const s = maskComments(html).search(re);
  if (s < 0) return null;
  return { start: s, end: elementEnd(html, s, 'header') };
}

function findFooter(html) {
  const m = maskComments(html);
  const s = m.lastIndexOf('<footer');
  if (s < 0) return null;
  return { start: s, end: elementEnd(html, s, 'footer') };
}

// The marquee is the first <div> after the hero section that holds a marquee container.
function findMarquee(html) {
  const m = maskComments(html);
  const heroAt = m.includes(HERO_MARKER) ? m.indexOf(HERO_MARKER) : m.indexOf('data-specialty-hero');
  if (heroAt < 0) return null;
  const heroStart = m.lastIndexOf('<section', heroAt);
  const heroEnd = elementEnd(html, heroStart, 'section');
  const re = /<div\b/g;
  re.lastIndex = heroEnd;
  const d = re.exec(m);
  if (!d) return null;
  const end = elementEnd(html, d.index, 'div');
  if (!/marquee-container|data-pmex-marquee/.test(html.slice(d.index, d.index + 400))) return null; // the div itself, not something deeper inside it
  return { start: d.index, end };
}

// Optional second marquee: a logo strip that sits directly above the footer.
function findBottomMarquee(html, hero) {
  const m = maskComments(html);
  const foot = m.lastIndexOf('<footer');
  if (foot < 0) return null;
  const at = m.lastIndexOf('marquee-container', foot);
  if (at < 0) return null;
  const end = m.slice(0, foot).trimEnd().length;
  if (!m.slice(0, end).endsWith('</div>')) return null;
  const re = /<div\b/g;
  const starts = [];
  let x;
  while ((x = re.exec(m)) && x.index < at) starts.push(x.index);
  for (let i = starts.length - 1; i >= 0; i--) {
    if (elementEnd(html, starts[i], 'div') === end) {
      // The hero marquee is handled separately.
      if (hero && starts[i] === hero.start) return null;
      return { start: starts[i], end };
    }
  }
  return null;
}

// Inline blocks that are still in the page, keyed by the partial they should come from.
function inlineBlocks(html) {
  const hero = findMarquee(html);
  const blocks = [];
  const header = findHeader(html);
  if (header) blocks.push({ name: 'header', ...header });
  if (hero) blocks.push({ name: 'marquee', ...hero });
  const bottom = findBottomMarquee(html, hero);
  if (bottom) blocks.push({ name: 'marquee', ...bottom });
  const footer = findFooter(html);
  if (footer) blocks.push({ name: 'footer', ...footer });
  return blocks;
}

function convert(html) {
  // Replace from the bottom up so earlier indexes stay valid.
  const blocks = inlineBlocks(html).sort((a, b) => b.start - a.start);
  let out = html;
  for (const b of blocks) out = out.slice(0, b.start) + include(b.name) + out.slice(b.end);
  if (/data-include="marquee"/.test(out) && !out.includes('marquee-track.js') && out.includes('</head>')) {
    out = out.replace('</head>', '    ' + MARQUEE_SCRIPT + '\n</head>');
  }
  return out;
}

// Problems with a page, [] when it is fine.
function problems(html) {
  const out = [];
  const inline = inlineBlocks(html).map(b => b.name);
  if (inline.length) out.push('inline ' + [...new Set(inline)].join(', ') + ' (run npm run shell:sync)');
  if (!/data-include="header"/.test(html)) out.push('no header include');
  if (/data-include="marquee"/.test(html) && !html.includes('marquee-track.js')) out.push('marquee without marquee-track.js');
  return out;
}

function main() {
  const args = process.argv.slice(2);
  const check = args.includes('--check');
  const named = args.filter(a => !a.startsWith('--')).map(a => path.basename(a));
  const files = named.length ? named.map(pagePath) : pageFiles();
  const bad = [];
  for (const p of PARTIALS) if (!fs.existsSync(path.join('dist', 'partials', p + '.html'))) bad.push({ page: 'dist/partials/' + p + '.html', problems: ['missing partial'] });
  let changed = 0;
  for (const file of files) {
    const f = path.relative('dist', file).split(path.sep).join('/');
    const raw = fs.readFileSync(file, 'utf8');
    const crlf = raw.includes('\r\n');
    const html = raw.replace(/\r\n/g, '\n');
    if (check) {
      const p = problems(html);
      if (p.length) bad.push({ page: f, problems: p });
      continue;
    }
    let next = convert(html);
    if (next === html) continue;
    if (crlf) next = next.replace(/\n/g, '\r\n');
    fs.writeFileSync(file, next);
    changed++;
    console.log('converted', f);
  }
  if (check) {
    console.log(JSON.stringify({ pages: files.length, problems: bad }, null, 2));
    if (bad.length) process.exitCode = 1;
  } else {
    console.log(JSON.stringify({ pages: files.length, changed }, null, 2));
  }
}

if (require.main === module) main();
module.exports = { convert, problems, inlineBlocks, include };
