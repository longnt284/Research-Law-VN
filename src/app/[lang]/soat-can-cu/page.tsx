import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CheckArt } from "@/components/art/PageArt";
import { BasisChecker } from "@/components/BasisChecker";
import { LuxBackdrop } from "@/components/LuxBackdrop";
import { documents, documentsById, LATEST_VERIFIED_ON } from "@/data/documents";
import type { Lang } from "@/data/types";
import { getCheckCopy } from "@/i18n/check";
import { isLang } from "@/i18n/dictionary";
import { basisRows, namedNumbers } from "@/lib/basis-rows";
import { alternatesFor, shareMeta } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const c = getCheckCopy(lang);
  return {
    title: c.title,
    description: c.lede,
    alternates: alternatesFor(lang, "/soat-can-cu"),
    ...shareMeta(lang, "/soat-can-cu", c.title, c.lede, { ownImage: true }),
  };
}

/**
 * Văn bản của đoạn mẫu, theo thứ tự xuất hiện. Chọn để một lần bấm cho thấy
 * đủ các trường hợp: một bộ luật đang có hiệu lực, một luật đã bị thay, một
 * luật sửa đổi hết hiệu lực cùng luật mà nó sửa, một nghị định đã bị thay, và
 * một dòng chỉ nêu tên văn bản mà không có số hiệu.
 */
const SAMPLE_IDS = ["blds-2015", "luat-xay-dung-2014", "luat-62-2020", "nd-37-2015"];
const SAMPLE_UNNUMBERED = "luat-thuong-mai-2005";

/**
 * Đoạn mẫu dựng từ tập dữ liệu, không viết tay: tên và số hiệu lấy thẳng từ bản
 * ghi, nên đoạn mẫu không thể nêu một số hiệu chưa được tra cứu.
 */
function sampleText(lang: Lang): string {
  const c = getCheckCopy(lang);
  const lead = lang === "vi" ? "Căn cứ" : "Pursuant to the";
  const no = lang === "vi" ? "số" : "No.";
  const lines = SAMPLE_IDS.map((id) => documentsById.get(id))
    .filter((d) => d !== undefined)
    .map((d) => `${lead} ${d.title[lang]} ${no} ${d.number};`);
  const bare = documentsById.get(SAMPLE_UNNUMBERED);
  if (bare) lines.push(`${lead} ${bare.title[lang]};`);
  return [...lines, ...c.sampleTail].join("\n");
}

export default async function BasisCheckPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const c = getCheckCopy(lang);

  return (
    <>
      <section className="rule-b hero-lux">
        <LuxBackdrop />
        <div className="hero-split mx-auto w-full max-w-[76rem] px-5 py-10 sm:px-8 sm:py-14">
          <div className="min-w-0">
            <p className="eyebrow eyebrow-tick rise">{c.eyebrow(documents.length)}</p>
            <h1 className="display rise rise-1 mt-3 max-w-[20ch]">{c.title}</h1>
            <p className="measure rise rise-2 mt-4 text-[1.0625rem] leading-relaxed text-[var(--ink-2)]">
              {c.lede}
            </p>
          </div>
          <div className="hero-art rise rise-2">
            <CheckArt lang={lang} />
          </div>
        </div>
      </section>

      <BasisChecker
        lang={lang}
        rows={basisRows(lang)}
        named={namedNumbers()}
        sample={sampleText(lang)}
        verifiedOn={LATEST_VERIFIED_ON}
      />

      {/* Cách đọc kết quả nằm trong HTML dựng sẵn, ngoài thành phần chạy trên
          trình duyệt: người đọc biết giới hạn của công cụ trước khi dán gì vào,
          và phần này vẫn đọc được khi JavaScript bị chặn. */}
      <section className="mx-auto w-full max-w-[76rem] px-5 pb-6 pt-4 sm:px-8">
        <h2 className="eyebrow eyebrow-tick">{c.howTitle}</h2>
        <div className="mt-5 grid gap-x-10 gap-y-7 md:grid-cols-2">
          {c.how.map((item) => (
            <div key={item.h}>
              <h3 className="text-[1.125rem] leading-snug" style={{ fontFamily: "var(--font-serif)" }}>
                {item.h}
              </h3>
              <p className="measure mt-2 text-[0.9375rem] leading-relaxed text-[var(--ink-2)]">
                {item.p}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
