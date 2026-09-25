import Link from "next/link";

import { CompareArt, DomainsArt, HierarchyArt, MethodArt } from "@/components/art/PageArt";
import { Reveal } from "@/components/Reveal";
import { documents, domains, LATEST_VERIFIED_ON, relations } from "@/data/documents";
import type { Lang } from "@/data/types";
import { formatDate } from "@/i18n/dictionary";
import { getHub, type HubCardKey } from "@/i18n/hub";
import { pairs } from "@/lib/compare";
import { corpusSpan } from "@/lib/corpus";

/**
 * Khối lối vào của trang chủ.
 *
 * Ba khối phía trên trả lời câu hỏi "trang này là gì". Khối này trả lời câu hỏi
 * ngay sau đó — "vào đâu bây giờ". Đây là một thành phần máy chủ thuần: chữ, số
 * và hình đều nằm trong gói HTML đầu tiên; JavaScript chỉ thêm nhịp hiện dần.
 *
 * Mọi con số đếm thẳng từ tập dữ liệu. Không có con số nào viết tay trong file
 * lời, nên thêm một nghị định vào `documents.ts` là các thẻ tự đổi theo.
 */

/**
 * Đường dẫn và hình minh họa của từng thẻ. Hình trên thẻ trùng với hình ở đầu
 * trang đích, nên người đọc bấm một hình rồi gặp lại chính hình ấy ở trang mới.
 */
const CARDS: Record<HubCardKey, { path: string; Art: (p: { lang: Lang }) => React.ReactNode }> = {
  "linh-vuc": { path: "/linh-vuc", Art: DomainsArt },
  "van-ban": { path: "/van-ban", Art: HierarchyArt },
  "doi-chieu": { path: "/doi-chieu", Art: CompareArt },
  "phuong-phap": { path: "/phuong-phap", Art: MethodArt },
};

export function HomeHub({ lang }: { lang: Lang }) {
  const h = getHub(lang);

  // Số đếm của từng thẻ, đếm thẳng từ tập dữ liệu.
  const counts: Record<HubCardKey, string> = {
    "linh-vuc": String(domains.length),
    "van-ban": String(documents.length),
    "doi-chieu": String(pairs.length),
    "phuong-phap": formatDate(LATEST_VERIFIED_ON, lang, LATEST_VERIFIED_ON),
  };

  const stats = [
    { value: String(documents.length), label: h.statDocs },
    { value: String(relations.length), label: h.statRelations },
    { value: String(domains.length), label: h.statDomains },
    { value: String(pairs.length), label: h.statPairs },
    { value: `${corpusSpan.from}—${corpusSpan.to}`, label: h.spanLabel },
  ];

  return (
    <div className="hub">
      <Reveal>
        <div className="hub-head">
          <p className="eyebrow eyebrow-tick">{h.eyebrow}</p>
          <h2 className="display-sm mt-3">{h.title}</h2>
          <p className="measure mt-4 text-[1.0625rem] leading-relaxed text-[var(--ink-2)]">
            {h.lede}
          </p>
        </div>
      </Reveal>

      {/* Dải số liệu. Đường kẻ giữa các ô là nền của lưới lộ qua khe một pixel,
          cùng cách dùng với lưới lĩnh vực, nên hai trang không kẻ khác nhau. */}
      <Reveal delay={60}>
        <dl className="hub-stats">
          {stats.map((s) => (
            <div key={s.label}>
              <dt>{s.label}</dt>
              <dd className="tnum">{s.value}</dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <div className="hub-grid">
        {h.cards.map((card, i) => {
          const { path, Art } = CARDS[card.key];
          // Thẻ đầu chiếm trọn bề ngang: cây văn bản theo lĩnh vực là lối vào
          // rộng nhất, và một thẻ lớn nói điều đó rõ hơn bất kỳ chữ "nổi bật"
          // nào. Các thẻ còn lại xếp
          // hai cột; khi số thẻ đó lẻ, thẻ cuối cũng trải hết bề ngang thay vì
          // để trống nửa hàng.
          const wide = i === 0 || (i === h.cards.length - 1 && (h.cards.length - 1) % 2 === 1);
          return (
            <Reveal
              key={card.key}
              className={wide ? "hub-cell hub-cell-wide" : "hub-cell"}
              delay={Math.min(i, 4) * 60}
            >
              {/* Tên thẻ là một tiêu đề thật, không phải chữ to: danh sách tiêu
                  đề mà trình đọc màn hình dựng ra phải liệt kê được các lối vào
                  này. Vì vậy các khối bên trong liên kết là `div`, không phải
                  `span` — `span` chỉ chứa được nội dung nội dòng. */}
              <Link href={`/${lang}${path}`} className="hub-card card-lux row-mark">
                <div className="hub-card-art">
                  <Art lang={lang} />
                </div>
                <div className="hub-card-body">
                  <p className="eyebrow tnum">
                    {counts[card.key]} {card.meta}
                  </p>
                  <h3 className="hub-card-title">{card.title}</h3>
                  <p className="hub-card-text">{card.text}</p>
                  <p className="hub-card-cta">{card.cta}</p>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>

      <p className="hub-verified tnum">
        {h.verifiedPrefix} {formatDate(LATEST_VERIFIED_ON, lang, LATEST_VERIFIED_ON)}
      </p>
    </div>
  );
}
