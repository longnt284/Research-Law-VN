import { MODELS } from "@/lib/chat/models";

/**
 * Gọi mô hình ngôn ngữ qua giao thức chat completions kiểu OpenAI.
 *
 * Gemini và OpenRouter đều nhận cùng dạng yêu cầu này. Có hai chỗ: nhà cung cấp
 * chính (`CHAT_API_BASE`, `CHAT_API_KEY`, là Gemini API) chạy các model trong
 * `models.ts`, và nhà cung cấp dự phòng (`CHAT_FALLBACK_*`, là OpenRouter).
 * `CHAT_FALLBACK_MODEL` là một model hoặc nhiều model cách nhau bằng dấu phẩy,
 * thử theo thứ tự; `openrouter/free` là một model miễn phí chọn ngẫu nhiên.
 * Model nào từ chối (hết lượt, quá tải, không trả lời kịp) thì câu hỏi chuyển
 * sang model kế tiếp, cuối cùng là nhà cung cấp dự phòng. Đã nhận chữ rồi thì
 * không chuyển nữa, để người đọc không thấy hai câu trả lời nối nhau.
 */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Một dòng của luồng trả về trình duyệt, dạng NDJSON: `t` là chữ của câu trả
 * lời, `r` là chữ của phần suy luận, `m` là mã model thật sự trả lời (chỉ gửi
 * khi nhà cung cấp là bộ định tuyến, như `openrouter/free`).
 */
export type ChatEvent = { t: string } | { r: string } | { m: string };

interface Provider {
  base: string;
  key: string;
  model: string;
  /** Model của nhà cung cấp chính, là model được nghỉ khi hết lượt. */
  primary: boolean;
}

/** Giới hạn độ dài câu trả lời, tính cả bước suy luận của mô hình. */
const MAX_TOKENS = 8192;
const MAX_TOKENS_THINKING = 32_768;
/** Thời gian chờ tối đa tới khi nhà cung cấp trả phần đầu câu trả lời. */
const FIRST_BYTE_MS = 25_000;

const GEMINI_HOST = "generativelanguage.googleapis.com";
const OPENROUTER_HOST = "openrouter.ai";

function providers(models: readonly string[]): Provider[] {
  const env = process.env;
  const fallback = (env.CHAT_FALLBACK_MODEL ?? "").split(",");
  return [
    ...models.map((model) => ({ base: env.CHAT_API_BASE, key: env.CHAT_API_KEY, model, primary: true })),
    ...fallback.map((model) => ({
      base: env.CHAT_FALLBACK_API_BASE,
      key: env.CHAT_FALLBACK_API_KEY,
      model,
      primary: false,
    })),
  ]
    .filter((p): p is Provider => !!(p.base?.trim() && p.key?.trim() && p.model?.trim()))
    .map((p) => ({ ...p, base: p.base.trim().replace(/\/+$/, ""), key: p.key.trim(), model: p.model.trim() }))
    .filter((p) => URL.canParse(p.base));
}

/*
  Model của nhà cung cấp chính đã trả 429 (hết lượt) được nghỉ tới hết thời gian
  chờ mà nhà cung cấp báo (header Retry-After, hoặc trường retryDelay trong lỗi
  của Gemini), mặc định một phút, tối đa một giờ. Trong lúc nghỉ, câu hỏi đi
  thẳng sang model kế tiếp hoặc nhà cung cấp dự phòng thay vì hỏi lại rồi nhận
  cùng lỗi. Model dự phòng không nghỉ, vì là chốt cuối và `openrouter/free` mỗi
  lần chọn một model khác. Bảng nằm trong bộ nhớ của từng phiên bản serverless,
  như giới hạn lượt ở route.
*/
const REST_MS = 60_000;
const MAX_REST_MS = 3_600_000;
const resting = new Map<string, number>();

function restMs(res: Response, body: string): number {
  const header = Number(res.headers.get("retry-after"));
  const delay = /"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/.exec(body);
  const ms = header > 0 ? header * 1000 : delay ? Number(delay[1]) * 1000 : REST_MS;
  return Math.min(Math.max(ms, 1000), MAX_REST_MS);
}

export function chatConfigured(): boolean {
  return providers(MODELS.map((m) => m.id)).length > 0;
}

/*
  Tham số suy luận riêng của từng nhà cung cấp. Gemini: chế độ thường đặt mức
  suy luận thấp cho nhanh; chế độ suy luận mở rộng đặt mức cao và xin bản tóm
  tắt suy luận qua `extra_body.google.thinking_config`. OpenRouter: chỉ gửi
  `reasoning` khi bật suy luận mở rộng; `openrouter/free` khi đó chỉ chọn trong
  các model có suy luận.
*/
function reasoningParams(host: string, thinking: boolean): Record<string, unknown> {
  if (host === GEMINI_HOST) {
    return thinking
      ? { extra_body: { google: { thinking_config: { thinking_level: "high", include_thoughts: true } } } }
      : { reasoning_effort: "low" };
  }
  if (host === OPENROUTER_HOST && thinking) return { reasoning: { effort: "high" } };
  return {};
}

export interface ChatStream {
  body: ReadableStream<Uint8Array>;
  /** Mã model của nhà cung cấp đã nhận yêu cầu. */
  model: string;
}

