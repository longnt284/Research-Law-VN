import { useEffect, useRef, useState } from "react";
import { useApp } from "../store";
import { suggest, Suggestion, setLastQuery } from "../lib/search";
import { IcSearch, IcScale, IcBookmark, IcCube, IcGrid, IcHistory, Kbd } from "./ui";
import { fmtDate, LAW_MAP } from "../data/laws";

export function SearchBar({ autoFocus = false, big = false }: { autoFocus?: boolean; big?: boolean }) {
  const nav = useApp((s) => s.nav);
  const history = useApp((s) => s.history);
  const toggleFilter = useApp((s) => s.toggleFilter);
  const filters = useApp((s) => s.filters);

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimer = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current && !/INPUT|TEXTAREA|SELECT/.test((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const suggestions: Suggestion[] = q.trim() ? suggest(q) : [];
  const flat: { kind: "sug"; s: Suggestion }[] = suggestions.map((s) => ({ kind: "sug", s }));

  const goTo = (s: Suggestion) => {
    setOpen(false);
    setQ("");
    setLastQuery(s.type === "field" ? "" : q.trim());
    if (s.type === "field" && s.fieldId) {
      if (!filters.fields.includes(s.fieldId)) toggleFilter("fields", s.fieldId);
      nav({ name: "results", query: "" });
      return;
    }
    nav({ name: "detail", lawId: s.lawId, articleId: s.articleId });
  };

  const submit = () => {
    if (active >= 0 && flat[active]) {
      goTo(flat[active].s);
      return;
    }
    setOpen(false);
    setLastQuery(q.trim());
    nav({ name: "results", query: q.trim() });
  };

  const typeMeta: Record<string, { label: string; color: string }> = {
    law: { label: "Văn bản", color: "#45c8ff" },
    article: { label: "Điều khoản", color: "#e5b054" },
    field: { label: "Lĩnh vực", color: "#6ee7a0" },
  };

  return (
    <div className="relative w-full">
      <div
        className={`flex items-center gap-2.5 rounded-lg border bg-[#070d18] transition-all duration-200 ${
          open ? "border-[rgba(69,200,255,0.55)] shadow-[0_0_0_3px_rgba(69,200,255,0.1),0_18px_44px_-18px_rgba(0,0,0,0.8)]" : "border-line"
        } ${big ? "px-4 py-3" : "px-3 py-2"}`}
      >
        <IcSearch size={big ? 18 : 15} className="shrink-0 text-dim" />
        <input
          ref={inputRef}
          id="global-search"
          value={q}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            blurTimer.current = window.setTimeout(() => setOpen(false), 140);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, flat.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, -1));
            } else if (e.key === "Enter") {
              submit();
            } else if (e.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
          placeholder="Tìm luật, số hiệu, điều khoản…  (vd: Điều 117 Bộ luật Dân sự)"
          className={`w-full bg-transparent text-fog outline-none placeholder:text-dim ${big ? "text-[15px]" : "text-[13.5px]"}`}
          aria-label="Tìm kiếm văn bản pháp luật"
          role="combobox"
          aria-expanded={open}
        />
        {!big && <Kbd>/</Kbd>}
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-[70] mt-2 overflow-hidden rounded-lg border border-line bg-[#0a1220fb] shadow-[0_28px_70px_-18px_rgba(0,0,0,0.9)]">
          {q.trim() && suggestions.length > 0 && (
            <ul role="listbox">
              {suggestions.map((s, i) => (
                <li key={`${s.type}-${s.lawId}-${s.articleId ?? ""}-${i}`} role="option" aria-selected={i === active}>
                  <button
                    className={`flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors ${i === active ? "bg-ink-700" : "hover:bg-ink-800"}`}
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      clearTimeout(blurTimer.current ?? undefined);
                      goTo(s);
                    }}
                  >
                    <span
                      className="w-[74px] shrink-0 rounded border px-1.5 py-0.5 text-center font-mono text-[9.5px] uppercase tracking-wide"
                      style={{ color: typeMeta[s.type].color, borderColor: `${typeMeta[s.type].color}40`, background: `${typeMeta[s.type].color}12` }}
                    >
                      {typeMeta[s.type].label}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium text-fog">{s.label}</span>
                      {s.sub && <span className="block truncate text-[11px] text-dim">{s.sub}</span>}
                    </span>
                  </button>
                </li>
              ))}
              <li className="border-t border-line-soft px-3.5 py-2 text-[11px] text-dim">
                <span className="font-mono">Enter</span> — xem tất cả kết quả · <span className="font-mono">↑↓</span> — di chuyển
              </li>
            </ul>
          )}

          {q.trim() && suggestions.length === 0 && (
            <div className="px-4 py-6 text-center text-[13px] text-dim">
              Không tìm thấy gợi ý nào cho “{q}”. Nhấn <span className="font-mono text-mist">Enter</span> để tìm đầy đủ.
            </div>
          )}

          {!q.trim() && (
            <div className="p-3.5">
              {history.length > 0 && (
                <>
                  <div className="eyebrow mb-2 flex items-center gap-2">
                    <IcHistory size={12} /> Gần đây
                  </div>
                  <div className="mb-3 space-y-0.5">
                    {history.slice(0, 4).map((h) => (
                      <button
                        key={h.at}
                        className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left transition hover:bg-ink-800"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          clearTimeout(blurTimer.current ?? undefined);
                          setOpen(false);
                          nav({ name: "detail", lawId: h.lawId, articleId: h.articleId });
                        }}
                      >
                        <span className="truncate text-[12.5px] text-mist">{h.label}</span>
                        <span className="shrink-0 font-mono text-[10px] text-dim">
                          {LAW_MAP[h.lawId]?.number ?? ""}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              <div className="eyebrow mb-2">Đề xuất phổ biến</div>
              <div className="flex flex-wrap gap-1.5">
                {["hợp đồng lao động", "thành lập doanh nghiệp", "thừa kế", "kết hôn", "sổ đỏ", "nồng độ cồn"].map((p) => (
                  <button
                    key={p}
                    className="chip transition hover:!border-[rgba(69,200,255,0.5)] hover:!text-fog"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      clearTimeout(blurTimer.current ?? undefined);
                      setOpen(false);
                      nav({ name: "results", query: p });
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const NAV = [
  { key: "home", label: "Trang chủ" },
  { key: "results", label: "Tra cứu" },
  { key: "graph", label: "Bản đồ luật" },
  { key: "compare", label: "So sánh" },
  { key: "saved", label: "Đã lưu" },
] as const;

export default function TopBar() {
  const view = useApp((s) => s.view);
  const nav = useApp((s) => s.nav);
  const graphMode = useApp((s) => s.graphMode);
  const setGraphMode = useApp((s) => s.setGraphMode);
  const bookmarks = useApp((s) => s.bookmarks);
  const articleMarks = useApp((s) => s.articleMarks);
  const showToast = useApp((s) => s.showToast);

  const activeKey = view.name === "detail" ? "results" : view.name;
  const savedCount = bookmarks.length + articleMarks.length;

  return (
    <header className="sticky top-0 z-[60] border-b border-line-soft bg-[#070d18e6] backdrop-blur-md">
      <div className="mx-auto flex max-w-[1480px] flex-wrap items-center gap-x-5 gap-y-2.5 px-4 py-3 sm:px-6">
        <button className="flex items-center gap-2.5" onClick={() => nav({ name: "home" })} aria-label="Về trang chủ">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-[rgba(229,176,84,0.45)] bg-[rgba(229,176,84,0.08)] text-gold">
            <IcScale size={19} />
          </span>
          <span className="text-left leading-none">
            <span className="font-display text-[19px] font-semibold tracking-tight text-fog">Legal Atlas</span>
            <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.24em] text-dim">Bản đồ pháp luật VN</span>
          </span>
        </button>

        <div className="order-3 w-full min-w-0 flex-1 basis-full lg:order-none lg:basis-auto">
          <SearchBar />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center rounded-lg border border-line bg-ink-800 p-0.5 sm:flex" role="tablist" aria-label="Chế độ bản đồ">
            <button
              role="tab"
              aria-selected={graphMode === "3d"}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11.5px] font-semibold transition ${graphMode === "3d" ? "bg-[#1b2c4d] text-fog" : "text-dim hover:text-mist"}`}
              onClick={() => setGraphMode("3d")}
            >
              <IcCube size={13} /> 3D
            </button>
            <button
              role="tab"
              aria-selected={graphMode === "2d"}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11.5px] font-semibold transition ${graphMode === "2d" ? "bg-[#1b2c4d] text-fog" : "text-dim hover:text-mist"}`}
              onClick={() => setGraphMode("2d")}
            >
              <IcGrid size={13} /> 2D
            </button>
          </div>

          <button className="btn !px-3" onClick={() => nav({ name: "saved" })} aria-label={`Đã lưu (${savedCount})`}>
            <IcBookmark size={14} filled={savedCount > 0} className={savedCount > 0 ? "text-gold" : ""} />
            <span className="hidden sm:inline">{savedCount > 0 ? savedCount : "Đã lưu"}</span>
          </button>
          <button
            className="btn hidden !px-3 md:inline-flex"
            onClick={() => showToast("Phím tắt: “/” để tìm kiếm · “Esc” để đóng · Nhấp đúp node để mở văn bản")}
            aria-label="Trợ giúp"
          >
            ?
          </button>
        </div>
      </div>

      <nav className="mx-auto flex max-w-[1480px] items-center gap-5 overflow-x-auto px-4 sm:px-6" aria-label="Điều hướng chính">
        {NAV.map((n) => (
          <button
            key={n.key}
            className={`tab-btn shrink-0 ${activeKey === n.key ? "active" : ""}`}
            onClick={() => nav(n.key === "results" ? { name: "results", query: "" } : ({ name: n.key } as any))}
          >
            {n.label}
            {n.key === "saved" && savedCount > 0 && <span className="ml-1.5 font-mono text-[10px] text-gold">({savedCount})</span>}
          </button>
        ))}
        <span className="ml-auto hidden shrink-0 items-center gap-1.5 pb-2 font-mono text-[10px] text-dim md:flex">
          <span className="anim-pulse-dot h-1.5 w-1.5 rounded-full bg-valid" />
          dữ liệu mô phỏng · {fmtDate("2026-02-01")}
        </span>
      </nav>
    </header>
  );
}
