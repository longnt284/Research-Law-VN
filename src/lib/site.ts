import type { Lang } from "@/data/types";
import { getDict, LANGS } from "@/i18n/dictionary";

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

/**
 * Thông tin liên hệ in ở chân trang. Số điện thoại giữ hai dạng: dạng quốc tế
 * cho liên kết `tel:` để gọi được từ máy ở nước ngoài, dạng nhóm số để đọc.
 */
export const CONTACT = {
  phone: "0941 563 789",
  phoneHref: "tel:+84941563789",
  email: "longnt284.lawyer@gmail.com",
} as const;

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

/**
 * Thẻ chia sẻ của một trang: Open Graph cho Facebook, Zalo, LinkedIn và thẻ
 * Twitter.
 *
 * Layout chỉ biết tên trang, nên nếu trang con không đặt thẻ này thì mọi đường
 * dẫn gửi đi đều hiện cùng một dòng "Lex & Lineage", kể cả khi
 * người gửi đang chia sẻ đúng một nghị định.
 *
 * Trang không có tệp `opengraph-image` riêng nhận ảnh mặc định, dựng bởi
 * `app/[lang]/opengraph-image.tsx`: Next không truyền ảnh của đoạn cha xuống
 * trang con đã tự đặt `openGraph`, nên phải trỏ tới nó một cách tường minh.
 * Trang có tệp riêng (trang chủ, văn bản, cặp đối chiếu) truyền
 * `ownImage`, vì ảnh khai báo trong mã sẽ đè lên ảnh của tệp.
 */
export function shareMeta(
  lang: Lang,
  sub: string,
  title: string,
  description: string,
  { type = "website", ownImage = false }: { type?: "website" | "article"; ownImage?: boolean } = {},
) {
  const other = LANGS.filter((l) => l !== lang);
  const image = pathFor(lang, "/opengraph-image");
  return {
    openGraph: {
      title,
      description,
      url: pathFor(lang, sub),
      siteName: getDict(lang).siteName,
      locale: OG_LOCALE[lang],
      alternateLocale: other.map((l) => OG_LOCALE[l]),
      type,
      ...(ownImage ? {} : { images: [{ url: image, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      ...(ownImage ? {} : { images: [image] }),
    },
  };
}

const OG_LOCALE: Record<Lang, string> = { vi: "vi_VN", en: "en_GB" };

/**
 * Cắt một đoạn văn cho vừa thẻ mô tả, dừng ở ranh giới từ.
 *
 * Cắt đúng ký tự thứ n thì hay đứt giữa một từ tiếng Việt ("hợp đ"), và đoạn cắt
 * đó hiện nguyên văn dưới đường dẫn trên trang kết quả tìm kiếm.
 */
export function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.—-]+$/, "")}…`;
}
