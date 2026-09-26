import Link from "next/link";

import { FamilyChart, FamilyLegend, FamilyStack } from "@/components/FamilyTree";
import type { Lang } from "@/data/types";
import { getHome } from "@/i18n/home";
import { featuredFamily } from "@/lib/family";

/**
 * Gia phả tiêu biểu ở trang chủ.
 *
 * Văn bản đứng giữa do `featuredFamily` chọn bằng phép đếm, nên khối này không
 * có một số hiệu nào viết tay. Màn rộng thấy hình; màn hẹp thấy cùng gia phả
 * dựng dọc, vì hình ngang rộng hơn màn hình điện thoại.
 */
export function FeaturedFamily({ lang }: { lang: Lang }) {
  const fam = featuredFamily;
  if (!fam) return null;
  const f = getHome(lang).featured;

  return (
    <section id="gia-pha" className="featured-family" aria-labelledby="featured-title">
      <div className="featured-head">
        <div>
          <p className="eyebrow eyebrow-tick">{f.eyebrow}</p>
          <h2 id="featured-title" className="display-sm mt-3">
            <span className="block">{f.title[0]}</span>
            <span className="block text-[var(--accent)] italic">{f.title[1]}</span>
          </h2>
        </div>
        <div className="featured-copy">
          <p>{f.text.replace("{number}", fam.focus.number)}</p>
          <Link href={`/${lang}/van-ban/${fam.focus.id}`} className="btn btn-quiet mt-4">
            {f.open}
          </Link>
        </div>
      </div>

      <div className="featured-frame">
        <FamilyChart fam={fam} lang={lang} linkFocus className="family-wide" />
        <FamilyStack fam={fam} lang={lang} linkFocus className="family-narrow" />
      </div>
      <div className="family-wide">
        <FamilyLegend lang={lang} />
      </div>
    </section>
  );
}
