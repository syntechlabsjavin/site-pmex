const fs = require("fs");
const p = "dist/family-medicine.html";
let html = fs.readFileSync(p, "utf8");

function sliceBetween(start, end) {
  const a = html.indexOf(start);
  const b = html.indexOf(end);
  if (a < 0 || b < 0 || b <= a) throw new Error("missing " + start);
  return { a, b, chunk: html.slice(a, b) };
}

const h2s = (s) =>
  `class="max-w-[780px] mx-auto text-[22px] sm:text-[30px] lg:text-[36px] font-normal text-[#505050] leading-[1.2] mb-3" style="font-weight:400 !important;color:#505050 !important"`;

const edu = sliceBetween("<!-- EDUCATION -->", "<!-- CCM");
const paras = [...edu.chunk.matchAll(/<div class="edu-body"[\s\S]*?<\/div>\s*<div class="edu-cards"/g)][0][0]
  .match(/<p>[\s\S]*?<\/p>/g)
  .slice(0, 4);
const hlStrong = edu.chunk.match(/<strong>([\s\S]*?)<\/strong>/)[1];
const hlP = edu.chunk.match(/<div class="edu-hl-t">[\s\S]*?<p>([\s\S]*?)<\/p>/)[1];
const stats = [...edu.chunk.matchAll(/<div class="edu-num"[^>]*>([\s\S]*?)<\/div><\/div><p>([\s\S]*?)<\/p>/g)];
if (stats.length !== 4) throw new Error("stats " + stats.length);
const intro = edu.chunk.match(/<h2>[\s\S]*?<\/h2><p>([\s\S]*?)<\/p>/)[1];
const eduH2 = edu.chunk.match(/<h2>([\s\S]*?)<\/h2>/)[1];

function statCard(n, num, text) {
  const id = String(n).padStart(2, "0");
  return `<div class="group relative bg-white rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 flex items-stretch gap-2.5 shadow-sm hover:shadow-md transition-all duration-300">
  <div class="relative stat-badge-block text-[#2e4a25] rounded-xl sm:rounded-2xl px-3 py-3 sm:px-4 sm:py-3 flex flex-col items-center justify-center min-w-[95px] sm:min-w-[115px] flex-shrink-0 text-center shadow-sm">
    <span class="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#2e4a25]/80">STAT ${id}</span>
    <span class="text-[18px] sm:text-[24px] font-bold leading-tight tracking-tight mt-0.5">${num}</span>
    <div class="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[7px] border-y-transparent border-l-[8px] stat-arrow-pointer z-20"></div>
  </div>
  <div class="flex-1 bg-[#AAD39C]/12 border border-[#AAD39C]/30 rounded-xl sm:rounded-2xl p-3 sm:p-3 relative z-10 flex items-center">
    <p class="text-[12px] sm:text-[13px] text-[#676767] leading-[1.5]">${text}</p>
  </div>
</div>`;
}

const callout = (strong, body, hide) => `<div class="${hide} relative rounded-2xl border border-[#AAD39C] bg-gradient-to-br from-[#EDEFE7] via-[#e8eaed] to-[#d8dce3] p-5 shadow-sm items-start gap-3.5">
  <div class="w-9 h-9 rounded-xl bg-[#AAD39C]/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-[#2e4a25]"><svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><use href="./icons/site-icons.svg#star-classic-compact"></use></svg></div>
  <div><h4 class="text-[13px] font-bold text-[#505050] mb-1" style="font-weight:700 !important;color:#505050 !important">${strong}</h4><p class="text-[12px] text-[#676767] leading-[1.5]">${body}</p></div>
</div>`;

