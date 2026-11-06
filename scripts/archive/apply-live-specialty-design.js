/**
 * Apply live/approved specialty card design (PT / Cardiology / Rheumatology)
 * to long-form specialty pages WITHOUT changing copy text.
 *
 * Rewrites wrappers/classes only. Verifies main text length stays stable.
 *
 * Usage: node scripts/apply-live-specialty-design.js --all
 *        node scripts/apply-live-specialty-design.js dermatology
 */
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');
const PAGES = [
  'dermatology',
  'gastroenterology',
  'nephrology',
  'gynecology',
  'oncology',
  'endocrinology',
  'podiatry',
  'ophthalmology',
  'family-medicine',
  'internal-medicine',
  'occupational-therapy',
  'speech-therapy',
  'acupuncture',
  'dental-billing',
];

const CARD =
  'bg-white border border-[#EDEAE0] rounded-2xl p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#AAD39C]';
const DENIAL_CARD =
  'group bg-gradient-to-b from-[#EDEFE8] to-[#D3D7DF] border border-[#E0E0DA] hover:border-[#AAD39C] rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300';
const SEC_WHITE = 'py-8 lg:py-10 bg-white border-b border-[#AAD39C]';
const SEC_TINT = 'py-8 lg:py-10 bg-[#EEF0E8] border-b border-[#AAD39C]';
const WRAP = 'max-w-[1260px] mx-auto px-5 sm:px-6 lg:px-10';
const HEAD = 'max-w-[760px] mx-auto text-center mb-8';
const EYEBROW = 'text-[12px] font-medium uppercase tracking-[1px] text-[#3f9a4b] mb-2';
const H2 = 'text-[22px] sm:text-[30px] lg:text-[36px] font-normal text-[#505050] leading-[1.2] mb-3';
const FAQ_CHEVRON = `<span class="faq-icon w-7 h-7 rounded-full bg-[#F8FBF0] flex items-center justify-center flex-shrink-0 transition-transform duration-300"><svg class="w-4 h-4 text-[#3f9a4b]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><use href="./icons/site-icons.svg#chevron-down-wide"></use></svg></span>`;

function textOf(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function mainText(html) {
  const main = (html.match(/<main\b[^>]*>([\s\S]*)<\/main>/i) || [])[1] || '';
  return textOf(main);
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripTags(s) {
  return textOf(s);
}

/** Replace only the <section>…</section> that contains marker (string or RegExp). */
function replaceSectionContaining(html, marker, replacement) {
  const idx =
    typeof marker === 'string'
      ? html.indexOf(marker)
      : (() => {
          const m = html.match(marker);
          return m ? m.index : -1;
        })();
  if (idx < 0) return html;
  const start = html.lastIndexOf('<section', idx);
  if (start < 0) return html;
  const end = html.indexOf('</section>', idx);
  if (end < 0) return html;
  return html.slice(0, start) + replacement + html.slice(end + '</section>'.length);
}

/** Return the section HTML that contains marker, or ''. */
function sectionContaining(html, marker) {
  const idx =
    typeof marker === 'string'
      ? html.indexOf(marker)
      : (() => {
          const m = html.match(marker);
          return m ? m.index : -1;
        })();
  if (idx < 0) return '';
  const start = html.lastIndexOf('<section', idx);
  const end = html.indexOf('</section>', idx);
  if (start < 0 || end < 0) return '';
  return html.slice(start, end + '</section>'.length);
}

/** Convert legacy .fi FAQ to live faq-item markup (PT). */
function convertFaqs(html) {
  if (!html.includes('class="fi') && !html.includes("class='fi")) return html;

  const faqs = [];
  const re = /<div class="fi[^"]*">([\s\S]*?)<div class="fi-a"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
  let m;
  while ((m = re.exec(html))) {
    const q = stripTags((m[1].match(/fi-qt[^>]*>([\s\S]*?)<\/span>/i) || [])[1] || '');
    const a = stripTags(m[2]);
    if (q && a) faqs.push({ q, a });
  }
  if (!faqs.length) {
    // alternate: fi-qt then fi-a
    for (const x of html.matchAll(/<span class="fi-qt"[^>]*>([\s\S]*?)<\/span>[\s\S]*?<div class="fi-a"[^>]*>([\s\S]*?)<\/div>/gi)) {
      const q = stripTags(x[1]);
      const a = stripTags(x[2]);
      if (q && a) faqs.push({ q, a });
    }
  }
  if (!faqs.length) return html;

  // Headings from the FAQ section only (never scan from an earlier .sec)
  const faqSec = sectionContaining(html, /faq-cols|fi-qt/i);
  const title = stripTags((faqSec.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i) || [])[1]) || 'Billing Questions Answered';
  const eyebrow =
    stripTags((faqSec.match(/<span class="lbl"[^>]*>([\s\S]*?)<\/span>/i) || [])[1]) || 'Questions';

  const items = faqs
    .map(
      (f) => `<div class="faq-item rounded-2xl border border-[#EDEAE0] overflow-hidden bg-white shadow-sm transition-colors duration-200 hover:border-[#AAD39C]">
<button class="faq-trigger w-full flex items-center justify-between gap-4 text-left px-5 sm:px-6 py-4 sm:py-5 bg-white hover:bg-[#F8FBF0] transition-colors duration-200">
<span class="text-[14px] sm:text-[16px] font-medium text-[#505050]">${esc(f.q)}</span>
${FAQ_CHEVRON}
</button>
<div class="faq-content hidden px-5 sm:px-6 pb-4 sm:pb-5 bg-[#F8FBF0]">
<p class="text-[13px] sm:text-[14px] text-[#676767] leading-relaxed pt-3">${esc(f.a)}</p>
</div>
</div>`
    )
    .join('\n');

  const block = `<section class="${SEC_WHITE}">
<div class="${WRAP}">
<div class="${HEAD}">
<p class="${EYEBROW}">${esc(eyebrow)}</p>
<h2 class="${H2}">${esc(title)}</h2>
</div>
<div class="max-w-[860px] mx-auto space-y-3">${items}</div>
</div>
</section>`;

  if (html.includes('faq-cols') || html.includes('fi-qt')) {
    return replaceSectionContaining(html, /faq-cols|fi-qt/i, block);
  }
  return html;
}

