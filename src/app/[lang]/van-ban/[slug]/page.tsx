import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CopyCitation } from "@/components/Citation";
import { CrossCheckNotice, DomainChip, StatusBadge } from "@/components/DocMeta";
import { FamilyChart, FamilyList, FamilyStack } from "@/components/FamilyTree";
import { JsonLd } from "@/components/JsonLd";
import { LuxBackdrop } from "@/components/LuxBackdrop";
import { PinpointNotice } from "@/components/PinpointNotice";
import { ShareLinks } from "@/components/ShareLinks";
import { ValidityProbe } from "@/components/validity/ValidityProbe";
import { ValidityTimeline } from "@/components/validity/ValidityTimeline";
import { documents, documentsById, verifiedOnOf } from "@/data/documents";
import type { Lang } from "@/data/types";
import { formatDate, getDict, isLang, LANGS } from "@/i18n/dictionary";
import { getArticleCopy } from "@/i18n/article";
import { getFamilyCopy } from "@/i18n/family";
import { articlePath, articlesOf } from "@/lib/article-pages";
import { citeDocument, formatPinpoint } from "@/lib/citation";
import { pairsFor } from "@/lib/compare";
import { familyOf } from "@/lib/family";
import { lineagesFor } from "@/lib/lineage";
import { alternatesFor, clip, pathFor, shareMeta, SITE_URL } from "@/lib/site";
import { sourceName, splitSources } from "@/lib/sources";
import { breadcrumbLd, legislationLd } from "@/lib/structured-data";
import { validitySegments } from "@/lib/validity";

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
  const description = clip(doc.summary[lang], 175);
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
  const fam = familyOf(doc.id);
  const comparePairs = pairsFor(doc.id);
  const docLineages = lineagesFor(doc.id);
  const citation = citeDocument(doc, lang);
  const legislation = legislationLd(doc, lang, documentsById);
  const ac = getArticleCopy(lang);
  const articles = articlesOf(doc.id);
  const sources = splitSources(doc.sources);

  return (
    <article>
      {legislation && <JsonLd data={legislation} />}
      <JsonLd
        data={breadcrumbLd([
          { name: t.nav.home, path: pathFor(lang) },
          { name: t.nav.documents, path: pathFor(lang, "/van-ban") },
          { name: doc.number, path: pathFor(lang, `/van-ban/${doc.id}`) },
        ])}
      />
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
            {/* Ngày tra cứu và nguồn chính thức đặt ngay dưới tên văn bản: một
                tình trạng hiệu lực chỉ đúng tại ngày nó được đọc, và người dùng
                cần biết đọc ở đâu trước khi tin vào nhãn phía trên. */}
            <p className="tnum mt-4 text-sm text-[var(--ink-3)]">
              {t.doc.verifiedOn}: {formatDate(verifiedOnOf(doc), lang, verifiedOnOf(doc))}
              {sources.official.length > 0 && (
                <>
                  {" · "}
                  {t.doc.officialSources}:{" "}
                  {sources.official.map((s, i) => (
                    <span key={s}>
                      {i > 0 && ", "}
                      <a
                        href={s}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="underline decoration-[var(--rule-strong)] underline-offset-2 hover:text-[var(--accent)]"
                      >
                        {sourceName(s, lang)}
                      </a>
                    </span>
                  ))}
                </>
              )}
            </p>
          </header>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-[76rem] gap-10 px-5 py-8 sm:px-8 md:grid-cols-[1fr_17rem]">
        <div className="min-w-0">
          <PinpointNotice lang={lang} docId={doc.id} articles={articles.map((a) => a.dieu)} />
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

          {/* Diễn biến hiệu lực đặt trước phần quan hệ: câu hỏi đầu tiên của
              người mở một văn bản là nó còn dùng được không, và từ khi nào. */}
          <ValidityTimeline doc={doc} lang={lang} />

          {/* Gia phả thay cho danh sách quan hệ phẳng trước đây. Từ cỡ máy tính
              bảng: hình ngang, kèm phả ký nói lại đúng nội dung ấy bằng chữ.
              Trên điện thoại: gia phả dựng dọc, vẫn là danh sách có tiêu đề. */}
          <section className="mt-9" aria-labelledby="family-title">
            <h2 id="family-title" className="eyebrow eyebrow-tick">
              {fc.chartLabel}
            </h2>
            {fam && fam.size > 0 ? (
              <>
                <div className="family-wide mt-4">
                  <FamilyChart fam={fam} lang={lang} />
                  <p className="mt-2 text-[0.8125rem] text-[var(--ink-3)]">{fc.hint}</p>
                </div>
                <div className="family-wide mt-5">
                  <FamilyList fam={fam} lang={lang} />
                </div>
                <FamilyStack fam={fam} lang={lang} className="family-narrow mt-4" />
              </>
            ) : (
              <p className="mt-2 text-sm text-[var(--ink-3)]">{fc.empty}</p>
            )}
          </section>

          {articles.length > 0 && (
            <section className="mt-9">
              <h2 className="eyebrow eyebrow-tick">{ac.sectionTitle}</h2>
              <p className="measure mt-2 text-sm text-[var(--ink-3)]">{ac.sectionHint}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {articles.map((a) => (
                  <li key={a.dieu}>
                    <Link href={pathFor(lang, articlePath(a.docId, a.dieu))} className="chip">
                      {formatPinpoint(a.cite, lang)}
                      <span className="tnum text-[var(--ink-3)]">· {a.uses.length}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

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
              <dd className="mt-0.5">
                {formatDate(verifiedOnOf(doc), lang, verifiedOnOf(doc))}
              </dd>
            </div>
          </dl>

          <div className="mt-6">
            <ValidityProbe
              segments={validitySegments(doc)}
              initial={verifiedOnOf(doc)}
              lang={lang}
            />
          </div>

          {/* Khối trích dẫn đặt trên khối nguồn. Người tra cứu tìm đúng văn
              bản xong thì việc kế tiếp thường là chép trích dẫn sang hồ sơ, và
              chép tay thì hay rụng mất số khóa hoặc sai một chữ trong tên. */}
          <div className="mt-6 border-t border-[var(--rule)] pt-5">
            <p className="eyebrow">{t.doc.citation}</p>
            <p
              className="mt-2 text-[0.9375rem] leading-snug text-[var(--ink-2)]"
              style={{ fontFamily: "var(--font-serif)" }}
            >
              {citation}
            </p>
            <div className="mt-3">
              <CopyCitation text={citation} lang={lang} />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[var(--ink-3)]">
              {t.doc.citationHint}
            </p>
          </div>

          {/* Chia sẻ đặt ngay sau trích dẫn: cùng một nhịp việc, chép căn cứ vào
              hồ sơ rồi gửi đường dẫn cho đồng nghiệp đang cùng xử lý vụ việc. */}
          <div className="mt-6 border-t border-[var(--rule)] pt-5">
            <p className="eyebrow">{t.share.title}</p>
            <div className="mt-2.5">
              <ShareLinks
                lang={lang}
                path={pathFor(lang, `/van-ban/${doc.id}`)}
                canonical={`${SITE_URL}${pathFor(lang, `/van-ban/${doc.id}`)}`}
                title={`${doc.number} — ${doc.title[lang]}`}
              />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[var(--ink-3)]">{t.share.hint}</p>
          </div>

          {/* Nguồn tách hai nhóm: nơi cơ quan nhà nước công bố văn bản, và
              trang tham khảo dùng để đối chiếu chéo. Xem `src/lib/sources.ts`. */}
          <div className="mt-6 border-t border-[var(--rule)] pt-5">
            <p className="eyebrow">{t.doc.sources}</p>
            {(["official", "reference"] as const).map((kind) =>
              sources[kind].length === 0 ? null : (
                <div key={kind} className="mt-2.5">
                  <p className="text-xs font-medium text-[var(--ink-2)]">
                    {kind === "official" ? t.doc.officialSources : t.doc.referenceSources}
                  </p>
                  <ul className="mt-1 space-y-1.5">
                    {sources[kind].map((s) => (
                      <li key={s} className="min-w-0">
                        <a
                          href={s}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="block truncate text-xs text-[var(--ink-3)] underline decoration-[var(--rule-strong)] underline-offset-2 transition-colors hover:text-[var(--accent)]"
                          title={s}
                        >
                          {sourceName(s, lang)}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ),
            )}
          </div>
        </aside>
      </div>
    </article>
  );
}
