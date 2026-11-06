const fs = require("fs");
const path = require("path");

const dist = "dist";
const approved = new Set([
  "physical-therapy",
  "cardiology",
  "orthopedic",
  "chiropractic",
  "behavioral-health",
  "mental-health-billing",
  "family-medicine",
  "internal-medicine",
]);

const files = fs.readdirSync(dist).filter((f) => f.endsWith(".html"));
const rows = [];

for (const f of files) {
  const html = fs.readFileSync(path.join(dist, f), "utf8");
  const slug = f.replace(/\.html$/, "");
  if (approved.has(slug)) continue;

  const hasHeroBg = /hero-bg-gradient/.test(html);
  const hasSupport = /specialty-hero-support/.test(html);
  const restyled = /hero-bg-gradient[^"]*border-\[#AAD39C\] py-22/.test(html);
  const oldCards = /bg-\[#F8FBF0\] border border-\[#AAD39C\] rounded-2xl p-5/.test(html);
  const oldSection = /py-12 lg:py-16/.test(html);
  const palette = /specialty-site-palette/.test(html);
  const hasLegacyHero =
    /data-specialty-hero[^>]*\bclass="[^"]*\bhero\b/.test(html) ||
    /<section[^>]*class="[^"]*\bhero\b[^"]*"/.test(html);
  const heroImg = (html.match(/--hero-bg-desktop:\s*url\('\.\/img\/([^']+)'\)/) || [])[1] || "";

  if (!hasHeroBg && !hasSupport && !palette && !hasLegacyHero) continue;

  rows.push({
    slug,
    hasHeroBg,
    restyled,
    oldCards,
    oldSection,
    palette,
    hasSupport,
    heroImg,
    hasLegacyHero,
  });
}

const need = rows.filter(
  (r) => r.hasHeroBg && r.hasSupport && (!r.restyled || r.oldCards || r.oldSection)
);
const done = rows.filter((r) => r.restyled && !r.oldCards);
const legacy = rows.filter((r) => (r.palette || r.hasLegacyHero) && !r.hasSupport);

console.log("NEED_RESTYLE", need.length);
console.log(need.map((r) => r.slug).join(" "));
console.log("ALREADY", done.length);
console.log(done.map((r) => r.slug).join(" "));
console.log("LEGACY", legacy.length);
console.log(legacy.map((r) => r.slug).join(" "));
console.log(
  "NEED_DUMMY_HERO",
  need
    .concat(done)
    .filter((r) => !r.heroImg || /familymedbg|behaviorbg|dummyImage/i.test(r.heroImg))
    .map((r) => `${r.slug}:${r.heroImg || "none"}`)
    .join(" | ")
);
