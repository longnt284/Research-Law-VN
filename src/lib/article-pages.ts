import { comparisonsByPair } from "@/data/comparisons";
import type { ComparisonPoint } from "@/data/types";
import { articleIndex, type ArticleHit } from "@/lib/articles";
import { parseCitation, pinAnchor, type Citation } from "@/lib/citation";

/**
 * Trang của từng điều khoản.
 *
 * Tập dữ liệu chưa có toàn văn. Thứ nó có là những chỗ người biên soạn đã đọc
 * tới một điều cụ thể khi đối chiếu hai văn bản, kèm câu chữ của từng vế và căn
 * cứ trỏ tới đúng khoản, điểm. Mỗi điều như vậy có một trang riêng, với đường
 * dẫn riêng, gom mọi chỗ đã đọc tới nó và những điều khoản ở văn bản kia mà nó
 * được đặt cạnh. Điều chưa ai đọc tới thì không có trang: trang không được mọc
 * ra chỉ vì một con số có thể tồn tại.
 */

export interface ArticleUse {
  hit: ArticleHit;
  point: ComparisonPoint;
  /** Vế của điểm đối chiếu dẫn tới điều này; "both" khi cả hai vế cùng dẫn. */
  side: "before" | "after" | "both";
}

export interface ArticlePage {
  docId: string;
  /** Số điều, viết thường, dùng làm đoạn đường dẫn. */
  dieu: string;
  /** Trích dẫn tới cả điều. */
  cite: Citation;
  /** Các khoản, điểm của điều đã được dẫn, mỗi chỗ một lần. */
  pinpoints: { cite: Citation; ref: string; anchor: string }[];
  uses: ArticleUse[];
}

const dieuOf = (cite: Citation) => cite.parts.find((x) => x.part === "dieu")?.value.toLowerCase() ?? "";

/** So số điều theo giá trị số, rồi theo phần chữ: "7" < "10" < "10a". */
export function byArticle(a: string, b: string): number {
  return parseInt(a, 10) - parseInt(b, 10) || a.localeCompare(b);
}

function build(): ArticlePage[] {
  const pages = new Map<string, ArticlePage>();
  for (const hit of articleIndex) {
    const dieu = dieuOf(hit.cite);
    const key = `${hit.cite.docId}/${dieu}`;
    let page = pages.get(key);
    if (!page) {
      page = {
        docId: hit.cite.docId,
        dieu,
        cite: parseCitation(`${hit.cite.docId}#dieu:${dieu}`),
        pinpoints: [],
        uses: [],
      };
      pages.set(key, page);
    }
    const anchor = pinAnchor(hit.cite);
    if (anchor && !page.pinpoints.some((p) => p.anchor === anchor)) {
      page.pinpoints.push({ cite: hit.cite, ref: hit.ref, anchor });
    }
    const entry = comparisonsByPair.get(hit.pairId);
    const point = entry?.points.find((p) => p.id === hit.pointId);
    if (!point) continue;
    // Một điểm dẫn nhiều khoản của cùng một điều, hoặc dẫn điều đó ở cả hai vế,
    // chỉ hiện một lần.
    const same = page.uses.find((u) => u.hit.pairId === hit.pairId && u.point.id === point.id);
    if (same) {
      if (same.side !== hit.side) same.side = "both";
      continue;
    }
    page.uses.push({ hit, point, side: hit.side });
  }
  for (const page of pages.values()) {
    page.pinpoints.sort((a, b) => a.anchor.localeCompare(b.anchor, undefined, { numeric: true }));
  }
  return [...pages.values()].sort(
    (a, b) => a.docId.localeCompare(b.docId) || byArticle(a.dieu, b.dieu),
  );
}

export const articlePages: ArticlePage[] = build();

const byKey = new Map(articlePages.map((p) => [`${p.docId}/${p.dieu}`, p]));

export function articlePage(docId: string, dieu: string): ArticlePage | undefined {
  return byKey.get(`${docId}/${dieu.toLowerCase()}`);
}

/** Các điều của một văn bản đã có trang, theo thứ tự số điều. */
export function articlesOf(docId: string): ArticlePage[] {
  return articlePages.filter((p) => p.docId === docId);
}

/** Đường dẫn trang của một điều. */
export function articlePath(docId: string, dieu: string): string {
  return `/van-ban/${docId}/dieu/${encodeURIComponent(dieu.toLowerCase())}`;
}

/**
 * Dẫn chiếu chéo của một điều: mọi căn cứ khác được dẫn trong cùng những điểm
 * đối chiếu, ở vế bên kia (chỗ tương ứng của quy định ở văn bản trước hoặc sau)
 * và ở cùng vế (căn cứ được đọc cùng điều này). Khoản, điểm của chính điều này
 * không tính. Mỗi trích dẫn một lần, theo thứ tự xuất hiện.
 */
export function crossRefs(page: ArticlePage): string[] {
  const out: string[] = [];
  for (const u of page.uses) {
    for (const ref of [...u.point.basis.before, ...u.point.basis.after]) {
      const cite = parseCitation(ref);
      if (cite.docId === page.docId && dieuOf(cite) === page.dieu) continue;
      if (!out.includes(ref)) out.push(ref);
    }
  }
  return out;
}
