import Link from "next/link";

import { LegalStatus, type StatusTone } from "@/components/legal/LegalStatus";
import type { Lang } from "@/data/types";
import { formatDate, getDict } from "@/i18n/dictionary";
import { getSearchCopy } from "@/i18n/search";
import { getValidityCopy } from "@/i18n/validity";
import type { ArticleEntry } from "@/lib/article-query";
import { withAsOf } from "@/lib/client-store";
import { highlight, stateAt, type Hit, type Intent } from "@/lib/search-engine";
import type { DocRef, IndexDoc } from "@/lib/search-types";
import type { ValidityState } from "@/lib/validity-segment";

/**
 * Các mảnh hiển thị kết quả tìm kiếm, dùng chung cho ô tìm ở trang chủ và bảng
 * lệnh. Chỉ đọc chỉ mục đã gửi xuống trình duyệt; không nhập tập dữ liệu.
 */

export function docHref(lang: Lang, id: string, asOf: string, hash?: string): string {
  return withAsOf(`/${lang}/van-ban/${id}${hash ? `#${hash}` : ""}`, asOf);
}

/** Chữ có tô chỗ khớp. */
export function Hl({ text, terms }: { text: string; terms: string[] }) {
  return (
    <>
      {highlight(text, terms).map((p, i) =>
        p.hit ? (
          <mark key={i} className="hl">
            {p.t}
          </mark>
        ) : (
          <span key={i}>{p.t}</span>
        ),
      )}
    </>
  );
}

const STATE_TONE: Record<ValidityState, StatusTone> = {
  "in-force": "active",
  pending: "pending",
  expired: "expired",
  unknown: "unknown",
};

/**
 * Tình trạng của một văn bản trong chỉ mục: tại ngày được hỏi nếu có, không thì
 * tại ngày tra cứu của bản ghi.
 */
export function IndexStatus({
  doc,
  date,
  lang,
  size = "sm",
}: {
  doc: IndexDoc;
  date?: string;
  lang: Lang;
  size?: "sm" | "md" | "lg";
}) {
  const c = getSearchCopy(lang);
  if (!date) {
    return (
      <LegalStatus
        tone={doc.st}
        label={getDict(lang).status[doc.st]}
        title={c.statusExplain[doc.st]}
        size={size}
      />
    );
  }
  const v = getValidityCopy(lang);
  const seg = stateAt(doc, date);
  const amended = seg.state === "in-force" && seg.amended;
  return (
    <LegalStatus
      tone={amended ? "amended" : STATE_TONE[seg.state]}
      label={`${v.state[seg.state]}${amended ? `, ${v.amended}` : ""}`}
      title={c.stateExplain[seg.state]}
      size={size}
    />
  );
}

/** Ngày văn bản hết hiệu lực, khi dữ liệu biết chính xác ngày đó. */
function endOf(doc: IndexDoc): string {
  const hit = doc.seg.find((x) => x.state === "expired" && !x.recorded && x.since);
  return hit?.since ?? "";
}

/** "Hiệu lực 01/07/2026 → nay", hoặc "→ 01/07/2026" khi đã biết ngày hết hiệu lực. */
export function RangeLine({ doc, lang }: { doc: IndexDoc; lang: Lang }) {
  const c = getSearchCopy(lang);
  const s = c.search;
  const start = doc.eff || doc.iss;
  if (!start) return null;
  const end = endOf(doc);
  const tail =
    end ? formatDate(end, lang, end) : doc.st === "active" || doc.st === "amended" ? s.now : "";
  return (
    <span className="tnum">
      {doc.eff ? s.effective : s.issued} {formatDate(start, lang, start)}
      {tail && ` → ${tail}`}
    </span>
  );
}

function Refs({ refs, lang, asOf }: { refs: DocRef[]; lang: Lang; asOf: string }) {
  return (
    <>
      {refs.map(([id, n], i) => (
        <span key={id}>
          {i > 0 && ", "}
          <Link href={docHref(lang, id, asOf)} className="ref-link tnum">
            {n}
          </Link>
        </span>
      ))}
    </>
  );
}

/** Một dòng quan hệ gọn dưới mỗi kết quả: thay thế, bị thay thế, sửa đổi, hướng dẫn. */
export function RelationLine({ doc, lang }: { doc: IndexDoc; lang: Lang }) {
  const c = getSearchCopy(lang);
  const s = c.search;
  const parts: string[] = [];
  if (doc.rep.length) parts.push(`${s.replaces} ${doc.rep.map((r) => r[1]).join(", ")}`);
  if (doc.by.length) parts.push(`${s.replacedBy} ${doc.by.map((r) => r[1]).join(", ")}`);
  if (doc.amBy.length) parts.push(`${s.amendedBy} ${doc.amBy.map((r) => r[1]).join(", ")}`);
  if (doc.kids) parts.push(s.guidedBy(doc.kids));
  if (parts.length === 0) return null;
  return <p className="sr-rel tnum">{parts.join(" · ")}</p>;
}

export function ResultRow({
  hit,
  lang,
  terms,
  date,
}: {
  hit: Hit;
  lang: Lang;
  terms: string[];
  date?: string;
}) {
  const t = getDict(lang);
  const c = getSearchCopy(lang);
  const s = c.search;
  const doc = hit.doc;
  return (
    <>
      <span className="sr-top">
        <span className="sr-num tnum">
          <Hl text={doc.n} terms={terms} />
        </span>
        <span className="sr-type">{t.type[doc.ty]}</span>
        {doc.cc && <span className="sr-flag">{s.crossCheck}</span>}
      </span>
      <span className="sr-title">
        <Hl text={doc.t} terms={terms} />
      </span>
      <span className="sr-meta">
        <IndexStatus doc={doc} date={date} lang={lang} />
        <RangeLine doc={doc} lang={lang} />
      </span>
      <RelationLine doc={doc} lang={lang} />
      {hit.viaRelation && <span className="sr-via">{s.via}</span>}
    </>
  );
}

export function ArticleRow({ a }: { a: ArticleEntry }) {
  return (
    <>
      <span className="sr-num">{a.label}</span>
      <span className="sr-title">
        {a.topic} · <span className="tnum">{a.pair}</span>
      </span>
    </>
  );
}

/**
 * Trả lời có cấu trúc cho câu tìm nhắm đúng một văn bản.
 *
 * Mọi dòng đọc thẳng từ chỉ mục: tình trạng tại ngày được hỏi, văn bản thay
 * thế, văn bản sửa đổi, văn bản hướng dẫn. Không có câu văn nào được sinh ra;
 * chỗ dữ liệu không ghi nhận thì nói là chưa ghi nhận.
 */
export function AnswerCard({
  doc,
  intent,
  date,
  asOf,
  lang,
  onNavigate,
}: {
  doc: IndexDoc;
  intent?: Intent;
  /** Ngày trong câu tìm; thiếu thì dùng ngày tra cứu đang đặt, rồi ngày tra cứu của bản ghi. */
  date?: string;
  asOf: string;
  lang: Lang;
  onNavigate?: () => void;
}) {
  const c = getSearchCopy(lang);
  const s = c.search;
  const t = getDict(lang);
  const at = date || asOf;
  const seg = at ? stateAt(doc, at) : null;
  const caption = at
    ? s.atDate(formatDate(at, lang, at))
    : s.atVerified(formatDate(doc.ver, lang, doc.ver));

  type Row = { key: string; label: string; refs?: DocRef[]; text?: string; empty: string };
  const rows: Row[] = [
    { key: "rep", label: s.replaces, refs: doc.rep, empty: s.answerNoPredecessor },
    { key: "by", label: s.replacedBy, refs: doc.by, empty: s.answerNoReplacer },
    { key: "am", label: s.amendedBy, refs: doc.amBy, empty: s.answerNoAmender },
    {
      key: "kids",
      label: s.guides,
      text: doc.kids ? s.guidedBy(doc.kids) : "",
      empty: s.answerNoGuide,
    },
  ];
  // Dòng mà câu hỏi nhắm tới đứng đầu và luôn hiện, kể cả khi trống; các dòng
  // khác chỉ hiện khi có dữ liệu.
  const wanted: Record<Intent, string[]> = {
    replace: ["by", "rep"],
    amend: ["am"],
    guide: ["kids"],
    validity: [],
  };
  const want = intent ? wanted[intent] : [];
  const ordered = [
    ...want.map((k) => rows.find((r) => r.key === k)!),
    ...rows.filter((r) => !want.includes(r.key)),
  ].filter((r) => want.includes(r.key) || (r.refs ? r.refs.length > 0 : !!r.text));

  return (
    <section className="answer" aria-label={s.answerTitle}>
      <p className="answer-eyebrow">{s.answerTitle}</p>
      <div className="answer-head">
        <Link href={docHref(lang, doc.id, asOf)} className="answer-num tnum" onClick={onNavigate}>
          {doc.n}
        </Link>
        <span className="answer-type">{t.type[doc.ty]}</span>
      </div>
      <p className="answer-title">{doc.t}</p>
      <div className="answer-status">
        <IndexStatus doc={doc} date={at || undefined} lang={lang} size="lg" />
        <span className="answer-caption">
          {caption}
          {seg?.byId && seg.byNumber && (
            <>
              {" · "}
              <Link href={docHref(lang, seg.byId, asOf)} className="ref-link tnum" onClick={onNavigate}>
                {seg.byNumber}
              </Link>
            </>
          )}
        </span>
      </div>
      {ordered.length > 0 && (
        <dl className="answer-rows">
          {ordered.map((r) => (
            <div key={r.key}>
              <dt>{r.label}</dt>
              <dd>
                {r.refs && r.refs.length > 0 ? (
                  <Refs refs={r.refs} lang={lang} asOf={asOf} />
                ) : r.text ? (
                  r.text
                ) : (
                  <span className="answer-empty">{r.empty}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
      <div className="answer-actions">
        <Link href={docHref(lang, doc.id, asOf, "gia-pha")} className="btn btn-quiet btn-sm" onClick={onNavigate}>
          {s.openLineage}
        </Link>
        {doc.pair && (
          <Link href={`/${lang}/doi-chieu/${doc.pair}`} className="btn btn-quiet btn-sm" onClick={onNavigate}>
            {s.compare}
          </Link>
        )}
        {doc.ft && (
          <a href={doc.ft} target="_blank" rel="noopener noreferrer nofollow" className="btn btn-quiet btn-sm">
            {s.fullText} <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </section>
  );
}
