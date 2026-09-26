"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CopyChip } from "@/components/Citation";
import type { Lang } from "@/data/types";
import { getArticleCopy } from "@/i18n/article";
import { citationHref, formatCitation, parseCitation, type Citation } from "@/lib/citation";

/**
 * Dòng báo chỗ được dẫn, khi trang văn bản được mở bằng `?tai=…`.
 *
 * Trích dẫn tới một phụ lục hay một chương không có trang riêng, nên đường dẫn
 * của nó dừng ở trang văn bản và mang phần chỉ chỗ trong tham số `tai`. Trước
 * đây trang không đọc tham số này và người bấm chỉ tới đầu trang, không biết
 * mình được dẫn tới đâu. Dòng này nói rõ chỗ đó, cho chép trích dẫn, và nếu chỗ
 * được dẫn là một điều đã có trang riêng (đường dẫn cũ) thì đưa tới trang ấy.
 *
 * Trang văn bản là HTML tĩnh, nên tham số chỉ đọc được trên trình duyệt.
 */
export function PinpointNotice({
  lang,
  docId,
  articles,
}: {
  lang: Lang;
  docId: string;
  /** Các điều của văn bản này đã có trang riêng. */
  articles: string[];
}) {
  const c = getArticleCopy(lang);
  const [cite, setCite] = useState<Citation | null>(null);

  useEffect(() => {
    const tai = new URLSearchParams(window.location.search).get("tai");
    if (!tai) return;
    try {
      const parsed = parseCitation(`${docId}#${tai}`);
      if (!parsed.whole) setCite(parsed);
    } catch {
      // Tham số hỏng thì không báo gì: trang văn bản vẫn đúng như khi không có nó.
    }
  }, [docId]);

  if (!cite) return null;
  const text = formatCitation(cite, lang);
  const dieu = cite.parts.find((x) => x.part === "dieu")?.value.toLowerCase();

  return (
    <div role="status" className="mb-6 border border-[var(--accent)] bg-[var(--paper-2)] px-4 py-3">
      <p className="text-sm leading-relaxed">
        <span className="eyebrow mr-2">{c.pinNotice}</span>
        <span style={{ fontFamily: "var(--font-serif)" }}>{text}</span>
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <CopyChip text={text} label={c.copy} done={c.copied} />
        {dieu && articles.includes(dieu) && (
          <Link href={citationHref(cite, lang)} className="chip">
            {c.pinArticle} →
          </Link>
        )}
      </div>
    </div>
  );
}
