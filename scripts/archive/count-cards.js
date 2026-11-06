const fs = require("fs");
const h = fs.readFileSync("dist/index.html", "utf8");
const cards = [...h.matchAll(/class="([^"]*)"/g)].filter((m) => {
  const c = m[1];
  if (c.includes("feature-card-gradient")) return false;
  return /(^|\s)feature-card(\s|$)/.test(c);
});
console.log("cards", cards.length);
console.log("grads", (h.match(/class="feature-card-gradient"/g) || []).length);
const nonBorder = cards.filter((c) => !c[1].includes("border"));
console.log("non-border cards", nonBorder.length);
nonBorder.slice(0, 8).forEach((c) => console.log("-", c[1].slice(0, 140)));
