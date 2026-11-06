const fs = require("fs");
const p = "dist/family-medicine.html";
let html = fs.readFileSync(p, "utf8");

html = html.replace(/\s*<link rel="stylesheet" href="\.\/css\/specialties\/family-medicine\.css" data-specialty-style>\s*/, "\n");
html = html.replace(/\s*<link rel="stylesheet" href="\.\/css\/approved-longform-specialty\.css" data-approved-longform-css>\s*/, "\n");
html = html.replace(" data-approved-longform-page", "");

const start = html.indexOf("<!-- CPT PILLS");
const end = html.indexOf("</main>");
if (start < 0 || end < 0) throw new Error("bounds");
const chunk = html.slice(start, end);

function texts(re, src) {
  return [...src.matchAll(re)].map((m) => m[1].trim());
}
function one(re, src, label) {
  const m = src.match(re);
  if (!m) throw new Error("missing " + label);
  return m[1].trim();
}
function block(from, to) {
  const a = chunk.indexOf(from);
  const b = chunk.indexOf(to, a + 1);
  if (a < 0 || b < 0) throw new Error(from);
  return chunk.slice(a, b);
}
const eye = (t) => `<p class="text-[11px] sm:text-[13px] font-medium tracking-[1px] uppercase text-[#3f9a4b]">${t}</p>`;
const h2 = (t) => `<h2 class="max-w-[780px] mx-auto text-[22px] sm:text-[30px] lg:text-[36px] font-normal text-[#505050] leading-[1.2] mb-3">${t}</h2>`;
const lead = (t) => `<p class="max-w-[720px] mx-auto text-[#676767] text-[13px] sm:text-[15px] leading-[1.5]">${t}</p>`;
const shell = (bg, inner) => `<section class="border-b border-[#AAD39C] relative py-8 lg:py-10 ${bg}"><div class="max-w-[1260px] mx-auto w-full px-5 sm:px-6 lg:px-10">${inner}</div></section>\n`;

const cpt = block("<!-- CPT", "<!-- REVENUE");
const pills = [...cpt.matchAll(/<div class="pill">([\s\S]*?)<span class="pill-code">([\s\S]*?)<\/span><\/div>/g)];
if (pills.length < 10) throw new Error("pills " + pills.length);
const cptHtml = shell(
  "bg-white",
  `<div class="text-center mb-8">${eye(one(/<span class="lbl[^"]*"[^>]*>([\s\S]*?)<\/span>/, cpt, "cpt eye"))}${h2(one(/<h2>([\s\S]*?)<\/h2>/, cpt, "cpt h"))}${lead(one(/<\/h2><p>([\s\S]*?)<\/p>/, cpt, "cpt p"))}</div>
  <div class="flex flex-wrap justify-center gap-3.5 sm:gap-4 max-w-[1200px] mx-auto">
  ${pills
    .map(
      (m) => `<div class="cpt-box group relative overflow-hidden w-[calc(50%-7px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)]"><div class="cpt-gradient"></div><div class="relative z-10"><h4 class="cpt-title">${m[1]}</h4><p class="cpt-code">${m[2]}</p></div></div>`
    )
    .join("")}
  </div>`
);

