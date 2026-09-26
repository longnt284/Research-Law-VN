"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import type { Lang } from "@/data/types";
import { formatDate } from "@/i18n/dictionary";
import { getDocPanel } from "@/i18n/doc-panel";
import { useAsOf } from "@/lib/client-store";
import { segmentAt, type ValiditySegment } from "@/lib/validity-segment";

/**
 * Khung xem hình gia phả: phóng to, thu nhỏ, kéo, vừa khung, cỡ thật, thu gọn
 * nhánh hướng dẫn, tô sáng quan hệ của văn bản đang trỏ, và làm mờ văn bản
 * không có hiệu lực tại ngày tra cứu đang đặt.
 *
 * Hình vẫn là SVG dựng ở máy chủ, truyền vào qua `full` và `compact`. Thành
 * phần này chỉ đổi phép biến hình và các lớp CSS, không vẽ lại gì: tắt
 * JavaScript thì người đọc vẫn có đủ hình ở cỡ thật trong một khung cuộn.
 *
 * Không chiếm con lăn chuột: cuộn trang vẫn là cuộn trang. Phóng to bằng nút,
 * bằng Ctrl + con lăn, hoặc hai ngón tay trên màn cảm ứng qua thao tác kéo.
 */

const MIN = 0.35;
const MAX = 2;

