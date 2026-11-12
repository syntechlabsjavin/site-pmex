// One corner radius for the whole site: every border-radius uses var(--radius) (defined once in the tokens of
// root.css). 0 stays 0 and true circles (50%) stay circles. The --radius-* scale tokens point at --radius too.
// Usage: node scripts/build/pin-radius.js [--check]
const fs = require('fs');
const CHECK = process.argv.includes('--check');
const FILES = ['dist/css/root.css', 'dist/css/legacy-home.css'].filter(f => fs.existsSync(f));
const KEEP = /^(0|0px|0rem|50%|inherit|initial|unset|none|var\(--radius\))$/;
const PROP = /(border(?:-(?:top|bottom|start|end)-(?:left|right|start|end))?-radius)(\s*:\s*)([^;{}]+?)(\s*(?:!important)?\s*)(?=[;}])/g;
const fix = v => v.trim().split(/\s+/).map(p => (KEEP.test(p) || p === '/' ? p : 'var(--radius)')).join(' ');
let bad = 0, changed = 0;
for (const f of FILES) {
  let t = fs.readFileSync(f, 'utf8');
  // tokens: one source
  if (f.endsWith('root.css') && !/--radius:\s*6px/.test(t)) {
    t = t.replace(/(\n\s*)(--radius-sm:)/, '$1--radius: 6px; /* the one corner radius of the site */$1$2');
  }
  t = t.replace(/(--radius-(?:sm|md|lg|xl|2xl|3xl|full)):\s*[^;]+;/g, (m, n) => `${n}: var(--radius);`);
  const next = t.replace(PROP, (all, prop, sep, val, imp) => {
    if (val.trim().startsWith('var(--radius')) return all;
    const v = fix(val);
    if (v === val.trim()) return all;
    bad++; return prop + sep + v + imp;
  });
  if (next !== fs.readFileSync(f, 'utf8')) { changed++; if (!CHECK) fs.writeFileSync(f, next); }
}
console.log(CHECK ? (bad ? `${bad} radius values not on the token; run node scripts/build/pin-radius.js` : 'every radius uses the token') : `${bad} radius values moved to var(--radius) in ${changed} files`);
process.exit(CHECK && bad ? 1 : 0);