const rpc = block("<!-- REVENUE", "<!-- PAIN");
const steps = [...rpc.matchAll(/<h4>([\s\S]*?)<\/h4><p>([\s\S]*?)<\/p>/g)];
const metrics = [...rpc.matchAll(/<div class="rn"[^>]*>([\s\S]*?)<\/div><div class="rl">([\s\S]*?)<\/div><div class="ri">([\s\S]*?)<\/div>/g)];
const rpcHtml = shell(
  "bg-[#EEF0E8]/40",
  `<div class="text-center mb-8">${eye(one(/<span class="lbl[^"]*"[^>]*>([\s\S]*?)<\/span>/, rpc, "rpc eye"))}${h2(one(/<h2>([\s\S]*?)<\/h2>/, rpc, "rpc h"))}${lead(one(/<\/h2><p>([\s\S]*?)<\/p>/, rpc, "rpc p"))}</div>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="space-y-3">${steps
      .map(
        (m, i) => `<div class="flex gap-3 bg-white border border-[#AAD39C]/60 rounded-2xl p-4"><div class="w-11 h-11 rounded-full bg-[#AAD39C] text-white flex items-center justify-center shrink-0" style="font-weight:700">${i + 1}</div><div><h3 class="text-[16px] text-[#505050]" style="font-weight:700">${m[1]}</h3><p class="text-[13px] text-[#676767] leading-[1.55] mt-1">${m[2]}</p></div></div>`
      )
      .join("")}
      <a href="https://portal.pmexinc.com/?_gl=1*15wbhuk*_ga*MTYyNTM1MjEwNy4xNzkzNjMwNzAw*_ga_3YSTQXMPQH*czE3OTM2MzA3MDAkbzEkZzAkdDE3OTM2MzA3MDAkajYwJGwwJGgwl" class="inline-flex mt-2 bg-[#AAD39C] text-[#2e4a25] px-6 py-2.5 rounded-full">Start Free Revenue Assessment</a>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${metrics
      .map(
        (m) => `<div class="bg-white border border-[#AAD39C]/60 rounded-2xl p-4"><div class="text-[22px] text-[#2e4a25]" style="font-weight:700">${m[1]}</div><p class="text-[13px] text-[#676767] mt-1">${m[2]}</p><p class="text-[12px] text-[#3f9a4b] mt-2">${m[3]}</p></div>`
      )
      .join("")}</div>
  </div>`
);

const pain = block("<!-- PAIN", "<!-- WORKFLOW");
const pains = [...pain.matchAll(/<h3>([\s\S]*?)<\/h3><p class="prob">([\s\S]*?)<\/p><p class="sol">([\s\S]*?)<\/p>/g)];
const painHtml = shell(
  "bg-white",
  `<div class="text-center mb-8">${eye(one(/<span class="lbl[^"]*"[^>]*>([\s\S]*?)<\/span>/, pain, "pain eye"))}${h2(one(/<h2>([\s\S]*?)<\/h2>/, pain, "pain h"))}</div>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">${pains
    .map(
      (m) => `<div class="bg-white border border-[#E0E0DA] rounded-2xl p-5 shadow-sm hover:border-[#AAD39C]"><h3 class="text-[16px] text-[#505050] mb-2" style="font-weight:700">${m[1]}</h3><p class="text-[13px] text-[#676767] leading-[1.55]">${m[2]}</p><p class="text-[13px] text-[#2e4a25] leading-[1.55] mt-2">${m[3]}</p></div>`
    )
    .join("")}</div>`
);

const wf = block("<!-- WORKFLOW", "<!-- MARKET");
const wfs = [...wf.matchAll(/<h4>([\s\S]*?)<\/h4><p>([\s\S]*?)<\/p>/g)];
const wfHtml = shell(
  "bg-[#FAFAFA]",
  `<div class="text-center mb-8">${eye(one(/<span class="lbl[^"]*"[^>]*>([\s\S]*?)<\/span>/, wf, "wf eye"))}${h2(one(/<h2>([\s\S]*?)<\/h2>/, wf, "wf h"))}</div>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">${wfs
    .map(
      (m, i) => `<div class="relative bg-white rounded-2xl border border-[#E0E0DA] pt-7 px-4 pb-5 shadow-sm"><div class="absolute -top-2 left-1/2 -translate-x-1/2 w-14 h-2.5 overhang-pill rounded-full"><span aria-hidden="true" style="position:absolute;left:50%;top:50%;width:6px;height:6px;border-radius:9999px;background:#3F9A4B;transform:translate(-50%,-50%);z-index:1;"></span></div><p class="text-[12px] text-[#3f9a4b] mb-1" style="font-weight:700">0${i + 1}</p><h3 class="text-[15px] text-[#505050] mb-2" style="font-weight:700">${m[1]}</h3><p class="text-[13px] text-[#676767] leading-[1.5]">${m[2]}</p></div>`
    )
    .join("")}</div>`
);

