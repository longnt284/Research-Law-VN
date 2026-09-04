import type { ChangeKind, Lang } from "@/data/types";
import { getDict } from "@/i18n/dictionary";

/**
 * Nhãn loại thay đổi.
 *
 * Chín loại, tất cả đều trung tính về giá trị: "phạm vi rộng hơn" không hàm ý
 * tốt hơn, "đổi mốc thời gian" không hàm ý chậm trễ. Nhãn chỉ nói chênh lệch
 * thuộc kiểu nào để người đọc quét nhanh một trang dài.
 */
export function ChangeKindTag({ kind, lang }: { kind: ChangeKind; lang: Lang }) {
  const t = getDict(lang);
  return (
    <span className="inline-flex items-center whitespace-nowrap border border-[var(--rule-strong)] px-2 py-0.5 text-[0.6875rem] font-medium tracking-wide text-[var(--ink-2)]">
      {t.changeKind[kind]}
    </span>
  );
}

/**
 * Lưu ý thường trực về tính chất của nhận định.
 *
 * Đặt ngay đầu mỗi bản đối chiếu chứ không giấu ở chân trang. Người đọc một bảng
 * so sánh cũ và mới rất dễ hiểu phần nhận định là lời khuyên nên làm gì; nói rõ
 * ngay từ đầu là cách rẻ nhất để tránh chuyện đó.
 */
export function ObjectiveNotice({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  return (
    <aside className="border-l-2 border-[var(--brass)] bg-[var(--lux-wash)] px-4 py-3">
      <p className="eyebrow text-[var(--brass)]">{t.compare.objectiveTitle}</p>
      <p className="measure mt-1 text-sm leading-relaxed text-[var(--ink-2)]">
        {t.compare.objectiveNote}
      </p>
    </aside>
  );
}
