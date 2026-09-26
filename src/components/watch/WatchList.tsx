"use client";

import Link from "next/link";
import { useState } from "react";

import { IndexStatus } from "@/components/search/results";
import { useSearchIndex, type LoadedIndex } from "@/components/search/useSearchIndex";
import type { Lang } from "@/data/types";
import { formatDate, getDict } from "@/i18n/dictionary";
import { getLanding } from "@/i18n/landing";
import { getValidityCopy } from "@/i18n/validity";
import { getAccountCopy } from "@/i18n/account";
import { ACCOUNTS_ENABLED } from "@/lib/account";
import {
  clearRecentDocs,
  createMatter,
  deleteMatter,
  todayIso,
  toggleFollow,
  toggleMatterDoc,
  useAsOf,
  useFollowed,
  useMatters,
  useAccount,
  useRecentDocs,
  withAsOf,
} from "@/lib/client-store";
import type { IndexDoc } from "@/lib/search-types";
import type { ValiditySegment } from "@/lib/validity-segment";

/**
 * Trang theo dõi: văn bản đang theo dõi, văn bản vừa xem, bộ hồ sơ.
 *
 * "Điều gì đã đổi kể từ khi theo dõi" đọc từ các đoạn hiệu lực đã tính sẵn của
 * văn bản: mỗi lần tình trạng đổi sau ngày bắt đầu theo dõi là một mốc. Khi tập
 * dữ liệu được bổ sung một văn bản sửa đổi hay thay thế, mốc đó tự hiện ở đây.
 */

/** Các mốc đổi tình trạng sau ngày `since`, bỏ các mốc không đổi gì. */
function changesSince(doc: IndexDoc, since: string): ValiditySegment[] {
  const out: ValiditySegment[] = [];
  let prev: ValiditySegment | null = null;
  for (const s of doc.seg) {
    const changed =
      !prev || prev.state !== s.state || prev.amended !== s.amended || prev.byId !== s.byId;
    if (changed && s.from && s.from > since && !s.recorded) out.push(s);
    prev = s;
  }
  return out;
}

function DocLine({ doc, lang, asOf }: { doc: IndexDoc; lang: Lang; asOf: string }) {
  return (
    <span className="watch-doc">
      <Link href={withAsOf(`/${lang}/van-ban/${doc.id}`, asOf)} className="watch-num tnum">
        {doc.n}
      </Link>
      <span className="watch-title">{doc.t}</span>
      <IndexStatus doc={doc} date={asOf || undefined} lang={lang} />
    </span>
  );
}

