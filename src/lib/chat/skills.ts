import { createDecipheriv } from "node:crypto";

import type { DomainId } from "@/data/types";
import { fold } from "@/lib/search-engine";

import bundle from "./skills.enc.json";

/**
 * Bộ skill pháp lý của trợ lý hỏi đáp, và cách chọn skill cho một câu hỏi.
 *
 * Thân skill là tài sản riêng còn repo thì công khai, nên chỉ bản mã hóa nằm
 * trong repo (`skills.enc.json`, đóng gói bằng `scripts/pack-chat-skills.mjs`).
 * Khóa đến từ `CHAT_SKILLS_KEY`, chỉ có trên máy chủ. Tệp này chỉ được route
 * `/api/chat` nhập, nên bản mã hóa không bao giờ xuống trình duyệt.
 *
 * Gói là một bảng tên mục → chữ: thân skill mang khóa là tên skill, tệp tham
 * chiếu của skill mang khóa `<skill>/references/<tệp>`.
 */

/** Phải khớp danh sách `SKILLS` trong `scripts/pack-chat-skills.mjs`. */
export const SKILL_IDS = [
  "vn-orchestrator",
  "vn-construction-partner",
  "vn-energy-partner",
  "vn-ppp-partner",
  "vn-land-realestate",
  "vn-fintech-partner",
  "vn-data-privacy-partner",
  "vn-litigation-partner",
  "vn-legal-review",
] as const;

export type SkillId = (typeof SKILL_IDS)[number];

let library: Record<string, string> | undefined;

/** Mọi mục của gói. Ném lỗi khi thiếu khóa hoặc khóa sai: route trả 503. */
export function skillLibrary(): Record<string, string> {
  library ??= decrypt();
  return library;
}

/** Thân một skill. */
export function skillBody(id: SkillId): string {
  return skillLibrary()[id];
}

function decrypt(): Record<string, string> {
  const key = Buffer.from(process.env.CHAT_SKILLS_KEY ?? "", "base64");
  if (key.length !== 32) throw new Error("CHAT_SKILLS_KEY chưa đặt hoặc không đủ 32 byte");
  const d = createDecipheriv("aes-256-gcm", key, Buffer.from(bundle.iv, "base64"));
  d.setAuthTag(Buffer.from(bundle.tag, "base64"));
  const json = Buffer.concat([d.update(Buffer.from(bundle.data, "base64")), d.final()]).toString("utf8");
  const out = JSON.parse(json) as Record<string, unknown>;
  for (const id of SKILL_IDS) {
    if (typeof out[id] !== "string") throw new Error(`Gói skill thiếu ${id}`);
  }
  for (const [k, v] of Object.entries(out)) {
    if (typeof v !== "string") throw new Error(`Mục ${k} của gói skill không phải chữ`);
  }
  return out as Record<string, string>;
}

/*
  Chọn skill bằng từ khóa, không tốn thêm một lượt gọi mô hình. Từ khóa lấy từ
  phần "PHẢI dùng khi nhắc tới" trong mô tả của từng skill. Bỏ những từ dễ khớp
  nhầm: "bot" (nằm trong "chatbot"), "kiện" đứng riêng (nằm trong "điều kiện"),
  "cọc" đứng riêng (nằm trong "đặt cọc"), "phát sinh", "bồi thường" đứng riêng.

  `domains` là lĩnh vực của kho văn bản trên trang ứng với tuyến đó: văn bản
  thuộc các lĩnh vực này được gửi kèm câu hỏi làm nguồn đã tra cứu. Các tuyến
  của `vn-orchestrator` phủ những lĩnh vực chưa có skill riêng.
*/
interface Route {
  skill: SkillId;
  domains: DomainId[];
  keywords: string[];
}

