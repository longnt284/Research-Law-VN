"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";

import { domains } from "@/data/documents";
import type { DomainId, Lang } from "@/data/types";
import { getDict } from "@/i18n/dictionary";

/**
 * Danh sách cặp đối chiếu kèm bộ lọc.
 *
 * Danh sách cặp mọc theo tập dữ liệu: mỗi văn bản thay thế hoặc sửa đổi một văn
 * bản khác lại thêm một dòng. Tới vài chục dòng thì cuộn không còn là cách tìm,
 * nên trang cần đúng ba câu hỏi mà người đọc thật sự hỏi: cặp này thuộc lĩnh
 * vực nào, là thay thế hay sửa đổi, và đã có ai viết điểm đối chiếu chưa.
 *
 * Lọc chạy trong trình duyệt trên dữ liệu đã dựng sẵn ở máy chủ, nên trang vẫn
 * là trang tĩnh và danh sách đầy đủ vẫn nằm trong HTML khi JavaScript bị chặn.
 */

/** Một dòng đã được rút gọn ở máy chủ, đủ để lọc và để vẽ. */
export interface PairRow {
  id: string;
  kind: "replaces" | "amends";
  curated: boolean;
  points: number;
  domains: DomainId[];
  oldNumber: string;
  oldTitle: string;
  newNumber: string;
  newTitle: string;
  /** Ngày hiệu lực đã định dạng sẵn theo ngôn ngữ đang đọc. */
  effectiveLabel: string;
  /** Chuỗi đã bỏ dấu, dựng sẵn để ô tìm kiếm không phải chuẩn hóa lại. */
  haystack: string;
}

/** Bỏ dấu để "dau thau" tìm được "đấu thầu". */
function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export function PairFilter({ rows, lang }: { rows: PairRow[]; lang: Lang }) {
  const t = getDict(lang);
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState<DomainId | "all">("all");
  const [kind, setKind] = useState<"all" | "replaces" | "amends">("all");
  const [depth, setDepth] = useState<"all" | "curated" | "auto">("all");

  const deferred = useDeferredValue(query);

  const results = useMemo(() => {
    const q = fold(deferred.trim());
    return rows.filter((r) => {
      if (domain !== "all" && !r.domains.includes(domain)) return false;
      if (kind !== "all" && r.kind !== kind) return false;
      if (depth === "curated" && !r.curated) return false;
      if (depth === "auto" && r.curated) return false;
      if (q && !r.haystack.includes(q)) return false;
      return true;
    });
  }, [rows, deferred, domain, kind, depth]);

  const filtered =
    query.trim() !== "" || domain !== "all" || kind !== "all" || depth !== "all";

  return (
    <>
      <div className="mt-4 border-y border-[var(--rule)] py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <label className="block min-w-0 flex-1">
            <span className="eyebrow">{t.compare.filterSearchLabel}</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.compare.filterSearchPlaceholder}
              className="mt-1.5 block w-full border border-[var(--rule-strong)] bg-[var(--paper-2)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="block">
            <span className="eyebrow">{t.compare.filterDomain}</span>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value as DomainId | "all")}
              className="mt-1.5 block w-full border border-[var(--rule-strong)] bg-[var(--paper-2)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)] md:w-[12rem]"
            >
              <option value="all">{t.compare.filterAllDomains}</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label[lang]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="eyebrow">{t.compare.filterKind}</span>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as typeof kind)}
              className="mt-1.5 block w-full border border-[var(--rule-strong)] bg-[var(--paper-2)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)] md:w-[12rem]"
            >
              <option value="all">{t.compare.filterAllKinds}</option>
              <option value="replaces">{t.compare.kindReplaces}</option>
              <option value="amends">{t.compare.kindAmends}</option>
            </select>
          </label>
          <label className="block">
            <span className="eyebrow">{t.compare.filterDepth}</span>
            <select
              value={depth}
              onChange={(e) => setDepth(e.target.value as typeof depth)}
              className="mt-1.5 block w-full border border-[var(--rule-strong)] bg-[var(--paper-2)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)] md:w-[13rem]"
            >
              <option value="all">{t.compare.filterAnyDepth}</option>
              <option value="curated">{t.compare.filterCuratedOnly}</option>
              <option value="auto">{t.compare.filterAutoOnly}</option>
            </select>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className="tnum text-sm text-[var(--ink-3)]">
            {results.length} {t.compare.filterShowing}
          </p>
          {filtered && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setDomain("all");
                setKind("all");
                setDepth("all");
              }}
              className="btn btn-quiet"
            >
              {t.compare.filterReset}
            </button>
          )}
        </div>
      </div>

      {results.length === 0 ? (
        <p className="measure mt-6 leading-relaxed text-[var(--ink-2)]">
          {t.compare.filterEmpty}
        </p>
      ) : (
        <ul className="mt-2 border-t border-[var(--rule)]">
          {results.map((r) => (
            <li key={r.id} className="border-b border-[var(--rule)]">
              <Link
                href={`/${lang}/doi-chieu/${r.id}`}
                className="group grid gap-x-6 gap-y-3 py-5 md:grid-cols-[1fr_1fr_10rem]"
              >
                {/* Cột trái là văn bản trước, cột giữa là văn bản sau. Thứ tự
                    đọc trên màn hình hẹp cũng giữ nguyên cũ rồi mới. */}
                <div className="min-w-0">
                  <p className="eyebrow">{t.compare.oldSide}</p>
                  <p className="tnum mt-1 text-sm font-semibold text-[var(--ink-3)]">
                    {r.oldNumber}
                  </p>
                  <p className="mt-0.5 text-[0.9375rem] leading-snug text-[var(--ink-2)]">
                    {r.oldTitle}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="eyebrow">{t.compare.newSide}</p>
                  <p className="tnum mt-1 text-sm font-semibold text-[var(--accent)]">
                    {r.newNumber}
                  </p>
                  <p className="mt-0.5 text-[0.9375rem] leading-snug underline decoration-[var(--rule-strong)] underline-offset-2 transition-colors group-hover:decoration-[var(--accent)]">
                    {r.newTitle}
                  </p>
                </div>
                <div className="flex flex-wrap items-start gap-2 md:justify-end">
                  <span className="whitespace-nowrap border border-[var(--rule-strong)] px-2 py-0.5 text-[0.6875rem] font-medium tracking-wide text-[var(--ink-2)]">
                    {r.kind === "replaces"
                      ? t.compare.kindReplaces
                      : t.compare.kindAmends}
                  </span>
                  <span
                    className={`whitespace-nowrap px-2 py-0.5 text-[0.6875rem] font-medium tracking-wide ${
                      r.curated
                        ? "border border-[var(--brass)] text-[var(--brass)]"
                        : "border border-[var(--rule)] text-[var(--ink-3)]"
                    }`}
                  >
                    {r.curated
                      ? `${r.points} · ${t.compare.curatedBadge}`
                      : t.compare.autoBadge}
                  </span>
                  <span className="tnum w-full text-[0.6875rem] text-[var(--ink-3)] md:text-right">
                    {r.effectiveLabel}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
