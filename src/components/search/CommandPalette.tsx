"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { AnswerCard, ArticleRow, docHref, IndexStatus, ResultRow } from "@/components/search/results";
import { useSearchIndex, useSearchOutcome } from "@/components/search/useSearchIndex";
import type { Lang } from "@/data/types";
import { formatDate, getDict } from "@/i18n/dictionary";
import { getSearchCopy } from "@/i18n/search";
import {
  isIsoDate,
  pushRecentSearch,
  setAsOf,
  todayIso,
  useAsOf,
  useFollowed,
  useRecentDocs,
  withAsOf,
} from "@/lib/client-store";
import { fold } from "@/lib/search-engine";
import type { IndexDoc } from "@/lib/search-types";

/**
 * Bảng lệnh: Ctrl K hoặc ⌘ K ở mọi trang.
 *
 * Một ô gõ duy nhất để tới bất cứ đâu: văn bản (cùng bộ máy với ô tìm ở trang
 * chủ), điều khoản đã đọc, các trang, lĩnh vực, văn bản vừa xem, văn bản đang
 * theo dõi, và vài thao tác như đặt ngày tra cứu hay đổi nền. Người làm nghề mở
 * trang này nhiều lần một ngày, và bàn phím nhanh hơn chuột.
 *
 * Thành phần này chỉ được nạp khi bảng mở lần đầu, xem `PaletteHost`.
 */

type Cmd = {
  key: string;
  group: string;
  label: string;
  hint?: string;
  doc?: IndexDoc;
  run: () => void;
};

