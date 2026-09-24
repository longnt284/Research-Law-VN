import { documents, domains } from "@/data/documents";
import type { Lang } from "@/data/types";
import { getHome } from "@/i18n/home";
import { tierCounts, tierOf, TIERS, whenOf } from "@/lib/corpus";

/**
 * Khối "Thứ bậc hiệu lực" của trang chủ.
 *
 * Bốn bậc thang, mỗi bậc một tầng hiệu lực, mỗi ô nhỏ trên bậc là một văn bản
 * của tập dữ liệu tô theo màu lĩnh vực. Bậc thang đi xuống từ trái sang phải
 * để hình tự nói "cao hơn" và "thấp hơn" mà không cần mũi tên nào giải thích.
 *
 * Ô không phải liên kết: một trăm hai mươi điểm dừng bàn phím cho một hình minh
 * họa là quá nhiều. Hình mang một nhãn tóm tắt cho trình đọc màn hình, và mỗi ô
 * có `title` để rê chuột đọc được số hiệu.
 */
export function HierarchyBlock({ lang }: { lang: Lang }) {
  const h = getHome(lang).hierarchy;
  const hue = new Map(domains.map((d) => [d.id, d.hue]));

  const rows = TIERS.map((tier) =>
    documents
      .filter((d) => tierOf(d) === tier)
      .sort(
        (a, b) =>
          domains.findIndex((x) => x.id === a.domains[0]) -
            domains.findIndex((x) => x.id === b.domains[0]) ||
          whenOf(a).localeCompare(whenOf(b)),
      ),
  );

  const summary = TIERS.map((t) => `${h.tiers[t]}, ${h.tierNames[t]}: ${tierCounts[t]}`).join(". ");

  return (
    <section className="home-block" aria-labelledby="home-hier-title">
      <div className="home-block-copy">
        <p className="eyebrow eyebrow-tick">{h.eyebrow}</p>
        <h2 id="home-hier-title" className="display-sm mt-3">
          <span className="block">{h.title[0]}</span>
          <span className="block">{h.title[1]}</span>
        </h2>
        <p className="home-block-text">{h.text}</p>
        <p className="home-block-note">{h.note}</p>
      </div>

      <div className="hier-figure" role="img" aria-label={summary}>
        <div className="hier-axis" aria-hidden="true">
          <span>{h.high}</span>
          <i />
          <span>{h.low}</span>
        </div>
        <ol className="hier-steps" aria-hidden="true">
          {rows.map((docs, tier) => (
            <li key={tier} className={`hier-step hier-step-${tier}`}>
              <div className="hier-step-head">
                <span className="hier-step-index">{h.tiers[tier]}</span>
                <span className="hier-step-name">{h.tierNames[tier]}</span>
                <span className="hier-step-count tnum">{docs.length}</span>
              </div>
              <div className="hier-step-docs">
                {docs.map((d, i) => (
                  <span
                    key={d.id}
                    className={`hier-doc is-${d.status}`}
                    title={`${d.number} · ${d.title[lang]}`}
                    style={
                      {
                        "--hue": hue.get(d.domains[0]) ?? 40,
                        "--i": i,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
