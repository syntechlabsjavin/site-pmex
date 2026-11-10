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
  if (name === 'footer') initFooter();

  // "Let's Talk" letters keep fading in and out of a blur in a loop; the loop only runs while the title is on screen.
  function initFooter() {
    const footer = document.querySelector('.pmex-footer'), title = footer && footer.querySelector('.pf-talk-title');
    if (!title || !('IntersectionObserver' in window)) return;
    footer.classList.add('pf-anim');
    new IntersectionObserver(entries => entries.forEach(e => footer.classList.toggle('pf-in', e.isIntersecting)), { threshold: 0.2 }).observe(title);
  }

  // Header behaviour: dropdown panels, mobile menu, Escape and outside click.
  function initHeader() {
    const root = document.getElementById('homepage-reference-nav'), menu = root.querySelector('#homepage-menu'), mobile = root.querySelector('.homepage-menu-toggle');
    const toggles = [...root.querySelectorAll('.homepage-dropdown-toggle')];

    // Where the hamburger shows (up to 1100px) the PMEX Portal button and the phone number sit inside the menu,
    // below the links. On wider screens they stay in the header bar, next to the menu.
    const actions = root.querySelector('.homepage-nav-actions');
    if (actions) {
      const bar = actions.parentNode, afterActions = actions.nextSibling, narrow = matchMedia('(max-width:1100px)');
      const place = () => { if (narrow.matches) menu.appendChild(actions); else bar.insertBefore(actions, afterActions); };
      narrow.addEventListener('change', place);
      place();
    }
    // Current page: the matching top-level link, or the dropdown that holds it, is marked aria-current / .is-current.
    // A page listed in one of the small dropdowns (For You, Resources, About PMEX) marks that dropdown first, even when it
    // lives in /services/ (the For You pages do). Otherwise a specialty or service page marks its own dropdown by folder,
    // also when it is not listed there.
    (function markCurrent() {
      const here = location.pathname.replace(/\/index\.html$/, "/");
      if (here === "/") return;
      const toggleFor = el => { const panel = el.closest(".homepage-dropdown-panel"); return panel ? root.querySelector("[aria-controls=\"" + panel.id + "\"]") : null; };
      const bigPanels = ["homepage-specialties-panel", "homepage-services-panel"];
      let target = null;
      const listed = [...menu.querySelectorAll(".homepage-dropdown-panel a[href]")].find(a => a.pathname === here && bigPanels.indexOf(a.closest(".homepage-dropdown-panel").id) === -1);
      if (listed) target = toggleFor(listed);
      if (!target && here.indexOf("/specialties/") === 0) target = root.querySelector("[aria-controls=\"homepage-specialties-panel\"]");
      if (!target && here.indexOf("/services/") === 0) target = root.querySelector("[aria-controls=\"homepage-services-panel\"]");
      if (!target) {
        const link = [...menu.querySelectorAll("a[href]")].find(a => a.pathname === here);
        if (link) target = toggleFor(link) || link;
      }
      if (!target) return;
      target.classList.add("is-current");
      if (target.tagName === "A") target.setAttribute("aria-current", "page");
    })();
    function set(button, open) { button.setAttribute('aria-expanded', String(open)); root.querySelector('#' + button.getAttribute('aria-controls')).classList.toggle('is-open', open); }
    function closeAll() { toggles.forEach(b => set(b, false)); }
    toggles.forEach(button => {
      button.addEventListener('click', () => { const open = button.getAttribute('aria-expanded') !== 'true'; closeAll(); set(button, open); });
      const panel = root.querySelector('#' + button.getAttribute('aria-controls'));
      let leaveTimer;
      const desktopHover = () => matchMedia('(hover:hover) and (min-width:1101px)').matches;
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
