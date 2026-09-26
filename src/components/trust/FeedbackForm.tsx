"use client";

import { useEffect, useState } from "react";

import type { Lang } from "@/data/types";
import { getLanding } from "@/i18n/landing";

/**
 * Hai mẫu góp ý dữ liệu: báo thiếu / sai dữ liệu, và yêu cầu bổ sung văn bản.
 *
 * Trang không có máy chủ nhận thư, nên nút gửi soạn sẵn một email tới địa chỉ
 * liên hệ đang dùng ở chân trang, mở bằng ứng dụng email của người đọc. Không
 * cần tài khoản, không có gì lưu lại trên trang. Máy không có ứng dụng email thì
 * nút sao chép cho người đọc tự gửi.
 *
 * Trang mở từ một văn bản (`?vb=58/2025/NĐ-CP&van-de=guidance`) hay từ ô tìm
 * không ra kết quả (`?loai=bo-sung&q=…`) thì các ô được điền sẵn.
 */

type Kind = "status" | "relation" | "amendment" | "guidance" | "source" | "other";
const KINDS: Kind[] = ["status", "relation", "amendment", "guidance", "source", "other"];

export function FeedbackForm({
  lang,
  email,
  domains,
}: {
  lang: Lang;
  email: string;
  domains: string[];
}) {
  const f = getLanding(lang).feedback;
  const [tab, setTab] = useState<"report" | "request">("report");
  const [kind, setKind] = useState<Kind>("status");
  const [doc, setDoc] = useState("");
  const [detail, setDetail] = useState("");
  const [source, setSource] = useState("");
  const [number, setNumber] = useState("");
  const [title, setTitle] = useState("");
  const [field, setField] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("loai") === "bo-sung") setTab("request");
    const vb = q.get("vb");
    if (vb) setDoc(vb);
    const k = q.get("van-de") as Kind | null;
    if (k && KINDS.includes(k)) setKind(k);
    const term = q.get("q");
    if (term) setNumber(term.slice(0, 120));
  }, []);

  const body =
    tab === "report"
      ? [
          `${f.kindLabel}: ${f.kinds[kind]}`,
          `${f.docLabel}: ${doc}`,
          `${f.detailLabel}:`,
          detail,
          source ? `${f.sourceLabel}: ${source}` : "",
          "",
          typeof window !== "undefined" ? window.location.href : "",
        ]
      : [
          `${f.numberLabel}: ${number}`,
          `${f.titleLabel}: ${title}`,
          `${f.fieldLabel}: ${field}`,
          `${f.reasonLabel}:`,
          reason,
          note ? `${f.noteLabel}: ${note}` : "",
        ];
  const text = body.filter((x) => x !== "").join("\n");
  const subject = tab === "report" ? `${f.subjectReport} ${doc}`.trim() : `${f.subjectRequest} ${number}`.trim();

  const valid = tab === "report" ? detail.trim().length > 0 : number.trim().length > 0 || title.trim().length > 0;

  return (
    <div className="fb">
      <div className="ldiff-modes" role="group" aria-label={f.title}>
        <button type="button" aria-pressed={tab === "report"} className="ldiff-mode" onClick={() => setTab("report")}>
          {f.report}
        </button>
        <button type="button" aria-pressed={tab === "request"} className="ldiff-mode" onClick={() => setTab("request")}>
          {f.request}
        </button>
      </div>

      <form
        className="fb-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!valid) return;
          window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
        }}
      >
        {tab === "report" ? (
          <>
            <fieldset className="fb-kinds">
              <legend className="eyebrow">{f.kindLabel}</legend>
              {KINDS.map((k) => (
                <label key={k} className="fb-kind">
                  <input type="radio" name="kind" value={k} checked={kind === k} onChange={() => setKind(k)} />
                  <span>{f.kinds[k]}</span>
                </label>
              ))}
            </fieldset>
            <label className="fb-field">
              <span className="eyebrow">{f.docLabel}</span>
              <input className="field" value={doc} onChange={(e) => setDoc(e.target.value)} placeholder={f.docPlaceholder} />
            </label>
            <label className="fb-field">
              <span className="eyebrow">{f.detailLabel}</span>
              <textarea
                className="field"
                rows={5}
                required
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder={f.detailPlaceholder}
              />
            </label>
            <label className="fb-field">
              <span className="eyebrow">
                {f.sourceLabel} <span className="fb-opt">({f.optional})</span>
              </span>
              <input className="field" type="url" value={source} onChange={(e) => setSource(e.target.value)} placeholder={f.sourcePlaceholder} />
            </label>
          </>
        ) : (
          <>
            <div className="fb-row">
              <label className="fb-field">
                <span className="eyebrow">{f.numberLabel}</span>
                <input className="field" value={number} onChange={(e) => setNumber(e.target.value)} placeholder={f.docPlaceholder} />
              </label>
              <label className="fb-field">
                <span className="eyebrow">{f.fieldLabel}</span>
                <select className="field" value={field} onChange={(e) => setField(e.target.value)}>
                  <option value="">—</option>
                  {domains.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="fb-field">
              <span className="eyebrow">{f.titleLabel}</span>
              <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className="fb-field">
              <span className="eyebrow">{f.reasonLabel}</span>
              <textarea className="field" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
            </label>
            <label className="fb-field">
              <span className="eyebrow">
                {f.noteLabel} <span className="fb-opt">({f.optional})</span>
              </span>
              <textarea className="field" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
            </label>
          </>
        )}

        <div className="fb-actions">
          <button type="submit" className="btn btn-solid" disabled={!valid}>
            {f.submit}
          </button>
          <button
            type="button"
            className="btn btn-quiet"
            aria-live="polite"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(`${subject}\n\n${text}`);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
              } catch {
                setCopied(false);
              }
            }}
          >
            {copied ? f.copied : f.copy}
          </button>
        </div>
        <p className="fb-note">{f.how}</p>
        <p className="fb-note">{f.privacy}</p>
      </form>
    </div>
  );
}