const eduHtml = `<!-- EDUCATION -->
<section id="the-education" class="border-b border-[#AAD39C] py-8 sm:py-10 lg:py-12 relative bg-white">
  <div class="max-w-[1260px] mx-auto w-full px-5 sm:px-6 lg:px-10">
    <div class="max-w-[850px] mx-auto text-center mb-8 sm:mb-10">
      <p class="text-[11px] sm:text-[13px] font-medium text-[#3f9a4b] uppercase tracking-[1px]">The Education</p>
      <h2 ${h2s()}>${eduH2}</h2>
      <p class="text-[13px] sm:text-[15px] text-[#676767] leading-[1.6] max-w-[680px] mx-auto">${intro}</p>
    </div>
    <div class="flex flex-col lg:flex-row gap-6 items-start">
      <div class="w-full lg:w-[54%] flex flex-col gap-4">
        ${paras.map((x) => x.replace("<p>", '<p class="text-[14px] md:text-[16px] text-[#676767] leading-[1.6]">').replace(/<strong>/g, '<strong class="text-[#505050] font-bold">')).join("\n")}
      </div>
      <div class="w-full lg:w-[46%] flex flex-col gap-3.5">
        ${stats.map((m, i) => statCard(i + 1, m[1], m[2])).join("\n")}
        ${callout(hlStrong, hlP, "hidden xl:flex")}
      </div>
    </div>
    <div class="xl:hidden mt-6">${callout(hlStrong, hlP, "flex")}</div>
  </div>
</section>

`;

html = html.slice(0, edu.a) + eduHtml + html.slice(edu.b);