/** Denial cards → live PATTERN cards */
function convertDenials(html) {
  const sec = sectionContaining(html, 'dm-sec');
  if (!sec) return html;

  const cards = [];
  // Support both class="dm-card" and data-approved-card class="dm-card"
  const parts = sec.split(/<div[^>]*\bclass="dm-card"[^>]*>/i).slice(1);
  for (const part of parts) {
    const title = stripTags((part.match(/<h4[^>]*>([\s\S]*?)<\/h4>/i) || part.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i) || [])[1]);
    const problem = stripTags((part.match(/<p class="problem"[^>]*>([\s\S]*?)<\/p>/i) || [])[1]);
    const fix = stripTags((part.match(/<p class="fix"[^>]*>([\s\S]*?)<\/p>/i) || [])[1]);
    if (title && problem && fix) cards.push({ title, problem, fix });
  }
  if (!cards.length) return html;

  const eyebrow = stripTags((sec.match(/<div class="dm-eyebrow"[^>]*>([\s\S]*?)<\/div>/i) || [])[1]) || 'Denial Management';
  const heading = stripTags((sec.match(/<div class="dm-h"[^>]*>([\s\S]*?)<\/div>/i) || [])[1]) || 'Top Denial Patterns';
  const sub = stripTags((sec.match(/<div class="dm-sub"[^>]*>([\s\S]*?)<\/div>/i) || [])[1]) || '';
  const rates = [...sec.matchAll(/dm-rate-num[^>]*>([\s\S]*?)<\/div>\s*<div class="dm-rate-lbl"[^>]*>([\s\S]*?)<\/div>/gi)].map((m) => ({
    num: stripTags(m[1]),
    lbl: stripTags(m[2]),
  }));

  const cardsHtml = cards
    .map((c, i) => {
      const n = String(i + 1).padStart(2, '0');
      return `<div class="${DENIAL_CARD}">
<div class="space-y-3">
<span class="text-[10px] font-bold uppercase tracking-wider text-[#3f9a4b] bg-[#F8FBF0] border border-[#AAD39C] px-3 py-1 rounded-full">PATTERN ${n}</span>
<h3 class="text-[15px] sm:text-[16px] font-bold text-[#505050] leading-snug">${esc(c.title)}</h3>
<p class="text-[12px] sm:text-[13px] text-[#676767] leading-relaxed">${esc(c.problem)}</p>
</div>
<div class="mt-5 bg-[#F8FBF0] border border-[#AAD39C] rounded-xl p-4 group-hover:border-[#3f9a4b] transition-colors">
<p class="text-[10px] font-bold uppercase tracking-wider text-[#2e4a25] mb-1">PMEX SOLUTION</p>
<p class="text-[13px] sm:text-[14px] text-[#505050] leading-relaxed font-medium">${esc(c.fix)}</p>
</div>
</div>`;
    })
    .join('\n');

  const ratesHtml = rates.length
    ? `<div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">${rates
        .map(
          (r) => `<div class="${CARD} text-center">
<p class="text-[28px] text-[#2e4a25] leading-none mb-2">${esc(r.num)}</p>
<p class="text-[12px] text-[#676767]">${esc(r.lbl)}</p>
</div>`
        )
        .join('')}</div>`
    : '';

  const section = `<section class="${SEC_WHITE}">
<div class="${WRAP}">
<div class="${HEAD}">
<p class="${EYEBROW}">${esc(eyebrow)}</p>
<h2 class="${H2}">${esc(heading)}</h2>
${sub ? `<p class="text-[14px] sm:text-[16px] text-[#676767]">${esc(sub)}</p>` : ''}
</div>
${ratesHtml}
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">${cardsHtml}</div>
</div>
</section>`;

  return replaceSectionContaining(html, 'dm-sec', section);
}

/** Stats → live metric cards */
function convertStats(html) {
  const sec = html.match(/<section class="stats-sec">[\s\S]*?<\/section>/i);
  if (!sec) return html;
  const stats = [];
  for (const m of sec[0].matchAll(/<div class="stat-c">[\s\S]*?<div class="stat-num"[^>]*>([\s\S]*?)<\/div>\s*<div class="stat-lbl"[^>]*>([\s\S]*?)<\/div>/gi)) {
    stats.push({ num: stripTags(m[1]), lbl: stripTags(m[2]) });
  }
  const trusts = [...sec[0].matchAll(/<span class="ti"[^>]*>([\s\S]*?)<\/span>/gi)].map((x) => stripTags(x[1])).filter(Boolean);
  if (!stats.length) return html;

  const cards = stats
    .map(
      (s) => `<div class="${CARD} text-center">
<p class="text-[28px] text-[#2e4a25] leading-none mb-2">${esc(s.num)}</p>
<p class="text-[12px] text-[#676767]">${esc(s.lbl)}</p>
</div>`
    )
    .join('');

  const trust = trusts.length
    ? `<div class="flex flex-wrap gap-4 justify-center mt-6">${trusts
        .map((t) => `<span class="text-[12px] text-[#676767]">${esc(t)}</span>`)
        .join('')}</div>`
    : '';

  const section = `<section class="${SEC_TINT}">
<div class="${WRAP}">
<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">${cards}</div>
${trust}
</div>
</section>`;
  return html.replace(sec[0], section);
}

