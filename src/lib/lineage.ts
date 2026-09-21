import { documents, documentsById, domains as allDomains } from "@/data/documents";
import type { Confidence, DomainId, Lang, LegalDoc } from "@/data/types";
import { formatDate, getDict } from "@/i18n/dictionary";
import { type FactField, monthsBetween, pairById, spanWords } from "@/lib/compare";

/**
 * Chuỗi đời của một văn bản.
 *
 * Trang đối chiếu theo cặp trả lời được câu hỏi "văn bản này khác văn bản trước
 * ở chỗ nào". Nó không trả lời được câu hỏi hay gặp hơn trong hồ sơ: một quy
 * định đã đi qua bao nhiêu đời văn bản, và ở thời điểm ký kết hợp đồng thì đang
 * đọc theo bản nào. Một cặp chỉ thấy hai mắt xích; hợp đồng thì sống qua cả
 * chuỗi.
 *
 * Chuỗi ở đây gồm hai phần, và cả hai đều suy ra từ dữ liệu, không ai chọn tay:
 *
 * Trục thay thế là dãy văn bản nối nhau bằng quan hệ `replaces`, xếp từ cũ tới
 * mới. Đây là xương sống: mỗi mắt là một lần cả văn bản được viết lại.
 *
 * Các văn bản sửa đổi là những bản ghi `amends` trỏ vào một mắt bất kỳ của trục.
 * Chúng không thay thế ai cả, nhưng đổi nội dung đang có hiệu lực, nên bỏ chúng
 * ra ngoài thì dòng thời gian thiếu mất những lần thay đổi thật.
 *
 * Chuỗi chỉ có hai văn bản thì trang cặp đã nói đủ, nên `lineages` chỉ giữ chuỗi
 * từ ba văn bản trở lên: đó đúng là chỗ mà đối chiếu từng cặp không còn đủ.
 */

/** Vai trò của một văn bản trong chuỗi. */
export type StepRole =
  /** Văn bản mở đầu chuỗi trong phạm vi tập dữ liệu này. */
  | "root"
  /** Thay thế văn bản đứng trước trên trục. */
  | "replaces"
  /** Sửa đổi, bổ sung một văn bản đang có trong chuỗi. */
  | "amends";

export interface LineageStep {
  doc: LegalDoc;
  role: StepRole;
  /** Văn bản bị thay thế hoặc bị sửa đổi. Bỏ trống ở bước mở đầu. */
  targetId?: string;
  /** Khóa trang đối chiếu của bước này, khi cặp tương ứng có thật. */
  pairId?: string;
}

export interface Lineage {
  /** Khóa đường dẫn: mã văn bản mở đầu chuỗi. */
  id: string;
  /** Trục thay thế, từ cũ tới mới. */
  spine: LegalDoc[];
  /** Toàn bộ bước của chuỗi, xếp theo ngày có hiệu lực. */
  steps: LineageStep[];
  /** Mọi văn bản có mặt trong chuỗi, cùng thứ tự với `steps`. */
  docs: LegalDoc[];
  /** Văn bản cuối trục thay thế: bản đang được đọc nếu không có gì mới hơn. */
  current: LegalDoc;
  domains: DomainId[];
  /** Mức xác minh của cả chuỗi, lấy theo bản ghi kém chắc chắn nhất. */
  confidence: Confidence;
}

/** Mốc dùng để xếp thứ tự: ngày hiệu lực, thiếu thì lấy ngày ban hành. */
function when(doc: LegalDoc): string {
  return doc.effectiveOn || doc.issuedOn || "";
}

