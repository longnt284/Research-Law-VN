import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FeaturedFamily } from "@/components/home/FeaturedFamily";
import { HierarchyBlock } from "@/components/home/HierarchyBlock";
import { HomeHero } from "@/components/home/HomeHero";
import {
  Coverage,
  ExploreDomains,
  HowHead,
  IntentTools,
  RecentChanges,
  Trust,
} from "@/components/home/HomeSections";
import { RelationBlock } from "@/components/home/RelationBlock";
import { TimelineBlock } from "@/components/home/TimelineBlock";
import { Reveal } from "@/components/Reveal";
import { getDict, isLang } from "@/i18n/dictionary";
import { alternatesFor, shareMeta } from "@/lib/site";

/**
 * Trang chủ.
 *
 * Dùng trước, giải thích sau. Màn hình đầu tiên là ô tìm kiếm: người quay lại
 * trang gõ số hiệu là thấy ngay tình trạng hiệu lực. Tiếp theo là bốn công cụ,
 * những gì vừa thay đổi, lối khám phá theo lĩnh vực và một gia phả tiêu biểu.
 * Phần giải thích — thứ bậc hiệu lực, ba loại quan hệ, trục thời gian — và phần
 * phương pháp nằm cuối trang, cho người muốn hiểu vì sao kết quả đáng tin.
 *
 * Toàn bộ trang là HTML và SVG dựng ở máy chủ. JavaScript chỉ có ở ô tìm kiếm,
 * hình dòng đời ở đầu trang và ô chọn ngày; chỉ mục tìm kiếm chỉ được tải khi
 * người đọc chạm vào ô tìm.
 *
 * Tiêu đề và mô tả kế thừa từ layout; ở đây khai báo bản dịch và thẻ chia sẻ,
 * hai thứ mà layout không tự biết được.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = getDict(lang);
  return {
    alternates: alternatesFor(lang),
    ...shareMeta(lang, "", t.siteName, t.siteTagline, { ownImage: true }),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <>
      <HomeHero lang={lang} />
      <div className="home-flow">
        <Reveal>
          <IntentTools lang={lang} />
        </Reveal>
        <Reveal>
          <RecentChanges lang={lang} />
        </Reveal>
        <Reveal>
          <ExploreDomains lang={lang} />
        </Reveal>
      </div>
      <FeaturedFamily lang={lang} />
      <div className="home-flow">
        <Reveal>
          <Coverage lang={lang} />
        </Reveal>
        <HowHead lang={lang} />
      </div>
      <div className="home-blocks">
        <Reveal>
          <HierarchyBlock lang={lang} />
        </Reveal>
        <Reveal>
          <RelationBlock lang={lang} />
        </Reveal>
        <Reveal>
          <TimelineBlock lang={lang} />
        </Reveal>
      </div>
      <div className="home-flow">
        <Reveal>
          <Trust lang={lang} />
        </Reveal>
      </div>
    </>
  );
}
