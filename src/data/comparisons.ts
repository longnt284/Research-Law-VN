import { documentsById } from "./documents";
import type { ComparisonEntry } from "./types";
import { assertObjective } from "@/lib/objectivity";

/**
 * Phần nội dung của cơ chế đối chiếu.
 *
 * Cặp văn bản không khai báo ở đây. Cặp được suy ra từ quan hệ `replaces` và
 * `amends` đã có trong `documents.ts`, nên mọi văn bản thay thế hoặc sửa đổi một
 * văn bản khác đều có trang đối chiếu, kể cả khi chưa ai viết điểm đối chiếu nào
 * cho nó. File này chỉ bổ sung phần mà máy không tự đọc ra được từ dữ liệu.
 *
 * Ba ràng buộc khi viết một điểm đối chiếu:
 *
 * Một, mỗi vế phải đọc được từ bản ghi đã có nguồn trong tập dữ liệu, và bản ghi
 * đó phải được dẫn ở trường `basis`. Không viết ra một quy định chỉ vì nhớ là có.
 *
 * Hai, chỗ nào bản ghi không nói thì viết thẳng là bản ghi không nói, thay vì
 * suy ra từ sự im lặng. Một luật không nhắc tới thủ tục X trong phần tóm tắt
 * không có nghĩa là luật đó bỏ thủ tục X.
 *
 * Ba, trường `observation` chỉ mô tả chênh lệch đọc được giữa hai vế. Không dự
 * đoán hệ quả, không khuyến nghị, không xếp hạng hơn kém. Ràng buộc này được
 * kiểm tự động ở cuối file: dính một từ trong danh sách của
 * `src/lib/objectivity.ts` là quá trình dựng trang dừng lại.
 */