export default function CommandPalette({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const t = getDict(lang);
  const s = getSearchCopy(lang);
  const g = s.palette.groups;
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [dateMode, setDateMode] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const asOf = useAsOf();
  const recent = useRecentDocs();
  const followed = useFollowed();
  const idx = useSearchIndex(lang, true);
  const data = idx.status === "ready" ? idx.data : null;
  const out = useSearchOutcome(data, dateMode ? "" : query);
  const date = out?.q.date || asOf || undefined;

  const other: Lang = lang === "vi" ? "en" : "vi";

  useEffect(() => {
    inputRef.current?.focus();
    const prev = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, []);

  const go = (href: string) => {
    if (query.trim() && !dateMode) pushRecentSearch(query);
    onClose();
    router.push(href);
  };

  const pages = useMemo(
    () => [
      { href: `/${lang}/van-ban`, label: s.nav.lookup, hint: t.list.title },
      { href: `/${lang}/linh-vuc`, label: s.nav.explore, hint: t.domainPage.title },
      { href: `/${lang}/doi-chieu`, label: s.nav.compare, hint: t.compare.title },
      { href: `/${lang}/thay-doi`, label: s.nav.changes, hint: "" },
      { href: `/${lang}/theo-doi`, label: s.nav.watch, hint: "" },
      { href: `/${lang}/phuong-phap`, label: s.nav.method, hint: t.about.title },
      { href: `/${lang}`, label: t.nav.home, hint: t.siteName },
    ],
    [lang, s, t],
  );

  const commands: Cmd[] = useMemo(() => {
    const f = fold(query.trim());
    const match = (...xs: string[]) => !f || xs.some((x) => fold(x).includes(f));
    const list: Cmd[] = [];

    const docCmd = (doc: IndexDoc, group: string): Cmd => ({
      key: `${group}:${doc.id}`,
      group,
      label: doc.n,
      doc,
      run: () => go(docHref(lang, doc.id, asOf)),
    });

    if (!query.trim() && data) {
      for (const id of recent.slice(0, 5)) {
        const d = data.byId.get(id);
        if (d) list.push(docCmd(d, g.recent));
      }
      for (const fl of followed.slice(0, 5)) {
        const d = data.byId.get(fl.id);
        if (d) list.push(docCmd(d, g.followed));
      }
    }

    if (out) {
      for (const a of out.articles.slice(0, 4)) {
        list.push({
          key: `a:${a.href}`,
          group: g.articles,
          label: a.label,
          hint: `${a.topic} · ${a.pair}`,
          run: () => go(withAsOf(a.href, asOf)),
        });
      }
      for (const h of out.hits.slice(0, 8)) list.push(docCmd(h.doc, g.docs));
    }

    for (const p of pages) {
      if (match(p.label, p.hint)) {
        list.push({ key: `p:${p.href}`, group: g.pages, label: p.label, hint: p.hint, run: () => go(p.href) });
      }
    }

    if (data) {
      for (const d of data.index.domains) {
        if (query.trim() && match(d.label, d.alt)) {
          list.push({
            key: `dm:${d.id}`,
            group: g.domains,
            label: d.label,
            hint: `${d.count} ${t.home.statsDocs}`,
            run: () => go(`/${lang}/linh-vuc/${d.id}`),
          });
        }
      }
    }

    const actions: Cmd[] = [
      {
        key: "x:date",
        group: g.actions,
        label: s.palette.actions.setDate,
        run: () => {
          setDateMode(true);
          setQuery(asOf || todayIso());
        },
      },
      ...(asOf
        ? [
            {
              key: "x:nodate",
              group: g.actions,
              label: s.palette.actions.clearDate,
              hint: formatDate(asOf, lang, asOf),
              run: () => {
                setAsOf("");
                onClose();
              },
            },
          ]
        : []),
      {
        key: "x:theme",
        group: g.actions,
        label: s.palette.actions.theme,
        run: () => {
          const root = document.documentElement;
          const dark =
            root.dataset.theme === "dark" ||
            (!root.dataset.theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
          const next = dark ? "light" : "dark";
          root.dataset.theme = next;
          try {
            localStorage.setItem("theme", next);
          } catch {
            // Không nhớ được lựa chọn thì nền vẫn đổi cho lần xem này.
          }
          onClose();
        },
      },
      {
        key: "x:lang",
        group: g.actions,
        label: s.palette.actions.lang,
        run: () => {
          const path = window.location.pathname.replace(/^\/(vi|en)/, `/${other}`);
          go(path + window.location.search);
        },
      },
      {
        key: "x:report",
        group: g.actions,
        label: s.palette.actions.report,
        run: () => go(`/${lang}/gop-y`),
      },
    ];
    for (const a of actions) if (match(a.label)) list.push(a);
    return list;
    // `go` đổi theo mỗi lần dựng nhưng chỉ đọc trạng thái hiện tại.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, out, data, recent, followed, pages, asOf, lang]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      if (dateMode) {
        setDateMode(false);
        setQuery("");
      } else onClose();
      return;
    }
    if (dateMode) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (commands.length ? (a + 1) % commands.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (commands.length ? (a - 1 + commands.length) % commands.length : 0));
    } else if (e.key === "Enter") {
      if ((e.nativeEvent as KeyboardEvent).isComposing) return;
      e.preventDefault();
      commands[active]?.run();
    } else if (e.key === "Tab") {
      // Giữ tiêu điểm trong hộp thoại.
      const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(
        'input, button, a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (!nodes || nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  let lastGroup = "";

  return (
    <div className="palette-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={s.palette.title}
        className="palette"
        onKeyDown={onKeyDown}
      >
        {dateMode ? (
          <form
            className="palette-date"
            onSubmit={(e) => {
              e.preventDefault();
              if (!isIsoDate(query)) return;
              setAsOf(query);
              onClose();
            }}
          >
            <label htmlFor="palette-date" className="eyebrow">
              {s.asOf.label}
            </label>
            <div className="palette-date-row">
              <input
                ref={inputRef}
                id="palette-date"
                type="date"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="tnum field"
                autoFocus
              />
              <button type="submit" className="btn btn-solid">
                {s.asOf.apply}
              </button>
              <button type="button" className="btn btn-quiet" onClick={() => setQuery(todayIso())}>
                {s.asOf.today}
              </button>
            </div>
            <p className="palette-hint">{s.asOf.hint}</p>
          </form>
        ) : (
          <>
            <div className="palette-field">
              <svg viewBox="0 0 20 20" aria-hidden="true" className="search-icon">
                <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <path d="M12.6 12.6 17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input
                ref={inputRef}
                type="search"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={commands[active] ? `palette-opt-${active}` : undefined}
                aria-label={s.palette.placeholder}
                placeholder={s.palette.placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                className="palette-input"
              />
              <button type="button" className="palette-esc" onClick={onClose}>
                Esc
              </button>
            </div>

            <div ref={listRef} className="palette-body thin-scroll">
              {idx.status === "loading" && <p className="search-note">{s.search.loading}</p>}
              {idx.status === "error" && <p className="search-note">{s.search.failed}</p>}
              {out?.focus && (
                <AnswerCard
                  doc={out.focus}
                  intent={out.q.intent}
                  date={out.q.date}
                  asOf={asOf}
                  lang={lang}
                  onNavigate={onClose}
                />
              )}
              <ul id="palette-list" role="listbox" aria-label={s.palette.title}>
                {commands.map((c, i) => {
                  const head = c.group !== lastGroup;
                  lastGroup = c.group;
                  return (
                    <li key={c.key} role="presentation">
                      {head && <p className="sr-group">{c.group}</p>}
                      <div
                        id={`palette-opt-${i}`}
                        data-index={i}
                        role="option"
                        aria-selected={i === active}
                        className={`sr-opt${i === active ? " is-active" : ""}`}
                        onMouseMove={() => setActive(i)}
                        onClick={() => c.run()}
                      >
                        {c.doc && c.group === g.docs && out ? (
                          <span className="sr-link">
                            <ResultRow
                              hit={out.hits.find((h) => h.doc.id === c.doc!.id)!}
                              lang={lang}
                              terms={out.terms}
                              date={date}
                            />
                          </span>
                        ) : c.doc ? (
                          <span className="sr-link sr-compact">
                            <span className="sr-num tnum">{c.doc.n}</span>
                            <span className="sr-title">{c.doc.t}</span>
                            <span className="sr-meta">
                              <IndexStatus doc={c.doc} date={asOf || undefined} lang={lang} />
                            </span>
                          </span>
                        ) : c.key.startsWith("a:") ? (
                          <span className="sr-link">
                            <ArticleRow
                              a={out!.articles.find((a) => `a:${a.href}` === c.key)!}
                            />
                          </span>
                        ) : (
                          <span className="sr-link sr-compact">
                            <span className="sr-cmd">{c.label}</span>
                            {c.hint && <span className="sr-cmd-hint">{c.hint}</span>}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              {query.trim() && commands.length === 0 && idx.status === "ready" && (
                <p className="search-note">{s.palette.empty}</p>
              )}
            </div>
            <p className="palette-foot" aria-hidden="true">
              {s.palette.footer}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
