/**
 * Tìm kiếm toàn trang: phần thuần, chạy trên trình duyệt.
 *
 * Chỉ mục dựng sẵn ở máy chủ thành một tệp JSON tĩnh cho mỗi thứ tiếng (xem
 * `src/lib/search-index.ts`), và hộp tìm chỉ tải tệp đó khi người đọc mở nó.
 * Phép tìm ở đây không đoán ý: mọi từ trong câu tìm phải có mặt trong mục, sau
 * khi bỏ dấu. Điểm số chỉ quyết định thứ tự, không quyết định mục nào được hiện.
 */

export type SearchKind = "doc" | "article" | "pair" | "domain" | "page";

export interface SearchItem {
  kind: SearchKind;
  href: string;
  /** Dòng chính: số hiệu và tên, "Điều 38", tên lĩnh vực… */
  title: string;
  /** Dòng phụ: loại văn bản, văn bản chứa điều, hai số hiệu của cặp… */
  sub: string;
  /** Tình trạng tại ngày tra cứu, chỉ có ở văn bản. */
  status?: "active" | "amended" | "pending" | "expired";
  /** Số hiệu đã bỏ dấu và khoảng trắng, để so trực tiếp với câu tìm. */
  num: string;
  /** Tiêu đề đã bỏ dấu. */
  head: string;
  /** Mọi chữ tìm được của mục, đã bỏ dấu: tên, tóm tắt, số hiệu, bí danh. */
  body: string;
}

/** Bỏ dấu tiếng Việt, viết thường, gộp khoảng trắng. */
export function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐÐð]/g, "d")
    .replace(/[‐-―−]/g, "-")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Thứ tự nhóm khi hai mục bằng điểm: văn bản trước, trang công cụ sau cùng. */
const KIND_ORDER: Record<SearchKind, number> = { doc: 0, article: 1, pair: 2, domain: 3, page: 4 };

export interface SearchHit {
  item: SearchItem;
  score: number;
}

/**
 * Tìm trong chỉ mục.
 *
 * Mỗi từ của câu tìm phải xuất hiện đâu đó trong mục. Điểm cộng khi từ nằm
 * trong số hiệu (nặng nhất: người làm luật tìm bằng số hiệu nhiều hơn bằng tên),
 * rồi trong tiêu đề, rồi trong phần còn lại; cả câu tìm trùng đầu số hiệu hoặc
 * nằm nguyên trong tiêu đề được cộng thêm.
 */
export function search(
  items: readonly SearchItem[],
  query: string,
  kind: SearchKind | "all" = "all",
  limit = 12,
): SearchHit[] {
  const q = fold(query);
  if (!q) return [];
  const words = q.split(" ");
  const compact = q.replace(/\s+/g, "");
  const hits: SearchHit[] = [];

  for (const item of items) {
    if (kind !== "all" && item.kind !== kind) continue;
    let score = 0;
    let ok = true;
    for (const w of words) {
      if (item.num.includes(w)) score += item.num.startsWith(w) ? 10 : 6;
      else if (item.head.includes(w)) score += 4;
      else if (item.body.includes(w)) score += 1;
      else {
        ok = false;
        break;
      }
    }
    if (!ok) continue;
    if (item.num && item.num === compact) score += 40;
    else if (item.num && compact.length >= 3 && item.num.startsWith(compact)) score += 20;
    if (words.length > 1 && item.head.includes(q)) score += 8;
    hits.push({ item, score });
  }

  return hits
    .sort(
      (a, b) =>
        b.score - a.score ||
        KIND_ORDER[a.item.kind] - KIND_ORDER[b.item.kind] ||
        a.item.title.length - b.item.title.length,
    )
    .slice(0, limit);
}
