/**
 * Fix longform specialty heroes to match live PT / Orthopedic / Cardiology hero:
 *   - hero-bg-gradient full-bleed photo hero
 *   - eyebrow "PMEX for {Specialty}"
 *   - H1 + orange emphasis span (page copy kept)
 *   - description without <strong>
 *   - Request Free Audit (link) + Schedule a Demo (pill)
 *
 * Does NOT strip specialty CSS. Does NOT rewrite body sections.
 *
 * Usage: node scripts/fix-longform-heroes-to-live.js --all
 *        node scripts/fix-longform-heroes-to-live.js endocrinology
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

const LABELS = {
  dermatology: 'PMEX for Dermatology',
  gastroenterology: 'PMEX for Gastroenterology',
  nephrology: 'PMEX for Nephrology',
  gynecology: 'PMEX for Gynecology',
  oncology: 'PMEX for Oncology',
  endocrinology: 'PMEX for Endocrinology',
  podiatry: 'PMEX for Podiatry',
  ophthalmology: 'PMEX for Ophthalmology',
  'family-medicine': 'PMEX for Family Medicine',
  'internal-medicine': 'PMEX for Internal Medicine',
  'occupational-therapy': 'PMEX for Occupational Therapy',
  'speech-therapy': 'PMEX for Speech Therapy',
  acupuncture: 'PMEX for Acupuncture',
  'dental-billing': 'PMEX for Dental Billing',
};

function textOf(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractHero(html) {
  const m = html.match(/<section[^>]*(?:data-specialty-hero|class="[^"]*hero-bg-gradient[^"]*")[\s\S]*?<\/section>/i);
  if (!m) return null;
  const block = m[0];
  const h1Inner = (block.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1];
  if (!h1Inner) return null;

  // Prefer existing orange/emphasis span; else last sentence
  let emphasis = '';
  let h1Main = h1Inner;
  const span =
    h1Inner.match(/<span[^>]*text-\[#E85D3F\][^>]*>([\s\S]*?)<\/span>/i) ||
    h1Inner.match(/<span[^>]*class="ac"[^>]*>([\s\S]*?)<\/span>/i);
  if (span) {
    emphasis = textOf(span[1]);
    h1Main = h1Inner.replace(span[0], '').replace(/\s+/g, ' ').trim();
    // remove trailing punctuation glue
    h1Main = h1Main.replace(/[.]\s*$/, '').trim();
  }

  let sub =
    (block.match(/<p class="[^"]*leading-relaxed[^"]*"[^>]*>([\s\S]*?)<\/p>/i) ||
      block.match(/<p class="hero-sub"[^>]*>([\s\S]*?)<\/p>/i) ||
      [])[1] || '';
  sub = String(sub).replace(/<\/?(?:strong|b)\b[^>]*>/gi, '');

  // If eyebrow was wrongly set to the emphasis line, ignore it
  return {
    full: block,
    h1Main: textOf(h1Main),
    emphasis,
    sub,
    imgMobile: (block.match(/--hero-bg-mobile:\s*url\('([^']+)'\)/) || [])[1] || './img/familymedbgm.webp',
    imgDesktop: (block.match(/--hero-bg-desktop:\s*url\('([^']+)'\)/) || [])[1] || './img/familymedbg.webp',
  };
}

function buildHero(slug, copy) {
  const label = LABELS[slug] || 'PMEX Specialty Billing';
  let h1Html = copy.h1Main;
  if (copy.emphasis) {
    if (!/[.!?]$/.test(h1Html)) h1Html += '.';
    h1Html += ` <span class="text-[#E85D3F]">${copy.emphasis}</span>`;
  }
  // Live specialty CTAs: audit link + demo pill (AGENTS hero exception)
  return `<section data-specialty-hero class="hero-bg-gradient relative w-full border-b border-[#AAD39C] py-22 flex items-center" style="--hero-bg-mobile: url('${copy.imgMobile}'); --hero-bg-desktop: url('${copy.imgDesktop}'); --specialty-hero-image:url('${copy.imgDesktop}');">
            <div class="max-w-[1260px] mx-auto w-full px-5 sm:px-6 lg:px-10">
                <div class="max-w-[1260px] mx-auto relative z-10 w-full">
                    <p class="text-[11px] lg:text-[13px] font-medium tracking-[1px] text-[#3f9a4b] uppercase mb-3">${label}</p>
                    <h1 class="text-[22px] sm:text-[30px] lg:text-[36px] font-normal leading-[1.25] mb-5 text-[#505050] max-w-[580px]">${h1Html}</h1>
                    <p class="text-[#676767] text-[14px] sm:text-[16px] max-w-[540px] mb-5 leading-relaxed">${copy.sub}</p>
                    <div class="hero-actions flex flex-wrap items-center gap-4 sm:gap-6">
                        <a href="https://portal.pmexinc.com/?_gl=1*15wbhuk*_ga*MTYyNTM1MjEwNy4xNzkzNjMwNzAw*_ga_3YSTQXMPQH*czE3OTM2MzA3MDAkbzEkZzAkdDE3OTM2MzA3MDAkajYwJGwwJGgwl" data-site-button="link" class="inline-flex items-center text-[#3F9A4B] text-[14px] lg:text-[16px] font-normal hover:underline hero-action-link">Request Free Audit →</a>
                        <a href="https://portal.pmexinc.com/?_gl=1*15wbhuk*_ga*MTYyNTM1MjEwNy4xNzkzNjMwNzAw*_ga_3YSTQXMPQH*czE3OTM2MzA3MDAkbzEkZzAkdDE3OTM2MzA3MDAkajYwJGwwJGgwl" class="inline-flex items-center bg-[#AAD39C] text-[#2e4a25] px-6 py-2.5 rounded-full font-normal text-sm transition-colors duration-200 hover:bg-[#9ED08D] hero-action-pill">Schedule a Demo</a>
                    </div>
                </div>
            </div>
        </section>`;
}

function ensureSpecialtyCss(html, slug) {
  const rel = `./css/specialties/${slug}.css`;
  if (!fs.existsSync(path.join(DIST, 'css', 'specialties', slug + '.css'))) return html;
  if (html.includes(`specialties/${slug}.css`)) return html;
  return html.replace(/<\/head>/i, `  <link rel="stylesheet" href="${rel}" data-specialty-page-css>\n</head>`);
}

function main() {
  const args = process.argv.slice(2);
  const all = args.includes('--all');
  const slugs = all ? PAGES : args.filter((a) => !a.startsWith('--')).map((s) => s.replace(/\.html$/, ''));
  if (!slugs.length) {
    console.log('Usage: node scripts/fix-longform-heroes-to-live.js --all');
    return;
  }

  for (const slug of slugs) {
    const file = path.join(DIST, slug + '.html');
    if (!fs.existsSync(file)) {
      console.log('missing', slug);
      continue;
    }
    const raw = fs.readFileSync(file, 'utf8');
    const copy = extractHero(raw);
    if (!copy) {
      console.log('no-hero', slug);
      continue;
    }
    if (!copy.h1Main || !copy.sub) {
      console.log('skip incomplete', slug);
      continue;
    }
    let next = raw.replace(copy.full, () => buildHero(slug, copy));
    next = ensureSpecialtyCss(next, slug);
    fs.writeFileSync(file, next);
    console.log(
      'hero-fixed',
      slug,
      'label=',
      LABELS[slug],
      'emphasis=',
      (copy.emphasis || '').slice(0, 40)
    );
  }
}

main();
