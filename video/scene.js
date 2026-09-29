/* Luật × Code × Tiền — deterministic motion-graphics scene.
 * Every frame is a pure function of time t (seconds), so frames can be
 * rendered in any order and in parallel. Time is mostly expressed in beats
 * (128 BPM) so picture and the synthesized soundtrack stay locked. */

const W = 1080, H = 1920;
const BPM = 128, B = 60 / BPM;
const TOTAL_BEATS = 72;
const DURATION = TOTAL_BEATS * B;

const C = {
  ink: '#06060B', paper: '#F3F1EA', lime: '#D4FF3A', violet: '#7B5CFF',
  gold: '#FFC23D', red: '#FF3D5A', cyan: '#3DF2FF', dim: '#1A1A24',
};

// Shared with the audio generator via events.json (same numbers).
const IMPACTS = [
  [4, 1], [6, .8], [13, .7], [16, .4], [20, .6], [23, .35], [26, .35], [29, .35],
  [32, .8], [36, .8], [40, .5], [44, .7], [46, .8], [54, .6], [62, 1], [62.5, .7], [63, 1],
];
const TYPE_STR = '> law.compile()';
const TYPE_T0 = .3, TYPE_DT = .14;

const cv = document.getElementById('c');
const ctx = cv.getContext('2d');

// ---------- math ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (x, a, b) => clamp((x - a) / (b - a));
const E = {
  outExpo: t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t),
  inExpo: t => t <= 0 ? 0 : Math.pow(2, 10 * t - 10),
  inOutExpo: t => t <= 0 ? 0 : t >= 1 ? 1 : t < .5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  outCubic: t => 1 - Math.pow(1 - t, 3),
  inCubic: t => t * t * t,
  inOutCubic: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  outBack: t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outElastic: t => t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI / 3)) + 1,
  outBounce: t => {
    const n = 7.5625, d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + .75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + .9375;
    return n * (t -= 2.625 / d) * t + .984375;
  },
};
function rng(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const hash = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };

function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }

// ---------- drawing helpers ----------
function font(w, s, f = 'BVP') { return `${w} ${s}px ${f}`; }
function T(s, x, y, o = {}) {
  const c = o.ctx || ctx;
  c.save();
  c.font = font(o.w || 900, o.s || 100, o.f || 'BVP');
  c.textAlign = o.a || 'center';
  c.textBaseline = o.bl || 'middle';
  c.letterSpacing = (o.ls || 0) + 'px';
  c.globalAlpha *= (o.al ?? 1);
  if (o.stroke) { c.lineWidth = o.lw || 3; c.strokeStyle = o.stroke; c.lineJoin = 'round'; c.strokeText(s, x, y); }
  if (!o.noFill) { c.fillStyle = o.c || C.paper; c.fillText(s, x, y); }
  c.restore();
}
// Text with chromatic split copies behind it.
function TR(s, x, y, o, d) {
  if (d > .3) {
    T(s, x - d, y, { ...o, c: C.red, al: (o.al ?? 1) * .85 });
    T(s, x + d, y, { ...o, c: C.cyan, al: (o.al ?? 1) * .85 });
  }
  T(s, x, y, o);
}
function measure(s, w, size, f = 'BVP', ls = 0) {
  ctx.save(); ctx.font = font(w, size, f); ctx.letterSpacing = ls + 'px';
  const m = ctx.measureText(s).width; ctx.restore(); return m;
}
function fitSize(s, w, size, maxW, f = 'BVP', ls = 0) {
  const m = measure(s, w, size, f, ls); return m > maxW ? size * maxW / m : size;
}
function bg(col) { ctx.fillStyle = col; ctx.fillRect(-200, -200, W + 400, H + 400); }
function rr(c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function glow(col, blur) { ctx.shadowColor = col; ctx.shadowBlur = blur; }
function noGlow() { ctx.shadowBlur = 0; ctx.shadowColor = 'transparent'; }

function ring(x, y, r, lw, col, al) {
  if (al <= 0) return;
  ctx.save(); ctx.globalAlpha = al; ctx.strokeStyle = col; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
}
// Shockwave + debris burst from (x, y) triggered at beat b0.
function burst(b, b0, x, y, col, seed, n = 46, spread = 1) {
  const lb = b - b0; if (lb < 0 || lb > 1.6) return;
  const p = lb / 1.6;
  ring(x, y, E.outExpo(p) * 760 * spread, 10 * (1 - p) + 1, col, (1 - p) * .9);
  ring(x, y, E.outExpo(prog(lb, .08, 1.6)) * 520 * spread, 3, C.paper, (1 - p) * .5);
  const R = rng(seed);
  ctx.save(); ctx.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const a = R() * Math.PI * 2, v = (300 + R() * 700) * spread, s = 3 + R() * 9;
    const d = v * E.outExpo(p) ;
    ctx.globalAlpha = (1 - p) * (.4 + R() * .6);
    ctx.save(); ctx.translate(x + Math.cos(a) * d, y + Math.sin(a) * d * 1.1); ctx.rotate(a + lb * 6);
    ctx.fillRect(-s / 2, -s / 2, s, s * (R() > .5 ? 3 : 1)); ctx.restore();
  }
  ctx.restore();
}
function dotGrid(al, off = 0, step = 60, col = '#ffffff') {
  if (al <= 0) return;
  ctx.save(); ctx.fillStyle = col; ctx.globalAlpha = al;
  const o = ((off % step) + step) % step;
  for (let y = -step + o; y < H + step; y += step) for (let x = 30; x < W; x += step) ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
  ctx.restore();
}
function scrambleText(final, b, b0, per, seed, charset = '0123456789') {
  let out = '';
  for (let i = 0; i < final.length; i++) {
    const ch = final[i];
    if (ch === ' ' || ch === '.' || ch === '/') { out += ch; continue; }
    if (b >= b0 + i * per) out += ch;
    else out += charset[Math.floor(hash(seed + i * 17 + Math.floor(b * 24)) * charset.length)];
  }
  return out;
}

// ---------- precomputed assets ----------
const [grainC, grainX] = mk(256, 256);
{
  const id = grainX.createImageData(256, 256), R = rng(99);
  for (let i = 0; i < id.data.length; i += 4) { const v = R() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  grainX.putImageData(id, 0, 0);
}
const [vigC, vigX] = mk(W, H);
{
  const g = vigX.createRadialGradient(W / 2, H / 2, H * .25, W / 2, H / 2, H * .75);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.72)');
  vigX.fillStyle = g; vigX.fillRect(0, 0, W, H);
}
const [tmpC, tmpX] = mk(W, H);
const [chR, chRX] = mk(W, H);
const [chB, chBX] = mk(W, H);

let TXT_PTS = [], SCALE_PTS = [], FP = [], CANDLES = [], NET = null;
const NP = 2600;

// Triad layout (scene 2 end state). Also used to sample dissolve points.
const TRIAD = [
  { s: 'LUẬT', y: 690, w: 900, size: 300, f: 'BVP', c: C.paper },
  { s: 'CODE', y: 990, w: 800, size: 250, f: 'JBM', c: C.lime },
  { s: 'TIỀN', y: 1290, w: 900, size: 300, f: 'BVP', c: C.gold },
];

function samplePoints(draw, n, seed, step = 4) {
  const [c, x] = mk(W, H); draw(x);
  const d = x.getImageData(0, 0, W, H).data, pts = [];
  for (let y = 0; y < H; y += step) for (let xx = 0; xx < W; xx += step) if (d[(y * W + xx) * 4 + 3] > 128) pts.push([xx, y]);
  const R = rng(seed), out = [];
  for (let i = 0; i < n; i++) { const p = pts[Math.floor(R() * pts.length)]; out.push([p[0] + (R() - .5) * step, p[1] + (R() - .5) * step]); }
  return out;
}

