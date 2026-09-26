import Link from "next/link";

import type { Lang } from "@/data/types";
import { formatDate } from "@/i18n/dictionary";
import { getLanding } from "@/i18n/landing";
import type { ChangeEvent, ChangeEventKind } from "@/lib/changes";

/**
 * Danh sách mốc thay đổi: ngày, loại, văn bản tác động và văn bản bị tác động.
 *
 * Mỗi loại mang một mẫu nét riêng — cùng quy ước với hình gia phả (nét liền cho
 * hướng dẫn, nét đứt cho sửa đổi, chấm đỏ cho thay thế) — cộng tên loại bằng
 * chữ, nên không mục nào dựa vào màu.
 */

export function EventGlyph({ kind }: { kind: ChangeEventKind }) {
  if (kind === "amended" || kind === "replaced" || kind === "guidance") {
    const edge = kind === "amended" ? "amends" : kind === "replaced" ? "replaces" : "guides";
    return (
      <svg viewBox="0 0 24 10" aria-hidden="true" focusable="false" className={`ev-glyph family-edge family-edge-${edge}`}>
        <path d="M2 5H22" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 10" aria-hidden="true" focusable="false" className="ev-glyph ev-glyph--dot">
      {kind === "effective" && <circle cx="12" cy="5" r="3.6" fill="currentColor" />}
      {kind === "issued" && <circle cx="12" cy="5" r="3.3" fill="none" stroke="currentColor" strokeWidth="1.3" />}
      {kind === "expired" && (
        <>
          <circle cx="12" cy="5" r="3.3" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <path d="M9.6 7.4 14.4 2.6" stroke="currentColor" strokeWidth="1.3" />
        </>
      )}
    </svg>
  );
}

export function EventItem({ e, lang, asOfLink = false }: { e: ChangeEvent; lang: Lang; asOfLink?: boolean }) {
  const l = getLanding(lang).changes;
  const href = `/${lang}/van-ban/${e.doc.id}${asOfLink ? `?ngay=${e.date}` : ""}#gia-pha`;
  return (
    <li className={`ev ev--${e.kind}`}>
      <time dateTime={e.date} className="ev-date tnum">
        {formatDate(e.date, lang, e.date)}
      </time>
      <span className="ev-kind">
        <EventGlyph kind={e.kind} />
        {l.kinds[e.kind]}
      </span>
      <span className="ev-body">
        <span className="ev-line">
          <Link href={href} className="ev-actor tnum">
            {e.doc.number}
          </Link>
          {e.targets.length > 0 && (
            <>
              <span aria-hidden="true" className="ev-arrow">
                →
              </span>
              {e.targets.map((d, i) => (
                <span key={d.id}>
                  {i > 0 && ", "}
                  <Link href={`/${lang}/van-ban/${d.id}#gia-pha`} className="ev-target tnum">
                    {d.number}
                  </Link>
                </span>
              ))}
            </>
          )}
        </span>
        <span className="ev-title">{e.doc.title[lang]}</span>
      </span>
    </li>
  );
}

export function EventList({ events, lang }: { events: ChangeEvent[]; lang: Lang }) {
  const l = getLanding(lang).changes;
  if (events.length === 0) return <p className="empty-note">{l.empty}</p>;
  return (
    <ol className="ev-list">
      {events.map((e) => (
        <EventItem key={`${e.id}-${e.date}`} e={e} lang={lang} />
      ))}
    </ol>
  );
}
