import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DocMetaRow } from "@/components/DomainDocRow";
import { DomainEmblem } from "@/components/DomainEmblem";
import { DomainGraph3D } from "@/components/DomainGraph3D";
import { LuxBackdrop } from "@/components/LuxBackdrop";
import { Reveal } from "@/components/Reveal";
import { documents, domains, relations } from "@/data/documents";
import type { DomainId, Lang } from "@/data/types";
import { getDict, isLang, LANGS } from "@/i18n/dictionary";
import { alternatesFor } from "@/lib/site";

export function generateStaticParams() {
  return LANGS.flatMap((lang) => domains.map((d) => ({ lang, id: d.id })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  if (!isLang(lang)) return {};
  const domain = domains.find((d) => d.id === id);
  if (!domain) return {};
  return {
    title: domain.label[lang],
    description: domain.blurb[lang],
    alternates: alternatesFor(lang, `/linh-vuc/${domain.id}`),
  };
}

export default async function DomainPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang: rawLang, id: rawId } = await params;
  if (!isLang(rawLang)) notFound();
  const lang: Lang = rawLang;
  const domain = domains.find((d) => d.id === rawId);
  if (!domain) notFound();
  const domainId: DomainId = domain.id;

  const t = getDict(lang);
  const docs = documents.filter((d) => d.domains.includes(domainId));
  const ids = new Set(docs.map((d) => d.id));
  // Chỉ giữ quan hệ mà cả hai đầu đều nằm trong lĩnh vực này: một cạnh chỉ có
  // một đầu thì trên khối ba chiều nó thành đường đi vào chỗ trống.
  const inner = relations.filter((r) => ids.has(r.from) && ids.has(r.to));

  return (
    <>
      {/*
        Phần mở đầu tách thành một khối chạy hết bề ngang, giống các trang khác,
        để lớp nền sang trọng trải ra tới hai mép màn hình. Nếu để nó bên trong
        cột chữ thì vùng sáng dừng lại thành một hình chữ nhật giữa trang.
      */}
      <section className="rule-double-b hero-lux">
        <LuxBackdrop />
        <div className="mx-auto w-full max-w-[76rem] px-5 py-8 sm:px-8 sm:py-10">
          <Link
            href={`/${lang}/linh-vuc`}
            className="link-sweep text-sm text-[var(--ink-3)] hover:text-[var(--accent)]"
          >
            ← {t.domainPage.backToDomains}
          </Link>

          <header className="mt-5 grid gap-6 sm:grid-cols-[1fr_13rem] sm:items-center">
            <div>
              <p className="eyebrow eyebrow-tick rise tnum">
                {docs.length} {t.domainPage.countDocs}
              </p>
              <h1 className="display rise rise-1 mt-3">{domain.label[lang]}</h1>
              <p className="measure rise rise-2 mt-4 text-[1.0625rem] leading-relaxed text-[var(--ink-2)]">
                {domain.blurb[lang]}
              </p>
            </div>
            <DomainEmblem
              id={domainId}
              hue={domain.hue}
              className="h-40 w-full sm:h-52"
            />
          </header>
        </div>
      </section>

      <article className="mx-auto w-full max-w-[76rem] px-5 py-10 sm:px-8 sm:py-14">
        <Reveal>
          <section>
            <h2 className="eyebrow eyebrow-tick">{t.domainPage.graphTitle}</h2>
            {inner.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--ink-3)]">
                {t.domainPage.graphEmpty}
              </p>
            ) : (
              <>
                <div className="mt-3 border border-[var(--rule)] bg-[var(--paper-2)]">
                  <DomainGraph3D
                    lang={lang}
                    domain={domainId}
                    hue={domain.hue}
                    docs={docs}
                    relations={inner}
                    className="h-[24rem] w-full sm:h-[30rem]"
                  />
                </div>
                <p className="mt-2 text-[0.8125rem] text-[var(--ink-3)]">
                  {t.domainPage.graphHint}
                </p>
              </>
            )}
          </section>
        </Reveal>

        <Reveal>
          <section className="mt-12">
            <h2 className="eyebrow eyebrow-tick">{t.domainPage.docsTitle}</h2>
            <ul className="mt-3 border-t border-[var(--rule)]">
              {docs.map((d) => (
                <DocMetaRow key={d.id} doc={d} lang={lang} />
              ))}
            </ul>
          </section>
        </Reveal>

        <Link href={`/${lang}/ban-do`} className="btn btn-quiet mt-10">
          {t.domainPage.viewOnMap}
        </Link>
      </article>
    </>
  );
}
