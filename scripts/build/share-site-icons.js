const fs=require('fs'),path=require('path');
const folder='dist/icons',sprite=folder+'/site-icons.svg',index=folder+'/catalog.json';
const files=require('../lib/pages').textFiles(['scripts/build']).filter(f=>path.basename(f)!=='share-site-icons.js');
const re=/<svg\b([^<>]*)>([\s\S]*?)<\/svg\s*>/g;
const key=b=>b.trim().replace(/\s+/g,' ').replace(/>\s+</g,'><').replace(/\s*\/>/g,'/>');
const records=fs.existsSync(index)?JSON.parse(fs.readFileSync(index,'utf8')):{};
const counts=new Map(),blocked=new Set();
for(const file of files){const s=fs.readFileSync(file,'utf8');for(const m of s.matchAll(re)){const b=key(m[2]);if(s.slice(Math.max(0,m.index-180),m.index).includes('fi-ch'))blocked.add(b);counts.set(b,(counts.get(b)||0)+1);}}
const named=new Map(Object.entries(records).map(([name,body])=>[key(body),name]));
const specialty=require('./specialty-hub-icons');
for(const [name,svg] of Object.entries(specialty.ICONS)){const m=svg.match(/<svg\b[^>]*>([\s\S]*?)<\/svg>/);if(m)named.set(key(m[1]),'specialty-'+name.replaceAll('/','-'));}
function eligible(a,b){return !/[\\$`]/.test(a+b)&&!/<(?:use|defs|title|desc|style|script|text|image|foreignObject|animate|svg)\b|\b(?:id|class|style|on\w+|data-[\w-]+)\s*=|url\(/i.test(b)&&/^(?:\s*<(?:path|circle|ellipse|rect|line|polyline|polygon|g)\b[^>]*\/?>(?:\s*<\/(?:path|circle|ellipse|rect|line|polyline|polygon|g)>)?\s*)+$/.test(b);}
let instances=0,changed=0;const check=process.argv.includes('--check');
for(const file of files){const before=fs.readFileSync(file,'utf8');const after=before.replace(re,(all,a,body,offset)=>{const b=key(body);if(!eligible(a,b))return all;let id=named.get(b);if(!id){const nearby=before.slice(Math.max(0,offset-1500),offset);const headings=[...nearby.matchAll(/<(?:h[1-6])\b[^>]*>([\s\S]*?)<\/h[1-6]>/g)];const label=headings.at(-1)?.[1].replace(/<[^>]*>/g,'').trim()||'icon';const base=path.basename(file,path.extname(file))+'-'+label.toLowerCase().replace(/[^a-z0-9]+/g,'-').split('-').filter(Boolean).slice(0,7).join('-');id=base;let variant=2;while(records[id])id=base+'-variant-'+variant++;named.set(b,id);}records[id]=body.trim();instances++;return '<svg'+a+'><use href="/icons/site-icons.svg#'+id+'"></use></svg>';});if(before!==after){changed++;if(!check)fs.writeFileSync(file,after);}}
if(!check){fs.mkdirSync(folder,{recursive:true});fs.writeFileSync(index,JSON.stringify(records,null,2)+'\n');fs.writeFileSync(sprite,'<svg xmlns="http://www.w3.org/2000/svg"><defs>\n'+Object.entries(records).map(([id,b])=>'<g id="'+id+'">'+b+'</g>').join('\n')+'\n</defs></svg>\n');}
const expected='<svg xmlns="http://www.w3.org/2000/svg"><defs>\n'+Object.entries(records).map(([id,b])=>'<g id="'+id+'">'+b+'</g>').join('\n')+'\n</defs></svg>\n';
const missing=[];for(const file of files)for(const m of fs.readFileSync(file,'utf8').matchAll(/site-icons\.svg#([\w-]+)/g))if(!records[m[1]])missing.push(file+': '+m[1]);
if(missing.length||!fs.existsSync(sprite)||fs.readFileSync(sprite,'utf8')!==expected){console.error({missing,staleSprite:true});process.exitCode=1;}
console.log(JSON.stringify({changed,instances,sharedIcons:Object.keys(records).length,check}));if(check&&changed)process.exitCode=1;
