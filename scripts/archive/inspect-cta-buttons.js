const fs = require("fs");
const h = fs.readFileSync("D:/work-space/real-projects/pmex-site/dist/cardiology.html", "utf8");
const re = /<(a|button)[^>]*class="([^"]*)"[^>]*>[\s\S]{0,80}?(?:Book a [Dd]emo|Revenue Assessment|Schedule a Demo)/gi;
let m;
let n = 0;
while ((m = re.exec(h)) && n < 12) {
  console.log("---");
  console.log("tag", m[1]);
  console.log("class", m[2]);
  console.log("snip", m[0].replace(/\s+/g, " ").slice(0, 180));
  n++;
}
console.log("count", n);

// also specialty css button rules
const cssFiles = [
  "D:/work-space/real-projects/pmex-site/dist/css/specialties/cardiology.css",
  "D:/work-space/real-projects/pmex-site/dist/css/specialty-homepage-layout.css",
  "D:/work-space/real-projects/pmex-site/dist/css/reference-typography.css",
];
for (const f of cssFiles) {
  if (!fs.existsSync(f)) continue;
  const c = fs.readFileSync(f, "utf8");
  const hits = c.match(/button|AAD39C|cta|px-|py-|padding|font-size[^{}]{0,80}/gi) || [];
  console.log("\nFILE", f.split("/").pop(), "hits", hits.length);
  const btnBlocks = c.match(/[^{}]*button[^{]*\{[^}]+\}/gi) || [];
  btnBlocks.slice(0, 6).forEach((b) => console.log(b.slice(0, 200)));
}
