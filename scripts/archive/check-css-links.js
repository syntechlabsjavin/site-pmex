const fs = require("fs");
const path = require("path");
const dist = "d:/work-space/real-projects/pmex-site/dist";
const files = fs.readdirSync(dist).filter((f) => f.endsWith(".html"));
const missingRef = [];
const missingPalette = [];
const missingDesign = [];
for (const f of files) {
  const t = fs.readFileSync(path.join(dist, f), "utf8");
  if (!t.includes("reference-typography.css")) missingRef.push(f);
  if (!t.includes("specialty-site-palette.css")) missingPalette.push(f);
  if (!t.includes("content-design-system.css")) missingDesign.push(f);
}
console.log("total", files.length);
console.log("missing reference-typography", missingRef.length, missingRef.slice(0, 30));
console.log("missing specialty-site-palette", missingPalette.length, missingPalette.slice(0, 20));
console.log("missing content-design-system", missingDesign.length, missingDesign.slice(0, 20));
