/**
 * Phần thuần của cơ chế hiệu lực theo ngày: không chạm tới tập dữ liệu, nên
 * thành phần chạy trên trình duyệt nhập được mà không kéo cả kho văn bản theo.
 */

export type ValidityState = "pending" | "in-force" | "expired" | "unknown";

/** Một đoạn thời gian mà trong đó tình trạng của văn bản không đổi. */
export interface ValiditySegment {
  /** Ngày bắt đầu đoạn; chuỗi rỗng cho đoạn trước mốc đầu tiên. */
  from: string;
  state: ValidityState;
  since?: string;
  amended?: boolean;
  recorded?: boolean;
  /** Hết hiệu lực cùng văn bản được sửa; `byId` khi đó là văn bản được sửa. */
  withParent?: boolean;
  byId?: string;
  byNumber?: string;
}

/** Đoạn áp dụng cho ngày `date`. */
export function segmentAt(segments: ValiditySegment[], date: string): ValiditySegment {
  let hit = segments[0];
  for (const s of segments) if (s.from && s.from <= date) hit = s;
  return hit;
}
