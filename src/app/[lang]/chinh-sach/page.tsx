import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LuxBackdrop } from "@/components/LuxBackdrop";
import { formatDate, isLang } from "@/i18n/dictionary";
import { getPolicy, POLICY_VERSION } from "@/i18n/policy";
import { alternatesFor, shareMeta } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const p = getPolicy(lang);
  return {
    title: p.title,
    description: p.lede,
    alternates: alternatesFor(lang, "/chinh-sach"),
    ...shareMeta(lang, "/chinh-sach", p.title, p.lede),
  };
}

/**
 * Chính sách quyền riêng tư, điều khoản sử dụng và bản quyền, chung một trang
 * với ba neo `#rieng-tu`, `#dieu-khoan`, `#ban-quyen`. Mẫu tạo tài khoản dẫn tới
 * đây, và phiên bản in ở đầu trang là phiên bản người dùng đồng ý khi đăng ký.
 */
export default async function PolicyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const p = getPolicy(lang);
  return (
    <>
      <section className="rule-b hero-lux">
        <LuxBackdrop />
        <div className="mx-auto w-full max-w-[76rem] px-5 py-10 sm:px-8 sm:py-12">
          <p className="eyebrow eyebrow-tick rise">{p.eyebrow}</p>
          <h1 className="display rise rise-1 mt-3">{p.title}</h1>
          <p className="measure rise rise-2 mt-4 text-[1.0625rem] leading-relaxed text-[var(--ink-2)]">
            {p.lede}
          </p>
          <p className="tnum rise rise-2 mt-4 text-sm text-[var(--ink-3)]">
            {p.version} {formatDate(POLICY_VERSION, lang, POLICY_VERSION)}
          </p>
        </div>
      </section>

      <article className="mx-auto w-full max-w-[48rem] px-5 py-8 sm:px-8">
        <nav aria-label={p.toc} className="border-y border-[var(--rule)] py-4">
          <p className="eyebrow">{p.toc}</p>
          <ol className="mt-2 space-y-1">
            {p.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="link-sweep">
                  {s.h}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {p.sections.map((s) => (
          <section key={s.id} id={s.id} className="mt-12 scroll-mt-24">
            <h2 className="method-h">{s.h}</h2>
            {s.parts.map((part) => (
              <div key={part.h} className="mt-6">
                <h3 className="font-semibold">{part.h}</h3>
                <div className="mt-2 space-y-3">
                  {part.p.map((para) => (
                    <p key={para} className="leading-[1.75] text-[var(--ink-2)]">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))}
      </article>
    </>
  );
}
