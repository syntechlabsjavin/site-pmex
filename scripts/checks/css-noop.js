// Finds rules of the older blocks of dist/css/root.css that change nothing: on every page and width where the
// rule matches an element, switching the rule off leaves every computed value of those elements (and, for
// inherited properties and custom properties, of their descendants) the same, because other rules win.
// css-coverage.js finds rules that never match; this finds rules that match but always lose.
//
// Kept on purpose (never reported): rules with a state in the selector (:hover, .open ...), rules that declare
// transition or animation properties (a running transition hides the change), rules whose @media never matched
// at the scanned widths, and rules not scoped to one of the scanned blocks ([data-css~="block"]), since pages
// outside the scan could need them.
//
// Usage: node scripts/checks/css-noop.js --blocks=a,b [--widths=390,700,900,1100,1440] [--tabs=4]
//        node scripts/checks/css-noop.js --blocks=a,b --remove     (deletes the reported rules)
// Output: .regression/css-noop.json { noop: [{line, selector}] }
const fs = require('fs'), os = require('os'), path = require('path'), http = require('http');
const { spawn } = require('child_process');
const { pageFiles } = require('../lib/pages');
const args = process.argv.slice(2);
const opt = (n, d) => { const a = args.find(x => x.startsWith('--' + n + '=')); return a ? a.split('=')[1] : d; };
let BLOCKS = opt('blocks', '').split(',').filter(Boolean);
const WIDTHS = opt('widths', '390,700,900,1100,1440').split(',').map(Number);
const TABS = +opt('tabs', 4);
const FILE = 'dist/css/root.css';
const CUR = opt('cur', 'dist'); // folder that is served and read (a copy of dist lets you keep editing during a scan)
if (!BLOCKS.length) { console.log('usage: --blocks=a,b'); process.exit(1); }

