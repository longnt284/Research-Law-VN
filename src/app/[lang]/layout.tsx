import type { Metadata } from "next";
import { Be_Vietnam_Pro, Lora } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";

import "../globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { VERIFIED_ON } from "@/data/documents";
import type { Lang } from "@/data/types";
import { formatDate, getDict, isLang, LANGS } from "@/i18n/dictionary";

/*
  Hai họ chữ, mỗi họ một nhiệm vụ. Lora có chân, dùng cho tiêu đề và trích dẫn
  để trang đọc ra dáng văn bản pháp lý. Be Vietnam Pro không chân, được thiết kế
  riêng cho tiếng Việt nên dấu thanh cân và không đè lên dòng trên.
  `display: swap` để chữ hiện ngay bằng font dự phòng, không có khoảng trắng chờ.
*/
const serif = Lora({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-lora",
});

const sans = Be_Vietnam_Pro({
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-bvp",
});

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = getDict(lang);
  return {
    title: { default: t.siteName, template: `%s — ${t.siteName}` },
    description: t.siteTagline,
    openGraph: {
      title: t.siteName,
      description: t.siteTagline,
      locale: lang === "vi" ? "vi_VN" : "en_GB",
      type: "website",
    },
    alternates: {
      languages: { vi: "/vi", en: "/en" },
    },
    robots: { index: true, follow: true },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const t = getDict(lang);
  const other: Lang = lang === "vi" ? "en" : "vi";

  return (
    <html lang={lang} className={`${serif.variable} ${sans.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-[var(--paper)] focus:px-4 focus:py-2 focus:text-sm focus:ring-2 focus:ring-[var(--accent)]"
        >
          {t.a11y.skipToContent}
        </a>

        <SiteHeader lang={lang} otherLang={other} />

        <main id="main">{children}</main>

        <footer className="rule-t mt-20 bg-[var(--paper-2)]">
          <div className="mx-auto grid w-full max-w-[76rem] gap-8 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="eyebrow">{t.footer.disclaimerTitle}</p>
              <p className="measure mt-2 text-[0.9375rem] leading-relaxed text-[var(--ink-2)]">
                {t.footer.disclaimer}
              </p>
            </div>
            <div className="md:justify-self-end md:text-right">
              <p className="font-serif text-lg" style={{ fontFamily: "var(--font-serif)" }}>
                {t.siteName}
              </p>
              <p className="tnum mt-1 text-sm text-[var(--ink-3)]">
                {t.footer.verifiedPrefix}{" "}
                {formatDate(VERIFIED_ON, lang, VERIFIED_ON)}
              </p>
              <Link
                href={`/${other}`}
                hrefLang={other}
                className="mt-3 inline-block border-b border-[var(--rule-strong)] pb-0.5 text-sm transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {t.footer.switchLangFull}
              </Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
