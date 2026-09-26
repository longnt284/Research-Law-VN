"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { AnswerCard, ArticleRow, docHref, ResultRow } from "@/components/search/results";
import { useSearchIndex, useSearchOutcome } from "@/components/search/useSearchIndex";
import type { Lang } from "@/data/types";
import { formatDate } from "@/i18n/dictionary";
import { getSearchCopy } from "@/i18n/search";
import {
  clearRecentSearches,
  pushRecentSearch,
  useAsOf,
  useRecentSearches,
  withAsOf,
} from "@/lib/client-store";
import { stateAt } from "@/lib/search-engine";

/**
 * Ô tìm kiếm chính của trang.
 *
 * Đây là giao diện chính của cả sản phẩm: gõ số hiệu, tên văn bản, điều khoản
 * hoặc một câu hỏi, và kết quả hiện ngay dưới ô cùng tình trạng hiệu lực, văn
 * bản thay thế, văn bản sửa đổi, số văn bản hướng dẫn — người đọc không phải mở
 * trang văn bản mới biết nó còn dùng được hay không.
 *
 * Theo mẫu combobox của WAI-ARIA: phím mũi tên chọn, Enter mở, Esc đóng. Chỉ
 * mục chỉ được tải khi người đọc chạm vào ô.
 */

const MAX_HITS = 8;

type Item =
  | { kind: "doc"; key: string; href: string }
  | { kind: "article"; key: string; href: string }
  | { kind: "all"; key: string; href: string }
  | { kind: "suggest"; key: string; text: string };

