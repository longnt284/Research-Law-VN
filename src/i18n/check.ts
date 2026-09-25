import type { Lang } from "@/data/types";

/**
 * Lời của trang soát căn cứ.
 *
 * Tách khỏi từ điển chung cùng lý do với `validity.ts`: các câu ở đây đi cùng
 * nhau, và người sửa một câu thường cần thấy các câu bên cạnh của cùng tính năng.
 */
export interface CheckCopy {
  title: string;
  lede: string;
  eyebrow: (docs: number) => string;
  inputLabel: string;
  inputPlaceholder: string;
  dateLabel: string;
  dateHint: string;
  useSample: string;
  clear: string;
  privacy: string;
  afterReview: (date: string) => string;
  emptyTitle: string;
  emptyHint: string;
  noneFound: string;
  summary: (found: number, inData: number) => string;
  tally: {
    inForce: string;
    amended: string;
    pending: string;
    expired: string;
    unknown: string;
    missing: string;
  };
  line: (n: number) => string;
  asTyped: string;
  crossCheck: string;
  hasNote: string;
  missingBadge: string;
  missingText: (docs: number) => string;
  near: string;
  inForceSince: string;
  readWith: string;
  pendingFrom: string;
  replacedBy: string;
  lapsedWith: string;
  wasReplacedBy: string;
  from: string;
  chainEnd: string;
  recorded: string;
  unknown: string;
  unnumberedTitle: string;
  unnumberedHint: string;
  copy: string;
  copied: string;
  reportHead: (date: string, verified: string) => string;
  reportFoot: (docs: number) => string;
  howTitle: string;
  how: { h: string; p: string }[];
  sampleTail: string[];
}

