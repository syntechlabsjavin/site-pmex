/**
 * Patch specialties.html hub card icons in place (preserves nav/header).
 */
const fs = require("fs");
const path = require("path");
const { iconForSlug } = require("./specialty-hub-icons");

const file = path.join(__dirname, "..", "dist", "specialties.html");
let html = fs.readFileSync(file, "utf8");

const cardRe =
  /(<a href="([^"]+)\.html" class="spec-hub-card">[\s\S]*?<span class="spec-hub-icon">)([\s\S]*?)(<\/span>)/g;

let count = 0;
const missing = [];

html = html.replace(cardRe, (full, open, slug, _oldSvg, close) => {
  const icon = iconForSlug(slug);
  if (!icon || icon.includes('path d="M24 8v32')) {
    // default icon — still ok, but track unmapped
    if (!require("./specialty-hub-icons").SLUG_ICON[slug]) {
      missing.push(slug);
    }
  }
  count += 1;
  return `${open}${icon}${close}`;
});

fs.writeFileSync(file, html, "utf8");
console.log(`Updated ${count} specialty hub icons in specialties.html`);
if (missing.length) {
  console.log("Unmapped slugs (using default):", missing.join(", "));
}
