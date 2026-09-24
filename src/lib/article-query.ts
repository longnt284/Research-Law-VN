/**
 * Phần thuần của chỉ mục điều khoản, dùng được trên trình duyệt.
 */

export interface ArticleEntry {
  docId: string;
  /** Số điều, viết thường, ví dụ "76" hoặc "10a". */
  dieu: string;
  /** Trích dẫn đã định dạng, ví dụ "khoản 2 Điều 76 Nghị định 217/2026/NĐ-CP". */
  label: string;
  href: string;
  /** Cặp đối chiếu, ví dụ "217/2026/NĐ-CP ↔ 175/2024/NĐ-CP". */
  pair: string;
  topic: string;
  side: "before" | "after" | "both";
}

const ARTICLE = /(?:^|\s)(?:dieu|d\.|art\.?|article)\s*(\d+[a-z]?)\b/;

/**
 * Đọc số điều từ ô tìm kiếm đã bỏ dấu: "dieu 76", "d.76", "art. 76",
 * "article 76". Trả về số điều và phần câu tìm còn lại, hoặc null khi câu tìm
 * không nhắc tới điều nào.
 */
export function articleQuery(folded: string): { article: string; rest: string } | null {
  const m = folded.match(ARTICLE);
  if (!m) return null;
  const rest = (folded.slice(0, m.index) + " " + folded.slice((m.index ?? 0) + m[0].length))
    .replace(/\s+/g, " ")
    .trim();
  return { article: m[1], rest };
}
