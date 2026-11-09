(() => {
 const root=document.querySelector('main')||document.body;
 root.querySelectorAll('p').forEach(p=>{
  const c=p.className;
  if(/uppercase|eyebrow|hero-lbl|hero-label/.test(c))p.dataset.referenceLabel='';
  else if(/text-\[(?:10|11|12|13)px\]|meta|caption|small/.test(c)) {
   p.dataset.referenceSmall='';
   if(/font-semibold|font-bold/.test(c)&&p.textContent.trim().length<85)p.dataset.referenceCardTitle='';
  }
 });
 root.querySelectorAll('h3').forEach(h=>{
  if(/^[+\d$%.,\s/-]+(?:Days|hrs|Hours|Years|M|K)?\+?$/i.test(h.textContent.trim()))h.dataset.referenceStat='';
 });
 const h1=root.querySelector('h1');
 if(h1){
  h1.dataset.referenceHeroTitle='';
  const hero=h1.closest('section')||h1.parentElement;
  const description=[...hero.querySelectorAll('p')].find(p=>(h1.compareDocumentPosition(p)&Node.DOCUMENT_POSITION_FOLLOWING)&&p.textContent.trim().length>85&&!p.closest('form'));
  if(description){description.removeAttribute('data-reference-small');description.removeAttribute('data-reference-card-title');description.dataset.referenceDescription='';}
 }
})();

// Extend the same card hierarchy to billing, services, resources and company pages.
(() => {
 if(document.querySelector('[data-source-specialty]'))return;
 const root=document.querySelector('main')||document.body;
 root.dataset.generalTypography='';
 const candidates=[...root.querySelectorAll('div,article,a')].filter(el=>{
  if(el.closest('header,footer,nav,form,[data-specialty-hero],[class*="hero"],[role="dialog"]')||el.querySelector('form,section'))return false;
  const c=el.className;
  return /(?:^|\s)[\w-]*(?:card|box)(?:\s|$)/.test(c)||(/rounded/.test(c)&&/border/.test(c)&&el.querySelector('p,h3,h4'));
 });
 candidates.filter(el=>!candidates.some(child=>child!==el&&el.contains(child))).forEach(el=>el.dataset.generalCard='');
 root.querySelectorAll('.mb-stat > p:first-child,.mb-big > p,.metric-value,.stat-num,[class*="stat-value"]').forEach(el=>{
  el.removeAttribute('data-reference-small');el.removeAttribute('data-reference-card-title');el.dataset.generalMetric='';
 });
})();
/* Classify content by its role, including inline-styled legacy pages. */
(() => {
 const root=document.querySelector('main')||document.body;
 const excluded='header,footer,nav,form,[role="dialog"],[class*="marquee"]';
 const h1=root.querySelector('h1');
 let hero;
 if(h1){
  h1.dataset.referenceHeroTitle='';
  hero=h1.closest('section')||h1.parentElement;
  hero.dataset.referenceHero='';
  const paragraphs=[...hero.querySelectorAll('p')].filter(p=>!p.closest('form')&&p.textContent.trim());
  paragraphs.filter(p=>h1.compareDocumentPosition(p)&Node.DOCUMENT_POSITION_PRECEDING).forEach(p=>p.dataset.referenceLabel='');
  // Class-based labels may use spans or divs instead of paragraphs.
  hero.querySelectorAll('.hero-lbl,.lbl,[class*="eyebrow"]').forEach(el=>el.dataset.referenceLabel='');
  const after=paragraphs.filter(p=>(h1.compareDocumentPosition(p)&Node.DOCUMENT_POSITION_FOLLOWING)&&!p.closest('.hero-actions,.hero-btns,.family-hero-actions,[class*="trust"],[class*="stat"],[class*="form"]'));
  after.filter(p=>p.parentElement===h1.parentElement || p.classList.contains('hero-sub') || p.matches('[class*="lead"]')).forEach(p=>{
   if(p.textContent.trim().length<40)return;
   p.removeAttribute('data-reference-small');p.removeAttribute('data-reference-card-title');p.dataset.referenceDescription='';
  });
 }
 root.querySelectorAll('p').forEach(p=>{
  if(p.closest(excluded))return;
  if(/uppercase|eyebrow|hero-lbl|hero-label/.test(p.className)||getComputedStyle(p).textTransform==='uppercase')p.dataset.referenceLabel='';
 });
 const candidates=[...root.querySelectorAll('div,article,a,li')].filter(el=>{
  // [data-typography-own]: a block that sets its own type scale (for example the home page platform panels) gets no card roles.
  if(el.closest(excluded+', [data-reference-hero],[data-problem-card],[data-typography-own]')||el.querySelector('form,section,[data-problem-card]'))return false;
  const c=String(el.className);
  if(/(?:^|\s)(?:grid|[\w-]*cards|[\w-]*grid)(?:\s|$)/.test(c))return false;
  const computed=getComputedStyle(el);
  return !!el.querySelector('p,h2,h3,h4')&&(/(?:^|\s)[\w-]*(?:card|box|tile)(?:\s|$)/.test(c)||(/rounded/.test(c)&&/border/.test(c))||(parseFloat(computed.borderRadius)>=8&&parseFloat(computed.borderTopWidth)>0));
 });
 candidates.filter(el=>!candidates.some(child=>child!==el&&el.contains(child))).forEach(el=>{
  el.dataset.consistentCard='';
  el.querySelectorAll('h2,h3,h4').forEach(t=>{
   if(!t.matches('[data-reference-stat],[data-general-metric]'))t.dataset.consistentCardTitle='';
  });
  el.querySelectorAll('p').forEach(p=>{
   if(p.matches('[data-reference-stat],[data-general-metric],[data-reference-label]')||/^[+\d$%.,\s/()-]+(?:Days|hrs|Hours|Years|M|K)?\+?$/i.test(p.textContent.trim()))return;
   if(p.hasAttribute('data-reference-card-title'))p.dataset.consistentCardTitle='';
   else if(p.hasAttribute('data-reference-small'))p.dataset.consistentCardMeta='';
   else p.dataset.consistentCardBody='';
  });
 });
})();
