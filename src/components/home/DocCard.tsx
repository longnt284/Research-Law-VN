import { domains } from "@/data/documents";
import type { Lang, LegalDoc, RelationKind } from "@/data/types";
import { getDict } from "@/i18n/dictionary";
import { getHome } from "@/i18n/home";
import { yearOf } from "@/lib/corpus";

/**
 * Thẻ văn bản và đường nối giữa hai thẻ, dùng ở khối "Ba mối quan hệ" của
 * trang chủ.
 *
 * Cả hai là thành phần máy chủ thuần: hình nằm sẵn trong HTML đầu tiên, không
 * chờ JavaScript. Đường nối dùng đúng ba kiểu nét của hình gia phả — liền cho
 * quy định chi tiết, đứt cho sửa đổi, chấm đỏ cho thay thế — nên người đọc học
 * một bộ ký hiệu và gặp lại nó ở mọi hình.
 */

const hueOf = (doc: LegalDoc) => domains.find((d) => d.id === doc.domains[0])?.hue ?? 40;

/**
 * Đường nối giữa hai thẻ.
 *
 * Loại quan hệ nói bằng ba cách cùng lúc — kiểu nét, nhãn chữ và câu đầy đủ
 * trong `title` — để người không phân biệt được màu, hoặc in trang ra đen
 * trắng, vẫn đọc được. Mũi tên chỉ vào văn bản bị tác động.
 */
export function RelationTie({
  kind,
  sentence,
  lang,
}: {
  kind: RelationKind;
  /** Câu đầy đủ, ví dụ "135/2025/QH15 thay thế 50/2014/QH13". */
  sentence: string;
  lang: Lang;
}) {
  const h = getHome(lang);
  return (
    <span className={`tie tie-${kind}`} title={sentence}>
      <svg className="tie-line" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M100 6H8" />
        <polygon points="1,6 11,1 11,11" />
      </svg>
      {/* Hai mũi tên, một cho hàng ngang và một cho khi thẻ xếp dọc trên màn
          hẹp; CSS chỉ hiện đúng một. Mũi tên luôn chỉ vào văn bản bị tác động. */}
      <span className="tie-label">
        <span className="arrow-h">← </span>
        <span className="arrow-v">↑ </span>
        {h.linkLabel[kind]}
      </span>
    </span>
  );
}

/**
 * Thẻ văn bản: một tờ giấy thu nhỏ.
 *
 * Mép trái mang màu lĩnh vực, góc trên gấp lại như một trang in, và văn bản
 * không còn áp dụng nguyên trạng mang một con dấu. Con dấu dùng cùng bộ chữ với
 * trang chi tiết, nên người đọc không phải học thêm một bộ ký hiệu nào.
 */
export function DocCard({ doc, lang }: { doc: LegalDoc; lang: Lang }) {
  const t = getDict(lang);
  const h = getHome(lang);
  const year = yearOf(doc);
  const stamp =
    doc.status === "expired"
      ? h.stamp.expired
      : doc.status === "pending"
        ? h.stamp.pending
        : doc.status === "amended"
          ? h.stamp.amended
          : null;

  return (
    <a
      href={`/${lang}/van-ban/${doc.id}`}
      className={`doc-card is-${doc.status}`}
      style={{ "--hue": hueOf(doc) } as React.CSSProperties}
    >
      <span className="doc-card-head">
        <span className="doc-card-type">{t.type[doc.type]}</span>
        {year > 0 && <span className="doc-card-year tnum">{year}</span>}
      </span>
      <span className="doc-card-number tnum">{doc.number}</span>
      <span className="doc-card-title">{doc.title[lang]}</span>
      {stamp && <span className="doc-card-stamp">{stamp}</span>}
    </a>
  );
}

/** Câu đầy đủ của một quan hệ, dùng cho `title` của đường nối. */
export function relationSentence(
  actor: LegalDoc,
  target: LegalDoc,
  kind: RelationKind,
  lang: Lang,
): string {
  return `${actor.number} ${getHome(lang).verb[kind]} ${target.number}`;
}
