import { comparisons } from "@/data/comparisons";
import { documentsById } from "@/data/documents";
import type { Bilingual, Lang } from "@/data/types";
import type { ArticleEntry } from "@/lib/article-query";
import { formatShortCitation, parseCitation, type Citation } from "@/lib/citation";

/**
 * Chỉ mục điều khoản: mỗi điều, khoản đã được dẫn ở đâu trong tập dữ liệu.
 *
 * Người làm luật thường tra ngược: biết "Điều 76 Nghị định 217/2026" rồi, muốn
 * biết trang này đã đọc điều đó ở chỗ nào. Chỉ mục dựng từ các căn cứ có chỉ
 * điểm tới điều khoản trong phần đối chiếu, tức là chỉ những chỗ người biên soạn
 * đã thực sự đọc tới điều đó. Không có điều nào được đưa vào vì đoán.
 */

export interface ArticleHit {
  cite: Citation;
  /** Chuỗi trích dẫn gốc như viết trong dữ liệu. */
  ref: string;
  /** Khóa cặp đối chiếu, dùng dựng đường dẫn. */
  pairId: string;
  pointId: string;
  topic: Bilingual;
  side: "before" | "after";
}

export const articleIndex: ArticleHit[] = comparisons.flatMap((entry) =>
  entry.points.flatMap((p) =>
    (["before", "after"] as const).flatMap((side) =>
      p.basis[side]
        .map((ref) => ({ ref, cite: parseCitation(ref) }))
        .filter(({ cite }) => cite.parts.some((x) => x.part === "dieu"))
        .map(({ ref, cite }) => ({
          cite,
          ref,
          pairId: `${entry.newId}--${entry.oldId}`,
          pointId: p.id,
          topic: p.topic,
          side,
        })),
    ),
  ),
);

/**
 * Chỉ mục ở dạng gửi được xuống trình duyệt: chuỗi đã định dạng theo ngôn ngữ,
 * không kèm cấu trúc dữ liệu gốc.
 */
export function articleEntries(lang: Lang): ArticleEntry[] {
  // Một điều khoản dẫn ở cả hai vế của cùng một điểm đối chiếu chỉ hiện một
  // lần, ghi rõ là cả hai vế.
  const merged = new Map<string, ArticleEntry>();
  for (const h of articleIndex) {
    const key = `${h.ref}|${h.pairId}|${h.pointId}`;
    const prev = merged.get(key);
    if (prev) {
      if (prev.side !== h.side) prev.side = "both";
      continue;
    }
    const [newId, oldId] = h.pairId.split("--");
    const a = documentsById.get(newId);
    const b = documentsById.get(oldId);
    merged.set(key, {
      docId: h.cite.docId,
      dieu: h.cite.parts.find((x) => x.part === "dieu")?.value.toLowerCase() ?? "",
      label: formatShortCitation(h.cite, lang),
      href: `/${lang}/doi-chieu/${h.pairId}#${h.pointId}`,
      pair: a && b ? `${a.number} ↔ ${b.number}` : h.pairId,
      topic: h.topic[lang],
      side: h.side,
    });
  }
  return [...merged.values()];
}
