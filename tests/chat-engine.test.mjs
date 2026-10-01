// Trợ lý hỏi đáp: giới hạn lượt, chuỗi model dự phòng, chuyển model khi nhà
// cung cấp từ chối, và câu trả lời tra cứu tự động khi mọi model đều hỏng.
// Không gọi nhà cung cấp thật: các phép thử chuyển model dùng máy chủ giả.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { test } from "node:test";

import { admit, deviceKey, LIMITS, Window } from "@/lib/chat/limits";
import { autoModel, FREE_ROUTER, isModelChoice, modelChain, PRO, PRO_ENABLED, STANDARD } from "@/lib/chat/models";
import { offlineAnswer, offlineBody } from "@/lib/chat/offline";
import { streamChat } from "@/lib/chat/provider";

const MIN = 60_000;

test("limits: a blocked request is not counted", () => {
  const w = new Window();
  const now = 1_000_000;
  for (let i = 0; i < LIMITS.perMinute; i++) {
    assert.equal(admit(now, [{ window: w, key: "d:a", perDay: LIMITS.perDay, perMinute: LIMITS.perMinute }]), true);
  }
  assert.equal(admit(now, [{ window: w, key: "d:a", perDay: LIMITS.perDay, perMinute: LIMITS.perMinute }]), false);
  // Một phút sau lại hỏi được: lượt bị chặn không làm kéo dài thời gian chờ.
  assert.equal(admit(now + MIN, [{ window: w, key: "d:a", perDay: LIMITS.perDay, perMinute: LIMITS.perMinute }]), true);
});

test("limits: many devices behind one IP are not blocked together", () => {
  const ip = new Window();
  const dev = new Window();
  const now = 2_000_000;
  let ok = 0;
  for (let i = 0; i < 40; i++) {
    const passed = admit(now, [
      { window: ip, key: "1.2.3.4", perDay: LIMITS.ipPerDay, perMinute: LIMITS.ipPerMinute },
      { window: dev, key: `d:${i}`, perDay: LIMITS.perDay, perMinute: LIMITS.perMinute },
    ]);
    if (passed) ok++;
  }
  assert.equal(ok, 40);
});

test("limits: the IP ceiling stops device-code rotation", () => {
  const ip = new Window();
  const dev = new Window();
  const now = 3_000_000;
  let ok = 0;
  for (let i = 0; i < LIMITS.ipPerMinute + 25; i++) {
    const passed = admit(now, [
      { window: ip, key: "5.6.7.8", perDay: LIMITS.ipPerDay, perMinute: LIMITS.ipPerMinute },
      { window: dev, key: `d:rot${i}`, perDay: LIMITS.perDay, perMinute: LIMITS.perMinute },
    ]);
    if (passed) ok++;
  }
  assert.equal(ok, LIMITS.ipPerMinute);
});

test("limits: device key falls back to the IP address", () => {
  const req = (h) => new Request("https://x.test/api/chat", { method: "POST", headers: h });
  assert.equal(deviceKey(req({ "x-chat-client": "0123456789abcdef0123456789abcdef" }), "9.9.9.9"), "d:0123456789abcdef0123456789abcdef");
  assert.equal(deviceKey(req({ "x-chat-client": "short" }), "9.9.9.9"), "ip:9.9.9.9");
  assert.equal(deviceKey(req({ "x-chat-client": "bad id with spaces and more chars" }), "9.9.9.9"), "ip:9.9.9.9");
  assert.equal(deviceKey(req({}), "9.9.9.9"), "ip:9.9.9.9");
});

test("models: fallback ladder spans every Flash model and never climbs to Pro", () => {
  const chain = modelChain(STANDARD);
  assert.equal(chain[0], STANDARD);
  for (const m of ["gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite"]) {
    assert.ok(chain.includes(m), m);
  }
  assert.ok(!chain.includes(PRO));
  assert.equal(new Set(chain).size, chain.length);

  const free = modelChain("qwen/qwen3.8-27b:free");
  assert.deepEqual(free.slice(0, 3), ["qwen/qwen3.8-27b:free", FREE_ROUTER, STANDARD]);
});

test("models: Pro is off on the Gemini free tier", () => {
  assert.equal(PRO_ENABLED, false);
  assert.equal(isModelChoice(PRO), false);
  // Mô hình dự phòng ẩn không chọn tay được.
  assert.equal(isModelChoice("gemini-3.5-flash-lite"), false);
  assert.equal(isModelChoice("auto"), true);
  const hard = "Phân tích và so sánh rủi ro của điều khoản phạt vi phạm trong hợp đồng thi công FIDIC ".repeat(10);
  assert.equal(autoModel([hard, hard, hard], ["vn-construction-partner", "vn-litigation-partner"], true), STANDARD);
});

