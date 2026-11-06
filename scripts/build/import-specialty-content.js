/**
 * Import exact specialty copy from supplied HTML, retaining the local site shell.
 * Usage: node scripts/import-specialty-content.js <reference-directory> [--check]
 * References are data only; their scripts are never executed.
 */
const fs = require('fs');
const { applyHomepageLayout } = require('./specialty-homepage-layout');
const path = require('path');
const assert = require('assert/strict');
const { transform } = require('lightningcss');
const root = path.resolve(__dirname, '..', '..');
const dist = path.join(root, 'dist');
const sourceDir = process.argv[2];
if (!sourceDir) throw new Error('Pass the directory containing the supplied specialty HTML files.');
const check = process.argv.includes('--check');
const generator = fs.readFileSync(path.join(__dirname, '..', 'archive', 'generate-specialties.js'), 'utf8');
const slugs = [...generator.slice(generator.indexOf('const SPECIALTIES ='), generator.indexOf('/** Dropdown')).matchAll(/slug: "([^"]+)"/g)].map(m => m[1]);
const aliases = {'anesthesia-billing':'anesthesiology', 'ob-gyn':'gynecology'};
const palette = ['#FFFFFF','#EEF0E8','#AAD39C','#464A25','#505050','#676767','#959085','#3f9a4b'];
function color(r,g,b) {
  if (Math.max(r,g,b)-Math.min(r,g,b)<18) {
    const l=(r+g+b)/3;
    return l>245?'#FFFFFF':l>210?'#EEF0E8':l>135?'#959085':l>85?'#676767':'#505050';
  }
  const l=.2126*r+.7152*g+.0722*b;
  return l>215?'#EEF0E8':l>150?'#AAD39C':l<85?'#464A25':'#3f9a4b';
}
function recolor(value) {
  return value.replace(/#([0-9a-f]{6}|[0-9a-f]{3})(?![0-9a-f])/gi,(full,h)=>{
    if(palette.some(c=>c.toLowerCase()===full.toLowerCase())) return full;
    if(h.length===3) h=h.split('').map(c=>c+c).join('');
    return color(parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16));
  }).replace(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(\s*,\s*[\d.]+)?\s*\)/gi,(full,r,g,b,a)=>{
    const hex=color(+r,+g,+b);
    return a?'rgba('+[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).join(',')+a+')':hex;
  });
}
function contentOf(s) {
  const footer=s.indexOf('<footer');
  assert(footer>0,'Missing source footer');
  if(s.includes('</header>')) return s.slice(s.indexOf('</header>')+9,footer).trim();
  return s.slice(s.indexOf('>',s.indexOf('<body'))+1,footer).replace(/<nav\b[\s\S]*?<\/nav>/i,'').trim();
}
function textOf(s) {
  return s.replace(/<!--[\s\S]*?-->|<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>/gi,'')
    .replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
}
function attrs(s) {
  return s.replace(/<[^>]+>/g,tag=>tag
    .replace(/\b(style|fill|stroke|stop-color|font-family)="([^"]*)"/gi,(m,key,v)=>{
      if(key==='font-family') return key+'="Inter, sans-serif"';
      return key+'="'+recolor(v.replace(/font-family:[^;]+/gi,'font-family:Inter,sans-serif'))+'"';
    })
    .replaceAll('https://pmex-demo2.netlify.app/img/','/img/')
    .replace(/onclick="tF\(this\)"/g,'data-specialty-faq role="button" tabindex="0"')
  );
}
let count=0,styled=0;
for(const slug of slugs) {
  const sourcePath=path.join(sourceDir,slug+'.html');
  if(!fs.existsSync(sourcePath)){console.log('No supplied file; unchanged: '+slug);continue;}
  const target=require('../lib/pages').pagePath((aliases[slug]||slug)+'.html');
  assert(fs.existsSync(target),'Missing existing route '+target);
  const source=fs.readFileSync(sourcePath,'utf8');
  const old=fs.readFileSync(target,'utf8');
  const raw=contentOf(source);
  let content=attrs(raw);
  // Extract numerical display targets as data, never evaluate reference code.
  const targets = [...source.matchAll(/ac\('([^']+)',\s*(\d+)\)/g)].map(m=>[m[1],m[2]]);
  if(slug==='family-medicine') targets.push(['progcount','47']);
  if(slug==='mental-health-billing') targets.push(['mc','$24,800']);
  for(const [id,value] of targets) content=content.replace('id="'+id+'"','id="'+id+'" data-specialty-value="'+value+'"');
  const bars=[...source.matchAll(/\{id:'([^']+)',w:(\d+)\}/g)].map(m=>[m[1],m[2]]);
  if(slug==='cardiology') bars.push(['mbar1','62'],['mbar2','89']);
  for(const [id,value] of bars) content=content.replace('id="'+id+'"','id="'+id+'" data-specialty-width="'+value+'"');
  assert.equal(textOf(content),textOf(raw),'Copy changed: '+slug);
  content=applyHomepageLayout(content);
  // User-approved Family Medicine headline shortening.
  if(slug==='family-medicine') content=content.replace(" Your billing system should be <span class=\"ac2\">just as solid.</span>",'');
  if(slug==='family-medicine') content=content.replace("<div class=\"hero-btns\"><button class=\"btn-e\">Start Free Revenue Assessment</button><button class=\"btn-oe\">Book a Demo</button></div>","<div class=\"hero-btns family-hero-actions\"><a class=\"family-assessment-link\" href=\"revenue-audit.html\">Get a Free Revenue Assessment ?</a><a class=\"family-demo-button\" href=\"/company/demo.html\">Book a demo</a></div>");
  const isNative=source.includes('tailwindcss v4');
  let css='';
  if(!isNative) {
    styled++;
    const original=[...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(m=>m[1]).join('\n');
    css=recolor(original).replace(/-webkit-line-clamp:\s*\d+/g,'-webkit-line-clamp:unset').replace(/font-family:[^;}]+/gi,'font-family:Inter,sans-serif')
      .replace(/:root\b/g,':scope').replace(/(^|[},])\s*(html|body)\s*(?=[{,])/g,'$1 :scope');
    css='@scope (.specialty-content) {\n'+css+'\n'+
      ':scope{--w:#FFFFFF;--bg:#EEF0E8;--bg-s:#EEF0E8;--navy:#505050;--body:#676767;--muted:#676767;--soft:#959085;--border:#AAD39C;--em:#3f9a4b;--green:#3f9a4b;--blue:#464A25;--rose:#3f9a4b;--edark:#464A25;font-family:Inter,sans-serif;display:block;min-width:0;overflow-x:clip;}\n'+
      '.wrap{max-width:1260px;}h1,h2,h3,h4{font-family:Inter,sans-serif;font-weight:400;}'+
      '[data-r]{opacity:1!important;transform:none!important;}.fi.open .fi-a{max-height:none;}'+
      'button,a{cursor:pointer;}button:focus-visible,a:focus-visible,[role="button"]:focus-visible{outline:2px solid #464A25;outline-offset:4px;}'+
      '@media(max-width:640px){.wrap{padding-left:20px;padding-right:20px;}h1{overflow-wrap:break-word;}table{display:block;max-width:100%;overflow-x:auto;}}'+
      '\n}\n';
    transform({filename:slug+'.css',code:Buffer.from(css)}); // Parse every stylesheet before writing.
  }
  const cssLink=css?'\n<link rel="stylesheet" href="/css/specialties/'+slug+'.css" data-specialty-style>':'';
  const paletteLink='\n<link rel="stylesheet" href="/css/specialty-site-palette.css" data-specialty-palette>';
  const layoutLink='\n<link rel="stylesheet" href="/css/specialty-homepage-layout.css" data-specialty-layout>\n<script src="/js/marquee-track.js" defer data-specialty-marquee-script></script>';
  const runtimeLink='\n<script src="/js/specialty-content.js" defer data-specialty-runtime></script>';
  let headEnd=old.indexOf('</header>')+9;
  assert(headEnd>8 && old.indexOf('<footer')>headEnd,'Unrecognized local shell: '+slug);
  let before=old.slice(0,headEnd).replace(/\s*<link[^>]*data-specialty-style[^>]*>/g,'')
    .replace(/\s*<link[^>]*data-specialty-layout[^>]*>/g,'')
    .replace(/\s*<script[^>]*data-specialty-marquee-script[^>]*><\/script>/g,'')
    .replace(/\s*<link[^>]*data-specialty-palette[^>]*>/g,'')
    .replace(/\s*<script[^>]*data-specialty-runtime[^>]*><\/script>/g,'');
  before=before.replace(/<title>[\s\S]*?<\/title>/i,source.match(/<title>[\s\S]*?<\/title>/i)[0]);
  const meta=source.match(/<meta\s+name="description"[\s\S]*?>/i);
  if(meta) before=before.replace(/<meta\s+name="description"[\s\S]*?>/i,meta[0]);
  before=before.replace(/\s*<\/head>/,cssLink+paletteLink+layoutLink+runtimeLink+'\n</head>');
  const output=before+'\n<main class="specialty-content" data-source-specialty="'+slug+'">\n'+content+'\n</main>\n'+old.slice(old.indexOf('<footer'));
  if(check){
    assert.equal(old.replace(/\r\n/g,'\n'),output.replace(/\r\n/g,'\n'),'Page differs from reference import: '+slug);
    if(css) assert.equal(fs.readFileSync(path.join(dist,'css/specialties',slug+'.css'),'utf8'),css);
  }else{
    if(css){fs.mkdirSync(path.join(dist,'css/specialties'),{recursive:true});fs.writeFileSync(path.join(dist,'css/specialties',slug+'.css'),css);}
    fs.writeFileSync(target,output);
  }
  count++;
}
console.log((check?'Verified':'Imported')+' '+count+' specialties; '+styled+' scoped stylesheets. Exact text comparison passed.');