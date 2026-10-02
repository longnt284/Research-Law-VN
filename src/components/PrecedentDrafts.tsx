import Link from "next/link";

import { DomainChip } from "@/components/DocMeta";
import { DRAFT_CONTEXT, precedentDrafts } from "@/data/precedent-drafts";
import type { Lang } from "@/data/types";
import { formatDate, getDict } from "@/i18n/dictionary";
import { describeSource } from "@/lib/sources";

const copy: Record<Lang, { title: string; warnLabel: string; warn: string; sources: string; checked: string; domains: string }> = {
  vi: {
    title: "Dự thảo án lệ — chỉ để tham khảo",
    warnLabel: "Chưa phải án lệ",
    warn: "Các dự thảo dưới đây do Tòa án nhân dân tối cao đăng để lấy ý kiến, chưa được Hội đồng Thẩm phán thông qua và không được viện dẫn trong xét xử. Chúng không có mặt trong tra hiệu lực, gia phả hay tìm kiếm của trang. Nội dung có thể đổi hoặc bị loại ở phiên họp sau.",
    sources: "Nguồn",
    checked: "Tra cứu ngày",
    domains: "Văn bản liên quan ở lĩnh vực",
  },
  en: {
    title: "Draft precedents — for reference only",
    warnLabel: "Not yet precedents",
    warn: "The drafts below were published by the Supreme People's Court for comment. They have not been adopted by the Judicial Council and may not be cited in adjudication. They are kept out of the site's validity checks, family trees and search. Their content may change, or they may be dropped, at a later session.",
    sources: "Sources",
    checked: "Checked on",
    domains: "Related instruments in",
  },
};

/**
 * Mục dự thảo án lệ ở trang lĩnh vực Án lệ.
 *
 * Tách hẳn khỏi danh sách văn bản phía trên và đặt dưới một lời cảnh báo, để
 * người đọc không lẫn dự thảo với án lệ đã công bố.
 */
export function PrecedentDrafts({ lang }: { lang: Lang }) {
  const c = copy[lang];
  const t = getDict(lang);
  return (
    <section className="mt-12" aria-labelledby="du-thao-an-le">
      <h2 id="du-thao-an-le" className="eyebrow eyebrow-tick">
        {c.title}
      </h2>
      <div className="mt-3 border-l-2 border-amber-600/70 bg-amber-500/[0.07] px-4 py-3">
        <p className="eyebrow text-amber-800 dark:text-amber-300">{c.warnLabel}</p>
        <p className="measure mt-1 text-sm leading-relaxed text-[var(--ink-2)]">{c.warn}</p>
      </div>
      <p className="measure mt-4 text-[0.9375rem] leading-relaxed text-[var(--ink-2)]">
        {DRAFT_CONTEXT.text[lang]}
      </p>
      <ul className="mt-4 border-t border-dashed border-[var(--rule)]">
        {precedentDrafts.map((d) => (
          <li key={d.id} className="border-b border-dashed border-[var(--rule)] py-4 pl-4">
            <div className="grid gap-x-6 gap-y-1.5 sm:grid-cols-[11rem_1fr]">
              <p
                className="tnum text-[0.9375rem] font-semibold text-[var(--ink-3)]"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {d.label[lang]}
              </p>
              <div className="min-w-0">
                <h3 className="text-[1.0625rem] leading-snug" style={{ fontFamily: "var(--font-serif)" }}>
                  {d.title[lang]}
                </h3>
                <p className="measure mt-1.5 text-sm leading-relaxed text-[var(--ink-2)]">{d.summary[lang]}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[var(--ink-3)]">
                  <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
                    {c.domains}
                    {d.domains.map((id) => (
                      <Link key={id} href={`/${lang}/linh-vuc/${id}`} className="hover:text-[var(--accent)]">
                        <DomainChip id={id} lang={lang} />
                      </Link>
                    ))}
                  </span>
                  <span className="tnum">
                    {c.checked}: {formatDate(d.verifiedOn, lang, t.doc.unknownDate)}
                  </span>
                </div>
                <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--ink-3)]">
                  {c.sources}:
                  {d.sources.map((s) => (
                    <a
                      key={s}
                      href={s}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-dotted underline-offset-2 hover:text-[var(--accent)]"
                    >
                      {describeSource(s).name[lang]}
                    </a>
                  ))}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[var(--ink-3)]">
        {c.sources}:
        {DRAFT_CONTEXT.sources.map((s) => (
          <a
            key={s}
            href={s}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-dotted underline-offset-2 hover:text-[var(--accent)]"
          >
            {describeSource(s).name[lang]}
          </a>
        ))}
      </p>
    </section>
  );
}
