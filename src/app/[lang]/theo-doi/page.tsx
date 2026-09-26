import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LuxBackdrop } from "@/components/LuxBackdrop";
import { WatchList } from "@/components/watch/WatchList";
import { isLang } from "@/i18n/dictionary";
import { getLanding } from "@/i18n/landing";
import { alternatesFor, shareMeta } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const w = getLanding(lang).watch;
  return {
    title: w.title,
    description: w.lede,
    alternates: alternatesFor(lang, "/theo-doi"),
    // Trang riêng của từng trình duyệt, không có nội dung chung để lập chỉ mục.
    robots: { index: false, follow: true },
    ...shareMeta(lang, "/theo-doi", w.title, w.lede),
  };
}

/**
 * Trang theo dõi. Nội dung nằm hết trong trình duyệt của người đọc, nên trang
 * dựng sẵn chỉ có phần đầu; danh sách dựng khi trang chạy.
 */
export default async function WatchPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const w = getLanding(lang).watch;
  return (
    <>
      <section className="rule-b hero-lux">
        <LuxBackdrop />
        <div className="mx-auto w-full max-w-[76rem] px-5 py-10 sm:px-8 sm:py-12">
          <h1 className="display rise">{w.title}</h1>
          <p className="measure rise rise-1 mt-4 text-[1.0625rem] leading-relaxed text-[var(--ink-2)]">
            {w.lede}
          </p>
        </div>
      </section>
      <div className="mx-auto w-full max-w-[76rem] px-5 py-8 sm:px-8">
        <WatchList lang={lang} />
      </div>
    </>
  );
}
