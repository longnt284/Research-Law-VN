"use client";

import Link from "next/link";
import { useState } from "react";

import { StatusGlyph, type StatusTone } from "@/components/legal/LegalStatus";
import type { DocStatus, Lang } from "@/data/types";
import { formatDate, getDict } from "@/i18n/dictionary";
import { getValidityCopy } from "@/i18n/validity";
import { useAsOf, withAsOf } from "@/lib/client-store";
import type { HeroLineageLayout, HeroNode } from "@/lib/hero-lineage";
import { segmentAt, type ValidityState } from "@/lib/validity-segment";

/**
 * Hình dòng đời ở đầu trang chủ, có tương tác.
 *
 * Rê chuột hoặc đưa tiêu điểm bàn phím vào một văn bản thì các đường nối của nó
 * sáng lên, phần còn lại lùi xuống. Khi người đọc đã đặt ngày tra cứu, mỗi văn
 * bản mang tình trạng tại ngày đó và văn bản không có hiệu lực vào ngày ấy nhạt
 * đi — cùng một câu hỏi "tại ngày X" mà ô tìm kiếm trả lời.
 */

const TONE: Record<ValidityState, StatusTone> = {
  "in-force": "active",
  pending: "pending",
  expired: "expired",
  unknown: "unknown",
};

function head(x: number, y: number, angle: number, size = 6.5): string {
  const p = (a: number) =>
    `${(x - Math.cos(a) * size).toFixed(1)},${(y - Math.sin(a) * size).toFixed(1)}`;
  return `${x},${y} ${p(angle - 0.42)} ${p(angle + 0.42)}`;
}

function clip(t: string, max: number): string {
  return t.length <= max ? t : `${t.slice(0, max - 1).trimEnd()}…`;
}

export function HeroLineage({
  layout,
  lang,
  label,
}: {
  layout: HeroLineageLayout;
  lang: Lang;
  label: string;
}) {
  const t = getDict(lang);
  const v = getValidityCopy(lang);
  const asOf = useAsOf();
  const [active, setActive] = useState<string | null>(null);

  const linked = new Set<string>();
  if (active) {
    linked.add(active);
    for (const e of layout.edges) {
      if (e.from === active) linked.add(e.to);
      if (e.to === active) linked.add(e.from);
    }
  }

  const toneOf = (n: HeroNode): { tone: StatusTone; text: string; live: boolean } => {
    if (!asOf) {
      const s: DocStatus = n.status;
      return { tone: s, text: t.status[s], live: s === "active" || s === "amended" };
    }
    const seg = segmentAt(n.segs, asOf);
    const amended = seg.state === "in-force" && seg.amended;
    return {
      tone: amended ? "amended" : TONE[seg.state],
      text: `${v.state[seg.state]}${amended ? `, ${v.amended}` : ""} · ${formatDate(asOf, lang, asOf)}`,
      live: seg.state === "in-force",
    };
  };

  return (
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      className={`hl-svg${active ? " has-active" : ""}${asOf ? " has-asof" : ""}`}
      role="group"
      aria-label={label}
    >
      <g aria-hidden="true">
        {layout.edges.map((e, i) => {
          const on = active ? e.from === active || e.to === active : false;
          return (
            <g
              key={e.id}
              className={`hl-edge family-edge family-edge-${e.kind}${on ? " is-on" : ""}`}
              style={{ ["--i" as string]: i }}
            >
              <path d={e.d} className="hl-path" />
              <polygon points={head(e.tip.x, e.tip.y, e.tip.angle)} />
              {e.label && (
                <text x={e.label.x} y={e.label.y} textAnchor={e.label.anchor} className="hl-label">
                  {e.label.text}
                </text>
              )}
            </g>
          );
        })}
      </g>
      {layout.nodes.map((n) => {
        const st = toneOf(n);
        const focus = n.role === "focus";
        const cls = [
          "hl-node",
          `hl-node--${n.role}`,
          `lstatus--${st.tone}`,
          st.live ? "" : "is-dim",
          active && !linked.has(n.id) ? "is-faded" : "",
          active === n.id ? "is-active" : "",
        ].join(" ");
        return (
          <Link
            key={n.id}
            href={withAsOf(`/${lang}/van-ban/${n.id}`, asOf)}
            className={cls}
            aria-label={`${n.number}, ${n.title}. ${st.text}`}
            onPointerEnter={() => setActive(n.id)}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(n.id)}
            onBlur={() => setActive(null)}
          >
            <title>{`${n.number} — ${n.title}\n${st.text}`}</title>
            <rect x={n.x} y={n.y} width={n.w} height={n.h} className="hl-box" />
            {focus && <rect x={n.x} y={n.y} width={n.w} height={3} className="hl-bar" />}
            <text x={n.x + 12} y={n.y + 18} className="hl-kicker">
              {n.kicker}
            </text>
            <StatusGlyph tone={st.tone} box={{ x: n.x + n.w - 22, y: n.y + 8, size: 12 }} className="hl-glyph" />
            <text x={n.x + 12} y={n.y + 37} className="hl-number">
              {n.number}
            </text>
            <text x={n.x + 12} y={n.y + 53} className="hl-title">
              {clip(n.title, focus ? 27 : 24)}
            </text>
          </Link>
        );
      })}
    </svg>
  );
}
