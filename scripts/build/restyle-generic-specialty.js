// Restyle the generated specialty pages (the small Tailwind template with the "Free Billing Audit" card)
// to match the approved imported pages: hero photo, centered section headings, hover cards, pill buttons
// and the approved horizontal "Free Billing Audit" form card.
//
// Only class strings, the <head>, the hero photo variables and the audit form markup change.
// Text, links and the page's own header, marquee and footer are left alone.
//
// Usage (run from the repo root):
//   node scripts/restyle-generic-specialty.js pediatrics urgent-care --hero=dme-pos-services.webp
//   node scripts/restyle-generic-specialty.js --forms-only        form design on every already restyled page
//   node scripts/restyle-generic-specialty.js --check             list restyled pages whose form is not the approved design
//
// --hero=<file in dist/img>  desktop hero photo (default family-medicine.webp)
// --hero-mobile=<file>       mobile hero photo (default: same as --hero, or family-medicine-mobile.webp without --hero)
// The script is idempotent: running it again on a restyled page changes nothing.
const fs = require('fs');
const path = require('path');

const DIST = 'dist';
const { pageNames, pagePath } = require('../lib/pages');
const CARD_HOVER = 'shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#AAD39C]';
const H2 = 'text-[22px] sm:text-[30px] lg:text-[36px] font-normal text-[#505050] leading-[1.2] mb-3';
const HEAD_BLOCK = 'max-w-[760px] mx-auto text-center mb-8';

