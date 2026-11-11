// Merges near-identical page blocks of dist/css/root.css into shared blocks.
//
// Every rule of the given blocks is compared (block name ignored, @media context kept). Rules found in the same
// set of blocks go into one block: rules in all of them -> <name>, rules shared by some -> <name>-2, <name>-3 ...
// (rename them with --as), rules of a single page stay in a small block with that page's own name.
// All new blocks are written where the first of the merged blocks was, and every page lists its new blocks in
// <html data-css="..."> instead of the old name.
//
// Usage: node scripts/build/merge-css-blocks.js --name=service-detail [--as=service-detail-2:service-rcm ...] [--dry] block ...
const fs = require('fs'), path = require('path');
const { pageRels, pagePath } = require('../lib/pages');
const FILE = path.join(__dirname, '../../dist/css/root.css');
const args = process.argv.slice(2);
const NAME = (args.find(a => a.startsWith('--name=')) || '').slice(7);
const AS = new Map(args.filter(a => a.startsWith('--as=')).map(a => a.slice(5).split(':')));
const DRY = args.includes('--dry');
const MEMBERS = args.filter(a => !a.startsWith('--'));
if (!NAME || MEMBERS.length < 2) throw new Error('usage: --name=<new block> block block ...');

const lines = fs.readFileSync(FILE, 'utf8').split('\n');
const HEAD = /^\/\* ===== .*\[data-css~="([^"]+)"\]/;
const sections = []; let cur = null;
lines.forEach((l, i) => { const m = l.match(HEAD); if (m) { cur = { name: m[1], start: i, end: i + 1 }; sections.push(cur); } else if (cur) cur.end = i + 1; });

// Parse CSS text into flat items { ctx, rule }: ctx is the @media/@supports prelude chain ('' at top level).
function parse(text, ctx = '') {
  const items = []; let i = 0;
  text = text.replace(/\/\*[\s\S]*?\*\//g, '');
  while (i < text.length) {
    const open = text.indexOf('{', i); if (open < 0) break;
    const prelude = text.slice(i, open).trim();
    let depth = 1, j = open + 1;
    for (; j < text.length && depth; j++) { if (text[j] === '{') depth++; else if (text[j] === '}') depth--; }
    const body = text.slice(open + 1, j - 1);
    if (/^@(media|supports|container|layer)\b/.test(prelude) && body.includes('{')) items.push(...parse(body, (ctx ? ctx + ' ' : '') + prelude.replace(/\s+/g, ' ')));
    else items.push({ ctx, rule: prelude.replace(/\s+/g, ' ') + ' { ' + body.trim().replace(/\s*\n\s*/g, ' ') + ' }' });
    i = j;
  }
  return items;
}

const data = MEMBERS.map(name => {
  const secs = sections.filter(s => s.name === name);
  if (!secs.length) throw new Error('block not found: ' + name);
  const text = secs.map(s => lines.slice(s.start + 1, s.end).join('\n')).join('\n').split(`data-css~="${name}"`).join('data-css~="X"');
  return { name, secs, items: parse(text) };
});
const key = it => it.ctx + '\u0001' + it.rule;

// which members hold each rule
const holders = new Map();
data.forEach((d, n) => d.items.forEach(it => { const k = key(it); if (!holders.has(k)) holders.set(k, new Set()); holders.get(k).add(n); }));
const sig = k => [...holders.get(k)].sort((a, b) => a - b).join(',');

// groups in order of first appearance, walking the member with the most rules first
const order = [...data].sort((a, b) => b.items.length - a.items.length);
const groups = new Map();
for (const d of order) for (const it of d.items) {
  const s = sig(key(it));
  if (!groups.has(s)) groups.set(s, { members: s.split(',').map(Number), items: [], keys: new Set() });
  const g = groups.get(s); if (!g.keys.has(key(it))) { g.keys.add(key(it)); g.items.push(it); }
}
const all = MEMBERS.map((_, i) => i).join(',');
let extra = 1;
const named = [...groups.entries()].sort((a, b) => (b[0] === all) - (a[0] === all) || b[1].members.length - a[1].members.length).map(([s, g]) => {
  let name = s === all ? NAME : g.members.length === 1 ? MEMBERS[g.members[0]] : `${NAME}-${++extra}`;
  name = AS.get(name) || name;
  return { name, ...g };
});

// short rules on one line, long ones with one declaration per line (nested bodies such as @keyframes stay as they are)
function format(rule, pad) {
  if (pad.length + rule.length <= 140 || /\{[^}]*\{/.test(rule)) return pad + rule + '\n';
  const open = rule.indexOf('{'), sel = rule.slice(0, open).trim(), body = rule.slice(open + 1, rule.lastIndexOf('}'));
  const decls = body.match(/(?:[^;(]|\([^)]*\))+/g).map(d => d.trim()).filter(Boolean);
  return `${pad}${sel} {\n${decls.map(d => `${pad}  ${d};\n`).join('')}${pad}}\n`;
}

function emit(g) {
  let out = `/* ===== ${g.members.length === MEMBERS.length ? 'shared' : g.members.length > 1 ? 'shared by ' + g.members.map(i => MEMBERS[i]).join(', ') : 'page only'}  [data-css~="${g.name}"] ===== */\n`;
  let ctx = '';
  for (const it of g.items) {
    if (it.ctx !== ctx) { if (ctx) out += '}\n'; if (it.ctx) out += `${it.ctx} {\n`; ctx = it.ctx; }
    out += format(it.rule.split('data-css~="X"').join(`data-css~="${g.name}"`), ctx ? '  ' : '');
  }
  if (ctx) out += '}\n';
  return out;
}

for (const g of named) console.log(`${g.name.padEnd(36)} ${String(g.items.length).padStart(4)} rules  <- ${g.members.map(i => MEMBERS[i]).join(', ')}`);
const before = data.reduce((n, d) => n + d.secs.reduce((m, s) => m + s.end - s.start, 0), 0);
const text = named.map(emit).join('');
console.log(`lines: ${before} -> ${text.split('\n').length - 1}`);
if (DRY) process.exit(0);

// write root.css: new blocks at the first member's place, old sections removed
const first = Math.min(...data.flatMap(d => d.secs.map(s => s.start)));
const drop = new Set(data.flatMap(d => d.secs.flatMap(s => Array.from({ length: s.end - s.start }, (_, k) => s.start + k))));
const out = [];
lines.forEach((l, i) => { if (i === first) out.push(...text.replace(/\n$/, '').split('\n')); if (!drop.has(i)) out.push(l); });
fs.writeFileSync(FILE, out.join('\n'));

// pages: old name -> its new blocks, in the order of the new blocks
const blocksOf = MEMBERS.map((_, i) => named.filter(g => g.members.includes(i)).map(g => g.name));
let pages = 0;
for (const rel of pageRels()) {
  const file = pagePath(rel), html = fs.readFileSync(file, 'utf8');
  const next = html.replace(/(<html\b[^>]*\bdata-css=")([^"]*)(")/, (m, a, list, z) => {
    const res = [];
    for (const n of list.split(/\s+/).filter(Boolean)) { const i = MEMBERS.indexOf(n); for (const k of i < 0 ? [n] : blocksOf[i]) if (!res.includes(k)) res.push(k); }
    return a + res.join(' ') + z;
  });
  if (next !== html) { pages++; fs.writeFileSync(file, next); }
}
console.log(`${pages} pages updated`);
