import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocumentIndex } from "@/components/DocumentIndex";
import { getDict, isLang } from "@/i18n/dictionary";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = getDict(lang);
  return { title: t.list.title, description: t.list.lede };
}

export default async function DocumentsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = getDict(lang);

  return (
    <>
      <section className="rule-b">
        <div className="mx-auto w-full max-w-[76rem] px-5 py-10 sm:px-8">
          <h1 className="text-3xl leading-tight">{t.list.title}</h1>
          <p className="measure mt-4 text-[1.0625rem] leading-relaxed text-[var(--ink-2)]">
            {t.list.lede}
          </p>
        </div>
      </section>
      <DocumentIndex lang={lang} />
    </>
  );
}