const mkt = block("<!-- MARKET", "<!-- PAYERS");
const mktPs = [...mkt.match(/<div class="mkt-body"[\s\S]*?<button/)[0].matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => m[1]);
const mcs = [...mkt.matchAll(/<div class="mc-num"[^>]*>([\s\S]*?)<\/div><p>([\s\S]*?)<\/p>/g)];
const mktHtml = shell(
  "bg-white",
  `<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
    <div>${eye(one(/<span class="lbl[^"]*"[^>]*>([\s\S]*?)<\/span>/, mkt, "mkt eye"))}${h2(one(/<h2[^>]*>([\s\S]*?)<\/h2>/, mkt, "mkt h")).replace("mx-auto", "")}
    ${mktPs.map((t) => `<p class="text-[14px] md:text-[16px] text-[#676767] leading-[1.6] mb-3">${t}</p>`).join("")}
    <a href="https://portal.pmexinc.com/?_gl=1*15wbhuk*_ga*MTYyNTM1MjEwNy4xNzkzNjMwNzAw*_ga_3YSTQXMPQH*czE3OTM2MzA3MDAkbzEkZzAkdDE3OTM2MzA3MDAkajYwJGwwJGgwl" class="inline-flex mt-2 bg-[#AAD39C] text-[#2e4a25] px-6 py-2.5 rounded-full">Start Free Revenue Assessment</a></div>
    <div class="flex flex-col gap-3">${mcs
      .map(
        (m) => `<div class="bg-white border border-[#AAD39C]/60 rounded-2xl p-4 shadow-sm"><div class="text-[20px] text-[#2e4a25]" style="font-weight:700">${m[1]}</div><p class="text-[13px] text-[#676767] mt-1">${m[2]}</p></div>`
      )
      .join("")}</div>
  </div>`
);

const pay = block("<!-- PAYERS", "<!-- RESULTS");
const pays = [...pay.matchAll(/<span class="pay-pill">([\s\S]*?)<\/span>/g)].map((m) => m[1]);
const payHtml = shell(
  "bg-[#EEF0E8]",
  `<div class="text-center mb-6">${eye(one(/<span class="lbl[^"]*"[^>]*>([\s\S]*?)<\/span>/, pay, "pay eye"))}${h2(one(/<h2>([\s\S]*?)<\/h2>/, pay, "pay h"))}</div>
  <div class="flex flex-wrap justify-center gap-3">${pays
    .map(
      (t) => `<div class="payer-box group relative overflow-hidden bg-white border border-[#AAD39C]/60 rounded-full px-5 py-3 flex items-center justify-center h-[64px]"><span class="relative z-10 text-[13px] sm:text-[15px] text-[#505050]" style="font-weight:600">${t}</span></div>`
    )
    .join("")}</div>`
);

