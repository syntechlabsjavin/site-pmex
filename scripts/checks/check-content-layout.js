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
const files=process.argv.includes('--sample')?['index.html','family-medicine.html','physical-therapy.html','platform.html','pmex-portal.html','see-pricing.html','sleep-medicine.html','pricing.html'].flatMap(n=>require('../lib/pages').pageRels().filter(r=>require('path').basename(r)===n)):require('../lib/pages').pageRels();
const issues=[],screenshots=[];let n=0;
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
const data=audit.result.value;
if(!data)issues.push({file,width,error:audit.exceptionDetails});
else if(data.overflow||data.headings.length||data.prohibited.length||errors.length)issues.push({file,width,...data,errors:[...errors]});
if(['index.html','family-medicine.html','see-pricing.html'].includes(require('path').basename(file))&&width!==768){
 const shot=await call('Page.captureScreenshot',{format:'png'});
 const dest=path.join(os.tmpdir(),'pmex-policy-'+file+'-'+width+'.png');fs.writeFileSync(dest,Buffer.from(shot.data,'base64'));screenshots.push(dest);
}
if(++n%30===0)console.log('Checked '+n+' page/viewport combinations');
}
}
fs.mkdirSync('reports',{recursive:true});fs.writeFileSync('reports/content-layout-audit.json',JSON.stringify({pages:files.length,viewports:[1440,768,320],issues,screenshots},null,2));
console.log(JSON.stringify({pages:files.length,issues:issues.length,sample:issues.slice(0,12),screenshots},null,2));
}finally{ws?.close();chrome.kill();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
function inspect(){
const headings=[...document.querySelectorAll('h1,h2,h3,h4')].filter(h=>h.getClientRects().length&&h.getBoundingClientRect().width>24).map(h=>{
 const range=document.createRange();range.selectNodeContents(h);
 const rects=[...range.getClientRects()].filter(r=>r.width>0&&r.height>0);
 const rows=[];for(const r of rects){const center=r.y+r.height/2;if(!rows.some(y=>Math.abs(y-center)<r.height*.6))rows.push(center);}
 return {text:h.textContent.trim(),lines:rows.length,size:getComputedStyle(h).fontSize,width:h.clientWidth};
}).filter(h=>h.lines>2);
const text=document.body.textContent;
return {overflow:document.documentElement.scrollWidth>innerWidth+2,scrollWidth:document.documentElement.scrollWidth,headings,prohibited:[...text.matchAll(/\bPMEx EHR\b|\bno contracts\b|\bSOC\s*2\b|\bautomat\w*|\bAI[- ](?:driven|powered)\b|\boffshore\b/g)].map(m=>m[0]).slice(0,8)};
}
