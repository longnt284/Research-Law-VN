"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { ValidityBadge } from "@/components/validity/ValidityBadge";
import type { Lang } from "@/data/types";
import { getCheckCopy, type CheckCopy } from "@/i18n/check";
import { formatDate } from "@/i18n/dictionary";
import {
  extractNumbers,
  nearKeys,
  replacementChain,
  type BasisRow,
  type ChainLink,
  type NumberHit,
} from "@/lib/basis-check";
import { segmentAt, type ValiditySegment } from "@/lib/validity-segment";

type Verdict = "inForce" | "amended" | "pending" | "expired" | "unknown" | "missing";

interface Result {
  hit: NumberHit;
  row?: BasisRow;
  seg?: ValiditySegment;
  verdict: Verdict;
  chain: ChainLink[];
  /** Văn bản sửa đổi đã có hiệu lực tại ngày được chọn. */
  amendedBy: BasisRow["amenders"];
  near: BasisRow[];
}

/** Ngày hôm nay theo giờ máy người đọc, dạng YYYY-MM-DD. */
function today(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function verdictOf(seg: ValiditySegment): Verdict {
  if (seg.state === "in-force") return seg.amended ? "amended" : "inForce";
  if (seg.state === "pending") return "pending";
  if (seg.state === "expired") return "expired";
  return "unknown";
}

/**
 * Ô soát căn cứ.
 *
 * Toàn bộ phép soát chạy trong trình duyệt trên các dòng dựng sẵn ở máy chủ.
 * Đoạn văn người đọc dán vào không đi đâu cả: không lưu vào bộ nhớ trình duyệt,
 * không gửi lên máy chủ. Một khối căn cứ có thể nằm trong một hợp đồng chưa ký,
 * và chính sách nguồn nội dung của trang (`connect-src 'self'`) cùng việc không
 * có đoạn mã theo dõi nào là lý do lời hứa đó giữ được.
 */
export function BasisChecker({
  lang,
  rows,
  named,
  sample,
  verifiedOn,
}: {
  lang: Lang;
  rows: BasisRow[];
  /** Số hiệu so nguyên văn, xem `namedNumbers`. */
  named: string[];
  /** Đoạn mẫu dựng từ tập dữ liệu ở máy chủ. */
  sample: string;
  /** Ngày tra cứu gần nhất của tập dữ liệu. */
  verifiedOn: string;
}) {
  const c = getCheckCopy(lang);
  const [text, setText] = useState("");
  const [date, setDate] = useState("");
  const [copied, setCopied] = useState(false);

  // Ngày mặc định là hôm nay, đặt sau khi gắn: máy chủ dựng trang từ trước và
  // không biết người đọc mở nó vào ngày nào.
  useEffect(() => {
    setDate(today());
  }, []);

  const deferred = useDeferredValue(text);

  const byKey = useMemo(() => new Map(rows.map((r) => [r.key, r])), [rows]);
  const byId = useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows]);

  const extraction = useMemo(() => extractNumbers(deferred, named), [deferred, named]);

  const results = useMemo<Result[]>(() => {
    if (!date) return [];
    return extraction.hits.map((hit) => {
      const row = byKey.get(hit.key);
      if (!row) {
        const near = nearKeys(hit.key, byKey.keys())
          .map((k) => byKey.get(k))
          .filter((r): r is BasisRow => Boolean(r));
        return { hit, verdict: "missing", chain: [], amendedBy: [], near };
      }
      const seg = segmentAt(row.segments, date);
      const verdict = verdictOf(seg);
      return {
        hit,
        row,
        seg,
        verdict,
        chain: verdict === "expired" ? replacementChain(row, date, byId) : [],
        amendedBy: verdict === "amended" ? row.amenders.filter((a) => a.from <= date) : [],
        near: [],
      };
    });
  }, [extraction, date, byKey, byId]);

  const tally = useMemo(() => {
    const n: Record<Verdict, number> = {
      inForce: 0,
      amended: 0,
      pending: 0,
      expired: 0,
      unknown: 0,
      missing: 0,
    };
    for (const r of results) n[r.verdict]++;
    return n;
  }, [results]);

  const fmt = (iso: string) => formatDate(iso, lang, iso);

  /**
   * Một dòng kết quả dạng chữ thường, dùng cho nút sao chép. Vế đầu sau dấu hai
   * chấm là tình trạng; các câu sau nói căn cứ của tình trạng đó.
   */
  const plain = (r: Result): string => {
    const head = r.row ? `${r.row.number} — ${r.row.title}` : r.hit.raw;
    const flags = [r.row?.crossCheck && c.crossCheck, r.row?.hasNote && c.hasNote].filter(
      (f): f is string => Boolean(f),
    );
    if (!r.row || !r.seg) return `${head}: ${c.missingBadge.toLowerCase()}.`;
    const since = r.seg.since ? ` ${c.from} ${fmt(r.seg.since)}` : "";
    const parts: string[] = [];
    if (r.verdict === "inForce") parts.push(`${c.tally.inForce}${since}`);
    if (r.verdict === "amended") {
      parts.push(c.tally.amended);
      parts.push(`${c.readWith} ${r.amendedBy.map((a) => `${a.number} (${fmt(a.from)})`).join(", ")}`);
    }
    if (r.verdict === "pending") parts.push(c.tally.pending, `${c.pendingFrom}${since}`);
    if (r.verdict === "unknown") parts.push(c.tally.unknown, c.unknown);
    if (r.verdict === "expired") {
      parts.push(`${c.tally.expired}${since}`);
      if (r.seg.recorded) parts.push(c.recorded);
      r.chain.forEach((link, i) => {
        const prev = i === 0 ? r.row! : r.chain[i - 1].row;
        parts.push(`${chainLead(c, link, i, prev.number)} ${link.row.number} (${c.from} ${fmt(link.since)})`);
      });
      const end = chainEnd(r.chain, date);
      if (end) parts.push(`${c.chainEnd} ${end.number}`);
    }
    // Vài câu trong lời đã mang dấu chấm; bỏ đi trước khi nối để khỏi thành "..".
    // Dấu hiệu của bản ghi thành câu cuối, các vế sau vế đầu viết thường.
    if (flags.length) {
      parts.push(flags.map((f, i) => (i ? `${f[0].toLowerCase()}${f.slice(1)}` : f)).join("; "));
    }
    return `${head}: ${parts.map((p) => p.replace(/\.$/, "")).join(". ")}.`;
  };

  const report = () =>
    [
      c.reportHead(fmt(date), fmt(verifiedOn)),
      "",
      ...results.map((r, i) => `${i + 1}. ${plain(r)}`),
      ...(extraction.unnumbered.length
        ? ["", `${c.unnumberedTitle}:`, ...extraction.unnumbered.map((u) => `- ${c.line(u.line)}: ${u.text}`)]
        : []),
      "",
      c.reportFoot(rows.length),
    ].join("\n");

  const hasText = deferred.trim().length > 0;

  return (
    <div className="mx-auto grid w-full max-w-[76rem] gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] lg:gap-12">
      {/* Cột nhập bám theo khi cuộn: danh sách kết quả có thể dài hơn một màn
          hình, và người soát hay quay lại sửa một dòng rồi xem kết quả đổi. */}
      <div className="min-w-0 self-start lg:sticky lg:top-[4.5rem]">
        <label htmlFor="basis-text" className="eyebrow block">
          {c.inputLabel}
        </label>
        <textarea
          id="basis-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={c.inputPlaceholder}
          rows={11}
          spellCheck={false}
          className="mt-1.5 block w-full resize-y border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2.5 text-[0.9375rem] leading-relaxed outline-none transition-colors placeholder:text-[var(--ink-3)] focus:border-[var(--accent)]"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className="chip" onClick={() => setText(sample)}>
            {c.useSample}
          </button>
          {text && (
            <button type="button" className="chip" onClick={() => setText("")}>
              {c.clear}
            </button>
          )}
        </div>

        <label htmlFor="basis-date" className="eyebrow mt-5 block">
          {c.dateLabel}
        </label>
        <input
          id="basis-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-describedby="basis-date-hint"
          className="tnum mt-1.5 w-full border border-[var(--rule-strong)] bg-[var(--paper)] px-2.5 py-1.5 text-[0.9375rem] outline-none focus:border-[var(--accent)] sm:w-auto"
        />
        <p id="basis-date-hint" className="mt-1.5 text-xs leading-relaxed text-[var(--ink-3)]">
          {c.dateHint}
        </p>
        {date > verifiedOn && (
          <p className="mt-2 border-l-2 border-[var(--brass)] pl-3 text-xs leading-relaxed text-[var(--ink-2)]">
            {c.afterReview(fmt(verifiedOn))}
          </p>
        )}
        <p className="mt-5 text-xs leading-relaxed text-[var(--ink-3)]">{c.privacy}</p>
      </div>

      <section aria-live="polite" className="min-w-0">
        {!hasText ? (
          <div className="border border-dashed border-[var(--rule-strong)] px-6 py-12 text-center">
            <p style={{ fontFamily: "var(--font-serif)" }} className="text-lg">
              {c.emptyTitle}
            </p>
            <p className="measure mx-auto mt-1.5 text-sm text-[var(--ink-3)]">{c.emptyHint}</p>
          </div>
        ) : (
          <>
            {results.length === 0 && extraction.hits.length === 0 ? (
              <p className="border border-[var(--rule)] bg-[var(--paper-2)] px-4 py-3.5 text-sm text-[var(--ink-2)]">
                {c.noneFound}
              </p>
            ) : (
              <>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="eyebrow tnum">
                      {c.summary(results.length, results.length - tally.missing)}
                    </p>
                    <p className="tnum mt-1 text-sm text-[var(--ink-2)]">
                      {(Object.keys(tally) as Verdict[])
                        .filter((k) => tally[k] > 0)
                        .map((k) => `${tally[k]} ${c.tally[k]}`)
                        .join(" · ")}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-quiet"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(report());
                        setCopied(true);
                        window.setTimeout(() => setCopied(false), 2000);
                      } catch {
                        setCopied(false);
                      }
                    }}
                  >
                    {copied ? c.copied : c.copy}
                  </button>
                </div>

                <ol className="mt-4 border-t border-[var(--rule)]">
                  {results.map((r) => (
                    <ResultItem
                      key={r.hit.key}
                      r={r}
                      lang={lang}
                      date={date}
                      docs={rows.length}
                    />
                  ))}
                </ol>
              </>
            )}

            {extraction.unnumbered.length > 0 && (
              <section className="mt-8 border border-[var(--rule)] bg-[var(--paper-2)] px-4 py-3.5">
                <h2 className="eyebrow">{c.unnumberedTitle}</h2>
                <ul className="mt-2 space-y-1.5">
                  {extraction.unnumbered.map((u) => (
                    <li key={u.line} className="text-sm leading-relaxed">
                      <span className="tnum mr-2 text-[var(--ink-3)]">{c.line(u.line)}</span>
                      {u.text}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs leading-relaxed text-[var(--ink-3)]">{c.unnumberedHint}</p>
              </section>
            )}
          </>
        )}
      </section>
    </div>
  );
}