const res = block("<!-- RESULTS", "<!-- WHY");
const rows = [...res.matchAll(/<span class="rt-m">([\s\S]*?)<\/span><span class="rt-b">([\s\S]*?)<\/span><span class="rt-a">([\s\S]*?)<\/span>/g)];
const resHtml = shell(
  "bg-white",
  `<div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
    <div>${eye(one(/<span class="lbl[^"]*"[^>]*>([\s\S]*?)<\/span>/, res, "res eye"))}${h2(one(/<h2[^>]*>([\s\S]*?)<\/h2>/, res, "res h")).replace("mx-auto", "")}
    <p class="text-[15px] text-[#676767] leading-[1.6]">${one(/<p style="[^"]*">([\s\S]*?)<\/p>/, res, "res p")}</p>
    <div class="flex flex-wrap gap-3 mt-5"><a href="https://portal.pmexinc.com/?_gl=1*15wbhuk*_ga*MTYyNTM1MjEwNy4xNzkzNjMwNzAw*_ga_3YSTQXMPQH*czE3OTM2MzA3MDAkbzEkZzAkdDE3OTM2MzA3MDAkajYwJGwwJGgwl" class="inline-flex bg-[#AAD39C] text-[#2e4a25] px-6 py-2.5 rounded-full">Start Free Revenue Assessment</a><a href="https://portal.pmexinc.com/?_gl=1*15wbhuk*_ga*MTYyNTM1MjEwNy4xNzkzNjMwNzAw*_ga_3YSTQXMPQH*czE3OTM2MzA3MDAkbzEkZzAkdDE3OTM2MzA3MDAkajYwJGwwJGgwl" class="inline-flex text-[#3F9A4B] px-2 py-2.5">Book a Demo</a></div></div>
    <div class="bg-white rounded-3xl border border-[#AAD39C]/60 overflow-hidden">
      <table class="w-full text-left"><thead><tr class="bg-[#EEF0E8] text-[13px] text-[#505050]"><th class="p-3">Metric</th><th class="p-3">Before</th><th class="p-3">After PMEx</th></tr></thead>
      <tbody>${rows.map((m) => `<tr class="border-t border-[#E0E0DA] text-[14px]"><td class="p-3 text-[#505050]">${m[1]}</td><td class="p-3 text-[#676767]">${m[2]}</td><td class="p-3 text-[#2e4a25]" style="font-weight:700">${m[3]}</td></tr>`).join("")}</tbody></table>
      <p class="text-[12px] text-[#676767] p-3">${one(/<p class="rt-note">([\s\S]*?)<\/p>/, res, "note")}</p>
    </div>
  </div>`
);

const why = block("<!-- WHY", "<!-- TESTIMONIALS");
const whys = [...why.matchAll(/<h3>([\s\S]*?)<\/h3><p>([\s\S]*?)<\/p>/g)];
const whyHtml = shell(
  "bg-[#FAFAFA]",
  `<div class="text-center mb-8">${eye(one(/<span class="lbl[^"]*"[^>]*>([\s\S]*?)<\/span>/, why, "why eye"))}${h2(one(/<h2>([\s\S]*?)<\/h2>/, why, "why h"))}</div>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">${whys
    .map(
      (m) => `<div class="bg-white border border-[#E0E0DA] rounded-2xl p-5 shadow-sm hover:border-[#AAD39C]"><h3 class="text-[16px] text-[#505050] mb-2" style="font-weight:700">${m[1]}</h3><p class="text-[13px] text-[#676767] leading-[1.55]">${m[2]}</p></div>`
    )
    .join("")}</div>`
);

const tes = block("<!-- TESTIMONIALS", "<!-- CASE");
const quotes = [...tes.matchAll(/<p class="t-q">([\s\S]*?)<\/p><div class="t-p"><strong>([\s\S]*?)<\/strong><span>([\s\S]*?)<\/span>/g)];
const tesHtml = shell(
  "bg-white",
  `<div class="text-center mb-8">${eye(one(/<span class="lbl[^"]*"[^>]*>([\s\S]*?)<\/span>/, tes, "tes eye"))}${h2(one(/<h2>([\s\S]*?)<\/h2>/, tes, "tes h"))}</div>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">${quotes
    .map(
      (m) => `<div class="bg-white border border-[#AAD39C]/60 rounded-2xl p-5 shadow-sm"><p class="text-[#3f9a4b] mb-2">★★★★★</p><p class="text-[14px] text-[#676767] leading-[1.6]">${m[1]}</p><p class="mt-4 text-[14px] text-[#505050]" style="font-weight:700">${m[2]}</p><p class="text-[12px] text-[#676767]">${m[3]}</p></div>`
    )
    .join("")}</div>`
);

