/* Lex & Lineage — video giới thiệu (16:9, 1920×1080).
 * Every frame is a pure function of time t (seconds), so frames can be
 * rendered in any order and in parallel. Time is mostly expressed in beats
 * (110 BPM) so picture and the synthesized soundtrack stay locked.
 *
 * Palette, type and relation styles mirror the site's dark theme
 * (src/app/globals.css). Every law number and date on screen comes from
 * src/data/documents.ts and src/data/comparisons.ts. The assistant's answers
 * are written from the same records and labelled on screen as an
 * illustration of the interface. */

const W = 1920, H = 1080;
const BPM = 110, B = 60 / BPM;
const TOTAL_BEATS = 110;
const DURATION = TOTAL_BEATS * B;

const C = {
  paper: '#ece7dd', ink2: '#bdb7ab', ink3: '#8d8779', rule: '#333841', ruleStrong: '#4a5058',
  node: '#12151b', brass: '#c9a961', sparkle: '#f4e2b4', coral: '#e0917f', stamp: '#c4513b',
  ivory: '#f7f3ea', cardInk: '#16181d', cardInk2: '#4a505c', cardRule: '#d9d2c4',
};
/** Domain colour, same formula as the site: hsl(hue 52% 66%) in dark mode. */
const hsl = (h, a = 1, l = 66, s = 52) => `hsla(${h}, ${s}%, ${l}%, ${a})`;
const HUE = { green: 148, coral: 10, brass: 43 };

// Beat-locked events shared with audio.py, which parses the JSON between the markers.
// scenes: hook, family tree, assistant, tools, scope, lockup, end. impacts: [beat, strength];
// ticks: clock span of the date scrub; pops: tree nodes; typing, send, tag, chips, today,
// montage: the assistant scene; flip, rows, feed: the tools scene; glyphs, counters,
// collapse: the scope scene; cta: typing and button of the closing question box.
/*SYNC*/
const SYNC = {
  "scenes": [0, 12, 24, 68, 80, 92, 110],
  "impacts": [[8, 1], [20, 0.85], [80, 0.8], [91.6, 0.9]],
  "ticks": [4.5, 8],
  "pops": [13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5],
  "typing": [26.8, 33.2],
  "send": [34],
  "tag": [39.6],
  "chips": [45.8, 46.5, 54.1, 54.5, 58.1, 62.1, 62.5],
  "today": [47.2],
  "montage": [52, 56, 60],
  "flip": [69.8],
  "rows": [72.8, 73.3, 73.8],
  "feed": [76.6, 77, 77.4, 77.8],
  "glyphs": [80.2, 80.4, 80.6, 80.8, 81, 81.2, 81.4, 81.6, 81.8, 82, 82.2, 82.4, 82.6, 82.8, 83, 83.2, 83.4],
  "counters": [84.2, 86.2],
  "collapse": [91.6],
  "cta": [97, 100.5]
};
/*END*/

// ---------- math ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (x, a, b) => clamp((x - a) / (b - a));
const E = {
  outExpo: t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t),
  inExpo: t => t <= 0 ? 0 : Math.pow(2, 10 * t - 10),
  outCubic: t => 1 - Math.pow(1 - t, 3),
  inCubic: t => t * t * t,
  inOutCubic: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  outBack: t => { const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
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
const pad2 = n => String(n).padStart(2, '0');

const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }

// ---------- type ----------
function font(o) { return `${o.it ? 'italic ' : ''}${o.w || 500} ${o.s || 40}px ${o.f || 'BVP'}`; }
function T(s, x, y, o = {}) {
  const c = o.ctx || ctx, al = o.al ?? 1;
  if (al <= 0) return;
  c.save();
  c.font = font(o);
  c.textAlign = o.a || 'left';
  c.textBaseline = o.bl || 'alphabetic';
  c.letterSpacing = (o.ls || 0) + 'px';
  c.globalAlpha *= al;
  c.fillStyle = o.c || C.paper;
  c.fillText(s, x, y);
  c.restore();
}
function measure(s, o) {
  ctx.save(); ctx.font = font(o); ctx.letterSpacing = (o.ls || 0) + 'px';
  const m = ctx.measureText(s).width; ctx.restore(); return m;
}
function fit(s, o, maxW) { const m = measure(s, o); return m > maxW ? { ...o, s: o.s * maxW / m, ls: (o.ls || 0) * maxW / m } : o; }
/** One line of mixed styles. segs = [[text, style]]; style.padL/padR add space around a segment. */
function rich(segs, x, y, base, align = 'left') {
  const parts = segs.map(([s, o = {}]) => { const st = { ...base, ...o }; return [s, st, (st.padL || 0) + measure(s, st) + (st.padR || 0)]; });
  const tot = parts.reduce((a, p) => a + p[2], 0);
  let cx = align === 'center' ? x - tot / 2 : align === 'right' ? x - tot : x;
  for (const [s, st, w] of parts) { T(s, cx + (st.padL || 0), y, { ...st, a: 'left' }); cx += w; }
  return tot;
}
function wrap(text, o, maxW) {
  const out = []; let line = '';
  for (const word of text.split(' ')) {
    const next = line ? line + ' ' + word : word;
    if (line && measure(next, o) > maxW) { out.push(line); line = word; } else line = next;
  }
  if (line) out.push(line);
  return out;
}
/** Text that rises into place: p in [0, 1]. */
function riseT(s, x, y, o, p, dy = 26) {
  if (p <= 0) return;
  T(s, x, y + (1 - E.outCubic(p)) * dy, { ...o, al: (o.al ?? 1) * clamp(p * 1.6) });
}

// ---------- drawing helpers ----------
function rr(c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function bezierPts(x1, y1, cx1, cy1, cx2, cy2, x2, y2, n = 40) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    pts.push([u * u * u * x1 + 3 * u * u * t * cx1 + 3 * u * t * t * cx2 + t * t * t * x2,
      u * u * u * y1 + 3 * u * u * t * cy1 + 3 * u * t * t * cy2 + t * t * t * y2]);
  }
  return pts;
}
/** Stroke the first fraction p of a polyline; returns the end point and its direction. */
function strokePartial(pts, p) {
  if (p <= 0) return null;
  let total = 0; const seg = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); total += d; }
  let left = total * p;
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  let end = pts[0], ang = 0;
  for (let i = 1; i < pts.length && left > 0; i++) {
    const f = Math.min(1, left / seg[i - 1]);
    end = [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)];
    ang = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]);
    ctx.lineTo(end[0], end[1]); left -= seg[i - 1];
  }
  ctx.stroke();
  return { end, ang };
}
function arrowHead(x, y, ang, size, col) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-size, -size * .55); ctx.lineTo(-size, size * .55); ctx.closePath(); ctx.fill();
  ctx.restore();
}
/** Edge styles copied from the site's family tree: guides brass solid, amends grey dashed, replaces coral dotted. */
function edge(kind, pts, p, al = 1) {
  if (p <= 0 || al <= 0) return;
  ctx.save(); ctx.globalAlpha *= al; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  let col = C.brass;
  if (kind === 'guides') { ctx.strokeStyle = C.brass; ctx.lineWidth = 2.6; }
  if (kind === 'amends') { col = C.ink3; ctx.strokeStyle = col; ctx.lineWidth = 2.4; ctx.setLineDash([11, 8]); }
  if (kind === 'replaces') { col = C.coral; ctx.strokeStyle = col; ctx.lineWidth = 4.4; ctx.setLineDash([0.1, 11]); }
  const r = strokePartial(pts, p);
  ctx.setLineDash([]);
  if (r && p > .96) arrowHead(r.end[0], r.end[1], r.ang, 15, col);
  ctx.restore();
}
function pill(x, y, text, hue, o = {}) {
  const al = o.al ?? 1; if (al <= 0) return 0;
  const st = { f: 'BVP', w: 600, s: o.s || 15, ls: 1.6 };
  const w = measure(text, st) + 30, h = (o.s || 15) * 2.2;
  const x0 = o.a === 'right' ? x - w : o.a === 'center' ? x - w / 2 : x;
  ctx.save(); ctx.globalAlpha *= al;
  if (o.sy !== undefined) { ctx.translate(0, y); ctx.scale(1, o.sy); ctx.translate(0, -y); }
  ctx.fillStyle = hsl(hue, o.light ? .16 : .14, o.light ? 50 : 66);
  rr(ctx, x0, y - h / 2, w, h, h / 2); ctx.fill();
  ctx.strokeStyle = hsl(hue, o.light ? .75 : .6, o.light ? 42 : 66); ctx.lineWidth = 1.5; ctx.stroke();
  T(text, x0 + 15, y + (o.s || 15) * .36, { ...st, c: hsl(hue, 1, o.light ? 30 : 72) });
  ctx.restore();
  return w;
}

// ---------- precomputed assets ----------
const [bgC, bgX] = mk(W, H);
const [vigC, vigX] = mk(W, H);
const [grainC, grainX] = mk(256, 256);
const [tmpC, tmpX] = mk(W, H);
let CARD_OLD, CARD_NEW, STAMP;
const svgNS = 'http://www.w3.org/2000/svg';
let svgHost;
function plen(d) {
  const p = document.createElementNS(svgNS, 'path'); p.setAttribute('d', d); svgHost.appendChild(p);
  const L = p.getTotalLength(); p.remove(); return L;
}

function buildAssets() {
  { // background field: the seal's radial field, darkened for a full frame
    const g = bgX.createRadialGradient(W * .42, H * .34, 0, W * .42, H * .34, W * .78);
    g.addColorStop(0, '#1b1f27'); g.addColorStop(.45, '#111318'); g.addColorStop(1, '#07080a');
    bgX.fillStyle = g; bgX.fillRect(0, 0, W, H);
  }
  {
    const g = vigX.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, W * .62);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.62)');
    vigX.fillStyle = g; vigX.fillRect(0, 0, W, H);
  }
  {
    const id = grainX.createImageData(256, 256), R = rng(99);
    for (let i = 0; i < id.data.length; i += 4) { const v = R() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    grainX.putImageData(id, 0, 0);
  }
  svgHost = document.createElementNS(svgNS, 'svg');
  svgHost.setAttribute('style', 'position:absolute;left:-9999px;width:10px;height:10px');
  document.body.appendChild(svgHost);
  for (const d of DOMAINS) d.lens = GLYPH[d.id].map(plen);
  EMBLEM_LINES.forEach(l => { l.len = plen(l.d); });
  CARD_OLD = makeCard({ no: '50/2014/QH13', eff: 'Có hiệu lực từ 01/01/2015', seed: 3 });
  CARD_NEW = makeCard({ no: '135/2025/QH15', eff: 'Có hiệu lực từ 01/07/2026', seed: 4 });
  STAMP = makeStamp();
  buildChat();
}

