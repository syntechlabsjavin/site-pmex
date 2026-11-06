/**
 * Point specialty heroes at real clinical photos (not washed-out abstracts).
 * orthobg.png / herobg.png / dummyImage.webp are near-white and look empty.
 */
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');

/** Live-quality photos with visible right-side clinical subjects */
const POOL = [
  { d: './img/familymedbg.webp', m: './img/familymedbgm.webp' },
  { d: './img/heropt.webp', m: './img/heroptm.webp' },
  { d: './img/herocardio.png', m: './img/herocardiom.webp' },
  { d: './img/chirobg.png', m: './img/chirobgm.png' },
  { d: './img/mentalhealthbg.webp', m: './img/mentalhealthbgm.webp' },
  { d: './img/Behaviorbg.webp', m: './img/behaviorbgm.webp' },
];

/** Prefer matching art when we have it */
const MAP = {
  'family-medicine': POOL[0],
  'internal-medicine': POOL[0],
  'physical-therapy': POOL[1],
  'occupational-therapy': POOL[1],
  'speech-therapy': POOL[1],
  'rehabilitation': POOL[1],
  cardiology: POOL[2],
  dermatology: POOL[0],
  ophthalmology: POOL[2],
  endocrinology: POOL[2],
  chiropractic: POOL[3],
  'mental-health-billing': POOL[4],
  'behavioral-health': POOL[5],
  psychiatry: POOL[4],
};

/** Keep live ortho on its own asset even though it is abstract */
const KEEP = new Set(['orthopedic.html']);

const BAD = /(?:dummyImage\.webp|orthobg\.png|orthobgm\.png|herobg\.png)/i;

function pick(slug, i) {
  return MAP[slug] || POOL[i % POOL.length];
}

function styleFor(imgs) {
  return `--hero-bg-mobile: url('${imgs.m}'); --hero-bg-desktop: url('${imgs.d}'); --specialty-hero-image:url('${imgs.d}');`;
}

const files = fs.readdirSync(DIST).filter((f) => f.endsWith('.html'));
let n = 0;
files.forEach((file, i) => {
  if (KEEP.has(file)) return;
  const full = path.join(DIST, file);
  let h = fs.readFileSync(full, 'utf8');
  if (!/hero-bg-gradient/.test(h)) return;
  if (!BAD.test(h) && !/--hero-bg-desktop:\s*url\('([^']+)'\)/.test(h)) return;

  const desk = (h.match(/--hero-bg-desktop:\s*url\('([^']+)'\)/) || [])[1] || '';
  const needsFix = BAD.test(desk) || BAD.test(h);
  if (!needsFix) return;

  const slug = file.replace(/\.html$/, '');
  const imgs = pick(slug, i);
  const next = styleFor(imgs);

  if (/style="--hero-bg-mobile:/.test(h)) {
    h = h.replace(
      /style="--hero-bg-mobile:[^"]*"/,
      `style="${next}"`
    );
  } else if (/style='--hero-bg-mobile:/.test(h)) {
    h = h.replace(
      /style='--hero-bg-mobile:[^']*'/,
      `style='${next}'`
    );
  } else {
    return;
  }

  fs.writeFileSync(full, h);
  n += 1;
  console.log(slug, '→', imgs.d);
});
console.log('updated', n, 'pages');
