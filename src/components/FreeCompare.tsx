"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { CopyChip } from "@/components/Citation";
import { StatusBadge } from "@/components/DocMeta";
import { TextDiff } from "@/components/TextDiff";
import { ValidityBadge } from "@/components/validity/ValidityBadge";
import type { DocStatus, Lang, RelationKind } from "@/data/types";
import { formatDate } from "@/i18n/dictionary";
import { getFreeCompareCopy } from "@/i18n/free-compare";
import { fold } from "@/lib/search";
import { monthsBetween, spanWords } from "@/lib/span";
import { segmentAt, type ValiditySegment } from "@/lib/validity-segment";

/** Một văn bản, rút gọn cho trang so sánh tự chọn; chữ hiển thị dựng sẵn ở máy chủ. */
export interface CompareRow {
  id: string;
  number: string;
  title: string;
  type: string;
  status: DocStatus;
  statusLabel: string;
  issued: string;
  effective: string;
  effectiveOn: string;
  verified: string;
  domains: string;
  confidence: string;
  segments: ValiditySegment[];
  /** Chữ tìm được, đã bỏ dấu. */
  keys: string;
}

export interface CompareEdge {
  from: string;
  to: string;
  kind: RelationKind;
}

export interface ComparePair {
  id: string;
  newId: string;
  oldId: string;
  points: number;
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Chuỗi quan hệ ngắn nhất giữa hai văn bản, đi theo cả hai chiều.
 *
 * Tìm theo chiều rộng nên chuỗi trả về là chuỗi ít bước nhất; mỗi bước giữ đúng
 * chiều của quan hệ đã ghi để giao diện nói được văn bản nào tác động lên văn
 * bản nào.
 */
function shortestPath(a: string, b: string, edges: readonly CompareEdge[]): CompareEdge[] | null {
  const adj = new Map<string, CompareEdge[]>();
  for (const e of edges) {
    adj.set(e.from, [...(adj.get(e.from) ?? []), e]);
    adj.set(e.to, [...(adj.get(e.to) ?? []), e]);
  }
  const prev = new Map<string, { node: string; edge: CompareEdge }>();
  const seen = new Set([a]);
  const queue = [a];
  while (queue.length > 0) {
    const node = queue.shift()!;
    if (node === b) break;
    for (const e of adj.get(node) ?? []) {
      const next = e.from === node ? e.to : e.from;
      if (seen.has(next)) continue;
      seen.add(next);
      prev.set(next, { node, edge: e });
      queue.push(next);
    }
  }
  if (!seen.has(b)) return null;
  const path: CompareEdge[] = [];
  for (let at = b; at !== a; ) {
    const step = prev.get(at)!;
    path.unshift(step.edge);
    at = step.node;
  }
  return path;
}

/** Ô chọn văn bản: gõ số hiệu hoặc tên, chọn trong danh sách gợi ý. */
function DocPicker({
  label,
  rows,
  value,
  onChange,
  lang,
}: {
  label: string;
  rows: CompareRow[];
  value: string;
  onChange: (id: string) => void;
  lang: Lang;
}) {
  const c = getFreeCompareCopy(lang);
  const id = useId();
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const chosen = rows.find((r) => r.id === value);

  const options = useMemo(() => {
    const words = fold(text).split(" ").filter(Boolean);
    if (words.length === 0) return [];
    return rows.filter((r) => words.every((w) => r.keys.includes(w))).slice(0, 8);
  }, [rows, text]);

  const pick = (r: CompareRow) => {
    onChange(r.id);
    setText("");
    setOpen(false);
  };

  return (
    <div className="min-w-0">
      <label htmlFor={`${id}-in`} className="eyebrow block">
        {label}
      </label>
      {chosen ? (
        <div className="mt-1.5 flex items-start justify-between gap-3 border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2">
          <span className="min-w-0">
            <span className="tnum block font-semibold text-[var(--accent)]">{chosen.number}</span>
            <span className="block text-sm leading-snug">{chosen.title}</span>
          </span>
          <button type="button" className="chip shrink-0" onClick={() => onChange("")}>
            {c.clear}
          </button>
        </div>
      ) : (
        <div className="relative">
          <input
            id={`${id}-in`}
            type="text"
            role="combobox"
            aria-expanded={open && options.length > 0}
            aria-controls={`${id}-list`}
            aria-autocomplete="list"
            aria-activedescendant={open && options.length > 0 ? `${id}-o${active}` : undefined}
            autoComplete="off"
            value={text}
            placeholder={c.pickPlaceholder}
            onChange={(e) => {
              setText(e.target.value);
              setOpen(true);
              setActive(0);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 120)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((i) => Math.min(i + 1, Math.max(options.length - 1, 0)));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter" && options[active]) {
                e.preventDefault();
                pick(options[active]);
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            className="mt-1.5 w-full border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-[0.9375rem] outline-none placeholder:text-[var(--ink-3)] focus:border-[var(--accent)]"
          />
          {open && options.length > 0 && (
            <ul
              id={`${id}-list`}
              role="listbox"
              aria-label={label}
              className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-y-auto border border-[var(--rule-strong)] bg-[var(--paper)] shadow-lg"
            >
              {options.map((r, i) => (
                <li
                  key={r.id}
                  id={`${id}-o${i}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => {
                    // Chọn trước khi ô nhập mất tiêu điểm và danh sách đóng lại.
                    e.preventDefault();
                    pick(r);
                  }}
                  onMouseMove={() => setActive(i)}
                  className={`cursor-pointer border-l-2 px-3 py-2 ${
                    i === active ? "border-[var(--accent)] bg-[var(--paper-2)]" : "border-transparent"
                  }`}
                >
                  <span className="tnum block text-sm font-semibold text-[var(--accent)]">{r.number}</span>
                  <span className="block text-sm leading-snug">{r.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * So sánh hai văn bản bất kỳ.
 *
 * Trang cặp đối chiếu chỉ có cho những văn bản thay thế hoặc sửa đổi nhau, vì
 * nhận định của người biên soạn chỉ có nghĩa khi hai bên nói về cùng một quy
 * định. Trang này mở cho mọi cặp, và vì vậy chỉ làm phần máy làm được: đặt dữ
 * kiện của hai bản ghi cạnh nhau, tô đậm dòng khác nhau, tính tình trạng tại một
 * ngày và tìm chuỗi quan hệ nối hai văn bản. Khi hai văn bản đúng là một cặp đã
 * đối chiếu, trang dẫn sang bản đối chiếu có điểm tới từng điều, khoản.
 */
export function FreeCompare({
  lang,
  rows,
  edges,
  pairs,
}: {
  lang: Lang;
  rows: CompareRow[];
  edges: CompareEdge[];
  pairs: ComparePair[];
}) {
  const c = getFreeCompareCopy(lang);
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [date, setDate] = useState("");
  const [path, setPath] = useState("");

  const byId = useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows]);

  // Đọc lựa chọn từ đường dẫn sau khi gắn, rồi ghi ngược lại mỗi lần đổi, để
  // một bảng so sánh gửi được cho đồng nghiệp bằng một đường dẫn.
  const ready = useRef(false);
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const pa = sp.get("a");
    const pb = sp.get("b");
    const d = sp.get("ngay");
    if (pa && byId.has(pa)) setA(pa);
    if (pb && byId.has(pb)) setB(pb);
    if (d && ISO.test(d)) setDate(d);
    ready.current = true;
  }, [byId]);

  useEffect(() => {
    if (!ready.current) return;
    const sp = new URLSearchParams();
    if (a) sp.set("a", a);
    if (b) sp.set("b", b);
    if (date) sp.set("ngay", date);
    const qs = sp.toString();
    const next = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
    window.history.replaceState(null, "", next);
    setPath(next);
  }, [a, b, date]);

  const A = byId.get(a);
  const B = byId.get(b);
  const both = A && B && A.id !== B.id;
  const route = useMemo(() => (both ? shortestPath(A.id, B.id, edges) : null), [both, A, B, edges]);
  const pair = both
    ? pairs.find(
        (p) => (p.newId === A.id && p.oldId === B.id) || (p.newId === B.id && p.oldId === A.id),
      )
    : undefined;

  const fmt = (iso: string) => formatDate(iso, lang, iso);
  const verb: Record<RelationKind, string> = c.edge;

  const facts: { label: string; a: string; b: string; changed: boolean }[] = both
    ? [
        { label: c.row.type, a: A.type, b: B.type, changed: A.type !== B.type },
        { label: c.row.status, a: A.statusLabel, b: B.statusLabel, changed: A.status !== B.status },
        { label: c.row.issuedOn, a: A.issued, b: B.issued, changed: A.issued !== B.issued },
        { label: c.row.effectiveOn, a: A.effective, b: B.effective, changed: A.effective !== B.effective },
        { label: c.row.verifiedOn, a: A.verified, b: B.verified, changed: A.verified !== B.verified },
        { label: c.row.domains, a: A.domains, b: B.domains, changed: A.domains !== B.domains },
        { label: c.row.confidence, a: A.confidence, b: B.confidence, changed: A.confidence !== B.confidence },
      ]
    : [];

  const gap = both
    ? monthsBetween(
        [A.effectiveOn, B.effectiveOn].sort()[0],
        [A.effectiveOn, B.effectiveOn].sort()[1],
      )
    : null;

  return (
    <div className="mx-auto w-full max-w-[76rem] px-5 py-8 sm:px-8">
      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-end">
        <DocPicker label={c.pickA} rows={rows} value={a} onChange={setA} lang={lang} />
        <button
          type="button"
          className="chip justify-self-start md:mb-2"
          onClick={() => {
            setA(b);
            setB(a);
          }}
          disabled={!a && !b}
        >
          ⇄ {c.swap}
        </button>
        <DocPicker label={c.pickB} rows={rows} value={b} onChange={setB} lang={lang} />
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="fc-date" className="eyebrow block">
            {c.date}
          </label>
          <input
            id="fc-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-describedby="fc-date-hint"
            className="tnum mt-1.5 border border-[var(--rule-strong)] bg-[var(--paper)] px-2.5 py-1.5 text-[0.9375rem] outline-none focus:border-[var(--accent)]"
          />
          <p id="fc-date-hint" className="mt-1 text-xs text-[var(--ink-3)]">
            {c.dateHint}
          </p>
        </div>
        {both && path && <CopyChip text={path} label={c.share} done={c.shared} absolute />}
      </div>

      <section aria-live="polite" className="mt-8">
        {!A || !B ? (
          <p className="border border-dashed border-[var(--rule-strong)] px-6 py-10 text-center text-[var(--ink-3)]">
            {c.empty}
          </p>
        ) : A.id === B.id ? (
          <p className="border border-dashed border-[var(--rule-strong)] px-6 py-10 text-center text-[var(--ink-3)]">
            {c.same}
          </p>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 md:gap-10 md:divide-x md:divide-[var(--rule)]">
              {[A, B].map((r, i) => {
                const seg = date ? segmentAt(r.segments, date) : null;
                return (
                  <div key={r.id} className={`min-w-0 ${i === 1 ? "md:pl-10" : ""}`}>
                    <p className="tnum text-[1.125rem] font-semibold text-[var(--accent)]" style={{ fontFamily: "var(--font-serif)" }}>
                      {r.number}
                    </p>
                    <Link
                      href={`/${lang}/van-ban/${r.id}`}
                      className="mt-1 block text-[1.0625rem] leading-snug underline decoration-[var(--rule-strong)] underline-offset-2 hover:decoration-[var(--accent)]"
                    >
                      {r.title}
                    </Link>
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      <StatusBadge status={r.status} lang={lang} size="sm" />
                      {seg && (
                        <>
                          <span className="text-xs text-[var(--ink-3)]">{c.statusAt(fmt(date))}:</span>
                          <ValidityBadge state={seg.state} amended={seg.amended} lang={lang} />
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <section className="mt-10">
              <h2 className="eyebrow eyebrow-tick">{c.pathTitle}</h2>
              {route && route.length > 0 ? (
                <ol className="mt-3 space-y-1.5">
                  {route.map((e, i) => {
                    const from = byId.get(e.from);
                    const to = byId.get(e.to);
                    if (!from || !to) return null;
                    return (
                      <li key={i} className="text-sm leading-relaxed">
                        <span className="tnum mr-2 text-[var(--ink-3)]">{i + 1}.</span>
                        <Link href={`/${lang}/van-ban/${from.id}`} className="tnum font-semibold text-[var(--accent)] underline decoration-[var(--rule-strong)] underline-offset-2">
                          {from.number}
                        </Link>{" "}
                        {verb[e.kind]}{" "}
                        <Link href={`/${lang}/van-ban/${to.id}`} className="tnum font-semibold text-[var(--accent)] underline decoration-[var(--rule-strong)] underline-offset-2">
                          {to.number}
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <p className="mt-2 text-sm text-[var(--ink-3)]">{c.pathNone}</p>
              )}
              <p className="measure mt-2 text-xs text-[var(--ink-3)]">{c.pathHint}</p>
              {pair && (
                <p className="mt-4 border-l-2 border-[var(--brass)] pl-3 text-sm">
                  <Link href={`/${lang}/doi-chieu/${pair.id}`} className="font-medium text-[var(--accent)] underline decoration-[var(--rule-strong)] underline-offset-2">
                    {c.pairLink} →
                  </Link>
                  {pair.points > 0 && <span className="text-[var(--ink-3)]"> · {c.curated(pair.points)}</span>}
                </p>
              )}
            </section>

            <section className="mt-10">
              <h2 className="eyebrow eyebrow-tick">{c.factTitle}</h2>
              <p className="measure mt-2 text-sm text-[var(--ink-3)]">{c.factHint}</p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[36rem] border-collapse text-[0.9375rem]">
                  <thead>
                    <tr className="border-y border-[var(--rule-strong)] text-left">
                      <th className="eyebrow py-2 pr-4 font-normal">&nbsp;</th>
                      <th className="eyebrow tnum py-2 pr-4 font-normal">{A.number}</th>
                      <th className="eyebrow tnum py-2 font-normal">{B.number}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facts.map((f) => (
                      <tr key={f.label} className="border-b border-[var(--rule)] align-top">
                        <th scope="row" className="w-[12rem] py-2.5 pr-4 text-left text-sm font-normal text-[var(--ink-3)]">
                          {f.label}
                        </th>
                        <td className={`tnum py-2.5 pr-4 ${f.changed ? "font-semibold" : "text-[var(--ink-2)]"}`}>{f.a}</td>
                        <td className={`tnum py-2.5 ${f.changed ? "font-semibold" : "text-[var(--ink-2)]"}`}>{f.b}</td>
                      </tr>
                    ))}
                    {gap !== null && (
                      <tr className="border-b border-[var(--rule)]">
                        <th scope="row" className="py-2.5 pr-4 text-left text-sm font-normal text-[var(--ink-3)]">
                          {c.gap}
                        </th>
                        <td colSpan={2} className="tnum py-2.5">
                          {spanWords(gap, lang)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="measure mt-4 text-sm leading-relaxed text-[var(--ink-2)]">{c.noObservation}</p>
            </section>
          </>
        )}
      </section>

      <section className="mt-12">
        <h2 className="eyebrow eyebrow-tick">{c.diffTitle}</h2>
        <div className="mt-3">
          <TextDiff lang={lang} />
        </div>
      </section>
    </div>
  );
}
