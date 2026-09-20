import { documentsById } from "@/data/documents";
import type { Lang, LegalDoc } from "@/data/types";

/**
 * Cơ chế dẫn trích tới từng điều khoản.
 *
 * Trước đây một căn cứ đối chiếu chỉ trỏ được tới cả một văn bản. Điều đó đủ để
 * người đọc biết nên mở văn bản nào, nhưng chưa đủ để họ kiểm lại: một luật có
 * vài trăm điều, và bảo người đọc "đọc trong Luật Xây dựng 2025" thì cũng gần
 * như không chỉ chỗ nào cả. Lớp này cho phép một căn cứ trỏ tới đúng điểm,
 * khoản, điều mà nó được đọc ra.
 *
 * Cú pháp viết trong dữ liệu là một chuỗi, để phần dữ liệu đọc vẫn nhẹ mắt:
 *
 *     "luat-xay-dung-2025"                        cả văn bản
 *     "luat-xay-dung-2025#dieu:38"                Điều 38
 *     "luat-xay-dung-2025#dieu:38.khoan:3"        khoản 3 Điều 38
 *     "luat-dau-tu-2020#phuluc:IV"                Phụ lục IV
 *
 * Bốn ràng buộc, cả bốn đều kiểm được khi dựng trang. Mã văn bản phải có trong
 * tập dữ liệu. Tên thành phần phải nằm trong danh sách đóng bên dưới. Mỗi thành
 * phần chỉ được xuất hiện một lần. Và giá trị không được rỗng. Sai một điều là
 * bản dựng dừng lại, giống như phép kiểm từ ngữ của phần đối chiếu.
 */

/** Các thành phần của một trích dẫn, xếp từ rộng tới hẹp. */
const PARTS = ["phuluc", "chuong", "muc", "dieu", "khoan", "diem"] as const;

export type CitationPart = (typeof PARTS)[number];

/** Chuỗi trích dẫn như nó được viết trong tập dữ liệu. */
export type CitationRef = string;

export interface Citation {
  /** Mã văn bản được dẫn. */
  docId: string;
  /** Các thành phần đã chỉ ra, giữ nguyên thứ tự rộng tới hẹp. */
  parts: { part: CitationPart; value: string }[];
  /** Đúng khi trích dẫn chỉ trỏ tới cả văn bản, không chỉ tới điều khoản nào. */
  whole: boolean;
}

const PART_SET = new Set<string>(PARTS);

export class CitationError extends Error {}

/** Tách một chuỗi trích dẫn thành cấu trúc. Ném lỗi khi cú pháp sai. */
export function parseCitation(ref: CitationRef): Citation {
  const [docId, pinpoint] = ref.split("#");
  if (!docId) throw new CitationError(`Trích dẫn thiếu mã văn bản: "${ref}".`);
  if (pinpoint === undefined) return { docId, parts: [], whole: true };
  if (pinpoint.trim() === "") {
    throw new CitationError(`Trích dẫn có dấu # nhưng không chỉ ra điều khoản: "${ref}".`);
  }

  const seen = new Set<string>();
  const parts: Citation["parts"] = [];
  for (const chunk of pinpoint.split(".")) {
    const at = chunk.indexOf(":");
    if (at < 1) {
      throw new CitationError(
        `Thành phần "${chunk}" trong trích dẫn "${ref}" phải viết theo dạng tên:giá-trị.`,
      );
    }
    const part = chunk.slice(0, at);
    const value = chunk.slice(at + 1).trim();
    if (!PART_SET.has(part)) {
      throw new CitationError(
        `Trích dẫn "${ref}" dùng thành phần không có trong danh sách: "${part}". ` +
          `Chỉ nhận ${PARTS.join(", ")}.`,
      );
    }
    if (value === "") {
      throw new CitationError(`Thành phần "${part}" trong trích dẫn "${ref}" bỏ trống giá trị.`);
    }
    if (seen.has(part)) {
      throw new CitationError(`Trích dẫn "${ref}" lặp lại thành phần "${part}".`);
    }
    seen.add(part);
    parts.push({ part: part as CitationPart, value });
  }

  parts.sort((a, b) => PARTS.indexOf(a.part) - PARTS.indexOf(b.part));
  return { docId, parts, whole: false };
}

/** Văn bản được dẫn, hoặc undefined nếu mã không có trong tập dữ liệu. */
export function citedDoc(cite: Citation): LegalDoc | undefined {
  return documentsById.get(cite.docId);
}

const LABEL: Record<CitationPart, { vi: string; en: string }> = {
  phuluc: { vi: "Phụ lục", en: "Appendix" },
  chuong: { vi: "Chương", en: "Chapter" },
  muc: { vi: "Mục", en: "Section" },
  dieu: { vi: "Điều", en: "Article" },
  khoan: { vi: "khoản", en: "clause" },
  diem: { vi: "điểm", en: "point" },
};

