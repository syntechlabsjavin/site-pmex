/**
 * Strip feature-card hover from non-card elements (text blocks, grids without card chrome).
 */
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "dist", "index.html");
let html = fs.readFileSync(file, "utf8");

const HOVER_BITS =
  /\s*transition-all duration-300 hover:-translate-y-1 hover:border-\[#AAD39C\] hover:shadow-\[0_18px_40px_-12px_rgba\(42,56,40,0\.28\)\]/g;

html = html.replace(/class="([^"]*)"/g, (full, cls) => {
  if (!/\bfeature-card\b/.test(cls) || /\bfeature-card-gradient\b/.test(cls)) return full;

  const looksLikeCard =
    /border/.test(cls) &&
    /(rounded-\[(?:14|18|20|22|24)px\]|rounded-2xl)/.test(cls) &&
    /(bg-white|bg-\[#F8FAF5\]|bg-\[#FAFAF8\]|bg-\[#F8FBF5\]|bg-\[#FCFDFC\]|bg-\[#FAFCF8\])/.test(cls);

  if (looksLikeCard) return full;

  // Strip hover treatment from non-cards
  let next = cls
    .replace(/\bfeature-card\b/g, "")
    .replace(/\boverflow-hidden\b/g, (m, offset, str) => {
      // only remove overflow-hidden we likely added; keep if other layout needs it — safer leave it
      return m;
    })
    .replace(HOVER_BITS, "");

  // Also remove a lone "relative " we may have added if it wasn't originally needed — keep relative
  next = next.replace(/\s+/g, " ").trim();
  return `class="${next}"`;
});

// Remove orphan gradients that sit right after non-feature-card opens... harder.
// Instead remove gradient that is first child of element that no longer has feature-card.
// Simpler: remove consecutive pattern where previous open tag in a short window lacks feature-card.
// Do a pass: for each feature-card-gradient, check parent opening tag in reverse.
const parts = html.split(/(<div class="feature-card-gradient"><\/div>)/);
let rebuilt = parts[0];
for (let i = 1; i < parts.length; i += 2) {
  const before = rebuilt;
  const lastOpen = before.lastIndexOf("<");
  const slice = before.slice(Math.max(0, before.length - 500));
  const opens = [...slice.matchAll(/<([a-z0-9]+)([^>]*)>/gi)];
  const last = opens[opens.length - 1];
  const keep =
    last &&
    /class="[^"]*\bfeature-card\b/.test(last[0]) &&
    !/class="[^"]*\bfeature-card-gradient\b/.test(last[0]);
  if (keep) {
    rebuilt += parts[i] + (parts[i + 1] || "");
  } else {
    // drop gradient, keep following
    rebuilt += parts[i + 1] || "";
  }
}
html = rebuilt;

fs.writeFileSync(file, html, "utf8");
const cards = (html.match(/class="[^"]*\bfeature-card\b/g) || []).length;
const grads = (html.match(/class="feature-card-gradient"/g) || []).length;
console.log(`Stripped non-cards. feature-card opens≈${cards}, gradients=${grads}`);
