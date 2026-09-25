import { notFound } from "next/navigation";

import { documents, domains, relations } from "@/data/documents";
import { getDict, isLang, LANGS } from "@/i18n/dictionary";
import { getHub } from "@/i18n/hub";
import { pairs } from "@/lib/compare";
import { C, OG_SIZE, renderCard, SERIF } from "@/og/card";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Bản đồ Không gian Pháp luật · Vietnamese Legal Space Map";
export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

/**
 * Ảnh chia sẻ mặc định: tên trang, dòng giới thiệu và bốn con số đếm từ tập dữ
 * liệu. Trang nào không có ảnh riêng thì dùng ảnh này.
 */
export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = getDict(lang);
  const h = getHub(lang);
  const stats = [
    [documents.length, h.statDocs],
    [relations.length, h.statRelations],
    [domains.length, h.statDomains],
    [pairs.length, h.statPairs],
  ] as const;

  return renderCard(
    lang,
    lang === "vi" ? "Việt Nam" : "Vietnam",
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", fontFamily: SERIF, fontSize: 64, lineHeight: 1.1, maxWidth: 1000 }}>
        {t.siteName}
      </div>
      <div style={{ display: "flex", marginTop: 22, fontSize: 30, color: C.ink2, maxWidth: 940 }}>
        {t.siteTagline}
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
