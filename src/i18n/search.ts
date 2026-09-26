import type { DocStatus, Lang } from "@/data/types";
import type { ValidityState } from "@/lib/validity-segment";

/**
 * Lời của lớp tra cứu: thanh điều hướng, ô tìm kiếm, bảng lệnh và ngày tra cứu.
 *
 * Các ví dụ trong ô tìm kiếm đều là câu tìm cho ra kết quả thật trên tập dữ
 * liệu hiện có: số hiệu có trong kho, điều khoản đã được đọc khi đối chiếu. Thêm
 * một ví dụ thì phải thử nó trước.
 */

export interface SearchCopy {
  nav: {
    lookup: string;
    explore: string;
    compare: string;
    changes: string;
    watch: string;
    method: string;
    search: string;
    primary: string;
  };
  /** Lời giải thích tình trạng, hiện khi rê chuột lên nhãn. */
  statusExplain: Record<DocStatus, string>;
  stateExplain: Record<ValidityState, string>;
  search: {
    label: string;
    placeholder: string;
    examples: string[];
    keys: string;
    loading: string;
    failed: string;
    empty: string;
    emptyHint: string;
    request: string;
    results: (n: number) => string;
    seeAll: string;
    openLineage: string;
    compare: string;
    fullText: string;
    issued: string;
    effective: string;
    now: string;
    replaces: string;
    replacedBy: string;
    amendedBy: string;
    amends: string;
    guides: string;
    guidedBy: (n: number) => string;
    via: string;
    crossCheck: string;
    articles: string;
    recentSearches: string;
    clear: string;
    atDate: (date: string) => string;
    atDateSummary: (inForce: number, total: number) => string;
    atDateAll: string;
    atVerified: (date: string) => string;
    answerTitle: string;
    answerNoReplacer: string;
    answerNoAmender: string;
    answerNoGuide: string;
    answerNoPredecessor: string;
  };
  quick: {
    label: string;
    validity: string;
    validityHint: string;
    lineage: string;
    compare: string;
    asOf: string;
  };
  palette: {
    open: string;
    title: string;
    placeholder: string;
    close: string;
    empty: string;
    groups: {
      docs: string;
      articles: string;
      pages: string;
      domains: string;
      recent: string;
      followed: string;
      actions: string;
    };
    actions: {
      setDate: string;
      clearDate: string;
      theme: string;
      lang: string;
      report: string;
    };
    footer: string;
  };
  asOf: {
    label: string;
    chip: (date: string) => string;
    clear: string;
    clearShort: string;
    hint: string;
    apply: string;
    today: string;
  };
}

