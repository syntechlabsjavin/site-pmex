// Resource filters and the stacked scroll.
//
// Filters: the tabs All / Insights / Customer Stories / Guides / Tools filter the cards (also from ?filter=insight in the
// shared navigation links). The page starts on All.
//
// Stacked scroll (wide and tall screens only): the tabs and the cards stay pinned while the visitor scrolls. Each tab has its
// own panel of cards; scrolling brings the next panel up over the previous one, the tab highlight follows, and the page does
// not move on until the last tab (Tools) has been reached. "All" shows every card in the normal grid and un-pins the section.
// On small screens, very short screens and with prefers-reduced-motion the section is the plain filtered grid.
(() => {
 const buttons = [...document.querySelectorAll('[data-resource-filter]')];
 const cards = [...document.querySelectorAll('.res-card')];
 const grid = document.getElementById('card-grid');
 const stack = document.getElementById('res-stack');
 const stage = document.getElementById('res-stage');
 const more = document.getElementById('res-more'); // "View All Insights" link: shown under the Insights cards only
 const tabs = buttons.length ? buttons[0].parentElement : null;
 if (!grid) return;

 const aliases = { insights: 'insight', guides: 'guide', tools: 'tool', 'customer stories': 'customer-story' };
 const order = ['insight', 'customer-story', 'guide', 'tool']; // the tabs that step through the stack
 const normalize = value => {
  const raw = (value || '').toLowerCase();
  const name = aliases[raw] || raw;
  return name === 'all' || order.includes(name) ? name : '';
 };
 const setPressed = filter => buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.resourceFilter === filter)));
 const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

 // ---- plain grid ----
 function toGrid() { cards.forEach(card => grid.appendChild(card)); if (more) grid.appendChild(more); } // cards is in document order, the link stays last
 function showPlain(filter) {
  toGrid();
  cards.forEach(card => { card.style.display = filter === 'all' || card.dataset.filter === filter ? 'flex' : 'none'; });
  if (more) more.hidden = filter !== 'insight';
  setPressed(filter);
 }

 // ---- stacked scroll ----
 let on = false, panels = [], current = -1, ticking = false, stepPx = 0, topPx = 0, explicitPlain = false;

 function measure() { // height of the tallest panel = grid height with only that category showing
  toGrid();
  let tallest = 0;
  order.forEach(name => {
   cards.forEach(card => { card.style.display = card.dataset.filter === name ? 'flex' : 'none'; });
   if (more) more.hidden = name !== 'insight';
   tallest = Math.max(tallest, grid.offsetHeight);
  });
  return tallest;
 }
 function fits() {
  if (!stack || !stage || !tabs) return null;
  if (!matchMedia('(min-width: 1001px)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  const header = document.getElementById('homepage-reference-nav');
  const top = (header ? header.offsetHeight : 68) + 12;
  const tabsH = tabs.offsetHeight + 32;
  const need = measure() + 24;
  // On a short screen the cards of a panel are scaled down to fit (CSS zoom); below 70% the plain grid is used instead.
  const fit = Math.min(1, (innerHeight - top - tabsH - 12) / need);
  return fit >= 0.7 ? { top, tabsH, panelsH: Math.ceil(need * fit), fit } : null;
 }
 function enter(size) {
  topPx = size.top;
  stepPx = Math.max(420, Math.round(innerHeight * 0.62));
  const stickyH = size.tabsH + size.panelsH;
  stack.style.setProperty('--res-top', size.top + 'px');
  stack.style.setProperty('--res-fit', size.fit.toFixed(3));
  stack.style.setProperty('--res-stage-h', size.panelsH + 'px');
  stack.style.setProperty('--res-stack-h', (stickyH + stepPx * (order.length - 1)) + 'px');
  stage.textContent = '';
  panels = order.map(name => {
   const panel = document.createElement('div');
   panel.className = 'res-stack__panel ' + grid.className;
   panel.dataset.panel = name;
   cards.filter(card => card.dataset.filter === name).forEach(card => { card.style.display = 'flex'; panel.appendChild(card); });
   if (more && name === 'insight') { more.hidden = false; panel.appendChild(more); }
   stage.appendChild(panel);
   return panel;
  });
  stack.classList.add('res-stack--on');
  on = true; current = -1;
  update();
 }
 function leave() {
  if (!on) return;
  on = false; current = -1;
  stack.classList.remove('res-stack--on');
  stack.style.removeProperty('--res-p');
  stack.style.removeProperty('--res-fit');
  stage.textContent = '';
  panels = [];
  toGrid();
 }
 function stackTop() { return scrollY + stack.getBoundingClientRect().top; }
 function targetFor(index) { return stackTop() - topPx + index * stepPx + 1; }
 function update() {
  ticking = false;
  if (!on) return;
  const p = clamp((topPx - stack.getBoundingClientRect().top) / stepPx, 0, order.length - 1);
  stack.style.setProperty('--res-p', p.toFixed(3));
  const active = Math.round(p);
  if (active !== current) {
   current = active;
   setPressed(order[active]);
   panels.forEach((panel, i) => { panel.inert = i !== active; });
  }
 }
 const onScroll = () => { if (on && !ticking) { ticking = true; requestAnimationFrame(update); } };

 // measure again (screen or fonts changed); scroll to the same tab only if the visitor is inside the stack
 function rebuild() {
  const keep = order[current] || 'insight';
  const r = stack.getBoundingClientRect();
  const inside = r.top <= topPx + 1 && r.bottom > innerHeight * 0.4;
  leave();
  if (fits()) choose(keep, false, inside); else showPlain('all');
 }
 function choose(filter, fromClick, scroll = true) {
  if (filter === 'all') {
   explicitPlain = true;
   const wasOn = on;
   leave();
   showPlain('all');
   if (wasOn && stack) scrollTo({ top: Math.max(0, scrollY + stack.getBoundingClientRect().top - topPx), behavior: 'auto' });
   return;
  }
  if (!on) {
   const size = fits();
   if (!size) { showPlain(filter); return; }
   enter(size);
   if (scroll) scrollTo({ top: targetFor(order.indexOf(filter)), behavior: 'auto' });
   update();
   return;
  }
  scrollTo({ top: targetFor(order.indexOf(filter)), behavior: fromClick ? 'smooth' : 'auto' });
 }

 buttons.forEach(button => button.addEventListener('click', () => choose(button.dataset.resourceFilter, true)));
 addEventListener('scroll', onScroll, { passive: true });
 let resizeTimer;
 addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
   if (on) rebuild();
   else if (!explicitPlain && fits()) choose('insight', false);
   else if (!explicitPlain) showPlain('all');
  }, 200);
 });

 // ---- start ----
 // Runs once the page has loaded: while it is still loading the cards are not at their final height yet.
 function start() {
  const requested = normalize(new URLSearchParams(location.search).get('filter'));
  // a plain visit starts on All; a category tab (or ?filter=insight in a link) starts the stack
  if (!requested || requested === 'all') { explicitPlain = true; showPlain('all'); return; }
  if (fits()) {
   choose(requested, false, true);
   requestAnimationFrame(() => { if (on) scrollTo({ top: targetFor(order.indexOf(requested)), behavior: 'auto' }); }); // layout may settle after the first jump
  } else { explicitPlain = true; showPlain(requested); }
 }
 if (document.readyState === 'complete') start(); else addEventListener('load', start, { once: true });
 // fonts can change the card height after load: measure again and keep the same tab
 if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => {
  if (on) rebuild();
 });
})();