function buildLineages(): Lineage[] {
  /*
    Bước một: dựng trục thay thế. `next` đi từ văn bản bị thay tới văn bản thay
    nó, nên một văn bản không có mặt trong `next` với tư cách đích là văn bản mở
    đầu một trục.
  */
  const next = new Map<string, string>();
  for (const doc of documents) {
    for (const oldId of doc.replaces ?? []) {
      if (!documentsById.has(oldId)) continue;
      // Một văn bản thay nhiều văn bản khác thì mỗi nhánh là một trục riêng;
      // giữ nhánh đầu tiên để trục luôn là một đường thẳng, không phải cái cây.
      if (!next.has(oldId)) next.set(oldId, doc.id);
    }
  }
  const isRoot = (doc: LegalDoc) =>
    (doc.replaces ?? []).every((id) => !documentsById.has(id));

  const out: Lineage[] = [];
  for (const root of documents) {
    if (!isRoot(root)) continue;

    const spine: LegalDoc[] = [root];
    const seen = new Set([root.id]);
    for (let id = next.get(root.id); id && !seen.has(id); id = next.get(id)) {
      const doc = documentsById.get(id);
      if (!doc) break;
      spine.push(doc);
      seen.add(id);
    }

    const steps: LineageStep[] = spine.map((doc, i) => ({
      doc,
      role: i === 0 ? "root" : "replaces",
      targetId: i === 0 ? undefined : spine[i - 1].id,
      pairId: i === 0 ? undefined : `${doc.id}--${spine[i - 1].id}`,
    }));

    /*
      Bước hai: gắn các văn bản sửa đổi. Một văn bản sửa nhiều văn bản của cùng
      một chuỗi thì chỉ vào chuỗi một lần, và mốc nó gắn vào là mắt xích cũ nhất
      mà nó chạm tới.
    */
    const onSpine = new Set(spine.map((d) => d.id));
    for (const doc of documents) {
      const targets = (doc.amends ?? []).filter((id) => onSpine.has(id));
      if (targets.length === 0) continue;
      const targetId = targets[0];
      steps.push({
        doc,
        role: "amends",
        targetId,
        pairId: `${doc.id}--${targetId}`,
      });
    }

    steps.sort((a, b) => {
      const byDate = when(a.doc).localeCompare(when(b.doc));
      if (byDate !== 0) return byDate;
      // Cùng mốc thì lần thay thế đứng trước lần sửa đổi: thay thế là mắt xích
      // của trục, sửa đổi treo vào trục.
      return Number(a.role === "amends") - Number(b.role === "amends");
    });

    if (steps.length < 3) continue;

    const docs = steps.map((s) => s.doc);
    const domains = [...new Set(docs.flatMap((d) => d.domains))];
    out.push({
      id: root.id,
      spine,
      steps,
      docs,
      current: spine[spine.length - 1],
      domains,
      confidence: docs.every((d) => d.confidence === "verified")
        ? "verified"
        : "cross-check",
    });
  }

  // Chuỗi có thay đổi gần đây nhất lên trước: người mở trang thường đi tìm đời
  // văn bản đang động, không phải đời đã đóng lại từ lâu.
  return out.sort((a, b) => {
    const la = when(a.steps[a.steps.length - 1].doc);
    const lb = when(b.steps[b.steps.length - 1].doc);
    return lb.localeCompare(la);
  });
}

export const lineages: Lineage[] = buildLineages();

export const lineageById = new Map(lineages.map((l) => [l.id, l]));

/** Các chuỗi có mặt một văn bản, dùng ở trang chi tiết văn bản. */
export function lineagesFor(docId: string): Lineage[] {
  return lineages.filter((l) => l.docs.some((d) => d.id === docId));
}

export interface MatrixCell {
  docId: string;
  value: string;
  /** Đúng khi khác ô liền trước; giao diện chỉ tô đậm chỗ đổi. */
  changed: boolean;
}

export interface MatrixRow {
  field: FactField;
  cells: MatrixCell[];
  /** Đúng khi có ít nhất một ô khác ô liền trước. */
  moved: boolean;
}

function domainLabels(doc: LegalDoc, lang: Lang): string {
  const byId = new Map(allDomains.map((d) => [d.id, d]));
  return doc.domains.map((id) => byId.get(id)?.label[lang] ?? id).join(", ");
}

/**
 * Bảng dữ kiện nhiều cột.
 *
 * Bảng hai cột của trang cặp mở rộng ra đúng số văn bản của chuỗi. Ô được đánh
 * dấu khi khác ô liền trước, nên đọc ngang một dòng là thấy loại văn bản hay
 * tình trạng hiệu lực đổi ở đúng đời nào. Toàn bộ nội dung đọc thẳng từ bản
 * ghi: cùng dữ liệu thì ai dựng cũng ra đúng bảng này.
 */
