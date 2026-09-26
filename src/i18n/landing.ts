import type { Lang } from "@/data/types";
import type { ChangeEventKind } from "@/lib/changes";

/**
 * Lời của các phần sản phẩm: trang chủ theo thứ tự "dùng trước, giải thích
 * sau", trang thay đổi, trang theo dõi, trang góp ý dữ liệu và chân trang.
 *
 * Không có con số nào viết tay ở đây: mọi số đếm do thành phần tính từ tập dữ
 * liệu rồi truyền vào hàm dựng câu.
 */

export interface LandingCopy {
  hero: {
    eyebrow: string;
    promise: string;
    lede: string;
    lineageLabel: string;
    lineageHint: string;
    lineageCaption: (number: string) => string;
  };
  intents: {
    eyebrow: string;
    title: string;
    validity: { title: string; text: string; cta: string };
    lineage: { title: string; text: string; cta: string };
    compare: { title: string; text: string; cta: string; points: (n: number) => string; facts: string };
    asOf: { title: string; text: string; cta: string; label: string };
  };
  changes: {
    eyebrow: string;
    title: string;
    lede: string;
    all: string;
    upcoming: string;
    past: string;
    kinds: Record<ChangeEventKind, string>;
    empty: string;
    pageTitle: string;
    pageLede: string;
    filterAll: string;
    today: string;
    note: string;
  };
  explore: {
    eyebrow: string;
    title: string;
    lede: string;
    docs: string;
    all: string;
  };
  featured: {
    eyebrow: string;
    chains: string;
    chainDocs: (n: number) => string;
    allChains: string;
  };
  coverage: {
    eyebrow: string;
    title: string;
    lede: string;
    docs: string;
    relations: string;
    pairs: string;
    domains: string;
    verified: string;
    crossCheck: string;
    byDomain: string;
    more: string;
    request: string;
  };
  how: { eyebrow: string; title: string; lede: string };
  trust: {
    eyebrow: string;
    title: string;
    lede: string;
    points: { title: string; text: string }[];
    method: string;
    report: string;
  };
  watch: {
    title: string;
    lede: string;
    local: string;
    followedTitle: string;
    followedEmpty: string;
    since: (d: string) => string;
    newSince: (n: number) => string;
    noChange: string;
    unfollow: string;
    recentTitle: string;
    recentEmpty: string;
    clearRecent: string;
    mattersTitle: string;
    mattersLede: string;
    matterName: string;
    matterCreate: string;
    matterEmpty: string;
    matterDocs: (n: number) => string;
    matterDelete: string;
    matterRemove: string;
    loading: string;
  };
  feedback: {
    title: string;
    lede: string;
    report: string;
    request: string;
    kindLabel: string;
    kinds: Record<"status" | "relation" | "amendment" | "guidance" | "source" | "other", string>;
    docLabel: string;
    docPlaceholder: string;
    detailLabel: string;
    detailPlaceholder: string;
    sourceLabel: string;
    sourcePlaceholder: string;
    numberLabel: string;
    titleLabel: string;
    fieldLabel: string;
    reasonLabel: string;
    noteLabel: string;
    optional: string;
    submit: string;
    copy: string;
    copied: string;
    how: string;
    privacy: string;
    subjectReport: string;
    subjectRequest: string;
  };
  footer: {
    product: string;
    data: string;
    legal: string;
    contact: string;
    links: {
      sources: string;
      coverage: string;
      verification: string;
      log: string;
      report: string;
      request: string;
      disclaimer: string;
      privacy: string;
    };
  };
}

