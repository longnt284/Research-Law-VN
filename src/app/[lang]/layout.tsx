import type { Metadata } from "next";
import { Be_Vietnam_Pro, Lora } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";

import "../globals.css";
import "../product.css";
import { BrandMark, Wordmark } from "@/components/brand/BrandMark";
import { MotionToggle } from "@/components/home/MotionToggle";
import { PaletteHost } from "@/components/search/PaletteHost";
import { SiteHeader } from "@/components/SiteHeader";
import { LATEST_VERIFIED_ON } from "@/data/documents";
import type { Lang } from "@/data/types";
import { formatDate, getDict, isLang, LANGS } from "@/i18n/dictionary";
import { getHome } from "@/i18n/home";
import { getLanding } from "@/i18n/landing";
import { getSearchCopy } from "@/i18n/search";
import { CONTACT, SITE_URL } from "@/lib/site";

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
  const f = getLanding(lang).footer;
  const nav = getSearchCopy(lang).nav;
  const motion = getHome(lang).hero;

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
          lý do với nền sáng tối: người đã dừng không phải thấy huy hiệu vẽ dần
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

        <PaletteHost lang={lang} />

        <footer className="rule-t mt-20 bg-[var(--paper-2)]">
          <div className="mx-auto w-full max-w-[76rem] px-5 py-12 sm:px-8 sm:py-14">
            {/* Dấu và tên trang đặt lớn ở đầu chân trang, đóng lại bằng đường kẻ
                đôi giống cách một ấn phẩm in kết thúc trang cuối. */}
            <div className="rule-double-b flex flex-wrap items-end justify-between gap-x-8 gap-y-3 pb-6">
              <p className="flex items-center gap-3.5">
                <BrandMark variant="badge" id="ftr" className="h-12 w-12 shrink-0" />
                <span className="flex flex-col">
                  <Wordmark className="wordmark-lg" />
                  <span className="sr-only">{t.siteName}</span>
                  <span className="mt-1 text-[0.8125rem] text-[var(--ink-3)]">{t.brandLine}</span>
                </span>
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <p className="tnum text-sm text-[var(--ink-3)]">
                  {t.footer.verifiedPrefix} {formatDate(LATEST_VERIFIED_ON, lang, LATEST_VERIFIED_ON)}
                </p>
                {/* Nút dừng chuyển động áp cho cả trang: vệt sáng ở thanh điều
                    hướng, lớp nền đầu trang và nét vẽ của dấu hiệu. */}
                <MotionToggle pause={motion.pause} play={motion.play} />
              </div>
            </div>

            {/* Bốn cột điều hướng: sản phẩm, dữ liệu, pháp lý, liên hệ. Cột dữ
                liệu đứng thứ hai vì với một trang pháp lý, "dữ liệu này từ đâu"
                là câu hỏi ngay sau "trang này làm gì". */}
            <div className="footer-cols mt-8">
              <nav aria-label={f.product}>
                <p className="eyebrow eyebrow-tick">{f.product}</p>
                <ul>
                  <li><Link href={`/${lang}/van-ban`} className="link-sweep">{nav.lookup}</Link></li>
                  <li><Link href={`/${lang}/linh-vuc`} className="link-sweep">{nav.explore}</Link></li>
                  <li><Link href={`/${lang}/doi-chieu`} className="link-sweep">{nav.compare}</Link></li>
                  <li><Link href={`/${lang}/thay-doi`} className="link-sweep">{nav.changes}</Link></li>
                  <li><Link href={`/${lang}/theo-doi`} className="link-sweep">{nav.watch}</Link></li>
                </ul>
              </nav>
              <nav aria-label={f.data}>
                <p className="eyebrow eyebrow-tick">{f.data}</p>
                <ul>
                  <li><Link href={`/${lang}/phuong-phap#nguon`} className="link-sweep">{f.links.sources}</Link></li>
                  <li><Link href={`/${lang}/phuong-phap#pham-vi`} className="link-sweep">{f.links.coverage}</Link></li>
                  <li><Link href={`/${lang}/phuong-phap`} className="link-sweep">{f.links.verification}</Link></li>
                  <li><Link href={`/${lang}/phuong-phap#nhat-ky`} className="link-sweep">{f.links.log}</Link></li>
                  <li><Link href={`/${lang}/gop-y`} className="link-sweep">{f.links.report}</Link></li>
                  <li><Link href={`/${lang}/gop-y?loai=bo-sung`} className="link-sweep">{f.links.request}</Link></li>
                </ul>
              </nav>
              <nav aria-label={f.legal}>
                <p className="eyebrow eyebrow-tick">{f.legal}</p>
                <ul>
                  <li><a href="#mien-tru" className="link-sweep">{f.links.disclaimer}</a></li>
                  <li><Link href={`/${lang}/phuong-phap#rieng-tu`} className="link-sweep">{f.links.privacy}</Link></li>
                  <li>
                    <Link href={`/${other}`} hrefLang={other} className="link-sweep">
                      {t.footer.switchLangFull}
                    </Link>
                  </li>
                </ul>
              </nav>
              {/* Liên hệ giữ đúng địa chỉ đang dùng; không dựng thêm hộp thư nào
                  chưa có thật. */}
              <address className="not-italic">
                <p className="eyebrow eyebrow-tick">{f.contact}</p>
                <p className="mt-2.5 text-sm leading-relaxed text-[var(--ink-3)]">
                  {t.footer.contactLede}
                </p>
                <dl className="mt-3 space-y-2 text-[0.9375rem]">
                  <div>
                    <dt className="text-xs text-[var(--ink-3)]">{t.footer.phoneLabel}</dt>
                    <dd>
                      <a href={CONTACT.phoneHref} className="link-sweep tnum font-medium">
                        {CONTACT.phone}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[var(--ink-3)]">{t.footer.emailLabel}</dt>
                    <dd className="break-all">
                      <a href={`mailto:${CONTACT.email}`} className="link-sweep font-medium">
                        {CONTACT.email}
                      </a>
                    </dd>
                  </div>
                </dl>
              </address>
            </div>

            <div id="mien-tru" className="mt-10 border-t border-[var(--rule)] pt-6">
              <p className="eyebrow eyebrow-tick">{t.footer.disclaimerTitle}</p>
              <div className="mt-2.5 grid gap-x-10 gap-y-2.5 text-[0.875rem] leading-relaxed text-[var(--ink-2)] lg:grid-cols-3">
                {t.footer.disclaimer.map((para) => (
                  <p key={para}>{para}</p>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
