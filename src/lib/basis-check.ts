/**
 * Soát căn cứ pháp lý: phần thuần, chạy được trên trình duyệt.
 *
 * Người soạn hợp đồng, công văn hay đơn khởi kiện thường chép lại khối "Căn
 * cứ…" từ một văn bản cũ. Khối đó lỗi thời lặng lẽ: luật bị thay, nghị định hết
 * hiệu lực cùng luật mà nó hướng dẫn, và không có gì trên trang giấy báo điều
 * đó. Lớp này đọc số hiệu ra khỏi một đoạn văn bản người đọc dán vào, rồi để
 * thành phần giao diện tra từng số hiệu vào tập dữ liệu tại một ngày.
 *
 * Nó không nhập tập dữ liệu. Trang dựng sẵn các dòng tra cứu ở máy chủ và gửi
 * xuống, nên văn bản người đọc dán vào chỉ đi qua các hàm ở đây, trong trình
 * duyệt, và không rời máy.
 *
 * Giới hạn cố ý: chỉ nhận diện số hiệu. Một dòng nêu tên văn bản mà không có số
 * hiệu ("Căn cứ Luật Thương mại") không được đoán ra văn bản nào, vì tên văn
 * bản lặp lại qua các đời luật còn số hiệu thì không. Dòng như thế được báo lại
 * cho người đọc thay vì bị bỏ qua im lặng.
 */

import { segmentAt, type ValiditySegment } from "@/lib/validity-segment";

/** Cách viết khác nhau của cùng một dấu gạch trong số hiệu. */
const DASHES = /[\u2010-\u2015\u2212]/g;

/**
 * Khoá so khớp của một số hiệu.
 *
 * Văn bản chép từ nhiều nguồn mang nhiều cách viết cho cùng một số hiệu: chữ Đ
 * gõ thành chữ Ð của tiếng Iceland (hai ký tự trông y hệt nhau), gạch nối thành
 * gạch ngang, "06/2021" thành "6/2021", chữ viết thường, khoảng trắng quanh dấu
 * gạch chéo. Khoá bỏ hết các khác biệt đó, nên "6/2021/TT-BXD" và
 * "06/2021/TT–BXD" là cùng một văn bản.
 */
export function numberKey(raw: string): string {
  const s = raw
    .normalize("NFC")
    .replace(DASHES, "-")
    .replace(/[ĐđÐð]/g, "D")
    .replace(/\s+/g, "")
    .toUpperCase();
  return s.replace(/^0+(?=\d)/, "");
}

/** Phần đầu của số hiệu dùng để gợi ý số hiệu gần giống: số, năm và nhóm cơ quan. */
function stem(key: string): string | null {
  const m = key.match(/^(\d+)\/(?:(\d{4})\/)?([A-Z]+)/);
  if (!m) return null;
  return `${m[1]}/${m[2] ?? ""}/${m[3]}`;
}

/**
 * Số hiệu có năm, ví dụ "135/2025/QH15", "15/2021/NĐ-CP", "06/2021/TT-BXD".
 * Số hiệu không có năm phải có dấu gạch và phần chữ từ hai ký tự trở lên, ví
 * dụ "768/QĐ-TTg", "74/VBHN-VPQH": thiếu điều kiện đó thì một cụm như "1/A"
 * cũng thành số hiệu.
 *
 * Dấu gạch trong số hiệu không có khoảng trắng hai bên. Cho phép khoảng trắng
 * thì dòng "50/2014/QH13 - Luật Xây dựng" bị đọc thành số hiệu "50/2014/QH13-Luật".
 *
 * Nhóm đầu bắt ký tự đứng trước để loại số hiệu dính liền một chữ số hay dấu
 * gạch chéo khác, thay cho phép nhìn lùi mà một số trình duyệt cũ chưa đọc được.
 */
const L = "A-Za-zĐđÐð";
const DASH = "[-\u2010-\u2015\u2212]";
const NUMBER = new RegExp(
  `(^|[^\\d/${L}])` +
    `(\\d{1,4}\\s*\\/\\s*\\d{4}\\s*\\/\\s*[${L}][${L}\\d]*(?:${DASH}[${L}][${L}\\d]*)*` +
    `|\\d{1,4}\\s*\\/\\s*[${L}]{2,}(?:${DASH}[${L}][${L}\\d]*)+)`,
  "g",
);

/**
 * Số của chính hợp đồng ("Số: 01/2026/HĐXD") có cùng hình dạng với số hiệu văn
 * bản, nhưng không phải căn cứ pháp lý. Theo thể thức văn bản hành chính, phần
 * sau năm bắt đầu bằng chữ viết tắt tên loại văn bản, và "HĐ" là hợp đồng; không
 * loại văn bản quy phạm nào mang chữ viết tắt đó.
 */
const CONTRACT = /^\d+\/(?:\d{4}\/)?HD/;

/** Từ gọi tên loại văn bản, viết không dấu, để nhận ra dòng nhắc tới văn bản mà thiếu số hiệu. */
const DOC_WORD =
  /\b(bo luat|luat|nghi dinh|thong tu|quyet dinh|nghi quyet|phap lenh|cong uoc|code|law|decree|circular|decision|resolution|ordinance|convention)\b/;

/** Bỏ dấu tiếng Việt và viết thường, dùng cho phép so chuỗi không phân biệt dấu. */
export function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐÐð]/g, "d")
    .toLowerCase();
}

export interface NumberHit {
  /** Số hiệu như người đọc đã viết, đã gọn khoảng trắng. */
  raw: string;
  key: string;
  /** Dòng đầu tiên có số hiệu này, đếm từ 1. */
  line: number;
}

