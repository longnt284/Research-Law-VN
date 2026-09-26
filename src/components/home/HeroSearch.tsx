"use client";

import Link from "next/link";
import { useState } from "react";

import { AsOfForm } from "@/components/asof/AsOfForm";
import { SearchBox } from "@/components/search/SearchBox";
import type { Lang } from "@/data/types";
import { getSearchCopy } from "@/i18n/search";

/**
 * Ô tìm kiếm ở đầu trang chủ và bốn lối tắt bên dưới.
 *
 * Lối tắt là việc chứ không phải trang: kiểm tra hiệu lực đưa con trỏ vào ô
 * tìm, xem gia phả cuộn tới gia phả tiêu biểu, so sánh mở trang đối chiếu, và
 * "luật tại một thời điểm" mở ô chọn ngày ngay tại chỗ.
 */
export function HeroSearch({ lang }: { lang: Lang }) {
  const c = getSearchCopy(lang);
  const [picking, setPicking] = useState(false);

  return (
    <div className="hero-search">
      <SearchBox lang={lang} id="hero-search" variant="hero" />
      <div className="quick" role="group" aria-label={c.quick.label}>
        <button
          type="button"
          className="quick-btn"
          onClick={() => document.getElementById("hero-search")?.focus()}
          title={c.quick.validityHint}
        >
          <span aria-hidden="true" className="quick-dot quick-dot--validity" />
          {c.quick.validity}
        </button>
        <Link href="#gia-pha" className="quick-btn">
          <span aria-hidden="true" className="quick-dot quick-dot--lineage" />
          {c.quick.lineage}
        </Link>
        <Link href={`/${lang}/doi-chieu`} className="quick-btn">
          <span aria-hidden="true" className="quick-dot quick-dot--compare" />
          {c.quick.compare}
        </Link>
        <button
          type="button"
          className="quick-btn"
          aria-expanded={picking}
          aria-controls="hero-asof"
          onClick={() => setPicking((v) => !v)}
        >
          <span aria-hidden="true" className="quick-dot quick-dot--asof" />
          {c.quick.asOf}
        </button>
      </div>
      {picking && (
        <div id="hero-asof" className="quick-asof">
          <AsOfForm lang={lang} id="hero-asof-date" />
        </div>
      )}
    </div>
  );
}

/** Nút đưa con trỏ vào ô tìm ở đầu trang chủ. */
export function FocusSearchButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="btn btn-quiet btn-sm"
      onClick={() => {
        const el = document.getElementById("hero-search");
        el?.scrollIntoView({ block: "center" });
        el?.focus({ preventScroll: true });
      }}
    >
      {label}
    </button>
  );
}
