const fs = require("fs");
const path = require("path");
const dist = "d:/work-space/real-projects/pmex-site/dist";
const files = fs.readdirSync(dist).filter((f) => f.endsWith(".html"));

const paletteLink =
  '<link rel="stylesheet" href="./css/specialty-site-palette.css" data-specialty-palette>';
const layoutLink =
  '<link rel="stylesheet" href="./css/specialty-homepage-layout.css" data-specialty-layout>';
const refLink =
  '<link rel="stylesheet" href="./css/reference-typography.css"/><script src="./js/reference-typography.js" defer></script>';

let addedPalette = 0;
let addedLayout = 0;
let movedRef = 0;

for (const f of files) {
  const fp = path.join(dist, f);
  let html = fs.readFileSync(fp, "utf8");
  let changed = false;

  if (!html.includes("specialty-site-palette.css")) {
    if (html.includes("</head>")) {
      html = html.replace("</head>", paletteLink + "\n</head>");
      addedPalette++;
      changed = true;
    }
  }

  // Specialty pages that already use specialty-content / specialty CSS get layout file
  const isSpecialty =
    html.includes("specialty-content") ||
    html.includes("data-specialty-style") ||
    html.includes("./css/specialties/");
  if (isSpecialty && !html.includes("specialty-homepage-layout.css")) {
    if (html.includes("</head>")) {
      html = html.replace("</head>", layoutLink + "\n</head>");
      addedLayout++;
      changed = true;
    }
  }

  // Ensure reference-typography loads last among design CSS so tokens win
  if (html.includes("reference-typography.css")) {
    const withoutRef = html
      .replace(
        /<link rel="stylesheet" href="\.\/css\/reference-typography\.css"\/>\s*<script src="\.\/js\/reference-typography\.js" defer><\/script>\s*/g,
        ""
      )
      .replace(
        /<link rel="stylesheet" href="\.\/css\/reference-typography\.css">\s*/g,
        ""
      );
    if (withoutRef.includes("</head>")) {
      html = withoutRef.replace("</head>", refLink + "\n</head>");
      movedRef++;
      changed = true;
    }
  } else if (html.includes("</head>")) {
    html = html.replace("</head>", refLink + "\n</head>");
    movedRef++;
    changed = true;
  }

  if (changed) fs.writeFileSync(fp, html, "utf8");
}

console.log({ addedPalette, addedLayout, movedRef });
