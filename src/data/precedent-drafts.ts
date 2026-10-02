import { domains } from "@/data/documents";
import type { Bilingual, Confidence, DomainId } from "@/data/types";

/**
 * Dự thảo án lệ, đặt ngoài kho văn bản.
 *
 * Dự thảo án lệ là bản Tòa án nhân dân tối cao đăng để lấy ý kiến, chưa được
 * Hội đồng Thẩm phán thông qua và không được viện dẫn trong xét xử. Nếu để
 * chung với `documents`, dự thảo sẽ đi vào tra hiệu lực theo ngày, gia phả, tìm
 * kiếm và nguồn dữ liệu công khai, nơi mọi bản ghi đều được đọc như một nguồn
 * đang hoặc đã có giá trị áp dụng. Vì vậy dự thảo nằm ở tệp riêng, chỉ hiện ở
 * trang lĩnh vực Án lệ dưới nhãn tham khảo, và chỉ được gửi cho trợ lý kèm nhãn
 * dự thảo.
 *
 * Tình trạng của dự thảo đổi nhanh: một dự thảo có thể được thông qua thành án
 * lệ hoặc bị loại ở phiên họp kế tiếp. Mỗi bản ghi chỉ đúng tại `verifiedOn`.
 */

export interface PrecedentDraft {
  id: string;
  /** Số của dự thảo theo cách Tòa án nhân dân tối cao đánh số, ví dụ "Dự thảo án lệ số 12/2025". */
  label: Bilingual;
  title: Bilingual;
  /** Hai tới bốn câu văn xuôi; chỗ nào chưa đọc được nội dung thì nói rõ. */
  summary: Bilingual;
  /** Lĩnh vực của kho mà dự thảo chạm tới, dùng để dẫn người đọc sang văn bản liên quan. */
  domains: DomainId[];
  sources: string[];
  confidence: Confidence;
  verifiedOn: string;
}

const VERIFIED = "2026-10-01";
const ANLE = "https://anle.toaan.gov.vn/webcenter";
const TVPL_BA = "https://thuvienphapluat.vn/banan/tin-tuc";

/** Bối cảnh của các đợt dự thảo, hiện ở đầu mục dự thảo. */
export const DRAFT_CONTEXT: { text: Bilingual; sources: string[]; verifiedOn: string } = {
  text: {
    vi: "Năm 2025, Tòa án nhân dân tối cao đăng 20 dự thảo án lệ để lấy ý kiến; Hội đồng tư vấn án lệ cho ý kiến ngày 22/12/2025. Một số dự thảo của đợt này trùng chủ đề với các án lệ công bố tháng 5/2026 (Án lệ 84, 88, 89 và 90/2026/AL). Bốn dự thảo dưới đây chưa có trong danh sách án lệ đã công bố tính tới Án lệ 90/2026/AL. Năm 2026, Tòa án nhân dân tối cao xây dựng tiếp 42 dự thảo (13 dân sự, 9 hình sự, 12 kinh doanh, thương mại, 8 hành chính, hôn nhân và gia đình, lao động), lấy ý kiến tại hội thảo ngày 11 và 12/6/2026; nội dung từng dự thảo của đợt này chưa tra được.",
    en: "In 2025 the Supreme People's Court published 20 draft precedents for comment; the Precedent Advisory Council gave its views on 22 December 2025. Several drafts in that batch share their subject with precedents published in May 2026 (Precedents 84, 88, 89 and 90/2026/AL). The four drafts below are not among the precedents published up to Precedent 90/2026/AL. In 2026 the Court prepared a further 42 drafts (13 civil, 9 criminal, 12 business and commercial, 8 administrative, family and labour), discussed at a workshop on 11 and 12 June 2026; the content of the individual 2026 drafts could not be traced.",
  },
  sources: [
    `${TVPL_BA}/toa-an-nhan-dan-toi-cao-cong-bo-20-du-thao-an-le-nam-2025-19142.html`,
    "https://congly.vn/toa-an-nhan-dan-toi-cao-lay-y-kien-doi-voi-20-du-thao-an-le-506557.html",
    "https://tapchitoaan.vn/tandtc-to-chuc-hoi-thao-lay-y-kien-doi-voi-42-du-thao-an-le15738.html",
  ],
  verifiedOn: VERIFIED,
};

