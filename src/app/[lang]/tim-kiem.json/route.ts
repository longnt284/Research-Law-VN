import { notFound } from "next/navigation";

import { isLang, LANGS } from "@/i18n/dictionary";
import { buildSearchIndex } from "@/lib/search-index";

/**
 * Chỉ mục tìm kiếm của một thứ tiếng, dựng thành tệp tĩnh lúc `next build`.
 * Hộp tìm trên thanh điều hướng tải tệp này khi được mở lần đầu; cùng nguồn gốc
 * nên chính sách `connect-src 'self'` không phải nới.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return Response.json(buildSearchIndex(lang));
}
