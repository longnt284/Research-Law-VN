import type { Lang } from "@/data/types";
import { isLang } from "@/i18n/dictionary";
import {
  autoModel,
  isModelChoice,
  modelChain,
  PRO,
  providerOf,
  STANDARD,
  type ModelChoice,
  type ModelId,
} from "@/lib/chat/models";
import { admit, deviceKey, LIMITS, Window } from "@/lib/chat/limits";
import { OFFLINE_MODEL, offlineAnswer, offlineBody } from "@/lib/chat/offline";
import { buildSystemPrompt } from "@/lib/chat/prompt";
import { chatConfigured, streamChat, type ChatMessage } from "@/lib/chat/provider";
import { pickRoutes, type Picked } from "@/lib/chat/skills";
import { refundCredits, spendCredits, type PaidTurn } from "@/lib/payments/server";
import { turnCost } from "@/lib/plans";

/**
 * Trợ lý hỏi đáp: nhận cuộc trò chuyện, chọn skill và model, trả câu trả lời
 * dạng luồng NDJSON (xem `ChatEvent`). Trang không lưu cuộc trò chuyện ở đâu cả:
 * nó nằm trong trình duyệt và được gửi lại nguyên vẹn ở mỗi lượt hỏi.
 *
 * Header trả về: `X-Chat-Skill` các skill đã chọn, `X-Chat-Model` model đã nhận
 * yêu cầu, `X-Chat-Auto` khi model do trang tự chọn, `X-Chat-Thinking` khi bật
 * suy luận mở rộng, `X-Chat-Limited` các hạn mức đã hết trong ngày: `pro` (Pro
 * và suy luận mở rộng, câu hỏi chạy ở chế độ thường), `free` (model OpenRouter
 * chọn tay, câu hỏi chạy bằng Gemini), `X-Chat-Credits` số lượt Pro đã mua còn
 * lại khi câu hỏi vừa dùng lượt mua.
 *
 * Mọi nhà cung cấp mô hình đều từ chối, hoặc chưa cấu hình nhà cung cấp nào,
 * thì câu hỏi vẫn được trả lời bằng tra cứu tự động (`offline.ts`), với
 * `X-Chat-Model: offline`.
 *
 * Mã lỗi trả về, để khung chat báo đúng lý do: 403 gọi từ trang khác, 429 quá
 * lượt, 400 và 413 yêu cầu sai hoặc quá dài.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Gemini 3.1 Pro với suy luận mở rộng có thể nghĩ vài phút. 300 giây là trần
// của gói Hobby trên Vercel (Fluid compute).
export const maxDuration = 300;
/** Mốc đóng luồng, chừa 15 giây trước `maxDuration` để báo câu trả lời chưa trọn. */
const DEADLINE_MS = 285_000;

const MAX_USER_CHARS = 6000;
const MAX_TURNS = 16;
/** Tổng ký tự của cuộc trò chuyện gửi lên mô hình mỗi lượt; lượt cũ hơn bị bỏ. */
const MAX_TOTAL_CHARS = 30_000;

/*
  Giới hạn lượt theo thiết bị và theo địa chỉ IP: xem `src/lib/chat/limits.ts`.

  Gemini 3.1 Pro và suy luận mở rộng tốn gấp nhiều lần một lượt thường, nên có
  hạn mức riêng. Hết hạn mức đó thì câu hỏi vẫn được trả lời, bằng 3.8 Flash ở
  chế độ thường, trừ khi người hỏi đăng nhập và còn lượt Pro đã mua: khi đó máy
  chủ trừ lượt (`src/lib/plans.ts`) và giữ nguyên Pro, suy luận mở rộng. Quyền
  này chỉ dựa vào số dư trong cơ sở dữ liệu, không dựa vào gì trình duyệt gửi.

  Lượt chọn tay model OpenRouter có hạn mức riêng, vì model miễn phí của
  OpenRouter dùng chung hạn mức ngày của cả tài khoản, và hạn mức đó còn là chốt
  dự phòng khi Gemini hết lượt. Hết thì câu hỏi chạy bằng Gemini theo độ khó.
*/
const ipHits = new Window();
const deviceHits = new Window();
const premiumHits = new Window();
const premiumIpHits = new Window();
const freeHits = new Window();

