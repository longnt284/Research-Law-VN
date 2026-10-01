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
 * dài câu trả lời của model, theo tài liệu của nhà cung cấp. `pick: false` là
 * model chỉ dùng làm dự phòng, không hiện trong ô chọn.
 *
 * Hạn mức của Gemini API tính theo project, không theo khóa, và mỗi model có
 * hạn mức riêng. Các model dự phòng cùng khóa vì thế là thêm sức chứa thật:
 * model này hết lượt thì câu hỏi sang model kế tiếp còn lượt.
 */

export const FREE_ROUTER = "openrouter/free";
/** Mã model của câu trả lời tra cứu tự động, không dùng mô hình (`offline.ts`). */
export const OFFLINE_MODEL = "offline";

export const MODELS = [
  { id: "gemini-3.6-flash", label: "Gemini 3.6 Flash", provider: "gemini", maxOut: 65_536, pick: true },
  { id: "gemini-3.8-flash", label: "Gemini 3.8 Flash", provider: "gemini", maxOut: 65_536, pick: true },
  { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro", provider: "gemini", maxOut: 65_536, pick: true },
  // Dự phòng cùng khóa Gemini. Trần 32.768 là mức an toàn cho mọi bản Flash và
  // Flash-Lite; câu trả lời dài hơn được viết tiếp như thường.
  { id: "gemini-3.7-flash", label: "Gemini 3.7 Flash", provider: "gemini", maxOut: 32_768, pick: false },
  { id: "gemini-3.5-flash", label: "Gemini 3.5 Flash", provider: "gemini", maxOut: 32_768, pick: false },
  { id: "gemini-3.5-flash-lite", label: "Gemini 3.5 Flash-Lite", provider: "gemini", maxOut: 32_768, pick: false },
  { id: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash-Lite", provider: "gemini", maxOut: 32_768, pick: false },
  { id: "nvidia/nemotron-3-ultra-550b-a55b:free", label: "Nemotron 3 Ultra", provider: "openrouter", maxOut: 65_536, pick: true },
  { id: "thinkingmachines/inkling:free", label: "Inkling", provider: "openrouter", maxOut: 262_144, pick: true },
  { id: "qwen/qwen3.8-27b:free", label: "Qwen3.8 27B", provider: "openrouter", maxOut: 235_929, pick: true },
  { id: "google/gemma-4-31b-it:free", label: "Gemma 4 31B", provider: "openrouter", maxOut: 32_768, pick: true },
  { id: "nvidia/nemotron-3-super-120b-a12b:free", label: "Nemotron 3 Super", provider: "openrouter", maxOut: 235_929, pick: true },
  // Bộ định tuyến chọn ngẫu nhiên một model miễn phí; giữ trần cũ để không loại
  // bớt model có trần thấp khỏi lượt chọn.
  { id: FREE_ROUTER, label: "OpenRouter Free", provider: "openrouter", maxOut: 8192, pick: true },
] as const;

export type ModelId = (typeof MODELS)[number]["id"];
export type ModelChoice = "auto" | ModelId;
export type ModelProvider = (typeof MODELS)[number]["provider"];

const LIGHT: ModelId = "gemini-3.6-flash";
export const STANDARD: ModelId = "gemini-3.8-flash";
export const PRO: ModelId = "gemini-3.1-pro-preview";

/**
 * Gemini 3.1 Pro không có ở Free tier của Gemini API: gọi tới chỉ nhận lỗi rồi
 * lùi về Flash. Vì vậy Pro tắt cho tới khi project Gemini có billing; bật bằng
 * `NEXT_PUBLIC_CHAT_PRO=1`. Tắt thì ô chọn không có Pro, trang không tự chọn
 * Pro, còn suy luận mở rộng vẫn chạy trên Flash. Biến có tiền tố
 * `NEXT_PUBLIC_` vì khung chat trên trình duyệt cũng cần biết.
 */
export const PRO_ENABLED = process.env.NEXT_PUBLIC_CHAT_PRO === "1";

/** Model hiện trong ô chọn. */
export function pickable(id: string): boolean {
  return MODELS.some((m) => m.id === id && m.pick && (id !== PRO || PRO_ENABLED));
}

export function isModelChoice(v: unknown): v is ModelChoice {
  return v === "auto" || (typeof v === "string" && pickable(v));
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
  Pro đang tắt (`PRO_ENABLED`) thì câu hỏi khó chạy bằng 3.8 Flash.
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
  if (PRO_ENABLED && score >= (preferPro ? 2 : 3)) return PRO;
  return score >= 1 ? STANDARD : LIGHT;
}

/** Các bản Flash cùng khóa Gemini, theo thứ tự thử khi model trước từ chối. */
const FLASH_LADDER: ModelId[] = [
  STANDARD,
  "gemini-3.7-flash",
  LIGHT,
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
];

/**
 * Thứ tự thử model: model đã chọn trước, rồi lần lượt các bản Flash, mỗi bản
 * một hạn mức riêng. Sau chuỗi này `provider.ts` còn thử các model trong
 * `CHAT_FALLBACK_MODEL`, rồi route trả lời bằng tra cứu tự động. Không bao giờ
 * tự nâng lên Pro khi model đã chọn lỗi, để chi phí không vượt lựa chọn ban
 * đầu. Model OpenRouter lỗi thì thử bộ định tuyến miễn phí trước khi sang
 * Gemini.
 */
export function modelChain(first: ModelId): ModelId[] {
  const free: ModelId[] = providerOf(first) === "openrouter" ? [FREE_ROUTER] : [];
  return [...new Set<ModelId>([first, ...free, ...FLASH_LADDER])];
}
