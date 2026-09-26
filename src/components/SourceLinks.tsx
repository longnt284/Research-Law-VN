import type { Lang } from "@/data/types";
import { getDict } from "@/i18n/dictionary";
import {
  hasAuthoritativeSource,
  primarySource,
  type SourceInfo,
  type SourceKind,
} from "@/lib/sources";

/** Mã neo của khối nguồn, để nút ở đầu trang nhảy thẳng xuống. */
export const SOURCES_ANCHOR = "nguon";

/** Mũi tên chéo quen thuộc cho liên kết ra trang ngoài. */
function ExternalIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <path d="M6 3h7v7" />
      <path d="M13 3 4 12" />
    </svg>
  );
}

/*
  Nguồn chính thống mang màu mực đỏ của trang, nguồn khác lùi dần về xám: người
  đọc lướt thấy ngay đường dẫn nào đưa được vào hồ sơ. Chữ trong nhãn vẫn là thứ
  mang nghĩa, màu chỉ để mắt bắt nhanh hơn.
*/
const KIND_TONE: Record<SourceKind, string> = {
  official: "border-[var(--accent)] text-[var(--accent)]",
  issuer: "border-[var(--accent)] text-[var(--accent)]",
  database: "border-[var(--rule-strong)] text-[var(--ink-2)]",
  reference: "border-dashed border-[var(--rule-strong)] text-[var(--ink-3)]",
};

/**
 * Nút "Đọc toàn văn" ở đầu trang văn bản.
 *
 * Trước đây đường dẫn nguồn nằm cuối cột phải, chữ nhỏ màu xám, và trên màn
 * hình thấp còn bị khuất dưới cột dính. Mở toàn văn là việc đầu tiên người làm
 * pháp lý muốn làm sau khi thấy đúng số hiệu, nên nút đặt ngay dưới tên văn bản.
 */
export function FullTextAction({
  sources,
  lang,
}: {
  sources: readonly SourceInfo[];
  lang: Lang;
}) {
  const t = getDict(lang);
  const primary = primarySource(sources);
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
      {primary && (
        <a
          href={primary.url}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="btn btn-solid"
        >
          {t.doc.readFullText}
          <ExternalIcon />
          <span className="sr-only">{t.doc.newTab}</span>
        </a>
      )}
      <a href={`#${SOURCES_ANCHOR}`} className="btn btn-quiet">
        {t.doc.allSources} <span className="tnum">({sources.length})</span>
        <span aria-hidden="true">↓</span>
      </a>
      {primary && (
        <p className="text-[0.8125rem] text-[var(--ink-3)]">
          {t.doc.fullTextAt}{" "}
          <span className="font-medium text-[var(--ink-2)]">{primary.host}</span>
          {" · "}
          {t.doc.sourceKind[primary.kind]}
        </p>
      )}
    </div>
  );
}

/**
 * Danh sách nguồn đầy đủ, đặt trong cột chính ngay sau phần nội dung.
 *
 * Mỗi nguồn là một ô bấm được trọn vẹn, ghi tên trang, tên miền và loại nguồn.
 * Tên miền luôn hiện kể cả khi đã có tên trang: luật sư cần biết mình sắp mở
 * trang nào trước khi bấm.
 */
export function SourceList({
  sources,
  lang,
}: {
  sources: readonly SourceInfo[];
  lang: Lang;
}) {
  const t = getDict(lang);
  const authoritative = hasAuthoritativeSource(sources);
  return (
    <section id={SOURCES_ANCHOR} className="mt-9 scroll-mt-24" aria-labelledby="sources-title">
      <h2 id="sources-title" className="eyebrow eyebrow-tick">
        {t.doc.sources}
      </h2>
      <p className="measure mt-2.5 leading-relaxed text-[var(--ink-2)]">{t.doc.sourcesLede}</p>
      {!authoritative && (
        <p className="measure mt-3 border-l-2 border-amber-600/70 bg-amber-500/[0.07] px-4 py-2.5 text-sm leading-relaxed text-[var(--ink-2)]">
          {t.doc.sourcesNoOfficial}
        </p>
      )}
      <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {sources.map((s) => {
          const name = s.name[lang];
          return (
            <li key={s.url} className="min-w-0">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                title={s.url}
                className="row-mark group flex h-full items-start justify-between gap-3 border border-[var(--rule)] bg-[var(--paper)] px-4 py-3 transition-colors hover:border-[var(--accent)] hover:bg-[var(--paper-2)] focus-visible:border-[var(--accent)]"
              >
                <span className="min-w-0">
                  <span className="block text-[0.9375rem] font-medium leading-snug text-[var(--ink)] transition-colors group-hover:text-[var(--accent)]">
                    {name}
                  </span>
                  {name !== s.host && (
                    <span className="mt-0.5 block truncate text-xs text-[var(--ink-3)]">
                      {s.host}
                    </span>
                  )}
                  <span className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.6875rem]">
                    <span className={`whitespace-nowrap border px-1.5 py-px font-medium ${KIND_TONE[s.kind]}`}>
                      {t.doc.sourceKind[s.kind]}
                    </span>
                    {s.fullTextRank !== null && (
                      <span className="whitespace-nowrap text-[var(--ink-3)]">{t.doc.fullTextTag}</span>
                    )}
                  </span>
                </span>
                <ExternalIcon className="mt-1 text-[var(--ink-3)] transition-colors group-hover:text-[var(--accent)]" />
                <span className="sr-only">{t.doc.newTab}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
