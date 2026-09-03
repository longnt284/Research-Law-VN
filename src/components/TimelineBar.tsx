import { Law, REL_LABEL, fmtDate, LAW_MAP } from "../data/laws";

interface Milestone {
  date: string;
  label: string;
  kind: "issued" | "effective" | "amended" | "expired";
}

export function milestonesOf(law: Law): Milestone[] {
  const ms: Milestone[] = [
    { date: law.issuedDate, label: "Ban hành", kind: "issued" },
    { date: law.effectiveDate, label: "Có hiệu lực", kind: "effective" },
  ];
  // amendments targeting this law
  Object.values(LAW_MAP).forEach((other) => {
    if (other.relations.some((r) => r.lawId === law.id && r.kind === "amends")) {
      ms.push({ date: other.effectiveDate, label: `Được sửa đổi (${other.number})`, kind: "amended" });
    }
  });
  if (law.expiryDate) ms.push({ date: law.expiryDate, label: "Hết hiệu lực", kind: "expired" });
  return ms.sort((a, b) => a.date.localeCompare(b.date));
}

const COLOR: Record<Milestone["kind"], string> = {
  issued: "#45c8ff",
  effective: "#3ad294",
  amended: "#e5b054",
  expired: "#f0716b",
};

export default function TimelineBar({ law, compact = false }: { law: Law; compact?: boolean }) {
  const ms = milestonesOf(law);
  const W = 640;
  const H = compact ? 74 : 96;
  const pad = 26;
  const y = H / 2 + (compact ? 4 : 8);

  const min = Date.parse(ms[0].date);
  const maxRaw = Math.max(...ms.map((m) => Date.parse(m.date)));
  const max = Math.max(maxRaw, min + 1000 * 60 * 60 * 24 * 90);
  const x = (d: string) => pad + ((Date.parse(d) - min) / (max - min)) * (W - pad * 2);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Dòng thời gian hiệu lực của ${law.name}`}>
      <line x1={pad - 14} y1={y} x2={W - pad + 14} y2={y} stroke="#22345a" strokeWidth="2" />
      <path d={`M${W - pad + 14} ${y} l-7 -4 v8 Z`} fill="#22345a" />
      {ms.map((m, i) => {
        const cx = x(m.date);
        const above = i % 2 === 0;
        const c = COLOR[m.kind];
        const labelY = above ? y - 30 : y + 30;
        const dateY = above ? y - 16 : y + 44;
        return (
          <g key={i}>
            <line x1={cx} y1={above ? y - 12 : y + 12} x2={cx} y2={above ? labelY + 6 : labelY - 12} stroke={`${c}55`} strokeWidth="1" strokeDasharray="2 3" />
            {m.kind === "expired" ? (
              <rect x={cx - 4.5} y={y - 4.5} width="9" height="9" fill={c} transform={`rotate(45 ${cx} ${y})`} />
            ) : (
              <circle cx={cx} cy={y} r={m.kind === "effective" ? 5.5 : 4.5} fill={m.kind === "issued" ? "#0d1728" : c} stroke={c} strokeWidth="2" />
            )}
            <text x={cx} y={labelY} textAnchor="middle" fontSize={compact ? 10 : 11} fontWeight={600} fill="#c6d4ea">
              {m.label}
            </text>
            <text x={cx} y={dateY} textAnchor="middle" fontSize={9.5} fill="#6e81a3" fontFamily="IBM Plex Mono, monospace">
              {fmtDate(m.date)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function RelationLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-dim">
      {(Object.keys(REL_LABEL) as (keyof typeof REL_LABEL)[]).map((k) => (
        <span key={k} className="inline-flex items-center gap-1.5">
          <span className="h-[2px] w-5 rounded" style={{ background: REL_LABEL[k].color }} />
          {REL_LABEL[k].label}
        </span>
      ))}
    </div>
  );
}
