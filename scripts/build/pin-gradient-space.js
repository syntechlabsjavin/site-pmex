// Writes the color space of every CSS gradient explicitly (`in srgb`) when it has none.
//
// Why: a gradient without a color space blends in sRGB only while all its colors are written as hex/rgb(). The
// THEME colors of root.css are derived with relative color syntax (oklch(from ...), rgb(from ...)), and a gradient
// with such colors blends in oklab by default, which shifts its middle tones. `in srgb` keeps the look identical
// whatever notation the colors use. Gradients that already name a space (Tailwind's `in oklab`) are left alone.
//
// Usage: node scripts/build/pin-gradient-space.js [--check]
// Files: dist/css/root.css (declarations only; escaped Tailwind selectors are untouched) and dist/js/*.js.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '../../dist');
const files = [path.join(ROOT, 'css/root.css'), ...fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.js')).map(f => path.join(ROOT, 'js', f))];
const CHECK = process.argv.includes('--check');

const SPACE = /\bin\s+(srgb|srgb-linear|display-p3|a98-rgb|prophoto-rgb|rec2020|lab|oklab|xyz|xyz-d50|xyz-d65|hsl|hwb|lch|oklch)\b/;
const COLOR_START = /^(#|var\(--c-|var\(--theme-|var\(--color-|rgba?\(|hsla?\(|hwb\(|oklch\(|oklab\(|lab\(|lch\(|color\(|color-mix\(|transparent\b|currentcolor\b|black\b|white\b|red\b|green\b|blue\b)/i;

function splitTop(s) {
  const out = []; let depth = 0, cur = '';
  for (const ch of s) {
    if (ch === '(') depth++; else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur); return out;
}

function pin(text) {
  const re = /\b((?:repeating-)?(?:linear|radial|conic)-gradient)\(/g;
  let out = '', last = 0, m, changed = 0;
  while ((m = re.exec(text))) {
    const open = m.index + m[0].length; let depth = 1, i = open;
    for (; i < text.length && depth; i++) { if (text[i] === '(') depth++; else if (text[i] === ')') depth--; }
    if (depth) break;
    const inner = text.slice(open, i - 1), args = splitTop(inner), first = args[0].trim();
    if (SPACE.test(first) || first.startsWith('var(--tw-') || args.length < 2) continue;
    let next;
    if (COLOR_START.test(first)) next = inner.replace(/^(\s*)/, '$1in srgb, ');
    else next = args[0].replace(/(\s*)$/, ' in srgb$1') + ',' + args.slice(1).join(',');
    out += text.slice(last, open) + next; last = i - 1; changed++;
    re.lastIndex = i;
  }
  return { text: out + text.slice(last), changed };
}

let total = 0;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8'), { text, changed } = pin(src);
  if (!changed) continue;
  total += changed;
  console.log(`${path.relative(process.cwd(), f)}: ${changed} gradient${changed > 1 ? 's' : ''}${CHECK ? ' without a color space' : ' pinned to srgb'}`);
  if (!CHECK) fs.writeFileSync(f, text);
}
console.log(total ? (CHECK ? `${total} gradients need a color space; run node scripts/build/pin-gradient-space.js` : `done: ${total}`) : 'every gradient names its color space');
process.exit(CHECK && total ? 1 : 0);
