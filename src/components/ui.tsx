import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DocStatus, DocType, STATUS_META, fieldOf } from "../data/laws";
import { normalize } from "../lib/search";
import { useApp } from "../store";

/* ---------------- text highlight ---------------- */
export function Highlight({ text, query }: { text: string; query?: string }) {
  if (!query || !query.trim()) return <>{text}</>;
  const tokens = normalize(query)
    .split(/\s+/)
    .filter((t) => t.length >= 2);
  if (!tokens.length) return <>{text}</>;
  const parts = text.split(/(\s+)/);
  return (
    <>
      {parts.map((p, i) => {
        const n = normalize(p);
        const hit = tokens.some((t) => n.includes(t));
        return hit ? <mark key={i}>{p}</mark> : <React.Fragment key={i}>{p}</React.Fragment>;
      })}
    </>
  );
}

/* ---------------- badges & chips ---------------- */
export function StatusBadge({ status, big = false }: { status: DocStatus; big?: boolean }) {
  const m = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${
        big ? "px-3 py-1 text-[12.5px]" : "px-2 py-0.5 text-[11px]"
      }`}
      style={{ color: m.color, background: m.bg, borderColor: `${m.color}44` }}
    >
      <span
        className={`rounded-full ${status === "active" ? "anim-pulse-dot" : ""}`}
        style={{ width: 6, height: 6, background: m.color }}
      />
      {m.label}
    </span>
  );
}

export function TypeChip({ type }: { type: DocType }) {
  return (
    <span className="chip font-mono" style={{ color: "#9fc2e8", borderColor: "rgba(127,166,255,0.28)" }}>
      {type}
    </span>
  );
}
export function FieldChip({ field }: { field: string }) {
  const f = fieldOf(field);
  return (
    <span className="chip" style={{ color: f.color, borderColor: `${f.color}3d` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: f.color }} />
      {f.name}
    </span>
  );
}

/* ---------------- section header ---------------- */
export function SectionHead({
  eyebrow,
  title,
  right,
}: {
  eyebrow: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <div className="eyebrow mb-1.5">{eyebrow}</div>
        <h2 className="font-display text-[22px] font-semibold leading-tight text-fog sm:text-[26px]">{title}</h2>
      </div>
      {right}
    </div>
  );
}

/* ---------------- inline icons ---------------- */
type IconProps = { size?: number; className?: string; strokeWidth?: number };
const S = ({ size = 16, className, strokeWidth = 1.8, children, viewBox = "0 0 24 24" }: IconProps & { children: React.ReactNode; viewBox?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const IcSearch = (p: IconProps) => (
  <S {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </S>
);
export const IcScale = (p: IconProps) => (
  <S {...p}>
    <path d="M12 3v18M8 21h8" />
    <path d="M5 7h14" />
    <path d="M7 7 4 13a3 3 0 0 0 6 0L7 7ZM17 7l-3 6a3 3 0 0 0 6 0l-3-6Z" />
  </S>
);
export const IcBookmark = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <S {...p}>
    <path d="M6 4h12v17l-6-4-6 4V4Z" fill={filled ? "currentColor" : "none"} />
  </S>
);
export const IcCube = (p: IconProps) => (
  <S {...p}>
    <path d="m12 2 8 4.5v9L12 20l-8-4.5v-9L12 2Z" />
    <path d="M12 11 4 6.5M12 11l8-4.5M12 11v9" />
  </S>
);
export const IcGrid = (p: IconProps) => (
  <S {...p}>
    <circle cx="5" cy="6" r="2" />
    <circle cx="19" cy="6" r="2" />
    <circle cx="12" cy="18" r="2" />
    <path d="M6.5 7.2 10.8 16M17.5 7.2 13.2 16M7 6h10" />
  </S>
);
export const IcList = (p: IconProps) => (
  <S {...p}>
    <path d="M8 6h13M8 12h13M8 18h13" />
    <circle cx="4" cy="6" r="1" fill="currentColor" />
    <circle cx="4" cy="12" r="1" fill="currentColor" />
    <circle cx="4" cy="18" r="1" fill="currentColor" />
  </S>
);
export const IcArrow = (p: IconProps) => (
  <S {...p}>
    <path d="M4 12h16m0 0-6-6m6 6-6 6" />
  </S>
);
export const IcCopy = (p: IconProps) => (
  <S {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </S>
);
export const IcCheck = (p: IconProps) => (
  <S {...p}>
    <path d="m4 12.5 5 5L20 6.5" />
  </S>
);
export const IcX = (p: IconProps) => (
  <S {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </S>
);
export const IcFilter = (p: IconProps) => (
  <S {...p}>
    <path d="M4 5h16M7 12h10M10 19h4" />
  </S>
);
export const IcClock = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </S>
);
export const IcCompare = (p: IconProps) => (
  <S {...p}>
    <rect x="3" y="5" width="7.5" height="14" rx="1.5" />
    <rect x="13.5" y="5" width="7.5" height="14" rx="1.5" />
    <path d="M6 9h2M6 12h2M16.5 9h2M16.5 12h2" />
  </S>
);
export const IcHistory = (p: IconProps) => (
  <S {...p}>
    <path d="M3.5 8A9 9 0 1 1 3 12" />
    <path d="M3 4v4h4M12 8v4l3 2" />
  </S>
);
export const IcLink = (p: IconProps) => (
  <S {...p}>
    <path d="M10 14a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.1" />
    <path d="M14 10a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.1" />
  </S>
);
export const IcReset = (p: IconProps) => (
  <S {...p}>
    <path d="M20 11a8 8 0 1 0-2.3 6.3" />
    <path d="M20 5v6h-6" />
  </S>
);
export const IcChevR = (p: IconProps) => (
  <S {...p}>
    <path d="m9 5 7 7-7 7" />
  </S>
);
export const IcNote = (p: IconProps) => (
  <S {...p}>
    <path d="M5 3h14v13l-5 5H5V3Z" />
    <path d="M14 21v-5h5M9 8h6M9 12h4" />
  </S>
);
export const IcZoomIn = (p: IconProps) => (
  <S {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2M11 8v6M8 11h6" />
  </S>
);
export const IcZoomOut = (p: IconProps) => (
  <S {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2M8 11h6" />
  </S>
);
export const IcOrbit = (p: IconProps) => (
  <S {...p}>
    <circle cx="12" cy="12" r="3.5" />
    <path d="M20.3 8.6c1.6 2.7 1.9 5.4.6 6.7-2 2-6.7.3-10.6-3.6S4.4 3 6.4 1c1.3-1.3 4-.9 6.7.7" transform="rotate(20 12 12)" />
  </S>
);
export const IcWarn = (p: IconProps) => (
  <S {...p}>
    <path d="M12 3 2.5 20h19L12 3Z" />
    <path d="M12 9.5V14M12 17.2v.1" />
  </S>
);
export const IcBook = (p: IconProps) => (
  <S {...p}>
    <path d="M4 19.5V5a2 2 0 0 1 2-2h14v16H6.5a2.5 2.5 0 0 0 0 5H20" />
  </S>
);

/* ---------------- toast ---------------- */
export function Toast() {
  const toast = useApp((s) => s.toast);
  const dismiss = useApp((s) => s.dismissToast);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(dismiss, 2600);
    return () => clearTimeout(t);
  }, [toast, dismiss]);
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          className="pointer-events-none fixed bottom-6 left-1/2 z-[90] -translate-x-1/2"
        >
          <div className="flex items-center gap-2.5 rounded-lg border border-[rgba(229,176,84,0.4)] bg-[#141d30] px-4 py-2.5 text-[13px] font-medium text-gold-soft shadow-[0_16px_40px_-12px_rgba(0,0,0,0.8)]">
            <IcCheck size={15} className="text-valid" />
            {toast.msg}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- misc ---------------- */
export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-line bg-ink-800 px-1.5 py-0.5 font-mono text-[10.5px] text-mist">
      {children}
    </kbd>
  );
}

export function Stat({ value, label, accent = "#45c8ff" }: { value: string; label: string; accent?: string }) {
  return (
    <div className="flex items-baseline gap-2.5">
      <span className="font-display text-[26px] font-semibold leading-none" style={{ color: accent }}>
        {value}
      </span>
      <span className="text-[12px] leading-tight text-dim">{label}</span>
    </div>
  );
}
