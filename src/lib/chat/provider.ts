import { FREE_ROUTER, maxOutOf, MODELS, providerOf } from "@/lib/chat/models";

/**
 * Gọi mô hình ngôn ngữ qua giao thức chat completions kiểu OpenAI.
 *
 * Gemini và OpenRouter đều nhận cùng dạng yêu cầu này. Model Gemini trong
 * `models.ts` chạy qua `CHAT_API_BASE`, `CHAT_API_KEY` (Gemini API); model
 * OpenRouter trong `models.ts` và các model dự phòng chạy qua `CHAT_FALLBACK_*`
 * (OpenRouter). `CHAT_FALLBACK_MODEL` là một model hoặc nhiều model cách nhau
 * bằng dấu phẩy, thử sau cùng theo thứ tự; `openrouter/free` là một model miễn
 * phí chọn ngẫu nhiên. Model nào từ chối (hết lượt, quá tải, không trả lời kịp)
 * thì câu hỏi chuyển sang model kế tiếp. Đã nhận chữ rồi thì không chuyển nữa,
 * để người đọc không thấy hai câu trả lời nối nhau.
 *
 * Câu trả lời dừng vì chạm trần độ dài thì được viết tiếp bằng chính model đó,
 * tối đa `MAX_CONTINUE` lần, trong giới hạn thời gian của route.
 *
 * Việc chuyển model có ngân sách thời gian chung (`FAILOVER_MS`): hết ngân sách
 * mà chưa model nào nhận thì `streamChat` trả `null` để route trả lời bằng tra
 * cứu tự động, thay vì để người hỏi chờ cả chuỗi model.
 */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Một dòng của luồng trả về trình duyệt, dạng NDJSON: `t` là chữ của câu trả
 * lời, `r` là chữ của phần suy luận, `m` là mã model thật sự trả lời (chỉ gửi
 * khi nhà cung cấp là bộ định tuyến, như `openrouter/free`), `e` báo câu trả
 * lời chưa trọn: `length` chạm trần độ dài, `time` hết thời gian, `cut` luồng
 * bị ngắt hay bị dừng giữa chừng.
 */
export type ChatEvent = { t: string } | { r: string } | { m: string } | { e: Cut };
type Cut = "length" | "time" | "cut";
type End = "stop" | Cut;

interface Provider {
  base: string;
  key: string;
  model: string;
}

/** Giới hạn độ dài câu trả lời, tính cả bước suy luận của mô hình. */
const MAX_TOKENS = 32_768;
const MAX_TOKENS_THINKING = 65_536;
/**
 * Thời gian chờ tối đa tới khi nhà cung cấp trả phần đầu câu trả lời: model
 * đầu tiên, và các model dự phòng sau đó. Tổng thời gian chuyển model không
 * vượt `FAILOVER_MS`.
 */
const FIRST_BYTE_MS = 25_000;
const RETRY_FIRST_BYTE_MS = 12_000;
const FAILOVER_MS = 40_000;
/** Số lần viết tiếp tối đa, và thời gian còn lại tối thiểu để viết tiếp. */
const MAX_CONTINUE = 2;
const CONTINUE_MIN_MS = 30_000;
const CONTINUE_PROMPT =
  "Câu trả lời trên bị cắt vì chạm giới hạn độ dài. Viết tiếp ngay từ chữ cuối cùng, không lặp lại, không mở đầu lại, không nhắc tới việc bị cắt. (The answer above was cut off at the length limit. Continue from the last word without repeating or restarting.)";

const GEMINI_HOST = "generativelanguage.googleapis.com";
const OPENROUTER_HOST = "openrouter.ai";

function providers(models: readonly string[]): Provider[] {
  const env = process.env;
  const fallback = (env.CHAT_FALLBACK_MODEL ?? "").split(",").map((m) => m.trim());
  const seen = new Set<string>();
  return [...models, ...fallback]
    .filter((model) => model && !seen.has(model) && !!seen.add(model))
    .map((model) =>
      providerOf(model) === "gemini"
        ? { base: env.CHAT_API_BASE, key: env.CHAT_API_KEY, model }
        : { base: env.CHAT_FALLBACK_API_BASE, key: env.CHAT_FALLBACK_API_KEY, model },
    )
    .filter((p): p is Provider => !!(p.base?.trim() && p.key?.trim()))
    .map((p) => ({ ...p, base: p.base.trim().replace(/\/+$/, ""), key: p.key.trim() }))
    .filter((p) => URL.canParse(p.base));
}