/** Education cards → live white cards; keep edu body text */
function convertEducation(html) {
  const sec = sectionContaining(html, 'edu-g');
  if (!sec) return html;
  const eyebrow = stripTags((sec.match(/<span class="lbl"[^>]*>([\s\S]*?)<\/span>/i) || [])[1]) || 'What We Do';
  const title = stripTags((sec.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i) || [])[1]);
  const intro = stripTags((sec.match(/<div class="sec-hd"[^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i) || [])[1]);
  const bodyParas = [...(sec.match(/<div class="edu-body"[^>]*>([\s\S]*?)<\/div>/i) || ['', ''])[1].matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((p) =>
    stripTags(p[1])
  );
  const cards = [];
  for (const m of sec.matchAll(/<div class="edu-card">[\s\S]*?<div class="edu-num"[^>]*>([\s\S]*?)<\/div>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>\s*<\/div>/gi)) {
    cards.push({ num: stripTags(m[1]), desc: stripTags(m[2]) });
  }
  if (!title) return html;

  const bodyHtml = bodyParas
    .filter(Boolean)
    .map((p) => `<p class="text-[14px] sm:text-[15px] text-[#676767] leading-relaxed mb-4">${esc(p)}</p>`)
    .join('');
  const cardsHtml = cards
    .map(
      (c) => `<div class="${CARD}">
<p class="text-[22px] text-[#2e4a25] mb-2">${esc(c.num)}</p>
<p class="text-[13px] text-[#676767] leading-relaxed">${esc(c.desc)}</p>
</div>`
    )
    .join('');

  const section = `<section class="${SEC_WHITE}">
<div class="${WRAP}">
<div class="${HEAD}">
<p class="${EYEBROW}">${esc(eyebrow)}</p>
<h2 class="${H2}">${esc(title)}</h2>
${intro ? `<p class="text-[14px] sm:text-[16px] text-[#676767] leading-relaxed">${esc(intro)}</p>` : ''}
</div>
<div class="grid grid-cols-1 lg:grid-cols-[1.1fr_.9fr] gap-8 lg:gap-10 items-start">
<div>${bodyHtml}</div>
<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${cardsHtml}</div>
</div>
</div>
</section>`;
  return replaceSectionContaining(html, 'edu-g', section);
}

/** USA section → live tint section + cards */
function convertUsa(html) {
  const secMatch = html.match(/<section class="usa-sec">[\s\S]*?<\/section>/i);
  if (!secMatch) return html;
  const sec = secMatch[0];
  const eyebrow = stripTags((sec.match(/usa-eyebrow[^>]*>([\s\S]*?)<\/span>/i) || [])[1]);
  const title = stripTags((sec.match(/usa-h[^>]*>([\s\S]*?)<\/h2>/i) || [])[1]);
  const paras = [...(sec.match(/usa-body[^>]*>([\s\S]*?)<\/div>/i) || ['', ''])[1].matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((p) =>
    stripTags(p[1])
  );
  const stats = [];
  for (const m of sec.matchAll(/usa-stat[\s\S]*?<div class="un"[^>]*>([\s\S]*?)<\/div>\s*<p[^>]*>([\s\S]*?)<\/p>/gi)) {
    stats.push({ n: stripTags(m[1]), p: stripTags(m[2]) });
  }
  const states = [];
  for (const m of sec.matchAll(/us-state[^>]*>[\s\S]*?<div class="city"[^>]*>([\s\S]*?)<\/div>\s*<div class="spec"[^>]*>([\s\S]*?)<\/div>/gi)) {
    states.push({ city: stripTags(m[1]), spec: stripTags(m[2]) });
  }
  if (!title) return html;

  const section = `<section class="${SEC_TINT}">
<div class="${WRAP}">
<div class="grid grid-cols-1 lg:grid-cols-[1.1fr_.9fr] gap-10 items-start">
<div>
${eyebrow ? `<p class="${EYEBROW}">${esc(eyebrow)}</p>` : ''}
<h2 class="${H2}">${esc(title)}</h2>
${paras.map((p) => `<p class="text-[14px] sm:text-[15px] text-[#676767] leading-relaxed mb-3">${esc(p)}</p>`).join('')}
${
  stats.length
    ? `<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">${stats
        .map(
          (s) => `<div class="${CARD} text-center"><p class="text-[22px] text-[#2e4a25] mb-1">${esc(s.n)}</p><p class="text-[12px] text-[#676767]">${esc(s.p)}</p></div>`
        )
        .join('')}</div>`
    : ''
}
</div>
${
  states.length
    ? `<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">${states
        .map(
          (s) => `<div class="${CARD} text-center"><p class="text-[13px] font-semibold text-[#2e4a25] mb-1">${esc(s.city)}</p><p class="text-[11px] text-[#676767]">${esc(s.spec)}</p></div>`
        )
        .join('')}</div>`
    : ''
}
</div>
</div>
</section>`;
  return replaceSectionContaining(html, 'usa-sec', section);
}