const ROUTES: Route[] = [
  {
    skill: "vn-construction-partner",
    domains: ["xay-dung"],
    keywords: [
      "xây dựng", "thi công", "hợp đồng thi công", "thầu phụ", "nhà thầu", "đấu thầu", "gói thầu",
      "nghiệm thu", "quyết toán", "bảo hành công trình", "tiến độ", "chậm tiến độ", "fidic",
      "red book", "yellow book", "silver book", "epc", "particular conditions", "notice of claim",
      "dab", "daab", "biện pháp thi công", "bptc", "bê tông", "cọc khoan nhồi", "ép cọc",
      "móng cọc", "nền móng", "kết cấu",
      "công trình", "giấy phép xây dựng", "tư vấn giám sát", "construction", "contractor",
      "subcontract", "subcontractor",
    ],
  },
  {
    skill: "vn-energy-partner",
    domains: ["nang-luong"],
    keywords: [
      "năng lượng", "điện mặt trời", "điện mặt trời mái nhà", "đmtmn", "điện mái nhà", "solar",
      "tấm pin", "inverter", "bán điện", "mua điện", "điện dư", "dppa", "ppa", "evn", "giá fit",
      "feed in tariff", "lng", "fsru", "take or pay", "ccgt", "điện khí", "bess", "lưu trữ điện",
      "điện gió", "thủy điện", "điện rác", "đấu nối", "giấy phép điện lực", "quy hoạch điện",
      "energy", "power purchase", "renewable",
    ],
  },
  {
    skill: "vn-ppp-partner",
    domains: ["ppp"],
    keywords: [
      "ppp", "đối tác công tư", "dự án bot", "hợp đồng bot", "bto", "boo", "btl", "blt",
      "hợp đồng bt", "dự án bt", "doanh nghiệp dự án", "cơ quan ký kết hợp đồng",
      "vốn nhà nước tham gia", "chia sẻ doanh thu", "giảm doanh thu", "lựa chọn nhà đầu tư",
      "trạm thu phí", "nhượng quyền", "public private partnership",
    ],
  },
  {
    skill: "vn-land-realestate",
    domains: ["dat-dai"],
    keywords: [
      "đất", "đất đai", "sổ đỏ", "sổ hồng", "giấy chứng nhận quyền sử dụng đất", "quyền sử dụng đất",
      "thửa đất", "quy hoạch", "chuyển mục đích sử dụng đất", "thu hồi đất", "giải phóng mặt bằng",
      "tái định cư", "tiền sử dụng đất", "tiền thuê đất", "bảng giá đất", "giá đất", "đặt cọc",
      "nhà ở", "chung cư", "căn hộ", "nhà ở xã hội", "bất động sản", "chuyển nhượng dự án",
      "land", "land use", "real estate",
    ],
  },
  {
    skill: "vn-fintech-partner",
    domains: ["fintech"],
    keywords: [
      "fintech", "crypto", "tiền ảo", "tiền mã hóa", "tiền điện tử", "tài sản số", "tài sản mã hóa",
      "tài sản ảo", "bitcoin", "coin", "stablecoin", "token", "blockchain", "defi", "nft",
      "sàn giao dịch", "chứng khoán", "cổ phiếu", "trái phiếu", "quỹ đầu tư", "ví điện tử",
      "trung gian thanh toán", "cho vay ngang hàng", "p2p", "open api", "sandbox", "rửa tiền",
      "giao dịch thuật toán", "digital asset", "securities", "e wallet", "payment",
    ],
  },
  {
    skill: "vn-data-privacy-partner",
    domains: ["du-lieu"],
    keywords: [
      "dữ liệu", "dữ liệu cá nhân", "bảo vệ dữ liệu", "lộ dữ liệu", "rò rỉ", "bị hack",
      "tấn công mạng", "ransomware", "an ninh mạng", "an toàn thông tin", "dpo", "dpia", "cookie",
      "gdpr", "quyền riêng tư", "chuyển dữ liệu ra nước ngoài", "personal data", "data protection",
      "privacy", "data breach", "cybersecurity",
    ],
  },
  {
    skill: "vn-litigation-partner",
    domains: ["to-tung"],
    keywords: [
      "khởi kiện", "kiện ra tòa", "bị kiện", "đơn khởi kiện", "tòa án", "tòa", "thời hiệu",
      "trọng tài", "viac", "icc", "siac", "hkiac", "lcia", "uncitral", "phán quyết",
      "hủy phán quyết", "biện pháp khẩn cấp tạm thời", "phản tố", "luận cứ", "hòa giải",
      "thi hành án", "tranh chấp", "bản án", "án lệ", "lawsuit", "litigation", "arbitration",
      "court", "dispute", "disputes",
    ],
  },
  {
    skill: "vn-legal-review",
    domains: [],
    keywords: [
      "đúng không", "có đúng", "đúng hay sai", "sai không", "nhận định", "review", "rà soát",
      "soát xét", "xem giúp", "kiểm tra giúp", "cơ sở pháp lý", "điều khoản", "hợp đồng này",
      "is this correct", "is it true",
    ],
  },
  {
    skill: "vn-orchestrator",
    domains: ["doanh-nghiep"],
    keywords: [
      "doanh nghiệp", "công ty", "cổ đông", "góp vốn", "vốn điều lệ", "thành lập công ty",
      "giải thể", "phá sản", "corporate", "company", "shareholder",
    ],
  },
  {
    skill: "vn-orchestrator",
    domains: ["dau-tu"],
    keywords: [
      "đầu tư", "nhà đầu tư nước ngoài", "giấy chứng nhận đăng ký đầu tư", "chủ trương đầu tư",
      "investment", "investor",
    ],
  },
  {
    skill: "vn-orchestrator",
    domains: ["lao-dong"],
    keywords: [
      "lao động", "người lao động", "hợp đồng lao động", "sa thải", "kỷ luật lao động", "tiền lương",
      "bảo hiểm xã hội", "thôi việc", "employment", "labour", "labor",
    ],
  },
  {
    skill: "vn-orchestrator",
    domains: ["thue"],
    keywords: ["thuế", "hóa đơn", "thuế thu nhập", "thuế gtgt", "vat", "tax", "invoice"],
  },
  {
    skill: "vn-orchestrator",
    domains: ["hop-dong"],
    keywords: [
      "hợp đồng", "thương mại", "phạt vi phạm", "bồi thường thiệt hại", "contract", "commercial",
    ],
  },
  /*
    Lĩnh vực ngoài kho văn bản của trang, nên không kèm văn bản nào. Các tuyến
    này để câu hỏi dân sự, gia đình, hình sự, hành chính không rơi vào skill
    chuyên ngành chỉ vì có chữ "tranh chấp" hay "tòa án".
  */
  {
    skill: "vn-orchestrator",
    domains: [],
    keywords: [
      "dân sự", "bộ luật dân sự", "giao dịch dân sự", "thừa kế", "di chúc", "di sản", "vay tiền",
      "đòi nợ", "ủy quyền", "civil code", "inheritance",
    ],
  },
  {
    skill: "vn-orchestrator",
    domains: [],
    keywords: [
      "hôn nhân", "kết hôn", "ly hôn", "nuôi con", "cấp dưỡng", "tài sản chung", "divorce", "marriage",
      "custody",
    ],
  },
  {
    skill: "vn-orchestrator",
    domains: [],
    keywords: [
      "hình sự", "bộ luật hình sự", "tội", "phạm tội", "truy cứu trách nhiệm hình sự", "án tù",
      "tố cáo", "criminal", "crime",
    ],
  },
  {
    skill: "vn-orchestrator",
    domains: [],
    keywords: [
      "xử phạt hành chính", "vi phạm hành chính", "khiếu nại", "thủ tục hành chính", "cư trú",
      "căn cước", "administrative",
    ],
  },
  {
    skill: "vn-orchestrator",
    domains: [],
    keywords: [
      "sở hữu trí tuệ", "nhãn hiệu", "quyền tác giả", "bản quyền", "sáng chế", "kiểu dáng công nghiệp",
      "intellectual property", "trademark", "copyright", "patent",
    ],
  },
  {
    skill: "vn-orchestrator",
    domains: [],
    keywords: [
      "bảo hiểm", "giao thông", "giấy phép lái xe", "bằng lái", "nồng độ cồn", "insurance", "traffic",
    ],
  },
];

