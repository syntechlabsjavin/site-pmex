// Applies the approved Behavioral Health presentation only to the six For You pages.
// Existing text, controls, anchors and inline form handlers are preserved.
const fs=require('fs'),assert=require('assert/strict');
const {elements}=require('./specialty-homepage-layout');
const pages=['outsource-medical-billing-services','small-practices','large-practices','denial-management','physician-billing-services','hospital-billing-services'];
const iconPaths={
 check:'<path d="m5 12 4 4L19 6"/><path d="M21 12a9 9 0 1 1-5-8"/>',
 shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z"/><path d="m8 12 3 3 5-6"/>',
 chart:'<path d="M4 3v17h17M8 15v-4m5 4V7m5 8V4"/>',
 person:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-3a8 8 0 0 1 16 0v3"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
 claim:'<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7"/>',
 building:'<path d="M5 21V3h14v18M2 21h20M9 7h1m4 0h1M9 11h1m4 0h1M10 21v-6h4v6"/>',
 code:'<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-14-2 16"/>',
 wallet:'<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M3 8V5l13-3v3m5 6h-6v5h6m-4-2h1"/>'
};
function svg(kind){return '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+iconPaths[kind]+'</svg>';}
function kind(text){if(/HIPAA|Compliance|Encryption|Credential|Auth/i.test(text))return 'shield';if(/Coding|Code|CPT/i.test(text))return 'code';if(/Portal|Report|Metric|Analysis|Trend|Revenue|Collection/i.test(text))return 'chart';if(/Patient|Manager|Communication|Registration/i.test(text))return 'person';if(/Hospital|Facility|Facilities|System/i.test(text))return 'building';if(/Payment|Cash|Cost|Saving|Posting/i.test(text))return 'wallet';if(/AR |A\/R|Follow|Days|Time|Deadline/i.test(text))return 'clock';return 'claim';}
const cardNames=new Set(['os-card','os-handle','os-tc','os-tech-card','sp-card','sp-point','sp-ease','lp-card','lp-goal','lp-row','lp-audit','lp-proc','dm-mini','dm-pillar','dm-box','pb-card','pb-note','hb-card']);
const metricNames=new Set(['lp-stat','pb-stat','hb-stat','sp-stat','dm-stat','lp-kpi']);
function text(s){return s.replace(/<!--[\s\S]*?-->|<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<svg\b[\s\S]*?<\/svg>/gi,'').replace(/<[^>]+>/g,' ').replace(/&#(?:x[0-9a-f]+|\d+);/gi,m=>String.fromCodePoint(parseInt(m.slice(2,-1).replace(/^x/i,''),/^&#x/i.test(m)?16:10))).replace(/[\u2713\u{1f5d0}]/gu,'').replace(/\s+/g,' ').trim();}
for(const name of pages){
 const file='dist/'+name+'.html';let html=fs.readFileSync(file,'utf8');if(html.includes('data-bh-page')){console.log('Already styled '+name);continue;}
 const original=html;
 // Move the existing hero forms to a horizontal support card below the top marquee.
 let tree=elements(html),hero=tree.all.find(n=>n.tag==='section'),form=tree.all.find(n=>n.start>hero.start&&n.end<hero.end&&/class="(?:os|dm)-form"/.test(html.slice(n.start,n.openEnd)));
 if(form){const block=html.slice(form.start,form.end);html=html.slice(0,form.start)+html.slice(form.end);tree=elements(html);hero=tree.all.find(n=>n.tag==='section');const marquee=hero.parent.children.find(n=>n.start>hero.end&&html.slice(n.start,n.end).includes('data-pmex-marquee'));const at=marquee?marquee.end:hero.end;html=html.slice(0,at)+'\n<section class="bh-form-section"><div>'+block+'</div></section>\n'+html.slice(at);}
 tree=elements(html);const main=tree.all.find(n=>n.tag==='main');const inside=tree.all.filter(n=>n.start>=main.start&&n.end<=main.end);const edits=[];
 const classes=n=>(html.slice(n.start,n.openEnd).match(/class="([^"]*)"/)?.[1]||'').split(/\s+/);
 const has=(n,set)=>classes(n).some(c=>set.has(c));
 const cards=inside.filter(n=>has(n,cardNames)||n.tag==='li'&&classes(n.parent).includes('dm-benefits'));
 const metrics=inside.filter(n=>has(n,metricNames));
 const steps=inside.filter(n=>classes(n).some(c=>['sp-step','dm-step'].includes(c))||n.tag==='li'&&classes(n.parent).includes('hb-steps'));
 const attr=new Map();function mark(n,a){attr.set(n,(attr.get(n)||'')+' '+a);}
 mark(main,'data-bh-page');hero=inside.find(n=>n.tag==='section');mark(hero,'class="hero-bg-gradient" data-reference-hero data-bh-hero');
 const h1=inside.find(n=>n.tag==='h1');mark(h1,'data-reference-hero-title');
 const copy=h1.parent;mark(copy,'data-bh-hero-copy');
 for(const p of copy.children.filter(n=>n.tag==='p'))mark(p,p.start<h1.start?'data-reference-label':'data-reference-description');
 let sectionIndex=0;
 for(const n of inside){const cls=classes(n),opening=html.slice(n.start,n.openEnd);
  if(n.tag==='section'&&n!==hero){mark(n,'data-bh-section="'+(sectionIndex++%3===1?'tint':'white')+'"');if(/id="(?:os|lp|dm|pb|hb)-cta"|id="sp-(?:trans|partner)"/.test(opening))mark(n,'data-bh-cta');}
  if(cls.some(c=>/^(os|sp|lp|dm|pb|hb)-head$/.test(c)))mark(n,'data-bh-heading');
  if(cls.some(c=>/^(os|sp|lp|dm|pb|hb)-split$/.test(c)||c==='sp-partner-grid'))mark(n,'data-bh-split');
  if(cls.some(c=>/^(os|sp|lp|dm|pb|hb)-actions$/.test(c)))mark(n,'data-bh-actions');
  if(n.children.length>1&&n.children.every(c=>cards.includes(c)||metrics.includes(c)||steps.includes(c))){let columns=3;if(n.children.every(c=>metrics.includes(c)))columns=2;else if(n.children.every(c=>steps.includes(c)))columns=2;else if(cls.some(c=>/grid-4/.test(c)))columns=4;else if(['os-cards'].some(c=>cls.includes(c)))columns=4;mark(n,'data-bh-grid="'+columns+'"');}
  if(n.tag==='a'&&cls.some(c=>/^(os|sp|lp|dm|pb|hb)-btn$/.test(c))||n.tag==='button'&&/type="submit"/.test(opening)){const secondary=cls.some(c=>/-btn-link$/.test(c));mark(n,'data-site-button'+(secondary?'="link"':''));}
 }
 for(const n of cards){mark(n,'data-bh-card data-consistent-card');const title=inside.find(c=>c.start>n.start&&c.end<n.end&&c.tag==='h3');if(title)mark(title,'data-consistent-card-title');for(const p of inside.filter(c=>c.start>n.start&&c.end<n.end&&c.tag==='p'&&!classes(c).some(k=>/eyebrow|audit-p/.test(k))))mark(p,'data-consistent-card-body');
  const holder=n.children.find(c=>classes(c).some(k=>/-(?:ico|bi)$/.test(k)));const titleText=title?text(html.slice(title.start,title.end)):text(html.slice(n.start,n.end));
  if(holder){edits.push({start:holder.openEnd,end:holder.closeStart,value:svg(kind(titleText))});mark(holder,'data-bh-icon');}
  else if(!n.children.some(c=>c.tag==='img')&&!n.children.some(c=>c.tag==='b')&&!classes(n).includes('dm-box'))edits.push({start:n.openEnd,end:n.openEnd,value:'<span data-bh-icon>'+svg(kind(titleText))+'</span>'});
 }
 for(const n of steps){mark(n,'data-bh-step');const title=inside.find(c=>c.start>n.start&&c.end<n.end&&c.tag==='h3');if(title)mark(title,'data-consistent-card-title');for(const p of inside.filter(c=>c.start>n.start&&c.end<n.end&&c.tag==='p'))mark(p,'data-consistent-card-body');}
 for(const n of metrics){mark(n,'data-bh-metric');const paragraphs=n.children.filter(c=>c.tag==='p');const value=paragraphs.find(c=>/big|kpi-v/.test(classes(c).join(' ')))||paragraphs[0];if(value)mark(value,'data-bh-value data-reference-stat');edits.push({start:n.openEnd,end:n.openEnd,value:'<span data-bh-icon>'+svg(kind(text(html.slice(n.start,n.end)) ))+'</span>'});}
 for(const [n,a] of attr){const opening=html.slice(n.start,n.openEnd);edits.push({start:n.start,end:n.openEnd,value:opening.replace(/^<([\w-]+)/,'<$1'+a)});}
 for(const e of edits.sort((a,b)=>b.start-a.start||b.end-a.end))html=html.slice(0,e.start)+e.value+html.slice(e.end);
 html=html.replace('</head>','<link rel="stylesheet" href="./css/for-you-reference.css">\n</head>');
 // The second marquee is the canonical shell template, not a manually edited copy.
 html=html.replace(/<footer\b/,'\n'+fs.readFileSync('scripts/templates/site-marquee.html','utf8')+'\n<footer');
 // Replace the one legacy emoji icon with a useful monochrome document icon.
 html=html.replace('<span>&#128464;</span>','<span aria-hidden="true">'+svg('claim')+'</span>');
 assert.equal(text(html),text(original),'Page wording changed: '+name);
 fs.writeFileSync(file,html);console.log('Restyled '+name);
}
