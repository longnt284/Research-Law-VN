import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BasisSide } from "@/components/Citation";
import { ChangeKindTag, ObjectiveNotice } from "@/components/CompareMeta";
import { CrossCheckNotice, StatusBadge } from "@/components/DocMeta";
import { LuxBackdrop } from "@/components/LuxBackdrop";
import { TextDiff } from "@/components/TextDiff";
import type { Lang, LegalDoc } from "@/data/types";
import { getDict, isLang, LANGS } from "@/i18n/dictionary";
import { derivedNotes, factDeltas, pairById, pairs } from "@/lib/compare";
import { alternatesFor } from "@/lib/site";

export function generateStaticParams() {
  return LANGS.flatMap((lang) => pairs.map((p) => ({ lang, pair: p.id })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; pair: string }>;
}): Promise<Metadata> {
  const { lang, pair } = await params;
  if (!isLang(lang)) return {};
  const p = pairById.get(pair);
  if (!p) return {};
  const t = getDict(lang);
  return {
    title: `${p.newDoc.number} ${t.compare.versus} ${p.oldDoc.number}`,
    description: `${t.compare.title}: ${p.newDoc.title[lang]} — ${p.oldDoc.title[lang]}.`,
    alternates: alternatesFor(lang, `/doi-chieu/${p.id}`),
  };
}

/** Thẻ nhận diện một vế của bản đối chiếu. */
function Side({
  doc,
  label,
  lang,
  tone,
}: {
  doc: LegalDoc;
  label: string;
  lang: Lang;
  tone: "old" | "new";
}) {
  return (
    <div className="min-w-0">
      <p className="eyebrow">{label}</p>
      <p
        className={`tnum mt-1.5 text-[1.125rem] font-semibold ${
          tone === "new" ? "text-[var(--accent)]" : "text-[var(--ink-3)]"
        }`}
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {doc.number}
      </p>
      <Link
        href={`/${lang}/van-ban/${doc.id}`}
        className="mt-1 block text-[1.0625rem] leading-snug underline decoration-[var(--rule-strong)] underline-offset-2 transition-colors hover:decoration-[var(--accent)]"
      >
        {doc.title[lang]}
      </Link>
      <div className="mt-2.5">
        <StatusBadge status={doc.status} lang={lang} size="sm" />
      </div>
    </div>
  );
}