/*
  Model đã trả 429 (hết lượt) được nghỉ tới hết thời gian chờ mà nhà cung cấp
  báo (header Retry-After, hoặc trường retryDelay trong lỗi của Gemini), mặc
  định một phút, tối đa một giờ. Trong lúc nghỉ, câu hỏi đi thẳng sang model kế
  tiếp thay vì hỏi lại rồi nhận cùng lỗi. `openrouter/free` không nghỉ vì 429,
  vì mỗi lần nó chọn một model khác.

  Lỗi không tự hết sau vài giây thì nghỉ lâu hơn: khóa sai hay bị thu hồi (401,
  hay 400 kèm lời báo về khóa) và tài khoản hết tiền (402) làm nghỉ cả nhà cung
  cấp 15 phút; model bị từ chối quyền (403) nghỉ 15 phút; model không còn (404)
  nghỉ một giờ. Bảng nằm trong bộ nhớ của từng phiên bản serverless, như giới
  hạn lượt ở route.
*/
const REST_MS = 60_000;
const MAX_REST_MS = 3_600_000;
const AUTH_REST_MS = 900_000;
const GONE_REST_MS = 3_600_000;
const resting = new Map<string, number>();
/** Khóa nghỉ của cả một nhà cung cấp, để không trùng mã model nào. */
const hostKey = (host: string) => `@${host}`;

function isResting(p: Provider, now: number): boolean {
  return (resting.get(p.model) ?? 0) > now || (resting.get(hostKey(new URL(p.base).host)) ?? 0) > now;
}

function rest(key: string, ms: number) {
  resting.set(key, Date.now() + ms);
  console.warn(`chat: ${key} nghỉ ${Math.round(ms / 1000)} giây`);
}

function restMs(res: Response, body: string): number {
  const header = Number(res.headers.get("retry-after"));
  const delay = /"retryDelay"\s*:\s*"(\d+(?:\.\d+)?)s"/.exec(body);
  const ms = header > 0 ? header * 1000 : delay ? Number(delay[1]) * 1000 : REST_MS;
  return Math.min(Math.max(ms, 1000), MAX_REST_MS);
}

/** Cho model, hay cả nhà cung cấp, nghỉ theo mã lỗi. */
function restAfter(p: Provider, host: string, res: Response, body: string) {
  const s = res.status;
  if (s === 401 || s === 402 || (s === 400 && /api.?key/i.test(body))) rest(hostKey(host), AUTH_REST_MS);
  else if (s === 403) rest(p.model, AUTH_REST_MS);
  else if (s === 404) rest(p.model, GONE_REST_MS);
  else if (s === 429 && p.model !== FREE_ROUTER) rest(p.model, restMs(res, body));
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

interface Ask {
  system: string;
  messages: ChatMessage[];
  thinking: boolean;
  /** Mốc thời gian (ms) phải đóng luồng, để kịp trước giới hạn của route. */
  deadline: number;
  signal: AbortSignal;
}

/** Số token nhà cung cấp báo trong gói cuối của luồng, khi có. */
interface Usage {
  input?: number;
  cached?: number;
  output?: number;
}

/**
 * Gửi một yêu cầu và chờ phản hồi đầu tiên tối đa `wait` ms. `null` khi nhà
 * cung cấp từ chối. Nhật ký chỉ ghi tên máy chủ, mã model và mã lỗi, không ghi
 * nội dung câu hỏi.
 */
async function open(p: Provider, ask: Ask, wait = FIRST_BYTE_MS): Promise<ReadableStream<Uint8Array> | null> {
  const host = new URL(p.base).host;
  // Hẹn giờ chỉ áp cho tới khi có phản hồi; phần chữ chảy về sau đó được phép
  // dài hơn. Người đọc đóng khung chat thì hủy luôn yêu cầu lên nhà cung cấp.
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), Math.min(wait, ask.deadline - Date.now()));
  const cancel = () => ctl.abort();
  ask.signal.addEventListener("abort", cancel, { once: true });
  const wanted = ask.thinking ? MAX_TOKENS_THINKING : MAX_TOKENS;
  try {
    const res = await fetch(`${p.base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${p.key}` },
      body: JSON.stringify({
        model: p.model,
        stream: true,
        max_tokens: Math.min(maxOutOf(p.model), wanted),
        messages: [{ role: "system", content: ask.system }, ...ask.messages],
        ...reasoningParams(host, ask.thinking),
      }),
      signal: ctl.signal,
    });
    if (res.ok && res.body) return res.body;
    console.warn(`chat: ${host} ${p.model} trả ${res.status}`);
    restAfter(p, host, res, await res.text().catch(() => ""));
  } catch (e) {
    console.warn(`chat: ${host} ${p.model} lỗi ${e instanceof Error ? e.name : "không rõ"}`);
  } finally {
    clearTimeout(timer);
  }
  return null;
}

