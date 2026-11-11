// Visual regression check: every page of the current dist/ against the same page at a git ref (default: tag css-baseline).
// For each page and width it compares a full-page screenshot pixel by pixel and, when the DOM has the same shape,
// the computed style of every element. Pixels that differ between two loads of the baseline (marquee, counters,
// sliders) are ignored. Output goes to .regression/ (report.json and a diff image for each page that changed).
//
// Usage: node scripts/checks/check-regression.js [--ref=css-baseline] [--widths=1440,390] [--tabs=4] [page ...]
//        Pages can be names (cardiology.html) or paths (specialties/cardiology.html). Default: every page.
// Exit code 1 when any page differs or fails to load.
const fs = require('fs'), os = require('os'), path = require('path'), http = require('http');
const { spawn, execSync } = require('child_process');
const { pageRels, pagePath, DIST } = require('../lib/pages');

const args = process.argv.slice(2);
const opt = (name, def) => { const a = args.find(x => x.startsWith('--' + name + '=')); return a ? a.split('=')[1] : def; };
const REF = opt('ref', 'css-baseline');
const WIDTHS = opt('widths', '1440,390').split(',').map(Number);
const TABS = Number(opt('tabs', 4));
const PIXEL_TOLERANCE = 24; // per colour channel, absorbs anti-aliasing
const MAX_HEIGHT = 30000;
const pages = args.filter(a => !a.startsWith('--')).map(p => path.relative(DIST, pagePath(p)).split(path.sep).join('/'));
const PAGES = pages.length ? pages : pageRels();

const OUT = '.regression', BASE = path.join(OUT, 'baseline-' + REF.replace(/[^\w.-]/g, '_')), DIFFS = path.join(OUT, 'diffs');
fs.mkdirSync(DIFFS, { recursive: true });
for (const f of fs.readdirSync(DIFFS)) fs.unlinkSync(path.join(DIFFS, f));
const sha = execSync(`git rev-parse ${REF}`).toString().trim();
if (!fs.existsSync(path.join(BASE, sha))) {
  fs.rmSync(BASE, { recursive: true, force: true }); fs.mkdirSync(BASE, { recursive: true });
  const tarFile = path.join(BASE, 'dist.tar').split(path.sep).join('/');
  execSync(`git archive --format=tar -o "${tarFile}" ${REF} ${DIST}`);
  execSync(`tar -xf "${tarFile}" -C "${BASE.split(path.sep).join('/')}"`);
  fs.unlinkSync(tarFile);
  fs.writeFileSync(path.join(BASE, sha), '');
}

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.mp4': 'video/mp4' };
function serve(root) {
  root = path.resolve(root);
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
    const file = path.join(root, p);
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(r => server.listen(0, '127.0.0.1', () => r(server)));
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
// Animations stopped at a random frame make every capture different, so they are switched off entirely.
const FREEZE = '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}';
// Colors are compared by value, not by notation: rgba(0, 0, 0, 0.05), color(srgb 0 0 0 / 0.05) and an oklch() that
// resolves to the same sRGB pixel are all written as one canonical rgb()/rgba().
function makeNorm() {
  const cx = document.createElement('canvas').getContext('2d', { willReadFrequently: true }), memo = new Map();
  const col = c => {
    if (memo.has(c)) return memo.get(c);
    let a = 1; const m = c.match(/\/\s*([\d.]+)(%?)\s*\)$/) || c.match(/^rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)$/);
    if (m) a = m[2] === '%' ? m[1] / 100 : +m[1];
    const solid = c.replace(/\s*\/\s*[\d.]+%?\s*\)$/, ')').replace(/^rgba\(([^,]+,[^,]+,[^,]+),[^)]*\)$/, 'rgb($1)');
    cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = solid; cx.fillRect(0, 0, 1, 1);
    const d = cx.getImageData(0, 0, 1, 1).data;
    const r = a === 1 ? `rgb(${d[0]},${d[1]},${d[2]})` : `rgba(${d[0]},${d[1]},${d[2]},${+a.toFixed(3)})`;
    memo.set(c, r); return r;
  };
  // once every color is rgb(), `in srgb` is the default blend of a gradient, so it is dropped too
  return v => v.indexOf('(') < 0 ? v : v.replace(/(?:rgba?|oklch|oklab|lab|lch|color|hsla?)\([^()]*\)/g, col).replace(/gradient\(in srgb, /g, 'gradient(').replace(/ in srgb,/g, ',');
}
const SNAP = `(()=>{const out=[];const norm=(${makeNorm.toString()})();
const take=(el,ps)=>{const cs=getComputedStyle(el,ps);if(ps&&(cs.content==='none'||cs.content==='normal'))return null;const v=[];for(let i=0;i<cs.length;i++){const p=cs[i];if(p.startsWith('--'))continue;v.push(p+':'+norm(cs.getPropertyValue(p)).split(location.origin).join(''));}return v.join('\\u0001');};
document.querySelectorAll('*').forEach(el=>{const tag=el.tagName.toLowerCase()+(el.id?'#'+el.id:'')+(typeof el.className==='string'&&el.className.trim()?'.'+el.className.trim().split(/\\s+/).slice(0,3).join('.'):'');
out.push([tag,take(el),take(el,'::before'),take(el,'::after')]);});return JSON.stringify(out);})()`;

