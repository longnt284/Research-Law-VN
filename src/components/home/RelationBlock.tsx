import { ChainLink, DocCard, relationSentence } from "@/components/home/ChainParts";
import type { Lang, RelationKind } from "@/data/types";
import { getHome } from "@/i18n/home";
import { relationCounts } from "@/lib/corpus";
import { exampleOf } from "@/lib/strands";

/**
 * Khối "Quan hệ" của trang chủ: ba loại mắt xích, mỗi loại một ví dụ thật.
 *
 * Ví dụ do `exampleOf` chọn từ tập dữ liệu, ưu tiên cặp mà cả hai văn bản đều
 * đã xác minh. Không có ví dụ nào viết tay: đổi dữ liệu là ví dụ đổi theo, và
 * một loại quan hệ không còn cặp nào thì hàng của nó tự biến mất thay vì hiện
 * một ví dụ bịa.
 *
 * Khác với dải ở đầu trang, thẻ ở đây là liên kết thật nhận được tiêu điểm: chỉ
 * có sáu thẻ, và chúng là lối đi thẳng tới văn bản mà người đọc vừa thấy ví dụ.
 */
export function RelationBlock({ lang }: { lang: Lang }) {
  const r = getHome(lang).relations;
  const kinds: RelationKind[] = ["guides", "amends", "replaces"];

  return (
    <section className="home-block" aria-labelledby="home-rel-title">
      <div className="home-block-copy">
        <p className="eyebrow eyebrow-tick">{r.eyebrow}</p>
        <h2 id="home-rel-title" className="display-sm mt-3">
          <span className="block">{r.title[0]}</span>
          <span className="block">{r.title[1]}</span>
        </h2>
        <p className="home-block-text">{r.text}</p>
        <p className="home-block-note">{r.direction}</p>
      </div>

      <ol className="rel-rows">
        {kinds.map((kind) => {
          const ex = exampleOf(kind);
          if (!ex) return null;
          return (
            <li key={kind} className={`rel-row chain-${kind}`}>
              <div className="rel-row-copy">
                <h3 className="rel-row-title">{r.kinds[kind].title}</h3>
                <p className="rel-row-text">{r.kinds[kind].text}</p>
                <p className="rel-row-count tnum">
                  <strong>{relationCounts[kind]}</strong> {r.count}
                </p>
              </div>
              <div className="rel-row-example">
                <DocCard doc={ex.target} lang={lang} />
                <ChainLink
                  kind={kind}
                  acts="back"
                  lang={lang}
                  sentence={relationSentence(ex.actor, ex.target, kind, lang)}
                />
                <DocCard doc={ex.actor} lang={lang} />
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
