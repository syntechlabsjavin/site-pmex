// ---- Services mega dropdown ----
// Desktop (1101px+): the categories on the left are tabs that switch the right-hand pane.
// Hamburger menu (up to 1100px): the categories are an accordion. Each pane is moved right under its category button,
// all start closed, and a tap opens one category (and closes the others). Back on desktop the panes return.
(function () {
  function init() {
    var root = document.getElementById('homepage-services-panel');
    if (!root || !root.classList.contains('svc-mega')) return;
    var tabs = Array.prototype.slice.call(root.querySelectorAll('.svc-mega-tab'));
    var panes = Array.prototype.slice.call(root.querySelectorAll('.svc-mega-pane'));
    var tablist = root.querySelector('.svc-mega-tabs');
    var main = root.querySelector('.svc-mega-main');
    if (!tabs.length || !tablist || !main) return;

    var mq = window.matchMedia('(max-width: 1100px)');
    var mobile = false;
    var current = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];

    function paneOf(tab) { return document.getElementById(tab.getAttribute('aria-controls')); }

    function activate(tab, focus) {
      current = tab;
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

    function toggle(tab) {
      var open = tab.getAttribute('aria-expanded') !== 'true';
      tabs.forEach(function (t) {
        var on = t === tab && open;
        t.setAttribute('aria-expanded', on ? 'true' : 'false');
        var p = paneOf(t);
        if (p) p.classList.toggle('is-open', on);
      });
    }

    function setMode() {
      if (mq.matches === mobile) return;
      mobile = mq.matches;
      root.classList.toggle('is-accordion', mobile);
      if (mobile) {
        tablist.removeAttribute('role');
        tablist.removeAttribute('aria-orientation');
        tabs.forEach(function (t) {
          var p = paneOf(t);
          t.removeAttribute('role');
          t.removeAttribute('aria-selected');
          t.tabIndex = 0;
          t.setAttribute('aria-expanded', 'false');
          if (!p) return;
          p.removeAttribute('role');
          p.hidden = false;
          p.classList.remove('is-open');
          t.parentNode.insertBefore(p, t.nextSibling);
        });
      } else {
        tablist.setAttribute('role', 'tablist');
        tablist.setAttribute('aria-orientation', 'vertical');
        tabs.forEach(function (t) {
          t.setAttribute('role', 'tab');
          t.removeAttribute('aria-expanded');
        });
        panes.forEach(function (p) {
          p.setAttribute('role', 'tabpanel');
          p.classList.remove('is-open');
          main.appendChild(p);
        });
        activate(current, false);
      }
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('mouseenter', function () { if (!mobile) activate(tab, false); });
      tab.addEventListener('focus', function () { if (!mobile) activate(tab, false); });
      tab.addEventListener('click', function () { if (mobile) toggle(tab); else activate(tab, false); });
      tab.addEventListener('keydown', function (e) {
        if (mobile) return;
        var next = null;
        if (e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); activate(next, true); }
      });
    });

    if (mq.addEventListener) mq.addEventListener('change', setMode); else mq.addListener(setMode);
    setMode();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