const vi: LandingCopy = {
  hero: {
    eyebrow: "Bản đồ dòng đời pháp luật Việt Nam",
    promise: "Tra cứu hiệu lực. Theo dấu sửa đổi. Hiểu toàn bộ dòng đời của pháp luật Việt Nam.",
    lede: "Gõ số hiệu, tên văn bản hoặc một câu hỏi. Kết quả cho biết ngay văn bản còn hiệu lực không, thay thế văn bản nào, bị sửa bởi gì và phải đọc cùng văn bản nào.",
    lineageLabel: "Một dòng đời văn bản có thật trong tập dữ liệu",
    lineageHint: "Rê chuột hoặc chạm vào một văn bản để thấy các quan hệ của nó.",
    lineageCaption: (n) => `Dòng đời quanh ${n}, dựng từ chính quan hệ ghi trong bản ghi.`,
  },
  intents: {
    eyebrow: "Công cụ",
    title: "Bạn muốn làm gì?",
    validity: {
      title: "Kiểm tra hiệu lực",
      text: "Còn hiệu lực, đã sửa đổi, hết hiệu lực hay chưa tới ngày có hiệu lực. Ba văn bản dưới đây là ba tình trạng có thật trong kho.",
      cta: "Tra một số hiệu",
    },
    lineage: {
      title: "Xem gia phả",
      text: "Đời trước, đời sau, văn bản sửa đổi và các nhánh hướng dẫn của một văn bản, trên một hình.",
      cta: "Mở gia phả",
    },
    compare: {
      title: "So sánh phiên bản",
      text: "Đặt văn bản cũ và văn bản mới cạnh nhau: dữ kiện, điểm thay đổi và căn cứ của từng vế.",
      cta: "Mở bản đối chiếu",
      points: (n) => `${n} điểm đối chiếu nội dung`,
      facts: "Đối chiếu dữ kiện",
    },
    asOf: {
      title: "Pháp luật tại một thời điểm",
      text: "Chọn ngày ký hợp đồng, ngày xảy ra vi phạm hay ngày nộp hồ sơ để xem văn bản nào đang có hiệu lực vào ngày đó.",
      cta: "Xem tại ngày này",
      label: "Chọn ngày",
    },
  },
  changes: {
    eyebrow: "Thay đổi gần đây",
    title: "Điều gì vừa đổi trong hệ thống pháp luật",
    lede: "Mốc hiệu lực, sửa đổi và thay thế đọc từ tập dữ liệu, mới nhất trước. Mỗi mục dẫn vào gia phả của văn bản.",
    all: "Xem mọi thay đổi",
    upcoming: "Sắp có hiệu lực",
    past: "Đã diễn ra",
    kinds: {
      issued: "Ban hành",
      effective: "Có hiệu lực",
      amended: "Sửa đổi",
      replaced: "Thay thế",
      expired: "Hết hiệu lực",
      guidance: "Hướng dẫn",
    },
    empty: "Chưa có mốc nào trong khoảng này.",
    pageTitle: "Thay đổi",
    pageLede: "Dòng thời gian của mọi mốc đọc được từ tập dữ liệu: văn bản được ban hành, có hiệu lực, sửa đổi, thay thế hoặc hướng dẫn văn bản khác, và văn bản hết hiệu lực. Chỉ gồm văn bản có trong kho, nên đây là phần đã biết chứ không phải toàn bộ thay đổi của pháp luật Việt Nam.",
    filterAll: "Mọi loại",
    today: "Hôm nay",
    note: "Mốc sửa đổi, thay thế và hướng dẫn lấy theo ngày có hiệu lực của văn bản tác động; thiếu ngày hiệu lực thì lấy ngày ban hành.",
  },
  explore: {
    eyebrow: "Khám phá",
    title: "Theo lĩnh vực",
    lede: "Mỗi lĩnh vực có một cây văn bản riêng: luật ở tầng trên, nghị định ở giữa, thông tư dưới cùng.",
    docs: "văn bản",
    all: "Mọi lĩnh vực",
  },
  featured: {
    eyebrow: "Gia phả tiêu biểu",
    chains: "Chuỗi văn bản đang động",
    chainDocs: (n) => `${n} văn bản`,
    allChains: "Mọi chuỗi văn bản",
  },
  coverage: {
    eyebrow: "Phạm vi dữ liệu",
    title: "Tuyển chọn, kiểm chứng và mở rộng dần.",
    lede: "Lex & Lineage không cố chứa mọi văn bản. Mỗi bản ghi đều đã được tra cứu, và con số dưới đây là toàn bộ kho tại ngày tra cứu gần nhất.",
    docs: "văn bản",
    relations: "quan hệ",
    pairs: "cặp đối chiếu",
    domains: "lĩnh vực",
    verified: "đã đối chiếu nguồn chính thống",
    crossCheck: "cần đối chiếu thêm",
    byDomain: "Số văn bản theo lĩnh vực",
    more: "Xem phạm vi dữ liệu",
    request: "Yêu cầu bổ sung văn bản",
  },
  how: {
    eyebrow: "Cách Lex & Lineage hoạt động",
    title: "Ba điều cần biết để đọc một gia phả",
    lede: "Thứ bậc hiệu lực, ba loại quan hệ và trục thời gian: mọi hình trên trang dùng cùng một quy ước.",
  },
  trust: {
    eyebrow: "Độ tin cậy",
    title: "Dữ liệu pháp lý phải lần ngược được tới nguồn.",
    lede: "Mỗi bản ghi mang nguồn đã mở, ngày tra cứu và mức xác minh. Chỗ chưa chắc được nói ra trên giao diện thay vì được làm tròn.",
    points: [
      {
        title: "Nguồn chính thống trước",
        text: "Cơ sở dữ liệu quốc gia về pháp luật, Công báo và Cổng Thông tin điện tử Chính phủ xếp trên mọi nguồn khác.",
      },
      {
        title: "Không suy đoán quan hệ",
        text: "Mỗi đường nối trong gia phả là một quan hệ ghi trong bản ghi. Dữ liệu không đủ thì trang nói là không xác định được.",
      },
      {
        title: "Cổng chặn khi dựng trang",
        text: "Số hiệu, mốc thời gian, nguồn, quan hệ và từ ngữ đối chiếu phải qua các phép kiểm tự động trước khi trang lên được.",
      },
    ],
    method: "Đọc phương pháp dữ liệu",
    report: "Báo thiếu / sai dữ liệu",
  },
  watch: {
    title: "Theo dõi",
    lede: "Văn bản bạn đang theo dõi, văn bản vừa xem và các bộ hồ sơ. Trang cho biết điều gì đã đổi ở mỗi văn bản kể từ ngày bạn bắt đầu theo dõi.",
    local: "Chưa đăng nhập: mọi thứ ở đây chỉ lưu trong trình duyệt này. Đăng nhập để giữ danh sách theo dõi và bộ hồ sơ trên mọi máy.",
    followedTitle: "Đang theo dõi",
    followedEmpty: "Chưa theo dõi văn bản nào. Bấm “Theo dõi” trên trang một văn bản để thêm vào đây.",
    since: (d) => `Theo dõi từ ${d}`,
    newSince: (n) => `${n} mốc mới kể từ khi theo dõi`,
    noChange: "Chưa có mốc mới kể từ khi theo dõi.",
    unfollow: "Bỏ theo dõi",
    recentTitle: "Vừa xem",
    recentEmpty: "Chưa xem văn bản nào trên trình duyệt này.",
    clearRecent: "Xóa lịch sử xem",
    mattersTitle: "Bộ hồ sơ",
    mattersLede: "Gom văn bản của cùng một vụ việc hay dự án. Thêm văn bản vào bộ hồ sơ từ trang văn bản.",
    matterName: "Tên bộ hồ sơ",
    matterCreate: "Tạo bộ hồ sơ",
    matterEmpty: "Bộ hồ sơ này chưa có văn bản nào.",
    matterDocs: (n) => `${n} văn bản`,
    matterDelete: "Xóa bộ hồ sơ",
    matterRemove: "Bỏ khỏi bộ hồ sơ",
    loading: "Đang nạp dữ liệu…",
  },
  feedback: {
    title: "Góp ý dữ liệu",
    lede: "Dữ liệu pháp lý chỉ tốt bằng lần kiểm tra gần nhất. Nếu thấy một tình trạng hiệu lực sai, một quan hệ còn thiếu hay cần một văn bản chưa có trong kho, hãy báo ở đây.",
    report: "Báo thiếu / sai dữ liệu",
    request: "Yêu cầu bổ sung văn bản",
    kindLabel: "Loại vấn đề",
    kinds: {
      status: "Sai tình trạng hiệu lực",
      relation: "Sai quan hệ giữa hai văn bản",
      amendment: "Thiếu văn bản sửa đổi",
      guidance: "Thiếu văn bản hướng dẫn",
      source: "Sai hoặc hỏng nguồn",
      other: "Khác",
    },
    docLabel: "Văn bản liên quan",
    docPlaceholder: "Số hiệu, ví dụ 58/2025/NĐ-CP",
    detailLabel: "Mô tả",
    detailPlaceholder: "Điều gì sai hoặc thiếu, và đúng ra phải thế nào.",
    sourceLabel: "Nguồn đối chiếu",
    sourcePlaceholder: "Đường dẫn tới Công báo, vbpl.vn hoặc văn bản gốc",
    numberLabel: "Số hiệu",
    titleLabel: "Tên văn bản",
    fieldLabel: "Lĩnh vực",
    reasonLabel: "Vì sao cần văn bản này",
    noteLabel: "Ghi chú",
    optional: "không bắt buộc",
    submit: "Soạn email gửi đi",
    copy: "Sao chép nội dung",
    copied: "Đã sao chép",
    how: "Nút gửi mở ứng dụng email của bạn với nội dung đã điền sẵn, gửi tới địa chỉ liên hệ ở chân trang. Không cần tài khoản. Nếu máy không có ứng dụng email, hãy sao chép nội dung và gửi thủ công.",
    privacy: "Trang không lưu nội dung bạn nhập. Chỉ người nhận email đọc được.",
    subjectReport: "[Lex & Lineage] Báo dữ liệu",
    subjectRequest: "[Lex & Lineage] Yêu cầu bổ sung văn bản",
  },
  footer: {
    product: "Sản phẩm",
    data: "Dữ liệu",
    legal: "Pháp lý",
    contact: "Liên hệ",
    links: {
      sources: "Nguồn dữ liệu",
      coverage: "Phạm vi dữ liệu",
      verification: "Phương pháp xác minh",
      log: "Nhật ký dữ liệu",
      report: "Báo thiếu / sai dữ liệu",
      request: "Yêu cầu bổ sung văn bản",
      disclaimer: "Miễn trừ trách nhiệm",
      privacy: "Quyền riêng tư",
    },
  },
};

