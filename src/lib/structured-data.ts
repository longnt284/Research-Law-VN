import { verifiedOnOf } from "@/data/documents";
import type { Lang, LegalDoc } from "@/data/types";
import { getDict } from "@/i18n/dictionary";
import { SITE_URL, pathFor } from "@/lib/site";

/**
 * Dữ liệu có cấu trúc (JSON-LD) cho công cụ tìm kiếm.
 *
 * Trang văn bản mô tả văn bản bằng kiểu `Legislation` của schema.org, nên máy
 * đọc được số hiệu, ngày ban hành, tình trạng hiệu lực và quan hệ sửa đổi, thay
 * thế mà không phải đoán từ chữ trên trang. Mọi giá trị lấy thẳng từ bản ghi; chỗ
 * bản ghi không nói được điều mà một thuộc tính đòi hỏi thì thuộc tính đó bị bỏ
 * trống, không làm tròn.
 */

/** Mã định danh của một văn bản, dùng chung cho cả hai thứ tiếng. */
function legislationId(docId: string): string {
  // Bản tiếng Việt là bản gốc và là `x-default` của trang, nên mã định danh
  // trỏ về đó: cùng một văn bản không mang hai mã chỉ vì được mô tả bằng hai
  // thứ tiếng.
  return `${SITE_URL}${pathFor("vi", `/van-ban/${docId}`)}#legislation`;
}

/**
 * Tình trạng hiệu lực theo bảng `LegalForceStatus` của schema.org.
 *
 * `amended` không ánh xạ: trong tập dữ liệu nó gộp hai trường hợp mà schema.org
 * tách riêng — còn hiệu lực nhưng đã được sửa đổi (`InForce`), và hết hiệu lực
 * một phần (`PartiallyInForce`). Bản ghi không nói là trường hợp nào, nên chọn
 * một bên là nói quá điều đã biết.
 */
const LEGAL_FORCE: Partial<Record<LegalDoc["status"], string>> = {
  active: "https://schema.org/InForce",
  pending: "https://schema.org/NotInForce",
  expired: "https://schema.org/NotInForce",
};

/** Trang gốc của văn bản trên CSDL quốc gia về pháp luật. */
const VBPL_DETAIL = "https://vbpl.vn/van-ban/chi-tiet/";

/** Điều ước và văn bản do cơ quan trong nước ban hành khác nhau ở nơi ban hành. */
const DOMESTIC: ReadonlySet<LegalDoc["type"]> = new Set([
  "bo-luat",
  "luat",
  "nghi-quyet",
  "nghi-dinh",
  "quyet-dinh",
  "thong-tu",
  "vbhn",
]);

const ref = (d: LegalDoc) => ({
  "@type": "Legislation",
  "@id": legislationId(d.id),
  legislationIdentifier: d.number,
});

/**
 * Mô tả `Legislation` của một văn bản.
 *
 * Quy tắc tố tụng của một trung tâm trọng tài không phải văn bản pháp luật,
 * nên không được mô tả bằng kiểu này.
 */
export function legislationLd(
  doc: LegalDoc,
  lang: Lang,
  byId: ReadonlyMap<string, LegalDoc>,
): Record<string, unknown> | null {
  if (doc.type === "quy-tac") return null;
  const t = getDict(lang);
  const force = LEGAL_FORCE[doc.status];
  const amends = (doc.amends ?? []).map((id) => byId.get(id)).filter((d) => d !== undefined);
  const replaces = (doc.replaces ?? []).map((id) => byId.get(id)).filter((d) => d !== undefined);
  const sameAs = doc.sources.filter((s) => s.startsWith(VBPL_DETAIL));

  return {
    "@context": "https://schema.org",
    "@type": "Legislation",
    "@id": legislationId(doc.id),
    url: `${SITE_URL}${pathFor(lang, `/van-ban/${doc.id}`)}`,
    name: doc.title[lang],
    description: doc.summary[lang],
    legislationIdentifier: doc.number,
    legislationType: t.type[doc.type],
    ...(doc.issuedOn ? { legislationDate: doc.issuedOn } : {}),
    ...(DOMESTIC.has(doc.type) ? { legislationJurisdiction: "VN" } : {}),
    // Tình trạng chỉ đúng tại ngày tra cứu của bản ghi, và schema.org có đúng
    // một thuộc tính để nói điều đó.
    ...(force
      ? { legislationLegalForce: force, legislationDateVersion: verifiedOnOf(doc) }
      : {}),
    ...(amends.length ? { legislationAmends: amends.map(ref) } : {}),
    // Theo schema.org, `legislationChanges` bao gồm cả sửa đổi lẫn thay thế;
    // thay thế không có thuộc tính riêng nên dùng thuộc tính chung này.
    ...(replaces.length ? { legislationChanges: replaces.map(ref) } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/** Dòng vị trí của trang, theo kiểu `BreadcrumbList`. */
export function breadcrumbLd(items: { name: string; path: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}

/**
 * Chuỗi JSON đặt được vào trong thẻ `<script>`.
 *
 * Tên và tóm tắt văn bản là chữ tự do; một chuỗi có "</script>" trong đó sẽ
 * đóng thẻ sớm. Thoát dấu `<` thì trình duyệt không bao giờ thấy thẻ đóng, còn
 * bộ đọc JSON vẫn đọc ra đúng ký tự.
 */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
