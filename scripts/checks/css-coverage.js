// Finds rules of dist/css/root.css that no page ever uses.
// Every page is loaded at several widths with Chrome's CSS rule-usage tracking; a rule counts as used when it
// matched an element on any page at any width. Rules that only apply in a state the scan does not trigger
// (:hover, :focus, :active, :checked, open/close classes added by scripts, ::selection ...) are reported apart and
// never as dead.
//
// Usage: node scripts/checks/css-coverage.js [--widths=1440,1024,768,390] [--tabs=4] [page ...]
// Output: .regression/css-coverage.json { dead: [{line, selector}], stateOnly: [...] } and a summary.
const fs = require('fs'), os = require('os'), path = require('path'), http = require('http');
const { spawn } = require('child_process');
const { pageRels, pagePath, DIST } = require('../lib/pages');
const args = process.argv.slice(2);
const opt = (n, d) => { const a = args.find(x => x.startsWith('--' + n + '=')); return a ? a.split('=')[1] : d; };
const WIDTHS = opt('widths', '1440,1024,768,390').split(',').map(Number), TABS = Number(opt('tabs', 4));
const pages = args.filter(a => !a.startsWith('--')).map(p => path.relative(DIST, pagePath(p)).split(path.sep).join('/'));
const PAGES = pages.length ? pages : pageRels();
const STATE = /:(hover|focus|focus-visible|focus-within|active|checked|disabled|invalid|valid|target|visited|placeholder-shown|user-invalid)\b|::(selection|placeholder|backdrop|-webkit-[\w-]+|-moz-[\w-]+|file-selector-button|marker)|\.(is-[\w-]+|open|active|faq-open|show|visible|scrolled|sticky|expanded|current|selected|in-view|revealed|loaded|res-stack--on|pf-in|pf-anim|u-hidden|u-opacity-\d+|u-translate-[\w-]+|u-visible|u-invisible|u-pointer-events-[\w-]+|u-scale-\d+|u-flex|u-bg-[\w-]+|u-border-l-[\w-]+)\b|\[(aria-[\w-]+|open|hidden|data-state|data-open|data-active)/;

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.gif': 'image/gif', '.mp4': 'video/mp4', '.json': 'application/json' };
const serve = root => new Promise(r => { const s = http.createServer((q, res) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(root, p); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' }); fs.createReadStream(f).pipe(res); }); s.listen(0, '127.0.0.1', () => r(s)); });
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const server = await serve(path.resolve(DIST)), base = `http://127.0.0.1:${server.address().port}/`;
  const port = 9600 + Math.floor(Math.random() * 300);
  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--remote-debugging-port=' + port, '--user-data-dir=' + fs.mkdtempSync(path.join(os.tmpdir(), 'cov-')), 'about:blank'], { stdio: 'ignore' });
  for (let i = 0; i < 100; i++) { try { await fetch(`http://127.0.0.1:${port}/json/version`); break; } catch { await sleep(200); } }
  const css = fs.readFileSync(path.join(DIST, 'css/root.css'), 'utf8');
  const lineOf = off => { let n = 1; for (let i = 0; i < off; i++) if (css.charCodeAt(i) === 10) n++; return n; };
  const used = new Set(); // "start:end" offsets of used rules
  let sheetText = null, ruleRanges = null;

  async function tab() {
    const t = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
    const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
    let id = 0; const pend = {}, sheets = {};
    ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; } else if (m.method === 'CSS.styleSheetAdded') sheets[m.params.header.styleSheetId] = m.params.header.sourceURL; };
    const send = (method, params = {}) => new Promise(r => { pend[++id] = r; ws.send(JSON.stringify({ id, method, params })); }).then(m => m.result);
    await send('Page.enable'); await send('DOM.enable'); await send('CSS.enable');
    return { send, sheets };
  }
  const tabs = await Promise.all(Array.from({ length: TABS }, tab));
  const jobs = PAGES.flatMap(p => WIDTHS.map(w => ({ p, w }))); const total = jobs.length; let done = 0;
  await Promise.all(tabs.map(async c => {
    while (jobs.length) {
      const { p, w } = jobs.shift();
      await c.send('Emulation.setDeviceMetricsOverride', { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 600 });
      await c.send('CSS.startRuleUsageTracking');
      await c.send('Page.navigate', { url: base + p }); await sleep(2500);
      await c.send('Runtime.evaluate', { awaitPromise: true, expression: `(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,40))}scrollTo(0,0);await new Promise(r=>setTimeout(r,300))})()` });
      const { ruleUsage } = await c.send('CSS.stopRuleUsageTracking');
      for (const r of ruleUsage || []) if (r.used && (c.sheets[r.styleSheetId] || '').endsWith('/css/root.css')) used.add(Math.round(r.startOffset));
      if (++done % 40 === 0 || done === total) console.log(`${done}/${total}`);
    }
  }));
  chrome.kill(); server.close();

  // every style rule of root.css with its offset (same offsets Chrome reports: start of the selector)
  const rules = [];
  (function walk(text, base, inKeyframes) {
    let i = 0;
    while (i < text.length) {
      const open = text.indexOf('{', i); if (open < 0) break;
      let pre = text.slice(i, open); const lead = pre.length - pre.replace(/^[\s;]+/, '').length;
      const selStart = base + i + lead; pre = pre.replace(/\/\*[\s\S]*?\*\//g, '').trim();
      let d = 1, j = open + 1; for (; j < text.length && d; j++) { if (text[j] === '{') d++; else if (text[j] === '}') d--; }
      if (/^@(media|supports|layer|container)/.test(pre)) walk(text.slice(open + 1, j - 1), base + open + 1, false);
      else if (!pre.startsWith('@') && !inKeyframes && pre) rules.push({ start: selStart, selector: pre });
      i = j;
    }
  })(css.replace(/\/\*[\s\S]*?\*\//g, m => ' '.repeat(m.length)), 0, false);

  const nearUsed = r => { for (let k = -3; k <= 3; k++) if (used.has(r.start + k)) return true; return false; };
  const dead = [], stateOnly = [];
  for (const r of rules) if (!nearUsed(r)) (STATE.test(r.selector) ? stateOnly : dead).push({ line: lineOf(r.start), selector: r.selector.slice(0, 300) });
  fs.mkdirSync('.regression', { recursive: true });
  fs.writeFileSync('.regression/css-coverage.json', JSON.stringify({ pages: PAGES.length, widths: WIDTHS, rules: rules.length, used: rules.length - dead.length - stateOnly.length, dead, stateOnly }, null, 1));
  console.log(`rules ${rules.length}: used ${rules.length - dead.length - stateOnly.length}, state-only ${stateOnly.length}, never used ${dead.length}`);
  console.log('details: .regression/css-coverage.json');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(2); });
