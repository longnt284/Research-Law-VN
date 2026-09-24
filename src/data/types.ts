/**
 * Kiểu dữ liệu cho bản đồ văn bản quy phạm pháp luật.
 *
 * Nguyên tắc: mỗi văn bản trong tập dữ liệu phải kèm nguồn đã tra cứu và ngày
 * tra cứu. Không có văn bản nào được đưa vào chỉ vì "nhớ là có".
 */

export type Lang = "vi" | "en";

/**
 * Một trích dẫn viết dưới dạng chuỗi. Bộ tách và bộ hiển thị nằm ở
 * `src/lib/citation.ts`; kiểu để ở đây để phần dữ liệu không phải nhập từ lớp lib.
 */
export type CitationRef = string;

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
  /**
   * Còn hiệu lực nhưng đã bị sửa đổi, bổ sung, hoặc hết hiệu lực một phần. Ứng với
   * nhãn "Hết hiệu lực một phần" của CSDL quốc gia về pháp luật: nhãn đó thường chỉ
   * nghĩa là một số điều đã bị văn bản sau sửa hoặc bãi bỏ.
   */
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
  | "thue"
  | "dat-dai"
  | "ppp";

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
  /**
   * Ngày tra cứu của riêng bản ghi này, định dạng ISO.
   *
   * Bỏ trống nghĩa là bản ghi thuộc đợt tra cứu gốc và lấy `VERIFIED_ON` của
   * tập dữ liệu. Ghi ngày ở từng bản ghi thay vì một hằng chung để lần bổ sung
   * sau không làm các bản ghi cũ trông như vừa được tra lại.
   */
  verifiedOn?: string;
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

/**
 * Loại thay đổi giữa hai văn bản.
 *
 * Danh sách đóng, và mỗi giá trị phải khẳng định được bằng cách đặt hai bản văn
 * cạnh nhau rồi đọc. Không có giá trị nào mang nghĩa đánh giá tốt hay xấu: đó là
 * việc của người đọc hồ sơ, không phải của tập dữ liệu.
 */
export type ChangeKind =
  /** Nội dung có ở văn bản sau, không có ở văn bản trước. */
  | "moi"
  /** Nội dung có ở văn bản trước, không còn ở văn bản sau. */
  | "bo"
  /** Cùng một vấn đề, phạm vi hoặc đối tượng áp dụng rộng hơn. */
  | "mo-rong"
  /** Cùng một vấn đề, phạm vi hoặc đối tượng áp dụng hẹp hơn. */
  | "thu-hep"
  /** Giữ nguyên nguyên tắc, quy định thêm chi tiết hoặc điều kiện. */
  | "chi-tiet-hoa"
  /** Đổi cơ quan, cấp hoặc chủ thể có thẩm quyền. */
  | "thay-tham-quyen"
  /** Đổi mốc thời gian, thời hạn hoặc trình tự thời gian. */
  | "thay-thoi-han"
  /** Quy định chuyển tiếp giữa hai văn bản. */
  | "chuyen-tiep"
  /** Nội dung tương đương, khác ở cách trình bày hoặc số điều. */
  | "giu-nguyen";

/**
 * Một điểm đối chiếu giữa hai văn bản.
 *
 * `before` và `after` là nội dung đọc được ở mỗi bên. `observation` là nhận định
 * khách quan: chỉ được mô tả chênh lệch nhìn thấy giữa hai bên, không suy đoán
 * hệ quả, không khuyến nghị, không đánh giá hơn kém. Ràng buộc này được kiểm tra
 * tự động khi dựng trang, xem `src/lib/objectivity.ts`.
 */
export interface ComparisonPoint {
  id: string;
  /** Vấn đề được đặt cạnh nhau, ví dụ "Mốc hiệu lực". */
  topic: Bilingual;
  kind: ChangeKind;
  before: Bilingual;
  after: Bilingual;
  observation: Bilingual;
  /**
   * Căn cứ của mỗi vế, để người đọc lần ngược về nguồn.
   *
   * Mỗi phần tử là một chuỗi trích dẫn: mã văn bản, kèm phần chỉ chỗ tới điều
   * khoản nếu biết được. Xem `src/lib/citation.ts` về cú pháp và phép kiểm.
   *
   *     "luat-xay-dung-2025"                    cả văn bản
   *     "luat-xay-dung-2025#dieu:38.khoan:3"    khoản 3 Điều 38
   */
  basis: { before: CitationRef[]; after: CitationRef[] };
  confidence: Confidence;
}

/**
 * Tập điểm đối chiếu do người biên soạn viết cho một cặp văn bản.
 *
 * Cặp văn bản thì suy ra từ quan hệ `replaces` và `amends` có sẵn trong tập dữ
 * liệu, không khai báo lại ở đây. Bản ghi này chỉ bổ sung phần nội dung mà máy
 * không tự đọc ra được.
 */
export interface ComparisonEntry {
  /** ID văn bản sau. */
  newId: string;
  /** ID văn bản trước. */
  oldId: string;
  /** Mức đối chiếu đã thực hiện được, nói rõ cho người đọc biết giới hạn. */
  scope: Bilingual;
  points: ComparisonPoint[];
}
