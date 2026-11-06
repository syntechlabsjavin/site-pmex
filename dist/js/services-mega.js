// ---- Services mega dropdown: left categories switch the right-hand panel ----
(function () {
  function init() {
    var root = document.getElementById('homepage-services-panel');
    if (!root || !root.classList.contains('svc-mega')) return;
    var tabs = Array.prototype.slice.call(root.querySelectorAll('.svc-mega-tab'));
    var panes = Array.prototype.slice.call(root.querySelectorAll('.svc-mega-pane'));
    if (!tabs.length) return;

    function activate(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      panes.forEach(function (p) {
        p.hidden = p.getAttribute('aria-labelledby') !== tab.id;
      });
      if (focus) tab.focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('mouseenter', function () { activate(tab, false); });
      tab.addEventListener('focus', function () { activate(tab, false); });
      tab.addEventListener('click', function () { activate(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); activate(next, true); }
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
