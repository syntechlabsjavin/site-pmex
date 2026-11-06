document.querySelectorAll('.imported-services .faq-trigger').forEach(trigger=>{
 trigger.setAttribute('aria-expanded','false');
 trigger.addEventListener('click',()=>{
  const item=trigger.closest('.faq-item');if(!item)return;
  const open=!item.classList.contains('open');
  document.querySelectorAll('.imported-services .faq-item.open').forEach(other=>{
   other.classList.remove('open');other.querySelector('.faq-trigger')?.setAttribute('aria-expanded','false');
  });
  item.classList.toggle('open',open);trigger.setAttribute('aria-expanded',String(open));
 });
});