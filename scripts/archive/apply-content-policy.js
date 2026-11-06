const fs=require('fs'),path=require('path'),os=require('os');
const {normalizePage,rewriteText,rewriteCSS,plain}=require('./content-policy');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
function audit(){
 const issues=[];
 for(const file of walk('dist').filter(f=>f.endsWith('.html'))){
  const html=fs.readFileSync(file,'utf8');
  const text=plain(html.replace(/<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi,''));
  const prohibited=/\u2014|&mdash;|&#8212;|\bno contracts\b|\bPMEx EHR\b|\bUSA[- ]based team\b|\bAI[- ](?:driven|powered)\b|\bautomat\w*|\bSOC\s*2\b|\boffshore\b|\bend[- ]to[- ]end encryption\b/gi;
  for(const m of text.matchAll(prohibited))issues.push({file,match:m[0],context:text.slice(Math.max(0,m.index-65),m.index+125)});
  for(const m of html.matchAll(/href="tel:([^"]*)"/g))if(m[1]!=='5162084446')issues.push({file,phone:m[1]});
 }
 return issues;
}
function applyAll({check=false}={}){
 if(check){const issues=audit();console.log(JSON.stringify({issues},null,2));if(issues.length)process.exitCode=1;return;}
 const backup=fs.mkdtempSync(path.join(os.tmpdir(),'pmex-content-policy-'));
 let changed=0;
 function save(file,next){const old=fs.readFileSync(file,'utf8');if(next===old)return;const dest=path.join(backup,file);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,old);fs.writeFileSync(file,next);changed++;}
 for(const file of walk('dist').filter(f=>f.endsWith('.html')))save(file,normalizePage(fs.readFileSync(file,'utf8'),file));
 for(const file of [...walk('dist').filter(f=>f.endsWith('.css')&&!f.endsWith('content-design-system.css')),'src/input.css'])save(file,rewriteCSS(fs.readFileSync(file,'utf8')));
 for(const file of walk('dist/js').filter(f=>f.endsWith('.js')&&!f.endsWith('content-design-system.js'))){
  let js=fs.readFileSync(file,'utf8');
  js=js.replace(/(["'\x60])(?:\\[\s\S]|(?!\1)[^\\])*\1/g,token=>{
   const body=token.slice(1,-1);
   if(!/\bautomat\w*|\bAI\b|\bSOC\s*2\b|PMEx EHR|\u2014|\bauto[- ](?:triage|posting|scrubbing)\b/i.test(body))return token;
   return token[0]+rewriteText(body)+token.at(-1);
  });
  if(file.endsWith('affordable-pricing.js'))js=js.replace(/target \* eased/g,'target');
  if(file.endsWith('cta-bar.js'))js=js.replace(/target \* eased/g,'target === 2.49 ? target : target * eased');
  save(file,js);
 }
 const template='scripts/templates/site-navbar.html';
 if(fs.existsSync(template)){const index=fs.readFileSync('dist/index.html','utf8');save(template,index.match(/<header\b[\s\S]*?<\/header>/)[0]);}
 const issues=audit();
 fs.mkdirSync('reports',{recursive:true});
 fs.writeFileSync('reports/content-policy-audit.json',JSON.stringify({pages:walk('dist').filter(f=>f.endsWith('.html')).length,changed,backup,issues},null,2));
 console.log(JSON.stringify({changed,backup,issues},null,2));
}
if(require.main===module)applyAll({check:process.argv.includes('--check')});
module.exports={applyAll,audit};