/** Case study cards */
function convertCases(html) {
  if (!html.includes('class="cc"') && !html.includes('class="case-g"')) return html;
  const sec = sectionContaining(html, 'case-g');
  if (!sec) return html;
  const eyebrow = stripTags((sec.match(/<span class="lbl"[^>]*>([\s\S]*?)<\/span>/i) || [])[1]) || 'Case Studies';
  const title = stripTags((sec.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i) || [])[1]);
  const cases = [];
  // Split by case cards
  const chunks = sec.split(/<div class="cc">/i).slice(1);
  for (const chunk of chunks) {
    const state = stripTags((chunk.match(/cc-state[^>]*>([\s\S]*?)<\/span>/i) || [])[1]);
    const loc = stripTags((chunk.match(/cc-loc[^>]*>([\s\S]*?)<\/span>/i) || [])[1]);
    const h3 = stripTags((chunk.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i) || [])[1]);
    const ehr = stripTags((chunk.match(/cc-ehr[^>]*>([\s\S]*?)<\/p>/i) || [])[1]);
    const labels = [...chunk.matchAll(/<span class="cc-lbl"[^>]*>([\s\S]*?)<\/span>\s*<p class="cc-txt"[^>]*>([\s\S]*?)<\/p>/gi)].map((x) => ({
      l: stripTags(x[1]),
      t: stripTags(x[2]),
    }));
    const mets = [...chunk.matchAll(/ccm-met[\s\S]*?<div class="mn"[^>]*>([\s\S]*?)<\/div>\s*<div class="ml"[^>]*>([\s\S]*?)<\/div>/gi)].map((x) => ({
      n: stripTags(x[1]),
      l: stripTags(x[2]),
    }));
    if (h3) cases.push({ state, loc, h3, ehr, labels, mets });
  }
  if (!cases.length) return html;

  const cards = cases
    .map((c) => {
      const mets = c.mets
        .map(
          (m) => `<div class="bg-[#F8FBF0] border border-[#EDEAE0] rounded-xl p-3 text-center"><p class="text-[16px] font-semibold text-[#2e4a25]">${esc(m.n)}</p><p class="text-[11px] text-[#676767]">${esc(m.l)}</p></div>`
        )
        .join('');
      const body = c.labels
        .map(
          (l) => `<p class="text-[11px] font-semibold uppercase tracking-wide text-[#3f9a4b] mt-3 mb-1">${esc(l.l)}</p><p class="text-[13px] text-[#676767] leading-relaxed">${esc(l.t)}</p>`
        )
        .join('');
      return `<div class="${CARD}">
${c.state ? `<span class="inline-block text-[11px] font-semibold uppercase tracking-wide text-[#3f9a4b] bg-[#F8FBF0] border border-[#AAD39C] rounded-full px-3 py-1 mb-2">${esc(c.state)}</span>` : ''}
${c.loc ? `<p class="text-[12px] text-[#676767] mb-2">${esc(c.loc)}</p>` : ''}
<h3 class="text-[16px] font-semibold text-[#505050] leading-snug mb-2">${esc(c.h3)}</h3>
${c.ehr ? `<p class="text-[13px] text-[#676767] mb-2">${esc(c.ehr)}</p>` : ''}
${body}
${mets ? `<div class="grid grid-cols-3 gap-2 mt-4">${mets}</div>` : ''}
</div>`;
    })
    .join('\n');

  const section = `<section class="${SEC_WHITE}">
<div class="${WRAP}">
<div class="${HEAD}">
<p class="${EYEBROW}">${esc(eyebrow)}</p>
<h2 class="${H2}">${esc(title)}</h2>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">${cards}</div>
</div>
</section>`;
  return replaceSectionContaining(html, 'case-g', section);
}

/** Testimonials */
function convertTestimonials(html) {
  const sec = sectionContaining(html, 'testi-g');
  if (!sec) return html;
  const eyebrow = stripTags((sec.match(/<span class="lbl"[^>]*>([\s\S]*?)<\/span>/i) || [])[1]) || 'What Our Clients Say';
  const title = stripTags((sec.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i) || [])[1]);
  const items = [];
  for (const m of sec.matchAll(/<div class="tc">[\s\S]*?<p class="t-q"[^>]*>([\s\S]*?)<\/p>[\s\S]*?<strong>([\s\S]*?)<\/strong>\s*<span[^>]*>([\s\S]*?)<\/span>/gi)) {
    items.push({ q: stripTags(m[1]), name: stripTags(m[2]), role: stripTags(m[3]) });
  }
  if (!items.length) return html;
  const cards = items
    .map(
      (t) => `<div class="${CARD}">
<p class="text-[#3f9a4b] mb-2 tracking-widest">★★★★★</p>
<p class="text-[13px] text-[#505050] leading-relaxed mb-4">${esc(t.q)}</p>
<p class="text-[13px] font-semibold text-[#2e4a25]">${esc(t.name)}</p>
<p class="text-[12px] text-[#676767]">${esc(t.role)}</p>
</div>`
    )
    .join('');
  const section = `<section class="${SEC_TINT}">
<div class="${WRAP}">
<div class="${HEAD}">
<p class="${EYEBROW}">${esc(eyebrow)}</p>
<h2 class="${H2}">${esc(title)}</h2>
</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">${cards}</div>
</div>
</section>`;
  return replaceSectionContaining(html, 'testi-g', section);
}