/** Liên kết tới trang một văn bản, số hiệu in đậm. */
function DocLink({ row, lang }: { row: { id: string; number: string }; lang: Lang }) {
  return (
    <Link
      href={`/${lang}/van-ban/${row.id}`}
      className="tnum font-semibold text-[var(--accent)] underline decoration-[var(--rule-strong)] underline-offset-2 hover:decoration-[var(--accent)]"
    >
      {row.number}
    </Link>
  );
}

function ResultItem({
  r,
  lang,
  date,
  docs,
}: {
  r: Result;
  lang: Lang;
  date: string;
  docs: number;
}) {
  const c = getCheckCopy(lang);
  const fmt = (iso: string) => formatDate(iso, lang, iso);
  const { row, seg } = r;
  // Người đọc thấy ngay dòng nào cần xem lại: vạch bên trái chỉ có ở văn bản
  // không đang có hiệu lực nguyên trạng.
  const flag =
    r.verdict === "expired" || r.verdict === "missing" || r.verdict === "pending"
      ? "border-l-2 border-l-[var(--accent)]"
      : r.verdict === "amended" || r.verdict === "unknown"
        ? "border-l-2 border-l-[var(--brass)]"
        : "border-l-2 border-l-transparent";

  return (
    <li className={`border-b border-[var(--rule)] py-4 pl-4 ${flag}`}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="tnum text-xs text-[var(--ink-3)]">{c.line(r.hit.line)}</span>
        {row ? (
          <DocLink row={row} lang={lang} />
        ) : (
          <span className="tnum font-semibold">{r.hit.raw}</span>
        )}
        {row && r.hit.raw !== row.number && (
          <span className="text-xs text-[var(--ink-3)]">
            ({c.asTyped} <span className="tnum">{r.hit.raw}</span>)
          </span>
        )}
      </div>
      {row && (
        <p className="mt-1 text-[1.0625rem] leading-snug" style={{ fontFamily: "var(--font-serif)" }}>
          {row.title}{" "}
          <span className="ml-1 align-middle text-xs text-[var(--ink-3)]" style={{ fontFamily: "var(--font-sans)" }}>
            {row.type}
          </span>
        </p>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        {seg ? (
          <ValidityBadge state={seg.state} amended={seg.amended} lang={lang} />
        ) : (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap border border-dashed border-[var(--rule-strong)] px-2 py-0.5 text-[0.6875rem] font-medium text-[var(--ink-3)]">
            {c.missingBadge}
          </span>
        )}
        {row?.crossCheck && (
          <span className="whitespace-nowrap border border-[var(--brass)] px-1.5 text-[0.6875rem] text-[var(--brass)]">
            {c.crossCheck}
          </span>
        )}
        {row?.hasNote && (
          <Link
            href={`/${lang}/van-ban/${row.id}`}
            className="whitespace-nowrap border border-[var(--rule-strong)] px-1.5 text-[0.6875rem] text-[var(--ink-2)] underline-offset-2 hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            {c.hasNote}
          </Link>
        )}
      </div>

      <div className="mt-2 space-y-1 text-sm leading-relaxed text-[var(--ink-2)]">
        {r.verdict === "missing" && (
          <>
            <p>{c.missingText(docs)}</p>
            {r.near.length > 0 && (
              <p>
                {c.near}{" "}
                {r.near.map((n, i) => (
                  <span key={n.id}>
                    {i > 0 && ", "}
                    <DocLink row={n} lang={lang} /> {n.title}
                  </span>
                ))}
              </p>
            )}
          </>
        )}

        {r.verdict === "inForce" && seg?.since && (
          <p>
            {c.inForceSince} <span className="tnum">{fmt(seg.since)}</span>.
          </p>
        )}

        {r.verdict === "amended" && (
          <p>
            {c.readWith}{" "}
            {r.amendedBy.map((a, i) => (
              <span key={a.id}>
                {i > 0 && ", "}
                <DocLink row={a} lang={lang} /> (<span className="tnum">{fmt(a.from)}</span>)
              </span>
            ))}
          </p>
        )}

        {r.verdict === "pending" && seg?.since && (
          <p>
            {c.pendingFrom} <span className="tnum">{fmt(seg.since)}</span>.
          </p>
        )}

        {r.verdict === "unknown" && <p>{c.unknown}</p>}

        {r.verdict === "expired" && seg && (
          <>
            {seg.recorded && <p>{c.recorded}</p>}
            {r.chain.map((link, i) => (
              <p key={link.row.id}>
                {chainLead(c, link, i, i === 0 ? row!.number : r.chain[i - 1].row.number)}{" "}
                <DocLink row={link.row} lang={lang} />{" "}
                <span className="text-[var(--ink-3)]">
                  ({c.from} <span className="tnum">{fmt(link.since)}</span>)
                </span>
              </p>
            ))}
            <ChainEnd chain={r.chain} date={date} lang={lang} />
          </>
        )}
      </div>
    </li>
  );
}

/** Câu mở đầu của một mắt trong chuỗi thay thế. */
function chainLead(c: CheckCopy, link: ChainLink, i: number, prevNumber: string): string {
  if (link.withParent) return c.lapsedWith;
  return i === 0 ? c.replacedBy : `${prevNumber} ${c.wasReplacedBy}`;
}

/** Văn bản ở cuối chuỗi thay thế, nếu nó đang có hiệu lực tại ngày `date`. */
function chainEnd(chain: ChainLink[], date: string): BasisRow | null {
  const last = chain[chain.length - 1];
  if (!last) return null;
  return segmentAt(last.row.segments, date).state === "in-force" ? last.row : null;
}

/** Dòng chốt của chuỗi thay thế. */
function ChainEnd({ chain, date, lang }: { chain: ChainLink[]; date: string; lang: Lang }) {
  const c = getCheckCopy(lang);
  const end = chainEnd(chain, date);
  if (!end) return null;
  return (
    <p className="pt-1 font-medium text-[var(--ink)]">
      {c.chainEnd} <DocLink row={end} lang={lang} /> {end.title}
    </p>
  );
}
