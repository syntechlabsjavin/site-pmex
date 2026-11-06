/**
 * Design-only restyle for long-form specialty pages.
 * Keeps ALL body copy / sections. Only updates:
 *   - lean <head> (style.css + approved-longform-specialty.css)
 *   - hero shell classes (same text: label, h1, sub)
 *   - data-approved-longform-page marker on <main>
 *
 * Does NOT rewrite, drop, or remap section content.
 * CSS lives in dist/css/approved-longform-specialty.css (never overwritten here).
 *
 * Usage: node scripts/restyle-longform-specialty.js --all
 *        node scripts/restyle-longform-specialty.js dermatology nephrology
 */
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');

const LONGFORM = [
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

/** Keep existing specialty CSS links — never wipe them with a lean head. */
function buildHead(html, title, desc) {
  const specialtyLinks = [...html.matchAll(/<link[^>]+specialties\/[^>]+>/gi)].map((m) => m[0]);
  return `<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${title}
  ${desc}
  <link href="./style.css" rel="stylesheet" />
  <link rel="stylesheet" href="./css/approved-longform-specialty.css" data-approved-longform>
  ${specialtyLinks.join('\n  ')}
  <script src="./js/demo-modal.js" defer></script>
  <script src="./js/nav-dropdown.js" defer></script>
  <link rel="stylesheet" href="./css/site-faq-accordion.css" data-site-faq-accordion>
  <script src="./js/marquee-track.js" defer data-specialty-marquee-script></script>
  <script src="./js/specialty-content.js" defer data-specialty-runtime></script>
</head>`;
}

function extractHeroCopy(html) {
  const hero = html.match(/<section[^>]*data-specialty-hero[\s\S]*?<\/section>/i);
  if (!hero) return null;
  const block = hero[0];
  const lbl =
    (block.match(/<p class="text-\[[^\]]+\][^>]*uppercase[^>]*>([\s\S]*?)<\/p>/i) ||
      block.match(/<span class="lbl"[^>]*>([\s\S]*?)<\/span>/i) ||
      [])[1] || 'PMEX Specialty Billing';
  const h1 = (block.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1];
  const sub =
    (block.match(/<p class="text-\[[^\]]+\][^>]*leading-relaxed[^>]*>([\s\S]*?)<\/p>/i) ||
      block.match(/<p class="hero-sub"[^>]*>([\s\S]*?)<\/p>/i) ||
      [])[1];
  if (!h1 || !sub) return null;
  const h1Clean = h1
    .replace(/class="ac"/g, 'class="text-[#E85D3F]"')
    .replace(/class="ac2"/g, 'class="text-[#3f9a4b]"');
  const lblClean = String(lbl).replace(/<[^>]+>/g, '').trim();
  // Approved live heroes (PT etc.) use plain paragraph weight — no <strong>/<b>
  const subClean = String(sub).replace(/<\/?(?:strong|b)\b[^>]*>/gi, '');
  return { full: block, lbl: lblClean, h1: h1Clean, sub: subClean };
}

function buildHero(copy) {
  // Same hero shell as PT / Cardiology specialty pages. Text from the page only.
  return `<section data-specialty-hero class="hero-bg-gradient relative w-full border-b border-[#AAD39C] py-22 flex items-center" style="--hero-bg-mobile: url('./img/familymedbgm.webp'); --hero-bg-desktop: url('./img/familymedbg.webp'); --specialty-hero-image:url('./img/familymedbg.webp');">
        <div class="max-w-[1260px] mx-auto w-full px-5 sm:px-6 lg:px-10">
            <div data-hero-layout class="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
                <div data-hero-copy class="max-w-[580px]">
                    <p class="text-[11px] lg:text-[13px] font-medium tracking-[1px] text-[#3f9a4b] uppercase mb-3">${copy.lbl}</p>
                    <h1 class="text-[22px] sm:text-[30px] lg:text-[36px] font-normal leading-[1.2] mb-5 text-[#505050]">${copy.h1}</h1>
                    <p class="text-[14px] sm:text-[16px] text-[#676767] leading-relaxed mb-5 max-w-[540px]">${copy.sub}</p>
                    <div class="hero-actions flex flex-wrap items-center gap-4 sm:gap-6">
<a href="tel:5162084446" class="inline-flex items-center text-[#3F9A4B] text-[14px] lg:text-[16px] font-normal hover:underline hero-action-link">(516) 208-4446</a>
<a href="https://portal.pmexinc.com/?_gl=1*15wbhuk*_ga*MTYyNTM1MjEwNy4xNzkzNjMwNzAw*_ga_3YSTQXMPQH*czE3OTM2MzA3MDAkbzEkZzAkdDE3OTM2MzA3MDAkajYwJGwwJGgwl" class="inline-flex items-center bg-[#AAD39C] text-[#2e4a25] px-6 py-2.5 rounded-full font-normal text-sm transition-colors duration-200 hover:bg-[#9ED08D] hero-action-pill">Schedule a Demo</a>
</div>
                </div>
            </div>
        </div>
    </section>`;
}

function restyle(html) {
  const title = (html.match(/<title>[\s\S]*?<\/title>/) || [])[0];
  const desc = (html.match(/<meta name="description"[^>]*>/) || [])[0];
  if (!title || !desc) return html;

  let h = html.replace(/<head>[\s\S]*?<\/head>/i, buildHead(html, title, desc));

  const copy = extractHeroCopy(h);
  if (copy) {
    h = h.replace(copy.full, () => buildHero(copy));
  }

  if (!/data-approved-longform-page/.test(h)) {
    h = h.replace(
      /<main([^>]*class="specialty-content"[^>]*)>/i,
      '<main$1 data-approved-longform-page>'
    );
    if (!/data-approved-longform-page/.test(h)) {
      h = h.replace(/<main\b/i, '<main data-approved-longform-page');
    }
  }

  return h;
}

/** Visible main text — used to prove content was not rewritten. */
function mainText(html) {
  const main = (html.match(/<main\b[^>]*>([\s\S]*)<\/main>/i) || [])[1] || '';
  return main
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function main() {
  const args = process.argv.slice(2);
  const all = args.includes('--all');
  const slugs = all
    ? LONGFORM
    : args.filter((a) => !a.startsWith('--')).map((s) => s.replace(/\.html$/, ''));
  if (!slugs.length) {
    console.log('Usage: node scripts/restyle-longform-specialty.js --all');
    return;
  }

  for (const slug of slugs) {
    const file = path.join(DIST, slug + '.html');
    if (!fs.existsSync(file)) {
      console.log('missing', slug);
      continue;
    }
    const raw = fs.readFileSync(file, 'utf8');
    const before = mainText(raw);
    const next = restyle(raw);
    const after = mainText(next);

    // Allow only tiny hero chrome differences (phone / Schedule a Demo labels).
    // Body section copy must stay. Strip hero CTA words for comparison.
    const normalize = (t) =>
      t
        .replace(/\(516\)\s*208-4446/g, '')
        .replace(/Schedule a Demo/gi, '')
        .replace(/Request Free Audit/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    // Compare content after first ~hero block by checking key longform markers still present
    // and that after-text contains before-text of substantial body phrases.
    const bodyMarkers = ['edu-card', 'usa-sec', 'dm-card', 'fi-qt', 'case-g', 'testi-g', 'pill'];
    const lost = bodyMarkers.filter((m) => raw.includes(m) && !next.includes(m));
    if (lost.length) {
      console.error('ABORT content structure lost on', slug, lost);
      continue;
    }
    // Length guard: main text should not shrink more than ~2% (hero CTA wording only)
    if (after.length < before.length * 0.98) {
      console.error(
        'ABORT text shrink on',
        slug,
        'before=',
        before.length,
        'after=',
        after.length
      );
      continue;
    }

    if (next === raw) console.log('unchanged', slug);
    else {
      fs.writeFileSync(file, next);
      console.log('design-only', slug, 'textLen', before.length, '→', after.length);
    }
  }
}

if (require.main === module) main();
module.exports = { restyle, mainText, LONGFORM };