/** CPT pills */
function convertPills(html) {
  const sec = sectionContaining(html, 'pill-cloud');
  if (!sec) return html;
  const eyebrow = stripTags((sec.match(/<span class="lbl"[^>]*>([\s\S]*?)<\/span>/i) || [])[1]) || 'CPT Reference';
  const title = stripTags((sec.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i) || [])[1]);
  const pills = [
    ...sec.matchAll(/<div class=['"]pill['"]>([\s\S]*?)<span class=['"]pill-code['"]>([\s\S]*?)<\/span>\s*<\/div>/gi),
  ].map((m) => ({
    t: stripTags(m[1]),
    c: stripTags(m[2]),
  }));
  if (!pills.length) return html;
  const pillsHtml = pills
    .map(
      (p) => `<span class="inline-flex items-center gap-2 bg-white border border-[#EDEAE0] rounded-full px-3.5 py-2 text-[13px] text-[#505050]"><span>${esc(p.t)}</span><span class="text-[11px] font-semibold text-[#3f9a4b]">${esc(p.c)}</span></span>`
    )
    .join('');
  const section = `<section class="${SEC_WHITE}">
<div class="${WRAP}">
<div class="${HEAD}">
<p class="${EYEBROW}">${esc(eyebrow)}</p>
<h2 class="${H2}">${esc(title)}</h2>
</div>
<div class="flex flex-wrap gap-2.5 justify-center">${pillsHtml}</div>
</div>
</section>`;
  return replaceSectionContaining(html, 'pill-cloud', section);
}

/** Dark signature section */
function convertDark(html) {
  const secMatch = html.match(/<section class="dark-sec">[\s\S]*?<\/section>/i);
  if (!secMatch) return html;
  const sec = secMatch[0];
  const eyebrow = stripTags((sec.match(/ds-eyebrow[^>]*>([\s\S]*?)<\/span>/i) || [])[1]);
  const title = stripTags((sec.match(/ds-h[^>]*>([\s\S]*?)<\/h2>/i) || [])[1]);
  const paras = [...(sec.match(/ds-body[^>]*>([\s\S]*?)<\/div>/i) || ['', ''])[1].matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((p) =>
    stripTags(p[1])
  );
  const items = [];
  for (const m of sec.matchAll(/<div class="ds-item">[\s\S]*?<div class="ds-badge"[^>]*>([\s\S]*?)<\/div>[\s\S]*?<h4[^>]*>([\s\S]*?)<\/h4>\s*<p[^>]*>([\s\S]*?)<\/p>/gi)) {
    items.push({ badge: stripTags(m[1]).replace(/\s+/g, ' '), h: stripTags(m[2]), p: stripTags(m[3]) });
  }
  if (!title) return html;

  const cards = items
    .map(
      (it) => `<div class="${CARD}">
<span class="inline-block text-[10px] font-bold uppercase tracking-wide text-[#3f9a4b] bg-[#F8FBF0] border border-[#AAD39C] rounded-lg px-2 py-1 mb-2">${esc(it.badge)}</span>
<h4 class="text-[15px] font-semibold text-[#505050] mb-2">${esc(it.h)}</h4>
<p class="text-[13px] text-[#676767] leading-relaxed">${esc(it.p)}</p>
</div>`
    )
    .join('');

  const section = `<section class="${SEC_TINT}">
<div class="${WRAP}">
<div class="${HEAD}">
${eyebrow ? `<p class="${EYEBROW}">${esc(eyebrow)}</p>` : ''}
<h2 class="${H2}">${esc(title)}</h2>
</div>
${paras.map((p) => `<p class="text-[14px] sm:text-[15px] text-[#676767] leading-relaxed mb-3 max-w-[900px] mx-auto">${esc(p)}</p>`).join('')}
<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">${cards}</div>
</div>
</section>`;
  return replaceSectionContaining(html, 'dark-sec', section);
}

/** CTA */
function convertCta(html) {
  const secMatch = html.match(/<section class="cta-sec">[\s\S]*?<\/section>/i);
  if (!secMatch) return html;
  const sec = secMatch[0];
  const title = stripTags((sec.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i) || [])[1]);
  const p = stripTags((sec.match(/<p data-r[^>]*>([\s\S]*?)<\/p>/i) || sec.match(/<p[^>]*>([\s\S]*?)<\/p>/i) || [])[1]);
  const phone = stripTags((sec.match(/cta-ph[^>]*>([\s\S]*?)<\/p>/i) || [])[1]);
  const btns = [...sec.matchAll(/<button class="([^"]+)"[^>]*>([\s\S]*?)<\/button>/gi)].map((m) => stripTags(m[2]));
  if (!title) return html;
  const section = `<section class="${SEC_TINT}">
<div class="${WRAP} text-center">
<h2 class="${H2}">${esc(title)}</h2>
${p ? `<p class="text-[14px] sm:text-[16px] text-[#676767] leading-relaxed max-w-[760px] mx-auto mb-6">${esc(p)}</p>` : ''}
<div class="flex flex-wrap gap-3 justify-center mb-3">
${btns
  .map(
    (b, i) =>
      `<a href="${i === 0 ? 'demo.html' : 'demo.html'}" class="inline-flex items-center bg-[#AAD39C] text-[#2e4a25] px-6 py-2.5 rounded-full font-normal text-sm transition-colors duration-200 hover:bg-[#9ED08D]">${esc(b)}</a>`
  )
  .join('')}
</div>
${phone ? `<p class="text-[13px] text-[#676767]">${esc(phone)}</p>` : ''}
</div>
</section>`;
  return html.replace(sec, section);
}

/** Blog cards */
function convertBlog(html) {
  const sec = sectionContaining(html, 'blog-g');
  if (!sec) return html;
  const eyebrow = stripTags((sec.match(/<span class="lbl"[^>]*>([\s\S]*?)<\/span>/i) || [])[1]) || 'From the PMEx Blog';
  const title = stripTags((sec.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i) || [])[1]);
  const posts = [];
  for (const m of sec.matchAll(/<div class="bc-card">[\s\S]*?<div class="bc-cat"[^>]*>([\s\S]*?)<\/div>\s*<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi)) {
    posts.push({ cat: stripTags(m[1]), h: stripTags(m[2]), p: stripTags(m[3]) });
  }
  if (!posts.length) return html;
  const cards = posts
    .map(
      (p) => `<div class="${CARD}">
<p class="text-[11px] font-semibold uppercase tracking-wide text-[#3f9a4b] mb-2">${esc(p.cat)}</p>
<h3 class="text-[16px] font-semibold text-[#505050] mb-2 leading-snug">${esc(p.h)}</h3>
<p class="text-[13px] text-[#676767] leading-relaxed mb-3">${esc(p.p)}</p>
<a href="resources.html" class="text-[13px] text-[#3f9a4b] font-medium hover:underline">Read Article</a>
</div>`
    )
    .join('');
  const section = `<section class="${SEC_WHITE}">
<div class="${WRAP}">
<div class="${HEAD}">
<p class="${EYEBROW}">${esc(eyebrow)}</p>
<h2 class="${H2}">${esc(title)}</h2>
</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">${cards}</div>
</div>
</section>`;
  return replaceSectionContaining(html, 'blog-g', section);
}

