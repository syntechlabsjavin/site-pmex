/**
 * PMEX Specialty pages generator
 * - Creates missing specialty HTML pages from one reusable template
 * - Updates Our Specialties menus (desktop / mobile / footer) across all HTML pages
 * - Updates specialties.html hub grid
 *
 * Run: node scripts/generate-specialties.js
 */
const fs = require("fs");
const path = require("path");
const { iconForSlug } = require("./specialty-hub-icons");

const DIST = path.join(__dirname, "..", "dist");

/** Prefer existing rich pages where they already exist */
const FILE_ALIASES = {
  "anesthesia-billing": "anesthesiology.html",
  anesthesiology: "anesthesiology.html",
  "ob-gyn": "gynecology.html",
  gynecology: "gynecology.html",
  "mental-health-billing": "mental-health-billing.html",
  psychiatry: "psychiatry.html",
  "behavioral-health": "behavioral-health.html",
  orthopedic: "orthopedic.html",
  orthopedics: "orthopedic.html",
};

/**
 * Full Our Specialties submenu from reference site
 * https://pmex-healthcare-platform.notallowed01.chatgpt.site/anesthesia-billing
 */
const SPECIALTIES = [
  { slug: "aba-therapy", name: "ABA Therapy", focus: "ABA session coding, authorization tracking, and unit-based billing" },
  { slug: "acupuncture", name: "Acupuncture", focus: "acupuncture modality coding, time-based visits, and payer medical necessity rules" },
  { slug: "addiction-substance-abuse", name: "Addiction Substance Abuse", focus: "SUD program billing, POS rules, and bundled service compliance" },
  { slug: "allergy-immunology", name: "Allergy Immunology", focus: "allergy testing, immunotherapy vial prep, and injection series billing" },
  { slug: "ambulance-ems-billing", name: "Ambulance EMS Billing", focus: "ALS/BLS levels, mileage, origin/destination, and medical necessity" },
  { slug: "anesthesia-billing", name: "Anesthesia Billing", focus: "base + time units, medical direction modifiers, and CRNA billing" },
  { slug: "audiology", name: "Audiology", focus: "diagnostic audiology codes, hearing aid billing, and ABR/OAE claims" },
  { slug: "bariatric-surgery", name: "Bariatric Surgery", focus: "global surgical packages, prior auth, and complication billing" },
  { slug: "behavioral-health", name: "Behavioral Health", focus: "therapy coding, collaborative care, and payer-specific BH rules" },
  { slug: "cardiology", name: "Cardiology", focus: "diagnostic cardiology, device clinics, and facility vs professional splits" },
  { slug: "chiropractic", name: "Chiropractic", focus: "spinal CMT coding, therapy modalities, and Medicare AT modifier rules" },
  { slug: "dental-billing", name: "Dental Billing", focus: "CDT coding, medical-dental crossover claims, and payer fee schedules" },
  { slug: "dermatology", name: "Dermatology", focus: "Mohs coding, excision margins, and medical vs cosmetic routing" },
  { slug: "emergency-medicine", name: "Emergency Medicine", focus: "ED E/M levels, critical care time, and facility/professional split billing" },
  { slug: "endocrinology", name: "Endocrinology", focus: "CGM/pump billing, thyroid procedures, and chronic care management" },
  { slug: "family-medicine", name: "Family Medicine", focus: "preventive visits, AWV, CCM/PCM, and multi-problem E/M documentation" },
  { slug: "fqhc-billing", name: "FQHC Billing", focus: "PPS encounter rates, qualifying visits, and wraparound billing" },
  { slug: "gastroenterology", name: "Gastroenterology", focus: "endoscopy coding, anesthesia splits, and pathology coordination" },
  { slug: "general-surgery", name: "General Surgery", focus: "global periods, modifiers, and assistant surgeon billing" },
  { slug: "geriatric-medicine", name: "Geriatric Medicine", focus: "AWV, TCM, chronic care, and geriatric assessment coding" },
  { slug: "hematology", name: "Hematology", focus: "infusion therapy, drug units, and complex diagnosis coding" },
  { slug: "hepatology", name: "Hepatology", focus: "liver disease coding, transplant-related billing, and procedure support" },
  { slug: "home-health-care", name: "Home Health Care", focus: "PDGM episodes, OASIS alignment, and home visit documentation" },
  { slug: "hospitalist-medicine", name: "Hospitalist Medicine", focus: "subsequent hospital care, discharge codes, and critical care" },
  { slug: "infectious-disease", name: "Infectious Disease", focus: "consult coding, infusion therapies, and complex ID diagnosis sets" },
  { slug: "infusion-therapy", name: "Infusion Therapy", focus: "drug JW/JZ units, hydration hierarchies, and prior authorization" },
  { slug: "internal-medicine", name: "Internal Medicine", focus: "complex E/M, chronic disease management, and preventive services" },
  { slug: "laboratory-pathology", name: "Laboratory Pathology", focus: "specimen coding, panels, and professional/technical component splits" },
  { slug: "maternal-fetal-medicine", name: "Maternal Fetal Medicine", focus: "high-risk OB ultrasounds, antepartum care, and global OB packages" },
  { slug: "medical-toxicology", name: "Medical Toxicology", focus: "toxicology consults, ED critical care, and procedure documentation" },
  { slug: "mental-health-billing", name: "Mental Health Billing", focus: "psychotherapy, psych testing, and payer medical necessity" },
  { slug: "neonatology", name: "Neonatology", focus: "NICU critical care, daily attendance, and newborn coding" },
  { slug: "nephrology", name: "Nephrology", focus: "dialysis MCP, ESRD billing, and vascular access procedures" },
  { slug: "neurology", name: "Neurology", focus: "EMG/NCS, EEG, infusion therapies, and complex neuro diagnosis coding" },
  { slug: "ob-gyn", name: "OB-GYN", focus: "global OB packages, deliveries, and gynecologic surgical coding" },
  { slug: "occupational-therapy", name: "Occupational Therapy", focus: "timed units, CO/CQ modifiers, and plan-of-care compliance" },
  { slug: "oncology", name: "Oncology", focus: "chemo administration, drug billing, and radiation oncology support" },
  { slug: "ophthalmology", name: "Ophthalmology", focus: "eye exam coding, surgical globals, and retina injections" },
  { slug: "optometry", name: "Optometry", focus: "medical eye visits, refraction rules, and vision vs medical routing" },
  { slug: "oral-maxillofacial-surgery", name: "Oral Maxillofacial Surgery", focus: "medical-dental crossover, surgical extractions, and anesthesia billing" },
  { slug: "orthopedic", name: "Orthopedic", focus: "fracture care, arthroscopy, and DME coordination" },
  { slug: "osteopathic-medicine", name: "Osteopathic Medicine", focus: "OMT coding, E/M bundling rules, and documentation integrity" },
  { slug: "otolaryngology-ent", name: "Otolaryngology ENT", focus: "sinus endoscopy, audiology crossover, and surgical globals" },
  { slug: "pain-management", name: "Pain Management", focus: "interventional pain procedures, laterality, and medical necessity" },
  { slug: "pediatrics", name: "Pediatrics", focus: "well-child visits, vaccine administration, and age-based coding" },
  { slug: "physical-therapy", name: "Physical Therapy", focus: "timed units, therapy caps, and progress-note compliance" },
  { slug: "plastic-surgery", name: "Plastic Surgery", focus: "reconstructive vs cosmetic routing and complex repair coding" },
  { slug: "podiatry", name: "Podiatry", focus: "routine foot care edits, nail procedures, and surgical billing" },
  { slug: "psychiatry", name: "Psychiatry", focus: "psych E/M, psychotherapy add-ons, and collaborative care" },
  { slug: "pulmonology", name: "Pulmonology", focus: "PFT coding, sleep studies crossover, and critical care support" },
  { slug: "radiology", name: "Radiology", focus: "professional/technical splits, contrast, and prior authorization" },
  { slug: "rehabilitation", name: "Rehabilitation", focus: "IRF/rehab coding, therapy minutes, and interdisciplinary documentation" },
  { slug: "rheumatology", name: "Rheumatology", focus: "biologic infusions, joint injections, and prior auth workflows" },
  { slug: "sleep-medicine", name: "Sleep Medicine", focus: "home vs facility sleep studies and CPAP compliance billing" },
  { slug: "snf-long-term-care", name: "SNF Long Term Care", focus: "SNF consolidated billing, Part B therapy, and POS accuracy" },
  { slug: "speech-therapy", name: "Speech Therapy", focus: "timed SLP units, GN modifiers, and plan-of-care compliance" },
  { slug: "sports-medicine", name: "Sports Medicine", focus: "injection procedures, concussion E/M, and therapy coordination" },
  { slug: "telehealth", name: "Telehealth", focus: "POS/modifier rules, audio-only coverage, and payer telehealth policies" },
  { slug: "thoracic-surgery", name: "Thoracic Surgery", focus: "complex surgical coding, assistant surgeons, and global periods" },
  { slug: "trauma-surgery", name: "Trauma Surgery", focus: "trauma activation, critical care, and multi-procedure modifiers" },
  { slug: "urgent-care", name: "Urgent Care", focus: "S9088/clinic fees, E/M leveling, and after-hours billing" },
  { slug: "urology", name: "Urology", focus: "cystoscopy, stone procedures, and drug administration billing" },
  { slug: "vascular-vein-care", name: "Vascular Vein Care", focus: "vein ablation medical necessity and duplex study coding" },
  { slug: "wound-care", name: "Wound Care", focus: "debridement levels, skin substitutes, and episode documentation" },
];

