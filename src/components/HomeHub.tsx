import Link from "next/link";

import { Reveal } from "@/components/Reveal";
import { SpaceThumb } from "@/components/SpaceThumb";
import { documents, domains, LATEST_VERIFIED_ON } from "@/data/documents";
import type { Lang } from "@/data/types";
import { formatDate, getDict } from "@/i18n/dictionary";
import { getHub, type HubCardKey } from "@/i18n/hub";
import { pairs } from "@/lib/compare";
import { buildSpace } from "@/lib/space";

/**
 * Khối lối vào của trang chủ.
 *
 * Phần mở đầu ba chiều trả lời câu hỏi "trang này là gì". Khối này trả lời câu
 * hỏi ngay sau đó — "vào đâu bây giờ" — và nó phải trả lời được cả khi cảnh ba
 * chiều không dựng nổi. Vì vậy đây là một thành phần máy chủ thuần: chữ, số và
 * hình đều nằm trong gói HTML đầu tiên; JavaScript chỉ thêm nhịp hiện dần.
 *
 * Mọi con số đếm thẳng từ tập dữ liệu. Không có con số nào viết tay trong file
 * lời, nên thêm một nghị định vào `documents.ts` là các thẻ tự đổi theo.
 */

/** Đường dẫn, hình thu nhỏ và góc nhìn của từng thẻ, tra theo khoá trong file lời. */
const CARDS: Record<
  HubCardKey,
  { path: string; act: number; turn: number; tilt: number; dots: number; edges: number }
> = {
  // Bản đồ là công cụ đọc quan hệ, nên thẻ của nó lấy đúng bố cục quan hệ.
  "ban-do": { path: "/ban-do", act: 3, turn: 0.7, tilt: 0.3, dots: 78, edges: 42 },
  "linh-vuc": { path: "/linh-vuc", act: 2, turn: 1.1, tilt: 0.42, dots: 58, edges: 14 },
  // Danh mục lấy bố cục khối: thứ bậc của tập này lệch hẳn về tầng luật
  // (57 trên 102), nên bố cục bốn tầng thu nhỏ lại chỉ còn một vạch đông ở trên
  // và vài điểm rơi bên dưới. Khối cầu nói đúng cùng một điều — luật nằm ở lõi —
  // mà ở khổ thẻ vẫn đọc được.
  "van-ban": { path: "/van-ban", act: 0, turn: 0.6, tilt: 0.3, dots: 78, edges: 14 },
  "doi-chieu": { path: "/doi-chieu", act: 4, turn: 0.35, tilt: 0.3, dots: 84, edges: 26 },
  "phuong-phap": { path: "/phuong-phap", act: 5, turn: 0.9, tilt: 0.36, dots: 52, edges: 8 },
};

export function HomeHub({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const h = getHub(lang);
  const space = buildSpace();

  // Số đếm của từng thẻ. Quan hệ lấy theo số đường thật sự vẽ được — tức quan hệ
  // có đủ hai đầu trong tập dữ liệu — để thẻ không hứa một con số mà bản đồ
  // không vẽ ra.
  const counts: Record<HubCardKey, string> = {
    "ban-do": String(space.links.length),
    "linh-vuc": String(domains.length),
    "van-ban": String(documents.length),
    "doi-chieu": String(pairs.length),
    "phuong-phap": formatDate(LATEST_VERIFIED_ON, lang, LATEST_VERIFIED_ON),
  };

  const stats = [
    { value: String(documents.length), label: h.statDocs },
    { value: String(space.links.length), label: h.statRelations },
    { value: String(domains.length), label: h.statDomains },
    { value: String(pairs.length), label: h.statPairs },
    { value: `${space.span.from}—${space.span.to}`, label: h.spanLabel },
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
          const meta = CARDS[card.key];
          return (
            // Thẻ đầu chiếm trọn bề ngang: bản đồ là lối vào chính, và một thẻ
            // lớn nói điều đó rõ hơn bất kỳ chữ "nổi bật" nào.
            <Reveal
              key={card.key}
              className={i === 0 ? "hub-cell hub-cell-wide" : "hub-cell"}
              delay={Math.min(i, 4) * 60}
            >
              {/* Tên thẻ là một tiêu đề thật, không phải chữ to: danh sách tiêu
                  đề mà trình đọc màn hình dựng ra phải liệt kê được năm lối vào
                  này. Vì vậy các khối bên trong liên kết là `div`, không phải
                  `span` — `span` chỉ chứa được nội dung nội dòng. */}
              <Link href={`/${lang}${meta.path}`} className="hub-card card-lux row-mark">
                <div className="hub-card-art">
                  <SpaceThumb
                    act={meta.act}
                    turn={meta.turn}
                    tilt={meta.tilt}
                    maxDots={meta.dots}
                    maxEdges={meta.edges}
                  />
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

      <Reveal delay={80}>
        <div className="hub-replay">
          <div className="min-w-0">
            <p className="eyebrow eyebrow-tick">{h.replayTitle}</p>
            <p className="measure mt-2.5 text-[0.9375rem] leading-relaxed text-[var(--ink-2)]">
              {h.replayText}
            </p>
          </div>
          <div className="hub-replay-actions">
            {/* Liên kết neo thuần, không phải nút chạy mã: khối này phải dùng
                được cả khi gói mã của trang tải hỏng. */}
            <a href="#act-khoi" className="btn btn-outline">
              {h.replay}
            </a>
            <Link href={`/${lang}/ban-do`} className="btn btn-solid">
              {t.nav.map}
            </Link>
          </div>
        </div>
      </Reveal>

      <p className="hub-verified tnum">
        {h.verifiedPrefix} {formatDate(LATEST_VERIFIED_ON, lang, LATEST_VERIFIED_ON)}
      </p>
    </div>
  );
}
