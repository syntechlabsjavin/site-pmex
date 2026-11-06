/**
 * Clean duplicate/nested feature-card-gradient and fix false feature-card on gradient divs.
 */
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "dist", "index.html");
let html = fs.readFileSync(file, "utf8");

// Remove feature-card class wrongly added to gradient elements (feature-card matches as prefix)
html = html.replace(
  /class="([^"]*\bfeature-card-gradient\b[^"]*)"/g,
  (full, cls) => {
    const cleaned = cls
      .replace(/\bfeature-card\b(?!-)/g, "")
      .replace(/\s+/g, " ")
      .trim();
    // Keep only feature-card-gradient on these nodes
    return `class="feature-card-gradient"`;
  }
);

// Flatten nested gradients: <div class="feature-card-gradient"><div class="feature-card-gradient"></div></div>
html = html.replace(
  /<div class="feature-card-gradient">\s*<div class="feature-card-gradient"><\/div>\s*<\/div>/g,
  `<div class="feature-card-gradient"></div>`
);

// Collapse consecutive duplicate gradient siblings into one
html = html.replace(
  /(?:\s*<div class="feature-card-gradient"><\/div>)+\s*<div class="feature-card-gradient"><\/div>/g,
  `\n                <div class="feature-card-gradient"></div>`
);

// One more pass for any remaining nested
let prev;
do {
  prev = html;
  html = html.replace(
    /<div class="feature-card-gradient">\s*<div class="feature-card-gradient"><\/div>\s*<\/div>/g,
    `<div class="feature-card-gradient"></div>`
  );
} while (html !== prev);

fs.writeFileSync(file, html, "utf8");

const cards = (html.match(/\bfeature-card\b(?!-)/g) || []).length;
const grads = (html.match(/class="feature-card-gradient"/g) || []).length;
console.log(`Cleaned. feature-card≈${cards}, gradients=${grads}`);
