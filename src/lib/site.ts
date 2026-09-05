import type { Lang } from "@/data/types";
import { LANGS } from "@/i18n/dictionary";

/**
 * Địa chỉ gốc của trang, dùng cho metadata tuyệt đối.
 *
 * Thẻ khai báo bản dịch, thẻ canonical và sitemap đều phải là địa chỉ tuyệt đối
 * thì công cụ tìm kiếm mới đọc được. Địa chỉ đó không suy ra được từ mã nguồn,
 * nên nó đến từ môi trường: đặt `NEXT_PUBLIC_SITE_URL` khi triển khai. Trên
 * Vercel, biến sẵn có của nền tảng được dùng thay. Không có cả hai thì rơi về
 * localhost — đúng cho lúc chạy phát triển, và sai một cách dễ thấy nếu ai đó
 * quên đặt biến trước khi triển khai, hơn là một tên miền đoán bừa trông thật.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

/** Đường dẫn của một trang trong một ngôn ngữ, ví dụ `/vi/van-ban/luat-xay-dung-2025`. */
export function pathFor(lang: Lang, sub = ""): string {
  return `/${lang}${sub}`;
}

/**
 * Khai báo canonical và bản dịch cho một trang cụ thể.
 *
 * Phải đặt ở từng trang chứ không đặt một lần ở layout. Layout không biết mình
 * đang bọc trang nào, nên một khai báo đặt ở đó buộc phải trỏ cứng về trang chủ,
 * và khi ấy mọi trang con đều nói với công cụ tìm kiếm rằng bản dịch của nó là
 * trang chủ tiếng kia — sai với tất cả trang trừ đúng một trang.
 */
export function alternatesFor(lang: Lang, sub = "") {
  const languages: Record<string, string> = {};
  for (const l of LANGS) languages[l] = pathFor(l, sub);
  // Người đọc ngoài hai thứ tiếng này được đưa về bản tiếng Việt, bản gốc của
  // toàn bộ nội dung.
  languages["x-default"] = pathFor("vi", sub);
  return { canonical: pathFor(lang, sub), languages };
}
