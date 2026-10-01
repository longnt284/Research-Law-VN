#!/usr/bin/env node
/*
  Thử chịu tải cho trợ lý hỏi đáp mà không tốn hạn mức thật.

  Tệp này dựng một máy chủ mô hình giả kiểu OpenAI (trả 429 theo tỷ lệ đặt
  trước, trả chữ chậm như mô hình thật), rồi bắn N câu hỏi đồng thời vào
  `/api/chat` của bản chạy trên máy, mỗi câu một mã thiết bị và một địa chỉ IP
  giả khác nhau.

  Cách chạy, ở hai cửa sổ dòng lệnh:

    # 1. Dựng và chạy trang, trỏ nhà cung cấp vào máy chủ giả (cổng 8787):
    npm run build
    CHAT_API_BASE=http://127.0.0.1:8787/v1 CHAT_API_KEY=mock \
    CHAT_FALLBACK_API_BASE=http://127.0.0.1:8787/v1 CHAT_FALLBACK_API_KEY=mock \
    CHAT_FALLBACK_MODEL=openrouter/free npm start

    # 2. Chạy máy chủ giả và bắn câu hỏi:
    node scripts/chat-load-test.mjs --users 100 --fail 0.3

  Tham số: --users số câu hỏi đồng thời (mặc định 100), --fail tỷ lệ mỗi lượt
  gọi model bị trả 429 (mặc định 0.3), --target địa chỉ trang (mặc định
  http://localhost:3000), --mock-only chỉ chạy máy chủ giả.

  Đạt khi: mọi câu hỏi nhận mã 200 (câu trả lời của mô hình hoặc tra cứu tự
  động), không câu nào quá 45 giây.
*/
import { createServer } from "node:http";
import { parseArgs } from "node:util";

const { values: args } = parseArgs({
  options: {
    users: { type: "string", default: "100" },
    fail: { type: "string", default: "0.3" },
    target: { type: "string", default: "http://localhost:3000" },
    port: { type: "string", default: "8787" },
    "mock-only": { type: "boolean", default: false },
  },
});
const USERS = Number(args.users);
const FAIL = Number(args.fail);
const PORT = Number(args.port);

const calls = new Map();

const mock = createServer(async (req, res) => {
  let raw = "";
  for await (const c of req) raw += c;
  let model = "?";
  try {
    model = JSON.parse(raw).model;
  } catch {
    // Thân không phải JSON: trả lời như thường.
  }
  calls.set(model, (calls.get(model) ?? 0) + 1);
  if (Math.random() < FAIL) {
    res.writeHead(429, { "content-type": "application/json" });
    res.end('{"error":{"details":[{"retryDelay":"5s"}]}}');
    return;
  }
  // Byte đầu sau 300–1.300 ms, rồi 20 mẩu chữ cách nhau 80 ms, như mô hình thật.
  await new Promise((r) => setTimeout(r, 300 + Math.random() * 1000));
  res.writeHead(200, { "content-type": "text/event-stream" });
  for (let i = 0; i < 20; i++) {
    res.write(`data: ${JSON.stringify({ model, choices: [{ delta: { content: `mẩu ${i} ` } }] })}\n\n`);
    await new Promise((r) => setTimeout(r, 80));
  }
  res.write(`data: ${JSON.stringify({ choices: [{ delta: {}, finish_reason: "stop" }], usage: { prompt_tokens: 20000, completion_tokens: 800 } })}\n\n`);
  res.end("data: [DONE]\n\n");
});

await new Promise((r) => mock.listen(PORT, "127.0.0.1", r));
console.log(`Máy chủ giả: http://127.0.0.1:${PORT}/v1 (tỷ lệ 429: ${FAIL})`);
if (args["mock-only"]) await new Promise(() => {});

const questions = [
  "Luật Đất đai 2024 còn hiệu lực không?",
  "Mua đất chưa có sổ đỏ, đã đặt cọc thì có rủi ro gì?",
  "Phân tích rủi ro của điều khoản phạt vi phạm trong hợp đồng thi công",
  "Nghị định 58/2025 thay thế văn bản nào?",
  "Thủ tục thành lập công ty TNHH một thành viên",
];

const hex = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 16).toString(16)).join("");

async function one(i) {
  const started = performance.now();
  const res = await fetch(`${args.target}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: args.target,
      "X-Chat-Client": hex(32),
      "X-Forwarded-For": `10.${i >> 8}.${i & 255}.${1 + (i % 250)}`,
    },
    body: JSON.stringify({ lang: "vi", messages: [{ role: "user", content: questions[i % questions.length] }], model: "auto" }),
  });
  const first = performance.now() - started;
  const text = await res.text();
  return {
    status: res.status,
    model: res.headers.get("x-chat-model") ?? "-",
    first,
    total: performance.now() - started,
    ok: res.ok && text.includes('"t"'),
  };
}

const t0 = performance.now();
const results = await Promise.all(Array.from({ length: USERS }, (_, i) => one(i).catch((e) => ({ status: 0, model: String(e), first: 0, total: 0, ok: false }))));
const wall = performance.now() - t0;
mock.close();

const pct = (xs, p) => {
  const s = [...xs].sort((a, b) => a - b);
  return Math.round(s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))]);
};
const count = (key) => results.reduce((m, r) => m.set(r[key], (m.get(r[key]) ?? 0) + 1), new Map());

console.log(`\n${USERS} câu hỏi đồng thời, xong sau ${Math.round(wall)} ms`);
console.log("Mã trả về:", Object.fromEntries(count("status")));
console.log("Model trả lời:", Object.fromEntries(count("model")));
console.log("Lượt gọi tới máy chủ giả theo model:", Object.fromEntries(calls));
console.log(`Thời gian tới phản hồi đầu (ms): p50 ${pct(results.map((r) => r.first), 50)}, p95 ${pct(results.map((r) => r.first), 95)}`);
console.log(`Thời gian trọn câu trả lời (ms): p50 ${pct(results.map((r) => r.total), 50)}, p95 ${pct(results.map((r) => r.total), 95)}, tối đa ${pct(results.map((r) => r.total), 100)}`);
const failed = results.filter((r) => !r.ok || r.total > 45_000).length;
console.log(failed === 0 ? "ĐẠT: mọi câu hỏi đều có câu trả lời." : `CHƯA ĐẠT: ${failed} câu hỏi không có câu trả lời hoặc quá 45 giây.`);
process.exit(failed === 0 ? 0 : 1);
