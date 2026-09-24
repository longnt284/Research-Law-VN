import Link from "next/link";
import { Fragment } from "react";

import { ChainLink, DocCard, relationSentence } from "@/components/home/ChainParts";
import { MotionToggle } from "@/components/home/MotionToggle";
import { documents, domains, relations } from "@/data/documents";
import type { Lang, RelationKind } from "@/data/types";
import { getHome } from "@/i18n/home";
import { corpusSpan } from "@/lib/corpus";
import { laneStrands, type Strand } from "@/lib/strands";

/**
 * Phần đầu trang chủ: ba dải văn bản nối xích chạy không dứt.
 *
 * Mỗi thẻ là một văn bản có thật, mỗi mắt xích là một quan hệ có thật, và thứ
 * tự thẻ do `src/lib/strands.ts` quyết định từ dữ liệu. Thêm một nghị định
 * hướng dẫn vào tập dữ liệu thì một sợi xích dài thêm một mắt.
 *
 * Dải chạy vòng bằng cách nhân đôi nội dung rồi dịch đúng một nửa chiều dài: hết
 * một vòng thì bản sao đã nằm đúng chỗ bản gốc nên không thấy mối nối. Chuyển
 * động dừng khi rê chuột vào dải, khi người đọc bấm nút dừng, và khi hệ điều
 * hành báo đã giảm chuyển động — lúc đó dải thành một hàng cuộn ngang bằng tay.
 *
 * Cả dải được ẩn khỏi cây trợ năng và thẻ không nhận tiêu điểm bàn phím: bắt
 * người dùng bàn phím đi qua năm mươi liên kết đang trôi trước khi tới nội dung
 * là một cái bẫy. Thay vào đó có một câu tóm tắt, và cùng nội dung ấy nằm ở
 * danh mục và bản đồ dưới dạng đọc được.
 */

/** Số giây cho mỗi thẻ đi qua. Ba làn lệch tốc độ để mắt không bắt được một nhịp chung. */
const PACE = [5.6, 6.8, 6.1];

function Run({ strands, lang }: { strands: Strand[]; lang: Lang }) {
  return (
    <div className="chain-run">
      {strands.map((strand, s) => (
        <div className="chain-strand" key={s}>
          {strand.map((step, i) => {
            const prev = strand[i - 1]?.doc;
            return (
              <Fragment key={`${step.doc.id}-${i}`}>
                {step.via && prev && (
                  <ChainLink
                    kind={step.via.kind}
                    acts={step.via.acts}
                    lang={lang}
                    sentence={
                      step.via.acts === "back"
                        ? relationSentence(step.doc, prev, step.via.kind, lang)
                        : relationSentence(prev, step.doc, step.via.kind, lang)
                    }
                  />
                )}
                <DocCard doc={step.doc} lang={lang} focusable={false} />
              </Fragment>
            );
          })}
          <span className="chain-end" aria-hidden="true">
            §
          </span>
        </div>
      ))}
    </div>
  );
}

export function ChainHero({ lang }: { lang: Lang }) {
  const h = getHome(lang).hero;
  const home = getHome(lang);
  const lanes = laneStrands(3, 20);
  const cardCount = lanes.flat().reduce((n, s) => n + s.length, 0);
  const linkCount = lanes.flat().reduce((n, s) => n + s.length - 1, 0);

  const stats = [
    { value: String(documents.length), label: h.statDocs },
    { value: String(relations.length), label: h.statRelations },
    { value: String(domains.length), label: h.statDomains },
    { value: `${corpusSpan.from}–${corpusSpan.to}`, label: h.statSpan },
  ];

  const kinds: RelationKind[] = ["guides", "amends", "replaces"];

  return (
    <section className="chain-hero" aria-labelledby="home-title">
      <div className="chain-hero-copy">
        <p className="eyebrow eyebrow-tick rise">{h.eyebrow}</p>
        <h1 id="home-title" className="chain-hero-title rise rise-1">
          <span>{h.title[0]}</span> <span>{h.title[1]}</span>
        </h1>
        <div className="chain-hero-row">
          <p className="chain-hero-lede rise rise-2">{h.lede}</p>
          <dl className="chain-hero-stats rise rise-3">
            {stats.map((s) => (
              <div key={s.label}>
                <dt>{s.label}</dt>
                <dd className="tnum">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="chain-hero-actions rise rise-3">
          <Link href={`/${lang}/ban-do`} className="btn btn-solid">
            {h.enterMap}
          </Link>
          <Link href={`/${lang}/van-ban`} className="btn btn-outline">
            {h.enterDocs}
          </Link>
        </div>
      </div>

      <p className="sr-only">
        {h.fieldSummary.replace("{docs}", String(cardCount)).replace("{links}", String(linkCount))}
      </p>

      <div className="chain-field" aria-hidden="true">
        {lanes.map((lane, i) => (
          <div
            className={`chain-lane chain-lane-${i}`}
            key={i}
            style={
              {
                "--lane-dur": `${Math.round(lane.reduce((n, s) => n + s.length, 0) * PACE[i % PACE.length])}s`,
              } as React.CSSProperties
            }
          >
            <div className="chain-track">
              <Run strands={lane} lang={lang} />
              <Run strands={lane} lang={lang} />
            </div>
          </div>
        ))}
      </div>

      <div className="chain-foot">
        <div className="chain-legend">
          <p className="eyebrow">{h.legendTitle}</p>
          <ul>
            {kinds.map((k) => (
              <li key={k} className={`chain-legend-item chain-${k}`}>
                <svg className="chain-svg" viewBox="0 0 100 24" aria-hidden="true" focusable="false">
                  <use href="#chain-links" />
                </svg>
                <span>{home.relations.kinds[k].title}</span>
              </li>
            ))}
          </ul>
          <p className="chain-legend-hint">{h.legendHint}</p>
        </div>
        <MotionToggle pause={h.pause} play={h.play} />
      </div>
    </section>
  );
}
