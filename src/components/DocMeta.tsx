import { LegalStatus } from "@/components/legal/LegalStatus";
import { domains } from "@/data/documents";
import type { DocStatus, DocType, DomainId, Lang } from "@/data/types";
import { getDict } from "@/i18n/dictionary";
import { getSearchCopy } from "@/i18n/search";

const domainById = new Map(domains.map((d) => [d.id, d]));

/**
 * Nhãn tình trạng hiệu lực tại ngày tra cứu.
 *
 * Trạng thái được mã hoá bằng chữ, hình biểu tượng và kiểu viền, màu chỉ đi
 * kèm: xem `LegalStatus`. Rê chuột lên nhãn đọc được lời giải thích đầy đủ.
 */
export function StatusBadge({
  status,
  lang,
  size = "md",
}: {
  status: DocStatus;
  lang: Lang;
  size?: "sm" | "md" | "lg";
}) {
  const t = getDict(lang);
  return (
    <LegalStatus
      tone={status}
      label={t.status[status]}
      title={getSearchCopy(lang).statusExplain[status]}
      size={size}
    />
  );
}

/** Chip lĩnh vực, lấy màu từ sắc độ đã gán cho lĩnh vực đó trong tập dữ liệu. */
export function DomainChip({ id, lang }: { id: DomainId; lang: Lang }) {
  const d = domainById.get(id);
  if (!d) return null;
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-[var(--ink-2)]">
      <span
        aria-hidden="true"
        className="inline-block h-2 w-2 shrink-0 rounded-full"
        style={{ background: `hsl(${d.hue} var(--node-chroma) var(--node-lightness))` }}
      />
      {d.label[lang]}
    </span>
  );
}

export function TypeLabel({ type, lang }: { type: DocType; lang: Lang }) {
  return <>{getDict(lang).type[type]}</>;
}

/**
 * Cảnh báo cho bản ghi chưa đối chiếu xong.
 *
 * Hiển thị công khai thay vì giấu đi. Một tập dữ liệu pháp luật thừa nhận chỗ
 * mình chưa chắc thì đáng tin hơn một tập trông đâu cũng chắc chắn.
 */
export function CrossCheckNotice({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  return (
    <div className="border-l-2 border-amber-600/70 bg-amber-500/[0.07] px-4 py-3">
      <p className="eyebrow text-amber-800 dark:text-amber-300">
        {t.confidence.crossCheckLabel}
      </p>
      <p className="measure mt-1 text-sm leading-relaxed text-[var(--ink-2)]">
        {t.confidence.crossCheckNote}
      </p>
    </div>
  );
}
