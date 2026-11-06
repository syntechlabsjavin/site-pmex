// ============================================================
// PMEX CLAIMS LIFECYCLE
// Desktop: sticky scroll tabs | Mobile: tap / swipe controls
// ============================================================

const billingSteps = [
  {
    title: "Charge Capture & Claim Scrubbing",
    desc: "Missing modifiers, invalid codes, and credentialing mismatches cause most denials before a claim ever reaches a payer. Our AAPC-certified coders review every claim against payer-specific rules, specialty billing guidelines, and documentation requirements before submission, so your first-pass paid rate goes up and your team stops chasing avoidable rejections.",
    cardSub:
      "Our certified coders review every claim against payer rules before submission.",
    features: [
      {
        title: "Rules-Based Pre-Scrubbing",
        desc: "Our certified coders review every claim against payer rules before submission.",
      },
      {
        title: "Specialty Coding Audit",
        desc: "AAPC-certified review against specialty billing guidelines and documentation requirements.",
      },
    ],
    metric: "99%",
    metricLabel: "Clean Claim Rate",
    cta: "Explore Scrubbing Engine",
    ctaHref: "/company/demo.html",
  },
  {
    title: "Denial Management & Prevention",
    desc: "Our specialty billing teams analyze denials by payer, code, and provider to identify root causes before they become recurring patterns. Our certified billers review documentation, correction requirements, and payer-specific processes so preventable revenue loss can be reduced going forward.",
    cardSub:
      "Specialty billers identify and prevent denial patterns before they repeat.",
    features: [
      {
        title: "Root Cause Review",
        desc: "Specialty billing teams analyze denials by payer, code, and provider.",
      },
      {
        title: "Prevention Focus",
        desc: "Certified billers review documentation and payer-specific processes to reduce repeat denials.",
      },
    ],
    metric: "97%",
    metricLabel: "First-Pass Acceptance",
    cta: "Explore Denial Workflow",
    ctaHref: "/services/denial-management.html",
  },
  {
    title: "Expert Follow-Up & Resolution",
    desc: "Every outstanding claim is worked by a dedicated billing specialist with specialty-specific payer knowledge. Routine follow-up is handled systematically. Complex cases including secondary payers, payer disputes, underpayments, and coordination of benefits issues are escalated to senior specialists.",
    cardSub:
      "Senior billing specialists work every outstanding claim to resolution.",
    features: [
      {
        title: "Dedicated Follow-Up",
        desc: "Every outstanding claim is worked by a dedicated billing specialist.",
      },
      {
        title: "Complex Case Escalation",
        desc: "Secondary payers, disputes, underpayments, and COB issues go to senior specialists.",
      },
    ],
    metric: "2.7M+",
    metricLabel: "Claims Processed",
    cta: "Explore Follow-Up",
    ctaHref: "/company/demo.html",
  },
  {
    title: "Payment Posting & Reconciliation",
    desc: "ERA and EOB payments are reconciled daily by our payment posting team. Variances between billed amounts, contracted rates, and received payments are reviewed and addressed. Payments are posted, verified, and reconciled so financial records stay accurate and discrepancies can be identified quickly.",
    cardSub: "ERA and EOB reconciled daily. Variances flagged same day.",
    features: [
      {
        title: "Daily Reconciliation",
        desc: "ERA and EOB payments are reconciled daily by our payment posting team.",
      },
      {
        title: "Variance Review",
        desc: "Variances between billed amounts, contracted rates, and received payments are reviewed.",
      },
    ],
    metric: "+30%",
    metricLabel: "Revenue Increase Avg",
    cta: "Explore Payment Posting",
    ctaHref: "/company/demo.html",
  },
  {
    title: "Real-Time Practice Reporting",
    desc: "A connected view of your entire revenue cycle end to end. Every step feeds the next, and every dollar is tracked from the moment a claim is created to the moment it is paid and reconciled. The PMEX reporting platform gives you visibility at every stage so you can understand where your revenue stands.",
    cardSub: "The full picture in the PMEX reporting platform.",
    features: [
      {
        title: "End-to-End Visibility",
        desc: "Every dollar is tracked from claim creation through payment and reconciliation.",
      },
      {
        title: "PMEX Reporting Platform",
        desc: "Real-time reporting updated by the PMEX billing team at every stage.",
      },
    ],
    metric: "50",
    metricLabel: "States Covered",
    cta: "Explore Reporting",
    ctaHref: "/company/demo.html",
  },
];

let currentBillingStep = 0;
let isProgrammaticScroll = false;
let programmaticScrollTimer = null;
let scrollRaf = null;

function isLifecycleDesktop() {
  return window.matchMedia("(min-width: 768px)").matches;
}

function getLifecycleElements() {
  const section = document.querySelector("[data-pmex-lifecycle]");
  if (!section) return null;

  return {
    section,
    spacer: section.querySelector("[data-lifecycle-spacer]"),
    sticky: section.querySelector("[data-lifecycle-sticky]"),
  };
}