/**
 * Luồng NDJSON của câu trả lời, từ model đầu tiên nhận yêu cầu trong `models`,
 * rồi tới các model dự phòng. `null` khi tất cả đều từ chối.
 */
export async function streamChat(
  system: string,
  messages: ChatMessage[],
  opts: { models: readonly string[]; thinking: boolean; deadline: number },
  signal: AbortSignal,
): Promise<ChatStream | null> {
  const ask: Ask = { system, messages, thinking: opts.thinking, deadline: opts.deadline, signal };
  const giveUp = Math.min(Date.now() + FAILOVER_MS, opts.deadline);
  let tries = 0;
  for (const p of providers(opts.models)) {
    if (isResting(p, Date.now())) continue;
    const wait = Math.min(tries === 0 ? FIRST_BYTE_MS : RETRY_FIRST_BYTE_MS, giveUp - Date.now());
    if (wait < 1000) break;
    tries++;
    const body = await open(p, ask, wait);
    if (body) return { body: toStream(answer(p, body, ask)), model: p.model };
    if (signal.aborted) return null;
  }
  return null;
}

/**
 * Các sự kiện của câu trả lời. Chạm trần độ dài thì gửi lại cuộc trò chuyện kèm
 * phần đã viết, xin viết tiếp; `openrouter/free` thì viết tiếp bằng model thật
 * nó đã chọn. Câu trả lời vẫn chưa trọn khi kết thúc thì báo `e`.
 */
async function* answer(p: Provider, first: ReadableStream<Uint8Array>, ask: Ask): AsyncGenerator<ChatEvent> {
  const started = Date.now();
  const usage: Usage = {};
  let body = first;
  let text = "";
  let served = "";
  let end: End = "cut";
  try {
    for (let round = 0; ; round++) {
      const it = relay(body, ask.deadline, p.model === FREE_ROUTER && round === 0, usage);
      try {
        let r = await it.next();
        for (; !r.done; r = await it.next()) {
          if ("t" in r.value) text += r.value.t;
          if ("m" in r.value) served = r.value.m;
          yield r.value;
        }
        end = r.value;
      } finally {
        // Trình duyệt hủy giữa chừng thì đóng cả lượt đọc đang dở.
        await it.return("cut");
      }
      if (end === "stop") return;
      if (end === "length" && round < MAX_CONTINUE && text.trim() && ask.deadline - Date.now() > CONTINUE_MIN_MS) {
        const next = await open(served ? { ...p, model: served } : p, {
          ...ask,
          messages: [...ask.messages, { role: "assistant", content: text }, { role: "user", content: CONTINUE_PROMPT }],
        });
        if (next) {
          body = next;
          continue;
        }
      }
      yield { e: end };
      return;
    }
  } finally {
    logAnswer(p.model, served, end, ask, usage, text.length, Date.now() - started);
  }
}

/**
 * Một dòng JSON mỗi câu trả lời cho Vercel Logs, để đo token và chi phí thật:
 * model nhận yêu cầu, model thật trả lời, cách kết thúc, số ký tự đã gửi và đã
 * nhận, số token nhà cung cấp báo (vào, trúng bộ nhớ đệm, ra), thời gian. Không
 * ghi nội dung câu hỏi hay câu trả lời.
 */
function logAnswer(model: string, served: string, end: End, ask: Ask, usage: Usage, outChars: number, ms: number) {
  const inChars = ask.system.length + ask.messages.reduce((n, m) => n + m.content.length, 0);
  console.info(
    JSON.stringify({
      scope: "chat",
      event: "answer",
      model,
      served: served || model,
      end,
      thinking: ask.thinking,
      inChars,
      outChars,
      ...usage,
      ms,
    }),
  );
}

