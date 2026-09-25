import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ObjectiveNotice } from "@/components/CompareMeta";
import { CrossCheckNotice, DomainChip } from "@/components/DocMeta";
import { LineageTrack } from "@/components/LineageTrack";
import { LuxBackdrop } from "@/components/LuxBackdrop";
import type { Lang } from "@/data/types";
import { getDict, isLang, LANGS } from "@/i18n/dictionary";
import { lineageById, lineageMatrix, lineageNotes, lineages } from "@/lib/lineage";
import { alternatesFor, shareMeta } from "@/lib/site";

export function generateStaticParams() {
  return LANGS.flatMap((lang) => lineages.map((l) => ({ lang, id: l.id })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  if (!isLang(lang)) return {};
  const lineage = lineageById.get(id);
  if (!lineage) return {};
  const t = getDict(lang);
  const title = `${t.compare.lineageTitle}: ${lineage.current.title[lang]}`;
  const description = `${lineage.docs.length} ${t.compare.lineageDocs} — ${lineage.docs
    .map((d) => d.number)
    .join(", ")}.`;
  return {
    title,
    description,
    alternates: alternatesFor(lang, `/doi-chieu/chuoi/${lineage.id}`),
    ...shareMeta(lang, `/doi-chieu/chuoi/${lineage.id}`, title, description),
  };
}

export default async function LineagePage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang: raw, id } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const lineage = lineageById.get(id);
  if (!lineage) notFound();

  const t = getDict(lang);
  const matrix = lineageMatrix(lineage, lang);
  const notes = lineageNotes(lineage, lang);
  const fieldLabel: Record<(typeof matrix)[number]["field"], string> = {
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
            ← {t.compare.lineageBack}
          </Link>

          <header className="mt-5">
            <p className="eyebrow eyebrow-tick rise">
              {lineage.docs.length} {t.compare.lineageDocs} · {lineage.steps.length}{" "}
              {t.compare.lineageSteps}
            </p>
            <h1 className="display rise rise-1 mt-3">{lineage.current.title[lang]}</h1>
            <p className="tnum rise rise-1 mt-2 text-[var(--ink-3)]">
              {lineage.docs.map((d) => d.number).join(" · ")}
            </p>
            <div className="rise rise-2 mt-4 flex flex-wrap gap-2">
              {lineage.domains.map((d) => (
                <DomainChip key={d} id={d} lang={lang} />
              ))}
            </div>
          </header>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[76rem] px-5 py-8 sm:px-8">
        <ObjectiveNotice lang={lang} />

        {lineage.confidence === "cross-check" && (
          <div className="mt-5">
            <CrossCheckNotice lang={lang} />
          </div>
        )}

        <section className="mt-10">
          <h2 className="eyebrow eyebrow-tick">{t.compare.lineageTimelineTitle}</h2>
          <p className="measure mt-2 text-sm text-[var(--ink-3)]">
            {t.compare.lineageTimelineHint}
          </p>
          <LineageTrack lineage={lineage} lang={lang} />
        </section>

        <section className="mt-12">
          <h2 className="eyebrow eyebrow-tick">{t.compare.lineageMatrixTitle}</h2>
          <p className="measure mt-2 text-sm text-[var(--ink-3)]">
            {t.compare.lineageMatrixHint}
          </p>
          {/*
            Bảng nhiều cột thì luôn rộng hơn màn hình điện thoại, và cả trên máy
            tính khi chuỗi dài. Cuộn ngang trong khung bảng vẫn hơn là ép chữ
            xuống thành từng cột hẹp không đọc được.
          */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-[0.9375rem]">
              <thead>
                <tr className="border-y border-[var(--rule-strong)] text-left">
                  <th className="eyebrow py-2 pr-4 font-normal">&nbsp;</th>
                  {lineage.docs.map((doc) => (
                    <th
                      key={doc.id}
                      className="eyebrow min-w-[9rem] py-2 pr-4 font-normal"
                    >
                      {doc.number}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row) => (
                  <tr key={row.field} className="border-b border-[var(--rule)] align-top">
                    <th
                      scope="row"
                      className="w-[10rem] py-2.5 pr-4 text-left text-sm font-normal text-[var(--ink-3)]"
                    >
                      {fieldLabel[row.field]}
                    </th>
                    {row.cells.map((cell) => (
                      <td
                        key={cell.docId}
                        className={`tnum py-2.5 pr-4 ${
                          cell.changed
                            ? "font-semibold text-[var(--ink)]"
                            : "text-[var(--ink-2)]"
                        }`}
                      >
                        {cell.value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="eyebrow eyebrow-tick">{t.compare.lineageNotesTitle}</h2>
          <p className="measure mt-2 text-sm text-[var(--ink-3)]">
            {t.compare.lineageNotesHint}
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
      </div>
    </article>
  );
}
