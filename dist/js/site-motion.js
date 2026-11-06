(() => {
 const root=document.querySelector('main') || document.body;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const excluded='header,footer,nav,[role="dialog"],[role="tablist"],[data-specialty-hero],.hero-glow,[class*="marquee"],[id*="marquee"],[class*="dropdown"],[class*="modal"]';
 const accordion='details,[class*="accordion"],[class*="faq"],[id*="accordion"],[id*="faq"]';
 const firstSection=root.querySelector('section');
 const inExcluded=el=>el.closest(excluded) || el.closest(accordion) || (firstSection && firstSection.contains(el));
 const existing=el=>el.matches('.feature-card,.pmex-card,[class*="gradient-hover"],[class*="hover:-translate"]');
 const alreadyRevealed=el=>el.closest('[class*="reveal"]');
 const cards=[...root.querySelectorAll('a,article,div,li')].filter(el=>{
  if(inExcluded(el) || el.querySelector('button[aria-expanded],details') || el.closest('form') || el.querySelector('form')) return false;
  const names=String(el.className);
  const named=/(?:^|\s)[\w-]*(?:card|tile|stat|metric|benefit|feature)(?:-item|-box)?(?:\s|$)/.test(names);
  const style=getComputedStyle(el);
  const surface=parseFloat(style.borderRadius)>=6 && (parseFloat(style.borderTopWidth)>0 || style.boxShadow!=='none');
  const card=named || (/rounded/.test(names) && /border|shadow|bg-/.test(names)) || surface;
  return card && el.textContent.trim().length>0 && !/(?:^|\s)(?:grid|[\w-]*cards|[\w-]*grid)(?:\s|$)|flex-col.*lg:flex-row/.test(names) && !el.querySelector('section') && !existing(el);
 });
 const leafCards=cards.filter(el=>!cards.some(child=>child!==el && el.contains(child)));
 leafCards.forEach(el=>el.dataset.siteMotionCard='');
 root.querySelectorAll('button,a').forEach(el=>{
  if(inExcluded(el)||existing(el)||el.closest('[data-site-motion-card]')||el.hasAttribute('aria-expanded')||el.getAttribute('role')==='tab') return;
  if(/btn|button|rounded/.test(String(el.className))) el.dataset.siteMotionControl='';
 });
 // Keep the original homepage's established hover behavior.
 if(/^\/(?:index\.html)?$/.test(location.pathname)) {
  root.querySelectorAll('[data-site-motion-card]').forEach(el=>el.removeAttribute('data-site-motion-card'));
 }
 if(!('IntersectionObserver' in window)||!Element.prototype.animate) return;
 const active=new Set(),seen=new WeakSet();
 let observer;
 function setup(){
  observer?.disconnect();active.forEach(a=>a.cancel());active.clear();
  if(reduce.matches) return;
  observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(!entry.isIntersecting)return;
   const el=entry.target;observer.unobserve(el);seen.add(el);
   if(el.contains(document.activeElement)||getComputedStyle(el).opacity==='0')return;
   const isCard=leafCards.includes(el);
   const bounds=el.getBoundingClientRect();
   const direction=leafCards.indexOf(el)%2===0?-1:1;
   const room=direction<0?bounds.left:document.documentElement.clientWidth-bounds.right;
   const distance=Math.max(0,Math.min(innerWidth<640?4:8,room-2));
   const from=isCard?(direction*distance)+'px 0':'0 4px';
   const animation=el.animate([{opacity:.85,translate:from},{opacity:1,translate:'0 0'}],
    {duration:300,delay:0,easing:'cubic-bezier(.25,.1,.25,1)'});
   active.add(animation);
   animation.onfinish=animation.oncancel=()=>active.delete(animation);
  }),{threshold:.08});
  const targets=[...leafCards,...root.querySelectorAll('h2,h3')];
  targets.forEach(el=>{
   if(!seen.has(el)&&!inExcluded(el)&&!existing(el)&&!alreadyRevealed(el)&&!el.parentElement.closest('[data-site-motion-card]'))observer.observe(el);
  });
 }
 root.addEventListener('focusin',()=>active.forEach(a=>{if(a.effect?.target?.contains(document.activeElement))a.cancel();}));
 reduce.addEventListener('change',setup);
 setup();
})();
