"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { DocType, DomainId, Lang } from "@/data/types";
import { getDict } from "@/i18n/dictionary";
import {
  articleHits,
  focusOf,
  parseQuery,
  prepare,
  search,
  stateAt,
  type Hit,
  type ParsedQuery,
  type Prepared,
} from "@/lib/search-engine";
import type { IndexDoc, SearchIndex } from "@/lib/search-types";
import type { ArticleEntry } from "@/lib/article-query";

/**
 * Nạp chỉ mục tìm kiếm một lần cho mỗi thứ tiếng.
 *
 * Tệp chỉ mục là JSON tĩnh dựng lúc build. Nó chỉ được tải khi người đọc chạm
 * vào ô tìm hoặc mở bảng lệnh, và mọi ô tìm trên trang dùng chung một lần tải.
 */

export interface LoadedIndex {
  index: SearchIndex;
  prepared: Prepared[];
  byId: Map<string, IndexDoc>;
}

const cache = new Map<Lang, Promise<LoadedIndex>>();

function typeLabels(): Record<DocType, string> {
  const vi = getDict("vi").type;
  const en = getDict("en").type;
  const out = {} as Record<DocType, string>;
  for (const k of Object.keys(vi) as DocType[]) out[k] = `${vi[k]} ${en[k]}`;
  return out;
}

export function loadIndex(lang: Lang): Promise<LoadedIndex> {
  let p = cache.get(lang);
  if (!p) {
    p = fetch(`/${lang}/search-index.json`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<SearchIndex>;
      })
      .then((index) => {
        const domainLabels: Partial<Record<DomainId, string>> = {};
        for (const d of index.domains) domainLabels[d.id] = `${d.label} ${d.alt}`;
        return {
          index,
          prepared: prepare(index, typeLabels(), domainLabels),
          byId: new Map(index.docs.map((d) => [d.id, d])),
        };
      });
    // Lần tải hỏng không được giữ lại, để lần chạm sau thử lại được.
    p.catch(() => cache.delete(lang));
    cache.set(lang, p);
  }
  return p;
}

export type IndexState =
  | { status: "idle" | "loading" | "error"; data: null }
  | { status: "ready"; data: LoadedIndex };

/** Trạng thái nạp chỉ mục. `enabled` bật lần tải đầu tiên. */
export function useSearchIndex(lang: Lang, enabled: boolean) {
  const [state, setState] = useState<IndexState>({ status: "idle", data: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    setState((s) => (s.status === "ready" ? s : { status: "loading", data: null }));
    loadIndex(lang)
      .then((data) => alive && setState({ status: "ready", data }))
      .catch(() => alive && setState({ status: "error", data: null }));
    return () => {
      alive = false;
    };
  }, [lang, enabled, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, retry };
}

export interface SearchOutcome {
  q: ParsedQuery;
  hits: Hit[];
  focus: IndexDoc | null;
  articles: ArticleEntry[];
  /** Từ dùng để tô chỗ khớp. */
  terms: string[];
}

export function useSearchOutcome(data: LoadedIndex | null, query: string): SearchOutcome | null {
  return useMemo(() => {
    if (!data || query.trim().length === 0) return null;
    const q = parseQuery(query);
    let hits = search(data.prepared, q);
    const focus = focusOf(hits);
    // Câu hỏi có ngày ("luật nào áp dụng ngày…"): văn bản đang có hiệu lực vào
    // ngày đó lên trước, giữ nguyên thứ tự trong từng nhóm.
    if (q.date) {
      const rank = { "in-force": 0, pending: 1, expired: 2, unknown: 3 } as const;
      const at = q.date;
      hits = hits
        .map((h, i) => ({ h, i, r: rank[stateAt(h.doc, at).state] }))
        .sort((a, b) => a.r - b.r || a.i - b.i)
        .map((x) => x.h);
    }
    return {
      q,
      hits,
      focus,
      articles: articleHits(data.index.articles, q, hits),
      terms: [...q.nums, ...q.words],
    };
  }, [data, query]);
}
