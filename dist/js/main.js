// ---- Features Section ----
const tabTitles = [
    "Built on real healthcare complexity",
    "Humans where judgment matters",
    "Purpose-built for healthcare revenue"
];

const tabDescriptions = [
    "$2.5B+ in live claims data across specialty care environments — not synthetic data-sets or generalized AI abstractions.",
    "Camber's dedicated billing experts handle exceptions that automation cannot resolve on its own.",
    "Purpose-built data model, payer rules engine, and workflow orchestration."
];

let currentFeatureTab = 0;

function showTab(index) {
    currentFeatureTab = index;

    document.querySelectorAll('.tab-content').forEach((el, i) => {
        el.style.display = i === index ? 'flex' : 'none';
    });
    document.querySelectorAll('.tab-btn').forEach((btn, i) => {
        const dot = btn.querySelector('.dot');
        const extra = btn.querySelector('.tab-extra');
        if (i === index) {
            btn.classList.add('u-bg-FFFFFF');
            btn.classList.remove('u-bg-gray-50');
            dot.classList.add('u-bg-AAD39C');
            dot.classList.remove('u-bg-gray-300');
            if (extra) extra.classList.remove('u-hidden');
        } else {
            btn.classList.remove('u-bg-FFFFFF');
            btn.classList.add('u-bg-gray-50');
            dot.classList.remove('u-bg-AAD39C');
            dot.classList.add('u-bg-gray-300');
            if (extra) extra.classList.add('u-hidden');
        }
    });

    // mobile navigator: title + counter + description
    const titleEl = document.getElementById('mobile-tab-title');
    const counterEl = document.getElementById('mobile-tab-counter');
    const descEl = document.getElementById('mobile-tab-description');
    if (titleEl) titleEl.textContent = tabTitles[index];
    if (counterEl) counterEl.textContent = `${index + 1}/3`;
    if (descEl) descEl.textContent = tabDescriptions[index];
}


// ---- Lifecycle Section ----
const lifecycleTabTitles = [
    "Claims Lifecycle",
    "Denial Prediction",
    "Auto Triage",
    "Payments and Reconciliation"
];

const lifecycleTabDescriptions = [
    "Implement a revenue cycle platform that submits accurately, runs automatically, and gets smarter with every claim.",
    "Flag denial risks and fix issues before submission to maximize first-pass payment rates.",
    "Automatically prioritize denials by value and win probability so your team works what matters most.",
    "Match and reconcile payments automatically to eliminate manual errors and track outstanding revenue in real-time."
];

let currentLifecycleTab = 0;

function switchTab(index) {
    currentLifecycleTab = index;

    // hide all panels
    document.querySelectorAll('[id^="panel-"]').forEach(p => p.style.display = 'none');
    // show selected
    document.getElementById('panel-' + index).style.display = 'flex';

    // reset all desktop tabs
    document.querySelectorAll('[id^="lifecycle-tab-"]').forEach((btn) => {
        btn.className = 'u-text-gray-400 u-hov-text-gray-600 u-transition-colors';
        btn.style.cssText = 'font-size: 14px; font-weight: 500;';
        btn.innerHTML = btn.innerHTML.replace(/<span[^>]*><\/span>\s*/, '');
    });

    // activate clicked desktop tab
    const active = document.getElementById('lifecycle-tab-' + index);
    active.className = 'u-flex u-items-center u-gap-2 u-rounded-full u-px-5 u-py-2-5 u-shadow-sm';
    active.style.cssText = 'font-size: 14px; font-weight: 600; color: var(--c-1F2937); background: var(--c-AAD39C-a15); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid var(--c-AAD39C-a35); box-shadow: 0 4px 12px var(--c-AAD39C-a15);';

    // add dot if not already there
    if (!active.querySelector('span')) {
        const dot = document.createElement('span');
        dot.style.cssText = 'width:10px;height:10px;border-radius:50%;background:radial-gradient(circle in srgb, var(--c-BDE2B1) 0%, var(--c-8DB87E) 100%);box-shadow:0 0 0 4px var(--c-AAD39C-a30);display:inline-block;flex-shrink:0;';
        active.prepend(dot);
    }

    // update desktop description
    const desc = document.getElementById('tab-description');
    if (desc) {
        desc.textContent = lifecycleTabDescriptions[index];
    }

    // mobile nav title/counter/description
    const mTitleEl = document.getElementById('lifecycle-mobile-title');
    const mCounterEl = document.getElementById('lifecycle-mobile-counter');
    const mDescEl = document.getElementById('lifecycle-mobile-description');
    if (mTitleEl) mTitleEl.textContent = lifecycleTabTitles[index];
    if (mCounterEl) mCounterEl.textContent = `${index + 1}/4`;
    if (mDescEl) mDescEl.textContent = lifecycleTabDescriptions[index];

    // reset this panel's mobile Without/With toggle back to "Without Camber"
    showSide(index, 0);
}

