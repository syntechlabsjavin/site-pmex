// Shared site shell: header, logo marquee and footer live once in /partials and are placed into every page.
//
// A page contains <script src="/js/site-shell.js" data-include="header"></script> where the header belongs
// (likewise "marquee" and "footer"). While the page is being parsed this script reads /partials/<name>.html,
// puts the markup in its own place and removes itself, so the shell is in the DOM before the other scripts run
// and the page does not jump. Needs an http(s) server (it does not work from file://).
(function () {
  var script = document.currentScript;
  var name = script && script.getAttribute('data-include');
  if (!name) return;

  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/partials/' + name + '.html', false); // synchronous on purpose: see the comment above
  try { xhr.send(); } catch (e) { return; }
  if (xhr.status < 200 || xhr.status >= 300) return;

  script.insertAdjacentHTML('beforebegin', xhr.responseText);
  script.parentNode.removeChild(script);
  if (name === 'header') initHeader();

  // Header behaviour: dropdown panels, mobile menu, Escape and outside click.
  function initHeader() {
    const root = document.getElementById('homepage-reference-nav'), menu = root.querySelector('#homepage-menu'), mobile = root.querySelector('.homepage-menu-toggle');
    const toggles = [...root.querySelectorAll('.homepage-dropdown-toggle')];

    // Where the hamburger shows (up to 1200px) the PMEX Portal button and the phone number sit inside the menu,
    // below the links. On wider screens they stay in the header bar, next to the menu.
    const actions = root.querySelector('.homepage-nav-actions');
    if (actions) {
      const bar = actions.parentNode, afterActions = actions.nextSibling, narrow = matchMedia('(max-width:1200px)');
      const place = () => { if (narrow.matches) menu.appendChild(actions); else bar.insertBefore(actions, afterActions); };
      narrow.addEventListener('change', place);
      place();
    }
    function set(button, open) { button.setAttribute('aria-expanded', String(open)); root.querySelector('#' + button.getAttribute('aria-controls')).classList.toggle('is-open', open); }
    function closeAll() { toggles.forEach(b => set(b, false)); }
    toggles.forEach(button => {
      button.addEventListener('click', () => { const open = button.getAttribute('aria-expanded') !== 'true'; closeAll(); set(button, open); });
      const panel = root.querySelector('#' + button.getAttribute('aria-controls'));
      let leaveTimer;
      const desktopHover = () => matchMedia('(hover:hover) and (min-width:1201px)').matches;
      const cancelClose = () => clearTimeout(leaveTimer);
      const scheduleClose = () => { if (desktopHover()) { cancelClose(); leaveTimer = setTimeout(() => { if (!button.parentElement.matches(':hover') && !panel.matches(':hover')) set(button, false); }, 180); } };
      button.parentElement.addEventListener('mouseenter', () => { cancelClose(); if (desktopHover()) { closeAll(); set(button, true); } });
      button.parentElement.addEventListener('mouseleave', scheduleClose);
      panel.addEventListener('mouseenter', cancelClose);
      panel.addEventListener('mouseleave', scheduleClose);
      button.parentElement.addEventListener('focusout', e => { if (!button.parentElement.contains(e.relatedTarget)) set(button, false); });
    });
    mobile.addEventListener('click', () => { const open = menu.classList.toggle('is-open'); mobile.setAttribute('aria-expanded', String(open)); mobile.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); if (!open) closeAll(); });
    document.addEventListener('click', e => { if (!root.contains(e.target)) { closeAll(); menu.classList.remove('is-open'); mobile.setAttribute('aria-expanded', 'false'); } });
    root.addEventListener('keydown', e => { if (e.key === 'Escape') { const active = toggles.find(b => b.getAttribute('aria-expanded') === 'true'); closeAll(); if (active) active.focus(); else { menu.classList.remove('is-open'); mobile.setAttribute('aria-expanded', 'false'); mobile.focus(); } } });
  }
})();
