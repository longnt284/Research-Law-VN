import { documents } from "@/data/documents";
import type { Lang } from "@/data/types";
import { getDict } from "@/i18n/dictionary";
import { extractNumbers, numberKey, type BasisRow } from "@/lib/basis-check";
import { amenders, startOf, validitySegments } from "@/lib/validity";

/**
 * Các dòng tra cứu cho trang soát căn cứ, dựng ở máy chủ.
 *
 * Mỗi văn bản gửi xuống trình duyệt đúng những gì phép soát cần: số hiệu, tên,
 * các đoạn hiệu lực đã tính sẵn và danh sách văn bản sửa đổi. Phép suy luận
 * hiệu lực vẫn là một, nằm ở `src/lib/validity.ts`; trình duyệt chỉ tìm đoạn
 * chứa ngày được chọn.
 */
export function basisRows(lang: Lang): BasisRow[] {
  const t = getDict(lang);
  return documents.map((d) => ({
    id: d.id,
    number: d.number,
    key: numberKey(d.number),
    type: t.type[d.type],
    title: d.title[lang],
    crossCheck: d.confidence === "cross-check",
    hasNote: Boolean(d.note),
    segments: validitySegments(d),
    amenders: amenders(d)
      .filter((a) => startOf(a))
      .map((a) => ({ id: a.id, number: a.number, from: startOf(a) })),
  }));
}

/**
 * Số hiệu không theo khuôn số/năm/cơ quan, như "CISG 1980" hay "Quy tắc VIAC
 * 2026". Bộ đọc số hiệu không tự nhận ra được chúng, nên trang gửi kèm danh
 * sách để chúng được so nguyên văn.
 */
export function namedNumbers(): string[] {
  return documents.map((d) => d.number).filter((n) => extractNumbers(n).hits.length === 0);
}
