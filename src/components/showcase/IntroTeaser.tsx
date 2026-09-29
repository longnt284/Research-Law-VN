import Link from "next/link";

import { domains } from "@/data/documents";
import type { Lang } from "@/data/types";
import { getLanding } from "@/i18n/landing";

/**
 * Lối vào video giới thiệu ở phần đầu trang chủ.
 *
 * Nằm ngay dưới ô tìm để người lần đầu vào trang thấy ngay, nhưng nhỏ hơn ô tìm
 * để không lấn việc chính của người quay lại. Ảnh thu nhỏ là chính ảnh bìa của
 * video, nên người bấm biết trước mình sẽ xem gì. Vòng sáng quanh nút phát tắt
 * theo chế độ giảm chuyển động của hệ điều hành và nút "Dừng chuyển động".
 */
export function IntroTeaser({ lang }: { lang: Lang }) {
  const c = getLanding(lang).hero.intro;
  return (
    <Link href={`/${lang}/video`} className="intro-teaser">
      <span className="intro-teaser-thumb" aria-hidden="true">
        <span className="intro-teaser-play">
          <svg viewBox="0 0 16 16" width="14" height="14">
            <path d="M5 3.2v9.6L12.8 8z" fill="currentColor" />
          </svg>
        </span>
      </span>
      <span className="intro-teaser-text">
        <span className="intro-teaser-title">{c.title}</span>
        <span className="intro-teaser-meta">{c.meta(domains.length)}</span>
      </span>
      <span className="intro-teaser-arrow" aria-hidden="true">
        →
      </span>
    </Link>
  );
}