/** Results table section - keep numbers, wrap in live shell */
function convertResults(html) {
  const sec = sectionContaining(html, 'res-g');
  if (!sec) return html;
  const eyebrow = stripTags((sec.match(/<span class="lbl"[^>]*>([\s\S]*?)<\/span>/i) || [])[1]) || 'Real Results';
  const title = stripTags((sec.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i) || [])[1]);
  const lead = stripTags((sec.match(/<p style="font-size:15px[^"]*"[^>]*>([\s\S]*?)<\/p>/i) || [])[1]);
  const note = stripTags((sec.match(/rt-note[^>]*>([\s\S]*?)<\/p>/i) || [])[1]);
  const rows = [...sec.matchAll(/<div class="rt-r"><span class="rt-m">([\s\S]*?)<\/span><span class="rt-b">([\s\S]*?)<\/span><span class="rt-a">([\s\S]*?)<\/span><\/div>/gi)].map(
    (m) => ({ m: stripTags(m[1]), b: stripTags(m[2]), a: stripTags(m[3]) })
  );
  if (!title || !rows.length) return html;

  const tableRows = rows
    .map(
      (r) => `<div class="grid grid-cols-3 gap-2 px-4 py-3 border-b border-[#EDEAE0] text-[13px] text-[#505050]"><span>${esc(r.m)}</span><span>${esc(r.b)}</span><span class="text-[#3f9a4b] font-semibold">${esc(r.a)}</span></div>`
    )
    .join('');

  const section = `<section class="${SEC_TINT}">
<div class="${WRAP}">
<div class="${HEAD}">
<p class="${EYEBROW}">${esc(eyebrow)}</p>
<h2 class="${H2}">${esc(title)}</h2>
${lead ? `<p class="text-[14px] sm:text-[16px] text-[#676767]">${esc(lead)}</p>` : ''}
</div>
<div class="max-w-[720px] mx-auto bg-white border border-[#EDEAE0] rounded-2xl overflow-hidden shadow-sm">
<div class="grid grid-cols-3 gap-2 px-4 py-3 bg-[#F8FBF0] text-[13px] font-semibold text-[#2e4a25] border-b border-[#EDEAE0]"><span>Metric</span><span>Before</span><span>After PMEx</span></div>
${tableRows}
</div>
${note ? `<p class="text-[12px] text-[#676767] text-center mt-3">${esc(note)}</p>` : ''}
</div>
</section>`;
  return replaceSectionContaining(html, 'res-g', section);
}

/** EHR strip */
function convertEhr(html) {
  const strip = html.match(/<div class="ehr-strip">[\s\S]*?<\/div>\s*<\/div>/i);
  if (!strip) return html;
  const lbl = stripTags((strip[0].match(/ehr-strip-lbl[^>]*>([\s\S]*?)<\/div>/i) || [])[1]);
  const chips = [...strip[0].matchAll(/ehr-chip[^>]*>([\s\S]*?)<\/div>/gi)].map((m) => stripTags(m[1]).replace(/^·\s*/, '')).filter(Boolean);
  const section = `<section class="py-6 bg-white border-b border-[#AAD39C]">
<div class="${WRAP}">
${lbl ? `<p class="text-center text-[13px] text-[#676767] mb-4">${esc(lbl)}</p>` : ''}
<div class="flex flex-wrap gap-2.5 justify-center">${chips
    .map(
      (c) => `<span class="inline-flex items-center gap-2 bg-white border border-[#EDEAE0] rounded-full px-3.5 py-2 text-[13px] text-[#505050]"><span class="w-1.5 h-1.5 rounded-full bg-[#3f9a4b]"></span>${esc(c)}</span>`
    )
    .join('')}</div>
</div>
</section>`;
  // Replace strip AND any orphan wrapper closers that used to wrap ehr-strip
  let next = html.replace(strip[0], section);
  next = next.replace(/<\/section>\s*<\/div>\s*<\/div>\s*(?=\s*(?:<!--|<section))/g, '</section>\n');
  return next;
}

/** Service coverage cards (svc-grid / svc-card) */
function convertServices(html) {
  const sec = sectionContaining(html, 'svc-grid');
  if (!sec) return html;
  const eyebrow = stripTags((sec.match(/<span class="lbl[^"]*"[^>]*>([\s\S]*?)<\/span>/i) || [])[1]) || 'Full Service Coverage';
  const title = stripTags((sec.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i) || [])[1]);
  const cards = [...sec.matchAll(/<div class="svc-card">[\s\S]*?<h4[^>]*>([\s\S]*?)<\/h4>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/div>/gi)].map((m) => ({
    h: stripTags(m[1]),
    p: stripTags(m[2]),
  }));
  if (!title || !cards.length) return html;
  const cardsHtml = cards
    .map(
      (c) => `<div class="${CARD}">
<h3 class="text-[15px] sm:text-[16px] font-semibold text-[#505050] mb-2 leading-snug">${esc(c.h)}</h3>
<p class="text-[13px] text-[#676767] leading-relaxed">${esc(c.p)}</p>
</div>`
    )
    .join('\n');
  const section = `<section class="${SEC_WHITE}">
<div class="${WRAP}">
<div class="${HEAD}">
<p class="${EYEBROW}">${esc(eyebrow)}</p>
<h2 class="${H2}">${esc(title)}</h2>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${cardsHtml}</div>
</div>
</section>`;
  return replaceSectionContaining(html, 'svc-grid', section);
}

/** Pain / familiar problems cards */
function convertPain(html) {
  const sec = sectionContaining(html, 'pain-grid');
  if (!sec) return html;
  const eyebrow = stripTags((sec.match(/<span class="lbl[^"]*"[^>]*>([\s\S]*?)<\/span>/i) || [])[1]) || 'Common Problems';
  const title = stripTags((sec.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i) || [])[1]);
  const cards = [
    ...sec.matchAll(
      /<div class="pain-card">[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>\s*<p class="prob"[^>]*>([\s\S]*?)<\/p>\s*<p class="sol"[^>]*>([\s\S]*?)<\/p>/gi
    ),
  ].map((m) => ({ h: stripTags(m[1]), prob: stripTags(m[2]), sol: stripTags(m[3]) }));
  if (!title || !cards.length) return html;
  const cardsHtml = cards
    .map(
      (c) => `<div class="${DENIAL_CARD}">
<div class="space-y-3">
<h3 class="text-[15px] sm:text-[16px] font-bold text-[#505050] leading-snug">${esc(c.h)}</h3>
<p class="text-[12px] sm:text-[13px] text-[#676767] leading-relaxed">${esc(c.prob)}</p>
</div>
<div class="mt-5 bg-[#F8FBF0] border border-[#AAD39C] rounded-xl p-4 group-hover:border-[#3f9a4b] transition-colors">
<p class="text-[10px] font-bold uppercase tracking-wider text-[#2e4a25] mb-1">PMEX SOLUTION</p>
<p class="text-[13px] sm:text-[14px] text-[#505050] leading-relaxed font-medium">${esc(c.sol)}</p>
</div>
</div>`
    )
    .join('\n');
  const section = `<section class="${SEC_TINT}">
<div class="${WRAP}">
<div class="${HEAD}">
<p class="${EYEBROW}">${esc(eyebrow)}</p>
<h2 class="${H2}">${esc(title)}</h2>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">${cardsHtml}</div>
</div>
</section>`;
  return replaceSectionContaining(html, 'pain-grid', section);
}

/** Why choose PMEx cards */
function convertWhy(html) {
  const sec = sectionContaining(html, 'why-g');
  if (!sec) return html;
  const eyebrow = stripTags((sec.match(/<span class="lbl[^"]*"[^>]*>([\s\S]*?)<\/span>/i) || [])[1]) || 'Why PMEx';
  const title = stripTags((sec.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i) || [])[1]);
  const cards = [...sec.matchAll(/<div class="why-card">[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/div>/gi)].map((m) => ({
    h: stripTags(m[1]),
    p: stripTags(m[2]),
  }));
  if (!title || !cards.length) return html;
  const cardsHtml = cards
    .map(
      (c) => `<div class="${CARD}">
<h3 class="text-[15px] sm:text-[16px] font-semibold text-[#505050] mb-2 leading-snug">${esc(c.h)}</h3>
<p class="text-[13px] text-[#676767] leading-relaxed">${esc(c.p)}</p>
</div>`
    )
    .join('\n');
  const section = `<section class="${SEC_WHITE}">
<div class="${WRAP}">
<div class="${HEAD}">
<p class="${EYEBROW}">${esc(eyebrow)}</p>
<h2 class="${H2}">${esc(title)}</h2>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${cardsHtml}</div>
</div>
</section>`;
  return replaceSectionContaining(html, 'why-g', section);
}

/** Platform / product cards (prod-g / prod-c) */
function convertProducts(html) {
  const sec = sectionContaining(html, 'prod-g');
  if (!sec) return html;
  const eyebrow = stripTags((sec.match(/<span class="lbl[^"]*"[^>]*>([\s\S]*?)<\/span>/i) || [])[1]) || 'The PMEX Portal';
  const title = stripTags((sec.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i) || [])[1]);
  const intro = stripTags((sec.match(/<div class="sec-hd"[^>]*>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i) || [])[1]);
  const cards = [
    ...sec.matchAll(
      /<div class="prod-c[^"]*">([\s\S]*?)<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/div>/gi
    ),
  ].map((m) => ({
    badge: stripTags((m[1].match(/pc-ehr-badge[^>]*>([\s\S]*?)<\/span>/i) || [])[1] || ''),
    h: stripTags(m[2]),
    p: stripTags(m[3]),
  }));
  if (!title || !cards.length) return html;
  const cardsHtml = cards
    .map(
      (c) => `<div class="${CARD}">
${c.badge ? `<span class="inline-block text-[10px] font-bold uppercase tracking-wide text-[#3f9a4b] bg-[#F8FBF0] border border-[#AAD39C] rounded-lg px-2 py-1 mb-2">${esc(c.badge)}</span>` : ''}
<h3 class="text-[15px] sm:text-[16px] font-semibold text-[#505050] mb-2 leading-snug">${esc(c.h)}</h3>
<p class="text-[13px] text-[#676767] leading-relaxed">${esc(c.p)}</p>
</div>`
    )
    .join('\n');
  const section = `<section class="${SEC_TINT}">
<div class="${WRAP}">
<div class="${HEAD}">
<p class="${EYEBROW}">${esc(eyebrow)}</p>
<h2 class="${H2}">${esc(title)}</h2>
${intro ? `<p class="text-[14px] sm:text-[16px] text-[#676767]">${esc(intro)}</p>` : ''}
</div>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${cardsHtml}</div>
</div>
</section>`;
  return replaceSectionContaining(html, 'prod-g', section);
}

/** Leftover longform chrome that still needs approved-longform-specialty.css */
const LEFTOVER_LONGFORM =
  /svc-card|svc-grid|pain-card|pain-grid|why-card|why-g|obs-sec|ccm-sec|bc-card|class="sec"|rt-r|res-g|sec-hd|prod-c|prod-g/;

function restoreLongformChrome(html) {
  if (!LEFTOVER_LONGFORM.test(html)) return html;
  let h = html;
  if (!/data-approved-longform-page/.test(h)) {
    h = h.replace(/<main\b([^>]*)>/i, '<main$1 data-approved-longform-page>');
  }
  if (!/approved-longform-specialty\.css/.test(h)) {
    h = h.replace(
      /<\/head>/i,
      '  <link rel="stylesheet" href="./css/approved-longform-specialty.css" data-approved-longform-css>\n</head>'
    );
  }
  return h;
}

function convertPage(html) {
  let h = html;
  h = convertStats(h);
  h = convertUsa(h);
  h = convertEhr(h);
  h = convertEducation(h);
  h = convertDark(h);
  h = convertDenials(h);
  h = convertServices(h);
  h = convertProducts(h);
  h = convertPain(h);
  h = convertWhy(h);
  h = convertPills(h);
  h = convertResults(h);
  h = convertCases(h);
  h = convertFaqs(h);
  h = convertTestimonials(h);
  h = convertCta(h);
  h = convertBlog(h);
  // NEVER strip specialty page CSS (./css/specialties/*.css).
  // Only drop approved-longform polish CSS when nothing leftover needs it.
  if (LEFTOVER_LONGFORM.test(h) || /edu-card|dm-card|usa-sec|stats-sec|class="fi |faq-cols|dark-sec|pill-cloud/.test(h)) {
    h = restoreLongformChrome(h);
  }
  return h;
}

const LEGACY_MARK =
  /edu-card|dm-card|usa-sec|stats-sec|pill-cloud|dark-sec|faq-cols|class="fi |svc-card|svc-grid|pain-card|pain-grid|why-card|why-g|obs-sec|ccm-sec|bc-card|class="sec"|rt-r|res-g|prod-c|prod-g/;

function main() {
  const args = process.argv.slice(2);
  const all = args.includes('--all');
  const force = args.includes('--force');
  const slugs = all ? PAGES : args.filter((a) => !a.startsWith('--')).map((s) => s.replace(/\.html$/, ''));
  if (!slugs.length) {
    console.log('Usage: node scripts/apply-live-specialty-design.js --all');
    return;
  }

  for (const slug of slugs) {
    const file = path.join(DIST, slug + '.html');
    if (!fs.existsSync(file)) {
      console.log('missing', slug);
      continue;
    }
    const raw = fs.readFileSync(file, 'utf8');
    if (!force && !LEGACY_MARK.test(raw)) {
      console.log('skip already-live', slug);
      continue;
    }
    const before = mainText(raw);
    const next = convertPage(raw);
    const after = mainText(next);
    const ratio = after.length / Math.max(before.length, 1);
    if (ratio < 0.85 || ratio > 1.15) {
      console.error('ABORT text drift', slug, before.length, '→', after.length);
      continue;
    }
    // Key phrase checks from before
    const samples = before.split(' ').filter((w) => w.length > 12).slice(0, 8);
    const missing = samples.filter((w) => !after.includes(w));
    if (missing.length > 3) {
      console.error('ABORT missing phrases', slug, missing.slice(0, 5));
      continue;
    }
    fs.writeFileSync(file, next);
    console.log('live-design', slug, 'text', before.length, '→', after.length, 'ratio', ratio.toFixed(3));
  }
}

if (require.main === module) main();
module.exports = { convertPage, mainText };