/**
 * Luồng NDJSON của câu trả lời, từ model đầu tiên nhận yêu cầu trong `models`,
 * rồi tới nhà cung cấp dự phòng. `null` khi tất cả đều từ chối. Nhật ký chỉ ghi
 * tên máy chủ, mã model và mã lỗi, không ghi nội dung câu hỏi.
 */
export async function streamChat(
  system: string,
  messages: ChatMessage[],
  opts: { models: readonly string[]; thinking: boolean },
  signal: AbortSignal,
): Promise<ChatStream | null> {
  for (const p of providers(opts.models)) {
    if (p.primary && (resting.get(p.model) ?? 0) > Date.now()) continue;
    const host = new URL(p.base).host;
    // Hẹn giờ chỉ áp cho tới khi có phản hồi; phần chữ chảy về sau đó được phép
    // dài hơn. Người đọc đóng khung chat thì hủy luôn yêu cầu lên nhà cung cấp.
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), FIRST_BYTE_MS);
    const cancel = () => ctl.abort();
    signal.addEventListener("abort", cancel, { once: true });
    try {
      const res = await fetch(`${p.base}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.key}` },
        body: JSON.stringify({
          model: p.model,
          stream: true,
          max_tokens: opts.thinking ? MAX_TOKENS_THINKING : MAX_TOKENS,
          messages: [{ role: "system", content: system }, ...messages],
          ...reasoningParams(host, opts.thinking),
        }),
        signal: ctl.signal,
      });
      if (res.ok && res.body) {
        return { body: res.body.pipeThrough(sseToEvents(p.model.startsWith("openrouter/"))), model: p.model };
      }
      console.warn(`chat: ${host} ${p.model} trả ${res.status}`);
      if (res.status === 429 && p.primary) {
        const ms = restMs(res, await res.text());
        resting.set(p.model, Date.now() + ms);
        console.warn(`chat: ${p.model} nghỉ ${Math.round(ms / 1000)} giây`);
      } else {
        await res.body?.cancel();
      }
    } catch (e) {
      console.warn(`chat: ${host} ${p.model} lỗi ${e instanceof Error ? e.name : "không rõ"}`);
    } finally {
      clearTimeout(timer);
    }
    if (signal.aborted) return null;
  }
  return null;
}

/*
  Gemini qua cổng tương thích OpenAI trả bản tóm tắt suy luận ngay trong
  `content`, bọc trong thẻ <thought>…</thought>. Thẻ có thể bị cắt giữa hai gói
  dữ liệu, nên phần đuôi có thể là đầu của một thẻ được giữ lại chờ gói sau.
*/
function thoughtSplitter() {
  let inside = false;
  let held = "";
  const piece = (s: string): ChatEvent => (inside ? { r: s } : { t: s });
  return {
    push(chunk: string): ChatEvent[] {
      const out: ChatEvent[] = [];
      let s = held + chunk;
      held = "";
      for (;;) {
        const tag = inside ? "</thought>" : "<thought>";
        const at = s.indexOf(tag);
        if (at < 0) {
          let keep = Math.min(tag.length - 1, s.length);
          while (keep > 0 && !tag.startsWith(s.slice(-keep))) keep--;
          held = s.slice(s.length - keep);
          if (s.length > keep) out.push(piece(s.slice(0, s.length - keep)));
          return out;
        }
        if (at > 0) out.push(piece(s.slice(0, at)));
        s = s.slice(at + tag.length);
        inside = !inside;
      }
    },
    end(): ChatEvent[] {
      return held ? [piece(held)] : [];
    },
  };
}

/**
 * Chuyển luồng server-sent events thành NDJSON: chữ trả lời từ `delta.content`,
 * suy luận từ `delta.reasoning` (OpenRouter), `delta.reasoning_content` hoặc
 * thẻ <thought> (Gemini). Một dòng có thể bị cắt giữa hai gói dữ liệu, nên phần
 * dở dang được giữ lại chờ gói sau.
 */
function sseToEvents(reportModel: boolean): TransformStream<Uint8Array, Uint8Array> {
  const dec = new TextDecoder();
  const enc = new TextEncoder();
  const thoughts = thoughtSplitter();
  let buf = "";
  let modelSent = !reportModel;
  const send = (out: TransformStreamDefaultController<Uint8Array>, events: ChatEvent[]) => {
    for (const e of events) out.enqueue(enc.encode(`${JSON.stringify(e)}\n`));
  };
  const emit = (line: string, out: TransformStreamDefaultController<Uint8Array>) => {
    const t = line.trim();
    if (!t.startsWith("data:")) return;
    const data = t.slice(5).trim();
    if (data === "[DONE]") return;
    let json;
    try {
      json = JSON.parse(data);
    } catch {
      return; // Dòng không phải JSON: bỏ qua.
    }
    if (!modelSent && typeof json?.model === "string" && json.model) {
      send(out, [{ m: json.model }]);
      modelSent = true;
    }
    const delta = json?.choices?.[0]?.delta;
    const reasoning = delta?.reasoning ?? delta?.reasoning_content;
    if (typeof reasoning === "string" && reasoning) send(out, [{ r: reasoning }]);
    const text = delta?.content;
    if (typeof text !== "string" || !text) return;
    if (delta?.extra_content?.google?.thought === true) send(out, [{ r: text }]);
    else send(out, thoughts.push(text));
  };
  return new TransformStream({
    transform(chunk, out) {
      buf += dec.decode(chunk, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) emit(line, out);
    },
    flush(out) {
      emit(buf + dec.decode(), out);
      send(out, thoughts.end());
    },
  });
}