async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const pend = {}; const handlers = new Set();
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; } else if (m.method) handlers.forEach(h => h(m)); };
  const send = (method, params = {}) => new Promise(r => { pend[++id] = r; ws.send(JSON.stringify({ id, method, params })); }).then(m => { if (m.error) throw new Error(method + ': ' + m.error.message); return m.result; });
  return { ws, send, on: h => { handlers.add(h); return () => handlers.delete(h); } };
}

async function capture(c, url, width) {
  await c.send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
  let off; const loaded = new Promise(r => { off = c.on(m => { if (m.method === 'Page.loadEventFired') r(); }); });
  await c.send('Page.navigate', { url });
  await Promise.race([loaded, sleep(20000)]); off();
  // walk down the page so lazy images and scroll reveals fire, then return to the top
  await c.send('Runtime.evaluate', { awaitPromise: true, expression: `(async()=>{const s=ms=>new Promise(r=>setTimeout(r,ms));for(let y=0;y<document.documentElement.scrollHeight;y+=700){scrollTo(0,y);await s(60);}scrollTo(0,0);await s(300);const st=document.createElement('style');st.textContent=${JSON.stringify(FREEZE)};document.head.appendChild(st);await document.fonts.ready;await s(500);})()` });
  const check = await c.send('Runtime.evaluate', { returnByValue: true, expression: 'location.href.startsWith("http")&&document.readyState==="complete"' });
  if (!check.result.value) throw new Error('page did not load: ' + url);
  const styles = JSON.parse((await c.send('Runtime.evaluate', { expression: SNAP, returnByValue: true })).result.value);
  const { cssContentSize } = await c.send('Page.getLayoutMetrics');
  const height = Math.min(Math.ceil(cssContentSize.height), MAX_HEIGHT);
  const shot = await c.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height, scale: 1 } });
  return { styles, png: shot.data };
}

function styleDiff(a, b) {
  if (a.length !== b.length || a.some((x, i) => x[0].split('.')[0] !== b[i][0].split('.')[0])) return null; // DOM changed: not comparable
  const res = [];
  for (let i = 0; i < a.length; i++) for (let k = 1; k < 4; k++) {
    if (a[i][k] === b[i][k]) continue;
    const map = s => new Map((s || '').split('\u0001').map(x => [x.slice(0, x.indexOf(':')), x.slice(x.indexOf(':') + 1)]));
    const pa = map(a[i][k]), pb = map(b[i][k]);
    const props = [...new Set([...pa.keys(), ...pb.keys()])].filter(p => pa.get(p) !== pb.get(p)).map(p => [p, pa.get(p), pb.get(p)]);
    res.push({ el: a[i][0] + ['', '', '::before', '::after'][k], props });
  }
  return res;
}

