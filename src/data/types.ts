/**
 * Kiểu dữ liệu cho bản đồ văn bản quy phạm pháp luật.
 *
 * Nguyên tắc: mỗi văn bản trong tập dữ liệu phải kèm nguồn đã tra cứu và ngày
 * tra cứu. Không có văn bản nào được đưa vào chỉ vì "nhớ là có".
 */

export type Lang = "vi" | "en";

/** Bản dịch song ngữ bắt buộc cho mọi chuỗi hiển thị. */
export interface Bilingual {
  vi: string;
  en: string;
}

/** Loại văn bản, xếp theo thứ bậc hiệu lực pháp lý. */
export type DocType =
  | "bo-luat"
  | "luat"
  | "nghi-quyet"
  | "nghi-dinh"
  | "quyet-dinh"
  | "thong-tu"
  | "vbhn"
  | "dieu-uoc"
  | "quy-tac";

/** Tình trạng hiệu lực tại thời điểm tra cứu. */
export type DocStatus =
  /** Còn hiệu lực toàn bộ. */
  | "active"
  /** Còn hiệu lực nhưng đã bị sửa đổi, bổ sung. */
  | "amended"
  /** Đã được thông qua, chưa tới ngày có hiệu lực. */
  | "pending"
  /** Hết hiệu lực toàn bộ hoặc phần lớn. */
  | "expired";

export type DomainId =
  | "xay-dung"
  | "nang-luong"
  | "hop-dong"
  | "to-tung"
  | "doanh-nghiep"
  | "dau-tu"
  | "lao-dong"
  | "thue";

/**
 * Mức độ xác minh của bản ghi.
 *
 * `verified` — số hiệu, ngày ban hành và ngày hiệu lực đều khớp giữa các nguồn
 * đã tra trong phiên.
 *
 * `cross-check` — đã tra được số hiệu và nội dung chính, nhưng còn ít nhất một
 * chi tiết (thường là ngày ban hành chính xác) chưa đối chiếu được với nguồn
 * Tier 1. Giao diện hiển thị cảnh báo cho người đọc ở những bản ghi này.
 */
export type Confidence = "verified" | "cross-check";

export interface LegalDoc {
  id: string;
  /** Số hiệu đầy đủ, ví dụ "135/2025/QH15". */
  number: string;
  type: DocType;
  domains: DomainId[];
  /** Ngày ban hành, định dạng ISO. Chuỗi rỗng nghĩa là chưa xác minh được. */
  issuedOn: string;
  /** Ngày có hiệu lực, định dạng ISO. */
  effectiveOn: string;
  status: DocStatus;
  title: Bilingual;
  /** Hai tới bốn câu văn xuôi, không dùng gạch đầu dòng. */
  summary: Bilingual;
  /** Ghi chú về hiệu lực từng phần, điều khoản chuyển tiếp, ngoại lệ. */
  note?: Bilingual;
  /** ID các văn bản mà văn bản này thay thế. */
  replaces?: string[];
  /** ID các văn bản mà văn bản này sửa đổi, bổ sung. */
  amends?: string[];
  /** ID văn bản cấp trên mà văn bản này quy định chi tiết hoặc hướng dẫn. */
  guides?: string[];
  /** URL đã thực sự mở trong phiên tra cứu. */
  sources: string[];
  confidence: Confidence;
}

/** Loại quan hệ giữa hai văn bản, dùng để vẽ cạnh trên bản đồ. */
export type RelationKind = "guides" | "amends" | "replaces";

export interface Relation {
  from: string;
  to: string;
  kind: RelationKind;
}

export interface Domain {
  id: DomainId;
  label: Bilingual;
  blurb: Bilingual;
  /** Màu nhận diện, dùng chung cho node trên bản đồ và nhãn lĩnh vực. */
  hue: number;
}
