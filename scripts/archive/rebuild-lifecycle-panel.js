const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "dist", "index.html");
let html = fs.readFileSync(file, "utf8");

const styleStart = html.indexOf("      <!-- HOW BILLING MOVES THROUGH PMEX -->");
const normalEnd = html.indexOf("              <!-- /normal-content -->");
if (styleStart < 0 || normalEnd < 0) {
  throw new Error("lifecycle markers not found");
}

const afterNormal = normalEnd + "              <!-- /normal-content -->".length;

const replacement = `      <!-- HOW BILLING MOVES THROUGH PMEX -->
      <style>
        [data-pmex-lifecycle] .lattice-grid {
          transform: rotate(-25deg) skew(15deg);
          display: grid;
          grid-template-columns: repeat(3, 14px);
          gap: 5px;
        }
        [data-pmex-lifecycle] .lattice-tile {
          width: 14px;
          height: 14px;
          border-radius: 2px;
        }
        [data-pmex-lifecycle] #lifecycle-sidebar {
          background: #F8FBF0;
        }
        [data-pmex-lifecycle] #lifecycle-sidebar button {
          position: relative;
          border-radius: 12px;
          margin: 0 0 10px;
          border: 1px solid transparent;
          transition: background 200ms ease, border-color 200ms ease, box-shadow 200ms ease;
        }
        [data-pmex-lifecycle] #lifecycle-sidebar button:hover {
          background: rgba(170, 211, 156, 0.22);
        }
        [data-pmex-lifecycle] #lifecycle-sidebar button[aria-current="true"] {
          background: rgba(170, 211, 156, 0.35);
          border-color: #AAD39C;
        }
        [data-pmex-lifecycle] #lifecycle-sidebar button[aria-current="true"]::before {
          content: "";
          position: absolute;
          left: 0;
          top: 10px;
          bottom: 10px;
          width: 6px;
          border-radius: 0 6px 6px 0;
          background: #3F9A4B;
        }
        [data-pmex-lifecycle] .lifecycle-feature-row {
          transition: border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease;
        }
        [data-pmex-lifecycle] .lifecycle-feature-row:hover {
          border-color: #AAD39C;
          box-shadow: 0 8px 18px rgba(40, 60, 38, 0.08);
          transform: translateY(-2px);
        }
        [data-pmex-lifecycle] #lifecycle-showcase-cta {
          transition: background 200ms ease, box-shadow 200ms ease, transform 200ms ease;
        }
        [data-pmex-lifecycle] #lifecycle-showcase-cta:hover {
          background: #243b1d;
          box-shadow: 0 10px 22px rgba(46, 74, 37, 0.28);
        }
        @media (min-width: 768px) {
          #normal-content {
            display: grid;
            grid-template-columns: minmax(0, 1.2fr) minmax(240px, 0.8fr);
            gap: 28px;
            align-items: stretch;
          }
        }
      </style>
      <section
        data-pmex-lifecycle
        class="relative font-sans border-b border-[#E0E0DA]"
      >
        <div
          data-lifecycle-spacer
          class="relative md:h-[400vh] lg:h-[450vh]"
        >
          <div
            data-lifecycle-sticky
            class="relative z-20 bg-white py-6 sm:py-8 lg:py-10 md:sticky md:top-[70px] lg:top-[80px]"
          >
        <div class="max-w-[1260px] mx-auto w-full px-4 sm:px-6 lg:px-10">
          <!-- Section Label + Title -->
          <div class="mb-5 sm:mb-8 lg:mb-10 text-center mx-auto max-w-[640px]">
            <p
              class="text-[11px] sm:text-[13px] font-medium text-[#3F9A4B] uppercase tracking-[1.2px]"
            >
              Claims Lifecycle
            </p>

            <h2
              class="mt-1.5 text-[22px] sm:text-[30px] lg:text-[36px] font-normal text-[#505050] leading-[1.2]"
            >
              How a claim moves through PMEX
            </h2>
          </div>

          <!-- MOBILE: step controls -->
          <div class="mb-4 md:hidden">
            <div class="flex items-center justify-between gap-3 mb-3">
              <button
                id="step-prev"
                type="button"
                aria-label="Previous step"
                class="w-10 h-10 flex items-center justify-center rounded-full border border-[#DDE2D9] bg-white text-[#676767] shadow-sm active:scale-95 transition"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><use href="./icons/site-icons.svg#index-how-a-claim-moves-through-pmex"></use></svg>
              </button>

              <div class="min-w-0 flex-1 text-center px-1">
                <p
                  id="step-mobile-title"
                  class="text-[13px] font-semibold leading-snug text-[#505050]"
                >
                  Charge Capture & Claim Scrubbing
                </p>
                <p
                  id="step-mobile-counter"
                  class="mt-0.5 text-[11px] font-medium text-[#929790]"
                >
                  1/5
                </p>
              </div>

              <button
                id="step-next"
                type="button"
                aria-label="Next step"
                class="w-10 h-10 flex items-center justify-center rounded-full border border-[#DDE2D9] bg-white text-[#676767] shadow-sm active:scale-95 transition"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><use href="./icons/site-icons.svg#chevron-right-tall"></use></svg>
              </button>
            </div>

            <div class="h-1.5 rounded-full bg-[#E8EBE4] overflow-hidden">
              <div
                id="step-progress"
                class="h-full rounded-full bg-[#AAD39C] transition-all duration-300 ease-out"
                style="width: 20%"
              ></div>
            </div>
          </div>

          <!-- MAIN LAYOUT: sidebar + content -->
          <div
            class="relative flex flex-col md:flex-row overflow-hidden rounded-3xl border border-[#E0E0DA] bg-white shadow-[0_18px_40px_rgba(40,60,38,0.08)]"
          >
            <!-- LEFT SIDEBAR (desktop) -->
            <nav
              id="lifecycle-sidebar"
              aria-label="Claims lifecycle steps"
              class="hidden md:block shrink-0 bg-[#F8FBF0] md:border-r border-[#E0E0DA] md:w-[280px] lg:w-[320px] p-5 lg:p-6"
            >
              <button
                id="sidebar-0"
                type="button"
                onclick="switchBillingStep(0)"
                aria-current="true"
                class="w-full text-left p-3 flex items-start gap-3.5 cursor-pointer"
              >
                <span id="dot-0" class="w-2.5 h-2.5 rounded-full bg-[#3F9A4B] shrink-0 mt-1 ml-1"></span>
                <div class="min-w-0 flex-1">
                  <p id="stitle-0" class="block text-xs font-extrabold uppercase tracking-wider text-[#2E4A25]">
                    Charge Capture &amp; Claim Scrubbing
                  </p>
                  <p id="sdesc-0" class="mt-0.5 text-xs text-[#2E4A25]/80 font-medium leading-relaxed">
                    Our certified coders validate every claim before submission.
                  </p>
                </div>
              </button>

              <button
                id="sidebar-1"
                type="button"
                onclick="switchBillingStep(1)"
                aria-current="false"
                class="w-full text-left p-3 flex items-start gap-3.5 cursor-pointer"
              >
                <span id="dot-1" class="w-2.5 h-2.5 rounded-full bg-[#C4C4BC] shrink-0 mt-1"></span>
                <div class="min-w-0 flex-1">
                  <p id="stitle-1" class="block text-xs font-bold uppercase tracking-wider text-[#505050]">
                    Denial Management &amp; Prevention
                  </p>
                  <p id="sdesc-1" class="mt-0.5 text-xs text-[#676767] font-normal leading-relaxed">
                    Specialty billers stop denials before they repeat.
                  </p>
                </div>
              </button>

              <button
                id="sidebar-2"
                type="button"
                onclick="switchBillingStep(2)"
                aria-current="false"
                class="w-full text-left p-3 flex items-start gap-3.5 cursor-pointer"
              >
                <span id="dot-2" class="w-2.5 h-2.5 rounded-full bg-[#C4C4BC] shrink-0 mt-1"></span>
                <div class="min-w-0 flex-1">
                  <p id="stitle-2" class="block text-xs font-bold uppercase tracking-wider text-[#505050]">
                    Expert Follow-Up &amp; Resolution
                  </p>
                  <p id="sdesc-2" class="mt-0.5 text-xs text-[#676767] font-normal leading-relaxed">
                    Senior specialists work every outstanding claim.
                  </p>
                </div>
              </button>

              <button
                id="sidebar-3"
                type="button"
                onclick="switchBillingStep(3)"
                aria-current="false"
                class="w-full text-left p-3 flex items-start gap-3.5 cursor-pointer"
              >
                <span id="dot-3" class="w-2.5 h-2.5 rounded-full bg-[#C4C4BC] shrink-0 mt-1"></span>
                <div class="min-w-0 flex-1">
                  <p id="stitle-3" class="block text-xs font-bold uppercase tracking-wider text-[#505050]">
                    Payment Posting &amp; Reconciliation
                  </p>
                  <p id="sdesc-3" class="mt-0.5 text-xs text-[#676767] font-normal leading-relaxed">
                    ERA and EOB reconciled daily by our posting team.
                  </p>
                </div>
              </button>

              <button
                id="sidebar-4"
                type="button"
                onclick="switchBillingStep(4)"
                aria-current="false"
                class="w-full text-left p-3 flex items-start gap-3.5 cursor-pointer"
              >
                <span id="dot-4" class="w-2.5 h-2.5 rounded-full bg-[#C4C4BC] shrink-0 mt-1"></span>
                <div class="min-w-0 flex-1">
                  <p id="stitle-4" class="block text-xs font-bold uppercase tracking-wider text-[#505050]">
                    Real-Time Practice Reporting
                  </p>
                  <p id="sdesc-4" class="mt-0.5 text-xs text-[#676767] font-normal leading-relaxed">
                    The full picture in the PMEX reporting platform.
                  </p>
                </div>
              </button>
            </nav>

            <!-- RIGHT PANEL -->
            <div class="flex-1 p-5 sm:p-6 lg:p-8 bg-[#F8FBF0]/70">
              <div id="normal-content">
                <!-- Middle editorial -->
                <div id="lifecycle-main" class="flex flex-col justify-between gap-5 min-w-0">
                  <div class="space-y-4">
                    <div id="lifecycle-expert" class="mb-1">
                      <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F8FBF0] border border-[#AAD39C] text-[#2E4A25] text-xs font-semibold mb-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-[#3F9A4B]"></span>
                        PMEX Certified Billers &amp; Specialty Coders
                      </div>
                      <p class="text-xs text-[#676767] font-normal leading-relaxed">
                        Real-time claim review, specialty-specific coding expertise, and payer knowledge across all 50 states and all specialties.
                      </p>
                    </div>

                    <div id="lifecycle-copy">
                      <h3
                        id="active-title"
                        class="text-xl sm:text-2xl font-bold text-[#505050] tracking-tight mb-1 leading-snug"
                      >
                        Charge Capture &amp; Claim Scrubbing
                      </h3>
                      <p
                        id="active-desc"
                        class="text-[#676767] text-xs sm:text-sm leading-relaxed"
                      >
                        Missing modifiers, invalid codes, and credentialing mismatches cause most denials before a claim ever reaches a payer. Our AAPC-certified coders review every claim against payer-specific rules, specialty billing guidelines, and documentation requirements before submission, so your first-pass paid rate goes up and your team stops chasing avoidable rejections.
                      </p>
                    </div>

                    <div id="lifecycle-features" class="space-y-2 pt-1">
                      <div class="lifecycle-feature-row flex items-start gap-2.5 p-2 rounded-xl bg-white border border-[#E0E0DA]">
                        <div class="p-1.5 rounded-lg bg-[#F8FBF0] text-[#2E4A25] mt-0.5 shrink-0">
                          <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><use href="./icons/site-icons.svg#rebuild-lifecycle-panel-charge-capture-amp-claim-scrubbing"></use></svg>
                        </div>
                        <div>
                          <h4 id="feature-title-0" class="text-xs font-bold text-[#505050] uppercase tracking-wide">Rules-Based Pre-Scrubbing</h4>
                          <p id="feature-desc-0" class="text-xs text-[#676767] mt-0.5">Our certified coders review every claim against payer rules before submission.</p>
                        </div>
                      </div>
                      <div class="lifecycle-feature-row flex items-start gap-2.5 p-2 rounded-xl bg-white border border-[#E0E0DA]">
                        <div class="p-1.5 rounded-lg bg-[#F8FBF0] text-[#2E4A25] mt-0.5 shrink-0">
                          <svg aria-hidden="true" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><use href="./icons/site-icons.svg#rebuild-lifecycle-panel-rules-based-pre-scrubbing"></use></svg>
                        </div>
                        <div>
                          <h4 id="feature-title-1" class="text-xs font-bold text-[#505050] uppercase tracking-wide">Specialty Coding Audit</h4>
                          <p id="feature-desc-1" class="text-xs text-[#676767] mt-0.5">AAPC-certified review against specialty billing guidelines and documentation requirements.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Right showcase card (keeps card ids for JS compatibility) -->
                <div id="lifecycle-cards" class="mt-5 md:mt-0">
                  <div
                    id="card-0"
                    class="flex flex-col bg-white rounded-2xl border border-[#E0E0DA] shadow-[0_10px_28px_rgba(40,60,38,0.08)] p-3 h-full justify-between"
                  >
                    <div class="text-center flex flex-col items-center space-y-2.5">
                      <div aria-hidden="true" class="w-14 h-14 flex items-center justify-center p-2.5 rounded-2xl bg-gradient-to-br from-[#F8FBF0] via-[#E8F3E4] to-[#F8FBF0] border border-[#AAD39C] shadow-inner">
                        <div class="lattice-grid">
                          <div class="lattice-tile" style="background:#2E4A25"></div>
                          <div class="lattice-tile" style="background:#3F9A4B"></div>
                          <div class="lattice-tile" style="background:#AAD39C"></div>
                          <div class="lattice-tile" style="background:#315B37"></div>
                          <div class="lattice-tile" style="background:#7FB35C"></div>
                          <div class="lattice-tile" style="background:#D7EBCF"></div>
                          <div class="lattice-tile" style="background:#3F9A4B"></div>
                          <div class="lattice-tile" style="background:#AAD39C"></div>
                          <div class="lattice-tile" style="background:#EEF3E9"></div>
                        </div>
                      </div>
                      <div>
                        <h3 id="ctitle-0" class="text-lg font-bold text-[#505050] tracking-tight leading-snug">Charge Capture &amp; Claim Scrubbing</h3>
                        <p id="csub-0" class="mt-1 text-[#676767] font-normal leading-relaxed max-w-xs mx-auto text-sm">Our certified coders review every claim against payer rules before submission.</p>
                      </div>
                      <div class="w-full bg-[#F8FBF0] rounded-xl border border-[#E0E0DA] flex items-center justify-around p-1.5">
                        <div class="text-center w-full py-2 px-3">
                          <span id="showcase-metric" class="block text-2xl sm:text-3xl font-extrabold text-[#3F9A4B] leading-none tracking-tight">99%</span>
                          <span id="showcase-metric-label" class="text-xs font-semibold text-[#505050] uppercase tracking-wide mt-1.5 block">Clean Claim Rate</span>
                        </div>
                      </div>
                    </div>
                    <div class="mt-2 border-t border-[#E0E0DA] pt-2">
                      <a
                        id="lifecycle-showcase-cta"
                        href="https://portal.pmexinc.com/?_gl=1*15wbhuk*_ga*MTYyNTM1MjEwNy4xNzkzNjMwNzAw*_ga_3YSTQXMPQH*czE3OTM2MzA3MDAkbzEkZzAkdDE3OTM2MzA3MDAkajYwJGwwJGgwl"
                        class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2E4A25] text-white font-semibold text-sm shadow-md"
                      >
                        <span id="showcase-cta-label">Schedule a Demo</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><use href="./icons/site-icons.svg#rebuild-lifecycle-panel-charge-capture-amp-claim-scrubbing-variant-2"></use></svg>
                      </a>
                    </div>
                  </div>

                  <!-- Hidden legacy cards for step ids used by older markup/scripts -->
                  <div id="card-1" class="hidden" aria-hidden="true">
                    <p id="ctitle-1">Denial Management &amp; Prevention</p>
                    <p id="csub-1">Specialty billers identify and prevent denial patterns before they repeat.</p>
                  </div>
                  <div id="card-2" class="hidden" aria-hidden="true">
                    <p id="ctitle-2">Expert Follow-Up &amp; Resolution</p>
                    <p id="csub-2">Senior billing specialists work every outstanding claim to resolution.</p>
                  </div>
                  <div id="card-3" class="hidden" aria-hidden="true">
                    <p id="ctitle-3">Payment Posting &amp; Reconciliation</p>
                    <p id="csub-3">ERA and EOB reconciled daily. Variances flagged same day.</p>
                  </div>
                </div>
              </div>
              <!-- /normal-content -->`;

// Find where the previous section started so we don't duplicate the opening section tag
// Our replacement includes from HOW BILLING comment through /normal-content
// But the old HTML already has <section data-pmex-lifecycle> AFTER the style.
// The styleStart points to HOW BILLING comment which includes old style + section start.
// We need to cut from styleStart to afterNormal, but the old content between styleStart
// and afterNormal includes the section opening - good, our replacement also includes it.
// However AFTER afterNormal comes bigpicture-content which still has the old section open.
// So we only replace through /normal-content and keep bigpicture.

html = html.slice(0, styleStart) + replacement + html.slice(afterNormal);
fs.writeFileSync(file, html);
console.log("lifecycle panel rebuilt");
