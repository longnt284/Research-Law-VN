import Link from "next/link";

import { StatusBadge } from "@/components/DocMeta";
import type { Lang } from "@/data/types";
import { formatDate, getDict } from "@/i18n/dictionary";
import type { Lineage } from "@/lib/lineage";
import { pairById } from "@/lib/compare";

/**
 * Dòng thời gian của một chuỗi văn bản.
 *
 * Phần trên là một dải tỷ lệ: khoảng cách giữa hai dấu đúng bằng khoảng cách
 * thời gian thật giữa hai mốc, nên một đời luật mười năm không đổi rồi ba lần
 * sửa trong hai năm nhìn ra ngay được. Dải này là hình, nên nó mang
 * `aria-hidden` và không chứa thông tin nào mà phần danh sách bên dưới không
 * nói lại bằng chữ.
 *
 * Dải vẽ bằng phần trăm trong luồng HTML dựng sẵn ở máy chủ: không canvas,
 * không WebGL, không một byte JavaScript nào, và nó có mặt cả khi gói mã hỏng.
 */
function markerPositions(lineage: Lineage): number[] {
  const at = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
  const stamps = lineage.steps.map((s) => {
    const iso = s.doc.effectiveOn || s.doc.issuedOn;
    const v = iso ? at(iso) : NaN;
    return Number.isNaN(v) ? null : v;
  });
  const known = stamps.filter((v): v is number => v !== null);
  if (known.length < 2) return stamps.map((_, i) => (i / Math.max(1, stamps.length - 1)) * 100);

  const min = Math.min(...known);
  const max = Math.max(...known);
  const span = max - min || 1;
  return stamps.map((v, i) =>
    v === null ? (i / Math.max(1, stamps.length - 1)) * 100 : ((v - min) / span) * 100,
  );
}

export function LineageTrack({ lineage, lang }: { lineage: Lineage; lang: Lang }) {
  const t = getDict(lang);
  const positions = markerPositions(lineage);

  return (
    <div>
      <div aria-hidden="true" className="relative mt-5 mb-8 hidden h-10 sm:block">
        <div className="absolute inset-x-0 top-[0.95rem] h-px bg-[var(--rule-strong)]" />
        {lineage.steps.map((step, i) => (
          <span
            key={step.doc.id}
            className={`absolute top-[0.55rem] block h-2 w-2 -translate-x-1/2 rotate-45 ${
              step.role === "amends"
                ? "border border-[var(--brass)] bg-[var(--paper)]"
                : "bg-[var(--accent)]"
            }`}
            style={{ left: `${positions[i]}%` }}
          />
        ))}
      </div>

      <ol className="border-t border-[var(--rule)]">
        {lineage.steps.map((step) => {
          const pair = step.pairId ? pairById.get(step.pairId) : undefined;
          const target = step.targetId
            ? lineage.docs.find((d) => d.id === step.targetId)
            : undefined;
          const roleLabel =
            step.role === "root"
              ? t.compare.lineageRoleRoot
              : step.role === "replaces"
                ? t.compare.lineageRoleReplaces
                : t.compare.lineageRoleAmends;

          return (
            <li
              key={`${step.doc.id}-${step.role}`}
              className="border-b border-[var(--rule)] py-5"
            >
              <div className="grid gap-x-6 gap-y-3 md:grid-cols-[9rem_1fr_11rem]">
                <div className="min-w-0">
                  <p className="eyebrow">{roleLabel}</p>
                  <p className="tnum mt-1 text-sm text-[var(--ink-3)]">
                    {formatDate(
                      step.doc.effectiveOn || step.doc.issuedOn,
                      lang,
                      t.doc.unknownDate,
                    )}
                  </p>
                </div>

                <div className="min-w-0">
                  <p
                    className={`tnum text-[1.0625rem] font-semibold ${
                      step.doc.id === lineage.current.id
                        ? "text-[var(--accent)]"
                        : "text-[var(--ink-3)]"
                    }`}
                    style={{ fontFamily: "var(--font-serif)" }}
                  >
                    {step.doc.number}
                  </p>
                  <Link
                    href={`/${lang}/van-ban/${step.doc.id}`}
                    className="mt-0.5 block leading-snug underline decoration-[var(--rule-strong)] underline-offset-2 transition-colors hover:decoration-[var(--accent)]"
                  >
                    {step.doc.title[lang]}
                  </Link>
                  {target && (
                    <p className="tnum mt-1 text-sm text-[var(--ink-3)]">
                      {t.compare.lineageTarget}: {target.number}
                    </p>
                  )}
                  {step.doc.id === lineage.current.id && (
                    <p className="mt-1 text-sm text-[var(--brass)]">
                      {t.compare.lineageCurrent}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-start gap-2 md:justify-end">
                  <StatusBadge status={step.doc.status} lang={lang} size="sm" />
                  {pair ? (
                    <Link
                      href={`/${lang}/doi-chieu/${pair.id}`}
                      className="link-sweep w-full text-sm text-[var(--ink-3)] hover:text-[var(--accent)] md:text-right"
                    >
                      {t.compare.lineageStepPair}
                      {pair.entry ? ` · ${pair.entry.points.length}` : ""}
                    </Link>
                  ) : (
                    step.role !== "root" && (
                      <p className="w-full text-sm text-[var(--ink-3)] md:text-right">
                        {t.compare.lineageStepNoPair}
                      </p>
                    )
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
