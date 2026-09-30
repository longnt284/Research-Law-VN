import type { SkillId } from "@/lib/chat/skills";
import { fold } from "@/lib/search-engine";

/**
 * Các model Gemini của trợ lý hỏi đáp, và cách tự chọn model theo độ khó của
 * câu hỏi.
 *
 * Tệp này được cả khung chat trên trình duyệt lẫn route `/api/chat` nhập, nên
 * chỉ chứa dữ liệu công khai: mã model và tên hiển thị. Khóa API nằm trong biến
 * môi trường của máy chủ.
 */

export const MODELS = [
  { id: "gemini-3.6-flash", label: "Gemini 3.6 Flash" },
  { id: "gemini-3.8-flash", label: "Gemini 3.8 Flash" },
  { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro" },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];
export type ModelChoice = "auto" | ModelId;

const LIGHT: ModelId = "gemini-3.6-flash";
export const STANDARD: ModelId = "gemini-3.8-flash";
export const PRO: ModelId = "gemini-3.1-pro-preview";

export function isModelChoice(v: unknown): v is ModelChoice {
  return v === "auto" || MODELS.some((m) => m.id === v);
}

/** Tên hiển thị; model ngoài danh sách (model miễn phí của OpenRouter) giữ nguyên mã. */
export function modelLabel(id: string): string {
  return MODELS.find((m) => m.id === id)?.label ?? id;
}

/*
  Tự chọn model bằng quy tắc, không tốn thêm một lượt gọi mô hình. Mỗi dấu hiệu
  cộng điểm: câu hỏi đòi phân tích, so sánh, rà soát hay soạn thảo; câu hỏi dài;
  câu hỏi chạm hai lĩnh vực chuyên môn; cuộc trò chuyện đã sang lượt thứ ba.
  Không có dấu hiệu nào là câu hỏi dễ (3.6 Flash), từ ba điểm là câu hỏi khó
  (3.1 Pro), còn lại là câu hỏi vừa (3.8 Flash). Từ khóa so ở dạng bỏ dấu, để
  câu gõ không dấu cũng khớp.
*/
const HARD = [
  "phân tích", "so sánh", "đánh giá", "rà soát", "soát xét", "soạn", "chiến lược", "rủi ro",
  "tranh chấp", "khởi kiện", "phương án", "lập luận", "điều khoản",
  "analyse", "analyze", "compare", "review", "draft", "strategy", "risk", "dispute", "clause",
].map((k) => ` ${fold(k)} `);

export function autoModel(userTexts: string[], skills: SkillId[]): ModelId {
  const last = userTexts[userTexts.length - 1] ?? "";
  const text = ` ${fold(last).replace(/[^\p{L}\p{N}]+/gu, " ")} `;
  let score = 0;
  if (HARD.some((k) => text.includes(k))) score += 2;
  if (last.length > 600) score += 2;
  else if (last.length > 200) score += 1;
  if (skills.filter((s) => s !== "vn-orchestrator").length >= 2) score += 1;
  if (userTexts.length >= 3) score += 1;
  return score >= 3 ? PRO : score >= 1 ? STANDARD : LIGHT;
}

/**
 * Thứ tự thử model: model đã chọn trước, rồi các bản Flash. Không bao giờ tự
 * nâng lên Pro khi model đã chọn lỗi, để chi phí không vượt lựa chọn ban đầu.
 */
export function modelChain(first: ModelId): ModelId[] {
  return [...new Set<ModelId>([first, STANDARD, LIGHT])];
}
