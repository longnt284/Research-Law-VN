import { LAW_MAP, allArticles, fmtDate } from "../data/laws";
import { useApp } from "../store";
import { StatusBadge, IcBookmark, IcNote, IcHistory, IcX, IcArrow, IcBook } from "./ui";
import { SectionHead } from "./ui";

const relTime = (t: number) => {
  const d = Date.now() - t;
  const m = Math.floor(d / 60000);
  if (m < 1) return "vừa xong";
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
};

export default function SavedView() {
  const nav = useApp((s) => s.nav);
  const bookmarks = useApp((s) => s.bookmarks);
  const toggleBookmark = useApp((s) => s.toggleBookmark);
  const articleMarks = useApp((s) => s.articleMarks);
  const toggleArticleMark = useApp((s) => s.toggleArticleMark);
  const notes = useApp((s) => s.notes);
  const history = useApp((s) => s.history);
  const clearHistory = useApp((s) => s.clearHistory);
  const showToast = useApp((s) => s.showToast);

  const noteEntries = Object.entries(notes).filter(([, v]) => v.trim().length > 0);

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6">
      <SectionHead
        eyebrow="Không gian cá nhân"
        title="Đã lưu & lịch sử tra cứu"
        right={
          history.length > 0 ? (
            <button className="btn !py-1.5 !text-[12px]" onClick={() => { clearHistory(); showToast("Đã xóa lịch sử tra cứu"); }}>
              <IcX size={12} /> Xóa lịch sử
            </button>
          ) : undefined
        }
      />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* bookmarks */}
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-[14px] font-bold text-fog">
            <IcBookmark size={15} className="text-gold" /> Văn bản đã lưu
            <span className="font-mono text-[11px] text-dim">({bookmarks.length})</span>
          </h3>
          {bookmarks.length === 0 ? (
            <div className="panel grid place-items-center px-6 py-10 text-center">
              <IcBook size={26} className="mb-3 text-dim" />
              <p className="text-[12.5px] leading-relaxed text-dim">
                Chưa lưu văn bản nào.<br />Bấm <b className="text-mist">“Lưu văn bản”</b> ở trang chi tiết để ghim lại đây.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {bookmarks.map((id) => {
                const l = LAW_MAP[id];
                if (!l) return null;
                return (
                  <div key={id} className="panel card-hover flex items-center gap-3 p-3.5">
                    <button className="min-w-0 flex-1 text-left" onClick={() => nav({ name: "detail", lawId: id })}>
                      <div className="truncate text-[13.5px] font-semibold text-fog">{l.name}</div>
                      <div className="mt-0.5 flex items-center gap-2 font-mono text-[10px] text-dim">
                        {l.number} · {fmtDate(l.effectiveDate)}
                      </div>
                    </button>
                    <StatusBadge status={l.status} />
                    <button className="btn !px-2.5 !py-1.5" onClick={() => nav({ name: "detail", lawId: id })} aria-label="Mở văn bản">
                      <IcArrow size={13} />
                    </button>
                    <button
                      className="rounded-md border border-line p-1.5 text-dim transition hover:border-[rgba(240,113,107,0.6)] hover:text-danger"
                      onClick={() => { toggleBookmark(id); showToast("Đã bỏ lưu văn bản"); }}
                      aria-label="Bỏ lưu"
                    >
                      <IcX size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* marked articles */}
          <h3 className="mb-3 mt-8 flex items-center gap-2 text-[14px] font-bold text-fog">
            <IcBookmark size={15} className="text-legal" filled /> Điều khoản đã đánh dấu
            <span className="font-mono text-[11px] text-dim">({articleMarks.length})</span>
          </h3>
          {articleMarks.length === 0 ? (
            <p className="panel px-4 py-4 text-[12.5px] text-dim">Chưa đánh dấu điều khoản nào.</p>
          ) : (
            <div className="space-y-2">
              {articleMarks.map((k) => {
                const [lawId, aid] = k.split("/");
                const l = LAW_MAP[lawId];
                const a = l ? allArticles(l).find((x) => x.id === aid) : null;
                if (!l || !a) return null;
                return (
                  <div key={k} className="panel-flat flex items-center gap-3 px-3.5 py-2.5">
                    <button className="min-w-0 flex-1 text-left" onClick={() => nav({ name: "detail", lawId: lawId, articleId: aid })}>
                      <div className="text-[12.5px] font-semibold text-fog">
                        <span className="font-mono text-[11px] text-gold">Điều {a.number}</span> · {a.title}
                      </div>
                      <div className="truncate text-[10.5px] text-dim">{l.name}</div>
                    </button>
                    <button
                      className="rounded-md border border-line p-1.5 text-dim transition hover:border-[rgba(240,113,107,0.6)] hover:text-danger"
                      onClick={() => toggleArticleMark(k)}
                      aria-label="Bỏ đánh dấu"
                    >
                      <IcX size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="space-y-8">
          {/* notes */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-[14px] font-bold text-fog">
              <IcNote size={15} className="text-gold" /> Ghi chú cá nhân
              <span className="font-mono text-[11px] text-dim">({noteEntries.length})</span>
            </h3>
            {noteEntries.length === 0 ? (
              <p className="panel px-4 py-4 text-[12.5px] text-dim">Chưa có ghi chú. Ghi chú được lưu ngay tại trang chi tiết văn bản.</p>
            ) : (
              <div className="space-y-2.5">
                {noteEntries.map(([lawId, text]) => {
                  const l = LAW_MAP[lawId];
                  if (!l) return null;
                  return (
                    <button key={lawId} className="panel card-hover block w-full p-4 text-left" onClick={() => nav({ name: "detail", lawId })}>
                      <div className="mb-1.5 text-[12px] font-semibold text-gold-soft">{l.name}</div>
                      <p className="line-clamp-3 whitespace-pre-wrap text-[12px] leading-relaxed text-mist">{text}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* history */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-[14px] font-bold text-fog">
              <IcHistory size={15} className="text-legal" /> Lịch sử tra cứu
              <span className="font-mono text-[11px] text-dim">({history.length})</span>
            </h3>
            {history.length === 0 ? (
              <p className="panel px-4 py-4 text-[12.5px] text-dim">Chưa có lịch sử. Mọi văn bản bạn mở sẽ xuất hiện tại đây.</p>
            ) : (
              <div className="space-y-1.5">
                {history.map((h) => (
                  <button
                    key={h.at}
                    className="panel-flat flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition hover:border-[rgba(69,200,255,0.4)]"
                    onClick={() => nav({ name: "detail", lawId: h.lawId, articleId: h.articleId })}
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${h.kind === "article" ? "bg-gold" : "bg-legal"}`} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] text-fog">{h.label}</span>
                      <span className="font-mono text-[9.5px] text-dim">{h.sub}</span>
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-dim">{relTime(h.at)}</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
