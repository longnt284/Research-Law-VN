import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CompareArt } from "@/components/art/PageArt";
import { FreeCompare, type CompareRow } from "@/components/FreeCompare";
import { LuxBackdrop } from "@/components/LuxBackdrop";
import { documents, domains, relations, verifiedOnOf } from "@/data/documents";
import type { Lang } from "@/data/types";
import { formatDate, getDict, isLang } from "@/i18n/dictionary";
import { getFreeCompareCopy } from "@/i18n/free-compare";
import { pairs } from "@/lib/compare";
import { fold } from "@/lib/search";
import { alternatesFor, shareMeta } from "@/lib/site";
import { validitySegments } from "@/lib/validity";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const c = getFreeCompareCopy(lang);
  return {
    title: c.title,
    description: c.lede,
    alternates: alternatesFor(lang, "/doi-chieu/tu-chon"),
    ...shareMeta(lang, "/doi-chieu/tu-chon", c.title, c.lede),
  };
}

/** Dòng dữ liệu gửi xuống trình duyệt: chữ hiển thị dựng sẵn theo ngôn ngữ trang. */
function rowsFor(lang: Lang): CompareRow[] {
  const t = getDict(lang);
  const dom = new Map(domains.map((d) => [d.id, d.label[lang]]));
  const unknown = t.doc.unknownDate;
  return documents.map((d) => ({
    id: d.id,
    number: d.number,
    title: d.title[lang],
    type: t.type[d.type],
    status: d.status,
    statusLabel: t.status[d.status],
    issued: formatDate(d.issuedOn, lang, unknown),
    effective: formatDate(d.effectiveOn, lang, unknown),
    effectiveOn: d.effectiveOn,
    verified: formatDate(verifiedOnOf(d), lang, verifiedOnOf(d)),
    domains: d.domains.map((id) => dom.get(id) ?? id).join(", "),
    confidence: d.confidence === "verified" ? t.confidence.verifiedLabel : t.confidence.crossCheckLabel,
    segments: validitySegments(d),
    keys: fold(`${d.number} ${d.title.vi} ${d.title.en}`),
  }));
}

export default async function FreeComparePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const c = getFreeCompareCopy(lang);

  return (
    <>
      <section className="rule-b hero-lux">
        <LuxBackdrop />
        <div className="hero-split mx-auto w-full max-w-[76rem] px-5 py-10 sm:px-8 sm:py-14">
          <div className="min-w-0">
            <p className="eyebrow eyebrow-tick rise">{c.eyebrow}</p>
            <h1 className="display rise rise-1 mt-3 max-w-[20ch]">{c.title}</h1>
            <p className="measure rise rise-2 mt-4 text-[1.0625rem] leading-relaxed text-[var(--ink-2)]">
              {c.lede}
            </p>
          </div>
          <div className="hero-art rise rise-2">
            <CompareArt lang={lang} />
          </div>
        </div>
      </section>
      <FreeCompare
        lang={lang}
        rows={rowsFor(lang)}
        edges={relations.map(({ from, to, kind }) => ({ from, to, kind }))}
        pairs={pairs.map((p) => ({
          id: p.id,
          newId: p.newDoc.id,
          oldId: p.oldDoc.id,
          points: p.entry?.points.length ?? 0,
        }))}
      />
    </>
  );
}
