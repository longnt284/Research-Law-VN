import type { Metadata } from "next";
import { Be_Vietnam_Pro, Lora } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";

import "../globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { LATEST_VERIFIED_ON } from "@/data/documents";
import type { Lang } from "@/data/types";
import { formatDate, getDict, isLang, LANGS } from "@/i18n/dictionary";
import { SITE_URL } from "@/lib/site";

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
    // Không có mốc này thì mọi đường dẫn trong metadata ở dạng tương đối và
    // công cụ tìm kiếm không giải ra được địa chỉ thật.
    metadataBase: new URL(SITE_URL),
    title: { default: t.siteName, template: `%s — ${t.siteName}` },
    description: t.siteTagline,
    openGraph: {
      title: t.siteName,
      description: t.siteTagline,
      locale: lang === "vi" ? "vi_VN" : "en_GB",
      type: "website",
    },
    // Khai báo bản dịch nằm ở từng trang, xem `alternatesFor` trong
    // `src/lib/site.ts`: layout không biết mình đang bọc trang nào.
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
    <html
      lang={lang}
      className={`${serif.variable} ${sans.variable}`}
      suppressHydrationWarning
    >
      <body>
        {/*
          Đọc lựa chọn sáng/tối trước khi trang vẽ khung hình đầu tiên. Nếu để
          React làm việc này sau khi tải xong, người chọn nền tối sẽ thấy một
          nháy trắng mỗi lần mở trang.

          Cùng chỗ này đặt lớp `js` lên thẻ <html>. Hiệu ứng hiện dần khi cuộn
          giấu khối nội dung đi rồi mới bật lại; nếu trạng thái giấu áp dụng cả
          khi JavaScript bị chặn thì trang sẽ trắng trơn. Treo nó vào `html.js`
          là cách để không có JavaScript đồng nghĩa với không có hiệu ứng, chứ
          không đồng nghĩa với mất nội dung.

          Còn một đường hỏng nữa mà lớp `js` không đỡ được: trình duyệt chạy
          được JavaScript nhưng gói mã của trang tải hỏng. Khi đó lớp `js` đã
          nằm trên thẻ <html> mà không ai bật nội dung lên. Hẹn giờ bốn giây gỡ
          lớp đó ra nếu tới lúc ấy chưa có khối `Reveal` nào báo là đã chạy. Cả
          trang là HTML tĩnh, nên gỡ xong người đọc vẫn có đủ nội dung.

          Lựa chọn dừng chuyển động (nút ở trang chủ) cũng được đọc ở đây, cùng
          lý do với nền sáng tối: người đã dừng không phải thấy dải xích chạy
          một nhịp rồi mới đứng lại.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "var e=document.documentElement;e.classList.add('js');setTimeout(function(){if(e.dataset.reveal!=='on')e.classList.remove('js')},4000);try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light')e.dataset.theme=t;if(localStorage.getItem('motion')==='off')e.dataset.motion='off'}catch(err){}",
          }}
        />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-[var(--paper)] focus:px-4 focus:py-2 focus:text-sm focus:ring-2 focus:ring-[var(--accent)]"
        >
          {t.a11y.skipToContent}
        </a>

        <SiteHeader lang={lang} otherLang={other} />

        <main id="main">{children}</main>

        <footer className="rule-t mt-20 bg-[var(--paper-2)]">
          <div className="mx-auto w-full max-w-[76rem] px-5 py-12 sm:px-8 sm:py-14">
            {/* Tên trang đặt lớn ở đầu chân trang, đóng lại bằng đường kẻ đôi
                giống cách một ấn phẩm in kết thúc trang cuối. */}
            <div className="rule-double-b flex flex-wrap items-end justify-between gap-x-8 gap-y-3 pb-6">
              <p
                className="text-[1.6rem] leading-tight"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {t.siteName}
              </p>
              <p className="tnum text-sm text-[var(--ink-3)]">
                {t.footer.verifiedPrefix} {formatDate(LATEST_VERIFIED_ON, lang, LATEST_VERIFIED_ON)}
              </p>
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-[1.5fr_1fr]">
              <div>
                <p className="eyebrow eyebrow-tick">{t.footer.disclaimerTitle}</p>
                <p className="measure mt-2.5 text-[0.9375rem] leading-relaxed text-[var(--ink-2)]">
                  {t.footer.disclaimer}
                </p>
              </div>
              <nav className="md:justify-self-end" aria-label={t.siteName}>
                <p className="eyebrow eyebrow-tick">{t.footer.navTitle}</p>
                <ul className="mt-2.5 space-y-1.5 text-[0.9375rem]">
                  <li>
                    <Link href={`/${lang}`} className="link-sweep">
                      {t.nav.home}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${lang}/ban-do`} className="link-sweep">
                      {t.nav.map}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${lang}/van-ban`} className="link-sweep">
                      {t.nav.documents}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${lang}/linh-vuc`} className="link-sweep">
                      {t.nav.domains}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${lang}/doi-chieu`} className="link-sweep">
                      {t.nav.compare}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${lang}/phuong-phap`} className="link-sweep">
                      {t.nav.about}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/${other}`} hrefLang={other} className="link-sweep">
                      {t.footer.switchLangFull}
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
