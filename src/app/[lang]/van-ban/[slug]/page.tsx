import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CrossCheckNotice, DomainChip, StatusBadge } from "@/components/DocMeta";
import { LuxBackdrop } from "@/components/LuxBackdrop";
import { VERIFIED_ON, documents, documentsById, relations } from "@/data/documents";
import type { Lang, RelationKind } from "@/data/types";
import { formatDate, getDict, isLang, LANGS } from "@/i18n/dictionary";
import { pairsFor } from "@/lib/compare";
import { alternatesFor } from "@/lib/site";

export function generateStaticParams() {
  return LANGS.flatMap((lang) => documents.map((d) => ({ lang, slug: d.id })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) return {};
  const doc = documentsById.get(slug);
  if (!doc) return {};
  return {
    title: `${doc.number} — ${doc.title[lang]}`,
    description: doc.summary[lang].slice(0, 175),
    alternates: alternatesFor(lang, `/van-ban/${doc.id}`),
  };
}

/** Gom quan hệ hai chiều của một văn bản, đã nhóm sẵn theo nhãn hiển thị. */
function collectRelations(id: string, lang: Lang) {
  const t = getDict(lang);
  const labelFor = (kind: RelationKind, outgoing: boolean) => {
    if (kind === "guides") return outgoing ? t.doc.relGuidesOut : t.doc.relGuidesIn;
    if (kind === "amends") return outgoing ? t.doc.relAmendsOut : t.doc.relAmendsIn;
    return outgoing ? t.doc.relReplacesOut : t.doc.relReplacesIn;
  };

  const groups = new Map<string, string[]>();
  for (const r of relations) {
    let other: string | null = null;
    let label: string | null = null;
    if (r.from === id) {
      other = r.to;
      label = labelFor(r.kind, true);
    } else if (r.to === id) {
      other = r.from;
      label = labelFor(r.kind, false);
    }
    if (!other || !label || !documentsById.has(other)) continue;
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(other);
  }
  return [...groups.entries()];
}

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang: raw, slug } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const doc = documentsById.get(slug);
  if (!doc) notFound();

  const t = getDict(lang);
  const grouped = collectRelations(doc.id, lang);
  const comparePairs = pairsFor(doc.id);

  return (
    <article>
      <section className="rule-double-b hero-lux">
        <LuxBackdrop />
        <div className="mx-auto w-full max-w-[76rem] px-5 py-8 sm:px-8">
          <Link
            href={`/${lang}/van-ban`}
            className="link-sweep text-sm text-[var(--ink-3)] hover:text-[var(--accent)]"
          >
            ← {t.doc.backToList}
          </Link>

          <header className="mt-5">
            <div className="rise flex flex-wrap items-center gap-3">
              <StatusBadge status={doc.status} lang={lang} />
              <span className="text-sm text-[var(--ink-3)]">
                {t.type[doc.type]}
              </span>
            </div>
            {/* Số hiệu là thứ người tra cứu nhìn trước tiên, nên nó được đặt
                bằng chữ có chân cỡ lớn chứ không phải một dòng phụ đề nhỏ. */}
            <p
              className="tnum rise rise-1 mt-4 text-[1.375rem] font-semibold text-[var(--accent)]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {doc.number}
            </p>
            <h1 className="display-sm rise rise-2 mt-1.5 max-w-[34ch]">
              {doc.title[lang]}
            </h1>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              {doc.domains.map((d) => (
                <DomainChip key={d} id={d} lang={lang} />
              ))}
            </div>
          </header>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-[76rem] gap-10 px-5 py-8 sm:px-8 md:grid-cols-[1fr_17rem]">
        <div className="min-w-0">
          {doc.confidence === "cross-check" && (
            <div className="mb-6">
              <CrossCheckNotice lang={lang} />
            </div>
          )}

          <section>
            <h2 className="eyebrow eyebrow-tick">{t.doc.summary}</h2>
            <p className="dropcap measure mt-3 text-[1.0625rem] leading-relaxed">
              {doc.summary[lang]}
            </p>
          </section>

          {doc.note && (
            <section className="mt-7 border-l-2 border-[var(--accent)] pl-4">
              <h2 className="eyebrow">{t.doc.note}</h2>
              <p className="measure mt-1.5 leading-relaxed text-[var(--ink-2)]">
                {doc.note[lang]}
              </p>
            </section>
          )}

          <section className="mt-9">
            <h2 className="eyebrow eyebrow-tick">{t.doc.relations}</h2>
            {grouped.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--ink-3)]">{t.doc.noRelations}</p>
            ) : (
              <dl className="mt-3 space-y-5">
                {grouped.map(([label, ids]) => (
                  <div key={label}>
                    <dt className="text-sm font-medium text-[var(--ink-2)]">{label}</dt>
                    <dd className="mt-1.5">
                      <ul className="space-y-1.5">
                        {ids.map((id) => {
                          const other = documentsById.get(id);
                          if (!other) return null;
                          return (
                            <li key={id}>
                              <Link
                                href={`/${lang}/van-ban/${id}`}
                                className="group flex flex-wrap items-baseline gap-x-2.5"
                              >
                                <span className="tnum text-sm font-semibold text-[var(--accent)]">
                                  {other.number}
                                </span>
                                <span className="text-sm text-[var(--ink-2)] underline decoration-[var(--rule-strong)] underline-offset-2 transition-colors group-hover:decoration-[var(--accent)]">
                                  {other.title[lang]}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </section>

          {/* Bản đối chiếu chỉ hiện khi văn bản này có mặt trong một cặp thay
            thế hoặc sửa đổi. Đặt ngay sau phần quan hệ vì đó là chỗ người đọc
            vừa nhìn thấy tên văn bản kia. */}
          {comparePairs.length > 0 && (
            <section className="mt-9">
              <h2 className="eyebrow eyebrow-tick">{t.compare.docPairsTitle}</h2>
              <ul className="mt-3 space-y-2">
                {comparePairs.map((p) => {
                  const other = p.newDoc.id === doc.id ? p.oldDoc : p.newDoc;
                  return (
                    <li key={p.id}>
                      <Link
                        href={`/${lang}/doi-chieu/${p.id}`}
                        className="group flex flex-wrap items-baseline gap-x-2.5"
                      >
                        <span className="text-sm text-[var(--ink-3)]">
                          {t.compare.versus}
                        </span>
                        <span className="tnum text-sm font-semibold text-[var(--accent)]">
                          {other.number}
                        </span>
                        <span className="text-sm text-[var(--ink-2)] underline decoration-[var(--rule-strong)] underline-offset-2 transition-colors group-hover:decoration-[var(--accent)]">
                          {other.title[lang]}
                        </span>
                        {p.entry && (
                          <span className="whitespace-nowrap border border-[var(--brass)] px-1.5 text-[0.6875rem] text-[var(--brass)]">
                            {p.entry.points.length} · {t.compare.curatedBadge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>

        {/* Bảng dữ liệu bám theo khi cuộn: phần quan hệ bên trái có thể dài, và
            ngày hiệu lực là thứ người đọc hay ngoái lại kiểm tra giữa chừng. */}
        <aside className="min-w-0 self-start md:sticky md:top-[4.5rem]">
          <dl className="tnum space-y-4 border-t border-[var(--rule)] pt-5 md:border-t-0 md:pt-0">
            <div>
              <dt className="eyebrow">{t.doc.effectiveOn}</dt>
              <dd className="mt-0.5">
                {formatDate(doc.effectiveOn, lang, t.doc.unknownDate)}
              </dd>
            </div>
            <div>
              <dt className="eyebrow">{t.doc.issuedOn}</dt>
              <dd className="mt-0.5">
                {formatDate(doc.issuedOn, lang, t.doc.unknownDate)}
              </dd>
            </div>
            <div>
              <dt className="eyebrow">{t.doc.verifiedOn}</dt>
              <dd className="mt-0.5">{formatDate(VERIFIED_ON, lang, VERIFIED_ON)}</dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-[var(--rule)] pt-5">
            <p className="eyebrow">{t.doc.sources}</p>
            <ul className="mt-2 space-y-2">
              {doc.sources.map((s) => (
                <li key={s} className="min-w-0">
                  <a
                    href={s}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="block truncate text-xs text-[var(--ink-3)] underline decoration-[var(--rule-strong)] underline-offset-2 transition-colors hover:text-[var(--accent)]"
                    title={s}
                  >
                    {new URL(s).hostname.replace(/^www\./, "")}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <Link href={`/${lang}`} className="btn btn-quiet mt-6">
            {t.doc.viewOnMap}
          </Link>
        </aside>
      </div>
    </article>
  );
}
