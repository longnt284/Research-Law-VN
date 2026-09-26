import { BrandMark } from "@/components/brand/BrandMark";
import { HeroLineage } from "@/components/home/HeroLineage";
import { HeroSearch } from "@/components/home/HeroSearch";
import { LuxBackdrop } from "@/components/LuxBackdrop";
import type { Lang } from "@/data/types";
import { getHome } from "@/i18n/home";
import { getLanding } from "@/i18n/landing";
import { heroLineage } from "@/lib/hero-lineage";

/**
 * Phần đầu trang chủ: dùng trước, giải thích sau.
 *
 * Câu khẩu hiệu giữ nguyên — mỗi văn bản pháp luật đều có một gia phả — nhưng
 * thứ lớn nhất trên màn hình đầu tiên là ô tìm kiếm. Người quay lại trang chỉ
 * cần gõ số hiệu là thấy tình trạng hiệu lực, không phải đọc phần giới thiệu.
 *
 * Bên phải là một dòng đời văn bản có thật, dựng từ gia phả tiêu biểu: nó nói ý
 * tưởng của trang bằng hình thay vì bằng một đoạn văn.
 */
export function HomeHero({ lang }: { lang: Lang }) {
  const l = getLanding(lang).hero;
  const motto = getHome(lang).hero.motto;
  const layout = heroLineage(lang);

  return (
    <section className="home-hero hero-lux" aria-labelledby="home-title">
      {/* Lớp nền nằm trong khung cắt riêng: phần đầu trang không được cắt, vì
          danh sách kết quả của ô tìm phải tràn xuống phủ lên phần bên dưới. */}
      <div className="lux-clip" aria-hidden="true">
        <LuxBackdrop />
      </div>
      <div className="home-hero-inner">
        <div className="home-hero-main">
          <p className="home-hero-eyebrow rise">
            <BrandMark variant="badge" id="hero-mark" className="home-hero-mark" />
            {l.eyebrow}
          </p>
          <h1 id="home-title" className="home-hero-title rise rise-1">
            {motto}
          </h1>
          <p className="home-hero-promise rise rise-2">{l.promise}</p>
          <div className="rise rise-3">
            <HeroSearch lang={lang} />
          </div>
        </div>

        {layout && (
          <figure className="home-hero-figure rise rise-2">
            <HeroLineage layout={layout} lang={lang} label={l.lineageLabel} />
            <figcaption>
              <span>{l.lineageCaption(layout.focusNumber)}</span>
              <span className="home-hero-hint">{l.lineageHint}</span>
            </figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}
