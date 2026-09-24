import type { Lang } from "@/data/types";
import { getValidityCopy } from "@/i18n/validity";
import type { ValidityState } from "@/lib/validity-segment";

/**
 * Nhãn tình trạng tại một ngày do người đọc chọn.
 *
 * Cố ý dùng chữ khác với nhãn tình trạng tại ngày tra cứu ("Đang có hiệu lực"
 * thay cho "Còn hiệu lực"), để người đọc không nhầm hai câu hỏi: hôm nay văn bản
 * thế nào, và tại ngày kia văn bản thế nào.
 */
export function ValidityBadge({
  state,
  amended,
  lang,
}: {
  state: ValidityState;
  amended?: boolean;
  lang: Lang;
}) {
  const c = getValidityCopy(lang);
  const tone: Record<ValidityState, string> = {
    "in-force": amended
      ? "text-amber-800 dark:text-amber-300 border-amber-700/35"
      : "text-emerald-800 dark:text-emerald-300 border-emerald-700/35",
    pending: "text-sky-800 dark:text-sky-300 border-sky-700/35",
    expired: "text-[var(--ink-3)] border-[var(--rule-strong)]",
    unknown: "text-[var(--ink-3)] border-dashed border-[var(--rule-strong)]",
  };
  const dot: Record<ValidityState, string> = {
    "in-force": amended ? "bg-amber-500" : "bg-emerald-600",
    pending: "bg-sky-500",
    expired: "bg-transparent border border-[var(--ink-3)]",
    unknown: "bg-transparent border border-dashed border-[var(--ink-3)]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap border px-2 py-0.5 text-[0.6875rem] font-medium ${tone[state]}`}
    >
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${dot[state]}`} aria-hidden="true" />
      {c.state[state]}
      {state === "in-force" && amended ? `, ${c.amended}` : ""}
    </span>
  );
}
