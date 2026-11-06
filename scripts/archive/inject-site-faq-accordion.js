const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
const marker = 'data-site-faq-accordion';
const link = `<link rel="stylesheet" href="./css/site-faq-accordion.css" ${marker}>`;
const files = fs.readdirSync(dist).filter((f) => f.endsWith('.html'));
let updated = 0;

for (const file of files) {
  const full = path.join(dist, file);
  let html = fs.readFileSync(full, 'utf8');
  if (html.includes(marker)) continue;

  // Prefer after site-motion.css when present; else before </head>
  if (html.includes('site-motion.css')) {
    html = html.replace(
      /(<link[^>]*href="\.\/css\/site-motion\.css"[^>]*>)/i,
      `$1${link}`
    );
  } else if (/<\/head>/i.test(html)) {
    html = html.replace(/<\/head>/i, `${link}\n</head>`);
  } else {
    continue;
  }

  if (!html.includes(marker)) continue;
  fs.writeFileSync(full, html);
  updated += 1;
}

console.log(`Injected site-faq-accordion.css into ${updated} pages`);