// ---------- document card (hook) ----------
const CARD_W = 440, CARD_H = 600, CARD_PAD = 80;
function makeCard(d) {
  const [c, x] = mk(CARD_W + CARD_PAD * 2, CARD_H + CARD_PAD * 2);
  x.translate(CARD_PAD, CARD_PAD);
  x.shadowColor = 'rgba(0,0,0,.6)'; x.shadowBlur = 60; x.shadowOffsetY = 28;
  x.fillStyle = C.ivory; rr(x, 0, 0, CARD_W, CARD_H, 6); x.fill();
  x.shadowColor = 'transparent'; x.shadowBlur = 0;
  const g = x.createLinearGradient(0, 0, CARD_W, CARD_H);
  g.addColorStop(0, 'rgba(255,255,255,.4)'); g.addColorStop(1, 'rgba(120,100,70,.08)');
  x.fillStyle = g; rr(x, 0, 0, CARD_W, CARD_H, 6); x.fill();
  T('LUẬT', 44, 70, { ctx: x, f: 'BVP', w: 600, s: 17, ls: 5, c: C.cardInk2 });
  x.fillStyle = C.cardRule; x.fillRect(44, 100, CARD_W - 88, 2);
  T('Xây dựng', 44, 176, { ctx: x, f: 'Lora', w: 600, s: 60, c: C.cardInk });
  T(`Số ${d.no}`, 44, 222, { ctx: x, f: 'BVP', w: 500, s: 24, c: C.cardInk2 });
  const R = rng(d.seed);
  let y = 272;
  for (let i = 0; i < 10; i++) {
    const w = (i % 4 === 3 ? .42 + R() * .1 : .82 + R() * .18) * (CARD_W - 88);
    x.fillStyle = 'rgba(22,24,29,.12)'; rr(x, 44, y, w, 9, 4.5); x.fill();
    y += i % 4 === 3 ? 36 : 23;
  }
  x.fillStyle = C.cardRule; x.fillRect(44, CARD_H - 90, CARD_W - 88, 1.5);
  T(d.eff, 44, CARD_H - 48, { ctx: x, f: 'BVP', w: 500, s: 21, c: C.cardInk2 });
  return c;
}
function makeStamp() {
  const w = 430, h = 168, m = 12;
  const [c, x] = mk(w + m * 2, h + m * 2); x.translate(m, m);
  x.strokeStyle = C.stamp; x.lineWidth = 7; rr(x, 0, 0, w, h, 14); x.stroke();
  x.lineWidth = 2.5; rr(x, 14, 14, w - 28, h - 28, 8); x.stroke();
  T('HẾT HIỆU LỰC', w / 2, 94, { ctx: x, f: 'BVP', w: 800, s: 46, ls: 2, c: C.stamp, a: 'center' });
  T('TỪ 01/07/2026', w / 2, 134, { ctx: x, f: 'BVP', w: 600, s: 23, ls: 7, c: C.stamp, a: 'center' });
  x.globalCompositeOperation = 'destination-out';
  const R = rng(5);
  for (let i = 0; i < 2200; i++) { x.globalAlpha = R() * .75; x.fillRect(R() * w, R() * h, 1 + R() * 3, 1 + R() * 2); }
  for (let i = 0; i < 14; i++) { x.globalAlpha = .2 + R() * .3; x.beginPath(); x.ellipse(R() * w, R() * h, 20 + R() * 70, 3 + R() * 9, R() * 3, 0, Math.PI * 2); x.fill(); }
  return c;
}
/** Card centred at (x, y); the status badge is drawn live because it changes. */
function drawCard(img, x, y, s, al, rot = 0) {
  if (al <= 0) return;
  ctx.save(); ctx.globalAlpha *= al; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.drawImage(img, -CARD_W / 2 - CARD_PAD, -CARD_H / 2 - CARD_PAD);
  ctx.restore();
}
function cardBadge(x, y, s, al, state, flip = 1) {
  if (al <= 0) return;
  ctx.save(); ctx.translate(x + (CARD_W / 2 - 44) * s, y + (-CARD_H / 2 + 64) * s); ctx.scale(s, s);
  const [txt, hue] = state === 'in' ? ['ĐANG CÓ HIỆU LỰC', HUE.green] : ['ĐÃ HẾT HIỆU LỰC', HUE.coral];
  pill(0, 0, txt, hue, { a: 'right', light: true, al, sy: flip, s: 14 });
  ctx.restore();
}

