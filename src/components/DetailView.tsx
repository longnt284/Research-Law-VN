import { useEffect, useMemo, useRef, useState } from "react";
import {
  LAW_MAP,
  LAWS,
  Law,
  Article,
  REL_LABEL,
  RelKind,
  fmtDate,
  fieldOf,
  allArticles,
  countArticles,
} from "../data/laws";
import { lastQuery } from "../lib/search";
import { useApp } from "../store";
import {
  StatusBadge,
  TypeChip,
  FieldChip,
  Highlight,
  IcBookmark,
  IcCopy,
  IcCompare,
  IcArrow,
  IcWarn,
  IcLink,
  IcNote,
  IcCheck,
  IcChevR,
} from "./ui";
import TimelineBar from "./TimelineBar";
import Graph3D from "./Graph3D";
import Graph2D from "./Graph2D";

type Tab = "content" | "related" | "history" | "map";

const dirLabel = (law: Law, kind: RelKind): string => {
  const isUpper = law.type === "Luật" || law.type === "Hiến pháp";
  if (kind === "guides") return isUpper ? "Văn bản hướng dẫn thi hành" : "Hướng dẫn thi hành cho";
  if (kind === "amends") return isUpper ? "Được sửa đổi, bổ sung bởi" : "Sửa đổi, bổ sung cho";
  if (kind === "replaces") return "Thay thế";
  if (kind === "replacedBy") return "Bị thay thế bởi";
  return "Văn bản liên quan";
};

