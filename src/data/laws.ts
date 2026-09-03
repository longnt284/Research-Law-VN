export type DocType = "Hiến pháp" | "Luật" | "Nghị định" | "Thông tư";
export type DocStatus = "active" | "expiring" | "expired";
export type RelKind = "guides" | "amends" | "replaces" | "replacedBy" | "related";

export interface Point {
  id: string;
  label: string; // "a", "b"...
  text: string;
}
export interface Clause {
  id: string;
  num: number;
  text: string;
  points?: Point[];
}
export interface Article {
  id: string;
  number: number;
  title: string;
  clauses: Clause[];
  note?: string;
}
export interface Chapter {
  id: string;
  label: string;
  title: string;
  articles: Article[];
}
export interface Relation {
  lawId: string;
  kind: RelKind;
}
export interface Law {
  id: string;
  number: string;
  name: string;
  type: DocType;
  issuer: string;
  issuedDate: string;
  effectiveDate: string;
  expiryDate?: string;
  status: DocStatus;
  field: string;
  summary: string;
  keywords: string[];
  chapters: Chapter[];
  relations: Relation[];
}

const A = (number: number, title: string, clauses: string[], note?: string): Article => ({
  id: `d${number}`,
  number,
  title,
  clauses: clauses.map((text, i) => ({ id: `k${i + 1}`, num: i + 1, text })),
  note,
});

export const FIELDS = [
  { id: "hienphap", name: "Nhà nước – Hiến pháp", color: "#e5b054" },
  { id: "doanhnghiep", name: "Doanh nghiệp – Đầu tư", color: "#45c8ff" },
  { id: "dansu", name: "Dân sự – Hợp đồng", color: "#7fa6ff" },
  { id: "dattai", name: "Đất đai – Nhà ở", color: "#6ee7a0" },
  { id: "laodong", name: "Lao động – Việc làm", color: "#f0945f" },
  { id: "hinhsu", name: "Hình sự – Hành chính", color: "#f26d8d" },
  { id: "hngd", name: "Hôn nhân – Gia đình", color: "#e58bc9" },
  { id: "giaothong", name: "Giao thông – Vận tải", color: "#9aa7ff" },
] as const;

export const fieldOf = (f: string) => FIELDS.find((x) => x.id === f) ?? FIELDS[0];

