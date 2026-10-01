#!/usr/bin/env node
/*
  Chạy trước `next build`: kiểm tra `CHAT_SKILLS_KEY` có giải mã được gói skill
  của trợ lý (`src/lib/chat/skills.enc.json`) hay không.

  Khóa và gói lệch nhau thì route `/api/chat` báo tạm ngưng ở mọi câu hỏi, mà
  bản build vẫn thành công. Dừng build ở đây thì Vercel giữ nguyên bản đang chạy
  thay vì đưa lên một bản có trợ lý hỏng.

  Không có khóa (CI trên GitHub, máy phát triển) thì bỏ qua: trợ lý là tùy chọn,
  thiếu khóa thì chỉ trợ lý tạm ngưng, phần còn lại của trang vẫn chạy.
*/
import { createDecipheriv } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

if (!process.env.CHAT_SKILLS_KEY) {
  console.log("check-chat-skills: chưa đặt CHAT_SKILLS_KEY, bỏ qua.");
  process.exit(0);
}

// Đọc khóa đúng như `src/lib/chat/skills.ts` đọc lúc chạy.
const key = Buffer.from(process.env.CHAT_SKILLS_KEY, "base64");
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const bundle = JSON.parse(readFileSync(join(root, "src/lib/chat/skills.enc.json"), "utf8"));

let library;
try {
  if (key.length !== 32) throw new Error("khóa không đủ 32 byte");
  const d = createDecipheriv("aes-256-gcm", key, Buffer.from(bundle.iv, "base64"));
  d.setAuthTag(Buffer.from(bundle.tag, "base64"));
  const json = Buffer.concat([d.update(Buffer.from(bundle.data, "base64")), d.final()]).toString("utf8");
  library = JSON.parse(json);
} catch (e) {
  console.error(
    `check-chat-skills: CHAT_SKILLS_KEY không giải mã được src/lib/chat/skills.enc.json (${
      e instanceof Error ? e.message : "không rõ"
    }). Khóa và gói không khớp: đặt lại khóa trên Vercel, hoặc đóng gói lại bằng scripts/pack-chat-skills.mjs.`,
  );
  process.exit(1);
}
console.log(`check-chat-skills: khóa khớp gói skill, ${Object.keys(library).length} mục.`);

// Thân mỗi skill được gửi nguyên văn trong system prompt ở mọi câu hỏi chọn
// skill đó, nên độ dài của nó là phần lớn token mỗi lượt. In ra để theo dõi chi
// phí; không in nội dung.
const sizes = Object.entries(library)
  .filter(([k]) => !k.includes("/"))
  .map(([k, v]) => `${k} ${v.length}`)
  .join(", ");
console.log(`check-chat-skills: số ký tự thân skill: ${sizes}.`);
