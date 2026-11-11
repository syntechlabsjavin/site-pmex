// Builds the color section at the top of dist/css/root.css from one THEME block.
//
// The THEME block (semantic tokens such as --theme-primary) is the only place where a color value is written.
// Every legacy --c-HEX variable that the pages use is then derived from the nearest theme token:
//   - same color (or invisible difference)  -> --c-HEX: var(--theme-x)
//   - a nearby shade                         -> --c-HEX: oklch(from var(--theme-x) calc(l + dL) calc(c + dC) calc(h + dH))
//   - an alpha variant                       -> --c-HEX-a15: rgb(from var(--c-HEX) r g b / 15%)
// So changing --theme-primary recolors every green shade, tint, shadow and gradient of the site.
//
// The original hex values are read from the git ref `css-baseline` (the colors before this migration), so the
// script can be re-run after the THEME values below are edited.
//
// Usage: node scripts/build/build-theme-tokens.js            rewrite the color section of root.css
//        node scripts/build/build-theme-tokens.js --report   print the mapping only
const fs = require('fs'), path = require('path');
const { execSync } = require('child_process');

const FILE = path.join(__dirname, '../../dist/css/root.css');
const START = '/* ===== THEME', END = '/* Design tokens */';

// ---- THEME: the semantic palette. Values are the current site colors (AGENTS.md palette). ----
const THEME = [
  ['Brand', [
    ['--theme-primary', '#3F9A4B', 'buttons, links, icons, active states'],
    ['--theme-primary-dark', '#2E4A25', 'dark green: headings, button text, dark sections'],
    ['--theme-primary-light', '#AAD39C', 'soft green: CTA pill fill, highlights'],
    ['--theme-primary-tint', '#F8FBF0', 'lightest green: section backgrounds'],
    ['--theme-accent', '#E85D3F', 'orange: H1 emphasis only'],
  ]],
  ['Text', [
    ['--theme-heading', '#2A3828', 'darkest ink'],
    ['--theme-text', '#505050', 'body text'],
    ['--theme-text-muted', '#676767', 'descriptions, secondary text'],
    ['--theme-text-subtle', '#959085', 'meta, captions, inactive'],
  ]],
  ['Surfaces and lines', [
    ['--theme-white', '#FFFFFF', 'cards, page'],
    ['--theme-black', '#000000', 'shadows, overlays'],
    ['--theme-surface', '#EEF0E8', 'neutral section background'],
    ['--theme-surface-warm', '#EDEAE0', 'warm beige background'],
    ['--theme-border', '#E0E0DA', 'card and input borders'],
    ['--theme-cool', '#D8DCE3', 'cool grey of card gradients'],
  ]],
  ['Status', [
    ['--theme-danger', '#DC2626', 'errors, "before" states'],
    ['--theme-warning', '#E9B62C', 'stars, warnings'],
    ['--theme-info', '#3B82F6', 'info'],
  ]],
];
// The hex values above are the ORIGINAL palette: every legacy shade is derived as an offset from them, so they
// never change. The value a token has today is read from the THEME block of root.css (edit it there).
const TOKENS = THEME.flatMap(([, list]) => list.map(([name, hex]) => ({ name, hex })));
const CURRENT = new Map();
{
  const css = fs.readFileSync(path.join(__dirname, '../../dist/css/root.css'), 'utf8');
  const block = css.slice(css.indexOf('/* ===== THEME'), css.indexOf('/* Legacy color names'));
  for (const m of block.matchAll(/(--theme-[\w-]+):\s*([^;]+);/g)) CURRENT.set(m[1], m[2].trim());
}
const valueOf = (name, hex) => CURRENT.get(name) || hex;
const MERGE_DE = 0.008; // OKLab distance below which a shade simply becomes the token (not visible)

// ---- color math ----
const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
function oklab(hex) {
  const [r, g, b] = hexRgb(hex).map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
function oklch(hex) {
  const [L, a, b] = oklab(hex), C = Math.hypot(a, b);
  let H = Math.atan2(b, a) * 180 / Math.PI; if (H < 0) H += 360;
  return [L, C, C < 0.0001 ? 0 : H]; // achromatic hue is "none", which relative color syntax reads as 0
}
const dist = (x, y) => { const p = oklab(x), q = oklab(y); return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); };
const r4 = n => +n.toFixed(4), r2 = n => +n.toFixed(2);
const signed = (n, d) => (n < 0 ? ' - ' : ' + ') + Math.abs(d(n));

// Family by hue: a shade is only derived from a token of the same family, so a hue change stays coherent.
function family(hex) {
  const [, C, H] = oklch(hex);
  if (C < 0.03) return 'neutral';
  if (H >= 100 && H < 175) return 'green';
  if (H >= 60 && H < 100) return 'yellow';
  if (H >= 175 && H < 300) return 'blue';
  return 'red';
}
const FAMILY_TOKENS = {
  green: ['--theme-primary', '--theme-primary-dark', '--theme-primary-light', '--theme-primary-tint', '--theme-heading'],
  neutral: ['--theme-text', '--theme-text-muted', '--theme-text-subtle', '--theme-white', '--theme-black', '--theme-surface', '--theme-surface-warm', '--theme-border', '--theme-cool', '--theme-primary-tint', '--theme-heading'],
  red: ['--theme-accent', '--theme-danger'],
  yellow: ['--theme-warning'],
  blue: ['--theme-info', '--theme-cool'],
};