const en: LandingCopy = {
  hero: {
    eyebrow: "The map of Vietnamese law",
    promise: "Check validity. Trace amendments. Understand the whole life of Vietnamese law.",
    lede: "Type a number, a title or a question. The results say at once whether the instrument is in force, what it replaced, what amended it and what must be read with it.",
    lineageLabel: "A real line of descent from the dataset",
    lineageHint: "Hover or tap an instrument to see its relations.",
    lineageCaption: (n) => `The lineage around ${n}, drawn from the relations recorded in each entry.`,
  },
  intents: {
    eyebrow: "Tools",
    title: "What do you need to do?",
    validity: {
      title: "Check validity",
      text: "In force, amended, no longer in force or not yet in force. The three instruments below are three real statuses in the dataset.",
      cta: "Look up a number",
    },
    lineage: {
      title: "Open a lineage",
      text: "Predecessors, successors, amending instruments and implementing branches of one instrument, in one drawing.",
      cta: "Open the lineage",
    },
    compare: {
      title: "Compare versions",
      text: "Put the old and new instrument side by side: facts, points of change and the basis for each side.",
      cta: "Open the comparison",
      points: (n) => `${n} content ${n === 1 ? "point" : "points"} compared`,
      facts: "Fact comparison",
    },
    asOf: {
      title: "Law on a given date",
      text: "Pick the date a contract was signed, a breach occurred or a filing was made to see which instruments were in force that day.",
      cta: "Show that date",
      label: "Pick a date",
    },
  },
  changes: {
    eyebrow: "Recent changes",
    title: "What just changed in the legal system",
    lede: "Commencements, amendments and replacements read from the dataset, newest first. Each item leads into the instrument's lineage.",
    all: "See every change",
    upcoming: "Coming into force",
    past: "Already happened",
    kinds: {
      issued: "Issued",
      effective: "In force",
      amended: "Amends",
      replaced: "Replaces",
      expired: "Lapsed",
      guidance: "Implements",
    },
    empty: "No events in this range.",
    pageTitle: "Changes",
    pageLede: "A timeline of every event readable from the dataset: instruments issued, coming into force, amending, replacing or implementing others, and lapsing. It only covers instruments in the dataset, so it is the known part rather than every change in Vietnamese law.",
    filterAll: "All kinds",
    today: "Today",
    note: "Amendment, replacement and implementation events are dated by the acting instrument's commencement; where that is missing, by its date of issue.",
  },
  explore: {
    eyebrow: "Explore",
    title: "By domain",
    lede: "Each domain has its own tree: laws at the top, decrees in the middle, circulars at the bottom.",
    docs: "instruments",
    all: "All domains",
  },
  featured: {
    eyebrow: "A lineage in full",
    chains: "Lineages in motion",
    chainDocs: (n) => `${n} instruments`,
    allChains: "Every lineage",
  },
  coverage: {
    eyebrow: "Data coverage",
    title: "Curated, verified and continuously expanded.",
    lede: "Lex & Lineage does not try to hold every instrument. Every record was looked up, and the figures below are the whole dataset as at the latest review.",
    docs: "instruments",
    relations: "relations",
    pairs: "comparison pairs",
    domains: "domains",
    verified: "checked against an official source",
    crossCheck: "need further checking",
    byDomain: "Instruments by domain",
    more: "See data coverage",
    request: "Request an instrument",
  },
  how: {
    eyebrow: "How Lex & Lineage works",
    title: "Three things to know before reading a lineage",
    lede: "The hierarchy of force, three kinds of tie and the time axis: every drawing on the site uses the same conventions.",
  },
  trust: {
    eyebrow: "Reliability",
    title: "Legal data must be traceable to its source.",
    lede: "Every record carries the sources opened, the review date and a confidence flag. What is uncertain is said on screen rather than rounded off.",
    points: [
      {
        title: "Official sources first",
        text: "The National Legal Database, the Official Gazette and the Government portal rank above every other source.",
      },
      {
        title: "No inferred relations",
        text: "Every line in a lineage is a relation recorded in an entry. Where the data is not enough, the site says it cannot be determined.",
      },
      {
        title: "Gates at build time",
        text: "Numbers, dates, sources, relations and the wording of comparisons pass automatic checks before a page can be published.",
      },
    ],
    method: "Read the data method",
    report: "Report missing or wrong data",
  },
  watch: {
    title: "Watchlist",
    lede: "Instruments you follow, instruments you recently opened and your matters. The page says what has changed for each instrument since you started following it.",
    local: "Not signed in: everything here is stored in this browser only. Sign in to keep your watchlist and matters on every device.",
    followedTitle: "Following",
    followedEmpty: "You are not following any instrument. Select “Follow” on an instrument's page to add it here.",
    since: (d) => `Following since ${d}`,
    newSince: (n) => `${n} new ${n === 1 ? "event" : "events"} since you started following`,
    noChange: "No new events since you started following.",
    unfollow: "Unfollow",
    recentTitle: "Recently viewed",
    recentEmpty: "No instrument viewed in this browser yet.",
    clearRecent: "Clear history",
    mattersTitle: "Matters",
    mattersLede: "Group the instruments of one matter or project. Add instruments to a matter from the instrument's page.",
    matterName: "Matter name",
    matterCreate: "Create matter",
    matterEmpty: "This matter has no instruments yet.",
    matterDocs: (n) => `${n} ${n === 1 ? "instrument" : "instruments"}`,
    matterDelete: "Delete matter",
    matterRemove: "Remove from matter",
    loading: "Loading…",
  },
  feedback: {
    title: "Data feedback",
    lede: "Legal data is only as good as its latest check. If a status looks wrong, a relation is missing, or you need an instrument not yet in the dataset, report it here.",
    report: "Report missing or wrong data",
    request: "Request an instrument",
    kindLabel: "Kind of issue",
    kinds: {
      status: "Wrong validity status",
      relation: "Wrong relation between two instruments",
      amendment: "Missing amending instrument",
      guidance: "Missing implementing instrument",
      source: "Wrong or broken source",
      other: "Other",
    },
    docLabel: "Instrument concerned",
    docPlaceholder: "Number, e.g. 58/2025/NĐ-CP",
    detailLabel: "Description",
    detailPlaceholder: "What is wrong or missing, and what it should be.",
    sourceLabel: "Source to check against",
    sourcePlaceholder: "Link to the Gazette, vbpl.vn or the original text",
    numberLabel: "Number",
    titleLabel: "Title",
    fieldLabel: "Domain",
    reasonLabel: "Why you need it",
    noteLabel: "Note",
    optional: "optional",
    submit: "Compose the email",
    copy: "Copy the text",
    copied: "Copied",
    how: "The button opens your email app with the text filled in, addressed to the contact in the footer. No account is needed. If your device has no email app, copy the text and send it yourself.",
    privacy: "The site does not store what you type. Only the recipient of the email reads it.",
    subjectReport: "[Lex & Lineage] Data report",
    subjectRequest: "[Lex & Lineage] Instrument request",
  },
  footer: {
    product: "Product",
    data: "Data",
    legal: "Legal",
    contact: "Contact",
    links: {
      sources: "Data sources",
      coverage: "Data coverage",
      verification: "Verification method",
      log: "Data log",
      report: "Report missing or wrong data",
      request: "Request an instrument",
      disclaimer: "Disclaimer",
      privacy: "Privacy",
    },
  },
};

export const landing: Record<Lang, LandingCopy> = { vi, en };

export function getLanding(lang: Lang): LandingCopy {
  return landing[lang];
}
