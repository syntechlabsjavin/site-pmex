document.addEventListener("DOMContentLoaded", function () {
  const section = document.getElementById("pmex-platform");
  if (!section) return;

  const spacer = section.querySelector("[data-platform-spacer]");
  const stage = section.querySelector("[data-platform-stack]");
  const tabs = Array.from(section.querySelectorAll(".pmex-platform-tab"));
  const panels = Array.from(
    section.querySelectorAll(".pmex-platform-stack-card")
  );

  if (!spacer || !stage || !tabs.length || !panels.length) return;

  const sticky = section.querySelector("[data-platform-sticky]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeIndex = -1;
  let ticking = false;

  function isDesktop() {
    return window.matchMedia("(min-width: 768px)").matches;
  }

  function activateTab(index) {
    if (index === activeIndex) return;
    activeIndex = index;

    tabs.forEach(function (tab, i) {
      const active = i === index;
      if (active) {
        tab.style.background =
          "linear-gradient(90deg, var(--c-DCEFD5) 0%, var(--c-AAD39C) 100%)";
        tab.style.borderColor = "var(--c-AAD39C)";
        tab.style.color = "var(--c-315B37)";
        tab.setAttribute("aria-selected", "true");
      } else {
        tab.style.background = "var(--c-FFFFFF)";
        tab.style.borderColor = "var(--c-D8E4D4)";
        tab.style.color = "var(--c-6F746E)";
        tab.setAttribute("aria-selected", "false");
      }
    });
  }

  function equalizeAndStage() {
    panels.forEach(function (panel) {
      panel.style.position = "";
      panel.style.left = "";
      panel.style.right = "";
      panel.style.top = "";
      panel.style.width = "";
      panel.style.height = "";
      panel.style.minHeight = "";
      panel.style.transform = "";
      panel.style.opacity = "";
      panel.style.visibility = "";
      panel.style.pointerEvents = "";
      panel.style.zIndex = "";
      panel.style.display = "block";
      panel.classList.remove("is-stacked");
    });
    stage.style.height = "";

    void section.offsetHeight;

    let maxHeight = 0;
    panels.forEach(function (panel) {
      maxHeight = Math.max(maxHeight, Math.ceil(panel.getBoundingClientRect().height));
    });

    // Keep all 4 cards exactly the same height.
    maxHeight = Math.max(maxHeight, 420);
    stage.style.height = maxHeight + "px";

    panels.forEach(function (panel, index) {
      panel.style.position = "absolute";
      panel.style.left = "0";
      panel.style.right = "0";
      panel.style.top = "0";
      panel.style.width = "100%";
      panel.style.height = maxHeight + "px";
      panel.style.minHeight = maxHeight + "px";
      panel.style.display = "flex";
      panel.style.flexDirection = "column";
      panel.style.zIndex = String(10 + index);
      panel.classList.add("is-stacked");
    });
  }

  function getScrollRange() {
    const inset = sticky ? parseFloat(getComputedStyle(sticky).top) || 0 : 0;
    const top = spacer.getBoundingClientRect().top + window.scrollY - inset;
    // Match the actual sticky travel, including taller content.
    const distance = Math.max(1, spacer.offsetHeight - (sticky ? sticky.offsetHeight : window.innerHeight));
    return { top, distance };
  }

  function getScrollProgress() {
    const { top, distance } = getScrollRange();
    return Math.max(0, Math.min(1, (window.scrollY - top) / distance));
  }

  function renderStack(progress) {
    const segment = progress * (panels.length - 1);
    const base = Math.floor(segment);
    const fraction = segment - base;
    // Pause for reading at either end of a gently eased transition.
    const t = Math.max(0, Math.min(1, (fraction - 0.16) / 0.68));
    const eased = t * t * (3 - 2 * t);
    const active = Math.min(panels.length - 1, base + (eased >= 0.5 ? 1 : 0));
    const stageHeight = stage.offsetHeight || 420;

    panels.forEach(function (panel, index) {
      const current = index === base;
      const incoming = index === base + 1;
      const visible = reducedMotion.matches
        ? index === active
        : (current && t < 1) || (incoming && t > 0);
      let y = 0;
      let scale = 1;
      let opacity = 1;
      if (!reducedMotion.matches) {
        if (current) {
          y = -12 * eased;
          scale = 1 - 0.025 * eased;
          opacity = 1 - 0.18 * eased;
        } else if (incoming) {
          y = (1 - eased) * (stageHeight + 24);
        }
      }
      panel.style.transform = "translate3d(0," + y + "px,0) scale(" + scale + ")";
      panel.style.opacity = visible ? String(opacity) : "0";
      panel.style.visibility = visible ? "visible" : "hidden";
      panel.style.pointerEvents = index === active ? "auto" : "none";
      panel.style.zIndex = incoming ? "40" : "30";
      panel.inert = index !== active;
    });
    activateTab(active);
  }

  function renderMobile(index) {
    panels.forEach(function (panel, i) {
      const active = i === index;
      panel.inert = !active;
      panel.style.position = "relative";
      panel.style.left = "";
      panel.style.right = "";
      panel.style.top = "";
      panel.style.width = "";
      panel.style.height = "";
      panel.style.minHeight = "";
      panel.style.transform = "";
      panel.style.opacity = "1";
      panel.style.visibility = active ? "visible" : "hidden";
      panel.style.pointerEvents = active ? "auto" : "none";
      panel.style.zIndex = "";
      panel.style.display = active ? "block" : "none";
      panel.classList.remove("is-stacked");
    });
    stage.style.height = "";
    activateTab(index);
  }

  // When the sticky block (heading + tabs + cards) is taller than the screen, stick it so its bottom meets the bottom
  // of the screen instead of its top meeting the navbar. Otherwise the lower half of the cards stays below the screen
  // and the stacking animation runs while only half of the card is visible. getScrollRange() reads this top value.
  function fitSticky() {
    if (!sticky) return;
    sticky.style.top = "";
    if (!isDesktop()) return;
    const cssTop = parseFloat(getComputedStyle(sticky).top) || 0;
    const fitTop = window.innerHeight - sticky.offsetHeight;
    if (fitTop < cssTop) sticky.style.top = Math.round(fitTop) + "px";
  }

  function layout() {
    if (isDesktop()) {
      equalizeAndStage();
      fitSticky();
      renderStack(getScrollProgress());
    } else {
      fitSticky();
      renderMobile(Math.max(0, activeIndex));
    }
  }

  function onScroll() {
    if (!isDesktop()) return;
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      renderStack(getScrollProgress());
      ticking = false;
    });
  }

  function scrollToIndex(index) {
    if (!isDesktop()) {
      renderMobile(index);
      return;
    }

    const { top, distance } = getScrollRange();
    const progress = index / Math.max(1, panels.length - 1);
    window.scrollTo({
      top: top + progress * distance,
      behavior: reducedMotion.matches ? "instant" : "smooth"
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      scrollToIndex(Number(tab.getAttribute("data-stack-index") || 0));
    });
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", layout);
  window.addEventListener("load", layout);

  reducedMotion.addEventListener("change", onScroll);
  if (document.fonts) document.fonts.ready.then(layout);

  layout();
});
