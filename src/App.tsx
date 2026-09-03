import { useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useApp, applyFilters } from "./store";
import { LAWS, DocStatus, STATUS_META } from "./data/laws";
import TopBar from "./components/TopBar";
import HomeView from "./components/HomeView";
import ResultsView from "./components/ResultsView";
import DetailView from "./components/DetailView";
import CompareView from "./components/CompareView";
import SavedView from "./components/SavedView";
import Graph3D from "./components/Graph3D";
import Graph2D from "./components/Graph2D";
import { RelationLegend } from "./components/TimelineBar";
import { Toast, SectionHead, IcScale, IcCube, IcGrid, Kbd } from "./components/ui";

function GraphView() {
  const graphMode = useApp((s) => s.graphMode);
  const setGraphMode = useApp((s) => s.setGraphMode);
  const filters = useApp((s) => s.filters);
  const toggleFilter = useApp((s) => s.toggleFilter);
  const resetFilters = useApp((s) => s.resetFilters);
  const focusLawId = useApp((s) => s.focusLawId);
  const setFocusLawId = useApp((s) => s.setFocusLawId);
  const filtersActive = useApp((s) => s.filters.types.length + s.filters.statuses.length + s.filters.fields.length > 0 || s.filters.yearBucket !== "all");

  const visible = useMemo(() => new Set(applyFilters(LAWS, filters).map((l) => l.id)), [filters]);
  const height = "min(72vh, 720px)";

  return (
    <div className="mx-auto max-w-[1480px] px-4 py-7 sm:px-6">
      <SectionHead
        eyebrow="Bản đồ toàn cảnh"
        title="Không gian quan hệ giữa các văn bản"
        right={
          <div className="flex items-center rounded-lg border border-line bg-ink-800 p-0.5">
            <button
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition ${graphMode === "3d" ? "bg-[#1b2c4d] text-fog" : "text-dim"}`}
              onClick={() => setGraphMode("3d")}
            >
              <IcCube size={14} /> 3D
            </button>
            <button
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition ${graphMode === "2d" ? "bg-[#1b2c4d] text-fog" : "text-dim"}`}
              onClick={() => setGraphMode("2d")}
            >
              <IcGrid size={14} /> 2D
            </button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="eyebrow">Lọc theo hiệu lực:</span>
        {(["active", "expiring", "expired"] as DocStatus[]).map((st) => {
          const on = filters.statuses.includes(st);
          const m = STATUS_META[st];
          return (
            <button
              key={st}
              className="chip !py-1.5 transition hover:-translate-y-0.5"
              style={on ? { borderColor: `${m.color}88`, background: m.bg, color: m.color } : undefined}
              onClick={() => toggleFilter("statuses", st)}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
              {m.label}
              <span className="font-mono text-[10px] opacity-70">{LAWS.filter((l) => l.status === st).length}</span>
            </button>
          );
        })}
        {filtersActive && (
          <button className="chip !py-1.5 !text-warn transition hover:!border-[rgba(242,182,61,0.6)]" onClick={resetFilters}>
            ✕ xóa lọc ({visible.size}/{LAWS.length} hiển thị)
          </button>
        )}
        {focusLawId && (
          <button className="chip !py-1.5 !text-legal transition hover:!border-[rgba(69,200,255,0.6)]" onClick={() => setFocusLawId(null)}>
            ◎ bỏ tiêu điểm
          </button>
        )}
      </div>

      {graphMode === "3d" ? (
        <Graph3D visibleIds={visible} initialFocusId={focusLawId} height={720} />
      ) : (
        <Graph2D visibleIds={visible} initialFocusId={focusLawId} height={720} />
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <RelationLegend />
        <span className="font-mono text-[10.5px] text-dim">
          {LAWS.length} node · kích thước node ∝ số liên kết · màu ∝ trạng thái hiệu lực
        </span>
      </div>
    </div>
  );
}

function Footer() {
  const nav = useApp((s) => s.nav);
  return (
    <footer className="mt-16 border-t border-line-soft bg-[#060b14cc]">
      <div className="mx-auto grid max-w-[1480px] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg border border-[rgba(229,176,84,0.45)] bg-[rgba(229,176,84,0.08)] text-gold">
              <IcScale size={16} />
            </span>
            <span className="font-display text-[17px] font-semibold text-fog">Legal Atlas</span>
          </div>
          <p className="mt-3 max-w-[46ch] text-[12px] leading-relaxed text-dim">
            Bản đồ không gian pháp luật Việt Nam — tra cứu văn bản và điều khoản tốc độ cao, trực quan hóa mạng lưới
            quan hệ liên văn bản và dòng thời gian hiệu lực.
          </p>
          <p className="mt-3 text-[11px] leading-relaxed text-dim/80">
            ⚖ Đây là bản mô phỏng phục vụ học tập; nội dung điều khoản được trích lược. Đối chiếu văn bản gốc trên Công báo trước khi áp dụng.
          </p>
        </div>
        <div>
          <div className="eyebrow mb-3">Điều hướng</div>
          <ul className="space-y-1.5 text-[12.5px] text-mist">
            <li><button className="transition hover:text-gold-soft" onClick={() => nav({ name: "home" })}>Trang chủ</button></li>
            <li><button className="transition hover:text-gold-soft" onClick={() => nav({ name: "results", query: "" })}>Tra cứu toàn bộ văn bản</button></li>
            <li><button className="transition hover:text-gold-soft" onClick={() => nav({ name: "graph" })}>Bản đồ 3D</button></li>
            <li><button className="transition hover:text-gold-soft" onClick={() => nav({ name: "compare" })}>So sánh văn bản</button></li>
            <li><button className="transition hover:text-gold-soft" onClick={() => nav({ name: "saved" })}>Đã lưu & ghi chú</button></li>
          </ul>
        </div>
        <div>
          <div className="eyebrow mb-3">Phím tắt & thao tác</div>
          <ul className="space-y-2 text-[12px] text-mist">
            <li className="flex items-center gap-2"><Kbd>/</Kbd> mở ô tìm kiếm</li>
            <li className="flex items-center gap-2"><Kbd>↑</Kbd><Kbd>↓</Kbd><Kbd>Enter</Kbd> chọn gợi ý</li>
            <li className="flex items-center gap-2"><Kbd>Esc</Kbd> đóng gợi ý</li>
            <li>Nhấp đúp node trên bản đồ để tập trung / mở văn bản</li>
            <li>Hỗ trợ <span className="font-mono text-[11px]">prefers-reduced-motion</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line-soft py-4 text-center font-mono text-[10px] tracking-wide text-dim/70">
        LEGAL ATLAS · dữ liệu mô phỏng {LAWS.length} văn bản · xây dựng với React Three Fiber
      </div>
    </footer>
  );
}

export default function App() {
  const view = useApp((s) => s.view);
  const reduced = useApp((s) => s.reducedMotion);
  const setReducedMotion = useApp((s) => s.setReducedMotion);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [setReducedMotion]);

  const viewKey = JSON.stringify(view);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [viewKey]);

  const anim = reduced
    ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0, y: 14 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.28, ease: [0.22, 0.9, 0.3, 1] as const },
      };

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />
      <AnimatePresence mode="wait">
        <motion.main key={viewKey} {...anim} className="flex-1">
          {view.name === "home" && <HomeView />}
          {view.name === "results" && <ResultsView query={view.query} />}
          {view.name === "detail" && <DetailView lawId={view.lawId} articleId={view.articleId} tab={view.tab} />}
          {view.name === "graph" && <GraphView />}
          {view.name === "compare" && <CompareView a={view.a} b={view.b} />}
          {view.name === "saved" && <SavedView />}
        </motion.main>
      </AnimatePresence>
      <Footer />
      <Toast />
    </div>
  );
}