function fail(status: number, error: string): Response {
  return Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

const STREAM_HEADERS = { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" };

/** Trả lời bằng tra cứu tự động; `reason` chỉ để ghi nhật ký. */
function offline(lang: Lang, userTexts: string[], picked: Picked, reason: string): Response {
  console.info(JSON.stringify({ scope: "chat", event: "offline", reason }));
  const answer = offlineAnswer({ lang, text: userTexts[userTexts.length - 1], domains: picked.domains });
  return new Response(offlineBody(answer), {
    headers: { ...STREAM_HEADERS, "X-Chat-Skill": picked.skills.join(","), "X-Chat-Model": OFFLINE_MODEL },
  });
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
  const deadline = Date.now() + DEADLINE_MS;
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

  // Vercel ghi đè x-forwarded-for bằng địa chỉ thật của người gửi.
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const device = deviceKey(req, ip);
  const admitted = admit(Date.now(), [
    { window: ipHits, key: ip, perDay: LIMITS.ipPerDay, perMinute: LIMITS.ipPerMinute },
    { window: deviceHits, key: device, perDay: LIMITS.perDay, perMinute: LIMITS.perMinute },
  ]);
  if (!admitted) return fail(429, "rate");

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
  if (!chatConfigured()) return offline(parsed.lang, userTexts, picked, "config");
  let system: string;
  try {
    system = buildSystemPrompt({ lang: parsed.lang, ...picked, texts: userTexts.slice(-3) });
  } catch (e) {
    console.error(`chat: không dựng được prompt: ${e instanceof Error ? e.message : "không rõ"}`);
    return offline(parsed.lang, userTexts, picked, "prompt");
  }

  // Chọn 3.1 Pro nghĩa là "Pro khi cần": câu hỏi chưa đủ khó vẫn chạy bằng Flash.
  let first: ModelId =
    parsed.model === "auto" || parsed.model === PRO
      ? autoModel(userTexts, picked.skills, parsed.model === PRO)
      : parsed.model;
  let thinking = parsed.thinking;
  const limited: string[] = [];
  if (
    providerOf(first) === "openrouter" &&
    !admit(Date.now(), [{ window: freeHits, key: device, perDay: LIMITS.freePerDay }])
  ) {
    first = autoModel(userTexts, picked.skills);
    limited.push("free");
  }
  let paid: PaidTurn | null = null;
  if (
    (first === PRO || thinking) &&
    !admit(Date.now(), [
      { window: premiumHits, key: device, perDay: LIMITS.premiumPerDay },
      { window: premiumIpHits, key: ip, perDay: LIMITS.premiumIpPerDay },
    ])
  ) {
    paid = await spendCredits(req, turnCost(first === PRO, thinking));
    if (!paid) {
      if (first === PRO) first = STANDARD;
      thinking = false;
      limited.push("pro");
    }
  }
  const auto = parsed.model === "auto" || first !== parsed.model;

  const stream = await streamChat(
    system,
    parsed.messages,
    { models: modelChain(first), thinking, deadline },
    req.signal,
  );
  if (!stream) {
    if (paid) await refundCredits(paid);
    return offline(parsed.lang, userTexts, picked, "upstream");
  }
  const headers: Record<string, string> = {
    ...STREAM_HEADERS,
    "X-Chat-Skill": picked.skills.join(","),
    "X-Chat-Model": stream.model,
  };
  if (auto) headers["X-Chat-Auto"] = "1";
  if (thinking) headers["X-Chat-Thinking"] = "1";
  if (limited.length) headers["X-Chat-Limited"] = limited.join(",");
  if (paid) {
    // Pro hết hạn mức phía Google thì chuỗi model lùi về Flash: hoàn phần lượt
    // Pro không được dùng.
    const unused = paid.cost - turnCost(stream.model === PRO, thinking);
    if (unused > 0) {
      await refundCredits({ ...paid, cost: unused });
      paid.balance += unused;
    }
    headers["X-Chat-Credits"] = String(paid.balance);
  }
  return new Response(stream.body, { headers });
}
