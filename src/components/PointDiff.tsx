"use client";

import { useMemo, useState } from "react";

import type { Lang } from "@/data/types";
import { getDict } from "@/i18n/dictionary";
import { diffText } from "@/lib/diff";

/**
 * Chênh lệch câu chữ giữa hai vế của một điểm đối chiếu.
 *
 * Trang cặp đã có ô dán văn bản ở cuối, nhưng ô đó đòi người đọc tự đi tìm hai
 * bản văn rồi chép về. Với hai vế đã viết sẵn trong tập dữ liệu thì không cần
 * bước ấy: cùng một phép so sánh, chạy thẳng trên nội dung đang hiển thị.
 *
 * Phép so sánh vẫn thuần cơ học và vẫn chạy trong trình duyệt. Nó chỉ ra chỗ
 * câu chữ khác nhau giữa hai vế, không kết luận rằng quy định đã đổi: hai vế ở
 * đây là tóm tắt do người biên soạn viết, nên chênh lệch câu chữ giữa chúng
 * không phải là chênh lệch giữa hai điều luật.
 *
 * Mặc định đóng, và chỉ tính khi người đọc mở: một trang có mười lăm điểm đối
 * chiếu thì mười lăm bảng quy hoạch động là cái giá không đáng trả cho thứ hầu
 * hết người đọc không mở tới.
 */
export function PointDiff({
  before,
  after,
  lang,
}: {
  before: string;
  after: string;
  lang: Lang;
}) {
  const t = getDict(lang);
  const [open, setOpen] = useState(false);

  const result = useMemo(
    () => (open ? diffText(before, after) : null),
    [open, before, after],
  );

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="btn btn-quiet"
      >
        {open ? t.compare.pointDiffHide : t.compare.pointDiffShow}
      </button>

      {result && (
        <div className="mt-3 border border-[var(--rule)] bg-[var(--paper-2)] p-4">
          <p className="measure text-xs leading-relaxed text-[var(--ink-3)]">
            {t.compare.pointDiffHint}
          </p>
          <dl className="tnum mt-3 grid grid-cols-2 gap-3 border-y border-[var(--rule)] py-2 sm:grid-cols-4">
            <div>
              <dt className="eyebrow">{t.compare.diffKept}</dt>
              <dd className="text-[0.9375rem]">{result.stats.same}</dd>
            </div>
            <div>
              <dt className="eyebrow">{t.compare.diffAdded}</dt>
              <dd className="text-[0.9375rem]">{result.stats.added}</dd>
            </div>
            <div>
              <dt className="eyebrow">{t.compare.diffRemoved}</dt>
              <dd className="text-[0.9375rem]">{result.stats.removed}</dd>
            </div>
            <div>
              <dt className="eyebrow">{t.compare.diffChanged}</dt>
              <dd className="text-[0.9375rem]">{result.stats.changedPercent}%</dd>
            </div>
          </dl>

          {result.stats.identical && (
            <p className="mt-2 text-sm text-[var(--ink-2)]">{t.compare.diffIdentical}</p>
          )}

          {/* Cùng quy ước với ô dán văn bản: gạch ngang là phần chỉ có ở vế cũ,
              gạch chân là phần chỉ có ở vế mới. Người không phân biệt được màu
              vẫn đọc ra kết quả. */}
          <p className="mt-3 whitespace-pre-wrap text-[0.9375rem] leading-[1.9]">
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
          <p className="mt-2 text-xs text-[var(--ink-3)]">{t.compare.diffLegend}</p>
        </div>
      )}
    </div>
  );
}
