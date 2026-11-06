/**
 * Apply PT hero "Book a demo" styles to navbar Schedule a Demo on all pages.
 */
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "dist");

const oldBtn =
  '<a href="https://portal.pmexinc.com/?_gl=1*15wbhuk*_ga*MTYyNTM1MjEwNy4xNzkzNjMwNzAw*_ga_3YSTQXMPQH*czE3OTM2MzA3MDAkbzEkZzAkdDE3OTM2MzA3MDAkajYwJGwwJGgwl" style="font-size:13px;font-weight:600;color:#464A25;background:#AAD39C;padding:8px 18px;border-radius:10px;text-decoration:none;">Schedule a Demo</a>';
const newBtn =
  '<a href="https://portal.pmexinc.com/?_gl=1*15wbhuk*_ga*MTYyNTM1MjEwNy4xNzkzNjMwNzAw*_ga_3YSTQXMPQH*czE3OTM2MzA3MDAkbzEkZzAkdDE3OTM2MzA3MDAkajYwJGwwJGgwl" class="homepage-nav-demo">Schedule a Demo</a>';

const oldHover =
  '#homepage-reference-nav a:hover,#homepage-reference-nav button:hover{color:#3f9a4b!important}#homepage-reference-nav .homepage-nav-actions a[href="https://portal.pmexinc.com/?_gl=1*15wbhuk*_ga*MTYyNTM1MjEwNy4xNzkzNjMwNzAw*_ga_3YSTQXMPQH*czE3OTM2MzA3MDAkbzEkZzAkdDE3OTM2MzA3MDAkajYwJGwwJGgwl"]:is(:hover,:focus-visible){color:#464A25!important;background:#C2E2B6!important}';

const newCss = `#homepage-reference-nav a:hover,#homepage-reference-nav button:hover{color:#3f9a4b!important}
/* Match physical-therapy hero "Book a demo" button */
#homepage-reference-nav .homepage-nav-actions a.homepage-nav-demo,
#homepage-reference-nav .homepage-nav-actions a[href="https://portal.pmexinc.com/?_gl=1*15wbhuk*_ga*MTYyNTM1MjEwNy4xNzkzNjMwNzAw*_ga_3YSTQXMPQH*czE3OTM2MzA3MDAkbzEkZzAkdDE3OTM2MzA3MDAkajYwJGwwJGgwl"]{
  display:block!important;
  box-sizing:border-box!important;
  font-family:Inter,sans-serif!important;
  font-size:14px!important;
  font-weight:400!important;
  line-height:20px!important;
  letter-spacing:normal!important;
  text-transform:none!important;
  text-decoration:none!important;
  color:#2E4A25!important;
  padding:10px 24px!important;
  height:40px!important;
  border:none!important;
  border-radius:9999px!important;
  box-shadow:none!important;
  cursor:pointer;
  white-space:normal!important;
  background:linear-gradient(to right,rgba(158,208,141,.4) 0%,#9ED08D 45%,#9ED08D 100%)!important;
}
#homepage-reference-nav .homepage-nav-actions a.homepage-nav-demo:is(:hover,:focus-visible),
#homepage-reference-nav .homepage-nav-actions a[href="https://portal.pmexinc.com/?_gl=1*15wbhuk*_ga*MTYyNTM1MjEwNy4xNzkzNjMwNzAw*_ga_3YSTQXMPQH*czE3OTM2MzA3MDAkbzEkZzAkdDE3OTM2MzA3MDAkajYwJGwwJGgwl"]:is(:hover,:focus-visible){
  color:#2E4A25!important;
  background:linear-gradient(to right,rgba(158,208,141,.55) 0%,#8FC47C 45%,#8FC47C 100%)!important;
}`;

let changed = 0;
let btn = 0;
let css = 0;

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".html"))) {
  const file = path.join(dir, f);
  let html = fs.readFileSync(file, "utf8");
  let next = html;
  if (next.includes(oldBtn)) {
    next = next.split(oldBtn).join(newBtn);
    btn += 1;
  }
  if (next.includes(oldHover)) {
    next = next.split(oldHover).join(newCss);
    css += 1;
  }
  if (next !== html) {
    fs.writeFileSync(file, next);
    changed += 1;
  }
}

console.log(JSON.stringify({ changed, btn, css }));
