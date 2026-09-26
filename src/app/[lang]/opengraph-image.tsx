import { notFound } from "next/navigation";

import { documents, domains, relations } from "@/data/documents";
import { getDict, isLang, LANGS } from "@/i18n/dictionary";
import { getHome } from "@/i18n/home";
import { getLanding } from "@/i18n/landing";
import { pairs } from "@/lib/compare";
import { C, OG_SIZE, renderCard, SERIF } from "@/og/card";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Lex & Lineage · Gia phả văn bản pháp luật Việt Nam · The genealogy of Vietnamese law";
export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

/**
 * Ảnh chia sẻ mặc định: dòng định danh của trang, câu khẩu hiệu và bốn con số
 * đếm từ tập dữ liệu. Tên trang đã nằm ở đầu khung chung. Trang nào không có
 * ảnh riêng thì dùng ảnh này.
 */
export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = getDict(lang);
  const h = getLanding(lang).coverage;
  const stats = [
    [documents.length, h.docs],
    [relations.length, h.relations],
    [domains.length, h.domains],
    [pairs.length, h.pairs],
  ] as const;

  return renderCard(
    lang,
    lang === "vi" ? "Việt Nam" : "Vietnam",
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", fontFamily: SERIF, fontSize: 56, lineHeight: 1.1, maxWidth: 1040 }}>
        {t.brandLine}
      </div>
      <div style={{ display: "flex", marginTop: 22, fontSize: 30, color: C.ink2, maxWidth: 940 }}>
        {getHome(lang).hero.motto}
      </div>
      <div style={{ display: "flex", gap: 48, marginTop: 44 }}>
        {stats.map(([n, label]) => (
          <div key={label} style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontFamily: SERIF, fontSize: 48, color: C.accent }}>{n}</div>
            <div style={{ display: "flex", fontSize: 22, color: C.ink3 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>,
  );
}
