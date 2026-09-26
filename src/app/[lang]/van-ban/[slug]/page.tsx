import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CrossCheckNotice, DomainChip, StatusBadge } from "@/components/DocMeta";
import { FamilyChart, FamilyList } from "@/components/FamilyTree";
import { JsonLd } from "@/components/JsonLd";
import { AsOfStatus } from "@/components/legal/AsOfStatus";
import { CopyButton } from "@/components/legal/CopyButton";
import { DocActions } from "@/components/legal/DocActions";
import { GraphViewport } from "@/components/lineage/GraphViewport";
import { LineageStrip } from "@/components/lineage/LineageStrip";
import { LuxBackdrop } from "@/components/LuxBackdrop";
import { FullTextAction, SourceList } from "@/components/SourceLinks";
import { SourcePanel } from "@/components/trust/SourcePanel";
import { ValidityProbe } from "@/components/validity/ValidityProbe";
import { ValidityTimeline } from "@/components/validity/ValidityTimeline";
import { documents, documentsById, verifiedOnOf } from "@/data/documents";
import type { Lang, LegalDoc } from "@/data/types";
import { formatDate, getDict, isLang, LANGS } from "@/i18n/dictionary";
import { getDocPanel } from "@/i18n/doc-panel";
import { getFamilyCopy } from "@/i18n/family";
import { citeDocument } from "@/lib/citation";
import { pairsFor } from "@/lib/compare";
import { docDescription, docPlainText } from "@/lib/doc-brief";
import { type Family, familyOf, layoutFamily, type LineNode } from "@/lib/family";
import { lineagesFor } from "@/lib/lineage";
import { alternatesFor, pathFor, shareMeta, SITE_URL } from "@/lib/site";
import { describeSources } from "@/lib/sources";
import { breadcrumbLd, legislationLd } from "@/lib/structured-data";
import { lapseWithParent, replacers, startOf, validitySegments } from "@/lib/validity";
import type { ValiditySegment } from "@/lib/validity-segment";

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
  const title = `${doc.number} — ${doc.title[lang]}`;
  // Mô tả nói tình trạng và dòng dõi trước, tóm tắt sau: đó là điều người tìm
  // cần biết ngay trên trang kết quả, kèm ngày tra cứu để không nói quá.
  const description = docDescription(doc, familyOf(doc.id), lang);
  return {
    title,
    description,
    alternates: alternatesFor(lang, `/van-ban/${doc.id}`),
    ...shareMeta(lang, `/van-ban/${doc.id}`, title, description, {
      type: "article",
      ownImage: true,
    }),
  };
}


/** Mọi văn bản có mặt trên hình gia phả, để tính sẵn hiệu lực theo ngày cho từng cái. */
function familyDocs(fam: Family): LegalDoc[] {
  const out: LegalDoc[] = [fam.focus];
  const walk = (nodes: LineNode[]) => {
    for (const n of nodes) {
      out.push(n.doc);
      walk(n.next);
    }
  };
  walk(fam.ancestors);
  walk(fam.successors);
  out.push(...fam.parents, ...fam.amends, ...fam.amendedBy);
  for (const b of fam.children) out.push(b.doc, ...b.children);
  return out;
}

