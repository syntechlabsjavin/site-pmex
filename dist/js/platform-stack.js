// Home page platform section: sticky stacking cards.
// On screens 1024px+ wide where a card fits under the header, every card sticks a little lower than the one before it
// and slides up over it while scrolling; a covered card scales down slightly so the stack reads as a deck.
// Elsewhere the cards simply follow each other.
(function () {
  "use strict";

  var OFFSET = 24;   // each card sticks this much lower than the previous one, px
  var GAP = 16;      // space between the header and the first stuck card, px
  var SCALE = 0.05;  // how much a fully covered card shrinks

  function init(root) {
    var cards = Array.prototype.slice.call(root.querySelectorAll(".pmex-plat-panel"));
    if (!cards.length) return;
    var mq = window.matchMedia("(min-width: 1024px)");
    var ticking = false;

    function headerBottom() {
      var header = document.querySelector("header");
      return header ? Math.max(0, header.getBoundingClientRect().bottom) : 0;
    }

    function reset() {
      cards.forEach(function (card) { card.style.minHeight = ""; card.style.transform = ""; });
    }

    function update() {
      ticking = false;
      if (!root.classList.contains("is-stacking")) return;
      cards.forEach(function (card, i) {
        var next = cards[i + 1];
        if (!next) { card.style.transform = ""; return; }
        // 0 while the next card is a full card height below, 1 when it has reached its own sticky top
        var h = card.offsetHeight;
        var gap = next.getBoundingClientRect().top - card.getBoundingClientRect().top - OFFSET;
        var covered = Math.min(1, Math.max(0, 1 - gap / h));
        card.style.transform = covered ? "scale(" + (1 - SCALE * covered).toFixed(4) + ")" : "";
      });
    }

    function requestUpdate() {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }

    function setMode() {
      reset();
      if (!mq.matches) { root.classList.remove("is-stacking"); return; }
      // equal card heights, so every card covers the previous one completely
      var tallest = 0;
      root.classList.add("is-stacking");
      cards.forEach(function (card) { tallest = Math.max(tallest, card.offsetHeight); });
      var top = headerBottom() + GAP;
      var fits = top + OFFSET * (cards.length - 1) + tallest <= window.innerHeight - 8;
      if (!fits) { root.classList.remove("is-stacking"); return; }
      cards.forEach(function (card) { card.style.minHeight = tallest + "px"; });
      root.style.setProperty("--pmex-plat-top", top + "px");
      root.style.setProperty("--pmex-plat-offset", OFFSET + "px");
      update();
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", setMode);
    window.addEventListener("load", setMode);
    if (mq.addEventListener) mq.addEventListener("change", setMode); else mq.addListener(setMode);
    setMode();
  }

  function boot() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-plat-stack]"), init);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
