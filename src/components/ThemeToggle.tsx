"use client";

import { useEffect, useState } from "react";

import type { Lang } from "@/data/types";
import { getDict } from "@/i18n/dictionary";

type Mode = "light" | "dark";

/**
 * Nút đổi nền sáng/tối.
 *
 * Bảng màu tối đã có sẵn trong CSS từ trước nhưng chỉ đi theo cài đặt hệ điều
 * hành; ai muốn đọc nền tối trên một máy đang để chế độ sáng thì không có cách
 * nào. Nút này ghi `data-theme` lên thẻ <html> và nhớ lựa chọn trong
 * localStorage; đoạn script nhỏ ở đầu <body> đọc lại giá trị đó trước khi trang
 * vẽ, nên không có cú nháy trắng khi tải lại.
 *
 * Trước khi component gắn vào DOM, chưa thể biết người dùng đang ở chế độ nào —
 * máy chủ không đọc được localStorage. Vì vậy biểu tượng chỉ hiện sau khi gắn,
 * còn khung nút vẫn chiếm đúng chỗ để thanh điều hướng không nhảy.
 */
export function ThemeToggle({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const [mode, setMode] = useState<Mode | null>(null);

  useEffect(() => {
    const stored = document.documentElement.dataset.theme;
    if (stored === "dark" || stored === "light") {
      setMode(stored);
      return;
    }
    setMode(
      window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
    );
  }, []);

  const toggle = () => {
    const next: Mode = mode === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Trình duyệt chặn lưu trữ (cửa sổ ẩn danh, chặn cookie bên thứ ba).
      // Lựa chọn vẫn có hiệu lực trong phiên này, chỉ là không nhớ được sang lần sau.
    }
    setMode(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t.a11y.toggleTheme}
      title={t.a11y.toggleTheme}
      className="ml-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center border border-[var(--rule-strong)] text-[var(--ink-2)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
    >
      {mode === null ? null : mode === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="3.1" />
      <path d="M8 1v1.6M8 13.4V15M1 8h1.6M13.4 8H15M3.05 3.05l1.13 1.13M11.82 11.82l1.13 1.13M12.95 3.05l-1.13 1.13M4.18 11.82l-1.13 1.13" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M13.4 9.6A5.8 5.8 0 0 1 6.4 2.6a5.8 5.8 0 1 0 7 7Z" />
    </svg>
  );
}
