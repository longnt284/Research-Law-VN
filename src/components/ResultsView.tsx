import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LAWS, DocStatus, DocType, FIELDS, fmtDate, countArticles } from "../data/laws";
import { searchAll, setLastQuery, LawResult, POPULAR_QUERIES } from "../lib/search";
import { useApp, applyFilters, filtersActive } from "../store";
import { StatusBadge, TypeChip, FieldChip, Highlight, IcSearch, IcCube, IcBookmark, IcArrow, IcFilter, IcX } from "./ui";
import TimelineBar from "./TimelineBar";

const STATUSES: DocStatus[] = ["active", "expiring", "expired"];
const TYPES: DocType[] = ["Hiến pháp", "Luật", "Nghị định", "Thông tư"];
const STATUS_LABEL: Record<DocStatus, string> = {
  active: "Đang hiệu lực",
  expiring: "Sắp hết hiệu lực",
  expired: "Hết hiệu lực",
};
const STATUS_COLOR: Record<DocStatus, string> = { active: "#3ad294", expiring: "#f2b63d", expired: "#f0716b" };

function CheckRow({ on, label, count, color, onClick }: { on: boolean; label: string; count: number; color?: string; onClick: () => void }) {
  return (
    <button className="group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition hover:bg-ink-700/60" onClick={onClick} aria-pressed={on}>
      <span
        className="grid h-[15px] w-[15px] shrink-0 place-items-center rounded-[4px] border transition"
        style={{ borderColor: on ? color ?? "#45c8ff" : "#2c4066", background: on ? (color ?? "#45c8ff") + "26" : "transparent" }}
      >
        {on && <span className="h-[7px] w-[7px] rounded-[2px]" style={{ background: color ?? "#45c8ff" }} />}
      </span>
      <span className={`flex-1 text-[12.5px] ${on ? "font-semibold text-fog" : "text-mist"}`}>{label}</span>
      <span className="font-mono text-[10px] text-dim">{count}</span>
    </button>
  );
}

