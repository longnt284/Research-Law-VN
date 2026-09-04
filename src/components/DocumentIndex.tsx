"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

import { DomainChip, StatusBadge } from "@/components/DocMeta";
import { documents, domains } from "@/data/documents";
import type { DocType, DomainId, Lang } from "@/data/types";
import { formatDate, getDict } from "@/i18n/dictionary";

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

export function DocumentIndex({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState<DomainId | "all">("all");
  const [sort, setSort] = useState<"rank" | "recent">("rank");

  // Giữ ô nhập phản hồi tức thì kể cả khi danh sách bên dưới đang dựng lại.
  const deferred = useDeferredValue(query);

  const results = useMemo(() => {
    const q = fold(deferred.trim());
    let list = documents;
    if (domain !== "all") list = list.filter((d) => d.domains.includes(domain));
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
  }, [deferred, domain, sort, lang]);

  return (
    <>
      {/*
        Thanh lọc dính ngay dưới thanh điều hướng. Danh mục dài hơn một màn hình,
        và người đang cuộn giữa danh sách thường muốn đổi từ khóa ngay tại chỗ
        chứ không phải cuộn ngược lên đầu trang.
        Khoảng 3.3rem là chiều cao thanh điều hướng, cùng con số mà trang bản đồ
        dùng để tính chiều cao vùng vẽ.
      */}
      <div className="rule-b sticky top-[3.3rem] z-20 bg-[color-mix(in_oklab,var(--paper-2)_92%,transparent)] backdrop-blur-md">
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
          </div>

          <div className="scroll-x thin-scroll -mx-1 mt-3">
            <div className="flex items-center gap-1.5 px-1 pb-1">
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
        </p>

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
                      <StatusBadge status={d.status} lang={lang} size="sm" />
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
