import { assertIntegrity } from "@/lib/integrity";
import type { Domain, LegalDoc, Relation } from "./types";

/**
 * Ngày tra cứu của toàn bộ tập dữ liệu này.
 *
 * Kết quả tra cứu văn bản pháp luật chỉ có giá trị tại thời điểm tra. Pháp luật
 * Việt Nam trong các lĩnh vực đầu tư, thuế và xây dựng thay đổi nhanh, nên mọi
 * bản ghi dưới đây cần được đối chiếu lại trước khi dùng vào hồ sơ chính thức.
 */
export const VERIFIED_ON = "2026-09-04";

/**
 * Ngày tra cứu của đợt bổ sung thứ hai.
 *
 * Mỗi bản ghi mang ngày tra cứu của chính nó ở trường `verifiedOn`; bản ghi
 * không ghi thì thuộc đợt gốc và lấy `VERIFIED_ON`. Một hằng duy nhất cho cả
 * kho sẽ nói sai ngay ở lần bổ sung đầu tiên: bản ghi tra tháng trước không trở
 * nên mới hơn vì có một bản ghi khác vừa được tra hôm nay.
 */
const VERIFIED_2026_09_21 = "2026-09-21";

export const domains: Domain[] = [
  {
    id: "xay-dung",
    label: { vi: "Xây dựng", en: "Construction" },
    blurb: {
      vi: "Quy hoạch, cấp phép, thi công, nghiệm thu và bảo hành công trình, cùng chế độ đấu thầu áp dụng cho dự án có vốn nhà nước.",
      en: "Planning, permitting, execution, acceptance and warranty of works, together with the procurement regime applied to state-funded projects.",
    },
    hue: 24,
  },
  {
    id: "nang-luong",
    label: { vi: "Năng lượng", en: "Energy" },
    blurb: {
      vi: "Phát triển nguồn điện, mua bán điện trực tiếp, điện năng lượng tái tạo và giấy phép hoạt động điện lực.",
      en: "Power generation, direct power trading, renewable energy and electricity operation licensing.",
    },
    hue: 43,
  },
  {
    id: "hop-dong",
    label: { vi: "Hợp đồng thương mại", en: "Commercial Contracts" },
    blurb: {
      vi: "Nền dân sự và thương mại của mọi giao dịch: giao kết, hiệu lực, vi phạm và chế tài.",
      en: "The civil and commercial bedrock of every transaction: formation, validity, breach and remedies.",
    },
    hue: 212,
  },
  {
    id: "to-tung",
    label: { vi: "Tố tụng & Trọng tài", en: "Litigation & Arbitration" },
    blurb: {
      vi: "Thẩm quyền, thủ tục giải quyết tranh chấp tại Tòa án và trọng tài, công nhận và cho thi hành phán quyết nước ngoài.",
      en: "Jurisdiction, court and arbitral procedure, and the recognition and enforcement of foreign awards.",
    },
    hue: 352,
  },
  {
    id: "doanh-nghiep",
    label: { vi: "Doanh nghiệp", en: "Corporate" },
    blurb: {
      vi: "Thành lập, quản trị, tổ chức lại doanh nghiệp và thủ tục phục hồi, phá sản.",
      en: "Incorporation, governance, restructuring, and rehabilitation and bankruptcy procedures.",
    },
    hue: 268,
  },
  {
    id: "dau-tu",
    label: { vi: "Đầu tư", en: "Investment" },
    blurb: {
      vi: "Thủ tục chấp thuận chủ trương, ngành nghề kinh doanh có điều kiện, ưu đãi đầu tư và tiếp cận đất đai.",
      en: "In-principle approval, conditional business lines, investment incentives and access to land.",
    },
    hue: 176,
  },
  {
    id: "lao-dong",
    label: { vi: "Lao động", en: "Labour" },
    blurb: {
      vi: "Hợp đồng lao động, tiền lương, kỷ luật, chấm dứt quan hệ lao động, bảo hiểm xã hội và việc làm.",
      en: "Employment contracts, wages, discipline, termination, social insurance and employment.",
    },
    hue: 148,
  },
  {
    id: "thue",
    label: { vi: "Thuế", en: "Tax" },
    blurb: {
      vi: "Thuế giá trị gia tăng, thu nhập doanh nghiệp, thu nhập cá nhân và toàn bộ khâu quản lý thuế.",
      en: "Value-added tax, corporate and personal income tax, and the whole of tax administration.",
    },
    hue: 302,
  },
];

const TVPL = "https://thuvienphapluat.vn";
const CP = "https://vanban.chinhphu.vn";
const LVN = "https://luatvietnam.vn";

