import type { Lang } from "@/data/types";
import type { ValidityEventKind, ValidityState } from "@/lib/validity";

/**
 * Chữ của phần hiệu lực theo ngày và chỉ mục điều khoản.
 *
 * Tách khỏi từ điển chung vì cả hai phần đều mới và đi cùng nhau: người sửa một
 * câu ở đây thường cần thấy các câu bên cạnh của cùng tính năng.
 */
export interface ValidityCopy {
  title: string;
  lede: string;
  events: Record<ValidityEventKind, string>;
  noDate: string;
  probeLabel: string;
  probeHint: string;
  state: Record<ValidityState, string>;
  amended: string;
  since: string;
  recorded: string;
  withParent: string;
  unknownWhy: string;
  listAsOf: string;
  listAsOfHint: string;
  listOnlyInForce: string;
  listClear: string;
  listSummary: (inForce: number, pending: number, expired: number, unknown: number) => string;
  articleTitle: string;
  articleHint: string;
  articleNone: (n: string) => string;
  articleSide: { before: string; after: string; both: string };
}

const vi: ValidityCopy = {
  title: "Diễn biến hiệu lực",
  lede: "Các mốc dưới đây đọc từ chính tập dữ liệu: ngày ban hành, ngày có hiệu lực, và ngày văn bản sửa đổi hoặc thay thế có hiệu lực. Văn bản sửa đổi không có trong tập dữ liệu thì không hiện ở đây, nên đây là phần tối thiểu đã biết chứ không phải lịch sử đầy đủ.",
  events: {
    issued: "Ban hành",
    effective: "Có hiệu lực",
    "amended-by": "Được sửa đổi, bổ sung bởi",
    "replaced-by": "Hết hiệu lực, được thay thế bởi",
    "lapsed-with": "Hết hiệu lực cùng văn bản được sửa đổi khi văn bản đó bị thay thế:",
    "expired-recorded":
      "Được ghi nhận là hết hiệu lực tại ngày tra cứu; ngày hết hiệu lực không có trong tập dữ liệu",
  },
  noDate: "chưa rõ ngày",
  probeLabel: "Tình trạng tại ngày",
  probeHint: "Chọn ngày ký hợp đồng, ngày xảy ra sự kiện hoặc ngày nộp hồ sơ.",
  state: {
    pending: "Chưa có hiệu lực",
    "in-force": "Đang có hiệu lực",
    expired: "Đã hết hiệu lực",
    unknown: "Chưa xác định được",
  },
  amended: "đã có văn bản sửa đổi",
  since: "từ",
  recorded: "theo ghi nhận tại ngày tra cứu",
  withParent: "hết hiệu lực cùng văn bản được sửa đổi",
  unknownWhy:
    "Tập dữ liệu biết văn bản đã hết hiệu lực ở ngày tra cứu nhưng không biết từ ngày nào, nên không kết luận cho ngày trước đó.",
  listAsOf: "Tình trạng tại ngày",
  listAsOfHint: "Để trống thì hiện tình trạng tại ngày tra cứu.",
  listOnlyInForce: "Chỉ văn bản đang có hiệu lực",
  listClear: "Bỏ ngày",
  listSummary: (a, p, e, u) =>
    `${a} đang có hiệu lực · ${p} chưa có hiệu lực · ${e} đã hết hiệu lực` +
    (u ? ` · ${u} chưa xác định được` : ""),
  articleTitle: "Điều khoản đã được đọc tới",
  articleHint:
    "Chỉ mục chỉ gồm những điều khoản người biên soạn đã đọc và dẫn trong phần đối chiếu.",
  articleNone: (n) =>
    `Chưa có chỗ nào trong tập dữ liệu dẫn tới Điều ${n}. Chỉ mục chỉ gồm những điều khoản đã được đọc khi đối chiếu.`,
  articleSide: { before: "vế trước", after: "vế sau", both: "cả hai vế" },
};

const en: ValidityCopy = {
  title: "Validity over time",
  lede: "These dates come from the dataset itself: issue, commencement, and the commencement of any amending or replacing instrument. Amending instruments that are not in the dataset do not appear, so this is the known minimum rather than a complete history.",
  events: {
    issued: "Issued",
    effective: "In force",
    "amended-by": "Amended and supplemented by",
    "replaced-by": "Ceased to have effect, replaced by",
    "lapsed-with": "Ceased to have effect together with the amended instrument when that was replaced:",
    "expired-recorded":
      "Recorded as no longer in force on the review date; the date it lapsed is not in the dataset",
  },
  noDate: "date unknown",
  probeLabel: "Status on a given date",
  probeHint: "Pick the date a contract was signed, an event occurred or a filing was made.",
  state: {
    pending: "Not yet in force",
    "in-force": "In force",
    expired: "No longer in force",
    unknown: "Cannot be determined",
  },
  amended: "amending instrument in force",
  since: "from",
  recorded: "as recorded on the review date",
  withParent: "lapsed with the amended instrument",
  unknownWhy:
    "The dataset knows the instrument had lapsed by the review date but not from when, so it draws no conclusion for earlier dates.",
  listAsOf: "Status on date",
  listAsOfHint: "Leave empty to show the status on the review date.",
  listOnlyInForce: "Only instruments in force",
  listClear: "Clear date",
  listSummary: (a, p, e, u) =>
    `${a} in force · ${p} not yet in force · ${e} no longer in force` +
    (u ? ` · ${u} undetermined` : ""),
  articleTitle: "Provisions already read",
  articleHint: "The index only lists provisions the editor has read and cited in the comparisons.",
  articleNone: (n) =>
    `Nothing in the dataset cites Article ${n} yet. The index only covers provisions read during comparison.`,
  articleSide: { before: "earlier side", after: "later side", both: "both sides" },
};

export function getValidityCopy(lang: Lang): ValidityCopy {
  return lang === "vi" ? vi : en;
}