// ---------- brand mark (mirrors src/components/brand/BrandMark.tsx, viewBox 200) ----------
const EMBLEM_LINES = [
  { d: 'M100 46V134', w: 3, i: 0 },
  { d: 'M50 64Q100 55 150 64', w: 2.6, i: 1 },
  { d: 'M50 64L35 101M50 64L65 101', w: 1.3, i: 2 },
  { d: 'M150 64L135 101M150 64L165 101', w: 1.3, i: 2 },
  { d: 'M100 131C100 145 89 151 76 156', w: 2.4, i: 3 },
  { d: 'M100 131C100 145 111 151 124 156', w: 2.4, i: 3 },
  { d: 'M100 134V155', w: 2.4, i: 3 },
];
const circ = (cx, cy, r) => `M${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}Z`;
const EMBLEM_SOLIDS = [
  { d: 'M100 32L106 40L100 48L94 40Z', i: 1 },
  { d: circ(50, 64, 2.6), i: 2 }, { d: circ(150, 64, 2.6), i: 2 },
  { d: 'M31 101H69A19 11 0 0 1 31 101Z', i: 3 }, { d: 'M131 101H169A19 11 0 0 1 131 101Z', i: 3 },
  { d: circ(76, 157, 3.8), i: 4 }, { d: circ(100, 160, 3.8), i: 4 }, { d: circ(124, 157, 3.8), i: 4 },
];
function polar(r, deg) { const a = deg * Math.PI / 180; return [100 + r * Math.cos(a), 100 + r * Math.sin(a)]; }
function sprig(from, to, r, count) {
  const dir = Math.sign(to - from), leaves = [];
  for (let i = 0; i < count; i++) {
    const t = (i + .5) / count, deg = from + (to - from) * t, [x, y] = polar(r, deg);
    const side = i % 2 === 0 ? 1 : -1;
    leaves.push({ x, y, rot: deg + 90 * dir - 38 * side * dir, s: 1 - t * .28 });
  }
  const [tx, ty] = polar(r, to);
  leaves.push({ x: tx, y: ty, rot: to + 90 * dir, s: .72 });
  return { from, to, r, dir, leaves };
}
const SPRIGS = [sprig(116, 166, 75, 9), sprig(64, 14, 75, 9)];
const LEAF = new Path2D('M0 0C3 -3.4 7 -3.4 10.5 0C7 3.4 3 3.4 0 0Z');
function goldGrad(c) {
  const g = c.createLinearGradient(24, 18, 176, 182);
  g.addColorStop(0, '#8a6a28'); g.addColorStop(.28, '#f1dc9c'); g.addColorStop(.52, '#b8913f');
  g.addColorStop(.74, '#f6e6b0'); g.addColorStop(1, '#7d5e22');
  return g;
}
/** The seal, centred at (cx, cy) with radius R. p = draw-on progress, sheen = sweep position 0..1. */
function seal(cx, cy, R, p, al = 1, sheen = -1) {
  if (al <= 0 || p <= 0) return;
  const k = R / 100;
  ctx.save(); ctx.globalAlpha *= al; ctx.translate(cx - R, cy - R); ctx.scale(k, k);
  const gold = goldGrad(ctx);
  const f = ctx.createRadialGradient(76, 60, 0, 76, 60, 160);
  f.addColorStop(0, '#2b2f39'); f.addColorStop(.55, '#16181e'); f.addColorStop(1, '#0b0c10');
  ctx.save(); ctx.globalAlpha *= prog(p, 0, .15);
  ctx.fillStyle = f; ctx.beginPath(); ctx.arc(100, 100, 97, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = gold; ctx.fillStyle = gold; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const ringP = E.inOutCubic(prog(p, 0, .35));
  ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(100, 100, 96, -Math.PI / 2, -Math.PI / 2 + ringP * Math.PI * 2); ctx.stroke();
  ctx.save(); ctx.globalAlpha *= .8; ctx.lineWidth = .6; ctx.beginPath(); ctx.arc(100, 100, 91, Math.PI / 2, Math.PI / 2 + ringP * Math.PI * 2); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.globalAlpha *= .7 * prog(p, .2, .4); ctx.lineWidth = 1.4; ctx.setLineDash([.01, 3.2]);
  ctx.beginPath(); ctx.arc(100, 100, 93.5, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  // name along the top arc, letters appear left to right
  {
    const st = { f: 'Lora', w: 600, s: 11 }, s = 'LEX & LINEAGE', sp = 3.4;
    ctx.font = font(st); ctx.letterSpacing = '0px';
    const ws = [...s].map(ch => ctx.measureText(ch).width);
    const tot = ws.reduce((a, b) => a + b + sp, -sp);
    let run = -tot / 2;
    [...s].forEach((ch, i) => {
      const a = prog(p, .3 + i * .02, .4 + i * .02);
      const mid = run + ws[i] / 2, deg = 270 + (mid / 81) * 180 / Math.PI, [x, y] = polar(81, deg);
      run += ws[i] + sp;
      if (a <= 0 || ch === ' ') return;
      ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate((deg + 90) * Math.PI / 180);
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText(ch, 0, 0); ctx.restore();
    });
  }
  // laurel
  SPRIGS.forEach(sg => {
    const sp = prog(p, .35, .7);
    if (sp <= 0) return;
    const a0 = sg.from * Math.PI / 180, a1 = lerp(sg.from, sg.to, sp) * Math.PI / 180;
    ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(100, 100, sg.r, a0, a1, sg.dir < 0); ctx.stroke();
    sg.leaves.forEach((l, i) => {
      const lp = E.outBack(prog(sp, i / sg.leaves.length, i / sg.leaves.length + .25));
      if (lp <= 0) return;
      ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(l.rot * Math.PI / 180); ctx.scale(l.s * lp, l.s * lp); ctx.fill(LEAF); ctx.restore();
    });
  });
  // emblem: column, beam, strings, roots — drawn in the order a scale is assembled
  EMBLEM_LINES.forEach(l => {
    const lp = E.inOutCubic(prog(p, .25 + l.i * .1, .55 + l.i * .1));
    if (lp <= 0) return;
    ctx.lineWidth = l.w; ctx.setLineDash([l.len * lp, l.len + 1]); ctx.stroke(new Path2D(l.d));
  });
  ctx.setLineDash([]);
  EMBLEM_SOLIDS.forEach(s => {
    const sp = prog(p, .45 + s.i * .1, .6 + s.i * .1);
    if (sp <= 0) return;
    ctx.save(); ctx.globalAlpha *= sp; ctx.fill(new Path2D(s.d)); ctx.restore();
  });
  if (sheen >= 0 && sheen <= 1) {
    ctx.save(); ctx.beginPath(); ctx.arc(100, 100, 97, 0, Math.PI * 2); ctx.clip();
    const x = lerp(-80, 280, sheen);
    const g = ctx.createLinearGradient(x - 30, 0, x + 30, 0);
    g.addColorStop(0, 'rgba(255,248,224,0)'); g.addColorStop(.5, 'rgba(255,248,224,.28)'); g.addColorStop(1, 'rgba(255,248,224,0)');
    ctx.fillStyle = g; ctx.translate(x, 100); ctx.transform(1, 0, -.29, 1, 0, 0); ctx.translate(-x, -100);
    ctx.fillRect(x - 30, -20, 60, 240); ctx.restore();
  }
  ctx.restore();
}
/** Wordmark as on the site: tracked serif capitals, an italic brass ampersand. */
function wordmark(x, y, size, al, align = 'left') {
  const base = { f: 'Lora', w: 600, s: size, ls: size * .2, c: C.paper, al };
  const amp = { it: true, w: 500, s: size * 1.12, ls: 0, c: C.brass, padL: size * .1, padR: size * .1 };
  return rich([['LEX ', {}], ['&', amp], [' LINEAGE', {}]], x, y, base, align);
}


// ---------- domains (src/data/documents.ts; glyphs from src/components/art/DomainGlyph.tsx) ----------
const GLYPH = {
  'xay-dung': ['M12 44V8M7 8h33M12 8l6-4 6 4M36 8v11', 'M33 19h6v3.5h-6z', 'M21 26h17v18h-17z', 'M25 31h3M31 31h3M25 36.5h3M31 36.5h3M5 44h38'],
  'nang-luong': ['M24 4 15 44M24 4l9 40M14.5 13h19M12 21h24M17.5 31h13', 'M16 13l15 8M32 13l-15 8M13 21l16 10M35 21 19 31', 'M9 44h30'],
  'hop-dong': ['M10 4h19l9 9v31H10z', 'M29 4v9h9', 'M15 18h17M15 23h17M15 28h11', 'M15 38c3-4 5 2 8-1s4 1 7-1 3 0 4 0'],
  'dan-su': ['M5 21 24 6l19 15', 'M9 18v24M39 18v24M6 42h36', circ(19, 25, 3.5), 'M12.5 42v-5.5a6.5 6.5 0 0 1 13 0V42', circ(30.5, 29, 2.8), 'M25.5 42v-3.8a5 5 0 0 1 10 0V42'],
  'to-tung': ['M24 5v37M15 42h18M9 12h30', circ(24, 7.5, 2), 'M9 12 4 26M9 12l5 14M39 12l-5 14M39 12l5 14', 'M3 26h12a6 5 0 0 1-12 0zM33 26h12a6 5 0 0 1-12 0z'],
  'an-le': ['M24 12c-5-3.5-12-4-18-2v28c6-2 13-1.5 18 2 5-3.5 12-4 18-2V10c-6-2-13-1.5-18 2z', 'M24 12v28', 'M10 17h9.5M10 22h9.5M10 27h9.5M10 32h6', circ(33, 25, 6), circ(33, 25, 3)],
  'doanh-nghiep': ['M9 7h19v37h-19z', 'M28 19h12v25h-12z', 'M13 13h3.5M20.5 13H24M13 19h3.5M20.5 19H24M13 25h3.5M20.5 25H24M13 31h3.5M20.5 31H24', 'M32 25h4M32 31h4M16.5 44v-6h4v6M5 44h39'],
  'dau-tu': ['M6 42h36M6 42V7', 'M10 34l8.5-8.5 7 6L37 18', 'M31 18h6v6', circ(38, 35, 4.5), 'M38 32.5v5'],
  'lao-dong': ['M10 31a14 14 0 0 1 28 0', 'M6 31h36v4H6z', 'M20.5 18.2V13h7v5.2M24 13v18', 'M14 41h20'],
  'thue': ['M12 4h24v40l-4-3-4 3-4-3-4 3-4-3-4 3z', 'M18 30l12-12', circ(19, 19, 2.2), circ(29, 29, 2.2), 'M18 36h12'],
  'dat-dai': ['M5 37 14 12l23 5 6 21-21 6z', circ(5, 37, 1.8), circ(14, 12, 1.8), circ(37, 17, 1.8), circ(43, 38, 1.8), circ(22, 44, 1.8), 'M24 32V18l8 3-8 3'],
  'ppp': ['M3 31h42M12 31V13M36 31V13', 'M12 13q12 16 24 0M12 13 4 31M36 13l8 18', 'M18 31v-7M24 31v-5M30 31v-7', 'M8 38c4-2 8 2 12 0s8 2 12 0 8 2 12 0'],
  'fintech': [circ(17, 24, 12), circ(17, 24, 8), 'M17 19.5l3.9 2.25v4.5L17 28.5l-3.9-2.25v-4.5z', 'M29 18h4l4-5h4M29 24h12M29 30h4l4 5h4', circ(43, 13, 1.8), circ(43, 24, 1.8), circ(43, 35, 1.8)],
  'du-lieu': ['M24 4 9 9.5V22c0 10.5 6.5 18 15 22 8.5-4 15-11.5 15-22V9.5z', circ(24, 20.5, 4), 'M22.4 24.1 21 32h6l-1.4-7.9'],
  'so-huu-tri-tue': ['M18 33v-3.5C13.5 27 11 23 11 18.5a13 13 0 0 1 26 0c0 4.5-2.5 8.5-7 11V33z', 'M18 37h12M20 41h8', circ(24, 18.5, 6), 'M26.6 16.4a3.2 3.2 0 1 0 0 4.2'],
  'thuong-mai-quoc-te': ['M4 32h40l-5 8H9z', 'M9 20h14v12H9zM23 20h14v12H23zM15 9h14v11H15z', 'M13 23v6M17 23v6M27 23v6M31 23v6M19.5 12.5v4M24.5 12.5v4', 'M4 45c4-2 8 2 12 0s8 2 12 0 8 2 12 0'],
  'canh-tranh': ['M18 8h20M28 4.5V8', 'M18 8l-3 6h6zM38 8l-3 6h6z', 'M4 19h5l4 16h24l3.5-12H10.2', circ(16, 40, 2.5), circ(33, 40, 2.5)],
};
/** Same order and hues as `domains` in src/data/documents.ts. */
const DOMAINS = [
  { id: 'xay-dung', hue: 24, short: 'Xây dựng' },
  { id: 'nang-luong', hue: 43, short: 'Năng lượng' },
  { id: 'hop-dong', hue: 212, short: 'Hợp đồng' },
  { id: 'dan-su', hue: 122, short: 'Dân sự' },
  { id: 'to-tung', hue: 352, short: 'Tố tụng' },
  { id: 'an-le', hue: 68, short: 'Án lệ' },
  { id: 'doanh-nghiep', hue: 268, short: 'Doanh nghiệp' },
  { id: 'dau-tu', hue: 176, short: 'Đầu tư' },
  { id: 'lao-dong', hue: 148, short: 'Lao động' },
  { id: 'thue', hue: 302, short: 'Thuế' },
  { id: 'dat-dai', hue: 96, short: 'Đất đai' },
  { id: 'ppp', hue: 240, short: 'PPP' },
  { id: 'fintech', hue: 192, short: 'Fintech' },
  { id: 'du-lieu', hue: 326, short: 'Dữ liệu' },
  { id: 'so-huu-tri-tue', hue: 285, short: 'Sở hữu trí tuệ' },
  { id: 'thuong-mai-quoc-te', hue: 8, short: 'Hải quan' },
  { id: 'canh-tranh', hue: 162, short: 'Cạnh tranh' },
];
const ND = DOMAINS.length;
/** Counts shown in the scope scene; they must match src/data/documents.ts. */
const STATS = { domains: ND, docs: 242, precedents: 16 };
/** Draw a domain glyph centred at (cx, cy); p = draw-on progress, stroke by stroke. */
function glyph(d, cx, cy, size, p, col) {
  const k = size / 48;
  ctx.save(); ctx.translate(cx - size / 2, cy - size / 2); ctx.scale(k, k);
  ctx.strokeStyle = col; ctx.lineWidth = 1.7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const paths = GLYPH[d.id], n = paths.length;
  paths.forEach((s, i) => {
    const lp = E.inOutCubic(prog(p, i / n * .55, .45 + i / n * .55));
    if (lp <= 0) return;
    const L = d.lens[i];
    ctx.setLineDash([L * lp, L + 1]); ctx.stroke(new Path2D(s));
  });
  ctx.restore();
}
/** Scene starts in beats, from the SYNC block: hook, family tree, assistant, tools, scope, lockup, end. */
const [, , T_CHAT, T4, TB, T5] = SYNC.scenes;

// ---------- ambient ----------
const DUST = (() => {
  const R = rng(7);
  return Array.from({ length: 170 }, () => ({ x: R() * W, y: R() * H, z: .3 + R() * .7, s: .7 + R() * 1.7, ph: R() * 6.28, sp: 8 + R() * 18 }));
})();
function dust(t, al = 1) {
  if (al <= 0) return;
  ctx.save(); ctx.fillStyle = C.sparkle;
  for (const d of DUST) {
    const y = ((d.y - t * d.sp * d.z) % H + H) % H, x = d.x + Math.sin(t * .3 + d.ph) * 22 * d.z;
    const tw = .5 + .5 * Math.sin(t * (1.1 + d.z) + d.ph);
    ctx.globalAlpha = al * (.06 + .3 * tw) * d.z;
    ctx.beginPath(); ctx.arc(x, y, d.s * d.z, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
function glowAt(x, y, r, hue, a, l = 60) {
  if (a <= 0) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, hsl(hue, a, l)); g.addColorStop(1, hsl(hue, 0, l));
  ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
function sparkBurst(b, b0, x, y, hue, seed, n = 36, spread = 1) {
  const lb = b - b0; if (lb < 0 || lb > 1.4) return;
  const p = lb / 1.4, R = rng(seed);
  ctx.save();
  ctx.strokeStyle = hsl(hue, (1 - p) * .6, 72); ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, E.outExpo(p) * 320 * spread, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = C.sparkle;
  for (let i = 0; i < n; i++) {
    const a = R() * Math.PI * 2, v = (120 + R() * 380) * spread, s = 1.5 + R() * 2.5, d = v * E.outExpo(p);
    ctx.globalAlpha = (1 - p) * (.3 + R() * .7);
    ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, s, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ---------- date helpers ----------
const D = s => Date.UTC(+s.slice(6), +s.slice(3, 5) - 1, +s.slice(0, 2));
const fmtD = ms => { const d = new Date(ms); return `${pad2(d.getUTCDate())}/${pad2(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`; };
const DAY = 86400000;

// =====================================================================
// S1 — hook: "Is this law still in force?" (beats 0–12)
// =====================================================================
const OLD_POS = { x: 600, y: 470 }, NEW_POS = { x: 1380, y: 470 };
const RULER = { x0: 240, x1: 1680, y: 910, from: D('01/01/2014'), to: D('01/01/2028') };
const rulerX = ms => lerp(RULER.x0, RULER.x1, (ms - RULER.from) / (RULER.to - RULER.from));
const SCRUB = [4.6, 8];
function scrubMs(b) { const p = E.inOutCubic(prog(b, SCRUB[0], SCRUB[1])); return Math.round(lerp(D('01/01/2015'), D('01/07/2026'), p) / DAY) * DAY; }

function S1(b, t) {
  // old card
  const inP = E.outExpo(prog(b, .2, 2));
  drawCard(CARD_OLD, OLD_POS.x, OLD_POS.y + (1 - inP) * 90, 1, clamp(inP * 1.4), (1 - inP) * -.05);
  const flipP = prog(b, 8, 8.35);
  const state = b < 8.17 ? 'in' : 'out';
  cardBadge(OLD_POS.x, OLD_POS.y + (1 - inP) * 90, 1, prog(b, 1.4, 2), state, Math.abs(Math.cos(flipP * Math.PI)));

  // question
  const qa = 1 - .7 * prog(b, 4.2, 5) + .7 * prog(b, 8.4, 9) - prog(b, 9, 9.8);
  const qx = 1000;
  riseT('Văn bản này', qx, 400, { f: 'Lora', w: 600, s: 84, c: C.paper, al: qa }, prog(b, 1.4, 2.4), 40);
  if (b > 2.2) {
    const p = prog(b, 2.2, 3.2);
    ctx.save(); ctx.translate(0, (1 - E.outCubic(p)) * 40); ctx.globalAlpha *= clamp(p * 1.6) * qa;
    rich([['còn ', {}], ['hiệu lực', { it: true, w: 500, c: C.brass }], [' không?', {}]], qx, 500, { f: 'Lora', w: 600, s: 84, c: C.paper });
    ctx.restore();
  }

  // ruler + scrubbing needle
  const ra = prog(b, 4, 4.8) * (1 - prog(b, 10, 10.8));
  if (ra > 0) {
    ctx.save(); ctx.globalAlpha *= ra;
    ctx.strokeStyle = C.ruleStrong; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(RULER.x0, RULER.y); ctx.lineTo(lerp(RULER.x0, RULER.x1, E.outCubic(prog(b, 4, 5))), RULER.y); ctx.stroke();
    for (let yr = 2014; yr <= 2028; yr++) {
      const x = rulerX(D(`01/01/${yr}`));
      ctx.fillStyle = C.ruleStrong; ctx.fillRect(x - 1, RULER.y - 10, 2, 20);
      if (yr < 2028) for (let q = 1; q < 4; q++) { const xq = rulerX(D(`01/${pad2(q * 3 + 1)}/${yr}`)); ctx.fillRect(xq - .5, RULER.y - 5, 1, 10); }
      if (yr % 2 === 0 || yr === 2015) T(String(yr), x, RULER.y + 44, { f: 'BVP', w: 500, s: 19, c: C.ink3, a: 'center' });
    }
    const ms = scrubMs(b), nx = rulerX(ms);
    const inForceTo = Math.min(ms, D('01/07/2026'));
    if (b > SCRUB[0]) {
      ctx.fillStyle = hsl(HUE.green, .8, 62);
      ctx.fillRect(rulerX(D('01/01/2015')), RULER.y - 3, rulerX(inForceTo) - rulerX(D('01/01/2015')), 6);
    }
    if (b >= 8) {
      const mx = rulerX(D('01/07/2026'));
      ctx.fillStyle = C.coral; ctx.beginPath(); ctx.arc(mx, RULER.y, 9 * E.outBack(prog(b, 8, 8.4)), 0, Math.PI * 2); ctx.fill();
    }
    const na = prog(b, 4.4, 4.8);
    ctx.globalAlpha *= na;
    ctx.strokeStyle = C.brass; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(nx, RULER.y - 58); ctx.lineTo(nx, RULER.y + 14); ctx.stroke();
    ctx.fillStyle = C.brass; ctx.beginPath(); ctx.arc(nx, RULER.y, 6, 0, Math.PI * 2); ctx.fill();
    T(fmtD(ms), nx, RULER.y - 74, { f: 'BVP', w: 600, s: 34, c: C.paper, a: 'center' });
    T('NGÀY TRA CỨU', nx, RULER.y - 118, { f: 'BVP', w: 600, s: 14, ls: 4, c: C.brass, a: 'center' });
    ctx.restore();
  }

  // stamp
  if (b >= 8) {
    const sp = E.outExpo(prog(b, 8, 8.3));
    ctx.save(); ctx.globalAlpha *= clamp(prog(b, 8, 8.08)) * .92;
    ctx.translate(OLD_POS.x, OLD_POS.y + 60); ctx.rotate(-.14); ctx.scale(lerp(2.1, 1, sp), lerp(2.1, 1, sp));
    ctx.drawImage(STAMP, -STAMP.width / 2, -STAMP.height / 2);
    ctx.restore();
  }
  sparkBurst(b, 8, OLD_POS.x, OLD_POS.y + 60, HUE.coral, 11, 40, .9);

  // the replacing law slides in, tied by a "replaces" thread
  const np = E.outExpo(prog(b, 9.2, 10.6));
  if (np > 0) {
    drawCard(CARD_NEW, lerp(W + 320, NEW_POS.x, np), NEW_POS.y, 1, clamp(np * 1.5));
    cardBadge(lerp(W + 320, NEW_POS.x, np), NEW_POS.y, 1, prog(b, 10, 10.6), 'in');
    const x1 = NEW_POS.x - CARD_W / 2 - 18, x2 = OLD_POS.x + CARD_W / 2 + 18;
    edge('replaces', [[x1, 380], [x2, 380]], E.inOutCubic(prog(b, 10.2, 11)));
    T('thay thế', (x1 + x2) / 2, 352, { f: 'Lora', it: true, w: 500, s: 30, c: C.coral, a: 'center', al: prog(b, 10.6, 11.2) });
  }
  // transitional caveat, straight from the comparison record
  const cp = prog(b, 10.6, 11.4);
  if (cp > 0) {
    ctx.save(); ctx.globalAlpha *= clamp(cp * 1.5) * (1 - prog(b, 11.7, 12.2));
    ctx.translate(0, (1 - E.outCubic(cp)) * 20);
    rich([['Hợp đồng xây dựng ký trước 01/07/2026, về nguyên tắc, ', {}], ['vẫn theo luật cũ.', { c: C.paper, w: 600 }]],
      W / 2, 900, { f: 'BVP', w: 400, s: 32, c: C.ink2 }, 'center');
    ctx.restore();
  }
}

// =====================================================================
// S2 — every law has a family tree; brand reveal (beats 12–24)
// =====================================================================
const ROOT = { x: 960, y: 360, w: 270, h: 92, no: '135/2025/QH15', sub: 'Luật Xây dựng' };
const PREV = { x: 330, y: 360, w: 250, h: 86, no: '50/2014/QH13', sub: 'Luật Xây dựng 2014' };
const AMD = { x: 330, y: 580, w: 250, h: 86, no: '62/2020/QH14', sub: 'Luật sửa đổi' };
const DECREES = ['193', '206', '207', '209', '210', '212', '217'].map((n, i) => ({ x: 596 + i * 192, y: 700, w: 180, h: 80, no: `${n}/2026/NĐ-CP`, sub: 'Nghị định' }));
function nodeBox(n, al, sc = 1, accent) {
  if (al <= 0) return;
  ctx.save(); ctx.globalAlpha *= al; ctx.translate(n.x, n.y); ctx.scale(sc, sc);
  ctx.fillStyle = C.node; rr(ctx, -n.w / 2, -n.h / 2, n.w, n.h, 10); ctx.fill();
  ctx.strokeStyle = accent || C.ruleStrong; ctx.lineWidth = accent ? 2 : 1.5; ctx.stroke();
  const big = n.w > 200;
  T(n.no, 0, big ? -2 : -4, { f: 'BVP', w: 600, s: big ? 25 : 17, c: C.paper, a: 'center' });
  T(n.sub, 0, big ? 28 : 22, { f: 'BVP', w: 400, s: big ? 17 : 15, c: C.ink3, a: 'center' });
  ctx.restore();
}
function S2(b, t) {
  const fade = 1 - .96 * E.inOutCubic(prog(b, 19.4, 20.6));
  const m = E.inOutCubic(prog(b, 12, 13.4));
  ctx.save(); ctx.globalAlpha *= fade;
  // cards shrink into nodes
  const cardA = 1 - prog(m, .25, .7);
  if (cardA > 0) {
    const sOld = lerp(1, PREV.w / CARD_W, m), sNew = lerp(1, ROOT.w / CARD_W, m);
    const ox = lerp(OLD_POS.x, PREV.x, m), oy = lerp(OLD_POS.y, PREV.y, m), nx = lerp(NEW_POS.x, ROOT.x, m), ny = lerp(NEW_POS.y, ROOT.y, m);
    drawCard(CARD_OLD, ox, oy, sOld, cardA);
    ctx.save(); ctx.globalAlpha *= cardA * .92; ctx.translate(ox, oy + 60 * sOld); ctx.rotate(-.14); ctx.scale(sOld, sOld);
    ctx.drawImage(STAMP, -STAMP.width / 2, -STAMP.height / 2); ctx.restore();
    drawCard(CARD_NEW, nx, ny, sNew, cardA);
  }
  const na = prog(m, .45, .95);
  nodeBox(PREV, na, 1, hsl(HUE.coral, .5));
  nodeBox(ROOT, na, 1, C.brass);
  // replaces thread follows the morph
  {
    const x1 = lerp(NEW_POS.x - CARD_W / 2 - 18, ROOT.x - ROOT.w / 2 - 14, m), x2 = lerp(OLD_POS.x + CARD_W / 2 + 18, PREV.x + PREV.w / 2 + 14, m);
    const y = lerp(380, ROOT.y, m);
    edge('replaces', [[x1, y], [x2, y]], 1);
    T('thay thế', (x1 + x2) / 2, y - 24, { f: 'Lora', it: true, w: 500, s: lerp(30, 24, m), c: C.coral, a: 'center' });
  }
  // amending law
  {
    const lb = b - SYNC.pops[0];
    const p = E.outBack(prog(lb, 0, .5));
    nodeBox(AMD, prog(lb, 0, .25), lerp(.7, 1, p));
    edge('amends', [[AMD.x, AMD.y - AMD.h / 2 - 8], [PREV.x, PREV.y + PREV.h / 2 + 12]], E.inOutCubic(prog(lb, .3, 1)));
    T('sửa đổi', AMD.x + 18, (AMD.y + PREV.y) / 2 + 8, { f: 'Lora', it: true, w: 500, s: 22, c: C.ink3, al: prog(lb, .8, 1.3) });
  }
  // implementing decrees
  DECREES.forEach((d, i) => {
    const lb = b - SYNC.pops[i + 1];
    const p = E.outBack(prog(lb, 0, .5));
    const x1 = d.x, y1 = d.y - d.h / 2 - 8, x2 = ROOT.x + (i - 3) * 30, y2 = ROOT.y + ROOT.h / 2 + 14;
    edge('guides', bezierPts(x1, y1, x1, y1 - 120, x2, y2 + 130, x2, y2, 36), E.inOutCubic(prog(lb, .15, .9)), .9);
    nodeBox(d, prog(lb, 0, .25), lerp(.7, 1, p));
  });

  // legend, same three strokes as the site
  const la = prog(b, 16, 16.8);
  if (la > 0) {
    const items = [['guides', 'hướng dẫn'], ['amends', 'sửa đổi'], ['replaces', 'thay thế']];
    items.forEach(([k, s], i) => {
      const x = 330 + i * 250, y = 900;
      edge(k, [[x - 125, y], [x - 45, y]], la, la);
      T(s, x - 30, y + 7, { f: 'BVP', w: 500, s: 19, c: C.ink2, al: la });
    });
  }
  ctx.restore();

  // headline
  const ha = 1 - prog(b, 19.3, 20);
  riseT('Mỗi văn bản pháp luật', W / 2, 150, { f: 'Lora', w: 600, s: 64, c: C.paper, a: 'center', al: ha }, prog(b, 14, 15));
  if (b > 14.6) {
    const p = prog(b, 14.6, 15.6);
    ctx.save(); ctx.globalAlpha *= clamp(p * 1.6) * ha; ctx.translate(0, (1 - E.outCubic(p)) * 26);
    rich([['đều có một ', {}], ['gia phả.', { it: true, w: 500, c: C.brass }]], W / 2, 230, { f: 'Lora', w: 600, s: 64, c: C.paper }, 'center');
    ctx.restore();
  }

  // brand
  const out = 1 - prog(b, 23.2, 24);
  if (b >= 20) {
    ctx.save(); ctx.globalAlpha *= out;
    glowAt(640, 540, 520, HUE.brass, .1 * prog(b, 20, 21), 55);
    seal(640, 540, 215, prog(b, 20, 22.6), 1, prog(b, 22, 23.2));
    const wp = prog(b, 21, 22);
    ctx.save(); ctx.translate(0, (1 - E.outCubic(wp)) * 30);
    wordmark(960, 520, 70, clamp(wp * 1.5));
    ctx.restore();
    ctx.fillStyle = C.brass; ctx.fillRect(962, 558, 140 * E.outCubic(prog(b, 21.6, 22.4)), 2);
    riseT('Gia phả văn bản pháp luật Việt Nam', 962, 616, { f: 'BVP', w: 500, s: 32, c: C.ink2 }, prog(b, 22, 22.9), 18);
    ctx.restore();
  }
  sparkBurst(b, 20, 640, 540, HUE.brass, 31, 50, 1.2);
}

// =====================================================================
// S3 — the assistant (beats T_CHAT–T4)
// One question typed, one answer streamed with its sources and validity,
// then three quick questions across practice areas. The answers are written
// from src/data/documents.ts and labelled on screen as an illustration.
// =====================================================================
const CP = { x: 770, y: 126, w: 1010, h: 836 };
const BODY = { x: CP.x + 34, y: CP.y + 92, w: CP.w - 68, h: CP.h - 92 - 104 };
const INPUT = { x: CP.x + 34, y: CP.y + CP.h - 86, w: CP.w - 68, h: 60 };
const AV = 58; // assistant text indent (avatar column)
const CST = {
  q: { f: 'BVP', w: 500, s: 24, c: C.paper },
  lead: { f: 'Lora', w: 600, s: 30, c: C.paper },
  p: { f: 'BVP', w: 400, s: 23, c: C.ink2 },
  tag: { f: 'BVP', w: 700, s: 13, ls: 1.6 },
  chipNo: { f: 'BVP', w: 600, s: 19, c: C.paper },
  chipName: { f: 'BVP', w: 400, s: 17, c: C.ink3 },
  pill: { f: 'BVP', w: 600, s: 12, ls: 1.4 },
  foot: { f: 'BVP', w: 400, s: 17, c: C.ink3 },
};
const B1 = { w: 600, c: C.paper };
const TAG = 'CHƯA XÁC MINH';
const Q1 = 'Tôi nhận cọc bán nhà, nhưng cơ quan nhà nước chậm cấp sổ nên không kịp ký hợp đồng. Tôi có bị phạt cọc không?';
const TYPE = SYNC.typing;
const CHAT = [
  {
    q: Q1, at: 34, status: [34.4, 35.6], foot: 47.2,
    stream: [[35.8, 39.6], [39.9, 45.3]],
    paras: [
      { st: CST.lead, segs: [['Thường là không:', {}], ['chậm cấp sổ do cơ quan nhà nước', { c: C.brass, it: true, w: 500 }], ['được xem là lý do khách quan.', {}]] },
      { st: CST.p, segs: [['Theo', {}], ['Điều 328', B1], [TAG, { tag: true }], ['Bộ luật Dân sự 2015,', { ...B1, ref: 0 }], ['bên nhận cọc từ chối giao kết hợp đồng thì phải trả lại cọc và một khoản tiền tương đương, trừ khi các bên thỏa thuận khác.', {}]] },
      { st: CST.p, segs: [['Án lệ 25/2018/AL', { ...B1, ref: 1 }], ['xác định: bên nhận cọc chưa được cấp giấy chứng nhận do nguyên nhân từ cơ quan nhà nước có thẩm quyền thì không phải chịu phạt cọc.', {}]] },
    ],
    chips: [{ no: '91/2015/QH13', name: 'Bộ luật Dân sự', st: 'in' }, { no: '25/2018/AL', name: 'Án lệ', st: 'in' }],
  },
  {
    q: 'Nộp đơn khởi kiện tại VIAC ngày 01/8/2026 thì áp dụng quy tắc nào?',
    paras: [{ st: CST.p, segs: [['Quy tắc VIAC 2026,', B1], ['áp dụng cho tố tụng trọng tài bắt đầu từ ngày 01/07/2026.', {}]] }],
    chips: [{ no: 'Quy tắc VIAC 2026', name: '', st: 'in' }, { no: 'Quy tắc VIAC 2017', name: '', st: 'out' }],
  },
  {
    q: 'Luật Đất đai 2024 còn hiệu lực không?',
    paras: [{ st: CST.p, segs: [['Còn hiệu lực', B1], ['từ 01/08/2024, đã được sửa đổi bởi Luật 43/2024/QH15.', {}]] }],
    chips: [{ no: '31/2024/QH15', name: 'Luật Đất đai', st: 'in' }],
  },
  {
    q: 'Thi hành án dân sự bây giờ theo luật nào?',
    paras: [{ st: CST.p, segs: [['Luật Thi hành án dân sự 106/2025/QH15,', B1], ['có hiệu lực từ 01/07/2026, thay thế Luật 26/2008/QH12.', {}]] }],
    chips: [{ no: '106/2025/QH15', name: 'Luật Thi hành án dân sự', st: 'in' }, { no: '26/2008/QH12', name: '', st: 'out' }],
  },
];
// The three quick questions, one every four beats; their timings follow `at`.
SYNC.montage.forEach((m, k) => Object.assign(CHAT[k + 1], { at: m, stream: [[m + .5, m + 1.8]] }));
// Chip times are listed in SYNC.chips in feed order, so the soundtrack lands on each one.
{ let k = 0; CHAT.forEach(a => { a.chipAt = a.chips.map(() => SYNC.chips[k++]); }); }

const tagW = () => measure(TAG, CST.tag) + 22;
function layoutText(paras, width) {
  const toks = []; let y = 0;
  paras.forEach((para, pi) => {
    const lh = Math.round(para.st.s * 1.48), sp = measure(' ', para.st);
    let x = 0;
    y += para.st.s;
    for (const [text, o] of para.segs) {
      for (const word of o.tag ? [text] : text.split(' ')) {
        const st = { ...para.st, ...o };
        const w = o.tag ? tagW() : measure(word, st);
        if (x > 0 && x + w > width) { x = 0; y += lh; }
        toks.push({ s: word, st, x, y, w, tag: !!o.tag, ref: o.ref, lh });
        x += w + sp;
      }
    }
    y += Math.round(para.st.s * .48) + (pi < paras.length - 1 ? 14 : 0);
  });
  return { toks, h: y };
}
const chipW = c => 18 + measure(c.no, CST.chipNo) + (c.name ? 10 + measure(c.name, CST.chipName) : 0) + 16 + measure(LBL[c.st][0].toUpperCase(), CST.pill) + 26 + 16;
let FEED, FEED_H;
function buildChat() {
  let y = 20;
  FEED = [];
  CHAT.forEach((a, k) => {
    const lines = wrap(a.q, CST.q, 600);
    const qw = Math.max(...lines.map(l => measure(l, CST.q))) + 48;
    FEED.push({ kind: 'q', a, y, w: qw, h: lines.length * 34 + 30, lines });
    y += lines.length * 34 + 30 + 22;
    const top = y;
    let yy = 0;
    if (a.status) yy += 46;
    const text = layoutText(a.paras, BODY.w - AV - 8);
    const textY = yy; yy += text.h + 16;
    let cx = 0, cy = yy;
    const chips = a.chips.map(c => {
      const w = chipW(c);
      if (cx > 0 && cx + w > BODY.w - AV) { cx = 0; cy += 60; }
      const r = { ...c, x: cx, y: cy, w }; cx += w + 12; return r;
    });
    yy = cy + 50;
    if (a.foot) yy += 46;
    // tokens before and after the tag: the tag lands exactly on SYNC.tag
    const ti = text.toks.findIndex(t => t.tag);
    a.map = ti < 0 ? [[a.stream[0][0], a.stream[0][1], 0, text.toks.length]]
      : [[a.stream[0][0], a.stream[0][1], 0, ti + 1], [a.stream[1][0], a.stream[1][1], ti + 1, text.toks.length]];
    FEED.push({ kind: 'a', a, y: top, h: yy, text, textY, chips, chipY: 0 });
    y = top + yy + (k < CHAT.length - 1 ? 30 : 10);
  });
  FEED_H = y;
}
/** Revealed tokens of an answer at beat b, as a float (piecewise linear). */
function revealed(a, b) {
  let n = 0;
  for (const [b0, b1, n0, n1] of a.map) if (b >= b0) n = lerp(n0, n1, prog(b, b0, b1));
  return n;
}
function streaming(a, b) { return a.map.some(([b0, b1]) => b >= b0 && b < b1 + .15); }
/** Scroll offset of the feed: eases to each anchor so the newest content stays in view. */
function scrollAt(b) {
  const a1 = FEED[1], s = v => Math.max(0, v);
  const anchors = [
    [42.4, s(a1.y + a1.textY + a1.text.h * .8 - BODY.h + 40)],
    [46.4, s(a1.y + a1.h - BODY.h + 12)],
    ...SYNC.montage.map((m, k) => [m + .2, s(Math.min(FEED[2 + k * 2].y - 18, FEED_H - BODY.h))]),
  ];
  let v = 0;
  for (const [tb, val] of anchors) v = lerp(v, val, E.inOutCubic(prog(b, tb - 1, tb)));
  return v;
}
function avatar(x, y, al) {
  if (al <= 0) return;
  ctx.save(); ctx.globalAlpha *= al;
  seal(x, y, 19, 1, 1);
  ctx.restore();
}
function chip(c, x, y, al, sc = 1) {
  if (al <= 0) return;
  const [lbl, hue] = LBL[c.st];
  ctx.save(); ctx.globalAlpha *= al; ctx.translate(x, y + 23); ctx.scale(sc, sc); ctx.translate(0, -23);
  ctx.fillStyle = 'rgba(27,31,39,.95)'; rr(ctx, 0, 0, c.w, 46, 12); ctx.fill();
  ctx.strokeStyle = hsl(hue, .45); ctx.lineWidth = 1.5; ctx.stroke();
  let cx = 18;
  T(c.no, cx, 30, CST.chipNo); cx += measure(c.no, CST.chipNo) + 10;
  if (c.name) { T(c.name, cx, 30, CST.chipName); cx += measure(c.name, CST.chipName) + 6; }
  const pw = measure(lbl.toUpperCase(), CST.pill) + 26;
  const px = c.w - 16 - pw;
  ctx.fillStyle = hsl(hue, .14); rr(ctx, px, 11, pw, 24, 12); ctx.fill();
  ctx.strokeStyle = hsl(hue, .6); ctx.lineWidth = 1.2; ctx.stroke();
  T(lbl.toUpperCase(), px + 13, 28, { ...CST.pill, c: hsl(hue, 1, 74) });
  ctx.restore();
}
function tagPill(x, y, al, sc) {
  if (al <= 0) return;
  const w = tagW(), h = 26;
  ctx.save(); ctx.globalAlpha *= al; ctx.translate(x + w / 2, y - 8); ctx.scale(sc, sc); ctx.rotate((1 - Math.min(1, sc)) * -.1);
  ctx.fillStyle = 'rgba(196,81,59,.16)'; rr(ctx, -w / 2, -h / 2, w, h, 6); ctx.fill();
  ctx.strokeStyle = C.stamp; ctx.lineWidth = 1.6; ctx.stroke();
  T(TAG, 0, 5, { ...CST.tag, c: C.coral, a: 'center' });
  ctx.restore();
}
function drawQ(blk, b, ox, oy) {
  const a = blk.a, p = prog(b, a.at, a.at + .45);
  if (p <= 0) return;
  const x = ox + BODY.w - blk.w, y = oy + blk.y + (1 - E.outCubic(p)) * 40;
  ctx.save(); ctx.globalAlpha *= clamp(p * 1.6);
  ctx.fillStyle = hsl(HUE.brass, .13, 52); rr(ctx, x, y, blk.w, blk.h, 22); ctx.fill();
  ctx.strokeStyle = hsl(HUE.brass, .35, 60); ctx.lineWidth = 1.2; ctx.stroke();
  blk.lines.forEach((l, i) => T(l, x + 24, y + 40 + i * 34, CST.q));
  ctx.restore();
}
function drawA(blk, b, ox, oy) {
  const a = blk.a, x0 = ox + AV, y0 = oy + blk.y;
  const start = a.status ? a.status[0] : a.stream[0][0];
  if (b < start) return;
  avatar(ox + 20, y0 + 22, prog(b, start, start + .4));
  if (a.status) {
    const [s0, s1] = a.status, done = b >= s1;
    const st = { f: 'BVP', w: 500, s: 18, c: done ? C.ink3 : C.ink2 };
    T(done ? 'Đã đối chiếu kho văn bản của trang' : 'Đang đối chiếu kho văn bản…', x0, y0 + 28, { ...st, al: prog(b, s0, s0 + .3) });
    const bx = x0 + 330, bw = 200;
    ctx.save(); ctx.globalAlpha *= prog(b, s0, s0 + .3) * (1 - prog(b, s1 + .4, s1 + 1));
    ctx.fillStyle = C.rule; rr(ctx, bx, y0 + 19, bw, 6, 3); ctx.fill();
    ctx.fillStyle = C.brass; rr(ctx, bx, y0 + 19, bw * E.inOutCubic(prog(b, s0, s1)), 6, 3); ctx.fill();
    ctx.restore();
  }
  const n = revealed(a, b), ty = y0 + blk.textY;
  let last = null;
  blk.text.toks.forEach((tk, i) => {
    const al = clamp(n - i);
    if (al <= 0) return;
    if (tk.tag) {
      const tb = SYNC.tag[0];
      tagPill(x0 + tk.x, ty + tk.y, clamp((b - tb) * 6), lerp(1.7, 1, E.outExpo(prog(b, tb, tb + .35))));
    } else {
      T(tk.s, x0 + tk.x, ty + tk.y, { ...tk.st, al });
      if (tk.ref !== undefined) {
        const cb = a.chipAt[tk.ref], up = E.outCubic(prog(b, cb - .3, cb + .3));
        if (up > 0) { ctx.fillStyle = C.brass; ctx.fillRect(x0 + tk.x, ty + tk.y + 7, tk.w * up, 2); }
      }
    }
    last = tk;
  });
  if (last && streaming(a, b) && Math.floor(b * 4) % 2 === 0) {
    ctx.fillStyle = C.brass; ctx.fillRect(x0 + last.x + last.w + 6, ty + last.y - last.st.s * .78, 3, last.st.s * .95);
  }
  // chip rows are laid out relative to the top of the answer block
  blk.chips.forEach((c, j) => {
    const cb = a.chipAt[j], p = prog(b, cb, cb + .45);
    chip(c, x0 + c.x, y0 + c.y + (1 - E.outCubic(p)) * 18, clamp(p * 1.8), lerp(.92, 1, E.outBack(p)));
  });
  if (a.foot) {
    const p = prog(b, a.foot, a.foot + .5), fy = y0 + blk.chips[blk.chips.length - 1].y + 86;
    ctx.save(); ctx.globalAlpha *= clamp(p * 1.6);
    ctx.strokeStyle = C.brass; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(x0 + 8, fy - 6, 8, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x0 + 8, fy - 11); ctx.lineTo(x0 + 8, fy - 6); ctx.lineTo(x0 + 12, fy - 4); ctx.stroke();
    rich([['Hiệu lực tính tại hôm nay', { c: C.paper, w: 500 }], ['  ·  Thông tin tham khảo, không phải tư vấn pháp lý', {}]], x0 + 26, fy, CST.foot);
    ctx.restore();
  }
}
function chatPanel(b, al, slide) {
  if (al <= 0) return;
  ctx.save(); ctx.globalAlpha *= al; ctx.translate(slide, 0);
  glowAt(CP.x + CP.w / 2, CP.y + CP.h / 2, 760, HUE.brass, .07, 50);
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 60; ctx.shadowOffsetY = 24;
  ctx.fillStyle = 'rgba(17,20,26,.96)'; rr(ctx, CP.x, CP.y, CP.w, CP.h, 24); ctx.fill(); ctx.restore();
  ctx.strokeStyle = C.ruleStrong; ctx.lineWidth = 1.5; rr(ctx, CP.x, CP.y, CP.w, CP.h, 24); ctx.stroke();
  // header, as on the site's assistant panel
  T('Trợ lý hỏi đáp', CP.x + 36, CP.y + 54, { f: 'Lora', w: 600, s: 30, c: C.paper });
  pill(CP.x + 270, CP.y + 44, 'THỬ NGHIỆM', HUE.brass, { s: 12 });
  {
    const s = 'Tự động theo độ khó', st = { f: 'BVP', w: 500, s: 16, c: C.ink2 }, w = measure(s, st) + 34;
    ctx.strokeStyle = C.ruleStrong; ctx.lineWidth = 1.2; rr(ctx, CP.x + CP.w - 36 - w, CP.y + 26, w, 36, 18); ctx.stroke();
    T(s, CP.x + CP.w - 36 - w / 2, CP.y + 50, { ...st, a: 'center' });
  }
  ctx.fillStyle = C.rule; ctx.fillRect(CP.x, CP.y + 80, CP.w, 1.5);
  // feed
  ctx.save(); ctx.beginPath(); ctx.rect(BODY.x - 10, BODY.y, BODY.w + 20, BODY.h); ctx.clip();
  const oy = BODY.y - scrollAt(b);
  for (const blk of FEED) (blk.kind === 'q' ? drawQ : drawA)(blk, b, BODY.x, oy);
  ctx.restore();
  {
    const g = ctx.createLinearGradient(0, BODY.y, 0, BODY.y + 36);
    g.addColorStop(0, 'rgba(17,20,26,1)'); g.addColorStop(1, 'rgba(17,20,26,0)');
    ctx.fillStyle = g; ctx.fillRect(BODY.x - 10, BODY.y, BODY.w + 20, 36);
  }
  // input
  ctx.fillStyle = 'rgba(10,12,16,.9)'; rr(ctx, INPUT.x, INPUT.y, INPUT.w, INPUT.h, 30); ctx.fill();
  const focus = prog(b, TYPE[0] - .4, TYPE[0]) * (1 - prog(b, SYNC.send[0], SYNC.send[0] + .4));
  ctx.strokeStyle = focus > 0 ? hsl(HUE.brass, .3 + .5 * focus, 62) : C.ruleStrong; ctx.lineWidth = 1.5;
  rr(ctx, INPUT.x, INPUT.y, INPUT.w, INPUT.h, 30); ctx.stroke();
  const typed = b >= TYPE[0] && b < SYNC.send[0] ? Q1.slice(0, Math.round(Q1.length * prog(b, TYPE[0], TYPE[1]))) : '';
  ctx.save(); ctx.beginPath(); ctx.rect(INPUT.x + 20, INPUT.y, INPUT.w - 110, INPUT.h); ctx.clip();
  if (typed) {
    const st = { f: 'BVP', w: 400, s: 22, c: C.paper }, tw = measure(typed, st), sx = Math.min(0, INPUT.w - 140 - tw);
    T(typed, INPUT.x + 28 + sx, INPUT.y + 38, st);
    if (Math.floor(b * 4) % 2 === 0 || b < TYPE[1]) { ctx.fillStyle = C.brass; ctx.fillRect(INPUT.x + 30 + sx + tw, INPUT.y + 16, 2.5, 28); }
  } else T('Nhập câu hỏi…', INPUT.x + 28, INPUT.y + 38, { f: 'BVP', w: 400, s: 22, c: C.ink3 });
  ctx.restore();
  {
    const sp = prog(b, SYNC.send[0], SYNC.send[0] + .5), bx = INPUT.x + INPUT.w - 34, by = INPUT.y + INPUT.h / 2;
    ctx.fillStyle = typed ? C.brass : C.ruleStrong; ctx.beginPath(); ctx.arc(bx, by, 21, 0, Math.PI * 2); ctx.fill();
    if (sp > 0 && sp < 1) { ctx.strokeStyle = hsl(HUE.brass, 1 - sp, 66); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(bx, by, 21 + sp * 30, 0, Math.PI * 2); ctx.stroke(); }
    ctx.strokeStyle = typed ? '#14161b' : C.ink3; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(bx, by + 9); ctx.lineTo(bx, by - 9); ctx.moveTo(bx - 8, by - 1); ctx.lineTo(bx, by - 9); ctx.lineTo(bx + 8, by - 1); ctx.stroke();
  }
  ctx.restore();
  T('GIAO DIỆN MINH HỌA', CP.x + CP.w + slide, CP.y + CP.h + 40, { f: 'BVP', w: 600, s: 13, ls: 4, c: C.ink3, a: 'right', al: al * .9 });
}
const FEATS = [
  { at: () => SYNC.tag[0], s: 'Nói rõ chỗ chưa đối chiếu' },
  { at: () => SYNC.chips[0], s: 'Dẫn văn bản kèm hiệu lực' },
  { at: () => SYNC.today[0], s: 'Tính hiệu lực tại hôm nay' },
];
const AREAS = ['Trọng tài.', 'Đất đai.', 'Thi hành án.'];
function chatLeft(b) {
  const X = 140;
  const ia = 1 - prog(b, SYNC.montage[0] - .9, SYNC.montage[0] - .1);
  if (ia > 0) {
    ctx.save(); ctx.globalAlpha *= ia;
    riseT('TRỢ LÝ AI', X, 300, { f: 'BVP', w: 600, s: 20, ls: 6, c: C.brass }, prog(b, T_CHAT + .3, T_CHAT + .9), 16);
    riseT('Hỏi bằng lời', X, 398, { f: 'Lora', w: 600, s: 82, c: C.paper }, prog(b, T_CHAT + .6, T_CHAT + 1.5), 34);
    if (b > T_CHAT + 1) {
      const p = prog(b, T_CHAT + 1, T_CHAT + 1.9);
      ctx.save(); ctx.globalAlpha *= clamp(p * 1.6); ctx.translate(0, (1 - E.outCubic(p)) * 34);
      rich([['của ', {}], ['bạn.', { it: true, w: 500, c: C.brass }]], X, 492, { f: 'Lora', w: 600, s: 82, c: C.paper });
      ctx.restore();
    }
    riseT('Câu trả lời dẫn đúng văn bản,', X, 570, { f: 'BVP', w: 400, s: 28, c: C.ink2 }, prog(b, T_CHAT + 1.8, T_CHAT + 2.6), 16);
    riseT('kèm tình trạng hiệu lực.', X, 612, { f: 'BVP', w: 400, s: 28, c: C.ink2 }, prog(b, T_CHAT + 2, T_CHAT + 2.8), 16);
    FEATS.forEach((f, i) => {
      const t0 = f.at(), p = prog(b, t0, t0 + .6), y = 724 + i * 72;
      if (p <= 0) return;
      ctx.save(); ctx.globalAlpha *= clamp(p * 1.6); ctx.translate((1 - E.outCubic(p)) * -30, 0);
      ctx.fillStyle = C.brass; ctx.fillRect(X, y - 26, 3, 36);
      T(pad2(i + 1), X + 22, y, { f: 'BVP', w: 600, s: 18, ls: 2, c: C.brass });
      T(f.s, X + 70, y, { f: 'BVP', w: 500, s: 27, c: C.paper });
      ctx.restore();
      glowAt(X + 2, y - 8, 90, HUE.brass, .22 * (1 - prog(b, t0, t0 + 1.2)), 60);
    });
    ctx.restore();
  }
  const m0 = SYNC.montage[0];
  if (b >= m0 - .2) {
    const out = prog(b, T4 - .9, T4 - .1);
    ctx.save(); ctx.globalAlpha *= 1 - out;
    riseT('HỎI VỀ MỌI LĨNH VỰC', X, 300, { f: 'BVP', w: 600, s: 20, ls: 6, c: C.brass }, prog(b, m0, m0 + .6), 16);
    AREAS.forEach((s, k) => {
      const t0 = SYNC.montage[k], p = prog(b, t0 + .1, t0 + .9);
      const cur = k === AREAS.length - 1 ? 1 : 1 - prog(b, SYNC.montage[k + 1], SYNC.montage[k + 1] + .6);
      riseT(s, X, 400 + k * 92, { f: 'Lora', w: 600, s: 76, c: cur > .5 ? C.paper : C.ink3 }, p, 30);
    });
    const ep = prog(b, SYNC.montage[2] + 4, SYNC.montage[2] + 4.8);
    if (ep > 0) {
      ctx.save(); ctx.globalAlpha *= clamp(ep * 1.5); ctx.translate(0, (1 - E.outCubic(ep)) * 20);
      rich([['Câu trả lời nào ', {}], ['cũng dẫn nguồn.', { it: true, c: C.brass }]], X, 740, { f: 'Lora', w: 500, s: 40, c: C.ink2 });
      ctx.restore();
    }
    ctx.restore();
  }
}
function SChat(b, t) {
  const enter = E.outExpo(prog(b, T_CHAT + .4, T_CHAT + 1.8)), exit = E.inCubic(prog(b, T4 - .9, T4));
  chatPanel(b, clamp(enter * 1.3) * (1 - exit), (1 - enter) * 260 + exit * 160);
  chatLeft(b);
}

// =====================================================================
// S4 — three tools (beats T4–TB)
// =====================================================================
const FEATURES = [
  { n: 'I', title: 'Tra hiệu lực\ntheo ngày', text: 'Chọn một ngày bất kỳ. Xem văn bản nào\nđang có hiệu lực vào đúng ngày đó.' },
  { n: 'II', title: 'So sánh\nphiên bản', text: 'Đặt luật cũ cạnh luật mới: mốc hiệu lực,\nđiều khoản chuyển tiếp, văn bản thi hành.' },
  { n: 'III', title: 'Theo dõi\nthay đổi', text: 'Lưu văn bản bạn đang dùng. Biết điều gì\nđã đổi kể từ ngày bắt đầu theo dõi.' },
];
const PANEL = { x: 860, y: 220, w: 900, h: 600 };
function panelFrame(al) {
  ctx.save(); ctx.globalAlpha *= al;
  ctx.fillStyle = 'rgba(19,22,28,.82)'; rr(ctx, PANEL.x, PANEL.y, PANEL.w, PANEL.h, 18); ctx.fill();
  ctx.strokeStyle = C.rule; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();
}
const LBL = { in: ['Đang có hiệu lực', HUE.green], pending: ['Chưa có hiệu lực', HUE.brass], out: ['Đã hết hiệu lực', HUE.coral] };
/**
 * The date changes in one flip, never by scrubbing: between 01/01/2026 and
 * 30/06/2026 part of Law 135/2025/QH15 already applied (the permit-exemption
 * group), so no in-between date may be shown with a plain "not yet in force".
 */
function featAsOf(lb, al) {
  const X = PANEL.x + 60;
  const mid = SYNC.flip[0] - T4, fp = prog(lb, mid - .175, mid + .175), after = fp >= .5;
  const sy = Math.abs(Math.cos(fp * Math.PI));
  T('NGÀY TRA CỨU', X, PANEL.y + 78, { f: 'BVP', w: 600, s: 16, ls: 4, c: C.brass, al });
  ctx.save(); ctx.translate(0, PANEL.y + 136); ctx.scale(1, Math.max(.02, sy)); ctx.translate(0, -(PANEL.y + 136));
  T(after ? '01/07/2026' : '15/12/2025', X, PANEL.y + 160, { f: 'BVP', w: 600, s: 72, c: C.paper, al });
  ctx.restore();
  const rx0 = X, rx1 = PANEL.x + PANEL.w - 60, ry = PANEL.y + 206;
  ctx.save(); ctx.globalAlpha *= al;
  ctx.fillStyle = C.ruleStrong; ctx.fillRect(rx0, ry - 1, rx1 - rx0, 2);
  const mx = lerp(rx0, rx1, lerp(.2, .8, E.inOutCubic(fp)));
  ctx.fillStyle = C.brass; ctx.beginPath(); ctx.arc(mx, ry, 8, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  const rows = [
    { law: 'Luật Xây dựng 2014', no: '50/2014/QH13', a: 'in', b: 'out' },
    { law: 'Luật Xây dựng', no: '135/2025/QH15', a: 'pending', b: 'in' },
  ];
  rows.forEach((r, i) => {
    const y = PANEL.y + 330 + i * 150, rp = prog(lb, .3 + i * .15, .8 + i * .15);
    ctx.save(); ctx.globalAlpha *= al * clamp(rp * 1.5); ctx.translate(0, (1 - E.outCubic(rp)) * 16);
    ctx.fillStyle = C.rule; ctx.fillRect(X, y - 48, PANEL.w - 120, 1.5);
    T(r.law, X, y + 4, { f: 'Lora', w: 600, s: 36, c: C.paper });
    T(r.no, X, y + 42, { f: 'BVP', w: 500, s: 22, c: C.ink3 });
    const st = LBL[after ? r.b : r.a];
    pill(PANEL.x + PANEL.w - 60, y - 2, st[0].toUpperCase(), st[1], { a: 'right', s: 15, sy });
    ctx.restore();
  });
}
function featCompare(lb, al) {
  const X = PANEL.x + 60, colA = X + 220, colB = X + 500;
  const hp = prog(lb, .1, .6);
  ctx.save(); ctx.globalAlpha *= al * hp;
  T('LUẬT XÂY DỰNG', X, PANEL.y + 78, { f: 'BVP', w: 600, s: 16, ls: 4, c: C.brass });
  T('LUẬT CŨ', colA, PANEL.y + 124, { f: 'BVP', w: 600, s: 14, ls: 3, c: C.ink3 });
  T('LUẬT MỚI', colB, PANEL.y + 124, { f: 'BVP', w: 600, s: 14, ls: 3, c: C.brass });
  T('50/2014/QH13', colA, PANEL.y + 162, { f: 'Lora', w: 600, s: 30, c: C.ink2 });
  T('135/2025/QH15', colB, PANEL.y + 162, { f: 'Lora', w: 600, s: 30, c: C.paper });
  ctx.restore();
  const rows = [
    ['Mốc hiệu lực', 'Từ 01/01/2015', 'Từ 01/07/2026'],
    ['Miễn giấy phép xây dựng', 'Theo luật 2014', 'Áp dụng từ 01/01/2026'],
    ['Văn bản thi hành', 'NĐ 175/2024/NĐ-CP', 'Bộ nghị định 2026'],
  ];
  rows.forEach(([topic, a, bb], i) => {
    const y = PANEL.y + 262 + i * 110, rp = prog(lb, SYNC.rows[i] - T4 - 4, SYNC.rows[i] - T4 - 4 + .45);
    ctx.save(); ctx.globalAlpha *= al * clamp(rp * 1.5); ctx.translate(0, (1 - E.outCubic(rp)) * 16);
    ctx.fillStyle = C.rule; ctx.fillRect(X, y - 30, PANEL.w - 120, 1.5);
    const tl = wrap(topic, { f: 'BVP', w: 600, s: 19 }, 190);
    tl.forEach((l, k) => T(l, X, y + 16 + k * 27, { f: 'BVP', w: 600, s: 19, c: C.ink3 }));
    T(a, colA, y + 20, { f: 'BVP', w: 400, s: 24, c: C.ink2 });
    const hl = E.outCubic(prog(rp, .3, 1));
    ctx.fillStyle = hsl(HUE.brass, .12, 60); rr(ctx, colB - 16, y - 16, 296 * hl, 56, 8); ctx.fill();
    ctx.fillStyle = C.brass; ctx.fillRect(colB - 16, y - 16, 3, 56);
    T(bb, colB, y + 20, { f: 'BVP', w: 600, s: 24, c: C.paper });
    ctx.restore();
  });
}
function featWatch(lb, al) {
  const X = PANEL.x + 60;
  ctx.save(); ctx.globalAlpha *= al * prog(lb, .1, .6);
  T('THAY ĐỔI MỚI NHẤT', X, PANEL.y + 78, { f: 'BVP', w: 600, s: 16, ls: 4, c: C.brass });
  // bell
  const ring = Math.sin(clamp(lb - .6, 0, 1.2) * 18) * (1 - prog(lb, .6, 1.8)) * .35;
  ctx.save(); ctx.translate(PANEL.x + PANEL.w - 80, PANEL.y + 70); ctx.rotate(ring);
  ctx.strokeStyle = C.brass; ctx.lineWidth = 2.5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-15, 10); ctx.quadraticCurveTo(-15, -16, 0, -17); ctx.quadraticCurveTo(15, -16, 15, 10); ctx.closePath(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-19, 10); ctx.lineTo(19, 10); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 16, 4, 0, Math.PI); ctx.stroke();
  ctx.restore();
  ctx.restore();
  const items = [
    ['01/07/2026', 'Luật Xây dựng', '135/2025/QH15'],
    ['01/07/2026', 'Luật Quản lý thuế', '108/2025/QH15'],
    ['01/03/2026', 'Luật Đầu tư', '143/2025/QH15'],
    ['01/03/2026', 'Luật Phục hồi, phá sản', '142/2025/QH15'],
  ];
  items.forEach(([date, law, no], i) => {
    const y = PANEL.y + 170 + i * 104, rp = prog(lb, SYNC.feed[i] - T4 - 8, SYNC.feed[i] - T4 - 8 + .45);
    ctx.save(); ctx.globalAlpha *= al * clamp(rp * 1.5); ctx.translate(0, (1 - E.outCubic(rp)) * -24);
    ctx.fillStyle = C.rule; ctx.fillRect(X, y - 22, PANEL.w - 120, 1.5);
    T(date, X, y + 30, { f: 'BVP', w: 600, s: 22, c: C.brass });
    T(law, X + 180, y + 24, { f: 'Lora', w: 600, s: 30, c: C.paper });
    T(no, X + 180, y + 56, { f: 'BVP', w: 500, s: 19, c: C.ink3 });
    pill(PANEL.x + PANEL.w - 60, y + 26, 'CÓ HIỆU LỰC', HUE.green, { a: 'right', s: 13 });
    ctx.restore();
  });
  // a followed item: brass star on the first row
  const sp = E.outBack(prog(lb, 2.4, 2.9));
  if (sp > 0) {
    ctx.save(); ctx.globalAlpha *= al; ctx.translate(X - 26, PANEL.y + 188); ctx.scale(sp, sp);
    ctx.fillStyle = C.brass; ctx.beginPath();
    for (let k = 0; k < 10; k++) { const r = k % 2 ? 5 : 12, a = -Math.PI / 2 + k * Math.PI / 5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.closePath(); ctx.fill(); ctx.restore();
  }
}
function S4(b, t) {
  const j = clamp(Math.floor((b - T4) / 4), 0, 2), f = FEATURES[j], lb = b - T4 - j * 4;
  const enter = prog(b, T4, T4 + .8), exit = prog(b, TB - .8, TB);
  const pa = enter * (1 - exit);
  ctx.save(); ctx.translate(0, (1 - E.outCubic(enter)) * 30);
  panelFrame(pa);
  ctx.restore();
  // feature content crossfades on each bar
  const cin = prog(lb, 0, .5), cout = j < 2 ? prog(lb, 3.55, 4) : exit;
  const ca = cin * (1 - cout) * pa;
  if (ca > 0) {
    ctx.save(); ctx.translate(0, (1 - E.outCubic(cin)) * 18 - E.inCubic(cout) * 18);
    [featAsOf, featCompare, featWatch][j](lb, ca);
    ctx.restore();
  }
  // left column
  const X = 160;
  ctx.save(); ctx.globalAlpha *= (1 - cout);
  riseT(f.n, X, 330, { f: 'Lora', it: true, w: 500, s: 96, c: C.brass }, prog(lb, .05, .6), 24);
  const tl = f.title.split('\n');
  tl.forEach((l, k) => riseT(l, X, 430 + k * 70, { f: 'Lora', w: 600, s: 60, c: C.paper }, prog(lb, .15 + k * .1, .75 + k * .1), 26));
  const y0 = 430 + tl.length * 70 + 10;
  f.text.split('\n').forEach((l, k) =>
    riseT(l, X, y0 + k * 44, { f: 'BVP', w: 400, s: 29, c: C.ink2 }, prog(lb, .4 + k * .08, 1 + k * .08), 16));
  ctx.restore();
  // I · II · III
  ctx.save(); ctx.globalAlpha *= pa;
  FEATURES.forEach((ff, k) => {
    const x = 160 + k * 90, on = k === j;
    T(ff.n, x, 900, { f: 'Lora', it: true, w: 500, s: 28, c: on ? C.brass : C.ruleStrong });
    if (on) { ctx.fillStyle = C.brass; ctx.fillRect(x, 914, measure(ff.n, { f: 'Lora', it: true, w: 500, s: 28 }), 2); }
  });
  ctx.restore();
}

// =====================================================================
// S5 — scope: every area at once, the corpus behind the answers (beats TB–T5)
// No area is introduced on its own: the seventeen glyphs burst out together,
// knit into one network, and the counts roll up in the middle.
// =====================================================================
const HUB = { x: 960, y: 630 };
/** Nodes spaced evenly along an ellipse by arc length, so none crowd at the sides. */
const ORBIT = (() => {
  const RX = 650, RY = 290, n = 720, pts = [], len = [0];
  for (let k = 0; k <= n; k++) {
    const a = -Math.PI / 2 + k / n * Math.PI * 2;
    pts.push([HUB.x + Math.cos(a) * RX, HUB.y + Math.sin(a) * RY, a]);
    if (k) len.push(len[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
  }
  return DOMAINS.map((_, i) => {
    const goal = (i + .5) / ND * len[n];
    let k = 0; while (len[k + 1] < goal) k++;
    const [x, y, a] = pts[k];
    // labels sit below each node, or beside it at the two ends of the ellipse
    const side = Math.cos(a) > .9 ? 1 : Math.cos(a) < -.9 ? -1 : 0;
    return { x, y, a, side };
  });
})();
const LINKS = DOMAINS.flatMap((_, i) => [[i, (i + 1) % ND], [i, (i + 5) % ND]]);
function nodePos(i, b) {
  const o = ORBIT[i], gp = SYNC.glyphs[i];
  const out = E.outBack(prog(b, gp - .25, gp + .55));
  const col = E.inExpo(prog(b, SYNC.collapse[0] - .9, SYNC.collapse[0]));
  const drift = Math.sin(b * .9 + i) * 6;
  const k = out * (1 - col);
  return [lerp(HUB.x, o.x, k), lerp(HUB.y, o.y + drift, k), out, col];
}
function counter(n, x, label, b, t0) {
  const p = prog(b, t0, t0 + 1.6), v = Math.round(n * E.outCubic(p));
  if (p <= 0) return;
  const st = { f: 'Lora', it: true, w: 500, s: 104, c: C.brass, a: 'center' };
  T(String(v), x, HUB.y + 26, { ...st, al: clamp(p * 3) });
  riseT(label, x, HUB.y + 78, { f: 'BVP', w: 500, s: 24, ls: 2, c: C.ink2, a: 'center' }, prog(b, t0 + .2, t0 + .8), 12);
}
function SBurst(b, t) {
  const fade = 1 - prog(b, SYNC.collapse[0] - 1.2, SYNC.collapse[0] - .4);
  // headline
  ctx.save(); ctx.globalAlpha *= fade;
  riseT('NỀN CỦA MỌI CÂU TRẢ LỜI', W / 2, 150, { f: 'BVP', w: 600, s: 20, ls: 6, c: C.brass, a: 'center' }, prog(b, TB + .3, TB + .9), 16);
  {
    const p = prog(b, TB + .6, TB + 1.5);
    ctx.save(); ctx.globalAlpha *= clamp(p * 1.6); ctx.translate(0, (1 - E.outCubic(p)) * 28);
    rich([['Một kho văn bản ', {}], ['đã kiểm chứng.', { it: true, w: 500, c: C.brass }]], W / 2, 232, { f: 'Lora', w: 600, s: 60, c: C.paper }, 'center');
    ctx.restore();
  }
  ctx.restore();
  glowAt(HUB.x, HUB.y, 700, HUE.brass, .1 * prog(b, TB, TB + 1) * fade, 55);
  sparkBurst(b, TB, HUB.x, HUB.y, HUE.brass, 81, 70, 1.6);
  // network
  const net = E.inOutCubic(prog(b, SYNC.glyphs[ND - 1], SYNC.glyphs[ND - 1] + 1.4));
  if (net > 0) {
    ctx.save(); ctx.globalAlpha *= .5 * fade; ctx.lineCap = 'round';
    LINKS.forEach(([i, j], k) => {
      const [x1, y1] = nodePos(i, b), [x2, y2] = nodePos(j, b);
      const q = clamp(net * 1.4 - (k / LINKS.length) * .4);
      ctx.strokeStyle = C.brass; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(lerp(x1, x2, q), lerp(y1, y2, q)); ctx.stroke();
      // a pulse travels along each link, like a relation being read
      const ph = ((b - SYNC.glyphs[ND - 1] - 1) * .35 + k * .137) % 1;
      if (q >= 1 && ph > 0) {
        ctx.fillStyle = C.sparkle; ctx.globalAlpha = .7 * fade * Math.sin(ph * Math.PI);
        ctx.beginPath(); ctx.arc(lerp(x1, x2, ph), lerp(y1, y2, ph), 2.6, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = .5 * fade;
      }
    });
    ctx.restore();
  }
  // nodes
  DOMAINS.forEach((d, i) => {
    const [x, y, out, col] = nodePos(i, b);
    if (out <= 0) return;
    const s = lerp(.4, 1, Math.min(1, out)) * (1 - col * .7);
    ctx.save(); ctx.globalAlpha *= clamp(out * 2) * (1 - col * .6);
    glowAt(x, y, 110 * s, d.hue, .28, 58);
    ctx.fillStyle = 'rgba(14,16,21,.92)'; ctx.beginPath(); ctx.arc(x, y, 54 * s, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = hsl(d.hue, .9); ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(x, y, 54 * s, 0, Math.PI * 2); ctx.stroke();
    glyph(d, x, y, 66 * s, prog(b, SYNC.glyphs[i], SYNC.glyphs[i] + 1.2), hsl(d.hue));
    const o = ORBIT[i], lx = o.side ? x + o.side * 70 * s : x, ly = o.side ? y + 7 : y + 86 * s;
    T(d.short, lx, ly, { f: 'BVP', w: 500, s: 18, c: C.ink3, a: o.side > 0 ? 'left' : o.side < 0 ? 'right' : 'center', al: prog(b, SYNC.glyphs[i] + .5, SYNC.glyphs[i] + 1.1) * (1 - col * 3) });
    ctx.restore();
  });
  // counts
  ctx.save(); ctx.globalAlpha *= fade;
  const [c0, c1] = SYNC.counters;
  counter(STATS.domains, HUB.x - 280, 'lĩnh vực', b, c0);
  counter(STATS.docs, HUB.x, 'văn bản', b, (c0 + c1) / 2);
  counter(STATS.precedents, HUB.x + 280, 'án lệ', b, c1);
  ctx.restore();
  // the network folds into the seal
  const cb = SYNC.collapse[0];
  glowAt(HUB.x, HUB.y, 320, HUE.brass, .35 * Math.sin(prog(b, cb - .5, cb + .6) * Math.PI), 70);
}

// =====================================================================
// S6 — lockup and call to action (beats T5–end)
// =====================================================================
const CTA = { x: 960, y: 820, w: 860, h: 86 };
const CTA_TEXT = 'Hỏi trợ lý AI về văn bản pháp luật Việt Nam';
function SLock(b, t) {
  const cb = SYNC.collapse[0];
  // seal rises out of the collapse flash
  const sp = E.outCubic(prog(b, cb - .1, T5 + 1.4));
  seal(960, lerp(HUB.y, 330, sp), lerp(60, 150, sp), 1, prog(b, cb - .2, cb + .3), prog(b, T5 + 1.2, T5 + 2.4));
  sparkBurst(b, cb, 960, HUB.y, HUE.brass, 71, 60, 1.3);
  if (b < T5) return;
  const wp = prog(b, T5 + .6, T5 + 1.5);
  ctx.save(); ctx.translate(0, (1 - E.outCubic(wp)) * 26); wordmark(W / 2, 584, 76, clamp(wp * 1.5), 'center'); ctx.restore();
  ctx.fillStyle = C.brass; const rw = 160 * E.outCubic(prog(b, T5 + 1.2, T5 + 2)); ctx.fillRect(W / 2 - rw / 2, 620, rw, 2);
  riseT('Gia phả văn bản pháp luật Việt Nam', W / 2, 676, { f: 'BVP', w: 500, s: 32, c: C.ink2, a: 'center' }, prog(b, T5 + 1.6, T5 + 2.4), 16);
  // call to action: the question box of the site
  const [c0, c1] = SYNC.cta;
  const ap = E.outCubic(prog(b, c0 - 1.2, c0 - .2));
  if (ap > 0) {
    const x0 = CTA.x - CTA.w / 2, y0 = CTA.y - CTA.h / 2 + (1 - ap) * 24;
    ctx.save(); ctx.globalAlpha *= clamp(ap * 1.5);
    glowAt(CTA.x, CTA.y, 520, HUE.brass, .08, 55);
    ctx.fillStyle = 'rgba(14,16,21,.94)'; rr(ctx, x0, y0, CTA.w, CTA.h, CTA.h / 2); ctx.fill();
    ctx.strokeStyle = hsl(HUE.brass, .55 + .45 * Math.sin(prog(b, c1, c1 + 1) * Math.PI), 62); ctx.lineWidth = 2; ctx.stroke();
    const n = Math.round(CTA_TEXT.length * prog(b, c0, c1 - .6));
    const st = { f: 'BVP', w: 400, s: 26, c: C.paper };
    if (n > 0) T(CTA_TEXT.slice(0, n), x0 + 40, y0 + 54, st);
    else T('Nhập câu hỏi…', x0 + 40, y0 + 54, { ...st, c: C.ink3 });
    if (Math.floor(b * 3) % 2 === 0 || n < CTA_TEXT.length) { ctx.fillStyle = C.brass; ctx.fillRect(x0 + 42 + measure(CTA_TEXT.slice(0, n), st), y0 + 24, 2.5, 38); }
    // button
    const bp = E.outBack(prog(b, c1, c1 + .5)), bw = 190, bx = x0 + CTA.w - bw - 12, by = y0 + 12;
    if (bp > 0) {
      ctx.save(); ctx.translate(bx + bw / 2, by + 31); ctx.scale(bp, bp);
      ctx.fillStyle = C.brass; rr(ctx, -bw / 2, -31, bw, 62, 31); ctx.fill();
      T('Hỏi ngay  →', 0, 9, { f: 'BVP', w: 600, s: 24, c: '#14161b', a: 'center' });
      ctx.restore();
    }
    ctx.restore();
  }
  riseT('Mục “Hỏi AI” trên Lex & Lineage · tiếng Việt và tiếng Anh', W / 2, 926, { f: 'BVP', w: 400, s: 24, c: C.ink3, a: 'center' }, prog(b, c1 + .4, c1 + 1.2), 12);
  T('Thông tin tham khảo, không thay thế ý kiến pháp lý cho vụ việc cụ thể. Câu trả lời trong video là minh họa.', W / 2, 1010,
    { f: 'BVP', w: 400, s: 18, c: C.ink3, a: 'center', al: prog(b, c1 + .8, c1 + 1.6) * .85 });
}

// ---------- overlays & post ----------
function hud(b) {
  const a = .7 * prog(b, .6, 1.6) * (1 - prog(b, T5 - .6, T5 + .2));
  if (a <= 0) return;
  let label = 'MỞ ĐẦU';
  if (b >= 12) label = 'GIA PHẢ VĂN BẢN';
  if (b >= T_CHAT) label = 'TRỢ LÝ AI';
  if (b >= T4) label = 'CÔNG CỤ';
  if (b >= TB) label = 'PHẠM VI';
  ctx.save(); ctx.globalAlpha = a;
  T('LEX & LINEAGE', 80, 76, { f: 'BVP', w: 600, s: 15, ls: 5, c: C.ink3 });
  T(label, W - 80, 76, { f: 'BVP', w: 600, s: 15, ls: 5, c: C.ink3, a: 'right' });
  ctx.strokeStyle = C.brass; ctx.globalAlpha = a * .45; ctx.lineWidth = 1.5;
  for (const [x, y, sx, sy] of [[44, 44, 1, 1], [W - 44, 44, -1, 1], [44, H - 44, 1, -1], [W - 44, H - 44, -1, -1]]) {
    ctx.beginPath(); ctx.moveTo(x, y + sy * 26); ctx.lineTo(x, y); ctx.lineTo(x + sx * 26, y); ctx.stroke();
  }
  ctx.fillStyle = C.brass; ctx.globalAlpha = a * .6; ctx.fillRect(0, H - 3, W * clamp(b / T5), 3);
  ctx.restore();
}
/** Brass light sweep across the frame at scene cuts. */
function sweep(b) {
  for (const c of [12, T_CHAT, T4, TB]) {
    const p = prog(b, c - .5, c + .7);
    if (p <= 0 || p >= 1) continue;
    const x = lerp(-700, W + 700, E.inOutCubic(p));
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(x - 380, 0, x + 380, 0);
    g.addColorStop(0, 'rgba(201,169,97,0)'); g.addColorStop(.5, `rgba(201,169,97,${.16 * Math.sin(p * Math.PI)})`); g.addColorStop(1, 'rgba(201,169,97,0)');
    ctx.fillStyle = g; ctx.translate(x, H / 2); ctx.transform(1, 0, -.35, 1, 0, 0); ctx.translate(-x, -H / 2);
    ctx.fillRect(x - 400, -100, 800, H + 200);
    ctx.restore();
  }
}
function shakeAt(b) {
  let s = 0;
  for (const [ib, amp] of SYNC.impacts) { const d = b - ib; if (d >= 0 && d < 1) s = Math.max(s, amp * Math.exp(-d * 7)); }
  return s;
}
function post(b, t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  sweep(b);
  ctx.drawImage(vigC, 0, 0);
  // grain changes every second frame: lighter on the encoder, same look
  ctx.save(); ctx.globalAlpha = .045;
  const k = Math.floor(t * 30), ox = Math.floor(hash(k * 91) * 256), oy = Math.floor(hash(k * 37) * 256);
  ctx.translate(-ox, -oy); ctx.fillStyle = ctx.createPattern(grainC, 'repeat'); ctx.fillRect(0, 0, W + 256, H + 256);
  ctx.restore();
  const fi = 1 - prog(b, 0, .8), fo = prog(b, TOTAL_BEATS - 1.4, TOTAL_BEATS - .4);
  const blk = Math.max(fi, fo);
  if (blk > 0) { ctx.fillStyle = '#000'; ctx.globalAlpha = blk; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
}

function renderFrame(t) {
  const b = t / B;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(bgC, 0, 0);
  dust(t, .9);
  // slow push-in per scene, plus a short shake on impacts
  const starts = SYNC.scenes;
  let k = 0; while (k < starts.length - 2 && b >= starts[k + 1]) k++;
  const z = 1 + .018 * E.outCubic(prog(b, starts[k], starts[k + 1]));
  const sh = shakeAt(b) * 7;
  ctx.save();
  ctx.translate(W / 2 + (hash(t * 113) - .5) * 2 * sh, H / 2 + (hash(t * 57 + 1) - .5) * 2 * sh);
  ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  if (b < 12) S1(b, t);
  else if (b < T_CHAT) S2(b, t);
  else if (b < T4) SChat(b, t);
  else if (b < TB) S4(b, t);
  else if (b < SYNC.collapse[0] + .6) { SBurst(b, t); if (b >= SYNC.collapse[0] - .2) SLock(b, t); }
  else SLock(b, t);
  ctx.restore();
  hud(b);
  post(b, t);
}


async function init() {
  const faces = [
    new FontFace('BVP', 'url(fonts/BeVietnamPro-Regular.ttf)', { weight: '400' }),
    new FontFace('BVP', 'url(fonts/BeVietnamPro-Medium.ttf)', { weight: '500' }),
    new FontFace('BVP', 'url(fonts/BeVietnamPro-SemiBold.ttf)', { weight: '600' }),
    new FontFace('BVP', 'url(fonts/BeVietnamPro-ExtraBold.ttf)', { weight: '800' }),
    new FontFace('Lora', 'url(fonts/Lora.ttf)', { weight: '400 700' }),
    new FontFace('Lora', 'url(fonts/Lora-Italic.ttf)', { weight: '400 700', style: 'italic' }),
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