function getScrollMetrics() {
  const els = getLifecycleElements();
  if (!els || !els.spacer) return null;

  const spacerTop = els.spacer.getBoundingClientRect().top + window.scrollY;
  const distance = Math.max(1, els.spacer.offsetHeight - window.innerHeight);

  return { spacerTop, distance, els };
}

function getStepFromScroll() {
  const metrics = getScrollMetrics();
  if (!metrics) return 0;

  const scrolled = window.scrollY - metrics.spacerTop;
  const progress = Math.max(0, Math.min(1, scrolled / metrics.distance));

  return Math.min(
    billingSteps.length - 1,
    Math.floor(progress * billingSteps.length),
  );
}

function scrollToBillingStep(index, smooth) {
  if (!isLifecycleDesktop()) return;

  const metrics = getScrollMetrics();
  if (!metrics) return;

  const clamped = Math.max(0, Math.min(billingSteps.length - 1, index));
  const progress = (clamped + 0.5) / billingSteps.length;
  const targetY = metrics.spacerTop + progress * metrics.distance;

  isProgrammaticScroll = true;
  if (programmaticScrollTimer) clearTimeout(programmaticScrollTimer);

  window.scrollTo({
    top: targetY,
    behavior: smooth ? "smooth" : "auto",
  });

  programmaticScrollTimer = setTimeout(
    function () {
      isProgrammaticScroll = false;
    },
    smooth ? 700 : 80,
  );
}

function updateMobileChrome(index) {
  const mobileTitle = document.getElementById("step-mobile-title");
  const mobileCounter = document.getElementById("step-mobile-counter");
  const progress = document.getElementById("step-progress");

  if (mobileTitle) {
    mobileTitle.textContent = billingSteps[index].title;
  }

  if (mobileCounter) {
    mobileCounter.textContent = index + 1 + "/" + billingSteps.length;
  }

  if (progress) {
    progress.style.width = ((index + 1) / billingSteps.length) * 100 + "%";
  }

  document.querySelectorAll("[data-step-dot]").forEach(function (dot) {
    const i = Number(dot.getAttribute("data-step-dot"));
    const active = i === index;
    dot.style.background = active ? "var(--c-3F9A4B)" : "var(--c-959085)";
    dot.style.width = active ? "18px" : "8px";
    dot.style.borderRadius = "999px";
  });
}

function switchBillingStep(index, options) {
  options = options || {};

  if (index < 0 || index >= billingSteps.length) {
    return;
  }

  const lifecycleSection = document.querySelector("[data-pmex-lifecycle]");
  if (!lifecycleSection) {
    return;
  }

  const stepChanged = currentBillingStep !== index;
  currentBillingStep = index;
  const step = billingSteps[index];

  billingSteps.forEach(function (_, i) {
    const sidebar = document.getElementById("sidebar-" + i);
    const dot = document.getElementById("dot-" + i);
    const title = document.getElementById("stitle-" + i);
    const desc = document.getElementById("sdesc-" + i);

    if (!sidebar) return;

    const isActive = i === index;
    sidebar.setAttribute("aria-current", isActive ? "true" : "false");

    if (dot) {
      dot.style.background = isActive ? "var(--c-3F9A4B)" : "var(--c-959085)";
      if (isActive) {
        dot.classList.add("ml-1");
      } else {
        dot.classList.remove("ml-1");
      }
    }

    if (title) {
      title.style.color = isActive ? "var(--c-2E4A25)" : "var(--c-505050)";
      title.style.fontWeight = isActive ? "800" : "700";
    }

    if (desc) {
      desc.style.color = isActive ? "var(--c-2E4A25)" : "var(--c-676767)";
      desc.style.fontWeight = isActive ? "500" : "400";
    }
  });

  updateMobileChrome(index);
  updateShowcaseImage(index);

  const normalContent = document.getElementById("normal-content");
  const bigPicture = document.getElementById("bigpicture-content");

  // Showcase layout is used for every step, including reporting.
  if (normalContent) normalContent.style.display = "";
  if (bigPicture) bigPicture.style.display = "none";

  const activeTitle = document.getElementById("active-title");
  const activeDesc = document.getElementById("active-desc");
  const featureTitle0 = document.getElementById("feature-title-0");
  const featureDesc0 = document.getElementById("feature-desc-0");
  const featureTitle1 = document.getElementById("feature-title-1");
  const featureDesc1 = document.getElementById("feature-desc-1");
  const showcaseTitle = document.getElementById("ctitle-0");
  const showcaseSub = document.getElementById("csub-0");
  const showcaseMetric = document.getElementById("showcase-metric");
  const showcaseMetricLabel = document.getElementById("showcase-metric-label");
  const showcaseCta = document.getElementById("lifecycle-showcase-cta");
  const showcaseCtaLabel = document.getElementById("showcase-cta-label");

  if (activeTitle) activeTitle.textContent = step.title;
  if (activeDesc) activeDesc.textContent = step.desc;

  if (featureTitle0) featureTitle0.textContent = step.features[0].title;
  if (featureDesc0) featureDesc0.textContent = step.features[0].desc;
  if (featureTitle1) featureTitle1.textContent = step.features[1].title;
  if (featureDesc1) featureDesc1.textContent = step.features[1].desc;

  if (showcaseTitle) showcaseTitle.textContent = step.title;
  if (showcaseSub) showcaseSub.textContent = step.cardSub;
  if (showcaseMetric) showcaseMetric.textContent = step.metric;
  if (showcaseMetricLabel) showcaseMetricLabel.textContent = step.metricLabel;
  if (showcaseCtaLabel) showcaseCtaLabel.textContent = step.cta;
  if (showcaseCta) showcaseCta.setAttribute("href", step.ctaHref);

  // Keep legacy hidden card copy in sync
  for (let i = 0; i < 4; i++) {
    const title = document.getElementById("ctitle-" + i);
    const sub = document.getElementById("csub-" + i);
    if (i === 0) continue;
    if (title && billingSteps[i]) title.textContent = billingSteps[i].title;
    if (sub && billingSteps[i]) sub.textContent = billingSteps[i].cardSub;
  }

  if (normalContent && stepChanged) {
    animateContent(normalContent);
  }

  if (!options.fromScroll && !options.skipScroll) {
    scrollToBillingStep(index, options.smooth !== false);
  }
}