export function SearchBox({
  lang,
  id: idProp,
  variant = "hero",
  onNavigate,
  autoFocus = false,
}: {
  lang: Lang;
  id?: string;
  variant?: "hero" | "inline";
  onNavigate?: () => void;
  autoFocus?: boolean;
}) {
  const s = getSearchCopy(lang).search;
  const router = useRouter();
  const autoId = useId();
  const id = idProp ?? `search-${autoId.replace(/:/g, "")}`;
  const listId = `${id}-list`;

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const [active, setActive] = useState(-1);
  const [example, setExample] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const asOf = useAsOf();
  const recent = useRecentSearches();
  const idx = useSearchIndex(lang, touched);
  const out = useSearchOutcome(idx.status === "ready" ? idx.data : null, query);
  const date = out?.q.date || asOf || undefined;

  // Ví dụ trong ô đổi dần khi ô còn trống và chưa được chạm vào. Người đã tắt
  // chuyển động thì giữ nguyên ví dụ đầu.
  useEffect(() => {
    if (open || query) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setExample((n) => (n + 1) % s.examples.length),
      3600,
    );
    return () => window.clearInterval(timer);
  }, [open, query, s.examples.length]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const hits = useMemo(() => out?.hits.slice(0, MAX_HITS) ?? [], [out]);

  const items: Item[] = useMemo(() => {
    if (!query.trim()) {
      return recent.map((r) => ({ kind: "suggest" as const, key: `r:${r}`, text: r })).concat(
        s.examples
          .filter((e) => !recent.includes(e))
          .slice(0, 4)
          .map((e) => ({ kind: "suggest" as const, key: `e:${e}`, text: e })),
      );
    }
    if (!out) return [];
    const list: Item[] = [
      ...out.articles.slice(0, 4).map((a) => ({
        kind: "article" as const,
        key: `a:${a.href}`,
        href: withAsOf(a.href, asOf),
      })),
      ...hits.map((h) => ({ kind: "doc" as const, key: `d:${h.doc.id}`, href: docHref(lang, h.doc.id, asOf) })),
    ];
    if (out.hits.length > 0) {
      list.push({
        kind: "all",
        key: "all",
        href: withAsOf(`/${lang}/van-ban?q=${encodeURIComponent(query.trim())}`, date ?? ""),
      });
    }
    return list;
  }, [query, out, hits, recent, s.examples, lang, asOf, date]);

  useEffect(() => setActive(-1), [query]);

  const go = (href: string) => {
    pushRecentSearch(query);
    setOpen(false);
    onNavigate?.();
    router.push(href);
  };

  const choose = (item: Item) => {
    if (item.kind === "suggest") {
      setQuery(item.text);
      inputRef.current?.focus();
      return;
    }
    go(item.href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (items.length ? (a + 1) % items.length : -1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (items.length ? (a <= 0 ? items.length - 1 : a - 1) : -1));
    } else if (e.key === "Enter") {
      if (e.nativeEvent.isComposing) return;
      e.preventDefault();
      if (active >= 0 && items[active]) return choose(items[active]);
      if (out?.focus) return go(docHref(lang, out.focus.id, asOf));
      const first = items.find((x) => x.kind !== "suggest");
      if (first) choose(first);
    } else if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        setOpen(false);
      } else if (query) {
        setQuery("");
      }
    }
  };

  const showPanel = open && (items.length > 0 || !!query.trim());
  const activeId = active >= 0 && items[active] ? `${id}-opt-${active}` : undefined;
  const inForce =
    out && out.q.date
      ? out.hits.filter((h) => stateAt(h.doc, out.q.date!).state === "in-force").length
      : 0;

  const optionProps = (item: Item, i: number) => {
    return {
      id: `${id}-opt-${i}`,
      role: "option" as const,
      "aria-selected": active === i,
      className: `sr-opt${active === i ? " is-active" : ""}`,
      onMouseEnter: () => setActive(i),
      onClick: (e: React.MouseEvent) => {
        // Liên kết bên trong vẫn nhận Ctrl/⌘ + bấm để mở thẻ mới.
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        choose(item);
      },
    };
  };

  return (
    <div
      className={`search search--${variant}${showPanel ? " is-open" : ""}`}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <label htmlFor={id} className="sr-only">
        {s.label}
      </label>
      <div className="search-field">
        <svg viewBox="0 0 20 20" aria-hidden="true" className="search-icon">
          <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12.6 12.6 17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          id={id}
          type="search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          value={query}
          placeholder={open ? s.placeholder : s.examples[example] ?? s.placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setTouched(true);
            setOpen(true);
          }}
          onPointerEnter={() => setTouched(true)}
          onKeyDown={onKeyDown}
          className="search-input"
        />
        {query && (
          <button
            type="button"
            className="search-clear"
            aria-label={s.clear}
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            ×
          </button>
        )}
      </div>

      {showPanel && (
        <div className="search-panel thin-scroll" onMouseDown={(e) => e.preventDefault()}>
          {query.trim() && idx.status === "loading" && <p className="search-note">{s.loading}</p>}
          {query.trim() && idx.status === "error" && (
            <p className="search-note">
              {s.failed}{" "}
              <button type="button" className="ref-link" onClick={idx.retry}>
                ↻
              </button>
            </p>
          )}

          {out?.focus && (
            <AnswerCard
              doc={out.focus}
              intent={out.q.intent}
              date={out.q.date}
              asOf={asOf}
              lang={lang}
              onNavigate={() => {
                pushRecentSearch(query);
                setOpen(false);
                onNavigate?.();
              }}
            />
          )}

          {out?.q.date && out.hits.length > 0 && (
            <p className="search-note search-note--date">
              <strong>{s.atDate(formatDate(out.q.date, lang, out.q.date))}</strong>
              {" · "}
              {s.atDateSummary(inForce, out.hits.length)}
            </p>
          )}

          <ul id={listId} role="listbox" aria-label={s.label} className="search-list">
            {!query.trim() && recent.length > 0 && (
              <li role="presentation" className="sr-group">
                <span>{s.recentSearches}</span>
                <button type="button" className="sr-group-action" onClick={clearRecentSearches}>
                  {s.clear}
                </button>
              </li>
            )}
            {items.map((item, i) => {
              if (item.kind === "suggest") {
                return (
                  <li key={item.key} {...optionProps(item, i)}>
                    <span className="sr-suggest">{item.text}</span>
                  </li>
                );
              }
              if (item.kind === "article") {
                const a = out!.articles.find((x) => `a:${x.href}` === item.key)!;
                return (
                  <li key={item.key} {...optionProps(item, i)}>
                    <Link href={item.href} tabIndex={-1} className="sr-link">
                      <span className="sr-kicker">{s.articles}</span>
                      <ArticleRow a={a} />
                    </Link>
                  </li>
                );
              }
              if (item.kind === "all") {
                return (
                  <li key={item.key} {...optionProps(item, i)}>
                    <Link href={item.href} tabIndex={-1} className="sr-link sr-all">
                      {s.seeAll} <span className="tnum">({out!.hits.length})</span> →
                    </Link>
                  </li>
                );
              }
              const hit = hits.find((h) => `d:${h.doc.id}` === item.key)!;
              return (
                <li key={item.key} {...optionProps(item, i)}>
                  <Link href={item.href} tabIndex={-1} className="sr-link">
                    <ResultRow hit={hit} lang={lang} terms={out!.terms} date={date} />
                  </Link>
                </li>
              );
            })}
          </ul>

          {query.trim() && idx.status === "ready" && out && out.hits.length === 0 && out.articles.length === 0 && (
            <div className="search-empty">
              <p className="search-empty-title">{s.empty}</p>
              <p>{s.emptyHint}</p>
              <Link
                href={`/${lang}/gop-y?loai=bo-sung&q=${encodeURIComponent(query.trim())}`}
                className="ref-link"
              >
                {s.request} →
              </Link>
            </div>
          )}

          {out?.q.date && out.hits.length > 0 && (
            <p className="search-note">
              <Link
                href={withAsOf(`/${lang}/van-ban`, out.q.date)}
                className="ref-link"
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
              >
                {s.atDateAll} →
              </Link>
            </p>
          )}

          <p className="search-keys" aria-hidden="true">
            {s.keys}
          </p>
        </div>
      )}
    </div>
  );
}