// Scales of justice geometry. theta = beam angle (rad, negative = left side down).
const PIV = { x: 540, y: 660 };
function scalesGeom(theta) {
  const L = 320;
  const lx = PIV.x - L * Math.cos(theta), ly = PIV.y - L * Math.sin(theta);
  const rx = PIV.x + L * Math.cos(theta), ry = PIV.y + L * Math.sin(theta);
  return { lx, ly, rx, ry, drop: 250 };
}
function drawScales(c, theta, col, lw, reveal = 1) {
  const g = scalesGeom(theta);
  c.save(); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = lw; c.lineCap = 'round'; c.lineJoin = 'round';
  const seg = (x1, y1, x2, y2, p) => { if (p <= 0) return; c.beginPath(); c.moveTo(x1, y1); c.lineTo(lerp(x1, x2, p), lerp(y1, y2, p)); c.stroke(); };
  // column + base
  seg(PIV.x, 620, PIV.x, 1180, prog(reveal, 0, .4));
  seg(PIV.x - 170, 1200, PIV.x + 170, 1200, prog(reveal, .3, .6));
  seg(PIV.x - 90, 1180, PIV.x + 90, 1180, prog(reveal, .3, .6));
  // beam
  const bp = prog(reveal, .2, .6);
  seg(PIV.x, PIV.y, g.lx, g.ly, bp); seg(PIV.x, PIV.y, g.rx, g.ry, bp);
  // strings + pans
  const pp = prog(reveal, .5, 1);
  for (const [ex, ey] of [[g.lx, g.ly], [g.rx, g.ry]]) {
    const py = ey + g.drop;
    seg(ex, ey, ex - 110, py, pp); seg(ex, ey, ex + 110, py, pp);
    if (pp > 0) { c.beginPath(); c.ellipse(ex, py, 120, 48, 0, 0, Math.PI * pp); c.stroke(); c.beginPath(); c.moveTo(ex - 120, py); c.lineTo(lerp(ex - 120, ex + 120, pp), py); c.stroke(); }
  }
  // pivot jewel
  if (reveal > .1) { c.beginPath(); c.arc(PIV.x, PIV.y, 26, 0, Math.PI * 2); c.fill(); c.beginPath(); c.arc(PIV.x, 600, 16, 0, Math.PI * 2); c.stroke(); }
  c.restore();
}

function buildAssets() {
  TXT_PTS = samplePoints(x => {
    for (const w of TRIAD) T(w.s, 540, w.y, { ctx: x, w: w.w, s: w.size, f: w.f, c: '#fff' });
  }, NP, 11, 5);
  SCALE_PTS = samplePoints(x => drawScales(x, 0, '#fff', 16), NP, 12, 3);

  // Fingerprint whorl made of dots.
  FP = [];
  for (let k = 1; k <= 24; k++) {
    const r = 10.5 * k + 8, n = Math.floor(2 * Math.PI * r / 8.5), ph = k * .37;
    for (let j = 0; j < n; j++) {
      const a = j / n * Math.PI * 2 + k * .21;
      if (hash(k * 131 + Math.floor(j / 6) * 7.3) > .88) continue;
      const q = r * (1 + .06 * Math.sin(2 * a + ph) + .03 * Math.sin(5 * a - k * .2));
      FP.push({ x: 540 + q * .8 * Math.cos(a), y: 860 + q * Math.sin(a) - (k > 16 ? (k - 16) * 3 : 0), r: q });
    }
  }

  // Candles: seeded upward random walk.
  const R = rng(21); let p = 0; const raw = [];
  for (let i = 0; i < 24; i++) {
    const o = p, c = p + (R() - .32) * 1.1 + (i > 17 ? .35 : 0);
    raw.push({ o, c, hi: Math.max(o, c) + R() * .5, lo: Math.min(o, c) - R() * .5 }); p = c;
  }
  const mn = Math.min(...raw.map(r => r.lo)), mx = Math.max(...raw.map(r => r.hi));
  const Y = v => lerp(1420, 720, (v - mn) / (mx - mn));
  CANDLES = raw.map((r, i) => ({ x: 120 + i * 36, o: Y(r.o), c: Y(r.c), hi: Y(r.hi), lo: Y(r.lo), up: r.c >= r.o }));

  // Neural net.
  const xs = [170, 410, 670, 910], ns = [4, 6, 6, 3], layers = [];
  xs.forEach((x, l) => { const arr = []; for (let i = 0; i < ns[l]; i++) arr.push({ x, y: 820 + (i - (ns[l] - 1) / 2) * 92 }); layers.push(arr); });
  const edges = [];
  for (let l = 0; l < 3; l++) for (const a of layers[l]) for (const b of layers[l + 1]) edges.push({ l, a, b, id: edges.length });
  NET = { layers, edges };
}

// ---------- camera shake / flash ----------
function shakeAt(b) {
  let s = 0;
  for (const [bi, amp] of IMPACTS) { const d = b - bi; if (d >= 0 && d < 1.2) s += amp * Math.exp(-d * 6); }
  return s;
}
function flashAt(b) {
  let f = 0;
  for (const [bi, amp] of IMPACTS) { const d = b - bi; if (d >= 0 && d < .4) f = Math.max(f, amp * .32 * (1 - d / .4)); }
  return f;
}

// ======================= SCENES =======================

// S1 — hook: typing a command, tension builds to the drop.
function S1(b) {
  bg(C.ink);
  dotGrid(.08 * prog(b, 0, 1), b * 20);
  ctx.save(); ctx.translate(540, 960); ctx.rotate(b * .12);
  T('§', 0, 40, { s: 1100, w: 900, noFill: true, stroke: C.violet, lw: 4, al: .16 * prog(b, 0, 1.2) });
  ctx.restore();
  const z = 1 + .14 * E.inCubic(prog(b, 0, 4));
  ctx.save(); ctx.translate(540, 960); ctx.scale(z, z); ctx.translate(-540, -960);
  const n = clamp(Math.floor((b - TYPE_T0) / TYPE_DT) + 1, 0, TYPE_STR.length);
  const g = prog(b, 2.7, 4);
  let s = TYPE_STR.slice(0, n);
  if (g > 0) s = s.split('').map((ch, i) => hash(i * 9 + Math.floor(b * 30)) < g * .5 ? '#%&@$01'[Math.floor(hash(i + b * 40) * 7)] : ch).join('');
  const blink = Math.floor(b * 2) % 2 === 0 || n < TYPE_STR.length;
  ctx.save(); ctx.font = font(700, 84, 'JBM'); const tw = ctx.measureText(TYPE_STR).width; ctx.restore();
  const x0 = 540 - tw / 2;
  TR(s, x0, 960, { f: 'JBM', w: 700, s: 84, c: C.lime, a: 'left' }, g * 14 + (hash(Math.floor(b * 20)) - .5) * g * 10);
  if (blink) { ctx.save(); ctx.font = font(700, 84, 'JBM'); const cw = ctx.measureText(s).width; ctx.fillStyle = C.lime; ctx.fillRect(x0 + cw + 6, 918, 46, 86); ctx.restore(); }
  T('// VIỆT NAM · 2026', 540, 840, { f: 'JBM', w: 500, s: 28, c: C.paper, al: .5 * prog(b, .2, .8), ls: 4 });
  // scanning line
  const sy = 960 + Math.sin(b * 3) * 120;
  ctx.fillStyle = C.lime; ctx.globalAlpha = .12 + g * .3; ctx.fillRect(0, sy, W, 2); ctx.globalAlpha = 1;
  ctx.restore();
  // pre-drop suck-in: bars converge
  const q = prog(b, 3.3, 4);
  if (q > 0) {
    ctx.fillStyle = C.ink; const hh = E.inExpo(q) * 960;
    ctx.fillRect(0, 0, W, hh); ctx.fillRect(0, H - hh, W, hh);
    ctx.fillStyle = C.lime; ctx.fillRect(0, hh - 3, W, 3); ctx.fillRect(0, H - hh, W, 3);
  }
}

