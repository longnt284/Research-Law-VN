import type { Domain, LegalDoc } from "@/data/types";
import { numberKey } from "@/lib/basis-check";

/**
 * Phép kiểm tính chỉnh của kho văn bản.
 *
 * Phần đối chiếu đã có một cổng chặn khi dựng trang, `objectivity.ts`. Kho văn
 * bản thì chưa: một bản ghi ghi sai định dạng ngày, thiếu nguồn, hay trỏ quan hệ
 * tới một mã không tồn tại vẫn lọt qua và chỉ lộ ra khi có người tình cờ mở đúng
 * trang đó. Với một trang tra cứu pháp luật, đó là lỗi đắt: người đọc tin vào
 * bản ghi vì nó trông chỉn chu, không vì nó đã được kiểm.
 *
 * Vì vậy kho văn bản cũng đi qua một cổng chặn. Chỉ những ràng buộc khẳng định
 * được từ chính tập dữ liệu mới nằm ở đây; không có ràng buộc nào cần tra cứu
 * bên ngoài, vì một phép kiểm không tự chạy được thì sớm muộn cũng bị tắt.
 */

export interface IntegrityFinding {
  /** Bản ghi bị bắt lỗi. */
  where: string;
  rule: string;
  detail: string;
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Quy ước đánh số theo loại văn bản.
 *
 * Số hiệu văn bản Việt Nam có cấu trúc cố định, và cấu trúc đó nói ngay văn bản
 * thuộc loại nào: nghị định kết thúc bằng NĐ-CP, thông tư mang cụm TT, luật và
 * nghị quyết của Quốc hội mang số khóa QH. Một bản ghi gán sai loại vì vậy tự
 * lộ ra ở số hiệu, và phép kiểm này bắt đúng chỗ đó.
 */
/*
  Phần đuôi viết tắt cơ quan ban hành không phải lúc nào cũng viết hoa hết: quyết
  định của Thủ tướng mang đuôi QĐ-TTg, nghị quyết của Hội đồng Thẩm phán mang đuôi
  NQ-HĐTP. Vì vậy lớp chữ sau dấu gạch nhận cả chữ thường, miễn là bắt đầu bằng
  chữ hoa.
*/
const ORG = "[A-ZĐ][A-Za-zĐ]*";

const NUMBER_SHAPE: Partial<Record<LegalDoc["type"], { re: RegExp; shape: string }>> = {
  luat: { re: /\/QH\d+$/, shape: "…/…/QH<khóa>" },
  "bo-luat": { re: /\/QH\d+$/, shape: "…/…/QH<khóa>" },
  "nghi-quyet": { re: new RegExp(`/(QH\\d+|NQ-${ORG})$`), shape: "…/…/QH<khóa> hoặc …/NQ-…" },
  "nghi-dinh": { re: /\/NĐ-CP$/, shape: "…/…/NĐ-CP" },
  "quyet-dinh": { re: new RegExp(`/QĐ-${ORG}$`), shape: "…/QĐ-… hoặc …/…/QĐ-…" },
  "thong-tu": { re: new RegExp(`/TT-${ORG}$`), shape: "…/…/TT-…" },
  vbhn: { re: /VBHN/i, shape: "…/VBHN-…" },
};

/** So sánh hai mốc ISO. Chuỗi rỗng nghĩa là chưa xác minh được, bỏ qua. */
function bothKnown(a: string, b: string): boolean {
  return ISO.test(a) && ISO.test(b);
}

/**
 * Soi toàn bộ kho văn bản.
 *
 * Trả về danh sách thay vì ném ở lỗi đầu tiên: người sửa dữ liệu cần thấy hết
 * các chỗ hỏng trong một lần chạy, không phải sửa một lỗi rồi chạy lại để lộ ra
 * lỗi tiếp theo.
 */
export function auditDocuments(
  docs: readonly LegalDoc[],
  doms: readonly Domain[],
): IntegrityFinding[] {
  const out: IntegrityFinding[] = [];
  const ids = new Set(docs.map((d) => d.id));
  const domainIds = new Set(doms.map((d) => d.id));
  const seenId = new Set<string>();
  const seenNumber = new Map<string, string>();

  const add = (where: string, rule: string, detail: string) =>
    out.push({ where, rule, detail });

  for (const doc of docs) {
    const at = doc.id;

    if (seenId.has(doc.id)) add(at, "trùng mã", `Mã "${doc.id}" xuất hiện nhiều lần.`);
    seenId.add(doc.id);

    // So sau khi chuẩn hóa: "6/2021/TT-BXD" và "06/2021/TT-BXD" là một văn bản,
    // và trang soát căn cứ tra số hiệu theo đúng khóa chuẩn hóa này.
    const key = numberKey(doc.number);
    const owner = seenNumber.get(key);
    if (owner) {
      add(at, "trùng số hiệu", `Số hiệu "${doc.number}" đã dùng cho bản ghi "${owner}".`);
    } else {
      seenNumber.set(key, doc.id);
    }

    const shape = NUMBER_SHAPE[doc.type];
    if (shape && !shape.re.test(doc.number)) {
      add(
        at,
        "số hiệu không khớp loại",
        `Loại "${doc.type}" đòi số hiệu dạng ${shape.shape}, bản ghi đang ghi "${doc.number}".`,
      );
    }

    for (const field of ["issuedOn", "effectiveOn"] as const) {
      const v = doc[field];
      if (v !== "" && !ISO.test(v)) {
        add(at, "ngày sai định dạng", `Trường ${field} phải là YYYY-MM-DD hoặc để trống, đang là "${v}".`);
      }
    }

    // Một văn bản không thể có hiệu lực trước ngày nó được ban hành.
    if (bothKnown(doc.issuedOn, doc.effectiveOn) && doc.effectiveOn < doc.issuedOn) {
      add(
        at,
        "hiệu lực trước ban hành",
        `Ngày hiệu lực ${doc.effectiveOn} sớm hơn ngày ban hành ${doc.issuedOn}.`,
      );
    }

    if (doc.domains.length === 0) add(at, "thiếu lĩnh vực", "Bản ghi không thuộc lĩnh vực nào.");
    for (const d of doc.domains) {
      if (!domainIds.has(d)) add(at, "lĩnh vực lạ", `Lĩnh vực "${d}" không có trong danh sách.`);
    }
    if (new Set(doc.domains).size !== doc.domains.length) {
      add(at, "lĩnh vực lặp", "Cùng một lĩnh vực được gán nhiều lần.");
    }

    // Nguyên tắc gốc của tập dữ liệu: không bản ghi nào không có nguồn.
    if (doc.sources.length === 0) {
      add(at, "thiếu nguồn", "Bản ghi không dẫn nguồn nào.");
    }
    for (const src of doc.sources) {
      let ok = false;
      try {
        ok = new URL(src).protocol === "https:";
      } catch {
        ok = false;
      }
      if (!ok) add(at, "nguồn không hợp lệ", `Nguồn phải là một URL https: "${src}".`);
    }

    for (const [kind, list] of [
      ["replaces", doc.replaces],
      ["amends", doc.amends],
      ["guides", doc.guides],
    ] as const) {
      for (const other of list ?? []) {
        if (other === doc.id) add(at, "quan hệ tự trỏ", `Trường ${kind} trỏ về chính bản ghi này.`);
        else if (!ids.has(other)) {
          add(at, "quan hệ treo", `Trường ${kind} trỏ tới mã không có trong tập dữ liệu: "${other}".`);
        }
      }
      if (list && new Set(list).size !== list.length) {
        add(at, "quan hệ lặp", `Trường ${kind} có mã lặp lại.`);
      }
    }

    /*
      Một văn bản bị thay thế bởi một văn bản đã có hiệu lực thì không còn là
      văn bản còn hiệu lực. Phép kiểm chỉ chạy khi văn bản thay thế đã thực sự
      tới ngày hiệu lực; thay thế đã ký nhưng chưa tới ngày thì bên bị thay vẫn
      đang còn hiệu lực, và đó là trạng thái đúng chứ không phải lỗi.
    */
    for (const replacer of docs) {
      if (!replacer.replaces?.includes(doc.id)) continue;
      if (replacer.status === "pending") continue;
      if (doc.status === "active" || doc.status === "amended") {
        add(
          at,
          "trạng thái không khớp quan hệ",
          `Bản ghi ghi là "${doc.status}" nhưng đã bị "${replacer.id}" thay thế.`,
        );
      }
    }
  }

  return out;
}

/** Dừng hẳn việc dựng trang nếu kho văn bản không qua được phép kiểm. */
export function assertIntegrity(
  docs: readonly LegalDoc[],
  doms: readonly Domain[],
): void {
  const findings = auditDocuments(docs, doms);
  if (findings.length === 0) return;
  const lines = findings.map((f) => `  ${f.where} → [${f.rule}] ${f.detail}`);
  throw new Error(
    `Kho văn bản không qua được phép kiểm tính chỉnh (${findings.length}):\n${lines.join("\n")}`,
  );
}

/** Số ràng buộc đang canh, hiển thị trên trang phương pháp. */
export const integrityRules: { vi: string; en: string }[] = [
  {
    vi: "Mã và số hiệu không trùng nhau giữa hai bản ghi.",
    en: "No two records share an identifier or a document number.",
  },
  {
    vi: "Số hiệu phải khớp quy ước đánh số của loại văn bản.",
    en: "A document number must match the numbering convention of its type.",
  },
  {
    vi: "Ngày ghi theo ISO, và ngày hiệu lực không sớm hơn ngày ban hành.",
    en: "Dates are ISO-formatted, and commencement is never earlier than issue.",
  },
  {
    vi: "Mỗi bản ghi thuộc ít nhất một lĩnh vực có trong danh sách.",
    en: "Every record belongs to at least one domain from the list.",
  },
  {
    vi: "Mỗi bản ghi dẫn ít nhất một nguồn, và mọi nguồn là địa chỉ https.",
    en: "Every record cites at least one source, and every source is an https address.",
  },
  {
    vi: "Quan hệ chỉ trỏ tới bản ghi có thật, không trỏ về chính nó, không lặp.",
    en: "Relations point to records that exist, never to themselves, and never repeat.",
  },
  {
    vi: "Văn bản đã bị một văn bản đang có hiệu lực thay thế không còn được ghi là còn hiệu lực.",
    en: "A record replaced by an instrument already in force is not marked as still in force.",
  },
];
