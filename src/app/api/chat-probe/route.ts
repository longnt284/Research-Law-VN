import { streamChat } from "@/lib/chat/provider";

/*
  TẠM THỜI, chỉ để kiểm tra trên bản preview: gọi từng model với câu hỏi ngắn và
  trả về tóm tắt luồng trả lời. Sẽ gỡ ngay sau khi kiểm tra xong.
*/

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const CASES: { models: string[]; thinking: boolean }[] = [
  { models: ["gemini-3.6-flash"], thinking: false },
  { models: ["gemini-3.8-flash"], thinking: false },
  { models: ["gemini-3.1-pro-preview"], thinking: false },
  { models: ["gemini-3.8-flash"], thinking: true },
  { models: ["gemini-3.1-pro-preview"], thinking: true },
  { models: [], thinking: false },
  { models: [], thinking: true },
];

export async function GET(req: Request): Promise<Response> {
  if (process.env.VERCEL_ENV !== "preview") return new Response(null, { status: 404 });
  const url = new URL(req.url);
  const c = CASES[Number(url.searchParams.get("c"))];
  if (!c) return Response.json({ cases: CASES });

  const started = Date.now();
  if (url.searchParams.get("raw") === "1") {
    const base = (process.env.CHAT_API_BASE ?? "").replace(/\/+$/, "");
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.CHAT_API_KEY}` },
      body: JSON.stringify({
        model: c.models[0],
        stream: true,
        max_tokens: 4096,
        messages: [{ role: "user", content: "Hợp đồng mua bán nhà ở có phải công chứng không? Trả lời 2 câu." }],
        ...(c.thinking
          ? { extra_body: { google: { thinking_config: { thinking_level: "high", include_thoughts: true } } } }
          : { reasoning_effort: "low" }),
      }),
    });
    const raw = await res.text();
    return Response.json({ status: res.status, ms: Date.now() - started, raw: raw.slice(0, 4000) });
  }

  const stream = await streamChat(
    "Bạn là trợ lý pháp lý. Trả lời ngắn gọn.",
    [{ role: "user", content: "Hợp đồng mua bán nhà ở có phải công chứng không? Trả lời 2 câu." }],
    c,
    req.signal,
  );
  if (!stream) return Response.json({ case: c, served: null, ms: Date.now() - started });
  const lines = (await new Response(stream.body).text()).split("\n").filter(Boolean);
  const events = lines.map((l) => JSON.parse(l) as { t?: string; r?: string; m?: string });
  const text = events.map((e) => e.t ?? "").join("");
  const reasoning = events.map((e) => e.r ?? "").join("");
  return Response.json({
    case: c,
    served: stream.model,
    reported: events.filter((e) => e.m).map((e) => e.m),
    ms: Date.now() - started,
    textLen: text.length,
    text: text.slice(0, 600),
    reasoningLen: reasoning.length,
    reasoning: reasoning.slice(0, 600),
  });
}