function showSide(panelIndex, sideIndex) {
    document.querySelectorAll(`.panel-side[data-panel="${panelIndex}"]`).forEach(el => {
        const s = parseInt(el.dataset.side);
        if (window.innerWidth < 768) {
            el.style.display = s === sideIndex ? 'flex' : 'none';
        } else {
            el.style.display = 'flex'; // desktop: always show both
        }
    });

    document.querySelectorAll(`.side-toggle-btn[data-panel="${panelIndex}"]`).forEach(btn => {
        const s = parseInt(btn.dataset.side);
        btn.classList.toggle('side-toggle-active', s === sideIndex);
    });

    document.querySelectorAll(`.dot-indicator[data-panel="${panelIndex}"]`).forEach(dot => {
        const s = parseInt(dot.dataset.side);
        dot.classList.toggle('u-bg-FFFFFF', s === sideIndex);
        dot.classList.toggle('u-bg-FFFFFF-a40', s !== sideIndex);
    });
}


// ---- Who It's For Section ----
const whoTabTitles = [
    "Growing Clinics",
    "Large Group Platforms",
    "Growth Partners"
];

const whoTabDescriptions = [
    "Growing clinics hit a billing ceiling when revenue cycle relies on people. PMEX scales with your caseload without adding headcount.",
    "Large group platforms need consistency across every location. PMEX standardizes your revenue cycle so performance doesn't vary by site.",
    "Growth partners need a revenue platform that scales with their portfolio. PMEX gives you visibility and control across every practice you support."
];

let currentWhoTab = 0;

function switchWhoTab(index) {
    currentWhoTab = index;

    // hide all panels
    document.querySelectorAll('[id^="who-panel-"]').forEach(p => p.style.display = 'none');
    document.getElementById('who-panel-' + index).style.display = 'block';

    // reset all desktop tabs (skip mobile prev/next arrows)
    document.querySelectorAll('[id^="who-tab-"]').forEach(btn => {
        if (!btn.id.includes('prev') && !btn.id.includes('next')) {
            btn.className = 'u-text-gray-400 u-hov-text-gray-600 u-transition-colors';
            btn.style.fontSize = '14px';
            btn.style.fontWeight = '500';
            btn.style.color = '';
            const dot = btn.querySelector('span');
            if (dot) dot.remove();
        }
    });

    // activate clicked desktop tab
    const active = document.getElementById('who-tab-' + index);
    if (active) {
        active.className = 'u-flex u-items-center u-gap-2 u-bg-FFFFFF u-border u-border-gray-200 u-rounded-full u-px-4 u-py-2 u-shadow-sm';
        active.style.fontWeight = '600';
        active.style.color = 'var(--c-374151)';

        const dot = document.createElement('span');
        dot.style.cssText = 'width:10px;height:10px;border-radius:50%;background:var(--c-AAD39C);box-shadow:0 0 0 3px var(--c-E6F4E1);display:inline-block;flex-shrink:0;';
        active.prepend(dot);
    }

    // mobile nav title/counter/description
    const mTitleEl = document.getElementById('who-mobile-title');
    const mCounterEl = document.getElementById('who-mobile-counter');
    const mDescEl = document.getElementById('who-mobile-description');
    if (mTitleEl) mTitleEl.textContent = whoTabTitles[index];
    if (mCounterEl) mCounterEl.textContent = `${index + 1}/3`;
    if (mDescEl) mDescEl.textContent = whoTabDescriptions[index];
}


// ---- Carousel Logic ----
function scrollStories(dir) {
    const track = document.getElementById('stories-track');
    track.scrollBy({ left: dir * 280, behavior: 'smooth' });
}


