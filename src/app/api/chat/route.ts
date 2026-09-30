import type { Lang } from "@/data/types";
import { isLang } from "@/i18n/dictionary";
import {
  autoModel,
  isModelChoice,
  modelChain,
  PRO,
  STANDARD,
  type ModelChoice,
  type ModelId,
} from "@/lib/chat/models";
import { buildSystemPrompt } from "@/lib/chat/prompt";
import { chatConfigured, streamChat, type ChatMessage } from "@/lib/chat/provider";
import { pickRoutes } from "@/lib/chat/skills";

/**
 * Trợ lý hỏi đáp: nhận cuộc trò chuyện, chọn skill và model, trả câu trả lời
 * dạng luồng NDJSON (xem `ChatEvent`). Trang không lưu cuộc trò chuyện ở đâu cả:
 * nó nằm trong trình duyệt và được gửi lại nguyên vẹn ở mỗi lượt hỏi.
 *
 * Header trả về: `X-Chat-Skill` các skill đã chọn, `X-Chat-Model` model đã nhận
 * yêu cầu, `X-Chat-Auto` khi model do trang tự chọn, `X-Chat-Thinking` khi bật
 * suy luận mở rộng, `X-Chat-Limited` khi đã hết lượt Pro và suy luận mở rộng
 * trong ngày nên câu hỏi chạy ở chế độ thường.
 *
 * Mã lỗi trả về, để khung chat báo đúng lý do: 403 gọi từ trang khác, 503 chưa
 * cấu hình, 429 quá lượt, 400 và 413 yêu cầu sai hoặc quá dài, 502 mọi nhà cung
 * cấp mô hình đều từ chối.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Gemini 3.1 Pro với suy luận mở rộng có thể nghĩ hơn một phút.
export const maxDuration = 180;

const MAX_USER_CHARS = 2000;
const MAX_TURNS = 8;
const MAX_TOTAL_CHARS = 12_000;

/*
  Giới hạn lượt theo địa chỉ IP, giữ trong bộ nhớ của tiến trình. Trên
  serverless mỗi phiên bản giữ một bảng riêng, nên đây là giới hạn tương đối: đủ
  để một người không dùng hết hạn mức miễn phí của cả trang, không phải hàng rào
  chống tấn công. Địa chỉ IP bị xóa khỏi bảng sau tối đa 24 giờ.

  Gemini 3.1 Pro và suy luận mở rộng tốn gấp nhiều lần một lượt thường, nên có
  hạn mức riêng. Hết hạn mức đó thì câu hỏi vẫn được trả lời, bằng 3.8 Flash ở
  chế độ thường.
*/
const PER_MINUTE = 6;
const PER_DAY = 40;
const PREMIUM_PER_DAY = 10;
const DAY_MS = 86_400_000;
const hits = new Map<string, number[]>();
const premiumHits = new Map<string, number[]>();

function overLimit(
  hits: Map<string, number[]>,
  ip: string,
  now: number,
  perDay: number,
  perMinute = Infinity,
): boolean {
  if (hits.size > 10_000) {
    for (const [k, v] of hits) if (now - v[v.length - 1] >= DAY_MS) hits.delete(k);
    if (hits.size > 10_000) hits.clear();
  }
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < DAY_MS);
  const lastMinute = recent.filter((t) => now - t < 60_000).length;
  if (recent.length >= perDay || lastMinute >= perMinute) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function fail(status: number, error: string): Response {
  return Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

type Parsed =
  | { lang: Lang; messages: ChatMessage[]; model: ModelChoice; thinking: boolean }
  | { status: number; error: string };

function parse(body: unknown): Parsed {
  const bad = { status: 400, error: "body" };
  if (!body || typeof body !== "object") return bad;
  const { lang, messages, model, thinking } = body as {
    lang?: unknown;
    messages?: unknown;
    model?: unknown;
    thinking?: unknown;
  };
  if (typeof lang !== "string" || !isLang(lang) || !Array.isArray(messages) || messages.length === 0) {
    return bad;
  }
  const clean: ChatMessage[] = [];
  for (const m of messages.slice(-MAX_TURNS)) {
    if (!m || typeof m !== "object") return bad;
    const { role, content } = m as { role?: unknown; content?: unknown };
    if ((role !== "user" && role !== "assistant") || typeof content !== "string" || !content.trim()) {
      return bad;
    }
    if (role === "user" && content.length > MAX_USER_CHARS) return { status: 413, error: "long" };
    clean.push({ role, content });
  }
  if (clean[clean.length - 1].role !== "user") return bad;
  // Bỏ bớt lượt cũ cho vừa giới hạn, và để cuộc trò chuyện luôn mở đầu bằng
  // người dùng: một số nhà cung cấp từ chối lượt đầu của mô hình.
  const size = () => clean.reduce((n, m) => n + m.content.length, 0);
  while (clean.length > 1 && (size() > MAX_TOTAL_CHARS || clean[0].role === "assistant")) clean.shift();
  return { lang, messages: clean, model: isModelChoice(model) ? model : "auto", thinking: thinking === true };
}

export async function POST(req: Request): Promise<Response> {
  // Trình duyệt luôn gửi Origin với yêu cầu POST. Chặn trang khác nhúng trợ lý
  // này để dùng hạn mức miễn phí của trang.
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  let sameOrigin = false;
  try {
    sameOrigin = !!origin && !!host && new URL(origin).host === host;
  } catch {
    sameOrigin = false;
  }
  if (!sameOrigin) return fail(403, "origin");
  if (!chatConfigured()) return fail(503, "config");

  // Vercel ghi đè x-forwarded-for bằng địa chỉ thật của người gửi.
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (overLimit(hits, ip, Date.now(), PER_DAY, PER_MINUTE)) return fail(429, "rate");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail(400, "body");
  }
  const parsed = parse(body);
  if ("error" in parsed) return fail(parsed.status, parsed.error);

  const userTexts = parsed.messages.filter((m) => m.role === "user").map((m) => m.content);
  const picked = pickRoutes(userTexts);
  let system: string;
  try {
    system = buildSystemPrompt({ lang: parsed.lang, ...picked, text: userTexts.slice(-3).join("\n") });
  } catch (e) {
    console.error(`chat: không dựng được prompt: ${e instanceof Error ? e.message : "không rõ"}`);
    return fail(503, "config");
  }

  const auto = parsed.model === "auto";
  let first: ModelId = parsed.model === "auto" ? autoModel(userTexts, picked.skills) : parsed.model;
  let thinking = parsed.thinking;
  let limited = false;
  if ((first === PRO || thinking) && overLimit(premiumHits, ip, Date.now(), PREMIUM_PER_DAY)) {
    if (first === PRO) first = STANDARD;
    thinking = false;
    limited = true;
  }

  const stream = await streamChat(system, parsed.messages, { models: modelChain(first), thinking }, req.signal);
  if (!stream) return fail(502, "upstream");
  const headers: Record<string, string> = {
    "Content-Type": "application/x-ndjson; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Chat-Skill": picked.skills.join(","),
    "X-Chat-Model": stream.model,
  };
  if (auto) headers["X-Chat-Auto"] = "1";
  if (thinking) headers["X-Chat-Thinking"] = "1";
  if (limited) headers["X-Chat-Limited"] = "1";
  return new Response(stream.body, { headers });
}
