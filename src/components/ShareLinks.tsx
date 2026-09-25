"use client";

import { useEffect, useState } from "react";

import type { Lang } from "@/data/types";
import { getDict } from "@/i18n/dictionary";

/**
 * Nút chia sẻ của một trang.
 *
 * Trên điện thoại, nút mở bảng chia sẻ của hệ điều hành (Web Share API), nên
 * người đọc gửi thẳng sang Zalo, Messenger hay email mà trang không phải nhúng
 * mã của bên nào. Trên máy tính, nút sao chép đường dẫn. Facebook và LinkedIn là
 * hai liên kết thường: bấm vào mới rời trang, không có đoạn mã nào của hai bên
 * được nạp, nên chính sách `default-src 'self'` không phải nới.
 *
 * Đường dẫn là địa chỉ chuẩn của trang, bỏ phần truy vấn và neo: người nhận mở
 * đúng trang mà thẻ chia sẻ mô tả.
 */
export function ShareLinks({
  lang,
  path,
  canonical,
  title,
}: {
  lang: Lang;
  /** Đường dẫn của trang, ví dụ `/vi/van-ban/luat-xay-dung-2025`. */
  path: string;
  /** Địa chỉ tuyệt đối dựng ở máy chủ, dùng trước khi trang chạy trên trình duyệt. */
  canonical: string;
  title: string;
}) {
  const t = getDict(lang);
  const [url, setUrl] = useState(canonical);
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);

  // Máy chủ không biết trang đang chạy ở tên miền nào khi biến môi trường chưa
  // đặt; trên trình duyệt thì biết chắc. Kiểm tra Web Share cũng chỉ làm được ở
  // đây, nên nút chia sẻ của hệ điều hành chỉ hiện sau khi gắn.
  useEffect(() => {
    setUrl(`${window.location.origin}${path}`);
    setCanShare(typeof navigator.share === "function");
  }, [path]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const enc = encodeURIComponent(url);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {canShare && (
        <button
          type="button"
          className="chip"
          onClick={() => {
            // Người đọc đóng bảng chia sẻ thì trình duyệt báo lỗi hủy; không có
            // gì để làm với lỗi đó.
            navigator.share({ title, url }).catch(() => undefined);
          }}
        >
          {t.share.native}
        </button>
      )}
      <button type="button" className="chip" onClick={copy} aria-live="polite">
        {copied ? t.share.copied : t.share.copy}
      </button>
      <a
        className="chip"
        href={`https://www.facebook.com/sharer/sharer.php?u=${enc}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Facebook
      </a>
      <a
        className="chip"
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        LinkedIn
      </a>
    </div>
  );
}
