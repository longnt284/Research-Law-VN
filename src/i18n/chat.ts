import type { Lang } from "@/data/types";
import type { ModelId } from "@/lib/chat/models";
import type { SkillId } from "@/lib/chat/skills";

/** Chữ của trợ lý hỏi đáp: nút mở, khung chat, thông báo và lỗi. */
export interface ChatCopy {
  launch: string;
  title: string;
  badge: string;
  notice: string;
  policy: string;
  placeholder: string;
  send: string;
  stop: string;
  reset: string;
  close: string;
  intro: string;
  examples: string[];
  skillPrefix: string;
  skills: Record<SkillId, string>;
  modelPrefix: string;
  auto: string;
  autoTag: string;
  modelHints: Record<ModelId, string>;
  groupGemini: string;
  groupFree: string;
  /** Lưu ý dưới ô chọn khi chọn 3.1 Pro, và khi chọn model OpenRouter. */
  proNote: string;
  freeNote: string;
  /** Tên hiển thị của `openrouter/free` trước khi biết model thật. */
  freeModel: string;
  thinking: string;
  thinkingNow: string;
  thinkingDone: string;
  limited: { pro: string; free: string };
  /** Câu trả lời chưa trọn: lý do, nút viết tiếp và tin nút đó gửi đi. */
  cut: { length: string; time: string; cut: string };
  more: string;
  moreText: string;
  reference: string;
  stopped: string;
  errors: {
    rate: string;
    config: string;
    upstream: string;
    long: string;
    network: string;
    empty: string;
    other: string;
  };
}

const vi: ChatCopy = {
  launch: "Hỏi trợ lý AI",
  title: "Trợ lý hỏi đáp",
  badge: "Thử nghiệm",
  notice:
    "Câu trả lời do máy tạo, chỉ để tham khảo và có thể sai; không phải tư vấn pháp lý. Câu hỏi được gửi tới Google (Gemini) hoặc OpenRouter, máy chủ ở nước ngoài, và có thể được họ dùng để cải thiện mô hình. Đừng nhập họ tên, số giấy tờ, thông tin liên hệ hay chi tiết bí mật của vụ việc.",
  policy: "Chính sách riêng tư",
  placeholder: "Nhập câu hỏi…",
  send: "Gửi",
  stop: "Dừng",
  reset: "Trò chuyện mới",
  close: "Đóng",
  intro:
    "Hỏi về mọi vấn đề pháp luật, hiệu lực và cơ sở pháp lý của văn bản, hay cách dùng trang này. Văn bản có trong kho của trang được dẫn kèm đường dẫn; văn bản chưa được đối chiếu mang nhãn chưa xác minh.",
  examples: [
    "Luật Đất đai 2024 còn hiệu lực không?",
    "Mua đất chưa có sổ đỏ, đã đặt cọc thì có rủi ro gì?",
    "Làm sao xem văn bản nào còn hiệu lực tại một ngày trong quá khứ?",
  ],
  skillPrefix: "Chuyên môn",
  skills: {
    "vn-orchestrator": "Tổng quát",
    "vn-construction-partner": "Xây dựng & FIDIC",
    "vn-energy-partner": "Năng lượng",
    "vn-ppp-partner": "Đối tác công tư",
    "vn-land-realestate": "Đất đai & Bất động sản",
    "vn-fintech-partner": "Fintech & Tài sản số",
    "vn-data-privacy-partner": "Dữ liệu & An ninh mạng",
    "vn-litigation-partner": "Tố tụng & Trọng tài",
    "vn-legal-review": "Rà soát pháp lý",
  },
  modelPrefix: "Model",
  auto: "Tự động theo độ khó",
  autoTag: "tự chọn",
  modelHints: {
    "gemini-3.6-flash": "nhanh",
    "gemini-3.8-flash": "cân bằng",
    "gemini-3.1-pro-preview": "chuyên sâu",
    "nvidia/nemotron-3-ultra-550b-a55b:free": "suy luận sâu",
    "thinkingmachines/inkling:free": "đa năng",
    "qwen/qwen3.8-27b:free": "đa ngôn ngữ",
    "google/gemma-4-31b-it:free": "gọn, đa ngôn ngữ",
    "nvidia/nemotron-3-super-120b-a12b:free": "nhanh, ngữ cảnh dài",
    "openrouter/free": "",
  },
  groupGemini: "Gemini",
  groupFree: "Miễn phí qua OpenRouter",
  proNote:
    "Gemini 3.1 Pro chỉ chạy khi câu hỏi thật sự khó (phân tích, so sánh, soạn thảo, câu hỏi dài). Câu đơn giản tự dùng 3.8 Flash hoặc 3.6 Flash cho nhanh.",
  freeNote:
    "Model miễn phí: tốc độ và chất lượng tiếng Việt khác nhau theo model, có hạn mức lượt riêng mỗi ngày. Model lỗi hay hết lượt thì câu hỏi tự chuyển sang model khác.",
  freeModel: "Model miễn phí ngẫu nhiên",
  thinking: "Suy luận mở rộng",
  thinkingNow: "Đang suy luận…",
  thinkingDone: "Xem phần suy luận",
  limited: {
    pro: "Hôm nay bạn đã dùng hết lượt Gemini 3.1 Pro và suy luận mở rộng; câu này trả lời ở chế độ thường.",
    free: "Hôm nay bạn đã dùng hết lượt chọn model OpenRouter; câu này trả lời bằng Gemini.",
  },
  cut: {
    length: "Câu trả lời dài vượt giới hạn một lượt.",
    time: "Câu trả lời dừng vì hết thời gian xử lý.",
    cut: "Câu trả lời bị ngắt giữa chừng.",
  },
  more: "Viết tiếp",
  moreText: "Viết tiếp phần còn lại của câu trả lời trên.",
  reference: "Nội dung chỉ mang tính tham khảo. Hãy tự tìm hiểu thêm để chắc chắn kết quả đúng.",
  stopped: "Đã dừng.",
  errors: {
    rate: "Bạn đã hỏi quá số lượt cho phép. Thử lại sau ít phút.",
    config: "Trợ lý đang tạm ngưng.",
    upstream: "Mô hình đang quá tải hoặc đã hết lượt miễn phí hôm nay. Thử lại sau.",
    long: "Câu hỏi quá dài, tối đa 6.000 ký tự.",
    network: "Không kết nối được. Kiểm tra mạng rồi thử lại.",
    empty: "Không nhận được câu trả lời. Thử hỏi lại.",
    other: "Có lỗi xảy ra. Thử lại sau.",
  },
};

