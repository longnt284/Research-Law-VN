import type { MetadataRoute } from "next";

import { LATEST_VERIFIED_ON, documents, domains } from "@/data/documents";
import { LANGS } from "@/i18n/dictionary";
import { articlePages, articlePath } from "@/lib/article-pages";
import { pairs } from "@/lib/compare";
import { lineages } from "@/lib/lineage";
import { SITE_URL, pathFor } from "@/lib/site";

export const dynamic = "force-static";

/**
 * Sitemap sinh từ chính tập dữ liệu.
 *
 * Danh sách đường dẫn ở đây dựng theo đúng cách `generateStaticParams` của từng
 * trang dựng: cùng nguồn thì không có trang nào lên được mà thiếu trong sitemap,
 * cũng không có mục nào trong sitemap trỏ tới trang không tồn tại.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const subs = [
    "",
    "/van-ban",
    "/linh-vuc",
    "/doi-chieu",
    "/phuong-phap",
    ...domains.map((d) => `/linh-vuc/${d.id}`),
    ...documents.map((d) => `/van-ban/${d.id}`),
    ...articlePages.map((a) => articlePath(a.docId, a.dieu)),
    ...pairs.map((p) => `/doi-chieu/${p.id}`),
    ...lineages.map((l) => `/doi-chieu/chuoi/${l.id}`),
  ];

  // Ngày tra cứu của tập dữ liệu là mốc sửa đổi thật của nội dung; lấy ngày dựng
  // trang thì mỗi lần triển khai lại báo toàn bộ trang vừa đổi, kể cả khi không
  // có chữ nào đổi.
  const lastModified = new Date(`${LATEST_VERIFIED_ON}T00:00:00Z`);

  return subs.flatMap((sub) =>
    LANGS.map((lang) => ({
      url: `${SITE_URL}${pathFor(lang, sub)}`,
      lastModified,
      alternates: {
        languages: Object.fromEntries(
          LANGS.map((l) => [l, `${SITE_URL}${pathFor(l, sub)}`]),
        ),
      },
    })),
  );
}