export default function ResultsView({ query }: { query: string }) {
  const nav = useApp((s) => s.nav);
  const filters = useApp((s) => s.filters);
  const toggleFilter = useApp((s) => s.toggleFilter);
  const setYearBucket = useApp((s) => s.setYearBucket);
  const resetFilters = useApp((s) => s.resetFilters);
  const sort = useApp((s) => s.sort);
  const setSort = useApp((s) => s.setSort);
  const bookmarks = useApp((s) => s.bookmarks);
  const toggleBookmark = useApp((s) => s.toggleBookmark);
  const setFocusLawId = useApp((s) => s.setFocusLawId);
  const reduced = useApp((s) => s.reducedMotion);

  const [previewId, setPreviewId] = useState<string | null>(null);

  const all = useMemo(() => searchAll(query), [query]);
  const filtered = useMemo(() => {
    let list = all.filter((r) => applyFilters([r.law], filters).length > 0);
    if (sort === "newest") list = [...list].sort((a, b) => b.law.effectiveDate.localeCompare(a.law.effectiveDate));
    return list;
  }, [all, filters, sort]);

  const preview = previewId ? filtered.find((r) => r.law.id === previewId) : filtered[0];

  const countFor = (pred: (r: LawResult) => boolean) => all.filter(pred).length;
  const yearCount = (bucket: "old" | "mid" | "new") =>
    all.filter((r) => {
      const y = parseInt(r.law.issuedDate.slice(0, 4), 10);
      return bucket === "old" ? y < 2010 : bucket === "mid" ? y >= 2010 && y <= 2019 : y >= 2020;
    }).length;

  return (
    <div className="mx-auto grid max-w-[1480px] gap-6 px-4 py-7 sm:px-6 lg:grid-cols-[236px_minmax(0,1fr)_300px]">
      {/* ---------- filters ---------- */}
      <aside className="lg:sticky lg:top-[104px] lg:h-fit">
        <div className="panel p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2 text-[13px] font-semibold text-fog">
              <IcFilter size={14} className="text-legal" /> Bộ lọc
            </span>
            {filtersActive(filters) && (
              <button className="flex items-center gap-1 text-[11px] text-warn transition hover:text-gold-soft" onClick={resetFilters}>
                <IcX size={11} /> Xóa
              </button>
            )}
          </div>

          <div className="eyebrow mb-1.5 mt-3">Trạng thái hiệu lực</div>
          {STATUSES.map((st) => (
            <CheckRow
              key={st}
              on={filters.statuses.includes(st)}
              label={STATUS_LABEL[st]}
              count={countFor((r) => r.law.status === st)}
              color={STATUS_COLOR[st]}
              onClick={() => toggleFilter("statuses", st)}
            />
          ))}

          <div className="eyebrow mb-1.5 mt-4">Loại văn bản</div>
          {TYPES.map((t) => (
            <CheckRow
              key={t}
              on={filters.types.includes(t)}
              label={t}
              count={countFor((r) => r.law.type === t)}
              onClick={() => toggleFilter("types", t)}
            />
          ))}

          <div className="eyebrow mb-1.5 mt-4">Lĩnh vực</div>
          {FIELDS.map((f) => (
            <CheckRow
              key={f.id}
              on={filters.fields.includes(f.id)}
              label={f.name}
              count={countFor((r) => r.law.field === f.id)}
              color={f.color}
              onClick={() => toggleFilter("fields", f.id)}
            />
          ))}

          <div className="eyebrow mb-1.5 mt-4">Năm ban hành</div>
          {(
            [
              ["all", "Tất cả"],
              ["old", "Trước 2010"],
              ["mid", "2010 – 2019"],
              ["new", "2020 trở đi"],
            ] as const
          ).map(([k, label]) => (
            <CheckRow
              key={k}
              on={filters.yearBucket === k}
              label={label}
              count={k === "all" ? all.length : yearCount(k)}
              onClick={() => setYearBucket(k)}
            />
          ))}
        </div>
      </aside>

      {/* ---------- results ---------- */}
      <main>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-[24px] font-semibold text-fog">
              {query ? (
                <>
                  Kết quả cho <span className="text-gold">“{query}”</span>
                </>
              ) : (
                "Toàn bộ văn bản"
              )}
            </h1>
            <p className="mt-0.5 text-[12.5px] text-dim">
              {filtered.length} văn bản phù hợp{filtersActive(filters) ? " (đã áp dụng bộ lọc)" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11.5px] text-dim">Sắp xếp:</span>
            <div className="flex items-center rounded-lg border border-line bg-ink-800 p-0.5">
              {(
                [
                  ["relevance", "Liên quan"],
                  ["newest", "Mới nhất"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  className={`rounded-md px-2.5 py-1.5 text-[11.5px] font-semibold transition ${sort === k ? "bg-[#1b2c4d] text-fog" : "text-dim hover:text-mist"}`}
                  onClick={() => setSort(k)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="panel grid place-items-center px-6 py-16 text-center">
            <IcSearch size={34} className="mb-4 text-dim" />
            <div className="font-display text-[19px] font-semibold text-fog">Không tìm thấy văn bản phù hợp</div>
            <p className="mt-2 max-w-[46ch] text-[13px] leading-relaxed text-dim">
              Thử từ khóa rộng hơn (vd: “hợp đồng”, “đất đai”), bỏ bớt bộ lọc, hoặc bắt đầu từ một truy vấn phổ biến:
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {POPULAR_QUERIES.map((p) => (
                <button key={p} className="chip !py-1.5 transition hover:!border-[rgba(69,200,255,0.55)] hover:!text-fog" onClick={() => nav({ name: "results", query: p })}>
                  {p}
                </button>
              ))}
            </div>
            {filtersActive(filters) && (
              <button className="btn btn-gold mt-6" onClick={resetFilters}>
                Xóa toàn bộ bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3.5">
            {filtered.map((r, idx) => {
              const l = r.law;
              const saved = bookmarks.includes(l.id);
              return (
                <motion.article
                  key={l.id}
                  initial={reduced ? false : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.04, 0.3), duration: 0.4 }}
                  className="panel card-hover p-4 sm:p-5"
                  onMouseEnter={() => setPreviewId(l.id)}
                >
                  <div className="mb-2.5 flex flex-wrap items-center gap-2">
                    <TypeChip type={l.type} />
                    <FieldChip field={l.field} />
                    <StatusBadge status={l.status} />
                    <span className="ml-auto font-mono text-[10.5px] text-dim">{l.number}</span>
                  </div>
                  <button className="text-left" onClick={() => { setLastQuery(query); nav({ name: "detail", lawId: l.id }); }}>
                    <h2 className="font-display text-[19px] font-semibold leading-snug text-fog transition-colors hover:text-legal">
                      <Highlight text={l.name} query={query} />
                    </h2>
                  </button>
                  <p className="mt-1 font-mono text-[11px] text-dim">
                    {l.issuer} · ban hành {fmtDate(l.issuedDate)} · hiệu lực {fmtDate(l.effectiveDate)} · {countArticles(l)} điều khoản trích lục
                  </p>
                  <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-mist">
                    <Highlight text={l.summary} query={query} />
                  </p>

                  {r.articleHits.length > 0 && (
                    <div className="mt-3 space-y-1.5 border-t border-line-soft pt-3">
                      {r.articleHits.slice(0, 2).map((h) => (
                        <button
                          key={h.article.id}
                          className="group flex w-full items-start gap-2.5 rounded-md px-2 py-1.5 text-left transition hover:bg-ink-700/50"
                          onClick={() => { setLastQuery(query); nav({ name: "detail", lawId: l.id, articleId: h.article.id }); }}
                        >
                          <span className="mt-0.5 shrink-0 rounded border border-[rgba(229,176,84,0.4)] bg-[rgba(229,176,84,0.08)] px-1.5 py-0.5 font-mono text-[9.5px] font-semibold text-gold-soft">
                            Điều {h.article.number}
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[12.5px] font-semibold text-fog">
                              {h.article.title}
                            </span>
                            <span className="mt-0.5 block truncate text-[11.5px] text-dim">
                              <Highlight text={h.snippet} query={query} />
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-3.5 flex flex-wrap items-center gap-2">
                    <button className="btn btn-primary !py-1.5 !text-[12px]" onClick={() => { setLastQuery(query); nav({ name: "detail", lawId: l.id }); }}>
                      Xem chi tiết <IcArrow size={12} />
                    </button>
                    <button
                      className="btn !py-1.5 !text-[12px]"
                      onClick={() => {
                        setFocusLawId(l.id);
                        nav({ name: "graph" });
                      }}
                    >
                      <IcCube size={13} /> Bản đồ
                    </button>
                    <button
                      className={`btn !py-1.5 !text-[12px] ${saved ? "!border-[rgba(229,176,84,0.55)] !text-gold-soft" : ""}`}
                      onClick={() => toggleBookmark(l.id)}
                      aria-label={saved ? "Bỏ lưu" : "Lưu văn bản"}
                    >
                      <IcBookmark size={13} filled={saved} /> {saved ? "Đã lưu" : "Lưu"}
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </main>

      {/* ---------- preview ---------- */}
      <aside className="hidden lg:block">
        <div className="sticky top-[104px] space-y-4">
          {preview && (
            <div className="panel p-4">
              <div className="eyebrow mb-3">Xem nhanh</div>
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] text-dim">{preview.law.number}</span>
                <StatusBadge status={preview.law.status} />
              </div>
              <div className="font-display text-[15.5px] font-semibold leading-snug text-fog">{preview.law.name}</div>
              <p className="mt-2 text-[12px] leading-relaxed text-mist line-clamp-4">{preview.law.summary}</p>
              <div className="mt-3 border-t border-line-soft pt-3">
                <div className="eyebrow mb-2">Dòng hiệu lực</div>
                <TimelineBar law={preview.law} compact />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-line-soft pt-3 text-[11px] text-dim">
                <span>
                  Điều khoản: <b className="text-fog">{countArticles(preview.law)}</b>
                </span>
                <span>
                  Liên kết: <b className="text-fog">{preview.law.relations.length}</b>
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="btn btn-primary flex-1 justify-center !py-1.5 !text-[12px]" onClick={() => nav({ name: "detail", lawId: preview.law.id })}>
                  Mở văn bản
                </button>
                <button
                  className="btn !py-1.5 !text-[12px]"
                  onClick={() => {
                    setFocusLawId(preview.law.id);
                    nav({ name: "graph" });
                  }}
                >
                  <IcCube size={13} />
                </button>
              </div>
            </div>
          )}
          <div className="panel-flat p-4 text-[11.5px] leading-relaxed text-dim">
            <b className="text-mist">Mẹo tra cứu:</b> gõ <span className="font-mono text-gold-soft">“Điều 117”</span> để nhảy thẳng tới điều khoản,
            hoặc <span className="font-mono text-gold-soft">“59/2020/QH14”</span> để mở theo số hiệu.
          </div>
        </div>
      </aside>
    </div>
  );
}