const ccm = sliceBetween("<!-- CCM", "<!-- PRODUCTS -->");
const ccmH2 = ccm.chunk.match(/<h2 class="ccm-h">([\s\S]*?)<\/h2>/)[1];
const ccmEye = ccm.chunk.match(/<span class="ccm-eyebrow">([\s\S]*?)<\/span>/)[1];
const ccmParas = [...ccm.chunk.match(/<div class="ccm-body">([\s\S]*?)<\/div>/)[1].matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => m[1]);
const programs = [...ccm.chunk.matchAll(/<div class="ccmp-badge[^"]*">([\s\S]*?)<\/div><div><h4>([\s\S]*?)<\/h4><p>([\s\S]*?)<\/p>/g)];
if (programs.length !== 3) throw new Error("programs " + programs.length);
const dashRows = [...ccm.chunk.matchAll(/<span class="ccmpr-name">([\s\S]*?)<\/span><span class="ccmpr-code">([\s\S]*?)<\/span><span class="ccmpr-rev">([\s\S]*?)<\/span>/g)];
const bars = [...ccm.chunk.matchAll(/<span class="ct-label">([\s\S]*?)<\/span>[\s\S]*?<span class="ct-val"[^>]*>([\s\S]*?)<\/span>/g)];
const impacts = [...ccm.chunk.matchAll(/<div class="gn">([\s\S]*?)<\/div><p>([\s\S]*?)<\/p>/g)];

const ccmHtml = `<!-- CCM + TCM + AWV -->
<section class="border-b border-[#AAD39C] relative py-8 sm:py-10 lg:py-12 bg-white">
  <div class="max-w-[1260px] mx-auto w-full px-5 sm:px-6 lg:px-10">
    <div class="max-w-[850px] mx-auto text-center mb-8">
      <p class="text-[11px] sm:text-[13px] font-medium text-[#3f9a4b] uppercase tracking-[1px]">${ccmEye}</p>
      <h2 ${h2s()}>${ccmH2}</h2>
    </div>
    <div class="flex flex-col gap-4 max-w-[900px] mx-auto mb-8">
      ${ccmParas.map((t) => `<p class="text-[14px] md:text-[16px] text-[#676767] leading-[1.6]">${t}</p>`).join("\n")}
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      ${programs
        .map(
          (m) => `<div class="bg-white rounded-2xl border border-[#AAD39C]/60 p-5 shadow-sm">
        <div class="inline-flex mb-3 px-3 py-1 rounded-full bg-[#AAD39C]/40 text-[12px] text-[#2e4a25]" style="font-weight:700 !important">${m[1].replace(/<br>/g, " ")}</div>
        <h3 class="text-[16px] text-[#505050] leading-snug mb-2" style="font-weight:700 !important;color:#505050 !important">${m[2]}</h3>
        <p class="text-[13px] text-[#676767] leading-[1.55]">${m[3]}</p>
      </div>`
        )
        .join("\n")}
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
      <div class="bg-white rounded-2xl border border-[#AAD39C]/60 p-5 shadow-sm">
        <p class="text-[12px] uppercase tracking-[1px] text-[#3f9a4b] mb-3">Monthly Revenue Program Dashboard</p>
        ${dashRows.map((m) => `<div class="flex justify-between gap-2 py-2 border-b border-[#E0E0DA] text-[13px] text-[#505050]"><span>${m[1]}</span><span>${m[2]}</span><span style="font-weight:700 !important">${m[3]}</span></div>`).join("")}
        <p class="text-center mt-3 text-[20px] text-[#2e4a25]" style="font-weight:700 !important">+$34,000/mo</p>
        <p class="text-center text-[12px] text-[#676767]">new recurring revenue from existing patients</p>
      </div>
      <div class="bg-white rounded-2xl border border-[#AAD39C]/60 p-5 shadow-sm">
        <p class="text-[12px] uppercase tracking-[1px] text-[#3f9a4b] mb-3">CCM Patient Tracking Real Time</p>
        ${bars.map((m) => `<div class="flex justify-between py-2 text-[14px] text-[#505050]"><span>${m[1]}</span><span style="font-weight:700 !important">${m[2]}</span></div>`).join("")}
      </div>
      <div class="flex flex-col gap-3">
        ${impacts.map((m) => `<div class="bg-white rounded-2xl border border-[#AAD39C]/60 p-5 shadow-sm"><div class="text-[22px] text-[#2e4a25]" style="font-weight:700 !important">${m[1]}</div><p class="text-[13px] text-[#676767] mt-1">${m[2]}</p></div>`).join("")}
      </div>
    </div>
  </div>
</section>

`;
html = html.slice(0, ccm.a) + ccmHtml + html.slice(ccm.b);

const prod = sliceBetween("<!-- PRODUCTS -->", "<!-- 8 CORE SERVICES -->");
const prodEye = prod.chunk.match(/<span class="lbl[^"]*"[^>]*>([\s\S]*?)<\/span>/)[1];
const prodH2 = prod.chunk.match(/<h2>([\s\S]*?)<\/h2>/)[1];
const prodIntro = prod.chunk.match(/<\/h2><p>([\s\S]*?)<\/p>/)[1];
const cards = [...prod.chunk.matchAll(/<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g)];
if (cards.length !== 6) throw new Error("cards " + cards.length);
const icons = ["./img/payment.svg", "./img/billing.svg", "./img/revenue.svg", "./img/eligibility.svg", "./img/auth.svg", "./img/claim.svg"];
const prodHtml = `<!-- PRODUCTS -->
<section class="border-b border-[#AAD39C] relative py-8 lg:py-10 bg-white">
  <div class="max-w-[1260px] mx-auto w-full px-5 sm:px-6 lg:px-10">
    <div class="max-w-[850px] mx-auto text-center mb-8 lg:mb-10">
      <p class="text-[11px] sm:text-[13px] font-medium tracking-[1px] uppercase text-[#3f9a4b]">${prodEye}</p>
      <h2 ${h2s()}>${prodH2}</h2>
      <p class="text-[13px] sm:text-[15px] text-[#676767] leading-[1.6] max-w-[720px] mx-auto mt-3">${prodIntro}</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
      ${cards
        .map(
          (m, i) => `<div class="pmex-card group relative overflow-hidden rounded-xl border border-gray-200 border-t-4 border-t-[#AAD39C] bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg">
        <div class="pmex-card-gradient"></div>
        <div class="relative z-10 flex flex-col h-full">
          <div class="mb-4 flex items-center gap-3 bg-gradient-to-r from-[#d8dce3] via-[#EDEFE7] to-[#ffffff] p-3 rounded-xl shadow-xs">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs"><img src="${icons[i]}" alt="" width="22" height="22"></div>
            <h3 class="text-[17px] sm:text-[19px] text-[#505050]" style="font-weight:700 !important;color:#505050 !important">${m[1]}</h3>
          </div>
          <p class="text-[13px] sm:text-[15px] leading-[1.5] text-[#676767]">${m[2]}</p>
        </div>
      </div>`
        )
        .join("\n")}
    </div>
  </div>
</section>

`;
html = html.slice(0, prod.a) + prodHtml + html.slice(prod.b);

const ch = sliceBetween("<!-- CHALLENGE / SOLUTION -->", "<!-- CPT PILLS");
const chEye = ch.chunk.match(/<span class="lbl[^"]*"[^>]*>([\s\S]*?)<\/span>/)[1];
const chH2 = ch.chunk.match(/<h2>([\s\S]*?)<\/h2>/)[1];
const wo = [...ch.chunk.match(/<div class="cs-card wo">([\s\S]*?)<\/div>\s*<div class="cs-card wi">/)[1].matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => m[1]);
const wi = [...ch.chunk.match(/<div class="cs-card wi">([\s\S]*)$/)[1].matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => m[1]);
if (wo.length !== wi.length) throw new Error("rows " + wo.length + " " + wi.length);
const xIcon = `<div class="w-5 h-5 rounded-full bg-red-100 text-red-500 flex items-center justify-center shrink-0 mt-0.5"><svg class="w-3 h-3 stroke-current" fill="none" viewBox="0 0 24 24" stroke-width="3"><use href="./icons/site-icons.svg#close"></use></svg></div>`;
const vIcon = `<div class="w-5 h-5 rounded-full bg-[#AAD39C]/35 text-[#2e4a25] flex items-center justify-center shrink-0 mt-0.5"><svg class="w-3 h-3 stroke-current" fill="none" viewBox="0 0 24 24" stroke-width="3"><use href="./icons/site-icons.svg#check"></use></svg></div>`;
const rows = wo
  .map(
    (left, i) => `<tr>
      <td class="w-1/2 p-4 lg:p-5 border-r border-[#AAD39C]/40 align-top"><div class="flex items-start gap-3.5">${xIcon}<p class="text-[13px] sm:text-[14px] text-[#676767] leading-[1.5]">${left.replace(/<strong>/g, '<strong class="font-bold text-[#505050]">')}</p></div></td>
      <td class="w-1/2 p-4 lg:p-5 align-top bg-[#AAD39C]/5"><div class="flex items-start gap-3.5">${vIcon}<p class="text-[13px] sm:text-[14px] text-[#676767] leading-[1.5]">${wi[i].replace(/<strong>/g, '<strong class="font-bold text-[#505050]">')}</p></div></td>
    </tr>`
  )
  .join("\n");
const chHtml = `<!-- CHALLENGE / SOLUTION -->
<section class="border-b border-[#AAD39C] relative py-8 lg:py-10 bg-[#EEF0E8]/40">
  <div class="max-w-[1260px] mx-auto w-full px-5 sm:px-6 lg:px-10">
    <div class="text-center mb-8">
      <p class="text-[11px] sm:text-[13px] font-medium tracking-[1px] uppercase text-[#3f9a4b]">${chEye}</p>
      <h2 ${h2s()}>${chH2}</h2>
    </div>
    <div class="bg-white rounded-3xl border border-[#AAD39C]/60 shadow-lg overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead><tr class="border-b border-[#AAD39C]/40 bg-gradient-to-r from-red-50/50 via-white to-[#AAD39C]/10">
          <th class="w-1/2 p-4 border-r border-[#AAD39C]/40 text-center"><span class="text-[16px] text-red-500 uppercase tracking-wider" style="font-weight:700 !important">Without PMEx</span></th>
          <th class="w-1/2 p-4 text-center bg-[#AAD39C]/10"><span class="text-[16px] text-[#3f9a4b] uppercase tracking-wider" style="font-weight:700 !important">With PMEx</span></th>
        </tr></thead>
        <tbody class="divide-y divide-gray-100">${rows}</tbody>
      </table>
    </div>
  </div>
</section>

`;
html = html.slice(0, ch.a) + chHtml + html.slice(ch.b);

fs.writeFileSync(p, html);
console.log("ok", paras.length, stats.length, programs.length, cards.length, wo.length);
