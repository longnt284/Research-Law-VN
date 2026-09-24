import { documents, documentsById, verifiedOnOf } from "@/data/documents";
import type { LegalDoc } from "@/data/types";
import type { ValiditySegment, ValidityState } from "@/lib/validity-segment";

export type { ValiditySegment, ValidityState };

/**
 * Hiệu lực của một văn bản tại một ngày bất kỳ.
 *
 * Trường `status` của bản ghi chỉ nói tình trạng tại ngày tra cứu. Câu hỏi người
 * làm hồ sơ hay gặp lại khác: tại ngày ký hợp đồng, ngày xảy ra vi phạm, ngày nộp
 * hồ sơ, văn bản nào đang có hiệu lực. Lớp này trả lời câu đó từ chính dữ liệu
 * quan hệ, không thêm trường nào vào bản ghi:
 *
 * - Trước ngày có hiệu lực, văn bản chưa có hiệu lực.
 * - Từ ngày văn bản thay thế có hiệu lực, văn bản bị thay hết hiệu lực.
 * - Từ ngày văn bản sửa đổi có hiệu lực, văn bản bị sửa vẫn còn hiệu lực nhưng
 *   phải đọc cùng văn bản sửa đổi.
 *
 * Chỗ dữ liệu không đủ để kết luận thì hàm nói thẳng là không xác định được,
 * thay vì đoán. Trường hợp hay gặp nhất là văn bản được ghi hết hiệu lực mà tập
 * dữ liệu không có văn bản thay thế: biết chắc nó đã hết hiệu lực ở ngày tra cứu,
 * nhưng không biết từ ngày nào.
 */

export interface ValidityAt {
  state: ValidityState;
  /** Văn bản quyết định kết quả: bên thay thế, hoặc bên sửa đổi gần nhất. */
  by?: LegalDoc;
  /** Ngày bắt đầu của trạng thái, nếu dữ liệu cho biết. */
  since?: string;
  /** Đúng khi văn bản còn hiệu lực nhưng đã có văn bản sửa đổi có hiệu lực. */
  amended?: boolean;
  /** Đúng khi kết quả lấy từ tình trạng ghi nhận tại ngày tra cứu. */
  recorded?: boolean;
  /**
   * Đúng khi văn bản là văn bản sửa đổi và hết hiệu lực cùng văn bản mà nó sửa;
   * khi đó `by` là văn bản được sửa.
   */
  withParent?: boolean;
}

/** Ngày văn bản bắt đầu tác động: ngày có hiệu lực, thiếu thì ngày ban hành. */
export function startOf(doc: LegalDoc): string {
  return doc.effectiveOn || doc.issuedOn;
}

const replacersOf = new Map<string, LegalDoc[]>();
const amendersOf = new Map<string, LegalDoc[]>();
for (const doc of documents) {
  for (const id of doc.replaces ?? []) replacersOf.set(id, [...(replacersOf.get(id) ?? []), doc]);
  for (const id of doc.amends ?? []) amendersOf.set(id, [...(amendersOf.get(id) ?? []), doc]);
}

const byStart = (a: LegalDoc, b: LegalDoc) => startOf(a).localeCompare(startOf(b));

export function replacers(doc: LegalDoc): LegalDoc[] {
  return [...(replacersOf.get(doc.id) ?? [])].sort(byStart);
}

export function amenders(doc: LegalDoc): LegalDoc[] {
  return [...(amendersOf.get(doc.id) ?? [])].sort(byStart);
}

/**
 * Ngày hết hiệu lực suy ra từ văn bản được sửa.
 *
 * Một luật sửa đổi được ghi là hết hiệu lực nhưng không có văn bản nào thay nó
 * trực tiếp: phần sửa đổi của nó đã nhập vào luật được sửa, nên nó hết hiệu lực
 * khi luật đó bị thay thế. Chỉ suy ra khi mọi văn bản được sửa đều có văn bản
 * thay thế ghi ngày trong tập dữ liệu; thiếu một cái là không suy.
 */
export function lapseWithParent(doc: LegalDoc): { date: string; parent: LegalDoc } | null {
  if (doc.status !== "expired") return null;
  if (replacers(doc).some((r) => startOf(r))) return null;
  const parents = (doc.amends ?? []).map((id) => documentsById.get(id)).filter(Boolean) as LegalDoc[];
  if (parents.length === 0) return null;
  let best: { date: string; parent: LegalDoc } | null = null;
  for (const p of parents) {
    const first = replacers(p).find((r) => startOf(r));
    if (!first) return null;
    if (!best || startOf(first) > best.date) best = { date: startOf(first), parent: p };
  }
  return best;
}

