import type { Domain, LegalDoc, Relation } from "./types";

/**
 * Ngày tra cứu của toàn bộ tập dữ liệu này.
 *
 * Kết quả tra cứu văn bản pháp luật chỉ có giá trị tại thời điểm tra. Pháp luật
 * Việt Nam trong các lĩnh vực đầu tư, thuế và xây dựng thay đổi nhanh, nên mọi
 * bản ghi dưới đây cần được đối chiếu lại trước khi dùng vào hồ sơ chính thức.
 */
export const VERIFIED_ON = "2026-09-04";

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
    amends: ["bltds-2015"],
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
    amends: ["luat-dat-dai-2024", "luat-nha-o-2023"],
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
];

/** Bảng tra nhanh theo id. */
export const documentsById = new Map(documents.map((d) => [d.id, d]));

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
