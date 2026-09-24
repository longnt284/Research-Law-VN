import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CompareArt } from "@/components/art/PageArt";
import { ObjectiveNotice } from "@/components/CompareMeta";
import { LuxBackdrop } from "@/components/LuxBackdrop";
import { PairFilter, type PairRow } from "@/components/PairFilter";
import { Reveal } from "@/components/Reveal";
import type { Lang } from "@/data/types";
import { formatDate, getDict, isLang, LANGS } from "@/i18n/dictionary";
import { curatedPairCount, pairs } from "@/lib/compare";
import { lineageStats, lineages } from "@/lib/lineage";
import { alternatesFor } from "@/lib/site";
import { lexiconStats } from "@/lib/objectivity";

/** Bỏ dấu, dựng sẵn ở máy chủ để ô tìm kiếm phía trình duyệt khỏi làm lại. */
function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = getDict(lang);
  return {
    title: t.compare.title,
    description: t.compare.lede,
    alternates: alternatesFor(lang, "/doi-chieu"),
  };
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const t = getDict(lang);

  /*
    Dòng cho bộ lọc được rút gọn ngay ở máy chủ: trình duyệt chỉ nhận đúng những
    trường nó cần để lọc và để vẽ, không nhận cả tập dữ liệu văn bản.
  */
  const rows: PairRow[] = pairs.map((p) => ({
    id: p.id,
    kind: p.kind,
    curated: Boolean(p.entry),
    points: p.entry?.points.length ?? 0,
    domains: [...new Set([...p.newDoc.domains, ...p.oldDoc.domains])],
    oldNumber: p.oldDoc.number,
    oldTitle: p.oldDoc.title[lang],
    newNumber: p.newDoc.number,
    newTitle: p.newDoc.title[lang],
    effectiveLabel: formatDate(p.newDoc.effectiveOn, lang, t.doc.unknownDate),
    haystack: fold(
      `${p.newDoc.number} ${p.oldDoc.number} ${p.newDoc.title.vi} ${p.newDoc.title.en} ${p.oldDoc.title.vi} ${p.oldDoc.title.en}`,
    ),
  }));

  return (
    <>
      <section className="rule-b hero-lux">
        <LuxBackdrop />
        <div className="hero-split mx-auto w-full max-w-[76rem] px-5 py-10 sm:px-8 sm:py-14">
          <div className="min-w-0">
            <p className="eyebrow eyebrow-tick rise">
              {pairs.length} {t.compare.pairsCount} · {lineageStats.count}{" "}
              {t.compare.lineageCount} · {curatedPairCount} {t.compare.curatedBadge}
            </p>
            <h1 className="display rise rise-1 mt-3">{t.compare.title}</h1>
            <p className="measure rise rise-2 mt-4 text-[1.0625rem] leading-relaxed text-[var(--ink-2)]">
              {t.compare.lede}
            </p>
          </div>
          {/* Hai trang cùng một điều: trang cũ có dòng bị bỏ, trang mới có dòng
              được chèn. Đúng việc mà trang này làm với từng cặp văn bản. */}
          <div className="hero-art rise rise-2">
            <CompareArt lang={lang} />
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[76rem] px-5 py-10 sm:px-8 sm:py-12">
        <div className="grid gap-10 md:grid-cols-[1fr_19rem]">
          <section className="min-w-0">
            <h2 className="eyebrow eyebrow-tick">{t.compare.howTitle}</h2>
            {/* Các bước của cơ chế, đánh số để thấy rõ thứ tự: cặp có trước,
                dữ kiện có sau, nội dung sau nữa, phép kiểm và chuỗi đứng cuối. */}
            <ol className="measure mt-3 space-y-3">
              {t.compare.how.map((line, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="tnum shrink-0 text-[var(--brass)]"
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {i + 1}
                  </span>
                  <span className="leading-relaxed text-[var(--ink-2)]">{line}</span>
                </li>
              ))}
            </ol>
          </section>

          <aside className="min-w-0 self-start">
            <ObjectiveNotice lang={lang} />
            <div className="mt-5 border-t border-[var(--rule)] pt-4">
              <p className="eyebrow">{t.compare.gateTitle}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-2)]">
                {t.compare.gateNote}
              </p>
              <p className="tnum mt-2 text-sm text-[var(--ink-3)]">
                {lexiconStats.terms} {t.compare.gateTerms} · {lexiconStats.groups}{" "}
                {t.compare.gateGroups}
              </p>
            </div>
          </aside>
        </div>

        <section className="mt-12">
          <h2 className="eyebrow eyebrow-tick">{t.compare.lineageTitle}</h2>
          <p className="measure mt-2 leading-relaxed text-[var(--ink-2)]">
            {t.compare.lineageLede}
          </p>
          <p className="measure mt-2 text-sm text-[var(--ink-3)]">
            {t.compare.lineageListHint}
          </p>
          {/* Chuỗi đặt trước danh sách cặp: người mở trang thường đi tìm một
              đời văn bản, rồi mới xuống tới từng lần thay đổi trong đời đó. */}
          <ul className="mt-5 grid gap-px bg-[var(--rule)] sm:grid-cols-2">
            {lineages.map((l, i) => (
              <li key={l.id} className="bg-[var(--paper)]">
                <Reveal delay={Math.min(i, 6) * 30}>
                  <Link
                    href={`/${lang}/doi-chieu/chuoi/${l.id}`}
                    className="group block h-full px-5 py-5"
                  >
                    <p className="eyebrow">
                      {l.docs.length} {t.compare.lineageDocs} · {l.steps.length}{" "}
                      {t.compare.lineageSteps}
                    </p>
                    <p className="mt-1.5 text-[1.0625rem] leading-snug underline decoration-[var(--rule-strong)] underline-offset-2 transition-colors group-hover:decoration-[var(--accent)]">
                      {l.current.title[lang]}
                    </p>
                    <p className="tnum mt-1 text-sm text-[var(--ink-3)]">
                      {l.docs.map((d) => d.number).join(" · ")}
                    </p>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="eyebrow eyebrow-tick">{t.compare.pairsTitle}</h2>
          <p className="measure mt-2 text-sm text-[var(--ink-3)]">
            {t.compare.filterTitle}
          </p>
          <PairFilter rows={rows} lang={lang} />
        </section>
      </div>
    </>
  );
}
