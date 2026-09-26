import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Link from "next/link";

import { MethodArt } from "@/components/art/PageArt";
import { LuxBackdrop } from "@/components/LuxBackdrop";
import { Reveal } from "@/components/Reveal";
import { LATEST_VERIFIED_ON, documents, domains, verifiedOnOf } from "@/data/documents";
import type { Lang } from "@/data/types";
import { formatDate, getDict, isLang } from "@/i18n/dictionary";
import { tierOf } from "@/lib/corpus";
import { alternatesFor, shareMeta } from "@/lib/site";
import { describeSources, type SourceKind } from "@/lib/sources";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = getDict(lang);
  return {
    title: t.about.title,
    description: t.about.lede,
    alternates: alternatesFor(lang, "/phuong-phap"),
    ...shareMeta(lang, "/phuong-phap", t.about.title, t.about.lede),
  };
}

/**
 * Nội dung trang này viết trực tiếp bằng hai thứ tiếng thay vì đi qua từ điển
 * giao diện. Đây là văn xuôi dài, và câu chữ pháp lý dịch sát từng chuỗi thường
 * ra thứ tiếng Anh cứng đờ; viết riêng từng bản cho mỗi ngôn ngữ đọc tự nhiên hơn.
 */
const body: Record<Lang, { h: string; p: string[] }[]> = {
  vi: [
    {
      h: "Vì sao lại là một gia phả",
      p: [
        "Người mới đọc pháp luật Việt Nam thường vấp cùng một chỗ: tìm được đúng điều luật nhưng không biết điều đó còn hiệu lực hay không, và không biết có nghị định nào đã nói khác đi. Một luật đặt nguyên tắc, nghị định quy định chi tiết, thông tư hướng dẫn thi hành, rồi vài năm sau một luật sửa đổi đến và thay đổi cả ba tầng cùng lúc. Đọc từng văn bản riêng lẻ thì không thấy được chuyện đó.",
        "Trang này trình bày mỗi văn bản như một người trong cuốn gia phả thay vì như một dòng trong danh mục. Một văn bản có đời trước là văn bản nó thay thế, đời sau là văn bản thay thế nó, các nhánh hướng dẫn là nghị định, thông tư quy định chi tiết nó, và những lần được sửa đổi, bổ sung. Mỗi vai ứng đúng một quan hệ có thật trong bản ghi: quy định chi tiết, sửa đổi bổ sung, hoặc thay thế.",
        "Phép so sánh với gia phả chỉ là cách sắp xếp cho dễ nhớ, không thay cho tên gọi pháp lý. Nhãn pháp lý luôn đi kèm vai trong gia phả, và trang của mỗi văn bản vẽ gia phả của chính nó, kèm phả ký nói lại cùng nội dung bằng chữ.",
      ],
    },
    {
      h: "Dữ liệu được kiểm chứng thế nào",
      p: [
        "Tập dữ liệu dựng theo một nguyên tắc: không ghi vào số hiệu nào chưa được tra cứu. Trí nhớ về số hiệu văn bản không đáng tin, vì các số rất giống nhau và một văn bản từng đúng vẫn có thể đã bị thay thế mà không ai để ý.",
        "Xác minh một văn bản là trả lời hai câu hỏi khác nhau, và mỗi câu có nguồn riêng. Câu thứ nhất là văn bản có tồn tại không, đúng số hiệu, ngày ban hành và ngày có hiệu lực; nguồn chính là Công báo và Cổng Thông tin điện tử Chính phủ. Câu thứ hai là hôm nay văn bản còn hiệu lực không; nguồn chính là Cơ sở dữ liệu quốc gia về pháp luật của Bộ Tư pháp tại vbpl.vn, nơi ghi tình trạng hiệu lực bằng chữ kèm ngày cập nhật.",
        "Ngày 24 tháng 9 năm 2026, toàn bộ văn bản Việt Nam trong kho được rà lại trên vbpl.vn. Bản ghi nào đọc được trang của chính văn bản trên đó thì được nâng lên mức đã đối chiếu, kèm đường dẫn tới trang ấy và ngày rà soát. Nhãn hết hiệu lực một phần của vbpl.vn thường chỉ có nghĩa là một số điều đã bị văn bản sau sửa hoặc bãi bỏ, nên trên trang này nó ứng với tình trạng còn hiệu lực, đã sửa đổi hoặc hết hiệu lực một phần. Đợt rà soát đổi tình trạng của nhiều bản ghi, điền các ngày còn trống, và bổ sung các nghị định thi hành Luật Xây dựng 2025 có hiệu lực từ ngày 01 tháng 7 năm 2026.",
        "Khi hai nguồn nhà nước nói khác nhau, bản ghi không lặng lẽ chọn một bên mà nêu mâu thuẫn trong phần lưu ý. Luật Bảo hiểm xã hội số 41/2024/QH15 được vbpl.vn ghi hết hiệu lực toàn bộ, nhưng không tìm thấy văn bản nào thay thế hay tuyên bố chấm dứt hiệu lực của nó, nên bản ghi giữ tình trạng còn hiệu lực và hạ mức xác minh. Luật Tổ chức Tòa án nhân dân số 62/2014/QH13 vẫn được vbpl.vn ghi còn hiệu lực, trong khi điều khoản thi hành của Luật số 34/2024/QH15 đã chấm dứt hiệu lực của nó, nên bản ghi theo văn bản luật. Luật Quản lý thuế số 38/2019/QH14 có ngày hiệu lực trên vbpl.vn khác với Công báo, nên bản ghi theo Công báo.",
        "Hai đợt bổ sung trước đó, ngày 04 và ngày 21 tháng 9 năm 2026, được tra khi các trang nguồn nhà nước bị chặn và chỉ đối chiếu được qua kết quả tìm kiếm. Phần lớn bản ghi của hai đợt đó đã được đọc lại trên vbpl.vn trong đợt rà soát này. Nhóm còn mang cảnh báo cần kiểm thêm gồm các nghị định mới chưa có trang trên vbpl.vn, những văn bản không tìm được trang ở đó, và các điều ước, quy tắc trọng tài quốc tế vốn không thuộc cơ sở dữ liệu này. Với các nghị định mới, ngày ban hành và ngày hiệu lực đã đối chiếu trên Công báo, điều khoản hiệu lực và chuyển tiếp đọc trên toàn văn, chỉ tình trạng hiệu lực là chưa đọc được từ nguồn nhà nước. Cảnh báo hiển thị công khai trên trang chi tiết của từng bản ghi.",
      ],
    },
    {
      h: "Hiệu lực tại một ngày",
      p: [
        "Tình trạng ghi trên mỗi bản ghi chỉ trả lời câu hỏi hôm nay. Câu hỏi người làm hồ sơ hay gặp lại khác: tại ngày ký hợp đồng, ngày xảy ra vi phạm hay ngày nộp hồ sơ, văn bản nào đang có hiệu lực. Trang chi tiết của mỗi văn bản và danh mục văn bản vì vậy có ô chọn ngày.",
        "Câu trả lời suy ra từ chính quan hệ trong tập dữ liệu. Trước ngày có hiệu lực, văn bản chưa có hiệu lực. Từ ngày văn bản thay thế có hiệu lực, văn bản bị thay hết hiệu lực. Từ ngày văn bản sửa đổi có hiệu lực, văn bản bị sửa vẫn còn hiệu lực nhưng phải đọc cùng văn bản sửa đổi. Một luật sửa đổi được ghi hết hiệu lực mà không có văn bản nào thay trực tiếp thì hết hiệu lực khi luật mà nó sửa bị thay thế.",
        "Chỗ dữ liệu không đủ thì câu trả lời là không xác định được. Trường hợp hay gặp nhất là văn bản được ghi hết hiệu lực nhưng tập dữ liệu không có văn bản thay thế: biết chắc văn bản đã hết hiệu lực ở ngày rà soát, nhưng không biết từ ngày nào, nên trang không kết luận cho những ngày trước đó. Công cụ cũng chỉ biết những văn bản sửa đổi có mặt trong tập dữ liệu. Nó cho biết phần tối thiểu đã ghi nhận, không thay cho việc tra lịch sử đầy đủ của một văn bản.",
      ],
    },
    {
      h: "Đối chiếu điểm cũ và điểm mới",
      p: [
        "Phần lớn câu hỏi thực tế không dừng ở chỗ một văn bản quy định gì, mà ở chỗ nó đã đổi những gì so với văn bản trước. Trang đối chiếu dựng đúng cho việc đó, theo năm lớp tách bạch để người đọc biết mỗi dòng chữ mình đang đọc đến từ đâu.",
        "Lớp thứ nhất là cặp văn bản, lấy thẳng từ quan hệ thay thế và sửa đổi đã có trong tập dữ liệu. Không cặp nào được thêm vào bằng tay, nên danh sách cặp luôn khớp với gia phả văn bản và không có chỗ cho một cặp được chọn vì nó minh họa đẹp cho một luận điểm. Lớp thứ hai là bảng dữ kiện và mấy câu suy ra từ hai bản ghi: loại văn bản, tình trạng hiệu lực, ngày ban hành, ngày có hiệu lực, khoảng cách giữa hai mốc. Toàn bộ lớp này là phép so sánh và phép trừ ngày, cùng dữ liệu thì ai chạy cũng ra đúng như vậy.",
        "Lớp thứ ba là điểm đối chiếu nội dung do người biên soạn viết, và đây là lớp duy nhất có bàn tay con người. Mỗi điểm gồm nội dung đọc được ở văn bản cũ, nội dung đọc được ở văn bản mới, một nhãn phân loại thay đổi lấy từ danh sách đóng chín loại, và một câu nhận định. Mỗi vế phải dẫn được bản ghi hoặc điều khoản mà nó đọc ra; chỗ nào bản ghi không nói thì viết thẳng là bản ghi không nói, thay vì suy ra từ sự im lặng.",
        "Lớp thứ tư là phép kiểm. Toàn bộ chữ trong phần đối chiếu được soi qua một danh sách từ ngữ mang nghĩa khuyên nhủ, xếp hạng hơn kém hoặc suy đoán hệ quả, cùng với yêu cầu mỗi điểm phải dẫn đủ căn cứ ở cả hai vế. Dính một lỗi là quá trình dựng trang dừng lại. Tính khách quan của phần này vì vậy không dựa vào lời hứa sẽ viết cẩn thận, mà dựa vào một điều kiện phải thỏa mãn thì trang mới lên được.",
        "Lớp thứ năm là chuỗi văn bản. Một cặp chỉ thấy hai mắt xích, trong khi một hợp đồng thường sống qua cả đời văn bản: luật gốc, vài lần sửa đổi, rồi một luật thay thế. Chuỗi dựng từ cùng dữ liệu quan hệ ấy, với các lần thay thế nối nhau thành trục và các lần sửa đổi treo vào đúng mắt xích mà chúng chạm tới, rồi đặt tất cả lên một dòng thời gian và một bảng dữ kiện nhiều cột, mỗi cột một đời văn bản.",
        "Nhận định ở đây chỉ có một nghĩa: mô tả chênh lệch đọc được giữa hai bản văn. Nó không nói quy định nào hợp lý hơn, không đoán trước hệ quả, không thay thế ý kiến pháp lý cho một vụ việc. Cuối mỗi trang đối chiếu có một ô để người đọc tự dán hai đoạn văn bản và xem câu chữ khác nhau ở đâu; phép so sánh đó chạy trong trình duyệt, thuần cơ học, chỉ ra chữ nào thêm chữ nào bớt chứ không kết luận nghĩa đã đổi hay chưa.",
      ],
    },
    {
      h: "Dẫn trích tới đúng chỗ",
      p: [
        "Một căn cứ trỏ tới cả một văn bản thì chỉ nói được nên mở quyển nào. Luật Xây dựng có hàng trăm điều, nên bảo người đọc rằng nhận định này đọc từ Luật Xây dựng 2025 cũng gần như không chỉ chỗ nào cả. Căn cứ ở đây vì vậy là một trích dẫn có cấu trúc: mã văn bản, kèm phần chỉ chỗ tới phụ lục, chương, mục, điều, khoản và điểm khi biết được.",
        "Trích dẫn hiển thị theo quy ước của từng thứ tiếng. Bản tiếng Việt đi từ hẹp ra rộng, điểm a khoản 3 Điều 38, vì đó là cách người làm nghề đọc và viết. Bản tiếng Anh gộp số vào sau tên điều, Article 38(3)(a). Cả hai luôn kèm số hiệu, bởi tên văn bản lặp lại qua các đời luật còn số hiệu thì không. Phần chỉ chỗ chỉ được ghi ở những chỗ đã đọc tới; chỗ nào dừng ở cấp văn bản thì trích dẫn cũng dừng ở đó, thay vì đoán lấy một số điều cho đủ chi tiết.",
        "Ô tìm kiếm của danh mục nhận cả số điều. Gõ Điều 76, có hoặc không kèm số hiệu văn bản, trang liệt kê mọi điểm đối chiếu đã dẫn tới điều đó và dẫn thẳng tới điểm ấy. Chỉ mục chỉ gồm những điều khoản người biên soạn đã đọc và dẫn, nên kết quả rỗng nghĩa là trang này chưa đọc tới điều đó, không có nghĩa là điều đó không tồn tại.",
        "Trang chi tiết mỗi văn bản có sẵn một khối trích dẫn và một nút sao chép. Việc kế tiếp sau khi tìm đúng văn bản thường là chép nó sang một bản ghi nhớ hay một bản luận cứ, và chép tay thì hay rụng mất số khóa hoặc sai một chữ trong tên.",
      ],
    },
    {
      h: "Cổng chặn của kho văn bản",
      p: [
        "Một bản ghi sai định dạng ngày, thiếu nguồn, hay trỏ quan hệ tới một mã không tồn tại sẽ chỉ lộ ra khi có người tình cờ mở đúng trang đó. Với một trang tra cứu pháp luật thì đó là lỗi đắt, vì người đọc tin vào bản ghi bởi nó trông chỉn chu chứ không bởi nó đã được kiểm.",
        "Kho văn bản vì vậy đi qua bảy ràng buộc trước khi trang được dựng. Mã và số hiệu không trùng nhau giữa hai bản ghi. Số hiệu phải khớp quy ước đánh số của loại văn bản, nên một nghị định gán nhầm thành quyết định tự lộ ra ở phần đuôi NĐ-CP. Ngày ghi theo ISO, và ngày hiệu lực không sớm hơn ngày ban hành. Mỗi bản ghi thuộc ít nhất một lĩnh vực có thật và dẫn ít nhất một nguồn https. Quan hệ chỉ trỏ tới bản ghi có thật, không trỏ về chính nó, không lặp. Và văn bản đã bị một văn bản đang có hiệu lực thay thế thì không còn được ghi là còn hiệu lực.",
        "Bảy ràng buộc này đều khẳng định được từ chính tập dữ liệu, không cần tra cứu bên ngoài. Đó là điều kiện để chúng còn chạy được lâu dài: một phép kiểm phải mở trình duyệt mới chạy xong thì sớm muộn cũng bị tắt đi cho nhanh việc.",
      ],
    },
    {
      h: "Giới hạn phải nói rõ",
      p: [
        "Kết quả tra cứu văn bản pháp luật chỉ có giá trị tại thời điểm tra. Pháp luật Việt Nam trong các lĩnh vực đầu tư, thuế, đất đai và xây dựng thay đổi nhanh; một văn bản đúng hôm nay có thể đã bị sửa sau vài tháng. Trước khi dùng bất kỳ nội dung nào ở đây vào hồ sơ chính thức, cần đối chiếu lại với Công báo, Cơ sở dữ liệu quốc gia về pháp luật hoặc cơ quan ban hành.",
        "Tập dữ liệu này không đầy đủ và không cố tỏ ra đầy đủ. Nó tập trung vào mười lĩnh vực và chỉ chọn những văn bản trụ cột cùng quan hệ giữa chúng. Rất nhiều thông tư chuyên ngành, quyết định của Thủ tướng và văn bản địa phương không có mặt ở đây. Gia phả giúp định vị, không thay thế việc tra cứu đầy đủ.",
        "Cuối cùng, trang này là công cụ tra cứu, không phải ý kiến pháp lý. Một điều luật đọc đúng vẫn có thể áp dụng sai nếu tách khỏi tình tiết cụ thể của vụ việc. Với vấn đề có rủi ro thật, cần làm việc với luật sư.",
      ],
    },
    {
      h: "Ghi chú kỹ thuật",
      p: [
        "Hình gia phả của mỗi văn bản là SVG dựng ở máy chủ từ một bố cục tính sẵn và tất định: cùng dữ liệu thì luôn cho cùng hình. Đời trước nằm bên trái, đời sau bên phải, văn bản cấp trên và văn bản sửa đổi ở trên, nhánh hướng dẫn ở dưới. Mỗi văn bản trên hình là một liên kết thật, dùng được bằng bàn phím. Trên màn hình hẹp, hình được thay bằng phả ký, vì hình rộng hơn màn hình điện thoại.",
        "Gia phả tiêu biểu ở trang chủ không chọn tay: đó là gia phả lớn nhất trong tập dữ liệu mà văn bản đứng giữa còn hiệu lực. Huy hiệu và các hình minh họa đều là SVG, không dùng mô hình ba chiều hay ảnh tải về. Nét huy hiệu được vẽ dần một lần khi trang mở; vệt sáng trên mặt dấu và lớp nền có nút tạm dừng, và tự dừng khi thiết bị của người đọc đã đặt chế độ giảm chuyển động.",
      ],
    },
  ],
  en: [
    {
      h: "Why a lineage",
      p: [
        "Newcomers to Vietnamese law tend to stumble at the same point: they find the right article but cannot tell whether it is still in force, or whether some decree has since said otherwise. A law states the principle, a decree fills in the detail, a circular explains the practice, and a few years later an amending law arrives and changes all three tiers at once. Reading each instrument in isolation hides that entirely.",
        "This site presents each instrument the way a family register presents a person, rather than as a line in a list. An instrument has predecessors, the instruments it replaced; successors, the instruments that replaced it; implementing branches, the decrees and circulars that detail it; and the amendments written into it. Each role corresponds to exactly one relation recorded in the entry: detailing, amending or replacing.",
        "The genealogy is an arrangement that is easier to remember, not a substitute for the legal terms. The legal label always travels with the role, and every instrument's page draws its own lineage, together with a written register that says the same thing in words.",
      ],
    },
    {
      h: "How the data was checked",
      p: [
        "One rule governs the dataset: no document number is recorded unless it was actually looked up. Memory for document numbers cannot be trusted, because the numbers resemble one another closely and an instrument that was once correct may have been replaced without anyone noticing.",
        "Verifying an instrument means answering two different questions, each with its own source. The first is whether the instrument exists, with the right number, date of issue and date of commencement; the primary sources are the Official Gazette and the Government portal. The second is whether it is in force today; the primary source is the Ministry of Justice's National Legal Database at vbpl.vn, which states the status in words together with the date it was last updated.",
        "On 24 September 2026 every Vietnamese instrument in the store was checked again on vbpl.vn. A record whose own page could be read there was raised to confirmed, with a link to that page and the review date. The database's partly expired label usually means only that some articles have been amended or repealed by a later instrument, so here it maps to in force, amended or partly lapsed. The review changed the status of many records, filled in missing dates, and added the decrees implementing the 2025 Construction Law that took effect on 1 July 2026.",
        "Where two official sources disagree, the record does not quietly pick one; the conflict is stated in its note. Social Insurance Law No. 41/2024/QH15 is labelled wholly expired on vbpl.vn, yet no instrument replacing it or declaring it lapsed was found, so the record keeps it in force at a lower verification level. Law No. 62/2014/QH13 on the Organisation of People's Courts is still labelled in force on vbpl.vn, although the final provisions of Law No. 34/2024/QH15 ended it, so the record follows the statute. Tax Administration Law No. 38/2019/QH14 carries a commencement date on vbpl.vn that differs from the Official Gazette, and the record follows the Gazette.",
        "Two earlier batches, on 4 and 21 September 2026, were compiled while the official sources were blocked and could only be corroborated through search results. Most of their records were read again on vbpl.vn in this review. The records still flagged as needing checks are new decrees not yet on vbpl.vn, instruments whose page could not be found there, and international treaties and arbitration rules that sit outside that database. For the new decrees, the dates of issue and commencement were checked against the Official Gazette and the commencement and transitional articles were read in the full text; only their status has not yet been read from an official source. The flag is shown openly on each record.",
      ],
    },
    {
      h: "Validity on a given date",
      p: [
        "The status on each record answers only for today. The question a practitioner meets more often is different: on the day a contract was signed, a breach occurred or a filing was made, which instruments were in force? Each document page and the document index therefore take a date.",
        "The answer is derived from the relations in the dataset. Before its commencement an instrument is not yet in force. From the commencement of a replacing instrument it has lapsed. From the commencement of an amending instrument it remains in force but must be read with the amendment. An amending law recorded as expired, with nothing replacing it directly, lapses when the law it amended is replaced.",
        "Where the data is not enough, the answer is that it cannot be determined. The usual case is an instrument recorded as expired with no replacement in the dataset: it had certainly lapsed by the review date, but not from when, so no conclusion is drawn for earlier dates. The tool also knows only the amending instruments that are in the dataset. It gives the known minimum and does not replace a full history of an instrument.",
      ],
    },
    {
      h: "Comparing the old position with the new",
      p: [
        "Most practical questions do not stop at what an instrument says; they turn on what it changed relative to the instrument before it. The comparison pages are built for that, in five separate layers, so that a reader can tell where each line on the page came from.",
        "The first layer is the pair itself, taken directly from the replacement and amendment relations already in the dataset. No pair is added by hand, so the list of pairs always matches the lineages and there is no room for a pair chosen because it illustrates a point nicely. The second layer is the table of facts and the notes computed from the two records: instrument type, status, date of issue, date of effect, and the interval between them. That whole layer is comparison and date arithmetic, so on the same data anyone gets the same output.",
        "The third layer is the content comparison written by an editor, and it is the only layer touched by a human hand. Each point sets out what the earlier instrument records, what the later one records, a label drawn from a closed list of nine kinds of change, and one sentence of observation. Each side must cite the record or provision it was read from, and where a record is silent the page says so rather than inferring anything from that silence.",
        "The fourth layer is the check. Every string in the comparison layer is scanned against a list of advisory, evaluative and speculative terms, and each point must cite a basis on both sides. A single failure stops the build. The objectivity of this material therefore rests not on a promise to write carefully but on a condition that must be met before the page can exist at all.",
        "The fifth layer is the lineage. A pair shows two links of the chain, while a contract commonly lives through a whole line of instruments: a parent statute, a few amendments, then a replacement. The lineage is built from the same relations, with replacements strung into a spine and amendments hanging from the link they touch, and set out on one timeline and one many-column table of facts, a column to each generation.",
        "An observation here means one thing only: a description of the difference that can be read off the two texts. It does not rank one provision above another, does not predict consequences, and does not stand in for legal advice on a matter. Each comparison page ends with a box where a reader can paste two passages and see where the wording differs; that comparison runs in the browser and is purely mechanical, showing which words were added and which removed without saying whether the meaning has changed.",
      ],
    },
    {
      h: "Citing the actual place",
      p: [
        "A basis that points at a whole instrument tells the reader only which volume to open. The Construction Law runs to hundreds of articles, so saying that an observation was read from the 2025 Construction Law points almost nowhere. A basis here is therefore a structured citation: the instrument, together with a pinpoint down to appendix, chapter, section, article, clause and point wherever that is known.",
        "Citations follow the convention of each language. The Vietnamese runs from narrow to broad, điểm a khoản 3 Điều 38, because that is how the profession reads and writes. The English folds the numbers in after the article: Article 38(3)(a). Both carry the document number, because titles repeat across generations of a law and numbers do not. A pinpoint is recorded only where the provision was actually read; where reading stopped at the level of the instrument, so does the citation.",
        "The index search box also takes article numbers. Typing Article 76, with or without a document number, lists every comparison point that cites that article and links straight to it. The index contains only provisions an editor has read and cited, so an empty result means the site has not read that article yet, not that the article does not exist.",
        "Each record page carries a ready citation and a button to copy it. What a reader usually does on finding the right instrument is copy it into a note or a written submission, and copying by hand tends to drop the legislature number or misspell a word of the title.",
      ],
    },
    {
      h: "A gate on the document store",
      p: [
        "A record with a malformed date, no source, or a relation pointing at an identifier that does not exist would otherwise surface only when somebody happened to open that page. For a legal reference site that is an expensive failure, because a reader trusts a record for looking careful rather than for having been checked.",
        "The store therefore passes seven constraints before the site can be built. No two records share an identifier or a document number. A number must match the numbering convention of its type, so a decree mislabelled as a decision gives itself away at the NĐ-CP suffix. Dates are ISO-formatted, and commencement is never earlier than issue. Every record belongs to at least one real domain and cites at least one https source. Relations point only to records that exist, never to themselves, and never repeat. And a record replaced by an instrument already in force is no longer marked as still in force.",
        "Every one of the seven can be settled from the dataset alone, with no external lookup. That is what makes them durable: a check that needs a browser open to finish will eventually be switched off to save time.",
      ],
    },
    {
      h: "Limits worth stating plainly",
      p: [
        "A search of legislation is only good as at the date it was run. Vietnamese law on investment, tax, land and construction moves quickly; an instrument that is current today may be amended within months. Before relying on anything here in a formal filing, check it against the Official Gazette, the National Legal Database or the issuing authority.",
        "This dataset is not comprehensive and does not pretend to be. It covers ten domains and selects the load-bearing instruments together with the relations between them. A great many sector circulars, Prime Ministerial decisions and provincial instruments are absent. A lineage helps with orientation; it does not replace a full search.",
        "Finally, this is a reference tool, not legal advice. An article read correctly can still be applied wrongly when detached from the facts of a matter. Where real risk is involved, work with a lawyer.",
      ],
    },
    {
      h: "A technical note",
      p: [
        "Each instrument's lineage is SVG rendered on the server from a layout computed once and deterministically: the same data always gives the same drawing. Predecessors sit to the left, successors to the right, parent and amending instruments above, implementing branches below. Every instrument in the drawing is a real link, reachable from the keyboard. On narrow screens the drawing gives way to the written register, because it is wider than a phone.",
        "The lineage on the home page is not chosen by hand: it is the largest lineage in the dataset around an instrument still in force. The crest and the illustrations are SVG, with no 3D models and no downloaded images. The lines of the crest draw themselves once when the page opens; the sheen across the seal and the background have a pause button, and stop by themselves when the reader's device asks for reduced motion.",
      ],
    },
  ],
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII"];

/** Neo của từng mục, để chân trang và các trang khác dẫn thẳng tới đúng mục. */
const IDS = ["gia-pha", "xac-minh", "hieu-luc", "doi-chieu", "dan-trich", "cong-chan", "gioi-han", "ky-thuat"];

/**
 * Các mục minh bạch dữ liệu: phạm vi, nguồn, nhật ký các đợt tra cứu, cách báo
 * lỗi và quyền riêng tư. Mọi con số trong các mục này đếm thẳng từ tập dữ liệu.
 */
const extra: Record<
  Lang,
  {
    coverage: { h: string; p: string; domain: string; total: string; tiers: [string, string, string, string]; verified: string; cross: string };
    sources: { h: string; p: string; kinds: Record<SourceKind, string>; none: string };
    log: { h: string; p: string; date: string; count: string; verified: string };
    report: { h: string; p: string[]; cta: string };
    privacy: { h: string; p: string[] };
  }
> = {
  vi: {
    coverage: {
      h: "Phạm vi dữ liệu",
      p: "Số văn bản của từng lĩnh vực, chia theo tầng hiệu lực và mức xác minh. Một văn bản có thể thuộc nhiều lĩnh vực, nên tổng các hàng lớn hơn tổng số văn bản.",
      domain: "Lĩnh vực",
      total: "Tổng",
      tiers: ["Luật", "Nghị quyết", "Nghị định", "Thông tư"],
      verified: "Đã đối chiếu",
      cross: "Cần kiểm thêm",
    },
    sources: {
      h: "Nguồn dữ liệu",
      p: "Mỗi nguồn được xếp loại theo chính địa chỉ của nó, không ghi tay. Bảng dưới đếm số bản ghi theo loại nguồn tốt nhất mà bản ghi có.",
      kinds: {
        official: "Nguồn chính thống (vbpl.vn, Công báo, cổng Chính phủ, Quốc hội)",
        issuer: "Trang của tổ chức ban hành (VIAC, ICC)",
        database: "Cơ sở dữ liệu pháp luật",
        reference: "Chỉ có bài viết tham khảo",
      },
      none: "bản ghi",
    },
    log: {
      h: "Nhật ký dữ liệu",
      p: "Mỗi bản ghi mang ngày tra cứu của chính nó. Bảng dưới gom bản ghi theo ngày đó: đợt nào được tra, bao nhiêu văn bản, bao nhiêu đã đối chiếu được với nguồn chính thống.",
      date: "Ngày tra cứu",
      count: "Số bản ghi",
      verified: "Đã đối chiếu",
    },
    report: {
      h: "Báo lỗi và sửa dữ liệu",
      p: [
        "Thấy một tình trạng hiệu lực sai, một quan hệ còn thiếu hay một nguồn đã hỏng, hãy báo qua trang góp ý dữ liệu; trang văn bản nào cũng có nút báo lỗi điền sẵn số hiệu. Không cần tài khoản.",
        "Mỗi báo cáo được đối chiếu lại với Công báo hoặc Cơ sở dữ liệu quốc gia về pháp luật trước khi sửa. Bản ghi được sửa mang ngày tra cứu mới, nên người đọc thấy ngay dữ liệu đã được kiểm lại khi nào.",
      ],
      cta: "Mở trang góp ý dữ liệu",
    },
    privacy: {
      h: "Quyền riêng tư",
      p: [
        "Trang không dùng cookie theo dõi và không nạp mã quảng cáo hay đo lường của bên thứ ba. Tài khoản là tùy chọn: mọi công cụ dùng được mà không cần đăng nhập.",
        "Khi chưa đăng nhập, văn bản đang theo dõi, bộ hồ sơ, văn bản vừa xem và câu tìm gần đây chỉ nằm trong bộ nhớ của trình duyệt bạn đang dùng; ngày tra cứu đang đặt chỉ giữ trong phiên.",
        "Khi có tài khoản, Supabase lưu email, mật khẩu đã băm, danh sách văn bản theo dõi và bộ hồ sơ, để chúng đi theo bạn trên mọi máy. Văn bản vừa xem và câu tìm gần đây vẫn chỉ ở trong trình duyệt. Mỗi người chỉ đọc được dữ liệu của chính mình. Bạn có thể xóa vĩnh viễn tài khoản cùng toàn bộ dữ liệu ở trang tài khoản. Góp ý dữ liệu được gửi bằng ứng dụng email của bạn, trang không lưu lại nội dung.",
      ],
    },
  },
  en: {
    coverage: {
      h: "Data coverage",
      p: "The number of instruments in each domain, by stratum of force and by confidence. An instrument may belong to several domains, so the rows add up to more than the total.",
      domain: "Domain",
      total: "Total",
      tiers: ["Laws", "Resolutions", "Decrees", "Circulars"],
      verified: "Confirmed",
      cross: "Needs checking",
    },
    sources: {
      h: "Data sources",
      p: "Every source is classified from its own address rather than by hand. The table counts records by the best kind of source each one has.",
      kinds: {
        official: "Official source (vbpl.vn, the Gazette, Government and National Assembly portals)",
        issuer: "Issuing body (VIAC, ICC)",
        database: "Legal database",
        reference: "Commentary only",
      },
      none: "records",
    },
    log: {
      h: "Data log",
      p: "Every record carries the date it was looked up. The table groups records by that date: which review, how many instruments, and how many were confirmed against an official source.",
      date: "Review date",
      count: "Records",
      verified: "Confirmed",
    },
    report: {
      h: "Reporting and correcting data",
      p: [
        "If a status looks wrong, a relation is missing or a source is broken, report it through the data feedback page; every instrument page has a report button with the number filled in. No account is needed.",
        "Each report is checked again against the Official Gazette or the National Legal Database before anything is changed. A corrected record carries a new review date, so readers can see when it was last checked.",
      ],
      cta: "Open the data feedback page",
    },
    privacy: {
      h: "Privacy",
      p: [
        "The site uses no tracking cookies and loads no third-party advertising or analytics code. Accounts are optional: every tool works without signing in.",
        "When you are not signed in, followed instruments, matters, recently viewed instruments and recent searches stay in your own browser; the lookup date is kept for the session only.",
        "With an account, Supabase stores your email, a hashed password, your watchlist and your matters so they follow you across devices. Recently viewed instruments and recent searches still stay in the browser. Each person can read only their own data. You can permanently delete the account and all its data from the account page. Data feedback is sent with your own email app; the site keeps no copy.",
      ],
    },
  },
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const t = getDict(lang);

  const x = extra[lang];
  const rank: Record<SourceKind, number> = { official: 0, issuer: 1, database: 2, reference: 3 };
  const bestSource = new Map<SourceKind, number>();
  for (const d of documents) {
    const best = describeSources(d.sources)
      .map((s) => s.kind)
      .sort((a, b) => rank[a] - rank[b])[0];
    if (best) bestSource.set(best, (bestSource.get(best) ?? 0) + 1);
  }
  const batches = new Map<string, { n: number; v: number }>();
  for (const d of documents) {
    const b = batches.get(verifiedOnOf(d)) ?? { n: 0, v: 0 };
    b.n++;
    if (d.confidence === "verified") b.v++;
    batches.set(verifiedOnOf(d), b);
  }
  const coverage = domains.map((dm) => {
    const docs = documents.filter((d) => d.domains.includes(dm.id));
    const tiers = [0, 0, 0, 0];
    for (const d of docs) tiers[tierOf(d)]++;
    return {
      id: dm.id,
      label: dm.label[lang],
      total: docs.length,
      tiers,
      verified: docs.filter((d) => d.confidence === "verified").length,
    };
  });
  const counts = {
    total: documents.length,
    verified: documents.filter((d) => d.confidence === "verified").length,
    crossCheck: documents.filter((d) => d.confidence === "cross-check").length,
  };

  return (
    <>
      <section className="rule-b hero-lux">
        <LuxBackdrop />
        <div className="hero-split mx-auto w-full max-w-[76rem] px-5 py-10 sm:px-8 sm:py-14">
          <div className="min-w-0">
            <p className="eyebrow eyebrow-tick rise">{t.nav.about}</p>
            <h1 className="display rise rise-1 mt-3 max-w-[20ch]">{t.about.title}</h1>
            <p className="measure rise rise-2 mt-5 text-[1.125rem] leading-relaxed text-[var(--ink-2)]">
              {t.about.lede}
            </p>
          </div>
          <div className="hero-art rise rise-2">
            <MethodArt lang={lang} />
          </div>
        </div>
      </section>

      <article className="mx-auto w-full max-w-[76rem] px-5 py-10 sm:px-8 sm:py-14">
        <dl className="tnum grid max-w-2xl grid-cols-3 gap-6 border-y border-[var(--rule)] py-5">
          <div>
            <dt className="eyebrow">{lang === "vi" ? "Tổng số" : "Total"}</dt>
            <dd className="text-2xl" style={{ fontFamily: "var(--font-serif)" }}>
              {counts.total}
            </dd>
          </div>
          <div>
            <dt className="eyebrow">{lang === "vi" ? "Đã đối chiếu" : "Confirmed"}</dt>
            <dd className="text-2xl" style={{ fontFamily: "var(--font-serif)" }}>
              {counts.verified}
            </dd>
          </div>
          <div>
            <dt className="eyebrow">
              {lang === "vi" ? "Cần kiểm thêm" : "Needs checking"}
            </dt>
            <dd className="text-2xl" style={{ fontFamily: "var(--font-serif)" }}>
              {counts.crossCheck}
            </dd>
          </div>
        </dl>

        {/* Mục được đánh số bằng chữ số La Mã nhỏ đặt bên lề trái trên màn hình
            rộng: cách một bài viết dài tự chỉ đường mà không cần mục lục. */}
        <div className="mt-12 space-y-14">
          {body[lang].map((section, si) => (
            <Reveal key={section.h}>
              <section
                id={IDS[si]}
                className="scroll-mt-24 lg:grid lg:grid-cols-[4rem_1fr] lg:gap-x-6"
              >
                <p
                  aria-hidden="true"
                  className="tnum text-[var(--brass)] lg:pt-1.5 lg:text-right"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {ROMAN[si] ?? si + 1}
                </p>
                <div className="min-w-0">
                  <h2 className="mt-1 text-[1.45rem] leading-snug lg:mt-0">
                    {section.h}
                  </h2>
                  <div className="measure mt-3 space-y-4">
                    {section.p.map((para, i) => (
                      <p
                        key={i}
                        className={`leading-[1.75] text-[var(--ink-2)] ${
                          si === 0 && i === 0 ? "dropcap" : ""
                        }`}
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              </section>
            </Reveal>
          ))}
        </div>

        {/* Các mục minh bạch dữ liệu. Đánh số tiếp theo các mục văn xuôi ở trên. */}
        <div className="mt-14 space-y-14">
          <section id="pham-vi" className="method-sec scroll-mt-24">
            <p aria-hidden="true" className="method-n tnum">
              {ROMAN[body[lang].length]}
            </p>
            <div className="min-w-0">
              <h2 className="method-h">{x.coverage.h}</h2>
              <p className="measure mt-3 leading-[1.75] text-[var(--ink-2)]">{x.coverage.p}</p>
              <div className="scroll-x thin-scroll mt-5">
                <table className="method-table tnum">
                  <thead>
                    <tr>
                      <th scope="col">{x.coverage.domain}</th>
                      <th scope="col">{x.coverage.total}</th>
                      {x.coverage.tiers.map((tt) => (
                        <th key={tt} scope="col">
                          {tt}
                        </th>
                      ))}
                      <th scope="col">{x.coverage.verified}</th>
                      <th scope="col">{x.coverage.cross}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coverage.map((r) => (
                      <tr key={r.id}>
                        <th scope="row">
                          <Link href={`/${lang}/linh-vuc/${r.id}`} className="link-sweep">
                            {r.label}
                          </Link>
                        </th>
                        <td className="method-total">{r.total}</td>
                        {r.tiers.map((n, i) => (
                          <td key={i}>{n || "–"}</td>
                        ))}
                        <td>{r.verified}</td>
                        <td>{r.total - r.verified || "–"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section id="nguon" className="method-sec scroll-mt-24">
            <p aria-hidden="true" className="method-n tnum">
              {ROMAN[body[lang].length + 1]}
            </p>
            <div className="min-w-0">
              <h2 className="method-h">{x.sources.h}</h2>
              <p className="measure mt-3 leading-[1.75] text-[var(--ink-2)]">{x.sources.p}</p>
              <dl className="method-list tnum">
                {(["official", "issuer", "database", "reference"] as const).map((k) => (
                  <div key={k}>
                    <dt>{x.sources.kinds[k]}</dt>
                    <dd>
                      {bestSource.get(k) ?? 0} {x.sources.none}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section id="nhat-ky" className="method-sec scroll-mt-24">
            <p aria-hidden="true" className="method-n tnum">
              {ROMAN[body[lang].length + 2]}
            </p>
            <div className="min-w-0">
              <h2 className="method-h">{x.log.h}</h2>
              <p className="measure mt-3 leading-[1.75] text-[var(--ink-2)]">{x.log.p}</p>
              <table className="method-table method-table--narrow tnum mt-5">
                <thead>
                  <tr>
                    <th scope="col">{x.log.date}</th>
                    <th scope="col">{x.log.count}</th>
                    <th scope="col">{x.log.verified}</th>
                  </tr>
                </thead>
                <tbody>
                  {[...batches.entries()]
                    .sort((a, b) => b[0].localeCompare(a[0]))
                    .map(([date, b]) => (
                      <tr key={date}>
                        <th scope="row">{formatDate(date, lang, date)}</th>
                        <td>{b.n}</td>
                        <td>{b.v}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="bao-loi" className="method-sec scroll-mt-24">
            <p aria-hidden="true" className="method-n tnum">
              {ROMAN[body[lang].length + 3]}
            </p>
            <div className="min-w-0">
              <h2 className="method-h">{x.report.h}</h2>
              <div className="measure mt-3 space-y-4">
                {x.report.p.map((para) => (
                  <p key={para} className="leading-[1.75] text-[var(--ink-2)]">
                    {para}
                  </p>
                ))}
              </div>
              <Link href={`/${lang}/gop-y`} className="btn btn-quiet mt-5">
                {x.report.cta} →
              </Link>
            </div>
          </section>

          <section id="rieng-tu" className="method-sec scroll-mt-24">
            <p aria-hidden="true" className="method-n tnum">
              {ROMAN[body[lang].length + 4]}
            </p>
            <div className="min-w-0">
              <h2 className="method-h">{x.privacy.h}</h2>
              <div className="measure mt-3 space-y-4">
                {x.privacy.p.map((para) => (
                  <p key={para} className="leading-[1.75] text-[var(--ink-2)]">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </section>
        </div>

        <p className="tnum mt-14 border-t border-[var(--rule)] pt-5 text-sm text-[var(--ink-3)]">
          {t.footer.verifiedPrefix} {formatDate(LATEST_VERIFIED_ON, lang, LATEST_VERIFIED_ON)}.
        </p>
      </article>
    </>
  );
}
