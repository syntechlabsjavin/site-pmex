const fs = require("fs");
const p = "dist/family-medicine.html";
let h = fs.readFileSync(p, "utf8");
const a = h.indexOf("<!-- USA COVERAGE -->");
const b = h.indexOf("<!-- WHO WE SERVE -->");
if (a < 0 || b < 0) throw new Error("markers " + a + " " + b);

const states = [
  ["Wisconsin", "RHC · CCM Heavy"],
  ["Tennessee", "Rural Health Clinics"],
  ["Colorado", "Concierge + DPC"],
  ["Texas", "Multi-Provider Groups"],
  ["California", "FQHC · Telehealth"],
  ["Florida", "Medicare-Heavy"],
  ["Ohio", "Value-Based Contracts"],
  ["New York", "PCMH + ACO"],
  ["+42 More", "All 50 States"],
];

function card(city, spec, n, last) {
  return `<div class="relative bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 border border-[#AAD39C]/50 overflow-hidden h-[94px] sm:h-[98px] group${last ? " bh-state-last" : ""}"><div class="absolute inset-0 bg-[#AAD39C] p-3 sm:p-3.5 rounded-2xl rounded-br-[60%_90%] flex items-center gap-2.5 sm:gap-3 pr-10 shadow-xs"><div class="min-w-0 flex-1 relative z-10"><h4 class="text-[13px] sm:text-[15px] font-extrabold text-[#505050] leading-tight truncate uppercase tracking-wider" style="font-weight:800 !important;color:#505050 !important">${city}</h4><p class="text-[10px] sm:text-[11px] text-[#505050] font-extrabold leading-tight mt-0.5 truncate" style="font-weight:700 !important;color:#505050 !important">${spec}</p></div></div><div class="absolute bottom-1 right-2 font-extrabold text-[12px] md:text-[14px] lg:text-[16px] text-[#2e4a25] tracking-tight z-20" style="font-weight:800 !important">${String(n).padStart(2, "0")}</div></div>`;
}

function pill(name, more) {
  const skin = more
    ? "bg-gradient-to-r from-[#EDEFE7] to-[#d8dce3] border border-[#AAD39C] hover:border-[#3F9A4B]"
    : "bg-white border border-[#AAD39C]/60 hover:border-[#AAD39C]";
  return `<div class="payer-box group relative overflow-hidden ${skin} rounded-full px-5 py-3 flex items-center justify-center shadow-xs transition-all duration-300 w-full h-[74px] sm:h-[82px] lg:h-[88px]"><div class="cpt-gradient"></div><span class="relative z-10 text-[13px] sm:text-[15px] text-[#505050]" style="font-weight:600 !important;color:#505050 !important">${name}</span></div>`;
}

const ehrs = ["Epic", "Athenahealth", "eClinicalWorks", "NextGen", "Kareo", "Practice Fusion", "DrChrono", "Allscripts"];

const html = `<!-- USA COVERAGE -->
<section class="border-b border-[#AAD39C] relative py-8 lg:py-10 bg-white">
  <div class="max-w-[1260px] mx-auto w-full px-5 sm:px-6 lg:px-10">
    <div class="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
      <div class="flex flex-col">
        <p class="text-[11px] sm:text-[13px] font-medium text-[#3F9A4B] uppercase tracking-[1px]">Based in the USA · Proven Track Record</p>
        <h2 class="text-[22px] sm:text-[30px] lg:text-[36px] font-normal text-[#505050] leading-[1.2] mb-3" style="font-weight:400 !important;color:#505050 !important">Family Medicine Billing Serving U.S. Primary Care Practices</h2>
        <div class="text-[14px] sm:text-[15px] text-[#676767] leading-[1.65] space-y-4">
          <p>PMEx is a <strong class="font-semibold text-[#505050]">family medicine billing company based in the USA</strong> with a proven track record of satisfied primary care clients. We understand the American primary care landscape from the inside the payer mix pressures facing rural health clinics, the E/M complexity post-2021 guideline changes, and the chronic care management revenue that most practices are leaving on the table every single month.</p>
          <p>We serve family medicine practices across all 50 states, from solo physicians in small towns to large multi-provider groups in major metros, federally qualified health centers, rural health clinics, concierge practices, and telehealth-first primary care platforms. Every billing workflow is built around <strong class="font-semibold text-[#505050]">U.S. payer rules, 2021 AMA E/M guidelines, CMS Medicare preventive service billing, and value-based care quality metrics</strong> updated continuously.</p>
          <p>Family medicine has the highest claim volume of any outpatient specialty in U.S. healthcare over 130 million annual patient visits. That volume means billing errors compound at scale, and revenue optimization programs like CCM and TCM generate dramatic results because every eligible patient becomes a recurring monthly revenue stream at no additional clinical cost.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <div class="bg-white border border-[#E0E0DA] rounded-2xl p-4 text-center"><div class="text-[22px] text-[#2E4A25]" style="font-weight:700 !important">130M</div><p class="text-[12px] text-[#676767] mt-1">Annual patient visits in U.S. family medicine highest of any specialty</p></div>
          <div class="bg-white border border-[#E0E0DA] rounded-2xl p-4 text-center"><div class="text-[22px] text-[#2E4A25]" style="font-weight:700 !important">$180K</div><p class="text-[12px] text-[#676767] mt-1">Max annual CCM/TCM/AWV revenue added per 3-provider practice with no added clinical time</p></div>
          <div class="bg-white border border-[#E0E0DA] rounded-2xl p-4 text-center"><div class="text-[22px] text-[#2E4A25]" style="font-weight:700 !important">1,200+</div><p class="text-[12px] text-[#676767] mt-1">Satisfied USA primary care clients served by PMEx</p></div>
        </div>
      </div>
      <div class="flex flex-col space-y-4">
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 xl:gap-3.5">
          ${states.map((s, i) => card(s[0], s[1], i + 1, i === 8)).join("\n")}
        </div>
        <div class="bg-[#F8FBF0] border border-[#AAD39C] rounded-2xl p-4 text-center"><p class="text-[13px] text-[#676767]">Rural Health Clinic billing managed for <strong class="text-[#505050]">all 50 state programs</strong>, including RHC all-inclusive rate structures, FQHC prospective payment system billing, and state-specific Medicaid primary care requirements.</p></div>
      </div>
    </div>
  </div>
</section>
<section class="border-b border-[#AAD39C] relative py-8 lg:py-10 bg-[#EEF0E8]">
  <div class="max-w-[1260px] mx-auto w-full px-5 sm:px-6 lg:px-10 text-center">
    <p class="text-[22px] sm:text-[30px] lg:text-[36px] font-normal text-[#505050] leading-[1.2] mb-5" style="font-weight:400 !important;color:#505050 !important">PMEx works inside your existing primary care EHR no migration, no system switch required</p>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 max-w-[1200px] mx-auto items-center">
      ${ehrs.map((n) => pill(n, false)).join("\n")}
      ${pill("+ 35 more", true)}
    </div>
  </div>
</section>
`;

if (!h.includes(".bh-state-last{")) {
  h = h.replace(
    "<style>.fm-outcomes",
    "<style>@media(max-width:639px){.bh-state-last{grid-column:1 / -1;justify-self:center;width:calc(50% - 0.25rem)}} .fm-outcomes"
  );
}
h = h.slice(0, a) + html + "\n" + h.slice(b);
fs.writeFileSync(p, h);
console.log("updated", a, b);
