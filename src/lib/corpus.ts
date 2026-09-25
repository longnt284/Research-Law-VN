import { documents, documentsById, relations } from "@/data/documents";
import type { DocType, LegalDoc, RelationKind } from "@/data/types";

/**
 * Các con số và phép xếp loại dùng chung cho mọi hình minh họa của trang.
 *
 * Trang chủ, thẻ lối vào, cây quan hệ của trang lĩnh vực và vệt thứ bậc trên
 * thẻ lĩnh vực đều cần cùng một câu trả lời cho ba câu hỏi: văn bản này ở tầng
 * hiệu lực nào, có hiệu lực năm nào, và tập dữ liệu có bao nhiêu quan hệ mỗi
 * loại. Mỗi câu trả lời được tính đúng một lần ở đây. Hai hình trên cùng một
 * trang mà xếp tầng khác nhau là hai câu trả lời khác nhau cho cùng một câu hỏi.
 *
 * Toàn bộ là hàm thuần trên tập dữ liệu nhập lúc dựng bản, nên chạy được ở máy
 * chủ và cho ra đúng cùng kết quả ở mọi lần dựng.
 */

/**
 * Bốn tầng hiệu lực, 0 là cao nhất.
 *
 * Thang này là phép gộp để vẽ, không phải bảng thứ bậc đầy đủ theo Luật Ban
 * hành văn bản quy phạm pháp luật: nó chỉ cần đủ mịn để người đọc thấy văn bản
 * nào đứng trên văn bản nào trong tập dữ liệu này.
 */
export const TIER: Record<DocType, 0 | 1 | 2 | 3> = {
  "bo-luat": 0,
  luat: 0,
  "dieu-uoc": 0,
  "nghi-quyet": 1,
  vbhn: 1,
  "nghi-dinh": 2,
  "quyet-dinh": 2,
  "thong-tu": 3,
  "quy-tac": 3,
};

export const TIERS = [0, 1, 2, 3] as const;
export type Tier = (typeof TIERS)[number];

export function tierOf(doc: LegalDoc): Tier {
  return TIER[doc.type] ?? 3;
}

/** Văn bản cấp luật: bộ luật, luật, điều ước. Được vẽ đậm hơn ở mọi hình. */
export function isPrimary(doc: LegalDoc): boolean {
  return TIER[doc.type] === 0;
}

/**
 * Mốc xếp thứ tự thời gian của một văn bản: ngày hiệu lực, thiếu thì ngày ban
 * hành, thiếu cả hai thì chuỗi rỗng.
 */
export function whenOf(doc: LegalDoc): string {
  return doc.effectiveOn || doc.issuedOn || "";
}

/** Năm theo `whenOf`; 0 khi bản ghi chưa có mốc nào xác minh được. */
export function yearOf(doc: LegalDoc): number {
  const y = Number(whenOf(doc).slice(0, 4));
  return Number.isFinite(y) && y > 1900 ? y : 0;
}

/** Số văn bản ở từng tầng. */
export const tierCounts: [number, number, number, number] = (() => {
  const out: [number, number, number, number] = [0, 0, 0, 0];
  for (const doc of documents) out[tierOf(doc)]++;
  return out;
})();

/** Số quan hệ theo từng loại. */
export const relationCounts: Record<RelationKind, number> = (() => {
  const out: Record<RelationKind, number> = { guides: 0, amends: 0, replaces: 0 };
  for (const rel of relations) out[rel.kind]++;
  return out;
})();

/** Năm sớm nhất và muộn nhất trong tập dữ liệu, bỏ qua bản ghi chưa có mốc. */
export const corpusSpan: { from: number; to: number } = (() => {
  const years = documents.map(yearOf).filter((y) => y > 0);
  return {
    from: years.length ? Math.min(...years) : 2000,
    to: years.length ? Math.max(...years) : 2026,
  };
})();

/** Số văn bản không có cả ngày hiệu lực lẫn ngày ban hành. Hình thời gian phải nói ra con số này. */
export const undatedCount = documents.filter((d) => yearOf(d) === 0).length;

/**
 * Ví dụ tiêu biểu cho một loại quan hệ: cặp đầu tiên của loại đó mà cả hai văn
 * bản đều đã xác minh, ưu tiên văn bản cấp luật ở vế bị tác động.
 */
export function exampleOf(kind: RelationKind): { target: LegalDoc; actor: LegalDoc } | null {
  const candidates = relations
    .filter((r) => r.kind === kind)
    .map((r) => ({ target: documentsById.get(r.to), actor: documentsById.get(r.from) }))
    .filter((x): x is { target: LegalDoc; actor: LegalDoc } => !!x.target && !!x.actor);
  if (candidates.length === 0) return null;
  const score = (x: { target: LegalDoc; actor: LegalDoc }) =>
    (x.target.confidence === "verified" ? 0 : 2) +
    (x.actor.confidence === "verified" ? 0 : 2) +
    tierOf(x.target) +
    (x.actor.status === "expired" ? 1 : 0);
  return [...candidates].sort(
    (a, b) => score(a) - score(b) || whenOf(b.actor).localeCompare(whenOf(a.actor)),
  )[0];
}