function animateContent(element) {
  if (!element) return;

  element.animate(
    [
      { opacity: 0.55, transform: "translateY(5px)" },
      { opacity: 1, transform: "translateY(0)" },
    ],
    { duration: 280, easing: "ease-out" },
  );
}

function handleLifecycleScroll() {
  if (!isLifecycleDesktop() || isProgrammaticScroll) return;

  const step = getStepFromScroll();

  if (step !== currentBillingStep) {
    switchBillingStep(step, {
      fromScroll: true,
    });
  }
}

const showcaseImages = [
  "/img/1icon.webp",
  "/img/2icon.webp",
  "/img/3icon.webp",
  "/img/4icon.webp",
  "/img/5icon.webp",
];

function updateShowcaseImage(step) {
  const showcaseImage = document.getElementById("showcase-image");

  if (showcaseImage && showcaseImages[step]) {
    showcaseImage.src = showcaseImages[step];
  }
}

function onScroll() {
  if (scrollRaf) return;
  scrollRaf = requestAnimationFrame(function () {
    scrollRaf = null;
    handleLifecycleScroll();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const els = getLifecycleElements();
  if (!els) return;

  const previousButton = document.getElementById("step-prev");
  const nextButton = document.getElementById("step-next");

  if (previousButton) {
    previousButton.addEventListener("click", function () {
      const newIndex =
        (currentBillingStep - 1 + billingSteps.length) % billingSteps.length;
      switchBillingStep(newIndex, { skipScroll: !isLifecycleDesktop() });
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", function () {
      const newIndex = (currentBillingStep + 1) % billingSteps.length;
      switchBillingStep(newIndex, { skipScroll: !isLifecycleDesktop() });
    });
  }

  document.querySelectorAll("[data-step-dot]").forEach(function (dot) {
    dot.addEventListener("click", function () {
      const i = Number(dot.getAttribute("data-step-dot"));
      switchBillingStep(i, { skipScroll: !isLifecycleDesktop() });
    });
  });

  let touchStartX = 0;
  els.section.addEventListener(
    "touchstart",
    function (event) {
      if (!event.changedTouches || !event.changedTouches[0]) return;
      touchStartX = event.changedTouches[0].clientX;
    },
    { passive: true },
  );

  els.section.addEventListener(
    "touchend",
    function (event) {
      if (isLifecycleDesktop()) return;
      if (!event.changedTouches || !event.changedTouches[0]) return;

      const deltaX = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(deltaX) < 50) return;

      if (deltaX < 0) {
        switchBillingStep(
          Math.min(billingSteps.length - 1, currentBillingStep + 1),
          { skipScroll: true },
        );
      } else {
        switchBillingStep(Math.max(0, currentBillingStep - 1), {
          skipScroll: true,
        });
      }
    },
    { passive: true },
  );

  els.section.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
      switchBillingStep(
        (currentBillingStep - 1 + billingSteps.length) % billingSteps.length,
        { skipScroll: !isLifecycleDesktop() },
      );
    }

    if (event.key === "ArrowRight") {
      switchBillingStep((currentBillingStep + 1) % billingSteps.length, {
        skipScroll: !isLifecycleDesktop(),
      });
    }
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () {
    if (isLifecycleDesktop()) {
      onScroll();
    }
  });

  const initial = isLifecycleDesktop() ? getStepFromScroll() : 0;
  switchBillingStep(initial, { skipScroll: true });
});
