import { useMemo } from "react";
import { motion } from "framer-motion";
import { LAWS, FIELDS, allArticles, fieldOf, fmtDate, Law } from "../data/laws";
import { useApp, applyFilters, filtersActive } from "../store";
import Graph3D from "./Graph3D";
import Graph2D from "./Graph2D";
import TimelineBar, { RelationLegend } from "./TimelineBar";
import { SectionHead, StatusBadge, IcArrow, IcCube, IcGrid, IcHistory, IcClock, Highlight } from "./ui";
import { SearchBar } from "./TopBar";

const rise = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 0.9, 0.3, 1] as const },
});

export default function HomeView() {
  const nav = useApp((s) => s.nav);
  const graphMode = useApp((s) => s.graphMode);
  const setGraphMode = useApp((s) => s.setGraphMode);
  const filters = useApp((s) => s.filters);
  const toggleFilter = useApp((s) => s.toggleFilter);
  const history = useApp((s) => s.history);
  const reduced = useApp((s) => s.reducedMotion);

  const totalArticles = useMemo(() => LAWS.reduce((s, l) => s + allArticles(l).length, 0), []);
  const activeCount = LAWS.filter((l) => l.status === "active").length;
  const featured = useMemo(
    () => [...LAWS].filter((l) => l.status === "active").sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate)).slice(0, 6),
    []
  );

  const events = useMemo(() => {
    const ev: { date: string; kind: "issued" | "effective" | "expired"; law: Law }[] = [];
    LAWS.forEach((l) => {
      ev.push({ date: l.issuedDate, kind: "issued", law: l });
      ev.push({ date: l.effectiveDate, kind: "effective", law: l });
      if (l.expiryDate) ev.push({ date: l.expiryDate, kind: "expired", law: l });
    });
    return ev.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 14);
  }, []);

  const visible = useMemo(() => new Set(applyFilters(LAWS, filters).map((l) => l.id)), [filters]);

  return (
    <div className="mx-auto max-w-[1480px] px-4 pb-16 sm:px-6">
      {/* ------- opening console ------- */}
      <section className="grid gap-8 pt-9 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
        <motion.div {...(reduced ? {} : rise(0))}>
          <div className="mb-4 flex items-center gap-2.5 font-mono text-[10.5px] uppercase tracking-[0.22em] text-dim">
            <span className="anim-pulse-dot h-1.5 w-1.5 rounded-full bg-valid" />
            Cơ sở dữ liệu pháp lý · {LAWS.length} văn bản · {totalArticles} điều khoản
          </div>
          <h1 className="font-display text-[38px] font-semibold leading-[1.06] tracking-tight text-fog sm:text-[54px]">
            Không gian tra cứu
            <br />
            <span className="text-gold">pháp luật</span> Việt Nam<span className="text-legal">.</span>
          </h1>
          <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-mist">
            Tìm văn bản và điều khoản trong vài giây, xem mạng lưới quan hệ giữa các văn bản trong không gian 3D,
            và theo dõi hiệu lực theo dòng thời gian — tất cả trên một bản đồ duy nhất.
          </p>

          <div className="mt-7 max-w-[640px]">
            <SearchBar big />
          </div>

          <div className="mt-6">
            <div className="eyebrow mb-2.5">Duyệt theo lĩnh vực</div>
            <div className="flex flex-wrap gap-2">
              {FIELDS.map((f) => {
                const count = LAWS.filter((l) => l.field === f.id).length;
                const on = filters.fields.includes(f.id);
                return (
                  <button
                    key={f.id}
                    className={`chip !py-1.5 transition hover:-translate-y-0.5 ${on ? "!text-fog" : ""}`}
                    style={on ? { borderColor: `${f.color}88`, background: `${f.color}1c` } : undefined}
                    onClick={() => {
                      toggleFilter("fields", f.id);
                      nav({ name: "results", query: "" });
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: f.color }} />
                    {f.name}
                    <span className="font-mono text-[10px] text-dim">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        <motion.div {...(reduced ? {} : rise(1))} className="flex flex-col gap-3">
          <div className="panel grid grid-cols-2 gap-4 p-5">
            <div>
              <div className="font-display text-[34px] font-semibold leading-none text-legal">{LAWS.length}</div>
              <div className="mt-1.5 text-[11.5px] text-dim">Văn bản trong bản đồ</div>
            </div>
            <div>
              <div className="font-display text-[34px] font-semibold leading-none text-gold">{totalArticles}</div>
              <div className="mt-1.5 text-[11.5px] text-dim">Điều khoản trích lục</div>
            </div>
            <div>
              <div className="font-display text-[34px] font-semibold leading-none text-valid">{activeCount}</div>
              <div className="mt-1.5 text-[11.5px] text-dim">Đang có hiệu lực</div>
            </div>
            <div>
              <div className="font-display text-[34px] font-semibold leading-none text-danger">
                {LAWS.length - activeCount}
              </div>
              <div className="mt-1.5 text-[11.5px] text-dim">Sắp / đã hết hiệu lực</div>
            </div>
          </div>

          <div className="panel flex-1 p-5">
            <div className="eyebrow mb-3 flex items-center gap-2">
              <IcClock size={12} /> Văn bản mới cập nhật
            </div>
            <div className="space-y-1">
              {featured.slice(0, 4).map((l) => (
                <button
                  key={l.id}
                  className="group flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition hover:bg-ink-700/60"
                  onClick={() => nav({ name: "detail", lawId: l.id })}
                >
                  <span className="h-8 w-1 shrink-0 rounded-full" style={{ background: fieldOf(l.field).color }} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-fog group-hover:text-legal">
                      {l.name}
                    </span>
                    <span className="font-mono text-[10px] text-dim">
                      {l.number} · hiệu lực {fmtDate(l.effectiveDate)}
                    </span>
                  </span>
                  <IcArrow size={13} className="shrink-0 text-dim opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ------- atlas map ------- */}
      <motion.section className="mt-14" {...(reduced ? {} : rise(2))}>
        <SectionHead
          eyebrow="Bản đồ tri thức"
          title="Mạng lưới văn bản trong không gian"
          right={
            <div className="flex items-center gap-2">
              {filtersActive(filters) && (
                <span className="chip !border-[rgba(242,182,61,0.5)] !text-warn">
                  đang lọc · {visible.size}/{LAWS.length}
                </span>
              )}
              <div className="flex items-center rounded-lg border border-line bg-ink-800 p-0.5">
                <button
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11.5px] font-semibold transition ${graphMode === "3d" ? "bg-[#1b2c4d] text-fog" : "text-dim"}`}
                  onClick={() => setGraphMode("3d")}
                >
                  <IcCube size={13} /> 3D
                </button>
                <button
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11.5px] font-semibold transition ${graphMode === "2d" ? "bg-[#1b2c4d] text-fog" : "text-dim"}`}
                  onClick={() => setGraphMode("2d")}
                >
                  <IcGrid size={13} /> 2D
                </button>
              </div>
              <button className="btn hidden sm:inline-flex" onClick={() => nav({ name: "graph" })}>
                Toàn màn hình <IcArrow size={13} />
              </button>
            </div>
          }
        />
        {graphMode === "3d" ? <Graph3D visibleIds={visible} compact height={480} /> : <Graph2D visibleIds={visible} height={480} />}
        <div className="mt-3">
          <RelationLegend />
        </div>
      </motion.section>

      {/* ------- recent + popular ------- */}
      <motion.section className="mt-14 grid gap-6 lg:grid-cols-2" {...(reduced ? {} : rise(3))}>
        <div>
          <SectionHead eyebrow="Mới ban hành" title="Hiệu lực gần đây nhất" />
          <div className="space-y-2.5">
            {featured.map((l) => (
              <button
                key={l.id}
                className="panel card-hover flex w-full items-center gap-4 p-3.5 text-left"
                onClick={() => nav({ name: "detail", lawId: l.id })}
              >
                <span className="hidden w-[92px] shrink-0 font-mono text-[10.5px] leading-tight text-dim sm:block">
                  {l.number.length > 16 ? l.number.slice(0, 16) : l.number}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-semibold text-fog">{l.name}</span>
                  <span className="text-[11.5px] text-dim">
                    {l.issuer} · hiệu lực {fmtDate(l.effectiveDate)}
                  </span>
                </span>
                <StatusBadge status={l.status} />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <SectionHead eyebrow="Dòng hiệu lực" title="Sự kiện pháp lý gần nhất" />
            <div className="max-h-[380px] space-y-2 overflow-y-auto pr-1.5">
              {events.map((e, i) => (
                <button
                  key={i}
                  className="panel card-hover flex w-full items-center gap-3.5 p-3 text-left"
                  onClick={() => nav({ name: "detail", lawId: e.law.id })}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: e.kind === "issued" ? "#45c8ff" : e.kind === "effective" ? "#3ad294" : "#f0716b" }}
                  />
                  <span className="w-[78px] shrink-0 font-mono text-[11px] text-mist">{fmtDate(e.date)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-medium text-fog">
                      {e.kind === "issued" ? "Ban hành" : e.kind === "effective" ? "Có hiệu lực" : "Hết hiệu lực"} —{" "}
                      {e.law.name}
                    </span>
                    <span className="font-mono text-[10px] text-dim">{e.law.number}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {history.length > 0 && (
            <div>
              <SectionHead eyebrow="Phiên làm việc" title="Tra cứu gần đây" />
              <div className="flex flex-wrap gap-2">
                {history.slice(0, 8).map((h) => (
                  <button
                    key={h.at}
                    className="chip !py-1.5 transition hover:!border-[rgba(69,200,255,0.55)] hover:!text-fog"
                    onClick={() => nav({ name: "detail", lawId: h.lawId, articleId: h.articleId })}
                  >
                    <IcHistory size={11} />
                    <span className="max-w-[200px] truncate">{h.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.section>
    </div>
  );
}

export { Highlight };
