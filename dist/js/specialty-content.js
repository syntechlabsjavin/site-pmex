// Specialty interactions; imported reference scripts are intentionally not executed.
(() => {
  const main = document.querySelector('.specialty-content');
  if (!main) return;
  main.querySelectorAll('[data-specialty-value]').forEach(el => { el.textContent = el.dataset.specialtyValue; });
  main.querySelectorAll('[data-specialty-width]').forEach(el => { el.style.width = el.dataset.specialtyWidth + '%'; });
  main.dataset.specialtyReady = 'true';
  const sync = () => main.querySelectorAll('[data-specialty-faq]').forEach(q => q.setAttribute('aria-expanded', String(q.closest('.fi').classList.contains('open'))));
  sync();
  function toggle(q) {
    const item = q.closest('.fi');
    const wasOpen = item.classList.contains('open');
    main.querySelectorAll('.fi.open').forEach(el => el.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
    sync();
  }
  main.addEventListener('click', e => {
    const q = e.target.closest('[data-specialty-faq]');
    if (q) toggle(q);
    const trigger = e.target.closest('.faq-trigger');
    if (trigger) {
      const item = trigger.closest('.faq-item');
      const panel = item?.querySelector('.faq-content');
      if (panel) {
        const open = panel.classList.contains('u-hidden');
        panel.classList.toggle('u-hidden', !open);
        trigger.setAttribute('aria-expanded', String(open));
        const icon = item.querySelector('.faq-icon');
        if (icon) icon.style.transform = open ? 'rotate(180deg)' : '';
      }
    }
  });
  main.addEventListener('keydown', e => {
    const q = e.target.closest('[data-specialty-faq]');
    if (q && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(q); }
  });
  main.querySelectorAll('.bc-i a[href="#"]').forEach(a => {
    if (a.textContent.trim() === 'Home') a.href = '/index.html';
    if (a.textContent.trim() === 'Specialties') a.href = '/specialties/';
  });
})();
