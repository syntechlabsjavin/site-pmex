// Design-system guard (npm run check:css). Fails when:
//   - a page, partial or script uses a Tailwind utility class (old names such as px-4, text-[14px], bg-[var(...)])
//   - root.css writes a color literal outside the THEME block (hex, rgb(), hsl(), oklch() without "from")
//   - a page loads another stylesheet or has an inline <style> block
//   - root.css grows past the line budget (docs/DESIGN-SYSTEM-PLAN.md)
// Usage: node scripts/checks/check-css.js [--max-lines=15000]
const fs = require('fs'), path = require('path');
const { pageFiles } = require('../lib/pages');
const MAX = Number((process.argv.find(a => a.startsWith('--max-lines=')) || '=15000').split('=')[1]);
const problems = [];

// Tailwind-shaped class names (variants, arbitrary values, numeric scales). Design-system classes never match:
// they use named steps (mb-md, t-sm) or the u- prefix.
const TW = /^(?:(?:sm|md|lg|xl|2xl|hover|focus|group-hover|active|first|last):)+\S+$|^-?(?:p[xytrbl]?|m[xytrbl]?|gap(?:-[xy])?|space-[xy]|[wh]|min-[wh]|max-[wh]|top|left|right|bottom|inset(?:-[xy])?|z|translate-[xy]|rounded(?:-[a-z]+)?|border(?:-[a-z]+)?|bg|text|font|leading|tracking|shadow|opacity|grid-cols|col-span|duration|from|via|to)-(?:\d|\[|px$|full$|auto$|screen$)/;
const files = [...pageFiles(), ...fs.readdirSync('dist/partials').map(f => path.join('dist/partials', f))];
const rootCss = fs.readFileSync('dist/css/root.css', 'utf8');
const DS = new Set([...rootCss.slice(rootCss.indexOf('DESIGN SYSTEM (layer ds)')).matchAll(/\.([a-z][\w-]*)/g)].map(m => m[1]));
const isTw = c => c && !DS.has(c) && TW.test(c);
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  for (const m of html.matchAll(/\sclass="([^"]*)"/g)) for (const c of m[1].split(/\s+/)) if (isTw(c)) { problems.push(`${f}: Tailwind class "${c}"`); break; }
  const links = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]*>/g)].filter(l => !l[0].includes('/css/root.css') && !l[0].includes('fonts.googleapis'));
  if (links.length) problems.push(`${f}: extra stylesheet ${links[0][0]}`);
  if (/<style[\s>]/.test(html)) problems.push(`${f}: inline <style> block`);
}
for (const f of fs.readdirSync('dist/js').filter(x => x.endsWith('.js'))) {
  const js = fs.readFileSync(path.join('dist/js', f), 'utf8');
  for (const m of js.matchAll(/classList\.\w+\(([^)]*)\)|className\s*=\s*(['"`])([^'"`]*)\2/g)) {
    const toks = (m[1] || m[3] || '').match(/[\w:[\]()\-./%#]+/g) || [];
    const bad = toks.find(isTw); if (bad) problems.push(`dist/js/${f}: Tailwind class "${bad}"`);
  }
}

const css = fs.readFileSync('dist/css/root.css', 'utf8');
const themeStart = css.indexOf('/* ===== THEME'), themeEnd = css.indexOf('/* Design tokens */');
// comments and @property initial values (the allowed exception) are not checked
const outside = (css.slice(0, themeStart) + css.slice(themeEnd)).replace(/\/\*[\s\S]*?\*\//g, '').replace(/initial-value:[^;]*;/g, '');
// hex inside selectors (#id) is not a color: keep only values after ":" or inside declarations
const colorValues = [...outside.matchAll(/:[^;{}]*?(#[0-9a-fA-F]{3,8}\b|(?<![\w-])(?:rgba?|hsla?|oklch|oklab|lab|lch)\((?!from)[^)]*\))/g)].map(m => m[1])
  .filter(v => !/^(?:rgb|rgba)\(0 0 0 \/ 0%\)$/.test(v));
if (colorValues.length) problems.push(`root.css: ${colorValues.length} color literals outside THEME, e.g. ${[...new Set(colorValues)].slice(0, 5).join(', ')}`);
const lines = css.split('\n').length;
if (lines > MAX) problems.push(`root.css: ${lines} lines (budget ${MAX})`);

console.log(problems.length ? problems.slice(0, 40).join('\n') + (problems.length > 40 ? `\n... ${problems.length - 40} more` : '') : `ok: no Tailwind classes, no color literals outside THEME, root.css ${lines} lines`);
process.exit(problems.length ? 1 : 0);