const vi: CheckCopy = {
  title: "Soát căn cứ pháp lý",
  lede: "Dán khối “Căn cứ…” của một hợp đồng, công văn hay đơn, rồi chọn ngày ký. Trang đọc số hiệu ra khỏi đoạn văn và cho biết mỗi văn bản thế nào tại ngày đó: đang có hiệu lực, đã có văn bản sửa đổi, chưa có hiệu lực, hay đã bị thay thế và bởi văn bản nào.",
  eyebrow: (n) => `Đối chiếu với ${n} văn bản đã tra cứu`,
  inputLabel: "Đoạn căn cứ",
  inputPlaceholder:
    "Ví dụ:\nCăn cứ Bộ luật Dân sự số 91/2015/QH13;\nCăn cứ Luật Xây dựng số 50/2014/QH13;\n…",
  dateLabel: "Tình trạng tại ngày",
  dateHint: "Thường là ngày ký, ngày ban hành văn bản đang soát, hoặc hôm nay.",
  useSample: "Dùng đoạn mẫu",
  clear: "Xóa",
  privacy:
    "Đoạn văn được xử lý ngay trên trình duyệt này. Trang không lưu và không gửi nó đi đâu.",
  afterReview: (d) =>
    `Ngày đã chọn muộn hơn ngày tra cứu gần nhất (${d}). Văn bản ban hành hoặc thay đổi sau ngày tra cứu chưa có trong tập dữ liệu.`,
  emptyTitle: "Chưa có đoạn văn nào",
  emptyHint: "Dán khối căn cứ vào ô bên cạnh, hoặc bấm “Dùng đoạn mẫu” để xem cách trang đọc kết quả.",
  noneFound:
    "Không nhận ra số hiệu nào trong đoạn văn. Trang chỉ nhận số hiệu dạng 91/2015/QH13, 15/2021/NĐ-CP hoặc 768/QĐ-TTg.",
  summary: (f, d) => `${f} số hiệu nhận ra được, ${d} số hiệu có trong tập dữ liệu`,
  tally: {
    inForce: "đang có hiệu lực",
    amended: "có hiệu lực, đã sửa đổi",
    pending: "chưa có hiệu lực",
    expired: "đã hết hiệu lực",
    unknown: "chưa xác định được",
    missing: "chưa có trong tập dữ liệu",
  },
  line: (n) => `Dòng ${n}`,
  asTyped: "viết trong đoạn văn là",
  crossCheck: "Bản ghi cần đối chiếu thêm",
  hasNote: "Có lưu ý về hiệu lực",
  missingBadge: "Chưa có trong tập dữ liệu",
  missingText: (n) =>
    `Số hiệu này không nằm trong ${n} văn bản của tập dữ liệu, nên trang không kết luận gì về nó. Hãy tra trên Cơ sở dữ liệu quốc gia về pháp luật hoặc Công báo.`,
  near: "Tập dữ liệu có số hiệu gần giống:",
  inForceSince: "Có hiệu lực từ",
  readWith: "Đọc cùng văn bản sửa đổi, bổ sung đã có hiệu lực:",
  pendingFrom: "Có hiệu lực từ",
  replacedBy: "Được thay thế bởi",
  lapsedWith: "Hết hiệu lực cùng văn bản mà nó sửa đổi:",
  wasReplacedBy: "được thay thế bởi",
  from: "từ",
  chainEnd: "Văn bản có hiệu lực tại ngày đã chọn:",
  recorded:
    "Được ghi nhận là hết hiệu lực tại ngày tra cứu. Tập dữ liệu không có văn bản thay thế.",
  unknown:
    "Tập dữ liệu biết văn bản đã hết hiệu lực ở ngày tra cứu nhưng không biết từ ngày nào, nên không kết luận cho ngày đã chọn.",
  unnumberedTitle: "Dòng nhắc tới văn bản nhưng không có số hiệu",
  unnumberedHint:
    "Trang không đoán văn bản từ tên, vì tên văn bản lặp lại qua các đời luật. Bổ sung số hiệu cho những dòng này để soát được.",
  copy: "Sao chép kết quả",
  copied: "Đã sao chép",
  reportHead: (d, v) => `Soát căn cứ pháp lý tại ngày ${d} (dữ liệu tra cứu ngày ${v})`,
  reportFoot: (n) =>
    `Kết quả chỉ dựa trên ${n} văn bản của tập dữ liệu và các quan hệ đã ghi trong đó; không thay thế ý kiến pháp lý cho một vụ việc cụ thể.`,
  howTitle: "Cách trang đọc kết quả",
  how: [
    {
      h: "Chỉ đọc số hiệu",
      p: "Trang nhận ra số hiệu dạng số/năm/cơ quan (91/2015/QH13, 15/2021/NĐ-CP, 06/2021/TT-BXD) và số hiệu không có năm (768/QĐ-TTg, 74/VBHN-VPQH), bất kể chữ Đ được gõ thế nào, gạch nối hay gạch ngang, có số 0 đứng đầu hay không. Một dòng chỉ nêu tên văn bản thì không được đoán ra văn bản nào; trang liệt kê riêng các dòng đó. Số của chính hợp đồng (…/HĐ…) được bỏ qua.",
    },
    {
      h: "Tình trạng tại ngày đã chọn",
      p: "Tình trạng tính từ quan hệ trong tập dữ liệu, cùng phép tính với ô chọn ngày trên trang từng văn bản: trước ngày có hiệu lực là chưa có hiệu lực; từ ngày văn bản thay thế có hiệu lực là đã hết hiệu lực; từ ngày văn bản sửa đổi có hiệu lực thì vẫn còn hiệu lực nhưng phải đọc cùng văn bản sửa đổi. Chỗ dữ liệu không đủ để kết luận, trang nói là chưa xác định được.",
    },
    {
      h: "Chuỗi thay thế",
      p: "Với văn bản đã hết hiệu lực, trang đi theo quan hệ thay thế cho tới văn bản đang có hiệu lực tại ngày đã chọn. Văn bản sửa đổi hết hiệu lực cùng văn bản mà nó sửa, nên chuỗi của nó đi tiếp từ văn bản được sửa.",
    },
    {
      h: "Giới hạn",
      p: "Số hiệu không có trong tập dữ liệu được ghi là chưa có dữ liệu, không phải là sai. Kết quả chỉ tốt bằng tập dữ liệu tại ngày tra cứu, và không nói gì về việc một văn bản có phù hợp làm căn cứ cho giao dịch cụ thể hay không. Trước khi dùng vào hồ sơ chính thức, hãy đối chiếu lại với Công báo hoặc cơ quan ban hành.",
    },
  ],
  sampleTail: ["Căn cứ nhu cầu và khả năng của hai bên."],
};

