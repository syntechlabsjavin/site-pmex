/* One-time count-ups for existing metric values. No copy or target changes. */
(() => {
 const start=()=>{
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  if(reduce.matches||!('IntersectionObserver' in window))return;
  const running=new Map();
  const owned='.pmex-count,.pmex-counter,[data-target],[data-count],[data-countup],[data-counter],[data-outcome-counter],[data-animated]';
  const pattern=/^(\s*[+↑]?\s*)(\d[\d,]*(?:\.\d+)?)(\s*(?:%|\+|[kKmMbB]|[xX]|Days?|Hours?|hrs?|Years?|States?|Specialties)?\s*)$/;
  const observer=new IntersectionObserver(entries=>{
   for(const entry of entries){
    if(!entry.isIntersecting)continue;
    const el=entry.target;observer.unobserve(el);
    const original=el.textContent,match=original.match(pattern);
    if(!match)continue;
    const target=Number(match[2].replaceAll(',',''));
    const decimals=(match[2].split('.')[1]||'').length;
    const began=performance.now();
    const label=el.getAttribute('aria-label');
    el.setAttribute('aria-label',original.trim());
    const finish=()=>{el.textContent=original;label===null?el.removeAttribute('aria-label'):el.setAttribute('aria-label',label);running.delete(el);};
    const frame=now=>{
     if(reduce.matches||!el.isConnected){finish();return;}
     const t=Math.min(1,(now-began)/850),value=target*(1-Math.pow(1-t,3));
     if(t===1){finish();return;}
     const number=match[2].includes(',')?value.toLocaleString('en-US',{minimumFractionDigits:decimals,maximumFractionDigits:decimals}):value.toFixed(decimals);
     el.textContent=match[1]+number+match[3];
     running.set(el,{id:requestAnimationFrame(frame),finish});
    };
    running.set(el,{id:requestAnimationFrame(frame),finish});
   }
  },{threshold:.4});
  (document.querySelector('main')||document.body).querySelectorAll('h2,h3,p,div,span').forEach(el=>{
   if(el.children.length||el.closest(owned)||el.closest('header,footer,nav,form,button,a,[role="dialog"],[class*="price"],[id*="pricing"]'))return;
   const value=el.textContent.match(pattern);
   if(!value||Number(value[2].replaceAll(',',''))===0)return;
   const style=getComputedStyle(el);
   const designedAsMetric=/text-\[(?:2[2-9]|[3-9]\d)px\]/.test(el.className);
   if(parseFloat(style.fontSize)<22&&!designedAsMetric&&!el.closest('.stat-num,.metric-value,[data-reference-stat],[data-general-metric]'))return;
   el.dataset.metricCountup='';observer.observe(el);
  });
  reduce.addEventListener('change',()=>{
   if(!reduce.matches)return;
   observer.disconnect();
   for(const {id,finish} of [...running.values()]){cancelAnimationFrame(id);finish();}
  });
 };
 if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
})();