// S2 — LUẬT × CODE × TIỀN kinetic slams.
function S2(b) {
  const strobe = b >= 8 && b < 9.75 ? Math.floor(b - 8) : -1; // one color change per beat
  const bgc = strobe === 0 ? C.lime : strobe === 1 ? C.violet : C.ink;
  bg(bgc);
  const inv = strobe >= 0;
  // speeding horizontal bars
  if (!inv) {
    const R = rng(5);
    for (let i = 0; i < 14; i++) {
      const y = R() * H, h = 2 + R() * 10, sp = (600 + R() * 1400) * (R() > .5 ? 1 : -1), len = 200 + R() * 500;
      const x = ((R() * 3000 + (b - 4) * B * sp) % 1800 + 1800) % 1800 - 400;
      ctx.fillStyle = [C.violet, C.lime, C.gold, C.dim][i % 4]; ctx.globalAlpha = .25;
      ctx.fillRect(x, y, len, h);
    }
    ctx.globalAlpha = 1;
    dotGrid(.07, (b - 4) * 40);
  }
  const float = k => Math.sin(b * 1.6 + k) * 8 * prog(b, 6.5, 7.5);
  const squash = strobe >= 0 ? 1 + .22 * Math.exp(-(b - 8 - strobe) * 7) : 1;
  const colFor = (w, i) => strobe === 0 ? C.ink : strobe === 1 ? [C.paper, C.lime, C.gold][i] : w.c;

  TRIAD.forEach((w, i) => {
    const b0 = 4 + i;
    if (b < b0) return;
    const lb = b - b0;
    ctx.save();
    ctx.translate(540, w.y + float(i));
    ctx.scale(squash, 1 / Math.sqrt(squash));
    const rgb = Math.max(0, 16 * (1 - lb / .5));
    if (i === 1) {
      // masked slide-up reveal
      ctx.beginPath(); ctx.rect(-540, -150, 1080, 300); ctx.clip();
      const dy = (1 - E.outExpo(prog(lb, 0, .45))) * 280;
      TR(w.s, 0, dy, { f: w.f, w: w.w, s: w.size, c: colFor(w, i), ls: 8 * E.outExpo(prog(lb, 0, 1)) }, rgb);
    } else {
      const p = E.outExpo(prog(lb, 0, .35));
      const s = lerp(2.6, 1, p);
      ctx.rotate(i === 2 ? lerp(-.14, 0, p) : 0);
      ctx.scale(s, s);
      TR(w.s, 0, 0, { f: w.f, w: w.w, s: w.size, c: colFor(w, i), al: prog(lb, 0, .06) }, rgb);
    }
    ctx.restore();
  });
  // rotating × connectors
  [[840, 5.5], [1140, 6.5]].forEach(([y, b0], k) => {
    if (b < b0) return;
    const p = E.outBack(prog(b, b0, b0 + .35));
    ctx.save(); ctx.translate(540, y); ctx.rotate((b - b0) * 1.4 + k); ctx.scale(p, p);
    T('×', 0, 8, { s: 140, w: 900, c: inv ? C.ink : C.violet });
    ctx.restore();
  });
  burst(b, 4, 540, 690, C.lime, 1);
  burst(b, 6, 540, 1290, C.gold, 2);
  // label chips
  if (b >= 6.5 && !inv) {
    const a = prog(b, 6.5, 7);
    T('PHÁP LÝ', 120, 520, { f: 'JBM', w: 600, s: 26, c: C.paper, a: 'left', al: a * .6, ls: 6 });
    T('CÔNG NGHỆ', 960, 820, { f: 'JBM', w: 600, s: 26, c: C.lime, a: 'right', al: a * .6, ls: 6 });
    T('TÀI CHÍNH', 120, 1460, { f: 'JBM', w: 600, s: 26, c: C.gold, a: 'left', al: a * .6, ls: 6 });
  }
}

