const fs=require('fs'),path=require('path');
const {elements}=require('../build/specialty-homepage-layout');
const PHONE='(516) 208-4446';
const portalCopy='The PMEX Portal is a real-time reporting dashboard updated by the PMEX billing team. No integrations are required.';
function plain(s){return s.replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/\s+/g,' ').trim();}
function rewriteText(text) {
  return text
    .replace(/\u2014|&mdash;|&#(?:8212|x2014);|\u00e2\u20ac\u201d/gi,', ')
    .replace(/\bno\s+(?:long[- ]term\s+)?contracts\b[.!]?/gi,'')
    .replace(/\bCancel anytime\.?/gi,'')
    .replace(/(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]+\d{3}[\s.-]+\d{4}\b/g,PHONE)
    .replace(/\bUSA[-\s]based\s+(?:billing\s+|orthopedic\s+billing\s+)?team\b/gi,'company based in USA serving USA clients')
    .replace(/\b(?:and\s+)?(?:we\s+)?do not use offshore billing teams[.!]?/gi,'')
    .replace(/\boffshore(?:\s+teams?)?\b/gi,'PMEX staff')
    .replace(/\bSOC\s*2(?:\s*Type\s*(?:II|2))?(?:\s+certification|\s+certified|\s+controls)?/gi,'Active Encryption')
    .replace(/\bONC Certified\b/gi,'Active Encryption')
    .replace(/\bend[-\s]to[-\s]end encryption\b/gi,'data encrypted in transit and at rest')
    .replace(/HIPAA Compliant\s*[+·,]\s*Active Encryption/gi,'HIPAA Compliant + Active Encryption')
    .replace(/Active Encryption\s*[+·,]\s*Active Encryption/gi,'Active Encryption')
    .replace(/\bEHR Integration\b/gi,'Existing EHR Support')
    .replace(/\bPMEx EHR Integration\b/gi,'Existing EHR Support')
    .replace(/\bPMEx EHR\b/gi,'your existing EHR')
    .replace(/\bAI[-\s](?:driven|powered)\b/gi,'staff-led')
    .replace(/\bautomation company\b/gi,'medical billing company staffed by humans')
    .replace(/\bAI\s*&(?:amp;)?\s*ML\s+Infrastructure\b/gi,'Billing Team Support')
    .replace(/\bAI\s+Decisioning\s*&(?:amp;)?\s*Prediction\b/gi,'Billing Team Review')
    .replace(/\bAI\s*\+\s*Human[-\s]in[-\s]the[-\s]Loop\b/gi,'Experienced Billing Staff')
    .replace(/\bHuman[-\s]in[-\s]the[-\s]Loop\b/gi,'Billing Team Review')
    .replace(/\bAI wrappers on large\s+language models\b/gi,'General-purpose tools')
    .replace(/\bgeneralized AI abstractions\b/gi,'general-purpose billing templates')
    .replace(/\bAI\b/g,'PMEX staff')
    .replace(/\b(?:automatic|automated)\s+(payer\s+)?(denials?|rejections?)\b/gi,'$1$2')
    .replace(/\b(denied|denies|rejected|rejects)\s+automatically\b/gi,'$1')
    .replace(/\bautomatically\s+(denied|rejected)\b/gi,'$1')
    .replace(/\bAuto[-\s]?(Triage|Posting|Scrubbing)\b/gi,'Staff-led $1')
    .replace(/\bauto[-\s]claim scrubbing\b/gi,'Claim review by PMEX staff')
    .replace(/\bautomated the entire process\b/gi,'managed the entire process')
    .replace(/\bautomated\b/gi,'staff-led')
    .replace(/\bautomatically\b/gi,'with staff review')
    .replace(/\bautomatic\b/gi,'staff-led')
    .replace(/\bautomation\b/gi,'staff-led management')
    .replace(/\bwithout manual intervention\b/gi,'through dedicated staff follow-up')
    .replace(/\bno manual re-entry\b/gi,'with staff-managed data review')
    .replace(/\bbilling engine\b/gi,'billing team')
    .replace(/\bgets smarter with every claim\b/gi,'is reviewed by experienced billing staff')
    .replace(/\bthe system learns from both\b/gi,'the billing team reviews each outcome')
    .replace(/\bLearning &(?:amp;)? Model Improvement\b/gi,'Staff Training &amp; Quality Review')
    .replace(/\bSystem Adaptation Layer\b/gi,'Quality Review Team')
    .replace(/\bPMEx connects directly to\b/gi,'PMEX staff work within')
    .replace(/\bPMEx connects to\b/gi,'PMEX staff work within')
    .replace(/\bPMEX is fully HIPAA compliant with Active Encryption, data encrypted/gi,'PMEX is HIPAA Compliant, with Active Encryption and data encrypted')
    .replace(/PMEX with staff review /g,'PMEX staff ')
    .replace(/with staff review, with staff-managed data review/g,'through review by PMEX staff')
    .replace(/PMEX staff work within ([^.]+?) and manages/g,'PMEX staff work within $1 and manage')
    .replace(/Our company based in USA serving USA clients reads/gi,'Our billing staff review')
    .replace(/One company based in USA serving USA clients handles/gi,'PMEX staff handle')
    .replace(/We combine EHR, medical billing/gi,'We provide medical billing')
    .replace(/PMEx manages EHR, billing/gi,'PMEX staff work with your existing EHR and manage billing')
    .replace(/your existing EHR Documentation/gi,'Existing EHR Documentation')
    .replace(/generates and scrubs claims with staff review/gi,'PMEX staff prepare and review claims')
    .replace(/staff-led management and thoughtful approach/gi,'billing expertise and thoughtful approach')
    .replace(/Camber's dedicated billing experts handle exceptions that staff-led management cannot resolve on its own\./g,'PMEX billing staff review claims, resolve denials, and coordinate follow-up.')
    .replace(/no manual posting/gi,'posting by PMEX staff')
    .replace(/no manual export/gi,'staff-managed records review')
    .replace(/\s+,/g,',').replace(/,\s*,/g,',')
    .replace(/ {2,}/g,' ');
}
function colorValue(v,property='') {
  const allowed=new Set(['ffffff','3f9a4b','2e4a25','aad39c','f8fbf0','505050','e0e0da','666666','888888']);
  function map(r,g,b,a=''){
    let c;
    const l=.2126*r+.7152*g+.0722*b,sat=Math.max(r,g,b)-Math.min(r,g,b);
    if(/border|outline/.test(property))c='e0e0da';
    else if(r>247&&g>247&&b>247)c='ffffff';
    else if(l>210)c='f8fbf0';
    else if(l>155)c=sat<20?'e0e0da':'aad39c';
    else if(sat<22)c=l>110?'888888':'505050';
    else c=l<88?'2e4a25':'3f9a4b';
    return '#'+c+a;
  }
  return v.replace(/oklch\(\s*([\d.]+)(%)?[^)]*\)/gi,(all,l,pct)=>{const light=+l/(pct?100:1);return light>.92?'#F8FBF0':light>.75?'#AAD39C':light>.5?'#3F9A4B':'#2E4A25';}).replace(/#([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})(?![0-9a-f])/gi,(full,h)=>{
    if(h.length<=4)h=h.split('').map(c=>c+c).join('');
    const a=h.slice(6);h=h.slice(0,6).toLowerCase();
    if(allowed.has(h)&&!/border|outline/.test(property))return '#'+h+a;
    return map(parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16),a);
  }).replace(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:\s*[,/]\s*([\d.]+))?\s*\)/gi,(all,r,g,b,a)=>{
    const h=map(+r,+g,+b).slice(1);
    return a!==undefined?'rgba('+[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)).join(',')+','+a+')':'#'+h;
  });
}
function rewriteCSS(css){
  return css.replace(/\u2014/g,',').replace(/([\w-]+)\s*:\s*([^;{}]+)(?=[;}])/g,(m,p,v)=>p+':'+colorValue(v,p));
}
function compactHeading(text){
  const t=plain(text);
  const overrides=require('./content-heading-titles.json');
  if(overrides[t])return overrides[t];
  if(/^Chronic Care Management/.test(t))return 'Chronic Care Management';
  if(/^Transitional Care Management/.test(t))return 'Transitional Care Management';
  if(/^Annual Wellness Visit/.test(t))return 'Annual Wellness Visits';
  if(/^The\s+right solution changes outcomes/i.test(t))return 'Better Outcomes';
  if(t.length<=58)return t;
  const rules=[
    [/^(?:Top )?Denial Patterns in (.*?) Billing.*$/i,'$1 Denial Patterns'],
    [/^Full.Service (.*?) Revenue Cycle Management$/i,'$1 Revenue Cycle'],
    [/^What Happens to (.*?) Revenue Without.*$/i,'$1 Revenue Challenges'],
    [/^Why .*?Billing.*$/i,'Billing Challenges'],
    [/^From .*?(?:to Payment Posted|to Payment).*$/i,'From Visit to Payment'],
    [/^.*(?:CCM, TCM, and AWV|CCM \+ TCM \+ AWV).*$/i,'CCM, TCM, and AWV Billing'],
    [/^.*(?:PMEX Portal|billing operations).*$/i,'Real-Time Billing Visibility'],
    [/^.*(?:Case Stud|Recovered|Recovery|Denial Rates from|Transformed|Eliminated).*$/i,'Practice Results'],
    [/^.*(?:MIPS Score).*$/i,'MIPS Performance'],
    [/^.*(?:AT Modifier).*$/i,'AT Modifier Compliance'],
    [/^.*(?:Telehealth Modifier).*$/i,'Telehealth Billing Compliance'],
    [/^.*(?:SimplePractice).*$/i,'SimplePractice Billing Support'],
    [/^.*(?:Why|Reasons).*Choose.*$/i,'Why Practices Choose PMEX'],
    [/^.*(?:Pricing|monthly collections|2\.49%).*$/i,'Flexible Billing Pricing'],
    [/^.*(?:Services|billing services).*$/i,'Billing Services for Your Practice'],
    [/^.*(?:Credentialing).*$/i,'Provider Credentialing'],
    [/^.*(?:CPT Code Changes).*$/i,'CPT Coding Updates'],
    [/^.*(?:Fee Schedules).*$/i,'Payer Fee Schedule Updates'],
    [/^.*(?:Prior Authorization).*$/i,'Prior Authorization Support'],
    [/^.*(?:Revenue|revenue).*$/i,'Improve Your Revenue Cycle'],
    [/^.*(?:Billing|billing).*$/i,'Expert Billing Support'],
  ];
  for(const [re,out] of rules)if(re.test(t))return t.replace(re,out);
  const first=t.split(/[.!?:]/)[0].trim();
  if(first.length>=8&&first.length<=58)return first;
  return t; // Remaining headings use responsive fitting without hidden text.
}
const titles={
 index:'Healthcare Revenue Services',platform:'Staff-Led Revenue Services',
 'pmex-portal':'Your Billing Dashboard','medical-billing-services':'Medical Billing Services',
 'revenue-cycle-management':'Revenue Cycle Management','credentialing-enrollment':'Provider Credentialing',
 'outsource-medical-billing-services':'Outsource Medical Billing','physician-billing-services':'Physician Billing Services',
 'hospital-billing-services':'Hospital Billing Services','denial-management-services':'Denial Management','denial-management':'Denial Management',
 'account-receivable-management':'Accounts Receivable Management','dme-pos-services':'DME Billing Services',
 'front-desk-services-remote':'Remote Front Desk Services','small-practices':'Small Practice Billing',
 'large-practices':'Large Practice Billing','about':'About PMEX','contact':'Contact PMEX',
 'pricing':'Explore Billing Pricing','see-pricing':'Billing Plans','customers':'Our Customers',
 'customer-stories':'Customer Stories','testimonials':'Client Testimonials','resources':'Resources',
 'services':'Medical Billing Services','specialties':'Our Specialties','demo':'Book a Demo','login':'Log In',
 'revenue-audit':'Request a Revenue Audit','cpap-billing':'CPAP Billing Services'
};
const names={'anesthesiology':'Anesthesia','gynecology':'OB-GYN','addiction-substance-abuse':'Addiction Treatment','oral-maxillofacial-surgery':'Oral Surgery','laboratory-pathology':'Laboratory','maternal-fetal-medicine':'Maternal-Fetal Care','snf-long-term-care':'Skilled Nursing','otolaryngology-ent':'ENT','ambulance-ems-billing':'Ambulance','mental-health-billing':'Mental Health','dental-billing':'Dental','fqhc-billing':'FQHC','occupational-therapy':'Occupational Therapy'};
function normalizePage(html,filename) {
 const slug=path.basename(filename,'.html'),specialty=html.includes('data-source-specialty=')||(!titles[slug]&&html.includes('SPECIALTIES_DESKTOP'));
 // Explicit false-product sentences must be rewritten, not merely renamed.
 html=html.replace(/Or switch to PMEx EHR[^<]*\./gi,'Keep your existing EHR. PMEX staff manage billing and revenue cycle services.')
  .replace(/We also offer PMEx EHR[^<]*\./gi,'PMEX staff work with your existing EHR. The PMEX Portal provides reporting only, with updates by your billing team and no integrations required.')
  .replace(/PT-specific SOAP note templates, functional outcome tracking, and timed service capture at the point of care,[^<]*\./gi,'PMEX staff review documentation from your existing EHR, including timed services and functional outcomes, to support accurate physical therapy billing.')
  .replace(/Provider completes PT visit in PMEx EHR/gi,'Provider documents the PT visit in their existing EHR')
  .replace(/Its absence means automatic denial/gi,'Its absence can result in denial')
  .replace(/billing stays (current|compliant) automatically/gi,'billing stays $1 through review by PMEX staff')
  .replace(/SimplePractice processes ERA files automatically/gi,'SimplePractice processes ERA files')
  .replace(/SimplePractice does not automatically send secondary insurance claims/gi,'Secondary insurance claims in SimplePractice require manual follow-up')
  .replace(/with staff review so/g,'with staff review so');
 if(slug==='see-pricing'){
  html=html.replace(/(?:2\.99|3\.99|4\.99)(?:<span\b[^>]*>%<\/span>|%)/g,'Custom quote')
   .replace(/(<p\b[^>]*>)\/ month of collections(<\/p>)/g,'$1Monthly billing$2')
   .replace(/>2\.49(?=<span)/g,'>From 2.49')
   .replace(/>2\.49%/g,'>From 2.49%');
 }
 // Process text and reader-facing attributes; preserve JavaScript and SVG geometry.
 html=html.replace(/<script\b[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<!--[\s\S]*?-->|<[^>]*>|[^<]+/gi,token=>{
   if(/^<script/i.test(token))return token;
   if(/^<style/i.test(token))return token.replace(/(>)([\s\S]*)(<\/style>)/i,(m,a,css,z)=>a+rewriteCSS(css)+z);
   if(/^<!--/.test(token))return token.replace(/\u2014/g,',');
   if(token.startsWith('<'))return token
    .replace(/href="tel:[^"]*"/gi,'href="tel:5162084446"')
    .replace(/\b(content|alt|title|aria-label|placeholder)="([^"]*)"/gi,(m,k,v)=>k+'="'+rewriteText(v)+'"')
    .replace(/\bstyle="([^"]*)"/gi,(m,v)=>'style="'+rewriteCSS(v)+'"')
    .replace(/\b(fill|stroke|stop-color)="([^"]*)"/gi,(m,k,v)=>k+'="'+colorValue(v,k)+'"');
   return rewriteText(token);
 });
 const headingTitle=titles[slug]||((names[slug]||slug.replace(/-billing$/,'').split('-').map(w=>w[0].toUpperCase()+w.slice(1)).join(' '))+' Billing');
 let usedH1=false;
 html=html.replace(/<(h[1-4])\b([^>]*)>([\s\S]*?)<\/\1>/gi,(m,tag,attrs,body)=>{
  let next=body;
  if(tag.toLowerCase()==='h1'&&!usedH1){usedH1=true;
   const words=headingTitle.split(' '),last=words.pop();
   next=words.join(' ')+' <span class="pmex-heading-emphasis">'+last+'</span>';
  }else{const compact=compactHeading(body);if(compact!==plain(body))next=compact;}
  return '<'+tag+attrs+'>'+next+'</'+tag+'>';
 });
 // CTA wording rules apply to acquisition actions, not phone links, article links or form controls.
 html=html.replace(/<(a|button)\b([^>]*)>([\s\S]*?)<\/\1>/gi,(m,tag,attrs,body)=>{
  const label=plain(body);
  const isDemo=/\b(?:book|schedule|request|watch)\b.*\bdemo\b/i.test(label)||/^demo$/i.test(label);
  const isAudit=/\b(?:free|revenue|billing)\b.*\b(?:audit|assessment|consultation)\b|\b(?:audit|assessment|consultation)\b.*\bfree\b/i.test(label);
  if((specialty&&(isDemo||isAudit))||(!specialty&&isDemo)){
   const newLabel=specialty?(isDemo?'Schedule a Demo':'Request Free Audit'):'Book a Demo';
   if(!attrs.includes('data-policy-cta'))attrs+=' data-policy-cta';
   return '<'+tag+attrs+'>'+newLabel+'</'+tag+'>';
  }
  return m;
 });
 if(slug==='index'){
  const start=html.indexOf('<section'),end=html.indexOf('</section>',start)+10;
  if(start>=0&&end>start){
   let part=html.slice(start,end);
   part=part.replace(/(<div\b[^>]*class="flex flex-wrap items-center gap-4 sm:gap-6 text-sm"[^>]*>)[\s\S]*?(<\/div>)/,
    '$1<a href="https://portal.pmexinc.com/?_gl=1*15wbhuk*_ga*MTYyNTM1MjEwNy4xNzkzNjMwNzAw*_ga_3YSTQXMPQH*czE3OTM2MzA3MDAkbzEkZzAkdDE3OTM2MzA3MDAkajYwJGwwJGgwl" data-policy-cta>Book a Demo</a><a href="/company/contact.html" data-policy-cta>Book Free Consultation</a>$2');
   part=part.replace(/(<button\b[^>]*type="submit"[^>]*>)[\s\S]*?(<\/button>)/,
    '<button type="submit" data-policy-cta>Book Free Consultation</button>');
   part=part.replace(/Lorem ipsum[\s\S]*?facere dolorum\./,'PMEX is a company based in USA serving USA clients. Our billing staff manage claims, denials, payment posting, and revenue reporting so your team can focus on patient care.');
   html=html.slice(0,start)+part+html.slice(end);
  }
 }
 if(slug==='pmex-portal'){
  html=html.replace(/(<h1\b[\s\S]*?<\/h1>\s*)<p\b[^>]*>[\s\S]*?<\/p>/i,'$1<p>'+portalCopy+'</p>');
 }
 // Pricing counters must not display an unapproved starting price.
 html=html.replace(/(<(?:span|div)\b[^>]*(?:data-target|data-value)="2\.49"[^>]*>)[\s\S]*?(<\/(?:span|div)>)/g,'$12.49$2')
   .replace(/(<span\b[^>]*class="[^"]*pmex-price-number[^"]*"[^>]*>)[\s\S]*?(<\/span>)/g,'$12.49$2');
 if(!html.includes('data-content-design-system'))html=html.replace('</head>','<link rel="stylesheet" href="/css/content-design-system.css" data-content-design-system>\n<script src="/js/content-design-system.js" defer data-content-design-system></script>\n</head>');
 html=html.replace(/\s*<link[^>]*data-content-design-system[^>]*>\s*/g,'');
 html=html.replace(/<head\b[^>]*>/i,m=>m+'\n<link rel="stylesheet" href="/css/content-design-system.css" data-content-design-system>\n');
 return html;
}
module.exports={rewriteText,rewriteCSS,normalizePage,plain,titles};
