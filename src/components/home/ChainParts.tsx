import { domains } from "@/data/documents";
import type { Lang, LegalDoc, RelationKind } from "@/data/types";
import { getDict } from "@/i18n/dictionary";
import { getHome } from "@/i18n/home";
import { yearOf } from "@/lib/corpus";

/**
 * Hai mảnh dựng nên hình "văn bản nối xích": thẻ văn bản và mắt xích.
 *
 * Cả hai là thành phần máy chủ thuần. Hình nằm sẵn trong HTML đầu tiên, không
 * chờ JavaScript, không mở ngữ cảnh vẽ nào; chuyển động chỉ là `transform` do
 * CSS chạy, nên trình duyệt đẩy nó xuống bộ tổng hợp và luồng chính không phải
 * làm gì mỗi khung hình.
 */

const hueOf = (doc: LegalDoc) => domains.find((d) => d.id === doc.domains[0])?.hue ?? 40;

/**
 * Hình mắt xích dùng chung cho cả trang: năm vòng thép lồng nhau, vòng nằm
 * ngang xen vòng dựng đứng như một sợi xích thật nhìn nghiêng. Khai một lần
 * rồi gọi lại bằng `<use>`, nên một trăm mắt xích trên trang vẫn chỉ là một
 * hình học.
 *
 * Màu kim loại là ba dải chuyển sắc, một cho mỗi loại quan hệ. `stop-color` đọc
 * biến CSS, nên đổi nền sáng tối là xích đổi màu theo mà không cần dựng lại.
 */
export function ChainDefs() {
  const metal = (id: string, hi: string, mid: string, lo: string) => (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" style={{ stopColor: `var(${hi})` }} />
      <stop offset="0.45" style={{ stopColor: `var(${mid})` }} />
      <stop offset="1" style={{ stopColor: `var(${lo})` }} />
    </linearGradient>
  );
  return (
    <svg width="0" height="0" className="chain-defs" aria-hidden="true" focusable="false">
      <defs>
        {metal("chain-metal-guides", "--chain-g-hi", "--chain-g-mid", "--chain-g-lo")}
        {metal("chain-metal-amends", "--chain-a-hi", "--chain-a-mid", "--chain-a-lo")}
        {metal("chain-metal-replaces", "--chain-r-hi", "--chain-r-mid", "--chain-r-lo")}
        <symbol id="chain-links" viewBox="0 0 100 24" overflow="visible">
          <g className="chain-body">
            <ellipse cx="10" cy="12" rx="11" ry="2.6" />
            <ellipse cx="30" cy="12" rx="12" ry="7" />
            <ellipse cx="50" cy="12" rx="12" ry="2.6" />
            <ellipse cx="70" cy="12" rx="12" ry="7" />
            <ellipse cx="90" cy="12" rx="11" ry="2.6" />
          </g>
          {/* Vệt sáng mảnh trên mép trên của vòng: thứ làm một nét tròn đọc ra là kim loại. */}
          <g className="chain-glint">
            <path d="M20 9.2 Q30 3.6 40 9.2" />
            <path d="M60 9.2 Q70 3.6 80 9.2" />
          </g>
        </symbol>
      </defs>
    </svg>
  );
}

/**
 * Một mắt xích giữa hai thẻ.
 *
 * Loại quan hệ nói bằng ba cách cùng lúc — màu kim loại, nhãn chữ và câu đầy
 * đủ trong `title` — để người không phân biệt được màu, hoặc in trang ra đen
 * trắng, vẫn đọc được. Chấm sáng chạy dọc xích đi từ văn bản tác động sang văn
 * bản bị tác động, nên chiều của quan hệ nhìn thấy được cả khi chưa đọc nhãn.
 */
export function ChainLink({
  kind,
  acts,
  sentence,
  lang,
}: {
  kind: RelationKind;
  /** `back`: văn bản bên phải tác động lên văn bản bên trái. */
  acts: "back" | "forward";
  /** Câu đầy đủ, ví dụ "135/2025/QH15 thay thế 50/2014/QH13". */
  sentence: string;
  lang: Lang;
}) {
  const h = getHome(lang);
  return (
    <span className={`chain-link chain-${kind} acts-${acts}`} title={sentence}>
      <span className="chain-wire" aria-hidden="true">
        <svg className="chain-svg" viewBox="0 0 100 24" focusable="false">
          <use href="#chain-links" />
        </svg>
        <span className="chain-pulse" />
      </span>
      {/* Hai mũi tên, một cho dải nằm ngang và một cho khi thẻ xếp dọc trên màn
          hẹp; CSS chỉ hiện đúng một. Mũi tên luôn chỉ vào văn bản bị tác động. */}
      <span className="chain-label">
        {acts === "back" && (
          <>
            <span className="arrow-h">← </span>
            <span className="arrow-v">↑ </span>
          </>
        )}
        {h.linkLabel[kind]}
        {acts === "forward" && (
          <>
            <span className="arrow-h"> →</span>
            <span className="arrow-v"> ↓</span>
          </>
        )}
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
export function DocCard({
  doc,
  lang,
  focusable = true,
}: {
  doc: LegalDoc;
  lang: Lang;
  /** `false` ở bản sao nối vòng của dải chạy: nó không được nhận tiêu điểm bàn phím. */
  focusable?: boolean;
}) {
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
      tabIndex={focusable ? undefined : -1}
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

/** Câu đầy đủ của một quan hệ, dùng cho `title` của mắt xích. */
export function relationSentence(
  actor: LegalDoc,
  target: LegalDoc,
  kind: RelationKind,
  lang: Lang,
): string {
  return `${actor.number} ${getHome(lang).verb[kind]} ${target.number}`;
}
