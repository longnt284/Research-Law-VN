import type { SkillId } from "@/lib/chat/skills";
import { fold } from "@/lib/search-engine";

/**
 * Các model của trợ lý hỏi đáp, và cách tự chọn model theo độ khó của câu hỏi.
 *
 * Tệp này được cả khung chat trên trình duyệt lẫn route `/api/chat` nhập, nên
 * chỉ chứa dữ liệu công khai: mã model, tên hiển thị, nhà cung cấp. Khóa API
 * nằm trong biến môi trường của máy chủ.
 *
 * `gemini` chạy qua `CHAT_API_*` (Gemini API), `openrouter` qua
 * `CHAT_FALLBACK_*` (OpenRouter). Model miễn phí của OpenRouter đổi theo thời
 * gian: model nào bị gỡ thì câu hỏi tự chuyển sang `openrouter/free` rồi Gemini,
 * nên sửa danh sách này khi OpenRouter gỡ hay thêm model. `maxOut` là trần độ
 * dài câu trả lời của model, theo tài liệu của nhà cung cấp.
 */

export const FREE_ROUTER = "openrouter/free";

export const MODELS = [
  { id: "gemini-3.6-flash", label: "Gemini 3.6 Flash", provider: "gemini", maxOut: 65_536 },
  { id: "gemini-3.8-flash", label: "Gemini 3.8 Flash", provider: "gemini", maxOut: 65_536 },
  { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro", provider: "gemini", maxOut: 65_536 },
  { id: "nvidia/nemotron-3-ultra-550b-a55b:free", label: "Nemotron 3 Ultra", provider: "openrouter", maxOut: 65_536 },
  { id: "thinkingmachines/inkling:free", label: "Inkling", provider: "openrouter", maxOut: 262_144 },
  { id: "qwen/qwen3.8-27b:free", label: "Qwen3.8 27B", provider: "openrouter", maxOut: 235_929 },
  { id: "google/gemma-4-31b-it:free", label: "Gemma 4 31B", provider: "openrouter", maxOut: 32_768 },
  { id: "nvidia/nemotron-3-super-120b-a12b:free", label: "Nemotron 3 Super", provider: "openrouter", maxOut: 235_929 },
  // Bộ định tuyến chọn ngẫu nhiên một model miễn phí; giữ trần cũ để không loại
  // bớt model có trần thấp khỏi lượt chọn.
  { id: FREE_ROUTER, label: "OpenRouter Free", provider: "openrouter", maxOut: 8192 },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];
export type ModelChoice = "auto" | ModelId;
export type ModelProvider = (typeof MODELS)[number]["provider"];

const LIGHT: ModelId = "gemini-3.6-flash";
export const STANDARD: ModelId = "gemini-3.8-flash";
export const PRO: ModelId = "gemini-3.1-pro-preview";

export function isModelChoice(v: unknown): v is ModelChoice {
  return v === "auto" || MODELS.some((m) => m.id === v);
}

export function providerOf(id: string): ModelProvider | undefined {
  return MODELS.find((m) => m.id === id)?.provider;
}

/**
 * Trần độ dài câu trả lời của model. Model ngoài danh sách (model dự phòng tự
 * đặt, model thật mà `openrouter/free` chọn) giữ mức 8192 đã chạy ổn từ trước.
 */
export function maxOutOf(id: string): number {
  return MODELS.find((m) => m.id === id)?.maxOut ?? 8192;
}

/** Tên hiển thị; model ngoài danh sách (model thật mà `openrouter/free` chọn) giữ nguyên mã. */
export function modelLabel(id: string): string {
  return MODELS.find((m) => m.id === id)?.label ?? id;
}

/*
  Tự chọn model bằng quy tắc, không tốn thêm một lượt gọi mô hình. Mỗi dấu hiệu
  cộng điểm: câu hỏi đòi phân tích, so sánh, rà soát hay soạn thảo; câu hỏi dài;
  câu hỏi chạm hai lĩnh vực chuyên môn; cuộc trò chuyện đã sang lượt thứ ba.
  Không có dấu hiệu nào là câu hỏi dễ (3.6 Flash), từ ba điểm là câu hỏi khó
  (3.1 Pro), còn lại là câu hỏi vừa (3.8 Flash). Người dùng chọn hẳn 3.1 Pro thì
  ngưỡng Pro hạ xuống hai điểm, nhưng câu hỏi dễ hay vừa vẫn chạy bằng Flash.
  Từ khóa so ở dạng bỏ dấu, để câu gõ không dấu cũng khớp.
*/
const HARD = [
  "phân tích", "so sánh", "đánh giá", "rà soát", "soát xét", "soạn", "chiến lược", "rủi ro",
  "tranh chấp", "khởi kiện", "phương án", "lập luận", "điều khoản",
  "analyse", "analyze", "compare", "review", "draft", "strategy", "risk", "dispute", "clause",
].map((k) => ` ${fold(k)} `);

export function autoModel(userTexts: string[], skills: SkillId[], preferPro = false): ModelId {
  const last = userTexts[userTexts.length - 1] ?? "";
  const text = ` ${fold(last).replace(/[^\p{L}\p{N}]+/gu, " ")} `;
  let score = 0;
  if (HARD.some((k) => text.includes(k))) score += 2;
  if (last.length > 600) score += 2;
  else if (last.length > 200) score += 1;
  if (skills.filter((s) => s !== "vn-orchestrator").length >= 2) score += 1;
  if (userTexts.length >= 3) score += 1;
  return score >= (preferPro ? 2 : 3) ? PRO : score >= 1 ? STANDARD : LIGHT;
}

/**
 * Thứ tự thử model: model đã chọn trước, rồi các bản Flash. Không bao giờ tự
 * nâng lên Pro khi model đã chọn lỗi, để chi phí không vượt lựa chọn ban đầu.
 * Model OpenRouter lỗi thì thử bộ định tuyến miễn phí trước khi sang Gemini.
 */
export function modelChain(first: ModelId): ModelId[] {
  const free: ModelId[] = providerOf(first) === "openrouter" ? [FREE_ROUTER] : [];
  return [...new Set<ModelId>([first, ...free, STANDARD, LIGHT])];
}
