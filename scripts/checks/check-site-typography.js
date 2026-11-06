const fs=require('fs'),path=require('path'),http=require('http'),os=require('os');
const {spawn}=require('child_process');
(async()=>{
const base=path.resolve('dist');
const server=http.createServer((req,res)=>{let f=path.join(base,decodeURIComponent(req.url.split('?')[0]));try{res.setHeader('Content-Type',f.endsWith('.css')?'text/css':f.endsWith('.js')?'text/javascript':f.endsWith('.svg')?'image/svg+xml':f.endsWith('.png')?'image/png':/\.jpe?g$/.test(f)?'image/jpeg':f.endsWith('.html')?'text/html':'application/octet-stream');res.end(fs.readFileSync(f));}catch{res.statusCode=404;res.end();}});
await new Promise(r=>server.listen(8037,'127.0.0.1',r));
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-port=9237','--user-data-dir='+fs.mkdtempSync(path.join(os.tmpdir(),'pmex-policy-browser-')),'about:blank'],{windowsHide:true,stdio:'ignore'});
let ws;
try{
let tabs;for(let i=0;i<50;i++){try{tabs=await(await fetch('http://127.0.0.1:9237/json')).json();break;}catch{await new Promise(r=>setTimeout(r,200));}}
ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map();const errors=[];
ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){pending.get(m.id)?.(m);pending.delete(m.id);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text+': '+(m.params.exceptionDetails.exception?.description||''));});
const call=(method,params={})=>new Promise((resolve,reject)=>{const key=++id;pending.set(key,m=>m.error?reject(m.error):resolve(m.result));ws.send(JSON.stringify({id:key,method,params}));});
await call('Page.enable');await call('Runtime.enable');await call('Network.enable');await call('Network.setBlockedURLs',{urls:['*fonts.googleapis.com*','*fonts.gstatic.com*']});
const selected=process.argv.slice(2).filter(a=>!a.startsWith('--'));
const files=require('../lib/pages').pageRels().filter(f=>!selected.length||selected.includes(f)||selected.includes(require('path').basename(f)));
const issues=[],screenshots=[],coverage=[];let n=0;
for(const width of [1440,768,320]){
await call('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<500});
for(const file of files){
errors.length=0;
await call('Page.navigate',{url:'http://127.0.0.1:8037/'+file});
for(let retry=0;retry<60;retry++){
 const ready=await call('Runtime.evaluate',{expression:"document.readyState==='complete'&&location.pathname==="+JSON.stringify('/'+file),returnByValue:true});
 if(ready.result.value)break;
 await new Promise(r=>setTimeout(r,50));
}
await new Promise(r=>setTimeout(r,150));
const audit=await call('Runtime.evaluate',{expression:"("+inspect.toString()+")()",returnByValue:true});
const data=audit.result.value;coverage.push({file,width,...data});
if(!data)issues.push({file,width,error:audit.exceptionDetails});
else if(data.overflow||data.headings.length||data.prohibited.length)issues.push({file,width,...data,errors:[...errors]});
if(['resources.html','neonatology.html','hospital-billing-services.html'].includes(path.basename(file))&&width!==768){
 const shot=await call('Page.captureScreenshot',{format:'png'});
 const dest=path.join(os.tmpdir(),'pmex-policy-'+file.replace(/\//g,'-')+'-'+width+'.png');fs.writeFileSync(dest,Buffer.from(shot.data,'base64'));screenshots.push(dest);
}
if(++n%30===0)console.log('Checked '+n+' page/viewport combinations');
}
}
fs.mkdirSync('reports',{recursive:true});fs.writeFileSync('reports/'+(selected.length?'for-you':'site')+'-typography-audit.json',JSON.stringify({pages:files.length,viewports:[1440,768,320],issues,screenshots,coverage},null,2));
console.log(JSON.stringify({pages:files.length,issues:issues.length,sample:issues.slice(0,2),screenshots},null,2));
if(issues.length)process.exitCode=1;
}finally{ws?.close();chrome.kill();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
function inspect(){
 const expectedH1=innerWidth>=1024?'36px':innerWidth>=640?'30px':'22px';
 const expectedLabel=innerWidth>=1024?'13px':'11px';
 const mismatches=[];
 const checks=[
 ['[data-reference-hero-title]',expectedH1,'rgb(80, 80, 80)','400'],
 ['[data-reference-hero] [data-reference-label]',expectedLabel,'rgb(63, 154, 75)','500'],
 ['[data-reference-description]',innerWidth>=640?'16px':'14px','rgb(103, 103, 103)','400'],
 ['[data-consistent-card-title]','16px','rgb(80, 80, 80)','600'],
 ['[data-consistent-card-body]','14px','rgb(103, 103, 103)','400'],
 ['[data-consistent-card-meta]','12px','rgb(103, 103, 103)',null],
 ['[data-problem-copy] p','14px','rgb(80, 80, 80)','400'],
 ['[data-problem-solution] p','12px','rgb(63, 154, 75)','600']
 ];
 let checked=0;
 for(const [selector,size,color,weight] of checks)for(const el of document.querySelectorAll(selector)){
  const c=getComputedStyle(el);checked++;
  if(c.fontSize!==size||c.color!==color||(weight&&c.fontWeight!==(el.matches('.platform-result-face h4')?'400':weight)))mismatches.push({selector,text:el.textContent.trim().slice(0,65),size:c.fontSize,color:c.color,weight:c.fontWeight});
 }
 const h1=document.querySelector('h1');
 if(h1&&!h1.hasAttribute('data-reference-hero-title'))mismatches.push({unclassifiedHero:true});
 return {overflow:document.documentElement.scrollWidth>innerWidth+2,headings:mismatches,prohibited:[],checked,hero:!!h1,cards:document.querySelectorAll('[data-consistent-card],[data-problem-card]').length};
}