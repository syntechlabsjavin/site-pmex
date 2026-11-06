// Replace literal inline colors with exact-value tokens owned by root.css.
// Usage: node scripts/normalize-inline-colors.js [--check]
const fs=require('fs'),path=require('path');
const rootFile='dist/css/root.css';let root=fs.readFileSync(rootFile,'utf8');
const definitions=new Map([...root.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);/g)].filter(m=>m[1].startsWith('--c-')).map(m=>[m[1],m[2].trim()]));
function canonical(value){
 value=value.trim().toLowerCase();if(value==='white')value='#ffffff';if(value==='black')value='#000000';if(value==='transparent')return 'rgba:0,0,0,0';
 if(/^#[\da-f]{3,8}$/.test(value)){let h=value.slice(1);if(h.length===3||h.length===4)h=[...h].map(c=>c+c).join('');if(h.length!==6&&h.length!==8)throw Error(value);return 'rgba:'+([0,2,4].map(i=>parseInt(h.slice(i,i+2),16)).join(','))+','+(h.length===8?parseInt(h.slice(6),16)/255:1);}
 if(/^rgba?\(/.test(value)){const nums=value.slice(value.indexOf('(')+1,-1).trim().split(/[\s,\/]+/);const channels=nums.slice(0,3).map(x=>x.endsWith('%')?parseFloat(x)*255/100:Number(x));const a=nums[3]?(nums[3].endsWith('%')?parseFloat(nums[3])/100:Number(nums[3])):1;return 'rgba:'+channels.join(',')+','+a;}
 return value;
}
const tokens=new Map();for(const [name,value] of definitions)if(!value.startsWith('var('))tokens.set(canonical(value),name);
const added=new Map();let replacements=0;
function token(value){const key=canonical(value);let name=tokens.get(key);if(!name){name='--c-inline-'+Buffer.from(key).toString('hex');tokens.set(key,name);added.set(name,value);}replacements++;return 'var('+name+')';}
const literal=/#(?:[\da-f]{8}|[\da-f]{6}|[\da-f]{4}|[\da-f]{3})\b|\b(?:rgba?|hsla?)\([^)]*\)|\b(?:white|black|transparent)\b/gi;
function css(value){return value.replace(/url\([^)]*\)|var\(--[\w-]+\)|#[\da-f]{3,8}\b|\b(?:rgba?|hsla?)\([^)]*\)|\b(?:white|black|transparent)\b/gi,m=>/^(url|var)\(/i.test(m)?m:m.replace(literal,token));}
function transform(s){
 s=s.replace(/(\bstyle\s*=\s*)(["'])([\s\S]*?)\2/gi,(m,start,q,v)=>start+q+css(v)+q);
 s=s.replace(/(\b(?:fill|stroke|stop-color|flood-color|lighting-color|color|bgcolor)\s*=\s*)(["'])([^"']+)\2/gi,(m,start,q,v)=>{literal.lastIndex=0;return literal.test(v)&&!v.includes('var(')&&!v.includes('url(')?start+q+css(v)+q:m;});
 return s.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi,(m,a,b,c)=>a+css(b)+c);
}
const files=require('../lib/pages').textFiles().filter(f=>f.endsWith('.html'));
const changed=[];const check=process.argv.includes('--check');
for(const file of files){const before=fs.readFileSync(file,'utf8'),after=transform(before);if(before===after)continue;changed.push(file);if(!check)fs.writeFileSync(file,after);}
if(!check&&added.size){const marker='/* Color variables */';if(!root.includes(marker))throw Error('Missing root color section');root=root.replace(marker,marker+'\n/* Exact inline color tokens; existing values preserved. */\n:root{\n'+[...added].map(([k,v])=>'  '+k+':'+v+';').join('\n')+'\n}\n');fs.writeFileSync(rootFile,root);}
console.log(JSON.stringify({check,files:files.length,changed:changed.length,replacements,newTokens:added.size,paths:changed},null,2));if(check&&changed.length)process.exitCode=1;
