const fs=require('fs');
const {elements}=require('./specialty-homepage-layout');
const selected=process.argv.slice(2).filter(a=>!a.startsWith('--'));
let pages=0,buttons=0;
const {pageNames,pagePath}=require('../lib/pages');
for(const f of pageNames().filter(f=>!selected.length||selected.includes(f))){
 const path=pagePath(f),original=fs.readFileSync(path,'utf8');
 let html=original;const edits=[];
 for(const node of elements(original).all){
  if(!['a','button','input'].includes(node.tag))continue;
  const tag=original.slice(node.start,node.openEnd),body=original.slice(node.openEnd,node.closeStart||node.end);
  const cls=tag.match(/class="([^"]*)"/)?.[1]||'';
  let parent=node.parent,insideNavigation=false;
  while(parent&&parent.tag!=='root'){if((selected.length&&['header','footer'].includes(parent.tag))||parent.tag==='nav'||/homepage-dropdown-panel|nav-dropdown-panel/.test(original.slice(parent.start,parent.openEnd))){insideNavigation=true;break;}parent=parent.parent;}
  if(insideNavigation){
   if(tag.includes('data-site-button'))edits.push({start:node.start,end:node.openEnd,value:tag.replace(/\sdata-site-button(?:="[^"]*")?/g,'')});
   continue;
  }

  if(/aria-expanded|role="(?:tab|switch)"|type="(?:checkbox|radio|file)"/.test(tag)||/faq|accordion|toggle|close|carousel|pagination|filter|tab-btn|step-btn|menu|search-btn/i.test(cls))continue;
  const label=body.replace(/<[^>]+>/g,'').trim();
  if(node.tag==='input'&&!/type="(?:submit|reset|button)"/.test(tag))continue;
  if(node.tag==='button'&&!label)continue;
  const card=/card|all-svc/.test(cls)||/<(?:p|h[1-6]|article)\b/.test(body);
  const styled=/\bbtn(?:[-\s]|$)|\bbutton\b|hero-action|family-demo|family-assessment/.test(cls)||(/rounded/.test(cls)&&/(?:px-|py-|p-)/.test(cls))||/border-radius:/.test(tag)&&/padding:/.test(tag);
  const cta=/^(?:book|schedule|request|get a free|get free|contact us|talk to|start your|start free|browse all services)\b/i.test(label)&&label.length<85;
  if(node.tag==='a'&&(card||(!styled&&!cta)))continue;
  let section=node.parent;while(section&&section.tag!=='section')section=section.parent;
  const hero=section&&/<h1\b/.test(original.slice(section.start,section.end));
  const hasDemo=hero&&/href="(?:\/company\/)?demo\.html"|(?:Book|Schedule)[^<]{0,30}Demo/i.test(original.slice(section.start,section.end));
  const secondary=hero&&!/demo/i.test(label)&&node.tag!=='input'&&!/type="submit"/.test(tag)&&(/hero-action-link|family-assessment-link/.test(cls)||/href="tel:/.test(tag)||/browse|see how/i.test(label)||(hasDemo&&/assessment|audit/i.test(label)));
  if(secondary){
   let nextTag=tag.replace(/\sdata-site-button(?:="[^"]*")?/, '');
   nextTag=nextTag.replace(/^<(\w+)/,'<$1 data-site-button="link"');
   edits.push({start:node.start,end:node.openEnd,value:nextTag});continue;
  }
  if(hero&&!hasDemo&&/assessment|audit/i.test(label)&&tag.includes('data-site-button="link"')){edits.push({start:node.start,end:node.openEnd,value:tag.replace('data-site-button="link"','data-site-button')});continue;}
  if(tag.includes('data-site-button'))continue;
  edits.push({start:node.start,end:node.openEnd,value:tag.replace(/^<(\w+)/,'<$1 data-site-button')});buttons++;
 }
 for(const e of edits.sort((a,b)=>b.start-a.start))html=html.slice(0,e.start)+e.value+html.slice(e.end);
 html=html.replace(/<link\b[^>]*href="\.\/css\/site-buttons.css"[^>]*>\s*/g,'');
 html=html.replace(/<head\b[^>]*>/i,m=>m+'\n<link rel="stylesheet" href="/css/site-buttons.css"/>');
 if(html.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim()!==original.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim())throw Error('Content changed: '+f);
 if(html!==original){fs.writeFileSync(path,html);pages++;}
}
console.log({pages,buttons});
