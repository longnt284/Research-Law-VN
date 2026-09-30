/**
 * Gọi mô hình ngôn ngữ qua giao thức chat completions kiểu OpenAI.
 *
 * Gemini, OpenRouter, NVIDIA, Groq đều nhận cùng dạng yêu cầu này, nên đổi nhà
 * cung cấp chỉ là đổi biến môi trường. Có hai chỗ: nhà cung cấp chính
 * (`CHAT_API_*`) và nhà cung cấp dự phòng (`CHAT_FALLBACK_*`). Gói miễn phí nào
 * cũng có hạn mức theo ngày; khi nhà cung cấp chính từ chối (hết lượt, quá tải,
 * không trả lời kịp) thì câu hỏi chuyển sang nhà cung cấp dự phòng. Đã nhận chữ
 * rồi thì không chuyển nữa, để người đọc không thấy hai câu trả lời nối nhau.
 */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Provider {
  base: string;
  key: string;
  model: string;
}

/** Giới hạn độ dài câu trả lời. Mô hình có bước suy luận cũng tính vào đây. */
const MAX_TOKENS = 4096;
/** Thời gian chờ tối đa tới khi nhà cung cấp trả phần đầu câu trả lời. */
const FIRST_BYTE_MS = 25_000;

function providers(): Provider[] {
  const env = process.env;
  return [
    { base: env.CHAT_API_BASE, key: env.CHAT_API_KEY, model: env.CHAT_MODEL },
    { base: env.CHAT_FALLBACK_API_BASE, key: env.CHAT_FALLBACK_API_KEY, model: env.CHAT_FALLBACK_MODEL },
  ]
    .filter((p): p is Provider => !!(p.base?.trim() && p.key?.trim() && p.model?.trim()))
    .map((p) => ({ base: p.base.trim().replace(/\/+$/, ""), key: p.key.trim(), model: p.model.trim() }))
    .filter((p) => URL.canParse(p.base));
}

export function chatConfigured(): boolean {
  return providers().length > 0;
}

/**
 * Luồng chữ của câu trả lời, từ nhà cung cấp đầu tiên nhận yêu cầu. `null` khi
 * mọi nhà cung cấp đều từ chối. Nhật ký chỉ ghi tên máy chủ và mã lỗi, không
 * ghi nội dung câu hỏi.
 */
export async function streamChat(
  system: string,
  messages: ChatMessage[],
  signal: AbortSignal,
): Promise<ReadableStream<Uint8Array> | null> {
  for (const p of providers()) {
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
          max_tokens: MAX_TOKENS,
          messages: [{ role: "system", content: system }, ...messages],
        }),
        signal: ctl.signal,
      });
      if (res.ok && res.body) return res.body.pipeThrough(sseToText());
      console.warn(`chat: ${host} trả ${res.status}`);
      await res.body?.cancel();
    } catch (e) {
      console.warn(`chat: ${host} lỗi ${e instanceof Error ? e.name : "không rõ"}`);
    } finally {
      clearTimeout(timer);
    }
    if (signal.aborted) return null;
  }
  return null;
}

/**
 * Chuyển luồng server-sent events thành chữ thuần: chỉ lấy `delta.content`, bỏ
 * phần suy luận và dòng chú thích. Một dòng có thể bị cắt giữa hai gói dữ liệu,
 * nên phần dở dang được giữ lại chờ gói sau.
 */
function sseToText(): TransformStream<Uint8Array, Uint8Array> {
  const dec = new TextDecoder();
  const enc = new TextEncoder();
  let buf = "";
  const emit = (line: string, out: TransformStreamDefaultController<Uint8Array>) => {
    const t = line.trim();
    if (!t.startsWith("data:")) return;
    const data = t.slice(5).trim();
    if (data === "[DONE]") return;
    try {
      const text = JSON.parse(data)?.choices?.[0]?.delta?.content;
      if (typeof text === "string" && text) out.enqueue(enc.encode(text));
    } catch {
      // Dòng không phải JSON: bỏ qua.
    }
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
    },
  });
}
