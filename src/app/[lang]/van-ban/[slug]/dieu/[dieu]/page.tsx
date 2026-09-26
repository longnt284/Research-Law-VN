import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BasisSide, CitationLink, CopyChip } from "@/components/Citation";
import { ChangeKindTag } from "@/components/CompareMeta";
import { StatusBadge } from "@/components/DocMeta";
import { JsonLd } from "@/components/JsonLd";
import { LuxBackdrop } from "@/components/LuxBackdrop";
import { documentsById } from "@/data/documents";
import type { Lang } from "@/data/types";
import { getArticleCopy } from "@/i18n/article";
import { getDict, isLang, LANGS } from "@/i18n/dictionary";
import { articlePage, articlePages, articlePath, crossRefs } from "@/lib/article-pages";
import { formatCitation, formatPinpoint } from "@/lib/citation";
import { pairById } from "@/lib/compare";
import { alternatesFor, pathFor, shareMeta } from "@/lib/site";
import { sourceName, splitSources } from "@/lib/sources";
import { breadcrumbLd } from "@/lib/structured-data";

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.flatMap((lang) =>
    articlePages.map((p) => ({ lang, slug: p.docId, dieu: p.dieu })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string; dieu: string }>;
}): Promise<Metadata> {
  const { lang, slug, dieu } = await params;
  const page = articlePage(slug, decodeURIComponent(dieu));
  if (!isLang(lang) || !page) return {};
  const c = getArticleCopy(lang);
  const title = formatCitation(page.cite, lang);
  const description = `${c.usesTitle(page.uses.length)}. ${c.noText}`;
  const sub = articlePath(page.docId, page.dieu);
  return {
    title,
    description,
    alternates: alternatesFor(lang, sub),
    ...shareMeta(lang, sub, title, description, { type: "article" }),
  };
}

