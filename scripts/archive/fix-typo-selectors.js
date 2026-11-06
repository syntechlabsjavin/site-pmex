const fs = require('fs');
const p = 'dist/css/reference-typography.css';
let t = fs.readFileSync(p, 'utf8');
const before = t;
// Fix: [class*="bg-[#3f9a"]:not  ->  [class*="bg-[#3f9a"]:not
t = t.replace(
  /\[class\*="(bg-\[#(?:3f9a|3F9A))":not\(/g,
  '[class*="$1"]:not('
);
console.log('changed', t !== before);
const hits = [...t.matchAll(/\[class\*="bg-\[#[^\]]+/g)].map((m) => m[0]);
console.log(hits.slice(0, 12));
fs.writeFileSync(p, t);