export const documents: LegalDoc[] = [
  // ─────────────────────────────── XÂY DỰNG ───────────────────────────────
  {
    id: "luat-xay-dung-2025",
    number: "135/2025/QH15",
    type: "luat",
    domains: ["xay-dung"],
    issuedOn: "2025-12-10",
    effectiveOn: "2026-07-01",
    status: "active",
    title: {
      vi: "Luật Xây dựng",
      en: "Law on Construction",
    },
    summary: {
      vi: "Đạo luật khung của hoạt động xây dựng, thay thế Luật Xây dựng 2014 sau hơn một thập kỷ áp dụng. Điều chỉnh chuỗi công việc từ lập quy hoạch, thẩm định thiết kế, cấp phép, thi công cho tới nghiệm thu, quyết toán và bảo hành công trình. Đây là văn bản gốc mà toàn bộ nghị định xây dựng năm 2026 quy định chi tiết.",
      en: "The framework statute for construction activity, replacing the 2014 Construction Law after more than a decade in force. It governs the chain of work from master planning, design appraisal and permitting through execution, acceptance, final settlement and warranty. Every 2026 construction decree draws its authority from this Law.",
    },
    note: {
      vi: "Hiệu lực chung từ 01/7/2026, riêng nhóm quy định về miễn giấy phép xây dựng áp dụng sớm từ 01/01/2026. Hợp đồng xây dựng ký trước 01/7/2026 tiếp tục theo Luật Xây dựng 2014, trừ khi phát sinh sự kiện bất khả kháng hoặc hoàn cảnh thay đổi cơ bản.",
      en: "Generally effective from 1 July 2026, save for the permit-exemption provisions which applied earlier, from 1 January 2026. Construction contracts signed before 1 July 2026 remain governed by the 2014 Law, unless force majeure or a fundamental change of circumstances arises.",
    },
    replaces: ["luat-xay-dung-2014"],
    sources: [`${CP}/?pageid=27160&docid=216514`, `${LVN}/tin-van-ban-moi/tai-luat-xay-dung-2025-so-135-2025-qh15-186-106120-article.html`],
    confidence: "verified",
  },
  {
    id: "luat-xay-dung-2014",
    number: "50/2014/QH13",
    type: "luat",
    domains: ["xay-dung"],
    issuedOn: "2014-06-18",
    effectiveOn: "2015-01-01",
    status: "expired",
    title: {
      vi: "Luật Xây dựng 2014",
      en: "Law on Construction 2014",
    },
    summary: {
      vi: "Khung pháp lý về xây dựng suốt giai đoạn 2015 đến giữa năm 2026, đã được sửa đổi một lần lớn vào năm 2020. Văn bản này hết hiệu lực từ 01/7/2026, nhưng vẫn là luật áp dụng cho những hợp đồng ký trước mốc đó, nên chưa thể bỏ ra khỏi hồ sơ tra cứu.",
      en: "The governing construction framework from 2015 until mid-2026, substantially amended once in 2020. It ceased to have effect on 1 July 2026 but still governs contracts signed before that date, and so cannot yet be retired from a practitioner's shelf.",
    },
    sources: [`${CP}/default.aspx?pageid=27160&docid=175348`, `${TVPL}/phap-luat-doanh-nghiep/bai-viet/chinh-thuc-luat-xay-dung-2014-het-hieu-luc-tu-01-07-2026-17475.html`],
    confidence: "verified",
  },
  {
    id: "luat-62-2020",
    number: "62/2020/QH14",
    type: "luat",
    domains: ["xay-dung"],
    issuedOn: "2020-06-17",
    effectiveOn: "2021-01-01",
    status: "expired",
    title: {
      vi: "Luật sửa đổi, bổ sung một số điều của Luật Xây dựng",
      en: "Law amending and supplementing a number of articles of the Law on Construction",
    },
    summary: {
      vi: "Đợt sửa đổi lớn của Luật Xây dựng 2014, tinh giản thủ tục thẩm định và mở rộng diện công trình được miễn giấy phép xây dựng. Hết hiệu lực cùng thời điểm với luật gốc.",
      en: "The major amendment to the 2014 Construction Law, streamlining design appraisal and widening the class of works exempt from a construction permit. It lapsed together with the parent statute.",
    },
    amends: ["luat-xay-dung-2014"],
    sources: [`${TVPL}/van-ban/Xay-dung-Do-thi/Luat-Xay-dung-sua-doi-2020-so-62-2020-QH14-418229.aspx`],
    confidence: "verified",
  },
  {
    id: "nd-207-2026",
    number: "207/2026/NĐ-CP",
    type: "nghi-dinh",
    domains: ["xay-dung"],
    issuedOn: "",
    effectiveOn: "2026-07-01",
    status: "active",
    title: {
      vi: "Nghị định quy định chi tiết về quản lý chất lượng, thi công xây dựng và bảo trì công trình xây dựng",
      en: "Decree on quality management, construction execution and maintenance of construction works",
    },
    summary: {
      vi: "Nghị định mà nhà thầu và chủ đầu tư phải mở ra thường xuyên nhất: quy định trình tự nghiệm thu, hồ sơ chất lượng, trách nhiệm bảo hành và nghĩa vụ bảo trì trong suốt vòng đời công trình. Thay thế cơ chế quản lý chất lượng cũ khi Luật Xây dựng 2025 có hiệu lực.",
      en: "The decree a contractor or employer opens most often: it sets out acceptance procedures, quality records, warranty liability and maintenance obligations across the life of the works. It supersedes the previous quality-management regime upon entry into force of the 2025 Construction Law.",
    },
    guides: ["luat-xay-dung-2025"],
    sources: [`${TVPL}/phap-luat-doanh-nghiep/bai-viet/tong-hop-nghi-dinh-huong-dan-luat-xay-dung-2026-21761.html`],
    confidence: "cross-check",
  },
  {
    id: "nd-212-2026",
    number: "212/2026/NĐ-CP",
    type: "nghi-dinh",
    domains: ["xay-dung"],
    issuedOn: "",
    effectiveOn: "2026-07-01",
    status: "active",
    title: {
      vi: "Nghị định quy định về điều kiện năng lực hoạt động xây dựng và hệ thống cơ sở dữ liệu quốc gia về hoạt động xây dựng",
      en: "Decree on capacity conditions for construction activity and the national construction activity database",
    },
    summary: {
      vi: "Đặt ra điều kiện năng lực của tổ chức và cá nhân tham gia hoạt động xây dựng, từ chứng chỉ hành nghề tới chứng chỉ năng lực của nhà thầu. Đồng thời hình thành cơ sở dữ liệu quốc gia để tra cứu năng lực nhà thầu, một thay đổi đáng chú ý cho khâu đánh giá hồ sơ dự thầu.",
      en: "It fixes the capacity requirements for organisations and individuals in construction, from individual practising certificates to contractor capacity certificates, and establishes a national database for verifying contractor credentials — a notable change for bid evaluation.",
    },
    guides: ["luat-xay-dung-2025"],
    sources: [`${TVPL}/phap-luat-doanh-nghiep/bai-viet/tong-hop-nghi-dinh-huong-dan-luat-xay-dung-2026-21761.html`],
    confidence: "cross-check",
  },
  {
    id: "nd-209-2026",
    number: "209/2026/NĐ-CP",
    type: "nghi-dinh",
    domains: ["xay-dung"],
    issuedOn: "",
    effectiveOn: "2026-07-01",
    status: "active",
    title: {
      vi: "Nghị định quy định về quản lý vật liệu xây dựng",
      en: "Decree on construction materials management",
    },
    summary: {
      vi: "Quy định về sản xuất, kinh doanh và sử dụng vật liệu xây dựng, gồm yêu cầu công bố hợp quy và kiểm soát chất lượng vật liệu đưa vào công trình. Liên quan trực tiếp tới tranh chấp về vật liệu không đạt chuẩn trong hợp đồng thi công.",
      en: "It regulates the production, trading and use of construction materials, including conformity declaration and quality control of materials incorporated into the works. It bears directly on disputes over non-conforming materials under construction contracts.",
    },
    guides: ["luat-xay-dung-2025"],
    sources: [`${TVPL}/phap-luat-doanh-nghiep/bai-viet/tong-hop-nghi-dinh-huong-dan-luat-xay-dung-2026-21761.html`],
    confidence: "cross-check",
  },
  {
    id: "nd-193-2026",
    number: "193/2026/NĐ-CP",
    type: "nghi-dinh",
    domains: ["xay-dung", "dau-tu"],
    issuedOn: "",
    effectiveOn: "2026-07-01",
    status: "active",
    title: {
      vi: "Nghị định quy định về quyết toán vốn đầu tư dự án",
      en: "Decree on final settlement of project investment capital",
    },
    summary: {
      vi: "Điều chỉnh khâu quyết toán vốn đầu tư khi dự án hoàn thành, gồm hồ sơ, trình tự thẩm tra và thời hạn phê duyệt. Đây là nơi phát sinh phần lớn tranh chấp về khối lượng và giá trị còn treo giữa chủ đầu tư với nhà thầu.",
      en: "It governs the final settlement of investment capital on completion, covering the dossier, the audit sequence and approval deadlines. Most disputes over outstanding quantities and value between employer and contractor arise at this stage.",
    },
    guides: ["luat-xay-dung-2025"],
    sources: [`${TVPL}/phap-luat-doanh-nghiep/bai-viet/tong-hop-nghi-dinh-huong-dan-luat-xay-dung-2026-21761.html`],
    confidence: "cross-check",
  },
  {
    id: "luat-dau-thau-2023",
    number: "22/2023/QH15",
    type: "luat",
    domains: ["xay-dung", "dau-tu"],
    issuedOn: "2023-06-23",
    effectiveOn: "2024-01-01",
    status: "amended",
    title: {
      vi: "Luật Đấu thầu",
      en: "Law on Bidding",
    },
    summary: {
      vi: "Luật gốc về lựa chọn nhà thầu và nhà đầu tư cho dự án sử dụng vốn nhà nước. Kể từ khi có hiệu lực đầu năm 2024, luật đã qua nhiều đợt sửa đổi liên tiếp, nên khi trích dẫn cần bám bản hợp nhất thay vì bản gốc năm 2023.",
      en: "The parent statute on contractor and investor selection for state-funded projects. Since taking effect in early 2024 it has been amended repeatedly, so citations should follow the consolidated text rather than the 2023 original.",
    },
    sources: [`${CP}/?pageid=27160&docid=208419`, `${TVPL}/van-ban/Dau-tu/Luat-Dau-thau-2023-22-2023-QH15-518805.aspx`],
    confidence: "verified",
  },
  {
    id: "vbhn-74-2026",
    number: "74/VBHN-VPQH",
    type: "vbhn",
    domains: ["xay-dung", "dau-tu"],
    issuedOn: "",
    effectiveOn: "",
    status: "active",
    title: {
      vi: "Văn bản hợp nhất Luật Đấu thầu",
      en: "Consolidated text of the Law on Bidding",
    },
    summary: {
      vi: "Bản hợp nhất năm 2026 do Văn phòng Quốc hội phát hành, gộp Luật Đấu thầu 2023 với các lần sửa đổi sau đó. Nên dùng bản này khi soạn hồ sơ mời thầu hoặc lập luận về trình tự lựa chọn nhà thầu.",
      en: "The 2026 consolidation issued by the Office of the National Assembly, merging the 2023 Bidding Law with its subsequent amendments. It is the text to use when preparing bidding dossiers or arguing selection procedure.",
    },
    guides: ["luat-dau-thau-2023"],
    sources: [`${LVN}/dau-thau/van-ban-hop-nhat-74-vbhn-vpqh-2026-luat-dau-thau-430280-d5.html`],
    confidence: "cross-check",
  },
  {
    id: "luat-57-2024",
    number: "57/2024/QH15",
    type: "luat",
    domains: ["dau-tu", "xay-dung"],
    issuedOn: "2024-11-29",
    effectiveOn: "2025-01-15",
    status: "active",
    title: {
      vi: "Luật sửa đổi, bổ sung một số điều của Luật Quy hoạch, Luật Đầu tư, Luật Đầu tư theo phương thức đối tác công tư và Luật Đấu thầu",
      en: "Law amending the Planning Law, Investment Law, PPP Law and Bidding Law",
    },
    summary: {
      vi: "Một luật sửa bốn luật, ban hành cuối năm 2024 nhằm gỡ vướng thủ tục đầu tư và đấu thầu. Đây là mắt xích đầu tiên trong chuỗi sửa đổi dày đặc của pháp luật đầu tư giai đoạn 2024 đến 2025.",
      en: "One law amending four, enacted in late 2024 to unblock investment and procurement procedure. It is the first link in the dense chain of amendments to investment law across 2024 and 2025.",
    },
    amends: ["luat-dau-thau-2023", "luat-ppp-2020"],
    sources: [`${LVN}/linh-vuc-khac/tong-hop-nghi-dinh-huong-dan-luat-dau-thau-cap-nhat-moi-nhat-883-105096-article.html`],
    confidence: "verified",
  },
  {
    id: "luat-90-2025",
    number: "90/2025/QH15",
    type: "luat",
    domains: ["dau-tu", "xay-dung", "thue"],
    issuedOn: "2025-06-25",
    effectiveOn: "2025-07-01",
    status: "active",
    title: {
      vi: "Luật sửa đổi, bổ sung một số điều của Luật Đấu thầu, Luật Đầu tư theo phương thức đối tác công tư, Luật Hải quan, Luật Thuế giá trị gia tăng, Luật Thuế xuất khẩu, thuế nhập khẩu, Luật Đầu tư, Luật Đầu tư công, Luật Quản lý, sử dụng tài sản công",
      en: "Law amending the Bidding Law, PPP Law, Customs Law, VAT Law, Import-Export Duty Law, Investment Law, Public Investment Law and Law on Management and Use of Public Assets",
    },
    summary: {
      vi: "Luật sửa tám luật cùng lúc, có hiệu lực từ giữa năm 2025. Với gói thầu đã phát hành hồ sơ trước ngày luật có hiệu lực, điều khoản chuyển tiếp cho phép tiếp tục áp dụng quy định cũ nếu đã mở thầu, nên khi rà soát một gói thầu cụ thể phải xác định mốc thời gian trước khi xác định luật áp dụng.",
      en: "A single law amending eight statutes, effective from mid-2025. For packages whose dossiers were issued before that date, the transitional provisions allow the former rules to continue where bids had already been opened; identifying the timeline therefore precedes identifying the applicable law.",
    },
    amends: ["luat-dau-thau-2023", "luat-ppp-2020", "luat-gtgt-2024"],
    sources: [`${CP}/?pageid=27160&docid=214558`, `${TVPL}/van-ban/Dau-tu/Luat-sua-doi-Luat-Dau-thau-Luat-Dau-tu-theo-phuong-thuc-doi-tac-cong-tu-2025-so-90-2025-QH15-662379.aspx`],
    confidence: "verified",
  },
  {
    id: "nd-225-2025",
    number: "225/2025/NĐ-CP",
    type: "nghi-dinh",
    domains: ["dau-tu", "xay-dung"],
    issuedOn: "",
    effectiveOn: "2025-08-15",
    status: "active",
    title: {
      vi: "Nghị định sửa đổi, bổ sung các nghị định về lựa chọn nhà đầu tư",
      en: "Decree amending the decrees on investor selection",
    },
    summary: {
      vi: "Điều chỉnh trình tự lựa chọn nhà đầu tư thực hiện dự án có sử dụng đất và dự án thuộc diện đấu thầu theo pháp luật chuyên ngành. Cần đọc cùng Luật Đấu thầu hợp nhất vì hai văn bản thay đổi song song.",
      en: "It adjusts the procedure for selecting investors for land-based projects and projects tendered under sector-specific law. It must be read with the consolidated Bidding Law, since the two moved in parallel.",
    },
    guides: ["luat-dau-thau-2023"],
    sources: [`${LVN}/dau-tu/nghi-dinh-225-2025-nd-cp-sua-doi-bo-sung-cac-nghi-dinh-ve-lua-chon-nha-dau-tu-408667-d1.html`],
    confidence: "cross-check",
  },
  {
    id: "luat-ppp-2020",
    number: "64/2020/QH14",
    type: "luat",
    domains: ["dau-tu", "xay-dung"],
    issuedOn: "2020-06-18",
    effectiveOn: "2021-01-01",
    status: "amended",
    title: {
      vi: "Luật Đầu tư theo phương thức đối tác công tư",
      en: "Law on Investment under the Public-Private Partnership Model",
    },
    summary: {
      vi: "Khung pháp lý cho dự án PPP, từ chuẩn bị dự án, lựa chọn nhà đầu tư đến ký kết và thực hiện hợp đồng dự án. Đã được sửa đổi bởi Luật 57/2024/QH15 và Luật 90/2025/QH15, nên bản hợp nhất là bản đáng tin cậy để trích dẫn.",
      en: "The framework for PPP projects, from preparation and investor selection through signature and performance of the project contract. Amended by Laws 57/2024/QH15 and 90/2025/QH15, so the consolidated text is the reliable one to cite.",
    },
    sources: [`${CP}/?pageid=27160&docid=200452`, `${LVN}/dau-tu/van-ban-hop-nhat-81-vbhn-vpqh-2026-luat-dau-tu-theo-phuong-thuc-doi-tac-cong-tu-430285-d5.html`],
    confidence: "verified",
  },
  {
    id: "nd-243-2025",
    number: "243/2025/NĐ-CP",
    type: "nghi-dinh",
    domains: ["dau-tu"],
    issuedOn: "2025-09-11",
    effectiveOn: "2025-09-11",
    status: "active",
    title: {
      vi: "Nghị định quy định chi tiết một số điều của Luật Đầu tư theo phương thức đối tác công tư",
      en: "Decree detailing a number of articles of the PPP Law",
    },
    summary: {
      vi: "Quy định chi tiết trình tự chuẩn bị và thực hiện dự án PPP sau các lần sửa luật năm 2024 và 2025, có hiệu lực ngay từ ngày ký. Là văn bản tác nghiệp chính cho hồ sơ dự án PPP hiện nay.",
      en: "It details the preparation and implementation of PPP projects following the 2024 and 2025 amendments, effective on the date of signature. It is the principal working instrument for PPP project files today.",
    },
    guides: ["luat-ppp-2020"],
    sources: [`${LVN}/dau-tu/nghi-dinh-243-2025-nd-cp-quy-dinh-chi-tiet-luat-dau-tu-theo-phuong-thuc-doi-tac-cong-tu-411082-d1.html`],
    confidence: "cross-check",
  },

  // ─────────────────────────────── NĂNG LƯỢNG ──────────────────────────────
  {
    id: "luat-dien-luc-2024",
    number: "61/2024/QH15",
    type: "luat",
    domains: ["nang-luong"],
    issuedOn: "2024-11-30",
    effectiveOn: "2025-02-01",
    status: "active",
    title: {
      vi: "Luật Điện lực",
      en: "Electricity Law",
    },
    summary: {
      vi: "Thay thế Luật Điện lực 2004 sau hai mươi năm, mở đường cho cơ chế mua bán điện trực tiếp và đặt lại khung phát triển nguồn điện tái tạo. Đây là văn bản gốc của cả chùm nghị định năng lượng ban hành đầu năm 2025.",
      en: "It replaced the 2004 Electricity Law after twenty years, opening the way for direct power trading and resetting the framework for renewable generation. It is the source of the cluster of energy decrees issued in early 2025.",
    },
    sources: [`${CP}/?pageid=27160&docid=212489`, `${TVPL}/van-ban/Tai-nguyen-Moi-truong/Luat-Dien-luc-2024-so-61-2024-QH15-613892.aspx`],
    confidence: "verified",
  },
  {
    id: "nd-57-2025",
    number: "57/2025/NĐ-CP",
    type: "nghi-dinh",
    domains: ["nang-luong"],
    issuedOn: "2025-03-03",
    effectiveOn: "2025-03-03",
    status: "active",
    title: {
      vi: "Nghị định quy định cơ chế mua bán điện trực tiếp giữa đơn vị phát điện năng lượng tái tạo với khách hàng sử dụng điện lớn",
      en: "Decree on the direct power purchase mechanism between renewable generators and large electricity consumers",
    },
    summary: {
      vi: "Cơ sở pháp lý của cơ chế DPPA, cho phép khách hàng dùng điện lớn mua trực tiếp từ nhà máy điện tái tạo qua đường dây riêng hoặc qua lưới quốc gia. Đây là văn bản phải đọc đầu tiên khi đàm phán hợp đồng mua bán điện ngoài khuôn khổ EVN.",
      en: "The legal basis of the DPPA mechanism, allowing large consumers to buy directly from renewable plants through a private wire or across the national grid. It is the first text to read when negotiating a power purchase outside the EVN framework.",
    },
    guides: ["luat-dien-luc-2024"],
    sources: [`${LVN}/tin-van-ban-moi/chinh-phu-ban-hanh-3-nghi-dinh-quy-dinh-chi-tiet-luat-dien-luc-186-101221-article.html`],
    confidence: "verified",
  },
  {
    id: "nd-58-2025",
    number: "58/2025/NĐ-CP",
    type: "nghi-dinh",
    domains: ["nang-luong"],
    issuedOn: "2025-03-03",
    effectiveOn: "2025-03-03",
    status: "active",
    title: {
      vi: "Nghị định quy định chi tiết một số điều của Luật Điện lực về phát triển điện năng lượng tái tạo, điện năng lượng mới",
      en: "Decree detailing the Electricity Law on the development of renewable and new energy electricity",
    },
    summary: {
      vi: "Quy định điều kiện phát triển nguồn điện tái tạo và điện năng lượng mới, trong đó có điện mặt trời mái nhà tự sản tự tiêu. Nghị định này thay thế Nghị định 135/2024/NĐ-CP và có điều khoản chuyển tiếp cho dự án đã được chấp thuận trước ngày có hiệu lực.",
      en: "It sets the conditions for developing renewable and new energy sources, including self-produced, self-consumed rooftop solar. It replaces Decree 135/2024/NĐ-CP and carries transitional provisions for projects approved before its entry into force.",
    },
    guides: ["luat-dien-luc-2024"],
    replaces: ["nd-135-2024"],
    sources: [`${CP}/?pageid=27160&docid=213011`, `${TVPL}/van-ban/Tai-nguyen-Moi-truong/Nghi-dinh-58-2025-ND-CP-huong-dan-Luat-Dien-luc-phat-trien-dien-nang-luong-tai-tao-dien-nang-luong-moi-636865.aspx`],
    confidence: "verified",
  },
  {
    id: "nd-56-2025",
    number: "56/2025/NĐ-CP",
    type: "nghi-dinh",
    domains: ["nang-luong", "dau-tu"],
    issuedOn: "2025-03-03",
    effectiveOn: "2025-03-03",
    status: "amended",
    title: {
      vi: "Nghị định quy định chi tiết một số điều của Luật Điện lực về quy hoạch phát triển điện lực, phương án phát triển mạng lưới cấp điện, đầu tư xây dựng dự án điện lực và đấu thầu lựa chọn nhà đầu tư dự án kinh doanh điện lực",
      en: "Decree detailing the Electricity Law on power development planning, grid development, investment in power projects and investor selection",
    },
    summary: {
      vi: "Nối quy hoạch điện với thủ tục đầu tư và đấu thầu lựa chọn nhà đầu tư dự án điện. Đã được sửa đổi bởi Nghị định 100/2025/NĐ-CP, nên phải đọc hai văn bản cùng nhau.",
      en: "It connects power planning with investment procedure and investor selection for power projects. Amended by Decree 100/2025/NĐ-CP, so the two must be read together.",
    },
    guides: ["luat-dien-luc-2024"],
    sources: [`${TVPL}/van-ban/Thuong-mai/Nghi-dinh-56-2025-ND-CP-huong-dan-Luat-Dien-luc-ve-quy-hoach-phat-trien-dien-luc-636863.aspx`],
    confidence: "verified",
  },
  {
    id: "nd-100-2025",
    number: "100/2025/NĐ-CP",
    type: "nghi-dinh",
    domains: ["nang-luong", "dau-tu"],
    issuedOn: "",
    effectiveOn: "",
    status: "active",
    title: {
      vi: "Nghị định sửa đổi, bổ sung Nghị định số 56/2025/NĐ-CP",
      en: "Decree amending and supplementing Decree No. 56/2025/NĐ-CP",
    },
    summary: {
      vi: "Sửa đổi nghị định về quy hoạch và đấu thầu lựa chọn nhà đầu tư dự án điện chỉ vài tháng sau khi ban hành, cho thấy tốc độ điều chỉnh chính sách trong lĩnh vực này. Khi tư vấn dự án điện, cần kiểm tra bản mới nhất thay vì dựa vào Nghị định 56 nguyên gốc.",
      en: "It amended the planning and investor-selection decree only months after issuance, a measure of how fast policy moves in this sector. Advice on a power project should be checked against the latest text rather than the original Decree 56.",
    },
    amends: ["nd-56-2025"],
    guides: ["luat-dien-luc-2024"],
    sources: [`${CP}/?pageid=27160&docid=213584`, `${LVN}/dau-tu/nghi-dinh-100-2025-nd-cp-chinh-phu-399847-d1.html`],
    confidence: "cross-check",
  },
  {
    id: "nd-61-2025",
    number: "61/2025/NĐ-CP",
    type: "nghi-dinh",
    domains: ["nang-luong"],
    issuedOn: "",
    effectiveOn: "",
    status: "active",
    title: {
      vi: "Nghị định quy định chi tiết một số điều của Luật Điện lực về giấy phép hoạt động điện lực",
      en: "Decree detailing the Electricity Law on electricity operation licences",
    },
    summary: {
      vi: "Quy định điều kiện, hồ sơ và thẩm quyền cấp giấy phép hoạt động điện lực cho các khâu phát điện, truyền tải, phân phối và bán buôn, bán lẻ điện. Là điều kiện pháp lý bắt buộc trước khi một dự án điện được vận hành thương mại.",
      en: "It sets the conditions, dossier and licensing authority for generation, transmission, distribution, wholesale and retail. Holding the licence is a precondition to commercial operation of any power project.",
    },
    guides: ["luat-dien-luc-2024"],
    sources: [`${CP}/?pageid=27160&docid=213013`, `${TVPL}/van-ban/Bo-may-hanh-chinh/Nghi-dinh-61-2025-ND-CP-huong-dan-Luat-Dien-luc-ve-giay-phep-hoat-dong-dien-luc-645625.aspx`],
    confidence: "verified",
  },

  // ───────────────────────── HỢP ĐỒNG THƯƠNG MẠI ──────────────────────────
  {
    id: "blds-2015",
    number: "91/2015/QH13",
    type: "bo-luat",
    domains: ["hop-dong", "to-tung"],
    issuedOn: "2015-11-24",
    effectiveOn: "2017-01-01",
    status: "active",
    title: {
      vi: "Bộ luật Dân sự",
      en: "Civil Code",
    },
    summary: {
      vi: "Nền của toàn bộ quan hệ hợp đồng tại Việt Nam: giao kết, hiệu lực, giải thích hợp đồng, vi phạm, bồi thường thiệt hại và thời hiệu khởi kiện. Khi luật chuyên ngành im lặng, đây là văn bản được viện dẫn.",
      en: "The foundation of every contractual relationship in Vietnam: formation, validity, interpretation, breach, damages and limitation periods. Where sector-specific law is silent, this is the text invoked.",
    },
    sources: [`${CP}/default.aspx?pageid=27160&docid=183188`, `${TVPL}/van-ban/Quyen-dan-su/Bo-luat-dan-su-2015-296215.aspx`],
    confidence: "verified",
  },
  {
    id: "luat-thuong-mai-2005",
    number: "36/2005/QH11",
    type: "luat",
    domains: ["hop-dong"],
    issuedOn: "2005-06-14",
    effectiveOn: "2006-01-01",
    status: "active",
    title: {
      vi: "Luật Thương mại",
      en: "Commercial Law",
    },
    summary: {
      vi: "Điều chỉnh hoạt động thương mại giữa thương nhân, trong đó có mua bán hàng hóa, cung ứng dịch vụ và các chế tài như phạt vi phạm, buộc bồi thường, tạm ngừng và hủy bỏ hợp đồng. Đã hai mươi năm chưa bị thay thế, nên vẫn là căn cứ quen thuộc trong tranh chấp thương mại.",
      en: "It governs commercial activity between merchants, including sale of goods, supply of services and remedies such as contractual penalty, damages, suspension and cancellation. Twenty years on it has not been replaced and remains the familiar basis in commercial disputes.",
    },
    note: {
      vi: "Mức phạt vi phạm theo Luật Thương mại bị giới hạn theo tỷ lệ trên giá trị phần nghĩa vụ bị vi phạm, khác với nguyên tắc tự do thỏa thuận của Bộ luật Dân sự. Xác định luật áp dụng trước khi tính toán chế tài.",
      en: "The contractual penalty under the Commercial Law is capped as a proportion of the breached obligation, unlike the freedom of agreement under the Civil Code. Settle which law applies before computing remedies.",
    },
    sources: [`${LVN}/linh-vuc-khac/luat-thuong-mai-so-36-2005-qh11-con-hieu-luc-khong-883-105487-article.html`],
    confidence: "verified",
  },

  // ───────────────────────── TỐ TỤNG & TRỌNG TÀI ──────────────────────────
  {
    id: "bltds-2015",
    number: "92/2015/QH13",
    type: "bo-luat",
    domains: ["to-tung"],
    issuedOn: "2015-11-25",
    effectiveOn: "2016-07-01",
    status: "amended",
    title: {
      vi: "Bộ luật Tố tụng dân sự",
      en: "Civil Procedure Code",
    },
    summary: {
      vi: "Quy định thẩm quyền của Tòa án, trình tự sơ thẩm, phúc thẩm, giám đốc thẩm, cùng thủ tục công nhận và cho thi hành phán quyết trọng tài nước ngoài tại Việt Nam. Đã qua nhiều lần sửa đổi, gần nhất là Luật 85/2025/QH15.",
      en: "It sets out court jurisdiction, first-instance, appellate and cassation procedure, and the procedure for recognising and enforcing foreign arbitral awards in Vietnam. It has been amended repeatedly, most recently by Law 85/2025/QH15.",
    },
    sources: [`${CP}/default.aspx?pageid=27160&docid=183189`, `${TVPL}/van-ban/Thu-tuc-To-tung/Bo-luat-to-tung-dan-su-2015-296861.aspx`],
    confidence: "verified",
  },
  {
    id: "luat-85-2025",
    number: "85/2025/QH15",
    type: "luat",
    domains: ["to-tung"],
    issuedOn: "",
    effectiveOn: "2025-07-01",
    status: "active",
    title: {
      vi: "Luật sửa đổi, bổ sung một số điều của Bộ luật Tố tụng dân sự, Luật Tố tụng hành chính, Luật Tư pháp người chưa thành niên và các luật liên quan",
      en: "Law amending the Civil Procedure Code, Law on Administrative Procedure, Law on Juvenile Justice and related laws",
    },
    summary: {
      vi: "Đợt sửa đổi tố tụng năm 2025, gắn với việc sắp xếp lại hệ thống Tòa án. Khi xác định thẩm quyền theo cấp Tòa án cho một vụ việc khởi kiện sau ngày 01/7/2025, phải đọc bản đã sửa chứ không dùng bản 2015 nguyên gốc.",
      en: "The 2025 procedural amendment, tied to the restructuring of the court system. For a claim filed after 1 July 2025, jurisdiction by court level must be read from the amended text, not the 2015 original.",
    },
    amends: ["bltds-2015", "luat-tthc-2015", "luat-hgdt-2020"],
    sources: [`${LVN}/tin-van-ban-moi/da-co-luat-sua-doi-bo-luat-to-tung-dan-su-luat-to-tung-hanh-chinh-luat-tu-phap-nguoi-chua-thanh-nien-186-102734-article.html`],
    confidence: "cross-check",
  },
  {
    id: "luat-ttm-2010",
    number: "54/2010/QH12",
    type: "luat",
    domains: ["to-tung"],
    issuedOn: "2010-06-17",
    effectiveOn: "2011-01-01",
    status: "amended",
    title: {
      vi: "Luật Trọng tài thương mại",
      en: "Law on Commercial Arbitration",
    },
    summary: {
      vi: "Điều chỉnh thỏa thuận trọng tài, thẩm quyền của hội đồng trọng tài, thủ tục tố tụng trọng tài trong nước và căn cứ hủy phán quyết trọng tài. Chưa bị thay thế, nhưng đã được sửa đổi bởi Luật 81/2025/QH15 nên bản hợp nhất mới là bản nên dùng.",
      en: "It governs the arbitration agreement, the tribunal's jurisdiction, domestic arbitral procedure and the grounds for setting aside an award. Not replaced, but amended by Law 81/2025/QH15, so the consolidated text is the one to use.",
    },
    sources: [`${CP}/default.aspx?pageid=27160&docid=98345`, `${TVPL}/van-ban/Thu-tuc-To-tung/Luat-Trong-tai-thuong-mai-2010-108083.aspx`],
    confidence: "verified",
  },
  {
    id: "luat-81-2025",
    number: "81/2025/QH15",
    type: "luat",
    domains: ["to-tung"],
    issuedOn: "2025-06-24",
    effectiveOn: "2025-07-01",
    status: "active",
    title: {
      vi: "Luật sửa đổi, bổ sung một số điều của Luật Tổ chức Tòa án nhân dân",
      en: "Law amending the Law on Organisation of People's Courts",
    },
    summary: {
      vi: "Sửa đổi tổ chức hệ thống Tòa án và kéo theo thay đổi trong Luật Trọng tài thương mại ở phần Tòa án hỗ trợ và giám sát tố tụng trọng tài. Việc xác định Tòa án có thẩm quyền yêu cầu hủy phán quyết phải theo bản sửa đổi này.",
      en: "It reorganised the court system and, in consequence, altered the parts of the Arbitration Law dealing with judicial support and supervision of arbitration. The court competent to hear a set-aside application must be identified under this amendment.",
    },
    amends: ["luat-ttm-2010"],
    sources: [`${LVN}/thuong-mai/van-ban-hop-nhat-60-vbhn-vpqh-nam-2025-do-van-phong-quoc-hoi-ban-hanh-hop-nhat-luat-trong-tai-thuong-mai-408965-d5.html`],
    confidence: "verified",
  },
  {
    id: "vbhn-60-2025",
    number: "60/VBHN-VPQH",
    type: "vbhn",
    domains: ["to-tung"],
    issuedOn: "",
    effectiveOn: "",
    status: "active",
    title: {
      vi: "Văn bản hợp nhất Luật Trọng tài thương mại",
      en: "Consolidated text of the Law on Commercial Arbitration",
    },
    summary: {
      vi: "Bản hợp nhất do Văn phòng Quốc hội phát hành năm 2025, tích hợp Luật Trọng tài thương mại 2010 với sửa đổi theo Luật 81/2025/QH15. Đây là văn bản nên trích dẫn trong đơn khởi kiện trọng tài và bản tự bảo vệ.",
      en: "The 2025 consolidation issued by the Office of the National Assembly, integrating the 2010 Arbitration Law with the amendments under Law 81/2025/QH15. This is the text to cite in a request for arbitration or a statement of defence.",
    },
    guides: ["luat-ttm-2010"],
    sources: [`${CP}/?docid=214982&pageid=27160`, `${TVPL}/van-ban/Thuong-mai/Van-ban-hop-nhat-60-VBHN-VPQH-2025-Luat-Trong-tai-thuong-mai-669808.aspx`],
    confidence: "verified",
  },
  {
    id: "nd-328-2025",
    number: "328/2025/NĐ-CP",
    type: "nghi-dinh",
    domains: ["to-tung", "dau-tu"],
    issuedOn: "",
    effectiveOn: "2025-12-18",
    status: "active",
    title: {
      vi: "Nghị định về Trung tâm trọng tài quốc tế thuộc Trung tâm tài chính quốc tế tại Việt Nam",
      en: "Decree on the International Arbitration Centre within the International Financial Centre in Vietnam",
    },
    summary: {
      vi: "Cho phép thành lập một trung tâm trọng tài quốc tế đặt tại Trung tâm tài chính quốc tế ở Thành phố Hồ Chí Minh, với ít nhất năm sáng lập viên và do Bộ trưởng Bộ Tư pháp cấp phép. Trung tâm có tư cách pháp nhân và hoạt động độc lập về tổ chức, tài chính.",
      en: "It permits the establishment of an international arbitration centre seated at the International Financial Centre in Ho Chi Minh City, with at least five founding members and licensed by the Minister of Justice. The centre has legal personality and operates independently in organisation and finance.",
    },
    sources: [`${CP}/?docid=216253&pageid=27160`, `${TVPL}/van-ban/Thuong-mai/Nghi-dinh-328-2025-ND-CP-Trung-tam-trong-tai-quoc-te-thuoc-Trung-tam-tai-chinh-quoc-te-tai-Viet-Nam-685777.aspx`],
    confidence: "verified",
  },
  {
    id: "viac-2026",
    number: "Quy tắc VIAC 2026",
    type: "quy-tac",
    domains: ["to-tung"],
    issuedOn: "",
    effectiveOn: "2026-07-01",
    status: "active",
    title: {
      vi: "Quy tắc tố tụng trọng tài của Trung tâm Trọng tài Quốc tế Việt Nam",
      en: "Rules of Arbitration of the Vietnam International Arbitration Centre",
    },
    summary: {
      vi: "Bản quy tắc 2026 áp dụng cho các vụ tranh chấp có tố tụng trọng tài bắt đầu từ ngày 01/7/2026, với tiếng Việt và tiếng Anh đều là ngôn ngữ chính thức. Đây là quy tắc của tổ chức tư nhân, không phải văn bản quy phạm pháp luật, nên điều quyết định là phiên bản áp dụng chứ không phải tình trạng hiệu lực.",
      en: "The 2026 Rules apply to disputes in which the arbitration commences on or after 1 July 2026, with Vietnamese and English both official languages. These are the rules of a private institution rather than legislation, so what matters is the applicable version, not a status of validity.",
    },
    note: {
      vi: "Thông lệ là áp dụng bản quy tắc có hiệu lực tại thời điểm khởi động tố tụng, không phải thời điểm ký hợp đồng. Vẫn phải đọc điều khoản chuyển tiếp của chính bản quy tắc để xác nhận.",
      en: "The practice is to apply the version in force when the arbitration commences, not when the contract was signed. The Rules' own transitional provision should still be read to confirm.",
    },
    sources: ["https://viac.vn/trong-tai/quy-tac-to-tung-trong-tai-2026"],
    confidence: "verified",
  },
  {
    id: "cong-uoc-ny-1958",
    number: "New York Convention 1958",
    type: "dieu-uoc",
    domains: ["to-tung"],
    issuedOn: "1958-06-10",
    effectiveOn: "1995-09-11",
    status: "active",
    title: {
      vi: "Công ước về công nhận và cho thi hành phán quyết của trọng tài nước ngoài",
      en: "Convention on the Recognition and Enforcement of Foreign Arbitral Awards",
    },
    summary: {
      vi: "Việt Nam trở thành thành viên Công ước từ ngày 27/8/1995 theo Quyết định số 453/QĐ-CTN ngày 28/7/1995 của Chủ tịch nước, kèm các bảo lưu giới hạn phạm vi áp dụng. Nội dung Công ước được nội luật hóa qua Pháp lệnh năm 1995 và sau đó là Bộ luật Tố tụng dân sự.",
      en: "Vietnam acceded on 27 August 1995 under Decision No. 453/QĐ-CTN of 28 July 1995 of the President, with reservations limiting the scope of application. The Convention was domesticated through the 1995 Ordinance and later the Civil Procedure Code.",
    },
    note: {
      vi: "Bảo lưu của Việt Nam ảnh hưởng trực tiếp tới việc một phán quyết nước ngoài có được công nhận hay không. Kiểm tra bảo lưu của cả hai quốc gia liên quan trước khi tư vấn về khả năng thi hành.",
      en: "Vietnam's reservations bear directly on whether a foreign award will be recognised. Check the reservations of both states concerned before advising on enforceability.",
    },
    sources: ["https://danchuphapluat.vn/cong-nhan-va-cho-thi-hanh-tai-viet-nam-phan-quyet-cua-trong-tai-nuoc-ngoai"],
    confidence: "cross-check",
  },

  // ─────────────────────────────── DOANH NGHIỆP ────────────────────────────
  {
    id: "luat-dn-2020",
    number: "59/2020/QH14",
    type: "luat",
    domains: ["doanh-nghiep"],
    issuedOn: "2020-06-17",
    effectiveOn: "2021-01-01",
    status: "amended",
    title: {
      vi: "Luật Doanh nghiệp",
      en: "Law on Enterprises",
    },
    summary: {
      vi: "Quy định thành lập, quản trị, tổ chức lại và giải thể doanh nghiệp, cùng quyền và nghĩa vụ của thành viên, cổ đông. Đã được sửa đổi bởi Luật 03/2022/QH15 và Luật 76/2025/QH15.",
      en: "It governs the establishment, governance, restructuring and dissolution of enterprises, together with the rights and obligations of members and shareholders. Amended by Laws 03/2022/QH15 and 76/2025/QH15.",
    },
    sources: [`${TVPL}/van-ban/Doanh-nghiep/Luat-Doanh-nghiep-sua-doi-2025-so-76-2025-QH15-659899.aspx`, `${LVN}/linh-vuc-khac/luat-doanh-nghiep-moi-nhat-2026-va-danh-sach-van-ban-huong-dan-883-105164-article.html`],
    confidence: "verified",
  },
  {
    id: "luat-76-2025",
    number: "76/2025/QH15",
    type: "luat",
    domains: ["doanh-nghiep"],
    issuedOn: "2025-06-17",
    effectiveOn: "2025-07-01",
    status: "active",
    title: {
      vi: "Luật sửa đổi, bổ sung một số điều của Luật Doanh nghiệp",
      en: "Law amending and supplementing a number of articles of the Law on Enterprises",
    },
    summary: {
      vi: "Bổ sung nghĩa vụ kê khai chủ sở hữu hưởng lợi của doanh nghiệp, định nghĩa lại cổ tức là khoản lợi nhuận sau thuế trả cho mỗi cổ phần bằng tiền hoặc tài sản khác, và sửa một số quy định về giấy tờ pháp lý của cá nhân. Nghĩa vụ kê khai chủ sở hữu hưởng lợi là thay đổi đáng chú ý nhất với doanh nghiệp có cấu trúc sở hữu nhiều tầng.",
      en: "It introduces the obligation to declare the beneficial owner of an enterprise, redefines dividend as after-tax profit paid per share in cash or other assets, and adjusts rules on personal legal papers. The beneficial ownership declaration is the change that matters most to groups with layered ownership.",
    },
    amends: ["luat-dn-2020"],
    sources: [`${CP}/?pageid=27160&docid=214562`, `${TVPL}/chinh-sach-phap-luat-moi/vn/ho-tro-phap-luat/chinh-sach-moi/92502/mot-so-diem-moi-cua-luat-sua-doi-luat-doanh-nghiep-2025-luat-so-76-2025-qh15`],
    confidence: "verified",
  },
  {
    id: "luat-phuc-hoi-pha-san-2025",
    number: "142/2025/QH15",
    type: "luat",
    domains: ["doanh-nghiep", "to-tung"],
    issuedOn: "2025-12-11",
    effectiveOn: "2026-03-01",
    status: "active",
    title: {
      vi: "Luật Phục hồi, phá sản",
      en: "Law on Rehabilitation and Bankruptcy",
    },
    summary: {
      vi: "Đặt lại thủ tục xử lý doanh nghiệp mất khả năng thanh toán, với trọng tâm chuyển từ thanh lý sang phục hồi. Có hiệu lực từ 01/3/2026, thay đổi đáng kể tính toán của chủ nợ khi con nợ lâm vào khó khăn tài chính.",
      en: "It resets the procedure for insolvent enterprises, shifting the emphasis from liquidation towards rehabilitation. In force from 1 March 2026, it materially changes a creditor's calculus when a debtor runs into financial distress.",
    },
    replaces: ["luat-pha-san-2014"],
    sources: [`${LVN}/dau-thau/van-ban-hop-nhat-74-vbhn-vpqh-2026-luat-dau-thau-430280-d5.html`],
    confidence: "cross-check",
  },

  // ─────────────────────────────── ĐẦU TƯ ─────────────────────────────────
  {
    id: "luat-dau-tu-2025",
    number: "143/2025/QH15",
    type: "luat",
    domains: ["dau-tu", "doanh-nghiep"],
    issuedOn: "2025-12-11",
    effectiveOn: "2026-03-01",
    status: "active",
    title: {
      vi: "Luật Đầu tư",
      en: "Law on Investment",
    },
    summary: {
      vi: "Thay thế Luật Đầu tư 2020, điều chỉnh thủ tục chấp thuận chủ trương đầu tư, đăng ký đầu tư, ưu đãi và bảo đảm đầu tư. Hiệu lực chia làm ba mốc, nên khi xác định luật áp dụng cho một dự án cụ thể phải đối chiếu cả ngày nộp hồ sơ lẫn nội dung thủ tục đang xét.",
      en: "It replaces the 2020 Investment Law, governing in-principle approval, investment registration, incentives and investment guarantees. Its entry into force is split across three dates, so identifying the applicable law for a project requires checking both the filing date and the procedure at issue.",
    },
    note: {
      vi: "Hiệu lực chung từ 01/3/2026. Điều 7 và Danh mục ngành, nghề đầu tư kinh doanh có điều kiện tại Phụ lục IV có hiệu lực từ 01/7/2026. Khoản 3 Điều 50 có hiệu lực sớm từ 01/01/2026.",
      en: "Generally effective from 1 March 2026. Article 7 and the list of conditional business lines in Appendix IV take effect from 1 July 2026. Article 50.3 took effect earlier, from 1 January 2026.",
    },
    replaces: ["luat-dau-tu-2020"],
    sources: [`${CP}/?pageid=27160&docid=216524`, `${TVPL}/phap-luat-nha-dat/luat-dau-tu-2025-luat-so-1432025qh15-co-hieu-luc-tu-khi-nao-13533.html`],
    confidence: "verified",
  },
  {
    id: "luat-dau-tu-2020",
    number: "61/2020/QH14",
    type: "luat",
    domains: ["dau-tu"],
    issuedOn: "2020-06-17",
    effectiveOn: "2021-01-01",
    status: "expired",
    title: {
      vi: "Luật Đầu tư 2020",
      en: "Law on Investment 2020",
    },
    summary: {
      vi: "Khung pháp lý đầu tư giai đoạn 2021 đến đầu năm 2026, đã qua nhiều lần sửa đổi trước khi bị thay thế. Điều 7 và Phụ lục IV về ngành, nghề đầu tư kinh doanh có điều kiện vẫn còn hiệu lực tới 01/7/2026, tạo ra một giai đoạn giao thoa mà người tư vấn dễ nhầm.",
      en: "The investment framework from 2021 until early 2026, amended several times before being replaced. Article 7 and Appendix IV on conditional business lines remain in force until 1 July 2026, creating an overlap that is easy to misread.",
    },
    sources: [`${CP}/default.aspx?pageid=27160&docid=200449`],
    confidence: "verified",
  },
  {
    id: "nd-96-2026",
    number: "96/2026/NĐ-CP",
    type: "nghi-dinh",
    domains: ["dau-tu"],
    issuedOn: "",
    effectiveOn: "",
    status: "active",
    title: {
      vi: "Nghị định quy định chi tiết và hướng dẫn thi hành một số điều của Luật Đầu tư",
      en: "Decree detailing and guiding the implementation of the Law on Investment",
    },
    summary: {
      vi: "Nghị định hướng dẫn Luật Đầu tư 2025, quy định biểu mẫu, trình tự và thẩm quyền trong thủ tục đầu tư. Đây là văn bản tác nghiệp hằng ngày cho hồ sơ chấp thuận chủ trương và đăng ký đầu tư.",
      en: "The implementing decree for the 2025 Investment Law, prescribing forms, sequence and competence in investment procedure. It is the day-to-day instrument for approval and registration filings.",
    },
    guides: ["luat-dau-tu-2025"],
    sources: [`${LVN}/dau-tu/nghi-dinh-96-2026-nd-cp-huong-dan-thi-hanh-luat-dau-tu-chinh-phu-430524-d1.html`],
    confidence: "cross-check",
  },
  {
    id: "luat-dat-dai-2024",
    number: "31/2024/QH15",
    type: "luat",
    domains: ["dau-tu", "xay-dung"],
    issuedOn: "2024-01-18",
    effectiveOn: "2024-08-01",
    status: "amended",
    title: {
      vi: "Luật Đất đai",
      en: "Land Law",
    },
    summary: {
      vi: "Quy định chế độ sở hữu, quản lý và sử dụng đất, thu hồi và bồi thường, giao đất và cho thuê đất. Với dự án đầu tư có sử dụng đất, đây là văn bản quyết định khả năng tiếp cận mặt bằng, thường là nút thắt thực sự của tiến độ.",
      en: "It governs the regime of land ownership, administration and use, recovery and compensation, allocation and lease. For a land-based project this is the law that decides site access, usually the real bottleneck on programme.",
    },
    sources: [`${CP}/?pageid=27160&docid=211189`, `${TVPL}/van-ban/Bat-dong-san/Luat-Dat-dai-2024-31-2024-QH15-523642.aspx`],
    confidence: "verified",
  },
  {
    id: "luat-43-2024",
    number: "43/2024/QH15",
    type: "luat",
    domains: ["dau-tu", "xay-dung"],
    issuedOn: "2024-06-29",
    effectiveOn: "2024-08-01",
    status: "active",
    title: {
      vi: "Luật sửa đổi, bổ sung một số điều của Luật Đất đai, Luật Nhà ở, Luật Kinh doanh bất động sản và Luật Các tổ chức tín dụng",
      en: "Law amending the Land Law, Housing Law, Law on Real Estate Business and Law on Credit Institutions",
    },
    summary: {
      vi: "Đẩy sớm hiệu lực của cả cụm luật đất đai và bất động sản từ 01/01/2025 lên 01/8/2024. Một thay đổi thuần về thời điểm nhưng có hệ quả lớn với dự án đang chuyển tiếp giữa hai khung pháp lý.",
      en: "It advanced the entry into force of the land and real estate cluster from 1 January 2025 to 1 August 2024. A purely temporal change, but consequential for projects straddling the two frameworks.",
    },
    amends: ["luat-dat-dai-2024", "luat-nha-o-2023", "luat-kdbds-2023"],
    sources: [`${TVPL}/van-ban/Bo-may-hanh-chinh/Luat-sua-doi-Luat-Dat-dai-Luat-Nha-o-Luat-Kinh-doanh-bat-dong-san-Luat-Cac-to-chuc-tin-dung-2024-612195.aspx`],
    confidence: "verified",
  },
  {
    id: "luat-nha-o-2023",
    number: "27/2023/QH15",
    type: "luat",
    domains: ["dau-tu", "xay-dung"],
    issuedOn: "2023-11-27",
    effectiveOn: "2024-08-01",
    status: "amended",
    title: {
      vi: "Luật Nhà ở",
      en: "Housing Law",
    },
    summary: {
      vi: "Điều chỉnh phát triển, quản lý và giao dịch nhà ở, gồm nhà ở xã hội và nhà chung cư. Ngày có hiệu lực ban đầu là 01/01/2025, sau được đẩy lên 01/8/2024 theo Luật 43/2024/QH15.",
      en: "It governs the development, management and transaction of housing, including social housing and apartment buildings. Its original effective date of 1 January 2025 was advanced to 1 August 2024 by Law 43/2024/QH15.",
    },
    sources: [`${TVPL}/van-ban/Bo-may-hanh-chinh/Luat-sua-doi-Luat-Dat-dai-Luat-Nha-o-Luat-Kinh-doanh-bat-dong-san-Luat-Cac-to-chuc-tin-dung-2024-612195.aspx`],
    confidence: "verified",
  },

  // ─────────────────────────────── LAO ĐỘNG ───────────────────────────────
  {
    id: "blld-2019",
    number: "45/2019/QH14",
    type: "bo-luat",
    domains: ["lao-dong"],
    issuedOn: "2019-11-20",
    effectiveOn: "2021-01-01",
    status: "active",
    title: {
      vi: "Bộ luật Lao động",
      en: "Labour Code",
    },
    summary: {
      vi: "Điều chỉnh hợp đồng lao động, thời giờ làm việc, tiền lương, kỷ luật lao động và chấm dứt quan hệ lao động. Chưa có văn bản nào thay thế, nên vẫn là bộ luật nền của quan hệ lao động tại Việt Nam.",
      en: "It governs employment contracts, working time, wages, labour discipline and termination. No replacement has been enacted, so it remains the foundational code for employment relations in Vietnam.",
    },
    sources: [`${CP}/?pageid=27160&docid=198540`, `${TVPL}/van-ban/Lao-dong-Tien-luong/Bo-Luat-lao-dong-2019-333670.aspx`],
    confidence: "verified",
  },
  {
    id: "vbhn-18-2026",
    number: "18/VBHN-VPQH",
    type: "vbhn",
    domains: ["lao-dong"],
    issuedOn: "",
    effectiveOn: "",
    status: "active",
    title: {
      vi: "Văn bản hợp nhất Bộ luật Lao động",
      en: "Consolidated text of the Labour Code",
    },
    summary: {
      vi: "Bản hợp nhất năm 2026 của Bộ luật Lao động do Văn phòng Quốc hội phát hành. Dùng bản này khi soạn nội quy lao động hoặc rà soát hợp đồng lao động để tránh trích nhầm điều đã bị sửa.",
      en: "The 2026 consolidation of the Labour Code issued by the Office of the National Assembly. Use it when drafting internal labour rules or reviewing employment contracts, to avoid citing a superseded article.",
    },
    guides: ["blld-2019"],
    sources: [`${LVN}/lao-dong/van-ban-hop-nhat-18-vbhn-vpqh-2026-hop-nhat-bo-luat-lao-dong-426612-d5.html`],
    confidence: "cross-check",
  },
  {
    id: "luat-bhxh-2024",
    number: "41/2024/QH15",
    type: "luat",
    domains: ["lao-dong"],
    issuedOn: "2024-06-29",
    effectiveOn: "2025-07-01",
    status: "active",
    title: {
      vi: "Luật Bảo hiểm xã hội",
      en: "Law on Social Insurance",
    },
    summary: {
      vi: "Quy định chế độ, chính sách bảo hiểm xã hội cùng quyền và trách nhiệm của người lao động, người sử dụng lao động. Thay thế khung bảo hiểm xã hội cũ từ giữa năm 2025, kéo theo thay đổi trong nghĩa vụ đóng của doanh nghiệp.",
      en: "It sets out social insurance regimes and policies and the rights and responsibilities of employees and employers. It replaced the former framework from mid-2025, changing employers' contribution obligations.",
    },
    replaces: ["luat-bhxh-2014"],
    sources: [`${CP}/?pageid=27160&docid=211199`, `${TVPL}/van-ban/Bao-hiem/Luat-Bao-hiem-xa-hoi-2024-557190.aspx`],
    confidence: "verified",
  },
  {
    id: "luat-viec-lam-2025",
    number: "74/2025/QH15",
    type: "luat",
    domains: ["lao-dong"],
    issuedOn: "2025-06-16",
    effectiveOn: "2026-01-01",
    status: "active",
    title: {
      vi: "Luật Việc làm",
      en: "Law on Employment",
    },
    summary: {
      vi: "Gồm tám chương và năm mươi lăm điều, quy định chính sách hỗ trợ tạo việc làm, đăng ký lao động, hệ thống thông tin thị trường lao động, phát triển kỹ năng nghề, dịch vụ việc làm và bảo hiểm thất nghiệp. Thay thế Luật Việc làm 2013 từ đầu năm 2026.",
      en: "In eight chapters and fifty-five articles, it covers job creation support, labour registration, the labour market information system, skills development, employment services and unemployment insurance. It replaced the 2013 Employment Law from the beginning of 2026.",
    },
    replaces: ["luat-viec-lam-2013"],
    sources: [`${CP}/?pageid=27160&docid=214560`, `${TVPL}/van-ban/Lao-dong-Tien-luong/Luat-Viec-lam-2025-so-74-2025-QH15-530912.aspx`],
    confidence: "verified",
  },
  {
    id: "luat-viec-lam-2013",
    number: "38/2013/QH13",
    type: "luat",
    domains: ["lao-dong"],
    issuedOn: "2013-11-16",
    effectiveOn: "2015-01-01",
    status: "expired",
    title: {
      vi: "Luật Việc làm 2013",
      en: "Law on Employment 2013",
    },
    summary: {
      vi: "Khung pháp lý về việc làm và bảo hiểm thất nghiệp trong hơn một thập kỷ, đã được sửa đổi bởi Luật Bảo hiểm xã hội 2024 trước khi hết hiệu lực từ 01/01/2026.",
      en: "The employment and unemployment insurance framework for over a decade, amended by the 2024 Social Insurance Law before ceasing to have effect on 1 January 2026.",
    },
    sources: [`${TVPL}/phap-luat-viec-lam/tong-hop-diem-moi-luat-viec-lam-2025-ap-dung-tu-ngay-01-01-2026-thay-the-luat-viec-lam-2013-35806.html`],
    confidence: "verified",
  },
  {
    id: "nd-318-2025",
    number: "318/2025/NĐ-CP",
    type: "nghi-dinh",
    domains: ["lao-dong"],
    issuedOn: "",
    effectiveOn: "2026-01-01",
    status: "active",
    title: {
      vi: "Nghị định quy định chi tiết một số điều của Luật Việc làm về đăng ký lao động và hệ thống thông tin thị trường lao động",
      en: "Decree detailing the Law on Employment on labour registration and the labour market information system",
    },
    summary: {
      vi: "Cụ thể hóa nghĩa vụ đăng ký lao động, áp dụng cho người thuộc diện tham gia bảo hiểm xã hội bắt buộc, người có việc làm không thuộc diện bắt buộc và cả người thất nghiệp. Có hiệu lực cùng ngày với Luật Việc làm 2025.",
      en: "It gives effect to the labour registration obligation, applying to those subject to compulsory social insurance, those employed outside that scope, and the unemployed. It takes effect on the same day as the 2025 Employment Law.",
    },
    guides: ["luat-viec-lam-2025"],
    sources: [`${LVN}/lao-dong/nghi-dinh-318-2025-nd-cp-quy-dinh-chi-tiet-luat-viec-lam-ve-dang-ky-lao-dong-va-thong-tin-thi-truong-421247-d1.html`],
    confidence: "verified",
  },

  // ─────────────────────────────── THUẾ ───────────────────────────────────
  {
    id: "luat-qlt-2025",
    number: "108/2025/QH15",
    type: "luat",
    domains: ["thue"],
    issuedOn: "",
    effectiveOn: "2026-07-01",
    status: "active",
    title: {
      vi: "Luật Quản lý thuế",
      en: "Law on Tax Administration",
    },
    summary: {
      vi: "Thay thế Luật Quản lý thuế 2019 từ 01/7/2026. Không đặt ra sắc thuế mới mà tập trung vào hiện đại hóa khâu quản lý, với lộ trình hoàn tất giao dịch điện tử trong quản lý thuế trước ngày 01/01/2027.",
      en: "It replaces the 2019 Tax Administration Law from 1 July 2026. It creates no new tax but concentrates on modernising administration, with electronic transactions in tax administration to be completed before 1 January 2027.",
    },
    replaces: ["luat-qlt-2019"],
    sources: [`${TVPL}/ma-so-thue/phap-luat-thue/chinh-thuc-luat-quan-ly-thue-2019-het-hieu-luc-tu-01072026-theo-luat-quan-ly-thue-2025-216925.html`],
    confidence: "cross-check",
  },
  {
    id: "luat-qlt-2019",
    number: "38/2019/QH14",
    type: "luat",
    domains: ["thue"],
    issuedOn: "2019-06-13",
    effectiveOn: "2020-07-01",
    status: "expired",
    title: {
      vi: "Luật Quản lý thuế 2019",
      en: "Law on Tax Administration 2019",
    },
    summary: {
      vi: "Khung quản lý thuế giai đoạn 2020 đến giữa năm 2026, đã được sửa đổi bởi Luật 56/2024/QH15. Hết hiệu lực từ 30/6/2026, riêng Điều 51 chấm dứt sớm hơn, từ 31/12/2025.",
      en: "The tax administration framework from 2020 until mid-2026, amended by Law 56/2024/QH15. It ceased to have effect on 30 June 2026, save for Article 51 which ended earlier, on 31 December 2025.",
    },
    sources: [`${CP}/?pageid=27160&docid=197312`, `${TVPL}/van-ban/Thue-Phi-Le-Phi/Luat-quan-ly-thue-2019-387595.aspx`],
    confidence: "verified",
  },
  {
    id: "luat-gtgt-2024",
    number: "48/2024/QH15",
    type: "luat",
    domains: ["thue"],
    issuedOn: "2024-11-26",
    effectiveOn: "2025-07-01",
    status: "amended",
    title: {
      vi: "Luật Thuế giá trị gia tăng",
      en: "Law on Value-Added Tax",
    },
    summary: {
      vi: "Quy định đối tượng chịu thuế, đối tượng không chịu thuế, thuế suất và điều kiện khấu trừ, hoàn thuế giá trị gia tăng. Đã được sửa đổi bởi Luật 90/2025/QH15, Luật 149/2025/QH15 và Luật 09/2026/QH16.",
      en: "It defines taxable and non-taxable objects, rates and the conditions for input credit and refund. Amended by Laws 90/2025/QH15, 149/2025/QH15 and 09/2026/QH16.",
    },
    replaces: ["luat-gtgt-2008"],
    sources: [`${TVPL}/van-ban/Thue-Phi-Le-Phi/Luat-Thue-gia-tri-gia-tang-2024-so-48-2024-QH15-556390.aspx`],
    confidence: "verified",
  },
  {
    id: "luat-tndn-2025",
    number: "67/2025/QH15",
    type: "luat",
    domains: ["thue", "doanh-nghiep"],
    issuedOn: "2025-06-14",
    effectiveOn: "2025-10-01",
    status: "amended",
    title: {
      vi: "Luật Thuế thu nhập doanh nghiệp",
      en: "Law on Corporate Income Tax",
    },
    summary: {
      vi: "Quy định người nộp thuế, thu nhập chịu thuế, thu nhập được miễn thuế, căn cứ và phương pháp tính thuế cùng các ưu đãi thuế thu nhập doanh nghiệp. Đã được sửa đổi bởi Luật 09/2026/QH16, trong đó bổ sung diện miễn thuế cho doanh nghiệp có tổng doanh thu năm dưới ngưỡng do Chính phủ quy định.",
      en: "It sets out taxpayers, taxable income, exempt income, the tax base, the method of computation and corporate tax incentives. Amended by Law 09/2026/QH16, which added an exemption for enterprises with annual revenue below a threshold set by the Government.",
    },
    replaces: ["luat-tndn-2008"],
    sources: [`${CP}/?pageid=27160&docid=214607`, `${TVPL}/van-ban/Doanh-nghiep/Luat-Thue-thu-nhap-doanh-nghiep-2025-so-67-2025-QH15-580594.aspx`],
    confidence: "verified",
  },
  {
    id: "luat-tncn-2025",
    number: "109/2025/QH15",
    type: "luat",
    domains: ["thue", "lao-dong"],
    issuedOn: "2025-12-10",
    effectiveOn: "2026-07-01",
    status: "amended",
    title: {
      vi: "Luật Thuế thu nhập cá nhân",
      en: "Law on Personal Income Tax",
    },
    summary: {
      vi: "Gồm bốn chương và ba mươi điều, thay thế khung thuế thu nhập cá nhân đã dùng từ năm 2007. Bổ sung các khoản thu nhập chịu thuế mới, trong đó có thu nhập từ hoạt động đại lý, môi giới, hợp tác kinh doanh với tổ chức và thu nhập từ kinh doanh thương mại điện tử, kinh doanh trên nền tảng số.",
      en: "In four chapters and thirty articles, it replaces the personal income tax framework in use since 2007. It adds new heads of taxable income, including income from agency, brokerage and business cooperation with organisations, and income from e-commerce and digital platform business.",
    },
    note: {
      vi: "Hiệu lực từ 01/7/2026, trừ một số quy định. Quy định về thu nhập từ kinh doanh và từ tiền lương, tiền công của cá nhân cư trú áp dụng từ kỳ tính thuế năm 2026.",
      en: "Effective from 1 July 2026, subject to exceptions. The provisions on business income and on salaries and wages of resident individuals apply from the 2026 tax period.",
    },
    sources: [`${CP}/?pageid=27160&docid=216495`, `${TVPL}/van-ban/Thue-Phi-Le-Phi/Luat-Thue-thu-nhap-ca-nhan-2025-so-109-2025-QH15-665870.aspx`],
    confidence: "verified",
  },
  {
    id: "luat-09-2026",
    number: "09/2026/QH16",
    type: "luat",
    domains: ["thue"],
    issuedOn: "2026-04-24",
    effectiveOn: "2026-04-24",
    status: "active",
    title: {
      vi: "Luật sửa đổi, bổ sung một số điều của Luật Thuế thu nhập cá nhân, Luật Thuế giá trị gia tăng, Luật Thuế thu nhập doanh nghiệp và Luật Thuế tiêu thụ đặc biệt",
      en: "Law amending the Law on Personal Income Tax, Law on Value-Added Tax, Law on Corporate Income Tax and Law on Special Consumption Tax",
    },
    summary: {
      vi: "Luật đầu tiên của Quốc hội khóa XVI, thông qua tại Kỳ họp thứ Nhất ngày 24/4/2026. Bãi bỏ ngưỡng doanh thu năm trăm triệu đồng chịu thuế thu nhập cá nhân và thuế giá trị gia tăng, thay bằng mức do Chính phủ quy định, đồng thời bổ sung diện miễn thuế thu nhập doanh nghiệp theo ngưỡng doanh thu.",
      en: "The first law of the sixteenth National Assembly, passed at its first session on 24 April 2026. It abolishes the five hundred million dong revenue threshold for personal income tax and VAT, substituting a threshold set by the Government, and adds a corporate tax exemption by reference to revenue.",
    },
    note: {
      vi: "Luật có hiệu lực từ ngày được thông qua, riêng các quy định tại Điều 1, Điều 2 và Điều 3 có hiệu lực từ 01/01/2026, tức áp dụng hồi tố cho kỳ tính thuế năm 2026.",
      en: "The Law takes effect on the date of passage, save that Articles 1, 2 and 3 take effect from 1 January 2026, applying retroactively to the 2026 tax period.",
    },
    amends: ["luat-tncn-2025", "luat-gtgt-2024", "luat-tndn-2025"],
    sources: [`${CP}/?classid=1&docid=218095&orggroupid=1&pageid=27160`, `${LVN}/thue-phi-le-phi/diem-moi-cua-luat-so-09-2026-qh16-565-109040-article.html`],
    confidence: "verified",
  },
  {
    id: "nq-43-2026",
    number: "43/2026/QH16",
    type: "nghi-quyet",
    domains: ["thue"],
    issuedOn: "",
    effectiveOn: "",
    status: "active",
    title: {
      vi: "Nghị quyết về giảm thuế thu nhập cá nhân, thuế thu nhập doanh nghiệp năm 2026, 2027",
      en: "Resolution on reduction of personal and corporate income tax for 2026 and 2027",
    },
    summary: {
      vi: "Nghị quyết của Quốc hội về giảm thuế thu nhập cá nhân và thuế thu nhập doanh nghiệp cho hai năm 2026 và 2027. Đây là biện pháp có thời hạn, cần đọc kèm luật thuế gốc chứ không thay thế luật.",
      en: "A National Assembly resolution reducing personal and corporate income tax for 2026 and 2027. It is a time-limited measure to be read alongside the substantive tax laws, not a replacement for them.",
    },
    sources: [`${LVN}/tin-van-ban-moi/da-co-nghi-quyet-43-2026-qh16-giam-thue-tncn-thue-tndn-nam-2026-2027-186-112004-article.html`],
    confidence: "cross-check",
  },

  /*
    ── ĐỢT BỔ SUNG NGÀY 04/9/2026 ─────────────────────────────────────────

    Năm mươi bản ghi dưới đây tra bằng công cụ tìm kiếm, không mở được trang
    nguồn Tier 1 trong phiên làm việc: proxy mạng của phiên chặn thuvienphapluat.vn,
    vanban.chinhphu.vn, vbpl.vn và luatvietnam.vn. Số hiệu, ngày ban hành và ngày
    hiệu lực của mỗi bản ghi được đối chiếu giữa ít nhất hai kết quả tìm kiếm độc
    lập; chi tiết nào không khớp hoặc không xuất hiện thì để trống thay vì suy ra.

    Vì vậy toàn bộ đợt này mang `confidence: "cross-check"` và hiện cảnh báo trên
    giao diện. Trước khi dùng vào hồ sơ chính thức phải đối chiếu lại với Công báo.

    `sources` ở đây là địa chỉ trang nguồn tìm được, không phải trang đã mở.
  */

  // ─────────────────── XÂY DỰNG — THẾ HỆ VĂN BẢN 2015-2024 ────────────────
  {
    id: "nd-175-2024",
    number: "175/2024/NĐ-CP",
    type: "nghi-dinh",
    domains: ["xay-dung"],
    issuedOn: "2024-12-30",
    effectiveOn: "2024-12-30",
    status: "active",
    title: {
      vi: "Nghị định quy định chi tiết một số điều và biện pháp thi hành Luật Xây dựng về quản lý hoạt động xây dựng",
      en: "Decree detailing and implementing the Construction Law on management of construction activity",
    },
    summary: {
      vi: "Nghị định điều chỉnh chuỗi thủ tục từ lập, thẩm định, phê duyệt dự án và thiết kế cho tới khảo sát xây dựng và cấp giấy phép xây dựng. Thay thế Nghị định 15/2021/NĐ-CP và là văn bản thi hành Luật Xây dựng 2014 ở giai đoạn cuối trước khi Luật Xây dựng 2025 có hiệu lực.",
      en: "It governs the procedural chain from formulation, appraisal and approval of projects and designs through site investigation and construction permitting. It replaced Decree 15/2021/NĐ-CP and served as the implementing instrument for the 2014 Construction Law in the period before the 2025 Law took effect.",
    },
    note: {
      vi: "Luật Xây dựng 2025 có hiệu lực từ 01/7/2026 cùng bộ nghị định thi hành mới. Phạm vi còn áp dụng của nghị định này sau mốc đó chưa đối chiếu được với nguồn chính thống trong phiên tra cứu.",
      en: "The 2025 Construction Law took effect on 1 July 2026 together with a new set of implementing decrees. The extent to which this decree continues to apply after that date could not be confirmed against an official source in this search.",
    },
    guides: ["luat-xay-dung-2014"],
    replaces: ["nd-15-2021"],
    sources: [
      `${CP}/?pageid=27160&docid=212166`,
      `${LVN}/dau-tu/nghi-dinh-175-2024-nd-cp-quy-dinh-chi-tiet-luat-xay-dung-ve-quan-ly-hoat-dong-xay-dung-382971-d1.html`,
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-15-2021",
    number: "15/2021/NĐ-CP",
    type: "nghi-dinh",
    domains: ["xay-dung"],
    issuedOn: "2021-03-03",
    effectiveOn: "2021-03-03",
    status: "expired",
    title: {
      vi: "Nghị định quy định chi tiết một số nội dung về quản lý dự án đầu tư xây dựng",
      en: "Decree detailing management of construction investment projects",
    },
    summary: {
      vi: "Gồm bảy chương và 111 điều, nghị định quy định việc lập, thẩm định, phê duyệt dự án và thiết kế, khảo sát xây dựng, cấp giấy phép và quản lý trật tự xây dựng, năng lực hoạt động xây dựng và hình thức quản lý dự án. Đây là nghị định thi hành Luật Xây dựng 2014 và Luật sửa đổi 2020, đã bị Nghị định 175/2024/NĐ-CP thay thế.",
      en: "In seven chapters and 111 articles, it covered project and design formulation, appraisal and approval, site investigation, permitting and construction order, capacity requirements and project-management arrangements. It implemented the 2014 Construction Law and the 2020 amending Law, and was replaced by Decree 175/2024/NĐ-CP.",
    },
    guides: ["luat-xay-dung-2014"],
    sources: [
      `${CP}/?pageid=27160&docid=202756`,
      "https://vcci.com.vn/legal-document/nghi-dinh-152021nd-cp-huong-dan-mot-so-noi-dung-ve-quan-ly-du-an-dau-tu-xay-dung",
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-06-2021",
    number: "06/2021/NĐ-CP",
    type: "nghi-dinh",
    domains: ["xay-dung"],
    issuedOn: "2021-01-26",
    effectiveOn: "2021-01-26",
    status: "active",
    title: {
      vi: "Nghị định quy định chi tiết một số nội dung về quản lý chất lượng, thi công xây dựng và bảo trì công trình xây dựng",
      en: "Decree detailing quality management, construction execution and maintenance of construction works",
    },
    summary: {
      vi: "Nghị định mà nhà thầu và chủ đầu tư mở ra thường xuyên nhất trong suốt giai đoạn 2021-2026: quy định trình tự nghiệm thu, hồ sơ chất lượng, trách nhiệm của chủ đầu tư, nhà thầu thi công, nhà thầu thiết kế và tư vấn giám sát, cùng nghĩa vụ bảo trì công trình. Thay thế Nghị định 46/2015/NĐ-CP.",
      en: "The decree an employer or contractor opened most often through 2021-2026: acceptance procedures, quality records, the respective duties of employer, works contractor, designer and supervision consultant, and maintenance obligations. It replaced Decree 46/2015/NĐ-CP.",
    },
    note: {
      vi: "Nghị định 207/2026/NĐ-CP điều chỉnh cùng phạm vi theo Luật Xây dựng 2025 từ 01/7/2026. Quan hệ thay thế giữa hai văn bản chưa đối chiếu được với nguồn chính thống trong phiên tra cứu.",
      en: "Decree 207/2026/NĐ-CP covers the same subject matter under the 2025 Construction Law from 1 July 2026. The replacement relationship between the two could not be confirmed against an official source in this search.",
    },
    guides: ["luat-xay-dung-2014"],
    sources: [
      `${CP}/?pageid=27160&docid=202585`,
      "https://vcci.com.vn/legal-document/nghi-dinh-062021nd-cp-huong-dan-ve-quan-ly-chat-luong-thi-cong-xay-dung-va-bao-tri-cong-trinh-xay-dung",
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-10-2021",
    number: "10/2021/NĐ-CP",
    type: "nghi-dinh",
    domains: ["xay-dung"],
    issuedOn: "2021-02-09",
    effectiveOn: "2021-02-09",
    status: "active",
    title: {
      vi: "Nghị định về quản lý chi phí đầu tư xây dựng",
      en: "Decree on management of construction investment cost",
    },
    summary: {
      vi: "Quy định cách xác định và quản lý tổng mức đầu tư, dự toán, định mức, giá xây dựng và chỉ số giá cho dự án dùng vốn đầu tư công, vốn nhà nước ngoài đầu tư công, dự án PPP và dự án dùng vốn ODA. Đây là căn cứ thường được viện dẫn trong tranh chấp về điều chỉnh giá hợp đồng và khối lượng phát sinh.",
      en: "It fixes how total investment, cost estimates, norms, construction prices and price indices are determined and managed for projects using public investment capital, state capital outside public investment, PPP projects and ODA-funded projects. It is the provision most often invoked in disputes over contract price adjustment and variations.",
    },
    guides: ["luat-xay-dung-2014"],
    sources: [
      `${CP}/?pageid=27160&docid=202663`,
      "https://vcci.com.vn/legal-document/nghi-dinh-102021nd-cp-ve-quan-ly-chi-phi-dau-tu-xay-dung",
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-37-2015",
    number: "37/2015/NĐ-CP",
    type: "nghi-dinh",
    domains: ["xay-dung", "hop-dong"],
    issuedOn: "2015-04-22",
    effectiveOn: "",
    status: "amended",
    title: {
      vi: "Nghị định quy định chi tiết về hợp đồng xây dựng",
      en: "Decree detailing construction contracts",
    },
    summary: {
      vi: "Văn bản gốc về hợp đồng xây dựng: loại hợp đồng, nguyên tắc ký kết, hồ sơ hợp đồng, tạm ứng và thanh toán, điều chỉnh giá, tạm dừng và chấm dứt hợp đồng. Áp dụng bắt buộc cho hợp đồng thuộc dự án dùng vốn đầu tư công và hợp đồng giữa doanh nghiệp dự án PPP với nhà thầu xây dựng.",
      en: "The core instrument on construction contracts: contract types, principles of formation, contract documents, advance payment and settlement, price adjustment, suspension and termination. It applies mandatorily to contracts under publicly funded projects and to contracts between a PPP project enterprise and its works contractors.",
    },
    note: {
      vi: "Đã được Nghị định 50/2021/NĐ-CP sửa đổi, bổ sung. Ngày có hiệu lực của bản gốc không xuất hiện thống nhất trong các nguồn tra được nên để trống.",
      en: "Amended and supplemented by Decree 50/2021/NĐ-CP. The entry-into-force date of the original decree did not appear consistently across the sources found and is therefore left blank.",
    },
    guides: ["luat-xay-dung-2014"],
    sources: [
      `${CP}/?pageid=27160&docid=202990`,
      `${TVPL}/van-ban/Xay-dung-Do-thi/Nghi-dinh-50-2021-ND-CP-sua-doi-Nghi-dinh-37-2015-ND-CP-huong-dan-hop-dong-xay-dung-393920.aspx`,
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-50-2021",
    number: "50/2021/NĐ-CP",
    type: "nghi-dinh",
    domains: ["xay-dung", "hop-dong"],
    issuedOn: "2021-04-01",
    effectiveOn: "2021-04-01",
    status: "active",
    title: {
      vi: "Nghị định sửa đổi, bổ sung một số điều của Nghị định số 37/2015/NĐ-CP quy định chi tiết về hợp đồng xây dựng",
      en: "Decree amending Decree 37/2015/NĐ-CP detailing construction contracts",
    },
    summary: {
      vi: "Sửa nhóm quy định về điều chỉnh giá hợp đồng, tạm ứng, thanh toán và quyết toán hợp đồng xây dựng, đồng thời làm rõ phạm vi áp dụng cho hợp đồng của doanh nghiệp dự án PPP. Trong tranh chấp hợp đồng thi công ký sau 01/4/2021, phải đọc Nghị định 37/2015 ở bản đã hợp nhất với nghị định này.",
      en: "It revises the rules on contract price adjustment, advance payment, payment and final settlement, and clarifies the scope of application to contracts of PPP project enterprises. In disputes over works contracts signed after 1 April 2021, Decree 37/2015 must be read as consolidated with this decree.",
    },
    amends: ["nd-37-2015"],
    sources: [
      `${CP}/?pageid=27160&docid=202990`,
      "https://vcci.com.vn/legal-document/nghi-dinh-502021nd-cp-sua-doi-nghi-dinh-372015nd-cp-quy-dinh-chi-tiet-ve-hop-dong-xay-dung",
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-qhdt-nt-2024",
    number: "47/2024/QH15",
    type: "luat",
    domains: ["xay-dung", "dau-tu"],
    issuedOn: "2024-11-26",
    effectiveOn: "2025-07-01",
    status: "active",
    title: {
      vi: "Luật Quy hoạch đô thị và nông thôn",
      en: "Law on Urban and Rural Planning",
    },
    summary: {
      vi: "Gồm năm chương và 59 điều, luật hợp nhất hệ thống quy hoạch đô thị và quy hoạch nông thôn vốn nằm ở hai đạo luật riêng, quy định trình tự lập, thẩm định, phê duyệt, rà soát và điều chỉnh quy hoạch. Thay thế Luật Quy hoạch đô thị 2009. Quy hoạch được duyệt trước ngày 01/7/2025 tiếp tục có hiệu lực tới hết thời hạn của nó.",
      en: "In five chapters and 59 articles, the Law consolidates urban and rural planning, previously governed by separate statutes, and sets out the sequence for formulating, appraising, approving, reviewing and adjusting plans. It replaces the 2009 Urban Planning Law. Plans approved before 1 July 2025 remain in force until their own expiry.",
    },
    sources: [
      "https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-quy-pham-phap-luat/luat-quy-hoach-do-thi-va-nong-thon-so-472024qh15-hieu-luc-thi-hanh-ke-tu-ngay-0172025-11179",
      `${LVN}/xay-dung/luat-quy-hoach-do-thi-va-nong-thon-2024-moi-nhat-so-47-2024-qh15-379072-d1.html`,
    ],
    confidence: "cross-check",
  },

  // ─────────────────── NĂNG LƯỢNG — NỀN CŨ VÀ QUY HOẠCH ──────────────────
  {
    id: "luat-dien-luc-2004",
    number: "28/2004/QH11",
    type: "luat",
    domains: ["nang-luong"],
    issuedOn: "",
    effectiveOn: "",
    status: "expired",
    title: {
      vi: "Luật Điện lực 2004",
      en: "Law on Electricity 2004",
    },
    summary: {
      vi: "Đạo luật khung của ngành điện suốt hai mươi năm, đã qua năm lần sửa đổi bằng các Luật số 24/2012/QH13, 28/2018/QH14, 03/2022/QH15, 16/2023/QH15 và 35/2024/QH15. Hết hiệu lực toàn bộ từ ngày Luật Điện lực 2024 có hiệu lực, trừ các trường hợp chuyển tiếp tại Điều 81 của luật mới.",
      en: "The framework statute of the power sector for two decades, amended five times by Laws 24/2012/QH13, 28/2018/QH14, 03/2022/QH15, 16/2023/QH15 and 35/2024/QH15. It ceased to have effect in full when the 2024 Electricity Law entered into force, save for the transitional cases in Article 81 of the new Law.",
    },
    note: {
      vi: "Hết hiệu lực từ 01/02/2025. Ngày ban hành và ngày có hiệu lực của bản gốc không xuất hiện thống nhất trong các nguồn tra được nên để trống. Hợp đồng mua bán điện ký trong thời kỳ luật này còn hiệu lực cần đối chiếu Điều 81 Luật Điện lực 2024.",
      en: "Ceased to have effect on 1 February 2025. The date of issue and original entry into force did not appear consistently across the sources found and are left blank. Power purchase agreements signed while this Law was in force should be checked against Article 81 of the 2024 Electricity Law.",
    },
    sources: [
      "https://moit.gov.vn/tin-tuc/phat-trien-nang-luong/gioi-thieu-luat-dien-luc-so-61-2024-qh15.html",
      "https://www.erav.vn/tin-tuc/t58176/gioi-thieu-luat-dien-luc-so-61-2024-qh15.html",
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-80-2024",
    number: "80/2024/NĐ-CP",
    type: "nghi-dinh",
    domains: ["nang-luong", "hop-dong"],
    issuedOn: "2024-07-03",
    effectiveOn: "2024-07-03",
    status: "active",
    title: {
      vi: "Nghị định quy định về cơ chế mua bán điện trực tiếp giữa đơn vị phát điện năng lượng tái tạo với khách hàng sử dụng điện lớn",
      en: "Decree on the direct power purchase mechanism between renewable generators and large electricity users",
    },
    summary: {
      vi: "Văn bản đầu tiên hợp thức hóa cơ chế mua bán điện trực tiếp tại Việt Nam, mở hai đường: qua đường dây kết nối riêng và qua lưới điện quốc gia. Đây là nền pháp lý cho các thoả thuận DPPA ký trong giai đoạn 2024-2025, trước khi Luật Điện lực 2024 và nghị định thi hành của nó thay đổi khung áp dụng.",
      en: "The first instrument to give the direct power purchase arrangement a legal basis in Vietnam, opening two routes: a private connection line and the national grid. It underpins the DPPA arrangements signed in 2024-2025, before the 2024 Electricity Law and its implementing decree changed the framework.",
    },
    note: {
      vi: "Nghị định 57/2025/NĐ-CP ngày 03/3/2025 quy định cùng cơ chế theo Luật Điện lực 2024. Không tra được nguồn khẳng định nghị định mới thay thế nghị định này, nên quan hệ giữa hai văn bản để ngỏ; hợp đồng DPPA đang thực hiện cần đối chiếu điều khoản chuyển tiếp của cả hai.",
      en: "Decree 57/2025/NĐ-CP of 3 March 2025 governs the same mechanism under the 2024 Electricity Law. No source confirming that the newer decree replaces this one was found, so the relationship is left open; live DPPA arrangements should be checked against the transitional provisions of both.",
    },
    sources: [
      `${CP}/?pageid=27160&docid=210545`,
      `${TVPL}/van-ban/Thuong-mai/Nghi-dinh-80-2024-ND-CP-co-che-mua-ban-dien-truc-tiep-giua-Don-vi-phat-dien-voi-Khach-hang-615882.aspx`,
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-135-2024",
    number: "135/2024/NĐ-CP",
    type: "nghi-dinh",
    domains: ["nang-luong"],
    issuedOn: "2024-10-22",
    effectiveOn: "",
    status: "expired",
    title: {
      vi: "Nghị định quy định cơ chế, chính sách khuyến khích phát triển điện mặt trời mái nhà tự sản xuất, tự tiêu thụ",
      en: "Decree on mechanisms and policies encouraging self-produced, self-consumed rooftop solar power",
    },
    summary: {
      vi: "Nghị định lập khung riêng cho điện mặt trời mái nhà tự sản tự tiêu: miễn giấy phép hoạt động điện lực trong một số trường hợp, bỏ giới hạn công suất với hệ thống không đấu nối bán điện, và đặt điều kiện cho phần điện dư phát lên lưới. Đã bị Nghị định 58/2025/NĐ-CP thay thế.",
      en: "It created a dedicated framework for self-produced, self-consumed rooftop solar: exemption from the electricity operation licence in certain cases, removal of the capacity cap for systems not selling to the grid, and conditions for surplus output fed back into the grid. It was replaced by Decree 58/2025/NĐ-CP.",
    },
    note: {
      vi: "Ngày có hiệu lực không xuất hiện trong các nguồn tra được nên để trống. Hệ thống lắp đặt theo nghị định này cần đối chiếu điều khoản chuyển tiếp của Nghị định 58/2025/NĐ-CP.",
      en: "The entry-into-force date did not appear in the sources found and is left blank. Systems installed under this decree should be checked against the transitional provisions of Decree 58/2025/NĐ-CP.",
    },
    sources: [
      "https://chinhphu.vn/?pageid=27160&docid=211466&classid=1",
      "https://www.frasersvn.com/vi/legal-updates-and-publications/decree-135-2024-nd-cp-on-rooftop-solar-power",
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-nltkhq-2010",
    number: "50/2010/QH12",
    type: "luat",
    domains: ["nang-luong"],
    issuedOn: "2010-06-17",
    effectiveOn: "2011-01-01",
    status: "amended",
    title: {
      vi: "Luật Sử dụng năng lượng tiết kiệm và hiệu quả",
      en: "Law on Economical and Efficient Use of Energy",
    },
    summary: {
      vi: "Đặt nghĩa vụ sử dụng năng lượng tiết kiệm cho cơ sở sử dụng năng lượng trọng điểm, gồm kiểm toán năng lượng định kỳ, chỉ định người quản lý năng lượng và chế độ báo cáo. Đây là đạo luật mà doanh nghiệp sản xuất quy mô lớn phải tuân thủ song song với pháp luật điện lực.",
      en: "It imposes energy-efficiency duties on designated key energy users, including periodic energy audits, appointment of an energy manager and reporting obligations. Large manufacturing operations must comply with it alongside electricity legislation.",
    },
    note: {
      vi: "Được sửa đổi, bổ sung bởi Luật số 77/2025/QH15, hiệu lực từ 01/01/2026.",
      en: "Amended and supplemented by Law 77/2025/QH15, effective from 1 January 2026.",
    },
    sources: [
      "https://chinhphu.vn/default.aspx?pageid=27160&docid=96051",
      `${LVN}/linh-vuc-khac/luat-su-dung-nang-luong-tiet-kiem-va-hieu-qua-moi-nhat-la-luat-nao-883-106793-article.html`,
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-77-2025",
    number: "77/2025/QH15",
    type: "luat",
    domains: ["nang-luong"],
    issuedOn: "2025-06-18",
    effectiveOn: "2026-01-01",
    status: "active",
    title: {
      vi: "Luật sửa đổi, bổ sung một số điều của Luật Sử dụng năng lượng tiết kiệm và hiệu quả",
      en: "Law amending the Law on Economical and Efficient Use of Energy",
    },
    summary: {
      vi: "Sửa 19 điều và bổ sung một điều mới, theo hướng đơn giản hóa thủ tục hành chính và đẩy mạnh phân cấp cho địa phương trong quản lý sử dụng năng lượng. Doanh nghiệp thuộc danh sách cơ sở sử dụng năng lượng trọng điểm cần rà lại nghĩa vụ kiểm toán và báo cáo theo bản đã sửa.",
      en: "It amends 19 articles and adds one, simplifying administrative procedures and devolving more authority to provincial level in energy-use management. Enterprises on the key energy user list should review their audit and reporting duties against the amended text.",
    },
    amends: ["luat-nltkhq-2010"],
    sources: [
      "https://moit.gov.vn/tin-tuc/quoc-hoi-thong-qua-luat-sua-doi-bo-sung-mot-so-dieu-cua-luat-su-dung-nang-luong-tiet-kiem-va-hieu-qua..html",
      `${LVN}/linh-vuc-khac/luat-su-dung-nang-luong-tiet-kiem-va-hieu-qua-moi-nhat-la-luat-nao-883-106793-article.html`,
    ],
    confidence: "cross-check",
  },
  {
    id: "qd-768-2025",
    number: "768/QĐ-TTg",
    type: "quyet-dinh",
    domains: ["nang-luong", "dau-tu"],
    issuedOn: "2025-04-15",
    effectiveOn: "2025-04-15",
    status: "active",
    title: {
      vi: "Quyết định phê duyệt Điều chỉnh Quy hoạch phát triển điện lực quốc gia thời kỳ 2021-2030, tầm nhìn đến năm 2050",
      en: "Decision approving the adjusted National Power Development Plan for 2021-2030, with a vision to 2050",
    },
    summary: {
      vi: "Bản điều chỉnh Quy hoạch điện VIII, nâng mục tiêu điện thương phẩm năm 2030 lên 500,4 tới 557,8 tỷ kWh và đặt công suất điện mặt trời ở mức 46.459 tới 73.416 MW, điện gió trên bờ và gần bờ ở mức 26.066 tới 38.029 MW. Cũng đưa điện hạt nhân Ninh Thuận 1 và 2 vào vận hành giai đoạn 2030-2035.",
      en: "The adjustment to Power Development Plan VIII, raising the 2030 commercial electricity target to 500.4-557.8 billion kWh and setting solar capacity at 46,459-73,416 MW and onshore and nearshore wind at 26,066-38,029 MW. It also schedules the Ninh Thuan 1 and 2 nuclear plants for operation in 2030-2035.",
    },
    note: {
      vi: "Quy hoạch quyết định dự án nào được đưa vào danh mục, nên nó là điều kiện tiên quyết của thủ tục chấp thuận chủ trương đầu tư dự án nguồn điện.",
      en: "The plan determines which projects are listed, and is therefore a precondition for in-principle investment approval of a generation project.",
    },
    amends: ["qd-500-2023"],
    sources: [
      "https://xaydungchinhsach.chinhphu.vn/quyet-dinh-768-qd-ttg-thu-tuong-chinh-phu-phe-duyet-dieu-chinh-quy-hoach-dien-viii-119250417074054718.htm",
      `${LVN}/dien-luc/quyet-dinh-768-qd-ttg-2025-quy-hoach-phat-trien-dien-luc-quoc-gia-thoi-ky-2021-2030-397693-d1.html`,
    ],
    confidence: "cross-check",
  },
  {
    id: "qd-500-2023",
    number: "500/QĐ-TTg",
    type: "quyet-dinh",
    domains: ["nang-luong", "dau-tu"],
    issuedOn: "",
    effectiveOn: "",
    status: "amended",
    title: {
      vi: "Quyết định phê duyệt Quy hoạch phát triển điện lực quốc gia thời kỳ 2021-2030, tầm nhìn đến năm 2050",
      en: "Decision approving the National Power Development Plan for 2021-2030, with a vision to 2050",
    },
    summary: {
      vi: "Bản Quy hoạch điện VIII gốc năm 2023, đặt cơ cấu nguồn điện và danh mục dự án cho thập kỷ. Đã được Quyết định 768/QĐ-TTg năm 2025 điều chỉnh, trong đó nâng đáng kể mục tiêu công suất năng lượng tái tạo.",
      en: "The original 2023 Power Development Plan VIII, setting the generation mix and the project list for the decade. It was adjusted by Decision 768/QĐ-TTg of 2025, which raised the renewable capacity targets substantially.",
    },
    note: {
      vi: "Ngày ban hành không xuất hiện trong các nguồn tra được nên để trống. Quan hệ giữa quyết định này và Quyết định 768/QĐ-TTg được nguồn mô tả vừa là thay thế vừa là điều chỉnh; ở đây ghi là điều chỉnh vì chính tên của quyết định sau là phê duyệt điều chỉnh.",
      en: "The date of issue did not appear in the sources found and is left blank. The sources describe the relationship with Decision 768/QĐ-TTg as both replacement and adjustment; it is recorded here as an adjustment, since the later decision is itself titled an approval of an adjustment.",
    },
    sources: [
      "https://xaydungchinhsach.chinhphu.vn/quyet-dinh-768-qd-ttg-thu-tuong-chinh-phu-phe-duyet-dieu-chinh-quy-hoach-dien-viii-119250417074054718.htm",
      "https://solarpower.vn/quy-hoach-dien-viii-viet-nam/",
    ],
    confidence: "cross-check",
  },

  // ─────────────────── HỢP ĐỒNG THƯƠNG MẠI — LỚP CHUYÊN NGÀNH ────────────
  {
    id: "cisg-1980",
    number: "CISG 1980",
    type: "dieu-uoc",
    domains: ["hop-dong"],
    issuedOn: "",
    effectiveOn: "2017-01-01",
    status: "active",
    title: {
      vi: "Công ước của Liên hợp quốc về hợp đồng mua bán hàng hóa quốc tế",
      en: "United Nations Convention on Contracts for the International Sale of Goods",
    },
    summary: {
      vi: "Việt Nam phê duyệt gia nhập ngày 18/12/2015 và trở thành thành viên thứ 84; Công ước có hiệu lực với Việt Nam từ 01/01/2017. Từ mốc đó, phần lớn hợp đồng mua bán hàng hóa quốc tế giữa thương nhân Việt Nam với thương nhân của quốc gia thành viên khác chịu sự điều chỉnh của Công ước, trừ khi các bên loại trừ.",
      en: "Vietnam approved accession on 18 December 2015, becoming the 84th contracting state, and the Convention entered into force for Vietnam on 1 January 2017. From that date most international sale-of-goods contracts between Vietnamese traders and traders of other contracting states are governed by the Convention unless the parties exclude it.",
    },
    note: {
      vi: "Việt Nam bảo lưu về hình thức hợp đồng theo Điều 11, Điều 29 và Phần II của Công ước, nên hợp đồng vẫn cần lập bằng văn bản. Điều 6 cho phép các bên loại trừ toàn bộ hoặc một phần Công ước — điều khoản luật áp dụng trong hợp đồng vì thế quyết định rất nhiều.",
      en: "Vietnam entered reservations as to form under Articles 11 and 29 and Part II, so contracts must still be in writing. Article 6 allows the parties to exclude the Convention wholly or in part, which makes the governing-law clause decisive.",
    },
    sources: [
      "https://trungtamwto.vn/chu_de_khac/310-viet-nam-va-cong-uoc-vien/1",
      "https://tapchitoaan.vn/pham-vi-ap-dung-cua-cong-uoc-cisg-cho-hop-dong-mua-ban-hang-hoa-quoc-te",
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-canh-tranh-2018",
    number: "23/2018/QH14",
    type: "luat",
    domains: ["hop-dong", "doanh-nghiep"],
    issuedOn: "2018-06-12",
    effectiveOn: "2019-07-01",
    status: "active",
    title: {
      vi: "Luật Cạnh tranh",
      en: "Law on Competition",
    },
    summary: {
      vi: "Thay thế Luật Cạnh tranh 2004 và đổi hẳn cách tiếp cận tập trung kinh tế: bỏ ngưỡng thị phần 50% cứng, chuyển sang cấm khi giao dịch gây hoặc có khả năng gây tác động hạn chế cạnh tranh đáng kể. Luật cũng bổ sung chính sách khoan hồng cho doanh nghiệp tự khai báo thỏa thuận hạn chế cạnh tranh trước khi có quyết định điều tra.",
      en: "It replaced the 2004 Competition Law and changed the approach to economic concentration: the hard 50% market-share threshold gave way to a prohibition where a transaction causes or may cause a significant anti-competitive effect. It also introduced leniency for undertakings that self-report a restrictive agreement before an investigation decision is issued.",
    },
    note: {
      vi: "Ngưỡng thông báo tập trung kinh tế nằm ở nghị định thi hành, không ở luật. Giao dịch M&A phải kiểm tra ngưỡng trước khi ký, vì nghĩa vụ thông báo phát sinh trước khi hoàn tất giao dịch.",
      en: "The merger notification thresholds sit in the implementing decree, not the Law. M&A transactions must be tested against them before signing, since the notification duty arises before completion.",
    },
    sources: [
      "https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-quy-pham-phap-luat/luat-canh-tranh-so-232018qh14-ngay-1262018-hieu-luc-thi-hanh-tu-ngay-0172019-4473",
      "https://www.wipo.int/wipolex/en/legislation/details/19109",
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-bvqlntd-2023",
    number: "19/2023/QH15",
    type: "luat",
    domains: ["hop-dong"],
    issuedOn: "2023-06-20",
    effectiveOn: "2024-07-01",
    status: "active",
    title: {
      vi: "Luật Bảo vệ quyền lợi người tiêu dùng",
      en: "Law on Protection of Consumers' Rights",
    },
    summary: {
      vi: "Gồm bảy chương và 80 điều, tăng từ 51 điều của luật cũ, với một chương hoàn toàn mới về trách nhiệm của tổ chức, cá nhân kinh doanh trong các giao dịch đặc thù. Bổ sung nhóm hành vi bị cấm liên quan tới bán hàng đa cấp và tổ chức thiết lập, vận hành nền tảng số.",
      en: "In seven chapters and 80 articles, up from 51 in the previous Law, with an entirely new chapter on the duties of traders in special transactions. It adds prohibited conduct relating to multi-level marketing and to operators of digital platforms.",
    },
    note: {
      vi: "Hợp đồng theo mẫu và điều kiện giao dịch chung với người tiêu dùng phải đáp ứng yêu cầu riêng của luật này; điều khoản soạn theo thói quen giao dịch giữa doanh nghiệp với doanh nghiệp có thể vô hiệu khi bên kia là người tiêu dùng.",
      en: "Standard-form contracts and general trading conditions used with consumers must meet this Law's own requirements; clauses drafted on business-to-business habits may be void where the counterparty is a consumer.",
    },
    sources: [
      "https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-quy-pham-phap-luat/luat-bao-ve-quyen-loi-nguoi-tieu-dung-so-192023qh15-hieu-luc-thi-hanh-tu-ngay-0172024-9693",
      "https://congbao.chinhphu.vn/van-ban/luat-so-19-2023-qh15-39843.htm",
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-gddt-2023",
    number: "20/2023/QH15",
    type: "luat",
    domains: ["hop-dong", "doanh-nghiep"],
    issuedOn: "2023-06-22",
    effectiveOn: "2024-07-01",
    status: "active",
    title: {
      vi: "Luật Giao dịch điện tử",
      en: "Law on Electronic Transactions",
    },
    summary: {
      vi: "Gồm tám chương và 53 điều, giữ và sửa 33 điều của luật 2005 đồng thời bổ sung 18 điều mới. Đáng chú ý nhất với người làm hợp đồng là quy định về giá trị pháp lý của việc chuyển đổi giữa văn bản giấy và thông điệp dữ liệu, và về chứng thư điện tử.",
      en: "In eight chapters and 53 articles, it retains and amends 33 articles of the 2005 Law and adds 18 new ones. Most relevant to contract practice are the provisions on the legal value of conversion between paper documents and data messages, and on electronic certificates.",
    },
    note: {
      vi: "Thay thế Luật Giao dịch điện tử số 51/2005/QH11, hết hiệu lực từ 01/7/2024. Hợp đồng ký bằng chữ ký số cần kiểm tra loại chữ ký và điều kiện của tổ chức cung cấp dịch vụ theo luật mới.",
      en: "It replaced the 2005 Law on E-Transactions (No. 51/2005/QH11), which ceased to have effect on 1 July 2024. Contracts signed with a digital signature should be checked against the new Law's signature categories and service-provider conditions.",
    },
    sources: [
      "https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-quy-pham-phap-luat/luat-giao-dich-dien-tu-so-202023qh15-hieu-luc-thi-hanh-tu-ngay-0172024-9710",
      `${CP}/?pageid=27160&docid=208421`,
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-gia-2023",
    number: "16/2023/QH15",
    type: "luat",
    domains: ["hop-dong", "xay-dung"],
    issuedOn: "2023-06-19",
    effectiveOn: "2024-07-01",
    status: "active",
    title: {
      vi: "Luật Giá",
      en: "Law on Prices",
    },
    summary: {
      vi: "Gồm tám chương và 75 điều, thay thế Luật Giá 2012. Quy định danh mục hàng hóa, dịch vụ do Nhà nước định giá, nguyên tắc hiệp thương giá và toàn bộ chế định thẩm định giá — phần thường được viện dẫn khi tranh chấp về giá trị tài sản hoặc khối lượng công việc.",
      en: "In eight chapters and 75 articles, it replaces the 2012 Law on Prices. It sets the list of goods and services priced by the State, the rules on price negotiation, and the whole regime of valuation — the part most often invoked in disputes over asset value or the value of work done.",
    },
    note: {
      vi: "Hiệu lực chung từ 01/7/2024, riêng khoản 2 Điều 60 áp dụng từ 01/01/2026.",
      en: "Generally effective from 1 July 2024, save for Article 60.2 which applies from 1 January 2026.",
    },
    sources: [
      "https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-quy-pham-phap-luat/luat-gia-so-162023qh15-hieu-luc-thi-hanh-tu-ngay-0172024-9690",
      `${LVN}/tai-chinh/luat-gia-moi-nhat-so-16-2023-qh15-259728-d1.html`,
    ],
    confidence: "cross-check",
  },

  // ─────────────── TỐ TỤNG & TRỌNG TÀI — THI HÀNH VÀ HÒA GIẢI ────────────
  {
    id: "luat-thads-2008",
    number: "26/2008/QH12",
    type: "luat",
    domains: ["to-tung"],
    issuedOn: "2008-11-14",
    effectiveOn: "2009-07-01",
    status: "expired",
    title: {
      vi: "Luật Thi hành án dân sự",
      en: "Law on Enforcement of Civil Judgments",
    },
    summary: {
      vi: "Đạo luật quyết định số phận thực tế của một bản án hoặc phán quyết trọng tài đã có hiệu lực: trình tự yêu cầu thi hành án, xác minh điều kiện thi hành, kê biên và xử lý tài sản. Thắng kiện mà bên phải thi hành không còn tài sản thì mọi việc dừng lại ở đạo luật này chứ không ở bản án.",
      en: "The statute that decides the practical fate of a judgment or arbitral award once it is final: the application for enforcement, verification of the debtor's means, and attachment and disposal of assets. Where the debtor has no assets left, the matter ends here rather than in the judgment.",
    },
    note: {
      vi: "Đã qua nhiều lần sửa đổi bằng Luật 64/2014/QH13 và các luật sau đó. Nguồn tra được cho biết luật này hết hiệu lực từ 01/7/2026 khi luật thi hành án dân sự mới có hiệu lực; số hiệu của luật mới chưa xác minh được trong phiên tra cứu.",
      en: "It was amended several times, by Law 64/2014/QH13 and later statutes. The sources found indicate it ceased to have effect on 1 July 2026 when a new civil judgment enforcement law entered into force; the number of that new law could not be verified in this search.",
    },
    sources: [
      `${TVPL}/van-ban/Thu-tuc-To-tung/Luat-thi-hanh-an-dan-su-2008-26-2008-QH12-82197.aspx`,
      `${LVN}/an-ninh-trat-tu/luat-thi-hanh-an-dan-su-2008-39054-d1.html`,
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-64-2014",
    number: "64/2014/QH13",
    type: "luat",
    domains: ["to-tung"],
    issuedOn: "2014-11-25",
    effectiveOn: "2015-07-01",
    status: "expired",
    title: {
      vi: "Luật sửa đổi, bổ sung một số điều của Luật Thi hành án dân sự",
      en: "Law amending the Law on Enforcement of Civil Judgments",
    },
    summary: {
      vi: "Lần sửa đổi lớn nhất của pháp luật thi hành án dân sự, chuyển nhiều việc từ cơ chế đơn yêu cầu sang cơ chế cơ quan thi hành án chủ động, và siết lại nghĩa vụ cung cấp thông tin về tài sản của người phải thi hành án. Phải đọc kèm bản gốc năm 2008 chứ không đọc rời.",
      en: "The most substantial amendment to civil judgment enforcement, shifting much of the process from application-driven to enforcement-agency-driven and tightening the duty to disclose the debtor's assets. It must be read together with the 2008 original, not on its own.",
    },
    amends: ["luat-thads-2008"],
    sources: [
      `${TVPL}/van-ban/thu-tuc-to-tung/Luat-Thi-hanh-an-dan-su-sua-doi-2014-259728.aspx`,
      `${LVN}/dan-su/luat-thi-hanh-an-dan-su-sua-doi-2014-so-64-2014-qh13-91357-d1.html`,
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-22-2017",
    number: "22/2017/NĐ-CP",
    type: "nghi-dinh",
    domains: ["to-tung"],
    issuedOn: "2017-02-24",
    effectiveOn: "2017-04-15",
    status: "active",
    title: {
      vi: "Nghị định về hòa giải thương mại",
      en: "Decree on commercial mediation",
    },
    summary: {
      vi: "Đặt khung pháp lý cho hòa giải thương mại ngoài Tòa án: phạm vi, nguyên tắc, trình tự hòa giải, tiêu chuẩn hòa giải viên và điều kiện của tổ chức hòa giải. Đây là căn cứ để một điều khoản hòa giải trong hợp đồng có hiệu lực và để kết quả hòa giải thành được Tòa án công nhận.",
      en: "It establishes the framework for out-of-court commercial mediation: scope, principles, procedure, mediator qualifications and the conditions for mediation institutions. It is what gives a contractual mediation clause effect and allows a successful mediation outcome to be recognised by a court.",
    },
    note: {
      vi: "Điều khoản hòa giải bắt buộc trước khi khởi kiện hoặc trước khi đưa ra trọng tài cần được soạn rõ về thời hạn, nếu không nó dễ trở thành lý do để bên kia phản đối thẩm quyền.",
      en: "A mandatory mediation step before litigation or arbitration needs clear time limits, otherwise it readily becomes a ground for the other side to challenge jurisdiction.",
    },
    sources: [
      `${TVPL}/van-ban/Thuong-mai/Nghi-dinh-22-2017-ND-CP-hoa-giai-thuong-mai-280010.aspx`,
      "https://vmc.org.vn/thu-tuc-hoa-giai/nghi-dinh-so-222017ndcp-ve-hoa-giai-thuong-mai-a115.html",
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-tthc-2015",
    number: "93/2015/QH13",
    type: "luat",
    domains: ["to-tung"],
    issuedOn: "2015-11-25",
    effectiveOn: "2016-07-01",
    status: "amended",
    title: {
      vi: "Luật Tố tụng hành chính",
      en: "Law on Administrative Procedure",
    },
    summary: {
      vi: "Gồm 23 chương và 372 điều, thay thế Luật Tố tụng hành chính 2010. Đây là con đường pháp lý để khởi kiện quyết định hành chính và hành vi hành chính — thứ mà nhà đầu tư dùng khi bị thu hồi đất, bị từ chối cấp phép hoặc bị xử phạt.",
      en: "In 23 chapters and 372 articles, it replaced the 2010 Administrative Procedure Law. It is the route for challenging administrative decisions and administrative conduct — the one an investor uses when land is recovered, a licence refused or a penalty imposed.",
    },
    note: {
      vi: "Một số quy định liên quan tới Bộ luật Dân sự 2015 áp dụng từ 01/01/2017. Luật đã được sửa đổi, bổ sung bởi Luật số 85/2025/QH15.",
      en: "Certain provisions tied to the 2015 Civil Code applied from 1 January 2017. The Law was amended and supplemented by Law 85/2025/QH15.",
    },
    sources: [
      "https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-quy-pham-phap-luat/luat-to-tung-hanh-chinh-so-932015qh13-ngay-25112015-cua-quoc-hoi-hieu-luc-thi-hanh-tu-ngay-172016-1512",
      "https://english.luatvietnam.vn/law-no-93-2015-qh13-of-the-national-assembly-on-administrative-procedures-101331-doc1.html",
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-hgdt-2020",
    number: "58/2020/QH14",
    type: "luat",
    domains: ["to-tung"],
    issuedOn: "2020-06-16",
    effectiveOn: "2021-01-01",
    status: "amended",
    title: {
      vi: "Luật Hòa giải, đối thoại tại Tòa án",
      en: "Law on Mediation and Dialogue at Court",
    },
    summary: {
      vi: "Gồm bốn chương và 42 điều, đặt ra một bước hòa giải và đối thoại do Tòa án tổ chức trước khi thụ lý vụ án dân sự, hôn nhân gia đình và hành chính. Hòa giải viên được bổ nhiệm từ đội ngũ đã là Thẩm phán, Thẩm tra viên, Thư ký Tòa án hoặc Kiểm sát viên.",
      en: "In four chapters and 42 articles, it inserts a court-organised mediation and dialogue step before a civil, family or administrative case is docketed. Mediators are appointed from among former judges, court examiners, court clerks and procurators.",
    },
    note: {
      vi: "Được sửa đổi, bổ sung bởi Luật số 85/2025/QH15 ngày 25/6/2025, hiệu lực từ 01/7/2025.",
      en: "Amended and supplemented by Law 85/2025/QH15 of 25 June 2025, effective from 1 July 2025.",
    },
    sources: [
      `${CP}/?pageid=27160&docid=200446`,
      `${TVPL}/van-ban/Thu-tuc-To-tung/Luat-Hoa-giai-doi-thoai-tai-Toa-an-so-58-2020-QH14-395767.aspx`,
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-pha-san-2014",
    number: "51/2014/QH13",
    type: "luat",
    domains: ["doanh-nghiep", "to-tung"],
    issuedOn: "2014-06-19",
    effectiveOn: "2015-01-01",
    status: "expired",
    title: {
      vi: "Luật Phá sản 2014",
      en: "Law on Bankruptcy 2014",
    },
    summary: {
      vi: "Khung phá sản áp dụng suốt hơn một thập kỷ: điều kiện nộp đơn, thủ tục thụ lý, hội nghị chủ nợ, phương án phục hồi hoạt động kinh doanh và thứ tự phân chia tài sản. Hết hiệu lực khi Luật Phục hồi, phá sản 2025 có hiệu lực từ 01/3/2026.",
      en: "The bankruptcy framework for more than a decade: standing to file, admission of the petition, the creditors' meeting, the business recovery plan and the order of distribution. It ceased to have effect when the 2025 Law on Recovery and Bankruptcy entered into force on 1 March 2026.",
    },
    note: {
      vi: "Vụ việc phá sản thụ lý trước 01/3/2026 cần đối chiếu điều khoản chuyển tiếp của Luật Phục hồi, phá sản số 142/2025/QH15, trong đó khoản 3 Điều 38 có hiệu lực từ 01/7/2026.",
      en: "Cases admitted before 1 March 2026 should be checked against the transitional provisions of Law 142/2025/QH15 on Recovery and Bankruptcy, Article 38.3 of which takes effect on 1 July 2026.",
    },
    sources: [
      "https://vanban.chinhphu.vn/default.aspx?pageid=27160&docid=175356",
      "https://vcci.com.vn/legal-document/luat-pha-san-cua-quoc-hoi-so-512014qh13",
    ],
    confidence: "cross-check",
  },

  // ─────────────── DOANH NGHIỆP — ĐĂNG KÝ, VỐN VÀ SỔ SÁCH ────────────────
  {
    id: "nd-01-2021",
    number: "01/2021/NĐ-CP",
    type: "nghi-dinh",
    domains: ["doanh-nghiep"],
    issuedOn: "2021-01-04",
    effectiveOn: "2021-01-04",
    status: "expired",
    title: {
      vi: "Nghị định về đăng ký doanh nghiệp",
      en: "Decree on enterprise registration",
    },
    summary: {
      vi: "Quy định hồ sơ, trình tự và thủ tục đăng ký doanh nghiệp và đăng ký hộ kinh doanh, cùng thẩm quyền của Cơ quan đăng ký kinh doanh. Đây là văn bản quyết định một thay đổi về vốn, người đại diện theo pháp luật hay ngành nghề có được ghi nhận hay không. Thay thế Nghị định 78/2015/NĐ-CP và Nghị định 108/2018/NĐ-CP.",
      en: "It sets the dossier, sequence and procedure for enterprise and household-business registration and the powers of the business registration authority. It determines whether a change in charter capital, legal representative or business lines is actually recorded. It replaced Decrees 78/2015/NĐ-CP and 108/2018/NĐ-CP.",
    },
    note: {
      vi: "Nghị định 168/2025/NĐ-CP thay thế nghị định này từ 01/7/2025. Hồ sơ nộp trước mốc đó được giải quyết theo nghị định này, nên bản ghi vẫn nằm trong tập dữ liệu.",
      en: "Decree 168/2025/NĐ-CP replaced this Decree from 1 July 2025. Filings made before that date were handled under it, so the record stays in the dataset.",
    },
    guides: ["luat-dn-2020"],
    sources: [
      `${CP}/?pageid=27160&docid=202344`,
      "https://dangkykinhdoanh.gov.vn/vn/Pages/ChiTietVanBan.aspx?vID=27030",
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-chung-khoan-2019",
    number: "54/2019/QH14",
    type: "luat",
    domains: ["doanh-nghiep", "dau-tu"],
    issuedOn: "2019-11-26",
    effectiveOn: "2021-01-01",
    status: "amended",
    title: {
      vi: "Luật Chứng khoán",
      en: "Law on Securities",
    },
    summary: {
      vi: "Điều chỉnh chào bán chứng khoán ra công chúng, công ty đại chúng, niêm yết, công bố thông tin và quản trị công ty đại chúng. Với một thương vụ đầu tư vào công ty đại chúng, đây là đạo luật quyết định nghĩa vụ chào mua công khai và giới hạn sở hữu nước ngoài chứ không phải Luật Doanh nghiệp.",
      en: "It governs public offerings, public companies, listing, disclosure and the governance of public companies. In an investment into a public company it is this Law, not the Enterprise Law, that determines tender-offer obligations and foreign ownership limits.",
    },
    note: {
      vi: "Được sửa đổi, bổ sung bởi Luật số 56/2024/QH15, hiệu lực từ 01/01/2025.",
      en: "Amended and supplemented by Law 56/2024/QH15, effective from 1 January 2025.",
    },
    sources: [
      "https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-quy-pham-phap-luat/luat-chung-khoan-so-542019qh14-ngay-26112019-hieu-luc-thi-hanh-tu-ngay-01012021-6034",
      "https://vanban.chinhphu.vn/default.aspx?pageid=27160&docid=198541",
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-56-2024",
    number: "56/2024/QH15",
    type: "luat",
    domains: ["doanh-nghiep", "thue", "dau-tu"],
    issuedOn: "2024-11-29",
    effectiveOn: "2025-01-01",
    status: "active",
    title: {
      vi: "Luật sửa đổi, bổ sung một số điều của Luật Chứng khoán, Luật Kế toán, Luật Kiểm toán độc lập, Luật Ngân sách nhà nước, Luật Quản lý, sử dụng tài sản công, Luật Quản lý thuế, Luật Thuế thu nhập cá nhân, Luật Dự trữ quốc gia, Luật Xử lý vi phạm hành chính",
      en: "Law amending the Law on Securities, the Accounting Law, the Independent Audit Law, the State Budget Law, the Law on Management and Use of Public Assets, the Tax Administration Law, the Personal Income Tax Law, the National Reserves Law and the Law on Handling of Administrative Violations",
    },
    summary: {
      vi: "Một luật sửa chín luật cùng lúc — dạng văn bản khiến người tra cứu dễ bỏ sót nhất, vì nội dung sửa nằm rải trong chín đạo luật khác nhau chứ không tập trung ở một chỗ. Ba đạo luật chịu tác động rõ nhất với doanh nghiệp là Luật Chứng khoán, Luật Kế toán và Luật Quản lý thuế.",
      en: "One Law amending nine at once — the kind of instrument most easily missed, since its content is scattered across nine separate statutes rather than gathered in one place. The three that matter most to companies are the Securities Law, the Accounting Law and the Tax Administration Law.",
    },
    amends: ["luat-chung-khoan-2019", "luat-ke-toan-2015", "luat-qlt-2019"],
    sources: [
      "https://xaydungchinhsach.chinhphu.vn/toan-van-luat-sua-doi-bo-sung-mot-so-dieu-cua-luat-chung-khoan-luat-ke-toan-luat-kiem-toan-doc-lap-119241225125001042.htm",
      "https://luatminhkhue.vn/van-ban/luat-56-2024-qh15-nam-2024.aspx",
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-ke-toan-2015",
    number: "88/2015/QH13",
    type: "luat",
    domains: ["doanh-nghiep", "thue"],
    issuedOn: "2015-11-20",
    effectiveOn: "2017-01-01",
    status: "amended",
    title: {
      vi: "Luật Kế toán",
      en: "Law on Accounting",
    },
    summary: {
      vi: "Gồm sáu chương và 74 điều, thay thế Luật Kế toán 2003. Quy định nội dung công tác kế toán, chứng từ, sổ kế toán, báo cáo tài chính, tổ chức bộ máy kế toán và hoạt động kinh doanh dịch vụ kế toán. Chứng từ điện tử được công nhận là chứng từ kế toán nếu bảo đảm không bị thay đổi khi truyền.",
      en: "In six chapters and 74 articles, it replaced the 2003 Accounting Law. It covers accounting work, vouchers, books, financial statements, the accounting function and accounting services. Electronic vouchers count as accounting vouchers where their integrity in transmission is assured.",
    },
    note: {
      vi: "Được sửa đổi, bổ sung bởi Luật số 56/2024/QH15. Sổ sách kế toán là chứng cứ chính trong tranh chấp về công nợ và trong thanh tra thuế, nên nghĩa vụ lưu trữ theo luật này có sức nặng thực tế lớn hơn vẻ hành chính của nó.",
      en: "Amended and supplemented by Law 56/2024/QH15. Accounting records are the primary evidence in debt disputes and tax inspections, so the retention duties under this Law carry more practical weight than their administrative appearance suggests.",
    },
    sources: [
      "https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-quy-pham-phap-luat/luat-ke-toan-so-882015qh13-ngay-20112015-cua-quoc-hoi-hieu-luc-thi-hanh-tu-ngay-01012017-1521",
      `${LVN}/ke-toan/luat-ke-toan-2015-101336-d1.html`,
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-tctd-2024",
    number: "32/2024/QH15",
    type: "luat",
    domains: ["doanh-nghiep", "dau-tu"],
    issuedOn: "2024-01-18",
    effectiveOn: "2024-07-01",
    status: "active",
    title: {
      vi: "Luật Các tổ chức tín dụng",
      en: "Law on Credit Institutions",
    },
    summary: {
      vi: "Gồm 15 chương và 210 điều, thay thế Luật Các tổ chức tín dụng 2010 và bản sửa đổi 2017. Đáng chú ý là quy định hạn chế bán kèm sản phẩm bảo hiểm với dịch vụ ngân hàng, siết giới hạn cấp tín dụng cho khách hàng lớn và hạ ngưỡng công bố cổ đông xuống mức sở hữu trên 1% vốn điều lệ.",
      en: "In 15 chapters and 210 articles, it replaces the 2010 Law on Credit Institutions and its 2017 amendment. It notably restricts the bundling of insurance products with banking services, tightens the large-exposure limits and lowers the shareholder disclosure threshold to holdings above 1% of charter capital.",
    },
    note: {
      vi: "Hiệu lực chung từ 01/7/2024, riêng khoản 3 Điều 200 và khoản 15 Điều 210 áp dụng từ 01/01/2025.",
      en: "Generally effective from 1 July 2024, save for Article 200.3 and Article 210.15 which apply from 1 January 2025.",
    },
    sources: [
      "https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-quy-pham-phap-luat/luat-cac-to-chuc-tin-dung-so-322024qh15-hieu-luc-thi-hanh-tu-ngay-0172024-10722",
      `${LVN}/tai-chinh/luat-cac-to-chuc-tin-dung-2024-moi-nhat-so-32-2024-qh15-296639-d1.html`,
    ],
    confidence: "cross-check",
  },

  // ─────────────── ĐẦU TƯ — NGHỊ ĐỊNH THI HÀNH VÀ ĐẤT ĐAI ────────────────
  {
    id: "nd-31-2021",
    number: "31/2021/NĐ-CP",
    type: "nghi-dinh",
    domains: ["dau-tu"],
    issuedOn: "2021-03-26",
    effectiveOn: "2021-03-26",
    status: "active",
    title: {
      vi: "Nghị định quy định chi tiết và hướng dẫn thi hành một số điều của Luật Đầu tư",
      en: "Decree detailing and guiding the implementation of the Investment Law",
    },
    summary: {
      vi: "Nghị định thi hành Luật Đầu tư 2020: điều kiện đầu tư kinh doanh, ngành nghề và điều kiện tiếp cận thị trường đối với nhà đầu tư nước ngoài, bảo đảm đầu tư, ưu đãi và hỗ trợ đầu tư, thủ tục đầu tư và đầu tư ra nước ngoài. Phụ lục về điều kiện tiếp cận thị trường là chỗ tra đầu tiên khi thẩm định một khoản đầu tư nước ngoài.",
      en: "The implementing decree for the 2020 Investment Law: business investment conditions, market-access lines and conditions for foreign investors, investment guarantees, incentives and support, investment procedures and outbound investment. Its market-access appendix is the first place to look when screening a foreign investment.",
    },
    guides: ["luat-dau-tu-2020"],
    sources: [
      `${CP}/?pageid=27160&docid=202988`,
      "https://dangkykinhdoanh.gov.vn/vn/Pages/ChiTietVanBan.aspx?vID=27030",
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-35-2021",
    number: "35/2021/NĐ-CP",
    type: "nghi-dinh",
    domains: ["dau-tu", "xay-dung"],
    issuedOn: "2021-03-29",
    effectiveOn: "",
    status: "active",
    title: {
      vi: "Nghị định quy định chi tiết và hướng dẫn thi hành Luật Đầu tư theo phương thức đối tác công tư",
      en: "Decree detailing and guiding the implementation of the PPP Investment Law",
    },
    summary: {
      vi: "Quy định lĩnh vực và quy mô dự án PPP, hội đồng thẩm định, nội dung chuẩn bị dự án, lựa chọn nhà đầu tư, xác nhận hoàn thành và chuyển giao công trình, chấm dứt hợp đồng dự án và xử lý vi phạm. Với lĩnh vực giao thông, dự án phải có tổng mức đầu tư từ 1.500 tỷ đồng trở lên.",
      en: "It sets the sectors and project sizes for PPP, the appraisal councils, the content of project preparation, investor selection, completion and handover, termination of the project contract and the handling of violations. For transport, a project must have total investment of at least VND 1,500 billion.",
    },
    note: {
      vi: "Ngày có hiệu lực không xuất hiện trong các nguồn tra được nên để trống. Nghị định 243/2025/NĐ-CP quy định chi tiết Luật PPP ở giai đoạn sau; quan hệ giữa hai văn bản chưa đối chiếu được.",
      en: "The entry-into-force date did not appear in the sources found and is left blank. Decree 243/2025/NĐ-CP details the PPP Law in the later period; the relationship between the two could not be confirmed.",
    },
    guides: ["luat-ppp-2020"],
    sources: [
      `${CP}/?pageid=27160&docid=202963`,
      `${TVPL}/van-ban/Dau-tu/Nghi-dinh-35-2021-ND-CP-huong-dan-Luat-Dau-tu-theo-phuong-thuc-doi-tac-cong-tu-463635.aspx`,
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-kdbds-2023",
    number: "29/2023/QH15",
    type: "luat",
    domains: ["dau-tu", "xay-dung"],
    issuedOn: "2023-11-28",
    effectiveOn: "2024-08-01",
    status: "amended",
    title: {
      vi: "Luật Kinh doanh bất động sản",
      en: "Law on Real Estate Business",
    },
    summary: {
      vi: "Gồm 10 chương và 83 điều, thay thế Luật Kinh doanh bất động sản 2014. Hai thay đổi có sức nặng thực tế: chủ đầu tư chỉ được thu tiền đặt cọc tối đa 5% giá bán nhà ở hình thành trong tương lai và chỉ khi dự án đã đủ điều kiện đưa vào kinh doanh; cá nhân kinh doanh bất động sản quy mô nhỏ không phải thành lập doanh nghiệp nhưng vẫn phải kê khai nộp thuế.",
      en: "In 10 chapters and 83 articles, it replaces the 2014 Real Estate Business Law. Two changes carry real weight: a developer may take a deposit of no more than 5% of the price of off-plan housing, and only once the project qualifies for sale; and an individual trading real estate on a small scale need not form a company but must still declare and pay tax.",
    },
    note: {
      vi: "Ngày hiệu lực ban đầu là 01/01/2025, được đẩy sớm về 01/8/2024 cùng Luật Đất đai và Luật Nhà ở theo Luật số 43/2024/QH15.",
      en: "The original entry into force was 1 January 2025, brought forward to 1 August 2024 together with the Land Law and the Housing Law by Law 43/2024/QH15.",
    },
    sources: [
      "https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-quy-pham-phap-luat/luat-kinh-doanh-bat-dong-san-so-292023qh15-hieu-luc-thi-hanh-tu-ngay-01012025-10319",
      "https://nxbtuphap.moj.gov.vn/Pages/chi-tiet-tin-tuc.aspx?ItemID=52&l=tintucchung",
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-96-2024",
    number: "96/2024/NĐ-CP",
    type: "nghi-dinh",
    domains: ["dau-tu", "xay-dung"],
    issuedOn: "2024-07-24",
    effectiveOn: "2024-08-01",
    status: "active",
    title: {
      vi: "Nghị định quy định chi tiết một số điều của Luật Kinh doanh bất động sản",
      en: "Decree detailing the Law on Real Estate Business",
    },
    summary: {
      vi: "Gồm bảy chương và 40 điều kèm phụ lục, hướng dẫn thủ tục chuyển nhượng dự án, điều kiện hoạt động của sàn giao dịch bất động sản và hệ thống hợp đồng mẫu áp dụng trong giao dịch bất động sản. Thay thế Nghị định 02/2022/NĐ-CP.",
      en: "In seven chapters and 40 articles with appendices, it guides project transfer procedures, the operating conditions of real estate exchanges and the model contracts used in real estate transactions. It replaced Decree 02/2022/NĐ-CP.",
    },
    guides: ["luat-kdbds-2023"],
    sources: [
      "https://vanban.chinhphu.vn/?pageid=27160&docid=210798&classid=1",
      `${LVN}/dau-tu/nghi-dinh-96-2024-nd-cp-quy-dinh-chi-tiet-mot-so-dieu-cua-luat-kinh-doanh-bat-dong-san-362072-d1.html`,
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-102-2024",
    number: "102/2024/NĐ-CP",
    type: "nghi-dinh",
    domains: ["dau-tu", "xay-dung"],
    issuedOn: "2024-07-30",
    effectiveOn: "",
    status: "active",
    title: {
      vi: "Nghị định quy định chi tiết thi hành một số điều của Luật Đất đai",
      en: "Decree detailing the implementation of the Land Law",
    },
    summary: {
      vi: "Nghị định thi hành chính của Luật Đất đai 2024, kế thừa khung của Nghị định 43/2014/NĐ-CP và hướng dẫn chi tiết hơn về phân loại đất, thủ tục giao đất, cho thuê đất và chuyển mục đích sử dụng đất. Đây là văn bản mà chủ đầu tư dự án phải mở khi xử lý khâu tiếp cận đất đai.",
      en: "The principal implementing decree for the 2024 Land Law, carrying over the framework of Decree 43/2014/NĐ-CP and giving fuller guidance on land classification and the procedures for allocation, lease and change of land-use purpose. It is the decree a project developer opens when dealing with access to land.",
    },
    note: {
      vi: "Ngày có hiệu lực không xuất hiện thống nhất trong các nguồn tra được nên để trống; các nguồn chỉ thống nhất về ngày ban hành 30/7/2024.",
      en: "The entry-into-force date did not appear consistently across the sources found and is left blank; the sources agree only on the date of issue, 30 July 2024.",
    },
    guides: ["luat-dat-dai-2024"],
    sources: [
      `${CP}/?pageid=27160&docid=210795`,
      "https://xaydungchinhsach.chinhphu.vn/toan-van-nghi-dinh-102-2024-nd-cp-quy-dinh-chi-tiet-thi-hanh-mot-so-dieu-cua-luat-dat-dai-119240815163801541.htm",
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-71-2024",
    number: "71/2024/NĐ-CP",
    type: "nghi-dinh",
    domains: ["dau-tu", "thue"],
    issuedOn: "2024-06-27",
    effectiveOn: "2024-08-01",
    status: "active",
    title: {
      vi: "Nghị định quy định về giá đất",
      en: "Decree on land prices",
    },
    summary: {
      vi: "Quy định bốn phương pháp định giá đất — so sánh, thu nhập, thặng dư và hệ số điều chỉnh giá đất — cùng trình tự xây dựng, điều chỉnh bảng giá đất và định giá đất cụ thể. Đây là căn cứ của tiền sử dụng đất, tiền thuê đất và tiền bồi thường, nên nó quyết định phần lớn chi phí đất của một dự án.",
      en: "It prescribes four land valuation methods — comparison, income, surplus and price-adjustment coefficient — together with the procedures for building and adjusting the land price table and for specific land valuation. It underpins land use levies, land rent and compensation, and so drives most of a project's land cost.",
    },
    note: {
      vi: "Hiệu lực cùng ngày Luật Đất đai 2024 có hiệu lực là 01/8/2024, riêng Điều 37 áp dụng ngay từ ngày ký 27/6/2024.",
      en: "It takes effect on the same date as the 2024 Land Law, 1 August 2024, save for Article 37 which applied from the date of signature, 27 June 2024.",
    },
    guides: ["luat-dat-dai-2024"],
    sources: [
      `${CP}/?pageid=27160&docid=210523`,
      "https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-quy-pham-phap-luat/nghi-dinh-so-712024nd-cp-ngay-2762024-cua-chinh-phu-quy-dinh-ve-gia-dat-10510",
    ],
    confidence: "cross-check",
  },

  // ─────────────── LAO ĐỘNG — NGHỊ ĐỊNH THI HÀNH VÀ NỀN CŨ ───────────────
  {
    id: "nd-145-2020",
    number: "145/2020/NĐ-CP",
    type: "nghi-dinh",
    domains: ["lao-dong"],
    issuedOn: "2020-12-14",
    effectiveOn: "2021-02-01",
    status: "active",
    title: {
      vi: "Nghị định quy định chi tiết và hướng dẫn thi hành một số điều của Bộ luật Lao động về điều kiện lao động và quan hệ lao động",
      en: "Decree detailing the Labour Code on working conditions and labour relations",
    },
    summary: {
      vi: "Gồm 11 chương, 115 điều và ba phụ lục, đây là nghị định thi hành quan trọng nhất của Bộ luật Lao động 2019: quản lý lao động, hợp đồng lao động, cho thuê lại lao động, tiền lương, thời giờ làm việc và nghỉ ngơi, kỷ luật lao động và trách nhiệm vật chất. Trình tự xử lý kỷ luật sa thải nằm ở đây chứ không ở Bộ luật.",
      en: "In 11 chapters, 115 articles and three appendices, it is the principal implementing decree of the 2019 Labour Code: labour management, employment contracts, labour outsourcing, wages, working and rest time, discipline and material liability. The dismissal procedure is set out here, not in the Code itself.",
    },
    note: {
      vi: "Phần lớn tranh chấp sa thải thua ở thủ tục chứ không ở nội dung; trình tự và thành phần cuộc họp xử lý kỷ luật quy định tại nghị định này là chỗ dễ sai nhất.",
      en: "Most dismissal disputes are lost on procedure rather than substance, and the sequence and composition of the disciplinary meeting prescribed here is where employers most often go wrong.",
    },
    guides: ["blld-2019"],
    sources: [
      `${CP}/?pageid=27160&docid=201967`,
      "https://congbao.chinhphu.vn/van-ban/nghi-dinh-so-145-2020-nd-cp-32732.htm",
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-152-2020",
    number: "152/2020/NĐ-CP",
    type: "nghi-dinh",
    domains: ["lao-dong", "dau-tu"],
    issuedOn: "2020-12-30",
    effectiveOn: "",
    status: "amended",
    title: {
      vi: "Nghị định quy định về người lao động nước ngoài làm việc tại Việt Nam và tuyển dụng, quản lý người lao động Việt Nam làm việc cho tổ chức, cá nhân nước ngoài tại Việt Nam",
      en: "Decree on foreign employees working in Vietnam and on the recruitment and management of Vietnamese employees working for foreign organisations and individuals in Vietnam",
    },
    summary: {
      vi: "Đặt điều kiện và thủ tục cấp giấy phép lao động cho người nước ngoài, gồm giải trình nhu cầu sử dụng lao động nước ngoài, hồ sơ chứng minh chuyên gia hoặc nhà quản lý, và các trường hợp miễn giấy phép. Đây là nghị định mà mọi dự án có chuyên gia nước ngoài phải qua trước khi người đó được làm việc hợp pháp.",
      en: "It sets the conditions and procedure for work permits for foreign nationals, including the explanation of demand for foreign labour, the evidence required for expert or manager status, and the exemption cases. Every project bringing in foreign specialists must clear it before they may lawfully work.",
    },
    note: {
      vi: "Được sửa đổi, bổ sung bởi Nghị định 70/2023/NĐ-CP. Ngày có hiệu lực của bản gốc không xuất hiện trong các nguồn tra được nên để trống.",
      en: "Amended and supplemented by Decree 70/2023/NĐ-CP. The entry-into-force date of the original decree did not appear in the sources found and is left blank.",
    },
    guides: ["blld-2019"],
    sources: [
      `${CP}/?pageid=27160&docid=208673`,
      `${TVPL}/van-ban/Lao-dong-Tien-luong/Nghi-dinh-70-2023-ND-CP-sua-doi-Nghi-dinh-152-2020-ND-CP-lao-dong-nuoc-ngoai-579513.aspx`,
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-70-2023",
    number: "70/2023/NĐ-CP",
    type: "nghi-dinh",
    domains: ["lao-dong", "dau-tu"],
    issuedOn: "",
    effectiveOn: "2023-09-18",
    status: "active",
    title: {
      vi: "Nghị định sửa đổi, bổ sung một số điều của Nghị định số 152/2020/NĐ-CP về người lao động nước ngoài làm việc tại Việt Nam",
      en: "Decree amending Decree 152/2020/NĐ-CP on foreign employees working in Vietnam",
    },
    summary: {
      vi: "Rút thời hạn nộp báo cáo giải trình nhu cầu sử dụng lao động nước ngoài từ ít nhất 30 ngày xuống ít nhất 15 ngày trước ngày dự kiến sử dụng, mở rộng cách hiểu về giám đốc điều hành để gồm cả người đứng đầu chi nhánh, văn phòng đại diện hoặc địa điểm kinh doanh, và ấn định thời hạn cấp giấy phép lao động là 05 ngày làm việc kể từ khi nhận đủ hồ sơ.",
      en: "It shortens the lead time for the foreign-labour demand report from at least 30 days to at least 15 days before the intended start, widens the notion of executive director to cover the head of a branch, representative office or business location, and fixes the work permit issuance period at five working days from a complete dossier.",
    },
    note: {
      vi: "Ngày ban hành không xuất hiện thống nhất trong các nguồn tra được nên để trống; các nguồn thống nhất về ngày có hiệu lực 18/9/2023.",
      en: "The date of issue did not appear consistently across the sources found and is left blank; the sources agree on the entry into force of 18 September 2023.",
    },
    amends: ["nd-152-2020"],
    sources: [
      `${CP}/?pageid=27160&docid=208673`,
      "https://thesaigontimes.vn/nghi-dinh-70-va-giay-phep-lao-dong-cho-nguoi-nuoc-ngoai/",
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-atvsld-2015",
    number: "84/2015/QH13",
    type: "luat",
    domains: ["lao-dong", "xay-dung"],
    issuedOn: "2015-06-25",
    effectiveOn: "2016-07-01",
    status: "active",
    title: {
      vi: "Luật An toàn, vệ sinh lao động",
      en: "Law on Occupational Safety and Health",
    },
    summary: {
      vi: "Quy định việc bảo đảm an toàn, vệ sinh lao động, chế độ đối với người bị tai nạn lao động và bệnh nghề nghiệp, cùng trách nhiệm của các bên liên quan. Trên công trường, đây là đạo luật đặt nghĩa vụ huấn luyện, kiểm soát rủi ro và khai báo, điều tra tai nạn lao động — nền của trách nhiệm khi có sự cố.",
      en: "It governs occupational safety and health, the benefits for victims of occupational accidents and diseases, and the duties of the parties involved. On site it is the statute imposing training, risk control and the duty to report and investigate accidents — the basis of liability when something goes wrong.",
    },
    sources: [
      "https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-quy-pham-phap-luat/luat-an-toan-ve-sinh-lao-dong-so-842015qh13-ngay-2562015-cua-quoc-hoi-hieu-luc-thi-hanh-tu-ngay-0172016-1510",
      "https://english.luatvietnam.vn/law-no-84-2015-qh13-dated-june-25-2015-of-the-national-assembly-on-occupational-safety-and-health-96265-doc1.html",
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-cong-doan-2024",
    number: "50/2024/QH15",
    type: "luat",
    domains: ["lao-dong"],
    issuedOn: "2024-11-27",
    effectiveOn: "2025-07-01",
    status: "active",
    title: {
      vi: "Luật Công đoàn",
      en: "Law on Trade Unions",
    },
    summary: {
      vi: "Thay thế Luật Công đoàn 2012. Quy định quyền thành lập, gia nhập và hoạt động công đoàn của người lao động, việc tổ chức của người lao động tại doanh nghiệp gia nhập Công đoàn Việt Nam, trách nhiệm của người sử dụng lao động đối với công đoàn, và bảo đảm điều kiện hoạt động công đoàn.",
      en: "It replaces the 2012 Trade Union Law. It governs the right of workers to form, join and act through a union, the accession of enterprise-level worker organisations to the Vietnam General Confederation of Labour, employers' duties towards unions, and the conditions guaranteed for union activity.",
    },
    note: {
      vi: "Nghĩa vụ đóng kinh phí công đoàn của người sử dụng lao động là khoản chi phí thường bị bỏ sót khi lập ngân sách nhân sự cho một dự án mới.",
      en: "The employer's union funding contribution is the cost most often overlooked when budgeting headcount for a new project.",
    },
    sources: [
      "https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-quy-pham-phap-luat/luat-cong-doan-so-502024qh15-hieu-luc-thi-hanh-tu-ngay-0172025-11182",
      "https://congbao.chinhphu.vn/van-ban/luat-so-50-2024-qh15-43589.htm",
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-74-2024",
    number: "74/2024/NĐ-CP",
    type: "nghi-dinh",
    domains: ["lao-dong"],
    issuedOn: "2024-06-30",
    effectiveOn: "2024-07-01",
    status: "active",
    title: {
      vi: "Nghị định quy định mức lương tối thiểu đối với người lao động làm việc theo hợp đồng lao động",
      en: "Decree on the minimum wage for employees working under labour contracts",
    },
    summary: {
      vi: "Nâng mức lương tối thiểu vùng thêm khoảng 200.000 tới 280.000 đồng so với mức của Nghị định 38/2022/NĐ-CP, đồng thời chấm dứt hiệu lực của nghị định đó. Mức lương tối thiểu tháng là căn cứ để thoả thuận và trả lương, không được trả thấp hơn cho công việc làm đủ thời giờ.",
      en: "It raises the regional minimum wage by roughly VND 200,000 to 280,000 above the levels in Decree 38/2022/NĐ-CP and terminates that decree. The monthly minimum is the floor for wage negotiation and payment for full normal working time.",
    },
    guides: ["blld-2019"],
    sources: [
      `${CP}/?pageid=27160&docid=210536`,
      "https://xaydungchinhsach.chinhphu.vn/toan-van-nghi-dinh-74-2024-nd-cp-quy-dinh-muc-luong-toi-thieu-vung-119240701122135822.htm",
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-bhxh-2014",
    number: "58/2014/QH13",
    type: "luat",
    domains: ["lao-dong"],
    issuedOn: "2014-11-20",
    effectiveOn: "2016-01-01",
    status: "expired",
    title: {
      vi: "Luật Bảo hiểm xã hội 2014",
      en: "Law on Social Insurance 2014",
    },
    summary: {
      vi: "Gồm chín chương và 125 điều, thay thế Luật Bảo hiểm xã hội số 71/2006/QH11. Quy định chế độ và chính sách bảo hiểm xã hội, quyền và trách nhiệm của người lao động và người sử dụng lao động, quỹ bảo hiểm xã hội và thủ tục thực hiện. Hết hiệu lực khi Luật Bảo hiểm xã hội 2024 có hiệu lực từ 01/7/2025.",
      en: "In nine chapters and 125 articles, it replaced Law 71/2006/QH11 on Social Insurance. It set the social insurance regimes and policies, the rights and duties of employees and employers, the social insurance funds and the procedures. It ceased to have effect when the 2024 Social Insurance Law entered into force on 1 July 2025.",
    },
    note: {
      vi: "Quyền lợi phát sinh trong thời kỳ luật này còn hiệu lực — thời gian đóng, chế độ hưu trí, trợ cấp một lần — cần đối chiếu điều khoản chuyển tiếp của Luật Bảo hiểm xã hội số 41/2024/QH15.",
      en: "Entitlements accrued while this Law was in force — contribution periods, pension regimes, lump-sum benefits — must be checked against the transitional provisions of Law 41/2024/QH15 on Social Insurance.",
    },
    sources: [
      "https://mt.gov.vn/cntt/tin-tuc/1140/39986/nhung-diem-moi-cua-luat-bao-hiem-xa-hoi--so--58-2014-qh13-ngay-20-11-2014.aspx",
      `${TVPL}/van-ban/Bao-hiem/Luat-Bao-hiem-xa-hoi-2014-259700.aspx`,
    ],
    confidence: "cross-check",
  },

  // ─────────────── THUẾ — NGHỊ ĐỊNH THI HÀNH VÀ NỀN CŨ ───────────────────
  {
    id: "nd-126-2020",
    number: "126/2020/NĐ-CP",
    type: "nghi-dinh",
    domains: ["thue"],
    issuedOn: "2020-10-19",
    effectiveOn: "2020-12-05",
    status: "active",
    title: {
      vi: "Nghị định quy định chi tiết một số điều của Luật Quản lý thuế",
      en: "Decree detailing the Law on Tax Administration",
    },
    summary: {
      vi: "Nghị định thi hành chính của Luật Quản lý thuế 2019: khai thuế, tính thuế, hoàn thuế, gia hạn nộp thuế, khoanh nợ và xóa nợ, cùng biện pháp cưỡng chế thi hành quyết định hành chính về quản lý thuế. Ngân hàng phải cung cấp thông tin tài khoản người nộp thuế theo yêu cầu của cơ quan thuế.",
      en: "The principal implementing decree of the 2019 Tax Administration Law: declaration, calculation, refunds, payment extensions, debt freezing and write-off, and enforcement of administrative tax decisions. Banks must supply taxpayer account information at the tax authority's request.",
    },
    note: {
      vi: "Không điều chỉnh giao dịch liên kết, hóa đơn chứng từ và xử phạt vi phạm hành chính về thuế — ba mảng đó nằm ở các nghị định riêng.",
      en: "It does not cover related-party transactions, invoices and vouchers, or administrative penalties in tax matters — those three sit in separate decrees.",
    },
    guides: ["luat-qlt-2019"],
    sources: [
      `${CP}/?pageid=27160&docid=201402`,
      "https://dangkykinhdoanh.gov.vn/vn/Pages/ChiTietVanBan.aspx?vID=27029&TypeVB=1",
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-132-2020",
    number: "132/2020/NĐ-CP",
    type: "nghi-dinh",
    domains: ["thue", "doanh-nghiep"],
    issuedOn: "2020-11-05",
    effectiveOn: "2020-12-20",
    status: "amended",
    title: {
      vi: "Nghị định quy định về quản lý thuế đối với doanh nghiệp có giao dịch liên kết",
      en: "Decree on tax administration for enterprises with related-party transactions",
    },
    summary: {
      vi: "Quy định nguyên tắc, phương pháp và trình tự xác định giá giao dịch liên kết, cùng nghĩa vụ kê khai và lập hồ sơ xác định giá của người nộp thuế. Áp dụng từ kỳ tính thuế thu nhập doanh nghiệp năm 2020, thay thế Nghị định 20/2017/NĐ-CP và Nghị định 68/2020/NĐ-CP.",
      en: "It sets the principles, methods and sequence for determining related-party transaction prices and the taxpayer's declaration and transfer-pricing documentation duties. It applies from the 2020 corporate income tax period and replaced Decrees 20/2017/NĐ-CP and 68/2020/NĐ-CP.",
    },
    note: {
      vi: "Được sửa đổi, bổ sung bởi Nghị định 20/2025/NĐ-CP. Ngưỡng khống chế chi phí lãi vay của doanh nghiệp có giao dịch liên kết là nội dung bị truy thu nhiều nhất khi thanh tra thuế.",
      en: "Amended and supplemented by Decree 20/2025/NĐ-CP. The cap on deductible interest expense for enterprises with related-party transactions is the item most often reassessed on tax audit.",
    },
    guides: ["luat-qlt-2019"],
    sources: [
      "https://vanban.chinhphu.vn/default.aspx?pageid=27160&docid=201522",
      `${TVPL}/van-ban/Doanh-nghiep/Nghi-dinh-132-2020-ND-CP-quy-dinh-quan-ly-thue-doi-voi-doanh-nghiep-co-giao-dich-lien-ket-452218.aspx`,
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-123-2020",
    number: "123/2020/NĐ-CP",
    type: "nghi-dinh",
    domains: ["thue", "hop-dong"],
    issuedOn: "2020-10-19",
    effectiveOn: "",
    status: "amended",
    title: {
      vi: "Nghị định quy định về hóa đơn, chứng từ",
      en: "Decree on invoices and vouchers",
    },
    summary: {
      vi: "Khung pháp lý của hóa đơn điện tử: loại hóa đơn, thời điểm lập, nội dung bắt buộc, việc xử lý hóa đơn sai sót và chế độ chứng từ khấu trừ thuế. Trong tranh chấp hợp đồng, thời điểm lập hóa đơn thường là mốc chứng minh nghĩa vụ thanh toán đã phát sinh.",
      en: "The framework for electronic invoicing: invoice types, the time of issue, mandatory content, correction of erroneous invoices and withholding vouchers. In contract disputes the invoice date is often the point that proves the payment obligation arose.",
    },
    note: {
      vi: "Được sửa đổi, bổ sung bởi Nghị định 70/2025/NĐ-CP. Ngày có hiệu lực của bản gốc không xuất hiện trong các nguồn tra được nên để trống.",
      en: "Amended and supplemented by Decree 70/2025/NĐ-CP. The entry-into-force date of the original decree did not appear in the sources found and is left blank.",
    },
    guides: ["luat-qlt-2019"],
    sources: [
      `${CP}/?pageid=27160&docid=213179`,
      `${TVPL}/van-ban/Thue-Phi-Le-Phi/Nghi-dinh-70-2025-ND-CP-sua-doi-Nghi-dinh-123-2020-ND-CP-hoa-don-chung-tu-577816.aspx`,
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-70-2025",
    number: "70/2025/NĐ-CP",
    type: "nghi-dinh",
    domains: ["thue", "hop-dong"],
    issuedOn: "2025-03-20",
    effectiveOn: "2025-06-01",
    status: "active",
    title: {
      vi: "Nghị định sửa đổi, bổ sung một số điều của Nghị định số 123/2020/NĐ-CP quy định về hóa đơn, chứng từ",
      en: "Decree amending Decree 123/2020/NĐ-CP on invoices and vouchers",
    },
    summary: {
      vi: "Sửa khoản 1 và khoản 2 Điều 9 về thời điểm lập hóa đơn: với bán hàng hóa, hóa đơn lập tại thời điểm chuyển giao quyền sở hữu hoặc quyền sử dụng cho người mua, không phân biệt đã thu được tiền hay chưa. Bổ sung chứng từ khấu trừ thuế cho hoạt động kinh doanh trên nền tảng thương mại điện tử và nền tảng số.",
      en: "It amends Article 9.1 and 9.2 on the time of invoicing: for a sale of goods the invoice is issued when ownership or the right of use passes to the buyer, whether or not payment has been received. It adds a withholding voucher for business on e-commerce and digital platforms.",
    },
    amends: ["nd-123-2020"],
    sources: [
      `${CP}/?pageid=27160&docid=213179`,
      "https://xaydungchinhsach.chinhphu.vn/mot-so-noi-dung-moi-cua-nghi-dinh-so-70-2025-nd-cp-ve-hoa-don-chung-tu-119250403074719995.htm",
    ],
    confidence: "cross-check",
  },
  {
    id: "nq-107-2023",
    number: "107/2023/QH15",
    type: "nghi-quyet",
    domains: ["thue", "dau-tu"],
    issuedOn: "2023-11-29",
    effectiveOn: "2024-01-01",
    status: "active",
    title: {
      vi: "Nghị quyết về việc áp dụng thuế thu nhập doanh nghiệp bổ sung theo quy định chống xói mòn cơ sở thuế toàn cầu",
      en: "Resolution on the application of top-up corporate income tax under the global anti-base-erosion rules",
    },
    summary: {
      vi: "Đưa thuế tối thiểu toàn cầu vào pháp luật Việt Nam từ 01/01/2024, với mức thuế suất 15% áp dụng cho đơn vị hợp thành của tập đoàn đa quốc gia có doanh thu hợp nhất của công ty mẹ từ 750 triệu euro trở lên trong ít nhất hai của bốn năm tài chính liền trước. Số thuế bổ sung nộp về ngân sách trung ương.",
      en: "It brings the global minimum tax into Vietnamese law from 1 January 2024, at a 15% rate for constituent entities of multinational groups whose parent has consolidated revenue of at least EUR 750 million in at least two of the four preceding financial years. The top-up tax accrues to the central budget.",
    },
    note: {
      vi: "Đơn vị hợp thành thuộc phạm vi nghị quyết phải thông báo danh sách trong thời hạn 09 tháng kể từ ngày kết thúc năm tài chính báo cáo. Ưu đãi thuế theo giấy chứng nhận đăng ký đầu tư có thể bị vô hiệu hóa trên thực tế bởi cơ chế này.",
      en: "Constituent entities within scope must file the entity list within nine months of the end of the reporting financial year. Tax incentives granted in an investment registration certificate may in practice be neutralised by this mechanism.",
    },
    sources: [
      "https://vanban.chinhphu.vn/?docid=209231&pageid=27160",
      "https://quochoi.vn/tintuc/Pages/tin-hoat-dong-cua-quoc-hoi.aspx?ItemID=83223",
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-gtgt-2008",
    number: "13/2008/QH12",
    type: "luat",
    domains: ["thue"],
    issuedOn: "2008-06-03",
    effectiveOn: "2009-01-01",
    status: "expired",
    title: {
      vi: "Luật Thuế giá trị gia tăng 2008",
      en: "Law on Value Added Tax 2008",
    },
    summary: {
      vi: "Quy định đối tượng chịu thuế và không chịu thuế, người nộp thuế, căn cứ và phương pháp tính thuế, khấu trừ và hoàn thuế giá trị gia tăng. Đã qua các lần sửa đổi bằng Luật số 31/2013/QH13, 71/2014/QH13 và 106/2016/QH15, và hết hiệu lực khi Luật Thuế giá trị gia tăng 2024 có hiệu lực từ 01/7/2025.",
      en: "It set the taxable and non-taxable objects, the taxpayers, the basis and methods of calculation, and VAT deduction and refund. It was amended by Laws 31/2013/QH13, 71/2014/QH13 and 106/2016/QH15, and ceased to have effect when the 2024 VAT Law entered into force on 1 July 2025.",
    },
    note: {
      vi: "Giao dịch phát sinh trước 01/7/2025 vẫn xác định nghĩa vụ thuế theo luật này; hồ sơ hoàn thuế của kỳ cũ cũng vậy.",
      en: "Transactions arising before 1 July 2025 remain governed by this Law for the purposes of the tax liability, as do refund claims for earlier periods.",
    },
    sources: [
      `${CP}/?pageid=27160&docid=70797`,
      "https://vbpl.vn/TW/Pages/vbpq-luocdo.aspx?ItemID=12806",
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-tndn-2008",
    number: "14/2008/QH12",
    type: "luat",
    domains: ["thue", "doanh-nghiep"],
    issuedOn: "",
    effectiveOn: "",
    status: "expired",
    title: {
      vi: "Luật Thuế thu nhập doanh nghiệp 2008",
      en: "Law on Corporate Income Tax 2008",
    },
    summary: {
      vi: "Đạo luật thuế thu nhập doanh nghiệp áp dụng suốt gần hai thập kỷ, đã được sửa đổi, bổ sung bởi các Luật số 32/2013/QH13, 71/2014/QH13, 61/2020/QH14, 12/2022/QH15 và 15/2023/QH15. Hết hiệu lực từ ngày Luật Thuế thu nhập doanh nghiệp số 67/2025/QH15 có hiệu lực, tức 01/10/2025.",
      en: "The corporate income tax statute in force for nearly two decades, amended by Laws 32/2013/QH13, 71/2014/QH13, 61/2020/QH14, 12/2022/QH15 and 15/2023/QH15. It ceased to have effect when Law 67/2025/QH15 on Corporate Income Tax entered into force on 1 October 2025.",
    },
    note: {
      vi: "Ngày ban hành và ngày có hiệu lực của bản gốc không xuất hiện trong các nguồn tra được nên để trống. Luật mới áp dụng ngay cho kỳ tính thuế năm 2025, nên kỳ chuyển tiếp cần đọc kỹ điều khoản thi hành.",
      en: "The date of issue and original entry into force did not appear in the sources found and are left blank. The new Law applies from the 2025 tax period itself, so the transitional provisions repay careful reading.",
    },
    sources: [
      `${TVPL}/van-ban/Doanh-nghiep/Luat-Thue-thu-nhap-doanh-nghiep-2025-so-67-2025-QH15-580594.aspx`,
      "https://congbao.chinhphu.vn/tai-ve-van-ban-so-67-2025-qh15-45557-57755?format=pdf",
    ],
    confidence: "cross-check",
  },
  /*
    ───────────────── ĐỢT BỔ SUNG NGÀY 21/9/2026 ─────────────────

    Hai mươi lăm bản ghi dưới đây được tra trong cùng điều kiện với đợt 04/9/2026:
    phiên làm việc không mở được thuvienphapluat.vn, vanban.chinhphu.vn, vbpl.vn
    và luatvietnam.vn, nên số hiệu và các mốc thời gian được đối chiếu giữa ít
    nhất hai kết quả tìm kiếm độc lập. Chi tiết nào không khớp hoặc không xuất
    hiện thì để trống. Cả nhóm mang `confidence: "cross-check"`, và `sources` là
    địa chỉ trang tìm được chứ không phải trang đã mở.
  */
  {
    id: "luat-kien-truc-2019",
    number: "40/2019/QH14",
    type: "luat",
    domains: ["xay-dung"],
    issuedOn: "2019-06-13",
    effectiveOn: "2020-07-01",
    status: "active",
    verifiedOn: VERIFIED_2026_09_21,
    title: {
      vi: "Luật Kiến trúc",
      en: "Law on Architecture",
    },
    summary: {
      vi: "Đạo luật riêng cho hoạt động kiến trúc, đặt cạnh Luật Xây dựng chứ không nằm trong đó. Điều chỉnh quản lý kiến trúc, quy chế quản lý kiến trúc của địa phương, hành nghề kiến trúc và chứng chỉ hành nghề. Điều kiện cấp chứng chỉ gồm trình độ đại học về kiến trúc và tối thiểu ba năm kinh nghiệm dịch vụ kiến trúc.",
      en: "A statute of its own for architectural activity, sitting beside the Construction Law rather than inside it. It governs architectural management, local architectural management regulations, architectural practice and practising certificates. A certificate requires tertiary education in architecture and at least three years of experience in architectural services.",
    },
    sources: [
      "https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-quy-pham-phap-luat/luat-kien-truc-so-402019qh14-ngay-1362019-hieu-luc-thi-hanh-tu-ngay-0172020-5583",
      "https://vbpl.vn/boxaydung/Pages/vbpq-van-ban-goc.aspx?ItemID=136039",
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-quy-hoach-2017",
    number: "21/2017/QH14",
    type: "luat",
    domains: ["xay-dung", "dau-tu"],
    issuedOn: "2017-11-24",
    effectiveOn: "2019-01-01",
    status: "amended",
    verifiedOn: VERIFIED_2026_09_21,
    title: {
      vi: "Luật Quy hoạch",
      en: "Law on Planning",
    },
    summary: {
      vi: "Đặt một hệ thống quy hoạch quốc gia thống nhất và quy định việc lập, thẩm định, phê duyệt, công bố, thực hiện, đánh giá và điều chỉnh quy hoạch trong hệ thống đó. Luật gồm sáu chương, năm mươi chín điều và ba phụ lục. Đây là văn bản gốc mà quy hoạch đô thị, quy hoạch nông thôn và quy hoạch ngành phải đặt mình vào.",
      en: "It establishes a single national planning system and governs the formulation, appraisal, approval, publication, implementation, evaluation and adjustment of plans within it. The Law has six chapters, fifty-nine articles and three appendices. Urban, rural and sectoral planning all take their place within this framework.",
    },
    note: {
      vi: "Luật đã qua nhiều lần sửa đổi bằng các luật sửa nhiều luật; phạm vi từng lần sửa chưa đối chiếu được với nguồn chính thống trong phiên tra cứu.",
      en: "The Law has been amended several times by omnibus amending laws; the scope of each amendment could not be confirmed against an official source in this search.",
    },
    sources: [
      "https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-quy-pham-phap-luat/luat-quy-hoach-so-212017qh14-ngay-24112017-hieu-luc-thi-hanh-tu-ngay-01012019-4034",
      "https://congbao.chinhphu.vn/van-ban/luat-so-21-2017-qh14-25327/20279.htm",
    ],
    confidence: "cross-check",
  },
  {
    id: "tt-06-2021-bxd",
    number: "06/2021/TT-BXD",
    type: "thong-tu",
    domains: ["xay-dung"],
    issuedOn: "2021-06-30",
    effectiveOn: "2021-08-15",
    status: "active",
    verifiedOn: VERIFIED_2026_09_21,
    title: {
      vi: "Thông tư quy định về phân cấp công trình xây dựng và hướng dẫn áp dụng trong quản lý hoạt động đầu tư xây dựng",
      en: "Circular on the grading of construction works and its application in construction investment management",
    },
    summary: {
      vi: "Bảng phân cấp công trình xây dựng và cách áp dụng cấp công trình trong quản lý hoạt động đầu tư xây dựng. Cấp công trình quyết định thẩm quyền thẩm định thiết kế, điều kiện năng lực nhà thầu và thời hạn bảo hành, nên đây là văn bản phải mở trước khi xác định thủ tục cho một dự án. Thông tư thay thế Thông tư 03/2016/TT-BXD và Thông tư 07/2019/TT-BXD.",
      en: "It sets the grading table for construction works and how the grade applies across construction investment management. The grade drives design-appraisal competence, contractor capability requirements and warranty periods, so it is the document to open before fixing the procedure for a project. It replaced Circulars 03/2016/TT-BXD and 07/2019/TT-BXD.",
    },
    sources: [
      "https://congbao.chinhphu.vn/van-ban/thong-tu-so-06-2021-tt-bxd-33988.htm",
      "https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-quy-pham-phap-luat/thong-tu-so-062021tt-bxd-ngay-3062021-cua-bo-xay-dung-quy-dinh-ve-phan-cap-cong-trinh-xay-dung-va-huong-dan-ap-dung-trong-7676",
    ],
    confidence: "cross-check",
  },
  {
    id: "tt-10-2021-bxd",
    number: "10/2021/TT-BXD",
    type: "thong-tu",
    domains: ["xay-dung", "lao-dong"],
    issuedOn: "2021-08-25",
    effectiveOn: "2021-10-15",
    status: "active",
    verifiedOn: VERIFIED_2026_09_21,
    title: {
      vi: "Thông tư hướng dẫn Nghị định 06/2021/NĐ-CP và Nghị định 44/2016/NĐ-CP",
      en: "Circular guiding Decrees 06/2021/NĐ-CP and 44/2016/NĐ-CP",
    },
    summary: {
      vi: "Hướng dẫn chi tiết về quản lý an toàn lao động, chất lượng thi công và bảo trì công trình xây dựng, gồm hai mươi mốt điều. Đây là lớp dưới cùng của chuỗi quản lý chất lượng thi công: luật đặt nguyên tắc, nghị định quy định chi tiết, thông tư này nói cách làm hồ sơ. Thông tư thay thế Thông tư 26/2016/TT-BXD và Thông tư 04/2019/TT-BXD.",
      en: "It details occupational-safety management, construction quality and the maintenance of works, in twenty-one articles. It is the bottom layer of the construction-quality chain: the statute sets principle, the decree the detail, this Circular the paperwork. It replaced Circulars 26/2016/TT-BXD and 04/2019/TT-BXD.",
    },
    guides: ["nd-06-2021"],
    sources: [
      "https://vanban.chinhphu.vn/default.aspx?pageid=27160&docid=203945",
      "https://soxaydung.hungyen.gov.vn/thong-tu-so-102021ttbxd-huong-dan-nghi-dinh-so-062021nd-cp-nghi-dinh-442016nd-cp-va-thay-the-thong-t-c2168.html",
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-35-2023",
    number: "35/2023/NĐ-CP",
    type: "nghi-dinh",
    domains: ["xay-dung"],
    issuedOn: "2023-06-20",
    effectiveOn: "2023-06-20",
    status: "active",
    verifiedOn: VERIFIED_2026_09_21,
    title: {
      vi: "Nghị định sửa đổi, bổ sung một số điều của các nghị định thuộc lĩnh vực quản lý nhà nước của Bộ Xây dựng",
      en: "Decree amending decrees in the state management fields of the Ministry of Construction",
    },
    summary: {
      vi: "Một nghị định sửa nhiều nghị định: quy hoạch đô thị, quy hoạch xây dựng và quản lý chất lượng thi công, bảo trì công trình. Nghị định có hiệu lực ngay từ ngày ký, không có khoảng chờ. Vì sửa rải rác nhiều văn bản nên phải đọc kèm bản gốc của từng nghị định bị sửa.",
      en: "One decree amending several: urban planning, construction planning, and the management of construction quality and maintenance. It took effect on the date of signature, with no waiting period. Because the amendments are scattered across several instruments, each amended decree must be read alongside it.",
    },
    note: {
      vi: "Nguồn tra được nêu các nghị định bị sửa gồm Nghị định 37/2010/NĐ-CP, Nghị định 44/2015/NĐ-CP, Nghị định 72/2019/NĐ-CP và Nghị định 06/2021/NĐ-CP. Chỉ Nghị định 06/2021/NĐ-CP có mặt trong tập dữ liệu này nên chỉ quan hệ đó được ghi nhận.",
      en: "The sources found name Decrees 37/2010/NĐ-CP, 44/2015/NĐ-CP, 72/2019/NĐ-CP and 06/2021/NĐ-CP among those amended. Only Decree 06/2021/NĐ-CP is present in this dataset, so only that relation is recorded.",
    },
    amends: ["nd-06-2021"],
    sources: [
      "https://vanban.chinhphu.vn/?pageid=27160&docid=208090",
      "https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-quy-pham-phap-luat/nghi-dinh-so-352023nd-cp-ngay-2062023-cua-chinh-phu-sua-doi-bo-sung-mot-so-dieu-cua-cac-nghi-dinh-thuoc-linh-vuc-quan-ly-9541",
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-bvmt-2020",
    number: "72/2020/QH14",
    type: "luat",
    domains: ["xay-dung", "dau-tu"],
    issuedOn: "2020-11-17",
    effectiveOn: "2022-01-01",
    status: "active",
    verifiedOn: VERIFIED_2026_09_21,
    title: {
      vi: "Luật Bảo vệ môi trường",
      en: "Law on Environmental Protection",
    },
    summary: {
      vi: "Khung pháp lý về bảo vệ môi trường, gồm mười sáu chương và một trăm bảy mươi mốt điều. Luật đưa giấy phép môi trường và đánh giá tác động môi trường vào chuỗi thủ tục của một dự án đầu tư xây dựng, nên đây là văn bản đi kèm hồ sơ dự án chứ không đứng riêng. Luật Bảo vệ môi trường 2014 hết hiệu lực khi luật này có hiệu lực.",
      en: "The framework statute on environmental protection, in sixteen chapters and one hundred and seventy-one articles. It places the environmental licence and the environmental impact assessment inside the procedural chain of a construction investment project, so it travels with the project file rather than standing apart. The 2014 Law ceased to have effect when this one commenced.",
    },
    sources: [
      "https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-quy-pham-phap-luat/luat-bao-ve-moi-truong-so-722020qh14-ngay-17112020-hieu-luc-thi-hanh-tu-ngay-01012022-7518",
      "https://english.luatvietnam.vn/law-on-environmental-protection-no-72-2020-qh14-dated-november-17-2020-of-the-national-assembly-195564-doc1.html",
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-08-2022",
    number: "08/2022/NĐ-CP",
    type: "nghi-dinh",
    domains: ["xay-dung", "dau-tu"],
    issuedOn: "2022-01-10",
    effectiveOn: "2022-01-10",
    status: "active",
    verifiedOn: VERIFIED_2026_09_21,
    title: {
      vi: "Nghị định quy định chi tiết một số điều của Luật Bảo vệ môi trường",
      en: "Decree detailing a number of articles of the Law on Environmental Protection",
    },
    summary: {
      vi: "Quy định chi tiết thủ tục môi trường của một dự án: phân nhóm dự án theo tiêu chí môi trường, đánh giá tác động môi trường, giấy phép môi trường và đăng ký môi trường. Nghị định có hiệu lực từ ngày ký. Đây là văn bản quyết định một dự án phải xin giấy phép môi trường hay chỉ phải đăng ký.",
      en: "It details the environmental procedure for a project: classification of projects by environmental criteria, environmental impact assessment, the environmental licence and environmental registration. It took effect on the date of signature. It decides whether a project needs a licence or only a registration.",
    },
    guides: ["luat-bvmt-2020"],
    sources: [
      "https://www.ddif.com.vn/mot-so-diem-noi-dung-lien-quan-den-thu-tuc-bao-ve-moi-truong-theo-luat-bao-ve-moi-truong-so-72-2020-qh14-va-nghi-dinh-so-08-2022-nd-cp-ngay-10-01-2022/",
      "https://luatduongtri.vn/luat-bao-ve-moi-truong-2022/",
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-72-2025",
    number: "72/2025/NĐ-CP",
    type: "nghi-dinh",
    domains: ["nang-luong"],
    issuedOn: "2025-03-28",
    effectiveOn: "2025-03-28",
    status: "active",
    verifiedOn: VERIFIED_2026_09_21,
    title: {
      vi: "Nghị định quy định về cơ chế, thời gian điều chỉnh giá bán lẻ điện bình quân",
      en: "Decree on the mechanism and timing for adjusting the average retail electricity price",
    },
    summary: {
      vi: "Đặt cơ chế và nhịp điều chỉnh giá bán lẻ điện bình quân. Khoảng cách tối thiểu giữa hai lần điều chỉnh là ba tháng. Mức tăng từ 10% trở lên so với giá hiện hành phải qua bước kiểm tra, rà soát của Bộ Công Thương và báo cáo Chính phủ cho ý kiến. Nghị định có hiệu lực từ ngày ký.",
      en: "It sets the mechanism and cadence for adjusting the average retail electricity price. The minimum interval between two adjustments is three months. An increase of 10% or more over the prevailing price goes through review by the Ministry of Industry and Trade and a report to the Government. The Decree took effect on the date of signature.",
    },
    guides: ["luat-dien-luc-2024"],
    sources: [
      "https://xaydungchinhsach.chinhphu.vn/nghi-dinh-72-2025-nd-cp-ve-co-che-thoi-gian-dieu-chinh-gia-ban-le-dien-binh-quan-119250401173706244.htm",
      "https://baochinhphu.vn/quy-dinh-moi-ve-co-che-thoi-gian-dieu-chinh-gia-ban-le-dien-binh-quan-102250401145756615.htm",
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-21-2021",
    number: "21/2021/NĐ-CP",
    type: "nghi-dinh",
    domains: ["hop-dong"],
    issuedOn: "2021-03-19",
    effectiveOn: "2021-05-15",
    status: "active",
    verifiedOn: VERIFIED_2026_09_21,
    title: {
      vi: "Nghị định quy định thi hành Bộ luật Dân sự về bảo đảm thực hiện nghĩa vụ",
      en: "Decree implementing the Civil Code on securing the performance of obligations",
    },
    summary: {
      vi: "Quy định tài sản bảo đảm, việc xác lập và thực hiện biện pháp bảo đảm, và việc xử lý tài sản bảo đảm; gồm năm chương và sáu mươi hai điều. Bộ luật Dân sự 2015 đổi nhiều quy định về tài sản và biện pháp bảo đảm nhưng chưa có nghị định hướng dẫn, nên cách làm giữa các nơi không giống nhau; nghị định này lấp chỗ đó. Văn bản gắn chặt với hoạt động cấp tín dụng và xử lý tài sản bảo đảm của ngân hàng.",
      en: "It governs secured assets, the creation and performance of security measures and the enforcement of collateral, in five chapters and sixty-two articles. The 2015 Civil Code had changed much about assets and security without an implementing decree, so practice diverged; this Decree closes that gap. It bears directly on lending and on banks' enforcement of collateral.",
    },
    guides: ["blds-2015"],
    sources: [
      "https://vanban.chinhphu.vn/default.aspx?pageid=27160&docid=202835",
      "https://pbgdpl.haiphong.gov.vn/Tu-sach-phap-luat/Dan-su/Nghi-dinh-212021ND-CP-ngay-1932021-quy-dinh-thi-hanh-Bo-luat-Dan-su-ve-bao-dam-thuc-hien-nghia-vu-151970.html",
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-tctand-2024",
    number: "34/2024/QH15",
    type: "luat",
    domains: ["to-tung"],
    issuedOn: "2024-06-24",
    effectiveOn: "2025-01-01",
    status: "active",
    verifiedOn: VERIFIED_2026_09_21,
    title: {
      vi: "Luật Tổ chức Tòa án nhân dân",
      en: "Law on the Organisation of People's Courts",
    },
    summary: {
      vi: "Quy định vị trí, chức năng, nhiệm vụ, quyền hạn và tổ chức bộ máy của Tòa án nhân dân, cùng chế độ Thẩm phán, Hội thẩm và các chức danh khác. Luật thay thế Luật Tổ chức Tòa án nhân dân 2014. Người đi kiện đọc luật này để biết vụ việc của mình được đưa tới cấp Tòa án nào và ai ngồi xử.",
      en: "It sets the position, functions, duties, powers and organisational structure of the People's Courts, together with the regime for Judges, Jurors and other court positions. It replaced the 2014 Law. A litigant reads it to learn which level of court will take the case and who will sit on it.",
    },
    replaces: ["luat-tctand-2014"],
    sources: [
      "https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-quy-pham-phap-luat/luat-to-chuc-toa-an-nhan-dan-so-342024qh15-hieu-luc-thi-hanh-tu-ngay-01012025-10735",
      "https://congly.vn/nhung-diem-moi-co-ban-cua-luat-to-chuc-toa-an-nhan-dan-2024-co-hieu-luc-tu-hom-nay-01-01-2025-465209.html",
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-tctand-2014",
    number: "62/2014/QH13",
    type: "luat",
    domains: ["to-tung"],
    issuedOn: "2014-11-24",
    effectiveOn: "2015-06-01",
    status: "expired",
    verifiedOn: VERIFIED_2026_09_21,
    title: {
      vi: "Luật Tổ chức Tòa án nhân dân 2014",
      en: "Law on the Organisation of People's Courts 2014",
    },
    summary: {
      vi: "Khung tổ chức của hệ thống Tòa án nhân dân trong giai đoạn từ giữa năm 2015 tới hết năm 2024. Luật thay thế Luật Tổ chức Tòa án nhân dân số 33/2002/QH10 và hết hiệu lực khi Luật Tổ chức Tòa án nhân dân 2024 có hiệu lực. Bản án tuyên trong giai đoạn này đọc theo cơ cấu Tòa án của luật này.",
      en: "The organisational framework of the People's Courts from mid-2015 to the end of 2024. It replaced Law 33/2002/QH10 and ceased to have effect when the 2024 Law commenced. Judgments handed down in that period are read against the court structure it set.",
    },
    sources: [
      "https://congbao.chinhphu.vn/van-ban/luat-so-62-2014-qh13-12678.htm",
      "https://congly.vn/luat-to-chuc-tand-2014-so-62-2014-qh13-dang-ap-dung-234037.html",
    ],
    confidence: "cross-check",
  },
  {
    id: "icc-2021",
    number: "ICC Arbitration Rules 2021",
    type: "quy-tac",
    domains: ["to-tung"],
    issuedOn: "2020-12-01",
    effectiveOn: "2021-01-01",
    status: "active",
    verifiedOn: VERIFIED_2026_09_21,
    title: {
      vi: "Quy tắc Trọng tài ICC 2021",
      en: "ICC Arbitration Rules 2021",
    },
    summary: {
      vi: "Bộ quy tắc tố tụng của Tòa Trọng tài Quốc tế ICC, áp dụng cho vụ kiện đăng ký từ ngày 01/01/2021 trừ khi thỏa thuận trọng tài quy định khác. Bản 2021 mở rộng thủ tục rút gọn lên ngưỡng ba triệu đô la Mỹ đối với thỏa thuận trọng tài giao kết từ ngày 01/01/2021, cho phép tổ chức phiên họp từ xa, và quy định rõ các trường hợp hợp nhất vụ kiện. Vụ đăng ký trước mốc đó tiếp tục theo bản 2017.",
      en: "The procedural rules of the ICC International Court of Arbitration, applying to cases registered from 1 January 2021 unless the arbitration agreement provides otherwise. The 2021 edition raises the expedited-procedure threshold to USD 3 million for agreements concluded on or after 1 January 2021, allows hearings to be held remotely, and states the grounds for consolidation. Cases registered earlier continue under the 2017 Rules.",
    },
    sources: [
      "https://iccwbo.org/dispute-resolution/dispute-resolution-services/arbitration/rules-procedure/2021-arbitration-rules/",
      "https://www.mayerbrown.com/en/insights/publications/2021/01/icc-arbitration-rules-2021-10-key-changes-you-need-to-know",
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-168-2025",
    number: "168/2025/NĐ-CP",
    type: "nghi-dinh",
    domains: ["doanh-nghiep"],
    issuedOn: "2025-06-30",
    effectiveOn: "2025-07-01",
    status: "active",
    verifiedOn: VERIFIED_2026_09_21,
    title: {
      vi: "Nghị định về đăng ký doanh nghiệp 2025",
      en: "Decree on enterprise registration 2025",
    },
    summary: {
      vi: "Quy định hồ sơ, trình tự, thủ tục đăng ký doanh nghiệp và đăng ký hộ kinh doanh, đăng ký qua mạng thông tin điện tử, việc cung cấp và chia sẻ thông tin đăng ký, cùng thẩm quyền của Cơ quan đăng ký kinh doanh. Nghị định thay thế Nghị định 01/2021/NĐ-CP và Nghị định 122/2020/NĐ-CP. Hồ sơ nộp từ 01/7/2025 đi theo nghị định này.",
      en: "It sets the dossier, sequence and procedure for enterprise and household-business registration, online registration, the provision and sharing of registration information, and the powers of the business registration authority. It replaced Decrees 01/2021/NĐ-CP and 122/2020/NĐ-CP. Filings made from 1 July 2025 follow this Decree.",
    },
    replaces: ["nd-01-2021"],
    guides: ["luat-dn-2020"],
    sources: [
      "https://thuvienphapluat.vn/van-ban/Doanh-nghiep/Nghi-dinh-168-2025-ND-CP-dang-ky-doanh-nghiep-623074.aspx",
      "https://lexnovum.com.vn/nhung-diem-moi-cua-nghi-dinh-168-2025-nd-cp-so-voi-nghi-dinh-01-2021-nd-cp-ve-dang-ky-doanh-nghiep/",
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-htx-2023",
    number: "17/2023/QH15",
    type: "luat",
    domains: ["doanh-nghiep"],
    issuedOn: "2023-06-20",
    effectiveOn: "2024-07-01",
    status: "active",
    verifiedOn: VERIFIED_2026_09_21,
    title: {
      vi: "Luật Hợp tác xã",
      en: "Law on Cooperatives",
    },
    summary: {
      vi: "Khung pháp lý của tổ hợp tác, hợp tác xã và liên hiệp hợp tác xã, gồm mười hai chương và một trăm mười lăm điều. Luật mở rộng tư cách thành viên thành ba nhóm là thành viên chính thức, thành viên góp vốn và thành viên liên kết không góp vốn, đồng thời đặt yêu cầu về quỹ chung không chia. Luật thay thế Luật Hợp tác xã số 23/2012/QH13.",
      en: "The framework for cooperative groups, cooperatives and unions of cooperatives, in twelve chapters and one hundred and fifteen articles. It widens membership into official members, capital-contributing members and non-contributing affiliated members, and requires an indivisible common fund. It replaced Law 23/2012/QH13 on Cooperatives.",
    },
    note: {
      vi: "Luật Hợp tác xã số 23/2012/QH13 không có trong tập dữ liệu này nên quan hệ thay thế chưa được ghi nhận thành cạnh trên bản đồ.",
      en: "Law 23/2012/QH13 is not in this dataset, so the replacement relation is not yet drawn as an edge on the map.",
    },
    sources: [
      "https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-quy-pham-phap-luat/luat-hop-tac-xa-so-172023qh15-hieu-luc-thi-hanh-tu-ngay-0172024-9691",
      "https://dangkykinhdoanh.gov.vn/vn/Pages/ChiTietVanBan.aspx?vID=27019",
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-155-2020",
    number: "155/2020/NĐ-CP",
    type: "nghi-dinh",
    domains: ["doanh-nghiep", "dau-tu"],
    issuedOn: "2020-12-31",
    effectiveOn: "2021-01-01",
    status: "active",
    verifiedOn: VERIFIED_2026_09_21,
    title: {
      vi: "Nghị định quy định chi tiết thi hành một số điều của Luật Chứng khoán",
      en: "Decree detailing a number of articles of the Law on Securities",
    },
    summary: {
      vi: "Quy định chi tiết chào bán và phát hành chứng khoán, công ty đại chúng, quản trị công ty áp dụng cho công ty đại chúng, niêm yết và đăng ký giao dịch, cùng tỷ lệ sở hữu của nhà đầu tư nước ngoài. Nghị định thay thế các Nghị định 58/2012/NĐ-CP, 60/2015/NĐ-CP, 86/2016/NĐ-CP và 71/2017/NĐ-CP. Đây là văn bản phải mở khi cấu trúc một thương vụ chào bán riêng lẻ hoặc một đợt phát hành ra công chúng.",
      en: "It details securities offerings and issuance, public companies, corporate governance for public companies, listing and registration for trading, and foreign ownership limits. It replaced Decrees 58/2012/NĐ-CP, 60/2015/NĐ-CP, 86/2016/NĐ-CP and 71/2017/NĐ-CP. It is the instrument to open when structuring a private placement or a public offering.",
    },
    guides: ["luat-chung-khoan-2019"],
    sources: [
      "https://english.luatvietnam.vn/decree-no-155-2020-nd-cp-dated-december-31-2020-of-the-government-on-detailing-and-guiding-the-implementation-of-a-number-of-articles-of-the-law-on-196539-doc1.html",
      "https://vcci.com.vn/legal-document/nghi-dinh-1552020nd-cp-huong-dan-luat-chung-khoan",
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-dau-tu-cong-2024",
    number: "58/2024/QH15",
    type: "luat",
    domains: ["dau-tu", "xay-dung"],
    issuedOn: "2024-11-29",
    effectiveOn: "2025-01-01",
    status: "active",
    verifiedOn: VERIFIED_2026_09_21,
    title: {
      vi: "Luật Đầu tư công",
      en: "Law on Public Investment",
    },
    summary: {
      vi: "Quy định quản lý nhà nước về đầu tư công, quản lý và sử dụng vốn đầu tư công, cùng quyền và trách nhiệm của các chủ thể liên quan; gồm bảy chương và một trăm lẻ ba điều. Luật cho phép tách công tác bồi thường, hỗ trợ, tái định cư và giải phóng mặt bằng thành dự án độc lập ở tất cả các nhóm dự án. Luật thay thế Luật Đầu tư công 2019.",
      en: "It governs state management of public investment, the management and use of public investment capital, and the rights and responsibilities of those involved, in seven chapters and one hundred and three articles. It allows compensation, support, resettlement and site clearance to be split into a standalone project across all project groups. It replaced the 2019 Law on Public Investment.",
    },
    replaces: ["luat-dau-tu-cong-2019"],
    sources: [
      "https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-quy-pham-phap-luat/luat-dau-tu-cong-so-582024qh15-hieu-luc-thi-hanh-tu-ngay-01012025-11190",
      "https://thuvienphapluat.vn/van-ban/Dau-tu/Luat-Dau-tu-cong-2024-so-58-2024-QH15-621645.aspx",
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-dau-tu-cong-2019",
    number: "39/2019/QH14",
    type: "luat",
    domains: ["dau-tu", "xay-dung"],
    issuedOn: "2019-06-13",
    effectiveOn: "2020-01-01",
    status: "expired",
    verifiedOn: VERIFIED_2026_09_21,
    title: {
      vi: "Luật Đầu tư công 2019",
      en: "Law on Public Investment 2019",
    },
    summary: {
      vi: "Khung pháp lý của đầu tư công trong giai đoạn 2020 tới hết năm 2024: quản lý nhà nước về đầu tư công, quản lý và sử dụng vốn đầu tư công, quyền và nghĩa vụ của các chủ thể liên quan. Luật hết hiệu lực khi Luật Đầu tư công 2024 có hiệu lực. Dự án phê duyệt chủ trương đầu tư trong giai đoạn này vẫn phải đọc theo luật cũ ở những nội dung đã hoàn tất.",
      en: "The public-investment framework from 2020 to the end of 2024: state management of public investment, the management and use of public investment capital, and the rights and duties of those involved. It ceased to have effect when the 2024 Law commenced. Projects whose investment policy was approved in that period are still read against it for steps already completed.",
    },
    sources: [
      "https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-quy-pham-phap-luat/luat-dau-tu-cong-so-392019qh14-ngay-1362019-hieu-luc-thi-hanh-tu-ngay-01012020-5582",
      "https://luatvietnam.vn/dau-tu/luat-dau-tu-cong-2019-175007-d1.html",
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-19-2025",
    number: "19/2025/NĐ-CP",
    type: "nghi-dinh",
    domains: ["dau-tu"],
    issuedOn: "2025-02-10",
    effectiveOn: "2025-02-10",
    status: "active",
    verifiedOn: VERIFIED_2026_09_21,
    title: {
      vi: "Nghị định quy định chi tiết Luật Đầu tư về thủ tục đầu tư đặc biệt",
      en: "Decree detailing the Law on Investment regarding the special investment procedure",
    },
    summary: {
      vi: "Quy định chi tiết thủ tục đầu tư đặc biệt tại Điều 36a Luật Đầu tư, điều được bổ sung bởi khoản 8 Điều 2 Luật số 57/2024/QH15. Thủ tục áp dụng cho dự án công nghiệp bán dẫn và công nghệ cao trong khu công nghiệp, khu chế xuất, khu công nghệ cao và khu kinh tế, chuyển từ tiền kiểm sang hậu kiểm. Nhà đầu tư được cấp Giấy chứng nhận đăng ký đầu tư trong mười lăm ngày và không phải thực hiện một số thủ tục cấp phép về xây dựng, phòng cháy chữa cháy và môi trường. Nghị định có hiệu lực từ ngày ký.",
      en: "It details the special investment procedure under Article 36a of the Law on Investment, inserted by clause 8 of Article 2 of Law 57/2024/QH15. The procedure covers semiconductor and high-technology projects in industrial parks, export processing zones, hi-tech parks and economic zones, moving from prior control to post control. The investor receives the investment registration certificate within fifteen days and is relieved of certain construction, fire-safety and environmental permits. The Decree took effect on the date of signature.",
    },
    guides: ["luat-dau-tu-2020", "luat-57-2024"],
    sources: [
      "https://vanban.chinhphu.vn/?pageid=27160&docid=212708",
      "https://tulieuvankien.dangcongsan.vn/he-thong-van-ban/van-ban-quy-pham-phap-luat/nghi-dinh-so-192025nd-cp-ngay-10022025-cua-chinh-phu-quy-dinh-chi-tiet-luat-dau-tu-ve-thu-tuc-dau-tu-dac-biet-11369",
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-182-2024",
    number: "182/2024/NĐ-CP",
    type: "nghi-dinh",
    domains: ["dau-tu", "thue"],
    issuedOn: "2024-12-31",
    effectiveOn: "",
    status: "active",
    verifiedOn: VERIFIED_2026_09_21,
    title: {
      vi: "Nghị định quy định về thành lập, quản lý và sử dụng Quỹ Hỗ trợ đầu tư",
      en: "Decree on the establishment, management and use of the Investment Support Fund",
    },
    summary: {
      vi: "Lập Quỹ Hỗ trợ đầu tư và quy định việc quản lý, sử dụng quỹ này. Doanh nghiệp công nghệ cao đáp ứng điều kiện được nhận hỗ trợ từ quỹ. Nghị định ra đời cùng thời điểm với cơ chế thuế tối thiểu toàn cầu, nên thường được đọc kèm phần ưu đãi đầu tư đã bị cơ chế ấy chạm tới.",
      en: "It establishes the Investment Support Fund and governs its management and use. High-technology enterprises meeting the stated conditions may receive support from it. It arrived alongside the global minimum tax mechanism and is usually read together with the investment incentives that mechanism reaches.",
    },
    note: {
      vi: "Nguồn tra được nói nghị định áp dụng từ năm tài chính 2024 nhưng không nêu một ngày có hiệu lực cụ thể, nên trường ngày hiệu lực để trống.",
      en: "The sources found state that the Decree applies from the 2024 financial year but give no specific commencement date, so the effective-date field is left blank.",
    },
    sources: [
      "https://vanban.chinhphu.vn/?classid=1&docid=212199&pageid=27160&typegroupid=4",
      "https://www.pwc.com/vn/vn/publications/news-brief/250117-decree-on-investment-support.html",
    ],
    confidence: "cross-check",
  },
  {
    id: "luat-69-2020",
    number: "69/2020/QH14",
    type: "luat",
    domains: ["lao-dong"],
    issuedOn: "2020-11-13",
    effectiveOn: "2022-01-01",
    status: "active",
    verifiedOn: VERIFIED_2026_09_21,
    title: {
      vi: "Luật Người lao động Việt Nam đi làm việc ở nước ngoài theo hợp đồng",
      en: "Law on Vietnamese Workers Working Abroad under Contract",
    },
    summary: {
      vi: "Quy định quyền, nghĩa vụ và trách nhiệm của người lao động Việt Nam đi làm việc ở nước ngoài theo hợp đồng và của doanh nghiệp, đơn vị sự nghiệp, tổ chức đưa người lao động đi. Người lao động được đơn phương chấm dứt hợp đồng khi bị ngược đãi, bị cưỡng bức lao động, bị quấy rối tình dục, hoặc khi có nguy cơ rõ ràng đe dọa trực tiếp tính mạng và sức khỏe. Luật cũng cho phép doanh nghiệp phối hợp với cơ sở giáo dục nghề nghiệp và trung tâm dịch vụ việc làm để chuẩn bị nguồn lao động.",
      en: "It sets the rights, duties and responsibilities of Vietnamese workers going abroad under contract and of the enterprises, public units and organisations that send them. A worker may unilaterally terminate the contract on ill-treatment, forced labour, sexual harassment, or a clear risk directly threatening life or health. Enterprises may also work with vocational institutions and employment service centres to prepare the labour supply.",
    },
    sources: [
      "https://vanban.chinhphu.vn/?pageid=27160&docid=202610",
      "https://english.luatvietnam.vn/law-no-69-2020-qh14-dated-november-13-2020-of-the-national-assembly-on-vietnamese-guest-workers-195185-doc1.html",
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-12-2022",
    number: "12/2022/NĐ-CP",
    type: "nghi-dinh",
    domains: ["lao-dong"],
    issuedOn: "2022-01-17",
    effectiveOn: "2022-01-17",
    status: "active",
    verifiedOn: VERIFIED_2026_09_21,
    title: {
      vi: "Nghị định quy định xử phạt vi phạm hành chính trong lĩnh vực lao động, bảo hiểm xã hội, người lao động Việt Nam đi làm việc ở nước ngoài theo hợp đồng",
      en: "Decree on administrative sanctions in labour, social insurance and Vietnamese workers working abroad under contract",
    },
    summary: {
      vi: "Bảng chế tài hành chính của ba nhóm quan hệ: lao động, bảo hiểm xã hội và đưa người lao động đi làm việc ở nước ngoài. Đây là nơi đọc ra mức phạt cho từng hành vi như chậm trả lương, ký sai loại hợp đồng hay không đóng bảo hiểm xã hội. Nghị định thay thế Nghị định 28/2020/NĐ-CP và có hiệu lực từ ngày ký.",
      en: "The administrative-sanction table for three groups of relations: labour, social insurance and sending workers abroad. It is where the fine for a given act is read, such as late payment of wages, the wrong contract type, or failure to pay social insurance. It replaced Decree 28/2020/NĐ-CP and took effect on the date of signature.",
    },
    sources: [
      "https://vanban.chinhphu.vn/?pageid=27160&docid=205182",
      "https://vcci.com.vn/legal-document/nghi-dinh-122022nd-cp-ve-xu-phat-vi-pham-hanh-chinh-trong-linh-vuc-lao-dong-bao-hiem-xa-hoi-nguoi-lao-dong-viet-nam-di-lam-viec-o-nuoc-ngoai-theo-hop-dong",
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-135-2020",
    number: "135/2020/NĐ-CP",
    type: "nghi-dinh",
    domains: ["lao-dong"],
    issuedOn: "2020-11-18",
    effectiveOn: "2021-01-01",
    status: "active",
    verifiedOn: VERIFIED_2026_09_21,
    title: {
      vi: "Nghị định quy định về tuổi nghỉ hưu",
      en: "Decree on the retirement age",
    },
    summary: {
      vi: "Quy định chi tiết Điều 169 Bộ luật Lao động 2019 về tuổi nghỉ hưu. Từ 01/01/2021, tuổi nghỉ hưu trong điều kiện lao động bình thường là 60 tuổi 03 tháng với lao động nam và 55 tuổi 04 tháng với lao động nữ, sau đó mỗi năm tăng thêm 03 tháng với nam cho tới 62 tuổi vào năm 2028 và 04 tháng với nữ cho tới 60 tuổi vào năm 2035. Nghị định cũng quy định riêng cho người làm nghề nặng nhọc, độc hại, nguy hiểm và người bị suy giảm khả năng lao động.",
      en: "It details Article 169 of the 2019 Labour Code on the retirement age. From 1 January 2021 the age under normal working conditions is 60 years and 3 months for men and 55 years and 4 months for women, rising each year by 3 months for men until 62 in 2028 and by 4 months for women until 60 in 2035. It also provides separately for arduous, hazardous or dangerous occupations and for reduced working capacity.",
    },
    guides: ["blld-2019"],
    sources: [
      "https://vanban.chinhphu.vn/?pageid=27160&docid=201650",
      "https://vbpl.vn/bolaodong/Pages/vbpq-van-ban-goc.aspx?ItemID=152734",
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-181-2025",
    number: "181/2025/NĐ-CP",
    type: "nghi-dinh",
    domains: ["thue"],
    issuedOn: "2025-07-01",
    effectiveOn: "2025-07-01",
    status: "active",
    verifiedOn: VERIFIED_2026_09_21,
    title: {
      vi: "Nghị định quy định chi tiết thi hành một số điều của Luật Thuế giá trị gia tăng",
      en: "Decree detailing a number of articles of the Law on Value Added Tax",
    },
    summary: {
      vi: "Quy định chi tiết người nộp thuế, đối tượng không chịu thuế, giá tính thuế, thời điểm xác định thuế, thuế suất, phương pháp khấu trừ, khấu trừ thuế đầu vào và hoàn thuế giá trị gia tăng; gồm bốn chương và bốn mươi điều. Nghị định đặt ngưỡng năm triệu đồng đã bao gồm thuế cho yêu cầu chứng từ thanh toán không dùng tiền mặt khi khấu trừ thuế đầu vào. Nghị định có hiệu lực cùng ngày Luật Thuế giá trị gia tăng 2024 bắt đầu áp dụng.",
      en: "It details taxpayers, non-taxable objects, the taxable price, the time of determination, rates, the credit method, input tax credit and VAT refunds, in four chapters and forty articles. It sets a threshold of five million dong including tax for the non-cash payment document required to claim an input credit. It commenced on the same day as the 2024 VAT Law.",
    },
    guides: ["luat-gtgt-2024"],
    sources: [
      "https://vanban.chinhphu.vn/?pageid=27160&docid=214336",
      "https://xaydungchinhsach.chinhphu.vn/nghi-dinh-181-2025-nd-cp-quy-dinh-chi-tiet-thi-hanh-mot-so-dieu-cua-luat-thue-gia-tri-gia-tang-119250707172930626.htm",
    ],
    confidence: "cross-check",
  },
  {
    id: "nd-236-2025",
    number: "236/2025/NĐ-CP",
    type: "nghi-dinh",
    domains: ["thue", "dau-tu"],
    issuedOn: "2025-08-29",
    effectiveOn: "2025-10-15",
    status: "active",
    verifiedOn: VERIFIED_2026_09_21,
    title: {
      vi: "Nghị định quy định chi tiết một số điều của Nghị quyết 107/2023/QH15 về thuế thu nhập doanh nghiệp bổ sung theo quy định chống xói mòn cơ sở thuế toàn cầu",
      en: "Decree detailing Resolution 107/2023/QH15 on top-up corporate income tax under the global anti-base-erosion rules",
    },
    summary: {
      vi: "Quy định chi tiết người nộp thuế, đối tượng chịu thuế, căn cứ tính thuế, thuế suất, thời điểm xác định thuế, khai thuế, nộp thuế và quyết toán thuế theo Nghị quyết 107/2023/QH15, bám theo bộ quy tắc thuế tối thiểu toàn cầu do OECD khuyến nghị. Đối tượng là đơn vị hợp thành của tập đoàn đa quốc gia có doanh thu từ 750 triệu euro trở lên. Nghị định có hiệu lực từ 15/10/2025 và áp dụng từ năm tài chính 2024, nên kỳ đầu tiên đã kết thúc trước khi nghị định ra đời.",
      en: "It details taxpayers, taxable objects, the tax base, rates, the time of determination, and the filing, payment and finalisation of tax under Resolution 107/2023/QH15, following the OECD's GloBE rules. It applies to constituent entities of multinational groups with revenue of at least EUR 750 million. It takes effect from 15 October 2025 and applies from the 2024 financial year, so the first period had closed before the Decree appeared.",
    },
    guides: ["nq-107-2023"],
    sources: [
      "https://vanban.chinhphu.vn/?docid=215112&pageid=27160",
      "https://xaydungchinhsach.chinhphu.vn/nghi-dinh-so-236-2025-nd-cp-quy-dinh-ve-thue-toi-thieu-toan-cau-119250903135325963.htm",
    ],
    confidence: "cross-check",
  },
  {
    id: "tt-80-2021-btc",
    number: "80/2021/TT-BTC",
    type: "thong-tu",
    domains: ["thue"],
    issuedOn: "2021-09-29",
    effectiveOn: "2022-01-01",
    status: "active",
    verifiedOn: VERIFIED_2026_09_21,
    title: {
      vi: "Thông tư hướng dẫn thi hành một số điều của Luật Quản lý thuế và Nghị định 126/2020/NĐ-CP",
      en: "Circular guiding the Law on Tax Administration and Decree 126/2020/NĐ-CP",
    },
    summary: {
      vi: "Hướng dẫn thủ tục của khâu quản lý thuế: hồ sơ khai thuế, phân bổ nghĩa vụ thuế giữa các địa phương, hoàn thuế, miễn giảm và xử lý tiền thuế nộp thừa. Đây là lớp biểu mẫu và trình tự của Luật Quản lý thuế, nên kế toán thuế mở thông tư này nhiều hơn mở luật. Thông tư bãi bỏ các Thông tư 156/2013/TT-BTC, 99/2016/TT-BTC, 31/2017/TT-BTC, 208/2015/TT-BTC và 71/2010/TT-BTC.",
      en: "It guides the procedural layer of tax administration: returns, the allocation of tax obligations across localities, refunds, exemptions and reductions, and the handling of overpaid tax. It carries the forms and sequences of the Law on Tax Administration, which is why tax accountants open it more often than the statute. It repealed Circulars 156/2013/TT-BTC, 99/2016/TT-BTC, 31/2017/TT-BTC, 208/2015/TT-BTC and 71/2010/TT-BTC.",
    },
    guides: ["luat-qlt-2019", "nd-126-2020"],
    sources: [
      "https://congbao.chinhphu.vn/van-ban/thong-tu-so-80-2021-tt-btc-34774.htm",
      "https://thuvienphapluat.vn/van-ban/Thue-Phi-Le-Phi/Thong-tu-80-2021-TT-BTC-huong-dan-Luat-Quan-ly-thue-Nghi-dinh-126-2020-ND-CP-466716.aspx",
    ],
    confidence: "cross-check",
  },
];

/*
  Cổng chặn của kho văn bản. Đặt ngay sau phần dữ liệu và trước mọi thứ suy ra
  từ nó: một bản ghi hỏng phải chặn bản dựng, không được đi tiếp để trở thành
  một trang trông bình thường. Xem `src/lib/integrity.ts` về từng ràng buộc.
*/
assertIntegrity(documents, domains);

/** Bảng tra nhanh theo id. */
export const documentsById = new Map(documents.map((d) => [d.id, d]));

/** Ngày tra cứu của một bản ghi; bản ghi không ghi thì thuộc đợt gốc. */
export function verifiedOnOf(doc: LegalDoc): string {
  return doc.verifiedOn ?? VERIFIED_ON;
}

/**
 * Ngày tra cứu gần nhất trong cả kho.
 *
 * Tính từ dữ liệu chứ không viết tay: thêm một đợt bổ sung là con số ở chân
 * trang tự đúng theo, không phải nhớ sửa ở một chỗ thứ hai.
 */
export const LATEST_VERIFIED_ON = documents.reduce(
  (latest, doc) => (verifiedOnOf(doc) > latest ? verifiedOnOf(doc) : latest),
  VERIFIED_ON,
);

/**
 * Suy ra danh sách cạnh từ các trường quan hệ của từng văn bản.
 *
 * Chỉ giữ cạnh mà cả hai đầu đều tồn tại trong tập dữ liệu, để bản đồ không bao
 * giờ vẽ một mũi tên trỏ vào hư không.
 */
export const relations: Relation[] = documents.flatMap((doc) => {
  const out: Relation[] = [];
  for (const to of doc.guides ?? []) {
    if (documentsById.has(to)) out.push({ from: doc.id, to, kind: "guides" });
  }
  for (const to of doc.amends ?? []) {
    if (documentsById.has(to)) out.push({ from: doc.id, to, kind: "amends" });
  }
  for (const to of doc.replaces ?? []) {
    if (documentsById.has(to)) out.push({ from: doc.id, to, kind: "replaces" });
  }
  return out;
});
