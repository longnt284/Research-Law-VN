import { buildFeed } from "@/lib/public-feed";

/*
  Nguồn dữ liệu công khai của Lex & Lineage, xuất thành tệp tĩnh lúc
  `next build`. Hợp đồng và quy tắc lên phiên bản nằm ở `src/lib/public-feed.ts`.

  Website hãng luật LHPT đọc tệp này lúc dựng trang của nó, không đọc từ trình
  duyệt của khách, nên không cần mở CORS.
*/
export const dynamic = "force-static";

export function GET() {
  return Response.json(buildFeed(), {
    headers: { "Cache-Control": "public, max-age=0, must-revalidate" },
  });
}
