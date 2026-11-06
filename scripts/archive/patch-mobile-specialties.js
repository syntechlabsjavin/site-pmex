const fs = require("fs");
const path = require("path");
const DIST = path.join(__dirname, "..", "dist");

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

const SPECIALTIES = [
  ["aba-therapy", "ABA Therapy"],
  ["acupuncture", "Acupuncture"],
  ["addiction-substance-abuse", "Addiction Substance Abuse"],
  ["allergy-immunology", "Allergy Immunology"],
  ["ambulance-ems-billing", "Ambulance EMS Billing"],
  ["anesthesia-billing", "Anesthesia Billing"],
  ["audiology", "Audiology"],
  ["bariatric-surgery", "Bariatric Surgery"],
  ["behavioral-health", "Behavioral Health"],
  ["cardiology", "Cardiology"],
  ["chiropractic", "Chiropractic"],
  ["dental-billing", "Dental Billing"],
  ["dermatology", "Dermatology"],
  ["emergency-medicine", "Emergency Medicine"],
  ["endocrinology", "Endocrinology"],
  ["family-medicine", "Family Medicine"],
  ["fqhc-billing", "FQHC Billing"],
  ["gastroenterology", "Gastroenterology"],
  ["general-surgery", "General Surgery"],
  ["geriatric-medicine", "Geriatric Medicine"],
  ["hematology", "Hematology"],
  ["hepatology", "Hepatology"],
  ["home-health-care", "Home Health Care"],
  ["hospitalist-medicine", "Hospitalist Medicine"],
  ["infectious-disease", "Infectious Disease"],
  ["infusion-therapy", "Infusion Therapy"],
  ["internal-medicine", "Internal Medicine"],
  ["laboratory-pathology", "Laboratory Pathology"],
  ["maternal-fetal-medicine", "Maternal Fetal Medicine"],
  ["medical-toxicology", "Medical Toxicology"],
  ["mental-health-billing", "Mental Health Billing"],
  ["neonatology", "Neonatology"],
  ["nephrology", "Nephrology"],
  ["neurology", "Neurology"],
  ["ob-gyn", "OB-GYN"],
  ["occupational-therapy", "Occupational Therapy"],
  ["oncology", "Oncology"],
  ["ophthalmology", "Ophthalmology"],
  ["optometry", "Optometry"],
  ["oral-maxillofacial-surgery", "Oral Maxillofacial Surgery"],
  ["orthopedic", "Orthopedic"],
  ["osteopathic-medicine", "Osteopathic Medicine"],
  ["otolaryngology-ent", "Otolaryngology ENT"],
  ["pain-management", "Pain Management"],
  ["pediatrics", "Pediatrics"],
  ["physical-therapy", "Physical Therapy"],
  ["plastic-surgery", "Plastic Surgery"],
  ["podiatry", "Podiatry"],
  ["psychiatry", "Psychiatry"],
  ["pulmonology", "Pulmonology"],
  ["radiology", "Radiology"],
  ["rehabilitation", "Rehabilitation"],
  ["rheumatology", "Rheumatology"],
  ["sleep-medicine", "Sleep Medicine"],
  ["snf-long-term-care", "SNF Long Term Care"],
  ["speech-therapy", "Speech Therapy"],
  ["sports-medicine", "Sports Medicine"],
  ["telehealth", "Telehealth"],
  ["thoracic-surgery", "Thoracic Surgery"],
  ["trauma-surgery", "Trauma Surgery"],
  ["urgent-care", "Urgent Care"],
  ["urology", "Urology"],
  ["vascular-vein-care", "Vascular Vein Care"],
  ["wound-care", "Wound Care"],
];

function fileFor(slug) {
  return FILE_ALIASES[slug] || `${slug}.html`;
}

const mobileInner = SPECIALTIES.map(
  ([slug, name]) =>
    `<a href="${fileFor(slug)}" class="text-[13px] text-[#676767]">${name}</a>`
).join("\n");

const mobileBlock = `<!-- SPECIALTIES_MOBILE_START -->\n${mobileInner}\n<!-- SPECIALTIES_MOBILE_END -->`;

let patched = 0;

for (const file of fs.readdirSync(DIST).filter((f) => f.endsWith(".html"))) {
  const full = path.join(DIST, file);
  let html = fs.readFileSync(full, "utf8");
  const before = html;

  if (html.includes("SPECIALTIES_MOBILE_START")) {
    html = html.replace(
      /<!-- SPECIALTIES_MOBILE_START -->[\s\S]*?<!-- SPECIALTIES_MOBILE_END -->/g,
      mobileBlock
    );
  } else {
    // Handle prettier-broken </span> tags
    html = html.replace(
      /(<span[^>]*\s*>\s*Our Specialties\s*<\/span\s*>)\s*(<div class="pl-4 flex flex-col gap-2 border-l border-\[#AAD39C\][^"]*">)[\s\S]*?(<\/div>)/gi,
      (match, span, open, close) => {
        let openFixed = open;
        if (!openFixed.includes("max-h-[45vh]")) {
          openFixed = openFixed.replace(
            'border-[#AAD39C]"',
            'border-[#AAD39C] max-h-[45vh] overflow-y-auto pr-2"'
          );
          if (!openFixed.includes("max-h-[45vh]")) {
            openFixed = openFixed.replace(
              "border-[#AAD39C]",
              "border-[#AAD39C] max-h-[45vh] overflow-y-auto pr-2"
            );
          }
        }
        return `${span}\n${openFixed}\n${mobileBlock}\n${close}`;
      }
    );
  }

  if (html !== before) {
    fs.writeFileSync(full, html, "utf8");
    patched += 1;
  }
}

console.log(`Mobile specialty menus patched: ${patched}`);
