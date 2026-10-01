"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

import type { Lang } from "@/data/types";
import { getChatCopy } from "@/i18n/chat";

/**
 * Chỗ đặt trợ lý hỏi đáp trong layout.
 *
 * Phần luôn có mặt chỉ là nút mở. Mã của khung chat chỉ tải khi mở lần đầu,
 * giống bảng lệnh (`PaletteHost`). Sau đó khung chat ở lại trong cây và chỉ bị
 * ẩn khi đóng, nên đóng rồi mở lại, hay chuyển sang trang khác, vẫn còn nguyên
 * cuộc trò chuyện.
 *
 * Phần khác của trang mở khung chat bằng sự kiện `CHAT_OPEN_EVENT` trên
 * `window` (ví dụ nút "Tiếp tục sử dụng Lex AI" sau khi thanh toán).
 */

export const CHAT_OPEN_EVENT = "ll:chat-open";

const ChatPanel = dynamic(() => import("@/components/chat/ChatPanel"), { ssr: false });

export function ChatHost({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const launcher = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => {
    setOpen(false);
    // Trả focus về nút mở, để người dùng bàn phím không bị rơi về đầu trang.
    requestAnimationFrame(() => launcher.current?.focus());
  }, []);

  useEffect(() => {
    const onOpen = () => {
      setLoaded(true);
      setOpen(true);
    };
    window.addEventListener(CHAT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(CHAT_OPEN_EVENT, onOpen);
  }, []);

  return (
    <>
      <button
        ref={launcher}
        type="button"
        className="chat-launch"
        hidden={open}
        aria-haspopup="dialog"
        onClick={() => {
          setLoaded(true);
          setOpen(true);
        }}
      >
        <svg viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5">
          <path
            d="M4 4.5h12v8.5H9l-3.5 3v-3H4z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        <span>{getChatCopy(lang).launch}</span>
      </button>
      {loaded && <ChatPanel lang={lang} open={open} onClose={close} />}
    </>
  );
}
