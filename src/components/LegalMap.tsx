"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { DomainId, Lang } from "@/data/types";
import { getDict } from "@/i18n/dictionary";
import { buildLayout, type NodeLayout, WORLD } from "@/lib/layout";

/**
 * Bản đồ quan hệ văn bản, vẽ trên canvas 2D.
 *
 * Ba quyết định giữ cho thao tác luôn mượt:
 *
 * 1. Camera nằm trong ref, không nằm trong state của React. Kéo và phóng to
 *    không kích hoạt một lần render lại nào của React; chúng chỉ đánh dấu khung
 *    hình là "cần vẽ".
 * 2. Vòng lặp vẽ tự tắt. Khi không còn gì thay đổi, requestAnimationFrame dừng
 *    hẳn thay vì quay vô ích sáu mươi lần mỗi giây.
 * 3. Bố cục tính sẵn một lần. Trong mỗi khung hình chỉ còn phép nhân toạ độ và
 *    lệnh vẽ, không có bước mô phỏng vật lý nào.
 */

/*
  Ngưỡng thu nhỏ phải đủ thấp để toàn bộ bản đồ lọt vào một màn hình điện thoại.
  Đặt ngưỡng này ở 0.28 như ban đầu thì trên khung 390 pixel, fitView bị kẹp lại
  và bản đồ tràn ra ngoài bốn phía — đúng lỗi đó đã xảy ra trong lần dựng đầu.
*/
const MIN_SCALE = 0.09;
const MAX_SCALE = 3.2;
/** Dưới ngưỡng này thì chỉ nhãn của văn bản cấp luật mới được vẽ. */
const LABEL_SCALE_GATE = 0.72;
/** Dưới ngưỡng này thì không vẽ nhãn nào, trừ điểm đang chọn hoặc đang trỏ tới. */
const LABEL_HARD_GATE = 0.3;

interface Palette {
  ink: string;
  ink2: string;
  ink3: string;
  rule: string;
  paper: string;
  accent: string;
  nodeL: number;
  nodeC: number;
}

function readPalette(): Palette {
  const s = getComputedStyle(document.documentElement);
  const num = (v: string, fb: number) => {
    const n = parseFloat(s.getPropertyValue(v));
    return Number.isFinite(n) ? n : fb;
  };
  const str = (v: string, fb: string) => s.getPropertyValue(v).trim() || fb;
  return {
    ink: str("--ink", "#16181d"),
    ink2: str("--ink-2", "#3d434e"),
    ink3: str("--ink-3", "#6b7280"),
    rule: str("--rule", "#d9d2c4"),
    paper: str("--paper", "#faf8f4"),
    accent: str("--accent", "#7a2c1f"),
    nodeL: num("--node-lightness", 42),
    nodeC: num("--node-chroma", 46),
  };
}

export interface LegalMapProps {
  lang: Lang;
  activeDomain: DomainId | "all";
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Tăng giá trị này để yêu cầu bản đồ đưa khung nhìn về mặc định. */
  resetSignal: number;
}

