// Headless Chromium smoke test: prints console output, errors and loaded assets, saves a screenshot.
// Usage (inside `nix develop`, with `npm start` running): node scripts/smoke.mjs http://localhost:8080/ shot.png [waitMs]
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [url, shot, waitMs = '20000'] = process.argv.slice(2);
const port = 9333;
const profile = mkdtempSync(join(process.env.TMPDIR || tmpdir(), 'chr-'));
const chrome = spawn('chromium', [
  '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--enable-unsafe-swiftshader', '--use-angle=swiftshader',
  '--window-size=1400,900', 'about:blank',
], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    target = list.find(t => t.type === 'page');
  } catch { }
  if (!target) await sleep(200);
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pending = new Map();
const send = (method, params = {}) => new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
ws.addEventListener('message', ev => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result ?? m); pending.delete(m.id); return; }
  if (m.method === 'Runtime.consoleAPICalled') {
    console.log(`[console.${m.params.type}]`, m.params.args.map(a => a.value ?? a.description ?? '').join(' ').slice(0, 300));
  } else if (m.method === 'Runtime.exceptionThrown') {
    console.log('[exception]', m.params.exceptionDetails.exception?.description?.slice(0, 500) ?? m.params.exceptionDetails.text);
  } else if (m.method === 'Network.loadingFailed') {
    console.log('[net-fail]', m.params.errorText);
  } else if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) {
    console.log('[http', m.params.response.status + ']', m.params.response.url);
  }
});
await send('Runtime.enable'); await send('Network.enable'); await send('Page.enable');
await send('Page.navigate', { url });
await sleep(Number(waitMs));
const probe = await send('Runtime.evaluate', {
  returnByValue: true, expression: `JSON.stringify({
    resources: performance.getEntriesByType('resource').map(e => e.name.split('/').pop()).filter(n => /glb|wasm|inspector|vendors/i.test(n)),
    canvas: !!document.getElementById('renderCanvas'),
    bodyText: document.body.innerText.slice(0, 400),
  })`,
});
console.log('[probe]', probe.result?.value);
const { data } = await send('Page.captureScreenshot', { format: 'png' });
writeFileSync(shot, Buffer.from(data, 'base64'));
ws.close(); chrome.kill();