const en: CheckCopy = {
  title: "Legal basis check",
  lede: "Paste the “Pursuant to…” recitals of a contract, official letter or application, then pick the signing date. The page reads the document numbers out of the text and says how each instrument stood on that date: in force, amended, not yet in force, or replaced, and by what.",
  eyebrow: (n) => `Checked against ${n} researched instruments`,
  inputLabel: "Recitals",
  inputPlaceholder:
    "For example:\nPursuant to the Civil Code No. 91/2015/QH13;\nPursuant to the Law on Construction No. 50/2014/QH13;\n…",
  dateLabel: "Status on date",
  dateHint: "Usually the signing date, the date of the document under review, or today.",
  useSample: "Use the sample",
  clear: "Clear",
  privacy: "The text is processed in this browser only. The page neither stores nor sends it anywhere.",
  afterReview: (d) =>
    `The chosen date is later than the latest review date (${d}). Instruments issued or changed after the review date are not in the dataset.`,
  emptyTitle: "No text yet",
  emptyHint: "Paste the recitals into the box, or press “Use the sample” to see how the results read.",
  noneFound:
    "No document number was recognised. The page reads numbers such as 91/2015/QH13, 15/2021/NĐ-CP or 768/QĐ-TTg.",
  summary: (f, d) => `${f} numbers recognised, ${d} of them in the dataset`,
  tally: {
    inForce: "in force",
    amended: "in force, amended",
    pending: "not yet in force",
    expired: "no longer in force",
    unknown: "undetermined",
    missing: "not in the dataset",
  },
  line: (n) => `Line ${n}`,
  asTyped: "written in the text as",
  crossCheck: "Record needs further checking",
  hasNote: "Note on validity",
  missingBadge: "Not in the dataset",
  missingText: (n) =>
    `This number is not among the ${n} instruments in the dataset, so the page draws no conclusion about it. Check it on the National Legal Database or in the Official Gazette.`,
  near: "The dataset has a similar number:",
  inForceSince: "In force from",
  readWith: "Read together with the amending instruments already in force:",
  pendingFrom: "In force from",
  replacedBy: "Replaced by",
  lapsedWith: "Lapsed together with the instrument it amended:",
  wasReplacedBy: "was replaced by",
  from: "from",
  chainEnd: "Instrument in force on the chosen date:",
  recorded:
    "Recorded as no longer in force on the review date. The dataset holds no replacing instrument.",
  unknown:
    "The dataset knows the instrument had lapsed by the review date but not from when, so it draws no conclusion for the chosen date.",
  unnumberedTitle: "Lines that mention an instrument without a number",
  unnumberedHint:
    "The page does not guess an instrument from its name, since names repeat across generations of legislation. Add the number to these lines to have them checked.",
  copy: "Copy the results",
  copied: "Copied",
  reportHead: (d, v) => `Legal basis check as at ${d} (dataset reviewed on ${v})`,
  reportFoot: (n) =>
    `Results rest only on the ${n} instruments in the dataset and the relations recorded there; they are not legal advice on a specific matter.`,
  howTitle: "How the results are read",
  how: [
    {
      h: "Numbers only",
      p: "The page recognises numbers of the form number/year/issuer (91/2015/QH13, 15/2021/NĐ-CP, 06/2021/TT-BXD) and numbers without a year (768/QĐ-TTg, 74/VBHN-VPQH), however the letter Đ was typed, with a hyphen or a dash, with or without a leading zero. A line that only names an instrument is not matched to anything; those lines are listed separately. The contract's own number (…/HĐ…) is ignored.",
    },
    {
      h: "Status on the chosen date",
      p: "Status is computed from the relations in the dataset, by the same rule as the date picker on each instrument's page: before commencement it is not yet in force; from the day a replacing instrument takes effect it is no longer in force; from the day an amending instrument takes effect it remains in force but must be read with the amendment. Where the data cannot settle the question, the page says it cannot be determined.",
    },
    {
      h: "Replacement chain",
      p: "For an instrument no longer in force, the page follows the replacement relations to the instrument in force on the chosen date. An amending instrument lapses with the instrument it amended, so its chain continues from the amended instrument.",
    },
    {
      h: "Limits",
      p: "A number that is not in the dataset is reported as having no data, not as wrong. The results are only as good as the dataset on its review date, and they say nothing about whether an instrument is a fitting basis for a particular transaction. Before relying on them in a formal filing, check against the Official Gazette or the issuing authority.",
    },
  ],
  sampleTail: ["Having regard to the needs and capacity of both parties."],
};

export function getCheckCopy(lang: Lang): CheckCopy {
  return lang === "vi" ? vi : en;
}