const CLASS_MAP = new Map([
  // hero
  ['hero-bg-gradient relative w-full pb-16 pt-14 flex items-center', 'hero-bg-gradient relative w-full border-b border-[#AAD39C] py-22 flex items-center'],
  ['text-[11px] sm:text-[12px] font-bold uppercase tracking-[2px] text-[#3f9a4b] mb-3', 'text-[11px] lg:text-[13px] font-medium tracking-[1px] text-[#3f9a4b] uppercase mb-3'],
  ['text-[22px] sm:text-[30px] lg:text-[36px] font-normal leading-[1.2] mb-4 text-[#505050]', 'text-[22px] sm:text-[30px] lg:text-[36px] font-normal leading-[1.2] mb-5 text-[#505050]'],
  ['text-[13px] sm:text-[15px] text-[#676767] leading-relaxed mb-6 max-w-[480px]', 'text-[14px] sm:text-[16px] text-[#676767] leading-relaxed mb-5 max-w-[540px]'],
  ['hero-actions flex flex-wrap gap-3', 'hero-actions flex flex-wrap items-center gap-4 sm:gap-6'],
  ['inline-flex items-center gap-2 bg-[#3f9a4b] hover:bg-[#2e8a3a] text-white text-[13px] font-semibold px-5 py-3 rounded-xl transition-colors hero-action-pill', 'inline-flex items-center bg-[#AAD39C] text-[#2e4a25] px-6 py-2.5 rounded-full font-normal text-sm transition-colors duration-200 hover:bg-[#9ED08D] hero-action-pill'],
  ['inline-flex items-center gap-2 border border-[#AAD39C] text-[#3f9a4b] hover:bg-[#F8FBF0] text-[13px] font-semibold px-5 py-3 rounded-xl transition-colors hero-action-link', 'inline-flex items-center text-[#3F9A4B] text-[14px] lg:text-[16px] font-normal hover:underline hero-action-link'],
  // sections
  ['py-12 lg:py-16 bg-white border-b border-[#E0E0DA]', 'py-8 lg:py-10 bg-white border-b border-[#AAD39C]'],
  ['py-12 lg:py-16 bg-[#F8FBF0] border-b border-[#AAD39C]', 'py-8 lg:py-10 bg-[#EEF0E8] border-b border-[#AAD39C]'],
  ['py-12 lg:py-16 bg-[#F8FBF0]', 'py-8 lg:py-10 bg-white border-b border-[#AAD39C]'],
  ['max-w-[720px] mb-10', HEAD_BLOCK],
  ['max-w-[660px] mb-8', HEAD_BLOCK],
  ['max-w-[680px] mb-8', HEAD_BLOCK],
  ['text-center mb-8', HEAD_BLOCK],
  ['text-[11px] font-bold uppercase tracking-[2px] text-[#3f9a4b] mb-2', 'text-[12px] font-medium uppercase tracking-[1px] text-[#3f9a4b] mb-2'],
  ['text-[22px] sm:text-[28px] font-normal text-[#505050] leading-snug mb-3', H2],
  ['text-[22px] sm:text-[28px] font-normal text-[#505050] leading-snug mb-2', H2],
  ['text-[22px] sm:text-[28px] font-normal text-[#505050]', H2],
  ['text-[13px] sm:text-[14px] text-[#676767] leading-relaxed', 'text-[14px] sm:text-[16px] text-[#676767] leading-relaxed'],
  ['text-[13px] text-[#676767]', 'text-[14px] sm:text-[16px] text-[#676767]'],
  // service cards
  ['bg-[#F8FBF0] border border-[#AAD39C] rounded-2xl p-5', 'bg-white border border-[#EDEAE0] rounded-2xl p-5 ' + CARD_HOVER],
  ['text-[13px] font-semibold text-[#2e4a25] mb-1', 'text-[15px] font-semibold text-[#2e4a25] mb-1'],
  ['text-[12px] text-[#676767] leading-relaxed', 'text-[13px] text-[#676767] leading-relaxed'],
  // problem cards
  ['bg-white border border-[#E0E0DA] rounded-xl p-4 flex flex-col gap-3', 'bg-white border border-[#EDEAE0] rounded-2xl p-5 flex flex-col gap-3 ' + CARD_HOVER],
  ['text-[12px] sm:text-[13px] text-[#505050] leading-relaxed font-medium', 'text-[13px] sm:text-[14px] text-[#505050] leading-relaxed font-medium'],
  ['text-[11px] text-[#3f9a4b] font-semibold leading-relaxed', 'text-[12px] sm:text-[13px] text-[#3f9a4b] font-semibold leading-relaxed'],
  // denial cards
  ['group bg-gradient-to-b from-[#EDEFE8] to-[#D3D7DF] border border-[#E0E0DA] hover:border-[#AAD39C] rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-lg transition-all duration-300', 'group bg-gradient-to-b from-[#EDEFE8] to-[#D3D7DF] border border-[#E0E0DA] hover:border-[#AAD39C] rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300'],
  ['text-[11px] sm:text-[12px] text-[#676767] leading-relaxed', 'text-[12px] sm:text-[13px] text-[#676767] leading-relaxed'],
  ['text-[11px] text-[#505050] leading-relaxed font-medium', 'text-[12px] sm:text-[13px] text-[#505050] leading-relaxed font-medium'],
  // FAQ
  ['faq-item border border-[#E0E0DA] rounded-xl overflow-hidden', 'faq-item border border-[#EDEAE0] rounded-xl overflow-hidden bg-white shadow-sm transition-colors duration-200 hover:border-[#AAD39C]'],
  ['text-[13px] sm:text-[14px] font-medium text-[#505050]', 'text-[14px] sm:text-[15px] font-medium text-[#505050]'],
  ['text-[12px] sm:text-[13px] text-[#676767] leading-relaxed pt-3', 'text-[13px] sm:text-[14px] text-[#676767] leading-relaxed pt-3'],
  // closing CTA button: pill like the rest of the site
  ['inline-flex items-center gap-2 bg-[#3f9a4b] hover:bg-[#2e8a3a] text-white text-[13px] font-semibold px-6 py-3 rounded-xl transition-colors', 'inline-flex items-center bg-[#AAD39C] text-[#2e4a25] px-6 py-2.5 rounded-full font-normal text-sm transition-colors duration-200 hover:bg-[#9ED08D]'],
]);