// S3 — the words dissolve into particles that assemble the scales of justice.
function S3(b) {
  bg(C.ink);
  dotGrid(.06, b * 10);
  const theta = scalesTheta(b);
  if (b < 13) {
    // particles morph text -> scales
    const R = rng(3);
    for (let i = 0; i < NP; i++) {
      const a = TXT_PTS[i], t = SCALE_PTS[i];
      const d = R() * 1.1, sw = (R() - .5) * 900, sz = 3 + R() * 3;
      const e = E.inOutCubic(prog(b, 10 + d, 10 + d + 1.8));
      const bend = Math.sin(e * Math.PI);
      const x = lerp(a[0], t[0], e) + sw * bend;
      const y = lerp(a[1], t[1], e) + sw * .35 * bend + Math.sin(i + b * 3) * 10 * bend;
      const src = a[1] < 840 ? C.paper : a[1] < 1140 ? C.lime : C.gold;
      ctx.fillStyle = e < .5 ? src : (i % 5 === 0 ? C.violet : C.lime);
      ctx.fillRect(x - sz / 2, y - sz / 2, sz, sz);
    }
  } else {
    // crisp neon scales
    ctx.save(); glow(C.lime, 30);
    drawScales(ctx, theta, C.lime, 12, 1);
    ctx.restore();
    // particles explode away
    const p = prog(b, 13, 14.6);
    if (p < 1) {
      const R = rng(4);
      for (let i = 0; i < NP; i += 2) {
        const t = SCALE_PTS[i], a = R() * Math.PI * 2, v = 80 + R() * 520;
        ctx.globalAlpha = (1 - p) * .9; ctx.fillStyle = i % 3 ? C.lime : C.paper;
        const k = E.outExpo(p);
        ctx.fillRect(t[0] + Math.cos(a) * v * k, t[1] + Math.sin(a) * v * k + p * p * 200, 3, 3);
      }
      ctx.globalAlpha = 1;
    }
    const g = scalesGeom(theta);
    // coin drops into left pan
    if (b >= 14.3) {
      const e = E.outBounce(prog(b, 14.3, 15.2));
      const py = g.ly + g.drop - 58;
      const y = lerp(-200, py, e);
      ctx.save(); ctx.translate(g.lx, y); glow(C.gold, 30);
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(0, 0, 58, 0, Math.PI * 2); ctx.fill(); noGlow();
      ring(0, 0, 44, 4, C.ink, 1);
      T('₫', 0, 4, { s: 64, w: 900, c: C.ink });
      ctx.restore();
    }
    // code block drops into right pan
    if (b >= 15.6) {
      const e = E.outBounce(prog(b, 15.6, 16.4));
      const py = g.ry + g.drop - 56;
      const y = lerp(-200, py, e);
      ctx.save(); ctx.translate(g.rx, y); glow(C.violet, 30);
      ctx.fillStyle = C.violet; rr(ctx, -80, -50, 160, 100, 16); ctx.fill(); noGlow();
      T('</>', 0, 2, { f: 'JBM', s: 52, w: 800, c: C.paper });
      ctx.restore();
    }
    // headline
    const word = 'CÁN CÂN MỚI';
    for (let i = 0; i < word.length; i++) {
      const b0 = 17 + i * .07, lb = b - b0; if (lb < 0) continue;
      const p2 = E.outBack(prog(lb, 0, .35));
      const x = 540 + (i - (word.length - 1) / 2) * 78;
      ctx.save(); ctx.translate(x, 1420 + (1 - p2) * 90); ctx.globalAlpha = prog(lb, 0, .1);
      T(word[i], 0, 0, { s: 128, w: 900, c: C.paper });
      ctx.restore();
    }
    if (b >= 18) {
      const n = Math.floor(prog(b, 18, 18.9) * 29);
      T('LUẬT · CÔNG NGHỆ · TÀI CHÍNH'.slice(0, n), 540, 1540, { f: 'JBM', s: 34, w: 600, c: C.lime, ls: 3 });
    }
    // zoom into the pivot jewel (transition)
    const zq = E.inExpo(prog(b, 19.1, 20));
    if (zq > 0) {
      ctx.save(); ctx.fillStyle = C.lime;
      ctx.beginPath(); ctx.arc(PIV.x, PIV.y, 26 + zq * 2300, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }
  burst(b, 13, PIV.x, 900, C.lime, 7, 60);
}
function scalesTheta(b) {
  if (b < 14.9) return 0;
  if (b < 16.2) return -.2 * E.outElastic(prog(b, 14.9, 16.2));
  return -.2 * (1 - E.outElastic(prog(b, 16.2, 17.8)));
}

// S4 — vertical timeline of four legal milestones.
const CARDS = [
  { date: '09.09.2025', badge: 'NQ 05/2025/NQ-CP', title: ['Thí điểm thị trường', 'tài sản mã hóa'], d1: 'Thời hạn thí điểm: 5 năm', col: C.gold },
  { date: '01.01.2026', badge: 'LUẬT 71/2025/QH15', title: ['Luật Công nghiệp', 'công nghệ số'], d1: 'Khung pháp lý cho tài sản số', col: C.lime },
  { date: '01.01.2026', badge: 'LUẬT 91/2025/QH15', title: ['Luật Bảo vệ', 'dữ liệu cá nhân'], d1: 'Cấm mua, bán dữ liệu cá nhân', d2: '(trừ trường hợp luật có quy định khác)', col: C.cyan },
  { date: '01.03.2026', badge: 'LUẬT 134/2025/QH15', title: ['Luật', 'Trí tuệ nhân tạo'], d1: 'Quản lý AI theo mức độ rủi ro', col: C.violet },
];
const SPX = 120, CARD_Y = 700, CARD_K = 1.12;
function S4(b) {
  bg(C.ink);
  const camAt = i => i * 1000;
  let cam = 0;
  for (let i = 1; i < 4; i++) cam = lerp(cam, camAt(i), E.inOutExpo(prog(b, 20 + 3 * i - .55, 20 + 3 * i + .05)));
  const exit = E.inExpo(prog(b, 31.3, 32));
  cam += exit * 1800;
  dotGrid(.07, -cam * .5);
  // ghost numerals (parallax)
  for (let i = 0; i < 4; i++) {
    const y = CARD_Y + i * 1000 - cam * .75 + 1000;
    T('0' + (i + 1), 1050, y, { s: 560, w: 900, a: 'right', noFill: true, stroke: CARDS[i].col, lw: 3, al: .22 * prog(b, 20 + 3 * i, 20 + 3 * i + .5) });
  }
  ctx.save(); ctx.translate(0, -cam);
  // spine
  const lineEnd = CARD_Y + Math.min(3, (b - 20) / 3) * 1000 + 760;
  ctx.fillStyle = C.lime; glow(C.lime, 20);
  ctx.fillRect(SPX - 3, -2000, 6, lineEnd + 2000); noGlow();
  for (let i = 0; i < 4; i++) card(i, b - (20 + 3 * i), CARD_Y + i * 1000);
  ctx.restore();
  // speed lines on exit
  if (exit > 0) {
    const R = rng(8); ctx.fillStyle = C.paper;
    for (let i = 0; i < 40; i++) { ctx.globalAlpha = exit * .5 * R(); ctx.fillRect(R() * W, R() * H, 3, 200 + exit * 900 * R()); }
    ctx.globalAlpha = 1;
  }
  // header (fixed, opaque with soft edge)
  const idx = clamp(Math.floor((b - 20) / 3), 0, 3);
  ctx.fillStyle = C.ink; ctx.fillRect(0, 0, W, 430);
  const hg = ctx.createLinearGradient(0, 430, 0, 520); hg.addColorStop(0, C.ink); hg.addColorStop(1, 'rgba(6,6,11,0)');
  ctx.fillStyle = hg; ctx.fillRect(0, 430, W, 90);
  T('// CỘT MỐC PHÁP LÝ SỐ', 90, 300, { f: 'JBM', s: 36, w: 700, c: C.lime, a: 'left', ls: 3 });
  T(`0${idx + 1}`, 990, 296, { f: 'JBM', s: 64, w: 800, c: C.paper, a: 'right' });
  T('/04', 990, 350, { f: 'JBM', s: 26, w: 500, c: C.paper, a: 'right', al: .5 });
  ctx.fillStyle = C.paper; ctx.globalAlpha = .2; ctx.fillRect(90, 395, 900, 2); ctx.globalAlpha = 1;
  ctx.fillStyle = C.lime; ctx.fillRect(90, 395, 900 * clamp((b - 20) / 12), 2);
  // opening match-cut: lime screen collapses into the spine
  const q = E.inOutExpo(prog(b, 20, 20.5));
  if (q < 1) {
    ctx.fillStyle = C.lime;
    const x0 = lerp(0, SPX - 3, q), x1 = lerp(W, SPX + 3, q);
    ctx.fillRect(x0, 0, x1 - x0, H);
  }
}
// Card drawn in local coordinates: origin on the spine at the card top.
function card(i, lb, y) {
  if (lb < 0) return;
  const cd = CARDS[i];
  ctx.save(); ctx.translate(SPX, y); ctx.scale(CARD_K, CARD_K);
  // node
  const np = E.outBack(prog(lb, 0, .3));
  ctx.save(); ctx.translate(0, 60); ctx.scale(np, np);
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill();
  ring(0, 0, 22, 6, cd.col, 1); ctx.fillStyle = cd.col; ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ring(0, 60, 22 + E.outExpo(prog(lb, 0, 1)) * 140, 3, cd.col, 1 - prog(lb, 0, 1));
  // connector + panel wipe
  const cp = E.outExpo(prog(lb, .05, .3));
  ctx.fillStyle = cd.col; ctx.fillRect(22, 58, 28 * cp, 4);
  const PX = 50, PW = 760;
  const pw = PW * E.outExpo(prog(lb, .12, .5)), ph = cd.d2 ? 600 : 550;
  ctx.beginPath(); ctx.rect(PX, -20, pw, ph + 40); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,.045)';
  ctx.beginPath(); ctx.moveTo(PX, 0); ctx.lineTo(PX + PW - 40, 0); ctx.lineTo(PX + PW, 40); ctx.lineTo(PX + PW, ph); ctx.lineTo(PX, ph); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = cd.col; ctx.lineWidth = 2; ctx.globalAlpha = .6; ctx.stroke(); ctx.globalAlpha = 1;
  ctx.fillStyle = cd.col; ctx.fillRect(PX, 0, 8, ph);
  const X = PX + 46;
  T('HIỆU LỰC', X, 60, { f: 'JBM', s: 28, w: 700, c: cd.col, a: 'left', ls: 6, al: prog(lb, .15, .3) });
  T(scrambleText(cd.date, lb, .2, .05, i * 100), X, 150, { f: 'JBM', s: 104, w: 800, c: C.paper, a: 'left', al: prog(lb, .15, .25) });
  const bp = E.outBack(prog(lb, .5, .8));
  if (bp > 0) {
    ctx.save(); ctx.translate(X, 250); ctx.scale(bp, bp);
    const bw = measure(cd.badge, 700, 34, 'JBM', 1) + 44;
    ctx.fillStyle = cd.col; rr(ctx, 0, -32, bw, 64, 10); ctx.fill();
    T(cd.badge, 22, 1, { f: 'JBM', s: 34, w: 700, c: C.ink, a: 'left', ls: 1 });
    ctx.restore();
  }
  cd.title.forEach((line, k) => {
    const lp = E.outExpo(prog(lb, .7 + k * .15, 1.2 + k * .15));
    const ly = 355 + k * 78;
    ctx.save(); ctx.beginPath(); ctx.rect(X - 10, ly - 44, 740, 90); ctx.clip();
    T(line, X, ly + (1 - lp) * 90, { s: 66, w: 800, c: C.paper, a: 'left' });
    ctx.restore();
  });
  const dp = E.outCubic(prog(lb, 1.2, 1.6));
  T(cd.d1, X + (1 - dp) * 40, 500, { s: 38, w: 500, c: C.paper, a: 'left', al: dp * .8 });
  if (cd.d2) T(cd.d2, X + (1 - dp) * 40, 552, { s: 28, w: 500, c: C.paper, a: 'left', al: dp * .55 });
  ctx.restore();
}

// S5 — candles become blocks: finance goes on-chain.
const BLOCKS = [780, 1080, 1380];
function S5(b) {
  bg(C.ink);
  // grid
  ctx.save(); ctx.strokeStyle = C.paper; ctx.globalAlpha = .07; ctx.lineWidth = 1;
  for (let y = 700; y <= 1400; y += 70) { ctx.beginPath(); ctx.moveTo(90, y); ctx.lineTo(990, y); ctx.stroke(); }
  ctx.restore();
  const morph = prog(b, 34.5, 35.6);
  const merge = prog(b, 35.6, 36);
  // headline (exits at 35.5)
  const hx = E.inExpo(prog(b, 35.2, 35.7));
  if (hx < 1) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, 250, W, 330); ctx.clip();
    const hp = E.outExpo(prog(b, 32, 32.4));
    T('TIỀN ĐANG', 540, 350 + (1 - hp) * 140 - hx * 330, { s: 132, w: 900, c: C.paper });
    T('SỐ HÓA', 540, 485 + (1 - E.outExpo(prog(b, 32.25, 32.7))) * 140 - hx * 330, { s: 132, w: 900, c: C.gold });
    ctx.restore();
  }
  // candles
  if (merge < 1) {
    const visible = CANDLES.length * prog(b, 32.1, 34.5);
    const pts = [];
    CANDLES.forEach((cd, i) => {
      const cp = E.outBack(prog(visible - i, 0, 1));
      if (cp <= 0) return;
      const top = Math.min(cd.o, cd.c), bh = Math.max(6, Math.abs(cd.o - cd.c));
      const col = cd.up ? C.gold : C.violet;
      const g = i % 3, slot = Math.floor(i / 3), gx = slot % 4, gy = Math.floor(slot / 4);
      const tx = 540 - 164 + gx * 88, ty = BLOCKS[g] - 76 + gy * 88;
      const m = E.inOutExpo(clamp(morph * 1.25 - (i / 24) * .25));
      const x = lerp(cd.x - 13, tx, m), y = lerp(top + bh / 2 * (1 - cp), ty, m);
      const w = lerp(26, 64, m), h = lerp(bh * cp, 64, m);
      const mw = E.outExpo(merge);
      const fx = lerp(x, 540 - 300, mw), fy = lerp(y, BLOCKS[g] - 115, mw), fw = lerp(w, 600, mw), fh = lerp(h, 230, mw);
      ctx.globalAlpha = 1 - merge * .8;
      if (m < .05) { ctx.fillStyle = col; ctx.fillRect(cd.x - 1.5, cd.hi, 3, (cd.lo - cd.hi) * cp); }
      ctx.fillStyle = col; ctx.fillRect(fx, fy, fw, fh);
      ctx.globalAlpha = 1;
      pts.push([cd.x, cd.c]);
    });
    // price line
    if (morph < 1 && pts.length > 1) {
      ctx.save(); ctx.globalAlpha = 1 - morph; glow(C.gold, 18); ctx.strokeStyle = C.paper; ctx.lineWidth = 4; ctx.lineJoin = 'round';
      ctx.beginPath(); pts.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
      const lp = pts[pts.length - 1]; ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(lp[0], lp[1], 10, 0, Math.PI * 2); ctx.fill();
      ring(lp[0], lp[1], 10 + (b * 2 % 1) * 40, 3, C.gold, 1 - (b * 2 % 1));
      ctx.restore();
    }
  }
  // top-right block counter
  const cnt = Math.floor(lerp(1, 1026, E.outCubic(prog(b, 32, 36))));
  T('BLOCK #' + String(cnt).padStart(6, '0'), 990, 620, { f: 'JBM', s: 28, w: 600, c: C.gold, a: 'right', al: .8 });
  T('// FINANCE.ON_CHAIN', 90, 620, { f: 'JBM', s: 28, w: 600, c: C.paper, a: 'left', al: .5 });

  // blocks
  if (b >= 36) {
    const fly = E.inExpo(prog(b, 39.3, 40));
    BLOCKS.forEach((cy, g) => {
      const fl = 1 + fly * (3 + g);
      const oy = (cy - 960) * fly * (1.5 + g * .5);
      ctx.save(); ctx.translate(540, cy + Math.sin(b * 2 + g) * 6 + oy); ctx.scale(fl, fl); ctx.globalAlpha = 1 - fly * .6;
      const ok = b >= 37 + g * .5;
      const bc = ok ? C.lime : C.gold;
      ctx.fillStyle = '#0E0E16'; rr(ctx, -300, -115, 600, 230, 18); ctx.fill();
      glow(bc, 24); ctx.strokeStyle = bc; ctx.lineWidth = 4; rr(ctx, -300, -115, 600, 230, 18); ctx.stroke(); noGlow();
      T('BLOCK #' + (1024 + g), -260, -62, { f: 'JBM', s: 32, w: 800, c: bc, a: 'left' });
      const hsh = '0x' + ['9f3a7c1e2b84', '4d0e88a1f7c2', 'b71c05e9d3a6'][g];
      T(scrambleText(hsh, b, 36.4 + g * .3, .05, g * 50, '0123456789abcdef'), -260, 0, { f: 'JBM', s: 48, w: 700, c: C.paper, a: 'left' });
      T('prev ' + (g ? ['9f3a7c1e…', '4d0e88a1…'][g - 1] : '00000000…'), -260, 60, { f: 'JBM', s: 26, w: 500, c: C.paper, a: 'left', al: .5 });
      if (ok) {
        const cp = E.outBack(prog(b, 37 + g * .5, 37.3 + g * .5));
        ctx.save(); ctx.translate(250, -62); ctx.scale(cp, cp);
        ctx.fillStyle = C.lime; ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-3, 8); ctx.lineTo(11, -8); ctx.stroke();
        ctx.restore();
      }
      // chain link to next block
      if (g < 2) {
        const lp = E.outBack(prog(b, 36.2 + g * .25, 36.6 + g * .25));
        ctx.save(); ctx.translate(0, 150); ctx.scale(lp, lp); ctx.strokeStyle = C.paper; ctx.lineWidth = 6;
        rr(ctx, -20, -44, 40, 56, 20); ctx.stroke(); rr(ctx, -20, -12, 40, 56, 20); ctx.stroke(); ctx.restore();
      }
      ctx.restore();
    });
    // title
    const tp = E.outExpo(prog(b, 36, 36.35));
    ctx.save(); ctx.translate(540, 400); ctx.scale(lerp(2.2, 1, tp), lerp(2.2, 1, tp)); ctx.globalAlpha = prog(b, 36, 36.05) * (1 - fly);
    TR('TÀI SẢN SỐ', 0, 0, { s: 150, w: 900, c: C.gold }, 14 * (1 - prog(b, 36, 36.5)));
    ctx.restore();
    const n = Math.floor(prog(b, 36.8, 37.8) * 24);
    T('// đã có khung pháp lý'.slice(0, n), 540, 510, { f: 'JBM', s: 36, w: 600, c: C.lime, al: 1 - fly });
  }
  burst(b, 36, 540, 1080, C.gold, 9, 50);
  const wf = prog(b, 39.7, 40);
  if (wf > 0) { ctx.fillStyle = C.paper; ctx.globalAlpha = E.inCubic(wf); ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}

