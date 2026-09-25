import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChainDefs } from "@/components/home/ChainParts";
import { ChainHero } from "@/components/home/ChainHero";
import { HierarchyBlock } from "@/components/home/HierarchyBlock";
import { RelationBlock } from "@/components/home/RelationBlock";
import { TimelineBlock } from "@/components/home/TimelineBlock";
import { HomeHub } from "@/components/HomeHub";
import { Reveal } from "@/components/Reveal";
import { getDict, isLang } from "@/i18n/dictionary";
import { alternatesFor, shareMeta } from "@/lib/site";

/**
 * Trang chủ.
 *
 * Bốn phần, đi từ nhìn thấy tới đọc được. Đầu trang là ba dải văn bản nối xích
 * chạy không dứt: hình ảnh của cả hệ thống. Ba khối tiếp theo gỡ hình ảnh đó ra
 * thành ba câu hỏi mà người làm hồ sơ vẫn hỏi — văn bản nào đứng trên văn bản
 * nào, chúng nối nhau bằng quan hệ gì, và quy định nào đang có hiệu lực vào ngày
 * nào. Cuối trang là năm lối vào các công cụ.
 *
 * Toàn bộ trang là HTML và SVG dựng ở máy chủ. Không có cảnh WebGL nào, không
 * có thư viện đồ họa nào phải tải; chuyển động nằm trong CSS và dừng được.
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
      <ChainDefs />
      <ChainHero lang={lang} />
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
      <HomeHub lang={lang} />
    </>
  );
}
