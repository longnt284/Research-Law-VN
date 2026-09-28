import { documents, LATEST_VERIFIED_ON, verifiedOnOf } from "@/data/documents";
import type { Bilingual, Confidence, DocStatus, DocType, LegalDoc } from "@/data/types";
import { describeSources, primarySource } from "@/lib/sources";
import { amenders, replacers, validitySegments } from "@/lib/validity";
import type { ValiditySegment } from "@/lib/validity-segment";

/**
 * Nguồn dữ liệu công khai cho trang khác đọc: `/api/v1/documents.json`.
 *
 * Người đọc đầu tiên là website hãng luật LHPT, trang lấy tình trạng hiệu lực
 * của các văn bản nó giới thiệu từ đây thay vì tự ghi tay một bản thứ hai. Tệp
 * dựng lúc `next build` như chỉ mục tìm kiếm, nên không có máy chủ nào phải
 * chạy để phục vụ nó.
 *
 * Đây là một hợp đồng với bên ngoài. Thêm trường thì giữ nguyên `FEED_SCHEMA`;
 * đổi nghĩa hay bỏ một trường thì lên phiên bản (`@2`) và phục vụ song song ở
 * đường dẫn mới, để trang đang đọc bản cũ không vỡ trong lúc chưa kịp sửa.
 */
export const FEED_SCHEMA = "lex-lineage/documents@1";

/** Tham chiếu tới một văn bản khác trong cùng nguồn dữ liệu. */
export interface FeedRef {
  id: string;
  number: string;
}

export interface FeedDoc {
  id: string;
  number: string;
  type: DocType;
  /** Tình trạng tại ngày tra cứu `verifiedOn`. */
  status: DocStatus;
  title: Bilingual;
  /** Ngày ISO; chuỗi rỗng khi chưa xác minh được. */
  issuedOn: string;
  effectiveOn: string;
  verifiedOn: string;
  confidence: Confidence;
  /**
   * Các đoạn hiệu lực tính sẵn, cùng dạng trang văn bản dùng. Đọc đoạn cuối cùng
   * có `from` không lớn hơn ngày cần hỏi (xem `segmentAt`), nên bên đọc tính được
   * tình trạng tại hôm nay mà không phải chờ lần đồng bộ sau.
   */
  segments: ValiditySegment[];
  /** Văn bản thay thế văn bản này, sớm nhất trước. */
  replacedBy: FeedRef[];
  /** Văn bản sửa đổi, bổ sung văn bản này, sớm nhất trước. */
  amendedBy: FeedRef[];
  /** Trang toàn văn có thứ hạng cao nhất, nếu bản ghi có. */
  fullText?: string;
  /** Đường dẫn trang văn bản, tương đối với gốc của Lex & Lineage. */
  path: Bilingual;
}

export interface Feed {
  schema: typeof FEED_SCHEMA;
  /** Ngày tra cứu gần nhất của cả kho. */
  verifiedOn: string;
  count: number;
  docs: FeedDoc[];
}

const ref = (d: LegalDoc): FeedRef => ({ id: d.id, number: d.number });

export function buildFeed(): Feed {
  const docs = documents.map((d): FeedDoc => {
    const ft = primarySource(describeSources(d.sources));
    return {
      id: d.id,
      number: d.number,
      type: d.type,
      status: d.status,
      title: d.title,
      issuedOn: d.issuedOn,
      effectiveOn: d.effectiveOn,
      verifiedOn: verifiedOnOf(d),
      confidence: d.confidence,
      segments: validitySegments(d),
      replacedBy: replacers(d).map(ref),
      amendedBy: amenders(d).map(ref),
      ...(ft ? { fullText: ft.url } : {}),
      path: { vi: `/vi/van-ban/${d.id}`, en: `/en/van-ban/${d.id}` },
    };
  });
  return { schema: FEED_SCHEMA, verifiedOn: LATEST_VERIFIED_ON, count: docs.length, docs };
}
