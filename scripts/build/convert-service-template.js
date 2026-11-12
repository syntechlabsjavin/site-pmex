// Moves the imported service and platform template pages (data-bh-imported, data-platform-family) onto the shared
// design-system components, section by section. The text, links, ids and form fields of each page stay; only the
// markup around them changes. Run it again on a converted page: nothing changes.
//
// Sections converted so far:
//   form   the consultation card below the marquee -> the approved horizontal audit form card (audit-card ...)
//   hero   layout wrapper without utilities (the template shows it as a block), copy -> hero-text,
//          actions -> hero-actions-row, the outline link keeps only data-site-button="link" (it styles it)
//
// Usage: node scripts/build/convert-service-template.js [--dry] [page ...]   (default: every template page)
const fs = require('fs');
const { pageFiles } = require('../lib/pages');
const DRY = process.argv.includes('--dry');
const only = process.argv.slice(2).filter(a => !a.startsWith('--'));
const PHONE_ICON = '<svg class="icon-md t-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="/icons/site-icons.svg#phone-spaced"></use></svg>';

const inner = (s, tag) => (s.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`)) || [])[1];

function convertForm(html) {
  const m = html.match(/<section class="pmex-section specialty-hero-support">[\s\S]*?<\/section>/);
  if (!m) return html;
  const block = m[0];
  const head = block.slice(0, block.indexOf('<form'));
  const paras = [...head.matchAll(/<(p|h[2-4])\b[^>]*>([\s\S]*?)<\/\1>/g)].map(x => x[2].trim());
  const tail = block.slice(block.indexOf('</form>'));
  const foot = (tail.match(/<p\b[^>]*>([\s\S]*?)<\/p>/) || [])[1];
  const form = block.match(/<form\b([^>]*)>([\s\S]*?)<\/form>/);
  if (!form || paras.length < 2) return html;
  const attrs = form[1].replace(/\sclass="[^"]*"/, '');
  // fields: inputs keep their type and placeholder, the select keeps its options
  const fields = [];
  for (const f of form[2].matchAll(/<input\b[^>]*>|<select\b[^>]*>[\s\S]*?<\/select>/g)) {
    const t = f[0];
    if (t.startsWith('<input')) {
      const type = (t.match(/type="([^"]*)"/) || [])[1] || 'text', ph = (t.match(/placeholder="([^"]*)"/) || [])[1] || '';
      fields.push(`<input type="${type}" placeholder="${ph}" class="audit-input" />`);
    } else {
      fields.push(`<select class="audit-input">${inner(t, 'select').trim()}</select>`);
    }
  }
  const button = form[2].match(/<button\b([^>]*)>([\s\S]*?)<\/button>/);
  const btnAttrs = button[1].replace(/\sclass="[^"]*"/, '');
  const footHtml = foot ? foot.replace(/\(?(\d{3})\)?[ -](\d{3})-(\d{4})/, (all, a, b, c) => `<a href="tel:${a}${b}${c}" class="inline-link">${PHONE_ICON}${all}</a>`) : '';
  const next = `<section class="pmex-section specialty-hero-support section-rule bg-white">
  <div class="pmex-container">
    <div class="audit-card">
      <p class="t-2xl ta-center fw-normal t-text mb-sm">${paras[0]}</p>
      <p class="t-md ta-center t-text mb-xl">${paras[1]}</p>
      <form${attrs} class="audit-fields">
        ${fields.join('\n        ')}
        <button${btnAttrs} class="audit-submit">${button[2].trim()}</button>
      </form>${footHtml ? `\n      <p class="audit-phone">${footHtml}</p>` : ''}
    </div>
  </div>
</section>`;
  return html.replace(block, () => next);
}


function convertHero(html) {
  return html
    .replace('<div data-hero-layout class="u-flex u-flex-col u-lg-flex-row u-lg-items-center u-lg-justify-between u-gap-10">', '<div data-hero-layout>')
    .replace('<div data-hero-copy class="u-max-w-600px">', '<div data-hero-copy class="hero-text">')
    .replace(/(<div data-hero-copy class="hero-text">[\s\S]*?)<div class="u-flex u-flex-wrap u-gap-3 u-mb-8">/, '$1<div class="hero-actions-row">')
    .replace(/(<a data-site-button="link"[^>]*?)\sclass="u-inline-flex u-items-center u-gap-2 u-border u-border-AAD39C u-text-(?:505050|2E4A25) u-hov-bg-F8FBF0 u-text-14px u-font-semibold u-px-6 u-py-3-5 u-rounded-xl u-transition-colors"/, '$1')
    .replace('<section data-specialty-hero class="pmex-section hero-glow hero-bg-gradient u-w-full">', '<section data-specialty-hero class="pmex-section hero-glow hero-bg-gradient">');
}

let changed = 0;
for (const f of pageFiles()) {
  if (only.length && !only.some(o => f.endsWith(o))) continue;
  const html = fs.readFileSync(f, 'utf8');
  if (!/data-bh-imported|data-platform-family/.test(html)) continue;
  const next = convertHero(convertForm(html));
  if (next !== html) { changed++; if (!DRY) fs.writeFileSync(f, next); }
}
console.log(`${changed} pages changed`);
