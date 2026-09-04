import { domains } from "@/data/documents";
import type { DocStatus, DocType, DomainId, Lang } from "@/data/types";
import { getDict } from "@/i18n/dictionary";

const domainById = new Map(domains.map((d) => [d.id, d]));

/**
 * Nhãn tình trạng hiệu lực.
 *
 * Trạng thái được mã hoá bằng cả màu và hình dạng chấm dẫn: người không phân
 * biệt được màu vẫn đọc được chữ, và chữ mới là thứ mang nghĩa.
 */
export function StatusBadge({
  status,
  lang,
  size = "md",
}: {
  status: DocStatus;
  lang: Lang;
  size?: "sm" | "md";
}) {
  const t = getDict(lang);
  const tone: Record<DocStatus, string> = {
    active: "text-emerald-800 dark:text-emerald-300 border-emerald-700/35",
    amended: "text-amber-800 dark:text-amber-300 border-amber-700/35",
    pending: "text-sky-800 dark:text-sky-300 border-sky-700/35",
    expired: "text-[var(--ink-3)] border-[var(--rule-strong)]",
  };
  const dot: Record<DocStatus, string> = {
    active: "bg-emerald-600",
    amended: "bg-amber-500",
    pending: "bg-sky-500",
    expired: "bg-transparent border border-[var(--ink-3)]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-0.5 ${tone[status]} ${
        size === "sm" ? "text-[0.6875rem]" : "text-xs"
      } whitespace-nowrap font-medium`}
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dot[status]}`} aria-hidden="true" />
      {t.status[status]}
    </span>
  );
}

/** Chip lĩnh vực, lấy màu từ sắc độ đã gán cho lĩnh vực đó trên bản đồ. */
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