/** Dropdown categories for Our Specialties mega menu */
const SPECIALTY_CATEGORIES = [
  {
    label: "Primary Care",
    slugs: ["family-medicine", "internal-medicine", "pediatrics", "geriatric-medicine", "osteopathic-medicine", "urgent-care", "fqhc-billing", "telehealth"],
  },
  {
    label: "Behavioral & Mental Health",
    slugs: ["behavioral-health", "psychiatry", "mental-health-billing", "aba-therapy", "addiction-substance-abuse"],
  },
  {
    label: "Medical Specialties",
    slugs: ["allergy-immunology", "cardiology", "dermatology", "endocrinology", "gastroenterology", "hematology", "hepatology", "infectious-disease", "nephrology", "neurology", "oncology", "pain-management", "pulmonology", "rheumatology", "sleep-medicine", "urology", "vascular-vein-care"],
  },
  {
    label: "Surgical Specialties",
    slugs: ["anesthesia-billing", "bariatric-surgery", "general-surgery", "oral-maxillofacial-surgery", "orthopedic", "plastic-surgery", "thoracic-surgery", "trauma-surgery"],
  },
  {
    label: "Therapy & Rehabilitation",
    slugs: ["physical-therapy", "occupational-therapy", "speech-therapy", "rehabilitation", "chiropractic", "acupuncture", "sports-medicine", "podiatry"],
  },
  {
    label: "Women's & Children's Health",
    slugs: ["ob-gyn", "maternal-fetal-medicine", "neonatology"],
  },
  {
    label: "Hospital & Post-Acute",
    slugs: ["emergency-medicine", "hospitalist-medicine", "ambulance-ems-billing", "home-health-care", "snf-long-term-care", "wound-care", "infusion-therapy", "medical-toxicology"],
  },
  {
    label: "Diagnostics & Ancillary",
    slugs: ["radiology", "laboratory-pathology", "audiology", "ophthalmology", "optometry", "otolaryngology-ent", "dental-billing"],
  },
];