export const LAWS: Law[] = [
  {
    id: "hienphap2013",
    number: "Hiến pháp 2013",
    name: "Hiến pháp nước CHXHCN Việt Nam",
    type: "Hiến pháp",
    issuer: "Quốc hội",
    issuedDate: "2013-11-28",
    effectiveDate: "2014-01-01",
    status: "active",
    field: "hienphap",
    summary:
      "Đạo luật cơ bản của nước Cộng hòa xã hội chủ nghĩa Việt Nam, có hiệu lực pháp lý cao nhất; quy định chế độ chính trị, quyền con người, quyền và nghĩa vụ cơ bản của công dân, tổ chức bộ máy nhà nước.",
    keywords: ["hiến pháp", "nhà nước pháp quyền", "quyền con người", "quyền công dân", "tự do kinh doanh", "sở hữu toàn dân"],
    chapters: [
      {
        id: "c1",
        label: "Chương I",
        title: "Chế độ chính trị",
        articles: [
          A(2, "Nhà nước pháp quyền xã hội chủ nghĩa", [
            "Nhà nước Cộng hòa xã hội chủ nghĩa Việt Nam là nhà nước pháp quyền xã hội chủ nghĩa của Nhân dân, do Nhân dân, vì Nhân dân.",
            "Nước Cộng hòa xã hội chủ nghĩa Việt Nam do Nhân dân làm chủ; tất cả quyền lực nhà nước thuộc về Nhân dân mà nền tảng là liên minh giữa giai cấp công nhân với giai cấp nông dân và đội ngũ trí thức.",
            "Quyền lực nhà nước là thống nhất, có sự phân công, phối hợp, kiểm soát giữa các cơ quan nhà nước trong việc thực hiện các quyền lập pháp, hành pháp, tư pháp.",
          ]),
        ],
      },
      {
        id: "c2",
        label: "Chương II",
        title: "Quyền con người, quyền và nghĩa vụ cơ bản của công dân",
        articles: [
          A(14, "Nguyên tắc về quyền con người, quyền công dân", [
            "Ở nước Cộng hòa xã hội chủ nghĩa Việt Nam, các quyền con người, quyền công dân về chính trị, dân sự, kinh tế, văn hóa, xã hội được công nhận, tôn trọng, bảo vệ, bảo đảm theo Hiến pháp và pháp luật.",
            "Quyền con người, quyền công dân chỉ có thể bị hạn chế theo quy định của luật trong trường hợp cần thiết vì lý do quốc phòng, an ninh quốc gia, trật tự, an toàn xã hội, đạo đức xã hội, sức khỏe của cộng đồng.",
          ]),
          A(33, "Quyền tự do kinh doanh", ["Mọi người có quyền tự do kinh doanh trong những ngành nghề mà pháp luật không cấm."]),
          A(53, "Tài sản công, sở hữu toàn dân", [
            "Đất đai, tài nguyên nước, tài nguyên khoáng sản, nguồn lợi ở vùng biển, vùng trời, tài nguyên thiên nhiên khác và các tài sản do Nhà nước đầu tư, quản lý là tài sản công thuộc sở hữu toàn dân do Nhà nước đại diện chủ sở hữu và thống nhất quản lý.",
          ]),
        ],
      },
    ],
    relations: [
      { lawId: "luatdatdai2024", kind: "related" },
      { lawId: "luathinhsu2015", kind: "related" },
      { lawId: "luatdansu2015", kind: "related" },
    ],
  },
  {
    id: "luatdoanhnghiep2020",
    number: "59/2020/QH14",
    name: "Luật Doanh nghiệp",
    type: "Luật",
    issuer: "Quốc hội",
    issuedDate: "2020-06-17",
    effectiveDate: "2021-01-01",
    status: "active",
    field: "doanhnghiep",
    summary:
      "Quy định việc thành lập, tổ chức quản lý, tổ chức lại, giải thể và hoạt động của doanh nghiệp: công ty TNHH, công ty cổ phần, công ty hợp danh và doanh nghiệp tư nhân; quy định về nhóm công ty.",
    keywords: ["doanh nghiệp", "công ty", "thành lập", "cổ phần", "trách nhiệm hữu hạn", "vốn điều lệ", "đăng ký kinh doanh", "giấy phép"],
    chapters: [
      {
        id: "c1",
        label: "Chương I",
        title: "Quy định chung",
        articles: [
          A(
            1,
            "Phạm vi điều chỉnh",
            [
              "Luật này quy định về việc thành lập, tổ chức quản lý, tổ chức lại, giải thể và hoạt động có liên quan của doanh nghiệp, bao gồm công ty trách nhiệm hữu hạn, công ty cổ phần, công ty hợp danh và doanh nghiệp tư nhân; quy định về nhóm công ty.",
            ],
            "Văn bản hợp nhất với các nội dung được sửa đổi, bổ sung bởi Luật số 03/2022/QH15."
          ),
          A(4, "Giải thích từ ngữ (trích)", [
            "Doanh nghiệp là tổ chức có tên riêng, có tài sản, có trụ sở giao dịch, được thành lập hoặc đăng ký thành lập theo quy định của pháp luật nhằm mục đích kinh doanh.",
            "Góp vốn là việc góp tài sản để tạo thành vốn điều lệ của công ty, bao gồm góp vốn để thành lập công ty hoặc góp thêm vốn điều lệ của công ty đã được thành lập.",
            "Vốn điều lệ là tổng giá trị tài sản do các thành viên công ty, chủ sở hữu công ty đã góp hoặc cam kết góp khi thành lập công ty trách nhiệm hữu hạn, công ty hợp danh; là tổng mệnh giá cổ phần đã bán hoặc được đăng ký mua khi thành lập công ty cổ phần.",
          ]),
        ],
      },
      {
        id: "c2",
        label: "Chương II",
        title: "Thành lập doanh nghiệp",
        articles: [
          A(7, "Quyền của doanh nghiệp", [
            "Tự do kinh doanh ngành, nghề mà luật không cấm.",
            "Tự chủ kinh doanh và lựa chọn hình thức tổ chức kinh doanh; chủ động lựa chọn ngành, nghề, địa bàn, hình thức kinh doanh; chủ động điều chỉnh quy mô và ngành, nghề kinh doanh.",
            "Lựa chọn hình thức, phương thức huy động, phân bổ và sử dụng vốn.",
          ]),
          A(8, "Nghĩa vụ của doanh nghiệp", [
            "Đáp ứng đủ điều kiện đầu tư kinh doanh khi kinh doanh ngành, nghề đầu tư kinh doanh có điều kiện; bảo đảm duy trì đủ điều kiện đó trong suốt quá trình hoạt động kinh doanh.",
            "Thực hiện đầy đủ, kịp thời nghĩa vụ về đăng ký doanh nghiệp, đăng ký thay đổi nội dung đăng ký doanh nghiệp, công khai thông tin về thành lập và hoạt động của doanh nghiệp.",
            "Chịu trách nhiệm về tính trung thực, chính xác của thông tin kê khai trong hồ sơ đăng ký doanh nghiệp và các báo cáo.",
          ]),
          A(17, "Quyền thành lập, góp vốn, mua cổ phần, mua phần vốn góp", [
            "Tổ chức, cá nhân có quyền thành lập và quản lý doanh nghiệp tại Việt Nam theo quy định của Luật này, trừ trường hợp quy định tại khoản 2 Điều này.",
            "Tổ chức, cá nhân sau đây không có quyền thành lập và quản lý doanh nghiệp tại Việt Nam: cơ quan nhà nước, đơn vị lực lượng vũ trang nhân dân sử dụng tài sản nhà nước để thành lập doanh nghiệp kinh doanh thu lợi riêng; cán bộ, công chức, viên chức theo quy định của Luật Cán bộ, công chức và Luật Viên chức; người đang bị truy cứu trách nhiệm hình sự, bị tạm giam, đang chấp hành hình phạt tù...",
          ]),
        ],
      },
      {
        id: "c3",
        label: "Chương III",
        title: "Các loại hình doanh nghiệp (trích)",
        articles: [
          A(47, "Công ty trách nhiệm hữu hạn hai thành viên trở lên", [
            "Công ty trách nhiệm hữu hạn hai thành viên trở lên là doanh nghiệp có từ 02 đến 50 thành viên là tổ chức, cá nhân. Thành viên chịu trách nhiệm về các khoản nợ và nghĩa vụ tài sản khác của doanh nghiệp trong phạm vi số vốn đã góp vào doanh nghiệp.",
            "Phần vốn góp của thành viên chỉ được chuyển nhượng theo quy định tại các điều 51, 52 và 53 của Luật này.",
            "Công ty trách nhiệm hữu hạn hai thành viên trở lên có tư cách pháp nhân kể từ ngày được cấp Giấy chứng nhận đăng ký doanh nghiệp; không được phát hành cổ phần, trừ trường hợp để chuyển đổi thành công ty cổ phần.",
          ]),
          A(111, "Công ty cổ phần", [
            "Công ty cổ phần là doanh nghiệp, trong đó: vốn điều lệ được chia thành nhiều phần bằng nhau gọi là cổ phần; cổ đông có thể là tổ chức, cá nhân, số lượng cổ đông tối thiểu là 03 và không hạn chế số lượng tối đa; cổ đông chỉ chịu trách nhiệm về các khoản nợ và nghĩa vụ tài sản khác của doanh nghiệp trong phạm vi số vốn đã góp.",
            "Cổ đông có quyền tự do chuyển nhượng cổ phần của mình cho người khác, trừ trường hợp quy định tại khoản 3 Điều 120 và khoản 1 Điều 127 của Luật này.",
            "Công ty cổ phần có tư cách pháp nhân kể từ ngày được cấp Giấy chứng nhận đăng ký doanh nghiệp; có quyền phát hành cổ phần, trái phiếu và các loại chứng khoán khác của công ty.",
          ]),
        ],
      },
    ],
    relations: [
      { lawId: "luatdoanhnghiep2014", kind: "replaces" },
      { lawId: "nd01_2021", kind: "guides" },
      { lawId: "luatdautu2020", kind: "related" },
      { lawId: "luatthuongmai2005", kind: "related" },
      { lawId: "luatlaodong2019", kind: "related" },
    ],
  },
  {
    id: "luatdautu2020",
    number: "61/2020/QH14",
    name: "Luật Đầu tư",
    type: "Luật",
    issuer: "Quốc hội",
    issuedDate: "2020-06-17",
    effectiveDate: "2021-01-01",
    status: "active",
    field: "doanhnghiep",
    summary:
      "Quy định về hoạt động đầu tư kinh doanh tại Việt Nam và hoạt động đầu tư kinh doanh từ Việt Nam ra nước ngoài; ngành, nghề cấm đầu tư kinh doanh và ngành, nghề đầu tư kinh doanh có điều kiện.",
    keywords: ["đầu tư", "nhà đầu tư", "ngành nghề có điều kiện", "giấy chứng nhận đầu tư", "ưu đãi đầu tư"],
    chapters: [
      {
        id: "c1",
        label: "Chương I",
        title: "Quy định chung",
        articles: [
          A(5, "Chính sách về đầu tư kinh doanh", [
            "Nhà đầu tư có quyền thực hiện hoạt động đầu tư kinh doanh trong các ngành, nghề mà Luật này không cấm.",
            "Nhà đầu tư được tự quyết định và tự chịu trách nhiệm về hoạt động đầu tư kinh doanh theo quy định của Luật này và quy định khác của pháp luật có liên quan.",
            "Nhà nước công nhận và bảo hộ quyền sở hữu về tài sản, vốn đầu tư, thu nhập và các quyền, lợi ích hợp pháp khác của nhà đầu tư.",
          ]),
          A(6, "Ngành, nghề cấm đầu tư kinh doanh", [
            "Cấm các hoạt động đầu tư kinh doanh sau đây: kinh doanh các chất ma túy; kinh doanh các loại hóa chất, khoáng vật quy định tại Phụ lục II của Luật này; kinh doanh mẫu vật các loài thực vật, động vật hoang dã có nguồn gốc khai thác từ tự nhiên...",
            "Việc sản xuất, sử dụng sản phẩm quy định tại các điểm a, b và c khoản 1 Điều này trong phân tích, kiểm nghiệm, nghiên cứu khoa học, y tế, quốc phòng, an ninh được thực hiện theo quy định của Chính phủ.",
          ]),
          A(7, "Ngành, nghề đầu tư kinh doanh có điều kiện", [
            "Ngành, nghề đầu tư kinh doanh có điều kiện là ngành, nghề mà việc thực hiện hoạt động đầu tư kinh doanh trong ngành, nghề đó phải đáp ứng điều kiện cần thiết vì lý do quốc phòng, an ninh quốc gia, trật tự, an toàn xã hội, đạo đức xã hội, sức khỏe của cộng đồng.",
            "Danh mục ngành, nghề đầu tư kinh doanh có điều kiện được quy định tại Phụ lục IV của Luật này.",
          ]),
        ],
      },
    ],
    relations: [
      { lawId: "luatdoanhnghiep2020", kind: "related" },
      { lawId: "hienphap2013", kind: "related" },
    ],
  },
  {
    id: "luatdatdai2024",
    number: "31/2024/QH15",
    name: "Luật Đất đai",
    type: "Luật",
    issuer: "Quốc hội",
    issuedDate: "2024-01-18",
    effectiveDate: "2024-08-01",
    status: "active",
    field: "dattai",
    summary:
      "Quy định về chế độ sở hữu đất đai, quyền hạn và trách nhiệm của Nhà nước, quyền và nghĩa vụ của người sử dụng đất; quy hoạch, kế hoạch sử dụng đất; thu hồi, bồi thường, giao đất, cho thuê đất, cấp Giấy chứng nhận.",
    keywords: ["đất đai", "sổ đỏ", "giấy chứng nhận", "thu hồi đất", "bồi thường", "quyền sử dụng đất", "chuyển nhượng"],
    chapters: [
      {
        id: "c1",
        label: "Chương I",
        title: "Quy định chung",
        articles: [
          A(5, "Người sử dụng đất", [
            "Người sử dụng đất được Nhà nước giao đất, cho thuê đất, công nhận quyền sử dụng đất; đang sử dụng đất ổn định, đủ điều kiện cấp Giấy chứng nhận quyền sử dụng đất, quyền sở hữu tài sản gắn liền với đất theo quy định của Luật này.",
            "Người sử dụng đất bao gồm: tổ chức trong nước; tổ chức tôn giáo; cá nhân trong nước, người Việt Nam định cư ở nước ngoài là công dân Việt Nam; cộng đồng dân cư; tổ chức nước ngoài có chức năng ngoại giao; tổ chức kinh tế có vốn đầu tư nước ngoài.",
          ]),
          A(9, "Phân loại đất", [
            "Căn cứ vào mục đích sử dụng, đất đai được phân loại thành nhóm đất nông nghiệp, nhóm đất phi nông nghiệp và nhóm đất chưa sử dụng.",
            "Nhóm đất nông nghiệp bao gồm: đất trồng cây hằng năm, đất trồng cây lâu năm, đất lâm nghiệp, đất nuôi trồng thủy sản, đất chăn nuôi tập trung, đất làm muối, đất nông nghiệp khác.",
            "Nhóm đất phi nông nghiệp bao gồm: đất ở; đất xây dựng trụ sở cơ quan; đất quốc phòng, an ninh; đất xây dựng công trình sự nghiệp; đất sản xuất, kinh doanh phi nông nghiệp; đất sử dụng vào mục đích công cộng...",
          ]),
        ],
      },
      {
        id: "c2",
        label: "Chương III",
        title: "Quyền và nghĩa vụ của người sử dụng đất (trích)",
        articles: [
          A(26, "Quyền chung của người sử dụng đất", [
            "Được cấp Giấy chứng nhận quyền sử dụng đất, quyền sở hữu tài sản gắn liền với đất.",
            "Hưởng thành quả lao động, kết quả đầu tư trên đất sử dụng hợp pháp; hưởng các lợi ích khi Nhà nước đầu tư để bảo vệ, cải tạo và phát triển đất nông nghiệp.",
            "Khiếu nại, tố cáo, khởi kiện về những hành vi vi phạm quyền sử dụng đất hợp pháp của mình và những hành vi khác vi phạm pháp luật về đất đai.",
          ]),
          A(27, "Quyền chuyển đổi, chuyển nhượng, cho thuê, thừa kế, tặng cho, thế chấp, góp vốn", [
            "Người sử dụng đất được thực hiện các quyền chuyển đổi, chuyển nhượng, cho thuê, cho thuê lại, thừa kế, tặng cho quyền sử dụng đất; thế chấp, góp vốn bằng quyền sử dụng đất theo quy định của Luật này và luật khác có liên quan.",
            "Nhóm người sử dụng đất mà có chung quyền sử dụng đất thì có các quyền và nghĩa vụ theo quy định của Luật này.",
          ]),
        ],
      },
    ],
    relations: [
      { lawId: "luatdatdai2013", kind: "replaces" },
      { lawId: "nd102_2024", kind: "guides" },
      { lawId: "hienphap2013", kind: "related" },
    ],
  },
  {
    id: "luatdatdai2013",
    number: "45/2013/QH13",
    name: "Luật Đất đai",
    type: "Luật",
    issuer: "Quốc hội",
    issuedDate: "2013-11-29",
    effectiveDate: "2014-07-01",
    expiryDate: "2024-08-01",
    status: "expired",
    field: "dattai",
    summary:
      "Luật Đất đai năm 2013 — đã hết hiệu lực toàn bộ từ ngày 01/8/2024, được thay thế bởi Luật Đất đai số 31/2024/QH15. Chỉ còn giá trị tra cứu lịch sử.",
    keywords: ["đất đai", "sổ đỏ", "cấp giấy chứng nhận", "thu hồi đất"],
    chapters: [
      {
        id: "c1",
        label: "Chương I",
        title: "Quy định chung (trích)",
        articles: [
          A(5, "Người sử dụng đất", [
            "Người sử dụng đất được Nhà nước giao đất, cho thuê đất, công nhận quyền sử dụng đất, nhận chuyển quyền sử dụng đất theo quy định của Luật này.",
          ]),
          A(10, "Phân loại đất", [
            "Căn cứ vào mục đích sử dụng, đất đai được phân loại thành nhóm đất nông nghiệp, nhóm đất phi nông nghiệp và nhóm đất chưa sử dụng gồm các loại đất chưa xác định mục đích sử dụng.",
          ]),
        ],
      },
    ],
    relations: [{ lawId: "luatdatdai2024", kind: "replacedBy" }],
  },
  {
    id: "nd102_2024",
    number: "102/2024/NĐ-CP",
    name: "Nghị định quy định chi tiết thi hành một số điều của Luật Đất đai",
    type: "Nghị định",
    issuer: "Chính phủ",
    issuedDate: "2024-07-30",
    effectiveDate: "2024-08-01",
    status: "active",
    field: "dattai",
    summary:
      "Quy định chi tiết về người sử dụng đất, quy hoạch và kế hoạch sử dụng đất, thu hồi đất, bồi thường, hỗ trợ, tái định cư, giao đất, cho thuê đất và đăng ký đất đai theo Luật Đất đai 2024.",
    keywords: ["hướng dẫn luật đất đai", "bồi thường", "tái định cư", "thu hồi đất", "giao đất"],
    chapters: [
      {
        id: "c1",
        label: "Chương V",
        title: "Thu hồi đất, bồi thường, hỗ trợ, tái định cư (trích)",
        articles: [
          A(52, "Trình tự, thủ tục bồi thường, hỗ trợ, tái định cư", [
            "Việc bồi thường, hỗ trợ, tái định cư khi Nhà nước thu hồi đất phải bảo đảm dân chủ, khách quan, công bằng, công khai, minh bạch, kịp thời và đúng quy định của pháp luật; quan tâm đến đối tượng chính sách, người trực tiếp sản xuất nông nghiệp.",
            "Phương án bồi thường, hỗ trợ, tái định cư phải được niêm yết công khai tại trụ sở Ủy ban nhân dân cấp xã, địa điểm sinh hoạt chung của khu dân cư nơi có đất thu hồi.",
          ]),
        ],
      },
    ],
    relations: [{ lawId: "luatdatdai2024", kind: "guides" }],
  },
  {
    id: "luatlaodong2019",
    number: "45/2019/QH14",
    name: "Bộ luật Lao động",
    type: "Luật",
    issuer: "Quốc hội",
    issuedDate: "2019-11-20",
    effectiveDate: "2021-01-01",
    status: "active",
    field: "laodong",
    summary:
      "Quy định tiêu chuẩn lao động; quyền, nghĩa vụ của người lao động và người sử dụng lao động; hợp đồng lao động; tiền lương; thời giờ làm việc, nghỉ ngơi; an toàn, vệ sinh lao động; giải quyết tranh chấp lao động.",
    keywords: ["lao động", "hợp đồng lao động", "tiền lương", "thử việc", "sa thải", "nghỉ phép", "làm thêm giờ", "bảo hiểm"],
    chapters: [
      {
        id: "c1",
        label: "Chương III",
        title: "Hợp đồng lao động (trích)",
        articles: [
          A(13, "Hợp đồng lao động", [
            "Hợp đồng lao động là sự thỏa thuận giữa người lao động và người sử dụng lao động về việc làm có trả công, tiền lương, điều kiện lao động, quyền và nghĩa vụ của mỗi bên trong quan hệ lao động.",
            "Trường hợp hai bên thỏa thuận bằng tên gọi khác nhưng có nội dung thể hiện về việc làm có trả công, tiền lương và sự quản lý, điều hành, giám sát của một bên thì được coi là hợp đồng lao động.",
            "Trước khi nhận người lao động vào làm việc thì người sử dụng lao động phải giao kết hợp đồng lao động với người lao động.",
          ]),
          A(20, "Loại hợp đồng lao động", [
            "Hợp đồng lao động phải được giao kết theo một trong các loại sau đây: hợp đồng lao động không xác định thời hạn là hợp đồng mà trong đó hai bên không xác định thời hạn, thời điểm chấm dứt hiệu lực của hợp đồng; hợp đồng lao động xác định thời hạn là hợp đồng mà trong đó hai bên xác định thời hạn, thời điểm chấm dứt hiệu lực của hợp đồng trong thời gian không quá 36 tháng kể từ thời điểm có hiệu lực của hợp đồng.",
            "Khi hợp đồng lao động xác định thời hạn hết hạn mà người lao động vẫn tiếp tục làm việc thì trong thời hạn 30 ngày kể từ ngày hợp đồng hết hạn, hai bên phải ký kết hợp đồng lao động mới; trong thời gian chưa ký kết hợp đồng mới thì quyền, nghĩa vụ và lợi ích của hai bên được thực hiện theo hợp đồng đã giao kết.",
            "Trường hợp hai bên ký kết hợp đồng lao động mới là hợp đồng lao động xác định thời hạn thì cũng chỉ được ký thêm 01 lần, sau đó nếu người lao động vẫn tiếp tục làm việc thì phải ký kết hợp đồng lao động không xác định thời hạn.",
          ]),
          A(25, "Thời gian thử việc", [
            "Thời gian thử việc do hai bên thỏa thuận căn cứ vào tính chất và mức độ phức tạp của công việc nhưng chỉ được thử việc một lần đối với một công việc và bảo đảm điều kiện sau đây: không quá 180 ngày đối với công việc của người quản lý doanh nghiệp theo quy định của Luật Doanh nghiệp, Luật Quản lý, sử dụng vốn nhà nước đầu tư vào sản xuất, kinh doanh tại doanh nghiệp; không quá 60 ngày đối với công việc có chức danh nghề nghiệp cần trình độ chuyên môn, kỹ thuật từ cao đẳng trở lên; không quá 30 ngày đối với công việc có chức danh nghề nghiệp cần trình độ chuyên môn, kỹ thuật trung cấp, công nhân kỹ thuật, nhân viên nghiệp vụ; không quá 06 ngày làm việc đối với công việc khác.",
          ]),
        ],
      },
      {
        id: "c2",
        label: "Chương VII",
        title: "Thời giờ làm việc, thời giờ nghỉ ngơi (trích)",
        articles: [
          A(105, "Thời giờ làm việc bình thường", [
            "Thời giờ làm việc bình thường không quá 08 giờ trong 01 ngày và không quá 48 giờ trong 01 tuần.",
            "Người sử dụng lao động có quyền quy định thời giờ làm việc theo ngày hoặc tuần nhưng phải thông báo cho người lao động biết; trường hợp theo tuần thì thời giờ làm việc bình thường không quá 10 giờ trong 01 ngày và không quá 48 giờ trong 01 tuần.",
            "Nhà nước khuyến khích người sử dụng lao động thực hiện tuần làm việc 40 giờ đối với người lao động.",
          ]),
        ],
      },
    ],
    relations: [
      { lawId: "nd145_2020", kind: "guides" },
      { lawId: "luatdoanhnghiep2020", kind: "related" },
    ],
  },
  {
    id: "nd145_2020",
    number: "145/2020/NĐ-CP",
    name: "Nghị định quy định chi tiết và hướng dẫn thi hành một số điều của Bộ luật Lao động về điều kiện lao động và quan hệ lao động",
    type: "Nghị định",
    issuer: "Chính phủ",
    issuedDate: "2020-12-14",
    effectiveDate: "2021-02-01",
    status: "active",
    field: "laodong",
    summary:
      "Hướng dẫn chi tiết về tuyển dụng, quản lý lao động; hợp đồng lao động; đối thoại tại nơi làm việc; thương lượng tập thể; thời giờ làm việc, nghỉ ngơi và kỷ luật lao động theo Bộ luật Lao động 2019.",
    keywords: ["hướng dẫn bộ luật lao động", "nội quy", "thỏa ước", "đối thoại", "kỷ luật lao động"],
    chapters: [
      {
        id: "c1",
        label: "Chương I",
        title: "Tuyển dụng, quản lý lao động (trích)",
        articles: [
          A(3, "Xác định quan hệ lao động", [
            "Trường hợp các bên thỏa thuận bằng tên gọi khác nhưng có nội dung thể hiện về việc làm có trả công, tiền lương và sự quản lý, điều hành, giám sát của một bên thì được coi là hợp đồng lao động theo quy định tại khoản 2 Điều 13 của Bộ luật Lao động.",
          ]),
        ],
      },
    ],
    relations: [{ lawId: "luatlaodong2019", kind: "guides" }],
  },
  {
    id: "luatdansu2015",
    number: "91/2015/QH13",
    name: "Bộ luật Dân sự",
    type: "Luật",
    issuer: "Quốc hội",
    issuedDate: "2015-11-24",
    effectiveDate: "2017-01-01",
    status: "active",
    field: "dansu",
    summary:
      "Luật chung của hệ thống pháp luật điều chỉnh các quan hệ dân sự: địa vị pháp lý của chủ thể, tài sản, giao dịch dân sự, nghĩa vụ và hợp đồng, thừa kế; các nguyên tắc bình đẳng, tự nguyện, thiện chí, trung thực.",
    keywords: ["dân sự", "hợp đồng", "giao dịch dân sự", "thừa kế", "di chúc", "tài sản", "bồi thường thiệt hại", "vay"],
    chapters: [
      {
        id: "c1",
        label: "Phần thứ nhất",
        title: "Quy định chung (trích)",
        articles: [
          A(3, "Các nguyên tắc cơ bản của pháp luật dân sự", [
            "Mọi cá nhân, pháp nhân đều bình đẳng, không được lấy bất kỳ lý do nào để phân biệt đối xử; được pháp luật bảo hộ như nhau về các quyền nhân thân và tài sản.",
            "Cá nhân, pháp nhân xác lập, thực hiện, chấm dứt quyền, nghĩa vụ dân sự của mình trên cơ sở tự do, tự nguyện cam kết, thỏa thuận.",
            "Cá nhân, pháp nhân phải xác lập, thực hiện, chấm dứt quyền, nghĩa vụ dân sự của mình một cách thiện chí, trung thực.",
          ]),
          A(117, "Điều kiện có hiệu lực của giao dịch dân sự", [
            "Giao dịch dân sự có hiệu lực khi có đủ các điều kiện sau đây: chủ thể có năng lực pháp luật dân sự, năng lực hành vi dân sự phù hợp với giao dịch dân sự được xác lập; chủ thể tham gia giao dịch dân sự hoàn toàn tự nguyện; mục đích và nội dung của giao dịch dân sự không vi phạm điều cấm của luật, không trái đạo đức xã hội.",
            "Hình thức của giao dịch dân sự là điều kiện có hiệu lực của giao dịch dân sự trong trường hợp luật có quy định.",
          ]),
          A(119, "Hình thức giao dịch dân sự", [
            "Giao dịch dân sự được thể hiện bằng lời nói, bằng văn bản hoặc bằng hành vi cụ thể. Giao dịch dân sự thông qua phương tiện điện tử dưới hình thức thông điệp dữ liệu theo quy định của pháp luật về giao dịch điện tử được coi là giao dịch bằng văn bản.",
            "Trường hợp luật quy định giao dịch dân sự phải được thể hiện bằng văn bản có công chứng, chứng thực, đăng ký thì phải tuân theo quy định đó.",
          ]),
        ],
      },
      {
        id: "c2",
        label: "Phần thứ ba",
        title: "Nghĩa vụ và hợp đồng (trích)",
        articles: [
          A(385, "Khái niệm hợp đồng", [
            "Hợp đồng là sự thỏa thuận giữa các bên về việc xác lập, thay đổi hoặc chấm dứt quyền, nghĩa vụ dân sự.",
          ]),
          A(401, "Hiệu lực của hợp đồng", [
            "Hợp đồng được giao kết hợp pháp có hiệu lực từ thời điểm giao kết, trừ trường hợp có thỏa thuận khác hoặc luật liên quan có quy định khác.",
            "Từ thời điểm hợp đồng có hiệu lực, các bên phải thực hiện quyền và nghĩa vụ đối với nhau theo cam kết. Hợp đồng chỉ có thể được sửa đổi hoặc chấm dứt theo thỏa thuận của các bên hoặc theo quy định của pháp luật.",
          ]),
        ],
      },
      {
        id: "c3",
        label: "Phần thứ tư",
        title: "Thừa kế (trích)",
        articles: [
          A(609, "Quyền thừa kế", [
            "Cá nhân có quyền lập di chúc để định đoạt tài sản của mình; để lại tài sản của mình cho người thừa kế theo pháp luật; hưởng di sản theo di chúc hoặc theo pháp luật. Người thừa kế không là cá nhân có quyền hưởng di sản theo di chúc.",
          ]),
          A(612, "Di sản", [
            "Di sản bao gồm tài sản riêng của người chết, phần tài sản của người chết trong tài sản chung với người khác.",
          ]),
        ],
      },
    ],
    relations: [
      { lawId: "luathngd2014", kind: "related" },
      { lawId: "luatthuongmai2005", kind: "related" },
      { lawId: "luatbaove2023", kind: "related" },
    ],
  },
  {
    id: "luathinhsu2015",
    number: "100/2015/QH13",
    name: "Bộ luật Hình sự",
    type: "Luật",
    issuer: "Quốc hội",
    issuedDate: "2015-11-27",
    effectiveDate: "2018-01-01",
    status: "active",
    field: "hinhsu",
    summary:
      "Quy định về tội phạm và hình phạt: khái niệm tội phạm, tuổi chịu trách nhiệm hình sự, các hình phạt chính và bổ sung, cùng các tội danh cụ thể. Đã được sửa đổi, bổ sung năm 2017.",
    keywords: ["hình sự", "tội phạm", "hình phạt", "trộm cắp", "giết người", "trách nhiệm hình sự"],
    chapters: [
      {
        id: "c1",
        label: "Phần thứ nhất",
        title: "Những quy định chung (trích)",
        articles: [
          A(8, "Khái niệm tội phạm", [
            "Tội phạm là hành vi nguy hiểm cho xã hội được quy định trong Bộ luật Hình sự, do người có năng lực trách nhiệm hình sự hoặc pháp nhân thương mại thực hiện một cách cố ý hoặc vô ý, xâm phạm độc lập, chủ quyền, thống nhất, toàn vẹn lãnh thổ Tổ quốc, xâm phạm chế độ chính trị, chế độ kinh tế, nền văn hóa, quốc phòng, an ninh, trật tự, an toàn xã hội, quyền, lợi ích hợp pháp của tổ chức, xâm phạm quyền con người, quyền, lợi ích hợp pháp của công dân.",
            "Căn cứ vào tính chất và mức độ nguy hiểm cho xã hội của hành vi phạm tội được quy định trong Bộ luật này, tội phạm được phân thành 04 loại: tội phạm ít nghiêm trọng, tội phạm nghiêm trọng, tội phạm rất nghiêm trọng và tội phạm đặc biệt nghiêm trọng.",
          ]),
          A(12, "Tuổi chịu trách nhiệm hình sự", [
            "Người từ đủ 16 tuổi trở lên phải chịu trách nhiệm hình sự về mọi tội phạm, trừ những tội phạm mà Bộ luật này có quy định khác.",
            "Người từ đủ 14 tuổi đến dưới 16 tuổi phải chịu trách nhiệm hình sự về tội phạm rất nghiêm trọng, tội phạm đặc biệt nghiêm trọng quy định tại một trong các điều 123, 134, 141, 142, 143, 144, 150, 151, 168, 169, 170, 171, 173, 178, 248, 249, 250, 251, 252, 265, 266, 286, 287, 289, 290, 299, 303 và 304 của Bộ luật này.",
          ]),
        ],
      },
      {
        id: "c2",
        label: "Phần thứ hai",
        title: "Các tội phạm (trích)",
        articles: [
          A(123, "Tội giết người", [
            "Người nào giết người thuộc một trong các trường hợp sau đây thì bị phạt tù từ 12 năm đến 20 năm, tù chung thân hoặc tử hình: giết 02 người trở lên; giết người dưới 16 tuổi; giết phụ nữ mà biết là có thai; giết người đang thi hành công vụ hoặc vì lý do công vụ của nạn nhân; thực hiện tội phạm một cách man rợ...",
            "Phạm tội không thuộc các trường hợp quy định tại khoản 1 Điều này thì bị phạt tù từ 07 năm đến 15 năm.",
            "Người chuẩn bị phạm tội này thì bị phạt tù từ 01 năm đến 05 năm.",
          ]),
          A(173, "Tội trộm cắp tài sản", [
            "Người nào trộm cắp tài sản của người khác trị giá từ 2.000.000 đồng đến dưới 50.000.000 đồng hoặc dưới 2.000.000 đồng nhưng thuộc các trường hợp luật định thì bị phạt cải tạo không giam giữ đến 03 năm hoặc phạt tù từ 06 tháng đến 03 năm.",
            "Phạm tội thuộc trường hợp có tổ chức, có tính chất chuyên nghiệp, chiếm đoạt tài sản trị giá từ 50.000.000 đồng đến dưới 200.000.000 đồng... thì bị phạt tù từ 02 năm đến 07 năm.",
          ]),
        ],
      },
    ],
    relations: [
      { lawId: "luatsuađoi2017", kind: "amends" },
      { lawId: "hienphap2013", kind: "related" },
    ],
  },
  {
    id: "luatsuađoi2017",
    number: "12/2017/QH14",
    name: "Luật sửa đổi, bổ sung một số điều của Bộ luật Hình sự số 100/2015/QH13",
    type: "Luật",
    issuer: "Quốc hội",
    issuedDate: "2017-06-20",
    effectiveDate: "2018-01-01",
    status: "active",
    field: "hinhsu",
    summary:
      "Sửa đổi, bổ sung 41 điều của Bộ luật Hình sự 2015, trong đó có quy định về tuổi chịu trách nhiệm hình sự, tội phạm trong lĩnh vực thương mại, an toàn thực phẩm và trách nhiệm hình sự của pháp nhân thương mại.",
    keywords: ["sửa đổi bộ luật hình sự", "pháp nhân thương mại", "tuổi chịu trách nhiệm hình sự"],
    chapters: [
      {
        id: "c1",
        label: "Điều 1",
        title: "Sửa đổi, bổ sung một số điều của Bộ luật Hình sự",
        articles: [
          A(1, "Phạm vi sửa đổi, bổ sung", [
            "Sửa đổi, bổ sung khoản 2 Điều 12 của Bộ luật Hình sự số 100/2015/QH13 về tuổi chịu trách nhiệm hình sự đối với người từ đủ 14 tuổi đến dưới 16 tuổi.",
            "Sửa đổi, bổ sung nội dung liên quan đến trách nhiệm hình sự của pháp nhân thương mại, các tội xâm phạm trật tự quản lý kinh tế, môi trường và an toàn thực phẩm.",
          ]),
        ],
      },
    ],
    relations: [{ lawId: "luathinhsu2015", kind: "amends" }],
  },
  {
    id: "luathngd2014",
    number: "52/2014/QH13",
    name: "Luật Hôn nhân và gia đình",
    type: "Luật",
    issuer: "Quốc hội",
    issuedDate: "2014-06-19",
    effectiveDate: "2015-01-01",
    status: "active",
    field: "hngd",
    summary:
      "Quy định chế độ hôn nhân và gia đình; điều kiện kết hôn, đăng ký kết hôn; quan hệ vợ chồng, tài sản chung – riêng; quyền và nghĩa vụ giữa cha mẹ và con; ly hôn.",
    keywords: ["kết hôn", "ly hôn", "hôn nhân", "gia đình", "tài sản chung", "cấp dưỡng", "nuôi con"],
    chapters: [
      {
        id: "c1",
        label: "Chương II",
        title: "Kết hôn (trích)",
        articles: [
          A(8, "Điều kiện kết hôn", [
            "Nam, nữ kết hôn với nhau phải tuân theo các điều kiện sau đây: nam từ đủ 20 tuổi trở lên, nữ từ đủ 18 tuổi trở lên; việc kết hôn do nam và nữ tự nguyện quyết định; không bị mất năng lực hành vi dân sự; việc kết hôn không thuộc một trong các trường hợp cấm kết hôn theo quy định của Luật này.",
            "Nhà nước không thừa nhận hôn nhân giữa những người cùng giới tính.",
          ]),
          A(9, "Đăng ký kết hôn", [
            "Việc kết hôn phải được đăng ký và do cơ quan nhà nước có thẩm quyền thực hiện theo quy định của Luật này và pháp luật về hộ tịch. Việc kết hôn không được đăng ký theo quy định tại khoản này thì không có giá trị pháp lý.",
            "Vợ chồng đã ly hôn muốn xác lập lại quan hệ vợ chồng thì phải đăng ký kết hôn.",
          ]),
        ],
      },
      {
        id: "c2",
        label: "Chương III",
        title: "Quan hệ giữa vợ và chồng (trích)",
        articles: [
          A(33, "Tài sản chung của vợ chồng", [
            "Tài sản chung của vợ chồng gồm tài sản do vợ, chồng tạo ra, thu nhập do lao động, hoạt động sản xuất, kinh doanh, hoa lợi, lợi tức phát sinh từ tài sản riêng và thu nhập hợp pháp khác trong thời kỳ hôn nhân, trừ trường hợp được quy định tại khoản 1 Điều 40 của Luật này; tài sản mà vợ chồng được thừa kế chung hoặc được tặng cho chung và tài sản khác mà vợ chồng thỏa thuận là tài sản chung.",
            "Trong trường hợp tài sản thuộc sở hữu chung của vợ chồng mà pháp luật quy định phải đăng ký quyền sở hữu, quyền sử dụng thì giấy chứng nhận quyền sở hữu, giấy chứng nhận quyền sử dụng phải ghi tên cả hai vợ chồng, trừ trường hợp vợ chồng có thỏa thuận khác.",
          ]),
          A(51, "Quyền yêu cầu giải quyết ly hôn", [
            "Vợ, chồng hoặc cả hai người có quyền yêu cầu Tòa án giải quyết ly hôn.",
            "Cha, mẹ, người thân thích khác có quyền yêu cầu Tòa án giải quyết ly hôn khi một bên vợ, chồng do bị bệnh tâm thần hoặc mắc bệnh khác mà không thể nhận thức, làm chủ được hành vi của mình, đồng thời là nạn nhân của bạo lực gia đình do chồng, vợ của họ gây ra.",
            "Chồng không có quyền yêu cầu ly hôn trong trường hợp vợ đang có thai, sinh con hoặc đang nuôi con dưới 12 tháng tuổi.",
          ]),
        ],
      },
    ],
    relations: [{ lawId: "luatdansu2015", kind: "related" }],
  },
  {
    id: "luatthuongmai2005",
    number: "36/2005/QH11",
    name: "Luật Thương mại",
    type: "Luật",
    issuer: "Quốc hội",
    issuedDate: "2005-06-14",
    effectiveDate: "2006-01-01",
    status: "active",
    field: "doanhnghiep",
    summary:
      "Điều chỉnh hoạt động thương mại: mua bán hàng hóa, cung ứng dịch vụ, xúc tiến thương mại; hợp đồng mua bán hàng hóa; chế tài trong thương mại và giải quyết tranh chấp thương mại.",
    keywords: ["thương mại", "mua bán hàng hóa", "phạt vi phạm", "chế tài", "hợp đồng thương mại", "8%"],
    chapters: [
      {
        id: "c1",
        label: "Chương I",
        title: "Những quy định chung (trích)",
        articles: [
          A(3, "Giải thích từ ngữ (trích)", [
            "Hoạt động thương mại là hoạt động nhằm mục đích sinh lợi, bao gồm mua bán hàng hóa, cung ứng dịch vụ, đầu tư, xúc tiến thương mại và các hoạt động nhằm mục đích sinh lợi khác.",
            "Mua bán hàng hóa là hoạt động thương mại, theo đó bên bán có nghĩa vụ giao hàng, chuyển quyền sở hữu hàng hóa cho bên mua và nhận thanh toán; bên mua có nghĩa vụ thanh toán cho bên bán, nhận hàng và quyền sở hữu hàng hóa theo thỏa thuận.",
          ]),
          A(24, "Hình thức hợp đồng mua bán hàng hóa", [
            "Hợp đồng mua bán hàng hóa được thể hiện bằng lời nói, bằng văn bản hoặc được xác lập bằng hành vi cụ thể.",
            "Đối với các loại hợp đồng mua bán hàng hóa mà pháp luật quy định phải được lập thành văn bản thì phải tuân theo các quy định đó.",
          ]),
        ],
      },
      {
        id: "c2",
        label: "Chương VII",
        title: "Chế tài trong thương mại (trích)",
        articles: [
          A(292, "Các loại chế tài trong thương mại", [
            "Các loại chế tài trong thương mại bao gồm: buộc thực hiện đúng hợp đồng; phạt vi phạm; buộc bồi thường thiệt hại; tạm ngừng thực hiện hợp đồng; đình chỉ thực hiện hợp đồng; huỷ bỏ hợp đồng; các biện pháp khác do các bên thoả thuận không trái với nguyên tắc cơ bản của pháp luật Việt Nam, điều ước quốc tế mà Cộng hòa xã hội chủ nghĩa Việt Nam là thành viên và tập quán thương mại quốc tế.",
          ]),
          A(301, "Mức phạt vi phạm", [
            "Mức phạt đối với vi phạm nghĩa vụ hợp đồng hoặc tổng mức phạt đối với nhiều vi phạm do các bên thoả thuận trong hợp đồng, nhưng không quá 8% giá trị phần nghĩa vụ hợp đồng bị vi phạm, trừ trường hợp quy định tại Điều 266 của Luật này.",
          ]),
        ],
      },
    ],
    relations: [
      { lawId: "luatdoanhnghiep2020", kind: "related" },
      { lawId: "luatdansu2015", kind: "related" },
    ],
  },
  {
    id: "luatgtđb2008",
    number: "23/2008/QH12",
    name: "Luật Giao thông đường bộ",
    type: "Luật",
    issuer: "Quốc hội",
    issuedDate: "2008-11-13",
    effectiveDate: "2009-07-01",
    expiryDate: "2025-01-01",
    status: "expiring",
    field: "giaothong",
    summary:
      "Quy định về quy tắc giao thông đường bộ, kết cấu hạ tầng, phương tiện và người tham gia giao thông. Được thay thế bởi Luật Đường bộ 2024 và Luật Trật tự, an toàn giao thông đường bộ 2024 từ 01/01/2025.",
    keywords: ["giao thông", "nồng độ cồn", "mũ bảo hiểm", "tốc độ", "bằng lái", "giấy phép lái xe"],
    chapters: [
      {
        id: "c1",
        label: "Chương II",
        title: "Quy tắc giao thông đường bộ (trích)",
        articles: [
          A(8, "Các hành vi bị nghiêm cấm (trích)", [
            "Phá hoại đường, cầu, hầm, bến phà đường bộ, đèn tín hiệu, cọc tiêu, biển báo hiệu, gương cầu, dải phân cách, hệ thống thoát nước và các công trình, thiết bị khác thuộc kết cấu hạ tầng giao thông đường bộ.",
            "Điều khiển phương tiện giao thông đường bộ mà trong cơ thể có chất ma túy; điều khiển xe ô tô, máy kéo, xe máy chuyên dùng trên đường mà trong máu hoặc hơi thở có nồng độ cồn.",
            "Điều khiển xe cơ giới chạy quá tốc độ quy định, giành đường, vượt ẩu; bấm còi, rú ga liên tục trong đô thị và khu đông dân cư.",
          ]),
          A(30, "Người điều khiển, người ngồi trên xe mô tô, xe gắn máy", [
            "Người điều khiển xe mô tô hai bánh, xe gắn máy chỉ được chở một người, trừ những trường hợp sau thì được chở tối đa hai người: chở người bệnh đi cấp cứu; áp giải người có hành vi vi phạm pháp luật; trẻ em dưới 14 tuổi.",
            "Người điều khiển, người ngồi trên xe mô tô hai bánh, xe mô tô ba bánh, xe gắn máy phải đội mũ bảo hiểm có cài quai đúng quy cách.",
          ]),
        ],
      },
    ],
    relations: [{ lawId: "luatđuongbo2024", kind: "replacedBy" }],
  },
  {
    id: "luatđuongbo2024",
    number: "35/2024/QH15",
    name: "Luật Đường bộ",
    type: "Luật",
    issuer: "Quốc hội",
    issuedDate: "2024-06-27",
    effectiveDate: "2025-01-01",
    status: "active",
    field: "giaothong",
    summary:
      "Quy định về quy hoạch, đầu tư, xây dựng, quản lý, vận hành, khai thác, bảo trì và bảo vệ kết cấu hạ tầng đường bộ; thay thế Luật Giao thông đường bộ 2008 từ ngày 01/01/2025.",
    keywords: ["đường bộ", "kết cấu hạ tầng", "quốc lộ", "đường cao tốc", "thu phí"],
    chapters: [
      {
        id: "c1",
        label: "Chương I",
        title: "Quy định chung (trích)",
        articles: [
          A(3, "Giải thích từ ngữ (trích)", [
            "Đường bộ là mạng lưới giao thông đường bộ, bao gồm đường, cầu đường bộ, hầm đường bộ, bến phà đường bộ, đường cứu nạn và các công trình phụ trợ gắn liền với đường bộ.",
            "Hệ thống đường bộ bao gồm quốc lộ, đường tỉnh, đường huyện, đường xã, đường thôn, đường đô thị và đường chuyên dùng.",
          ]),
        ],
      },
    ],
    relations: [{ lawId: "luatgtđb2008", kind: "replaces" }],
  },
  {
    id: "luatbaove2023",
    number: "19/2023/QH15",
    name: "Luật Bảo vệ quyền lợi người tiêu dùng",
    type: "Luật",
    issuer: "Quốc hội",
    issuedDate: "2023-06-20",
    effectiveDate: "2024-07-01",
    status: "active",
    field: "dansu",
    summary:
      "Quy định quyền của người tiêu dùng; trách nhiệm của tổ chức, cá nhân kinh doanh; các giao dịch đặc thù (bán hàng trực tiếp, giao dịch từ xa, thương mại điện tử); giải quyết tranh chấp và bảo vệ quyền lợi người tiêu dùng dễ bị tổn thương.",
    keywords: ["người tiêu dùng", "bảo hành", "đổi trả", "thương mại điện tử", "hàng giả", "quảng cáo sai"],
    chapters: [
      {
        id: "c1",
        label: "Chương I",
        title: "Quy định chung (trích)",
        articles: [
          A(3, "Giải thích từ ngữ (trích)", [
            "Người tiêu dùng là người mua, sử dụng sản phẩm, hàng hóa, dịch vụ cho mục đích tiêu dùng, sinh hoạt của cá nhân, gia đình, cơ quan, tổ chức và không vì mục đích thương mại.",
            "Tổ chức, cá nhân kinh doanh là tổ chức, cá nhân thực hiện liên tục một, một số hoặc tất cả các công đoạn của quá trình đầu tư, sản xuất đến tiêu thụ sản phẩm, hàng hóa hoặc cung cấp dịch vụ trên thị trường nhằm mục đích sinh lợi.",
          ]),
          A(4, "Quyền của người tiêu dùng (trích)", [
            "Được bảo đảm an toàn tính mạng, sức khỏe, danh dự, nhân phẩm, uy tín, tài sản, bảo vệ thông tin và quyền, lợi ích hợp pháp khác khi tham gia giao dịch, sử dụng sản phẩm, hàng hóa, dịch vụ do tổ chức, cá nhân kinh doanh cung cấp.",
            "Được cung cấp hóa đơn, chứng từ, tài liệu liên quan đến giao dịch; yêu cầu tổ chức, cá nhân kinh doanh bồi thường thiệt hại khi sản phẩm, hàng hóa, dịch vụ không đúng tiêu chuẩn, quy chuẩn kỹ thuật, chất lượng, số lượng, tính năng, công dụng, giá cả hoặc nội dung khác mà tổ chức, cá nhân kinh doanh đã đăng ký, công bố, niêm yết, quảng cáo hoặc cam kết.",
            "Được tham gia xây dựng chính sách, pháp luật về bảo vệ quyền lợi người tiêu dùng; khiếu nại, tố cáo, khởi kiện theo quy định của pháp luật.",
          ]),
        ],
      },
    ],
    relations: [
      { lawId: "luatdansu2015", kind: "related" },
      { lawId: "luatthuongmai2005", kind: "related" },
    ],
  },
  {
    id: "nd01_2021",
    number: "01/2021/NĐ-CP",
    name: "Nghị định về đăng ký doanh nghiệp",
    type: "Nghị định",
    issuer: "Chính phủ",
    issuedDate: "2021-01-04",
    effectiveDate: "2021-01-04",
    status: "active",
    field: "doanhnghiep",
    summary:
      "Quy định chi tiết về hồ sơ, trình tự, thủ tục đăng ký doanh nghiệp, đăng ký hộ kinh doanh; cung cấp thông tin và công bố nội dung đăng ký doanh nghiệp theo Luật Doanh nghiệp 2020.",
    keywords: ["đăng ký doanh nghiệp", "hồ sơ", "giấy chứng nhận đăng ký", "hộ kinh doanh", "mã số doanh nghiệp"],
    chapters: [
      {
        id: "c1",
        label: "Chương III",
        title: "Hồ sơ đăng ký doanh nghiệp (trích)",
        articles: [
          A(22, "Hồ sơ đăng ký công ty trách nhiệm hữu hạn hai thành viên trở lên", [
            "Hồ sơ đăng ký doanh nghiệp đối với công ty trách nhiệm hữu hạn hai thành viên trở lên bao gồm: giấy đề nghị đăng ký doanh nghiệp; điều lệ công ty; danh sách thành viên; bản sao các giấy tờ pháp lý của cá nhân, tổ chức là thành viên và người đại diện theo pháp luật.",
          ]),
          A(32, "Thời hạn cấp Giấy chứng nhận đăng ký doanh nghiệp", [
            "Trong thời hạn 03 ngày làm việc kể từ ngày nhận được hồ sơ hợp lệ, Cơ quan đăng ký kinh doanh cấp Giấy chứng nhận đăng ký doanh nghiệp. Trường hợp từ chối phải thông báo bằng văn bản và nêu rõ lý do.",
          ]),
        ],
      },
    ],
    relations: [
      { lawId: "luatdoanhnghiep2020", kind: "guides" },
      { lawId: "tt01_2021", kind: "related" },
    ],
  },
  {
    id: "tt01_2021",
    number: "01/2021/TT-BKHĐT",
    name: "Thông tư hướng dẫn về đăng ký doanh nghiệp",
    type: "Thông tư",
    issuer: "Bộ Kế hoạch và Đầu tư",
    issuedDate: "2021-03-16",
    effectiveDate: "2021-05-01",
    status: "active",
    field: "doanhnghiep",
    summary:
      "Ban hành biểu mẫu sử dụng trong đăng ký doanh nghiệp, đăng ký hộ kinh doanh; hướng dẫn chi tiết về hồ sơ, trình tự, thủ tục đăng ký doanh nghiệp theo Nghị định 01/2021/NĐ-CP.",
    keywords: ["biểu mẫu", "đăng ký doanh nghiệp", "giấy đề nghị", "hướng dẫn nghị định 01"],
    chapters: [
      {
        id: "c1",
        label: "Điều 1",
        title: "Phạm vi điều chỉnh (trích)",
        articles: [
          A(1, "Phạm vi điều chỉnh", [
            "Thông tư này ban hành biểu mẫu sử dụng trong đăng ký doanh nghiệp, đăng ký hộ kinh doanh; hướng dẫn chi tiết về hồ sơ, trình tự, thủ tục đăng ký doanh nghiệp, đăng ký hộ kinh doanh theo quy định tại Nghị định số 01/2021/NĐ-CP.",
          ]),
        ],
      },
    ],
    relations: [{ lawId: "nd01_2021", kind: "guides" }],
  },
  {
    id: "luatdoanhnghiep2014",
    number: "68/2014/QH13",
    name: "Luật Doanh nghiệp",
    type: "Luật",
    issuer: "Quốc hội",
    issuedDate: "2014-11-26",
    effectiveDate: "2015-07-01",
    expiryDate: "2021-01-01",
    status: "expired",
    field: "doanhnghiep",
    summary:
      "Luật Doanh nghiệp năm 2014 — đã hết hiệu lực toàn bộ từ ngày 01/01/2021, được thay thế bởi Luật Doanh nghiệp số 59/2020/QH14. Chỉ còn giá trị tra cứu lịch sử.",
    keywords: ["doanh nghiệp", "thành lập công ty", "vốn điều lệ"],
    chapters: [
      {
        id: "c1",
        label: "Chương I",
        title: "Quy định chung (trích)",
        articles: [
          A(1, "Phạm vi điều chỉnh", [
            "Luật này quy định về việc thành lập, tổ chức quản lý, tổ chức lại, giải thể và hoạt động có liên quan của doanh nghiệp, bao gồm công ty trách nhiệm hữu hạn, công ty cổ phần, công ty hợp danh và doanh nghiệp tư nhân; quy định về nhóm công ty.",
          ]),
          A(18, "Quyền thành lập doanh nghiệp", [
            "Tổ chức, cá nhân có quyền thành lập và quản lý doanh nghiệp tại Việt Nam theo quy định của Luật này, trừ trường hợp quy định tại khoản 2 Điều này.",
          ]),
        ],
      },
    ],
    relations: [{ lawId: "luatdoanhnghiep2020", kind: "replacedBy" }],
  },
];