export const precedentDrafts: PrecedentDraft[] = [
  {
    id: "du-thao-12-2025",
    label: { vi: "Dự thảo án lệ số 12/2025", en: "Draft precedent No. 12/2025" },
    title: {
      vi: "Về xác định lãi suất trong hợp đồng tín dụng",
      en: "On determining interest rates in credit contracts",
    },
    summary: {
      vi: "Dự thảo được xây dựng từ Bản án dân sự phúc thẩm 25/2023/DS-PT ngày 26/4/2023 của Tòa án nhân dân tỉnh Quảng Ninh về tranh chấp hợp đồng tín dụng giữa một ngân hàng thương mại và khách hàng vay. Từ khóa của dự thảo: hợp đồng tín dụng, phạt chậm trả lãi, lãi trên nợ lãi quá hạn.",
      en: "The draft derives from appellate civil judgment 25/2023/DS-PT of 26 April 2023 of the Quang Ninh Provincial People's Court in a credit contract dispute between a commercial bank and a borrower. Its keywords are credit contract, penalty for late payment of interest, and interest on overdue interest.",
    },
    domains: ["dan-su", "hop-dong"],
    sources: [
      `${ANLE}/ShowProperty?nodeId=/UCMServer/TAND367977`,
      `${ANLE}/portal/anle/chitietanleduthao?dDocName=TAND367977`,
      "https://congly.vn/toa-an-nhan-dan-toi-cao-lay-y-kien-doi-voi-20-du-thao-an-le-506557.html",
    ],
    confidence: "cross-check",
    verifiedOn: VERIFIED,
  },
  {
    id: "du-thao-10-2025",
    label: { vi: "Dự thảo án lệ số 10/2025", en: "Draft precedent No. 10/2025" },
    title: {
      vi: "Về hợp đồng tặng cho quyền sử dụng đất có điều kiện",
      en: "On conditional gifts of land use rights",
    },
    summary: {
      vi: "Tình huống nêu trong dự thảo: cha mẹ lập hợp đồng tặng cho con quyền sử dụng đất với điều kiện con phải nuôi dưỡng cha mẹ đến hết đời. Giải pháp dự thảo đề xuất: Tòa án xác định điều kiện của hợp đồng tặng cho đã hoàn thành và hợp đồng tặng cho có hiệu lực pháp luật.",
      en: "The draft's facts: parents gift land use rights to a child on condition that the child supports them for life. The proposed solution: the court finds the condition fulfilled and the gift legally effective.",
    },
    domains: ["dan-su", "dat-dai"],
    sources: [
      `${TVPL_BA}/quy-dinh-ve-hop-dong-tang-cho-co-dieu-kien-hien-nay-noi-dung-du-thao-an-le-2025-ve-hop-dong-tang-cho-19177.html`,
      "https://cdn.thuvienphapluat.vn/uploads/DanLuat-BanAn/2025/11/dtal-10.pdf",
      `${TVPL_BA}/toa-an-nhan-dan-toi-cao-cong-bo-20-du-thao-an-le-nam-2025-19142.html`,
    ],
    confidence: "cross-check",
    verifiedOn: VERIFIED,
  },
  {
    id: "du-thao-13-2025",
    label: { vi: "Dự thảo án lệ số 13/2025", en: "Draft precedent No. 13/2025" },
    title: {
      vi: "Về xác định thời điểm bắt đầu lại thời hiệu khởi kiện",
      en: "On when the limitation period for bringing a claim starts again",
    },
    summary: {
      vi: "Dự thảo đề xuất cách xác định thời điểm thời hiệu khởi kiện được tính lại từ đầu. Tình huống và giải pháp cụ thể của dự thảo chưa đọc được trong phiên tra cứu; cần mở toàn văn trên trang án lệ của Tòa án nhân dân tối cao.",
      en: "The draft addresses when the limitation period for a claim begins to run afresh. Its specific facts and solution could not be read in this search; the full text is on the Supreme People's Court precedent portal.",
    },
    domains: ["dan-su", "to-tung"],
    sources: [
      `${TVPL_BA}/toa-an-nhan-dan-toi-cao-cong-bo-20-du-thao-an-le-nam-2025-19142.html`,
      "https://congly.vn/toa-an-nhan-dan-toi-cao-lay-y-kien-doi-voi-20-du-thao-an-le-506557.html",
    ],
    confidence: "cross-check",
    verifiedOn: VERIFIED,
  },
  {
    id: "du-thao-14-2025",
    label: { vi: "Dự thảo án lệ số 14/2025", en: "Draft precedent No. 14/2025" },
    title: {
      vi: "Về việc thế chấp tài sản để bảo đảm thực hiện nghĩa vụ trong tương lai",
      en: "On mortgaging assets to secure future obligations",
    },
    summary: {
      vi: "Dự thảo đề cập việc thế chấp tài sản để bảo đảm cho nghĩa vụ hình thành trong tương lai. Tình huống và giải pháp cụ thể của dự thảo chưa đọc được trong phiên tra cứu; cần mở toàn văn trên trang án lệ của Tòa án nhân dân tối cao.",
      en: "The draft concerns a mortgage given to secure obligations arising in the future. Its specific facts and solution could not be read in this search; the full text is on the Supreme People's Court precedent portal.",
    },
    domains: ["dan-su", "hop-dong"],
    sources: [
      `${TVPL_BA}/toa-an-nhan-dan-toi-cao-cong-bo-20-du-thao-an-le-nam-2025-19142.html`,
      "https://congly.vn/toa-an-nhan-dan-toi-cao-lay-y-kien-doi-voi-20-du-thao-an-le-506557.html",
    ],
    confidence: "cross-check",
    verifiedOn: VERIFIED,
  },
];