const cs = block("<!-- CASE", "<!-- FAQ");
const cases = [...cs.matchAll(/<span class="cc-state">([\s\S]*?)<\/span><span class="cc-loc">([\s\S]*?)<\/span><h3>([\s\S]*?)<\/h3>[\s\S]*?<p class="cc-ehr">([\s\S]*?)<\/p>[\s\S]*?<p class="cc-txt">([\s\S]*?)<\/p>[\s\S]*?<p class="cc-txt">([\s\S]*?)<\/p>[\s\S]*?<div class="mn">([\s\S]*?)<\/div><div class="ml">([\s\S]*?)<\/div>[\s\S]*?<div class="mn">([\s\S]*?)<\/div><div class="ml">([\s\S]*?)<\/div>[\s\S]*?<div class="mn">([\s\S]*?)<\/div><div class="ml">([\s\S]*?)<\/div>/g)];
if (cases.length !== 4) throw new Error("cases " + cases.length);
const csHtml = shell(
  "bg-[#EEF0E8]/40",
  `<div class="text-center mb-8">${eye(one(/<span class="lbl[^"]*"[^>]*>([\s\S]*?)<\/span>/, cs, "cs eye"))}${h2(one(/<h2>([\s\S]*?)<\/h2>/, cs, "cs h"))}${lead(one(/<\/h2><p>([\s\S]*?)<\/p>/, cs, "cs p"))}</div>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">${cases
    .map(
      (m) => `<article class="bg-white border border-[#AAD39C]/60 rounded-2xl p-5 shadow-sm"><p class="text-[12px] uppercase tracking-[1px] text-[#3f9a4b]">${m[1]}</p><p class="text-[13px] text-[#676767]">${m[2]}</p><h3 class="text-[18px] text-[#505050] my-2" style="font-weight:700">${m[3]}</h3><p class="text-[13px] text-[#505050]">${m[4]}</p><p class="text-[13px] text-[#676767] mt-2">${m[5]}</p><p class="text-[13px] text-[#676767] mt-2">${m[6]}</p><div class="grid grid-cols-3 gap-2 mt-4">${[7, 9, 11].map((i) => `<div class="bg-[#F8FBF0] rounded-xl p-2 text-center"><div class="text-[#2e4a25]" style="font-weight:700">${m[i]}</div><div class="text-[11px] text-[#676767]">${m[i + 1]}</div></div>`).join("")}</div></article>`
    )
    .join("")}</div>`
);

const faq = block("<!-- FAQ", "<!-- CTA");
const faqs = [...faq.matchAll(/<span class="fi-qt">([\s\S]*?)<\/span>[\s\S]*?<div class="fi-a">([\s\S]*?)<\/div>/g)];
if (faqs.length < 10) throw new Error("faq " + faqs.length);
const faqItem = (q, a) => `<div class="faq-item rounded-2xl border border-[#EDEAE0] overflow-hidden"><button type="button" class="faq-trigger w-full flex items-center justify-between gap-4 text-left px-5 py-4 bg-white" aria-expanded="false"><span class="text-[15px] text-[#505050]">${q}</span><span class="faq-icon w-7 h-7 rounded-full bg-[#F8FBF0] flex items-center justify-center shrink-0 text-[#3f9a4b]">+</span></button><div class="faq-panel grid grid-rows-[0fr]"><div class="overflow-hidden"><p class="px-5 pb-4 text-[14px] text-[#676767] leading-[1.6]">${a}</p></div></div></div>`;
const half = Math.ceil(faqs.length / 2);
const faqHtml = shell(
  "bg-white",
  `<div class="text-center mb-8">${eye(one(/<span class="lbl[^"]*"[^>]*>([\s\S]*?)<\/span>/, faq, "faq eye"))}${h2(one(/<h2>([\s\S]*?)<\/h2>/, faq, "faq h"))}</div>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-3" id="faq-list">${faqs.map((m) => faqItem(m[1], m[2])).join("")}</div>`
);

