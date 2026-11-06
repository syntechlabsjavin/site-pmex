const fs = require('fs');
const p = 'dist/css/reference-typography.css';
let t = fs.readFileSync(p, 'utf8');
const idxs = [];
let pos = 0;
while ((pos = t.indexOf('bg-[#3f9a', pos)) !== -1) {
  idxs.push(pos);
  pos += 1;
}
for (const i of idxs) {
  console.log(JSON.stringify(t.slice(i, i + 30)));
  console.log([...t.slice(i, i + 20)].map((c) => c.charCodeAt(0)));
}

// Force-fix any missing ]
const before = t;
t = t.replace(/\[class\*="bg-\[#(3f9a|3F9A)":not\(/g, '[class*="bg[#$1"]:not(');
// Oops wrong - do correctly:
t = before.replace(/\[class\*="bg-\[#(3f9a|3F9A)":not\(/g, '[class*="bg[#$1"]:not(');
t = before.replace(/\[class\*="bg-\[#(3f9a|3F9A)":not\(/g, (m, hex) => `[class*="bg[#${hex}"]:not(`);
console.log('attempt1', t !== before);

// More explicit
t = before;
const broken = '[class*="bg-[#3f9a":not(';
const fixed = '[class*="bg-[#3f9a"]:not(';
const broken2 = '[class*="bg-[#3F9A":not(';
const fixed2 = '[class*="bg-[#3F9A"]:not(';
console.log('has broken lower', t.includes(broken));
console.log('has broken upper', t.includes(broken2));
t = t.split(broken).join(fixed).split(broken2).join(fixed2);
console.log('changed', t !== before);
fs.writeFileSync(p, t);
