import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DocumentIndex } from "@/components/DocumentIndex";
import { LuxBackdrop } from "@/components/LuxBackdrop";
import { SpaceThumb } from "@/components/SpaceThumb";
import { documents, domains } from "@/data/documents";
import { getDict, isLang } from "@/i18n/dictionary";
import { alternatesFor } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = getDict(lang);
  return {
    title: t.list.title,
    description: t.list.lede,
    alternates: alternatesFor(lang, "/van-ban"),
  };
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
      <section className="rule-b hero-lux">
        <LuxBackdrop />
        <div className="hero-split mx-auto w-full max-w-[76rem] px-5 py-10 sm:px-8 sm:py-14">
          <div className="min-w-0">
            {/* Nhãn đầu trang nói luôn quy mô tập dữ liệu, thay vì lặp lại tên
                trang một lần nữa dưới dạng chữ nhỏ. */}
            <p className="eyebrow eyebrow-tick rise">
              {documents.length} {t.home.statsDocs} · {domains.length}{" "}
              {t.home.statsDomains}
            </p>
            <h1 className="display rise rise-1 mt-3">{t.list.title}</h1>
            <p className="measure rise rise-2 mt-4 text-[1.0625rem] leading-relaxed text-[var(--ink-2)]">
              {t.list.lede}
            </p>
          </div>
          {/* Bố cục khối: luật ở lõi, văn bản hướng dẫn ở lớp ngoài. */}
          <div className="hero-art rise rise-2">
            <SpaceThumb act={0} turn={0.6} tilt={0.3} maxDots={78} maxEdges={14} />
          </div>
        </div>
      </section>
      <DocumentIndex lang={lang} />
    </>
  );
}
