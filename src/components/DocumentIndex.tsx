"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { DomainChip, StatusBadge } from "@/components/DocMeta";
import { ValidityBadge } from "@/components/validity/ValidityBadge";
import { documents, domains } from "@/data/documents";
import type { DocType, DomainId, Lang } from "@/data/types";
import { formatDate, getDict } from "@/i18n/dictionary";
import { getValidityCopy } from "@/i18n/validity";
import { articleQuery, type ArticleEntry } from "@/lib/article-query";
import { setAsOf, useAsOf } from "@/lib/client-store";
import { validityAt } from "@/lib/validity";

const RANK: Record<DocType, number> = {
  "bo-luat": 0,
  luat: 1,
  "dieu-uoc": 1,
  "nghi-quyet": 2,
  vbhn: 2,
  "nghi-dinh": 3,
  "quyet-dinh": 3,
  "thong-tu": 4,
  "quy-tac": 4,
};

/** Bỏ dấu để "dien luc" tìm được "điện lực". */
function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export function DocumentIndex({
  lang,
  articles,
}: {
  lang: Lang;
  /** Chỉ mục điều khoản, dựng sẵn ở máy chủ. */
  articles: ArticleEntry[];
}) {
  const t = getDict(lang);
  const v = getValidityCopy(lang);
  const [query, setQuery] = useState("");
  // Ngày người đọc hỏi, dùng chung cho cả trang ("pháp luật tại ngày…"). Rỗng
  // nghĩa là giữ tình trạng tại ngày tra cứu.
  const asOf = useAsOf();

  // Ô tìm ở trang chủ và bảng lệnh mở danh mục bằng `?q=`: điền sẵn câu tìm.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuery(q);
  }, []);
  const [onlyInForce, setOnlyInForce] = useState(false);
  const [domain, setDomain] = useState<DomainId | "all">("all");
  const [sort, setSort] = useState<"rank" | "recent">("rank");

  // Giữ ô nhập phản hồi tức thì kể cả khi danh sách bên dưới đang dựng lại.
  const deferred = useDeferredValue(query);

  // Câu tìm có nhắc "Điều N" thì tách phần đó ra để tra chỉ mục điều khoản;
  // phần còn lại (thường là số hiệu) vẫn lọc danh sách văn bản như cũ.
  const folded = fold(deferred.trim());
  const art = articleQuery(folded);
  const q = art ? art.rest : folded;

  // Tình trạng tại ngày được hỏi, tính một lần cho cả tập.
  const states = useMemo(
    () => (asOf ? new Map(documents.map((d) => [d.id, validityAt(d, asOf)])) : null),
    [asOf],
  );

  const results = useMemo(() => {
    let list = documents;
    if (domain !== "all") list = list.filter((d) => d.domains.includes(domain));
    if (states && onlyInForce) list = list.filter((d) => states.get(d.id)?.state === "in-force");
    if (q) {
      list = list.filter((d) => {
        const hay = fold(`${d.number} ${d.title.vi} ${d.title.en} ${d.summary[lang]}`);
        return hay.includes(q);
      });
    }
    return [...list].sort((a, b) => {
      if (sort === "recent") {
        const ea = a.effectiveOn || "0000";
        const eb = b.effectiveOn || "0000";
        if (ea !== eb) return eb.localeCompare(ea);
      }
      const r = RANK[a.type] - RANK[b.type];
      if (r !== 0) return r;
      return (b.effectiveOn || "").localeCompare(a.effectiveOn || "");
    });
  }, [q, domain, sort, lang, states, onlyInForce]);

  const articleHits = useMemo(() => {
    if (!art) return null;
    const ids = q ? new Set(results.map((d) => d.id)) : null;
    return articles.filter((a) => a.dieu === art.article && (!ids || ids.has(a.docId)));
  }, [art, articles, q, results]);

  const tally = useMemo(() => {
    if (!states) return null;
    const n = { "in-force": 0, pending: 0, expired: 0, unknown: 0 };
    for (const d of results) n[states.get(d.id)!.state]++;
    return n;
  }, [states, results]);

  return (
    <>
      {/*
        Thanh lọc dính ngay dưới thanh điều hướng. Danh mục dài hơn một màn hình,
        và người đang cuộn giữa danh sách thường muốn đổi từ khóa ngay tại chỗ
        chứ không phải cuộn ngược lên đầu trang.
        Khoảng 3.3rem là chiều cao thanh điều hướng.
      */}
      {/*
        Chỉ dính từ màn hình vừa trở lên. Trên điện thoại thanh điều hướng xuống
        hai hàng nên mốc 3.3rem không còn đúng, và một thanh lọc dính sai chỗ ăn
        mất một phần tư màn hình vốn đã hẹp.
      */}
      <div className="rule-b z-20 bg-[color-mix(in_oklab,var(--paper-2)_92%,transparent)] backdrop-blur-md sm:sticky sm:top-[var(--hdr-h,3.3rem)]">
        <div className="mx-auto w-full max-w-[76rem] px-5 py-4 sm:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="doc-search" className="eyebrow block">
                {t.list.searchLabel}
              </label>
              <input
                id="doc-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.list.searchPlaceholder}
                autoComplete="off"
                className="mt-1.5 w-full border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-[0.9375rem] outline-none transition-colors placeholder:text-[var(--ink-3)] focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label htmlFor="doc-sort" className="eyebrow block">
                {t.list.sortBy}
              </label>
              <select
                id="doc-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as "rank" | "recent")}
                className="mt-1.5 w-full border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-[0.9375rem] outline-none focus:border-[var(--accent)] sm:w-auto"
              >
                <option value="rank">{t.list.sortHierarchy}</option>
                <option value="recent">{t.list.sortNewest}</option>
              </select>
            </div>
            <div>
              <label htmlFor="doc-asof" className="eyebrow block">
                {v.listAsOf}
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <input
                  id="doc-asof"
                  type="date"
                  value={asOf}
                  onChange={(e) => setAsOf(e.target.value)}
                  aria-describedby="doc-asof-hint"
                  className="tnum w-full border border-[var(--rule-strong)] bg-[var(--paper)] px-2.5 py-[0.4375rem] text-[0.9375rem] outline-none focus:border-[var(--accent)] sm:w-auto"
                />
                {asOf && (
                  <button type="button" onClick={() => setAsOf("")} className="chip shrink-0">
                    {v.listClear}
                  </button>
                )}
              </div>
            </div>
          </div>
          <p id="doc-asof-hint" className="sr-only">
            {v.listAsOfHint}
          </p>
          {asOf && (
            <label className="mt-2.5 inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--ink-2)]">
              <input
                type="checkbox"
                checked={onlyInForce}
                onChange={(e) => setOnlyInForce(e.target.checked)}
                className="accent-[var(--accent)]"
              />
              {v.listOnlyInForce}
            </label>
          )}

          <div className="scroll-x thin-scroll -mx-1 mt-3">
            <div className="flex items-center gap-1.5 px-1 pb-1 lg:flex-wrap">
              <button
                type="button"
                onClick={() => setDomain("all")}
                aria-pressed={domain === "all"}
                className="chip chip-all"
              >
                {t.home.filterAll}
              </button>
              {domains.map((d) => {
                const on = domain === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDomain(on ? "all" : d.id)}
                    aria-pressed={on}
                    className="chip"
                  >
                    <span
                      aria-hidden="true"
                      className="inline-block h-2 w-2 rounded-full"
                      style={{
                        background: `hsl(${d.hue} var(--node-chroma) var(--node-lightness))`,
                      }}
                    />
                    {d.label[lang]}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[76rem] px-5 py-6 sm:px-8">
        <p aria-live="polite" className="tnum eyebrow">
          {results.length}{" "}
          {results.length === 1 ? t.list.countOne : t.list.countMany}
          {tally && asOf && (
            <span className="ml-2 normal-case tracking-normal text-[var(--ink-3)]">
              · {formatDate(asOf, lang, asOf)}:{" "}
              {v.listSummary(tally["in-force"], tally.pending, tally.expired, tally.unknown)}
            </span>
          )}
        </p>

        {/* Tra theo điều khoản: chỉ hiện khi câu tìm có nhắc tới một điều. */}
        {art && articleHits && (
          <section className="mt-4 border border-[var(--rule)] bg-[var(--paper-2)] px-4 py-3.5">
            <h2 className="eyebrow">{v.articleTitle}</h2>
            {articleHits.length === 0 ? (
              <p className="mt-1.5 text-sm text-[var(--ink-3)]">{v.articleNone(art.article)}</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {articleHits.map((a, i) => (
                  <li key={i} className="text-sm leading-relaxed">
                    <Link
                      href={a.href}
                      className="font-medium text-[var(--accent)] underline decoration-[var(--rule-strong)] underline-offset-2 hover:decoration-[var(--accent)]"
                    >
                      {a.label}
                    </Link>
                    <span className="text-[var(--ink-3)]">
                      {" "}
                      — {a.topic} · <span className="tnum">{a.pair}</span> ({v.articleSide[a.side]})
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-xs text-[var(--ink-3)]">{v.articleHint}</p>
          </section>
        )}

        {results.length === 0 ? (
          <div className="mt-8 border border-dashed border-[var(--rule-strong)] px-6 py-12 text-center">
            <p style={{ fontFamily: "var(--font-serif)" }} className="text-lg">
              {t.list.empty}
            </p>
            <p className="mt-1.5 text-sm text-[var(--ink-3)]">{t.list.emptyHint}</p>
          </div>
        ) : (
          <ul className="mt-4 border-t border-[var(--rule)]">
            {results.map((d) => (
              <li key={d.id} className="border-b border-[var(--rule)]">
                <Link
                  href={`/${lang}/van-ban/${d.id}`}
                  className="row-mark group grid gap-x-6 gap-y-2 py-4 pl-4 transition-colors hover:bg-[var(--paper-2)] sm:grid-cols-[11rem_1fr]"
                >
                  <div className="min-w-0">
                    <p
                      className="tnum text-[0.9375rem] font-semibold text-[var(--accent)]"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {d.number}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--ink-3)]">
                      {t.type[d.type]}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <h2
                      className="text-[1.125rem] leading-snug transition-colors group-hover:text-[var(--accent)]"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {d.title[lang]}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                      {states ? (
                        <ValidityBadge
                          state={states.get(d.id)!.state}
                          amended={states.get(d.id)!.amended}
                          lang={lang}
                        />
                      ) : (
                        <StatusBadge status={d.status} lang={lang} size="sm" />
                      )}
                      <span className="tnum text-xs text-[var(--ink-3)]">
                        {t.doc.effectiveOn}:{" "}
                        {formatDate(d.effectiveOn, lang, t.doc.unknownDate)}
                      </span>
                      {d.domains.map((id) => (
                        <DomainChip key={id} id={id} lang={lang} />
                      ))}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
