const fs = require('fs');
const p = 'dist/css/specialty-site-palette.css';
let t = fs.readFileSync(p, 'utf8');
const line = t.split(/\n/)[91];
console.log(line);
for (let i = 0; i < line.length; i++) {
  const ch = line[i];
  if ('[]#"3f9a:'.includes(ch) || (i > 40 && i < 80)) {
    process.stdout.write(`${i}:${JSON.stringify(ch)} `);
  }
}
console.log('\n---');
const idx = line.indexOf('3f9a');
console.log('around 3f9a:', JSON.stringify(line.slice(idx, idx + 20)));
console.log('codes:', [...line.slice(idx, idx + 20)].map((c) => c.charCodeAt(0)));