const en: ChatCopy = {
  launch: "Ask the AI assistant",
  title: "Q&A assistant",
  badge: "Beta",
  notice:
    "Answers are machine-generated, for reference only and may be wrong; they are not legal advice. Questions are sent to Google (Gemini) or OpenRouter, whose servers are outside Vietnam, and may be used by them to improve their models. Do not enter names, ID numbers, contact details or confidential details of a matter.",
  policy: "Privacy policy",
  placeholder: "Type your question…",
  send: "Send",
  stop: "Stop",
  reset: "New chat",
  close: "Close",
  intro:
    "Ask about any legal matter, the validity and legal basis of an instrument, or how to use this site. Instruments in this site's dataset are cited with a link; anything not yet checked is marked unverified.",
  examples: [
    "Is the 2024 Land Law in force?",
    "How do I see which instruments were in force on a past date?",
    "Can a foreigner own an apartment in Vietnam?",
  ],
  skillPrefix: "Expertise",
  skills: {
    "vn-orchestrator": "General",
    "vn-construction-partner": "Construction & FIDIC",
    "vn-energy-partner": "Energy",
    "vn-ppp-partner": "Public-private partnership",
    "vn-land-realestate": "Land & real estate",
    "vn-fintech-partner": "Fintech & digital assets",
    "vn-data-privacy-partner": "Data & cybersecurity",
    "vn-litigation-partner": "Litigation & arbitration",
    "vn-legal-review": "Legal review",
  },
  modelPrefix: "Model",
  auto: "Automatic by difficulty",
  autoTag: "auto",
  modelHints: {
    "gemini-3.6-flash": "fast",
    "gemini-3.8-flash": "balanced",
    "gemini-3.1-pro-preview": "in-depth",
    "nvidia/nemotron-3-ultra-550b-a55b:free": "deep reasoning",
    "thinkingmachines/inkling:free": "general purpose",
    "qwen/qwen3.8-27b:free": "multilingual",
    "google/gemma-4-31b-it:free": "compact, multilingual",
    "nvidia/nemotron-3-super-120b-a12b:free": "fast, long context",
    "openrouter/free": "",
  },
  groupGemini: "Gemini",
  groupFree: "Free via OpenRouter",
  proNote:
    "Gemini 3.1 Pro runs only when the question is genuinely hard (analysis, comparison, drafting, long questions). Simple questions use 3.8 Flash or 3.6 Flash for speed.",
  freeNote:
    "Free models: speed and quality vary by model, with a separate daily quota. If a model fails or runs out, the question moves to another model.",
  freeModel: "Random free model",
  thinking: "Extended thinking",
  thinkingNow: "Thinking…",
  thinkingDone: "Show reasoning",
  limited: {
    pro: "You have used today's Gemini 3.1 Pro and extended-thinking quota; this answer uses the standard mode.",
    free: "You have used today's quota for picking an OpenRouter model; this answer uses Gemini.",
  },
  cut: {
    length: "The answer ran past the length limit of one turn.",
    time: "The answer stopped because the time limit was reached.",
    cut: "The answer was interrupted.",
  },
  more: "Continue",
  moreText: "Continue the rest of the answer above.",
  reference: "This content is for reference only. Do your own research to make sure it is correct.",
  stopped: "Stopped.",
  errors: {
    rate: "You have reached the question limit. Try again in a few minutes.",
    config: "The assistant is paused.",
    upstream: "The model is busy or has used up today's free quota. Try again later.",
    long: "The question is too long; the limit is 6,000 characters.",
    network: "Could not connect. Check your connection and try again.",
    empty: "No answer came back. Try asking again.",
    other: "Something went wrong. Try again later.",
  },
};

export function getChatCopy(lang: Lang): ChatCopy {
  return lang === "vi" ? vi : en;
}
