import { notFound } from "next/navigation";

import type { Lang, LegalDoc } from "@/data/types";
import { getDict, isLang, LANGS } from "@/i18n/dictionary";
import { pairById, pairs } from "@/lib/compare";
import { clip } from "@/lib/site";
import { Arrow, C, OG_SIZE, renderCard, SERIF, StatusPill } from "@/og/card";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Lex & Lineage · Gia phả văn bản pháp luật Việt Nam · The genealogy of Vietnamese law";
export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.flatMap((lang) => pairs.map((p) => ({ lang, pair: p.id })));
}

function Side({ doc, label, lang, tone }: { doc: LegalDoc; label: string; lang: Lang; tone: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", width: 440 }}>
      <div style={{ display: "flex", fontSize: 20, letterSpacing: 3, color: C.ink3, textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ display: "flex", marginTop: 12, fontFamily: SERIF, fontSize: 44, color: tone }}>
        {doc.number}
      </div>
      <div style={{ display: "flex", marginTop: 10, fontFamily: SERIF, fontSize: 30, lineHeight: 1.22 }}>
        {clip(doc.title[lang], 95)}
      </div>
      <div style={{ display: "flex", marginTop: 20 }}>
        <StatusPill status={doc.status} lang={lang} />
      </div>
    </div>
  );
}

/** Ảnh chia sẻ của một cặp đối chiếu: hai vế đặt cạnh nhau như ở đầu trang. */
export default async function Image({
  params,
}: {
  params: Promise<{ lang: string; pair: string }>;
}) {
  const { lang, pair: id } = await params;
  const pair = pairById.get(id);
  if (!isLang(lang) || !pair) notFound();
  const t = getDict(lang);
  const replaces = pair.kind === "replaces";

  return renderCard(
    lang,
    `${t.nav.compare} · ${replaces ? t.compare.kindReplaces : t.compare.kindAmends}`,
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Side doc={pair.oldDoc} label={t.compare.oldSide} lang={lang} tone={C.ink3} />
      <Arrow color={replaces ? C.accent : C.ink3} dotted={replaces} />
      <Side doc={pair.newDoc} label={t.compare.newSide} lang={lang} tone={C.accent} />
    </div>,
    pair.entry ? (
      <div style={{ display: "flex", color: C.brass }}>
        {pair.entry.points.length} · {t.compare.curatedBadge}
      </div>
    ) : undefined,
  );
}