function Followed({ data, lang }: { data: LoadedIndex; lang: Lang }) {
  const w = getLanding(lang).watch;
  const v = getValidityCopy(lang);
  const followed = useFollowed();
  const asOf = useAsOf();
  const today = todayIso();
  if (followed.length === 0) return <p className="empty-note">{w.followedEmpty}</p>;
  return (
    <ul className="watch-list">
      {followed.map((f) => {
        const doc = data.byId.get(f.id);
        if (!doc) return null;
        const events = changesSince(doc, f.since);
        return (
          <li key={f.id} className="watch-item">
            <DocLine doc={doc} lang={lang} asOf={asOf} />
            <p className="watch-meta tnum">{w.since(formatDate(f.since, lang, f.since))}</p>
            {events.length === 0 ? (
              <p className="watch-quiet">{w.noChange}</p>
            ) : (
              <div className="watch-events">
                <p className="watch-new">{w.newSince(events.length)}</p>
                <ul>
                  {events.map((e) => (
                    <li key={e.from} className={e.from > today ? "is-future" : ""}>
                      <span className="tnum">{formatDate(e.from, lang, e.from)}</span>{" "}
                      {v.state[e.state]}
                      {e.state === "in-force" && e.amended ? `, ${v.amended}` : ""}
                      {e.byId && e.byNumber && (
                        <>
                          {" · "}
                          <Link href={`/${lang}/van-ban/${e.byId}`} className="ref-link tnum">
                            {e.byNumber}
                          </Link>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button type="button" className="ref-link watch-remove" onClick={() => toggleFollow(f.id)}>
              {w.unfollow}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function Recent({ data, lang }: { data: LoadedIndex; lang: Lang }) {
  const w = getLanding(lang).watch;
  const recent = useRecentDocs();
  const asOf = useAsOf();
  if (recent.length === 0) return <p className="empty-note">{w.recentEmpty}</p>;
  return (
    <>
      <ul className="watch-list">
        {recent.map((id) => {
          const doc = data.byId.get(id);
          return doc ? (
            <li key={id} className="watch-item watch-item--compact">
              <DocLine doc={doc} lang={lang} asOf={asOf} />
            </li>
          ) : null;
        })}
      </ul>
      <button type="button" className="ref-link mt-3 text-sm" onClick={clearRecentDocs}>
        {w.clearRecent}
      </button>
    </>
  );
}

function Matters({ data, lang }: { data: LoadedIndex; lang: Lang }) {
  const w = getLanding(lang).watch;
  const matters = useMatters();
  const asOf = useAsOf();
  const [name, setName] = useState("");
  return (
    <>
      <form
        className="watch-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          createMatter(name);
          setName("");
        }}
      >
        <label htmlFor="matter-name" className="sr-only">
          {w.matterName}
        </label>
        <input
          id="matter-name"
          className="field"
          placeholder={w.matterName}
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
        />
        <button type="submit" className="btn btn-quiet btn-sm">
          {w.matterCreate}
        </button>
      </form>
      <ul className="matters">
        {matters.map((m) => (
          <li key={m.id} className="matter">
            <div className="matter-head">
              <h3>{m.name}</h3>
              <span className="tnum">{w.matterDocs(m.docIds.length)}</span>
              <button type="button" className="ref-link" onClick={() => deleteMatter(m.id)}>
                {w.matterDelete}
              </button>
            </div>
            {m.docIds.length === 0 ? (
              <p className="empty-note">{w.matterEmpty}</p>
            ) : (
              <ul className="watch-list">
                {m.docIds.map((id) => {
                  const doc = data.byId.get(id);
                  return doc ? (
                    <li key={id} className="watch-item watch-item--compact">
                      <DocLine doc={doc} lang={lang} asOf={asOf} />
                      <button type="button" className="ref-link watch-remove" onClick={() => toggleMatterDoc(m.id, id)}>
                        {w.matterRemove}
                      </button>
                    </li>
                  ) : null;
                })}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

export function WatchList({ lang }: { lang: Lang }) {
  const w = getLanding(lang).watch;
  const t = getDict(lang);
  const idx = useSearchIndex(lang, true);
  const data = idx.status === "ready" ? idx.data : null;
  const account = useAccount();
  const ac = getAccountCopy(lang);
  return (
    <div className="watch">
      {account ? (
        <p className="watch-local">
          {ac.synced} <span className="tnum">({account.email})</span>
        </p>
      ) : (
        <p className="watch-local">
          {w.local}{" "}
          {ACCOUNTS_ENABLED && (
            <Link href={`/${lang}/tai-khoan`} className="ref-link">
              {ac.nav} →
            </Link>
          )}
        </p>
      )}
      {!data ? (
        <p className="empty-note">{idx.status === "error" ? t.list.empty : w.loading}</p>
      ) : (
        <div className="watch-grid">
          <section aria-labelledby="w-follow" className="watch-sec">
            <h2 id="w-follow" className="sec-title">
              {w.followedTitle}
            </h2>
            <Followed data={data} lang={lang} />
          </section>
          <section aria-labelledby="w-matters" className="watch-sec">
            <h2 id="w-matters" className="sec-title">
              {w.mattersTitle}
            </h2>
            <p className="sec-lede">{w.mattersLede}</p>
            <Matters data={data} lang={lang} />
          </section>
          <section aria-labelledby="w-recent" className="watch-sec">
            <h2 id="w-recent" className="sec-title">
              {w.recentTitle}
            </h2>
            <Recent data={data} lang={lang} />
          </section>
        </div>
      )}
    </div>
  );
}
