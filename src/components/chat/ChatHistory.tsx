"use client";

import type { Lang } from "@/data/types";
import type { ChatCopy } from "@/i18n/chat";
import { MAX_CONVERSATIONS, type Conversation } from "@/lib/chat/history";

/**
 * Danh sách cuộc trò chuyện đã lưu trong trình duyệt: mở lại, xóa từng cuộc,
 * xóa toàn bộ, mở cuộc mới. Trên trang `/hoi-dap` màn hình rộng, danh sách là
 * cột trái; trong khung chat nổi và trên màn hình hẹp, nó thay chỗ khung trò
 * chuyện khi bấm nút Lịch sử.
 */
export function ChatHistory({
  lang,
  t,
  items,
  active,
  onOpen,
  onDelete,
  onClear,
  onNew,
}: {
  lang: Lang;
  t: ChatCopy;
  items: Conversation[];
  active: string | null;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onNew: () => void;
}) {
  const when = new Intl.DateTimeFormat(lang === "vi" ? "vi-VN" : "en-GB", {
    dateStyle: "short",
    timeStyle: "short",
  });
  return (
    <nav className="chat-aside thin-scroll" aria-label={t.history.title}>
      <p className="chat-aside-title">
        {t.history.title}{" "}
        <span className="chat-aside-count">
          {items.length}/{MAX_CONVERSATIONS}
        </span>
      </p>
      <button type="button" className="btn btn-quiet btn-sm chat-aside-new" onClick={onNew}>
        {t.reset}
      </button>
      {items.length === 0 ? (
        <p className="chat-hint">{t.history.empty}</p>
      ) : (
        <ul className="chat-hist">
          {items.map((c) => (
            <li key={c.id} className={c.id === active ? "is-active" : undefined}>
              <button
                type="button"
                className="chat-hist-open"
                aria-current={c.id === active ? "true" : undefined}
                onClick={() => onOpen(c.id)}
              >
                <span className="chat-hist-title">{c.title}</span>
                <span className="chat-hist-time">{when.format(c.updated)}</span>
              </button>
              <button
                type="button"
                className="chat-hist-del"
                aria-label={t.history.removeLabel(c.title)}
                title={t.history.removeLabel(c.title)}
                onClick={() => onDelete(c.id)}
              >
                <span aria-hidden="true">✕</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="chat-hint">{t.history.note}</p>
      {items.length > 0 && (
        <button type="button" className="chat-icon-btn chat-aside-clear" onClick={onClear}>
          {t.history.clear}
        </button>
      )}
    </nav>
  );
}
