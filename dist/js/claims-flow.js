// Home page claims lifecycle: step track (tabs) above one detail panel.
// Screens 1024px+ wide where the stage fits under the header: the stage sticks there and every STEP px of scrolling opens
// the next step; the track line fills with the scroll. A click or the arrow keys scroll to that step.
// Other screens: plain tabs (click, Left/Right/Home/End).
(function () {
  "use strict";

  var STEP = 360; // scroll distance per step, px
  var GAP = 16;   // space between the header and the stuck stage, px

  function init(root) {
    var stage = root.querySelector(".pmex-flow-stage");
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    var panels = tabs.map(function (tab) { return document.getElementById(tab.getAttribute("aria-controls")); });
    if (!stage || !tabs.length || panels.some(function (p) { return !p; })) return;

    var last = tabs.length - 1;
    var mq = window.matchMedia("(min-width: 1024px)");
    var current = -1;
    var ticking = false;

    function show(index) {
      if (index === current) return;
      current = index;
      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.classList.toggle("is-active", on);
        tab.classList.toggle("is-done", i < index);
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.tabIndex = on ? 0 : -1;
        panels[i].classList.toggle("is-active", on);
        panels[i].setAttribute("aria-hidden", on ? "false" : "true");
        if (on) panels[i].removeAttribute("inert"); else panels[i].setAttribute("inert", "");
      });
    }

    function stickTop() {
      var header = document.querySelector("header");
      var bottom = header ? header.getBoundingClientRect().bottom : 0;
      return Math.max(0, bottom) + GAP;
    }

    // page Y at which the stage starts sticking
    function startY() {
      return root.getBoundingClientRect().top + window.pageYOffset - stickTop();
    }

    function onScroll() {
      ticking = false;
      if (!root.classList.contains("is-scroll")) return;
      stage.style.top = stickTop() + "px";
      var rel = window.pageYOffset - startY();
      root.style.setProperty("--pmex-flow-progress", Math.min(1, Math.max(0, rel / (last * STEP))));
      show(Math.min(last, Math.max(0, Math.floor(rel / STEP + 0.5))));
    }

    function requestUpdate() {
      if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
    }

    function go(index, focus) {
      if (root.classList.contains("is-scroll")) {
        window.scrollTo({ top: startY() + index * STEP + 1, behavior: "smooth" });
        if (focus) tabs[index].focus({ preventScroll: true });
        return;
      }
      show(index);
      root.style.setProperty("--pmex-flow-progress", last ? index / last : 0);
      if (focus) tabs[index].focus();
    }

    // scroll mode only when the whole stage fits on screen below the header
    function fits() {
      return stage.offsetHeight + stickTop() <= window.innerHeight - 8;
    }

    function setMode() {
      var scroll = mq.matches && fits();
      if (scroll && root.classList.contains("is-scroll")) { onScroll(); return; }
      root.classList.toggle("is-scroll", scroll);
      root.style.setProperty("--pmex-flow-runway", (last * STEP) + "px");
      if (scroll) { onScroll(); return; }
      stage.style.top = "";
      var keep = current < 0 ? 0 : current;
      current = -1;
      go(keep, false);
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { go(i, false); });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") next = Math.min(last, i + 1);
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = Math.max(0, i - 1);
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = last;
        if (next === null) return;
        e.preventDefault();
        go(next, true);
      });
    });

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", setMode);
    window.addEventListener("load", setMode);
    if (mq.addEventListener) mq.addEventListener("change", setMode); else mq.addListener(setMode);
    setMode();
  }

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-claims-flow]"), init);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
