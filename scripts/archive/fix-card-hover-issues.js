/**
 * Restore missing gradients + strip hover from true parent wrappers only.
 */
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "dist", "index.html");
let html = fs.readFileSync(file, "utf8");

function stripHoverClasses(cls) {
  return cls
    .replace(/(^|\s)feature-card(\s|$)/g, " ")
    .replace(/\s*hover:-translate-y-1\.5/g, "")
    .replace(/\s*hover:-translate-y-1(?!\.)/g, "")
    .replace(/\s*hover:border-\[#AAD39C\]/g, "")
    .replace(/\s*hover:shadow-\[[^\]]+\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function patchClassContaining(needle, transform) {
  let count = 0;
  html = html.replace(/class="([^"]*)"/g, (full, cls) => {
    if (!cls.includes(needle)) return full;
    // Prefer exact-ish parent matches: must also have feature-card currently
    if (!/(^|\s)feature-card(\s|$)/.test(cls) && transform.name === "strip") return full;
    const next = transform(cls);
    if (next !== cls) count += 1;
    return `class="${next}"`;
  });
  return count;
}

// --- Strip specific parent wrappers (unique class fingerprints) ---
const parents = [
  // Claims lifecycle shell (sidebar + panel)
  (cls) =>
    cls.includes("feature-card") &&
    cls.includes("flex flex-col md:flex-row") &&
    cls.includes("rounded-[18px]") &&
    cls.includes("border-[#DDE2D9]"),
  // Platform panel wrapper
  (cls) =>
    cls.includes("feature-card") &&
    cls.includes("mt-4") &&
    cls.includes("rounded-[20px]") &&
    cls.includes("border-[#D8E4D4]") &&
    !cls.includes("pmex-"),
  // Challenge checklist parent (contains small item cards)
  (cls) =>
    cls.includes("feature-card") &&
    cls.includes("pmex-challenge-reveal") &&
    cls.includes("h-full") &&
    cls.includes("rounded-[24px]") &&
    cls.includes("border-[#DDE5DA]"),
];

let stripped = 0;
html = html.replace(/class="([^"]*)"/g, (full, cls) => {
  if (!parents.some((fn) => fn(cls))) return full;
  stripped += 1;
  return `class="${stripHoverClasses(cls)}"`;
});
console.log("parents stripped:", stripped);

// --- Ensure every feature-card has exactly one direct gradient child ---
html = html.replace(
  /(<([a-z0-9]+)([^>]*class="[^"]*"[^>]*)>)/gi,
  (open, _full, tag, attrs) => {
    const m = attrs.match(/class="([^"]*)"/);
    if (!m) return open;
    const cls = m[1];
    if (!/(^|\s)feature-card(\s|$)/.test(cls)) return open;
    if (/feature-card-gradient/.test(cls)) return open;
    // Mark for gradient inject in next pass via a token
    return open.replace(/>$/, "><!--__NEED_GRAD__-->");
  }
);

// Inject gradient after markers; if already has gradient next, just remove marker
html = html.replace(
  /><!--__NEED_GRAD__-->(\s*)(?:<div class="feature-card-gradient"><\/div>)?/g,
  (m, ws) => `>${ws}<div class="feature-card-gradient"></div>`
);

// Collapse duplicate consecutive gradients under same parent
html = html.replace(
  /(?:\s*<div class="feature-card-gradient"><\/div>){2,}/g,
  `\n              <div class="feature-card-gradient"></div>`
);

fs.writeFileSync(file, html, "utf8");

const cards = [...html.matchAll(/class="([^"]*)"/g)].filter((m) =>
  /(^|\s)feature-card(\s|$)/.test(m[1])
).length;
const grads = (html.match(/class="feature-card-gradient"/g) || []).length;
console.log(`feature-card=${cards}, gradients=${grads}`);
