#!/usr/bin/env node
/*
  Đóng gói và mã hóa bộ skill pháp lý cho trợ lý hỏi đáp.

  Repo công khai, còn bộ skill là tài sản riêng, nên chỉ bản mã hóa được commit.
  Khóa nằm ở biến môi trường `CHAT_SKILLS_KEY` trên Vercel; route `/api/chat`
  giải mã lúc chạy (`src/lib/chat/skills.ts`).

  Cách dùng:
    CHAT_SKILLS_KEY=<base64 32 byte> node scripts/pack-chat-skills.mjs <thư mục chứa các skill vn-*>

  Sinh khóa mới:
    node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

  Danh sách dưới đây phải khớp `SKILL_IDS` trong `src/lib/chat/skills.ts`.
*/
import { createCipheriv, randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SKILLS = [
  "vn-orchestrator",
  "vn-construction-partner",
  "vn-energy-partner",
  "vn-ppp-partner",
  "vn-land-realestate",
  "vn-fintech-partner",
  "vn-data-privacy-partner",
  "vn-litigation-partner",
  "vn-legal-review",
];

const key = Buffer.from(process.env.CHAT_SKILLS_KEY ?? "", "base64");
if (key.length !== 32) {
  console.error("LỖI: CHAT_SKILLS_KEY phải là 32 byte viết dạng base64.");
  process.exit(1);
}
const src = process.argv[2];
if (!src) {
  console.error("LỖI: thiếu thư mục chứa các skill. Xem chú thích đầu file.");
  process.exit(1);
}

const bodies = {};
for (const name of SKILLS) {
  const text = readFileSync(join(src, name, "SKILL.md"), "utf8").replace(/\r\n/g, "\n");
  // Bỏ frontmatter: phần mô tả dùng để Claude chọn skill, bot tự chọn bằng từ khóa.
  bodies[name] = text.replace(/^---\n[\s\S]*?\n---\n/, "").trim();
  console.log(`${name.padEnd(26)} ${String(bodies[name].length).padStart(6)} ký tự`);
}

const iv = randomBytes(12);
const cipher = createCipheriv("aes-256-gcm", key, iv);
const data = Buffer.concat([cipher.update(JSON.stringify(bodies), "utf8"), cipher.final()]);
const out = {
  v: 1,
  iv: iv.toString("base64"),
  tag: cipher.getAuthTag().toString("base64"),
  data: data.toString("base64"),
};

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
writeFileSync(join(root, "src/lib/chat/skills.enc.json"), `${JSON.stringify(out)}\n`);
console.log("\nĐã ghi src/lib/chat/skills.enc.json");
