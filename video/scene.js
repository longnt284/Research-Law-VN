/* Lex & Lineage — video giới thiệu (16:9, 1920×1080).
 * Every frame is a pure function of time t (seconds), so frames can be
 * rendered in any order and in parallel. Time is mostly expressed in beats
 * (110 BPM) so picture and the synthesized soundtrack stay locked.
 *
 * Palette, type and relation styles mirror the site's dark theme
 * (src/app/globals.css). Every law number and date on screen comes from
 * src/data/documents.ts and src/data/comparisons.ts. */

const W = 1920, H = 1080;
const BPM = 110, B = 60 / BPM;
const TOTAL_BEATS = 92;
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
// impacts: [beat, strength]; ticks: clock span of the date scrub; pops: tree nodes;
// domains: one bar per domain; flip, rows, feed: interface events in the tools scene.
/*SYNC*/
const SYNC = {
  "impacts": [[8, 1], [20, 0.85], [80, 0.7], [84, 0.55]],
  "ticks": [4.5, 8],
  "pops": [13, 13.5, 14, 14.5, 15, 15.5, 16, 16.5],
  "domains": [28, 32, 36, 40, 44, 48, 52, 56, 60, 64],
  "flip": [69.8],
  "rows": [72.8, 73.3, 73.8],
  "feed": [76.6, 77, 77.4, 77.8]
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
  'to-tung': ['M24 5v37M15 42h18M9 12h30', circ(24, 7.5, 2), 'M9 12 4 26M9 12l5 14M39 12l-5 14M39 12l5 14', 'M3 26h12a6 5 0 0 1-12 0zM33 26h12a6 5 0 0 1-12 0z'],
  'doanh-nghiep': ['M9 7h19v37h-19z', 'M28 19h12v25h-12z', 'M13 13h3.5M20.5 13H24M13 19h3.5M20.5 19H24M13 25h3.5M20.5 25H24M13 31h3.5M20.5 31H24', 'M32 25h4M32 31h4M16.5 44v-6h4v6M5 44h39'],
  'dau-tu': ['M6 42h36M6 42V7', 'M10 34l8.5-8.5 7 6L37 18', 'M31 18h6v6', circ(38, 35, 4.5), 'M38 32.5v5'],
  'lao-dong': ['M10 31a14 14 0 0 1 28 0', 'M6 31h36v4H6z', 'M20.5 18.2V13h7v5.2M24 13v18', 'M14 41h20'],
  'thue': ['M12 4h24v40l-4-3-4 3-4-3-4 3-4-3-4 3z', 'M18 30l12-12', circ(19, 19, 2.2), circ(29, 29, 2.2), 'M18 36h12'],
  'dat-dai': ['M5 37 14 12l23 5 6 21-21 6z', circ(5, 37, 1.8), circ(14, 12, 1.8), circ(37, 17, 1.8), circ(43, 38, 1.8), circ(22, 44, 1.8), 'M24 32V18l8 3-8 3'],
  'ppp': ['M3 31h42M12 31V13M36 31V13', 'M12 13q12 16 24 0M12 13 4 31M36 13l8 18', 'M18 31v-7M24 31v-5M30 31v-7', 'M8 38c4-2 8 2 12 0s8 2 12 0 8 2 12 0'],
};
const DOMAINS = [
  { id: 'xay-dung', hue: 24, name: 'Xây dựng', short: 'Xây dựng', keys: ['Quy hoạch', 'Cấp phép', 'Thi công', 'Nghiệm thu'], law: 'Luật Xây dựng', no: '135/2025/QH15', eff: '01/07/2026' },
  { id: 'nang-luong', hue: 43, name: 'Năng lượng', short: 'Năng lượng', keys: ['Nguồn điện', 'Mua bán điện trực tiếp', 'Năng lượng tái tạo'], law: 'Luật Điện lực', no: '61/2024/QH15', eff: '01/02/2025' },
  { id: 'hop-dong', hue: 212, name: 'Hợp đồng thương mại', short: 'Hợp đồng', keys: ['Giao kết', 'Hiệu lực', 'Vi phạm', 'Chế tài'], law: 'Bộ luật Dân sự', no: '91/2015/QH13', eff: '01/01/2017' },
  { id: 'to-tung', hue: 352, name: 'Tố tụng & Trọng tài', short: 'Tố tụng', keys: ['Tòa án', 'Trọng tài', 'Thi hành phán quyết nước ngoài'], law: 'Bộ luật Tố tụng dân sự', no: '92/2015/QH13', eff: '01/07/2016' },
  { id: 'doanh-nghiep', hue: 268, name: 'Doanh nghiệp', short: 'Doanh nghiệp', keys: ['Thành lập', 'Quản trị', 'Tổ chức lại', 'Phá sản'], law: 'Luật Doanh nghiệp', no: '59/2020/QH14', eff: '01/01/2021' },
  { id: 'dau-tu', hue: 176, name: 'Đầu tư', short: 'Đầu tư', keys: ['Chấp thuận chủ trương', 'Ngành nghề có điều kiện', 'Ưu đãi'], law: 'Luật Đầu tư', no: '143/2025/QH15', eff: '01/03/2026' },
  { id: 'lao-dong', hue: 148, name: 'Lao động', short: 'Lao động', keys: ['Hợp đồng lao động', 'Tiền lương', 'Bảo hiểm xã hội'], law: 'Bộ luật Lao động', no: '45/2019/QH14', eff: '01/01/2021' },
  { id: 'thue', hue: 302, name: 'Thuế', short: 'Thuế', keys: ['Giá trị gia tăng', 'Thu nhập doanh nghiệp', 'Quản lý thuế'], law: 'Luật Quản lý thuế', no: '108/2025/QH15', eff: '01/07/2026' },
  { id: 'dat-dai', hue: 96, name: 'Đất đai & Bất động sản', short: 'Đất đai', keys: ['Quyền sử dụng đất', 'Giá đất', 'Thu hồi, bồi thường'], law: 'Luật Đất đai', no: '31/2024/QH15', eff: '01/08/2024' },
  { id: 'ppp', hue: 240, name: 'Đối tác công tư', short: 'PPP', keys: ['Lựa chọn nhà đầu tư', 'Vốn nhà nước', 'Hợp đồng BT'], law: 'Luật Đầu tư theo phương thức đối tác công tư', no: '64/2020/QH14', eff: '01/01/2021' },
];

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
// S3 — ten domains, one bar each (beats 24–68)
// =====================================================================
const RAIL = { x0: 250, x1: 1670, y: 950 };
const railX = i => lerp(RAIL.x0, RAIL.x1, i / 9);
const MED = { x: 540, y: 480, r: 210 };
function rail(b, al) {
  if (al <= 0) return;
  const cur = clamp(Math.floor((b - 28) / 4), -1, 9);
  const draw = E.inOutCubic(prog(b, 25.5, 27.5));
  ctx.save(); ctx.globalAlpha *= al;
  ctx.strokeStyle = C.rule; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(RAIL.x0, RAIL.y); ctx.lineTo(lerp(RAIL.x0, RAIL.x1, draw), RAIL.y); ctx.stroke();
  // travelled thread, brass
  const pos = clamp((b - 28) / 4, 0, 9.999);
  const tx = b < 28 ? RAIL.x0 : lerp(railX(Math.floor(pos)), railX(Math.min(9, Math.floor(pos) + 1)), Math.floor(pos) >= 9 ? 0 : E.inOutCubic(prog(pos % 1, .85, 1)));
  ctx.strokeStyle = C.brass; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(RAIL.x0, RAIL.y); ctx.lineTo(tx, RAIL.y); ctx.stroke();
  DOMAINS.forEach((d, i) => {
    const x = railX(i), appear = prog(draw, i / 10, i / 10 + .15);
    if (appear <= 0) return;
    const visited = i <= cur, isCur = i === cur;
    const lb = b - SYNC.domains[i];
    ctx.save(); ctx.globalAlpha *= appear;
    if (visited) {
      ctx.fillStyle = hsl(d.hue); ctx.beginPath(); ctx.arc(x, RAIL.y, isCur ? 10 : 7, 0, Math.PI * 2); ctx.fill();
      if (isCur && lb < 1.5) { ctx.strokeStyle = hsl(d.hue, 1 - lb / 1.5); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, RAIL.y, 10 + E.outExpo(lb / 1.5) * 34, 0, Math.PI * 2); ctx.stroke(); }
    } else {
      ctx.fillStyle = '#0d0f13'; ctx.strokeStyle = C.ruleStrong; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, RAIL.y, 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
    T(d.short, x, RAIL.y + 42, { f: 'BVP', w: isCur ? 600 : 500, s: 18, c: isCur ? C.paper : C.ink3, a: 'center' });
    ctx.restore();
  });
  ctx.restore();
}
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
function medallion(b, t) {
  const i = clamp(Math.floor((b - 28) / 4), 0, 9), d = DOMAINS[i], lb = b - SYNC.domains[i];
  const prev = DOMAINS[Math.max(0, i - 1)];
  const enter = b < 28 ? 0 : 1;
  const a = prog(b, 27.4, 28.4) * (1 - prog(b, 67.4, 68.2));
  if (a <= 0) return;
  const hueMix = i === 0 ? d.hue : lerpHue(prev.hue, d.hue, E.inOutCubic(prog(lb, 0, .6)));
  ctx.save(); ctx.globalAlpha *= a;
  glowAt(MED.x, MED.y, 560, hueMix, .16, 55);
  // dial ticks turning slowly, like the edge of a seal
  ctx.save(); ctx.translate(MED.x, MED.y); ctx.rotate(t * .06);
  ctx.strokeStyle = C.ruleStrong; ctx.lineWidth = 2;
  for (let k = 0; k < 72; k++) {
    const r0 = MED.r + 18, r1 = MED.r + (k % 6 === 0 ? 34 : 26), ang = k / 72 * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(Math.cos(ang) * r0, Math.sin(ang) * r0); ctx.lineTo(Math.cos(ang) * r1, Math.sin(ang) * r1); ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(12,14,18,.75)'; ctx.beginPath(); ctx.arc(MED.x, MED.y, MED.r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = C.rule; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(MED.x, MED.y, MED.r - 16, 0, Math.PI * 2); ctx.stroke();
  const ring = enter ? E.inOutCubic(prog(lb, 0, .9)) : 0;
  ctx.strokeStyle = hsl(hueMix); ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(MED.x, MED.y, MED.r, -Math.PI / 2, -Math.PI / 2 + Math.max(.001, ring) * Math.PI * 2); ctx.stroke();
  // glyph: previous fades, current draws on
  if (i > 0 && lb < .5) glyph(prev, MED.x, MED.y, 250, 1, hsl(prev.hue, 1 - lb / .5));
  if (enter) glyph(d, MED.x, MED.y, 250, prog(lb, .15, 1.6), hsl(d.hue));
  T(pad2(i + 1), MED.x, MED.y + MED.r - 40, { f: 'Lora', it: true, w: 500, s: 26, c: hsl(d.hue), a: 'center', al: prog(lb, .4, .9) });
  ctx.restore();
  if (enter) sparkBurst(b, SYNC.domains[i], MED.x, MED.y, d.hue, 40 + i, 26, .7);
}
function lerpHue(a, b, t) { let d = ((b - a + 540) % 360) - 180; return (a + d * t + 360) % 360; }
function domainText(b) {
  if (b < 28 || b >= 68) return;
  const i = Math.floor((b - 28) / 4), d = DOMAINS[i], lb = b - SYNC.domains[i];
  const out = i === 9 ? prog(b, 67.2, 67.9) : prog(lb, 3.45, 3.95);
  const x = 900;
  ctx.save(); ctx.globalAlpha *= 1 - out; ctx.translate(-50 * E.inCubic(out), 0);
  riseT(`LĨNH VỰC ${pad2(i + 1)} / 10`, x, 292, { f: 'BVP', w: 600, s: 19, ls: 5, c: C.brass }, prog(lb, .05, .5), 16);
  const nameSt = fit(d.name, { f: 'Lora', w: 600, s: 96, c: C.paper }, 860);
  // name rises out of a mask
  {
    const p = E.outCubic(prog(lb, .12, .75));
    ctx.save(); ctx.beginPath(); ctx.rect(x - 20, 290, 1000, 128); ctx.clip();
    T(d.name, x, 398 + (1 - p) * 110, nameSt);
    ctx.restore();
  }
  {
    const p = prog(lb, .45, 1);
    ctx.save(); ctx.globalAlpha *= clamp(p * 1.5); ctx.translate(0, (1 - E.outCubic(p)) * 18);
    const segs = [];
    d.keys.forEach((k, j) => { if (j) segs.push(['  ·  ', { c: hsl(d.hue) }]); segs.push([k, {}]); });
    rich(segs, x, 466, fit(d.keys.join('  ·  '), { f: 'BVP', w: 400, s: 30, c: C.ink2 }, 900));
    ctx.restore();
  }
  ctx.fillStyle = C.rule; ctx.fillRect(x, 522, 860 * E.outCubic(prog(lb, .6, 1.2)), 1.5);
  ctx.fillStyle = hsl(d.hue); ctx.fillRect(x, 521, 90 * E.outCubic(prog(lb, .7, 1.2)), 3);
  riseT('VĂN BẢN NỀN TẢNG', x, 568, { f: 'BVP', w: 600, s: 16, ls: 4, c: C.ink3 }, prog(lb, .75, 1.2), 14);
  riseT(d.law, x, 626, fit(d.law, { f: 'Lora', w: 600, s: 44, c: C.paper }, 880), prog(lb, .85, 1.35), 18);
  {
    const p = prog(lb, 1, 1.5);
    ctx.save(); ctx.globalAlpha *= clamp(p * 1.5); ctx.translate(0, (1 - E.outCubic(p)) * 16);
    rich([[d.no, { w: 600, c: hsl(d.hue, 1, 74) }], ['   ·   có hiệu lực từ ', {}], [d.eff, { w: 600, c: C.paper }]], x, 676, { f: 'BVP', w: 400, s: 28, c: C.ink2 });
    ctx.restore();
  }
  ctx.restore();
}
function S3(b, t) {
  // intro title
  const ia = 1 - prog(b, 27, 27.8);
  if (ia > 0) {
    riseT('PHẠM VI TRA CỨU', W / 2, 380, { f: 'BVP', w: 600, s: 20, ls: 6, c: C.brass, a: 'center', al: ia }, prog(b, 24.1, 24.8), 16);
    const p = prog(b, 24.4, 25.3);
    ctx.save(); ctx.globalAlpha *= clamp(p * 1.5) * ia; ctx.translate(0, (1 - E.outCubic(p)) * 34);
    rich([['10', { it: true, w: 500, c: C.brass }], [' lĩnh vực pháp luật', {}]], W / 2, 510, { f: 'Lora', w: 600, s: 112, c: C.paper }, 'center');
    ctx.restore();
    riseT('từ công trường đến phòng xử án', W / 2, 590, { f: 'Lora', it: true, w: 400, s: 42, c: C.ink2, a: 'center', al: ia }, prog(b, 25.1, 26), 20);
  }
  medallion(b, t);
  domainText(b);
  rail(b, 1 - prog(b, 67.4, 68.2));
}

// =====================================================================
// S4 — three tools (beats 68–80)
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
  const mid = SYNC.flip[0] - 68, fp = prog(lb, mid - .175, mid + .175), after = fp >= .5;
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
    const y = PANEL.y + 262 + i * 110, rp = prog(lb, SYNC.rows[i] - 72, SYNC.rows[i] - 72 + .45);
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
    const y = PANEL.y + 170 + i * 104, rp = prog(lb, SYNC.feed[i] - 76, SYNC.feed[i] - 76 + .45);
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
  const j = clamp(Math.floor((b - 68) / 4), 0, 2), f = FEATURES[j], lb = b - 68 - j * 4;
  const enter = prog(b, 68, 68.8), exit = prog(b, 79.2, 80);
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
// S5 — lockup (beats 80–92)
// =====================================================================
function S5(b, t) {
  const cx = 960, cy = 450, R = 300;
  const collapse = E.inExpo(prog(b, 84, 84.9));
  const ringA = prog(b, 80, 81) * (1 - prog(b, 84.6, 85));
  const rot = (b - 80) * .035;
  const pts = DOMAINS.map((d, i) => {
    const a = -Math.PI / 2 + i / 10 * Math.PI * 2 + rot, r = lerp(R, 0, collapse) * E.outCubic(prog(b, 80 + i * .08, 81 + i * .08));
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, a];
  });
  if (ringA > 0) {
    ctx.save(); ctx.globalAlpha *= ringA;
    glowAt(cx, cy, 620, HUE.brass, .08, 55);
    ctx.strokeStyle = C.brass; ctx.lineWidth = 1.5;
    ctx.save(); ctx.globalAlpha *= .35;
    ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.stroke();
    ctx.globalAlpha *= .4;
    pts.forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke(); });
    ctx.restore();
    DOMAINS.forEach((d, i) => {
      const [x, y, a] = pts[i];
      glowAt(x, y, 60, d.hue, .35, 60);
      ctx.fillStyle = hsl(d.hue); ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill();
      const lx = x + Math.cos(a) * 34, ly = y + Math.sin(a) * 34 + 7, al = Math.cos(a) > .2 ? 'left' : Math.cos(a) < -.2 ? 'right' : 'center';
      T(d.short, lx, ly + (Math.sin(a) > .9 ? 12 : Math.sin(a) < -.9 ? -8 : 0), { f: 'BVP', w: 500, s: 19, c: C.ink2, a: al, al: 1 - collapse * 3 });
    });
    ctx.restore();
  }
  // seal travels up and grows as the ring collapses into it
  const up = E.inOutCubic(prog(b, 84.4, 85.6));
  const sa = prog(b, 80.2, 81.2) * (1 - prog(b, 90, 91.4));
  seal(cx, lerp(cy, 330, up), lerp(150, 160, up), 1, sa, b < 84 ? prog(b, 81, 82.2) : prog(b, 85.4, 86.6));
  sparkBurst(b, 84.9, cx, lerp(cy, 330, up), HUE.brass, 71, 60, 1.3);
  // stats line
  const sp = prog(b, 81.2, 82);
  const stA = clamp(sp * 1.5) * (1 - prog(b, 84, 84.6));
  if (stA > 0) {
    ctx.save(); ctx.globalAlpha *= stA; ctx.translate(0, (1 - E.outCubic(sp)) * 20);
    const g = { it: true, w: 500, c: C.brass };
    rich([['10', g], [' lĩnh vực', {}], ['   ·   ', { c: C.ruleStrong }], ['140+', g], [' văn bản', {}], ['   ·   ', { c: C.ruleStrong }], ['1', g], [' gia phả', {}]],
      W / 2, 880, { f: 'Lora', w: 600, s: 54, c: C.paper }, 'center');
    ctx.restore();
  }
  // final lockup
  const end = 1 - prog(b, 90, 91.4);
  const wp = prog(b, 85.2, 86.2);
  ctx.save(); ctx.globalAlpha *= end;
  ctx.save(); ctx.translate(0, (1 - E.outCubic(wp)) * 26); wordmark(W / 2, 640, 76, clamp(wp * 1.5), 'center'); ctx.restore();
  ctx.fillStyle = C.brass; const rw = 160 * E.outCubic(prog(b, 85.8, 86.6)); ctx.fillRect(W / 2 - rw / 2, 678, rw, 2);
  riseT('Gia phả văn bản pháp luật Việt Nam', W / 2, 736, { f: 'BVP', w: 500, s: 32, c: C.ink2, a: 'center' }, prog(b, 86.1, 86.9), 16);
  riseT('Mỗi văn bản kèm nguồn chính thức và ngày tra cứu.', W / 2, 792, { f: 'Lora', it: true, w: 400, s: 28, c: C.ink3, a: 'center' }, prog(b, 86.7, 87.5), 14);
  T('Thông tin tham khảo, không thay thế ý kiến pháp lý cho vụ việc cụ thể.', W / 2, 1000,
    { f: 'BVP', w: 400, s: 19, c: C.ink3, a: 'center', al: prog(b, 87.2, 88) * .8 });
  ctx.restore();
}