export interface Extraction {
  /** Số hiệu theo thứ tự xuất hiện, mỗi số hiệu một lần. */
  hits: NumberHit[];
  /** Dòng có vẻ nhắc tới một văn bản nhưng không có số hiệu nào nhận ra được. */
  unnumbered: { line: number; text: string }[];
}

/**
 * Đọc số hiệu ra khỏi một đoạn văn bản.
 *
 * `named` là các số hiệu không theo khuôn số/năm/cơ quan, như "CISG 1980": chúng
 * chỉ được nhận khi xuất hiện nguyên văn.
 */
export function extractNumbers(text: string, named: readonly string[] = []): Extraction {
  const hits: NumberHit[] = [];
  const seen = new Set<string>();
  const unnumbered: Extraction["unnumbered"] = [];
  const lines = text.normalize("NFC").split(/\r?\n/);

  lines.forEach((lineText, i) => {
    let found = false;
    for (const m of lineText.matchAll(NUMBER)) {
      found = true;
      const raw = m[2].replace(/\s+/g, "");
      const key = numberKey(raw);
      if (CONTRACT.test(key) || seen.has(key)) continue;
      seen.add(key);
      hits.push({ raw, key, line: i + 1 });
    }
    const folded = fold(lineText);
    for (const name of named) {
      if (!folded.includes(fold(name))) continue;
      found = true;
      const key = numberKey(name);
      if (seen.has(key)) continue;
      seen.add(key);
      hits.push({ raw: name, key, line: i + 1 });
    }
    // "Luật sư" không phải tên một văn bản.
    const words = folded.replace(/\bluat su\b/g, " ");
    if (!found && DOC_WORD.test(words)) {
      unnumbered.push({ line: i + 1, text: lineText.trim() });
    }
  });

  return { hits, unnumbered };
}

/**
 * Số hiệu trong tập dữ liệu gần giống một số hiệu không tìm thấy: cùng số, cùng
 * năm, cùng nhóm cơ quan ban hành, khác phần còn lại. Hay gặp nhất là gõ sai
 * số khóa Quốc hội ("QH14" thay cho "QH13"). Hàm chỉ gợi ý, không kết luận số
 * hiệu người đọc gõ là sai: văn bản đó có thể có thật mà nằm ngoài tập dữ liệu.
 */
export function nearKeys(key: string, known: Iterable<string>): string[] {
  const s = stem(key);
  if (!s) return [];
  const out: string[] = [];
  for (const k of known) if (k !== key && stem(k) === s) out.push(k);
  return out;
}

/**
 * Một văn bản của tập dữ liệu, rút gọn cho việc soát căn cứ.
 *
 * Dựng sẵn ở máy chủ: trình duyệt nhận các đoạn hiệu lực đã tính (xem
 * `validitySegments`) chứ không nhận cả kho văn bản cùng phép suy luận quan hệ.
 */
export interface BasisRow {
  id: string;
  number: string;
  key: string;
  /** Tên loại văn bản theo ngôn ngữ trang. */
  type: string;
  title: string;
  crossCheck: boolean;
  /**
   * Bản ghi có lưu ý về hiệu lực: hiệu lực từng phần, quy định chuyển tiếp, hoặc
   * hai nguồn nhà nước ghi khác nhau. Phép soát không đọc được lưu ý đó, nên
   * chỉ báo cho người đọc biết mà mở trang văn bản.
   */
  hasNote: boolean;
  segments: ValiditySegment[];
  /** Văn bản sửa đổi, bổ sung văn bản này, xếp theo ngày có hiệu lực. */
  amenders: { id: string; number: string; from: string }[];
}

export interface ChainLink {
  row: BasisRow;
  /** Ngày văn bản đứng trước trong chuỗi hết hiệu lực. */
  since: string;
  /**
   * Văn bản đứng trước là văn bản sửa đổi, hết hiệu lực cùng văn bản mà nó sửa;
   * `row` khi đó là văn bản được sửa chứ không phải văn bản thay thế.
   */
  withParent?: boolean;
}

/**
 * Chuỗi thay thế tính từ một văn bản đã hết hiệu lực tại ngày `date`.
 *
 * Luật 2005 bị luật 2014 thay, luật 2014 lại bị luật 2025 thay: người đọc cần
 * biết văn bản đang có hiệu lực ở cuối chuỗi, không chỉ mắt kế tiếp. Chuỗi chỉ
 * đi theo quan hệ thay thế ghi trong tập dữ liệu, dừng ở văn bản đầu tiên không
 * còn bị thay tại ngày đó. Văn bản sửa đổi hết hiệu lực cùng văn bản mà nó sửa
 * thì chuỗi đi tiếp từ văn bản được sửa.
 */
export function replacementChain(
  start: BasisRow,
  date: string,
  byId: ReadonlyMap<string, BasisRow>,
): ChainLink[] {
  const out: ChainLink[] = [];
  const seen = new Set([start.id]);
  let current = start;
  // Tập dữ liệu không có chuỗi nào dài tới mười mắt; giới hạn chỉ để một quan hệ
  // vòng lỡ lọt qua cổng chặn không treo được trình duyệt.
  for (let i = 0; i < 10; i++) {
    const seg = segmentAt(current.segments, date);
    if (seg.state !== "expired" || !seg.byId || seg.recorded) break;
    const next = byId.get(seg.byId);
    if (!next || seen.has(next.id)) break;
    seen.add(next.id);
    // Hết hiệu lực cùng văn bản được sửa: văn bản kế tiếp là bên được sửa, và
    // ngày của mắt này là ngày bên đó bị thay.
    out.push({ row: next, since: seg.since ?? "", withParent: seg.withParent });
    current = next;
  }
  return out;
}
