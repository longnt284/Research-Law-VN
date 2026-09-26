import { comparisonsByPair, comparisons } from "@/data/comparisons";
import { documents, documentsById, domains } from "@/data/documents";
import type {
  ComparisonEntry,
  Confidence,
  LegalDoc,
  Lang,
  RelationKind,
} from "@/data/types";
import { formatDate, getDict } from "@/i18n/dictionary";
import { monthsBetween, spanWords } from "@/lib/span";

/**
 * Cơ chế đối chiếu văn bản, phần suy ra được từ dữ liệu.
 *
 * Cặp đối chiếu không do người biên soạn chọn mà lấy thẳng từ quan hệ `replaces`
 * và `amends` trong tập dữ liệu: văn bản nào thay thế hoặc sửa đổi một văn bản
 * khác thì có trang đối chiếu, không có ngoại lệ và không có cặp nào được thêm
 * vào bằng tay. Nhờ vậy danh sách cặp luôn khớp với gia phả văn bản, và không có
 * chỗ cho một cặp "được chọn" vì nó minh họa đẹp cho một luận điểm nào đó.
 */

export interface Pair {
  /** Khóa dùng trong đường dẫn: `${newId}--${oldId}`. */
  id: string;
  kind: Extract<RelationKind, "replaces" | "amends">;
  /** Văn bản sau: bên thay thế hoặc bên sửa đổi. */
  newDoc: LegalDoc;
  /** Văn bản trước: bên bị thay thế hoặc bị sửa đổi. */
  oldDoc: LegalDoc;
  /** Phần điểm đối chiếu đã viết, nếu có. */
  entry?: ComparisonEntry;
  /**
   * Mức xác minh của cả cặp, lấy theo bên yếu hơn. Một bản đối chiếu chỉ chắc
   * chắn tới mức của vế kém chắc chắn nhất trong hai vế.
   */
  confidence: Confidence;
}

function buildPairs(): Pair[] {
  const out: Pair[] = [];
  for (const doc of documents) {
    const add = (oldId: string, kind: Pair["kind"]) => {
      const oldDoc = documentsById.get(oldId);
      if (!oldDoc) return;
      const id = `${doc.id}--${oldId}`;
      out.push({
        id,
        kind,
        newDoc: doc,
        oldDoc,
        entry: comparisonsByPair.get(id),
        confidence:
          doc.confidence === "verified" && oldDoc.confidence === "verified"
            ? "verified"
            : "cross-check",
      });
    };
    for (const oldId of doc.replaces ?? []) add(oldId, "replaces");
    for (const oldId of doc.amends ?? []) add(oldId, "amends");
  }

  /*
    Xếp cặp đã có điểm đối chiếu lên trước, sau đó theo ngày hiệu lực của văn bản
    sau, mới nhất trước. Người mở trang danh sách thường đi tìm thay đổi gần đây
    nhất, và cặp đã được đối chiếu nội dung thì đọc được nhiều hơn.
  */
  return out.sort((a, b) => {
    const byEntry = Number(Boolean(b.entry)) - Number(Boolean(a.entry));
    if (byEntry !== 0) return byEntry;
    return (b.newDoc.effectiveOn || "").localeCompare(a.newDoc.effectiveOn || "");
  });
}

export const pairs: Pair[] = buildPairs();

export const pairById = new Map(pairs.map((p) => [p.id, p]));

/** Các cặp đối chiếu có mặt một văn bản, dùng ở trang chi tiết văn bản. */
export function pairsFor(docId: string): Pair[] {
  return pairs.filter((p) => p.newDoc.id === docId || p.oldDoc.id === docId);
}

/** Số cặp đã có ít nhất một điểm đối chiếu được viết. */
export const curatedPairCount = comparisons.length;

export type FactField =
  | "type"
  | "status"
  | "issuedOn"
  | "effectiveOn"
  | "domains";

export interface FactDelta {
  field: FactField;
  before: string;
  after: string;
  /** Đúng khi hai vế khác nhau; giao diện chỉ tô đậm những dòng khác nhau. */
  changed: boolean;
}

function domainLabels(doc: LegalDoc, lang: Lang): string {
  const byId = new Map(domains.map((d) => [d.id, d]));
  return doc.domains
    .map((id) => byId.get(id)?.label[lang] ?? id)
    .join(lang === "vi" ? ", " : ", ");
}

/**
 * Bảng dữ kiện hai cột.
 *
 * Toàn bộ nội dung ở đây đọc thẳng từ hai bản ghi, không qua bước diễn giải nào.
 * Đây là phần khách quan theo nghĩa chặt nhất: cùng một tập dữ liệu thì ai chạy
 * cũng ra đúng bảng này.
 */
export function factDeltas(pair: Pair, lang: Lang): FactDelta[] {
  const t = getDict(lang);
  const unknown = t.doc.unknownDate;
  const { oldDoc, newDoc } = pair;

  const rows: FactDelta[] = [
    {
      field: "type",
      before: t.type[oldDoc.type],
      after: t.type[newDoc.type],
      changed: oldDoc.type !== newDoc.type,
    },
    {
      field: "status",
      before: t.status[oldDoc.status],
      after: t.status[newDoc.status],
      changed: oldDoc.status !== newDoc.status,
    },
    {
      field: "issuedOn",
      before: formatDate(oldDoc.issuedOn, lang, unknown),
      after: formatDate(newDoc.issuedOn, lang, unknown),
      changed: oldDoc.issuedOn !== newDoc.issuedOn,
    },
    {
      field: "effectiveOn",
      before: formatDate(oldDoc.effectiveOn, lang, unknown),
      after: formatDate(newDoc.effectiveOn, lang, unknown),
      changed: oldDoc.effectiveOn !== newDoc.effectiveOn,
    },
    {
      field: "domains",
      before: domainLabels(oldDoc, lang),
      after: domainLabels(newDoc, lang),
      changed: domainLabels(oldDoc, lang) !== domainLabels(newDoc, lang),
    },
  ];
  return rows;
}

