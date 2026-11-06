const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
// Parse element boundaries without reserializing any supplied text.
function elements(html) {
  const root={tag:'root',children:[],start:0,end:html.length}, stack=[root], all=[];
  const re=/<!--[\s\S]*?-->|<\/?([a-z][\w:-]*)\b[^>]*>/gi;
  const voids=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
  for(const m of html.matchAll(re)) {
    if(!m[1])continue;
    const tag=m[1].toLowerCase();
    if(m[0].startsWith('</')) {
      let i=stack.length-1;while(i>0&&stack[i].tag!==tag)i--;
      if(i>0){const n=stack[i];n.closeStart=m.index;n.end=m.index+m[0].length;stack.length=i;}
    } else {
      const parent=stack[stack.length-1],n={tag,start:m.index,openEnd:m.index+m[0].length,end:m.index+m[0].length,children:[],parent};
      parent.children.push(n);all.push(n);
      if(!voids.has(tag)&&!m[0].endsWith('/>'))stack.push(n);
    }
  }
  return {root,all};
}
function mark(html,attr) {return html.replace(/^<([\w-]+)/,'<$1 '+attr);}
function words(html) {return html.replace(/<!--[\s\S]*?-->|<script\b[\s\S]*?<\/script>/gi,'').replace(/<[^>]*>/g,' ').split(/\s+/).filter(Boolean).sort();}
function homepageMarquee() {
  const home=fs.readFileSync(path.join(__dirname,'../../dist/index.html'),'utf8');
  const tree=elements(home), node=tree.all.find(n=>home.slice(n.start,n.openEnd).includes('data-pmex-marquee>'));
  assert(node,'Homepage logo marquee missing');
  return mark(home.slice(node.parent.start,node.parent.end),'data-specialty-marquee');
}
function removeBreadcrumbs(content) {
  const nodes=elements(content).all.filter(n=>{
    const opening=content.slice(n.start,n.openEnd);
    return /class="bc"/.test(opening) && content.slice(n.start,n.end).includes('bc-i');
  });
  for(const n of nodes.sort((a,b)=>b.start-a.start))content=content.slice(0,n.start)+content.slice(n.end);
  return content;
}
function applyHomepageLayout(content) {
  content=removeBreadcrumbs(content);
  if(content.includes('data-specialty-hero'))return content;
  const tree=elements(content),hero=tree.all.find(n=>n.tag==='section');
  assert(hero,'Specialty hero missing');
  const original=content, h1=tree.all.find(n=>n.tag==='h1'&&n.start>hero.start&&n.end<hero.end);
  assert(h1,'Specialty heading missing');
  let heroHtml=content.slice(hero.start,hero.end),support='';
  let candidate=h1.parent;
  while(candidate&&candidate!==hero){
    if(candidate.children.length===2&&candidate.children.every(n=>n.tag==='div')&&candidate.children[0].start<=h1.start&&candidate.children[0].end>=h1.end)break;
    candidate=candidate.parent;
  }
  const edits=[];
  if(candidate&&candidate!==hero){
    const [copy,visual]=candidate.children;
    if(!content.includes('id="progcount"')) {
    support='<section class="specialty-hero-support"><div class="specialty-support-inner">'+content.slice(visual.start,visual.end)+'</div></section>';
    edits.push({start:visual.start,end:visual.end,value:''});
    }
    edits.push({start:copy.start,end:copy.openEnd,value:mark(content.slice(copy.start,copy.openEnd),'data-hero-copy')});
    edits.push({start:candidate.start,end:candidate.openEnd,value:mark(content.slice(candidate.start,candidate.openEnd),'data-hero-layout')});
  } else {
    const copy=h1.parent;
    if(copy!==hero)edits.push({start:copy.start,end:copy.openEnd,value:mark(content.slice(copy.start,copy.openEnd),'data-hero-copy')});
  }
  for(const e of edits.sort((a,b)=>b.start-a.start))heroHtml=heroHtml.slice(0,e.start-hero.start)+e.value+heroHtml.slice(e.end-hero.start);
  heroHtml=mark(heroHtml,'data-specialty-hero');
  // Move the original auxiliary hero cards below the marquee without dropping copy.
  let tail=content.slice(hero.end);
  const tailTree=elements(tail),first=tailTree.root.children[0];
  if(first&&first.tag==='div'&&tail.slice(first.start,first.end).includes('marquee-container')&&words(tail.slice(first.start,first.end)).length===0)tail=tail.slice(0,first.start)+tail.slice(first.end);
  const rearranged=heroHtml+'\n'+content.slice(0,hero.start)+'\n'+support+'\n'+tail;
  assert.deepEqual(words(rearranged),words(original),'Layout lost specialty wording');
  return heroHtml+'\n'+homepageMarquee()+'\n'+content.slice(0,hero.start)+'\n'+support+'\n'+tail;
}
module.exports={applyHomepageLayout,elements,words,removeBreadcrumbs};
