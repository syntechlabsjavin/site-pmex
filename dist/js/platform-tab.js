// Home page platform section (#pmex-platform).
//
// Large screens (1024px+ wide and 720px+ tall): stacking mode. The tabs bar sticks under the navbar and the four panels
// are sticky cards of equal height; while scrolling, each card slides up over the previous one. The tab of the card
// on screen is highlighted, and clicking a tab scrolls to its card.
// Other screens: plain tabs. Click a tab (or use Arrow keys, Home, End) to show its panel; only that panel is displayed.
(function () {
  function init() {
    var root = document.querySelector("#pmex-platform .pmex-plat");
    if (!root) return;
    var tabsBar = root.querySelector('[role="tablist"]');
    var list = root.querySelector(".pmex-plat-panels");
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    var panels = tabs.map(function (tab) {
      return document.getElementById(tab.getAttribute("aria-controls"));
    });
    if (!tabsBar || !list || !tabs.length || panels.indexOf(null) !== -1) return;

    var stackQuery = window.matchMedia("(min-width: 1024px) and (min-height: 720px)");
    var GAP = 16;            // space between the cards in the flow (matches the CSS gap)
    var stacking = false;
    var current = 0;
    var ticking = false;

    function markTabs(index) {
      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.tabIndex = on ? 0 : -1;
      });
    }

    // Plain tabs: show only the chosen panel.
    function select(index, focus) {
      current = index;
      markTabs(index);
      panels.forEach(function (panel, i) {
        var on = i === index;
        panel.classList.toggle("is-active", on);
        panel.setAttribute("aria-hidden", on ? "false" : "true");
        if (on) panel.removeAttribute("inert");
        else panel.setAttribute("inert", "");
      });
      if (focus) tabs[index].focus();
    }

    function stickTop() {
      return parseFloat(getComputedStyle(root).getPropertyValue("--pmex-plat-stick")) || 0;
    }

    // Position of card i in the normal flow (sticky cards report their stuck position, so it is computed).
    function cardScrollY(index) {
      var listTop = list.getBoundingClientRect().top + window.scrollY;
      return listTop + index * (panels[0].offsetHeight + GAP) - stickTop();
    }

    function onScroll() {
      if (!stacking || ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var limit = stickTop() + 2, active = 0;
        panels.forEach(function (panel, i) {
          if (panel.getBoundingClientRect().top <= limit) active = i;
        });
        if (active !== current) { current = active; markTabs(active); }
      });
    }

    function setMode() {
      stacking = stackQuery.matches;
      root.classList.toggle("is-stacking", stacking);
      panels.forEach(function (panel) { panel.style.minHeight = ""; });
      if (stacking) {
        panels.forEach(function (panel) {
          panel.classList.add("is-active");
          panel.setAttribute("aria-hidden", "false");
          panel.removeAttribute("inert");
        });
        // equal heights, so every new card fully covers the one before
        var max = 0;
        panels.forEach(function (panel) { max = Math.max(max, panel.offsetHeight); });
        panels.forEach(function (panel) { panel.style.minHeight = max + "px"; });
        var barTop = parseFloat(getComputedStyle(tabsBar).top) || 0;
        root.style.setProperty("--pmex-plat-stick", Math.round(barTop + tabsBar.offsetHeight + GAP) + "px");
        current = -1;
        onScroll();
      } else {
        root.style.removeProperty("--pmex-plat-stick");
        select(Math.max(0, current), false);
      }
    }

    function go(index, focus) {
      if (stacking) {
        window.scrollTo({ top: cardScrollY(index) + 1, behavior: "smooth" });
        if (focus) tabs[index].focus();
      } else {
        select(index, focus);
      }
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { go(i, false); });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % tabs.length;
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = tabs.length - 1;
        if (next !== null) { e.preventDefault(); go(next, true); }
      });
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", setMode);
    if (stackQuery.addEventListener) stackQuery.addEventListener("change", setMode);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setMode);
    window.addEventListener("load", setMode);

    select(0, false);
    setMode();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