test("offline: answers validity questions from the dataset", () => {
  const a = offlineAnswer({ lang: "vi", text: "Luật Đất đai 2024 còn hiệu lực không?", domains: ["dat-dai"] });
  assert.match(a, /không dùng AI/);
  assert.match(a, /31\/2024\/QH15/);
  assert.match(a, /\]\(\/vi\/van-ban\/[a-z0-9-]+\)/);
});

test("offline: a number pulls in the instruments that amend or replace it", () => {
  const a = offlineAnswer({ lang: "vi", text: "Nghị định 58/2025 còn hiệu lực không?", domains: [] });
  assert.match(a, /58\/2025\/NĐ-CP/);
  assert.match(a, /243\/2026\/NĐ-CP/);
});

test("offline: unrelated and site questions still get an answer", () => {
  const none = offlineAnswer({ lang: "vi", text: "nấu phở thế nào", domains: [] });
  assert.match(none, /chưa có văn bản khớp/);
  const site = offlineAnswer({ lang: "en", text: "How do I see the law on a past date?", domains: [] });
  assert.match(site, /Using the site/);
  assert.match(site, /\/en\/van-ban/);
});

test("offline: body is one NDJSON event", async () => {
  const text = await new Response(offlineBody("xin chào")).text();
  assert.equal(text, '{"t":"xin chào"}\n');
});

/*
  Máy chủ giả kiểu OpenAI: mã model quyết định cách trả lời. `ok-*` trả luồng
  SSE kèm số token, `rl-*` trả 429, `auth-*` trả 401, `slow-*` không trả lời.
*/
async function mockProvider() {
  const hits = [];
  const server = createServer(async (req, res) => {
    let raw = "";
    for await (const c of req) raw += c;
    const { model } = JSON.parse(raw);
    hits.push(model);
    if (model.startsWith("rl-")) {
      res.writeHead(429, { "content-type": "application/json" });
      res.end('{"error":{"details":[{"retryDelay":"30s"}]}}');
    } else if (model.startsWith("auth-")) {
      res.writeHead(401).end("{}");
    } else if (model.startsWith("slow-")) {
      // Không trả lời: phép thử chờ hết thời gian.
    } else {
      res.writeHead(200, { "content-type": "text/event-stream" });
      res.write(`data: {"choices":[{"delta":{"content":"Xin "}}]}\n\n`);
      res.write(`data: {"choices":[{"delta":{"content":"chào"},"finish_reason":"stop"}],"usage":{"prompt_tokens":120,"completion_tokens":4,"prompt_tokens_details":{"cached_tokens":100}}}\n\n`);
      res.end("data: [DONE]\n\n");
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const { port } = server.address();
  process.env.CHAT_FALLBACK_API_BASE = `http://127.0.0.1:${port}/v1`;
  process.env.CHAT_FALLBACK_API_KEY = "test";
  process.env.CHAT_FALLBACK_MODEL = "";
  return { hits, close: () => new Promise((r) => server.close(r)) };
}

const ask = (models) =>
  streamChat("system", [{ role: "user", content: "hỏi" }], { models, thinking: false, deadline: Date.now() + 60_000 }, new AbortController().signal);

test("provider: a model out of quota rests, the next model answers", async () => {
  const mock = await mockProvider();
  try {
    const first = await ask(["rl-a", "ok-a"]);
    assert.equal(first?.model, "ok-a");
    assert.equal(await new Response(first.body).text(), '{"t":"Xin "}\n{"t":"chào"}\n');
    // Lần sau model hết lượt đang nghỉ: không bị hỏi lại.
    const second = await ask(["rl-a", "ok-b"]);
    assert.equal(second?.model, "ok-b");
    await new Response(second.body).text();
    assert.deepEqual(mock.hits, ["rl-a", "ok-a", "ok-b"]);
  } finally {
    await mock.close();
  }
});

test("provider: a rejected key rests the whole provider", async () => {
  const mock = await mockProvider();
  try {
    assert.equal(await ask(["auth-b", "ok-c"]), null);
    assert.deepEqual(mock.hits, ["auth-b"]);
  } finally {
    await mock.close();
  }
});

test("provider: every model refusing returns null quickly", async () => {
  const mock = await mockProvider();
  try {
    const started = Date.now();
    assert.equal(await ask(["rl-c", "rl-d", "rl-e"]), null);
    assert.ok(Date.now() - started < 5000);
  } finally {
    await mock.close();
  }
});
