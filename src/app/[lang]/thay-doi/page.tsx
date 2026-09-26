import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventGlyph, EventItem } from "@/components/changes/EventList";
import { LuxBackdrop } from "@/components/LuxBackdrop";
import type { Lang } from "@/data/types";
import { formatDate, isLang } from "@/i18n/dictionary";
import { getLanding } from "@/i18n/landing";
import { CHANGES_AS_OF, changeEvents, type ChangeEvent, type ChangeEventKind } from "@/lib/changes";
import { alternatesFor, shareMeta } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const l = getLanding(lang).changes;
  return {
    title: l.pageTitle,
    description: l.pageLede,
    alternates: alternatesFor(lang, "/thay-doi"),
    ...shareMeta(lang, "/thay-doi", l.pageTitle, l.pageLede),
  };
}

const KINDS: ChangeEventKind[] = ["replaced", "amended", "guidance", "effective", "issued", "expired"];

/** Nhóm mốc theo tháng, mới nhất trước. */
function byMonth(events: ChangeEvent[]): { key: string; events: ChangeEvent[] }[] {
  const out: { key: string; events: ChangeEvent[] }[] = [];
  for (const e of events) {
    const key = e.date.slice(0, 7);
    const last = out[out.length - 1];
    if (last && last.key === key) last.events.push(e);
    else out.push({ key, events: [e] });
  }
  return out;
}

function monthLabel(key: string, lang: Lang): string {
  const [y, m] = key.split("-");
  if (lang === "vi") return `Tháng ${Number(m)}/${y}`;
  return new Date(`${key}-01T00:00:00Z`).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Trang thay đổi: mọi mốc đọc được từ tập dữ liệu, xếp theo tháng.
 *
 * Bộ lọc theo loại là sáu nút chọn thuần HTML và CSS (`:has`), không cần
 * JavaScript: danh sách đầy đủ vẫn nằm trong trang, bộ lọc chỉ ẩn bớt.
 */
export default async function ChangesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const l = getLanding(lang).changes;
  const upcoming = changeEvents.filter((e) => e.date > CHANGES_AS_OF);
  const past = changeEvents.filter((e) => e.date <= CHANGES_AS_OF);
  const counts = new Map<ChangeEventKind, number>();
  for (const e of changeEvents) counts.set(e.kind, (counts.get(e.kind) ?? 0) + 1);

  const group = (title: string, events: ChangeEvent[]) =>
    events.length === 0 ? null : (
      <section className="chg-group">
        <h2 className="chg-group-title">{title}</h2>
        {byMonth(events).map((m) => (
          <div key={m.key} className={`chg-month ${[...new Set(m.events.map((e) => `has-${e.kind}`))].join(" ")}`}>
            <h3 className="chg-month-title tnum">{monthLabel(m.key, lang)}</h3>
            <ol className="ev-list">
              {m.events.map((e) => (
                <EventItem key={`${e.id}-${e.date}`} e={e} lang={lang} />
              ))}
            </ol>
          </div>
        ))}
      </section>
    );

  return (
    <>
      <section className="rule-b hero-lux">
        <LuxBackdrop />
        <div className="mx-auto w-full max-w-[76rem] px-5 py-10 sm:px-8 sm:py-12">
          <p className="eyebrow eyebrow-tick rise">
            {changeEvents.length} · {formatDate(CHANGES_AS_OF, lang, CHANGES_AS_OF)}
          </p>
          <h1 className="display rise rise-1 mt-3">{l.pageTitle}</h1>
          <p className="measure rise rise-2 mt-4 text-[1.0625rem] leading-relaxed text-[var(--ink-2)]">
            {l.pageLede}
          </p>
        </div>
      </section>

      <div className="chg-page mx-auto w-full max-w-[76rem] px-5 py-8 sm:px-8">
        <fieldset className="chg-filter">
          <legend className="sr-only">{l.filterAll}</legend>
          <label>
            <input type="radio" name="chg-kind" id="k-all" defaultChecked />
            <span>{l.filterAll}</span>
          </label>
          {KINDS.filter((k) => counts.get(k)).map((k) => (
            <label key={k}>
              <input type="radio" name="chg-kind" id={`k-${k}`} />
              <span>
                <EventGlyph kind={k} />
                {l.kinds[k]} <span className="tnum chg-n">{counts.get(k)}</span>
              </span>
            </label>
          ))}
        </fieldset>
        <p className="chg-note">{l.note}</p>
        {group(l.upcoming, [...upcoming].reverse())}
        {group(l.past, past)}
      </div>
    </>
  );
}