// ---- Mobile Tab Navigators (Features + Who It's For) ----
document.addEventListener('DOMContentLoaded', () => {
    // Features section
    const prevBtn = document.getElementById('tab-prev');
    const nextBtn = document.getElementById('tab-next');
    if (prevBtn) prevBtn.addEventListener('click', () => showTab((currentFeatureTab - 1 + 3) % 3));
    if (nextBtn) nextBtn.addEventListener('click', () => showTab((currentFeatureTab + 1) % 3));

    // Who It's For section
    const whoPrevBtn = document.getElementById('who-tab-prev');
    const whoNextBtn = document.getElementById('who-tab-next');
    if (whoPrevBtn) whoPrevBtn.addEventListener('click', () => switchWhoTab((currentWhoTab - 1 + 3) % 3));
    if (whoNextBtn) whoNextBtn.addEventListener('click', () => switchWhoTab((currentWhoTab + 1) % 3));

    // ---- Smooth Navbar Dropdown Controller ----
    initNavDropdowns();
});

function initNavDropdowns() {
    const items = document.querySelectorAll('.nav-dropdown');
    if (!items.length) return;

    let closeTimer = null;
    let activeItem = null;

    function openDropdown(li) {
        if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
        if (activeItem && activeItem !== li) closeDropdown(activeItem, true);

        activeItem = li;
        const panel = li.querySelector('.nav-dropdown-panel');
        const arrow = li.querySelector('.nav-arrow');
        if (!panel) return;

        panel.classList.remove('u-opacity-0', 'u-invisible', 'u-pointer-events-none', 'u-translate-y-1');
        panel.classList.add('u-opacity-100', 'u-visible', 'u-pointer-events-auto');
        if (arrow) arrow.style.transform = 'rotate(180deg)';
    }

    function closeDropdown(li, immediate) {
        const panel = li.querySelector('.nav-dropdown-panel');
        const arrow = li.querySelector('.nav-arrow');
        if (!panel) return;

        const doClose = () => {
            panel.classList.add('u-opacity-0', 'u-invisible', 'u-pointer-events-none');
            panel.classList.remove('u-opacity-100', 'u-visible', 'u-pointer-events-auto');
            if (arrow) arrow.style.transform = '';
            if (activeItem === li) activeItem = null;
        };

        if (immediate) {
            doClose();
        } else {
            closeTimer = setTimeout(doClose, 120);
        }
    }

    items.forEach(li => {
        const panel = li.querySelector('.nav-dropdown-panel');

        // Mouse enters the nav item (trigger link area)
        li.addEventListener('mouseenter', () => openDropdown(li));

        // Mouse leaves the entire nav item (including panel)
        li.addEventListener('mouseleave', (e) => {
            // Check if moving to the panel itself
            if (panel && panel.contains(e.relatedTarget)) return;
            closeDropdown(li, false);
        });

        // Keep open when hovering inside the panel
        if (panel) {
            panel.addEventListener('mouseenter', () => {
                if (closeTimer) { clearTimeout(closeTimer); closeTimer = null; }
            });
            panel.addEventListener('mouseleave', (e) => {
                // Check if moving back to the nav item
                if (li.contains(e.relatedTarget)) return;
                closeDropdown(li, false);
            });
        }
    });

    // Close all dropdowns when clicking elsewhere on the page
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-dropdown')) {
            items.forEach(li => closeDropdown(li, true));
        }
    });
}