/** Chuyển chuỗi sự kiện thành luồng NDJSON; trình duyệt hủy thì dừng chuỗi. */
function toStream(events: AsyncGenerator<ChatEvent>): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  return new ReadableStream({
    async pull(out) {
      try {
        const r = await events.next();
        if (r.done) out.close();
        else out.enqueue(enc.encode(`${JSON.stringify(r.value)}\n`));
      } catch (e) {
        console.warn(`chat: luồng lỗi ${e instanceof Error ? e.name : "không rõ"}`);
        out.enqueue(enc.encode(`${JSON.stringify({ e: "cut" })}\n`));
        out.close();
      }
    },
    async cancel() {
      await events.return(undefined);
    },
  });
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
 * Đọc luồng server-sent events của một lượt gọi: chữ trả lời từ `delta.content`,
 * suy luận từ `delta.reasoning` (OpenRouter), `delta.reasoning_content` hoặc
 * thẻ <thought> (Gemini). Một dòng có thể bị cắt giữa hai gói dữ liệu, nên phần
 * dở dang được giữ lại chờ gói sau. Trả về lý do kết thúc: `finish_reason` của
 * nhà cung cấp, `time` khi tới hạn chót, `cut` khi luồng đứt mà không có
 * `finish_reason` hay `[DONE]`. Số token trong trường `usage` (thường ở gói cuối)
 * được cộng dồn vào `usage`.
 */
async function* relay(
  body: ReadableStream<Uint8Array>,
  deadline: number,
  reportModel: boolean,
  usage: Usage,
): AsyncGenerator<ChatEvent, End> {
  const reader = body.getReader();
  const dec = new TextDecoder();
  const thoughts = thoughtSplitter();
  let buf = "";
  let finish = "";
  let done = false;
  let modelSent = !reportModel;
  const parse = (line: string): ChatEvent[] => {
    const t = line.trim();
    if (!t.startsWith("data:")) return [];
    const data = t.slice(5).trim();
    if (data === "[DONE]") {
      done = true;
      return [];
    }
    let json;
    try {
      json = JSON.parse(data);
    } catch {
      return []; // Dòng không phải JSON: bỏ qua.
    }
    const out: ChatEvent[] = [];
    const u = json?.usage;
    if (u && typeof u === "object") {
      const add = (k: keyof Usage, v: unknown) => {
        if (typeof v === "number" && v >= 0) usage[k] = (usage[k] ?? 0) + v;
      };
      add("input", u.prompt_tokens);
      add("cached", u.prompt_tokens_details?.cached_tokens);
      add("output", u.completion_tokens);
    }
    if (!modelSent && typeof json?.model === "string" && json.model) {
      out.push({ m: json.model });
      modelSent = true;
    }
    const choice = json?.choices?.[0];
    if (typeof choice?.finish_reason === "string" && choice.finish_reason) finish = choice.finish_reason;
    const delta = choice?.delta;
    const reasoning = delta?.reasoning ?? delta?.reasoning_content;
    if (typeof reasoning === "string" && reasoning) out.push({ r: reasoning });
    const text = delta?.content;
    if (typeof text !== "string" || !text) return out;
    if (delta?.extra_content?.google?.thought === true) out.push({ r: text });
    else out.push(...thoughts.push(text));
    return out;
  };
  try {
    for (;;) {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const late = new Promise<"time">((resolve) => {
        timer = setTimeout(() => resolve("time"), Math.max(deadline - Date.now(), 0));
      });
      let chunk: ReadableStreamReadResult<Uint8Array> | "time";
      try {
        chunk = await Promise.race([reader.read(), late]);
      } catch {
        chunk = { done: true, value: undefined };
      } finally {
        clearTimeout(timer);
      }
      if (chunk === "time") {
        yield* thoughts.end();
        return "time";
      }
      if (chunk.done) break;
      buf += dec.decode(chunk.value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) yield* parse(line);
    }
    yield* parse(buf + dec.decode());
    yield* thoughts.end();
    if (finish === "length") return "length";
    if (finish === "content_filter" || finish === "error") return "cut";
    return finish || done ? "stop" : "cut";
  } finally {
    // Dừng sớm (hết giờ, trình duyệt hủy) thì đóng luôn kết nối lên nhà cung cấp.
    reader.cancel().catch(() => {});
  }
}
