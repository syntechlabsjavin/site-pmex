function switchPlatformTab(index) {
    // Hide all panels
    document.querySelectorAll('[id^="ppanel-"]').forEach(p => p.style.display = 'none');
    document.getElementById('ppanel-' + index).style.display = 'block';

    // Reset all tab buttons
    document.querySelectorAll('[id^="ptab-"]').forEach(btn => {
        btn.className = 'text-gray-400 hover:text-gray-600 transition-colors text-[14px] font-medium';
        btn.style.cssText = '';
        const dot = btn.querySelector('span');
        if (dot) dot.remove();
    });

    // Activate clicked tab
    const active = document.getElementById('ptab-' + index);
    active.className = 'flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-semibold text-gray-800';
    active.style.cssText = 'background:var(--c-AAD39C-a15);backdrop-filter:blur(8px);border:1px solid var(--c-AAD39C-a35);box-shadow:0 4px 12px var(--c-AAD39C-a15);';

    if (!active.querySelector('span')) {
        const dot = document.createElement('span');
        dot.style.cssText = 'width:10px;height:10px;border-radius:50%;background:radial-gradient(circle,var(--c-BDE2B1) 0%,var(--c-8DB87E) 100%);box-shadow:0 0 0 4px var(--c-AAD39C-a30);display:inline-block;flex-shrink:0;';
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

const activeDotClasses = ['w-5', 'bg-[var(--c-AAD39C)]'];
const inactiveDotClasses = ['w-1.5', 'bg-gray-300'];

let currentLayer = 0;

function switchLayer(index) {
    currentLayer = index;
    const content = document.getElementById('layer-content');

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
        img.style.maskImage = 'radial-gradient(ellipse at center, black 40%, var(--c-000000-a30) 100%)';
        img.style.webkitMaskImage = 'radial-gradient(ellipse at center, black 40%, var(--c-000000-a30) 100%)';
        document.getElementById('label-' + i).className = 'hidden md:block text-[11px] font-bold tracking-[0.12em] uppercase text-[var(--c-9CA3AF)]';
        document.getElementById('bar-' + i).className = 'pmex-color-background hidden md:block w-full h-[2px] rounded-full bg-[var(--c-D1D5DB)] mt-1';
    }

    // activate selected - active state
    const activeIcon = document.getElementById('icon-' + index);
    const activeImg = activeIcon.querySelector('img');
    activeIcon.style.transform = 'translateY(-15px)';
    activeImg.style.filter = 'grayscale(0%) brightness(1) drop-shadow(0px 8px 16px var(--c-000000-a18))';
    activeImg.style.maskImage = 'none';
    activeImg.style.webkitMaskImage = 'none';
    document.getElementById('label-' + index).className = 'hidden md:block text-[11px] font-bold tracking-[0.12em] uppercase text-[var(--c-505050)]';
    document.getElementById('bar-' + index).className = 'pmex-color-background hidden md:block w-full h-[3px] rounded-full bg-[var(--c-AAD39C)] mt-1';

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
            sidebar.classList.remove('border-l-transparent');
            sidebar.classList.add('border-l-[var(--c-7FB35C)]');
            dot.className = 'pmex-color-background w-[10px] h-[10px] rounded-full bg-[var(--c-7FB35C)]';
            stitle.className = 'text-[13px] font-medium tracking-[1px] uppercase text-[var(--c-505050)]';
            sdesc.classList.remove('hidden');
        } else {
            sidebar.style.background = '';
            sidebar.classList.remove('border-l-[var(--c-7FB35C)]');
            sidebar.classList.add('border-l-transparent');
            dot.className = 'pmex-color-background w-[10px] h-[10px] rounded-full bg-[var(--c-C4C4BC)]';
            stitle.className = 'text-[13px] font-medium tracking-[1px] uppercase text-[var(--c-9A9A92)]';
            sdesc.classList.add('hidden');
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
        normalContent.classList.add('hidden');
        bigPicture.classList.remove('hidden');
        return; // card loop skip kar do
    } else {
        normalContent.classList.remove('hidden');
        bigPicture.classList.add('hidden');
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
            ctitle.className = 'text-[11px] sm:text-[14px] font-medium text-[var(--c-2D5C3F)] mb-1';
            csub.className = 'hidden sm:block text-[12px] text-[var(--c-4A7058)] leading-[1.4]';
            if (img) img.style.filter = 'none';
        } else {
            card.style.background = 'var(--c-456E53)';
            card.style.boxShadow = 'none';
            card.style.position = 'relative';
            card.style.zIndex = '1';
            ctitle.className = 'text-[11px] sm:text-[14px] font-medium text-[var(--c-FFFFFF)] mb-1';
            csub.className = 'hidden sm:block text-[12px] text-[var(--c-A8C2A0)] leading-[1.4]';
            if (img) img.style.filter = 'brightness(0) invert(1) opacity(0.85)';
        }
    }

    document.getElementById('active-title').textContent = steps[index].title;
    document.getElementById('active-desc').textContent = steps[index].desc;
}

switchStep(0);

// ===== UPDATED: responsive padding via classes instead of fixed inline px =====
const activeFeatPadding = ['py-4', 'px-5', 'md:!p-[clamp(18px,2.4vw,32px)]'];
const inactiveFeatPadding = ['py-3', 'px-4', 'md:!p-[clamp(14px,1.8vw,22px)]'];

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
            feat.classList.remove('border-l-transparent');
            feat.classList.add('border-l-[var(--c-7FB35C)]');
            dot.className = 'pmex-color-background w-[8px] h-[8px] rounded-full flex-shrink-0 bg-[var(--c-7FB35C)]';
            label.className = 'text-[11px] font-bold tracking-[2px] uppercase text-[var(--c-505050)]';
            expand.classList.remove('hidden');
            if (content) { content.classList.remove('hidden'); content.style.display = 'flex'; }
        } else {
            feat.style.background = '';
            feat.classList.add(...inactiveFeatPadding);
            feat.classList.remove('border-l-[var(--c-7FB35C)]');
            feat.classList.add('border-l-transparent');
            dot.className = 'pmex-color-background w-[8px] h-[8px] rounded-full flex-shrink-0 bg-[var(--c-C4C4BC)]';
            label.className = 'text-[11px] font-bold tracking-[2px] uppercase text-[var(--c-9A9A92)]';
            expand.classList.add('hidden');
            if (content) { content.classList.add('hidden'); content.style.display = 'none'; }
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