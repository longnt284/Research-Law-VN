"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AsOfBar } from "@/components/asof/AsOfBar";
import { BrandMark, Wordmark } from "@/components/brand/BrandMark";
import { openPalette } from "@/components/search/PaletteHost";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Lang } from "@/data/types";
import { getDict } from "@/i18n/dictionary";
import { getAccountCopy } from "@/i18n/account";
import { getSearchCopy } from "@/i18n/search";
import { ACCOUNTS_ENABLED } from "@/lib/account";
import { useAccount } from "@/lib/client-store";

/**
 * Thanh điều hướng.
 *
 * Năm mục đi theo đúng nhịp làm việc của người tra cứu: tra một văn bản, khám
 * phá theo lĩnh vực, đối chiếu hai đời văn bản, xem điều gì vừa thay đổi, và
 * theo dõi những văn bản mình đang dùng. Trang chủ nằm sau dấu hiệu ở góc trái.
 *
 * Nút tìm kiếm có mặt ở mọi trang và mở bảng lệnh (Ctrl K / ⌘ K): người đang
 * đọc giữa một nghị định không phải quay về trang chủ để tra văn bản khác.
 *
 * Nút đổi ngôn ngữ giữ nguyên đường dẫn đang xem thay vì trả người đọc về trang
 * chủ. Người đang đọc chi tiết một nghị định mà bấm sang tiếng Anh thì vẫn ở
 * đúng nghị định đó.
 */
export function SiteHeader({ lang, otherLang }: { lang: Lang; otherLang: Lang }) {
  const t = getDict(lang);
  const s = getSearchCopy(lang);
  const pathname = usePathname() ?? `/${lang}`;
  const [mac, setMac] = useState(false);
  const account = useAccount();
  const ac = getAccountCopy(lang);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent));
  }, []);

  // Chiều cao thật của thanh (một hay hai hàng, có hay không dải ngày tra cứu)
  // ghi vào `--hdr-h`, để các thanh dính bên dưới và neo cuộn nằm đúng chỗ ở
  // mọi bề ngang thay vì đoán một con số cố định.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () =>
      document.documentElement.style.setProperty("--hdr-h", `${Math.round(el.offsetHeight)}px`);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const swapped = pathname.startsWith(`/${lang}`)
    ? `/${otherLang}${pathname.slice(lang.length + 1)}`
    : `/${otherLang}`;

  const links = [
    { href: `/${lang}/van-ban`, label: s.nav.lookup },
    { href: `/${lang}/linh-vuc`, label: s.nav.explore },
    { href: `/${lang}/doi-chieu`, label: s.nav.compare },
    { href: `/${lang}/thay-doi`, label: s.nav.changes },
    { href: `/${lang}/theo-doi`, label: s.nav.watch },
  ];

  const searchButton = (compact: boolean) => (
    <button
      type="button"
      onClick={openPalette}
      className={compact ? "hdr-search hdr-search--icon" : "hdr-search"}
      aria-label={compact ? `${s.palette.open} (${mac ? "⌘" : "Ctrl"} K)` : undefined}
      aria-keyshortcuts={mac ? "Meta+K" : "Control+K"}
    >
      <svg viewBox="0 0 20 20" aria-hidden="true" className="hdr-search-icon">
        <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12.6 12.6 17 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
      {!compact && (
        <>
          <span className="hdr-search-label">{s.nav.search}</span>
          <kbd className="hdr-kbd">{mac ? "⌘" : "Ctrl"} K</kbd>
        </>
      )}
    </button>
  );

  return (
    <header ref={ref} className="site-header rule-b header-lux sticky top-0 z-30">
      <div className="hdr-row">
        <Link href={`/${lang}`} className="brand-link group flex items-center gap-2.5" aria-label={t.siteName}>
          <BrandMark variant="badge" id="hdr" className="brand-badge h-8 w-8 shrink-0" />
          <Wordmark />
        </Link>

        {/*
          Trên màn hình hẹp, năm mục điều hướng nằm ở hàng riêng và tự cuộn
          ngang khi thiếu chỗ, còn nút tìm, ngôn ngữ, nền ở cùng hàng với tên
          trang: ô tìm luôn trong tầm một ngón tay.
        */}
        <nav className="hdr-nav nav-strip" aria-label={s.nav.primary}>
          {links.map((l) => {
            const active = pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`hdr-link group ${active ? "is-active" : ""}`}
              >
                {l.label}
                <span aria-hidden="true" className="hdr-link-bar" />
              </Link>
            );
          })}
        </nav>

        <div className="hdr-tools">
          <span className="hdr-search-wide">{searchButton(false)}</span>
          <span className="hdr-search-narrow">{searchButton(true)}</span>
          {ACCOUNTS_ENABLED && (
            <Link
              href={`/${lang}/tai-khoan`}
              className={`hdr-icon-btn${account ? " is-on" : ""}`}
              aria-label={account ? `${ac.navSignedIn}: ${account.email}` : ac.nav}
              title={account ? account.email : ac.nav}
            >
              <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
                <circle cx="8" cy="5.6" r="2.7" fill={account ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.3" />
                <path d="M2.8 13.6c.7-2.6 2.8-3.9 5.2-3.9s4.5 1.3 5.2 3.9" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </Link>
          )}
          <Link
            href={swapped}
            hrefLang={otherLang}
            aria-label={t.footer.switchLangFull}
            className="hdr-lang"
          >
            {otherLang.toUpperCase()}
          </Link>
          <ThemeToggle lang={lang} />
        </div>
      </div>
      <AsOfBar lang={lang} />
    </header>
  );
}