/**
 * Phần chỉ chỗ, viết theo quy ước của từng thứ tiếng.
 *
 * Tiếng Việt đi từ hẹp ra rộng — "điểm a khoản 3 Điều 38" — vì đó là cách người
 * làm nghề đọc và viết. Tiếng Anh gộp số vào sau tên điều — "Article 38(3)(a)" —
 * vì chuỗi "point a of clause 3 of Article 38" dài mà không rõ hơn.
 */
export function formatPinpoint(cite: Citation, lang: Lang): string {
  if (cite.parts.length === 0) return "";
  const get = (p: CitationPart) => cite.parts.find((x) => x.part === p)?.value;

  if (lang === "vi") {
    return [...cite.parts]
      .reverse()
      .map(({ part, value }) => `${LABEL[part].vi} ${value}`)
      .join(" ");
  }

  const out: string[] = [];
  const outer = (["phuluc", "chuong", "muc"] as const)
    .map((p) => {
      const v = get(p);
      return v ? `${LABEL[p].en} ${v}` : null;
    })
    .filter((s): s is string => s !== null);
  out.push(...outer);

  const dieu = get("dieu");
  if (dieu) {
    const khoan = get("khoan");
    const diem = get("diem");
    out.push(
      `${LABEL.dieu.en} ${dieu}${khoan ? `(${khoan})` : ""}${diem ? `(${diem})` : ""}`,
    );
  } else {
    const khoan = get("khoan");
    const diem = get("diem");
    if (khoan) out.push(`${LABEL.khoan.en} ${khoan}`);
    if (diem) out.push(`${LABEL.diem.en} ${diem}`);
  }
  return out.join(", ");
}

/**
 * Trích dẫn đầy đủ, dạng dán được thẳng vào một bản ghi nhớ hay một bản luận cứ.
 *
 *     điểm a khoản 3 Điều 38 Luật Xây dựng (135/2025/QH15)
 *     Article 38(3)(a), Law on Construction (No. 135/2025/QH15)
 *
 * Số hiệu luôn có mặt trong ngoặc. Tên văn bản có thể trùng nhau giữa các đời
 * luật, số hiệu thì không, nên số hiệu là phần giữ cho trích dẫn không nhập nhằng.
 */
export function formatCitation(cite: Citation, lang: Lang): string {
  const doc = citedDoc(cite);
  const title = doc ? doc.title[lang] : cite.docId;
  const number = doc ? doc.number : "";
  const pin = formatPinpoint(cite, lang);

  if (lang === "vi") {
    const head = pin ? `${pin} ${title}` : title;
    return number ? `${head} (${number})` : head;
  }
  const tail = number ? `${title} (No. ${number})` : title;
  return pin ? `${pin}, ${tail}` : tail;
}

/** Nhãn ngắn dùng trong dòng căn cứ: số hiệu, kèm phần chỉ chỗ nếu có. */
export function formatShortCitation(cite: Citation, lang: Lang): string {
  const doc = citedDoc(cite);
  const number = doc ? doc.number : cite.docId;
  const pin = formatPinpoint(cite, lang);
  return pin ? `${number} · ${pin}` : number;
}

/**
 * Đường dẫn tới chỗ được dẫn.
 *
 * Trang chi tiết văn bản chưa chứa toàn văn, nên neo `#dieu-38` chưa trỏ tới
 * một mục có thật. Đường dẫn vì vậy dừng ở trang văn bản, và phần chỉ chỗ được
 * mang theo trong chuỗi truy vấn để khi trang có toàn văn thì chỉ cần đọc nó ra
 * mà không phải sửa lại chỗ gọi.
 */
export function citationHref(cite: Citation, lang: Lang): string {
  const base = `/${lang}/van-ban/${cite.docId}`;
  if (cite.whole) return base;
  const q = cite.parts.map(({ part, value }) => `${part}:${value}`).join(".");
  return `${base}?tai=${encodeURIComponent(q)}`;
}

/** Trích dẫn đầy đủ cho cả một văn bản, dùng ở nút sao chép trên trang chi tiết. */
export function citeDocument(doc: LegalDoc, lang: Lang): string {
  return formatCitation({ docId: doc.id, parts: [], whole: true }, lang);
}

/**
 * Soi toàn bộ chuỗi trích dẫn của một tập căn cứ.
 *
 * Trả về danh sách lỗi thay vì ném ngay, để phép kiểm ở `objectivity.ts` gom
 * được tất cả lỗi trong một lần chạy rồi báo một thể.
 */
export function checkCitation(ref: CitationRef, knownIds: ReadonlySet<string>): string | null {
  let cite: Citation;
  try {
    cite = parseCitation(ref);
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
  if (!knownIds.has(cite.docId)) {
    return `Trích dẫn trỏ tới bản ghi không có trong tập dữ liệu: "${cite.docId}".`;
  }
  return null;
}