export default async function ArticlePageView({
  params,
}: {
  params: Promise<{ lang: string; slug: string; dieu: string }>;
}) {
  const { lang: raw, slug, dieu } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const page = articlePage(slug, decodeURIComponent(dieu));
  const doc = documentsById.get(slug);
  if (!page || !doc) notFound();

  const t = getDict(lang);
  const c = getArticleCopy(lang);
  const sub = articlePath(page.docId, page.dieu);
  const heading = formatPinpoint(page.cite, lang);
  const official = splitSources(doc.sources).official;
  const cross = crossRefs(page);

  return (
    <article>
      <JsonLd
        data={breadcrumbLd([
          { name: t.nav.home, path: pathFor(lang) },
          { name: t.nav.documents, path: pathFor(lang, "/van-ban") },
          { name: doc.number, path: pathFor(lang, `/van-ban/${doc.id}`) },
          { name: heading, path: pathFor(lang, sub) },
        ])}
      />
      <section className="rule-double-b hero-lux">
        <LuxBackdrop />
        <div className="mx-auto w-full max-w-[76rem] px-5 py-8 sm:px-8">
          <Link
            href={`/${lang}/van-ban/${doc.id}`}
            className="link-sweep text-sm text-[var(--ink-3)] hover:text-[var(--accent)]"
          >
            ← {c.backToDoc} {doc.number}
          </Link>
          <header className="mt-5">
            <p className="eyebrow eyebrow-tick rise">{c.eyebrow}</p>
            <h1 className="display-sm rise rise-1 mt-2">{heading}</h1>
            <p className="rise rise-2 mt-2 max-w-[40ch] text-[1.125rem] leading-snug" style={{ fontFamily: "var(--font-serif)" }}>
              <Link
                href={`/${lang}/van-ban/${doc.id}`}
                className="underline decoration-[var(--rule-strong)] underline-offset-2 hover:decoration-[var(--accent)]"
              >
                {doc.title[lang]}
              </Link>{" "}
              <span className="tnum text-[var(--accent)]">({doc.number})</span>
            </p>
            <div className="mt-3">
              <StatusBadge status={doc.status} lang={lang} size="sm" />
            </div>
          </header>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[76rem] px-5 py-8 sm:px-8">
        <div className="measure border-l-2 border-[var(--brass)] pl-4 text-sm leading-relaxed text-[var(--ink-2)]">
          <p>{c.noText}</p>
          {official.length > 0 && (
            <p className="mt-1.5">
              {c.readFull}{" "}
              {official.map((s, i) => (
                <span key={s}>
                  {i > 0 && " · "}
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
            </p>
          )}
        </div>

        <section className="mt-10">
          <h2 className="eyebrow eyebrow-tick">{c.citeTitle}</h2>
          <ul className="mt-3 border-t border-[var(--rule)]">
            {[{ cite: page.cite, anchor: "", ref: "" }, ...page.pinpoints].map((p) => {
              const text = formatCitation(p.cite, lang);
              const link = `${pathFor(lang, sub)}${p.anchor ? `#${p.anchor}` : ""}`;
              return (
                <li
                  key={p.anchor || "dieu"}
                  id={p.anchor || undefined}
                  className="scroll-mt-24 flex flex-col gap-2 border-b border-[var(--rule)] py-3 target:bg-[var(--paper-2)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <a href={link} className="text-[0.9375rem] leading-snug hover:text-[var(--accent)]" style={{ fontFamily: "var(--font-serif)" }}>
                    {text}
                  </a>
                  <span className="flex shrink-0 gap-1.5">
                    <CopyChip text={text} label={c.copy} done={c.copied} />
                    <CopyChip text={link} label={c.copyLink} done={c.linkCopied} absolute />
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="measure mt-2 text-xs leading-relaxed text-[var(--ink-3)]">{c.citeHint}</p>
        </section>

        <section className="mt-12">
          <h2 className="eyebrow eyebrow-tick">{c.usesTitle(page.uses.length)}</h2>
          <div className="mt-4 space-y-8">
            {page.uses.map(({ hit, point, side }) => {
              const pair = pairById.get(hit.pairId);
              return (
                <section key={`${hit.pairId}-${point.id}`} className="border-t border-[var(--rule-strong)] pt-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-[1.15rem]">{point.topic[lang]}</h3>
                    <ChangeKindTag kind={point.kind} lang={lang} />
                  </div>
                  {pair && (
                    <p className="mt-1 text-sm text-[var(--ink-3)]">
                      <span className="tnum">
                        {pair.oldDoc.number} {t.compare.versus} {pair.newDoc.number}
                      </span>{" "}
                      · {c.thisSide} {c.side[side].toLowerCase()}
                    </p>
                  )}
                  <div className="mt-4 grid gap-5 md:grid-cols-2 md:gap-8">
                    {(["before", "after"] as const).map((s) => (
                      <div
                        key={s}
                        className={`min-w-0 border-l-2 pl-4 ${s === side || side === "both" ? "border-[var(--accent)]" : "border-[var(--rule)]"}`}
                      >
                        <p className="eyebrow">{c.side[s]}</p>
                        <p className={`mt-1.5 leading-relaxed ${s === side || side === "both" ? "" : "text-[var(--ink-2)]"}`}>
                          {point[s][lang]}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 bg-[var(--paper-2)] px-4 py-3">
                    <p className="eyebrow text-[var(--brass)]">{t.compare.observation}</p>
                    <p className="measure mt-1 leading-relaxed text-[var(--ink-2)]">{point.observation[lang]}</p>
                  </div>
                  <div className="mt-3 space-y-1">
                    <BasisSide label={t.compare.basisOld} refs={point.basis.before} lang={lang} />
                    <BasisSide label={t.compare.basisNew} refs={point.basis.after} lang={lang} />
                  </div>
                  <Link
                    href={`/${lang}/doi-chieu/${hit.pairId}#${point.id}`}
                    className="link-sweep mt-3 inline-block text-sm text-[var(--accent)]"
                  >
                    {c.openPoint} →
                  </Link>
                </section>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="eyebrow eyebrow-tick">{c.crossTitle}</h2>
          <p className="measure mt-2 text-sm text-[var(--ink-3)]">{c.crossHint}</p>
          {cross.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--ink-3)]">{c.crossEmpty}</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {cross.map((ref) => (
                <li key={ref} className="text-sm">
                  <CitationLink cite={ref} lang={lang} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </article>
  );
}
