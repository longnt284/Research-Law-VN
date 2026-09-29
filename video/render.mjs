// Render the canvas scene frame-by-frame with headless Chromium, encode with ffmpeg.
// Usage:
//   node render.mjs stills 1.2 3.4 ...   -> out/stills/*.jpg (seconds)
//   node render.mjs video [workers]      -> out/video_silent.mp4
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { spawn, execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('/opt/node22/lib/node_modules/playwright')); }

const DIR = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(DIR, 'out');
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.ttf': 'font/ttf', '.json': 'application/json' };

function serve() {
  const srv = createServer(async (req, res) => {
    try {
      const p = path.join(DIR, decodeURIComponent(new URL(req.url, 'http://x').pathname));
      if (!p.startsWith(DIR)) throw new Error('bad path');
      const body = await readFile(p);
      res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' });
      res.end(body);
    } catch { res.writeHead(404); res.end(); }
  });
  return new Promise(r => srv.listen(0, () => r(srv)));
}

async function openPage(browser, port) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('pageerror', e));
  await page.goto(`http://localhost:${port}/index.html`);
  await page.evaluate(() => window.ready);
  return page;
}

async function grab(page, t) {
  await page.evaluate(tt => window.renderFrame(tt), t);
  return page.screenshot({ type: 'jpeg', quality: 98 });
}

const [, , mode = 'stills', ...args] = process.argv;
await mkdir(OUT, { recursive: true });
const srv = await serve();
const port = srv.address().port;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

if (mode === 'stills') {
  const dir = path.join(OUT, 'stills');
  await mkdir(dir, { recursive: true });
  const page = await openPage(browser, port);
  for (const a of args) {
    const buf = await grab(page, parseFloat(a));
    await writeFile(path.join(dir, `t${parseFloat(a).toFixed(2).padStart(6, '0')}.jpg`), buf);
  }
  console.log('stills done');
} else {
  const workers = parseInt(args[0] || '4', 10);
  const page0 = await openPage(browser, port);
  const { dur, fps } = await page0.evaluate(() => ({ dur: window.DURATION, fps: window.FPS }));
  await page0.close();
  const total = Math.round(dur * fps);
  const per = Math.ceil(total / workers);
  const t0 = Date.now();
  let done = 0;
  const segs = [];
  await Promise.all(Array.from({ length: workers }, async (_, w) => {
    const from = w * per, to = Math.min(total, from + per);
    const seg = path.join(OUT, `seg${w}.mp4`); segs.push([w, seg]);
    const page = await openPage(browser, port);
    const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p', '-tune', 'animation', seg], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = from; f < to; f++) {
      const buf = await grab(page, f / fps);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (++done % 60 === 0) console.log(`${done}/${total} frames  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    await page.close();
  }));
  segs.sort((a, b) => a[0] - b[0]);
  const list = path.join(OUT, 'segs.txt');
  await writeFile(list, segs.map(([, s]) => `file '${s}'`).join('\n'));
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', path.join(OUT, 'video_silent.mp4')]);
  for (const [, s] of segs) await rm(s);
  await rm(list);
  console.log(`video done: ${total} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close();
srv.close();
