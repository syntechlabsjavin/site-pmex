// Removes u-* utility classes that change nothing on their element: on every scanned width, taking the class off
// leaves the computed style of the element (and of its descendants for inherited properties) the same, because
// a page block overrides it. Run per page; the page markup is rewritten.
//
// How: each element with u-* classes gets a data-cn id in the served copy of the page; in the browser the classes
// are taken off one at a time (an idle class stays off while the next is tested), animations are cancelled before
// every reading, and a final pass takes all idle classes off together and puts back those whose element changed.
// A class is dropped only when it was idle at every width. Elements that scripts toggle (u-hidden ...) are skipped.
//
// Usage: node scripts/build/class-noop.js [--dry] [--widths=390,700,900,1100,1440] page ...
const fs = require('fs'), os = require('os'), path = require('path'), http = require('http');
const { spawn } = require('child_process');
const { pagePath } = require('../lib/pages');
const args = process.argv.slice(2);
const opt = (n, d) => { const a = args.find(x => x.startsWith('--' + n + '=')); return a ? a.split('=')[1] : d; };
const WIDTHS = opt('widths', '390,700,900,1100,1440').split(',').map(Number);
const DRY = args.includes('--dry');
const PAGES = args.filter(a => !a.startsWith('--')).map(p => pagePath(p));
const STATE = /^u-(hidden|flex|block|opacity-|visible|invisible|pointer-events-|translate-|scale-|bg-FFFFFF|bg-gray-|border-l-)/;

const T = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.gif': 'image/gif', '.mp4': 'video/mp4', '.json': 'application/json' };
let SERVE = null; // [url path, html] served in place of the file
const serve = () => new Promise(r => { const s = http.createServer((q, res) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; if (SERVE && p === SERVE[0]) { res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end(SERVE[1]); } const f = path.join('dist', p); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': T[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' }); fs.createReadStream(f).pipe(res); }); s.listen(0, '127.0.0.1', () => r(s)); });
const sleep = ms => new Promise(r => setTimeout(r, ms));

// in the page: test every u-* class of every marked element; returns {id: [idle classes]}
const PROBE = (state, finalIdle) => {
  const re = new RegExp(state);
  const INH = /^(color|font|line-height|letter-spacing|word-spacing|text-|white-space|visibility|cursor|list-style|direction)/;
  const settle = () => { for (const a of document.getAnimations()) try { a.cancel(); } catch {} };
  const els = [...document.querySelectorAll('[data-cn]')];
  const snapEl = (el, deep) => {
    const parts = [];
    const one = (x, ps) => { const cs = getComputedStyle(x, ps); let s = ''; for (let k = 0; k < cs.length; k++) { const p = cs[k]; if (!p.startsWith('--')) s += cs.getPropertyValue(p) + '|'; } return s; };
    parts.push(one(el, null), one(el, '::before'), one(el, '::after'));
    if (deep) { const d = el.querySelectorAll('*'); for (let k = 0; k < d.length && k < 150; k++) parts.push(one(d[k], null)); }
    return parts.join('\n');
  };
  const out = {};
  if (finalIdle) { // verify: all idle classes off together, report elements that changed
    const before = els.map(el => snapEl(el, true));
    for (const el of els) for (const c of finalIdle[el.dataset.cn] || []) el.classList.remove(c);
    settle();
    els.forEach((el, i) => { if (finalIdle[el.dataset.cn] && snapEl(el, true) !== before[i]) out[el.dataset.cn] = 'changed'; });
    return out;
  }
  for (const el of els) {
    const idle = [];
    for (const c of [...el.classList].filter(c => c.startsWith('u-') && !re.test(c))) {
      settle(); const a = snapEl(el, true);
      el.classList.remove(c); settle();
      if (snapEl(el, true) === a) idle.push(c); else el.classList.add(c);
    }
    out[el.dataset.cn] = idle;
  }
  return out;
};

