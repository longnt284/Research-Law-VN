import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccountPanel } from "@/components/account/AccountPanel";
import { LuxBackdrop } from "@/components/LuxBackdrop";
import { getAccountCopy } from "@/i18n/account";
import { isLang } from "@/i18n/dictionary";
import { alternatesFor } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const c = getAccountCopy(lang);
  return {
    title: c.title,
    description: c.lede,
    alternates: alternatesFor(lang, "/tai-khoan"),
    robots: { index: false, follow: false },
  };
}

/** Trang tài khoản. Phần dựng sẵn chỉ có đầu trang; biểu mẫu chạy trên trình duyệt. */
export default async function AccountPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const c = getAccountCopy(lang);
  return (
    <>
      <section className="rule-b hero-lux">
        <LuxBackdrop />
        <div className="mx-auto w-full max-w-[76rem] px-5 py-10 sm:px-8 sm:py-12">
          <h1 className="display rise">{c.title}</h1>
          <p className="measure rise rise-1 mt-4 text-[1.0625rem] leading-relaxed text-[var(--ink-2)]">
            {c.lede}
          </p>
        </div>
      </section>
      <div className="mx-auto w-full max-w-[40rem] px-5 py-8 sm:px-8">
        <AccountPanel lang={lang} />
      </div>
    </>
  );
}