// Hai phép tính ngày tách sang `span.ts` để trang so sánh tự chọn dùng được trên
// trình duyệt mà không kéo cả kho văn bản theo; giữ tên cũ cho các chỗ gọi.
export { monthsBetween, spanWords } from "@/lib/span";

/**
 * Nhận định suy ra bằng phép tính trên hai bản ghi.
 *
 * Mỗi câu ở đây là kết quả của một phép so sánh hoặc một phép trừ ngày, nên
 * không có chỗ cho quan điểm lọt vào. Đó cũng là giới hạn của chúng: chúng nói
 * được khoảng cách giữa hai mốc là bao lâu, không nói được khoảng cách ấy có ý
 * nghĩa gì với một hồ sơ cụ thể.
 */
export function derivedNotes(pair: Pair, lang: Lang): string[] {
  const { oldDoc, newDoc, kind } = pair;
  const out: string[] = [];
  const vi = lang === "vi";

  const gap = monthsBetween(oldDoc.effectiveOn, newDoc.effectiveOn);
  if (gap !== null && gap > 0) {
    out.push(
      vi
        ? `Khi văn bản sau bắt đầu có hiệu lực, văn bản trước đã có hiệu lực được ${spanWords(gap, lang)}.`
        : `The earlier instrument had been in force for ${spanWords(gap, lang)} when the later one commenced.`,
    );
  }

  out.push(
    kind === "replaces"
      ? vi
        ? "Quan hệ giữa hai văn bản là thay thế: văn bản sau thay toàn bộ hoặc phần lớn văn bản trước."
        : "The relation is replacement: the later instrument supersedes the earlier one in whole or in large part."
      : vi
        ? "Quan hệ giữa hai văn bản là sửa đổi, bổ sung: văn bản trước vẫn còn, chỉ một số điều khoản bị thay đổi."
        : "The relation is amendment: the earlier instrument survives, with certain provisions changed.",
  );

  if (oldDoc.type === newDoc.type) {
    out.push(
      vi
        ? `Hai văn bản cùng loại (${getDict(lang).type[oldDoc.type].toLowerCase()}), nên thứ bậc hiệu lực pháp lý không đổi.`
        : `Both instruments are of the same type (${getDict(lang).type[oldDoc.type].toLowerCase()}), so the legal rank is unchanged.`,
    );
  } else {
    out.push(
      vi
        ? `Loại văn bản đổi từ ${getDict(lang).type[oldDoc.type].toLowerCase()} sang ${getDict(lang).type[newDoc.type].toLowerCase()}.`
        : `The instrument type changes from ${getDict(lang).type[oldDoc.type].toLowerCase()} to ${getDict(lang).type[newDoc.type].toLowerCase()}.`,
    );
  }

  const added = newDoc.domains.filter((d) => !oldDoc.domains.includes(d));
  const removed = oldDoc.domains.filter((d) => !newDoc.domains.includes(d));
  const byId = new Map(domains.map((d) => [d.id, d]));
  const names = (ids: typeof added) =>
    ids.map((id) => byId.get(id)?.label[lang] ?? id).join(", ");
  if (added.length > 0) {
    out.push(
      vi
        ? `Bản ghi của văn bản sau được gán thêm lĩnh vực: ${names(added)}.`
        : `The later record carries additional domains: ${names(added)}.`,
    );
  }
  if (removed.length > 0) {
    out.push(
      vi
        ? `Lĩnh vực có ở bản ghi văn bản trước, không có ở bản ghi văn bản sau: ${names(removed)}.`
        : `Domains present on the earlier record and absent from the later one: ${names(removed)}.`,
    );
  }

  /*
    Chuỗi văn bản thi hành cũng là một dữ kiện đếm được: một văn bản mới mà chưa
    có nghị định, thông tư nào quy định chi tiết thì người đọc vẫn phải mở văn
    bản thi hành của đời trước, và con số dưới đây nói ra điều đó.
  */
  const guidesOf = (id: string) =>
    documents.filter((d) => (d.guides ?? []).includes(id)).length;
  const oldGuides = guidesOf(oldDoc.id);
  const newGuides = guidesOf(newDoc.id);
  if (oldGuides > 0 || newGuides > 0) {
    out.push(
      vi
        ? `Trong tập dữ liệu này, văn bản trước có ${oldGuides} văn bản quy định chi tiết hoặc hướng dẫn thi hành, văn bản sau có ${newGuides}.`
        : `Within this dataset, the earlier instrument has ${oldGuides} implementing instrument${oldGuides === 1 ? "" : "s"} and the later one has ${newGuides}.`,
    );
  }

  const points = pair.entry?.points.length ?? 0;
  out.push(
    vi
      ? points === 0
        ? "Chưa có điểm đối chiếu nội dung nào được viết cho cặp này; phần trên là toàn bộ những gì đọc được từ hai bản ghi."
        : `Đã viết ${points} điểm đối chiếu nội dung cho cặp này.`
      : points === 0
        ? "No content comparison has been written for this pair; what appears above is everything the two records yield."
        : `${points} content comparison point${points === 1 ? "" : "s"} have been written for this pair.`,
  );

  return out;
}