export function LegalMap({
  lang,
  activeDomain,
  selectedId,
  onSelect,
  resetSignal,
}: LegalMapProps) {
  const t = getDict(lang);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const { nodes, edges } = useMemo(() => buildLayout(), []);

  const adjacency = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const e of edges) {
      if (!m.has(e.from)) m.set(e.from, new Set());
      if (!m.has(e.to)) m.set(e.to, new Set());
      m.get(e.from)!.add(e.to);
      m.get(e.to)!.add(e.from);
    }
    return m;
  }, [edges]);

  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  // ── Trạng thái nằm ngoài React ───────────────────────────────────────────
  // Những giá trị này đổi ở tần suất khung hình. Đưa vào state của React nghĩa
  // là ép dựng lại cây component mỗi lần con trỏ nhích một pixel.
  const cam = useRef({ x: WORLD.w / 2, y: WORLD.h / 2, scale: 0.62 });
  const size = useRef({ w: 0, h: 0, dpr: 1 });
  const hoverId = useRef<string | null>(null);
  const dirty = useRef(true);
  const rafId = useRef<number | null>(null);
  const palette = useRef<Palette | null>(null);
  /** Vùng bị chú giải và dòng hướng dẫn che, tính theo toạ độ khung vẽ. */
  const reserved = useRef<{ x1: number; y1: number; x2: number; y2: number }[]>([]);
  const textWidths = useRef(new Map<string, number>());
  /**
   * Họ chữ dùng cho nhãn, đọc một lần.
   *
   * `getComputedStyle` ép trình duyệt tính lại kiểu dáng ngay tại chỗ gọi. Gọi
   * nó trong vòng vẽ nghĩa là mỗi khung hình kéo hoặc phóng to đều trả thêm một
   * lần tính đó, cho một giá trị không đổi.
   */
  const labelFont = useRef<string | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  /** `mid` là điểm giữa hai ngón ở lần đo trước, dùng để neo khi chụm và tách. */
  const pinchStart = useRef<{
    dist: number;
    scale: number;
    mid: { x: number; y: number };
  } | null>(null);
  const dragged = useRef(false);
  const selectedRef = useRef<string | null>(selectedId);
  const domainRef = useRef<DomainId | "all">(activeDomain);
  const drawRef = useRef<() => void>(() => {});

  const [cursor, setCursor] = useState<"grab" | "grabbing" | "pointer">("grab");

  /**
   * Đánh dấu cần vẽ lại và khởi động vòng lặp nếu nó đang ngủ.
   *
   * Không phụ thuộc `draw` mà gọi qua `drawRef`, nhờ vậy hàm này ổn định suốt
   * vòng đời component và mọi effect bên dưới có thể nhận nó làm phụ thuộc mà
   * không bị dựng lại.
   */
  const kick = useCallback(() => {
    dirty.current = true;
    if (rafId.current !== null) return;
    const loop = () => {
      rafId.current = null;
      if (!dirty.current) return;
      drawRef.current();
      if (dirty.current && rafId.current === null) {
        rafId.current = requestAnimationFrame(loop);
      }
    };
    rafId.current = requestAnimationFrame(loop);
  }, []);

  const isDimmed = useCallback((n: NodeLayout) => {
    const d = domainRef.current;
    if (d === "all") return false;
    return !n.doc.domains.includes(d);
  }, []);

  const worldToScreen = useCallback((wx: number, wy: number) => {
    const c = cam.current;
    const { w, h } = size.current;
    return { x: (wx - c.x) * c.scale + w / 2, y: (wy - c.y) * c.scale + h / 2 };
  }, []);

  const screenToWorld = useCallback((sx: number, sy: number) => {
    const c = cam.current;
    const { w, h } = size.current;
    return { x: (sx - w / 2) / c.scale + c.x, y: (sy - h / 2) / c.scale + c.y };
  }, []);

  /** Tìm node dưới con trỏ. Với vài chục điểm, quét tuyến tính là đủ nhanh. */
  const pick = useCallback(
    (sx: number, sy: number): string | null => {
      const p = screenToWorld(sx, sy);
      let best: string | null = null;
      let bestDist = Infinity;
      for (const n of nodes) {
        if (isDimmed(n)) continue;
        const dx = n.x - p.x;
        const dy = n.y - p.y;
        const d2 = dx * dx + dy * dy;
        // Vùng bấm rộng hơn điểm vẽ một chút, để chạm trên điện thoại không hụt.
        const hit = n.r + 9 / cam.current.scale;
        if (d2 < hit * hit && d2 < bestDist) {
          bestDist = d2;
          best = n.id;
        }
      }
      return best;
    },
    [nodes, isDimmed, screenToWorld],
  );

  // ── Vẽ ──────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !ctx) return;
    if (!palette.current) palette.current = readPalette();
    const P = palette.current;
    const { w, h, dpr } = size.current;
    if (w === 0 || h === 0) return;

    const c = cam.current;
    const focus = selectedRef.current ?? hoverId.current;
    const near = focus ? adjacency.get(focus) : undefined;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = P.paper;
    ctx.fillRect(0, 0, w, h);

    // Lưới nền rất nhạt, cho mắt một mốc khi kéo. Chỉ vẽ khi đủ gần, nếu không
    // các đường sẽ dồn lại thành mảng xám.
    if (c.scale > 0.45) {
      const step = 130 * c.scale;
      const ox = (((w / 2 - c.x * c.scale) % step) + step) % step;
      const oy = (((h / 2 - c.y * c.scale) % step) + step) % step;
      ctx.strokeStyle = P.rule;
      ctx.globalAlpha = 0.28;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = ox; x < w; x += step) {
        ctx.moveTo(Math.round(x) + 0.5, 0);
        ctx.lineTo(Math.round(x) + 0.5, h);
      }
      for (let y = oy; y < h; y += step) {
        ctx.moveTo(0, Math.round(y) + 0.5);
        ctx.lineTo(w, Math.round(y) + 0.5);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // ── Cạnh ──
    // Ba loại quan hệ, ba kiểu nét: liền cho "quy định chi tiết", đứt cho
    // "sửa đổi", chấm cho "thay thế". Người đọc phân biệt được kể cả khi in
    // trắng đen hoặc khi không phân biệt được màu.
    for (const e of edges) {
      const a = nodeById.get(e.from);
      const b = nodeById.get(e.to);
      if (!a || !b) continue;

      const p1 = worldToScreen(a.x, a.y);
      const p2 = worldToScreen(b.x, b.y);
      // Bỏ qua cạnh nằm hoàn toàn ngoài khung nhìn.
      if (
        (p1.x < -60 && p2.x < -60) ||
        (p1.x > w + 60 && p2.x > w + 60) ||
        (p1.y < -60 && p2.y < -60) ||
        (p1.y > h + 60 && p2.y > h + 60)
      ) {
        continue;
      }

      const dim = isDimmed(a) || isDimmed(b);
      const related = focus !== null && (e.from === focus || e.to === focus);
      if (dim) ctx.globalAlpha = 0.05;
      else if (focus !== null && !related) ctx.globalAlpha = 0.12;
      else ctx.globalAlpha = related ? 0.95 : 0.44;

      ctx.strokeStyle = related ? P.accent : P.ink3;
      ctx.lineWidth = related ? 1.9 : 1.15;
      if (e.kind === "amends") ctx.setLineDash([6, 4]);
      else if (e.kind === "replaces") ctx.setLineDash([1.5, 4]);
      else ctx.setLineDash([]);

      // Cung cong nhẹ: hai văn bản nối nhau qua nhiều đường thì các đường không
      // đè lên nhau thành một vệt.
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy) || 1;
      const bow = Math.min(len * 0.12, 26);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.quadraticCurveTo(mx - (dy / len) * bow, my + (dx / len) * bow, p2.x, p2.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    // ── Điểm ──
    for (const n of nodes) {
      const p = worldToScreen(n.x, n.y);
      const r = Math.max(2.5, n.r * c.scale);
      if (p.x < -r * 2 || p.x > w + r * 2 || p.y < -r * 2 || p.y > h + r * 2) continue;

      const dim = isDimmed(n);
      const isFocus = n.id === focus;
      const isNear = near?.has(n.id) ?? false;

      ctx.globalAlpha = dim ? 0.16 : focus !== null && !isFocus && !isNear ? 0.4 : 1;

      // Viền màu giấy lót dưới điểm: khi một đường nối chạy ngang qua, điểm vẫn
      // tách khỏi đường thay vì dính thành một vệt.
      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 1.8, 0, Math.PI * 2);
      ctx.fillStyle = P.paper;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${n.hue} ${P.nodeC}% ${P.nodeL}%)`;
      ctx.fill();

      // Văn bản hết hiệu lực vẽ rỗng ruột, để trạng thái đọc được ngay trên bản
      // đồ mà không cần mở bảng chi tiết.
      if (n.doc.status === "expired") {
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, r - 3.2), 0, Math.PI * 2);
        ctx.fillStyle = P.paper;
        ctx.fill();
      }

      if (isFocus) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 5, 0, Math.PI * 2);
        ctx.strokeStyle = P.accent;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    // ── Nhãn, có chống chồng ──
    // Vẽ nhãn theo thứ tự ưu tiên rồi loại bỏ nhãn nào giao với nhãn đã đặt.
    // Đây là lý do chữ trên bản đồ không bao giờ đè lên nhau, kể cả khi thu nhỏ.
    const placed: { x1: number; y1: number; x2: number; y2: number }[] = [
      ...reserved.current,
    ];

    // Điểm được đưa vào danh sách chiếm chỗ TRƯỚC khi đặt nhãn. Nếu không, nhãn
    // của điểm này có thể phủ lên một điểm khác: chữ vẫn không chồng chữ, nhưng
    // người đọc mất một điểm trên bản đồ, và đó mới là thứ dễ gây nhầm.
    for (const n of nodes) {
      if (isDimmed(n)) continue;
      const p = worldToScreen(n.x, n.y);
      const r = Math.max(2.5, n.r * c.scale) + 2;
      if (p.x < -r || p.x > w + r || p.y < -r || p.y > h + r) continue;
      placed.push({ x1: p.x - r, y1: p.y - r, x2: p.x + r, y2: p.y + r });
    }

    const fontSize = 12.5;
    if (labelFont.current === null) {
      labelFont.current = getComputedStyle(document.body).fontFamily;
    }
    ctx.font = `500 ${fontSize}px ${labelFont.current}`;
    ctx.textBaseline = "middle";

    const order = [...nodes].sort((a, b) => {
      const fa = a.id === focus ? -3 : (near?.has(a.id) ?? false) ? -2 : 0;
      const fb = b.id === focus ? -3 : (near?.has(b.id) ?? false) ? -2 : 0;
      if (fa !== fb) return fa - fb;
      if (a.rank !== b.rank) return a.rank - b.rank;
      return b.degree - a.degree;
    });

    for (const n of order) {
      if (isDimmed(n)) continue;
      const isFocus = n.id === focus;
      const isNear = near?.has(n.id) ?? false;
      // Thu nhỏ hết cỡ, chẳng hạn khi cả bản đồ phải lọt vào màn hình điện thoại,
      // thì bỏ hẳn nhãn. Ở mức đó mỗi điểm chỉ còn vài pixel, nhãn không giúp đọc
      // thêm được gì mà lại tràn qua mép phải của khung vẽ.
      if (c.scale < LABEL_HARD_GATE && !isFocus && !isNear) continue;
      // Khi thu nhỏ vừa phải, chỉ luật gốc mới giữ nhãn; nếu không thì chữ dày
      // đặc và không đọc được gì.
      if (c.scale < LABEL_SCALE_GATE && n.rank > 0 && !isFocus && !isNear) continue;
      if (focus !== null && !isFocus && !isNear && c.scale < 1.05) continue;

      const p = worldToScreen(n.x, n.y);
      if (p.x < -140 || p.x > w + 140 || p.y < -30 || p.y > h + 30) continue;

      const label = n.doc.number;
      let tw = textWidths.current.get(label);
      if (tw === undefined) {
        tw = ctx.measureText(label).width;
        textWidths.current.set(label, tw);
      }

      const r = Math.max(2.5, n.r * c.scale);
      const halfH = fontSize * 0.72;

      // Bốn chỗ đặt, thử lần lượt: phải, trái, trên, dưới. Bản trước chỉ đặt
      // được bên phải nên hễ chỗ đó vướng là nhãn bị bỏ hẳn; giờ nhãn chỉ mất
      // khi cả bốn phía đều kín.
      const spots = [
        { x: p.x + r + 7, y: p.y },
        { x: p.x - r - 7 - tw, y: p.y },
        { x: p.x - tw / 2, y: p.y - r - halfH - 4 },
        { x: p.x - tw / 2, y: p.y + r + halfH + 4 },
      ];

      let box: { x1: number; y1: number; x2: number; y2: number } | null = null;
      for (const s of spots) {
        const cand = {
          x1: s.x - 2,
          y1: s.y - halfH,
          x2: s.x + tw + 2,
          y2: s.y + halfH,
        };
        // Nhãn tràn mép khung vẽ cũng coi như không đặt được: một số hiệu bị cắt
        // mất đuôi còn khó đọc hơn là không có nhãn.
        if (cand.x1 < 2 || cand.x2 > w - 2) continue;
        const clash = placed.some(
          (bb) =>
            cand.x1 < bb.x2 && cand.x2 > bb.x1 && cand.y1 < bb.y2 && cand.y2 > bb.y1,
        );
        if (!clash) {
          box = cand;
          break;
        }
      }

      // Điểm đang chọn hoặc đang trỏ tới luôn có nhãn, kể cả khi phải đè lên chỗ
      // khác: đó chính là thứ người dùng vừa yêu cầu xem.
      if (!box) {
        if (!isFocus) continue;
        box = {
          x1: p.x + r + 5,
          y1: p.y - halfH,
          x2: p.x + r + 9 + tw,
          y2: p.y + halfH,
        };
      }
      placed.push(box);

      // Nền sau chữ để nhãn không bị các đường cạnh cắt ngang.
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = P.paper;
      ctx.fillRect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
      ctx.globalAlpha = 1;

      ctx.fillStyle = isFocus ? P.accent : isNear ? P.ink : P.ink2;
      ctx.fillText(label, box.x1 + 2, (box.y1 + box.y2) / 2 + 0.5);
    }

    dirty.current = false;
  }, [nodes, edges, nodeById, adjacency, isDimmed, worldToScreen]);

  // Gán trong effect chứ không gán thẳng giữa thân render: ghi vào ref lúc dựng
  // cây component là một tác dụng phụ, và ở chế độ kiểm tra nghiêm của React thì
  // thân render chạy hai lần.
  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  /** Đưa khung nhìn về vị trí bao trọn các văn bản đang hiển thị. */
  const fitView = useCallback(() => {
    const visible = nodes.filter((n) => !isDimmed(n));
    const list = visible.length ? visible : nodes;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const n of list) {
      minX = Math.min(minX, n.x - n.r);
      minY = Math.min(minY, n.y - n.r);
      maxX = Math.max(maxX, n.x + n.r);
      maxY = Math.max(maxY, n.y + n.r);
    }
    const { w, h } = size.current;
    if (w === 0 || h === 0) return;

    const bw = Math.max(maxX - minX, 1);
    const bh = Math.max(maxY - minY, 1);
    const padL = Math.min(54, w * 0.06);
    const padT = Math.min(50, h * 0.07);
    // Chừa thêm ở dưới cho dải chú giải đang phủ lên góc.
    const padB = Math.min(78, h * 0.12);

    // Lề phải phải rộng hơn ba phía kia, vì nhãn được vẽ về bên phải của điểm;
    // chừa đều bốn phía thì số hiệu của các văn bản ngoài cùng bị mép canvas cắt.
    //
    // Nhưng lề rộng đó chỉ cần khi nhãn thật sự được vẽ. Nên tính hai bước: ước
    // lượng trước bằng lề hẹp, và chỉ khi mức phóng đủ lớn để nhãn hiện ra mới
    // tính lại bằng lề rộng. Nếu không, trên điện thoại ta hy sinh một phần tư
    // bề ngang để chừa chỗ cho những nhãn vốn đang bị ẩn.
    const fit = (padR: number) => {
      const availW = Math.max(80, w - padL - padR);
      const availH = Math.max(80, h - padT - padB);
      const s = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, Math.min(availW / bw, availH / bh)),
      );
      return { s, availW, availH };
    };

    const narrow = fit(Math.min(24, w * 0.04));
    const { s: fitted, availW, availH } =
      narrow.s >= LABEL_HARD_GATE ? fit(Math.min(132, w * 0.16)) : narrow;

    // Trên màn hình điện thoại, ép cả tập dữ liệu vào bề ngang 390px cho ra mức
    // phóng khoảng 0.16: mỗi văn bản còn ba pixel, không nhãn nào được vẽ, và
    // bản đồ không nói lên điều gì. Thà mở ở mức đọc được rồi để người dùng kéo
    // sang phần còn lại — thao tác kéo là thứ họ sẽ làm ngay sau đó dù thế nào.
    const scale = w < 640 ? Math.max(fitted, LABEL_HARD_GATE + 0.04) : fitted;
    cam.current.scale = scale;

    // Đưa tâm của phần nội dung về đúng tâm của vùng khả dụng, chứ không phải
    // tâm hình học của canvas.
    const worldCx = (minX + maxX) / 2;
    const worldCy = (minY + maxY) / 2;
    cam.current.x = worldCx - (padL + availW / 2 - w / 2) / scale;
    cam.current.y = worldCy - (padT + availH / 2 - h / 2) / scale;
    kick();
  }, [nodes, isDimmed, kick]);

  // Giữ ref đồng bộ với prop để hàm vẽ đọc được giá trị mới nhất.
  useEffect(() => {
    selectedRef.current = selectedId;
    kick();
  }, [selectedId, kick]);

  useEffect(() => {
    domainRef.current = activeDomain;
    // Đổi bộ lọc thì canh lại khung nhìn theo đúng phần đang hiển thị.
    fitView();
  }, [activeDomain, fitView]);

  // ── Kích thước và mật độ điểm ảnh ────────────────────────────────────────
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const apply = () => {
      const rect = wrap.getBoundingClientRect();

      // Chú giải và dòng hướng dẫn nằm đè lên vùng vẽ dưới dạng phần tử HTML.
      // Canvas không biết gì về chúng, nên nếu không đo lại thì nhãn số hiệu vẫn
      // được đặt ngay dưới hai khối đó và người đọc thấy chữ chồng lên chữ.
      // Đo ở đây thay vì trong vòng vẽ: hai khối này chỉ đổi chỗ khi khung đổi cỡ.
      const boxes: { x1: number; y1: number; x2: number; y2: number }[] = [];
      for (const el of wrap.parentElement?.querySelectorAll("[data-map-overlay]") ??
        []) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        boxes.push({
          x1: r.left - rect.left - 4,
          y1: r.top - rect.top - 4,
          x2: r.right - rect.left + 4,
          y2: r.bottom - rect.top + 4,
        });
      }
      reserved.current = boxes;

      // Giới hạn dpr ở 2: trên màn hình 3x, số điểm ảnh phải tô tăng gấp rưỡi
      // mà mắt gần như không phân biệt được.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(rect.width));
      const h = Math.max(1, Math.round(rect.height));
      if (size.current.w === w && size.current.h === h && size.current.dpr === dpr) {
        return;
      }
      size.current = { w, h, dpr };
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      textWidths.current.clear();
      kick();
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [kick]);

  // Khung nhìn ban đầu, đặt sau khi đã biết kích thước thật.
  useEffect(() => {
    const id = requestAnimationFrame(() => fitView());
    return () => cancelAnimationFrame(id);
  }, [fitView]);

  useEffect(() => {
    if (resetSignal > 0) fitView();
  }, [resetSignal, fitView]);

  /*
    Bề rộng chữ đo trước khi webfont tải xong là bề rộng của họ chữ dự phòng.
    Phép chống chồng nhãn dựa hẳn vào con số đó, nên nếu không đo lại thì ở lần
    vẽ đầu các hộp nhãn rộng hẹp sai và chữ đè lên nhau — đúng thứ mà phép chống
    chồng sinh ra để tránh. Xoá bộ nhớ đệm khi phông đã sẵn sàng rồi vẽ lại.
  */
  useEffect(() => {
    if (!document.fonts) return;
    let alive = true;
    document.fonts.ready.then(() => {
      if (!alive) return;
      labelFont.current = null;
      textWidths.current.clear();
      kick();
    });
    return () => {
      alive = false;
    };
  }, [kick]);

  // Theo dõi thay đổi chủ đề sáng/tối để đọc lại bảng màu. Hai nguồn: cài đặt hệ
  // điều hành, và thuộc tính `data-theme` do nút đổi nền trên thanh điều hướng ghi.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      palette.current = null;
      kick();
    };
    mq.addEventListener("change", onChange);
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => {
      mq.removeEventListener("change", onChange);
      observer.disconnect();
    };
  }, [kick]);

  // ── Con lăn ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Phải tự gắn với passive:false; trình duyệt mặc định coi wheel là thụ động
    // nên preventDefault bên trong onWheel của React sẽ không có tác dụng.
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const sx = ev.clientX - rect.left;
      const sy = ev.clientY - rect.top;
      const before = screenToWorld(sx, sy);
      const factor = Math.exp(-ev.deltaY * 0.0016);
      cam.current.scale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, cam.current.scale * factor),
      );
      // Giữ điểm dưới con trỏ đứng yên: đây là điều làm cho thao tác phóng to có
      // cảm giác bám tay thay vì nhảy về tâm màn hình.
      const after = screenToWorld(sx, sy);
      cam.current.x += before.x - after.x;
      cam.current.y += before.y - after.y;
      kick();
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [screenToWorld, kick]);

  useEffect(
    () => () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    },
    [],
  );

  // ── Chuột, chạm, bút ─────────────────────────────────────────────────────
  const localPoint = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = ev.currentTarget.getBoundingClientRect();
    return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
  };

  const onPointerDown = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    ev.currentTarget.setPointerCapture(ev.pointerId);
    pointers.current.set(ev.pointerId, localPoint(ev));
    dragged.current = false;
    setCursor("grabbing");
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinchStart.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        scale: cam.current.scale,
        mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      };
    }
  };

  const onPointerMove = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    const pt = localPoint(ev);
    const prev = pointers.current.get(ev.pointerId);
    if (prev) pointers.current.set(ev.pointerId, pt);

    if (pointers.current.size === 2 && pinchStart.current) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      // Điểm dưới ngón, đo bằng mức phóng cũ và ở chỗ ngón vừa rời khỏi.
      const before = screenToWorld(
        pinchStart.current.mid.x,
        pinchStart.current.mid.y,
      );
      const ratio = dist / (pinchStart.current.dist || 1);
      cam.current.scale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, pinchStart.current.scale * ratio),
      );
      // Kéo điểm đó về đúng chỗ ngón đang ở, với mức phóng mới. Không có bước
      // này thì thao tác chụm phóng về tâm khung vẽ, còn phần bản đồ giữa hai
      // ngón thì trượt đi — đúng chỗ người dùng đang nhìn lại là chỗ chạy mất.
      // Bước này gánh luôn việc kéo bằng hai ngón: điểm giữa dời bao nhiêu thì
      // khung nhìn dời theo bấy nhiêu.
      const after = screenToWorld(mid.x, mid.y);
      cam.current.x += before.x - after.x;
      cam.current.y += before.y - after.y;
      pinchStart.current.mid = mid;
      dragged.current = true;
      kick();
      return;
    }

    if (prev && ev.buttons > 0) {
      const dx = pt.x - prev.x;
      const dy = pt.y - prev.y;
      if (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4) dragged.current = true;
      cam.current.x -= dx / cam.current.scale;
      cam.current.y -= dy / cam.current.scale;
      kick();
      return;
    }

    const hit = pick(pt.x, pt.y);
    if (hit !== hoverId.current) {
      hoverId.current = hit;
      setCursor(hit !== null ? "pointer" : "grab");
      kick();
    }
  };

  const releasePointer = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    pointers.current.delete(ev.pointerId);
    if (pointers.current.size < 2) pinchStart.current = null;
  };

  const onPointerUp = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    const wasDrag = dragged.current;
    const pt = localPoint(ev);
    releasePointer(ev);
    setCursor(hoverId.current !== null ? "pointer" : "grab");
    // Một cú kéo không phải là một cú bấm. Không có bước kiểm tra này thì mỗi
    // lần thả tay sau khi kéo, bản đồ lại mở nhầm một văn bản.
    if (wasDrag) return;
    onSelect(pick(pt.x, pt.y));
  };

  const onPointerLeave = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    releasePointer(ev);
    setCursor("grab");
    if (hoverId.current !== null) {
      hoverId.current = null;
      kick();
    }
  };

  // ── Bàn phím ─────────────────────────────────────────────────────────────
  // Bản đồ phải dùng được khi không có chuột: phím mũi tên kéo, cộng trừ phóng
  // to, Home đưa về mặc định, Escape bỏ chọn.
  const onKeyDown = (ev: React.KeyboardEvent<HTMLCanvasElement>) => {
    const step = 60 / cam.current.scale;
    let handled = true;
    switch (ev.key) {
      case "ArrowLeft":
        cam.current.x -= step;
        break;
      case "ArrowRight":
        cam.current.x += step;
        break;
      case "ArrowUp":
        cam.current.y -= step;
        break;
      case "ArrowDown":
        cam.current.y += step;
        break;
      case "+":
      case "=":
        cam.current.scale = Math.min(MAX_SCALE, cam.current.scale * 1.18);
        break;
      case "-":
      case "_":
        cam.current.scale = Math.max(MIN_SCALE, cam.current.scale / 1.18);
        break;
      case "Home":
        fitView();
        break;
      case "Escape":
        onSelect(null);
        break;
      default:
        handled = false;
    }
    if (handled) {
      ev.preventDefault();
      kick();
    }
  };

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        className="map-surface"
        style={{ cursor }}
        tabIndex={0}
        role="application"
        aria-label={t.a11y.mapLabel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={releasePointer}
        onPointerLeave={onPointerLeave}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}
