"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { Lang } from "@/data/types";
import { getDict } from "@/i18n/dictionary";
import { getSearchCopy } from "@/i18n/search";
import { search, type SearchItem, type SearchKind } from "@/lib/search";

/** Chỉ mục đã tải, giữ suốt phiên để mở lại hộp tìm không phải tải lần nữa. */
const cache = new Map<Lang, Promise<SearchItem[]>>();

function loadIndex(lang: Lang): Promise<SearchItem[]> {
  let p = cache.get(lang);
  if (!p) {
    p = fetch(`/${lang}/tim-kiem.json`).then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.json() as Promise<SearchItem[]>;
    });
    // Lỗi mạng không được giữ lại trong bộ nhớ đệm: lần mở sau thử tải lại.
    p.catch(() => cache.delete(lang));
    cache.set(lang, p);
  }
  return p;
}

const FILTERS: (SearchKind | "all")[] = ["all", "doc", "article", "pair", "domain"];

/** Đang gõ trong một ô nhập thì phím `/` là một ký tự, không phải phím tắt. */
function typing(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

/**
 * Hộp tìm toàn trang.
 *
 * Mở bằng nút trên thanh điều hướng, phím `/` hoặc Ctrl+K (⌘K trên máy Mac).
 * Hộp là một `<dialog>` gốc của trình duyệt: giữ tiêu điểm bên trong, đóng bằng
 * Esc, và trả tiêu điểm về nút mở khi đóng. Ô nhập theo mẫu combobox của ARIA:
 * mũi tên lên xuống đổi mục đang chọn mà tiêu điểm vẫn ở ô nhập, nên người đọc
 * gõ tiếp được ngay.
 */
export function GlobalSearch({ lang }: { lang: Lang }) {
  const c = getSearchCopy(lang);
  const t = getDict(lang);
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();

  const [items, setItems] = useState<SearchItem[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<SearchKind | "all">("all");
  const [active, setActive] = useState(0);
  // Hộp thoại gắn thẳng vào <body> chứ không nằm trong thanh điều hướng. Trên
  // điện thoại thanh điều hướng là một dải cuộn ngang, và ô nhập nằm trong dải
  // đó thì khi nhận tiêu điểm trình duyệt kéo cả dải lẫn khung nhìn đi theo.
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => setHost(document.body), []);

  const open = useCallback(() => {
    const d = dialog.current;
    if (!d || d.open) return;
    d.showModal();
    input.current?.select();
    setFailed(false);
    loadIndex(lang)
      .then(setItems)
      .catch(() => setFailed(true));
  }, [lang]);

  const close = useCallback(() => dialog.current?.close(), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        open();
      } else if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey && !typing(e.target)) {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const results = useMemo(() => {
    if (!items) return [];
    if (!query.trim()) {
      // Chưa gõ gì: gợi ý các trang công cụ, để hộp tìm cũng là một lối đi nhanh.
      return items.filter((i) => i.kind === "page").map((item) => ({ item, score: 0 }));
    }
    return search(items, query, kind);
  }, [items, query, kind]);

  const go = (href: string) => {
    close();
    router.push(href);
  };

  const seeAll = `/${lang}/van-ban?q=${encodeURIComponent(query.trim())}`;
  const optionId = (i: number) => `${listId}-o${i}`;

  const panel = (
    <dialog
      ref={dialog}
      className="search-dialog"
      aria-label={c.label}
      onClose={() => {
        setQuery("");
        setActive(0);
      }}
      onClick={(e) => {
        // Bấm ra vùng tối quanh hộp thì đóng, như mọi hộp thoại quen thuộc.
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="search-panel">
        <div className="search-row">
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" className="shrink-0 text-[var(--ink-3)]">
            <circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M10.4 10.4 14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            ref={input}
            type="text"
            enterKeyHint="search"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={results.length > 0 ? optionId(active) : undefined}
            aria-label={c.label}
            placeholder={c.placeholder}
            value={query}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                const hit = results[active];
                if (hit) go(hit.item.href);
                else if (query.trim()) go(seeAll);
              }
            }}
            className="search-input"
          />
          <button type="button" onClick={close} className="chip shrink-0">
            {c.close}
          </button>
        </div>

        <div className="search-filters" role="group" aria-label={c.filter}>
          {FILTERS.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kind === k}
              className="chip"
              onClick={() => {
                setKind(k);
                setActive(0);
                input.current?.focus();
              }}
            >
              {k === "all" ? c.all : c.kind[k]}
            </button>
          ))}
        </div>

        <div className="search-body">
          {failed ? (
            <p className="search-note">{c.failed}</p>
          ) : !items ? (
            <p className="search-note">{c.loading}</p>
          ) : results.length === 0 ? (
            <p className="search-note">{c.empty(query.trim())}</p>
          ) : (
            <>
              <p className="search-count" aria-live="polite">
                {query.trim() ? c.count(results.length) : c.suggestions}
              </p>
              <ul id={listId} role="listbox" aria-label={c.label} className="search-list">
                {results.map(({ item }, i) => (
                  <li
                    key={item.href}
                    id={optionId(i)}
                    role="option"
                    aria-selected={i === active}
                    className="search-option"
                    onMouseMove={() => setActive(i)}
                    onClick={() => go(item.href)}
                  >
                    <span className="search-kind">{c.kind[item.kind]}</span>
                    <span className="min-w-0">
                      <span className="search-title">{item.title}</span>
                      <span className="search-sub">
                        {item.sub}
                        {item.status && ` · ${t.status[item.status]}`}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div className="search-foot">
          <span className="hidden sm:inline">{c.hint}</span>
          {query.trim() && (
            <a
              href={seeAll}
              onClick={(e) => {
                e.preventDefault();
                go(seeAll);
              }}
              className="link-sweep text-[var(--accent)]"
            >
              {c.seeAll(query.trim())} →
            </a>
          )}
        </div>
      </div>
    </dialog>
  );

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="search-trigger"
        aria-haspopup="dialog"
        aria-label={c.label}
      >
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
          <circle cx="7" cy="7" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10.4 10.4 14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <span>{c.open}</span>
        <kbd className="search-kbd" aria-hidden="true">/</kbd>
      </button>

      {host && createPortal(panel, host)}
    </>
  );
}
