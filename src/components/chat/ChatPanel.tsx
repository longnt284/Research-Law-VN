"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { ChatHistory } from "@/components/chat/ChatHistory";
import type { Lang } from "@/data/types";
import { getChatCopy, type ChatCopy } from "@/i18n/chat";
import { ACCOUNTS_ENABLED, authHeaders } from "@/lib/account";
import {
  activeConversation,
  chatDeviceId,
  clearConversations,
  deleteConversation,
  newConversationId,
  readConversation,
  saveConversation,
  setActiveConversation,
  takePendingQuestion,
  useConversations,
  type Cut,
  type Limit,
  type Msg,
} from "@/lib/chat/history";
import {
  FREE_ROUTER,
  MODELS,
  modelLabel,
  OFFLINE_MODEL,
  pickable,
  PRO,
  providerOf,
  type ModelChoice,
} from "@/lib/chat/models";
import type { SkillId } from "@/lib/chat/skills";

/**
 * Khung trò chuyện của trợ lý hỏi đáp, ở hai dạng: khung nổi góc phải
 * (`variant="panel"`, do `ChatHost` đặt trên mọi trang) và trang riêng
 * `/hoi-dap` (`variant="page"`, có cột lịch sử).
 *
 * Máy chủ không giữ cuộc trò chuyện: mỗi lượt hỏi gửi lại cả phần trước lên
 * `/api/chat`. Tối đa 5 cuộc gần nhất được lưu trong trình duyệt
 * (`src/lib/chat/history.ts`). Câu trả lời chảy về dạng NDJSON (chữ trả lời,
 * chữ suy luận, tên model, báo câu trả lời chưa trọn) và được dựng thành phần
 * tử React, không qua `dangerouslySetInnerHTML`, nên chữ của mô hình không bao
 * giờ chạy được như mã.
 */

const MAX_CHARS = 6000;

function modelName(t: ChatCopy, id: string): string {
  if (id === FREE_ROUTER) return t.freeModel;
  if (id === OFFLINE_MODEL) return t.offline.model;
  return modelLabel(id);
}

function errorText(t: ChatCopy, code: string, status: number): string {
  if (status === 429 || code === "rate") return t.errors.rate;
  if (status === 503 || code === "config") return t.errors.config;
  if (status === 502 || code === "upstream") return t.errors.upstream;
  if (status === 413 || code === "long") return t.errors.long;
  return t.errors.other;
}

