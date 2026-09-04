"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { DomainChip, StatusBadge } from "@/components/DocMeta";
import { EffectTicker } from "@/components/EffectTicker";
import { LegalMap } from "@/components/LegalMap";
import { documents, documentsById, domains, relations } from "@/data/documents";
import type { DomainId, Lang } from "@/data/types";
import { formatDate, getDict } from "@/i18n/dictionary";

/**
 * Trang bản đồ: phần giới thiệu, bộ lọc, vùng vẽ và bảng chi tiết.
 *
 * Bố cục là một cột flex cao đúng bằng màn hình. Vùng vẽ nhận phần chiều cao còn
 * thừa qua `flex-1` thay vì được tính tay bằng calc; nhờ vậy khi phần giới thiệu
 * xuống dòng thêm một dòng trên máy hẹp, bản đồ tự co lại chứ không bị đẩy tụt
 * xuống dưới màn hình.
 *
 * Chỉ có ba mẩu state ở đây, và không mẩu nào thay đổi khi người dùng kéo hay
 * phóng to bản đồ. Toàn bộ chuyển động nằm bên trong canvas.
 */
export function MapExplorer({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const [activeDomain, setActiveDomain] = useState<DomainId | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resetSignal, setResetSignal] = useState(0);

  const selected = selectedId ? documentsById.get(selectedId) : undefined;

  const related = useMemo(() => {
    if (!selectedId) return [];
    const out: { id: string; label: string }[] = [];
    for (const r of relations) {
      const outgoing = r.from === selectedId;
      const incoming = r.to === selectedId;
      if (!outgoing && !incoming) continue;
      const otherId = outgoing ? r.to : r.from;
      if (!documentsById.has(otherId)) continue;
      const label =
        r.kind === "guides"
          ? outgoing
            ? t.doc.relGuidesOut
            : t.doc.relGuidesIn
          : r.kind === "amends"
            ? outgoing
              ? t.doc.relAmendsOut
              : t.doc.relAmendsIn
            : outgoing
              ? t.doc.relReplacesOut
              : t.doc.relReplacesIn;
      out.push({ id: otherId, label });
    }
    return out;
  }, [selectedId, t]);

  const onSelect = useCallback((id: string | null) => setSelectedId(id), []);

  const visibleCount =
    activeDomain === "all"
      ? documents.length
      : documents.filter((d) => d.domains.includes(activeDomain)).length;

  return (
    <div className="flex flex-col lg:h-[calc(100dvh-3.3rem)]">
      {/* Giới thiệu, giữ mỏng. Đoạn văn dài đã chuyển sang bảng bên phải để màn
          hình đầu tiên vẫn là bản đồ chứ không phải một khối chữ. */}
      <section className="rule-b shrink-0">
        <div className="mx-auto w-full max-w-[76rem] px-5 py-6 sm:px-8 sm:py-8">
          <p className="eyebrow eyebrow-tick rise">{t.home.eyebrow}</p>
          <h1 className="display-sm rise rise-1 mt-2.5">{t.siteName}</h1>
          <p className="measure rise rise-2 mt-2 text-[0.9375rem] leading-relaxed text-[var(--ink-3)]">
            {t.siteTagline}
          </p>
        </div>
      </section>

      <EffectTicker lang={lang} />

      {/* Thanh công cụ. Danh sách lĩnh vực cuộn ngang được, nhưng nút đưa khung
          nhìn về mặc định nằm ngoài vùng cuộn nên không bao giờ bị đẩy khuất. */}
      <div className="rule-b shrink-0 bg-[var(--paper-2)]">
        <div className="mx-auto flex w-full max-w-[76rem] items-center gap-3 px-5 py-2.5 sm:px-8">
          <div className="scroll-x thin-scroll min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              {/* Nhãn "lọc theo lĩnh vực" chỉ hiện khi thật sự còn chỗ. Ở màn
                  hình vừa, nó chiếm đúng phần bề ngang khiến lĩnh vực cuối cùng
                  bị đẩy khuất sau nút bên phải. */}
              <span className="eyebrow mr-1 hidden shrink-0 2xl:inline">
                {t.home.filterDomain}
              </span>
              <button
                type="button"
                onClick={() => setActiveDomain("all")}
                aria-pressed={activeDomain === "all"}
                className="chip chip-all"
              >
                {t.home.filterAll}
              </button>
              {domains.map((d) => {
                const on = activeDomain === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setActiveDomain(on ? "all" : d.id)}
                    aria-pressed={on}
                    className="chip"
                  >
                    <span
                      aria-hidden="true"
                      className="inline-block h-2 w-2 rounded-full"
                      style={{
                        background: `hsl(${d.hue} var(--node-chroma) var(--node-lightness))`,
                      }}
                    />
                    {d.label[lang]}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Khi đã lọc về một lĩnh vực, mở lối sang không gian ba chiều của
              lĩnh vực đó. Giữ chip làm bộ lọc như cũ: đổi chúng thành liên kết
              thì mất chức năng lọc, thứ người dùng dùng thường xuyên hơn. */}
          {activeDomain !== "all" && (
            <Link href={`/${lang}/linh-vuc/${activeDomain}`} className="chip shrink-0">
              {t.domainPage.open} <span aria-hidden="true">→</span>
            </Link>
          )}
          <button
            type="button"
            onClick={() => setResetSignal((n) => n + 1)}
            className="chip"
          >
            {t.home.reset}
          </button>
        </div>
      </div>

      {/* `min-h-0` là mấu chốt: không có nó, phần tử con của flex sẽ lấy chiều
          cao nội dung và đẩy vùng vẽ tràn khỏi màn hình. */}
      <div className="mx-auto grid w-full max-w-[76rem] min-h-0 flex-1 lg:grid-cols-[1fr_21rem]">
        <div className="relative h-[58vh] min-h-[22rem] lg:h-auto lg:min-h-0 lg:border-r lg:border-[var(--rule)]">
          <LegalMap
            lang={lang}
            activeDomain={activeDomain}
            selectedId={selectedId}
            onSelect={onSelect}
            resetSignal={resetSignal}
          />

          <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex flex-wrap items-end justify-between gap-2">
            <p
              data-map-overlay
              className="max-w-[22rem] bg-[color-mix(in_oklab,var(--paper)_86%,transparent)] px-2 py-1 text-[0.6875rem] leading-snug text-[var(--ink-3)] backdrop-blur-sm"
            >
              {t.home.mapHint}
            </p>
            {/* Trên điện thoại, chú giải phủ lên gần một phần tư vùng vẽ. Ở đó nó
                được chuyển xuống bảng bên dưới thay vì đè lên bản đồ. */}
            <div
              data-map-overlay
              className="hidden bg-[color-mix(in_oklab,var(--paper)_86%,transparent)] px-2.5 py-1.5 backdrop-blur-sm sm:block"
            >
              <Legend t={t} />
            </div>
          </div>
        </div>

        {/* Bảng chi tiết */}
        <aside className="thin-scroll min-h-0 overflow-y-auto border-t border-[var(--rule)] p-5 sm:px-6 lg:border-t-0">
          {!selected ? (
            <div>
              <p className="measure text-[0.9375rem] leading-relaxed text-[var(--ink-2)]">
                {t.home.lede}
              </p>
              <dl className="mt-6 border-t border-[var(--rule)] pt-5">
                <Stat n={visibleCount} label={t.home.statsDocs} />
                <Stat n={relations.length} label={t.home.statsRelations} />
                <Stat n={domains.length} label={t.home.statsDomains} />
              </dl>
              <p className="mt-6 border-t border-[var(--rule)] pt-4 text-sm text-[var(--ink-3)]">
                {t.home.selectHint}
              </p>
              <div className="mt-5 border-t border-[var(--rule)] pt-4 sm:hidden">
                <Legend t={t} />
              </div>
            </div>
          ) : (
            <article>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={selected.status} lang={lang} size="sm" />
                <span className="text-xs text-[var(--ink-3)]">
                  {t.type[selected.type]}
                </span>
              </div>

              <p className="tnum mt-3 text-sm font-semibold text-[var(--accent)]">
                {selected.number}
              </p>
              <h2
                className="mt-1 text-xl leading-snug"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {selected.title[lang]}
              </h2>

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                {selected.domains.map((d) => (
                  <DomainChip key={d} id={d} lang={lang} />
                ))}
              </div>

              <dl className="tnum mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-y border-[var(--rule)] py-3 text-sm">
                <div>
                  <dt className="eyebrow">{t.doc.effectiveOn}</dt>
                  <dd>{formatDate(selected.effectiveOn, lang, t.doc.unknownDate)}</dd>
                </div>
                <div>
                  <dt className="eyebrow">{t.doc.issuedOn}</dt>
                  <dd>{formatDate(selected.issuedOn, lang, t.doc.unknownDate)}</dd>
                </div>
              </dl>

              <p className="mt-4 text-sm leading-relaxed text-[var(--ink-2)]">
                {selected.summary[lang]}
              </p>

              {related.length > 0 && (
                <div className="mt-5 border-t border-[var(--rule)] pt-4">
                  <p className="eyebrow">{t.home.relatedTitle}</p>
                  <ul className="mt-2 space-y-2">
                    {related.map((r, i) => {
                      const d = documentsById.get(r.id);
                      if (!d) return null;
                      return (
                        <li key={`${r.id}-${i}`}>
                          <button
                            type="button"
                            onClick={() => setSelectedId(r.id)}
                            className="group w-full text-left"
                          >
                            <span className="eyebrow block">{r.label}</span>
                            <span className="tnum text-sm text-[var(--ink-2)] transition-colors group-hover:text-[var(--accent)]">
                              {d.number}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <Link
                href={`/${lang}/van-ban/${selected.id}`}
                className="btn btn-outline mt-6"
              >
                {t.home.openDetail} <span aria-hidden="true">→</span>
              </Link>
            </article>
          )}
        </aside>
      </div>
    </div>
  );
}

function Legend({ t }: { t: ReturnType<typeof getDict> }) {
  return (
    <>
      <p className="eyebrow mb-1">{t.home.legend}</p>
      <ul className="space-y-0.5 text-[0.6875rem] text-[var(--ink-2)]">
        <li className="flex items-center gap-2">
          <Dash pattern="solid" /> {t.home.legendGuides}
        </li>
        <li className="flex items-center gap-2">
          <Dash pattern="dashed" /> {t.home.legendAmends}
        </li>
        <li className="flex items-center gap-2">
          <Dash pattern="dotted" /> {t.home.legendReplaces}
        </li>
      </ul>
    </>
  );
}

/**
 * Một dòng số liệu. Con số cỡ lớn bằng chữ có chân là điểm nhấn thị giác duy
 * nhất của bảng bên phải khi chưa chọn văn bản nào; nhãn nằm sát chân số để hai
 * thứ đọc như một cụm.
 */
function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-baseline gap-2.5 border-b border-[var(--rule)] py-2 last:border-b-0">
      <dt
        className="tnum text-[1.9rem] leading-none text-[var(--accent)]"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {n}
      </dt>
      <dd className="eyebrow">{label}</dd>
    </div>
  );
}

function Dash({ pattern }: { pattern: "solid" | "dashed" | "dotted" }) {
  const d = pattern === "solid" ? undefined : pattern === "dashed" ? "5 3" : "1.5 3";
  return (
    <svg width="22" height="6" viewBox="0 0 22 6" aria-hidden="true" className="shrink-0">
      <line
        x1="0"
        y1="3"
        x2="22"
        y2="3"
        stroke="var(--ink-3)"
        strokeWidth="1.4"
        strokeDasharray={d}
      />
    </svg>
  );
}
