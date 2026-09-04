import type { Bilingual, ComparisonEntry, Lang } from "@/data/types";

/**
 * Cổng kiểm tra tính khách quan của phần đối chiếu.
 *
 * Một trang so sánh văn bản pháp luật rất dễ trượt từ mô tả sang bình luận. Chỉ
 * cần một chữ "tiến bộ hơn" hay "should" là bản đối chiếu thôi không còn là dữ
 * kiện nữa mà thành ý kiến, trong khi người đọc vẫn tưởng mình đang đọc dữ kiện.
 *
 * Vì vậy phần đối chiếu không dựa vào lời hứa sẽ viết khách quan mà dựa vào một
 * phép kiểm chạy khi dựng trang. Mỗi chuỗi trong `src/data/comparisons.ts` được
 * soi qua danh sách từ ngữ dưới đây; dính một từ là `next build` dừng lại. Ràng
 * buộc chỉ áp cho phần đối chiếu, không áp cho phần tóm tắt văn bản vốn có mục
 * đích khác.
 */

/** Từ ngữ đánh giá hơn kém. */
const EVALUATIVE = [
  "tốt hơn", "tệ hơn", "dở hơn", "hay hơn", "ưu việt", "tiến bộ", "lạc hậu",
  "hợp lý hơn", "bất hợp lý", "vô lý", "chặt chẽ hơn", "lỏng lẻo", "khắt khe hơn",
  "thoáng hơn", "đáng chú ý", "đáng tiếc", "may mắn", "thành công", "thất bại",
  "better", "worse", "improved", "improvement", "progressive", "outdated",
  "unreasonable", "welcome change", "unfortunate", "notably", "remarkable",
];

/**
 * Từ ngữ khuyến nghị, chỉ dẫn hành động.
 *
 * Không canh chữ "nên" đứng một mình. Trong tiếng Việt, "nên" vừa là lời khuyên
 * ("nên đọc kỹ") vừa là liên từ chỉ kết quả ("hai mốc trùng nhau nên không có
 * khoảng trống"). Canh cả hai nghĩa thì phép kiểm bắt nhầm những câu mô tả thuần
 * túy, và một phép kiểm hay báo động giả sẽ nhanh chóng bị người viết vô hiệu hóa
 * bằng cách tắt đi. Vì vậy danh sách chỉ canh các cụm mà "nên" mang nghĩa khuyên.
 */
const PRESCRIPTIVE = [
  "không nên", "thì nên", "chỉ nên", "nên cân nhắc", "nên lưu ý", "nên đọc",
  "nên xem", "nên xem xét", "nên áp dụng", "nên chọn", "nên kiểm tra",
  "nên rà soát", "nên đối chiếu", "nên tham khảo", "nên chuẩn bị", "nên yêu cầu",
  "nên nộp", "nên sửa", "nên bổ sung", "nên thương lượng", "cần lưu ý", "phải lưu ý",
  "khuyến nghị", "đề nghị", "lời khuyên", "hãy", "đừng", "tốt nhất là", "chỉ cần",
  "should", "ought to", "we recommend", "recommended", "advisable", "advise",
  "make sure", "be careful", "best to",
];

/** Từ ngữ suy đoán hệ quả chưa đọc được từ bản văn. */
const SPECULATIVE = [
  "sẽ khiến", "sẽ dẫn đến", "chắc chắn", "có lẽ", "dường như", "e rằng",
  "nguy cơ", "rủi ro cao", "gây khó", "có lợi cho", "bất lợi cho", "dễ nhầm",
  "likely to", "will lead to", "is expected to", "arguably", "seems", "appears to",
  "risk of", "in practice this", "favours", "favors",
];

const LEXICON: { id: string; label: Bilingual; terms: string[] }[] = [
  {
    id: "evaluative",
    label: { vi: "Đánh giá hơn kém", en: "Evaluative" },
    terms: EVALUATIVE,
  },
  {
    id: "prescriptive",
    label: { vi: "Khuyến nghị hành động", en: "Prescriptive" },
    terms: PRESCRIPTIVE,
  },
  {
    id: "speculative",
    label: { vi: "Suy đoán hệ quả", en: "Speculative" },
    terms: SPECULATIVE,
  },
];

