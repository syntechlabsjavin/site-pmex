const fs = require("fs");
const p = "D:/work-space/real-projects/pmex-site/dist/index.html";
let h = fs.readFileSync(p, "utf8");

const re =
  /Healthcare revenue infrastructure,<br class="hidden sm:block" \/>\s*<span class="text-\[#959085\]">rebuilt from first principles<\/span>/;

if (!re.test(h)) {
  console.log("pattern not found");
  const i = h.indexOf("<h1");
  console.log(JSON.stringify(h.slice(i, i + 350)));
  process.exit(1);
}

h = h.replace(
  re,
  `Healthcare revenue <span class="text-[#E85D3F]">infrastructure</span>,<br class="hidden sm:block" />
              rebuilt from first principles`
);

// Align hero h1 classes with reference
h = h.replace(
  /<h1\s+class="text-5xl font-normal leading-tight mb-5 sm:mb-6 text-\[#505050\]"/,
  `<h1
              class="text-[22px] sm:text-[30px] lg:text-[36px] font-normal leading-[1.1] mb-5 sm:mb-6 text-[#505050]"`
);

fs.writeFileSync(p, h);
console.log("homepage hero updated", h.includes('text-[#E85D3F]">infrastructure'));
