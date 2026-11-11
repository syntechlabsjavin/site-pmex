function switchPlatformTab(index) {
    // Hide all panels
    document.querySelectorAll('[id^="ppanel-"]').forEach(p => p.style.display = 'none');
    document.getElementById('ppanel-' + index).style.display = 'block';

    // Reset all tab buttons
    document.querySelectorAll('[id^="ptab-"]').forEach(btn => {
        btn.className = 'u-text-gray-400 u-hov-text-gray-600 u-transition-colors u-text-14px u-font-medium';
        btn.style.cssText = '';
        const dot = btn.querySelector('span');
        if (dot) dot.remove();
    });

    // Activate clicked tab
    const active = document.getElementById('ptab-' + index);
    active.className = 'u-flex u-items-center u-gap-2 u-rounded-full u-px-5 u-py-2-5 u-text-14px u-font-semibold u-text-gray-800';
    active.style.cssText = 'background:var(--c-AAD39C-a15);backdrop-filter:blur(8px);border:1px solid var(--c-AAD39C-a35);box-shadow:0 4px 12px var(--c-AAD39C-a15);';

    if (!active.querySelector('span')) {
        const dot = document.createElement('span');
        dot.style.cssText = 'width:10px;height:10px;border-radius:50%;background:radial-gradient(circle in srgb,var(--c-BDE2B1) 0%,var(--c-8DB87E) 100%);box-shadow:0 0 0 4px var(--c-AAD39C-a30);display:inline-block;flex-shrink:0;';
        active.prepend(dot);
    }
}

// ===== PREPARE / AUTOMATE SECTION ===== 

const layers = [
    {
        tag: 'Layer 1',
        title: 'Data Sources',
        desc: 'This is the foundation everything runs on. PMEX ingests and normalizes data from your EHR, clearinghouses, payer portals, eligibility systems, and payment rolls into a single operational data model. Most RCM failures start here, with fragmented signals that no one system owns. PMEX solves that before automation even begins.'
    },
    {
        tag: 'Layer 2',
        title: 'Execution Layer',
        desc: 'PMEX\u2019s execution layer handles the day-to-day processing of claims, from creation and scrubbing through submission and follow-up. Every workflow is automated, with humans brought in only when judgment is required.'
    },
    {
        tag: 'Layer 3',
        title: 'System Adaptation Layer',
        desc: 'The system learns from every claim processed. Payer rule changes, denial patterns, and adjudication shifts are absorbed automatically, so performance improves over time without manual intervention.'
    },
    {
        tag: 'Layer 4',
        title: 'Platform Layer',
        desc: 'The platform layer provides the RCM data model, payer rules engine, workflow orchestration, and AI infrastructure that powers every layer above it. This is where PMEX\u2019s data advantage takes hold.'
    },
    {
        tag: 'Layer 5',
        title: 'Business Outcomes',
        desc: 'Every layer above exists to drive measurable business results: more revenue collected, faster, at lower cost. PMEX ties performance directly to financial outcomes across every payer, site, and specialty.'
    }
];

const activeDotClasses = ['u-w-5', 'u-bg-AAD39C'];
const inactiveDotClasses = ['u-w-1-5', 'u-bg-gray-300'];

let currentLayer = 0;

function switchLayer(index) {
    currentLayer = index;
    const content = document.getElementById('layer-content');
    if (!content) return; // pages that load this script without the layer section

    // Smooth text fade out — opacity only, no movement
    content.style.opacity = '0';
    content.style.transition = 'opacity 0.2s ease';

    setTimeout(() => {
        // Update text content after fade out
        document.getElementById('layer-tag').textContent = layers[index].tag;
        document.getElementById('layer-title').textContent = layers[index].title;
        document.getElementById('layer-desc').textContent = layers[index].desc;

        // Smooth text fade in
        content.style.opacity = '1';
    }, 200);

    // reset all - inactive state
    for (let i = 0; i < 5; i++) {
        const icon = document.getElementById('icon-' + i);
        const img = icon.querySelector('img');
        icon.style.transform = 'translateY(0px)';
        // center bright, edges dark - vignette effect via filter
        img.style.filter = 'grayscale(80%) brightness(0.90) drop-shadow(0px 4px 8px var(--c-000000-a20))';
        img.style.maskImage = 'radial-gradient(ellipse at center in srgb, black 40%, var(--c-000000-a30) 100%)';
        img.style.webkitMaskImage = 'radial-gradient(ellipse at center in srgb, black 40%, var(--c-000000-a30) 100%)';
        document.getElementById('label-' + i).className = 'u-hidden u-md-block u-text-11px u-font-bold u-tracking-0-12em u-uppercase u-text-9CA3AF';
        document.getElementById('bar-' + i).className = 'pmex-color-background u-hidden u-md-block u-w-full u-h-2px u-rounded-full u-bg-D1D5DB u-mt-1';
    }

    // activate selected - active state
    const activeIcon = document.getElementById('icon-' + index);
    const activeImg = activeIcon.querySelector('img');
    activeIcon.style.transform = 'translateY(-15px)';
    activeImg.style.filter = 'grayscale(0%) brightness(1) drop-shadow(0px 8px 16px var(--c-000000-a18))';
    activeImg.style.maskImage = 'none';
    activeImg.style.webkitMaskImage = 'none';
    document.getElementById('label-' + index).className = 'u-hidden u-md-block u-text-11px u-font-bold u-tracking-0-12em u-uppercase u-text-505050';
    document.getElementById('bar-' + index).className = 'pmex-color-background u-hidden u-md-block u-w-full u-h-3px u-rounded-full u-bg-AAD39C u-mt-1';

    // ---- Mobile dots ----
    document.querySelectorAll('.mobile-dot').forEach(el => {
        const i = parseInt(el.dataset.layer);
        el.classList.remove(...activeDotClasses, ...inactiveDotClasses);
        el.classList.add(...(i === index ? activeDotClasses : inactiveDotClasses));
    });

    // ---- Mobile counter ----
    const counterEl = document.getElementById('layer-mobile-counter');
    if (counterEl) counterEl.textContent = `${index + 1} / 5`;
}