const vi: SearchCopy = {
  nav: {
    lookup: "Tra cứu",
    explore: "Khám phá",
    compare: "Đối chiếu",
    changes: "Thay đổi",
    watch: "Theo dõi",
    method: "Phương pháp",
    search: "Tìm văn bản",
    primary: "Điều hướng chính",
  },
  statusExplain: {
    active: "Còn hiệu lực toàn bộ tại ngày tra cứu.",
    amended:
      "Còn hiệu lực, nhưng đã có văn bản sửa đổi, bổ sung hoặc một phần đã hết hiệu lực. Phải đọc cùng văn bản sửa đổi.",
    pending: "Đã được thông qua hoặc ban hành, chưa tới ngày có hiệu lực.",
    expired: "Đã hết hiệu lực toàn bộ tại ngày tra cứu.",
  },
  stateExplain: {
    "in-force": "Đang có hiệu lực tại ngày được chọn.",
    pending: "Tại ngày được chọn, văn bản chưa có hiệu lực.",
    expired: "Tại ngày được chọn, văn bản đã hết hiệu lực.",
    unknown: "Tập dữ liệu không đủ để kết luận cho ngày được chọn.",
  },
  search: {
    label: "Tìm văn bản pháp luật",
    placeholder: "Tìm số hiệu, tên văn bản, điều khoản…",
    examples: [
      "135/2025/QH15",
      "Luật Xây dựng",
      "Nghị định nào thay thế Nghị định 15/2021?",
      "Điều 76 Nghị định 217/2026",
      "Luật nào áp dụng ngày 01/05/2024?",
      "58/2025 còn hiệu lực không?",
      "điện mặt trời mái nhà",
    ],
    keys: "↑↓ chọn · Enter mở · Esc đóng",
    loading: "Đang nạp chỉ mục…",
    failed: "Không nạp được chỉ mục tìm kiếm. Thử lại, hoặc mở danh mục văn bản.",
    empty: "Không có văn bản nào khớp.",
    emptyHint: "Thử số hiệu (ví dụ 58/2025), bỏ bớt từ, hoặc tìm theo lĩnh vực.",
    request: "Yêu cầu bổ sung văn bản này",
    results: (n) => `${n} văn bản`,
    seeAll: "Xem tất cả trong danh mục",
    openLineage: "Xem gia phả",
    compare: "So sánh",
    fullText: "Toàn văn",
    issued: "Ban hành",
    effective: "Hiệu lực",
    now: "nay",
    replaces: "Thay thế",
    replacedBy: "Bị thay thế bởi",
    amendedBy: "Được sửa đổi bởi",
    amends: "Sửa đổi",
    guides: "Hướng dẫn",
    guidedBy: (n) => `${n} văn bản hướng dẫn`,
    via: "Có quan hệ với số hiệu bạn tìm",
    crossCheck: "Cần đối chiếu thêm",
    articles: "Điều khoản đã được đọc",
    recentSearches: "Tìm gần đây",
    clear: "Xóa",
    atDate: (d) => `Tình trạng tại ngày ${d}`,
    atDateSummary: (a, n) => `${a}/${n} kết quả đang có hiệu lực tại ngày này`,
    atDateAll: "Mở danh mục tại ngày này",
    atVerified: (d) => `Tình trạng tại ngày tra cứu ${d}`,
    answerTitle: "Trả lời từ gia phả",
    answerNoReplacer: "Chưa ghi nhận văn bản thay thế.",
    answerNoAmender: "Chưa ghi nhận văn bản sửa đổi.",
    answerNoGuide: "Chưa ghi nhận văn bản hướng dẫn.",
    answerNoPredecessor: "Chưa ghi nhận văn bản đời trước.",
  },
  quick: {
    label: "Lối tắt",
    validity: "Kiểm tra hiệu lực",
    validityHint: "Gõ số hiệu, ví dụ 58/2025",
    lineage: "Xem gia phả",
    compare: "So sánh văn bản",
    asOf: "Luật tại một thời điểm",
  },
  palette: {
    open: "Mở bảng tìm kiếm",
    title: "Tìm và đi nhanh",
    placeholder: "Số hiệu, tên văn bản, điều khoản, trang…",
    close: "Đóng",
    empty: "Không có gì khớp.",
    groups: {
      docs: "Văn bản",
      articles: "Điều khoản",
      pages: "Trang",
      domains: "Lĩnh vực",
      recent: "Vừa xem",
      followed: "Đang theo dõi",
      actions: "Thao tác",
    },
    actions: {
      setDate: "Đặt ngày tra cứu…",
      clearDate: "Bỏ ngày tra cứu",
      theme: "Đổi nền sáng / tối",
      lang: "Chuyển sang tiếng Anh",
      report: "Báo thiếu / sai dữ liệu",
    },
    footer: "↑↓ chọn · Enter mở · Esc đóng · Ctrl K mở lại",
  },
  asOf: {
    label: "Pháp luật tại ngày",
    chip: (d) => `Pháp luật tại ${d}`,
    clear: "Bỏ ngày, trở về ngày tra cứu",
    clearShort: "Bỏ ngày",
    hint: "Mọi tình trạng hiệu lực trong ô tìm, danh mục và gia phả sẽ tính theo ngày này.",
    apply: "Áp dụng",
    today: "Hôm nay",
  },
};