function getSpecBySlug(slug) {
  return SPECIALTIES.find((s) => s.slug === slug);
}

function categorizedSpecialties() {
  return SPECIALTY_CATEGORIES.map((cat) => ({
    label: cat.label,
    items: cat.slugs.map(getSpecBySlug).filter(Boolean),
  })).filter((cat) => cat.items.length > 0);
}

function fileFor(slug) {
  if (FILE_ALIASES[slug]) return FILE_ALIASES[slug];
  return `${slug}.html`;
}

function hrefFor(spec) {
  return fileFor(spec.slug);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function desktopSpecialtiesPanel(activeSlug) {
  const categories = categorizedSpecialties()
    .map((cat) => {
      const links = cat.items
        .map((s) => {
          const active =
            s.slug === activeSlug ||
            fileFor(s.slug) === fileFor(activeSlug || "");
          const cls = active
            ? "text-[#464A25] font-semibold hover:text-black transition-colors text-[13px]"
            : "text-gray-600 hover:text-black transition-colors text-[13px]";
          return `<a href="${hrefFor(s)}" class="${cls}">${escapeHtml(s.name)}</a>`;
        })
        .join("\n");

      return `<div class="spec-cat">
<p class="spec-cat-title">${escapeHtml(cat.label)}</p>
<div class="spec-cat-links">
${links}
</div>
</div>`;
    })
    .join("\n");

  return `<div class="absolute top-[35px] left-0 opacity-0 invisible pointer-events-none transition-all duration-200 bg-white nav-dropdown-panel nav-specialties-panel border border-[#AAD39C] rounded-xl z-10 shadow-lg">
${categories}
<div class="spec-cat-footer">
<a href="specialties.html" class="text-[#3F9A4B] font-semibold text-[13px] hover:underline">View all specialties →</a>
</div>
</div>`;
}

function mobileSpecialtiesList() {
  return categorizedSpecialties()
    .map((cat) => {
      const links = cat.items
        .map(
          (s) =>
            `<a href="${hrefFor(s)}" class="text-[13px] text-[#676767]">${escapeHtml(s.name)}</a>`
        )
        .join("\n");
      return `<p class="spec-cat-title mobile">${escapeHtml(cat.label)}</p>\n${links}`;
    })
    .join("\n");
}

function footerSpecialtiesList() {
  // Keep footer compact: featured + all link
  const featured = [
    "physical-therapy",
    "cardiology",
    "orthopedic",
    "behavioral-health",
    "dermatology",
    "anesthesia-billing",
    "nephrology",
    "ob-gyn",
  ];
  const items = featured
    .map((slug) => SPECIALTIES.find((s) => s.slug === slug))
    .filter(Boolean)
    .map(
      (s) =>
        `<a href="${hrefFor(s)}" class="text-gray-500 text-[13px] hover:text-gray-800">${escapeHtml(s.name)}</a>`
    )
    .join("\n");
  return `${items}
<a href="specialties.html" class="text-[#3F9A4B] text-[13px] font-semibold hover:text-gray-800">All specialties →</a>`;
}

function buildContent(spec) {
  const n = spec.name;
  const focus = spec.focus;
  return {
    title: `${n} Billing Services | PMEX`,
    description: `PMEX ${n.toLowerCase()} billing specialists manage ${focus} for practices across all 50 states.`,
    eyebrow: `PMEX for ${n}`,
    headline: `${n} billing, coded correctly and collected completely.`,
    subhead: `PMEX manages ${focus} so your ${n.toLowerCase()} practice keeps more of the revenue it earns.`,
    about: [
      `${n} billing has specialty-specific rules that general billing teams routinely miss. PMEX assigns specialists who understand ${focus}, payer edits, and documentation requirements before a claim goes out.`,
      `We support ${n.toLowerCase()} practices across all 50 states — from solo providers to multi-location groups — with clean claim submission, denial prevention, and transparent reporting.`,
    ],
    services: [
      { title: "Specialty Coding Review", desc: `${n} codes, modifiers, and documentation checked before submission.` },
      { title: "Payer Rule Engine", desc: `Payer-specific edits for ${n.toLowerCase()} claims applied in real time.` },
      { title: "Prior Authorization Support", desc: `Auth tracking and clinical packet support where ${n.toLowerCase()} services require it.` },
      { title: "Denial Prevention", desc: `Root-cause denial analysis focused on ${n.toLowerCase()} patterns.` },
      { title: "AR Follow-Up", desc: `Specialty-trained billers work unpaid ${n.toLowerCase()} claims to resolution.` },
      { title: "Practice Reporting", desc: `Clear visibility into collections, denials, and payer performance.` },
    ],
    problems: [
      {
        problem: `${n} claims denied for missing specialty modifiers or incomplete documentation.`,
        fix: `PMEX validates required ${n.toLowerCase()} modifiers and documentation before submission.`,
      },
      {
        problem: `Under-coding or missed add-on services reduces ${n.toLowerCase()} reimbursement.`,
        fix: `Our coders review operative/clinical notes to capture every billable component.`,
      },
      {
        problem: `Prior authorization gaps cause preventable write-offs.`,
        fix: `PMEX tracks auth status and flags services at risk before they are rendered or billed.`,
      },
      {
        problem: `Payer-specific ${n.toLowerCase()} edits reject otherwise clean claims.`,
        fix: `We maintain specialty payer rules and scrub claims against them pre-submission.`,
      },
      {
        problem: `Slow AR follow-up leaves collectible ${n.toLowerCase()} dollars aging out.`,
        fix: `Dedicated billers work aged claims with payer-specific escalation paths.`,
      },
      {
        problem: `Leadership lacks clear specialty performance visibility.`,
        fix: `PMEX reporting shows denial drivers, payer mix, and revenue opportunity by service line.`,
      },
    ],
    denials: [
      {
        title: `Modifier or documentation mismatch on ${n} claims`,
        body: `Specialty claims are frequently denied when required modifiers or clinical details are missing. Across a busy ${n.toLowerCase()} schedule, small misses compound into material monthly leakage.`,
        solution: `PMEX reviews each claim against specialty and payer requirements, correcting issues before the claim reaches the payer.`,
      },
      {
        title: `Medical necessity denials for ${n.toLowerCase()} procedures`,
        body: `Payers deny when diagnosis-to-procedure linkage or clinical indications are incomplete for ${n.toLowerCase()} services.`,
        solution: `Our team confirms diagnosis support and payer policy alignment before submission and appeals with clinical context when needed.`,
      },
      {
        title: `Timely filing and incomplete reconsideration packets`,
        body: `${n} denials often expire because appeals lack the right attachments or miss payer deadlines.`,
        solution: `PMEX manages appeal calendars and assembles complete reconsideration packages with specialty documentation.`,
      },
    ],
    faqs: [
      {
        q: `How quickly can PMEX take over ${n.toLowerCase()} billing?`,
        a: `Most practices transition within about 30 days, including credentialing verification, payer setup review, and workflow mapping.`,
      },
      {
        q: `Do you work with our existing EHR/PM system?`,
        a: `Yes. PMEX integrates with major practice management and EHR platforms without forcing a migration.`,
      },
      {
        q: `What makes ${n.toLowerCase()} billing different?`,
        a: `${n} billing depends on ${focus}. Generalist teams often miss these specialty rules; our specialists do not.`,
      },
      {
        q: `Can you help with denials already on the books?`,
        a: `Yes. We audit aged AR, prioritize recoverable dollars, and work specialty denials with complete appeal packets.`,
      },
    ],
  };
}

function pageTemplate(spec, content) {
  const services = content.services
    .map(
      (s) => `<div class="spec-card">
  <h3 class="text-[15px] sm:text-[16px] font-semibold text-[#505050] mb-2">${escapeHtml(s.title)}</h3>
  <p class="text-[13px] sm:text-[14px] leading-[1.6] text-[#676767]">${escapeHtml(s.desc)}</p>
</div>`
    )
    .join("\n");

  const problems = content.problems
    .map(
      (p) => `<div class="spec-problem">
  <p class="text-[14px] font-medium text-[#505050] mb-2">${escapeHtml(p.problem)}</p>
  <p class="text-[13px] leading-[1.6] text-[#3F9A4B]">${escapeHtml(p.fix)}</p>
</div>`
    )
    .join("\n");

  const denials = content.denials
    .map(
      (d, i) => `<article class="spec-denial">
  <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3F9A4B] mb-2">Pattern 0${i + 1}</p>
  <h3 class="text-[18px] sm:text-[20px] font-normal text-[#505050] mb-3">${escapeHtml(d.title)}</h3>
  <p class="text-[13px] sm:text-[14px] leading-[1.7] text-[#676767] mb-4">${escapeHtml(d.body)}</p>
  <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7FB35C] mb-2">PMEX Solution</p>
  <p class="text-[13px] sm:text-[14px] leading-[1.7] text-[#505050]">${escapeHtml(d.solution)}</p>
</article>`
    )
    .join("\n");

  const faqs = content.faqs
    .map(
      (f) => `<details class="spec-faq">
  <summary>${escapeHtml(f.q)}</summary>
  <p>${escapeHtml(f.a)}</p>
</details>`
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(content.title)}</title>
  <meta name="description" content="${escapeHtml(content.description)}" />
  <link href="./style.css" rel="stylesheet" />
  <script src="./js/demo-modal.js" defer></script>
  <script src="./js/nav-dropdown.js" defer></script>
</head>
<body class="min-h-screen">
  <div class="min-h-screen bg-white relative flex flex-col w-full">
    <!-- ===== HEADER ===== -->
    <header class="sticky top-0 z-50 bg-white w-full">
      <div class="max-w-[1260px] mx-auto px-5 sm:px-6 lg:px-10 h-[70px] lg:h-[80px] flex items-center justify-between gap-4 relative z-50 bg-white">
        <a href="index.html" class="shrink-0 lg:mr-4"><img src="./img/logo/grey-logo.svg" alt="PMEX Logo" class="h-[40px] sm:h-[45px] lg:h-[52px] w-auto" /></a>
        <ul class="hidden lg:flex absolute left-1/2 -translate-x-1/2 gap-4 xl:gap-8 text-sm text-[#676767] whitespace-nowrap">
          <li><a href="platform.html" class="text-[#959085] hover:text-[#505050] transition-colors">Platform</a></li>
          <li class="relative nav-dropdown">
            <a href="specialties.html" class="flex items-center gap-1 text-[#464A25] font-semibold">Our Specialties
              <svg class="w-4 h-4 transition-transform duration-200 nav-arrow inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><use href="./icons/site-icons.svg#chevron-down-wide"></use></svg>
            </a>
            <!-- SPECIALTIES_DESKTOP_START -->
            ${desktopSpecialtiesPanel(spec.slug)}
            <!-- SPECIALTIES_DESKTOP_END -->
          </li>
          <li class="relative nav-dropdown">
            <a href="services.html" class="flex items-center gap-1 text-[#959085] hover:text-[#505050] transition-colors">Services
              <svg class="w-4 h-4 transition-transform duration-200 nav-arrow inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><use href="./icons/site-icons.svg#chevron-down-wide"></use></svg>
            </a>
            <div class="absolute top-[35px] left-0 opacity-0 invisible pointer-events-none transition-all duration-200 bg-white nav-dropdown-panel flex border border-[#AAD39C] rounded-xl p-6 gap-12 w-[580px] z-10 shadow-lg">
              <div class="flex flex-col gap-3 flex-1">
                <a href="credentialing-enrollment.html" class="text-gray-600 hover:text-black transition-colors py-1">Credentialing & Enrollment</a>
                <a href="medical-billing-services.html" class="text-gray-600 hover:text-black transition-colors py-1">Medical Billing Services</a>
                <a href="revenue-cycle-management.html" class="text-gray-600 hover:text-black transition-colors py-1">Revenue Cycle Management</a>
                <a href="denial-management.html" class="text-gray-600 hover:text-black transition-colors py-1">Denial Management Services</a>
                <a href="account-receivable-management.html" class="text-gray-600 hover:text-black transition-colors py-1">Account Receivable Management</a>
                <a href="hospital-billing-services.html" class="text-gray-600 hover:text-black transition-colors py-1">Hospital Billing Services</a>
              </div>
              <div class="flex flex-col gap-3 flex-1">
                <a href="dme-pos-services.html" class="text-gray-600 hover:text-black transition-colors py-1">DME/POS Services</a>
                <a href="physician-billing-services.html" class="text-gray-600 hover:text-black transition-colors py-1">Physician Billing Services</a>
                <a href="outsource-medical-billing-services.html" class="text-gray-600 hover:text-black transition-colors py-1">Outsource Medical Billing Services</a>
                <a href="mental-health-billing.html" class="text-gray-600 hover:text-black transition-colors py-1">Mental Health Billing</a>
                <a href="cpap-billing.html" class="text-gray-600 hover:text-black transition-colors py-1">CPAP Billing</a>
                <a href="front-desk-services-remote.html" class="text-gray-600 hover:text-black transition-colors py-1">Front desk services (Remote)</a>
              </div>
            </div>
          </li>
          <li><a href="resources.html" class="text-[#959085] hover:text-[#505050] transition-colors">Resources</a></li>
          <li><a href="customers.html" class="text-[#959085] hover:text-[#505050] transition-colors">Customers</a></li>
        </ul>
        <div class="hidden lg:flex items-center gap-3">
          <a href="login.html" class="px-5 py-2 rounded-full bg-[#EEF0E8] text-[#505050] text-sm">Login</a>
          <a href="https://portal.pmexinc.com/?_gl=1*15wbhuk*_ga*MTYyNTM1MjEwNy4xNzkzNjMwNzAw*_ga_3YSTQXMPQH*czE3OTM2MzA3MDAkbzEkZzAkdDE3OTM2MzA3MDAkajYwJGwwJGgwl" class="bg-[#AAD39C] text-[#464A25] px-5 py-2 rounded-full text-sm">Book a demo</a>
        </div>
        <button id="hamburger-btn" class="lg:hidden flex flex-col justify-center gap-[5px] w-10 h-10" aria-label="Open menu">
          <span class="block w-5 h-[2px] bg-[#505050]"></span>
          <span class="block w-5 h-[2px] bg-[#505050]"></span>
          <span class="block w-5 h-[2px] bg-[#505050]"></span>
        </button>
      </div>
      <div id="mobile-menu" class="hidden lg:hidden fixed inset-0 top-[70px] bg-white z-40 overflow-y-auto px-5 py-6">
        <nav class="flex flex-col gap-6 font-normal mb-8">
          <a href="platform.html" class="text-[18px] border-b border-[#AAD39C] pb-2 font-medium text-[#505050]">Platform</a>
          <div class="flex flex-col gap-2">
            <span class="text-[18px] font-semibold text-[#505050]">Our Specialties</span>
            <div class="pl-4 flex flex-col gap-2 border-l border-[#AAD39C] max-h-[45vh] overflow-y-auto pr-2">
              <!-- SPECIALTIES_MOBILE_START -->
              ${mobileSpecialtiesList()}
              <!-- SPECIALTIES_MOBILE_END -->
            </div>
          </div>
          <a href="services.html" class="text-[18px] border-b border-[#AAD39C] pb-2 font-medium text-[#505050]">Services</a>
          <a href="resources.html" class="text-[18px] border-b border-[#AAD39C] pb-2 font-medium text-[#505050]">Resources</a>
          <a href="customers.html" class="text-[18px] border-b border-[#AAD39C] pb-2 font-medium text-[#505050]">Customers</a>
        </nav>
        <div class="flex flex-col gap-3">
          <a href="login.html" class="w-full text-center py-3 rounded-full bg-[#EEF0E8] text-[#505050] font-medium">Login</a>
          <a href="https://portal.pmexinc.com/?_gl=1*15wbhuk*_ga*MTYyNTM1MjEwNy4xNzkzNjMwNzAw*_ga_3YSTQXMPQH*czE3OTM2MzA3MDAkbzEkZzAkdDE3OTM2MzA3MDAkajYwJGwwJGgwl" class="w-full text-center py-3 rounded-full bg-[#AAD39C] text-[#2e4a25] font-medium">Book a demo</a>
        </div>
      </div>
      <script>
        document.addEventListener('DOMContentLoaded', function () {
          var btn = document.getElementById('hamburger-btn');
          var menu = document.getElementById('mobile-menu');
          if (btn && menu) {
            btn.addEventListener('click', function () {
              menu.classList.toggle('hidden');
              document.body.classList.toggle('overflow-hidden');
            });
          }
        });
      </script>
    </header>

    <main>
      <section class="relative w-full border-b border-[#AAD39C] py-16 sm:py-24 lg:py-32 flex items-center overflow-hidden">
        <div class="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_right_bottom,#4a8c3f_0%,#AAD39C_15%,#d4edcc_35%,transparent_55%)]"></div>
        <div class="max-w-[1260px] mx-auto w-full px-5 sm:px-6 lg:px-10 relative z-10">
          <p class="text-[12px] font-semibold tracking-[2px] text-[#3F9A4B] uppercase mb-3">${escapeHtml(content.eyebrow)}</p>
          <h1 class="text-[clamp(28px,5vw,48px)] font-normal leading-[1.2] mb-5 text-[#505050] max-w-[760px]">${escapeHtml(content.headline)}</h1>
          <p class="text-[#676767] text-[clamp(14px,1.6vw,16px)] max-w-[560px] mb-8 leading-relaxed">${escapeHtml(content.subhead)}</p>
          <div class="flex flex-wrap items-center gap-4 text-sm">
            <a href="https://portal.pmexinc.com/?_gl=1*15wbhuk*_ga*MTYyNTM1MjEwNy4xNzkzNjMwNzAw*_ga_3YSTQXMPQH*czE3OTM2MzA3MDAkbzEkZzAkdDE3OTM2MzA3MDAkajYwJGwwJGgwl" class="bg-[#AAD39C] text-[#2e4a25] px-6 py-2.5 rounded-full font-normal">Book a demo</a>
            <a href="revenue-audit.html" class="text-[#3F9A4B] font-normal hover:underline">Get a free revenue assessment →</a>
          </div>
        </div>
      </section>

      <section class="py-8 sm:py-10 border-b border-[#E0E0DA]" style="background:#EEF0E8;">
        <div class="max-w-[1260px] mx-auto w-full px-5 sm:px-6 lg:px-10">
          <p class="text-[12px] sm:text-[13px] font-medium tracking-[1px] uppercase text-[#959085] mb-3">Specialty</p>
          <h2 class="text-[24px] sm:text-[32px] lg:text-[36px] font-normal text-[#505050] leading-[1.2] mb-4">${escapeHtml(spec.name)}</h2>
          ${content.about.map((p) => `<p class="text-[14px] sm:text-[15px] text-[#676767] leading-[1.8] max-w-[820px] mb-3">${escapeHtml(p)}</p>`).join("")}
        </div>
      </section>

      <section class="py-10 lg:py-14 border-b border-[#E0E0DA]">
        <div class="max-w-[1260px] mx-auto w-full px-5 sm:px-6 lg:px-10">
          <p class="text-[12px] sm:text-[13px] font-medium text-[#3F9A4B] uppercase tracking-[1px] mb-2">What we do</p>
          <h2 class="text-[22px] sm:text-[30px] lg:text-[34px] font-normal text-[#505050] leading-[1.2] mb-6 sm:mb-8 max-w-[720px]">Full-service ${escapeHtml(spec.name)} revenue cycle management</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">${services}</div>
        </div>
      </section>

      <section class="py-10 lg:py-14 border-b border-[#E0E0DA] bg-[#F7F8F5]">
        <div class="max-w-[1260px] mx-auto w-full px-5 sm:px-6 lg:px-10">
          <p class="text-[12px] sm:text-[13px] font-medium text-[#3F9A4B] uppercase tracking-[1px] mb-2">Sound familiar?</p>
          <h2 class="text-[22px] sm:text-[30px] lg:text-[34px] font-normal text-[#505050] leading-[1.2] mb-3 max-w-[760px]">Common ${escapeHtml(spec.name)} billing problems — and how PMEX fixes them</h2>
          <p class="text-[14px] text-[#676767] mb-6 max-w-[680px]">Each issue below is one PMEX resolves before it costs you revenue.</p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">${problems}</div>
        </div>
      </section>

      <section class="py-10 lg:py-14 border-b border-[#E0E0DA]">
        <div class="max-w-[1260px] mx-auto w-full px-5 sm:px-6 lg:px-10">
          <p class="text-[12px] sm:text-[13px] font-medium text-[#3F9A4B] uppercase tracking-[1px] mb-2">Denial management</p>
          <h2 class="text-[22px] sm:text-[30px] lg:text-[34px] font-normal text-[#505050] leading-[1.2] mb-6 sm:mb-8 max-w-[780px]">Top denial patterns in ${escapeHtml(spec.name)} billing</h2>
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">${denials}</div>
        </div>
      </section>

      <section class="py-10 lg:py-14 border-b border-[#E0E0DA] bg-[#EEF0E8]">
        <div class="max-w-[1260px] mx-auto w-full px-5 sm:px-6 lg:px-10">
          <p class="text-[12px] sm:text-[13px] font-medium text-[#3F9A4B] uppercase tracking-[1px] mb-2">Questions</p>
          <h2 class="text-[22px] sm:text-[30px] lg:text-[34px] font-normal text-[#505050] leading-[1.2] mb-6">${escapeHtml(spec.name)} billing questions answered</h2>
          <div class="max-w-[860px] flex flex-col gap-3">${faqs}</div>
        </div>
      </section>

      <section class="py-12 sm:py-16 border-b border-[#E0E0DA]">
        <div class="max-w-[1260px] mx-auto w-full px-5 sm:px-6 lg:px-10 text-center">
          <h2 class="text-[24px] sm:text-[32px] font-normal text-[#505050] mb-3">Start with a free billing audit</h2>
          <p class="text-[14px] sm:text-[15px] text-[#676767] mb-6 max-w-[560px] mx-auto">Tell us about your ${escapeHtml(spec.name.toLowerCase())} practice and our team will help you take the next step.</p>
          <div class="flex flex-wrap justify-center gap-3">
            <a href="revenue-audit.html" class="bg-[#AAD39C] text-[#2e4a25] px-6 py-2.5 rounded-full text-sm font-medium">Get your free billing audit →</a>
            <a href="tel:15162084446" class="px-6 py-2.5 rounded-full border border-[#DDE2D9] text-[#505050] text-sm">Call (516) 208-4446</a>
          </div>
        </div>
      </section>
    </main>

    <footer class="pt-10 pb-10 bg-[#EEF0E8]">
      <div class="max-w-[1260px] mx-auto px-5 sm:px-6 lg:px-10">
        <div class="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-10 mb-10">
          <div>
            <a href="index.html" class="block mb-2"><img src="./img/logo/logo.png" alt="PMEX Logo" class="h-[60px] sm:h-[80px] w-auto" /></a>
            <p class="text-[#676767] text-[13px] leading-relaxed max-w-[300px]">Healthcare revenue infrastructure, rebuilt from first principles.</p>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div class="flex flex-col gap-3">
              <p class="text-[#505050] font-semibold text-[13px] border-b border-[#AAD39C] pb-2">Services</p>
              <a href="medical-billing-services.html" class="text-gray-500 text-[13px] hover:text-gray-800">Medical Billing Services</a>
              <a href="revenue-cycle-management.html" class="text-gray-500 text-[13px] hover:text-gray-800">Revenue Cycle Management</a>
              <a href="denial-management.html" class="text-gray-500 text-[13px] hover:text-gray-800">Denial Management Services</a>
              <a href="hospital-billing-services.html" class="text-gray-500 text-[13px] hover:text-gray-800">Hospital Billing Services</a>
            </div>
            <div class="flex flex-col gap-3">
              <p class="text-[#505050] font-semibold text-[13px] border-b border-[#AAD39C] pb-2">Our Specialties</p>
              <!-- SPECIALTIES_FOOTER_START -->
              ${footerSpecialtiesList()}
              <!-- SPECIALTIES_FOOTER_END -->
            </div>
            <div class="flex flex-col gap-3">
              <p class="text-[#505050] font-semibold text-[13px] border-b border-[#AAD39C] pb-2">Resources</p>
              <a href="resources.html" class="text-gray-500 text-[13px] hover:text-gray-800">Insights</a>
              <a href="customers.html" class="text-gray-500 text-[13px] hover:text-gray-800">Customer Stories</a>
              <a href="https://portal.pmexinc.com/?_gl=1*15wbhuk*_ga*MTYyNTM1MjEwNy4xNzkzNjMwNzAw*_ga_3YSTQXMPQH*czE3OTM2MzA3MDAkbzEkZzAkdDE3OTM2MzA3MDAkajYwJGwwJGgwl" class="text-gray-500 text-[13px] hover:text-gray-800">Book a Demo</a>
            </div>
          </div>
        </div>
        <div class="border-t border-[#AAD39C] pt-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <p class="text-[#676767] text-[12px]">© 2026 PMEX. All rights reserved.</p>
          <div class="flex gap-4 text-[12px] text-[#676767]">
            <a href="#" class="hover:text-[#505050]">Privacy Policy</a>
            <a href="#" class="hover:text-[#505050]">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</body>
</html>`;
}

function updateMenusInHtml(html) {
  const desktop = `<!-- SPECIALTIES_DESKTOP_START -->\n${desktopSpecialtiesPanel(null)}\n<!-- SPECIALTIES_DESKTOP_END -->`;
  const mobile = `<!-- SPECIALTIES_MOBILE_START -->\n${mobileSpecialtiesList()}\n<!-- SPECIALTIES_MOBILE_END -->`;
  const footer = `<!-- SPECIALTIES_FOOTER_START -->\n${footerSpecialtiesList()}\n<!-- SPECIALTIES_FOOTER_END -->`;

  // Replace any existing specialties mega panel (flat or categorized)
  html = html.replace(
    /<div class="absolute top-\[35px\] left-0[^"]*nav-(?:dropdown-panel )?nav-specialties-panel[^"]*"[^>]*>[\s\S]*?View all specialties[\s\S]*?<\/a>\s*<\/div>\s*<\/div>/gi,
    desktopSpecialtiesPanel(null)
  );

  // Also catch panels that still use only nav-dropdown-panel without specialties class leftovers
  html = html.replace(
    /<div\s+class="absolute top-\[35px\] left-0 opacity-0 invisible pointer-events-none transition-all duration-200 bg-white nav-dropdown-panel flex border border-\[#AAD39C\] rounded-xl p-6 gap-12 w-\[540px\] z-10 shadow-lg"[\s\S]*?<\/div>\s*<\/div>\s*<\/li>\s*<li class="relative nav-dropdown">/m,
    `${desktopSpecialtiesPanel(null)}\n</li>\n<li class="relative nav-dropdown">`
  );

  if (html.includes("SPECIALTIES_DESKTOP_START")) {
    html = html.replace(
      /<!-- SPECIALTIES_DESKTOP_START -->[\s\S]*?<!-- SPECIALTIES_DESKTOP_END -->/g,
      desktop
    );
  } else {
    // Wrap newly replaced panel with markers when possible
    html = html.replace(
      /(<div class="absolute top-\[35px\] left-0[^"]*nav-specialties-panel[\s\S]*?View all specialties[\s\S]*?<\/div>\s*<\/div>)/i,
      "<!-- SPECIALTIES_DESKTOP_START -->\n$1\n<!-- SPECIALTIES_DESKTOP_END -->"
    );
  }

  // Mobile specialties list
  if (html.includes("SPECIALTIES_MOBILE_START")) {
    html = html.replace(
      /<!-- SPECIALTIES_MOBILE_START -->[\s\S]*?<!-- SPECIALTIES_MOBILE_END -->/g,
      mobile
    );
  } else {
    html = html.replace(
      /(<span[^>]*\s*>\s*Our Specialties\s*<\/span\s*>)\s*(<div class="pl-4 flex flex-col gap-2 border-l border-\[#AAD39C\][^"]*">)[\s\S]*?(<\/div>)/gi,
      `$1\n$2\n${mobile}\n$3`
    );
  }

  if (html.includes("SPECIALTIES_FOOTER_START")) {
    html = html.replace(
      /<!-- SPECIALTIES_FOOTER_START -->[\s\S]*?<!-- SPECIALTIES_FOOTER_END -->/g,
      footer
    );
  }

  // Ensure mobile list container is scrollable
  html = html.replace(
    /pl-4 flex flex-col gap-2 border-l border-\[#AAD39C\](?![^"]*max-h-)/g,
    "pl-4 flex flex-col gap-2 border-l border-[#AAD39C] max-h-[45vh] overflow-y-auto pr-2"
  );

  return html;
}

function specialtyIcon(slug) {
  // Prefer exact slug match from professional Flaticon-style set
  const exact = String(slug || "")
    .trim()
    .toLowerCase()
    .split(/\s+/)[0]
    .replace(/\.html$/, "");
  return iconForSlug(exact);
}

function hoverBlurb(name) {
  const label = name.replace(/\s+Billing$/i, "").trim();
  return `${label} billing service that boost revenue and reduce denials for fast reimbursements.`;
}

function buildSpecialtiesHub() {
  const cards = SPECIALTIES.map((s) => {
    const displayName =
      s.slug === "orthopedic"
        ? "Orthopedics"
        : s.slug === "anesthesia-billing"
          ? "Anesthesia"
          : s.slug === "chiropractic"
            ? "Chiropractor"
            : s.name;

    return `<a href="${hrefFor(s)}" class="spec-hub-card">
  <div class="spec-hub-face">
    <span class="spec-hub-icon">${specialtyIcon(s.slug + " " + s.name)}</span>
    <h3>${escapeHtml(displayName)}</h3>
  </div>
  <p class="spec-hub-hover-text">${escapeHtml(hoverBlurb(displayName))}</p>
</a>`;
  }).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Our Specialties – PMEX | Built for your specialty</title>
  <meta name="description" content="PMEX revenue cycle solutions built for ${SPECIALTIES.length}+ healthcare specialties." />
  <link href="./style.css" rel="stylesheet" />
  <script src="./js/demo-modal.js" defer></script>
  <script src="./js/nav-dropdown.js" defer></script>
</head>
<body class="min-h-screen spec-hub-page">
  <header class="sticky top-0 z-50 bg-white w-full border-b border-[#E0E0DA]">
    <div class="max-w-[1260px] mx-auto px-5 sm:px-6 lg:px-10 h-[70px] lg:h-[80px] flex items-center justify-between">
      <a href="index.html"><img src="./img/logo/grey-logo.svg" alt="PMEX Logo" class="h-[40px] sm:h-[45px] lg:h-[52px] w-auto" /></a>
      <div class="flex items-center gap-3">
        <a href="https://portal.pmexinc.com/?_gl=1*15wbhuk*_ga*MTYyNTM1MjEwNy4xNzkzNjMwNzAw*_ga_3YSTQXMPQH*czE3OTM2MzA3MDAkbzEkZzAkdDE3OTM2MzA3MDAkajYwJGwwJGgwl" class="bg-[#AAD39C] text-[#2e4a25] px-5 py-2 rounded-full text-sm">Book a demo</a>
      </div>
    </div>
  </header>
  <main class="spec-hub-main">
    <div class="spec-hub-intro">
      <p class="spec-hub-eyebrow">Our Specialties</p>
      <h1>Built for your specialty</h1>
      <p class="spec-hub-sub">Hover any specialty to see how PMEX supports clean claims and faster reimbursement.</p>
    </div>
    <div class="spec-hub-grid">
${cards}
    </div>
  </main>
</body>
</html>`;
}

function main() {
  let created = 0;
  let skipped = 0;

  for (const spec of SPECIALTIES) {
    const file = fileFor(spec.slug);
    const target = path.join(DIST, file);
    const exists = fs.existsSync(target);

    // Don't overwrite existing rich specialty pages unless they were generated by us
    if (exists) {
      const current = fs.readFileSync(target, "utf8");
      const isGenerated = current.includes("spec-card") && current.includes("Full-service");
      if (!isGenerated) {
        skipped += 1;
        continue;
      }
    }

    const html = pageTemplate(spec, buildContent(spec));
    fs.writeFileSync(target, html, "utf8");
    created += 1;
  }

  // Always refresh hub
  fs.writeFileSync(path.join(DIST, "specialties.html"), buildSpecialtiesHub(), "utf8");

  // Patch menus across all HTML pages
  const files = fs.readdirSync(DIST).filter((f) => f.endsWith(".html"));
  let patched = 0;
  for (const file of files) {
    const full = path.join(DIST, file);
    const before = fs.readFileSync(full, "utf8");
    const after = updateMenusInHtml(before);
    if (after !== before) {
      fs.writeFileSync(full, after, "utf8");
      patched += 1;
    }
  }

  console.log(
    JSON.stringify(
      {
        specialties: SPECIALTIES.length,
        createdOrRefreshed: created,
        skippedExistingRich: skipped,
        menusPatched: patched,
      },
      null,
      2
    )
  );
}

main();
