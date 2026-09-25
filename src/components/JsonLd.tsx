import { jsonLdString } from "@/lib/structured-data";

/**
 * Khối JSON-LD. Trình duyệt không chạy nội dung của thẻ này, nên nó không vướng
 * chính sách `script-src`; chỉ công cụ tìm kiếm đọc nó.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />
  );
}