const en: SearchCopy = {
  nav: {
    lookup: "Look up",
    explore: "Explore",
    compare: "Compare",
    changes: "Changes",
    watch: "Watchlist",
    method: "Method",
    search: "Search instruments",
    primary: "Main navigation",
  },
  statusExplain: {
    active: "Wholly in force on the review date.",
    amended:
      "In force, but amended or supplemented, or partly no longer in force. Read it together with the amending instrument.",
    pending: "Passed or issued, but not yet in force.",
    expired: "Wholly no longer in force on the review date.",
  },
  stateExplain: {
    "in-force": "In force on the selected date.",
    pending: "Not yet in force on the selected date.",
    expired: "No longer in force on the selected date.",
    unknown: "The dataset is not enough to answer for the selected date.",
  },
  search: {
    label: "Search Vietnamese legislation",
    placeholder: "Search by number, title or article…",
    examples: [
      "135/2025/QH15",
      "Law on Construction",
      "Which decree replaced Decree 15/2021?",
      "Article 76 Decree 217/2026",
      "Which laws applied on 01/05/2024?",
      "Is 58/2025 still in force?",
      "rooftop solar",
    ],
    keys: "↑↓ select · Enter open · Esc close",
    loading: "Loading the index…",
    failed: "The search index could not be loaded. Try again, or open the document index.",
    empty: "No instrument matches.",
    emptyHint: "Try a number (for example 58/2025), fewer words, or search by domain.",
    request: "Request this instrument",
    results: (n) => `${n} ${n === 1 ? "instrument" : "instruments"}`,
    seeAll: "See all in the index",
    openLineage: "Open lineage",
    compare: "Compare",
    fullText: "Full text",
    issued: "Issued",
    effective: "In force",
    now: "present",
    replaces: "Replaces",
    replacedBy: "Replaced by",
    amendedBy: "Amended by",
    amends: "Amends",
    guides: "Implements",
    guidedBy: (n) => `${n} implementing ${n === 1 ? "instrument" : "instruments"}`,
    via: "Related to the number you searched",
    crossCheck: "Needs checking",
    articles: "Provisions already read",
    recentSearches: "Recent searches",
    clear: "Clear",
    atDate: (d) => `Status on ${d}`,
    atDateSummary: (a, n) => `${a} of ${n} results in force on this date`,
    atDateAll: "Open the index on this date",
    atVerified: (d) => `Status on the review date, ${d}`,
    answerTitle: "Answer from the lineage",
    answerNoReplacer: "No replacing instrument recorded.",
    answerNoAmender: "No amending instrument recorded.",
    answerNoGuide: "No implementing instrument recorded.",
    answerNoPredecessor: "No predecessor recorded.",
  },
  quick: {
    label: "Shortcuts",
    validity: "Check validity",
    validityHint: "Type a number, e.g. 58/2025",
    lineage: "Open a lineage",
    compare: "Compare instruments",
    asOf: "Law on a given date",
  },
  palette: {
    open: "Open search",
    title: "Search and jump",
    placeholder: "Number, title, article, page…",
    close: "Close",
    empty: "Nothing matches.",
    groups: {
      docs: "Instruments",
      articles: "Provisions",
      pages: "Pages",
      domains: "Domains",
      recent: "Recently viewed",
      followed: "Watching",
      actions: "Actions",
    },
    actions: {
      setDate: "Set a lookup date…",
      clearDate: "Clear the lookup date",
      theme: "Switch light / dark",
      lang: "Switch to Vietnamese",
      report: "Report missing or wrong data",
    },
    footer: "↑↓ select · Enter open · Esc close · Ctrl K reopen",
  },
  asOf: {
    label: "Law as of",
    chip: (d) => `Law as of ${d}`,
    clear: "Clear the date, back to the review date",
    clearShort: "Clear",
    hint: "Every validity status in search, the index and the lineage is computed for this date.",
    apply: "Apply",
    today: "Today",
  },
};

export const searchCopy: Record<Lang, SearchCopy> = { vi, en };

export function getSearchCopy(lang: Lang): SearchCopy {
  return searchCopy[lang];
}
