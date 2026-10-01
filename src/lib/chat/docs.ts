import { documents } from "@/data/documents";
import type { DomainId, Lang, LegalDoc } from "@/data/types";
import { getValidityCopy } from "@/i18n/validity";
import { tierOf } from "@/lib/corpus";
import { fold, parseQuery } from "@/lib/search-engine";
import { startOf, validityAt } from "@/lib/validity";

/**
 * Văn bản trong kho cho trợ lý hỏi đáp: dùng cho cả system prompt
 * (`prompt.ts`) lẫn câu trả lời tra cứu tự động (`offline.ts`). Tệp này không
 * nhập gói skill, nên câu trả lời tra cứu tự động vẫn dựng được khi gói skill
 * không giải mã được.
 */

/** Ngày hôm nay theo giờ Việt Nam (UTC+7, không có giờ mùa hè). */
export function todayVn(): string {
  return new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 10);
}

/** Văn bản trong kho có số hiệu được nhắc trong câu hỏi, ví dụ "58/2025" hay "31/2024/QH15". */
export function mentioned(text: string): LegalDoc[] {
  const nums = parseQuery(text).nums.filter((n) => n.includes("/"));
  if (nums.length === 0) return [];
  return documents.filter((d) => {
    const n = fold(d.number);
    return nums.some((t) => n === t || n.startsWith(`${t}/`) || n.startsWith(`${t}-`));
  });
}

/**
 * Tình trạng hiệu lực tại `today`, một dòng chữ: tình trạng, từ ngày nào, văn
 * bản thay thế, lần sửa đổi.
 */
export function statusText(doc: LegalDoc, lang: Lang, today: string): string {
  const v = getValidityCopy(lang);
  const a = validityAt(doc, today);
  let status = v.state[a.state];
  if (a.since) status += ` ${v.since} ${a.since}`;
  if (a.state === "expired" && a.by) {
    status += a.withParent ? ` (${v.withParent}: ${a.by.number})` : `, ${lang === "vi" ? "thay bằng" : "replaced by"} ${a.by.number}`;
  }
  if (a.amended) status += `; ${v.amended}${a.by ? ` (${a.by.number})` : ""}`;
  if (a.recorded) status += ` (${v.recorded})`;
  return status;
}

const STATE_ORDER = { "in-force": 0, pending: 1, unknown: 2, expired: 3 } as const;

/**
 * Văn bản của một lĩnh vực theo thứ tự đọc: còn hiệu lực trước, luật trước văn
 * bản dưới luật, mới trước cũ.
 */
export function domainDocs(domain: DomainId, today: string): LegalDoc[] {
  return documents
    .filter((d) => d.domains.includes(domain))
    .map((d) => ({ d, s: validityAt(d, today).state }))
    .sort(
      (a, b) =>
        STATE_ORDER[a.s] - STATE_ORDER[b.s] ||
        tierOf(a.d) - tierOf(b.d) ||
        startOf(b.d).localeCompare(startOf(a.d)),
    )
    .map((x) => x.d);
}
