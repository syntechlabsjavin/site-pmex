// Writes every rule of the older blocks of dist/css/root.css on one line: "selector { a: 1; b: 2; }".
// Formatting only: the script stops without writing when the CSS without whitespace and comments differs from
// the original. Scope: from the first page block to the start of @layer ds (the THEME block and the generated
// legacy colors stay as theme:build writes them; the ds layer has its own nested format).
// Rules whose body holds a comment, and @keyframes / @font-face / @property bodies, are left as they are.
// Usage: node scripts/build/compact-css.js [--dry]
const fs = require('fs');
const FILE = 'dist/css/root.css';
const DRY = process.argv.includes('--dry');
const src = fs.readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n');
const start = src.indexOf('/* ===== inline <style> block');
const end = src.search(/^@layer ds\s*\{/m);
if (start < 0 || end < start) throw new Error('markers not found');
const head = src.slice(0, start), body = src.slice(start, end), tail = src.slice(end);

// whitespace outside strings collapsed to one space
const squash = t => {
  let out = '', q = null, sp = false;
  for (const ch of t) {
    if (q) { out += ch; if (ch === q) q = null; continue; }
    if (ch === '"' || ch === "'") { if (sp) { out += ' '; sp = false; } q = ch; out += ch; continue; }
    if (/\s/.test(ch)) { sp = true; continue; }
    if (sp && out) out += ' ';
    sp = false; out += ch;
  }
  return out.trim();
};
// split a declaration block at top-level semicolons
const decls = t => {
  const out = []; let cur = '', q = null, d = 0;
  for (const ch of t) {
    if (q) { cur += ch; if (ch === q) q = null; continue; }
    if (ch === '"' || ch === "'") q = ch;
    else if (ch === '(') d++;
    else if (ch === ')') d--;
    else if (ch === ';' && !d) { out.push(cur); cur = ''; continue; }
    cur += ch;
  }
  out.push(cur);
  return out.map(squash).filter(Boolean);
};

// walk the text: comments and at-rule statements kept, rule blocks rebuilt, at-rule blocks recursed
function format(text, indent) {
  const out = []; let i = 0;
  const skipWs = () => { while (i < text.length && /\s/.test(text[i])) i++; };
  while (true) {
    skipWs();
    if (i >= text.length) break;
    if (text.startsWith('/*', i)) { const j = text.indexOf('*/', i) + 2; out.push(indent + text.slice(i, j).trim()); i = j; continue; }
    // read a prelude up to { or ; (outside strings and parentheses)
    let j = i, q = null, d = 0;
    for (; j < text.length; j++) {
      const ch = text[j];
      if (q) { if (ch === q) q = null; continue; }
      if (ch === '"' || ch === "'") q = ch;
      else if (ch === '(') d++;
      else if (ch === ')') d--;
      else if (!d && (ch === '{' || ch === ';')) break;
    }
    const prelude = squash(text.slice(i, j));
    if (text[j] === ';') { out.push(indent + prelude + ';'); i = j + 1; continue; }
    // matching close brace
    let k = j + 1; d = 1; q = null;
    for (; k < text.length && d; k++) {
      const ch = text[k];
      if (q) { if (ch === q) q = null; continue; }
      if (ch === '"' || ch === "'") q = ch;
      else if (text.startsWith('/*', k)) { k = text.indexOf('*/', k) + 1; }
      else if (ch === '{') d++;
      else if (ch === '}') d--;
    }
    const inner = text.slice(j + 1, k - 1);
    if (/^@(media|supports|layer|container|scope)\b/.test(prelude)) {
      out.push(indent + prelude + ' {', ...format(inner, indent + '  '), indent + '}');
    } else if (prelude.startsWith('@') || inner.includes('/*') || inner.includes('{')) {
      out.push(indent + text.slice(i, k).trim()); // keep as written
    } else {
      const ds = decls(inner);
      out.push(indent + prelude + ' { ' + ds.join('; ') + (ds.length ? '; ' : '') + '}');
    }
    i = k;
  }
  return out;
}

const next = format(body, '').join('\n') + '\n';
const bare = t => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, '').replace(/;}/g, '}');
if (bare(next) !== bare(body)) {
  const a = bare(body), b = bare(next); let p = 0; while (a[p] === b[p]) p++;
  throw new Error('content changed near: ' + a.slice(p - 80, p + 80) + '\n---\n' + b.slice(p - 80, p + 80));
}
const before = body.split('\n').length, after = next.split('\n').length;
console.log(`older blocks: ${before} -> ${after} lines (CSS unchanged apart from whitespace)`);
if (!DRY) fs.writeFileSync(FILE, head + next + tail);
