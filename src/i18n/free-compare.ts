import type { Lang } from "@/data/types";

/** Lời của trang so sánh hai văn bản tự chọn. */
export interface FreeCompareCopy {
  title: string;
  lede: string;
  eyebrow: string;
  pickA: string;
  pickB: string;
  pickPlaceholder: string;
  swap: string;
  clear: string;
  date: string;
  dateHint: string;
  empty: string;
  same: string;
  factTitle: string;
  factHint: string;
  statusAt: (date: string) => string;
  row: {
    type: string;
    status: string;
    issuedOn: string;
    effectiveOn: string;
    verifiedOn: string;
    domains: string;
    confidence: string;
  };
  gap: string;
  pathTitle: string;
  pathNone: string;
  pathHint: string;
  edge: { guides: string; amends: string; replaces: string };
  curated: (n: number) => string;
  pairLink: string;
  noObservation: string;
  diffTitle: string;
  share: string;
  shared: string;
}

const vi: FreeCompareCopy = {
  title: "So sánh hai văn bản",
  lede: "Chọn hai văn bản bất kỳ trong tập dữ liệu. Trang đặt dữ kiện của chúng cạnh nhau, tô đậm dòng khác nhau, cho biết tình trạng của mỗi văn bản tại một ngày và chuỗi quan hệ nối hai văn bản nếu có.",
  eyebrow: "Đối chiếu tự chọn",
  pickA: "Văn bản thứ nhất",
  pickB: "Văn bản thứ hai",
  pickPlaceholder: "Gõ số hiệu hoặc tên văn bản",
  swap: "Đổi chỗ",
  clear: "Bỏ chọn",
  date: "Tình trạng tại ngày",
  dateHint: "Để trống thì dùng tình trạng tại ngày tra cứu.",
  empty: "Chọn đủ hai văn bản để xem bảng so sánh.",
  same: "Hai ô đang chọn cùng một văn bản.",
  factTitle: "Dữ kiện đặt cạnh nhau",
  factHint: "Đọc thẳng từ hai bản ghi, không qua bước diễn giải nào. Dòng khác nhau in đậm.",
  statusAt: (d) => `Tình trạng tại ${d}`,
  row: {
    type: "Loại văn bản",
    status: "Tình trạng tại ngày tra cứu",
    issuedOn: "Ngày ban hành",
    effectiveOn: "Ngày có hiệu lực",
    verifiedOn: "Ngày tra cứu",
    domains: "Lĩnh vực",
    confidence: "Mức xác minh",
  },
  gap: "Khoảng cách giữa hai ngày có hiệu lực",
  pathTitle: "Chuỗi quan hệ nối hai văn bản",
  pathNone: "Tập dữ liệu không ghi chuỗi quan hệ nào nối hai văn bản này.",
  pathHint: "Chuỗi ngắn nhất đi qua các quan hệ đã ghi, không tính chiều. Mỗi bước nói rõ văn bản nào tác động lên văn bản nào.",
  edge: {
    guides: "quy định chi tiết",
    amends: "sửa đổi, bổ sung",
    replaces: "thay thế",
  },
  curated: (n) => `${n} điểm đối chiếu nội dung, dẫn tới từng điều, khoản`,
  pairLink: "Mở bản đối chiếu của cặp này",
  noObservation:
    "Nhận định của người biên soạn chỉ có ở cặp văn bản thay thế hoặc sửa đổi nhau, nơi hai bên nói về cùng một quy định. Với hai văn bản bất kỳ, trang chỉ đặt dữ kiện cạnh nhau.",
  diffTitle: "So sánh câu chữ",
  share: "Sao chép liên kết so sánh",
  shared: "Đã sao chép liên kết",
};

const en: FreeCompareCopy = {
  title: "Compare two instruments",
  lede: "Pick any two instruments in the dataset. The page sets their facts side by side, sets the rows that differ in bold, gives each instrument's status on a chosen date and the chain of relations that links the two, if there is one.",
  eyebrow: "Free comparison",
  pickA: "First instrument",
  pickB: "Second instrument",
  pickPlaceholder: "Type a number or a title",
  swap: "Swap",
  clear: "Clear",
  date: "Status on date",
  dateHint: "Leave empty to use the status on the review date.",
  empty: "Pick two instruments to see the comparison.",
  same: "Both boxes hold the same instrument.",
  factTitle: "Facts side by side",
  factHint: "Read straight off the two records, with no interpretive step. Rows that differ are set in bold.",
  statusAt: (d) => `Status on ${d}`,
  row: {
    type: "Instrument type",
    status: "Status on the review date",
    issuedOn: "Date of issue",
    effectiveOn: "In force from",
    verifiedOn: "Review date",
    domains: "Domains",
    confidence: "Verification",
  },
  gap: "Time between the two commencement dates",
  pathTitle: "Chain of relations between the two",
  pathNone: "The dataset records no chain of relations linking these two instruments.",
  pathHint: "The shortest chain through the recorded relations, in either direction. Each step says which instrument acts on which.",
  edge: {
    guides: "details",
    amends: "amends",
    replaces: "replaces",
  },
  curated: (n) => `${n} content comparison points, cited to the article and clause`,
  pairLink: "Open this pair's comparison",
  noObservation:
    "Editorial observations exist only for pairs where one instrument replaces or amends the other and both speak to the same rule. For any two instruments, the page only sets the facts side by side.",
  diffTitle: "Wording comparison",
  share: "Copy the comparison link",
  shared: "Link copied",
};

export function getFreeCompareCopy(lang: Lang): FreeCompareCopy {
  return lang === "vi" ? vi : en;
}