export default function DetailView({
  lawId,
  articleId,
  tab: initialTab,
}: {
  lawId: string;
  articleId?: string;
  tab?: Tab;
}) {
  const law = LAW_MAP[lawId];
  const nav = useApp((s) => s.nav);
  const pushHistory = useApp((s) => s.pushHistory);
  const bookmarks = useApp((s) => s.bookmarks);
  const toggleBookmark = useApp((s) => s.toggleBookmark);
  const articleMarks = useApp((s) => s.articleMarks);
  const toggleArticleMark = useApp((s) => s.toggleArticleMark);
  const notes = useApp((s) => s.notes);
  const setNote = useApp((s) => s.setNote);
  const fontSize = useApp((s) => s.fontSize);
  const setFontSize = useApp((s) => s.setFontSize);
  const graphMode = useApp((s) => s.graphMode);
  const reduced = useApp((s) => s.reducedMotion);
  const showToast = useApp((s) => s.showToast);

  const [tab, setTab] = useState<Tab>(initialTab ?? "content");
  const [activeArticle, setActiveArticle] = useState<string | null>(articleId ?? null);
  const [noteSaved, setNoteSaved] = useState(false);
  const query = lastQuery;

  useEffect(() => {
    if (!law) return;
    const a = articleId ? allArticles(law).find((x) => x.id === articleId) : null;
    pushHistory({
      kind: articleId ? "article" : "law",
      lawId,
      articleId,
      label: a ? `Điều ${a.number} · ${law.name}` : law.name,
      sub: law.number,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lawId, articleId]);

  useEffect(() => {
    if (articleId) {
      const t = setTimeout(() => {
        const el = document.getElementById(`art-${articleId}`);
        el?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
        el?.classList.remove("anim-flash");
        void el?.offsetWidth;
        el?.classList.add("anim-flash");
      }, 60);
      return () => clearTimeout(t);
    }
  }, [articleId, reduced]);

  // track reading position
  useEffect(() => {
    if (tab !== "content") return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveArticle(e.target.id.replace("art-", ""));
        });
      },
      { rootMargin: "-30% 0px -55% 0px" }
    );
    if (!law) return;
    allArticles(law).forEach((a) => {
      const el = document.getElementById(`art-${a.id}`);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [tab, law]);

  const mapVisible = useMemo(() => {
    const set = new Set<string>([lawId]);
    law?.relations.forEach((r) => set.add(r.lawId));
    LAWS.filter((l) => l.field === law?.field).forEach((l) => set.add(l.id));
    return set;
  }, [lawId, law]);

  if (!law) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-20 text-center">
        <div className="font-display text-[22px] text-fog">Không tìm thấy văn bản này.</div>
        <button className="btn btn-primary mt-5" onClick={() => nav({ name: "home" })}>Về trang chủ</button>
      </div>
    );
  }

  const saved = bookmarks.includes(law.id);
  const marksHere = articleMarks.filter((k) => k.startsWith(`${law.id}/`));
  const replacedBy = law.relations.find((r) => r.kind === "replacedBy");
  const fsClass = fontSize === 0 ? "fs-sm" : fontSize === 2 ? "fs-lg" : "";

  const copyArticleLink = (a: Article) => {
    const url = `https://legalatlas.vn/d/${law.id}#${a.id}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    showToast(`Đã sao chép liên kết Điều ${a.number}`);
  };

  const jumpTo = (id: string) => {
    setActiveArticle(id);
    document.getElementById(`art-${id}`)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  const relationGroups = useMemo(() => {
    const groups: Record<string, { title: string; color: string; items: Law[] }> = {};
    law.relations.forEach((r) => {
      const target = LAW_MAP[r.lawId];
      if (!target) return;
      const title = dirLabel(law, r.kind);
      (groups[r.kind] ??= { title, color: REL_LABEL[r.kind].color, items: [] }).items.push(target);
    });
    return Object.values(groups);
  }, [law]);

  const sameField = LAWS.filter(
    (l) => l.field === law.field && l.id !== law.id && !law.relations.some((r) => r.lawId === l.id)
  );

  const historyRows = useMemo(() => {
    const rows: { date: string; title: string; desc: string; color: string; target?: string }[] = [
      { date: law.issuedDate, title: "Ban hành", desc: `Do ${law.issuer} ban hành theo số hiệu ${law.number}.`, color: "#45c8ff" },
      { date: law.effectiveDate, title: "Có hiệu lực", desc: "Văn bản chính thức có hiệu lực thi hành.", color: "#3ad294" },
    ];
    law.relations
      .filter((r) => r.kind === "amends")
      .forEach((r) => {
        const t = LAW_MAP[r.lawId];
        if (t) rows.push({ date: t.effectiveDate, title: "Được sửa đổi, bổ sung", desc: `${t.name} (${t.number}).`, color: "#e5b054", target: t.id });
      });
    Object.values(LAW_MAP).forEach((o) => {
      if (o.relations.some((r) => r.lawId === law.id && r.kind === "amends") && law.type !== "Luật") return;
      if (o.relations.some((r) => r.lawId === law.id && r.kind === "amends") && law.type === "Luật") {
        rows.push({ date: o.effectiveDate, title: "Có văn bản sửa đổi", desc: `${o.name} (${o.number}).`, color: "#e5b054", target: o.id });
      }
    });
    if (law.expiryDate) {
      rows.push({
        date: law.expiryDate,
        title: "Hết hiệu lực",
        desc: replacedBy ? `Được thay thế bởi ${LAW_MAP[replacedBy.lawId]?.name ?? "văn bản mới"}.` : "Văn bản chấm dứt hiệu lực.",
        color: "#f0716b",
        target: replacedBy?.lawId,
      });
    }
    return rows.sort((a, b) => a.date.localeCompare(b.date));
  }, [law, replacedBy]);

  return (
    <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6">
      {/* breadcrumb */}
      <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-[11.5px] text-dim" aria-label="Breadcrumb">
        <button className="transition hover:text-fog" onClick={() => nav({ name: "home" })}>Trang chủ</button>
        <IcChevR size={10} />
        <button className="transition hover:text-fog" onClick={() => nav({ name: "results", query: "" })}>Tra cứu</button>
        <IcChevR size={10} />
        <span className="text-mist">{fieldOf(law.field).name}</span>
        <IcChevR size={10} />
        <span className="max-w-[260px] truncate text-gold-soft">{law.name}</span>
      </nav>

      {/* header */}
      <header className="panel relative overflow-hidden p-5 sm:p-7">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-[3px]"
          style={{ background: law.status === "active" ? "#3ad294" : law.status === "expiring" ? "#f2b63d" : "#f0716b" }}
        />
        <div className="flex flex-wrap items-center gap-2">
          <TypeChip type={law.type} />
          <FieldChip field={law.field} />
          <StatusBadge status={law.status} big />
          <span className="ml-auto font-mono text-[12px] text-mist">{law.number}</span>
        </div>
        <h1 className="mt-3 font-display text-[26px] font-semibold leading-tight text-fog sm:text-[34px]">{law.name}</h1>

        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-[12.5px] sm:grid-cols-4">
          <div><div className="eyebrow mb-0.5">Cơ quan</div><div className="text-mist">{law.issuer}</div></div>
          <div><div className="eyebrow mb-0.5">Ban hành</div><div className="font-mono text-mist">{fmtDate(law.issuedDate)}</div></div>
          <div><div className="eyebrow mb-0.5">Hiệu lực</div><div className="font-mono text-mist">{fmtDate(law.effectiveDate)}</div></div>
          <div>
            <div className="eyebrow mb-0.5">{law.expiryDate ? "Hết hiệu lực" : "Điều khoản"}</div>
            <div className="font-mono text-mist">{law.expiryDate ? fmtDate(law.expiryDate) : `${countArticles(law)} điều trích lục`}</div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button className={`btn ${saved ? "btn-gold" : ""}`} onClick={() => toggleBookmark(law.id)}>
            <IcBookmark size={14} filled={saved} /> {saved ? "Đã lưu" : "Lưu văn bản"}
          </button>
          <button className="btn" onClick={() => nav({ name: "compare", a: law.id })}>
            <IcCompare size={14} /> So sánh
          </button>
          <button className="btn" onClick={() => setTab("history")}>
            <IcArrow size={13} className="rotate-90" /> Timeline
          </button>
          <button className="btn" onClick={() => setTab("map")}>
            <IcLink size={14} /> Bản đồ quan hệ
          </button>
          <button
            className="btn"
            onClick={() => {
              navigator.clipboard?.writeText(`https://legalatlas.vn/d/${law.id}`).catch(() => {});
              showToast("Đã sao chép liên kết văn bản");
            }}
          >
            <IcCopy size={14} /> Sao chép liên kết
          </button>
          <div className="ml-auto flex items-center gap-1 rounded-lg border border-line bg-ink-800 p-0.5" aria-label="Cỡ chữ">
            {([0, 1, 2] as const).map((f) => (
              <button
                key={f}
                className={`rounded-md px-2.5 py-1 font-mono text-[11px] font-semibold transition ${fontSize === f ? "bg-[#1b2c4d] text-fog" : "text-dim hover:text-mist"}`}
                onClick={() => setFontSize(f)}
                aria-label={`Cỡ chữ ${f === 0 ? "nhỏ" : f === 1 ? "vừa" : "lớn"}`}
              >
                A{f === 0 ? "−" : f === 1 ? "" : "+"}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* expiry warnings */}
      {law.status === "expired" && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-[rgba(240,113,107,0.45)] bg-[rgba(240,113,107,0.08)] px-4 py-3">
          <IcWarn size={18} className="shrink-0 text-danger" />
          <p className="flex-1 text-[13px] leading-relaxed text-[#f5b1ad]">
            Văn bản này <b>đã hết hiệu lực</b> từ ngày {law.expiryDate ? fmtDate(law.expiryDate) : "—"}. Nội dung dưới đây chỉ còn giá trị tra cứu lịch sử.
          </p>
          {replacedBy && LAW_MAP[replacedBy.lawId] && (
            <button className="btn !border-[rgba(240,113,107,0.5)] !py-1.5 !text-[12px] !text-[#f5b1ad]" onClick={() => nav({ name: "detail", lawId: replacedBy.lawId })}>
              Mở văn bản thay thế <IcArrow size={12} />
            </button>
          )}
        </div>
      )}
      {law.status === "expiring" && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-[rgba(242,182,61,0.45)] bg-[rgba(242,182,61,0.07)] px-4 py-3">
          <IcWarn size={18} className="shrink-0 text-warn" />
          <p className="flex-1 text-[13px] leading-relaxed text-[#f0d9a0]">
            Văn bản này <b>sắp / đã được thay thế</b>{law.expiryDate ? ` từ ngày ${fmtDate(law.expiryDate)}` : ""}. Hãy kiểm tra văn bản mới trước khi áp dụng.
          </p>
          {replacedBy && LAW_MAP[replacedBy.lawId] && (
            <button className="btn btn-gold !py-1.5 !text-[12px]" onClick={() => nav({ name: "detail", lawId: replacedBy.lawId })}>
              Mở văn bản thay thế <IcArrow size={12} />
            </button>
          )}
        </div>
      )}

      {/* tabs */}
      <div className="mt-6 flex items-center gap-6 border-b border-line" role="tablist">
        {(
          [
            ["content", `Nội dung · ${countArticles(law)}`],
            ["related", `Liên quan · ${law.relations.length}`],
            ["history", "Lịch sử hiệu lực"],
            ["map", "Bản đồ quan hệ"],
          ] as [Tab, string][]
        ).map(([k, label]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={`tab-btn ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>
            {label}
          </button>
        ))}
      </div>

      {/* ---------------- CONTENT ---------------- */}
      {tab === "content" && (
        <div className="mt-6 grid gap-8 lg:grid-cols-[215px_minmax(0,1fr)_265px]">
          <aside className="hidden lg:block">
            <div className="sticky top-[104px] max-h-[calc(100vh-120px)] overflow-y-auto pr-2">
              <div className="eyebrow mb-2.5">Cấu trúc văn bản</div>
              {law.chapters.map((c) => (
                <div key={c.id} className="mb-3">
                  <div className="mb-1 text-[11.5px] font-bold uppercase tracking-wide text-gold-soft">
                    {c.label} <span className="font-medium normal-case text-dim">· {c.title}</span>
                  </div>
                  <div className="space-y-0.5 border-l border-line pl-3">
                    {c.articles.map((a) => (
                      <button
                        key={a.id}
                        className={`block w-full rounded px-1.5 py-1 text-left text-[12px] transition ${
                          activeArticle === a.id ? "bg-[rgba(229,176,84,0.12)] font-semibold text-gold-soft" : "text-mist hover:bg-ink-700/60 hover:text-fog"
                        }`}
                        onClick={() => jumpTo(a.id)}
                      >
                        Điều {a.number} · <span className="text-dim">{a.title.length > 22 ? a.title.slice(0, 22) + "…" : a.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <main className={`law-prose min-w-0 ${fsClass}`}>
            {query && (
              <div className="mb-5 flex items-center gap-2 rounded-lg border border-[rgba(69,200,255,0.3)] bg-[rgba(69,200,255,0.06)] px-3.5 py-2.5 text-[12.5px] text-[#a8dcf7]">
                <IcCheck size={14} />
                Đang đánh dấu từ khóa <b>“{query}”</b> trong nội dung bên dưới.
              </div>
            )}
            <p className="mb-8 border-l-2 border-[rgba(229,176,84,0.5)] pl-4 text-[13.5px] italic leading-relaxed text-dim">{law.summary}</p>

            {law.chapters.map((c) => (
              <section key={c.id} className="mb-9">
                <div className="mb-4 flex items-baseline gap-3">
                  <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-gold">{c.label}</span>
                  <h2 className="font-display text-[18px] font-semibold text-fog">{c.title}</h2>
                </div>
                {c.articles.map((a) => {
                  const markKey = `${law.id}/${a.id}`;
                  const marked = articleMarks.includes(markKey);
                  return (
                    <article
                      key={a.id}
                      id={`art-${a.id}`}
                      className={`group mb-6 scroll-mt-[110px] rounded-lg border p-4 transition sm:p-5 ${
                        activeArticle === a.id ? "border-[rgba(229,176,84,0.4)] bg-[rgba(229,176,84,0.04)]" : "border-line-soft bg-[rgba(10,18,32,0.45)]"
                      }`}
                    >
                      <div className="mb-2.5 flex items-start justify-between gap-3">
                        <h3 className="text-[15.5px] font-bold leading-snug text-fog">
                          <span className="text-gold">Điều {a.number}.</span> <Highlight text={a.title} query={query} />
                        </h3>
                        <div className="flex shrink-0 gap-1 opacity-40 transition group-hover:opacity-100">
                          <button
                            className={`rounded-md border border-line p-1.5 transition hover:border-[rgba(229,176,84,0.6)] hover:text-gold-soft ${marked ? "!border-[rgba(229,176,84,0.6)] !text-gold-soft" : ""}`}
                            onClick={() => {
                              toggleArticleMark(markKey);
                              showToast(marked ? "Đã bỏ đánh dấu điều khoản" : "Đã đánh dấu điều khoản");
                            }}
                            aria-label="Đánh dấu điều khoản"
                          >
                            <IcBookmark size={13} filled={marked} />
                          </button>
                          <button
                            className="rounded-md border border-line p-1.5 transition hover:border-[rgba(69,200,255,0.6)] hover:text-legal"
                            onClick={() => copyArticleLink(a)}
                            aria-label="Sao chép liên kết điều khoản"
                          >
                            <IcCopy size={13} />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {a.clauses.map((cl) => (
                          <p key={cl.id} className="pl-0">
                            <span className="mr-1 font-semibold text-gold-soft">{cl.num}.</span>
                            <Highlight text={cl.text} query={query} />
                            {cl.points && (
                              <span className="mt-2 block space-y-1.5 pl-6">
                                {cl.points.map((p) => (
                                  <span key={p.id} className="block">
                                    <span className="mr-1 font-semibold text-gold-soft">{p.label})</span>
                                    <Highlight text={p.text} query={query} />
                                  </span>
                                ))}
                              </span>
                            )}
                          </p>
                        ))}
                      </div>
                      {a.note && <p className="mt-3 border-t border-line-soft pt-2.5 text-[12.5px] italic text-dim">Ghi chú: {a.note}</p>}
                    </article>
                  );
                })}
              </section>
            ))}

            <div className="mt-4 rounded-lg border border-line-soft bg-[rgba(10,18,32,0.5)] px-4 py-3 text-[11.5px] leading-relaxed text-dim">
              Nội dung được trích lục có chọn lọc phục vụ tra cứu nhanh. Để áp dụng pháp luật, vui lòng đối chiếu với văn bản gốc trên Công báo.
            </div>
          </main>

          <aside className="space-y-4">
            <div className="panel p-4">
              <div className="eyebrow mb-3">Thông tin văn bản</div>
              <dl className="space-y-2 text-[12px]">
                {[
                  ["Số hiệu", law.number],
                  ["Loại", law.type],
                  ["Cơ quan", law.issuer],
                  ["Lĩnh vực", fieldOf(law.field).name],
                  ["Ban hành", fmtDate(law.issuedDate)],
                  ["Hiệu lực", fmtDate(law.effectiveDate)],
                  ...(law.expiryDate ? ([["Hết hiệu lực", fmtDate(law.expiryDate)]] as const) : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 border-b border-line-soft pb-1.5">
                    <dt className="text-dim">{k}</dt>
                    <dd className="text-right font-medium text-mist">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="panel p-4">
              <div className="eyebrow mb-2 flex items-center gap-2">
                <IcNote size={12} /> Ghi chú cá nhân
              </div>
              <textarea
                className="input-dark min-h-[96px] resize-y !text-[12.5px] leading-relaxed"
                placeholder="Ghi chú riêng của bạn cho văn bản này…"
                defaultValue={notes[law.id] ?? ""}
                onBlur={(e) => {
                  if (e.target.value !== (notes[law.id] ?? "")) {
                    setNote(law.id, e.target.value);
                    setNoteSaved(true);
                    setTimeout(() => setNoteSaved(false), 1800);
                  }
                }}
              />
              <div className={`mt-1.5 flex items-center gap-1.5 text-[10.5px] text-valid transition-opacity ${noteSaved ? "opacity-100" : "opacity-0"}`}>
                <IcCheck size={11} /> Đã lưu ghi chú
              </div>
            </div>

            {marksHere.length > 0 && (
              <div className="panel p-4">
                <div className="eyebrow mb-2.5">Điều khoản đã đánh dấu</div>
                <div className="space-y-1">
                  {marksHere.map((k) => {
                    const aid = k.split("/")[1];
                    const a = allArticles(law).find((x) => x.id === aid);
                    if (!a) return null;
                    return (
                      <button key={k} className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] text-mist transition hover:bg-ink-700/60 hover:text-gold-soft" onClick={() => jumpTo(a.id)}>
                        <span className="font-mono text-[10px] text-gold">Điều {a.number}</span>
                        <span className="truncate">{a.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* ---------------- RELATED ---------------- */}
      {tab === "related" && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {relationGroups.map((g) => (
            <div key={g.title} className="panel p-5">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="h-[2px] w-7 rounded" style={{ background: g.color }} />
                <h3 className="text-[13.5px] font-bold text-fog">{g.title}</h3>
              </div>
              <div className="space-y-2">
                {g.items.map((t) => (
                  <button key={t.id} className="card-hover flex w-full items-center gap-3 rounded-lg border border-line-soft bg-[rgba(10,18,32,0.5)] p-3 text-left" onClick={() => nav({ name: "detail", lawId: t.id })}>
                    <span className="h-9 w-1 shrink-0 rounded-full" style={{ background: g.color }} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-fog">{t.name}</span>
                      <span className="font-mono text-[10px] text-dim">{t.number} · hiệu lực {fmtDate(t.effectiveDate)}</span>
                    </span>
                    <StatusBadge status={t.status} />
                    <IcArrow size={13} className="shrink-0 text-dim" />
                  </button>
                ))}
              </div>
            </div>
          ))}

          {sameField.length > 0 && (
            <div className="panel p-5">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="h-[2px] w-7 rounded" style={{ background: fieldOf(law.field).color }} />
                <h3 className="text-[13.5px] font-bold text-fog">Cùng lĩnh vực {fieldOf(law.field).name}</h3>
              </div>
              <div className="space-y-2">
                {sameField.map((t) => (
                  <button key={t.id} className="card-hover flex w-full items-center gap-3 rounded-lg border border-line-soft bg-[rgba(10,18,32,0.5)] p-3 text-left" onClick={() => nav({ name: "detail", lawId: t.id })}>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-fog">{t.name}</span>
                      <span className="font-mono text-[10px] text-dim">{t.number}</span>
                    </span>
                    <StatusBadge status={t.status} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- HISTORY ---------------- */}
      {tab === "history" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="panel p-5">
            <div className="eyebrow mb-3">Dòng thời gian hiệu lực</div>
            <TimelineBar law={law} />
            <div className="mt-6">
              <div className="eyebrow mb-3">Các mốc lịch sử</div>
              <div className="space-y-3">
                {historyRows.map((r, i) => (
                  <div key={i} className="flex gap-3.5">
                    <div className="flex flex-col items-center">
                      <span className="mt-1 h-3 w-3 shrink-0 rounded-full border-2" style={{ borderColor: r.color, background: `${r.color}30` }} />
                      {i < historyRows.length - 1 && <span className="mt-1 w-px flex-1 bg-line" />}
                    </div>
                    <div className="pb-4">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-[13px] font-bold text-fog">{r.title}</span>
                        <span className="font-mono text-[10.5px] text-dim">{fmtDate(r.date)}</span>
                        {r.target && (
                          <button className="text-[11px] font-semibold text-legal transition hover:text-fog" onClick={() => nav({ name: "detail", lawId: r.target! })}>
                            Mở văn bản →
                          </button>
                        )}
                      </div>
                      <p className="mt-0.5 text-[12.5px] leading-relaxed text-mist">{r.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="panel h-fit p-5">
            <div className="eyebrow mb-3">Trạng thái hiện tại</div>
            <StatusBadge status={law.status} big />
            <p className="mt-3 text-[12.5px] leading-relaxed text-mist">
              {law.status === "active"
                ? "Văn bản đang có hiệu lực thi hành. Các nội dung trích lục bên tab Nội dung phản ánh trạng thái hiện hành."
                : law.status === "expiring"
                ? "Văn bản đang trong giai đoạn chuyển tiếp. Nên đối chiếu với văn bản thay thế trước khi áp dụng."
                : "Văn bản đã chấm dứt hiệu lực. Chỉ dùng để tra cứu lịch sử."}
            </p>
            <div className="mt-4 border-t border-line-soft pt-4 text-[11.5px] leading-relaxed text-dim">
              Số hiệu: <span className="font-mono text-mist">{law.number}</span>
              <br />Ngày ban hành: <span className="font-mono text-mist">{fmtDate(law.issuedDate)}</span>
              <br />Ngày hiệu lực: <span className="font-mono text-mist">{fmtDate(law.effectiveDate)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MAP ---------------- */}
      {tab === "map" && (
        <div className="mt-6">
          {graphMode === "3d" ? (
            <Graph3D visibleIds={mapVisible} initialFocusId={law.id} height={560} />
          ) : (
            <Graph2D visibleIds={mapVisible} initialFocusId={law.id} height={560} />
          )}
          <p className="mt-3 text-[11.5px] text-dim">
            Hiển thị <b className="text-mist">{mapVisible.size}</b> văn bản gồm văn bản hiện tại, các văn bản liên quan trực tiếp và cùng lĩnh vực. Các node khác được làm mờ.
          </p>
        </div>
      )}
    </div>
  );
}
