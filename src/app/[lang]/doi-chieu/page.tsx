import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ObjectiveNotice } from "@/components/CompareMeta";
import { LuxBackdrop } from "@/components/LuxBackdrop";
import { Reveal } from "@/components/Reveal";
import type { Lang } from "@/data/types";
import { formatDate, getDict, isLang, LANGS } from "@/i18n/dictionary";
import { curatedPairCount, pairs } from "@/lib/compare";
import { alternatesFor } from "@/lib/site";
import { lexiconStats } from "@/lib/objectivity";

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

  return (
    <>
      <section className="rule-b hero-lux">
        <LuxBackdrop />
        <div className="mx-auto w-full max-w-[76rem] px-5 py-10 sm:px-8 sm:py-14">
          <p className="eyebrow eyebrow-tick rise">
            {pairs.length} {t.compare.pairsCount} · {curatedPairCount}{" "}
            {t.compare.curatedBadge}
          </p>
          <h1 className="display rise rise-1 mt-3">{t.compare.title}</h1>
          <p className="measure rise rise-2 mt-4 text-[1.0625rem] leading-relaxed text-[var(--ink-2)]">
            {t.compare.lede}
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[76rem] px-5 py-10 sm:px-8 sm:py-12">
        <div className="grid gap-10 md:grid-cols-[1fr_19rem]">
          <section className="min-w-0">
            <h2 className="eyebrow eyebrow-tick">{t.compare.howTitle}</h2>
            {/* Bốn bước của cơ chế, đánh số để thấy rõ thứ tự: cặp có trước,
                dữ kiện có sau, nội dung sau nữa, phép kiểm đứng cuối. */}
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
          <h2 className="eyebrow eyebrow-tick">{t.compare.pairsTitle}</h2>
          <ul className="mt-4 border-t border-[var(--rule)]">
            {pairs.map((p, i) => (
              <li key={p.id} className="border-b border-[var(--rule)]">
                <Reveal delay={Math.min(i, 6) * 30}>
                  <Link
                    href={`/${lang}/doi-chieu/${p.id}`}
                    className="group grid gap-x-6 gap-y-3 py-5 md:grid-cols-[1fr_1fr_10rem]"
                  >
                    {/* Cột trái là văn bản trước, cột giữa là văn bản sau. Thứ
                        tự đọc trên màn hình hẹp cũng giữ nguyên cũ rồi mới. */}
                    <div className="min-w-0">
                      <p className="eyebrow">{t.compare.oldSide}</p>
                      <p className="tnum mt-1 text-sm font-semibold text-[var(--ink-3)]">
                        {p.oldDoc.number}
                      </p>
                      <p className="mt-0.5 text-[0.9375rem] leading-snug text-[var(--ink-2)]">
                        {p.oldDoc.title[lang]}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="eyebrow">{t.compare.newSide}</p>
                      <p className="tnum mt-1 text-sm font-semibold text-[var(--accent)]">
                        {p.newDoc.number}
                      </p>
                      <p className="mt-0.5 text-[0.9375rem] leading-snug underline decoration-[var(--rule-strong)] underline-offset-2 transition-colors group-hover:decoration-[var(--accent)]">
                        {p.newDoc.title[lang]}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-start gap-2 md:justify-end">
                      <span className="whitespace-nowrap border border-[var(--rule-strong)] px-2 py-0.5 text-[0.6875rem] font-medium tracking-wide text-[var(--ink-2)]">
                        {p.kind === "replaces"
                          ? t.compare.kindReplaces
                          : t.compare.kindAmends}
                      </span>
                      <span
                        className={`whitespace-nowrap px-2 py-0.5 text-[0.6875rem] font-medium tracking-wide ${
                          p.entry
                            ? "border border-[var(--brass)] text-[var(--brass)]"
                            : "border border-[var(--rule)] text-[var(--ink-3)]"
                        }`}
                      >
                        {p.entry
                          ? `${p.entry.points.length} · ${t.compare.curatedBadge}`
                          : t.compare.autoBadge}
                      </span>
                      <span className="tnum w-full text-[0.6875rem] text-[var(--ink-3)] md:text-right">
                        {formatDate(p.newDoc.effectiveOn, lang, t.doc.unknownDate)}
                      </span>
                    </div>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