// ---------- overlays & post ----------
function hud(b) {
  const a = .7 * prog(b, .6, 1.6) * (1 - prog(b, 79.4, 80.2));
  if (a <= 0) return;
  let label = 'MỞ ĐẦU';
  if (b >= 12) label = 'GIA PHẢ VĂN BẢN';
  if (b >= 24) label = 'LĨNH VỰC' + (b >= 28 && b < 68 ? ` · ${pad2(Math.floor((b - 28) / 4) + 1)} / 10` : '');
  if (b >= 68) label = 'CÔNG CỤ';
  ctx.save(); ctx.globalAlpha = a;
  T('LEX & LINEAGE', 80, 76, { f: 'BVP', w: 600, s: 15, ls: 5, c: C.ink3 });
  T(label, W - 80, 76, { f: 'BVP', w: 600, s: 15, ls: 5, c: C.ink3, a: 'right' });
  ctx.strokeStyle = C.brass; ctx.globalAlpha = a * .45; ctx.lineWidth = 1.5;
  for (const [x, y, sx, sy] of [[44, 44, 1, 1], [W - 44, 44, -1, 1], [44, H - 44, 1, -1], [W - 44, H - 44, -1, -1]]) {
    ctx.beginPath(); ctx.moveTo(x, y + sy * 26); ctx.lineTo(x, y); ctx.lineTo(x + sx * 26, y); ctx.stroke();
  }
  ctx.fillStyle = C.brass; ctx.globalAlpha = a * .6; ctx.fillRect(0, H - 3, W * clamp(b / 80), 3);
  ctx.restore();
}
/** Brass light sweep across the frame at scene cuts. */
function sweep(b) {
  for (const c of [12, 24, 68, 80]) {
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
  const fi = 1 - prog(b, 0, .8), fo = prog(b, 90.6, 91.6);
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
  const starts = [0, 12, 24, 68, 80, 92];
  let k = 0; while (b >= starts[k + 1]) k++;
  const z = 1 + .018 * E.outCubic(prog(b, starts[k], starts[k + 1]));
  const sh = shakeAt(b) * 7;
  ctx.save();
  ctx.translate(W / 2 + (hash(t * 113) - .5) * 2 * sh, H / 2 + (hash(t * 57 + 1) - .5) * 2 * sh);
  ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  if (b < 12) S1(b, t);
  else if (b < 24) S2(b, t);
  else if (b < 68) S3(b, t);
  else if (b < 80) S4(b, t);
  else S5(b, t);
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
