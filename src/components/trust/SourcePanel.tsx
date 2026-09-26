import Link from "next/link";

import { SOURCES_ANCHOR } from "@/components/SourceLinks";
import type { Lang, LegalDoc } from "@/data/types";
import { verifiedOnOf } from "@/data/documents";
import { formatDate, getDict } from "@/i18n/dictionary";
import { getDocPanel } from "@/i18n/doc-panel";
import { hasAuthoritativeSource, primarySource, type SourceInfo } from "@/lib/sources";

/**
 * Khối "nguồn và kiểm chứng" ở cột bên của trang văn bản.
 *
 * Trả lời bốn câu hỏi của người sắp viện dẫn: nguồn chính là đâu, kiểm tra lần
 * cuối khi nào, bản ghi đã được đối chiếu với nguồn chính thống chưa, và có bao
 * nhiêu nguồn đã được mở. Dấu kiểm chỉ hiện khi bản ghi thực sự ở mức đã đối
 * chiếu và có nguồn chính thống; thiếu một trong hai là nói ra.
 */
export function SourcePanel({
  doc,
  sources,
  lang,
}: {
  doc: LegalDoc;
  sources: readonly SourceInfo[];
  lang: Lang;
}) {
  const c = getDocPanel(lang).trust;
  const t = getDict(lang);
  const primary = primarySource(sources);
  const checked = verifiedOnOf(doc);
  const ok = doc.confidence === "verified" && hasAuthoritativeSource(sources);
  const checkedText = formatDate(checked, lang, checked);

  return (
    <section className={`trust-panel${ok ? " is-ok" : " is-warn"}`} aria-labelledby="trust-panel-title">
      <h2 id="trust-panel-title" className="eyebrow">
        {c.title}
      </h2>
      <p className="trust-panel-state">
        <svg viewBox="0 0 16 16" aria-hidden="true" className="trust-panel-icon">
          {ok ? (
            <path d="M3.5 8.4 6.6 11.4 12.5 4.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <>
              <path d="M8 2.5 14 13H2Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
              <path d="M8 6.6v3M8 11.3v.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </>
          )}
        </svg>
        {ok ? c.verified : c.crossCheck}
      </p>
      <dl className="trust-panel-facts">
        <div>
          <dt>{c.source}</dt>
          <dd>
            {primary ? (
              <a href={primary.url} target="_blank" rel="noopener noreferrer nofollow" className="ref-link">
                {primary.name[lang]} <span aria-hidden="true">↗</span>
                <span className="sr-only">{t.doc.newTab}</span>
              </a>
            ) : (
              <span className="trust-panel-muted">{c.noSource}</span>
            )}
            {primary && <span className="trust-panel-host">{primary.host}</span>}
          </dd>
        </div>
        <div>
          <dt>{c.checked}</dt>
          <dd className="tnum" title={c.checkedTip(checkedText)}>
            {checkedText}
          </dd>
        </div>
      </dl>
      <p className="trust-panel-links">
        <a href={`#${SOURCES_ANCHOR}`} className="ref-link">
          {c.count(sources.length)} ↓
        </a>
        <Link href={`/${lang}/gop-y?vb=${encodeURIComponent(doc.number)}`} className="ref-link">
          {c.report}
        </Link>
      </p>
    </section>
  );
}
