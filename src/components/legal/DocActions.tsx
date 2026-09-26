"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { Lang } from "@/data/types";
import { getDocPanel } from "@/i18n/doc-panel";
import {
  createMatter,
  pushRecentDoc,
  toggleFollow,
  toggleMatterDoc,
  useFollowed,
  useMatters,
} from "@/lib/client-store";

/**
 * Thanh thao tác của trang văn bản, dính dưới thanh điều hướng khi cuộn.
 *
 * Sáu việc người làm hồ sơ hay làm ngay sau khi tìm đúng văn bản: theo dõi nó,
 * lưu vào bộ hồ sơ của vụ việc, mở bản đối chiếu, chép trích dẫn, gửi cho đồng
 * nghiệp, xuất ra, và báo khi thấy dữ liệu sai. Theo dõi và bộ hồ sơ lưu trong
 * trình duyệt; không có gì được gửi đi.
 *
 * Mở trang là ghi văn bản vào danh sách "vừa xem" của trình duyệt này.
 */

function useFlash(ms = 2000): [string | null, (key: string) => void] {
  const [key, setKey] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const flash = (k: string) => {
    setKey(k);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setKey(null), ms);
  };
  return [key, flash];
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Đóng một bảng bật ra khi bấm ra ngoài hoặc nhấn Esc. */
function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return { open, setOpen, ref };
}

export function DocActions({
  lang,
  docId,
  number,
  citation,
  path,
  shareTitle,
  compareHref,
  record,
  summary,
}: {
  lang: Lang;
  docId: string;
  number: string;
  citation: string;
  /** Đường dẫn của trang, không kèm tên miền. */
  path: string;
  shareTitle: string;
  /** Bản đối chiếu: trang cặp khi chỉ có một, khối danh sách khi có nhiều. */
  compareHref?: string;
  /** Bản ghi xuất ra tệp JSON, đúng như trong tập dữ liệu. */
  record: unknown;
  /** Bản tóm tắt dạng chữ: số hiệu, tên, tình trạng, mốc, quan hệ, nguồn. */
  summary: string;
}) {
  const c = getDocPanel(lang).actions;
  const followed = useFollowed();
  const matters = useMatters();
  const isFollowing = followed.some((f) => f.id === docId);
  const [flashed, flash] = useFlash();
  const save = usePopover();
  const exp = usePopover();
  const [name, setName] = useState("");

  useEffect(() => {
    pushRecentDoc(docId);
  }, [docId]);

  const share = async () => {
    const url = `${window.location.origin}${path}`;
    if (typeof navigator.share === "function" && window.matchMedia("(pointer: coarse)").matches) {
      navigator.share({ title: shareTitle, url }).catch(() => undefined);
      return;
    }
    if (await copyText(url)) flash("share");
  };

  const download = () => {
    const blob = new Blob([JSON.stringify(record, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${docId}.json`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    exp.setOpen(false);
  };

  const inMatters = matters.filter((m) => m.docIds.includes(docId)).length;

  return (
    <div className="doc-actions" role="toolbar" aria-label={c.label}>
      <button
        type="button"
        className={`act${isFollowing ? " is-on" : ""}`}
        aria-pressed={isFollowing}
        onClick={() => toggleFollow(docId)}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" className="act-icon">
          <path
            d="M8 13.6 2.7 8.6A3.1 3.1 0 0 1 7.1 4.2L8 5.1l.9-.9a3.1 3.1 0 0 1 4.4 4.4Z"
            fill={isFollowing ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
        {isFollowing ? c.following : c.follow}
      </button>

      <div className="act-pop" ref={save.ref}>
        <button
          type="button"
          className={`act${inMatters ? " is-on" : ""}`}
          aria-expanded={save.open}
          aria-haspopup="true"
          onClick={() => save.setOpen((v) => !v)}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" className="act-icon">
            <path d="M2.5 4.5h4l1.2 1.4h5.8v6.6h-11Z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          </svg>
          {c.save}
          {inMatters > 0 && <span className="act-count tnum">{inMatters}</span>}
        </button>
        {save.open && (
          <div className="act-menu" role="group" aria-label={c.saveTitle}>
            <p className="act-menu-title">{c.saveTitle}</p>
            {matters.length === 0 && <p className="act-menu-empty">{c.noMatters}</p>}
            {matters.map((m) => (
              <label key={m.id} className="act-check">
                <input
                  type="checkbox"
                  checked={m.docIds.includes(docId)}
                  onChange={() => toggleMatterDoc(m.id, docId)}
                />
                <span>{m.name}</span>
                <span className="act-check-n tnum">{m.docIds.length}</span>
              </label>
            ))}
            <form
              className="act-new"
              onSubmit={(e) => {
                e.preventDefault();
                if (!name.trim()) return;
                createMatter(name, docId);
                setName("");
              }}
            >
              <label htmlFor="new-matter" className="sr-only">
                {c.newMatter}
              </label>
              <input
                id="new-matter"
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={c.newMatter}
                maxLength={80}
              />
              <button type="submit" className="btn btn-quiet btn-sm">
                {c.create}
              </button>
            </form>
          </div>
        )}
      </div>

      {compareHref && (
        <Link href={compareHref} className="act">
          <svg viewBox="0 0 16 16" aria-hidden="true" className="act-icon">
            <path d="M2.5 3v10M13.5 3v10M5 6h6M5 10h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          {c.compare}
        </Link>
      )}

      <button
        type="button"
        className="act"
        aria-live="polite"
        onClick={async () => (await copyText(citation)) && flash("cite")}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" className="act-icon">
          <path d="M5.5 5.5h7v8h-7zM3.5 10.5v-8h7" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
        {flashed === "cite" ? c.cited : c.cite}
      </button>

      <button type="button" className="act" aria-live="polite" onClick={share}>
        <svg viewBox="0 0 16 16" aria-hidden="true" className="act-icon">
          <circle cx="4" cy="8" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="12" cy="4" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="12" cy="12" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <path d="M5.5 7.2 10.5 4.8M5.5 8.8l5 2.4" stroke="currentColor" strokeWidth="1.3" />
        </svg>
        {flashed === "share" ? c.shared : c.share}
      </button>

      <div className="act-pop" ref={exp.ref}>
        <button
          type="button"
          className="act"
          aria-expanded={exp.open}
          aria-haspopup="true"
          onClick={() => exp.setOpen((v) => !v)}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" className="act-icon">
            <path d="M8 2.5v7.5M5 7l3 3 3-3M3 12.5h10" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {flashed === "text" ? c.textCopied : c.export}
        </button>
        {exp.open && (
          <div className="act-menu act-menu--list" role="group" aria-label={c.export}>
            <button
              type="button"
              onClick={() => {
                exp.setOpen(false);
                window.setTimeout(() => window.print(), 50);
              }}
            >
              {c.print}
            </button>
            <button
              type="button"
              onClick={async () => {
                exp.setOpen(false);
                if (await copyText(summary)) flash("text");
              }}
            >
              {c.text}
            </button>
            <button type="button" onClick={download}>
              {c.json}
            </button>
          </div>
        )}
      </div>

      <Link
        href={`/${lang}/gop-y?vb=${encodeURIComponent(number)}`}
        className="act act--quiet"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true" className="act-icon">
          <path d="M3.5 13.5V2.5M3.5 3h8l-1.6 2.6L11.5 8h-8" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
        {c.report}
      </Link>
    </div>
  );
}
