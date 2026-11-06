/**
 * Apply PT hero "Book a demo" CSS to Primary Care specialty hero demo buttons.
 */
const fs = require("fs");
const path = require("path");

const PAGES = [
  "family-medicine.html",
  "internal-medicine.html",
  "pediatrics.html",
  "geriatric-medicine.html",
  "osteopathic-medicine.html",
  "urgent-care.html",
  "fqhc-billing.html",
  "telehealth.html",
];

const DIST = path.join(__dirname, "..", "dist");

const HERO_DEMO_CSS = `
/* Primary Care hero demo buttons — match physical-therapy Book a demo */
[data-primary-care] [data-specialty-hero] :is(.hero-book-demo, .hero-action-pill) {
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  box-sizing: border-box !important;
  font-family: Inter, sans-serif !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  line-height: 20px !important;
  letter-spacing: normal !important;
  text-transform: none !important;
  text-decoration: none !important;
  color: #2E4A25 !important;
  padding: 10px 24px !important;
  height: 40px !important;
  min-height: 40px !important;
  border: none !important;
  border-radius: 9999px !important;
  box-shadow: none !important;
  cursor: pointer;
  white-space: nowrap !important;
  background: linear-gradient(to right, rgba(158, 208, 141, 0.4) 0%, #9ED08D 45%, #9ED08D 100%) !important;
}
[data-primary-care] [data-specialty-hero] :is(.hero-book-demo, .hero-action-pill):is(:hover, :focus-visible) {
  color: #2E4A25 !important;
  background: linear-gradient(to right, rgba(158, 208, 141, 0.55) 0%, #8FC47C 45%, #8FC47C 100%) !important;
}
`;

function ensureBodyAttr(html) {
  if (/data-primary-care/.test(html)) return html;
  return html.replace(/<body([^>]*)>/i, (m, attrs) => {
    if (/data-primary-care/.test(attrs)) return m;
    return `<body${attrs} data-primary-care>`;
  });
}

function markHeroDemoButtons(html) {
  // Add hero-book-demo to hero-action-pill demo links
  html = html.replace(
    /(<section[^>]*data-specialty-hero[\s\S]*?<\/section>)/gi,
    (section) => {
      let s = section;
      // hero-action-pill anchors
      s = s.replace(
        /(<a\b[^>]*class="[^"]*\bhero-action-pill\b[^"]*")(?![^>]*hero-book-demo)/gi,
        (tag) => tag.replace(/class="/, 'class="hero-book-demo ')
      );
      // Book a demo / Schedule a Demo with bg-[#AAD39C] inside hero
      s = s.replace(
        /<(a|button)(\b[^>]*class="[^"]*\bbg-\[#AAD39C\][^"]*")([^>]*>)([^<]*(?:Book a [Dd]emo|Schedule a Demo)[^<]*)</gi,
        (full, tag, cls, rest, text) => {
          if (/hero-book-demo/.test(cls)) return full;
          return `<${tag}${cls.replace(/class="/, 'class="hero-book-demo ')}${rest}${text}<`;
        }
      );
      return s;
    }
  );
  return html;
}

let changed = 0;
for (const page of PAGES) {
  const file = path.join(DIST, page);
  if (!fs.existsSync(file)) {
    console.log("missing", page);
    continue;
  }
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  html = ensureBodyAttr(html);
  html = markHeroDemoButtons(html);
  if (html !== before) {
    fs.writeFileSync(file, html);
    changed += 1;
    console.log("updated", page);
  } else {
    console.log("unchanged", page);
  }
}

// Append CSS once to style.css if missing
const stylePath = path.join(DIST, "style.css");
let style = fs.readFileSync(stylePath, "utf8");
if (!style.includes("[data-primary-care] [data-specialty-hero]")) {
  style += "\n" + HERO_DEMO_CSS.trim() + "\n";
  fs.writeFileSync(stylePath, style);
  console.log("appended CSS to style.css");
} else {
  console.log("style.css already has primary-care hero CSS");
}

console.log(JSON.stringify({ changed, pages: PAGES.length }));
