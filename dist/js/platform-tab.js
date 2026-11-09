// Home page platform section (#pmex-platform): accessible tabs.
// Click a tab (or use Arrow keys, Home, End) to show its panel. Only the active panel is displayed (CSS fades it in).
(function () {
  function init() {
    var root = document.querySelector("#pmex-platform .pmex-plat");
    if (!root) return;
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    var panels = tabs.map(function (tab) {
      return document.getElementById(tab.getAttribute("aria-controls"));
    });
    if (!tabs.length || panels.indexOf(null) !== -1) return;

    function select(index, focus) {
      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.tabIndex = on ? 0 : -1;
        panels[i].classList.toggle("is-active", on);
        panels[i].setAttribute("aria-hidden", on ? "false" : "true");
        if (on) panels[i].removeAttribute("inert");
        else panels[i].setAttribute("inert", "");
      });
      if (focus) tabs[index].focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { select(i, false); });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % tabs.length;
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = tabs.length - 1;
        if (next !== null) { e.preventDefault(); select(next, true); }
      });
    });

    select(0, false);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
