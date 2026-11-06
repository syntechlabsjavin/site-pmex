/**
 * Add shared feature-card hover (lift + green gradient) to homepage cards.
 */
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "dist", "index.html");
let html = fs.readFileSync(file, "utf8");

const HOVER =
  "transition-all duration-300 hover:-translate-y-1 hover:border-[#AAD39C] hover:shadow-[0_18px_40px_-12px_rgba(42,56,40,0.28)]";

function ensureFeatureHover(classAttr) {
  let next = classAttr;
  if (!/\bfeature-card\b/.test(next)) next = `feature-card ${next}`;
  if (!/\brelative\b/.test(next)) next = next.replace(/\bgroup\b/, "group relative");
  if (!/\brelative\b/.test(next)) next = `relative ${next}`;
  if (!/\boverflow-hidden\b/.test(next)) next = next.replace(/\brelative\b/, "relative overflow-hidden");
  if (!/hover:-translate-y/.test(next)) next += ` ${HOVER}`;
  // normalize duplicate spaces
  return next.replace(/\s+/g, " ").trim();
}

function injectGradientAfterOpen(fullMatch, openTag) {
  if (fullMatch.includes("feature-card-gradient")) return fullMatch;
  return fullMatch.replace(openTag, `${openTag}\n<div class="feature-card-gradient"></div>`);
}

let updated = 0;

// 1) Known card class families that should get the same hover treatment
const classFamilies = [
  "pmex-service-card",
  "pmex-metric-reveal group rounded-[20px] border",
  "pmex-compare-reveal",
  "pmex-challenge-reveal",
];

// Generic: any element whose class looks like a bordered white/light card surface
html = html.replace(/class="([^"]*)"/g, (full, cls) => {
  const isCardSurface =
    /(rounded-\[(?:18|20|22|24)px\]|rounded-2xl)/.test(cls) &&
    /border/.test(cls) &&
    /(bg-white|bg-\[#F8FAF5\]|bg-\[#FAFAF8\]|bg-\[#FAFCF8\]|bg-\[#FCFDFC\])/.test(cls) &&
    !/nav-dropdown|nav-specialties|input|textarea|button|rounded-full|px-4 py-2 text-\[11px\]|px-5 py-2\.5/.test(cls);

  const isKnownFamily =
    /\bpmex-service-card\b/.test(cls) ||
    /\bpmex-metric-reveal\b/.test(cls) && /border/.test(cls) && /rounded-\[20px\]/.test(cls) ||
    /\bpmex-compare-reveal\b/.test(cls) ||
    /\bpmex-challenge-reveal\b/.test(cls) ||
    /\bpmex-challenge-item\b/.test(cls);

  if (!isCardSurface && !isKnownFamily) return full;
  if (/\bfeature-card\b/.test(cls) && /hover:-translate-y/.test(cls)) return full;

  // Skip form field wrappers that are not cards of interest
  if (/placeholder:|outline-none focus:/.test(cls)) return full;

  const next = ensureFeatureHover(cls);
  if (next !== cls) updated += 1;
  return `class="${next}"`;
});

// 2) Inject gradient child into feature-card opens that don't have one yet
html = html.replace(/<([a-z0-9]+)([^>]*class="[^"]*\bfeature-card\b[^"]*"[^>]*)>/gi, (open, tag, rest) => {
  // Don't inject into self-closing-ish cases; we'll check following content in a second pass
  return `<${tag}${rest}>`;
});

// Second pass: after each feature-card opening tag, ensure gradient exists before next sibling content
html = html.replace(
  /(<([a-z0-9]+)([^>]*class="[^"]*\bfeature-card\b[^"]*"[^>]*)>)(\s*)(?!<div class="feature-card-gradient")/gi,
  (m, open, tag, rest, ws) => {
    updated += 1;
    return `${open}${ws}<div class="feature-card-gradient"></div>${ws}`;
  }
);

fs.writeFileSync(file, html, "utf8");
console.log(`Homepage card hover updates applied. Touch count approx: ${updated}`);
