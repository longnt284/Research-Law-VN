import Link from "next/link";

import { StatusBadge } from "@/components/DocMeta";
import type { Lang, LegalDoc } from "@/data/types";
import { formatDate, getDict } from "@/i18n/dictionary";

/**
 * Một dòng văn bản trong trang lĩnh vực.
 *
 * Danh sách này là đường đi chính, không phải khối ba chiều phía trên: nó dùng
 * được bằng bàn phím, đọc được bằng trình đọc màn hình, và hiện ra cả khi trình
 * duyệt không dựng được WebGL.
 */
export function DocMetaRow({ doc, lang }: { doc: LegalDoc; lang: Lang }) {
  const t = getDict(lang);
  return (
    <li className="border-b border-[var(--rule)]">
      <Link
        href={`/${lang}/van-ban/${doc.id}`}
        className="row-mark group grid gap-x-6 gap-y-1.5 py-3.5 pl-4 transition-colors hover:bg-[var(--paper-2)] sm:grid-cols-[11rem_1fr]"
      >
        <p
          className="tnum text-[0.9375rem] font-semibold text-[var(--accent)]"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          {doc.number}
        </p>
        <div className="min-w-0">
          <h3
            className="text-[1.0625rem] leading-snug transition-colors group-hover:text-[var(--accent)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {doc.title[lang]}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <StatusBadge status={doc.status} lang={lang} size="sm" />
            <span className="tnum text-xs text-[var(--ink-3)]">
              {t.doc.effectiveOn}: {formatDate(doc.effectiveOn, lang, t.doc.unknownDate)}
            </span>
            <span className="text-xs text-[var(--ink-3)]">{t.type[doc.type]}</span>
          </div>
        </div>
      </Link>
    </li>
  );
}