// Runs in a blank tab: compares baseline/current screenshots, masks pixels that differ between two baseline loads.
const COMPARE = `async (b1, b2, cur, tol) => {
  const load = d => new Promise(r => { if (!d) return r(null); const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + d; });
  const [A, A2, B] = await Promise.all([load(b1), load(b2), load(cur)]);
  const W = Math.max(A.width, B.width), H = Math.max(A.height, B.height);
  const px = img => { const c = new OffscreenCanvas(W, H), x = c.getContext('2d'); x.fillStyle = '#ff00ff'; x.fillRect(0, 0, W, H); x.drawImage(img, 0, 0); return x.getImageData(0, 0, W, H).data; };
  const a = px(A), b = px(B), a2 = A2 ? px(A2) : null;
  const differs = (p, q, i) => Math.abs(p[i] - q[i]) > tol || Math.abs(p[i + 1] - q[i + 1]) > tol || Math.abs(p[i + 2] - q[i + 2]) > tol;
  const out = new ImageData(W, H); let count = 0; const rows = new Uint8Array(H);
  for (let i = 0; i < a.length; i += 4) {
    const noisy = a2 && differs(a, a2, i), hit = !noisy && differs(a, b, i);
    if (hit) { count++; rows[(i / 4 / W) | 0] = 1; out.data.set([255, 0, 0, 255], i); }
    else { const g = (b[i] + b[i + 1] + b[i + 2]) / 3; out.data.set([g, g, g, noisy ? 60 : 110], i); }
  }
  const bands = []; for (let y = 0; y < H; y++) if (rows[y]) { const l = bands[bands.length - 1]; if (l && y - l[1] <= 40) l[1] = y; else bands.push([y, y]); }
  let diffPng = null;
  if (count) { const c = new OffscreenCanvas(W, H); c.getContext('2d').putImageData(out, 0, 0); const blob = await c.convertToBlob({ type: 'image/png' }); const buf = new Uint8Array(await blob.arrayBuffer()); let s = ''; for (let i = 0; i < buf.length; i += 32768) s += String.fromCharCode(...buf.subarray(i, i + 32768)); diffPng = btoa(s); }
  return JSON.stringify({ count, percent: +(count / (W * H) * 100).toFixed(4), size: [[A.width, A.height], [B.width, B.height]], bands: bands.slice(0, 12), diffPng });
}`;

