import { useMemo } from "react";
import { LAWS, LAW_MAP, REL_LABEL, allArticles, fmtDate, countArticles, fieldOf } from "../data/laws";
import { useApp } from "../store";
import { StatusBadge, SectionHead, IcCompare, IcArrow } from "./ui";

function LawSelect({ value, onChange, label }: { value?: string; onChange: (id: string) => void; label: string }) {
  return (
    <label className="block">
      <span className="eyebrow mb-1.5 block">{label}</span>
      <select
        className="input-dark cursor-pointer !text-[13px]"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      >
        <option value="">— Chọn văn bản —</option>
        {LAWS.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name} · {l.number}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function CompareView({ a: aId, b: bId }: { a?: string; b?: string }) {
  const nav = useApp((s) => s.nav);

  const A = aId ? LAW_MAP[aId] : undefined;
  const B = bId ? LAW_MAP[bId] : undefined;

  const insights = useMemo(() => {
    if (!A || !B) return [];
    const out: { text: string; tone: "good" | "warn" | "info" }[] = [];
    if (A.field === B.field) out.push({ text: `Hai văn bản cùng thuộc lĩnh vực ${fieldOf(A.field).name}.`, tone: "info" });
    const rel = A.relations.find((r) => r.lawId === B.id);
    if (rel) out.push({ text: `Quan hệ trực tiếp: ${A.name} ${REL_LABEL[rel.kind].verb} ${B.name}.`, tone: "warn" });
    if (A.status === "expired" && B.status === "active" && A.relations.some((r) => r.lawId === B.id && r.kind === "replacedBy"))
      out.push({ text: `${A.name} đã hết hiệu lực và được thay thế bởi ${B.name} — nên áp dụng văn bản mới.`, tone: "warn" });
    if (A.status === B.status && A.status === "active") out.push({ text: "Cả hai văn bản đều đang có hiệu lực thi hành.", tone: "good" });
    const commonKw = A.keywords.filter((k) => B.keywords.some((k2) => k2 === k));
    if (commonKw.length) out.push({ text: `Từ khóa chung: ${commonKw.slice(0, 4).join(", ")}.`, tone: "info" });
    if (!out.length) out.push({ text: "Hai văn bản không có quan hệ trực tiếp trong cơ sở dữ liệu.", tone: "info" });
    return out;
  }, [A, B]);

  const commonArticles = useMemo(() => {
    if (!A || !B) return new Set<number>();
    const numsB = new Set(allArticles(B).map((a) => a.number));
    return new Set(allArticles(A).filter((a) => numsB.has(a.number)).map((a) => a.number));
  }, [A, B]);

  const Row = ({ k, ra, rb }: { k: string; ra: React.ReactNode; rb: React.ReactNode }) => (
    <div className="grid grid-cols-[130px_1fr_1fr] items-center gap-3 border-b border-line-soft py-2.5 text-[12.5px]">
      <span className="eyebrow !text-[10px]">{k}</span>
      <span className="font-medium text-fog">{ra}</span>
      <span className="font-medium text-fog">{rb}</span>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6">
      <SectionHead eyebrow="Nghiên cứu sâu" title="So sánh hai văn bản" />

      <div className="panel grid gap-4 p-5 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <LawSelect label="Văn bản A" value={aId} onChange={(id) => nav({ name: "compare", a: id, b: bId })} />
        <button
          className="btn mx-auto !px-3"
          onClick={() => nav({ name: "compare", a: bId, b: aId })}
          aria-label="Hoán đổi hai văn bản"
          title="Hoán đổi"
        >
          ⇄
        </button>
        <LawSelect label="Văn bản B" value={bId} onChange={(id) => nav({ name: "compare", a: aId, b: id })} />
      </div>

      {!A || !B ? (
        <div className="panel mt-6 grid place-items-center px-6 py-20 text-center">
          <IcCompare size={36} className="mb-4 text-dim" />
          <div className="font-display text-[20px] font-semibold text-fog">Chọn hai văn bản để đối chiếu</div>
          <p className="mt-2 max-w-[52ch] text-[13px] leading-relaxed text-dim">
            So sánh giúp bạn thấy nhanh khác biệt về hiệu lực, cơ quan ban hành, cấu trúc điều khoản và mối quan hệ —
            đặc biệt hữu ích khi một luật cũ được thay thế bằng luật mới.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button className="btn btn-gold" onClick={() => nav({ name: "compare", a: "luatdatdai2013", b: "luatdatdai2024" })}>
              Thử: Luật Đất đai 2013 ↔ 2024
            </button>
            <button className="btn" onClick={() => nav({ name: "compare", a: "luatdoanhnghiep2014", b: "luatdoanhnghiep2020" })}>
              Thử: Luật Doanh nghiệp 2014 ↔ 2020
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {/* insights */}
          <div className="panel p-5">
            <div className="eyebrow mb-3">Nhận định nhanh</div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {insights.map((i, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 rounded-lg border border-line-soft bg-[rgba(10,18,32,0.5)] px-3.5 py-2.5 text-[12.5px] leading-relaxed"
                >
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                    style={{ background: i.tone === "good" ? "#3ad294" : i.tone === "warn" ? "#f2b63d" : "#45c8ff" }}
                  />
                  <span className="text-mist">{i.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* meta table */}
          <div className="panel p-5">
            <div className="mb-3 grid grid-cols-[130px_1fr_1fr] gap-3">
              <span />
              {[A, B].map((l, i) => (
                <button key={l.id} className="text-left" onClick={() => nav({ name: "detail", lawId: l.id })}>
                  <div className="font-display text-[15px] font-semibold leading-snug text-fog transition hover:text-legal">
                    {i === 0 ? "A · " : "B · "}
                    {l.name}
                  </div>
                  <div className="font-mono text-[10px] text-dim">{l.number}</div>
                </button>
              ))}
            </div>
            <Row k="Loại" ra={A.type} rb={B.type} />
            <Row k="Cơ quan" ra={A.issuer} rb={B.issuer} />
            <Row k="Lĩnh vực" ra={fieldOf(A.field).name} rb={fieldOf(B.field).name} />
            <Row k="Ban hành" ra={<span className="font-mono">{fmtDate(A.issuedDate)}</span>} rb={<span className="font-mono">{fmtDate(B.issuedDate)}</span>} />
            <Row k="Hiệu lực" ra={<span className="font-mono">{fmtDate(A.effectiveDate)}</span>} rb={<span className="font-mono">{fmtDate(B.effectiveDate)}</span>} />
            <Row k="Hết hiệu lực" ra={<span className="font-mono">{A.expiryDate ? fmtDate(A.expiryDate) : "—"}</span>} rb={<span className="font-mono">{B.expiryDate ? fmtDate(B.expiryDate) : "—"}</span>} />
            <Row k="Trạng thái" ra={<StatusBadge status={A.status} />} rb={<StatusBadge status={B.status} />} />
            <Row k="Điều khoản" ra={`${countArticles(A)} điều trích lục`} rb={`${countArticles(B)} điều trích lục`} />
            <Row k="Liên kết" ra={`${A.relations.length} mối quan hệ`} rb={`${B.relations.length} mối quan hệ`} />
          </div>

          {/* articles side by side */}
          <div className="grid gap-4 md:grid-cols-2">
            {[A, B].map((l, i) => (
              <div key={l.id} className="panel p-5">
                <div className="eyebrow mb-3">{i === 0 ? "Văn bản A" : "Văn bản B"} · điều khoản</div>
                <div className="space-y-1.5">
                  {allArticles(l).map((a) => {
                    const common = commonArticles.has(a.number);
                    return (
                      <button
                        key={a.id}
                        className={`flex w-full items-center gap-2.5 rounded-md border px-3 py-2 text-left text-[12px] transition ${
                          common ? "border-[rgba(229,176,84,0.4)] bg-[rgba(229,176,84,0.06)]" : "border-line-soft bg-[rgba(10,18,32,0.5)] hover:border-line"
                        }`}
                        onClick={() => nav({ name: "detail", lawId: l.id, articleId: a.id })}
                      >
                        <span className={`shrink-0 font-mono text-[10px] font-semibold ${common ? "text-gold-soft" : "text-dim"}`}>Điều {a.number}</span>
                        <span className="min-w-0 flex-1 truncate text-mist">{a.title}</span>
                        {common && <span className="shrink-0 rounded bg-[rgba(229,176,84,0.15)] px-1.5 py-0.5 font-mono text-[8.5px] uppercase text-gold-soft">trùng số điều</span>}
                        <IcArrow size={11} className="shrink-0 text-dim" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
