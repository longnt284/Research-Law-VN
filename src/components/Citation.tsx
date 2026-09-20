"use client";

import Link from "next/link";
import { useState } from "react";

import { documentsById } from "@/data/documents";
import type { CitationRef, Lang } from "@/data/types";
import { getDict } from "@/i18n/dictionary";
import {
  citationHref,
  formatCitation,
  formatPinpoint,
  formatShortCitation,
  parseCitation,
} from "@/lib/citation";

/**
 * Một căn cứ hiển thị trên trang.
 *
 * Nhãn là số hiệu kèm phần chỉ chỗ, đủ ngắn để nằm gọn trong một dòng căn cứ.
 * Trích dẫn đầy đủ nằm ở thuộc tính `title`, nên người rê chuột đọc được ngay
 * dạng dán được vào hồ sơ mà dòng căn cứ không bị kéo dài ra.
 */
export function CitationLink({ cite, lang }: { cite: CitationRef; lang: Lang }) {
  const parsed = parseCitation(cite);
  return (
    <Link
      href={citationHref(parsed, lang)}
      title={formatCitation(parsed, lang)}
      className="tnum underline decoration-[var(--rule-strong)] underline-offset-2 transition-colors hover:text-[var(--accent)]"
    >
      {formatShortCitation(parsed, lang)}
    </Link>
  );
}

/**
 * Gom các trích dẫn cùng một văn bản lại một chỗ.
 *
 * Một vế hay dẫn vài điều khoản của cùng một luật. Để nguyên thì số hiệu lặp
 * lại bốn năm lần trên một dòng, và mắt phải đọc qua phần giống nhau mới tới
 * phần khác nhau. Gom lại thì số hiệu xuất hiện một lần, các chỗ được dẫn nằm
 * kế tiếp nhau và so được với nhau ngay.
 */
function groupByDoc(refs: readonly CitationRef[]) {
  const order: string[] = [];
  const byDoc = new Map<string, CitationRef[]>();
  for (const ref of refs) {
    const { docId } = parseCitation(ref);
    if (!byDoc.has(docId)) {
      byDoc.set(docId, []);
      order.push(docId);
    }
    byDoc.get(docId)!.push(ref);
  }
  return order.map((docId) => ({ docId, refs: byDoc.get(docId)! }));
}

/**
 * Dòng căn cứ của một vế.
 *
 * Trước đây căn cứ của hai vế bị gộp thành một dãy số hiệu, nên người đọc thấy
 * được những văn bản nào đã được đọc nhưng không biết vế nào đọc từ đâu. Tách
 * theo vế thì một điểm đối chiếu tự nói rõ: dòng này đọc từ đây, dòng kia đọc
 * từ chỗ khác.
 */
export function BasisSide({
  label,
  refs,
  lang,
}: {
  label: string;
  refs: readonly CitationRef[];
  lang: Lang;
}) {
  if (refs.length === 0) return null;
  const groups = groupByDoc(refs);
  return (
    <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xs text-[var(--ink-3)]">
      <span className="eyebrow">{label}</span>
      {groups.map((group, gi) => {
        const doc = documentsById.get(group.docId);
        const number = doc ? doc.number : group.docId;
        /*
          Bỏ trích dẫn tới cả văn bản khi vế này còn dẫn tới điều khoản cụ thể
          của chính văn bản đó. Số hiệu đã đứng ngay đầu nhóm và tự nó là một
          liên kết, nên thêm một mục nữa chỉ làm dòng dài ra mà không chỉ thêm
          chỗ nào.
        */
        const pinned = group.refs.filter((r) => !parseCitation(r).whole);
        return (
          <span key={group.docId} className="flex flex-wrap items-baseline gap-x-2">
            {gi > 0 && <span aria-hidden="true">|</span>}
            <Link
              href={`/${lang}/van-ban/${group.docId}`}
              title={formatCitation(parseCitation(group.docId), lang)}
              className="tnum underline decoration-[var(--rule-strong)] underline-offset-2 transition-colors hover:text-[var(--accent)]"
            >
              {number}
            </Link>
            {pinned.map((r) => {
              const parsed = parseCitation(r);
              return (
                <span key={r} className="flex items-baseline gap-x-2">
                  <span aria-hidden="true">·</span>
                  <Link
                    href={citationHref(parsed, lang)}
                    title={formatCitation(parsed, lang)}
                    className="underline decoration-[var(--rule-strong)] underline-offset-2 transition-colors hover:text-[var(--accent)]"
                  >
                    {formatPinpoint(parsed, lang)}
                  </Link>
                </span>
              );
            })}
          </span>
        );
      })}
    </p>
  );
}

/**
 * Nút sao chép trích dẫn.
 *
 * Việc mà người tra cứu làm ngay sau khi tìm đúng văn bản là chép số hiệu và tên
 * vào một bản ghi nhớ hay một bản luận cứ, và chép tay thì hay rụng mất số khóa
 * hoặc sai một chữ trong tên. Nút này trả về đúng chuỗi trích dẫn đã chuẩn hóa
 * của trang đang xem.
 *
 * Không có `navigator.clipboard` thì nút tự ẩn đi thay vì báo lỗi: trình duyệt
 * cũ và ngữ cảnh không bảo mật vẫn đọc được trang, chỉ là không chép được.
 */
export function CopyCitation({ text, lang }: { text: string; lang: Lang }) {
  const t = getDict(lang);
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          window.setTimeout(() => setDone(false), 2000);
        } catch {
          setDone(false);
        }
      }}
      aria-live="polite"
      className="btn btn-quiet w-full justify-center"
    >
      {done ? t.doc.citationCopied : t.doc.citationCopy}
    </button>
  );
}
