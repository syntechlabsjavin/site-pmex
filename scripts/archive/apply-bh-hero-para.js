const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const files = fs.readdirSync(dist).filter((f) => f.endsWith('.html'));
const CLASS = 'bh-hero-para';

function collectLeadingHeroParas(html) {
  const titleRe = /<h1\b[^>]*\bclass="[^"]*\bbh-hero-title\b[^"]*"[^>]*>/i;
  const tm = titleRe.exec(html);
  if (!tm) return [];
  const afterTitle = html.indexOf('</h1>', tm.index);
  if (afterTitle < 0) return [];

  const sliceStart = afterTitle;
  const slice = html.slice(sliceStart, sliceStart + 8000);
  const stop = slice.search(/<(?:section|h2|form)\b/i);
  const region = stop > 0 ? slice.slice(0, stop) : slice;

  const leading = [];
  let cursor = 0;
  const re = /<p\b([^>]*)>/gi;
  let m;
  while ((m = re.exec(region))) {
    const between = region.slice(cursor, m.index).replace(/<!--[\s\S]*?-->/g, '').trim();
    if (leading.length === 0) {
      const head = region
        .slice(0, m.index)
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/^<\/h1>/i, '')
        .trim();
      if (head !== '') break;
    } else if (between !== '') {
      break;
    }

    const openTag = m[0];
    const openAbs = sliceStart + m.index;
    const closeRel = region.indexOf('</p>', m.index + openTag.length);
    if (closeRel < 0) break;
    const closeAbs = sliceStart + closeRel + 4;
    leading.push({ openAbs, openTag, closeAbs });
    cursor = closeRel + 4;
    re.lastIndex = cursor;
  }
  return leading;
}

function toHeroParaTag(openTag) {
  let tag = openTag;
  if (/\bclass="[^"]*"/.test(tag)) {
    tag = tag.replace(/\bclass="[^"]*"/, `class="${CLASS}"`);
  } else {
    tag = tag.replace(/^<p\b/i, `<p class="${CLASS}"`);
  }
  tag = tag
    .replace(/\s*data-reference-description(?:="[^"]*")?/gi, '')
    .replace(/\s*style="[^"]*"/gi, '');
  return tag;
}

let pages = 0;
let paras = 0;

for (const f of files) {
  const filePath = path.join(dist, f);
  let html = fs.readFileSync(filePath, 'utf8');
  if (!/\bbh-hero-title\b/.test(html)) continue;

  const leading = collectLeadingHeroParas(html);
  if (!leading.length) continue;

  let changed = false;
  // Replace from end so offsets stay valid
  for (let i = leading.length - 1; i >= 0; i--) {
    const { openAbs, openTag } = leading[i];
    const next = toHeroParaTag(openTag);
    if (next === openTag && /\bclass="bh-hero-para"/.test(openTag)) continue;
    html = html.slice(0, openAbs) + next + html.slice(openAbs + openTag.length);
    changed = true;
    paras++;
  }

  if (changed) {
    fs.writeFileSync(filePath, html);
    pages++;
    console.log('OK', f, 'paras=' + leading.length);
  }
}

console.log('\npages', pages, 'para-tags-updated', paras);
