import { LegalStatus, type StatusTone } from "@/components/legal/LegalStatus";
import type { Lang } from "@/data/types";
import { getSearchCopy } from "@/i18n/search";
import { getValidityCopy } from "@/i18n/validity";
import type { ValidityState } from "@/lib/validity-segment";

const TONE: Record<ValidityState, StatusTone> = {
  "in-force": "active",
  pending: "pending",
  expired: "expired",
  unknown: "unknown",
};

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
  size = "sm",
}: {
  state: ValidityState;
  amended?: boolean;
  lang: Lang;
  size?: "sm" | "md" | "lg";
}) {
  const c = getValidityCopy(lang);
  const tone = state === "in-force" && amended ? "amended" : TONE[state];
  return (
    <LegalStatus
      tone={tone}
      label={`${c.state[state]}${state === "in-force" && amended ? `, ${c.amended}` : ""}`}
      title={getSearchCopy(lang).stateExplain[state]}
      size={size}
    />
  );
}