/** Tình trạng của văn bản tại ngày `date` (YYYY-MM-DD). */
export function validityAt(doc: LegalDoc, date: string): ValidityAt {
  const start = startOf(doc);
  const checked = verifiedOnOf(doc);

  if (!start) {
    // Không có mốc nào để so. Chỉ nói được điều đã ghi nhận ở ngày tra cứu.
    if (date >= checked) return recordedState(doc, checked);
    return { state: "unknown" };
  }
  if (date < start) return { state: "pending", since: start };

  const dated = replacers(doc).filter((r) => startOf(r));
  const hit = dated.find((r) => startOf(r) <= date);
  if (hit) return { state: "expired", by: hit, since: startOf(hit) };

  const lapse = lapseWithParent(doc);
  if (lapse && date >= lapse.date) {
    return { state: "expired", by: lapse.parent, since: lapse.date, withParent: true };
  }
  if (doc.status === "expired" && dated.length === 0 && !lapse) {
    // Hết hiệu lực nhưng không rõ từ ngày nào: sau ngày tra cứu thì chắc chắn,
    // trước đó thì không kết luận được.
    if (date >= checked) return { state: "expired", recorded: true, since: checked };
    return { state: "unknown" };
  }

  const amended = amenders(doc).filter((a) => startOf(a) && startOf(a) <= date);
  const last = amended[amended.length - 1];
  if (last) return { state: "in-force", amended: true, by: last, since: startOf(last) };
  return { state: "in-force", since: start };
}

function recordedState(doc: LegalDoc, checked: string): ValidityAt {
  if (doc.status === "expired") return { state: "expired", recorded: true, since: checked };
  if (doc.status === "pending") return { state: "pending", recorded: true };
  return { state: "in-force", recorded: true, amended: doc.status === "amended" };
}

export type ValidityEventKind =
  | "issued"
  | "effective"
  | "amended-by"
  | "replaced-by"
  | "lapsed-with"
  | "expired-recorded";

export interface ValidityEvent {
  kind: ValidityEventKind;
  /** Chuỗi rỗng khi dữ liệu không có ngày. */
  date: string;
  other?: LegalDoc;
}

/**
 * Diễn biến hiệu lực của một văn bản, theo thứ tự thời gian.
 *
 * Chỉ gồm những sự kiện đọc được từ tập dữ liệu. Một văn bản sửa đổi không có
 * trong tập dữ liệu thì không xuất hiện ở đây, nên dòng thời gian này là phần
 * tối thiểu đã biết chứ không phải lịch sử đầy đủ.
 */
export function validityEvents(doc: LegalDoc): ValidityEvent[] {
  const out: ValidityEvent[] = [];
  if (doc.issuedOn) out.push({ kind: "issued", date: doc.issuedOn });
  if (doc.effectiveOn) out.push({ kind: "effective", date: doc.effectiveOn });
  for (const a of amenders(doc)) out.push({ kind: "amended-by", date: startOf(a), other: a });
  const reps = replacers(doc);
  for (const r of reps) out.push({ kind: "replaced-by", date: startOf(r), other: r });
  const lapse = lapseWithParent(doc);
  if (lapse) out.push({ kind: "lapsed-with", date: lapse.date, other: lapse.parent });
  else if (doc.status === "expired" && reps.length === 0) {
    out.push({ kind: "expired-recorded", date: verifiedOnOf(doc) });
  }
  // Sự kiện không có ngày xếp cuối, giữ thứ tự thêm vào.
  return out
    .map((e, i) => ({ e, i }))
    .sort((x, y) => {
      if (!x.e.date || !y.e.date) return (x.e.date ? 0 : 1) - (y.e.date ? 0 : 1) || x.i - y.i;
      return x.e.date.localeCompare(y.e.date) || x.i - y.i;
    })
    .map(({ e }) => e);
}

/**
 * Chia trục thời gian của văn bản thành các đoạn có cùng tình trạng.
 *
 * Tình trạng chỉ đổi ở các mốc đã biết, nên tính sẵn ở máy chủ rồi gửi xuống vài
 * đoạn là đủ để ô chọn ngày trên trang trả lời tức thì, không phải gửi cả tập dữ
 * liệu xuống trình duyệt.
 */
export function validitySegments(doc: LegalDoc): ValiditySegment[] {
  const marks = new Set<string>();
  const start = startOf(doc);
  if (start) marks.add(start);
  for (const d of [...replacers(doc), ...amenders(doc)]) if (startOf(d)) marks.add(startOf(d));
  const lapse = lapseWithParent(doc);
  if (lapse) marks.add(lapse.date);
  marks.add(verifiedOnOf(doc));
  const pack = (from: string, v: ValidityAt): ValiditySegment => ({
    from,
    state: v.state,
    since: v.since,
    amended: v.amended,
    recorded: v.recorded,
    withParent: v.withParent,
    byId: v.by?.id,
    byNumber: v.by?.number,
  });
  return [
    pack("", validityAt(doc, "0001-01-01")),
    ...[...marks].sort().map((m) => pack(m, validityAt(doc, m))),
  ];
}