// Page load pe Layer 1 default active
switchLayer(0);

const steps = [
    {
        title: 'Claims Creation & Scrubbing',
        desc: 'Missing modifiers, invalid codes, and credentialing mismatches cause most denials before a claim ever reaches a payer. PMEX validates every claim against payer-specific rules before it leaves your system, so your first-pass paid rate goes up and your team stops chasing avoidable rejections.'
    },
    {
        title: 'Denial Prediction & Prevention',
        desc: 'Most RCM tools tell you a claim was denied after the fact. PMEX scores every claim for denial risk in real time before submission, applying payer-specific adjudication patterns built from millions of processed claims. The result is fewer denials, faster collections, and less revenue stuck in rework.'
    },
    {
        title: 'Auto-Triage & Follow-up',
        desc: 'Unpaid claims pile up quickly when follow-up relies on manual checks. PMEX automatically prioritizes outstanding revenue based on recovery likelihood and payer behavior, runs routine follow-ups without manual intervention, and escalates only true exceptions that require human judgment so nothing slips through the cracks.'
    },
    {
        title: 'Payments & Reconciliation',
        desc: 'Payment posting and reconciliation are where revenue leakage hides. PMEX matches payments to claims automatically, flags discrepancies in real time, and gives you a live picture of cash across every payer and site.'
    },
    {
        title: 'The Big Picture',
        desc: 'Every layer feeds the next, giving you a single connected view of your entire claims lifecycle, from the moment a claim is created to the moment it is paid.'
    }
];

let currentStepMobile = 0;

function switchStep(index) {
    currentStepMobile = index;

    for (let i = 0; i < 5; i++) {
        const sidebar = document.getElementById('sidebar-' + i);
        const dot = document.getElementById('dot-' + i);
        const stitle = document.getElementById('stitle-' + i);
        const sdesc = document.getElementById('sdesc-' + i);

        if (i === index) {
            sidebar.style.background = 'var(--c-F8FBF5)';
            sidebar.classList.remove('u-border-l-transparent');
            sidebar.classList.add('u-border-l-7FB35C');
            dot.className = 'pmex-color-background u-w-10px u-h-10px u-rounded-full u-bg-7FB35C';
            stitle.className = 'u-text-13px u-font-medium u-tracking-1px u-uppercase u-text-505050';
            sdesc.classList.remove('u-hidden');
        } else {
            sidebar.style.background = '';
            sidebar.classList.remove('u-border-l-7FB35C');
            sidebar.classList.add('u-border-l-transparent');
            dot.className = 'pmex-color-background u-w-10px u-h-10px u-rounded-full u-bg-C4C4BC';
            stitle.className = 'u-text-13px u-font-medium u-tracking-1px u-uppercase u-text-9A9A92';
            sdesc.classList.add('u-hidden');
        }
    }

    // ---- Mobile nav title/counter ----
    const mTitleEl = document.getElementById('step-mobile-title');
    const mCounterEl = document.getElementById('step-mobile-counter');
    if (mTitleEl) mTitleEl.textContent = steps[index].title;
    if (mCounterEl) mCounterEl.textContent = `${index + 1}/5`;

    // Big picture toggle
    const normalContent = document.getElementById('normal-content');
    const bigPicture = document.getElementById('bigpicture-content');

    if (index === 4) {
        normalContent.classList.add('u-hidden');
        bigPicture.classList.remove('u-hidden');
        return; // card loop skip kar do
    } else {
        normalContent.classList.remove('u-hidden');
        bigPicture.classList.add('u-hidden');
    }

    for (let i = 0; i < 4; i++) {
        const card = document.getElementById('card-' + i);
        const ctitle = document.getElementById('ctitle-' + i);
        const csub = document.getElementById('csub-' + i);
        const img = card.querySelector('img');

        if (i === index) {
            card.style.background = 'var(--c-EEF3E9)';
            card.style.boxShadow = '0 0 120px 5px var(--c-FFFFFF-a55), 0 10px 30px var(--c-000000-a30)';
            card.style.position = 'relative';
            card.style.zIndex = '10';
            ctitle.className = 'u-text-11px u-sm-text-14px u-font-medium u-text-2D5C3F u-mb-1';
            csub.className = 'u-hidden u-sm-block u-text-12px u-text-4A7058 u-leading-1-4';
            if (img) img.style.filter = 'none';
        } else {
            card.style.background = 'var(--c-456E53)';
            card.style.boxShadow = 'none';
            card.style.position = 'relative';
            card.style.zIndex = '1';
            ctitle.className = 'u-text-11px u-sm-text-14px u-font-medium u-text-FFFFFF u-mb-1';
            csub.className = 'u-hidden u-sm-block u-text-12px u-text-A8C2A0 u-leading-1-4';
            if (img) img.style.filter = 'brightness(0) invert(1) opacity(0.85)';
        }
    }

    document.getElementById('active-title').textContent = steps[index].title;
    document.getElementById('active-desc').textContent = steps[index].desc;
}