export const comparisons: ComparisonEntry[] = [
  {
    newId: "luat-xay-dung-2025",
    oldId: "luat-xay-dung-2014",
    scope: {
      vi: "Đối chiếu ở mức bản ghi: mốc hiệu lực, điều khoản chuyển tiếp và chuỗi văn bản thi hành. Chưa đối chiếu tới từng điều của hai luật.",
      en: "Compared at record level: dates of effect, transitional provisions and the chain of implementing instruments. The articles of the two Laws have not been compared one by one.",
    },
    points: [
      {
        id: "moc-hieu-luc",
        topic: { vi: "Mốc hiệu lực", en: "Dates of effect" },
        kind: "thay-thoi-han",
        before: {
          vi: "Có hiệu lực từ 01/01/2015 và hết hiệu lực từ 01/7/2026.",
          en: "In force from 1 January 2015 and ceasing to have effect on 1 July 2026.",
        },
        after: {
          vi: "Hiệu lực chung từ 01/7/2026.",
          en: "Generally in force from 1 July 2026.",
        },
        observation: {
          vi: "Ngày hết hiệu lực của luật trước trùng với ngày có hiệu lực chung của luật sau, nên giữa hai văn bản không có khoảng trống về thời gian.",
          en: "The date the earlier Law ceases to have effect coincides with the general commencement of the later one, so no gap in time separates the two instruments.",
        },
        basis: { before: ["luat-xay-dung-2014"], after: ["luat-xay-dung-2025"] },
        confidence: "verified",
      },
      {
        id: "mien-giay-phep",
        topic: {
          vi: "Nhóm quy định về miễn giấy phép xây dựng",
          en: "The permit-exemption provisions",
        },
        kind: "thay-thoi-han",
        before: {
          vi: "Chế độ giấy phép xây dựng của Luật Xây dựng 2014 áp dụng cho tới khi luật này hết hiệu lực.",
          en: "The permitting regime of the 2014 Law applied until that Law ceased to have effect.",
        },
        after: {
          vi: "Nhóm quy định về miễn giấy phép xây dựng của luật mới áp dụng từ 01/01/2026.",
          en: "The permit-exemption provisions of the new Law applied from 1 January 2026.",
        },
        observation: {
          vi: "Nhóm quy định này áp dụng sớm hơn mốc hiệu lực chung sáu tháng. Trong khoảng từ 01/01/2026 đến 01/7/2026, phần miễn giấy phép đọc theo luật 2025 còn phần còn lại đọc theo luật 2014.",
          en: "These provisions applied six months ahead of the general commencement. Between 1 January and 1 July 2026, the exemption rules are read from the 2025 Law while the remainder is read from the 2014 Law.",
        },
        basis: { before: ["luat-xay-dung-2014"], after: ["luat-xay-dung-2025"] },
        confidence: "verified",
      },
      {
        id: "hop-dong-da-ky",
        topic: { vi: "Hợp đồng ký trước mốc hiệu lực", en: "Contracts signed before commencement" },
        kind: "chuyen-tiep",
        before: {
          vi: "Hợp đồng xây dựng ký trước 01/7/2026 tiếp tục chịu sự điều chỉnh của Luật Xây dựng 2014.",
          en: "Construction contracts signed before 1 July 2026 remain governed by the 2014 Law.",
        },
        after: {
          vi: "Luật 2025 giữ các hợp đồng đã ký ở lại luật cũ, trừ khi phát sinh sự kiện bất khả kháng hoặc hoàn cảnh thay đổi cơ bản.",
          en: "The 2025 Law leaves contracts already signed with the earlier Law, save where force majeure or a fundamental change of circumstances arises.",
        },
        observation: {
          vi: "Ngày ký là mốc phân định luật áp dụng: hai hợp đồng cùng nội dung nhưng ký ở hai phía của ngày 01/7/2026 chịu hai luật khác nhau.",
          en: "The signing date determines the applicable law: two contracts with identical terms signed on either side of 1 July 2026 fall under different statutes.",
        },
        basis: { before: ["luat-xay-dung-2014"], after: ["luat-xay-dung-2025"] },
        confidence: "verified",
      },
      {
        id: "van-ban-thi-hanh",
        topic: { vi: "Văn bản thi hành", en: "Implementing instruments" },
        kind: "chuyen-tiep",
        before: {
          vi: "Nghị định 15/2021/NĐ-CP rồi Nghị định 175/2024/NĐ-CP quy định chi tiết Luật Xây dựng 2014.",
          en: "Decree 15/2021/NĐ-CP and then Decree 175/2024/NĐ-CP detailed the 2014 Law.",
        },
        after: {
          vi: "Luật Xây dựng 2025 là văn bản gốc của bộ nghị định xây dựng năm 2026.",
          en: "The 2025 Law is the parent instrument of the 2026 set of construction decrees.",
        },
        observation: {
          vi: "Chuỗi văn bản thi hành đổi theo luật gốc. Phạm vi còn áp dụng của Nghị định 175/2024/NĐ-CP sau ngày 01/7/2026 chưa đối chiếu được với nguồn chính thống trong phiên tra cứu.",
          en: "The chain of implementing instruments follows the parent statute. How far Decree 175/2024/NĐ-CP continues to apply after 1 July 2026 could not be confirmed against an official source in this search.",
        },
        basis: {
          before: ["luat-xay-dung-2014", "nd-15-2021", "nd-175-2024"],
          after: ["luat-xay-dung-2025", "nd-175-2024"],
        },
        confidence: "cross-check",
      },
    ],
  },
  {
    newId: "luat-dau-tu-2025",
    oldId: "luat-dau-tu-2020",
    scope: {
      vi: "Đối chiếu ở mức bản ghi: ba mốc hiệu lực của luật mới và phần luật cũ còn áp dụng sau khi bị thay thế.",
      en: "Compared at record level: the three commencement dates of the new Law and the part of the old Law that survives its replacement.",
    },
    points: [
      {
        id: "ba-moc",
        topic: { vi: "Cách chia hiệu lực", en: "How commencement is split" },
        kind: "thay-thoi-han",
        before: {
          vi: "Bản ghi ghi nhận một mốc hiệu lực duy nhất là 01/01/2021.",
          en: "The record shows a single commencement date, 1 January 2021.",
        },
        after: {
          vi: "Hiệu lực chung từ 01/3/2026; khoản 3 Điều 50 từ 01/01/2026; Điều 7 và Phụ lục IV từ 01/7/2026.",
          en: "Generally in force from 1 March 2026; Article 50(3) from 1 January 2026; Article 7 and Appendix IV from 1 July 2026.",
        },
        observation: {
          vi: "Luật sau có ba mốc hiệu lực trải trong bảy tháng, trong khi bản ghi của luật trước chỉ có một mốc. Xác định luật áp dụng cho một dự án vì vậy phụ thuộc cả vào ngày nộp hồ sơ lẫn thủ tục đang xét.",
          en: "The later Law has three commencement dates spread over seven months, where the record of the earlier one shows only a single date. Identifying the applicable law for a project therefore turns on both the filing date and the procedure at issue.",
        },
        basis: {
          before: ["luat-dau-tu-2020"],
          after: [
            "luat-dau-tu-2025",
            "luat-dau-tu-2025#dieu:50.khoan:3",
            "luat-dau-tu-2025#dieu:7",
            "luat-dau-tu-2025#phuluc:IV",
          ],
        },
        confidence: "verified",
      },
      {
        id: "nganh-nghe-co-dieu-kien",
        topic: {
          vi: "Danh mục ngành, nghề đầu tư kinh doanh có điều kiện",
          en: "List of conditional business lines",
        },
        kind: "chuyen-tiep",
        before: {
          vi: "Điều 7 và Phụ lục IV của Luật Đầu tư 2020 còn hiệu lực tới ngày 01/7/2026, sau khi phần còn lại của luật đã bị thay thế.",
          en: "Article 7 and Appendix IV of the 2020 Law remain in force until 1 July 2026, after the rest of the Law has been replaced.",
        },
        after: {
          vi: "Điều 7 và Danh mục tại Phụ lục IV của Luật Đầu tư 2025 có hiệu lực từ 01/7/2026.",
          en: "Article 7 and the Appendix IV list of the 2025 Law take effect on 1 July 2026.",
        },
        observation: {
          vi: "Từ 01/3/2026 đến 01/7/2026, thủ tục đầu tư đọc theo luật 2025 còn danh mục ngành, nghề có điều kiện vẫn đọc theo luật 2020. Hai luật cùng có hiệu lực trong bốn tháng này, mỗi luật ở một phạm vi.",
          en: "Between 1 March and 1 July 2026, investment procedure is read from the 2025 Law while the list of conditional business lines is still read from the 2020 Law. Both are in force during those four months, each over its own subject matter.",
        },
        basis: {
          before: ["luat-dau-tu-2020#dieu:7", "luat-dau-tu-2020#phuluc:IV"],
          after: ["luat-dau-tu-2025#dieu:7", "luat-dau-tu-2025#phuluc:IV"],
        },
        confidence: "verified",
      },
    ],
  },
  {
    newId: "luat-qlt-2025",
    oldId: "luat-qlt-2019",
    scope: {
      vi: "Đối chiếu ở mức bản ghi: mốc hiệu lực và phạm vi điều chỉnh được mô tả trong hai bản ghi.",
      en: "Compared at record level: commencement dates and the scope described in the two records.",
    },
    points: [
      {
        id: "moc-hieu-luc",
        topic: { vi: "Mốc hiệu lực", en: "Dates of effect" },
        kind: "thay-thoi-han",
        before: {
          vi: "Có hiệu lực từ 01/7/2020, hết hiệu lực từ 30/6/2026; riêng Điều 51 chấm dứt từ 31/12/2025.",
          en: "In force from 1 July 2020 and ceasing to have effect on 30 June 2026; Article 51 ended earlier, on 31 December 2025.",
        },
        after: {
          vi: "Có hiệu lực từ 01/7/2026.",
          en: "In force from 1 July 2026.",
        },
        observation: {
          vi: "Ngày hết hiệu lực của luật trước liền kề ngày có hiệu lực của luật sau. Điều 51 của luật trước chấm dứt sớm hơn phần còn lại sáu tháng.",
          en: "The earlier Law ends on the day before the later one begins. Article 51 of the earlier Law ended six months ahead of the rest of it.",
        },
        basis: {
          before: ["luat-qlt-2019", "luat-qlt-2019#dieu:51"],
          after: ["luat-qlt-2025"],
        },
        confidence: "cross-check",
      },
      {
        id: "pham-vi",
        topic: { vi: "Phạm vi điều chỉnh", en: "Scope" },
        kind: "giu-nguyen",
        before: {
          vi: "Khung quản lý thuế giai đoạn 2020 đến giữa năm 2026, đã được sửa đổi bởi Luật 56/2024/QH15.",
          en: "The tax administration framework from 2020 to mid-2026, amended by Law 56/2024/QH15.",
        },
        after: {
          vi: "Không đặt ra sắc thuế mới, tập trung vào khâu quản lý thuế.",
          en: "It creates no new tax and concentrates on tax administration.",
        },
        observation: {
          vi: "Hai bản ghi cùng mô tả phạm vi là quản lý thuế chứ không phải chính sách thuế; các sắc thuế vẫn nằm ở những luật thuế riêng.",
          en: "Both records describe the subject matter as tax administration rather than tax policy; the individual taxes remain in their own statutes.",
        },
        basis: { before: ["luat-qlt-2019"], after: ["luat-qlt-2025"] },
        confidence: "cross-check",
      },
      {
        id: "giao-dich-dien-tu",
        topic: { vi: "Lộ trình giao dịch điện tử", en: "Timetable for electronic transactions" },
        kind: "moi",
        before: {
          vi: "Bản ghi của luật 2019 không ghi nhận mốc hoàn tất giao dịch điện tử trong quản lý thuế.",
          en: "The record of the 2019 Law shows no completion date for electronic transactions in tax administration.",
        },
        after: {
          vi: "Đặt lộ trình hoàn tất giao dịch điện tử trong quản lý thuế trước ngày 01/01/2027.",
          en: "It sets a timetable for completing electronic transactions in tax administration before 1 January 2027.",
        },
        observation: {
          vi: "Mốc này nằm sau ngày luật có hiệu lực sáu tháng. Bản ghi của luật trước im lặng về mốc tương ứng, và sự im lặng đó chưa đủ để kết luận luật trước không có quy định nào cùng nội dung.",
          en: "The date falls six months after the Law commences. The earlier record is silent on any equivalent date, and that silence is not enough to conclude that the earlier Law contained no such provision.",
        },
        basis: { before: ["luat-qlt-2019"], after: ["luat-qlt-2025"] },
        confidence: "cross-check",
      },
    ],
  },
  {
    newId: "luat-phuc-hoi-pha-san-2025",
    oldId: "luat-pha-san-2014",
    scope: {
      vi: "Đối chiếu ở mức bản ghi: tên gọi, mốc hiệu lực và điều khoản chuyển tiếp cho vụ việc đang giải quyết.",
      en: "Compared at record level: the title, the commencement dates and the transitional treatment of pending cases.",
    },
    points: [
      {
        id: "ten-goi",
        topic: { vi: "Tên gọi và trọng tâm", en: "Title and emphasis" },
        kind: "mo-rong",
        before: {
          vi: "Luật Phá sản: điều kiện nộp đơn, thụ lý, hội nghị chủ nợ, phương án phục hồi hoạt động kinh doanh và thứ tự phân chia tài sản.",
          en: "Law on Bankruptcy: standing to file, admission of the petition, the creditors' meeting, the business recovery plan and the order of distribution.",
        },
        after: {
          vi: "Luật Phục hồi, phá sản: bản ghi mô tả trọng tâm chuyển từ thanh lý sang phục hồi.",
          en: "Law on Rehabilitation and Bankruptcy: the record describes the emphasis moving from liquidation towards rehabilitation.",
        },
        observation: {
          vi: "Tên gọi của luật sau đặt thủ tục phục hồi đứng trước thủ tục phá sản. Phương án phục hồi hoạt động kinh doanh đã có trong luật trước, nên chênh lệch nằm ở vị trí của thủ tục này trong bố cục chứ không phải ở việc nó có hay không.",
          en: "The later title places rehabilitation ahead of bankruptcy. A business recovery plan already existed under the earlier Law, so the difference lies in where that procedure sits in the structure rather than in whether it exists.",
        },
        basis: { before: ["luat-pha-san-2014"], after: ["luat-phuc-hoi-pha-san-2025"] },
        confidence: "cross-check",
      },
      {
        id: "moc-hieu-luc",
        topic: { vi: "Mốc hiệu lực", en: "Dates of effect" },
        kind: "thay-thoi-han",
        before: {
          vi: "Có hiệu lực từ 01/01/2015, hết hiệu lực khi luật sau có hiệu lực.",
          en: "In force from 1 January 2015 until the later Law took effect.",
        },
        after: {
          vi: "Có hiệu lực từ 01/3/2026; khoản 3 Điều 38 có hiệu lực từ 01/7/2026.",
          en: "In force from 1 March 2026; Article 38(3) takes effect on 1 July 2026.",
        },
        observation: {
          vi: "Hiệu lực chia hai mốc, cách nhau bốn tháng.",
          en: "Commencement is split across two dates four months apart.",
        },
        basis: {
          before: ["luat-pha-san-2014"],
          after: [
            "luat-phuc-hoi-pha-san-2025",
            "luat-phuc-hoi-pha-san-2025#dieu:38.khoan:3",
          ],
        },
        confidence: "cross-check",
      },
      {
        id: "vu-viec-dang-giai-quyet",
        topic: { vi: "Vụ việc thụ lý trước mốc hiệu lực", en: "Cases admitted before commencement" },
        kind: "chuyen-tiep",
        before: {
          vi: "Vụ việc phá sản thụ lý trước 01/3/2026 bắt đầu theo thủ tục của Luật Phá sản 2014.",
          en: "Bankruptcy cases admitted before 1 March 2026 began under the procedure of the 2014 Law.",
        },
        after: {
          vi: "Cách xử lý các vụ việc đó nằm ở điều khoản chuyển tiếp của Luật số 142/2025/QH15.",
          en: "Their treatment is set out in the transitional provisions of Law 142/2025/QH15.",
        },
        observation: {
          vi: "Ngày thụ lý là mốc phân định thủ tục áp dụng. Nội dung cụ thể của điều khoản chuyển tiếp chưa đối chiếu được với nguồn chính thống trong phiên tra cứu.",
          en: "The date of admission determines which procedure applies. The content of the transitional provisions could not be confirmed against an official source in this search.",
        },
        basis: { before: ["luat-pha-san-2014"], after: ["luat-phuc-hoi-pha-san-2025"] },
        confidence: "cross-check",
      },
    ],
  },
  {
    newId: "luat-viec-lam-2025",
    oldId: "luat-viec-lam-2013",
    scope: {
      vi: "Đối chiếu ở mức bản ghi: mốc hiệu lực, các nhóm nội dung được liệt kê và phần sửa đổi trước khi luật cũ bị thay thế.",
      en: "Compared at record level: commencement dates, the subject headings listed, and the amendment made before the old Law was replaced.",
    },
    points: [
      {
        id: "moc-hieu-luc",
        topic: { vi: "Mốc hiệu lực", en: "Dates of effect" },
        kind: "thay-thoi-han",
        before: {
          vi: "Có hiệu lực từ 01/01/2015, hết hiệu lực từ 01/01/2026.",
          en: "In force from 1 January 2015 and ceasing to have effect on 1 January 2026.",
        },
        after: { vi: "Có hiệu lực từ 01/01/2026.", en: "In force from 1 January 2026." },
        observation: {
          vi: "Hai mốc trùng nhau trong cùng một ngày, không có khoảng trống về thời gian.",
          en: "The two dates fall on the same day, leaving no gap in time.",
        },
        basis: { before: ["luat-viec-lam-2013"], after: ["luat-viec-lam-2025"] },
        confidence: "verified",
      },
      {
        id: "nhom-noi-dung",
        topic: { vi: "Các nhóm nội dung được liệt kê", en: "Subject headings listed" },
        kind: "moi",
        before: {
          vi: "Bản ghi mô tả phạm vi của luật 2013 gồm việc làm và bảo hiểm thất nghiệp. Số chương và số điều không có trong bản ghi.",
          en: "The record describes the 2013 Law as covering employment and unemployment insurance. Its chapter and article counts do not appear in the record.",
        },
        after: {
          vi: "Tám chương, năm mươi lăm điều, gồm chính sách hỗ trợ tạo việc làm, đăng ký lao động, hệ thống thông tin thị trường lao động, phát triển kỹ năng nghề, dịch vụ việc làm và bảo hiểm thất nghiệp.",
          en: "Eight chapters and fifty-five articles, covering job creation support, labour registration, the labour market information system, skills development, employment services and unemployment insurance.",
        },
        observation: {
          vi: "Bản ghi của luật sau liệt kê sáu nhóm nội dung, trong đó đăng ký lao động và hệ thống thông tin thị trường lao động không xuất hiện ở bản ghi của luật trước. Đây là chênh lệch giữa hai bản ghi, chưa phải kết luận rút ra từ việc đọc hai bản văn đầy đủ.",
          en: "The later record lists six subject headings, of which labour registration and the labour market information system do not appear in the earlier record. This is a difference between the two records, not a conclusion drawn from reading the two full texts.",
        },
        basis: { before: ["luat-viec-lam-2013"], after: ["luat-viec-lam-2025"] },
        confidence: "cross-check",
      },
      {
        id: "sua-doi-truoc-khi-thay-the",
        topic: { vi: "Quy định áp dụng cho giai đoạn trước", en: "The law applying to the earlier period" },
        kind: "chuyen-tiep",
        before: {
          vi: "Luật Việc làm 2013 đã được Luật Bảo hiểm xã hội số 41/2024/QH15 sửa đổi trước khi hết hiệu lực.",
          en: "The 2013 Employment Law was amended by Law 41/2024/QH15 on Social Insurance before it ceased to have effect.",
        },
        after: {
          vi: "Luật Việc làm 2025 thay thế toàn bộ Luật Việc làm 2013 từ 01/01/2026.",
          en: "The 2025 Employment Law replaced the 2013 Law in its entirety from 1 January 2026.",
        },
        observation: {
          vi: "Quy định áp dụng cho giai đoạn trước ngày 01/01/2026 gồm luật 2013 cùng phần đã được sửa đổi tại Luật số 41/2024/QH15, tức là hai văn bản chứ không phải một.",
          en: "The law applying before 1 January 2026 consists of the 2013 Law together with the amendments in Law 41/2024/QH15 — two instruments, not one.",
        },
        basis: { before: ["luat-viec-lam-2013", "luat-bhxh-2024"], after: ["luat-viec-lam-2025"] },
        confidence: "verified",
      },
    ],
  },
  {
    newId: "luat-bhxh-2024",
    oldId: "luat-bhxh-2014",
    scope: {
      vi: "Đối chiếu ở mức bản ghi: mốc hiệu lực và cách xử lý quyền lợi đã tích lũy.",
      en: "Compared at record level: commencement dates and the treatment of accrued entitlements.",
    },
    points: [
      {
        id: "moc-hieu-luc",
        topic: { vi: "Mốc hiệu lực", en: "Dates of effect" },
        kind: "thay-thoi-han",
        before: {
          vi: "Có hiệu lực từ 01/01/2016, hết hiệu lực từ 01/7/2025.",
          en: "In force from 1 January 2016 and ceasing to have effect on 1 July 2025.",
        },
        after: { vi: "Có hiệu lực từ 01/7/2025.", en: "In force from 1 July 2025." },
        observation: {
          vi: "Hai mốc trùng nhau trong cùng một ngày. Luật trước từng thay thế Luật số 71/2006/QH11, nên đây là lần thay thế toàn bộ thứ hai của khung bảo hiểm xã hội được ghi nhận trong tập dữ liệu.",
          en: "The two dates fall on the same day. The earlier Law had itself replaced Law 71/2006/QH11, making this the second wholesale replacement of the social insurance framework recorded in this dataset.",
        },
        basis: { before: ["luat-bhxh-2014"], after: ["luat-bhxh-2024"] },
        confidence: "verified",
      },
      {
        id: "quyen-loi-tich-luy",
        topic: { vi: "Quyền lợi đã tích lũy", en: "Accrued entitlements" },
        kind: "chuyen-tiep",
        before: {
          vi: "Thời gian đóng, chế độ hưu trí và trợ cấp một lần phát sinh trong thời kỳ luật 2014 còn hiệu lực.",
          en: "Contribution periods, pension regimes and lump-sum benefits accrued while the 2014 Law was in force.",
        },
        after: {
          vi: "Cách xử lý các quyền lợi đó nằm ở điều khoản chuyển tiếp của Luật số 41/2024/QH15.",
          en: "Their treatment is set out in the transitional provisions of Law 41/2024/QH15.",
        },
        observation: {
          vi: "Quan hệ bảo hiểm xã hội kéo dài qua mốc thay thế, nên một hồ sơ hưu trí có thể đồng thời chứa thời gian đóng thuộc hai luật khác nhau.",
          en: "A social insurance relationship runs across the changeover, so a single pension file may contain contribution periods falling under two different statutes.",
        },
        basis: { before: ["luat-bhxh-2014"], after: ["luat-bhxh-2024"] },
        confidence: "cross-check",
      },
    ],
  },
  {
    newId: "nd-175-2024",
    oldId: "nd-15-2021",
    scope: {
      vi: "Đối chiếu ở mức bản ghi: thời điểm có hiệu lực, các nhóm thủ tục được liệt kê và luật gốc của hai nghị định.",
      en: "Compared at record level: commencement, the procedural headings listed, and the parent statute of each decree.",
    },
    points: [
      {
        id: "hieu-luc-cung-ngay-ban-hanh",
        topic: { vi: "Thời điểm có hiệu lực", en: "Commencement" },
        kind: "giu-nguyen",
        before: {
          vi: "Ban hành ngày 03/3/2021 và có hiệu lực cùng ngày.",
          en: "Issued on 3 March 2021 and in force the same day.",
        },
        after: {
          vi: "Ban hành ngày 30/12/2024 và có hiệu lực cùng ngày.",
          en: "Issued on 30 December 2024 and in force the same day.",
        },
        observation: {
          vi: "Cả hai nghị định có hiệu lực ngay trong ngày ban hành, không có khoảng thời gian chờ giữa ngày ký và ngày áp dụng.",
          en: "Both decrees took effect on the day they were issued, with no interval between signature and application.",
        },
        basis: { before: ["nd-15-2021"], after: ["nd-175-2024"] },
        confidence: "verified",
      },
      {
        id: "nhom-thu-tuc",
        topic: { vi: "Các nhóm thủ tục được liệt kê", en: "Procedural headings listed" },
        kind: "giu-nguyen",
        before: {
          vi: "Bảy chương, 111 điều: lập, thẩm định, phê duyệt dự án và thiết kế, khảo sát xây dựng, cấp giấy phép và quản lý trật tự xây dựng, năng lực hoạt động xây dựng, hình thức quản lý dự án.",
          en: "Seven chapters and 111 articles: formulation, appraisal and approval of projects and designs, site investigation, permitting and construction order, capacity requirements, and project-management arrangements.",
        },
        after: {
          vi: "Chuỗi thủ tục từ lập, thẩm định, phê duyệt dự án và thiết kế cho tới khảo sát xây dựng và cấp giấy phép xây dựng.",
          en: "The procedural chain from formulation, appraisal and approval of projects and designs through site investigation and construction permitting.",
        },
        observation: {
          vi: "Các nhóm thủ tục nêu trong hai bản ghi trùng nhau ở phần lập, thẩm định, phê duyệt, khảo sát và cấp phép. Bản ghi của nghị định sau không nêu số chương và số điều nên hai bên chưa đối chiếu được về cấu trúc.",
          en: "The headings in the two records coincide on formulation, appraisal, approval, site investigation and permitting. The later record gives no chapter or article count, so the two cannot be compared on structure.",
        },
        basis: { before: ["nd-15-2021"], after: ["nd-175-2024"] },
        confidence: "cross-check",
      },
      {
        id: "luat-goc",
        topic: { vi: "Luật gốc", en: "Parent statute" },
        kind: "chuyen-tiep",
        before: {
          vi: "Quy định chi tiết Luật Xây dựng 2014 và Luật sửa đổi số 62/2020/QH14.",
          en: "It detailed the 2014 Construction Law and amending Law 62/2020/QH14.",
        },
        after: {
          vi: "Quy định chi tiết Luật Xây dựng 2014, là văn bản thi hành ở giai đoạn cuối trước khi Luật Xây dựng 2025 có hiệu lực.",
          en: "It details the 2014 Construction Law and served as the implementing instrument in the final period before the 2025 Law took effect.",
        },
        observation: {
          vi: "Hai nghị định cùng có luật gốc là Luật Xây dựng 2014, và luật gốc này hết hiệu lực từ 01/7/2026. Phạm vi còn áp dụng của nghị định sau sau mốc đó chưa đối chiếu được với nguồn chính thống.",
          en: "Both decrees share the 2014 Construction Law as their parent, and that statute ceased to have effect on 1 July 2026. How far the later decree continues to apply after that date could not be confirmed against an official source.",
        },
        basis: { before: ["nd-15-2021", "luat-xay-dung-2014"], after: ["nd-175-2024", "luat-xay-dung-2014"] },
        confidence: "cross-check",
      },
    ],
  },
  {
    newId: "nd-168-2025",
    oldId: "nd-01-2021",
    scope: {
      vi: "Đối chiếu ở mức bản ghi: mốc hiệu lực, phạm vi thay thế và các nhóm nội dung được liệt kê trong hai nghị định về đăng ký doanh nghiệp.",
      en: "Compared at record level: commencement, the scope of replacement, and the headings listed in the two decrees on enterprise registration.",
    },
    points: [
      {
        id: "moc-hieu-luc",
        topic: { vi: "Mốc hiệu lực", en: "Dates of effect" },
        kind: "thay-thoi-han",
        before: {
          vi: "Ban hành ngày 04/01/2021 và có hiệu lực cùng ngày.",
          en: "Issued on 4 January 2021 and in force the same day.",
        },
        after: {
          vi: "Ban hành ngày 30/6/2025, có hiệu lực từ 01/7/2025.",
          en: "Issued on 30 June 2025 and in force from 1 July 2025.",
        },
        observation: {
          vi: "Nghị định trước có hiệu lực ngay trong ngày ký, nghị định sau cách ngày ký một ngày. Hồ sơ nộp từ 01/7/2025 đi theo nghị định sau.",
          en: "The earlier decree took effect on the day of signature; the later one one day after. Filings made from 1 July 2025 follow the later decree.",
        },
        basis: { before: ["nd-01-2021"], after: ["nd-168-2025"] },
        confidence: "cross-check",
      },
      {
        id: "pham-vi-thay-the",
        topic: { vi: "Phạm vi thay thế", en: "Scope of replacement" },
        kind: "mo-rong",
        before: {
          vi: "Nghị định 01/2021/NĐ-CP thay thế Nghị định 78/2015/NĐ-CP và Nghị định 108/2018/NĐ-CP, cả hai đều về đăng ký doanh nghiệp.",
          en: "Decree 01/2021/NĐ-CP replaced Decrees 78/2015/NĐ-CP and 108/2018/NĐ-CP, both on enterprise registration.",
        },
        after: {
          vi: "Nghị định 168/2025/NĐ-CP thay thế Nghị định 01/2021/NĐ-CP và Nghị định 122/2020/NĐ-CP về phối hợp, liên thông thủ tục đăng ký thành lập doanh nghiệp.",
          en: "Decree 168/2025/NĐ-CP replaced Decree 01/2021/NĐ-CP and Decree 122/2020/NĐ-CP on the coordinated, single-window registration procedure.",
        },
        observation: {
          vi: "Nghị định sau gom hai nghị định trước vào một văn bản, trong đó có một nghị định về liên thông thủ tục không nằm trong phạm vi của nghị định trước.",
          en: "The later decree draws two earlier instruments into one, among them a decree on the single-window procedure that fell outside the scope of the earlier decree.",
        },
        basis: { before: ["nd-01-2021"], after: ["nd-168-2025"] },
        confidence: "cross-check",
      },
      {
        id: "nhom-noi-dung",
        topic: { vi: "Các nhóm nội dung được liệt kê", en: "Headings listed" },
        kind: "chi-tiet-hoa",
        before: {
          vi: "Hồ sơ, trình tự, thủ tục đăng ký doanh nghiệp và đăng ký hộ kinh doanh, cùng thẩm quyền của Cơ quan đăng ký kinh doanh.",
          en: "The dossier, sequence and procedure for enterprise and household-business registration, and the powers of the business registration authority.",
        },
        after: {
          vi: "Cùng các nhóm trên, kèm liên thông thủ tục đăng ký, đăng ký qua mạng thông tin điện tử, cung cấp và chia sẻ thông tin đăng ký, và quản lý nhà nước về đăng ký doanh nghiệp, đăng ký hộ kinh doanh.",
          en: "The same headings, together with the single-window procedure, online registration, the provision and sharing of registration information, and state management of enterprise and household-business registration.",
        },
        observation: {
          vi: "Bản ghi của nghị định sau liệt kê thêm bốn nhóm nội dung mà bản ghi của nghị định trước không nêu. Hai bản ghi dừng ở mức liệt kê nhóm nên chưa đối chiếu được tới từng điều.",
          en: "The later record lists four headings absent from the earlier one. Both records stop at the level of headings, so the two cannot yet be compared article by article.",
        },
        basis: { before: ["nd-01-2021"], after: ["nd-168-2025"] },
        confidence: "cross-check",
      },
    ],
  },
  {
    newId: "luat-tctand-2024",
    oldId: "luat-tctand-2014",
    scope: {
      vi: "Đối chiếu ở mức bản ghi: mốc hiệu lực và vị trí của hai luật trong chuỗi các đời Luật Tổ chức Tòa án nhân dân. Chưa đối chiếu tới từng điều.",
      en: "Compared at record level: commencement and the place of each Law in the succession of Laws on the Organisation of People's Courts. The articles have not been compared.",
    },
    points: [
      {
        id: "moc-hieu-luc",
        topic: { vi: "Mốc hiệu lực", en: "Dates of effect" },
        kind: "thay-thoi-han",
        before: {
          vi: "Thông qua ngày 24/11/2014, có hiệu lực từ 01/6/2015.",
          en: "Passed on 24 November 2014 and in force from 1 June 2015.",
        },
        after: {
          vi: "Thông qua ngày 24/6/2024, có hiệu lực từ 01/01/2025.",
          en: "Passed on 24 June 2024 and in force from 1 January 2025.",
        },
        observation: {
          vi: "Khoảng cách giữa ngày thông qua và ngày có hiệu lực là hơn sáu tháng ở luật trước và hơn sáu tháng ở luật sau.",
          en: "The interval between passage and commencement is a little over six months in each Law.",
        },
        basis: { before: ["luat-tctand-2014"], after: ["luat-tctand-2024"] },
        confidence: "cross-check",
      },
      {
        id: "chuoi-thay-the",
        topic: { vi: "Chuỗi thay thế", en: "The succession" },
        kind: "chuyen-tiep",
        before: {
          vi: "Luật Tổ chức Tòa án nhân dân 2014 thay thế Luật Tổ chức Tòa án nhân dân số 33/2002/QH10.",
          en: "The 2014 Law replaced Law 33/2002/QH10 on the Organisation of People's Courts.",
        },
        after: {
          vi: "Luật Tổ chức Tòa án nhân dân 2024 thay thế Luật Tổ chức Tòa án nhân dân số 62/2014/QH13.",
          en: "The 2024 Law replaced Law 62/2014/QH13 on the Organisation of People's Courts.",
        },
        observation: {
          vi: "Ba đời luật nối nhau trong hai mươi hai năm, mỗi lần là một lần thay toàn bộ văn bản chứ không phải sửa đổi từng điều.",
          en: "Three generations follow one another across twenty-two years, each a replacement of the whole instrument rather than an amendment of particular articles.",
        },
        basis: { before: ["luat-tctand-2014"], after: ["luat-tctand-2024"] },
        confidence: "cross-check",
      },
      {
        id: "pham-vi-dieu-chinh",
        topic: { vi: "Phạm vi điều chỉnh", en: "Scope" },
        kind: "giu-nguyen",
        before: {
          vi: "Quy định chức năng, nhiệm vụ, quyền hạn và tổ chức bộ máy của Tòa án nhân dân; về Thẩm phán, Hội thẩm và các chức danh khác; về bảo đảm hoạt động của Tòa án nhân dân.",
          en: "It set the functions, duties, powers and organisational structure of the People's Courts; Judges, Jurors and other positions; and the means of ensuring the Courts' operation.",
        },
        after: {
          vi: "Quy định vị trí, chức năng, nhiệm vụ, quyền hạn và tổ chức bộ máy của Tòa án nhân dân; về Thẩm phán, Hội thẩm và các chức danh khác; về bảo đảm hoạt động của Tòa án nhân dân.",
          en: "It sets the position, functions, duties, powers and organisational structure of the People's Courts; Judges, Jurors and other positions; and the means of ensuring the Courts' operation.",
        },
        observation: {
          vi: "Phạm vi điều chỉnh đọc từ hai bản ghi trùng nhau, khác ở chỗ bản ghi của luật sau có thêm chữ vị trí. Chênh lệch về nội dung từng điều chưa đối chiếu được từ hai bản ghi này.",
          en: "The scope read from the two records coincides, save that the later record adds the word position. Any difference in the content of particular articles cannot be established from these records.",
        },
        basis: { before: ["luat-tctand-2014"], after: ["luat-tctand-2024"] },
        confidence: "cross-check",
      },
    ],
  },
  {
    newId: "luat-dau-tu-cong-2024",
    oldId: "luat-dau-tu-cong-2019",
    scope: {
      vi: "Đối chiếu ở mức bản ghi: mốc hiệu lực, quy mô văn bản và ba nhóm thay đổi được nêu trong nguồn tra cứu. Chưa đối chiếu tới từng điều của hai luật.",
      en: "Compared at record level: commencement, the size of each instrument, and three groups of change named in the sources. The articles of the two Laws have not been compared.",
    },
    points: [
      {
        id: "moc-hieu-luc",
        topic: { vi: "Mốc hiệu lực", en: "Dates of effect" },
        kind: "thay-thoi-han",
        before: {
          vi: "Thông qua ngày 13/6/2019, có hiệu lực từ 01/01/2020.",
          en: "Passed on 13 June 2019 and in force from 1 January 2020.",
        },
        after: {
          vi: "Thông qua ngày 29/11/2024, có hiệu lực từ 01/01/2025.",
          en: "Passed on 29 November 2024 and in force from 1 January 2025.",
        },
        observation: {
          vi: "Hai luật cùng lấy mốc hiệu lực là ngày đầu năm, cách nhau đúng năm năm.",
          en: "Both Laws commence on the first day of a year, exactly five years apart.",
        },
        basis: { before: ["luat-dau-tu-cong-2019"], after: ["luat-dau-tu-cong-2024"] },
        confidence: "cross-check",
      },
      {
        id: "quy-mo",
        topic: { vi: "Quy mô văn bản", en: "Size of the instrument" },
        kind: "chi-tiet-hoa",
        before: {
          vi: "Bản ghi của luật trước không nêu số chương và số điều.",
          en: "The earlier record gives no chapter or article count.",
        },
        after: {
          vi: "Bảy chương, 103 điều; nguồn tra được nêu luật sau thêm một chương, thêm hai điều và sửa 65 điều so với luật trước.",
          en: "Seven chapters and 103 articles; the sources found state that the later Law adds one chapter and two articles and revises 65 articles of the earlier one.",
        },
        observation: {
          vi: "Con số 65 điều được sửa lấy từ nguồn tra cứu, không đếm lại được từ hai bản ghi trong tập dữ liệu này.",
          en: "The figure of 65 revised articles comes from the sources found and cannot be recounted from the two records in this dataset.",
        },
        basis: { before: ["luat-dau-tu-cong-2019"], after: ["luat-dau-tu-cong-2024"] },
        confidence: "cross-check",
      },
      {
        id: "tach-giai-phong-mat-bang",
        topic: {
          vi: "Bồi thường, hỗ trợ, tái định cư và giải phóng mặt bằng",
          en: "Compensation, support, resettlement and site clearance",
        },
        kind: "mo-rong",
        before: {
          vi: "Bản ghi của luật trước không nêu quy định tách công tác bồi thường, hỗ trợ, tái định cư và giải phóng mặt bằng thành dự án độc lập.",
          en: "The earlier record says nothing about splitting compensation, support, resettlement and site clearance into a standalone project.",
        },
        after: {
          vi: "Cho phép tách công tác bồi thường, hỗ trợ, tái định cư và giải phóng mặt bằng thành dự án độc lập đối với tất cả các nhóm dự án.",
          en: "It allows compensation, support, resettlement and site clearance to be split into a standalone project across all project groups.",
        },
        observation: {
          vi: "Bản ghi của luật sau nói phạm vi áp dụng là tất cả các nhóm dự án. Bản ghi của luật trước im lặng về điểm này, và sự im lặng đó không đọc được thành một quy định theo hướng nào.",
          en: "The later record states that the rule applies across all project groups. The earlier record is silent on the point, and that silence cannot be read as a rule either way.",
        },
        basis: { before: ["luat-dau-tu-cong-2019"], after: ["luat-dau-tu-cong-2024"] },
        confidence: "cross-check",
      },
    ],
  },
];

/**
 * Phép kiểm chạy ngay khi module được nạp, tức là trong lúc `next build` dựng
 * trang. Một câu bình luận lọt vào phần đối chiếu sẽ làm hỏng bản dựng thay vì
 * lặng lẽ lên trang.
 */
assertObjective(comparisons, new Set(documentsById.keys()));

/** Tra nhanh theo cặp, khóa là `${newId}--${oldId}`. */
export const comparisonsByPair = new Map(
  comparisons.map((c) => [`${c.newId}--${c.oldId}`, c]),
);
