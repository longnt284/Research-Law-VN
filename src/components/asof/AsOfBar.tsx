"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import type { Lang } from "@/data/types";
import { getSearchCopy } from "@/i18n/search";
import { setAsOf, syncAsOfFromUrl, useAsOf } from "@/lib/client-store";

/**
 * Dải "Pháp luật tại ngày…" dưới thanh điều hướng.
 *
 * Chỉ hiện khi người đọc đã đặt một ngày tra cứu. Khi ấy tình trạng hiệu lực
 * trong ô tìm, bảng lệnh, danh mục và gia phả đều tính theo ngày đó, nên ngày
 * phải luôn nằm trong tầm mắt kèm một nút bỏ: người đọc không được quên rằng
 * mình đang xem pháp luật của một ngày khác hôm nay.
 */
export function AsOfBar({ lang }: { lang: Lang }) {
  const s = getSearchCopy(lang);
  const asOf = useAsOf();
  const pathname = usePathname();

  // Đường dẫn có `?ngay=` (ví dụ đồng nghiệp gửi sang) đặt ngày khi trang mở,
  // và mỗi lần chuyển trang trong ứng dụng.
  useEffect(() => {
    syncAsOfFromUrl();
  }, [pathname]);

  if (!asOf) return null;
  return (
    <div className="asof-bar" role="status">
      <div className="asof-bar-inner">
        <svg viewBox="0 0 16 16" aria-hidden="true" className="asof-icon">
          <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <path d="M8 4.6V8.2L10.4 9.6" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <label htmlFor="asof-bar-date" className="asof-label">
          {s.asOf.label}
        </label>
        <input
          id="asof-bar-date"
          type="date"
          value={asOf}
          onChange={(e) => e.target.value && setAsOf(e.target.value)}
          className="asof-input tnum"
          aria-describedby="asof-bar-hint"
        />
        <span id="asof-bar-hint" className="asof-hint">
          {s.asOf.hint}
        </span>
        <button
          type="button"
          className="asof-clear"
          onClick={() => setAsOf("")}
          title={s.asOf.clear}
        >
          <span aria-hidden="true">×</span> {s.asOf.clearShort}
        </button>
      </div>
    </div>
  );
}