switchStep(0);

// ===== UPDATED: responsive padding via classes instead of fixed inline px =====
const activeFeatPadding = ['u-py-4', 'u-px-5', 'u-md-imp-p-clamp-18px-2-4vw-32px'];
const inactiveFeatPadding = ['u-py-3', 'u-px-4', 'u-md-imp-p-clamp-14px-1-8vw-22px'];

function switchFeature(index) {
    for (let i = 0; i < 4; i++) {
        const feat = document.getElementById('feat-' + i);
        const dot = document.getElementById('fdot-' + i);
        const label = document.getElementById('flabel-' + i);
        const expand = document.getElementById('fexpand-' + i);
        const content = document.getElementById('fcontent-' + i);

        // remove both padding sets first, then apply the right one (no fixed px anymore)
        feat.classList.remove(...activeFeatPadding, ...inactiveFeatPadding);

        if (i === index) {
            feat.style.background = 'var(--c-EDEEE9)';
            feat.classList.add(...activeFeatPadding);
            feat.classList.remove('u-border-l-transparent');
            feat.classList.add('u-border-l-7FB35C');
            dot.className = 'pmex-color-background u-w-8px u-h-8px u-rounded-full u-flex-shrink-0 u-bg-7FB35C';
            label.className = 'u-text-11px u-font-bold u-tracking-2px u-uppercase u-text-505050';
            expand.classList.remove('u-hidden');
            if (content) { content.classList.remove('u-hidden'); content.style.display = 'flex'; }
        } else {
            feat.style.background = '';
            feat.classList.add(...inactiveFeatPadding);
            feat.classList.remove('u-border-l-7FB35C');
            feat.classList.add('u-border-l-transparent');
            dot.className = 'pmex-color-background u-w-8px u-h-8px u-rounded-full u-flex-shrink-0 u-bg-C4C4BC';
            label.className = 'u-text-11px u-font-bold u-tracking-2px u-uppercase u-text-9A9A92';
            expand.classList.add('u-hidden');
            if (content) { content.classList.add('u-hidden'); content.style.display = 'none'; }
        }
    }
}

switchFeature(0);

function scrollStories(direction) {
    const track = document.getElementById('stories-track');
    if (!track) return;
    const cardWidth = 320 + 16; // card width + gap
    track.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
}

// ===== Mobile Layer Nav: prev/next arrows =====
document.addEventListener('DOMContentLoaded', () => {
    const layerPrevBtn = document.getElementById('layer-prev');
    const layerNextBtn = document.getElementById('layer-next');
    if (layerPrevBtn) layerPrevBtn.addEventListener('click', () => switchLayer((currentLayer - 1 + 5) % 5));
    if (layerNextBtn) layerNextBtn.addEventListener('click', () => switchLayer((currentLayer + 1) % 5));

    // ===== Mobile Step Nav: prev/next arrows =====
    const stepPrevBtn = document.getElementById('step-prev');
    const stepNextBtn = document.getElementById('step-next');
    if (stepPrevBtn) stepPrevBtn.addEventListener('click', () => switchStep((currentStepMobile - 1 + 5) % 5));
    if (stepNextBtn) stepNextBtn.addEventListener('click', () => switchStep((currentStepMobile + 1) % 5));
});