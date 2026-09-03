import { useEffect, useMemo, useRef, useState } from "react";
import { LAWS, Law, NODE_POS, EDGES, NODE_DEGREE, REL_LABEL, STATUS_META, fmtDate } from "../data/laws";
import { useApp } from "../store";
import { IcReset, IcZoomIn, IcZoomOut, IcArrow, StatusBadge } from "./ui";

const STATUS_COLOR: Record<string, string> = {
  active: "#3ad294",
  expiring: "#f2b63d",
  expired: "#ef7a74",
};

const sx = (x: number) => 500 + x * 13;
const sy = (z: number) => 310 + z * 10;

export default function Graph2D({
  visibleIds,
  initialFocusId = null,
  height = 520,
}: {
  visibleIds: Set<string>;
  initialFocusId?: string | null;
  height?: number;
}) {
  const nav = useApp((s) => s.nav);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ k: 1, tx: 0, ty: 0 });
  const [hovered, setHovered] = useState<{ law: Law; px: number; py: number } | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(initialFocusId);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      setT((prev) => {
        const k = Math.min(3, Math.max(0.45, prev.k * Math.exp(-e.deltaY * 0.0012)));
        const ratio = k / prev.k;
        return { k, tx: mx - (mx - prev.tx) * ratio, ty: my - (my - prev.ty) * ratio };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const selectedLaw = selectedId ? LAWS.find((l) => l.id === selectedId) : null;

  const edgeEls = useMemo(
    () =>
      EDGES.filter((e) => NODE_POS[e.a] && NODE_POS[e.b]).map((e, i) => {
        const a = NODE_POS[e.a];
        const b = NODE_POS[e.b];
        const dim = !visibleIds.has(e.a) || !visibleIds.has(e.b);
        const hot = selectedId && (e.a === selectedId || e.b === selectedId);
        return (
          <line
            key={i}
            x1={sx(a.x)}
            y1={sy(a.z)}
            x2={sx(b.x)}
            y2={sy(b.z)}
            stroke={REL_LABEL[e.kind].color}
            strokeWidth={hot ? 2 : 1.1}
            opacity={dim ? 0.05 : hot ? 0.9 : 0.38}
          />
        );
      }),
    [visibleIds, selectedId]
  );

  return (
    <div
      ref={wrapRef}
      className="relative w-full touch-none select-none overflow-hidden rounded-[10px] border border-line bg-[#060b14]"
      style={{ height, cursor: drag.current ? "grabbing" : "grab" }}
      onPointerDown={(e) => {
        drag.current = { x: e.clientX, y: e.clientY, tx: t.tx, ty: t.ty };
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (drag.current) {
          setT((prev) => ({ ...prev, tx: drag.current!.tx + e.clientX - drag.current!.x, ty: drag.current!.ty + e.clientY - drag.current!.y }));
        }
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerLeave={() => (drag.current = null)}
    >
      <svg viewBox="0 0 1000 620" className="h-full w-full">
        <g transform={`translate(${t.tx} ${t.ty}) scale(${t.k})`}>
          <defs>
            <radialGradient id="g2d-bg" cx="50%" cy="42%" r="65%">
              <stop offset="0%" stopColor="#0d1a30" />
              <stop offset="100%" stopColor="#060b14" />
            </radialGradient>
          </defs>
          <rect x="-600" y="-600" width="2200" height="1900" fill="url(#g2d-bg)" />
          {edgeEls}
          {LAWS.filter((l) => NODE_POS[l.id]).map((law) => {
            const p = NODE_POS[law.id];
            const r = (law.id === "hienphap2013" ? 22 : 11 + (NODE_DEGREE[law.id] ?? 0) * 1.7);
            const dim = !visibleIds.has(law.id);
            const c = STATUS_COLOR[law.status];
            const sel = selectedId === law.id;
            return (
              <g
                key={law.id}
                transform={`translate(${sx(p.x)} ${sy(p.z)})`}
                opacity={dim ? 0.16 : 1}
                style={{ cursor: "pointer", transition: "opacity .25s" }}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setSelectedId(law.id)}
                onDoubleClick={() => nav({ name: "detail", lawId: law.id })}
                onMouseEnter={(e) => {
                  const rect = wrapRef.current?.getBoundingClientRect();
                  if (rect) setHovered({ law, px: e.clientX - rect.left, py: e.clientY - rect.top });
                }}
                onMouseLeave={() => setHovered(null)}
              >
                {(sel || initialFocusId === law.id) && (
                  <circle r={r + 7} fill="none" stroke="#f2cd8b" strokeWidth="1.4" strokeDasharray="4 4" className="anim-pulse-dot" />
                )}
                <circle r={r} fill={c} opacity={0.18} />
                <circle r={r * 0.62} fill={c} opacity={0.9} />
                <circle r={r} fill="none" stroke={c} strokeWidth="1.4" />
                <text y={r + 15} textAnchor="middle" fontSize="11.5" fontWeight={600} fill="#c6d4ea">
                  {law.name.length > 34 ? law.name.slice(0, 32) + "…" : law.name}
                </text>
                <text y={r + 28} textAnchor="middle" fontSize="9" fill="#6e81a3" fontFamily="IBM Plex Mono, monospace">
                  {law.number}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* legend */}
      <div className="pointer-events-none absolute left-3 top-3 z-40 rounded-lg border border-line bg-[#0a1220d9] px-3 py-2.5">
        <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-dim">Hiệu lực</div>
        {(Object.keys(STATUS_COLOR) as (keyof typeof STATUS_COLOR)[]).map((k) => (
          <div key={k} className="flex items-center gap-2 py-0.5 text-[11px] text-mist">
            <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLOR[k] }} />
            {STATUS_META[k as keyof typeof STATUS_META].label}
          </div>
        ))}
      </div>

      {/* toolbar */}
      <div className="absolute right-3 top-3 z-40 flex gap-1.5">
        <button className="btn !px-2.5 !py-2" onClick={() => setT((p) => ({ ...p, k: Math.min(3, p.k * 1.2) }))} aria-label="Phóng to">
          <IcZoomIn size={15} />
        </button>
        <button className="btn !px-2.5 !py-2" onClick={() => setT((p) => ({ ...p, k: Math.max(0.45, p.k / 1.2) }))} aria-label="Thu nhỏ">
          <IcZoomOut size={15} />
        </button>
        <button className="btn !px-2.5 !py-2" onClick={() => setT({ k: 1, tx: 0, ty: 0 })} aria-label="Đặt lại góc nhìn">
          <IcReset size={15} />
        </button>
      </div>

      {/* tooltip */}
      {hovered && (
        <div
          className="pointer-events-none absolute z-50 w-56 rounded-lg border border-line bg-[#0b1322f5] p-3 shadow-[0_18px_44px_-12px_rgba(0,0,0,0.9)]"
          style={{ left: Math.min(hovered.px + 14, (wrapRef.current?.clientWidth ?? 600) - 236), top: hovered.py + 10 }}
        >
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] text-dim">{hovered.law.number}</span>
            <StatusBadge status={hovered.law.status} />
          </div>
          <div className="font-display text-[14px] font-semibold leading-snug text-fog">{hovered.law.name}</div>
          <div className="mt-1 text-[10.5px] text-dim">Hiệu lực: {fmtDate(hovered.law.effectiveDate)} · Nhấp đúp để mở</div>
        </div>
      )}

      {/* selected panel */}
      {selectedLaw && (
        <div className="absolute bottom-3 left-3 z-40 w-[270px] rounded-lg border border-line bg-[#0b1322f5] p-3.5">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] text-dim">{selectedLaw.number}</span>
            <button className="text-dim transition hover:text-fog" onClick={() => setSelectedId(null)} aria-label="Đóng">✕</button>
          </div>
          <div className="font-display text-[15px] font-semibold leading-snug text-fog">{selectedLaw.name}</div>
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-dim">
            <StatusBadge status={selectedLaw.status} />
            <span>HL: {fmtDate(selectedLaw.effectiveDate)}</span>
          </div>
          <button className="btn btn-primary mt-3 w-full !py-1.5 !text-[12px]" onClick={() => nav({ name: "detail", lawId: selectedLaw.id })}>
            Xem chi tiết <IcArrow size={13} />
          </button>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-3 right-3 z-30 font-mono text-[9.5px] tracking-wide text-dim/70">
        kéo để di chuyển · cuộn để thu phóng · nhấp đúp để mở
      </div>
    </div>
  );
}
