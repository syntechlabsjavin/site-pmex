const fs = require("fs");
const path = "d:/work-space/real-projects/pmex-site/dist/index.html";
let text = fs.readFileSync(path, "utf8");
const nl = text.includes("\r\n") ? "\r\n" : "\n";

const startMarker = "      <!-- PMEX Portal";
const start = text.indexOf(startMarker);
const stackMarker =
  '          <div class="pmex-platform-stack relative mt-5" data-platform-stack>';
const stack = text.indexOf(stackMarker, start);

if (start < 0 || stack < 0) {
  console.error("open markers not found", { start, stack });
  process.exit(1);
}

const opening = [
  "      <!-- PMEX Portal — CENTERED STICKY STACK -->",
  "      <section",
  '        id="pmex-platform"',
  '        class="relative border-b border-[#E0E0DA] bg-white"',
  "      >",
  "        <div",
  "          data-platform-spacer",
  '          class="relative min-h-[100vh] md:min-h-[420vh]"',
  "        >",
  "          <div",
  "            data-platform-sticky",
  '            class="pmex-platform-sticky relative z-20 bg-white md:sticky md:top-0 md:flex md:min-h-screen md:items-center md:py-8"',
  "          >",
  '            <div class="mx-auto w-full max-w-[1260px] px-5 py-8 sm:px-6 lg:px-10 lg:py-10">',
  '              <div class="mx-auto max-w-[720px] text-center" data-platform-header>',
  "                <p",
  '                  class="text-[12px] font-medium uppercase tracking-[1px] text-[#3F9A4B] sm:text-[13px]"',
  "                >",
  "                  PMEX Portal",
  "                </p>",
  "",
  "                <h2",
  '                  class="mt-2 text-[22px] font-normal leading-[1.2] text-[#505050] sm:text-[30px] lg:text-[36px]"',
  "                >",
  "                  One platform. Every dollar in view.",
  "                </h2>",
  "",
  "                <p",
  '                  class="mx-auto mt-3 max-w-[520px] text-[13px] leading-[1.7] text-[#6F746E] sm:text-[14px]"',
  "                >",
  "                  Explore how PMEX connects claims, analytics, integrations, and",
  "                  compliance in one live revenue workspace.",
  "                </p>",
  "              </div>",
  "",
  "              <div",
  "                data-platform-tabs",
  '                class="pmex-platform-tabs mt-5 rounded-[18px] border border-[#E4EBE0] bg-white p-2 shadow-[0_8px_24px_-16px_rgba(42,56,40,0.25)]"',
  '                role="tablist"',
  "              >",
  "                <div",
  '                  class="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [-ms-overflow-style:none] lg:grid lg:grid-cols-4 lg:overflow-visible [&::-webkit-scrollbar]:hidden"',
  "                >",
  "                  <button",
  '                    type="button"',
  '                    class="pmex-platform-tab flex shrink-0 items-center justify-center gap-2.5 rounded-full border border-[#D8E4D4] px-4 py-2.5 text-center transition-all duration-300 sm:px-4 sm:py-3 lg:w-auto"',
  '                    data-tab="claims"',
  '                    data-stack-index="0"',
  "                  >",
  '                    <span class="tab-label whitespace-nowrap text-[12px] font-semibold sm:text-[13px]">',
  "                      Claims &amp; Billing",
  "                    </span>",
  "                  </button>",
  "",
  "                  <button",
  '                    type="button"',
  '                    class="pmex-platform-tab flex shrink-0 items-center justify-center gap-2.5 rounded-full border border-[#D8E4D4] bg-white px-4 py-2.5 text-center text-[#6F746E] transition-all duration-300 sm:px-4 sm:py-3 lg:w-auto"',
  '                    data-tab="analytics"',
  '                    data-stack-index="1"',
  "                  >",
  '                    <span class="tab-label whitespace-nowrap text-[12px] font-semibold sm:text-[13px]">',
  "                      Analytics &amp; Reporting",
  "                    </span>",
  "                  </button>",
  "",
  "                  <button",
  '                    type="button"',
  '                    class="pmex-platform-tab flex shrink-0 items-center justify-center gap-2.5 rounded-full border border-[#D8E4D4] bg-white px-4 py-2.5 text-center text-[#6F746E] transition-all duration-300 sm:px-4 sm:py-3 lg:w-auto"',
  '                    data-tab="integrations"',
  '                    data-stack-index="2"',
  "                  >",
  '                    <span class="tab-label whitespace-nowrap text-[12px] font-semibold sm:text-[13px]">',
  "                      Integrations &amp; Partners",
  "                    </span>",
  "                  </button>",
  "",
  "                  <button",
  '                    type="button"',
  '                    class="pmex-platform-tab flex shrink-0 items-center justify-center gap-2.5 rounded-full border border-[#D8E4D4] bg-white px-4 py-2.5 text-center text-[#6F746E] transition-all duration-300 sm:px-4 sm:py-3 lg:w-auto"',
  '                    data-tab="security"',
  '                    data-stack-index="3"',
  "                  >",
  '                    <span class="tab-label whitespace-nowrap text-[12px] font-semibold sm:text-[13px]">',
  "                      Security &amp; Compliance",
  "                    </span>",
  "                  </button>",
  "                </div>",
  "              </div>",
  "",
  '              <div class="pmex-platform-stack relative mt-5" data-platform-stack>',
].join(nl);

let next =
  text.slice(0, start) + opening + text.slice(stack + stackMarker.length);

const trusted = "      <!-- PMEX — TRUSTED NATIONWIDE / PERFORMANCE METRICS -->";
const trustedIdx = next.indexOf(trusted, start);
if (trustedIdx < 0) {
  console.error("trusted marker missing");
  process.exit(1);
}

const pattern = [
  "            </div>",
  "          </div>",
  "        </div>",
  "      </section>",
  "",
  trusted,
].join(nl);

const patternIdx = next.lastIndexOf(pattern, trustedIdx + trusted.length);
if (patternIdx < 0) {
  console.error("close pattern not found");
  console.log(JSON.stringify(next.slice(trustedIdx - 160, trustedIdx)));
  process.exit(1);
}

const replacement = [
  "            </div>",
  "              </div>",
  "            </div>",
  "          </div>",
  "        </div>",
  "      </section>",
  "",
  trusted,
].join(nl);

next =
  next.slice(0, patternIdx) +
  replacement +
  next.slice(patternIdx + pattern.length);

fs.writeFileSync(path, next, "utf8");
console.log("structure updated ok");
