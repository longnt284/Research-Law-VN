"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

import type { Lang } from "@/data/types";
import { getChatCopy, type ChatCopy } from "@/i18n/chat";
import { FREE_ROUTER, MODELS, modelLabel, PRO, providerOf, type ModelChoice } from "@/lib/chat/models";
import type { SkillId } from "@/lib/chat/skills";

/**
 * Khung trò chuyện của trợ lý hỏi đáp.
 *
 * Cuộc trò chuyện chỉ nằm trong bộ nhớ của trang: mỗi lượt hỏi gửi lại cả phần
 * trước lên `/api/chat`, máy chủ không giữ gì. Câu trả lời chảy về dạng NDJSON
 * (chữ trả lời, chữ suy luận, tên model, báo câu trả lời chưa trọn) và được
 * dựng thành phần tử React, không qua `dangerouslySetInnerHTML`, nên chữ của mô
 * hình không bao giờ chạy được như mã.
 */

const MAX_CHARS = 6000;

type Cut = keyof ChatCopy["cut"];
type Limit = keyof ChatCopy["limited"];

interface Msg {
  role: "user" | "assistant";
  content: string;
  skills?: SkillId[];
  /** Mã model đã trả lời. */
  model?: string;
  /** Model do trang tự chọn theo độ khó. */
  auto?: boolean;
  thinking?: boolean;
  /** Các hạn mức đã hết trong ngày, khiến câu hỏi chạy bằng model khác. */
  limited?: Limit[];
  /** Câu trả lời chưa trọn và lý do. */
  cut?: Cut;
  /** Bản tóm tắt suy luận của mô hình; không gửi lại lên máy chủ. */
  reasoning?: string;
  /** Thông báo lỗi hiện ở chỗ câu trả lời; không gửi lại lên máy chủ. */
  error?: boolean;
}

function modelName(t: ChatCopy, id: string): string {
  return id === FREE_ROUTER ? t.freeModel : modelLabel(id);
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
  open,
  onClose,
}: {
  lang: Lang;
  open: boolean;
  onClose: () => void;
}) {
  const t = getChatCopy(lang);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [model, setModel] = useState<ModelChoice>("auto");
  const [thinking, setThinking] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  const log = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) field.current?.focus();
  }, [open]);

  useEffect(() => {
    const el = log.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Đóng hẳn trang giữa chừng thì hủy luôn yêu cầu đang chạy.
  useEffect(() => () => abort.current?.abort(), []);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    // Chỉ gửi lại những lượt hỏi đã có câu trả lời thật: lượt lỗi bị bỏ cả cặp.
    const history = msgs
      .filter((m, i) => (m.role === "assistant" ? !m.error : msgs[i + 1] && !msgs[i + 1].error))
      .map(({ role, content }) => ({ role, content }));
    setMsgs([...msgs, { role: "user", content: q }, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    const ctl = new AbortController();
    abort.current = ctl;
    const update = (patch: Partial<Msg>) =>
      setMsgs((cur) => [...cur.slice(0, -1), { ...cur[cur.length - 1], ...patch }]);

    let acc = "";
    let think = "";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang, messages: [...history, { role: "user", content: q }], model, thinking }),
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
        // Người dùng bấm dừng: giữ phần đã nhận.
        update(acc.trim() ? { content: acc } : { content: t.stopped, error: true });
      } else {
        // Mạng đứt giữa chừng: giữ phần đã nhận để viết tiếp được.
        update(acc.trim() ? { content: acc, cut: "cut" } : { content: t.errors.network, error: true });
      }
    } finally {
      setBusy(false);
      abort.current = null;
    }
  }

  function reset() {
    abort.current?.abort();
    setMsgs([]);
    field.current?.focus();
  }

  return (
    <section
      className="chat-panel"
      role="dialog"
      aria-labelledby="chat-title"
      hidden={!open}
    >
      <header className="chat-head">
        <p id="chat-title" className="chat-title">
          {t.title} <span className="chat-badge">{t.badge}</span>
        </p>
        <div className="flex items-center gap-1">
          {msgs.length > 0 && (
            <button type="button" className="chat-icon-btn" onClick={reset}>
              {t.reset}
            </button>
          )}
          <button type="button" className="chat-icon-btn" onClick={onClose} aria-label={t.close}>
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      </header>

      <div ref={log} className="chat-log thin-scroll" role="log" aria-live="polite" aria-busy={busy}>
        <p className="chat-notice">
          {t.notice}{" "}
          <Link href={`/${lang}/chinh-sach#rieng-tu`} className="link-sweep">
            {t.policy}
          </Link>
        </p>
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
                    m.skills?.length ? `${t.skillPrefix}: ${m.skills.map((s) => t.skills[s]).join(", ")}` : "",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
              {!m.error &&
                m.limited?.map((l) => (
                  <p key={l} className="chat-skill">
                    {t.limited[l]}
                  </p>
                ))}
              {m.cut && !m.error && (
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
                {MODELS.filter((m) => m.provider === p).map((m) => (
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
    </section>
  );
}
