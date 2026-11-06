const fs = require('fs');
const p = 'dist/css/specialty-site-palette.css';
let t = fs.readFileSync(p, 'utf8');
const before = t;

// Fix broken attribute selectors missing closing ]
// Wrong: [class*="bg-[#3f9a"]:not(...)
// Right: [class*="bg-[#3f9a"]:not(...)
t = t.replace(
  /\[class\*="bg-\[#(3f9a|3F9A|AAD39C)":not\(\.hero-action-link\)/g,
  '[class*="bg[FIX]#$1"]:not(.hero-action-link)'
);
// The above used a placeholder - do it properly:
t = before.replace(
  /\[class\*="(bg-\[#(?:3f9a|3F9A|AAD39C))":not\(\.hero-action-link\)/g,
  '[class*="$1"]:not(.hero-action-link)'
);

console.log('changed', t !== before);
const lines = t.split(/\n/);
for (let i = 91; i <= 94; i++) console.log(i + 1, JSON.stringify(lines[i]));
fs.writeFileSync(p, t);