export default async function ComparePairPage({
  params,
}: {
  params: Promise<{ lang: string; pair: string }>;
}) {
  const { lang: raw, pair: pairId } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const pair = pairById.get(pairId);
  if (!pair) notFound();

  const t = getDict(lang);
  const facts = factDeltas(pair, lang);
  const notes = derivedNotes(pair, lang);
  const fieldLabel: Record<(typeof facts)[number]["field"], string> = {
    type: t.doc.type,
    status: t.doc.status,
    issuedOn: t.doc.issuedOn,
    effectiveOn: t.doc.effectiveOn,
    domains: t.doc.domains,
  };

  return (
    <article>
      <section className="rule-double-b hero-lux">
        <LuxBackdrop />
        <div className="mx-auto w-full max-w-[76rem] px-5 py-8 sm:px-8">
          <Link
            href={`/${lang}/doi-chieu`}
            className="link-sweep text-sm text-[var(--ink-3)] hover:text-[var(--accent)]"
          >
            ← {t.compare.backToPairs}
          </Link>

          <header className="mt-5">
            <p className="eyebrow eyebrow-tick rise">
              {pair.kind === "replaces" ? t.compare.kindReplaces : t.compare.kindAmends}
            </p>
            {/* Hai vế đặt cạnh nhau ngay đầu trang, ngăn bằng một đường kẻ dọc
                trên màn hình rộng — bố cục nói trước nội dung: đây là một bản
                đối chiếu, không phải một bài viết về một văn bản. */}
            <div className="rise rise-1 mt-4 grid gap-6 md:grid-cols-2 md:gap-10 md:divide-x md:divide-[var(--rule)]">
              <Side doc={pair.oldDoc} label={t.compare.oldSide} lang={lang} tone="old" />
              <div className="md:pl-10">
                <Side doc={pair.newDoc} label={t.compare.newSide} lang={lang} tone="new" />
              </div>
            </div>
          </header>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[76rem] px-5 py-8 sm:px-8">
        <ObjectiveNotice lang={lang} />

        {pair.confidence === "cross-check" && (
          <div className="mt-5">
            <CrossCheckNotice lang={lang} />
          </div>
        )}

        <section className="mt-10">
          <h2 className="eyebrow eyebrow-tick">{t.compare.factTitle}</h2>
          <p className="measure mt-2 text-sm text-[var(--ink-3)]">{t.compare.factHint}</p>
          {/*
            Bảng dùng `overflow-x-auto` bọc ngoài: trên điện thoại, năm dòng dữ
            kiện với tên lĩnh vực dài vẫn rộng hơn màn hình, và cuộn ngang trong
            khung bảng vẫn hơn là cả trang bị đẩy lệch.
          */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-[0.9375rem]">
              <thead>
                <tr className="border-y border-[var(--rule-strong)] text-left">
                  <th className="eyebrow py-2 pr-4 font-normal">&nbsp;</th>
                  <th className="eyebrow py-2 pr-4 font-normal">{t.compare.oldSide}</th>
                  <th className="eyebrow py-2 font-normal">{t.compare.newSide}</th>
                </tr>
              </thead>
              <tbody>
                {facts.map((f) => (
                  <tr key={f.field} className="border-b border-[var(--rule)] align-top">
                    <th
                      scope="row"
                      className="w-[10rem] py-2.5 pr-4 text-left text-sm font-normal text-[var(--ink-3)]"
                    >
                      {fieldLabel[f.field]}
                    </th>
                    <td className="tnum py-2.5 pr-4 text-[var(--ink-2)]">{f.before}</td>
                    <td
                      className={`tnum py-2.5 ${
                        f.changed ? "font-semibold text-[var(--ink)]" : "text-[var(--ink-2)]"
                      }`}
                    >
                      {f.after}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="eyebrow eyebrow-tick">{t.compare.derivedTitle}</h2>
          <p className="measure mt-2 text-sm text-[var(--ink-3)]">
            {t.compare.derivedHint}
          </p>
          <ul className="measure mt-3 space-y-2">
            {notes.map((n, i) => (
              <li key={i} className="flex gap-3 leading-relaxed text-[var(--ink-2)]">
                <span aria-hidden="true" className="text-[var(--brass)]">
                  §
                </span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="eyebrow eyebrow-tick">{t.compare.pointsTitle}</h2>

          {!pair.entry ? (
            <p className="measure mt-3 leading-relaxed text-[var(--ink-2)]">
              {t.compare.pointsEmpty}
            </p>
          ) : (
            <>
              <p className="measure mt-3 border-l-2 border-[var(--rule-strong)] pl-4 text-sm leading-relaxed text-[var(--ink-2)]">
                <span className="eyebrow mr-2">{t.compare.pointsScope}</span>
                {pair.entry.scope[lang]}
              </p>
              <p className="measure mt-2 text-sm text-[var(--ink-3)]">
                {t.compare.basisHint}
              </p>

              <div className="mt-6 space-y-8">
                {pair.entry.points.map((point) => (
                  <section
                    key={point.id}
                    className="border-t border-[var(--rule-strong)] pt-5"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-[1.15rem]">{point.topic[lang]}</h3>
                      <ChangeKindTag kind={point.kind} lang={lang} />
                      {point.confidence === "cross-check" && (
                        <span className="whitespace-nowrap border border-amber-600/60 px-2 py-0.5 text-[0.6875rem] font-medium text-amber-800 dark:text-amber-300">
                          {t.confidence.crossCheckLabel}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid gap-5 md:grid-cols-2 md:gap-8">
                      <div className="min-w-0 border-l-2 border-[var(--rule)] pl-4">
                        <p className="eyebrow">{t.compare.oldSide}</p>
                        <p className="mt-1.5 leading-relaxed text-[var(--ink-2)]">
                          {point.before[lang]}
                        </p>
                      </div>
                      <div className="min-w-0 border-l-2 border-[var(--accent)] pl-4">
                        <p className="eyebrow">{t.compare.newSide}</p>
                        <p className="mt-1.5 leading-relaxed">{point.after[lang]}</p>
                      </div>
                    </div>

                    {/* Nhận định đặt dưới hai vế chứ không đặt xen giữa: người
                        đọc gặp dữ kiện trước, gặp nhận định sau, và nhận định
                        được đóng khung bằng nhãn riêng để không lẫn vào nội
                        dung của văn bản. */}
                    <div className="mt-4 bg-[var(--paper-2)] px-4 py-3">
                      <p className="eyebrow text-[var(--brass)]">
                        {t.compare.observation}
                      </p>
                      <p className="measure mt-1 leading-relaxed text-[var(--ink-2)]">
                        {point.observation[lang]}
                      </p>
                    </div>

                    {/* Căn cứ tách theo vế. Gộp chung thì người đọc thấy được
                        những văn bản nào đã được đọc nhưng không biết vế nào
                        đọc từ đâu, mà đó chính là điều cần kiểm lại. */}
                    <div className="mt-3 space-y-1">
                      <BasisSide
                        label={t.compare.basisOld}
                        refs={point.basis.before}
                        lang={lang}
                      />
                      <BasisSide
                        label={t.compare.basisNew}
                        refs={point.basis.after}
                        lang={lang}
                      />
                    </div>
                  </section>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="mt-14 border-t border-[var(--rule-strong)] pt-6">
          <h2 className="eyebrow eyebrow-tick">{t.compare.diffTitle}</h2>
          <div className="mt-3">
            <TextDiff lang={lang} />
          </div>
        </section>
      </div>
    </article>
  );
}