const css = fs.readFileSync(path.join(CUR, 'css/root.css'), 'utf8').replace(/\r\n/g, '\n');
const lines = css.split('\n');
const dsLine = lines.findIndex(l => /^@layer ds\s*\{/.test(l));
if (BLOCKS.includes('all')) BLOCKS = [...new Set(lines.map(l => (l.match(/^\/\* =====.*\[data-css~="([^"]+)"\]/) || [])[1]).filter(Boolean))];

// style rules in source order (same order as the CSSOM), with line, block and selector
function sourceRules() {
  const out = []; const text = css.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
  const lineAt = off => text.slice(0, off).split('\n').length;
  (function walk(from, to, inKf, media) {
    let i = from;
    while (i < to) {
      const open = text.indexOf('{', i); if (open < 0 || open >= to) break;
      // a prelude may start with statements such as "@layer a, b;" or "@import ...;"
      let pre = text.slice(i, open); const semi = pre.lastIndexOf(';');
      let start = i; if (semi >= 0 && !/\(/.test(pre.slice(semi))) { start = i + semi + 1; pre = pre.slice(semi + 1); }
      const lead = pre.length - pre.trimStart().length; pre = pre.trim();
      let d = 1, j = open + 1; for (; j < text.length && d; j++) { if (text[j] === '{') d++; else if (text[j] === '}') d--; }
      if (/^@media\b/.test(pre)) walk(open + 1, j - 1, false, media.concat(pre.slice(6).trim()));
      else if (/^@(supports|layer|container|scope)\b/.test(pre)) walk(open + 1, j - 1, false, media);
      else if (/^@(keyframes|-webkit-keyframes)\b/.test(pre)) { /* keyframes: not style rules */ }
      else if (!pre.startsWith('@') && pre && !inKf) out.push({ line: lineAt(start + lead), selector: pre.replace(/\s+/g, ' '), media });
      i = j;
    }
  })(0, text.length, false, []);
  return out;
}
const src = sourceRules();
const blockAt = []; { let b = null; lines.forEach((l, i) => { const m = l.match(/^\/\* =====.*\[data-css~="([^"]+)"\]/); if (m) b = m[1]; blockAt[i + 1] = b; }); }

// pages that load any scanned block
const PAGES = [], PAGE_BLOCKS = new Map();
for (const f of pageFiles()) {
  const m = fs.readFileSync(f, 'utf8').match(/<html[^>]*data-css="([^"]*)"/);
  if (!m || !m[1].split(/\s+/).some(b => BLOCKS.includes(b))) continue;
  const rel = path.relative('dist', f).split(path.sep).join('/');
  PAGES.push(rel); PAGE_BLOCKS.set(rel, new Set(m[1].split(/\s+/)));
}
// candidates: one-line rules of the scanned blocks before the ds layer, scoped to that block
const STATE = /:(hover|focus|focus-visible|focus-within|active|checked|disabled|target|visited|placeholder-shown|invalid|valid)\b|::(selection|backdrop|-webkit-|-moz-)|\.(is-[\w-]+|open|active|faq-open|show|visible|scrolled|sticky|expanded|current|selected|in-view|revealed|loaded)\b|\[(aria-[\w-]+|open|hidden|data-state|data-open|data-active)/;
const cand = new Map();
src.forEach((r, idx) => {
  if (r.line >= dsLine) return;
  const b = blockAt[r.line];
  if (!BLOCKS.includes(b) || STATE.test(r.selector)) return;
  if (!r.selector.split(/,(?![^()]*\))/).every(s => s.includes(`[data-css~="${b}"]`))) return;
  if (!/\{.*\}\s*$/.test(lines[r.line - 1])) return; // whole rule on its line (compact-css.js), so it can be deleted
  if (/(^|[;{ ])(transition|animation)[\w-]*\s*:/.test(lines[r.line - 1])) return;
  if (/[{;]\s*--[\w-]+\s*:/.test(lines[r.line - 1])) return; // custom properties reach any descendant: kept
  r.block = b;
  cand.set(idx, r);
});
console.log(`${PAGES.length} pages, ${WIDTHS.length} widths, ${cand.size} candidate rules in ${BLOCKS.join(' ')}`);

const T = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.gif': 'image/gif', '.mp4': 'video/mp4', '.json': 'application/json' };
let MARKED = null; // root.css with the candidate markers, served in place of the file
const serve = root => new Promise(r => { const s = http.createServer((q, res) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; if (p === '/css/root.css' && MARKED) { res.writeHead(200, { 'Content-Type': 'text/css', 'Cache-Control': 'no-store' }); return res.end(MARKED); } const f = path.join(root, p); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': T[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' }); fs.createReadStream(f).pipe(res); }); s.listen(0, '127.0.0.1', () => r(s)); });
const sleep = ms => new Promise(r => setTimeout(r, ms));

// runs in the page: for each candidate (CSSOM ordinal), matched? changed when switched off?
const PROBE = (targets, srcSel) => {
  const sheet = [...document.styleSheets].find(s => s.href && s.href.endsWith('/css/root.css'));
  const list = [];
  (function walk(rules, media) {
    for (const r of rules) {
      if (r instanceof CSSStyleRule) list.push({ r, media });
      else if (r instanceof CSSMediaRule) walk(r.cssRules, media.concat(r.media.mediaText));
      else if (r.cssRules && !(r instanceof CSSKeyframesRule)) walk(r.cssRules, media);
    }
  })(sheet.cssRules, []);
  const norm = s => s.replace(/["'\s]/g, '').replace(/::?(before|after)/g, '::$1');
  const INHERITED = /^(color|font|line-height|letter-spacing|word-spacing|text-(align|indent|transform|shadow|decoration-color|rendering)|white-space|visibility|cursor|list-style|direction|quotes|caret-color|-webkit-text)/;
  const out = {};
  const mnorm = s => s.replace(/\s+/g, '').toLowerCase();
  // every candidate carries --noop-id: <idx> in the served stylesheet, so its CSSOM rule is found exactly
  const byId = new Map();
  for (const x of list) { const id = x.r.style.getPropertyValue('--noop-id').trim(); if (id) byId.set(+id, x); }
  for (const [idx] of targets) {
    const e = byId.get(idx);
    if (!e) { out[idx] = 'mismatch'; continue; }
    if (e.media.some(m => !matchMedia(m).matches)) { out[idx] = 'inactive'; continue; }
    const pm = e.r.selectorText.match(/::?(before|after|marker|placeholder)\b/);
    const pseudo = pm ? '::' + pm[1] : null;
    let els; try { els = [...document.querySelectorAll(pseudo ? e.r.selectorText.replace(/::?(before|after|marker|placeholder)\b/g, '') : e.r.selectorText)]; } catch { out[idx] = 'error'; continue; }
    if (!els.length) { out[idx] = 'unmatched'; continue; }
    const props = [...e.r.style].filter(p => p !== '--noop-id');
    const vars = props.some(p => p.startsWith('--'));
    const inh = vars || props.some(p => INHERITED.test(p));
    let targetsEls = els.map(el => [el, pseudo]);
    if (inh) for (const el of els) { const d = el.querySelectorAll('*'); for (let k = 0; k < d.length && k < 300; k++) targetsEls.push([d[k], null]); }
    const check = vars ? null : props;
    const snap = () => targetsEls.map(([el, ps]) => { const cs = getComputedStyle(el, ps); if (check) return check.map(p => cs.getPropertyValue(p)).join('|'); let s = ''; for (let k = 0; k < cs.length; k++) s += cs.getPropertyValue(cs[k]) + '|'; return s; }).join('\n');
    // rules found idle stay off while the next ones are tested: two rules that do the same job are not both idle
    // a running transition shows the old value right after a change: cancel every animation before reading
    const settle = () => { for (const a of document.getAnimations()) try { a.cancel(); } catch {} };
    settle(); const before = snap(); const txt = e.r.style.cssText; e.r.style.cssText = '';
    settle(); const after = snap();
    if (before === after) out[idx] = 'same'; else { e.r.style.cssText = txt; out[idx] = 'changed'; }
  }
  return out;
};

// runs in the page: switch all given rules off together; return the ids of rules on elements that changed
const VERIFY = ids => {
  const sheet = [...document.styleSheets].find(s => s.href && s.href.endsWith('/css/root.css'));
  const byId = new Map();
  (function walk(rules, media) {
    for (const r of rules) {
      if (r instanceof CSSStyleRule) { const id = r.style.getPropertyValue('--noop-id').trim(); if (id) byId.set(+id, { r, media }); }
      else if (r instanceof CSSMediaRule) walk(r.cssRules, media.concat(r.media.mediaText));
      else if (r.cssRules && !(r instanceof CSSKeyframesRule)) walk(r.cssRules, media);
    }
  })(sheet.cssRules, []);
  const INHERITED = /^(color|font|line-height|letter-spacing|word-spacing|text-(align|indent|transform|shadow|decoration-color|rendering)|white-space|visibility|cursor|list-style|direction|quotes|caret-color|-webkit-text)/;
  const settle = () => { for (const a of document.getAnimations()) try { a.cancel(); } catch {} };
  // targets: [element, pseudo] -> {props, ids}
  const T = new Map(); const key = (el, ps) => { let m = T.get(el); if (!m) T.set(el, m = {}); return m[ps || ''] || (m[ps || ''] = { props: new Set(), ids: new Set() }); };
  const rules = [];
  for (const id of ids) {
    const e = byId.get(id); if (!e || e.media.some(m => !matchMedia(m).matches)) continue;
    const pm = e.r.selectorText.match(/::?(before|after|marker|placeholder)\b/); const ps = pm ? '::' + pm[1] : null;
    let els = []; try { els = [...document.querySelectorAll(ps ? e.r.selectorText.replace(/::?(before|after|marker|placeholder)\b/g, '') : e.r.selectorText)]; } catch { continue; }
    const props = [...e.r.style].filter(p => p !== '--noop-id');
    for (const el of els) {
      const t = key(el, ps); props.forEach(p => t.props.add(p)); t.ids.add(id);
      const inh = props.filter(p => INHERITED.test(p));
      if (inh.length) { const d = el.querySelectorAll('*'); for (let k = 0; k < d.length && k < 300; k++) { const u = key(d[k], null); inh.forEach(p => u.props.add(p)); u.ids.add(id); } }
    }
    rules.push(e.r);
  }
  const entries = []; for (const [el, m] of T) for (const ps in m) entries.push([el, ps || null, [...m[ps].props], m[ps].ids]);
  const snap = () => entries.map(([el, ps, props]) => { const cs = getComputedStyle(el, ps); return props.map(p => cs.getPropertyValue(p)); });
  settle(); const before = snap();
  const saved = rules.map(r => r.style.cssText); rules.forEach(r => { r.style.cssText = ''; });
  settle(); const after = snap();
  rules.forEach((r, i) => { r.style.cssText = saved[i]; });
  const unsafe = new Set();
  entries.forEach(([, , props, ids], i) => {
    const changed = props.filter((p, k) => before[i][k] !== after[i][k]);
    if (changed.length) for (const id of ids) { const e = byId.get(id); if ([...e.r.style].some(p => changed.includes(p))) unsafe.add(id); }
  });
  return [...unsafe];
};

(async () => {
  const server = await serve(path.resolve(CUR)), base = `http://127.0.0.1:${server.address().port}/`;
  const port = 9300 + Math.floor(Math.random() * 300);
  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--remote-debugging-port=' + port, '--user-data-dir=' + fs.mkdtempSync(path.join(os.tmpdir(), 'noop-')), 'about:blank'], { stdio: 'ignore' });
  for (let i = 0; i < 100; i++) { try { await fetch(`http://127.0.0.1:${port}/json/version`); break; } catch { await sleep(200); } }
  async function tab() {
    const t = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
    const ws = new WebSocket(t.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
    let id = 0; const pend = {};
    ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; } };
    const send = (method, params = {}) => new Promise((r, rej) => { const k = ++id; pend[k] = r; ws.send(JSON.stringify({ id: k, method, params })); setTimeout(() => { if (pend[k]) { delete pend[k]; rej(new Error('timeout ' + method)); } }, 180000); }).then(m => m.result);
    await send('Page.enable');
    return send;
  }
  const tabs = await Promise.all(Array.from({ length: TABS }, tab));
  const targets = [...cand].map(([idx, r]) => [idx, r.selector, r.media.join('&'), r.block]);
  { const marked = lines.slice(); for (const [idx, r] of cand) marked[r.line - 1] = marked[r.line - 1].replace('{', `{ --noop-id: ${idx};`); MARKED = marked.join('\n'); }
  const status = new Map(); // idx -> {matched, changed, bad}
  const jobs = PAGES.flatMap(p => WIDTHS.map(w => ({ p, w }))); const total = jobs.length; let done = 0;
  await Promise.all(tabs.map(async send => {
    while (jobs.length) {
      const { p, w } = jobs.shift();
      const mine = targets.filter(t => PAGE_BLOCKS.get(p).has(t[3]));
      let out = {};
      try {
        await send('Emulation.setDeviceMetricsOverride', { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 600 });
        await send('Page.navigate', { url: base + p }); await sleep(2500);
        await send('Runtime.evaluate', { awaitPromise: true, expression: `(async()=>{for(let y=0;y<Math.min(document.documentElement.scrollHeight,40000);y+=700){scrollTo(0,y);await new Promise(r=>setTimeout(r,40))}scrollTo(0,0);await new Promise(r=>setTimeout(r,600))})()` });
        const res = await send('Runtime.evaluate', { returnByValue: true, expression: `(${PROBE})(${JSON.stringify(mine.map(t => t.slice(0, 3)))})` });
        out = (res.result && res.result.value) || {};
      } catch (err) { // a page that hangs: its rules count as untested (kept); carry on in a fresh tab
        console.log(`skipped ${p} @${w}: ${err.message}`);
        for (const t of mine) out[t[0]] = 'error';
        send = await tab();
      }
      for (const [idx, v] of Object.entries(out)) {
        const s = status.get(+idx) || { matched: 0, changed: 0, bad: 0 };
        if (v === 'same') s.matched++; else if (v === 'changed') { s.matched++; s.changed++; } else if (v === 'mismatch' || v === 'error') { s.bad++; s.why = v; }
        status.set(+idx, s);
      }
      if (++done % 20 === 0 || done === total) console.log(`${done}/${total}`);
    }
  }));
  // verify: each page decided alone, so a rule idle on one page (because a rule kept for another page was off
  // there) can still matter. Switch the whole idle set off at once; rules on elements that change go back in.
  let idle = new Set([...cand.keys()].filter(idx => { const s = status.get(idx); return s && s.matched && !s.changed && !s.bad; }));
  for (let round = 1; round <= 5 && idle.size; round++) {
    const unsafe = new Set(); const vjobs = PAGES.flatMap(p => WIDTHS.map(w => ({ p, w }))); let vdone = 0;
    await Promise.all(tabs.map(async send => {
      while (vjobs.length) {
        const { p, w } = vjobs.shift();
        const ids = targets.filter(t => idle.has(t[0]) && PAGE_BLOCKS.get(p).has(t[3])).map(t => t[0]);
        if (!ids.length) continue;
        try {
          await send('Emulation.setDeviceMetricsOverride', { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 600 });
          await send('Page.navigate', { url: base + p }); await sleep(2500);
          await send('Runtime.evaluate', { awaitPromise: true, expression: `(async()=>{for(let y=0;y<Math.min(document.documentElement.scrollHeight,40000);y+=700){scrollTo(0,y);await new Promise(r=>setTimeout(r,40))}scrollTo(0,0);await new Promise(r=>setTimeout(r,600))})()` });
          const res = await send('Runtime.evaluate', { returnByValue: true, expression: `(${VERIFY})(${JSON.stringify(ids)})` });
          for (const id of (res.result && res.result.value) || []) unsafe.add(id);
        } catch (err) { console.log(`verify skipped ${p} @${w}: ${err.message}`); ids.forEach(id => unsafe.add(id)); send = await tab(); }
        if (++vdone % 50 === 0) console.log(`verify ${round}: ${vdone}`);
      }
    }));
    console.log(`verify round ${round}: ${unsafe.size} of ${idle.size} idle rules matter together, kept`);
    if (!unsafe.size) break;
    for (const id of unsafe) idle.delete(id);
  }
  for (const idx of cand.keys()) if (!idle.has(idx)) { const s = status.get(idx); if (s && s.matched && !s.changed && !s.bad) s.changed = 1; }
  chrome.kill(); server.close();
  const bad = [...status.values()].filter(s => s.bad).length;
  const noop = [...cand].filter(([idx]) => { const s = status.get(idx); return s && s.matched && !s.changed && !s.bad; })
    .map(([, r]) => ({ line: r.line, selector: r.selector, text: lines[r.line - 1] }));
  fs.mkdirSync('.regression', { recursive: true });
  fs.writeFileSync('.regression/css-noop.json', JSON.stringify({ blocks: BLOCKS, pages: PAGES.length, widths: WIDTHS, noop }, null, 1));
  console.log(`no effect: ${noop.length} rules (${bad} candidates could not be mapped or queried, kept)`);
  if (args.includes('--why')) for (const [idx, s] of status) if (s.bad) console.log(' ', s.why, cand.get(idx).line, cand.get(idx).selector.slice(0, 100));
  if (args.includes('--remove')) removeListed();
  process.exit(0);
})();

// deletes the listed rules from dist/css/root.css by their exact line text (the file may have moved on since the
// scan; a rule whose line changed is left alone)
function removeListed() {
  const { noop } = JSON.parse(fs.readFileSync('.regression/css-noop.json', 'utf8'));
  const cur = fs.readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n').split('\n');
  const want = new Map(); for (const r of noop) want.set(r.text, (want.get(r.text) || 0) + 1);
  let n = 0;
  const kept = cur.filter(l => { if (want.get(l)) { want.set(l, want.get(l) - 1); n++; return false; } return true; });
  let next = kept.join('\n');
  for (let k = 0; k < 3; k++) next = next.replace(/^(\s*)@media[^{\n]*\{\n\s*\}\n/gm, '');
  fs.writeFileSync(FILE, next);
  console.log(`removed ${n} of ${noop.length} rules; root.css ${cur.length} -> ${next.split('\n').length} lines`);
}
if (args.includes('--remove-only')) { removeListed(); process.exit(0); }