/*
  Markdown tối thiểu cho câu trả lời: đoạn, dòng tiêu đề, gạch đầu dòng, chữ đậm,
  chữ nghiêng, liên kết dạng [chữ](đường dẫn) và đường dẫn trần. Đường dẫn trong
  trang (/vi/..., /en/...) đi bằng `Link` để chuyển trang mà không mất cuộc trò
  chuyện. Liên kết dạng Markdown chỉ nhận đích http(s) hoặc đường dẫn trong trang.
*/
const INLINE =
  /\[([^\]\n]+)\]\(((?:https?:\/\/|\/(?:vi|en)\/)[^\s)]+)\)|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*|(https?:\/\/[^\s<>()[\]]+)|(\/(?:vi|en)\/[\w\-/#?=.]+)/g;

function linkTo(href: string, label: string, key: number): ReactNode {
  return href.startsWith("/") ? (
    <Link key={key} href={href} className="link-sweep">
      {label}
    </Link>
  ) : (
    <a key={key} href={href} target="_blank" rel="nofollow noopener noreferrer" className="link-sweep">
      {label}
    </a>
  );
}

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    last = at + m[0].length;
    if (m[1]) out.push(linkTo(m[2], m[1], at));
    else if (m[3]) out.push(<strong key={at}>{m[3]}</strong>);
    else if (m[4]) out.push(<em key={at}>{m[4]}</em>);
    else {
      // Dấu câu dính cuối đường dẫn thuộc về câu, không thuộc đường dẫn.
      const href = (m[5] ?? m[6]).replace(/[.,;:]+$/, "");
      out.push(linkTo(href, href, at));
      last = at + href.length;
    }
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Answer({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let items: string[] = [];
  const flush = () => {
    if (para.length) blocks.push(<p key={blocks.length}>{inline(para.join("\n"))}</p>);
    if (items.length) {
      blocks.push(
        <ul key={blocks.length}>
          {items.map((it, i) => (
            <li key={i}>{inline(it)}</li>
          ))}
        </ul>,
      );
    }
    para = [];
    items = [];
  };
  for (const raw of text.split("\n")) {
    const line = raw.trimEnd();
    const heading = /^#{1,6}\s+(.*)$/.exec(line);
    const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);
    if (!line.trim()) {
      flush();
    } else if (heading) {
      flush();
      blocks.push(
        <p key={blocks.length} className="chat-h">
          {inline(heading[1].replace(/\*\*/g, ""))}
        </p>,
      );
    } else if (bullet) {
      if (para.length) flush();
      items.push(bullet[1]);
    } else {
      if (items.length) flush();
      para.push(line);
    }
  }
  flush();
  return <>{blocks}</>;
}

export default function ChatPanel({
  lang,
  open = true,
  onClose,
  variant = "panel",
}: {
  lang: Lang;
  open?: boolean;
  onClose?: () => void;
  variant?: "panel" | "page";
}) {
  const t = getChatCopy(lang);
  const history = useConversations();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [conv, setConv] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [model, setModel] = useState<ModelChoice>("auto");
  const [thinking, setThinking] = useState(false);
  const [view, setView] = useState<"chat" | "history">("chat");
  const [dropped, setDropped] = useState(false);
  const abort = useRef<AbortController | null>(null);
  /** Tăng mỗi khi đổi cuộc trò chuyện, để lượt hỏi đang chạy của cuộc cũ không ghi đè cuộc mới. */
  const generation = useRef(0);
  const busyRef = useRef(false);
  const field = useRef<HTMLTextAreaElement>(null);
  const log = useRef<HTMLDivElement>(null);

  function show(id: string | null, list: Msg[]) {
    generation.current++;
    abort.current?.abort();
    setConv(id);
    setMsgs(list);
    setView("chat");
    setActiveConversation(id);
  }

  // Mở khung chat thì hiện cuộc đang dở, có thể vừa được mở ở trang khác.
  useEffect(() => {
    if (!open || busyRef.current) return;
    const id = activeConversation();
    const found = id ? readConversation(id) : undefined;
    setConv(found ? found.id : null);
    setMsgs(found ? found.msgs : []);
    if (variant !== "page") return;
    // Câu hỏi gõ ở ô hỏi trang chủ: mở cuộc mới và gửi ngay.
    const q = takePendingQuestion();
    if (q) {
      show(null, []);
      void send(q, [], null);
    }
    // Chỉ chạy khi khung chat mở ra; `send` và `show` đọc trạng thái mới nhất qua ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, variant]);

  // Trên trang riêng ở màn hình hẹp không tự đặt con trỏ: bàn phím ảo sẽ che trang.
  useEffect(() => {
    if (!open || view !== "chat") return;
    if (variant === "panel" || window.matchMedia("(min-width: 1024px)").matches) field.current?.focus();
  }, [open, view, conv, variant]);

  useEffect(() => {
    const el = log.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs]);

  useEffect(() => {
    if (!open || !onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Đóng hẳn trang giữa chừng thì hủy luôn yêu cầu đang chạy.
  useEffect(() => () => abort.current?.abort(), []);

  async function send(text: string, base: Msg[] = msgs, current: string | null = conv) {
    const q = text.trim();
    if (!q || busyRef.current) return;
    const id = current ?? newConversationId();
    if (!current) {
      setConv(id);
      setActiveConversation(id);
    }
    const gen = generation.current;
    // Chỉ gửi lại những lượt hỏi đã có câu trả lời thật: lượt lỗi bị bỏ cả cặp.
    const sent = base
      .filter((m, i) => (m.role === "assistant" ? !m.error : base[i + 1] && !base[i + 1].error))
      .map(({ role, content }) => ({ role, content }));
    const asked: Msg[] = [...base, { role: "user", content: q }];
    let answer: Msg = { role: "assistant", content: "" };
    setMsgs([...asked, answer]);
    setDropped(saveConversation(id, asked));
    setInput("");
    setBusy(true);
    busyRef.current = true;
    const ctl = new AbortController();
    abort.current = ctl;
    const update = (patch: Partial<Msg>) => {
      answer = { ...answer, ...patch };
      if (generation.current !== gen) return;
      const shown = answer;
      setMsgs((cur) => [...cur.slice(0, -1), shown]);
    };

    let acc = "";
    let think = "";
    try {
      const device = chatDeviceId();
      const res = await fetch("/api/chat", {
        method: "POST",
        // Đăng nhập thì gửi kèm phiên, để máy chủ dùng lượt Pro đã mua khi hết lượt miễn phí.
        headers: {
          "Content-Type": "application/json",
          ...(device ? { "X-Chat-Client": device } : {}),
          ...(await authHeaders()),
        },
        body: JSON.stringify({ lang, messages: [...sent, { role: "user", content: q }], model, thinking }),
        signal: ctl.signal,
      });
      if (!res.ok || !res.body) {
        let code = "";
        try {
          code = String((await res.json()).error ?? "");
        } catch {
          code = "";
        }
        update({ content: errorText(t, code, res.status), error: true });
        return;
      }
      const skills = (res.headers.get("X-Chat-Skill") ?? "")
        .split(",")
        .filter((s): s is SkillId => s in t.skills);
      let served = res.headers.get("X-Chat-Model") ?? "";
      update({
        skills,
        model: served,
        auto: res.headers.has("X-Chat-Auto"),
        thinking: res.headers.has("X-Chat-Thinking"),
        limited: (res.headers.get("X-Chat-Limited") ?? "")
          .split(",")
          .filter((s): s is Limit => s in t.limited),
        credits: res.headers.has("X-Chat-Credits") ? Number(res.headers.get("X-Chat-Credits")) : undefined,
      });
      let cut: Cut | undefined;
      // Mỗi dòng là một sự kiện JSON; dòng có thể bị cắt giữa hai gói dữ liệu.
      const apply = (line: string) => {
        if (!line.trim()) return;
        try {
          const e = JSON.parse(line) as { t?: unknown; r?: unknown; m?: unknown; e?: unknown };
          if (typeof e.t === "string") acc += e.t;
          else if (typeof e.r === "string") think += e.r;
          else if (typeof e.m === "string") served = e.m;
          else if (typeof e.e === "string" && e.e in t.cut) cut = e.e as Cut;
        } catch {
          // Dòng hỏng: bỏ qua.
        }
      };
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        lines.forEach(apply);
        update({ content: acc, reasoning: think, model: served });
      }
      apply(buf + dec.decode());
      update(
        acc.trim()
          ? { content: acc, reasoning: think, model: served, cut }
          : { content: t.errors.empty, error: true },
      );
    } catch {
      if (ctl.signal.aborted) {
        // Người dùng bấm dừng hay đổi cuộc: giữ phần đã nhận.
        update(acc.trim() ? { content: acc } : { content: t.stopped, error: true });
      } else {
        // Mạng đứt giữa chừng: giữ phần đã nhận để viết tiếp được.
        update(acc.trim() ? { content: acc, cut: "cut" } : { content: t.errors.network, error: true });
      }
    } finally {
      // Cuộc trò chuyện bị xóa giữa chừng (xóa một cuộc, xóa toàn bộ) thì không
      // ghi lại: lượt hỏi bị hủy theo, nhưng khối này vẫn chạy sau lệnh xóa.
      if (generation.current === gen || readConversation(id)) saveConversation(id, [...asked, answer]);
      busyRef.current = false;
      setBusy(false);
      if (abort.current === ctl) abort.current = null;
    }
  }

  function startNew() {
    show(null, []);
    setDropped(false);
  }

  function openConversation(id: string) {
    const found = readConversation(id);
    if (found) show(found.id, found.msgs);
  }

  function remove(id: string) {
    deleteConversation(id);
    if (id === conv) show(null, []);
  }

  function clearAll() {
    if (!window.confirm(t.history.clearConfirm)) return;
    clearConversations();
    show(null, []);
  }

  const panel = variant === "panel";

  return (
    <section
      className={panel ? "chat-panel" : "chat-page"}
      data-view={view}
      role={panel ? "dialog" : undefined}
      aria-labelledby="chat-title"
      hidden={!open}
    >
      <header className="chat-head">
        {panel ? (
          <p id="chat-title" className="chat-title">
            {t.title} <span className="chat-badge">{t.badge}</span>
          </p>
        ) : (
          <h1 id="chat-title" className="chat-title">
            {t.page.title} <span className="chat-badge">{t.badge}</span>
          </h1>
        )}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="chat-icon-btn chat-hist-btn"
            aria-expanded={view === "history"}
            onClick={() => setView(view === "history" ? "chat" : "history")}
          >
            {t.history.button(history.length)}
          </button>
          {msgs.length > 0 && (
            <button type="button" className="chat-icon-btn" onClick={startNew}>
              {t.reset}
            </button>
          )}
          {onClose && (
            <button type="button" className="chat-icon-btn" onClick={onClose} aria-label={t.close}>
              <span aria-hidden="true">✕</span>
            </button>
          )}
        </div>
      </header>

      <div className="chat-body">
        <ChatHistory
          lang={lang}
          t={t}
          items={history}
          active={conv}
          onOpen={openConversation}
          onDelete={remove}
          onClear={clearAll}
          onNew={startNew}
        />

        <div className="chat-main">
          <div ref={log} className="chat-log thin-scroll" role="log" aria-live="polite" aria-busy={busy}>
            <p className="chat-notice">
              {t.notice}{" "}
              <Link href={`/${lang}/chinh-sach#rieng-tu`} className="link-sweep">
                {t.policy}
              </Link>
            </p>
            {dropped && <p className="chat-notice">{t.history.dropped}</p>}
            {msgs.length === 0 && (
              <div className="chat-intro">
                <p>{t.intro}</p>
                <ul>
                  {t.examples.map((ex) => (
                    <li key={ex}>
                      <button type="button" className="chip" onClick={() => send(ex)}>
                        {ex}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {msgs.map((m, i) =>
              m.role === "user" ? (
                <p key={i} className="chat-msg chat-user">
                  {m.content}
                </p>
              ) : (
                <div key={i} className={`chat-msg chat-bot${m.error ? " chat-error" : ""}`}>
                  {m.reasoning && !m.error && (
                    <details className="chat-think">
                      <summary>{m.content ? t.thinkingDone : t.thinkingNow}</summary>
                      <div className="chat-think-body">
                        <Answer text={m.reasoning} />
                      </div>
                    </details>
                  )}
                  {m.content ? <Answer text={m.content} /> : !m.reasoning && <p className="chat-wait">…</p>}
                  {m.content && !m.error && <p className="chat-ref">{t.reference}</p>}
                  {m.model && !m.error && (
                    <p className="chat-skill">
                      {[
                        `${t.modelPrefix}: ${modelName(t, m.model)}${m.auto ? ` (${t.autoTag})` : ""}`,
                        m.thinking ? t.thinking : "",
                        m.credits !== undefined ? t.credits(m.credits) : "",
                        m.skills?.length
                          ? `${t.skillPrefix}: ${m.skills
                              .filter((s) => s in t.skills)
                              .map((s) => t.skills[s])
                              .join(", ")}`
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  {!m.error &&
                    m.limited
                      ?.filter((l) => l in t.limited)
                      .map((l) => (
                        <p key={l} className="chat-skill">
                          {t.limited[l]}
                          {l === "pro" && ACCOUNTS_ENABLED && (
                            <>
                              {" "}
                              <Link href={`/${lang}/tai-khoan#nang-cap`} className="underline underline-offset-2">
                                {t.buyCredits}
                              </Link>
                            </>
                          )}
                        </p>
                      ))}
                  {m.cut && m.cut in t.cut && !m.error && (
                    <p className="chat-cut">
                      {t.cut[m.cut]}
                      {i === msgs.length - 1 && !busy && (
                        <>
                          {" "}
                          <button type="button" className="chip" onClick={() => send(t.moreText)}>
                            {t.more}
                          </button>
                        </>
                      )}
                    </p>
                  )}
                </div>
              ),
            )}
          </div>

          <div className="chat-opts">
            <label className="chat-opt">
              <span>{t.modelPrefix}</span>
              <select
                className="chat-select"
                value={model}
                disabled={busy}
                onChange={(e) => setModel(e.target.value as ModelChoice)}
              >
                <option value="auto">{t.auto}</option>
                {(["gemini", "openrouter"] as const).map((p) => (
                  <optgroup key={p} label={p === "gemini" ? t.groupGemini : t.groupFree}>
                    {MODELS.filter((m) => m.provider === p && pickable(m.id)).map((m) => (
                      <option key={m.id} value={m.id}>
                        {`${modelName(t, m.id)}${t.modelHints[m.id] ? ` · ${t.modelHints[m.id]}` : ""}`}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            <label className="chat-opt">
              <input
                type="checkbox"
                checked={thinking}
                disabled={busy}
                onChange={(e) => setThinking(e.target.checked)}
              />
              <span>{t.thinking}</span>
            </label>
            {model === PRO && <p className="chat-hint">{t.proNote}</p>}
            {model !== "auto" && providerOf(model) === "openrouter" && <p className="chat-hint">{t.freeNote}</p>}
          </div>

          <form
            className="chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <textarea
              ref={field}
              className="chat-input"
              rows={2}
              maxLength={MAX_CHARS}
              value={input}
              placeholder={t.placeholder}
              aria-label={t.placeholder}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send(input);
                }
              }}
            />
            {busy ? (
              <button type="button" className="btn btn-quiet btn-sm" onClick={() => abort.current?.abort()}>
                {t.stop}
              </button>
            ) : (
              <button type="submit" className="btn btn-solid btn-sm" disabled={!input.trim()}>
                {t.send}
              </button>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