(async () => {
  const [baseServer, curServer] = await Promise.all([serve(path.join(BASE, DIST)), serve(DIST)]);
  const baseUrl = 'http://127.0.0.1:' + baseServer.address().port + '/', curUrl = 'http://127.0.0.1:' + curServer.address().port + '/';
  const port = 9300 + Math.floor(Math.random() * 500);
  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--hide-scrollbars', '--force-color-profile=srgb', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--disable-backgrounding-occluded-windows', '--remote-debugging-port=' + port, '--user-data-dir=' + fs.mkdtempSync(path.join(os.tmpdir(), 'pmex-regression-')), 'about:blank'], { stdio: 'ignore' });
  for (let i = 0; i < 100; i++) { try { await fetch(`http://127.0.0.1:${port}/json/version`); break; } catch { await sleep(200); } }
  const tab = async () => {
    const t = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
    const c = await connect(t.webSocketDebuggerUrl);
    await c.send('Page.enable'); await c.send('Network.setCacheDisabled', { cacheDisabled: true });
    await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    return c;
  };
  const tabs = await Promise.all(Array.from({ length: TABS }, tab));
  const cmpTab = await tab();
  let cmpQueue = Promise.resolve();
  const compare = (b1, b2, cur) => (cmpQueue = cmpQueue.then(async () => {
    const r = await cmpTab.send('Runtime.callFunctionOn', { functionDeclaration: COMPARE, executionContextId: undefined, objectId: (await cmpTab.send('Runtime.evaluate', { expression: 'window' })).result.objectId, arguments: [{ value: b1 }, { value: b2 }, { value: cur }, { value: PIXEL_TOLERANCE }], awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error('compare failed: ' + JSON.stringify(r.exceptionDetails).slice(0, 300));
    return JSON.parse(r.result.value);
  }));

  const jobs = PAGES.flatMap(p => WIDTHS.map(w => ({ p, w })));
  const total = jobs.length, results = []; let done = 0; const t0 = Date.now();
  await Promise.all(tabs.map(async c => {
    while (jobs.length) {
      const { p, w } = jobs.shift();
      const r = { page: p, width: w };
      try {
        const base = await capture(c, baseUrl + p, w), cur = await capture(c, curUrl + p, w);
        let px = await compare(base.png, null, cur.png);
        let sd = styleDiff(base.styles, cur.styles);
        if (px.count || (sd && sd.length)) { // re-load the baseline to learn which pixels and styles move by themselves
          const base2 = await capture(c, baseUrl + p, w);
          px = await compare(base.png, base2.png, cur.png);
          const noise = styleDiff(base.styles, base2.styles) || [];
          const noisy = new Set(noise.flatMap(n => n.props.map(([q]) => n.el + '|' + q)));
          if (sd) sd = sd.map(x => ({ ...x, props: x.props.filter(([q]) => !noisy.has(x.el + '|' + q)) })).filter(x => x.props.length);
        }
        r.pixels = { count: px.count, percent: px.percent, bands: px.bands, size: px.size };
        if (sd === null) { const i = base.styles.findIndex((x, j) => !cur.styles[j] || x[0].split('.')[0] !== cur.styles[j][0].split('.')[0]); r.domAt = [base.styles.length, cur.styles.length, i, base.styles.slice(Math.max(0,i-2), i + 3).map(x => x[0]), (cur.styles.slice(Math.max(0,i-2), i + 3)).map(x => x[0])]; }
        r.styles = sd === null ? 'dom-changed' : { count: sd.length, sample: sd.slice(0, 60) };
        r.changed = px.count > 0 || (sd !== null && sd.length > 0);
        if (px.diffPng) { r.diffImage = path.join(DIFFS, p.replace(/[\/\\]/g, '__') + '-' + w + '.png'); fs.writeFileSync(r.diffImage, Buffer.from(px.diffPng, 'base64')); }
      } catch (e) { r.error = String(e.message || e); r.changed = true; }
      results.push(r);
      if (++done % 10 === 0 || done === total) console.log(`${done}/${total}  ${Math.round((Date.now() - t0) / 1000)}s`);
    }
  }));

  results.sort((a, b) => a.page.localeCompare(b.page) || a.width - b.width);
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({ ref: REF, sha, when: new Date().toISOString(), results }, null, 1));
  const bad = results.filter(r => r.changed);
  console.log(`\n${results.length} checks against ${REF} (${sha.slice(0, 7)}): ${bad.length} changed`);
  for (const r of bad) {
    if (r.error) { console.log(`  ERROR ${r.page} @${r.width}: ${r.error}`); continue; }
    const st = r.styles === 'dom-changed' ? 'DOM changed' : `${r.styles.count} styled elements`;
    console.log(`  ${r.page} @${r.width}: ${r.pixels.count} px (${r.pixels.percent}%), ${st}, rows ${r.pixels.bands.map(b => b.join('-')).join(' ')}`);
  }
  if (bad.length) console.log(`\nDetails: ${path.join(OUT, 'report.json')}  Diff images: ${DIFFS}`);
  tabs.concat(cmpTab).forEach(t => t.ws.close()); chrome.kill(); baseServer.close(); curServer.close();
  process.exit(bad.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
