import { notFound } from "next/navigation";

import { documents, documentsById, domains } from "@/data/documents";
import { formatDate, getDict, isLang, LANGS } from "@/i18n/dictionary";
import { C, OG_SIZE, renderCard, SERIF, StatusPill } from "@/og/card";
import { clip } from "@/lib/site";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Lex & Lineage · Gia phả văn bản pháp luật Việt Nam · The genealogy of Vietnamese law";
export const dynamicParams = false;

const domainById = new Map(domains.map((d) => [d.id, d]));

export function generateStaticParams() {
  return LANGS.flatMap((lang) => documents.map((d) => ({ lang, slug: d.id })));
}

/** Ảnh chia sẻ của một văn bản: số hiệu, tên, tình trạng, ngày hiệu lực, lĩnh vực. */
export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const doc = documentsById.get(slug);
  if (!isLang(lang) || !doc) notFound();
  const t = getDict(lang);

  return renderCard(
    lang,
    t.type[doc.type],
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          fontFamily: SERIF,
          fontSize: 58,
          color: C.accent,
          letterSpacing: 1,
        }}
      >
        {doc.number}
      </div>
      <div
        style={{
          display: "flex",
          marginTop: 14,
          fontFamily: SERIF,
          fontSize: doc.title[lang].length > 90 ? 42 : 52,
          lineHeight: 1.18,
          maxWidth: 1000,
        }}
      >
        {clip(doc.title[lang], 150)}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 30 }}>
        <StatusPill status={doc.status} lang={lang} />
        <div style={{ display: "flex", fontSize: 24, color: C.ink2 }}>
          {t.doc.effectiveOn}: {formatDate(doc.effectiveOn, lang, t.doc.unknownDate)}
        </div>
      </div>
    </div>,
    <div style={{ display: "flex", color: C.ink2 }}>
      {doc.domains
        .map((id) => domainById.get(id)?.label[lang] ?? id)
        .join(" · ")}
    </div>,
  );
}
