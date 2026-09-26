import Link from "next/link";

import { SetDateButton } from "@/components/validity/SetDateButton";
import type { Lang, LegalDoc } from "@/data/types";
import { formatDate } from "@/i18n/dictionary";
import { getDocPanel } from "@/i18n/doc-panel";
import { getValidityCopy } from "@/i18n/validity";
import { validityEvents } from "@/lib/validity";

/**
 * Diễn biến hiệu lực của một văn bản, dựng thành một cột mốc dọc.
 *
 * Mỗi dòng là một sự kiện đọc được từ tập dữ liệu. Sự kiện làm văn bản hết hiệu
 * lực vẽ bằng nút rỗng, để mắt bắt được ngay đâu là điểm kết thúc. Bấm vào ngày
 * của một mốc là xem pháp luật tại đúng ngày đó.
 */
export function ValidityTimeline({ doc, lang }: { doc: LegalDoc; lang: Lang }) {
  const c = getValidityCopy(lang);
  const p = getDocPanel(lang).timeline;
  const events = validityEvents(doc);
  if (events.length === 0) return null;

  return (
    <section id="hieu-luc" className="mt-9 scroll-mt-24">
      <h2 className="eyebrow eyebrow-tick">{c.title}</h2>
      <p className="measure mt-2 text-sm leading-relaxed text-[var(--ink-3)]">{c.lede}</p>
      <ol className="vt mt-4">
        {events.map((e, i) => {
          const ends =
            e.kind === "replaced-by" || e.kind === "lapsed-with" || e.kind === "expired-recorded";
          return (
            <li key={i} className={`vt-item${ends ? " vt-end" : ""}`}>
              <span className="vt-date tnum">
                {e.date ? (
                  <SetDateButton
                    date={e.date}
                    label={formatDate(e.date, lang, e.date)}
                    title={p.setDate(formatDate(e.date, lang, e.date))}
                  />
                ) : (
                  c.noDate
                )}
              </span>
              <span className="vt-body">
                <span className="text-[var(--ink-2)]">{c.events[e.kind]}</span>
                {e.other && (
                  <>
                    {" "}
                    <Link
                      href={`/${lang}/van-ban/${e.other.id}`}
                      className="tnum font-semibold text-[var(--accent)] underline decoration-[var(--rule-strong)] underline-offset-2 hover:decoration-[var(--accent)]"
                    >
                      {e.other.number}
                    </Link>
                  </>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
