const fs = require('fs');
const path = require('path');
const os = require('os');
const pictograph = /\p{Extended_Pictographic}|\p{Regional_Indicator}/u;
const keep = /^[\u00a9\u00ae\u2122\u2190-\u21ff]$/u;
function decode(value) {
  return value.replace(/&#(x[0-9a-f]+|\d+);/gi, (all, n) => {
    const code = n[0].toLowerCase() === 'x' ? parseInt(n.slice(1), 16) : Number(n);
    return code <= 0x10ffff ? String.fromCodePoint(code) : all;
  });
}
function strip(value) {
  return value.replace(/&#(?:x[0-9a-f]+|\d+);|[\s\S]/giu, token => {
    const char = decode(token);
    if (char === '\u2705' || char === '\u2611') return '\u2713';
    if (char === '\u274c' || char === '\u274e') return '\u00d7';
    if (/^[\ufe0e\ufe0f\u200d\u20e3\u{1f3fb}-\u{1f3ff}\u{e0020}-\u{e007f}]$/u.test(char)) return '';
    return pictograph.test(char) && !keep.test(char) ? '' : token;
  });
}
function cleanMarkup(html) {
  // Remove decorative leaf wrappers too, so empty icon tiles cannot remain.
  html = html.replace(/<(div|span|i)\b([^>]*)>([^<>]*)<\/\1>/gi, (all, tag, attrs, text) => {
    const decoded = decode(text);
    if (pictograph.test(decoded) && !strip(text).trim() && !/\b(?:id|role|tabindex)\s*=/.test(attrs)) return '';
    return all;
  });
  return html.split(/(<[^>]+>)/g).map(part => part.startsWith('<') ? part : strip(part)).join('');
}
function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(e => e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]);
}
function run(check) {
  const selected = process.argv.slice(2).filter(a => !a.startsWith('--'));
  const files = selected.length ? selected.map(f => require('../lib/pages').pagePath(f)) : walk('dist').filter(f => /\.(html|js|css)$/.test(f));
  const backup = check ? null : fs.mkdtempSync(path.join(os.tmpdir(),'pmex-icons-'));
  const changed = [];
  for (const file of files) {
    const original = fs.readFileSync(file,'utf8');
    const next = file.endsWith('.html') ? cleanMarkup(original) : strip(original);
    if (next === original) continue;
    changed.push(file);
    if (!check) {
      const target = path.join(backup,file);
      fs.mkdirSync(path.dirname(target),{recursive:true});
      fs.writeFileSync(target,original);
      fs.writeFileSync(file,next);
    }
  }
  console.log(JSON.stringify({[check?'remaining':'updated']:changed.length, files:changed, backup},null,2));
  if (check && changed.length) process.exitCode=1;
}
module.exports={cleanMarkup,strip};
if (require.main===module) run(process.argv.includes('--check'));