/**
 * Cổng chặn của tệp dự thảo, cùng tinh thần với `src/lib/integrity.ts`: mã
 * không trùng, lĩnh vực có thật, ngày đúng định dạng, nguồn là URL https.
 */
export function auditDrafts(list: readonly PrecedentDraft[]): string[] {
  const out: string[] = [];
  const known = new Set(domains.map((d) => d.id));
  const seen = new Set<string>();
  const https = (u: string) => {
    try {
      return new URL(u).protocol === "https:";
    } catch {
      return false;
    }
  };
  for (const d of list) {
    if (seen.has(d.id)) out.push(`${d.id}: mã trùng`);
    seen.add(d.id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.verifiedOn)) out.push(`${d.id}: verifiedOn sai định dạng`);
    if (d.domains.length === 0) out.push(`${d.id}: thiếu lĩnh vực`);
    for (const dom of d.domains) if (!known.has(dom)) out.push(`${d.id}: lĩnh vực lạ "${dom}"`);
    if (d.sources.length === 0) out.push(`${d.id}: thiếu nguồn`);
    for (const s of d.sources) if (!https(s)) out.push(`${d.id}: nguồn không phải https "${s}"`);
  }
  for (const s of DRAFT_CONTEXT.sources) if (!https(s)) out.push(`bối cảnh: nguồn không phải https "${s}"`);
  return out;
}

const findings = auditDrafts(precedentDrafts);
if (findings.length > 0) {
  throw new Error(`Tệp dự thảo án lệ không qua được phép kiểm:\n  ${findings.join("\n  ")}`);
}
