import Link from "next/link";

import { BrandMark } from "@/components/brand/BrandMark";
import { MotionToggle } from "@/components/home/MotionToggle";
import { LuxBackdrop } from "@/components/LuxBackdrop";
import { documents, domains, relations } from "@/data/documents";
import type { Lang } from "@/data/types";
import { getDict } from "@/i18n/dictionary";
import { getHome } from "@/i18n/home";
import { corpusSpan } from "@/lib/corpus";

/**
 * Phần đầu trang chủ: huy hiệu, tên trang và câu khẩu hiệu.
 *
 * Bố cục đối xứng quanh một trục dọc, như trang bìa của một cuốn gia phả hay
 * đầu thư của một văn phòng luật: dấu ở giữa, tên chữ hoa giãn cách bên dưới,
 * một đường kẻ có hình thoi, rồi mới tới lời. Không có hình nào khác tranh chỗ
 * với dấu.
 *
 * Bốn con số đếm thẳng từ tập dữ liệu. Chuyển động — nét dấu được vẽ dần, vệt
 * sáng lướt qua mặt dấu, lớp nền trôi chậm — dừng theo nút dừng ở chân phần
 * này và theo lựa chọn giảm chuyển động của hệ điều hành.
 */
export function BrandHero({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const h = getHome(lang).hero;

  const stats = [
    { value: String(documents.length), label: h.statDocs },
    { value: String(relations.length), label: h.statRelations },
    { value: String(domains.length), label: h.statDomains },
    { value: `${corpusSpan.from}–${corpusSpan.to}`, label: h.statSpan },
  ];

  return (
    <section className="brand-hero hero-lux" aria-labelledby="home-title">
      <LuxBackdrop />
      <div className="brand-hero-inner">
        <div className="brand-hero-seal rise">
          <BrandMark variant="seal" id="hero" title={t.siteName} className="brand-seal" />
        </div>

        <p className="brand-hero-name rise rise-1" aria-hidden="true">
          Lex <em>&amp;</em> Lineage
        </p>
        <p className="brand-hero-eyebrow rise rise-1">{h.eyebrow}</p>

        <div className="brand-rule rise rise-2" aria-hidden="true">
          <span />
          <i />
          <span />
        </div>

        <h1 id="home-title" className="brand-hero-motto rise rise-2">
          {h.motto}
        </h1>
        <p className="brand-hero-lede rise rise-3">{h.lede}</p>

        <div className="brand-hero-actions rise rise-3">
          <Link href="#gia-pha" className="btn btn-solid">
            {h.enterFamily}
          </Link>
          <Link href={`/${lang}/van-ban`} className="btn btn-outline">
            {h.enterDocs}
          </Link>
        </div>

        <dl className="brand-hero-stats rise rise-3">
          {stats.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd className="tnum">{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className="brand-hero-foot">
          <MotionToggle pause={h.pause} play={h.play} />
        </div>
      </div>
    </section>
  );
}
