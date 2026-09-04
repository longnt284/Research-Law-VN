import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { documents, domains } from "@/data/documents";
import type { Lang } from "@/data/types";
import { getDict, isLang } from "@/i18n/dictionary";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = getDict(lang);
  return { title: t.domainPage.title, description: t.domainPage.lede };
}

export default async function DomainsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const t = getDict(lang);

  return (
    <>
      <section className="rule-b">
        <div className="mx-auto w-full max-w-[76rem] px-5 py-10 sm:px-8 sm:py-14">
          <p className="eyebrow eyebrow-tick rise">
            {domains.length} {t.home.statsDomains}
          </p>
          <h1 className="display rise rise-1 mt-3">{t.domainPage.title}</h1>
          <p className="measure rise rise-2 mt-4 text-[1.0625rem] leading-relaxed text-[var(--ink-2)]">
            {t.domainPage.lede}
          </p>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-[76rem] gap-px bg-[var(--rule)] px-5 py-8 sm:px-8 md:grid-cols-2">
        {domains.map((d) => {
          const count = documents.filter((doc) => doc.domains.includes(d.id)).length;
          return (
            <Link
              key={d.id}
              href={`/${lang}/linh-vuc/${d.id}`}
              className="group row-mark flex gap-5 bg-[var(--paper)] p-5 transition-colors hover:bg-[var(--paper-2)] sm:p-6"
            >
              {/*
                Ở đây cố ý KHÔNG đặt vật thể ba chiều. Tám thẻ nghĩa là tám ngữ
                cảnh WebGL cùng sống trên một trang; trình duyệt chịu được nhưng
                máy yếu thì quạt chạy và trang cuộn giật, đổi lấy tám hình trang
                trí. Vật thể để dành cho trang riêng của từng lĩnh vực, nơi nó
                đứng một mình và có chỗ để nhìn.
              */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{
                      background: `hsl(${d.hue} var(--node-chroma) var(--node-lightness))`,
                    }}
                  />
                  <span className="eyebrow tnum">
                    {count} {t.domainPage.countDocs}
                  </span>
                </div>
                <h2
                  className="mt-1.5 text-[1.3rem] leading-snug transition-colors group-hover:text-[var(--accent)]"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {d.label[lang]}
                </h2>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-[var(--ink-2)]">
                  {d.blurb[lang]}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
