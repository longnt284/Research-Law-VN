import type { Lang } from "@/data/types";
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
  launch: "Hỏi trợ lý",
  title: "Trợ lý hỏi đáp",
  badge: "Thử nghiệm",
  notice:
    "Câu trả lời do máy tạo, chỉ để tham khảo và có thể sai; không phải tư vấn pháp lý. Câu hỏi được gửi tới Google (Gemini) hoặc OpenRouter, máy chủ ở nước ngoài, và có thể được họ dùng để cải thiện mô hình. Đừng nhập họ tên, số giấy tờ, thông tin liên hệ hay chi tiết bí mật của vụ việc.",
  policy: "Chính sách riêng tư",
  placeholder: "Nhập câu hỏi pháp lý…",
  send: "Gửi",
  stop: "Dừng",
  reset: "Trò chuyện mới",
  close: "Đóng",
  intro:
    "Hỏi về hiệu lực văn bản, đất đai, xây dựng, năng lượng, PPP, fintech, dữ liệu hay tranh chấp. Văn bản có trong kho của trang được dẫn kèm đường dẫn; văn bản ngoài kho mang nhãn chưa xác minh.",
  examples: [
    "Luật Đất đai 2024 còn hiệu lực không?",
    "Mua đất chưa có sổ đỏ, đã đặt cọc thì có rủi ro gì?",
    "Hợp đồng FIDIC bị sửa Clause 20 cần lưu ý gì?",
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
  stopped: "Đã dừng.",
  errors: {
    rate: "Bạn đã hỏi quá số lượt cho phép. Thử lại sau ít phút.",
    config: "Trợ lý đang tạm ngưng.",
    upstream: "Mô hình đang quá tải hoặc đã hết lượt miễn phí hôm nay. Thử lại sau.",
    long: "Câu hỏi quá dài, tối đa 2.000 ký tự.",
    network: "Không kết nối được. Kiểm tra mạng rồi thử lại.",
    empty: "Không nhận được câu trả lời. Thử hỏi lại.",
    other: "Có lỗi xảy ra. Thử lại sau.",
  },
};

const en: ChatCopy = {
  launch: "Ask the assistant",
  title: "Q&A assistant",
  badge: "Beta",
  notice:
    "Answers are machine-generated, for reference only and may be wrong; they are not legal advice. Questions are sent to Google (Gemini) or OpenRouter, whose servers are outside Vietnam, and may be used by them to improve their models. Do not enter names, ID numbers, contact details or confidential details of a matter.",
  policy: "Privacy policy",
  placeholder: "Type a legal question…",
  send: "Send",
  stop: "Stop",
  reset: "New chat",
  close: "Close",
  intro:
    "Ask about the validity of an instrument, land, construction, energy, PPP, fintech, data or disputes. Instruments in this site's dataset are cited with a link; anything outside it is marked unverified.",
  examples: [
    "Is the 2024 Land Law in force?",
    "What should a contractor watch for in an amended FIDIC Clause 20?",
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
  stopped: "Stopped.",
  errors: {
    rate: "You have reached the question limit. Try again in a few minutes.",
    config: "The assistant is paused.",
    upstream: "The model is busy or has used up today's free quota. Try again later.",
    long: "The question is too long; the limit is 2,000 characters.",
    network: "Could not connect. Check your connection and try again.",
    empty: "No answer came back. Try asking again.",
    other: "Something went wrong. Try again later.",
  },
};

export function getChatCopy(lang: Lang): ChatCopy {
  return lang === "vi" ? vi : en;
}
