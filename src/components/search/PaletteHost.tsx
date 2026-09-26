"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

import type { Lang } from "@/data/types";

/**
 * Chỗ đặt bảng lệnh trong layout.
 *
 * Phần luôn có mặt chỉ là một bộ nghe phím Ctrl K / ⌘ K và sự kiện
 * `ll:palette`. Mã của bảng lệnh và chỉ mục tìm kiếm chỉ được tải khi bảng mở
 * lần đầu, nên trang nào cũng không phải trả giá cho nó lúc tải.
 */

const CommandPalette = dynamic(() => import("@/components/search/CommandPalette"), {
  ssr: false,
});

export const PALETTE_EVENT = "ll:palette";

/** Mở bảng lệnh từ bất kỳ nút nào trên trang. */
export function openPalette() {
  window.dispatchEvent(new Event(PALETTE_EVENT));
}

export function PaletteHost({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (
        e.key === "/" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLSelectElement) &&
        !(e.target as HTMLElement | null)?.isContentEditable
      ) {
        e.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener(PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(PALETTE_EVENT, onOpen);
    };
  }, []);

  return open ? <CommandPalette lang={lang} onClose={close} /> : null;
}