/*
  Chuẩn hóa để so từ khóa: dạng NFC, chữ thường, dấu thanh đặt theo một kiểu
  ("hoá" và "hóa", "thuỷ" và "thủy" thành một), mọi ký tự không phải chữ hay số
  thành khoảng trắng. Hai đầu có khoảng trắng để so được trọn từ.
*/
const TONE: Record<string, string> = {
  "oá": "óa", "oà": "òa", "oả": "ỏa", "oã": "õa", "oạ": "ọa",
  "oé": "óe", "oè": "òe", "oẻ": "ỏe", "oẽ": "õe", "oẹ": "ọe",
  "uý": "úy", "uỳ": "ùy", "uỷ": "ủy", "uỹ": "ũy", "uỵ": "ụy",
};

export function norm(s: string): string {
  const t = s
    .normalize("NFC")
    .toLowerCase()
    .replace(/o[áàảãạéèẻẽẹ]|u[ýỳỷỹỵ]/g, (m) => TONE[m])
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
  return ` ${t} `;
}

/*
  Tin gõ không dấu ("mua dat chua co so do") so với từ khóa đã bỏ dấu, trừ từ
  khóa tiếng Việt một chữ: bỏ dấu thì "đất", "đặt", "đạt" cùng thành "dat". Tin
  có dấu không bao giờ so kiểu này, để "sơ đồ" không khớp "sổ đỏ".
*/
const PREPARED = ROUTES.map((r) => {
  const keys = r.keywords.map(norm);
  const plainKeys = keys.filter((k) => k.trim().includes(" ") || fold(k) === k).map(fold);
  return { ...r, keys, plainKeys };
});

export interface Picked {
  skills: SkillId[];
  domains: DomainId[];
}

/**
 * Chọn tối đa hai skill cho cuộc trò chuyện.
 *
 * `userTexts` là các tin của người dùng theo thứ tự thời gian; tin cuối được
 * tính gấp đôi để câu hỏi mới nhất quyết định khi chủ đề đổi. Tuyến được giữ
 * khi đạt ít nhất nửa điểm của tuyến cao nhất. `vn-orchestrator` chỉ được chọn
 * khi đứng đầu: các skill chuyên ngành đã mang sẵn phần lõi của nó.
 */
export function pickRoutes(userTexts: string[]): Picked {
  const recent = userTexts.slice(-3).map(norm);
  const scored = PREPARED.map((r) => {
    let score = 0;
    recent.forEach((text, i) => {
      const weight = i === recent.length - 1 ? 2 : 1;
      const keys = fold(text) === text ? r.plainKeys : r.keys;
      for (const k of keys) if (text.includes(k)) score += weight;
    });
    return { r, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return { skills: ["vn-orchestrator"], domains: [] };

  const kept = scored.filter((x) => x.score * 2 >= scored[0].score);
  const skills: SkillId[] = [];
  for (const { r } of kept) {
    if (r.skill === "vn-orchestrator" && skills.length > 0) continue;
    if (!skills.includes(r.skill)) skills.push(r.skill);
    if (skills.length === 2) break;
  }
  const domains = [...new Set(kept.flatMap(({ r }) => r.domains))];
  return { skills, domains };
}