export interface ObjectivityFinding {
  /** Vị trí chuỗi bị bắt lỗi, ví dụ "luat-xay-dung-2025 · hieu-luc · observation.vi". */
  where: string;
  category: string;
  term: string;
  excerpt: string;
}

/**
 * Chuẩn hóa trước khi dò: hạ chữ thường, đổi dấu câu thành khoảng trắng, gộp
 * khoảng trắng, rồi đệm hai đầu. Nhờ vậy phép dò khớp theo ranh giới từ, không
 * bắt nhầm "nên" nằm trong "chuyên" hay "should" trong "shoulder".
 */
function normalise(text: string): string {
  const flat = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
  return ` ${flat} `;
}

/** Trả về các từ ngữ chủ quan tìm thấy trong một chuỗi. */
export function scanText(text: string): { category: string; term: string }[] {
  const hay = normalise(text);
  const hits: { category: string; term: string }[] = [];
  for (const group of LEXICON) {
    for (const term of group.terms) {
      if (hay.includes(` ${normalise(term).trim()} `)) {
        hits.push({ category: group.id, term });
      }
    }
  }
  return hits;
}

function scanField(
  value: Bilingual,
  where: string,
  out: ObjectivityFinding[],
): void {
  for (const lang of ["vi", "en"] as Lang[]) {
    for (const hit of scanText(value[lang])) {
      out.push({
        where: `${where}.${lang}`,
        category: hit.category,
        term: hit.term,
        excerpt: value[lang].slice(0, 120),
      });
    }
  }
}

/**
 * Soi toàn bộ phần đối chiếu.
 *
 * Ngoài từ ngữ, phép kiểm còn đòi mỗi điểm đối chiếu phải dẫn được căn cứ ở cả
 * hai vế: một nhận định không chỉ ra mình đọc từ bản ghi nào thì người đọc không
 * có cách nào kiểm lại, và như vậy thì khách quan hay không cũng không kiểm chứng
 * được.
 */
export function auditComparisons(
  entries: ComparisonEntry[],
  knownIds: ReadonlySet<string>,
): ObjectivityFinding[] {
  const out: ObjectivityFinding[] = [];
  for (const entry of entries) {
    const pair = `${entry.newId}--${entry.oldId}`;
    scanField(entry.scope, `${pair} · scope`, out);
    for (const p of entry.points) {
      const at = `${pair} · ${p.id}`;
      scanField(p.topic, `${at} · topic`, out);
      scanField(p.before, `${at} · before`, out);
      scanField(p.after, `${at} · after`, out);
      scanField(p.observation, `${at} · observation`, out);

      const cited = [...p.basis.before, ...p.basis.after];
      if (p.basis.before.length === 0 || p.basis.after.length === 0) {
        out.push({
          where: `${at} · basis`,
          category: "no-basis",
          term: "basis",
          excerpt: "Điểm đối chiếu thiếu căn cứ ở một trong hai vế.",
        });
      }
      for (const id of cited) {
        if (!knownIds.has(id)) {
          out.push({
            where: `${at} · basis`,
            category: "unknown-basis",
            term: id,
            excerpt: `Căn cứ trỏ tới bản ghi không có trong tập dữ liệu: ${id}.`,
          });
        }
      }
    }
  }
  return out;
}

/** Dừng hẳn việc dựng trang nếu phần đối chiếu không qua được phép kiểm. */
export function assertObjective(
  entries: ComparisonEntry[],
  knownIds: ReadonlySet<string>,
): void {
  const findings = auditComparisons(entries, knownIds);
  if (findings.length === 0) return;
  const lines = findings.map((f) => `  ${f.where} → [${f.category}] "${f.term}"`);
  throw new Error(
    `Phần đối chiếu không qua được phép kiểm tính khách quan (${findings.length}):\n${lines.join("\n")}`,
  );
}

/** Số lượng từ ngữ đang được canh, hiển thị trên trang phương pháp. */
export const lexiconStats = {
  groups: LEXICON.length,
  terms: LEXICON.reduce((n, g) => n + g.terms.length, 0),
  labels: LEXICON.map((g) => ({ id: g.id, label: g.label, count: g.terms.length })),
};
