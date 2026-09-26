import { isLang, LANGS } from "@/i18n/dictionary";
import { buildSearchIndex } from "@/lib/search-index";

/*
  Chỉ mục tìm kiếm của từng thứ tiếng, xuất thành tệp tĩnh lúc `next build`:
  `/vi/search-index.json` và `/en/search-index.json`. Ô tìm kiếm và bảng lệnh
  chỉ tải tệp này khi người đọc bắt đầu gõ, nên không trang nào phải mang nó
  trong lần tải đầu.
*/
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) return new Response(null, { status: 404 });
  return Response.json(buildSearchIndex(lang), {
    headers: { "Cache-Control": "public, max-age=0, must-revalidate" },
  });
}
