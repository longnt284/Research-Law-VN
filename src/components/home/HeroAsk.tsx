"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Lang } from "@/data/types";
import { getChatCopy } from "@/i18n/chat";
import { setPendingQuestion } from "@/lib/chat/history";

/**
 * Ô hỏi trợ lý AI ở đầu trang chủ. Gửi thì chuyển sang trang `/hoi-dap`, nơi
 * câu hỏi được gửi ngay trong một cuộc trò chuyện mới. Câu hỏi đi qua
 * `sessionStorage`, không qua địa chỉ trang.
 */
export function HeroAsk({ lang }: { lang: Lang }) {
  const t = getChatCopy(lang);
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit() {
    const v = q.trim();
    if (!v) return;
    setPendingQuestion(v);
    router.push(`/${lang}/hoi-dap`);
  }

  return (
    <form
      className="hero-ask"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <label htmlFor="hero-ask" className="hero-ask-label">
        {t.ask.label}
      </label>
      <div className="hero-ask-row">
        <textarea
          id="hero-ask"
          className="hero-ask-input"
          rows={2}
          maxLength={6000}
          value={q}
          placeholder={t.ask.placeholder}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button type="submit" className="btn btn-solid" disabled={!q.trim()}>
          {t.ask.submit}
        </button>
      </div>
    </form>
  );
}