export function GraphViewport({
  full,
  compact,
  childCount,
  segments,
  width: fullWidth,
  height,
  compactWidth,
  compactHeight,
  lang,
}: {
  full: React.ReactNode;
  /** Cùng hình nhưng bỏ nhánh hướng dẫn; không có khi văn bản không có nhánh. */
  compact?: React.ReactNode;
  childCount: number;
  /** Đoạn hiệu lực của mọi văn bản trên hình, theo mã. */
  segments: Record<string, ValiditySegment[]>;
  width: number;
  height: number;
  compactWidth: number;
  compactHeight: number;
  lang: Lang;
}) {
  const c = getDocPanel(lang).graph;
  const asOf = useAsOf();
  const frame = useRef<HTMLDivElement | null>(null);
  const inner = useRef<HTMLDivElement | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ s: 1, x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; vx: number; vy: number; moved: boolean } | null>(null);

  const h = collapsed ? compactHeight : height;
  const width = collapsed ? compactWidth : fullWidth;

  const fitScale = useCallback(() => {
    const w = frame.current?.clientWidth ?? width;
    return Math.max(MIN, Math.min(1, (w - 2) / width));
  }, [width]);

  const fit = useCallback(() => {
    const s = fitScale();
    const w = frame.current?.clientWidth ?? width;
    setView({ s, x: Math.max(0, (w - width * s) / 2), y: 0 });
  }, [fitScale, width]);

  // Vừa khung ngay lần dựng đầu, và mỗi khi khung đổi bề ngang.
  useLayoutEffect(() => {
    fit();
    const el = frame.current;
    if (!el) return;
    let last = el.clientWidth;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth !== last) {
        last = el.clientWidth;
        fit();
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit, open, collapsed]);

  const zoom = (factor: number, cx?: number, cy?: number) => {
    setView((v) => {
      const s = Math.min(MAX, Math.max(MIN, v.s * factor));
      const w = frame.current?.clientWidth ?? width;
      const px = cx ?? w / 2;
      const py = cy ?? (h * v.s) / 2;
      // Giữ nguyên điểm dưới con trỏ khi phóng.
      return { s, x: px - ((px - v.x) * s) / v.s, y: py - ((py - v.y) * s) / v.s };
    });
  };

  // Tô sáng quan hệ của văn bản đang trỏ hoặc đang có tiêu điểm bàn phím.
  useEffect(() => {
    const root = inner.current;
    if (!root) return;
    const clear = () => {
      root.classList.remove("has-hl");
      root.querySelectorAll(".is-hl").forEach((n) => n.classList.remove("is-hl"));
    };
    const light = (target: EventTarget | null) => {
      const node = (target as Element | null)?.closest?.("[data-id]");
      clear();
      if (!node) return;
      const id = node.getAttribute("data-id")!;
      root.classList.add("has-hl");
      node.classList.add("is-hl");
      root.querySelectorAll<SVGGElement>(".family-edge").forEach((e) => {
        const from = e.dataset.from;
        const to = e.dataset.to;
        if (from === id || to === id) {
          e.classList.add("is-hl");
          const other = from === id ? to : from;
          if (other) root.querySelector(`[data-id="${CSS.escape(other)}"]`)?.classList.add("is-hl");
        }
      });
    };
    const over = (e: Event) => light(e.target);
    root.addEventListener("pointerover", over);
    root.addEventListener("focusin", over);
    root.addEventListener("pointerleave", clear);
    root.addEventListener("focusout", clear);
    return () => {
      root.removeEventListener("pointerover", over);
      root.removeEventListener("focusin", over);
      root.removeEventListener("pointerleave", clear);
      root.removeEventListener("focusout", clear);
    };
  }, [collapsed, open]);

  // Làm mờ văn bản không có hiệu lực tại ngày tra cứu đang đặt.
  useEffect(() => {
    const root = inner.current;
    if (!root) return;
    root.querySelectorAll<SVGElement>("[data-id]").forEach((n) => {
      const segs = segments[n.getAttribute("data-id")!];
      const off = !!asOf && !!segs && segmentAt(segs, asOf).state !== "in-force";
      n.classList.toggle("is-off", off);
    });
  }, [asOf, segments, collapsed, open]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 5) return;
    if (!d.moved) {
      d.moved = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    setView((v) => ({ ...v, x: d.vx + dx, y: d.vy + dy }));
  };
  const onPointerUp = () => {
    // Giữ cờ `moved` tới sự kiện bấm ngay sau, để một lần kéo không mở nhầm văn bản.
    window.setTimeout(() => (drag.current = null), 0);
  };

  const onWheel = (e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const r = frame.current!.getBoundingClientRect();
    zoom(e.deltaY < 0 ? 1.12 : 1 / 1.12, e.clientX - r.left, e.clientY - r.top);
  };

  // `onWheel` của React là bộ nghe thụ động, không chặn được cuộn trang khi
  // đang giữ Ctrl; gắn bộ nghe chủ động riêng cho đúng trường hợp đó.
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const stop = (e: WheelEvent) => (e.ctrlKey || e.metaKey) && e.preventDefault();
    el.addEventListener("wheel", stop, { passive: false });
    return () => el.removeEventListener("wheel", stop);
  }, [open]);

  return (
    <div className={`gv${open ? " is-open" : ""}`}>
      <button type="button" className="gv-toggle btn btn-quiet btn-sm" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {open ? c.hide : c.show}
      </button>
      <div className="gv-body">
        <div className="gv-bar" role="toolbar" aria-label={c.fit}>
          <button type="button" onClick={() => zoom(1 / 1.25)} aria-label={c.zoomOut} title={c.zoomOut}>
            −
          </button>
          <span className="gv-scale tnum" aria-live="polite">
            {Math.round(view.s * 100)}%
          </span>
          <button type="button" onClick={() => zoom(1.25)} aria-label={c.zoomIn} title={c.zoomIn}>
            +
          </button>
          <button type="button" onClick={fit}>
            {c.fit}
          </button>
          <button type="button" onClick={() => setView({ s: 1, x: 0, y: 0 })}>
            {c.reset}
          </button>
          {compact && childCount > 0 && (
            <button type="button" aria-pressed={collapsed} onClick={() => setCollapsed((v) => !v)}>
              {collapsed ? c.expand(childCount) : c.collapse(childCount)}
            </button>
          )}
        </div>
        <div
          ref={frame}
          className="gv-frame"
          style={{ height: Math.min(760, Math.max(180, Math.round(h * view.s) + 16)) }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
          onClickCapture={(e) => {
            if (drag.current?.moved) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          <div
            ref={inner}
            className="gv-inner"
            style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})`, width }}
          >
            {collapsed && compact ? compact : full}
          </div>
        </div>
        <p className="gv-hint">
          {c.drag}
          {asOf && <> {c.asOf(formatDate(asOf, lang, asOf))}</>}
        </p>
      </div>
    </div>
  );
}
