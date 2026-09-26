import Link from "next/link";

import { StatusBadge } from "@/components/DocMeta";
import type { Lang, LegalDoc } from "@/data/types";
import { getDocPanel } from "@/i18n/doc-panel";
import type { Family } from "@/lib/family";

/**
 * Dải ba cột ở đầu trang văn bản: đời trước, đang xem, đời sau.
 *
 * Người đọc đi ngược hay đi xuôi qua các đời văn bản bằng đúng một cú bấm, và
 * thấy ngay tình trạng của từng đời. Đời nào chưa ghi nhận thì nói là chưa ghi
 * nhận, thay vì để trống một ô không rõ nghĩa.
 */

function Gen({ doc, lang }: { doc: LegalDoc; lang: Lang }) {
  return (
    <span className="strip-doc">
      <span className="strip-num tnum">{doc.number}</span>
      <span className="strip-title">{doc.title[lang]}</span>
      <StatusBadge status={doc.status} lang={lang} size="sm" />
    </span>
  );
}

export function LineageStrip({ fam, lang }: { fam: Family; lang: Lang }) {
  const c = getDocPanel(lang).strip;
  const prev = fam.ancestors.map((n) => n.doc);
  const next = fam.successors.map((n) => n.doc);
  return (
    <nav className="strip" aria-label={c.label}>
      <div className="strip-col strip-col--prev">
        <p className="strip-role">{c.previous}</p>
        {prev.length === 0 ? (
          <p className="strip-empty">{c.noPrevious}</p>
        ) : (
          prev.map((d) => (
            <Link key={d.id} href={`/${lang}/van-ban/${d.id}`} className="strip-link" aria-label={c.prevAria(d.number)}>
              <span aria-hidden="true" className="strip-arrow">
                ←
              </span>
              <Gen doc={d} lang={lang} />
            </Link>
          ))
        )}
      </div>
      <div className="strip-col strip-col--current" aria-current="page">
        <p className="strip-role">{c.current}</p>
        <Gen doc={fam.focus} lang={lang} />
      </div>
      <div className="strip-col strip-col--next">
        <p className="strip-role">{c.next}</p>
        {next.length === 0 ? (
          <p className="strip-empty">{c.noNext}</p>
        ) : (
          next.map((d) => (
            <Link key={d.id} href={`/${lang}/van-ban/${d.id}`} className="strip-link" aria-label={c.nextAria(d.number)}>
              <Gen doc={d} lang={lang} />
              <span aria-hidden="true" className="strip-arrow">
                →
              </span>
            </Link>
          ))
        )}
      </div>
    </nav>
  );
}
