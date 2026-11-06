/**
 * Convert legacy specialty heroes (class="hero" / no photo) to the approved
 * hero-bg-gradient + dummyImage pattern without changing copy, navbar, or marquee.
 *
 * Usage: node scripts/convert-legacy-specialty-heroes.js
 */
const fs = require("fs");
const path = require("path");

const DIST = "dist";
const SLUGS = [
  "dermatology",
  "endocrinology",
  "gastroenterology",
  "nephrology",
  "oncology",
  "occupational-therapy",
  "speech-therapy",
  "acupuncture",
  "podiatry",
  "gynecology",
  "psychiatry",
  "ophthalmology",
  "dental-billing",
];

const HERO_STYLE =
  "style=\"--hero-bg-mobile: url('./img/dummyImage.webp'); --hero-bg-desktop: url('./img/dummyImage.webp'); --specialty-hero-image:url('./img/dummyImage.webp');\"";

const HERO_CLASS =
  'hero-bg-gradient relative w-full border-b border-[#AAD39C] py-22 flex items-center';

function ensureHeadLinks(html) {
  const headEnd = html.indexOf("</head>");
  if (headEnd < 0) return html;
  let head = html.slice(0, headEnd);
  const rest = html.slice(headEnd);
  const add = (tag, test) => {
    if (!test.test(head)) head += "\n" + tag;
  };
  add('<link rel="stylesheet" href="./css/specialty-site-palette.css" data-specialty-palette>', /specialty-site-palette/);
  add('<link rel="stylesheet" href="./css/specialty-homepage-layout.css" data-specialty-layout>', /specialty-homepage-layout/);
  return head + rest;
}

function convertHero(html) {
  let h = html;

  // Remove decorative blobs inside specialty heroes
  h = h.replace(
    /(<section[^>]*data-specialty-hero[^>]*>)\s*<div class="hero-blob1"><\/div>\s*<div class="hero-blob2"><\/div>/i,
    "$1"
  );

  // class="hero" → approved photo hero
  h = h.replace(
    /<section([^>]*data-specialty-hero[^>]*)\sclass="hero"([^>]*)>/i,
    `<section$1 class="${HERO_CLASS}" ${HERO_STYLE}$2>`
  );
  h = h.replace(
    /<section([^>]*)\sclass="hero"([^>]*data-specialty-hero[^>]*)>/i,
    `<section$1 class="${HERO_CLASS}" ${HERO_STYLE}$2>`
  );

  // Already hero-bg-gradient / border hero without image vars → attach dummyImage
  h = h.replace(
    /<section([^>]*data-specialty-hero[^>]*class="[^"]*hero-bg-gradient[^"]*"[^>]*)>/i,
    (full) => {
      if (/--hero-bg-desktop/.test(full) || /--specialty-hero-image/.test(full)) {
        // Ensure dummyImage if missing real specialty art
        if (!/--hero-bg-desktop:\s*url\('\.\/img\/(?!dummyImage)[^']+'\)/.test(full) && !/dummyImage/.test(full)) {
          return full.replace(/>$/, ` ${HERO_STYLE}>`).replace(/style="[^"]*"\s+style="/, 'style="');
        }
        return full;
      }
      return full.replace(/>$/, ` ${HERO_STYLE}>`);
    }
  );

  // Psychiatry-like: relative border hero without gradient/photo
  h = h.replace(
    /<section([^>]*data-specialty-hero[^>]*)\sclass="relative w-full border-b border-\[#AAD39C\] py-\d+ flex items-center"([^>]*)>/i,
    `<section$1 class="${HERO_CLASS}" ${HERO_STYLE}$2>`
  );

  return h;
}

let updated = 0;
for (const slug of SLUGS) {
  const file = path.join(DIST, slug + ".html");
  if (!fs.existsSync(file)) {
    console.log("missing", slug);
    continue;
  }
  const raw = fs.readFileSync(file, "utf8");
  let next = convertHero(raw);
  next = ensureHeadLinks(next);
  if (next !== raw) {
    fs.writeFileSync(file, next);
    updated += 1;
    console.log("updated", slug);
  } else {
    console.log("unchanged", slug);
  }
}

// Strengthen card/button look for legacy specialty pages to match approved tokens
const palettePath = path.join(DIST, "css", "specialty-site-palette.css");
let palette = fs.readFileSync(palettePath, "utf8");
const MARKER = "/* approved-card-match */";
if (!palette.includes(MARKER)) {
  palette += `

${MARKER}
/* Align legacy specialty cards/buttons with approved PT/Cardiology look */
.specialty-content :is(.edu-card, .pain-card, .svc-card, .dm-card, .hcard, .feature-card, .stat-c, .why-card, .testi-card, .bc-card) {
  background: #FFFFFF !important;
  border: 1px solid #EDEAE0 !important;
  border-radius: 16px !important;
  box-shadow: 0 1px 3px rgba(46, 74, 37, 0.06) !important;
  transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease !important;
}
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .specialty-content :is(.edu-card, .pain-card, .svc-card, .dm-card, .hcard, .feature-card, .stat-c, .why-card, .testi-card, .bc-card):hover {
    transform: translateY(-4px);
    border-color: #AAD39C !important;
    box-shadow: 0 12px 28px rgba(46, 74, 37, 0.10) !important;
  }
}
.specialty-content :is(.btn-a, .btn-e, .btn-g, .btn-r, .btn-primary, .btn-w, .nav-btn):not(.hero-action-link):not(.family-assessment-link) {
  background: #AAD39C !important;
  color: #2E4A25 !important;
  border: none !important;
  border-radius: 9999px !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  padding: 10px 24px !important;
  box-shadow: none !important;
}
.specialty-content :is(.btn-a, .btn-e, .btn-g, .btn-r, .btn-primary, .btn-w, .nav-btn):not(.hero-action-link):not(.family-assessment-link):hover {
  background: #9ED08D !important;
  color: #2E4A25 !important;
}
`;
  fs.writeFileSync(palettePath, palette);
  console.log("updated specialty-site-palette.css");
}

console.log(JSON.stringify({ updated, total: SLUGS.length }));