/** Mốc bắt đầu của tình trạng hiện tại, và văn bản đã gây ra nó nếu có. */
function statusSince(doc: LegalDoc): { date: string; by?: LegalDoc } | null {
  if (doc.status === "expired") {
    const r = replacers(doc).find((x) => startOf(x));
    if (r) return { date: startOf(r), by: r };
    const lapse = lapseWithParent(doc);
    if (lapse) return { date: lapse.date, by: lapse.parent };
    return null;
  }
  return doc.effectiveOn ? { date: doc.effectiveOn } : null;
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
  const fc = getFamilyCopy(lang);
  const p = getDocPanel(lang);
  const fam = familyOf(doc.id);
  const comparePairs = pairsFor(doc.id);
  const docLineages = lineagesFor(doc.id);
  const citation = citeDocument(doc, lang);
  const legislation = legislationLd(doc, lang, documentsById);
  const sources = describeSources(doc.sources);
  const segments = validitySegments(doc);
  const since = statusSince(doc);
  const checked = verifiedOnOf(doc);
  const path = pathFor(lang, `/van-ban/${doc.id}`);

  const compact: Family | null = fam && fam.children.length > 0 ? { ...fam, children: [] } : null;
  const full = fam ? layoutFamily(fam) : null;
  const small = compact ? layoutFamily(compact) : null;
  const famSegments: Record<string, ValiditySegment[]> = {};
  if (fam) for (const d of familyDocs(fam)) famSegments[d.id] ??= validitySegments(d);

  const compareHref =
    comparePairs.length === 1
      ? `/${lang}/doi-chieu/${comparePairs[0].id}`
      : comparePairs.length > 1
        ? "#doi-chieu"
        : undefined;

  const answerRow = (label: string, docs: LegalDoc[], empty?: React.ReactNode) =>
    docs.length === 0 && !empty ? null : (
      <div>
        <dt>{label}</dt>
        <dd>
          {docs.length === 0
            ? empty
            : docs.map((d, i) => (
                <span key={d.id}>
                  {i > 0 && ", "}
                  <Link href={`/${lang}/van-ban/${d.id}`} className="ref-link tnum" title={d.title[lang]}>
                    {d.number}
                  </Link>
                </span>
              ))}
        </dd>
      </div>
    );

  const kids = fam?.children.map((b) => b.doc) ?? [];

  return (
    <article>
      {legislation && <JsonLd data={legislation} />}
      <JsonLd
        data={breadcrumbLd([
          { name: t.nav.home, path: pathFor(lang) },
          { name: t.nav.documents, path: pathFor(lang, "/van-ban") },
          { name: doc.number, path },
        ])}
      />

      {/*
        Phần đầu là một bảng điều khiển: văn bản nào, còn hiệu lực không, từ khi
        nào, dữ liệu kiểm tra ngày nào. Bốn câu trả lời ấy nằm trên màn hình đầu
        tiên, trước mọi đoạn văn.
      */}
      <section className="doc-head hero-lux">
        <div className="lux-clip" aria-hidden="true">
          <LuxBackdrop />
        </div>
        <div className="doc-head-inner">
          <nav aria-label={p.crumbs} className="doc-crumbs">
            <Link href={`/${lang}/van-ban`} className="link-sweep">
              {t.nav.documents}
            </Link>
            <span aria-hidden="true">/</span>
            <span>{t.type[doc.type]}</span>
          </nav>

          <p className="doc-number tnum rise">{doc.number}</p>
          <h1 className="doc-title rise rise-1">{doc.title[lang]}</h1>

          <div className="doc-status rise rise-2">
            <StatusBadge status={doc.status} lang={lang} size="lg" />
            {since && (
              <span className="doc-status-since tnum">
                {p.since(formatDate(since.date, lang, since.date))}
                {since.by && doc.status === "expired" && (
                  <>
                    {" · "}
                    {p.replacedBy}{" "}
                    <Link href={`/${lang}/van-ban/${since.by.id}`} className="ref-link">
                      {since.by.number}
                    </Link>
                  </>
                )}
              </span>
            )}
            <AsOfStatus segments={segments} lang={lang} />
          </div>

          <dl className="doc-facts tnum rise rise-3">
            <div>
              <dt>{p.facts.issued}</dt>
              <dd>{formatDate(doc.issuedOn, lang, t.doc.unknownDate)}</dd>
            </div>
            <div>
              <dt>{p.facts.effective}</dt>
              <dd>{formatDate(doc.effectiveOn, lang, t.doc.unknownDate)}</dd>
            </div>
            <div>
              <dt>{p.facts.checked}</dt>
              <dd title={p.trust.checkedTip(formatDate(checked, lang, checked))}>
                {formatDate(checked, lang, checked)}
              </dd>
            </div>
            <div>
              <dt>{p.facts.data}</dt>
              <dd className={doc.confidence === "verified" ? "doc-data-ok" : "doc-data-warn"}>
                {doc.confidence === "verified" ? `✓ ${p.facts.verified}` : p.facts.crossCheck}
              </dd>
            </div>
          </dl>

          <div className="doc-domains">
            {doc.domains.map((d) => (
              <DomainChip key={d} id={d} lang={lang} />
            ))}
          </div>
          <FullTextAction sources={sources} lang={lang} />
        </div>
      </section>

      {/* Thanh thao tác dính dưới thanh điều hướng: đọc tới đâu cũng chép được
          trích dẫn, theo dõi hay mở bản đối chiếu mà không phải cuộn lên. */}
      <div className="doc-bar">
        <div className="doc-bar-inner">
          <span className="doc-bar-id tnum" aria-hidden="true">
            {doc.number}
          </span>
          <DocActions
            lang={lang}
            docId={doc.id}
            number={doc.number}
            citation={citation}
            path={path}
            shareTitle={`${doc.number} — ${doc.title[lang]}`}
            compareHref={compareHref}
            record={{ ...doc, verifiedOn: checked, url: `${SITE_URL}${path}` }}
            summary={docPlainText(doc, fam, lang)}
          />
        </div>
      </div>

      <div className="doc-body">
        <div className="min-w-0">
          {doc.confidence === "cross-check" && (
            <div className="mb-6">
              <CrossCheckNotice lang={lang} />
            </div>
          )}

          {/* Gia phả rút gọn: đời trước, đời sau và các quan hệ trực tiếp, trả lời
              câu hỏi "văn bản này đứng ở đâu" trước khi người đọc phải xem hình. */}
          {fam && (
            <section aria-labelledby="answers-title">
              <h2 id="answers-title" className="eyebrow eyebrow-tick">
                {p.answers.title}
              </h2>
              <LineageStrip fam={fam} lang={lang} />
              <dl className="doc-answers">
                {answerRow(p.answers.amendedBy, fam.amendedBy, <span className="doc-empty">{p.answers.noAmender}</span>)}
                <div>
                  <dt>{p.answers.guidedBy}</dt>
                  <dd>
                    {kids.length === 0 ? (
                      <span className="doc-empty">
                        {p.answers.noGuide}{" "}
                        <Link href={`/${lang}/gop-y?vb=${encodeURIComponent(doc.number)}&van-de=guidance`} className="ref-link">
                          {p.missing.report}
                        </Link>
                      </span>
                    ) : (
                      <>
                        {kids.slice(0, 4).map((d, i) => (
                          <span key={d.id}>
                            {i > 0 && ", "}
                            <Link href={`/${lang}/van-ban/${d.id}`} className="ref-link tnum" title={d.title[lang]}>
                              {d.number}
                            </Link>
                          </span>
                        ))}
                        {kids.length > 4 && (
                          <>
                            {" · "}
                            <a href="#gia-pha" className="ref-link">
                              +{kids.length - 4} {p.answers.seeAll}
                            </a>
                          </>
                        )}
                      </>
                    )}
                  </dd>
                </div>
                {answerRow(p.answers.guides, fam.parents)}
                {answerRow(p.answers.amends, fam.amends)}
              </dl>
            </section>
          )}

          <section className="mt-9">
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

          {/* Diễn biến hiệu lực đặt trước hình gia phả: câu hỏi đầu tiên của
              người mở một văn bản là nó còn dùng được không, và từ khi nào. */}
          <ValidityTimeline doc={doc} lang={lang} />

          {/* Hình gia phả trong khung có phóng to, kéo và thu gọn nhánh. Phả ký
              bên dưới nói lại đúng nội dung ấy bằng chữ, tên văn bản đầy đủ; trên
              điện thoại đó là bản đọc mặc định, hình mở bằng một nút. */}
          <section id="gia-pha" className="mt-9 scroll-mt-24" aria-labelledby="family-title">
            <h2 id="family-title" className="eyebrow eyebrow-tick">
              {fc.chartLabel}
            </h2>
            {fam && fam.size > 0 && full ? (
              <>
                <div className="mt-4">
                  <GraphViewport
                    full={<FamilyChart fam={fam} lang={lang} fixed />}
                    compact={compact ? <FamilyChart fam={compact} lang={lang} fixed /> : undefined}
                    childCount={fam.children.length}
                    segments={famSegments}
                    width={full.width}
                    height={full.height}
                    compactWidth={small?.width ?? full.width}
                    compactHeight={small?.height ?? full.height}
                    lang={lang}
                  />
                  <p className="mt-2 text-[0.8125rem] text-[var(--ink-3)]">{fc.hint}</p>
                </div>
                <FamilyList fam={fam} lang={lang} className="mt-5" />
              </>
            ) : (
              <p className="doc-empty mt-2">
                {fc.empty}{" "}
                <Link href={`/${lang}/gop-y?vb=${encodeURIComponent(doc.number)}&van-de=relation`} className="ref-link">
                  {p.missing.report}
                </Link>
              </p>
            )}
          </section>

          {/* Bản đối chiếu chỉ hiện khi văn bản này có mặt trong một cặp thay
            thế hoặc sửa đổi. Đặt ngay sau gia phả vì đó là chỗ người đọc vừa
            nhìn thấy tên văn bản kia. */}
          {comparePairs.length > 0 && (
            <section id="doi-chieu" className="mt-9 scroll-mt-24">
              <h2 className="eyebrow eyebrow-tick">{t.compare.docPairsTitle}</h2>
              <ul className="mt-3 space-y-2">
                {comparePairs.map((pr) => {
                  const other = pr.newDoc.id === doc.id ? pr.oldDoc : pr.newDoc;
                  return (
                    <li key={pr.id}>
                      <Link
                        href={`/${lang}/doi-chieu/${pr.id}`}
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
                        {pr.entry && (
                          <span className="whitespace-nowrap border border-[var(--brass)] px-1.5 text-[0.6875rem] text-[var(--brass)]">
                            {pr.entry.points.length} · {t.compare.curatedBadge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Chuỗi đặt sau danh sách cặp: cặp nói văn bản này khác văn bản nào,
              chuỗi nói nó đứng ở đoạn nào của cả đời văn bản. */}
          {docLineages.length > 0 && (
            <section className="mt-9">
              <h2 className="eyebrow eyebrow-tick">{t.compare.docLineagesTitle}</h2>
              <ul className="mt-3 space-y-2">
                {docLineages.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/${lang}/doi-chieu/chuoi/${l.id}`}
                      className="group flex flex-wrap items-baseline gap-x-2.5"
                    >
                      <span className="tnum text-sm text-[var(--ink-3)]">
                        {l.docs.length} {t.compare.lineageDocs}
                      </span>
                      <span className="text-sm text-[var(--ink-2)] underline decoration-[var(--rule-strong)] underline-offset-2 transition-colors group-hover:decoration-[var(--accent)]">
                        {l.current.title[lang]}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Danh sách nguồn đầy đủ đóng lại trang: đọc xong, việc kế tiếp của
              người làm pháp lý là mở nguyên văn để kiểm lại trước khi viện dẫn. */}
          <SourceList sources={sources} lang={lang} />
        </div>

        {/* Cột bên bám theo khi cuộn: nguồn và ngày kiểm tra, ô "tại ngày", và
            trích dẫn — ba thứ người đọc hay ngoái lại giữa chừng. */}
        <aside className="doc-aside">
          <SourcePanel doc={doc} sources={sources} lang={lang} />

          <div className="mt-6">
            <ValidityProbe segments={segments} initial={checked} lang={lang} />
          </div>

          <div className="mt-6 border-t border-[var(--rule)] pt-5">
            <p className="eyebrow">{t.doc.citation}</p>
            <p
              className="mt-2 text-[0.9375rem] leading-snug text-[var(--ink-2)]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {citation}
            </p>
            <div className="mt-3">
              <CopyButton text={citation} label={t.doc.citationCopy} done={p.actions.cited} />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[var(--ink-3)]">
              {t.doc.citationHint}
            </p>
          </div>
        </aside>
      </div>
    </article>
  );
}
