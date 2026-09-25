import { notFound } from "next/navigation";

import { documents, documentsById, LATEST_VERIFIED_ON } from "@/data/documents";
import type { LegalDoc } from "@/data/types";
import { getCheckCopy } from "@/i18n/check";
import { getHub } from "@/i18n/hub";
import { isLang, LANGS } from "@/i18n/dictionary";
import { getValidityCopy } from "@/i18n/validity";
import { validityAt } from "@/lib/validity";
import { Arrow, C, OG_SIZE, renderCard, SERIF } from "@/og/card";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Bản đồ Không gian Pháp luật · Vietnamese Legal Space Map";
export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

/** Hai dòng căn cứ minh họa, cùng văn bản với đoạn mẫu trên trang. */
const DEMO = ["blds-2015", "luat-xay-dung-2014"];

/**
 * Ảnh chia sẻ của trang soát căn cứ: hai dòng căn cứ và kết quả thật của chúng
 * tại ngày tra cứu gần nhất, tính bằng đúng phép tính mà trang dùng.
 */
export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const c = getCheckCopy(lang);
  const v = getValidityCopy(lang);
  const rows = DEMO.map((id) => documentsById.get(id)).filter((d): d is LegalDoc => Boolean(d));

  return renderCard(
    lang,
    `${documents.length} ${getHub(lang).statDocs}`,
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", fontFamily: SERIF, fontSize: 72, lineHeight: 1.1 }}>{c.title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 36 }}>
        {rows.map((d) => {
          const at = validityAt(d, LATEST_VERIFIED_ON);
          const inForce = at.state === "in-force";
          return (
            <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 22, fontSize: 30 }}>
              <div
                style={{
                  display: "flex",
                  width: 260,
                  fontFamily: SERIF,
                  color: inForce ? C.ink : C.ink3,
                  textDecoration: inForce ? "none" : "line-through",
                }}
              >
                {d.number}
              </div>
              <div style={{ display: "flex", color: inForce ? "#065f46" : C.accent, fontWeight: 600, fontSize: 24 }}>
                {v.state[at.state]}
              </div>
              {at.state === "expired" && at.by && (
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <Arrow color={C.accent} dotted />
                  <div style={{ display: "flex", fontFamily: SERIF, color: C.accent }}>{at.by.number}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>,
  );
}
