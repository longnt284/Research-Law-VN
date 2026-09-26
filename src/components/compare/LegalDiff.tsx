"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { ChangeKind, Lang } from "@/data/types";
import { getDiffCopy } from "@/i18n/diff";
import { fold } from "@/lib/search-engine";

/**
 * Lớp điều khiển của bản đối chiếu: ba cách xem, tìm trong bản đối chiếu, nút
 * đi tới điểm trước / điểm sau, chọn vế hiển thị trên điện thoại, sao chép và
 * in.
 *
 * Nội dung các điểm vẫn dựng ở máy chủ và truyền vào qua `children`, mỗi điểm
 * mang `data-point`; khối tổng quan mang `data-overview`, nút đi tới một điểm
 * mang `data-jump`. Thành phần này chỉ ẩn, hiện và cuộn tới các khối ấy; tắt
 * JavaScript thì người đọc vẫn có đủ mọi điểm.
 */

export interface PointMeta {
  id: string;
  kind: ChangeKind;
  topic: string;
  kindLabel: string;
  /** Toàn bộ chữ của điểm, đã bỏ dấu, để tìm. */
  text: string;
  /** Bản chữ của điểm để sao chép. */
  copy: string;
}

type Mode = "overview" | "changes" | "all";

export function LegalDiff({
  lang,
  points,
  copyHead,
  children,
}: {
  lang: Lang;
  points: PointMeta[];
  /** Dòng đầu của bản sao chép: hai số hiệu và đường dẫn trang. */
  copyHead: string;
  children: React.ReactNode;
}) {
  const c = getDiffCopy(lang);
  const hasSame = points.some((p) => p.kind === "giu-nguyen");
  const [mode, setMode] = useState<Mode>(hasSame ? "changes" : "all");
  const [query, setQuery] = useState("");
  const [side, setSide] = useState<"both" | "old" | "new">("both");
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [current, setCurrent] = useState(0);
  const [inView, setInView] = useState(false);
  const [copied, setCopied] = useState(false);
  const box = useRef<HTMLDivElement | null>(null);

  const visible = useMemo(() => {
    const q = fold(query.trim());
    return points.filter(
      (p) => (mode !== "changes" || p.kind !== "giu-nguyen") && (!q || p.text.includes(q)),
    );
  }, [points, mode, query]);

  // Ẩn, hiện và thu gọn các điểm đã dựng sẵn.
  useEffect(() => {
    const root = box.current;
    if (!root) return;
    const show = new Set(visible.map((p) => p.id));
    root.querySelectorAll<HTMLElement>("[data-overview]").forEach((el) => {
      el.hidden = mode !== "overview";
    });
    root.querySelectorAll<HTMLElement>("[data-point]").forEach((el) => {
      const id = el.dataset.point!;
      el.hidden = mode === "overview" || !show.has(id);
      el.classList.toggle(
        "is-collapsed",
        mode === "all" && el.dataset.kind === "giu-nguyen" && !open.has(id) && !query,
      );
    });
  }, [visible, mode, open, query]);

  // Mở một điểm tương đương đã thu gọn.
  useEffect(() => {
    const root = box.current;
    if (!root) return;
    const onClick = (e: MouseEvent) => {
      const jump = (e.target as Element).closest<HTMLElement>("[data-jump]");
      if (jump) {
        const id = jump.dataset.jump!;
        setMode("all");
        setOpen((s) => new Set(s).add(id));
        window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "start" }), 30);
        return;
      }
      const btn = (e.target as Element).closest<HTMLElement>("[data-expand]");
      if (!btn) return;
      setOpen((s) => new Set(s).add(btn.dataset.expand!));
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, []);

  // Điểm nào đang ở đầu màn hình, và khối đối chiếu có đang trong tầm nhìn không.
  useEffect(() => {
    const root = box.current;
    if (!root) return;
    const onScroll = () => {
      const r = root.getBoundingClientRect();
      setInView(r.top < window.innerHeight * 0.6 && r.bottom > 120);
      let idx = 0;
      visible.forEach((p, i) => {
        const el = document.getElementById(p.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.35) idx = i;
      });
      setCurrent(idx);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [visible]);

  const goTo = (i: number) => {
    const p = visible[Math.max(0, Math.min(visible.length - 1, i))];
    if (!p) return;
    document.getElementById(p.id)?.scrollIntoView({ block: "start" });
    setCurrent(Math.max(0, Math.min(visible.length - 1, i)));
  };

  // J / K như trong các công cụ đọc mã và đọc thư.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey || mode === "overview") return;
      if (e.key === "j") goTo(current + 1);
      else if (e.key === "k") goTo(current - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText([copyHead, ...visible.map((p) => p.copy)].join("\n\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="ldiff" data-side={side}>
      <div className="ldiff-bar">
        <div className="ldiff-modes" role="group" aria-label={c.modesLabel}>
          {(["overview", "changes", "all"] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              className="ldiff-mode"
              onClick={() => setMode(m)}
            >
              {c.modes[m]}
            </button>
          ))}
        </div>
        <div className="ldiff-tools">
          <label htmlFor="ldiff-q" className="sr-only">
            {c.search}
          </label>
          <input
            id="ldiff-q"
            type="search"
            className="field ldiff-search"
            placeholder={c.searchPlaceholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (mode === "overview") setMode("all");
            }}
          />
          <div className="ldiff-side" role="group" aria-label={c.side.label}>
            {(["both", "old", "new"] as const).map((sd) => (
              <button key={sd} type="button" aria-pressed={side === sd} onClick={() => setSide(sd)}>
                {c.side[sd]}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-quiet btn-sm" aria-live="polite" onClick={copyAll}>
            {copied ? c.copied : c.copy}
          </button>
          <button type="button" className="btn btn-quiet btn-sm" onClick={() => window.print()}>
            {c.print}
          </button>
        </div>
      </div>

      <p className="ldiff-count tnum" aria-live="polite">
        {mode === "overview" ? c.points(points.length) : c.showing(visible.length, points.length)}
      </p>

      {mode !== "overview" && visible.length === 0 && <p className="empty-note">{c.noMatch}</p>}

      <div ref={box} className="ldiff-points">
        {children}
      </div>

      {mode !== "overview" && visible.length > 1 && inView && (
        <div className="ldiff-nav" role="group" aria-label={c.keys}>
          <button type="button" onClick={() => goTo(current - 1)} disabled={current <= 0} aria-label={c.prev}>
            ↑
          </button>
          <span className="tnum">{c.position(current + 1, visible.length)}</span>
          <button
            type="button"
            onClick={() => goTo(current + 1)}
            disabled={current >= visible.length - 1}
            aria-label={c.next}
          >
            ↓
          </button>
        </div>
      )}
    </div>
  );
}
