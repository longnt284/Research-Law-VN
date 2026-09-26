/**
 * Dạng gửi xuống trình duyệt của chỉ mục tìm kiếm.
 *
 * Tệp này chỉ khai báo kiểu, không nhập tập dữ liệu, nên thành phần chạy trên
 * trình duyệt dùng được mà không kéo cả kho văn bản theo. Chỉ mục thật được dựng
 * lúc `next build` ở `src/lib/search-index.ts` và phục vụ như một tệp JSON tĩnh.
 */

import type { DocStatus, DocType, DomainId } from "@/data/types";
import type { ArticleEntry } from "@/lib/article-query";
import type { ValiditySegment } from "@/lib/validity-segment";

/** Tham chiếu tới một văn bản khác: mã và số hiệu. */
export type DocRef = [id: string, number: string];

export interface IndexDoc {
  id: string;
  /** Số hiệu. */
  n: string;
  ty: DocType;
  st: DocStatus;
  /** Tên theo ngôn ngữ của chỉ mục. */
  t: string;
  /** Tên ở ngôn ngữ còn lại, chỉ để tìm. */
  o: string;
  /** Tóm tắt, chỉ để tìm theo từ khóa không nằm trong tên. */
  s: string;
  /** Ngày ban hành, ngày có hiệu lực, ngày tra cứu. Chuỗi rỗng khi chưa có. */
  iss: string;
  eff: string;
  ver: string;
  /** `true` khi bản ghi còn chi tiết chưa đối chiếu được với nguồn chính thống. */
  cc: boolean;
  dom: DomainId[];
  /** Các đoạn hiệu lực đã tính sẵn, cho câu hỏi "tại ngày X". */
  seg: ValiditySegment[];
  /** Văn bản này thay thế. */
  rep: DocRef[];
  /** Văn bản thay thế văn bản này. */
  by: DocRef[];
  /** Văn bản sửa đổi, bổ sung văn bản này. */
  amBy: DocRef[];
  /** Văn bản mà văn bản này sửa đổi, bổ sung. */
  am: DocRef[];
  /** Văn bản cấp trên mà văn bản này hướng dẫn. */
  up: DocRef[];
  /** Số văn bản hướng dẫn văn bản này. */
  kids: number;
  /** Bản đối chiếu đầu tiên có văn bản này, nếu có. */
  pair?: string;
  /** Trang toàn văn có thứ hạng cao nhất, nếu có. */
  ft?: string;
}

export interface IndexDomain {
  id: DomainId;
  label: string;
  /** Tên ở ngôn ngữ còn lại, chỉ để tìm. */
  alt: string;
  hue: number;
  count: number;
}

export interface SearchIndex {
  lang: "vi" | "en";
  /** Ngày tra cứu gần nhất của cả kho. */
  verified: string;
  docs: IndexDoc[];
  articles: ArticleEntry[];
  domains: IndexDomain[];
}
