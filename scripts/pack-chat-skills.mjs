#!/usr/bin/env node
/*
  Đóng gói và mã hóa bộ skill pháp lý cho trợ lý hỏi đáp.

  Repo công khai, còn bộ skill là tài sản riêng, nên chỉ bản mã hóa được commit.
  Khóa nằm ở biến môi trường `CHAT_SKILLS_KEY` trên Vercel; route `/api/chat`
  giải mã lúc chạy (`src/lib/chat/skills.ts`).

  Gói gồm thân `SKILL.md` của từng skill, và mọi tệp trong thư mục `references/`
  của skill đó (trừ tệp chỉ dùng cho công cụ, xem `SKIP`). Thân skill mang khóa
  là tên skill, tệp tham chiếu mang khóa `<skill>/references/<tệp>`. Bot dùng
  nguyên văn thân của skill được chọn, và tìm trong mọi mục của gói những đoạn
  liên quan tới câu hỏi (`src/lib/chat/retrieve.ts`).

  Cách dùng:
    CHAT_SKILLS_KEY=<base64 32 byte> node scripts/pack-chat-skills.mjs <thư mục chứa các skill vn-*>

  Sinh khóa mới:
    node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

  Danh sách `SKILLS` phải khớp `SKILL_IDS` trong `src/lib/chat/skills.ts`.
*/
import { createCipheriv, randomBytes } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Skill bot chọn được theo câu hỏi. */
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

/** Skill chỉ dùng làm tư liệu tra cứu, không bao giờ được chọn làm skill chính. */
const KNOWLEDGE = ["vn-legal-lookup"];

/** Tệp tham chiếu chỉ hướng dẫn dùng công cụ mà bot không có. */
const SKIP = new Set(["tvpl-browser.md"]);

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

// Bỏ frontmatter: phần mô tả dùng để Claude chọn skill, bot tự chọn bằng từ khóa.
const read = (path) =>
  readFileSync(path, "utf8")
    .replace(/\r\n/g, "\n")
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    .trim();

const bodies = {};
const add = (id, path) => {
  bodies[id] = read(path);
  console.log(`${id.padEnd(62)} ${String(bodies[id].length).padStart(7)} ký tự`);
};
for (const name of [...SKILLS, ...KNOWLEDGE]) {
  add(name, join(src, name, "SKILL.md"));
  const refs = join(src, name, "references");
  if (!existsSync(refs)) continue;
  for (const file of readdirSync(refs).sort()) {
    if (file.endsWith(".md") && !SKIP.has(file)) add(`${name}/references/${file}`, join(refs, file));
  }
}
const total = Object.values(bodies).reduce((n, s) => n + s.length, 0);
console.log(`\n${Object.keys(bodies).length} mục, ${total} ký tự`);

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