export const LAW_MAP: Record<string, Law> = Object.fromEntries(LAWS.map((l) => [l.id, l]));

export const countArticles = (law: Law) => law.chapters.reduce((s, c) => s + c.articles.length, 0);

export const allArticles = (law: Law): Article[] => law.chapters.flatMap((c) => c.articles);

export const REL_LABEL: Record<RelKind, { label: string; verb: string; color: string }> = {
  guides: { label: "Văn bản hướng dẫn", verb: "hướng dẫn thi hành", color: "#45c8ff" },
  amends: { label: "Sửa đổi, bổ sung", verb: "sửa đổi, bổ sung", color: "#e5b054" },
  replaces: { label: "Thay thế", verb: "thay thế", color: "#3ad294" },
  replacedBy: { label: "Bị thay thế bởi", verb: "bị thay thế bởi", color: "#f0716b" },
  related: { label: "Liên quan", verb: "liên quan", color: "#6e81a3" },
};

/* ---------------- deterministic graph layout ---------------- */
export interface NodePos {
  x: number;
  y: number;
  z: number;
}

export const NODE_POS: Record<string, NodePos> = (() => {
  const pos: Record<string, NodePos> = {};
  const fieldGroups: Record<string, Law[]> = {};
  LAWS.forEach((l) => {
    (fieldGroups[l.field] ??= []).push(l);
  });
  const fieldIds = FIELDS.map((f) => f.id).filter((id) => fieldGroups[id]);
  // Hiến pháp sits at the centre, elevated, like a keystone
  pos["hienphap2013"] = { x: 0, y: 7, z: 0 };
  const R = 30;
  fieldIds.forEach((fid, fi) => {
    if (fid === "hienphap") return;
    const angle = (fi / Math.max(1, fieldIds.length - 1)) * Math.PI * 2 - Math.PI / 2;
    const cx = Math.cos(angle) * R;
    const cz = Math.sin(angle) * R;
    const members = fieldGroups[fid];
    members.forEach((law, mi) => {
      if (pos[law.id]) return;
      const a = (mi / Math.max(1, members.length)) * Math.PI * 2 + fi;
      const r = members.length === 1 ? 0 : 4.5 + (mi % 2) * 3.4;
      pos[law.id] = {
        x: cx + Math.cos(a) * r,
        y: Math.sin((fi + mi) * 1.7) * 2.6,
        z: cz + Math.sin(a) * r,
      };
    });
  });
  return pos;
})();

export interface Edge {
  a: string;
  b: string;
  kind: RelKind;
}
export const EDGES: Edge[] = LAWS.flatMap((l) => l.relations.map((r) => ({ a: l.id, b: r.lawId, kind: r.kind })));

export const NODE_DEGREE: Record<string, number> = (() => {
  const d: Record<string, number> = {};
  EDGES.forEach((e) => {
    d[e.a] = (d[e.a] ?? 0) + 1;
    d[e.b] = (d[e.b] ?? 0) + 1;
  });
  return d;
})();

export const STATUS_META: Record<DocStatus, { label: string; color: string; bg: string }> = {
  active: { label: "Đang hiệu lực", color: "#3ad294", bg: "rgba(58,210,148,0.12)" },
  expiring: { label: "Sắp hết hiệu lực", color: "#f2b63d", bg: "rgba(242,182,61,0.12)" },
  expired: { label: "Hết hiệu lực", color: "#f0716b", bg: "rgba(240,113,107,0.12)" },
};

export const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};
