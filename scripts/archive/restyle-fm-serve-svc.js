const fs = require("fs");
const p = "dist/family-medicine.html";
let h = fs.readFileSync(p, "utf8");

function sliceBetween(start, end) {
  const a = h.indexOf(start);
  const b = h.indexOf(end);
  if (a < 0 || b < 0 || b <= a) throw new Error("missing " + start);
  return { a, b, block: h.slice(a, b) };
}

function item(n, title, sub) {
  return `<div class="flex items-center gap-3 sm:gap-4 group">
    <div class="relative flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-r from-[#AAD39C] to-[#9ED08D] border-2 border-white text-white text-[15px] shadow-md shrink-0" style="font-weight:700 !important">${n}</div>
    <div class="flex-1 bg-gradient-to-r from-[#EEF0E8]/50 to-[#3F9A4B]/30 text-[#505050] border border-[#AAD39C]/60 rounded-2xl p-3 sm:p-3.5 shadow-sm">
      <h4 class="text-[14px] text-[#1b3316] leading-snug" style="font-weight:700 !important;color:#1b3316 !important">${title}</h4>
      <p class="text-[12px] text-[#676767] mt-0.5">${sub}</p>
    </div>
  </div>`;
}

const serve = sliceBetween("<!-- WHO WE SERVE -->", "<!-- EDUCATION -->");
const eyebrow = serve.block.match(/<span class="lbl[^"]*"[^>]*>([^<]+)<\/span>/)[1];
const h2 = serve.block.match(/<h2>([\s\S]*?)<\/h2>/)[1];
const lead = serve.block.match(/<h2>[\s\S]*?<\/h2><p>([\s\S]*?)<\/p>/)[1];
const paras = serve.block.match(/<div class="serve-intro"[\s\S]*?<\/div>/)[0]
  .match(/<p>[\s\S]*?<\/p>/g);
const tags = [...serve.block.matchAll(/<strong>([\s\S]*?)<\/strong><span>([\s\S]*?)<\/span>/g)];

const serveHtml = `<!-- WHO WE SERVE -->
<section class="border-b border-[#AAD39C] relative py-10 lg:py-14 bg-white">
  <div class="max-w-[1260px] mx-auto w-full px-5 sm:px-6 lg:px-10">
    <div class="max-w-[780px] mx-auto text-center mb-8 lg:mb-10">
      <p class="text-[11px] sm:text-[13px] font-medium tracking-[1px] uppercase text-[#3F9A4B]">${eyebrow}</p>
      <h2 class="max-w-[650px] mx-auto text-[22px] sm:text-[30px] lg:text-[36px] font-normal text-[#505050] leading-[1.2] mb-3" style="font-weight:400 !important;color:#505050 !important">${h2}</h2>
      <p class="text-[13px] sm:text-[15px] text-[#676767] leading-[1.5] max-w-[650px] mx-auto">${lead}</p>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-0 items-center relative">
      <div class="relative z-0 overflow-hidden bg-gradient-to-br from-[#EDEFE7] via-[#e8eaed] to-[#d8dce3] border border-[#AAD39C]/60 rounded-3xl p-7 sm:p-8 lg:p-9 lg:pr-12 shadow-xl">
        <div class="relative z-10 space-y-4 text-[#505050] text-[14px] md:text-[16px] leading-[1.6]">
          ${paras.join("\n")}
        </div>
      </div>
      <div class="relative z-10 lg:-ml-7 py-1">
        <div class="space-y-3 relative z-10 overflow-y-auto max-h-[475px] lg:max-h-[590px] py-3 md:pl-2 [scrollbar-width:none]">
          ${tags.map((t, i) => item(i + 1, t[1], t[2])).join("\n")}
        </div>
      </div>
    </div>
  </div>
</section>
`;

function svcCard(title, body) {
  return `<div class="relative bg-white rounded-2xl border border-[#E0E0DA] pt-7 px-6 pb-6 shadow-md hover:border-[#AAD39C] hover:shadow-xl hover:-translate-y-1 transition-all duration-200 group flex flex-col justify-between">
    <div class="absolute -top-2 left-1/2 -translate-x-1/2 w-16 h-3.5 overhang-pill rounded-full shadow-xs"><span aria-hidden="true" style="position:absolute;left:50%;top:50%;width:6px;height:6px;border-radius:9999px;background:#3F9A4B;transform:translate(-50%,-50%);z-index:1;"></span></div>
    <div>
      <div class="flex items-center justify-between pb-3 mb-3 border-b border-[#E0E0DA]">
        <h3 class="text-[14px] sm:text-[15px] uppercase tracking-wider text-[#3f9a4b] leading-tight" style="font-weight:700 !important;color:#3f9a4b !important">${title}</h3>
      </div>
      <p class="text-[13px] text-[#676767] leading-relaxed">${body}</p>
    </div>
  </div>`;
}

const svc = sliceBetween("<!-- 8 CORE SERVICES -->", "<!-- CHALLENGE / SOLUTION -->");
const svcEye = svc.block.match(/<span class="lbl[^"]*"[^>]*>([^<]+)<\/span>/)[1];
const svcH2 = svc.block.match(/<h2>([\s\S]*?)<\/h2>/)[1];
const svcLead = svc.block.match(/<h2>[\s\S]*?<\/h2><p>([\s\S]*?)<\/p>/)[1];
const cards = [...svc.block.matchAll(/<h4>([\s\S]*?)<\/h4><p>([\s\S]*?)<\/p>/g)];
if (cards.length !== 8) throw new Error("cards " + cards.length);

const svcHtml = `<!-- 8 CORE SERVICES -->
<section class="border-b border-[#AAD39C] relative py-8 sm:py-10 lg:py-12 bg-[#FAFAFA]">
  <div class="max-w-[1260px] mx-auto w-full px-5 sm:px-6 lg:px-10">
    <div class="max-w-[780px] mx-auto text-center mb-8 lg:mb-10">
      <p class="text-[11px] sm:text-[13px] font-medium tracking-[1px] uppercase text-[#3f9a4b]">${svcEye}</p>
      <h2 class="max-w-[780px] mx-auto text-[22px] sm:text-[30px] lg:text-[36px] font-normal text-[#505050] leading-[1.2] mb-3" style="font-weight:400 !important;color:#505050 !important">${svcH2}</h2>
      <p class="max-w-[700px] mx-auto text-[#676767] text-[13px] sm:text-[15px] leading-[1.5]">${svcLead}</p>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-3">
      ${cards.map((c) => svcCard(c[1], c[2])).join("\n")}
    </div>
  </div>
</section>
`;

h = h.slice(0, serve.a) + serveHtml + "\n" + h.slice(serve.b);
const svc2 = (() => {
  const a = h.indexOf("<!-- 8 CORE SERVICES -->");
  const b = h.indexOf("<!-- CHALLENGE / SOLUTION -->");
  return { a, b };
})();
h = h.slice(0, svc2.a) + svcHtml + "\n" + h.slice(svc2.b);
fs.writeFileSync(p, h);
console.log("serve tags", tags.length, "svc", cards.length);
