import { streamChat } from "@/lib/chat/provider";

/*
  TẠM THỜI, chỉ để kiểm tra trên bản preview: gọi từng model với câu hỏi ngắn,
  trả về và ghi nhật ký tóm tắt luồng trả lời. Sẽ gỡ ngay sau khi kiểm tra xong.
*/

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 180;

const Q = "Hợp đồng mua bán nhà ở có phải công chứng không? Trả lời 2 câu.";

const CASES: { models: string[]; thinking: boolean }[] = [
  { models: ["gemini-3.6-flash"], thinking: false },
  { models: ["gemini-3.8-flash"], thinking: false },
  { models: ["gemini-3.1-pro-preview"], thinking: false },
  { models: ["gemini-3.8-flash"], thinking: true },
  { models: ["gemini-3.1-pro-preview"], thinking: true },
  { models: [], thinking: false },
  { models: [], thinking: true },
];

async function runCase(c: (typeof CASES)[number], signal: AbortSignal) {
  const started = Date.now();
  const stream = await streamChat("Bạn là trợ lý pháp lý. Trả lời ngắn gọn.", [{ role: "user", content: Q }], c, signal);
  if (!stream) return { case: c, served: null, ms: Date.now() - started };
  const lines = (await new Response(stream.body).text()).split("\n").filter(Boolean);
  const events = lines.map((l) => JSON.parse(l) as { t?: string; r?: string; m?: string });
  const text = events.map((e) => e.t ?? "").join("");
  const reasoning = events.map((e) => e.r ?? "").join("");
  return {
    case: c,
    served: stream.model,
    reported: events.filter((e) => e.m).map((e) => e.m),
    ms: Date.now() - started,
    text: text.slice(0, 300),
    reasoningLen: reasoning.length,
    reasoning: reasoning.slice(0, 300),
  };
}

/** Luồng SSE thô của Gemini ở chế độ suy luận mở rộng, để xem định dạng bản tóm tắt suy luận. */
async function raw() {
  const base = (process.env.CHAT_API_BASE ?? "").replace(/\/+$/, "");
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.CHAT_API_KEY}` },
    body: JSON.stringify({
      model: "gemini-3.8-flash",
      stream: true,
      max_tokens: 4096,
      messages: [{ role: "user", content: Q }],
      extra_body: { google: { thinking_config: { thinking_level: "high", include_thoughts: true } } },
    }),
  });
  return { status: res.status, raw: (await res.text()).slice(0, 2500) };
}

export async function GET(req: Request): Promise<Response> {
  if (process.env.VERCEL_ENV !== "preview") return new Response(null, { status: 404 });
  const results = await Promise.all([...CASES.map((c) => runCase(c, req.signal)), raw()]);
  for (const r of results) console.log(`chat-probe ${JSON.stringify(r)}`);
  return Response.json(results);
}
