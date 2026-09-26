import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LuxBackdrop } from "@/components/LuxBackdrop";
import { FeedbackForm } from "@/components/trust/FeedbackForm";
import { domains } from "@/data/documents";
import { isLang } from "@/i18n/dictionary";
import { getLanding } from "@/i18n/landing";
import { alternatesFor, CONTACT, shareMeta } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const f = getLanding(lang).feedback;
  return {
    title: f.title,
    description: f.lede,
    alternates: alternatesFor(lang, "/gop-y"),
    ...shareMeta(lang, "/gop-y", f.title, f.lede),
  };
}

/** Trang góp ý dữ liệu: báo sai, báo thiếu, yêu cầu bổ sung văn bản. */
export default async function FeedbackPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const f = getLanding(lang).feedback;
  return (
    <>
      <section className="rule-b hero-lux">
        <LuxBackdrop />
        <div className="mx-auto w-full max-w-[76rem] px-5 py-10 sm:px-8 sm:py-12">
          <h1 className="display rise">{f.title}</h1>
          <p className="measure rise rise-1 mt-4 text-[1.0625rem] leading-relaxed text-[var(--ink-2)]">
            {f.lede}
          </p>
        </div>
      </section>
      <div className="mx-auto w-full max-w-[48rem] px-5 py-8 sm:px-8">
        <FeedbackForm lang={lang} email={CONTACT.email} domains={domains.map((d) => d.label[lang])} />
      </div>
    </>
  );
}
