const fs=require('fs'),vm=require('vm'),path=require('path');
const source=fs.readFileSync('scripts/build/normalize-inline-colors.js','utf8').split("const files=['dist'")[0];
const ctx={require,Buffer};vm.createContext(ctx);vm.runInContext(source+';this.convert=css;this.token=token;this.extra=added;',ctx);
const rootPath='dist/css/root.css';let root=fs.readFileSync(rootPath,'utf8');
const files=require('../lib/pages').textFiles();
const mapping=new Map();
const pattern=/[\w:!\/-]+-\[[^\]\r\n"'<>]+\](?:\/[\d.]+)?|(?:[\w-]+:)*(?:bg|text|border|fill|stroke|from|via|to|ring|divide|outline|decoration|placeholder|shadow)-(?:white|black|transparent)\b/g;
function replacement(old){let next=old;if(old.includes('[')){next=old.replace(/\[([^\]]+)\]/,(_,v)=>'['+ctx.convert(v.replace(/(rgba?|hsla?)\(([^)]*)\)/g,(_,fn,args)=>ctx.token(fn+'('+args.replaceAll('_',' ')+')')))+']');}else{next=old.replace(/(white|black|transparent)$/,v=>'['+ctx.convert(v)+']');}if(next!==old)mapping.set(old,next);return next;}
const outputs=files.map(file=>{const before=fs.readFileSync(file,'utf8');return {file,before,after:before.replace(/<(?:section|div)\b[^>]*>/g,m=>/class=["'][^"']*bg-\[#/.test(m)&&!m.includes('pmex-color-background')?m.replace(/class=(["'])/,'class=$1pmex-color-background '):m).replace(pattern,replacement)};});
function escape(s){return [...s].map((c,i)=>/[a-zA-Z0-9_-]/.test(c)?(/^\d$/.test(c)&&i===0?'\\3'+c+' ':c):'\\'+c).join('');}
for(const [old,next] of [...mapping].sort((a,b)=>b[0].length-a[0].length)){root=root.split('.'+escape(old)).join('.'+escape(next));}
root=root.replace(/(\[class(?:\*|~|\^|\$)?=["'])([^"']+)(["']\])/g,(_,a,v,b)=>a+v.replace(/#([0-9a-fA-F]{3,8})/g,(_,h)=>'var(--c-'+(h.length===3?[...h].map(x=>x+x).join(''):h).toUpperCase()+')').replace(/(?<![\w-])3f9a4b/g,'3F9A4B')+b);
if(ctx.extra.size)root=root.replace('/* Color variables */','/* Color variables */\n:root{\n'+[...ctx.extra].map(([k,v])=>k+':'+v+';').join('\n')+'\n}\n');
const check=process.argv.includes('--check');const changed=outputs.filter(x=>x.before!==x.after);
if(!check){for(const x of changed)fs.writeFileSync(x.file,x.after);fs.writeFileSync(rootPath,root);}
console.log(JSON.stringify({check,changed:changed.length,classes:mapping.size,newTokens:ctx.extra.size}));if(check&&changed.length)process.exitCode=1;
