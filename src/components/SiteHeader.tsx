"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/ThemeToggle";
import type { Lang } from "@/data/types";
import { getDict } from "@/i18n/dictionary";

/**
 * Thanh điều hướng.
 *
 * Nút đổi ngôn ngữ giữ nguyên đường dẫn đang xem thay vì trả người đọc về trang
 * chủ. Người đang đọc chi tiết một nghị định mà bấm sang tiếng Anh thì vẫn ở
 * đúng nghị định đó.
 */
export function SiteHeader({ lang, otherLang }: { lang: Lang; otherLang: Lang }) {
  const t = getDict(lang);
  const pathname = usePathname() ?? `/${lang}`;

  const swapped = pathname.startsWith(`/${lang}`)
    ? `/${otherLang}${pathname.slice(lang.length + 1)}`
    : `/${otherLang}`;

  const links = [
    // Trang chủ phải có mặt trong thanh điều hướng, không chỉ nằm sau dấu ấn ở
    // góc trái: phần mở đầu ba chiều và khối lối vào là một mục thật của trang
    // chứ không phải một tấm bìa để lướt qua một lần. So khớp đúng bằng địa chỉ
    // gốc, nếu không mục này sáng lên ở mọi trang con.
    { href: `/${lang}`, label: t.nav.home, exact: true },
    { href: `/${lang}/ban-do`, label: t.nav.map, exact: false },
    { href: `/${lang}/van-ban`, label: t.nav.documents, exact: false },
    { href: `/${lang}/linh-vuc`, label: t.nav.domains, exact: false },
    { href: `/${lang}/doi-chieu`, label: t.nav.compare, exact: false },
    { href: `/${lang}/phuong-phap`, label: t.nav.about, exact: false },
  ];

  return (
    <header className="rule-b header-lux sticky top-0 z-30 bg-[color-mix(in_oklab,var(--paper)_88%,transparent)] backdrop-blur-md">
      {/*
        `flex-wrap` chứ không phải `truncate`. Khi thanh điều hướng không còn đủ
        chỗ trên điện thoại, nó xuống hàng; nếu cắt chữ thì tên trang bị nuốt sạch
        và chỉ còn lại một ô vuông vô nghĩa ở góc trái.
      */}
      <div className="mx-auto flex w-full max-w-[76rem] flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-5 py-2.5 sm:px-8 sm:py-3">
        <Link href={`/${lang}`} className="group flex items-center gap-2.5">
          {/*
            Dấu ấn là chữ § đặt trong khung vuông mực đỏ — một chi tiết đặc trưng
            của ngành thay vì một ô màu trung tính. Khung tô đầy khi rê chuột.
          */}
          <span
            aria-hidden="true"
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center border border-[var(--accent)] text-[0.8125rem] leading-none text-[var(--accent)] transition-colors group-hover:bg-[var(--accent)] group-hover:text-[var(--paper)]"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            §
          </span>
          <span
            className="text-[1.0625rem] font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {t.siteName}
          </span>
        </Link>

        {/*
          Không đặt `shrink-0` ở đây. Với bốn mục cộng nút đổi ngôn ngữ và nút
          đổi nền, thanh điều hướng rộng hơn màn hình điện thoại; nếu cấm co thì
          nó đẩy cả thân trang tràn ngang. Cho phép xuống hàng: thanh cao thêm
          một dòng, đổi lại trang không bao giờ cuộn ngang.
        */}
        <nav className="-ml-2 flex flex-wrap items-center gap-1 sm:ml-0 sm:gap-2">
          {links.map((l) => {
            const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`group relative px-2 py-1.5 text-sm transition-colors sm:px-2.5 ${
                  active
                    ? "text-[var(--ink)]"
                    : "text-[var(--ink-3)] hover:text-[var(--ink)]"
                }`}
              >
                {l.label}
                {/*
                  Gạch chân là một phần tử riêng chứ không phải border, nhờ vậy
                  nó chạy ngang ra khi rê chuột mà chiều cao dòng không đổi.
                */}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-2 bottom-0 h-[2px] origin-left bg-[var(--accent)] transition-transform duration-300 ease-[var(--ease-out-soft)] sm:inset-x-2.5 ${
                    active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
          <Link
            href={swapped}
            hrefLang={otherLang}
            aria-label={t.footer.switchLangFull}
            className="ml-1 border border-[var(--rule-strong)] px-2.5 py-1 text-xs font-medium tracking-wide transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            {t.footer.switchLang}
          </Link>
          <ThemeToggle lang={lang} />
        </nav>
      </div>
    </header>
  );
}