const FIELD_CLASS = 'audit-input'; // design-system components (root.css @layer ds, group "audit form")
const BUTTON_CLASS = 'audit-submit';
const CARD_CLASS = 'audit-card';
const PHONE_ICON = '<svg class="icon icon-md t-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><use href="/icons/site-icons.svg#phone-spaced"></use></svg>';

const hasLegacyForm = html => /<section class="specialty-hero-support[^"]*">[\s\S]*?<\/section>/.test(html);
const isApprovedForm = html => html.includes('Inline Form') || html.includes('class="audit-card"');

// Rebuild the legacy centered audit card as the approved horizontal form card, keeping the page's own text.
function applyForm(html) {
  const m = html.match(/<section class="specialty-hero-support[^"]*">[\s\S]*?<\/section>/);
  if (!m || !m[0].includes('<form')) return html;
  const block = m[0];
  const before = block.slice(0, block.indexOf('<form'));
  const formEnd = block.indexOf('</form>') + 7;
  const after = block.slice(formEnd);
  const paras = s => [...s.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map(x => x[1].trim());
  const [eyebrow, sentence] = paras(before);
  const foot = paras(after)[0];
  const fields = [...block.matchAll(/<input\b[^>]*type="([^"]+)"[^>]*placeholder="([^"]*)"[^>]*\/?>/g)].map(x => ({ type: x[1], ph: x[2] }));
  const button = block.match(/<button\b[^>]*>([\s\S]*?)<\/button>/);
  if (!eyebrow || !sentence || fields.length < 3 || !button) return html;
  const phone = /\(?(\d{3})\)?[ -](\d{3})-(\d{4})/;
  const footHtml = foot
    ? foot.replace(phone, (all, a, b, c) => `<a href="tel:${a}${b}${c}" class="inline-link">${PHONE_ICON}${all}</a>`)
    : '';
  const inputs = fields.slice(0, 3).map(f => `<input type="${f.type}" placeholder="${f.ph}" required\n            class="${FIELD_CLASS}" />`).join('\n          ');
  const next = `<section class="specialty-hero-support pmex-section section-rule bg-white">
    <div class="pmex-container">
      <div class="${CARD_CLASS}">
        <p class="t-sm ta-center fw-medium t-caps t-accent mb-sm">${eyebrow}</p>
        <!-- Title -->
        <h3 class="t-xl ta-center fw-normal mb-xl t-text ls-wide">${sentence}</h3>
        <!-- Inline Form -->
        <form class="audit-fields" onsubmit="event.preventDefault();">
          ${inputs}
          <button type="submit" class="${BUTTON_CLASS}">${button[1].trim()}</button>
        </form>${footHtml ? `
        <p class="audit-phone">${footHtml}</p>` : ''}
      </div>
    </div>
  </section>`;
  return html.replace(block, () => next);
}

// root.css blocks used by restyled specialty pages (same list as aba-therapy and telehealth).
const ROOT_BLOCKS = 'site-buttons style site-faq-accordion navbar-d90c332f services-mega';

function restyle(html, opts) {
  let h = html;
  // Whole class values only, so no key can clash with a longer one.
  h = h.replace(/class="([^"]*)"/g, (m, c) => (CLASS_MAP.has(c) ? 'class="' + CLASS_MAP.get(c) + '"' : m));
  // Head: same lean set as the imported pages. The old palette/layout/typography/motion layers fight
  // the Tailwind classes with !important rules (and hide the hero photo), so they are dropped.
  if (/specialty-site-palette|reference-typography|specialty-homepage-layout/.test(h.slice(0, h.indexOf('</head>')))) {
    const title = h.match(/<title>[\s\S]*?<\/title>/)[0];
    const desc = h.match(/<meta name="description"[^>]*>/)[0];
    const head = `<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${title}
  ${desc}
  <link rel="stylesheet" href="/css/root.css"/>
  <script src="/js/demo-modal.js" defer></script>
  <script src="/js/nav-dropdown.js" defer></script>
  <script src="/js/marquee-track.js" defer data-specialty-marquee-script></script>
  <script src="/js/specialty-content.js" defer data-specialty-runtime></script>
</head>`;
    h = h.replace(/<head>[\s\S]*?<\/head>/, head);
    // One stylesheet (AGENTS.md): the root.css blocks used are listed in data-css on <html>.
    h = h.replace(/<html\b([^>]*)>/, (_, attrs) => '<html' + attrs.replace(/\sdata-css="[^"]*"/, '') + ' data-css="' + ROOT_BLOCKS + '">');
  }
  // Hero photo (any existing --hero-bg-* vars, or the old behaviorbg default)
  const desktop = opts.hero || 'family-medicine.webp';
  const mobile = opts.heroMobile || opts.hero || 'family-medicine-mobile.webp';
  const heroStyle = `style="--hero-bg-mobile: url('/img/${mobile}'); --hero-bg-desktop: url('/img/${desktop}');"`;
  if (/--hero-bg-(mobile|desktop):/.test(h)) {
    h = h.replace(
      /style="--hero-bg-mobile: url\('\.\/img\/[^']+'\); --hero-bg-desktop: url\('\.\/img\/[^']+'\);(?: --hero-bg-blur: [^"]+;)?"/,
      heroStyle
    );
  } else {
    h = h.replace(
      /style="--hero-bg-mobile: url\('\.\/img\/behaviorbgm\.jpeg'\); --hero-bg-desktop: url\('\.\/img\/behaviorbg\.jpeg'\); --hero-bg-blur: 1px;"/,
      heroStyle
    );
  }
  // Hero actions: phone link first, demo pill second (same order as the imported pages).
  h = h.replace(
    /(<div class="hero-actions[^"]*">)\s*(<a [^>]*hero-action-pill[^>]*>[\s\S]*?<\/a>)\s*(<a [^>]*hero-action-link[^>]*>[\s\S]*?<\/a>)\s*(<\/div>)/,
    '$1\n$3\n$2\n$4'
  );
  return applyForm(h);
}