// ===== FAQ Accordion =====
function initFaqAccordion() {
    var faqList = document.getElementById('faq-list');
    if (!faqList) return;

    var allTriggers = faqList.querySelectorAll('.faq-trigger');

    function closeItem(item) {
        var panel = item.querySelector('.faq-panel');
        var icon = item.querySelector('.faq-icon');
        panel.classList.remove('faq-open');
        panel.style.gridTemplateRows = '0fr';
        item.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
        icon.style.transform = 'rotate(0deg)';
    }

    function openItem(item) {
        var panel = item.querySelector('.faq-panel');
        var icon = item.querySelector('.faq-icon');
        panel.classList.add('faq-open');
        panel.style.gridTemplateRows = '1fr';
        item.querySelector('.faq-trigger').setAttribute('aria-expanded', 'true');
        icon.style.transform = 'rotate(45deg)';
    }

    allTriggers.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var clickedItem = btn.closest('.faq-item');
            var isOpen = clickedItem.querySelector('.faq-panel').classList.contains('faq-open');

            allTriggers.forEach(function (otherBtn) {
                closeItem(otherBtn.closest('.faq-item'));
            });

            if (!isOpen) {
                openItem(clickedItem);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', initFaqAccordion);

// ===== Testimonial Slider =====
(function () {
    const track = document.getElementById("testiTrack");
    if (!track) return; // safety check in case this section isn't on the page

    let slidesPerView = 3;
    let currentIndex = 0;
    let isAnimating = false;
    let realSlideCount = 0;

    function getSlidesPerView() {
        if (window.innerWidth < 640) return 1;
        if (window.innerWidth < 1024) return 2;
        return 3;
    }

    function setWidths() {
        const widthPercent = 100 / slidesPerView;
        track.querySelectorAll(".testi-slide").forEach(function (el) {
            el.style.width = widthPercent + "%";
        });
    }

    function setPosition(animate) {
        const widthPercent = 100 / slidesPerView;
        track.style.transition = animate ? "transform 0.5s ease" : "none";
        track.style.transform = "translateX(-" + (currentIndex * widthPercent) + "%)";
    }

    function buildClones() {
        track.querySelectorAll(".testi-slide[data-clone='true']").forEach(function (el) {
            el.remove();
        });

        const realSlides = Array.prototype.slice.call(track.querySelectorAll(".testi-slide"));
        realSlideCount = realSlides.length;
        slidesPerView = getSlidesPerView();

        const startClones = realSlides.slice(-slidesPerView).map(function (el) {
            const clone = el.cloneNode(true);
            clone.setAttribute("data-clone", "true");
            return clone;
        });
        const endClones = realSlides.slice(0, slidesPerView).map(function (el) {
            const clone = el.cloneNode(true);
            clone.setAttribute("data-clone", "true");
            return clone;
        });

        startClones.reverse().forEach(function (clone) {
            track.insertBefore(clone, track.firstChild);
        });
        endClones.forEach(function (clone) {
            track.appendChild(clone);
        });

        setWidths();
        currentIndex = slidesPerView;
        setPosition(false);
    }

    function testiNext() {
        if (isAnimating) return;
        isAnimating = true;
        currentIndex++;
        setPosition(true);
    }

    function testiPrev() {
        if (isAnimating) return;
        isAnimating = true;
        currentIndex--;
        setPosition(true);
    }

    track.addEventListener("transitionend", function () {
        isAnimating = false;

        if (currentIndex >= realSlideCount + slidesPerView) {
            currentIndex = currentIndex - realSlideCount;
            setPosition(false);
        }
        if (currentIndex < slidesPerView) {
            currentIndex = currentIndex + realSlideCount;
            setPosition(false);
        }
    });

    window.addEventListener("resize", function () {
        buildClones();
    });

    window.testiNext = testiNext;
    window.testiPrev = testiPrev;

    buildClones();
})();

// ---- CBS Video Transparent Canvas Renderer ----
document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('cbs-video-src');
    const canvas = document.getElementById('cbs-video-canvas');
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let animId = null;

    function processFrame() {
        if (video.paused || video.ended) return;

        if (canvas.width !== video.videoWidth && video.videoWidth > 0) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }

        if (canvas.width > 0 && canvas.height > 0) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = frame.data;
            const len = data.length;

            for (let i = 0; i < len; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Pure / near-white video background removal
                if (r > 240 && g > 240 && b > 240) {
                    data[i + 3] = 0;
                } else if (r > 215 && g > 215 && b > 215) {
                    // Feathering for smooth edge anti-aliasing
                    const avg = (r + g + b) / 3;
                    data[i + 3] = Math.max(0, Math.min(255, (240 - avg) * 10));
                }
            }
            ctx.putImageData(frame, 0, 0);
        }
        animId = requestAnimationFrame(processFrame);
    }

    video.addEventListener('play', () => {
        if (!animId) animId = requestAnimationFrame(processFrame);
    });

    video.addEventListener('loadeddata', () => {
        video.play().catch(() => {});
    });

    if (!video.paused && video.readyState >= 2) {
        animId = requestAnimationFrame(processFrame);
    }
});