export function lineageMatrix(lineage: Lineage, lang: Lang): MatrixRow[] {
  const t = getDict(lang);
  const unknown = t.doc.unknownDate;

  const value = (doc: LegalDoc, field: FactField): string => {
    switch (field) {
      case "type":
        return t.type[doc.type];
      case "status":
        return t.status[doc.status];
      case "issuedOn":
        return formatDate(doc.issuedOn, lang, unknown);
      case "effectiveOn":
        return formatDate(doc.effectiveOn, lang, unknown);
      case "domains":
        return domainLabels(doc, lang);
    }
  };

  const fields: FactField[] = ["type", "status", "issuedOn", "effectiveOn", "domains"];
  return fields.map((field) => {
    const cells = lineage.docs.map((doc, i) => {
      const v = value(doc, field);
      return {
        docId: doc.id,
        value: v,
        changed: i > 0 && v !== value(lineage.docs[i - 1], field),
      };
    });
    return { field, cells, moved: cells.some((c) => c.changed) };
  });
}

/**
 * Nhận định suy ra cho cả chuỗi.
 *
 * Cùng giới hạn với phần nhận định của trang cặp: mỗi câu là kết quả của một
 * phép đếm hoặc một phép trừ ngày. Chúng nói được chuỗi dài bao lâu và đổi mấy
 * lần, không nói được lần đổi nào đáng kể với một hồ sơ cụ thể.
 */
export function lineageNotes(lineage: Lineage, lang: Lang): string[] {
  const vi = lang === "vi";
  const out: string[] = [];

  const first = lineage.steps[0].doc;
  const last = lineage.steps[lineage.steps.length - 1].doc;
  const span = monthsBetween(when(first), when(last));
  if (span !== null && span > 0) {
    out.push(
      vi
        ? `Chuỗi trải ${spanWords(span, lang)}, từ ${first.number} tới ${last.number}.`
        : `The lineage spans ${spanWords(span, lang)}, from ${first.number} to ${last.number}.`,
    );
  }

  const replaceCount = lineage.steps.filter((s) => s.role === "replaces").length;
  const amendCount = lineage.steps.filter((s) => s.role === "amends").length;
  out.push(
    vi
      ? `Trong chuỗi có ${replaceCount} lần thay thế và ${amendCount} lần sửa đổi, bổ sung.`
      : `The lineage contains ${replaceCount} replacement${replaceCount === 1 ? "" : "s"} and ${amendCount} amendment${amendCount === 1 ? "" : "s"}.`,
  );

  if (span !== null && span > 0 && lineage.steps.length > 1) {
    const gap = Math.round(span / (lineage.steps.length - 1));
    out.push(
      vi
        ? `Khoảng cách trung bình giữa hai lần thay đổi là ${gap} tháng.`
        : `The mean interval between two changes is ${gap} month${gap === 1 ? "" : "s"}.`,
    );
  }

  const inForce = lineage.docs.filter(
    (d) => d.status === "active" || d.status === "amended",
  ).length;
  const expired = lineage.docs.filter((d) => d.status === "expired").length;
  const pending = lineage.docs.filter((d) => d.status === "pending").length;
  out.push(
    vi
      ? `Tại thời điểm tra cứu, ${inForce} văn bản trong chuỗi còn hiệu lực, ${expired} văn bản đã hết hiệu lực${pending > 0 ? `, ${pending} văn bản chưa tới ngày có hiệu lực` : ""}.`
      : `At the date of search, ${inForce} instrument${inForce === 1 ? "" : "s"} in the lineage remain in force and ${expired} have ceased to have effect${pending > 0 ? `, with ${pending} not yet commenced` : ""}.`,
  );

  const curated = lineage.steps.filter(
    (s) => s.pairId && pairById.get(s.pairId)?.entry,
  ).length;
  const withPair = lineage.steps.filter((s) => s.pairId && pairById.has(s.pairId)).length;
  out.push(
    vi
      ? `${withPair} bước trong chuỗi có trang đối chiếu, trong đó ${curated} bước đã được viết điểm đối chiếu nội dung.`
      : `${withPair} step${withPair === 1 ? "" : "s"} in the lineage have a comparison page, of which ${curated} carry written content comparisons.`,
  );

  return out;
}

/** Số chuỗi và số văn bản nằm trong chuỗi, dùng ở đầu trang đối chiếu. */
export const lineageStats = {
  count: lineages.length,
  docs: new Set(lineages.flatMap((l) => l.docs.map((d) => d.id))).size,
  steps: lineages.reduce((n, l) => n + l.steps.length, 0),
};
