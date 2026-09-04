"use client";

import { useMemo, useState } from "react";

import type { Lang } from "@/data/types";
import { getDict } from "@/i18n/dictionary";
import { diffText } from "@/lib/diff";

/**
 * Ô so sánh hai đoạn văn bản do người đọc tự dán vào.
 *
 * Phần đối chiếu phía trên trang dừng ở mức bản ghi. Khi cần xuống tới câu chữ
 * của một điều luật cụ thể, người đọc mở nguồn, chép hai bản rồi dán vào đây.
 *
 * Việc so sánh chạy hoàn toàn trong trình duyệt: không có yêu cầu mạng nào được
 * gửi đi, nên bản thảo chưa công bố hay tài liệu nội bộ dán vào cũng không rời
 * khỏi máy người dùng. Câu này được nói thẳng trên giao diện, vì người làm nghề
 * luật có lý do chính đáng để hỏi trước khi dán.
 */
export function TextDiff({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const [before, setBefore] = useState("");
  const [after, setAfter] = useState("");
  const [submitted, setSubmitted] = useState<{ a: string; b: string } | null>(null);

  const result = useMemo(
    () => (submitted ? diffText(submitted.a, submitted.b) : null),
    [submitted],
  );

  const ready = before.trim().length > 0 && after.trim().length > 0;

  return (
    <div>
      <p className="measure text-sm leading-relaxed text-[var(--ink-2)]">
        {t.compare.diffHint}
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="eyebrow">{t.compare.diffBefore}</span>
          <textarea
            value={before}
            onChange={(e) => setBefore(e.target.value)}
            rows={7}
            spellCheck={false}
            placeholder={t.compare.diffPlaceholder}
            className="mt-1.5 block w-full resize-y border border-[var(--rule-strong)] bg-[var(--paper-2)] px-3 py-2 text-sm leading-relaxed outline-none focus:border-[var(--accent)]"
          />
        </label>
        <label className="block">
          <span className="eyebrow">{t.compare.diffAfter}</span>
          <textarea
            value={after}
            onChange={(e) => setAfter(e.target.value)}
            rows={7}
            spellCheck={false}
            placeholder={t.compare.diffPlaceholder}
            className="mt-1.5 block w-full resize-y border border-[var(--rule-strong)] bg-[var(--paper-2)] px-3 py-2 text-sm leading-relaxed outline-none focus:border-[var(--accent)]"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!ready}
          onClick={() => setSubmitted({ a: before, b: after })}
          className="btn btn-outline disabled:cursor-not-allowed disabled:opacity-45"
        >
          {t.compare.diffRun}
        </button>
        <button
          type="button"
          onClick={() => {
            setBefore("");
            setAfter("");
            setSubmitted(null);
          }}
          className="btn btn-quiet"
        >
          {t.compare.diffClear}
        </button>
        {!result && (
          <span className="text-sm text-[var(--ink-3)]">{t.compare.diffEmpty}</span>
        )}
      </div>

      {result && (
        <div className="mt-5">
          <dl className="tnum grid grid-cols-2 gap-4 border-y border-[var(--rule)] py-3 sm:grid-cols-4">
            <div>
              <dt className="eyebrow">{t.compare.diffKept}</dt>
              <dd className="text-lg" style={{ fontFamily: "var(--font-serif)" }}>
                {result.stats.same}
              </dd>
            </div>
            <div>
              <dt className="eyebrow">{t.compare.diffAdded}</dt>
              <dd className="text-lg" style={{ fontFamily: "var(--font-serif)" }}>
                {result.stats.added}
              </dd>
            </div>
            <div>
              <dt className="eyebrow">{t.compare.diffRemoved}</dt>
              <dd className="text-lg" style={{ fontFamily: "var(--font-serif)" }}>
                {result.stats.removed}
              </dd>
            </div>
            <div>
              <dt className="eyebrow">{t.compare.diffChanged}</dt>
              <dd className="text-lg" style={{ fontFamily: "var(--font-serif)" }}>
                {result.stats.changedPercent}%
              </dd>
            </div>
          </dl>

          {result.stats.identical && (
            <p className="mt-3 text-sm text-[var(--ink-2)]">{t.compare.diffIdentical}</p>
          )}
          {result.stats.coarse && (
            <p className="mt-3 text-sm text-[var(--ink-3)]">{t.compare.diffCoarse}</p>
          )}

          <p className="mt-3 text-xs text-[var(--ink-3)]">{t.compare.diffLegend}</p>

          {/*
            Phần thêm và phần bớt được phân biệt bằng cả kiểu chữ lẫn màu: gạch
            ngang cho phần bớt, gạch chân cho phần thêm. Người không phân biệt
            được màu vẫn đọc ra kết quả.
          */}
          <p className="mt-2 whitespace-pre-wrap border border-[var(--rule)] bg-[var(--paper-2)] p-4 text-[0.9375rem] leading-[1.9]">
            {result.segments.map((s, i) => {
              if (s.type === "same") return <span key={i}>{s.text}</span>;
              if (s.type === "del") {
                return (
                  <del
                    key={i}
                    className="bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] text-[var(--ink-2)] decoration-[var(--accent)]"
                  >
                    {s.text}
                  </del>
                );
              }
              return (
                <ins
                  key={i}
                  className="bg-[color-mix(in_oklab,var(--brass)_20%,transparent)] text-[var(--ink)] decoration-[var(--brass)] underline-offset-2"
                >
                  {s.text}
                </ins>
              );
            })}
          </p>
        </div>
      )}
    </div>
  );
}
