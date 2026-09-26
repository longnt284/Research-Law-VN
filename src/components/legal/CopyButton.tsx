"use client";

import { useState } from "react";

/**
 * Nút sao chép một chuỗi, báo lại bằng chữ khi đã chép xong.
 *
 * Không có `navigator.clipboard` (trình duyệt cũ, trang không chạy trên HTTPS)
 * thì nút giữ nguyên chữ thay vì báo lỗi: trang vẫn đọc được, chỉ không chép
 * được.
 */
export function CopyButton({
  text,
  label,
  done,
  className = "btn btn-quiet w-full justify-center",
}: {
  text: string;
  label: string;
  done: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-live="polite"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? done : label}
    </button>
  );
}