// S6 — personal data: fingerprint scan, encrypt, lock.
const FIELDS = ['HỌ TÊN', 'SỐ ĐỊNH DANH', 'SỐ ĐIỆN THOẠI', 'VỊ TRÍ'];
function S6(b) {
  bg(C.ink);
  dotGrid(.05, b * 8);
  const scanY = lerp(540, 1180, E.inOutCubic(prog(b, 40.8, 42.8)));
  const scanning = b >= 40.8 && b < 43;
  const lockOn = prog(b, 43, 43.3);
  const scatter = E.inExpo(prog(b, 45.4, 46));
  for (let i = 0; i < FP.length; i++) {
    const d = FP[i];
    const ap = prog(b, 40 + d.r / 270 * .8, 40.2 + d.r / 270 * .8);
    if (ap <= 0) continue;
    const lit = b >= 43 || d.y < scanY;
    const near = Math.abs(d.y - scanY) < 26 && scanning;
    ctx.fillStyle = near ? C.paper : lit ? C.lime : C.violet;
    ctx.globalAlpha = ap * (lit ? .95 : .45) * (1 - lockOn * .6) * (1 - scatter);
    const s = near ? 6 : 4;
    const a = hash(i) * Math.PI * 2, sd = scatter * (300 + hash(i + 3) * 900);
    ctx.fillRect(d.x - s / 2 + Math.cos(a) * sd, d.y - s / 2 + Math.sin(a) * sd, s, s);
  }
  ctx.globalAlpha = 1;
  if (scanning) {
    ctx.save(); glow(C.lime, 30); ctx.fillStyle = C.lime; ctx.fillRect(160, scanY - 2, 760, 4); ctx.restore();
    const g = ctx.createLinearGradient(0, scanY - 160, 0, scanY);
    g.addColorStop(0, 'rgba(212,255,58,0)'); g.addColorStop(1, 'rgba(212,255,58,.14)');
    ctx.fillStyle = g; ctx.fillRect(160, scanY - 160, 760, 160);
  }
  // corner brackets around fingerprint
  const bp = E.outExpo(prog(b, 40, 40.5));
  ctx.save(); ctx.strokeStyle = C.paper; ctx.lineWidth = 5; ctx.globalAlpha = .8 * (1 - scatter);
  const bx = 250 * lerp(1.4, 1, bp), by = 330 * lerp(1.4, 1, bp);
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    ctx.beginPath(); ctx.moveTo(540 + sx * bx, 860 + sy * (by - 60)); ctx.lineTo(540 + sx * bx, 860 + sy * by); ctx.lineTo(540 + sx * (bx - 60), 860 + sy * by); ctx.stroke();
  }
  ctx.restore();
  // padlock
  if (b >= 43) {
    const lp = E.outBack(prog(b, 43, 43.35));
    const sh = 70 * (1 - E.outExpo(prog(b, 43.9, 44.05)));
    ctx.save(); ctx.translate(540, 900); ctx.scale(lp, lp); ctx.globalAlpha = 1 - scatter;
    ctx.strokeStyle = C.paper; ctx.lineWidth = 26; ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.moveTo(-90, -40 - sh); ctx.lineTo(-90, -140 - sh); ctx.arc(0, -140 - sh, 90, Math.PI, 0); ctx.lineTo(90, -40 - sh + (sh > 1 ? -40 : 0)); ctx.stroke();
    const closed = b >= 44;
    glow(closed ? C.lime : C.paper, closed ? 40 : 0);
    ctx.fillStyle = closed ? C.lime : C.paper; rr(ctx, -150, -60, 300, 230, 30); ctx.fill(); noGlow();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(0, 30, 26, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-12, 40); ctx.lineTo(12, 40); ctx.lineTo(18, 105); ctx.lineTo(-18, 105); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // data fields
  FIELDS.forEach((f, k) => {
    const y = 1330 + k * 84, b0 = 41.6 + k * .2;
    if (b < b0) return;
    const p = E.outExpo(prog(b, b0, b0 + .4));
    ctx.save(); ctx.globalAlpha = p * (1 - scatter); ctx.translate((1 - p) * -80, 0);
    T(f, 110, y, { f: 'JBM', s: 26, w: 700, c: C.violet, a: 'left', ls: 2 });
    const enc = b >= 43.6 + k * .1;
    let v;
    if (enc) v = '█'.repeat(12);
    else v = Array.from({ length: 12 }, (_, j) => 'ABCDEFGHKLMNPQRSTUVXY0123456789'[Math.floor(hash(k * 40 + j + Math.floor(b * 18)) * 31)]).join('');
    T(v, 470, y, { f: 'JBM', s: enc ? 30 : 40, w: 700, c: enc ? C.lime : C.paper, a: 'left', al: enc ? 1 : .75 });
    ctx.fillStyle = C.paper; ctx.globalAlpha *= .15; ctx.fillRect(110, y + 38, 860, 2);
    ctx.restore();
  });
  // headline
  if (b >= 44) {
    const tp = E.outExpo(prog(b, 44, 44.35));
    ctx.save(); ctx.translate(540, 360); ctx.scale(lerp(2, 1, tp), lerp(2, 1, tp)); ctx.globalAlpha = (1 - scatter);
    TR('DỮ LIỆU CÁ NHÂN', 0, 0, { s: fitSize('DỮ LIỆU CÁ NHÂN', 900, 118, 960), w: 900, c: C.paper }, 12 * (1 - prog(b, 44, 44.5)));
    ctx.restore();
    const wp = E.outExpo(prog(b, 44.5, 44.85));
    ctx.save(); ctx.globalAlpha = 1 - scatter;
    const tw = measure('KHÔNG ĐỂ MUA BÁN', 800, 64) + 60;
    ctx.fillStyle = C.red; ctx.fillRect(540 - tw / 2, 440, tw * wp, 96);
    ctx.beginPath(); ctx.rect(540 - tw / 2, 440, tw * wp, 96); ctx.clip();
    T('KHÔNG ĐỂ MUA BÁN', 540, 490, { s: 64, w: 800, c: C.ink });
    ctx.restore();
  } else {
    T('// XÁC THỰC SINH TRẮC', 540, 380, { f: 'JBM', s: 32, w: 700, c: C.lime, ls: 3, al: prog(b, 40.2, 40.6) });
  }
  burst(b, 44, 540, 900, C.lime, 13, 50);
  // white flash entry from S5
  const wf = 1 - prog(b, 40, 40.25);
  if (wf > 0) { ctx.fillStyle = C.paper; ctx.globalAlpha = wf; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}

// S7 — AI: neural network + principle of the AI Law, kinetic.
function S7(b) {
  bg(C.ink);
  const cx = 540, cy = 820;
  const collapse = E.inExpo(prog(b, 53.4, 54));
  // radar rings
  ctx.save(); ctx.translate(cx, cy);
  [300, 420, 540].forEach((r, k) => {
    ctx.save(); ctx.rotate(b * (k % 2 ? -.25 : .18)); ctx.setLineDash([18, 22]); ctx.strokeStyle = k === 1 ? C.violet : C.paper;
    ctx.globalAlpha = .16 * prog(b, 46, 46.8); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, r * (1 - collapse), 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  });
  ctx.restore();
  const P = n => ({ x: lerp(n.x, cx, collapse), y: lerp(n.y, cy, collapse) });
  // edges draw-on
  ctx.save(); ctx.lineWidth = 2;
  for (const e of NET.edges) {
    const p = E.outCubic(prog(b, 46.1 + e.l * .4, 46.8 + e.l * .4));
    if (p <= 0) continue;
    const a = P(e.a), c = P(e.b);
    ctx.strokeStyle = C.violet; ctx.globalAlpha = .35;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(lerp(a.x, c.x, p), lerp(a.y, c.y, p)); ctx.stroke();
  }
  ctx.restore();
  // pulses
  ctx.save(); glow(C.lime, 16); ctx.fillStyle = C.lime;
  const heat = new Map();
  for (let j = 0; j < 14; j++) {
    const L = 47.5 + j * .5;
    for (const e of NET.edges) {
      if (hash(e.id * 7.1 + j * 3.3) < .72) continue;
      const t0 = L + e.l * .45, p = prog(b, t0, t0 + .45);
      if (p <= 0 || p >= 1) { if (p >= 1 && b - (t0 + .45) < .3) heat.set(e.b, Math.max(heat.get(e.b) || 0, 1 - (b - t0 - .45) / .3)); continue; }
      const a = P(e.a), c = P(e.b), q = E.inOutCubic(p);
      ctx.beginPath(); ctx.arc(lerp(a.x, c.x, q), lerp(a.y, c.y, q), 6, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
  // nodes
  NET.layers.forEach((layer, l) => layer.forEach((n, k) => {
    const p = E.outBack(prog(b, 46 + l * .4 + k * .04, 46.3 + l * .4 + k * .04));
    if (p <= 0) return;
    const q = P(n), h = heat.get(n) || 0;
    ctx.save(); ctx.translate(q.x, q.y); ctx.scale(p, p);
    if (h > 0) { glow(C.lime, 40 * h); }
    ctx.fillStyle = h > .1 ? C.lime : C.ink; ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill(); noGlow();
    ring(0, 0, 20, 4, l === 3 ? C.lime : C.paper, 1);
    ctx.restore();
  }));
  // "AI" outline title with fill wipe
  const ap = E.outExpo(prog(b, 46, 46.4));
  ctx.save(); ctx.translate(540, 330); ctx.scale(lerp(1.8, 1, ap), lerp(1.8, 1, ap)); ctx.globalAlpha = prog(b, 46, 46.05) * (1 - collapse);
  T('AI', 0, 0, { s: 330, w: 900, noFill: true, stroke: C.violet, lw: 5 });
  const fp = E.inOutCubic(prog(b, 46.6, 47.6));
  ctx.beginPath(); ctx.rect(-400, 160 - fp * 320, 800, fp * 320); ctx.clip();
  T('AI', 0, 0, { s: 330, w: 900, c: C.violet });
  ctx.restore();
  // quote
  const qa = 1 - E.inExpo(prog(b, 49.7, 50));
  const lines1 = [
    { s: 'AI PHỤC VỤ', b0: 48, y: 1300, size: 104, c: C.paper },
    { s: 'CON NGƯỜI', b0: 48.5, y: 1430, size: 132, c: C.lime },
  ];
  const lines2 = [
    { s: 'KHÔNG THAY THẾ', b0: 50, y: 1230, size: 96, c: C.red },
    { s: 'THẨM QUYỀN & TRÁCH NHIỆM', b0: 50.75, y: 1350, size: 66, c: C.paper },
    { s: 'CỦA CON NGƯỜI', b0: 51.25, y: 1460, size: 104, c: C.lime },
  ];
  const drawLine = (ln, al) => {
    const lp = E.outExpo(prog(b, ln.b0, ln.b0 + .4));
    if (lp <= 0) return;
    const size = fitSize(ln.s, 900, ln.size, 980);
    ctx.save(); ctx.globalAlpha = al * (1 - collapse); ctx.beginPath(); ctx.rect(0, ln.y - size * .75, W, size * 1.5); ctx.clip();
    TR(ln.s, 540, ln.y + (1 - lp) * size * 1.4, { s: size, w: 900, c: ln.c }, 10 * (1 - prog(b, ln.b0, ln.b0 + .5)));
    ctx.restore();
  };
  if (b < 50) lines1.forEach(l => drawLine(l, qa));
  else lines2.forEach(l => drawLine(l, 1));
  if (b >= 52) {
    const n = Math.floor(prog(b, 52, 52.9) * 40);
    T('— Luật Trí tuệ nhân tạo, số 134/2025/QH15'.slice(0, n), 540, 1590, { f: 'JBM', s: 28, w: 500, c: C.paper, al: .7 * (1 - collapse) });
  }
  burst(b, 46, 540, 820, C.violet, 17, 50);
}

// S8 — hyper tunnel montage.
const MONTAGE = ['HỢP ĐỒNG THÔNG MINH', 'BLOCKCHAIN', 'KYC', 'DỮ LIỆU', 'AI', 'TOKEN', 'FINTECH', 'LEGALTECH', 'TUÂN THỦ', 'BẢO MẬT', 'THANH TOÁN SỐ', 'PHÁP LÝ SỐ'];
const PLATE = [C.lime, C.violet, C.gold, C.paper];
function S8(b) {
  bg(C.ink);
  const lb = b - 54;
  const s = 1.1 * lb + .32 * lb * lb + (b > 61 ? E.inExpo(prog(b, 61, 61.5)) * 30 : 0);
  const N = 16, cx = 540, cy = 960;
  const blackout = b >= 61.5;
  if (!blackout) {
    // tunnel frames far -> near
    const frames = [];
    for (let i = 0; i < N; i++) { const z = ((i - s) % N + N) % N + .25; frames.push({ i, z }); }
    frames.sort((a, c) => c.z - a.z);
    for (const f of frames) {
      const sc = 1.5 / f.z, size = 620 * sc;
      const al = clamp((N - f.z) / 5) * clamp(f.z / .6);
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(f.i * .2 + b * .2);
      ctx.strokeStyle = [C.lime, C.violet, C.gold, C.paper][f.i % 4]; ctx.globalAlpha = al * .8; ctx.lineWidth = Math.max(1, 10 * sc);
      ctx.strokeRect(-size / 2, -size * .9, size, size * 1.8);
      ctx.restore();
    }
    // radial speed lines
    const R = rng(31), sp = clamp(lb / 7);
    ctx.save(); ctx.translate(cx, cy); ctx.fillStyle = C.paper;
    for (let i = 0; i < 70; i++) {
      const a = R() * Math.PI * 2, r0 = ((R() * 1400 + s * 500) % 1400) + 60, len = 40 + sp * 300;
      ctx.globalAlpha = .12 + sp * .35; ctx.save(); ctx.rotate(a); ctx.fillRect(r0, -1.5, len, 3); ctx.restore();
    }
    ctx.restore();
    // orbiting icons
    ICONS.forEach((ic, k) => {
      const a = b * .9 + k * Math.PI / 2, r = 420;
      ctx.save(); ctx.translate(cx + Math.cos(a) * r * .9, cy + Math.sin(a) * r * 1.35); ctx.globalAlpha = .9 * prog(b, 54, 54.5);
      ic(ctx); ctx.restore();
    });
    // words
    if (b < 60) {
      const k = Math.floor(lb * 2), wb = 54 + k * .5, word = MONTAGE[k];
      const plate = k % 2 === 0;
      const p = E.outExpo(prog(b, wb, wb + .2));
      const size = fitSize(word, 900, 150, 900);
      if (plate) {
        ctx.fillStyle = PLATE[(k / 2) % 4]; const ph = size * 1.5 * p;
        ctx.fillRect(0, cy - ph / 2, W, ph);
      }
      ctx.save(); ctx.translate(cx, cy); ctx.scale(lerp(1.35, 1, p), lerp(1.35, 1, p));
      TR(word, 0, 4, { s: size, w: 900, c: plate ? C.ink : PLATE[(k >> 1) % 4] }, plate ? 0 : 10 * (1 - p));
      ctx.restore();
    } else if (b < 61.25) {
      const seq = ['LUẬT', '×', 'CODE', '×', 'TIỀN'];
      const k = clamp(Math.floor((b - 60) * 4), 0, 4), wb = 60 + k * .25;
      const p = E.outExpo(prog(b, wb, wb + .15));
      ctx.save(); ctx.translate(cx, cy); ctx.scale(lerp(1.6, 1, p), lerp(1.6, 1, p));
      TR(seq[k], 0, 8, { s: seq[k] === '×' ? 300 : 260, w: 900, f: seq[k] === 'CODE' ? 'JBM' : 'BVP', c: [C.paper, C.violet, C.lime, C.violet, C.gold][k] }, 14);
      ctx.restore();
    }
    const wf = E.inExpo(prog(b, 61.1, 61.5));
    if (wf > 0) { ctx.fillStyle = C.paper; ctx.globalAlpha = wf; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  } else {
    bg('#000');
    if (Math.floor(b * 4) % 2 === 0) { ctx.fillStyle = C.lime; ctx.fillRect(522, 924, 36, 70); }
  }
}
const ICONS = [
  c => { // gavel
    c.rotate(-.6); c.fillStyle = C.gold; c.fillRect(-60, -24, 90, 48); c.fillRect(-70, -30, 14, 60); c.fillRect(24, -30, 14, 60); c.fillRect(-10, 20, 20, 90);
  },
  c => { // coin
    c.fillStyle = C.gold; c.beginPath(); c.arc(0, 0, 50, 0, Math.PI * 2); c.fill(); T('₫', 0, 3, { ctx: c, s: 56, w: 900, c: C.ink });
  },
  c => { // chip
    c.strokeStyle = C.lime; c.lineWidth = 6; c.strokeRect(-40, -40, 80, 80); c.fillStyle = C.lime; c.fillRect(-18, -18, 36, 36);
    for (let i = -1; i <= 1; i++) { c.fillRect(i * 22 - 3, -62, 6, 18); c.fillRect(i * 22 - 3, 44, 6, 18); c.fillRect(-62, i * 22 - 3, 18, 6); c.fillRect(44, i * 22 - 3, 18, 6); }
  },
  c => { // lock
    c.strokeStyle = C.violet; c.lineWidth = 12; c.beginPath(); c.arc(0, -20, 30, Math.PI, 0); c.lineTo(30, 0); c.moveTo(-30, 0); c.lineTo(-30, -20); c.stroke();
    c.fillStyle = C.violet; rr(c, -48, -4, 96, 70, 12); c.fill();
  },
];

// S9 — final lockup + glitch-out.
function S9(b) {
  bg(C.ink);
  // perspective floor grid
  ctx.save(); ctx.strokeStyle = C.violet; ctx.lineWidth = 2; ctx.globalAlpha = .22;
  const hz = 1560;
  for (let i = -12; i <= 12; i++) { ctx.beginPath(); ctx.moveTo(540 + i * 18, hz); ctx.lineTo(540 + i * 260, H + 40); ctx.stroke(); }
  for (let k = 0; k < 10; k++) {
    const z = ((k + (b - 62) * 1.2) % 10) / 10, y = hz + Math.pow(z, 2.2) * (H - hz + 60);
    ctx.globalAlpha = .22 * z; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.restore();
  // floating ambient particles
  const R = rng(55);
  for (let i = 0; i < 90; i++) {
    const x = R() * W, y = ((R() * H - (b - 62) * B * (20 + R() * 60)) % H + H) % H;
    ctx.fillStyle = i % 3 ? C.paper : C.lime; ctx.globalAlpha = .15 + R() * .25; ctx.fillRect(x, y, 3, 3);
  }
  ctx.globalAlpha = 1;
  const L = [
    { s: 'KHI LUẬT', b0: 62, y: 760, size: 150, f: 'BVP', w: 900, c: C.paper },
    { s: 'CHẠY BẰNG', b0: 62.5, y: 930, size: 150, f: 'BVP', w: 900, c: C.paper },
    { s: 'CODE.', b0: 63, y: 1140, size: 250, f: 'JBM', w: 800, c: C.lime },
  ];
  L.forEach(l => {
    const lb = b - l.b0; if (lb < 0) return;
    const p = E.outExpo(prog(lb, 0, .3));
    ctx.save(); ctx.translate(540, l.y); ctx.scale(lerp(2.4, 1, p), lerp(2.4, 1, p)); ctx.globalAlpha = prog(lb, 0, .05);
    TR(l.s, 0, 0, { s: fitSize(l.s, l.w, l.size, 960, l.f), w: l.w, f: l.f, c: l.c }, 16 * (1 - prog(lb, 0, .5)));
    ctx.restore();
  });
  if (b >= 63.5 && Math.floor(b * 2) % 2 === 0) {
    const cw = measure('CODE.', 800, 250, 'JBM');
    ctx.fillStyle = C.lime; ctx.fillRect(540 + cw / 2 + 14, 1050, 60, 170);
  }
  // underline wipe
  const up = E.outExpo(prog(b, 64.5, 65.2));
  ctx.fillStyle = C.lime; ctx.fillRect(540 - 380 * up, 1290, 760 * up, 6);
  const qp = E.outExpo(prog(b, 65, 65.6));
  T('Bạn đã sẵn sàng?', 540, 1395 + (1 - qp) * 40, { s: 64, w: 500, c: C.paper, al: qp });
  const sp = prog(b, 66, 66.8);
  T('Nguồn: vanban.chinhphu.vn', 540, 1700, { f: 'JBM', s: 24, w: 500, c: C.paper, al: sp * .55 });
  T('NQ 05/2025/NQ-CP · Luật 71, 91, 134/2025/QH15', 540, 1740, { f: 'JBM', s: 24, w: 500, c: C.paper, al: sp * .55 });
  burst(b, 62, 540, 760, C.paper, 21, 40, .8);
  burst(b, 63, 540, 1140, C.lime, 22, 70, 1.1);
}

// ---------- overlays & post ----------
function hud(b, t) {
  if (b >= 61.5 && b < 62) return;
  const a = .55 * prog(b, 0, .6) * (1 - prog(b, 69, 70));
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  T('LAW × TECH × FINANCE', 60, 90, { f: 'JBM', s: 22, w: 700, c: C.paper, a: 'left', ls: 3 });
  T('VN · 2026', 1020, 90, { f: 'JBM', s: 22, w: 700, c: C.paper, a: 'right', ls: 3 });
  const fr = Math.floor(t * 60), ss = Math.floor(fr / 60), ff = fr % 60;
  T(`TC 00:${String(ss).padStart(2, '0')}:${String(ff).padStart(2, '0')}`, 60, 1840, { f: 'JBM', s: 22, w: 500, c: C.paper, a: 'left' });
  T(`${String(Math.floor(b)).padStart(2, '0')}/${TOTAL_BEATS} ♩${BPM}`, 1020, 1840, { f: 'JBM', s: 22, w: 500, c: C.paper, a: 'right' });
  ctx.strokeStyle = C.paper; ctx.lineWidth = 3;
  for (const [x, y, sx, sy] of [[40, 40, 1, 1], [1040, 40, -1, 1], [40, 1880, 1, -1], [1040, 1880, -1, -1]]) {
    ctx.beginPath(); ctx.moveTo(x, y + sy * 34); ctx.lineTo(x, y); ctx.lineTo(x + sx * 34, y); ctx.stroke();
  }
  ctx.fillStyle = C.lime; ctx.globalAlpha = a * 1.4; ctx.fillRect(0, H - 6, W * clamp(b / TOTAL_BEATS), 6);
  ctx.restore();
}
function glitchAmount(b) {
  const w = [[3.6, 4, .8], [9.75, 10.05, 1], [39.6, 40, .6], [45.5, 46, .8], [53.6, 54, .6], [61.2, 61.5, .7]];
  let g = 0;
  for (const [a, c, m] of w) if (b >= a && b < c) g = Math.max(g, m * Math.sin(prog(b, a, c) * Math.PI));
  if (b >= 69) g = Math.max(g, E.inCubic(prog(b, 69, 70.6)) * 1.2);
  return g;
}
function rgbSplit(d) {
  tmpX.clearRect(0, 0, W, H); tmpX.drawImage(cv, 0, 0);
  for (const [cx2, col] of [[chRX, '#ff0000'], [chBX, '#00ffff']]) {
    cx2.globalCompositeOperation = 'source-over'; cx2.drawImage(tmpC, 0, 0);
    cx2.globalCompositeOperation = 'multiply'; cx2.fillStyle = col; cx2.fillRect(0, 0, W, H);
  }
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.drawImage(chR, -d, 0);
  ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(chB, d, 0);
  ctx.restore();
}
function slices(g, b) {
  tmpX.clearRect(0, 0, W, H); tmpX.drawImage(cv, 0, 0);
  const seed = Math.floor(b * 16);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < 18; i++) {
    if (hash(seed * 31 + i) > .35 + g * .4) continue;
    const y = hash(seed + i * 7) * H, h = 10 + hash(seed + i * 13) * 120 * g, dx = (hash(seed + i * 3) - .5) * 260 * g;
    ctx.drawImage(tmpC, 0, y, W, h, dx, y, W, h);
  }
  ctx.restore();
}
function post(b, t) {
  const g = glitchAmount(b);
  if (g > .02) { slices(g, b); rgbSplit(4 + g * 26); }
  // outro collapse to a line, then a dot
  const cl = prog(b, 70.2, 70.9), dot = prog(b, 70.9, 71.4);
  if (cl > 0) {
    tmpX.clearRect(0, 0, W, H); tmpX.drawImage(cv, 0, 0);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const sy = lerp(1, .004, E.inExpo(cl)), sx = lerp(1, .01, E.inExpo(dot));
    if (dot < 1) { ctx.translate(540, 960); ctx.scale(sx, sy); ctx.drawImage(tmpC, -540, -960); }
    ctx.restore();
    if (dot > 0 && dot < 1) { ctx.fillStyle = C.paper; ctx.globalAlpha = 1 - dot; ctx.beginPath(); ctx.arc(540, 960, 8, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
  }
  if (b >= 71.4) { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); return; }
  const f = flashAt(b);
  if (f > 0) { ctx.fillStyle = C.paper; ctx.globalAlpha = f; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
  ctx.drawImage(vigC, 0, 0);
  // scanlines
  ctx.fillStyle = 'rgba(0,0,0,.08)'; for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
  // grain
  ctx.save(); ctx.globalAlpha = .06;
  const ox = Math.floor(hash(t * 91) * 256), oy = Math.floor(hash(t * 37) * 256);
  ctx.translate(-ox, -oy); ctx.fillStyle = ctx.createPattern(grainC, 'repeat'); ctx.fillRect(0, 0, W + 256, H + 256);
  ctx.restore();
}

function renderFrame(t) {
  const b = t / B;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; noGlow();
  const sh = shakeAt(b) * 26;
  const sx = (hash(t * 113) - .5) * 2 * sh, sy = (hash(t * 57 + 1) - .5) * 2 * sh;
  ctx.save();
  ctx.translate(sx, sy);
  if (b < 4) S1(b);
  else if (b < 10) S2(b);
  else if (b < 20) S3(b);
  else if (b < 32) S4(b);
  else if (b < 40) S5(b);
  else if (b < 46) S6(b);
  else if (b < 54) S7(b);
  else if (b < 62) S8(b);
  else S9(b);
  ctx.restore();
  hud(b, t);
  post(b, t);
}

async function init() {
  const faces = [
    new FontFace('BVP', 'url(fonts/BeVietnamPro-Medium.ttf)', { weight: '500' }),
    new FontFace('BVP', 'url(fonts/BeVietnamPro-ExtraBold.ttf)', { weight: '800' }),
    new FontFace('BVP', 'url(fonts/BeVietnamPro-Black.ttf)', { weight: '900' }),
    new FontFace('JBM', 'url(fonts/JetBrainsMono.ttf)', { weight: '100 800' }),
  ];
  for (const f of faces) { await f.load(); document.fonts.add(f); }
  buildAssets();
}

window.DURATION = DURATION;
window.FPS = 60;
window.renderFrame = renderFrame;
window.ready = init().then(() => {
  if (new URLSearchParams(location.search).has('preview')) {
    document.body.classList.add('preview');
    const t0 = performance.now();
    const loop = () => { renderFrame(((performance.now() - t0) / 1000) % DURATION); requestAnimationFrame(loop); };
    loop();
  }
  return true;
});
