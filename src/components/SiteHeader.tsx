"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
    { href: `/${lang}`, label: t.nav.map, exact: true },
    { href: `/${lang}/van-ban`, label: t.nav.documents, exact: false },
    { href: `/${lang}/phuong-phap`, label: t.nav.about, exact: false },
  ];

  return (
    <header className="rule-b sticky top-0 z-30 bg-[color-mix(in_oklab,var(--paper)_88%,transparent)] backdrop-blur-md">
      {/*
        `flex-wrap` chứ không phải `truncate`. Khi thanh điều hướng không còn đủ
        chỗ trên điện thoại, nó xuống hàng; nếu cắt chữ thì tên trang bị nuốt sạch
        và chỉ còn lại một ô vuông vô nghĩa ở góc trái.
      */}
      <div className="mx-auto flex w-full max-w-[76rem] flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-5 py-2.5 sm:px-8 sm:py-3">
        <Link href={`/${lang}`} className="group flex items-baseline gap-2.5">
          <span
            aria-hidden="true"
            className="inline-block h-3.5 w-3.5 shrink-0 border border-[var(--accent)] transition-colors group-hover:bg-[var(--accent)]"
          />
          <span
            className="text-[1.0625rem] font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-serif)" }}
          >
            {t.siteName}
          </span>
        </Link>

        <nav className="-ml-2 flex shrink-0 items-center gap-1 sm:ml-0 sm:gap-2">
          {links.map((l) => {
            const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`border-b-2 px-2 py-1.5 text-sm transition-colors sm:px-2.5 ${
                  active
                    ? "border-[var(--accent)] text-[var(--ink)]"
                    : "border-transparent text-[var(--ink-3)] hover:text-[var(--ink)]"
                }`}
              >
                {l.label}
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
        </nav>
      </div>
    </header>
  );
}
