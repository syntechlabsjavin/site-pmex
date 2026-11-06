// Shared page lookup for the site scripts. Run scripts from the repo root.
// Pages live in category folders under dist/ (see docs/PROJECT-STRUCTURE.md); a page "name"
// is its file name (cardiology.html), which is unique across the site.
const fs = require('fs');
const path = require('path');

const DIST = 'dist';
const ASSET_DIRS = new Set(['css', 'js', 'img', 'icons', 'fonts', 'partials']);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return dir === DIST && ASSET_DIRS.has(e.name) ? [] : walk(full);
    return e.name.endsWith('.html') ? [full] : [];
  });
}

// Every page as a path relative to dist, with forward slashes: 'specialties/cardiology.html'.
const pageRels = () => walk(DIST).map(f => path.relative(DIST, f).split(path.sep).join('/')).sort();
// Every page as a file path usable with fs: 'dist/specialties/cardiology.html'.
const pageFiles = () => pageRels().map(r => path.join(DIST, r));
// Every page as a bare file name: 'cardiology.html'.
const pageNames = () => pageRels().map(r => path.basename(r));
// Resolve a name, relative path or dist path to the real file ('cardiology.html' -> dist/specialties/cardiology.html).
function pagePath(nameOrPath) {
  const base = path.basename(nameOrPath);
  const hit = pageRels().filter(r => path.basename(r) === base);
  if (hit.length === 1) return path.join(DIST, hit[0]);
  const wanted = nameOrPath.split(path.sep).join('/').replace(/^dist\//, '');
  const exact = hit.find(r => r === wanted);
  if (exact) return path.join(DIST, exact);
  throw new Error(hit.length ? 'ambiguous page name: ' + nameOrPath : 'page not found: ' + nameOrPath);
}
// Pages plus the other text files the site scripts rewrite (js, templates, scripts).
const textFiles = (extra = []) => [...pageFiles(),
  ...['dist/js', 'dist/partials', ...extra].flatMap(d => (fs.existsSync(d) ? fs.readdirSync(d).filter(f => /\.(html|js)$/.test(f)).map(f => path.join(d, f)) : []))];

module.exports = { DIST, pageRels, pageFiles, pageNames, pagePath, textFiles };
