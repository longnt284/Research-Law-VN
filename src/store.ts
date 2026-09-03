import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DocStatus, DocType } from "./data/laws";

export type View =
  | { name: "home" }
  | { name: "results"; query: string }
  | { name: "detail"; lawId: string; articleId?: string; tab?: "content" | "related" | "history" | "map" }
  | { name: "graph" }
  | { name: "compare"; a?: string; b?: string }
  | { name: "saved" };

export interface Filters {
  types: DocType[];
  statuses: DocStatus[];
  fields: string[];
  yearBucket: "all" | "old" | "mid" | "new";
}

export interface HistoryItem {
  kind: "law" | "article";
  lawId: string;
  articleId?: string;
  label: string;
  sub: string;
  at: number;
}

const emptyFilters: Filters = { types: [], statuses: [], fields: [], yearBucket: "all" };

interface AppState {
  view: View;
  nav: (v: View) => void;

  filters: Filters;
  toggleFilter: (group: "types" | "statuses" | "fields", value: string) => void;
  setYearBucket: (b: Filters["yearBucket"]) => void;
  resetFilters: () => void;
  sort: "relevance" | "newest";
  setSort: (s: "relevance" | "newest") => void;

  graphMode: "3d" | "2d";
  setGraphMode: (m: "3d" | "2d") => void;
  focusLawId: string | null;
  setFocusLawId: (id: string | null) => void;

  bookmarks: string[];
  toggleBookmark: (lawId: string) => void;
  articleMarks: string[];
  toggleArticleMark: (key: string) => void;
  notes: Record<string, string>;
  setNote: (lawId: string, text: string) => void;

  history: HistoryItem[];
  pushHistory: (item: Omit<HistoryItem, "at">) => void;
  clearHistory: () => void;

  fontSize: 0 | 1 | 2;
  setFontSize: (f: 0 | 1 | 2) => void;

  reducedMotion: boolean;
  setReducedMotion: (b: boolean) => void;

  toast: { msg: string; id: number } | null;
  showToast: (msg: string) => void;
  dismissToast: () => void;
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      view: { name: "home" },
      nav: (v) => set({ view: v }),

      filters: emptyFilters,
      toggleFilter: (group, value) =>
        set((s) => {
          const arr = s.filters[group] as string[];
          const next = arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value];
          return { filters: { ...s.filters, [group]: next } };
        }),
      setYearBucket: (b) => set((s) => ({ filters: { ...s.filters, yearBucket: b } })),
      resetFilters: () => set({ filters: emptyFilters }),
      sort: "relevance",
      setSort: (sort) => set({ sort }),

      graphMode: "3d",
      setGraphMode: (m) => set({ graphMode: m }),
      focusLawId: null,
      setFocusLawId: (id) => set({ focusLawId: id }),

      bookmarks: [],
      toggleBookmark: (lawId) =>
        set((s) => ({
          bookmarks: s.bookmarks.includes(lawId)
            ? s.bookmarks.filter((b) => b !== lawId)
            : [...s.bookmarks, lawId],
        })),
      articleMarks: [],
      toggleArticleMark: (key) =>
        set((s) => ({
          articleMarks: s.articleMarks.includes(key)
            ? s.articleMarks.filter((k) => k !== key)
            : [...s.articleMarks, key],
        })),
      notes: {},
      setNote: (lawId, text) => set((s) => ({ notes: { ...s.notes, [lawId]: text } })),

      history: [],
      pushHistory: (item) =>
        set((s) => {
          const key = `${item.kind}:${item.lawId}:${item.articleId ?? ""}`;
          const rest = s.history.filter((h) => `${h.kind}:${h.lawId}:${h.articleId ?? ""}` !== key);
          return { history: [{ ...item, at: Date.now() }, ...rest].slice(0, 30) };
        }),
      clearHistory: () => set({ history: [] }),

      fontSize: 1,
      setFontSize: (f) => set({ fontSize: f }),

      reducedMotion: false,
      setReducedMotion: (b) => set({ reducedMotion: b }),

      toast: null,
      showToast: (msg) => set({ toast: { msg, id: Date.now() } }),
      dismissToast: () => set({ toast: null }),
    }),
    {
      name: "legal-atlas-v1",
      partialize: (s) => ({
        bookmarks: s.bookmarks,
        articleMarks: s.articleMarks,
        notes: s.notes,
        history: s.history,
        graphMode: s.graphMode,
        fontSize: s.fontSize,
      }),
    }
  )
);

export const filtersActive = (f: Filters) =>
  f.types.length > 0 || f.statuses.length > 0 || f.fields.length > 0 || f.yearBucket !== "all";

export const applyFilters = <T extends { type: DocType; status: DocStatus; field: string; issuedDate: string }>(
  laws: T[],
  f: Filters
) =>
  laws.filter((l) => {
    if (f.types.length && !f.types.includes(l.type)) return false;
    if (f.statuses.length && !f.statuses.includes(l.status)) return false;
    if (f.fields.length && !f.fields.includes(l.field)) return false;
    const y = parseInt(l.issuedDate.slice(0, 4), 10);
    if (f.yearBucket === "old" && y >= 2010) return false;
    if (f.yearBucket === "mid" && (y < 2010 || y > 2019)) return false;
    if (f.yearBucket === "new" && y < 2020) return false;
    return true;
  });