function restyledPages() {
  return pageNames().filter(f => {
    const h = fs.readFileSync(pagePath(f), 'utf8');
    return hasLegacyForm(h) && /hero-bg-gradient[^"]*border-\[#AAD39C\] py-22/.test(h);
  });
}

function main() {
  const args = process.argv.slice(2);
  const opt = n => (args.find(a => a.startsWith('--' + n + '=')) || '').split('=')[1];
  const opts = { hero: opt('hero'), heroMobile: opt('hero-mobile') };
  const named = args.filter(a => !a.startsWith('--')).map(a => path.basename(a, '.html'));
  if (args.includes('--check')) {
    const bad = restyledPages().filter(f => !isApprovedForm(fs.readFileSync(pagePath(f), 'utf8')));
    console.log(JSON.stringify({ restyledPages: restyledPages().length, formNotApproved: bad }, null, 2));
    if (bad.length) process.exitCode = 1;
    return;
  }
  const slugs = named.length ? named : args.includes('--forms-only') ? restyledPages().map(f => f.replace(/\.html$/, '')) : [];
  if (!slugs.length) { console.log('Name the pages to restyle, or use --forms-only / --check.'); return; }
  for (const slug of slugs) {
    const file = pagePath(slug + '.html');
    const raw = fs.readFileSync(file, 'utf8');
    const crlf = raw.includes('\r\n');
    const html = raw.replace(/\r\n/g, '\n');
    let next = args.includes('--forms-only') ? applyForm(html) : restyle(html, opts);
    if (next === html) { console.log('unchanged', slug); continue; }
    if (crlf) next = next.replace(/\n/g, '\r\n');
    fs.writeFileSync(file, next);
    console.log('updated', slug);
  }
}

if (require.main === module) main();
module.exports = { restyle, applyForm, restyledPages };
