// One-time step of the design-system migration (kept for the record): removes the frozen Tailwind output.
//   - keeps Tailwind's reset (@layer base) as the site reset, scoped [data-css] (same specificity, every page)
//   - drops the theme and utilities layers (pages use design-system and u-* classes now)
//   - Tailwind palette colors still referenced (var(--color-gray-200) ...) point to the nearest site color
//   - "tailwind" is removed from every page's data-css
// Run after `node scripts/build/tw-migrate.js --fallback --js` reports 0 Tailwind elements left.
const fs = require('fs'), path = require('path');
const { pageFiles } = require('../lib/pages');
const FILE = path.join(__dirname, '../../dist/css/root.css');
let css = fs.readFileSync(FILE, 'utf8');
const HEAD = css.indexOf('/* ===== Tailwind v4 output, frozen');
const END = css.indexOf('/* ===== custom rules of the former style.css');
if (HEAD < 0 || END < 0) throw new Error('Tailwind block not found');
const block = css.slice(HEAD, END);

// reset
const b = block.indexOf('@layer base {');
let depth = 0, i = b + '@layer base '.length;
for (; i < block.length; i++) { if (block[i] === '{') depth++; else if (block[i] === '}' && --depth === 0) break; }
const reset = block.slice(b, i + 1).split('[data-css~="tailwind"]').join('[data-css]');

// palette colors -> nearest site color
const theme = block.slice(block.indexOf('@layer theme'), b);
const palette = Object.fromEntries([...theme.matchAll(/(--color-[a-z]+-\d+):\s*oklch\(([\d.]+)% ([\d.]+) ([\d.]+)\)/g)].map(m => [m[1], [m[2] / 100, +m[3], +m[4]]]));
const lab = ([L, C, H]) => [L, C * Math.cos(H * Math.PI / 180), C * Math.sin(H * Math.PI / 180)];
function hexLab(hex) {
  const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const [r, g, bb] = [1, 3, 5].map(k => lin(parseInt(hex.slice(k, k + 2), 16)));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * bb), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * bb), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * bb);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
const site = [...new Set([...execOriginal().matchAll(/--c-([0-9A-F]{6}):/g)].map(m => m[1]))].map(h => [h, hexLab('#' + h)]);
function execOriginal() { return require('child_process').execSync('git show css-baseline:dist/css/root.css', { maxBuffer: 1 << 28 }).toString(); }
const nearest = name => { const p = lab(palette[name]); return site.map(([h, q]) => [h, Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2])]).sort((x, y) => x[1] - y[1])[0]; };

css = css.slice(0, HEAD) + '/* ===== reset (Tailwind preflight, kept as the site reset)  [data-css] ===== */\n' + reset + '\n' + css.slice(END);
const used = new Map();
css = css.replace(/var\((--color-[a-z]+-\d+)\)/g, (a, n) => { if (!palette[n]) return a; const [h, d] = nearest(n); used.set(n, `--c-${h} (dE ${d.toFixed(3)})`); return `var(--c-${h})`; });
css = css.replace('  --duration: 150ms;', '  --duration: 150ms;\n  --default-transition-duration: 150ms;\n  --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);');
fs.writeFileSync(FILE, css);
for (const [n, v] of used) console.log(n.padEnd(22), '->', v);

let pages = 0;
for (const f of pageFiles()) {
  const h = fs.readFileSync(f, 'utf8');
  const x = h.replace(/(<html\b[^>]*\bdata-css=")([^"]*)(")/, (m, a, l, z) => a + l.split(/\s+/).filter(c => c && c !== 'tailwind').join(' ') + z);
  if (x !== h) { pages++; fs.writeFileSync(f, x); }
}
console.log(`Tailwind block removed (${block.split('\n').length} lines, reset kept: ${reset.split('\n').length} lines), ${pages} pages updated`);