// Browsers treat the hue of a nearly grey color as "none" (0), so only a clearly colored token can lend its hue.
const HUE_TOKEN_C = 0.04;
const nearest = (hex, names) => TOKENS.filter(t => names.includes(t.name)).map(t => ({ t, d: dist(hex, t.hex) })).sort((a, b) => a.d - b.d)[0];

function derive(hex) {
  hex = hex.toUpperCase();
  const fam = family(hex), [L, C, H] = oklch(hex);
  const same = nearest(hex, FAMILY_TOKENS[fam]);
  if (same.d < MERGE_DE) return { kind: same.d === 0 ? 'same' : 'merged', token: same.t.name, d: same.d, value: `var(${same.t.name})` };
  // Base of a shade: green and green-tinted shades follow the brand greens (so they follow a brand hue change);
  // other colored shades follow their colored token; greys follow the nearest neutral token.
  let names = FAMILY_TOKENS[fam];
  if (H >= 100 && H < 175 && C >= 0.008) names = ['--theme-primary', '--theme-primary-dark', '--theme-primary-light'];
  else if (fam !== 'neutral') names = names.filter(n => oklch(TOKENS.find(t => t.name === n).hex)[1] >= HUE_TOKEN_C);
  const best = nearest(hex, names);
  const [tL, tC, tH] = oklch(best.t.hex);
  let hue;
  if (tC >= HUE_TOKEN_C) { let dH = H - tH; if (dH > 180) dH -= 360; if (dH < -180) dH += 360; hue = `calc(h${signed(dH, r2)})`; }
  else hue = C < 0.0001 ? '0' : String(r2(H));
  const value = `oklch(from var(${best.t.name}) calc(l${signed(L - tL, r4)}) calc(c${signed(C - tC, r4)}) ${hue})`;
  return { kind: 'shade', token: best.t.name, d: best.d, value };
}

// ---- read original colors (before the migration) ----
const baseline = execSync('git show css-baseline:dist/css/root.css', { maxBuffer: 1 << 28 }).toString();
const solid = new Map(), alpha = [];
for (const m of baseline.matchAll(/^\s*--c-([0-9A-Fa-f]{6}):\s*(#[0-9A-Fa-f]{6})\s*;/gm)) solid.set(m[1].toUpperCase(), m[2].toUpperCase());
for (const m of baseline.matchAll(/^\s*--c-([0-9A-Fa-f]{6})-a([0-9_]+):\s*rgb\(([^)]*)\)\s*;/gm)) alpha.push({ hex: m[1].toUpperCase(), a: m[2], pct: m[2].replace('_', '.') + '%' });
for (const { hex } of alpha) if (!solid.has(hex)) solid.set(hex, '#' + hex); // base of an alpha variant without its own variable

const rows = [...solid.keys()].sort().map(hex => ({ hex, ...derive('#' + hex) }));

if (process.argv.includes('--report')) {
  for (const k of ['same', 'merged', 'shade']) {
    const list = rows.filter(r => r.kind === k);
    console.log(`\n${k.toUpperCase()} (${list.length})`);
    for (const r of list) console.log(`  #${r.hex}  -> ${r.token}${k === 'same' ? '' : '  dE ' + r.d.toFixed(3)}`);
  }
  process.exit(0);
}

// ---- write ----
const pad = (s, n) => s + ' '.repeat(Math.max(1, n - s.length));
let out = `/* ===== THEME: the only place where colors are written =====================================
   Change a value here and every page follows: all shades, tints, transparent variants, shadows and
   gradients of the site are derived from these tokens. Use the tokens (var(--theme-primary)) in new CSS.
   The --c-HEX variables below are the legacy names the pages still use; they are generated by
   scripts/build/build-theme-tokens.js from this block. Do not edit them by hand.
   =========================================================================================== */
:root {
`;
for (const [group, list] of THEME) {
  out += `  /* ${group} */\n`;
  for (const [name, hex, note] of list) out += `  ${pad(name + ': ' + valueOf(name, hex) + ';', 34)}/* ${note} */\n`;
}
out += `}
/* Legacy color names, derived from the THEME tokens (generated). Same: equal to the token. Merged: an invisible
   variant replaced by the token. Shade: a lighter/darker/softer step of the token, recomputed when the token changes. */
:root {
`;
for (const r of rows) out += `  --c-${r.hex}: ${r.value};\n`;
out += `}
/* Transparent variants (generated): the base color at the given opacity. */
:root {
`;
for (const v of alpha) out += `  --c-${v.hex}-a${v.a}: rgb(from var(--c-${v.hex}) r g b / ${v.pct});\n`;
out += '}\n';

let css = fs.readFileSync(FILE, 'utf8');
let s = css.indexOf(START); const e = css.indexOf(END);
if (s < 0) s = css.indexOf('/* Brand names (AGENTS.md palette) */');
if (s < 0 || e < 0 || e < s) throw new Error('color section markers not found');
css = css.slice(0, s) + out + css.slice(e);
fs.writeFileSync(FILE, css);
const c = rows.reduce((o, r) => (o[r.kind] = (o[r.kind] || 0) + 1, o), {});
console.log(`root.css: ${TOKENS.length} theme tokens, ${rows.length} legacy colors (same ${c.same || 0}, merged ${c.merged || 0}, shade ${c.shade || 0}), ${alpha.length} transparent variants`);