(async () => {
  const server = await serve(), base = `http://127.0.0.1:${server.address().port}`;
  const port = 9500 + Math.floor(Math.random() * 300);
  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--remote-debugging-port=' + port, '--user-data-dir=' + fs.mkdtempSync(path.join(os.tmpdir(), 'cn-')), 'about:blank'], { stdio: 'ignore' });
  for (let i = 0; i < 100; i++) { try { await fetch(`http://127.0.0.1:${port}/json/version`); break; } catch { await sleep(200); } }
  const t = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const pend = {};
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; } };
  const send = (method, params = {}) => new Promise((r, rej) => { const k = ++id; pend[k] = r; ws.send(JSON.stringify({ id: k, method, params })); setTimeout(() => { if (pend[k]) { delete pend[k]; rej(new Error('timeout ' + method)); } }, 300000); }).then(m => m.result);
  await send('Page.enable');
  let totalDropped = 0;
  for (const file of PAGES) {
    const src = fs.readFileSync(file, 'utf8');
    // mark every element whose class list has u-* (not inside scripts): data-cn="n"
    let n = 0; const ids = [];
    const marked = src.replace(/<([a-zA-Z][\w-]*)(\s[^<>]*?)?\sclass="([^"]*\bu-[^"]*)"/g, (all, tag, pre, cls, off) => { ids.push(off); return `<${tag}${pre || ''} data-cn="${n++}" class="${cls}"`; });
    const url = '/' + path.relative('dist', file).split(path.sep).join('/');
    SERVE = [url, marked];
    const load = async w => {
      await send('Emulation.setDeviceMetricsOverride', { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 600 });
      await send('Page.navigate', { url: base + url }); await sleep(2500);
      await send('Runtime.evaluate', { awaitPromise: true, expression: `(async()=>{for(let y=0;y<Math.min(document.documentElement.scrollHeight,40000);y+=700){scrollTo(0,y);await new Promise(r=>setTimeout(r,40))}scrollTo(0,0);await new Promise(r=>setTimeout(r,600))})()` });
    };
    // idle at every width
    let idle = null;
    for (const w of WIDTHS) {
      await load(w);
      const r = await send('Runtime.evaluate', { returnByValue: true, expression: `(${PROBE})(${JSON.stringify(STATE.source)}, null)` });
      const got = (r.result && r.result.value) || {};
      if (!idle) idle = got;
      else for (const k of Object.keys(idle)) idle[k] = (idle[k] || []).filter(c => (got[k] || []).includes(c));
    }
    // verify together, drop the whole element's idle set where it changes
    for (let round = 0; round < 3; round++) {
      let bad = 0;
      for (const w of WIDTHS) {
        await load(w);
        const r = await send('Runtime.evaluate', { returnByValue: true, expression: `(${PROBE})(${JSON.stringify(STATE.source)}, ${JSON.stringify(idle)})` });
        for (const k of Object.keys((r.result && r.result.value) || {})) { if ((idle[k] || []).length) { idle[k] = []; bad++; } }
      }
      if (!bad) break;
    }
    // rewrite the page: remove idle classes from the marked elements, in source order
    let k = 0, dropped = 0;
    const next = src.replace(/<([a-zA-Z][\w-]*)(\s[^<>]*?)?\sclass="([^"]*\bu-[^"]*)"/g, (all, tag, pre, cls) => {
      const drop = new Set(idle[k++] || []); if (!drop.size) return all;
      const kept = cls.split(/\s+/).filter(c => c && !drop.has(c)); dropped += drop.size;
      return `<${tag}${pre || ''}` + (kept.length ? ` class="${kept.join(' ')}"` : '');
    });
    totalDropped += dropped;
    console.log(`${path.basename(file)}: ${n} elements, ${dropped} idle classes removed`);
    if (!DRY && next !== src) fs.writeFileSync(file, next);
  }
  chrome.kill(); server.close();
  console.log(`total ${totalDropped} classes removed`);
  process.exit(0);
})();
