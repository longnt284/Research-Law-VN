"use client";

import Link from "next/link";

import { ValidityBadge } from "@/components/validity/ValidityBadge";
import type { Lang } from "@/data/types";
import { formatDate } from "@/i18n/dictionary";
import { getSearchCopy } from "@/i18n/search";
import { getValidityCopy } from "@/i18n/validity";
import { setAsOf, useAsOf } from "@/lib/client-store";
import { segmentAt, type ValiditySegment } from "@/lib/validity-segment";

/**
 * Ô chọn ngày trên trang văn bản: văn bản này thế nào tại ngày đó.
 *
 * Nhận các đoạn đã tính sẵn ở máy chủ, nên chỉ việc tìm đoạn chứa ngày được
 * chọn. Chưa đặt ngày thì ô hiện ngày tra cứu của bản ghi, để lần đầu mở trang
 * ô này nói đúng điều bảng bên cạnh đang nói.
 *
 * Chọn một ngày ở đây là đặt ngày tra cứu cho cả trang ("pháp luật tại
 * ngày…"): gia phả, ô tìm và danh mục cùng tính theo ngày đó cho tới khi người
 * đọc bỏ ngày ở dải dưới thanh điều hướng.
 */
export function ValidityProbe({
  segments,
  initial,
  lang,
}: {
  segments: ValiditySegment[];
  initial: string;
  lang: Lang;
}) {
  const c = getValidityCopy(lang);
  const s = getSearchCopy(lang).asOf;
  const asOf = useAsOf();
  const date = asOf || initial;
  const seg = date ? segmentAt(segments, date) : null;

  return (
    <div className="border border-[var(--rule)] bg-[var(--paper-2)] px-4 py-3.5">
      <label htmlFor="validity-date" className="eyebrow block">
        {c.probeLabel}
      </label>
      <input
        id="validity-date"
        type="date"
        value={date}
        onChange={(e) => e.target.value && setAsOf(e.target.value)}
        className="tnum mt-1.5 w-full border border-[var(--rule-strong)] bg-[var(--paper)] px-2.5 py-1.5 text-[0.9375rem] outline-none focus:border-[var(--accent)]"
      />
      <p className="mt-1.5 text-xs leading-relaxed text-[var(--ink-3)]">{c.probeHint}</p>
      {asOf && (
        <button type="button" onClick={() => setAsOf("")} className="ref-link mt-1 text-xs">
          {s.clear}
        </button>
      )}
      {seg && (
        <div aria-live="polite" className="mt-3 space-y-1.5">
          <ValidityBadge state={seg.state} amended={seg.amended} lang={lang} />
          <p className="text-xs leading-relaxed text-[var(--ink-2)]">
            {seg.state === "unknown" ? (
              c.unknownWhy
            ) : (
              <>
                {seg.since && (
                  <>
                    {c.since} <span className="tnum">{formatDate(seg.since, lang, seg.since)}</span>
                  </>
                )}
                {seg.byId && seg.byNumber && (
                  <>
                    {" · "}
                    <Link
                      href={`/${lang}/van-ban/${seg.byId}`}
                      className="tnum font-semibold text-[var(--accent)] underline decoration-[var(--rule-strong)] underline-offset-2"
                    >
                      {seg.byNumber}
                    </Link>
                  </>
                )}
                {seg.withParent && <> · {c.withParent}</>}
                {seg.recorded && <> · {c.recorded}</>}
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
