"use client";

import { ValidityBadge } from "@/components/validity/ValidityBadge";
import type { Lang } from "@/data/types";
import { formatDate } from "@/i18n/dictionary";
import { getDocPanel } from "@/i18n/doc-panel";
import { useAsOf } from "@/lib/client-store";
import { segmentAt, type ValiditySegment } from "@/lib/validity-segment";

/**
 * Tình trạng tại ngày tra cứu người đọc đang đặt, cạnh tình trạng tại ngày kiểm
 * tra dữ liệu. Không đặt ngày thì không hiện gì.
 */
export function AsOfStatus({ segments, lang }: { segments: ValiditySegment[]; lang: Lang }) {
  const asOf = useAsOf();
  if (!asOf) return null;
  const seg = segmentAt(segments, asOf);
  return (
    <span className="asof-status">
      <span className="asof-status-label">{getDocPanel(lang).atDate(formatDate(asOf, lang, asOf))}</span>
      <ValidityBadge state={seg.state} amended={seg.amended} lang={lang} size="md" />
    </span>
  );
}