const cta = block("<!-- CTA", "<!-- BLOG");
const ctaHtml = `<section class="bg-[#fafafa] relative px-6 py-10 overflow-hidden border-b border-[#AAD39C]">
  <div class="max-w-[760px] mx-auto text-center relative z-10">
    <h2 class="text-[22px] md:text-[36px] font-normal text-[#505050] leading-[1.2] mb-4">${one(/<h2[^>]*>([\s\S]*?)<\/h2>/, cta, "cta h")}</h2>
    <p class="text-[14px] sm:text-[16px] text-[#676767] mb-6">${one(/<p data-r>([\s\S]*?)<\/p>/, cta, "cta p")}</p>
    <div class="flex flex-wrap justify-center gap-4"><a href="https://portal.pmexinc.com/?_gl=1*15wbhuk*_ga*MTYyNTM1MjEwNy4xNzkzNjMwNzAw*_ga_3YSTQXMPQH*czE3OTM2MzA3MDAkbzEkZzAkdDE3OTM2MzA3MDAkajYwJGwwJGgwl" class="inline-flex bg-[#AAD39C] text-[#2e4a25] px-6 py-2.5 rounded-full">Start Free Revenue Assessment</a><a href="https://portal.pmexinc.com/?_gl=1*15wbhuk*_ga*MTYyNTM1MjEwNy4xNzkzNjMwNzAw*_ga_3YSTQXMPQH*czE3OTM2MzA3MDAkbzEkZzAkdDE3OTM2MzA3MDAkajYwJGwwJGgwl" class="inline-flex text-[#3F9A4B] px-2 py-2.5">Book a Demo</a></div>
    <p class="text-[13px] text-[#676767] mt-4">${one(/<p class="cta-ph"[^>]*>([\s\S]*?)<\/p>/, cta, "ph")}</p>
  </div>
</section>\n`;

const blog = chunk.slice(chunk.indexOf("<!-- BLOG"));
const blogs = [...blog.matchAll(/<div class="bc-cat">([\s\S]*?)<\/div><h3>([\s\S]*?)<\/h3><p>([\s\S]*?)<\/p><a class="bc-link"[^>]*>Read Article<\/a>/g)];
if (blogs.length !== 3) throw new Error("blogs " + blogs.length);
const blogHtml = shell(
  "bg-white",
  `<div class="text-center mb-8">${eye(one(/<span class="lbl[^"]*"[^>]*>([\s\S]*?)<\/span>/, blog, "blog eye"))}${h2(one(/<h2>([\s\S]*?)<\/h2>/, blog, "blog h"))}</div>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">${blogs
    .map(
      (m) => `<article class="bg-white border border-[#AAD39C]/60 rounded-2xl p-5 shadow-sm flex flex-col"><p class="text-[12px] uppercase tracking-[1px] text-[#3f9a4b]">${m[1]}</p><h3 class="text-[18px] text-[#505050] my-2" style="font-weight:700">${m[2]}</h3><p class="text-[13px] text-[#676767] leading-[1.55] flex-1">${m[3]}</p><a class="text-[#3F9A4B] mt-3" href="#">Read Article</a></article>`
    )
    .join("")}</div>`
);

const out = [cptHtml, rpcHtml, painHtml, wfHtml, mktHtml, payHtml, resHtml, whyHtml, tesHtml, csHtml, faqHtml, ctaHtml, blogHtml].join("\n");
html = html.slice(0, start) + out + html.slice(end);
if (html.includes('class="sec"') || html.includes("family-medicine.css")) throw new Error("old css remains");
fs.writeFileSync(p, html);
console.log("done", pills.length, steps.length, metrics.length, pains.length, wfs.length, pays.length, rows.length, whys.length, quotes.length, cases.length, faqs.length, blogs.length);
