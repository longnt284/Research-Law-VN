import type { Lang } from "@/data/types";

/**
 * Lời của bảng điều khiển trên trang văn bản: phần đầu trả lời tám câu hỏi,
 * thanh thao tác, dải đời trước / đời sau, khối nguồn và hình gia phả có điều
 * khiển.
 */

export interface DocPanelCopy {
  crumbs: string;
  since: (d: string) => string;
  until: (d: string) => string;
  replacedBy: string;
  atDate: (d: string) => string;
  facts: {
    issued: string;
    effective: string;
    checked: string;
    data: string;
    verified: string;
    crossCheck: string;
  };
  answers: {
    title: string;
    amendedBy: string;
    replaces: string;
    replacedBy: string;
    guidedBy: string;
    guides: string;
    amends: string;
    none: string;
    noAmender: string;
    noPredecessor: string;
    noSuccessor: string;
    noGuide: string;
    guideCount: (n: number) => string;
    seeAll: string;
  };
  strip: {
    label: string;
    previous: string;
    current: string;
    next: string;
    noPrevious: string;
    noNext: string;
    prevAria: (n: string) => string;
    nextAria: (n: string) => string;
  };
  actions: {
    label: string;
    follow: string;
    following: string;
    save: string;
    saveTitle: string;
    newMatter: string;
    create: string;
    noMatters: string;
    compare: string;
    cite: string;
    cited: string;
    share: string;
    shared: string;
    export: string;
    print: string;
    json: string;
    text: string;
    textCopied: string;
    report: string;
  };
  trust: {
    title: string;
    verified: string;
    crossCheck: string;
    source: string;
    noSource: string;
    checked: string;
    checkedTip: (d: string) => string;
    count: (n: number) => string;
    all: string;
    report: string;
  };
  graph: {
    zoomIn: string;
    zoomOut: string;
    fit: string;
    reset: string;
    collapse: (n: number) => string;
    expand: (n: number) => string;
    show: string;
    hide: string;
    drag: string;
    asOf: (d: string) => string;
  };
  timeline: {
    setDate: (d: string) => string;
  };
  missing: {
    successor: string;
    guidance: string;
    report: string;
  };
}

const vi: DocPanelCopy = {
  crumbs: "Đường dẫn",
  since: (d) => `từ ${d}`,
  until: (d) => `từ ${d}`,
  replacedBy: "thay thế bởi",
  atDate: (d) => `Tại ngày ${d}`,
  facts: {
    issued: "Ban hành",
    effective: "Hiệu lực",
    checked: "Kiểm tra dữ liệu",
    data: "Tình trạng dữ liệu",
    verified: "Đã đối chiếu nguồn chính thống",
    crossCheck: "Cần đối chiếu thêm",
  },
  answers: {
    title: "Văn bản này trong gia phả",
    amendedBy: "Được sửa đổi bởi",
    replaces: "Thay thế",
    replacedBy: "Bị thay thế bởi",
    guidedBy: "Được hướng dẫn bởi",
    guides: "Quy định chi tiết văn bản",
    amends: "Sửa đổi, bổ sung",
    none: "Chưa ghi nhận",
    noAmender: "Chưa ghi nhận văn bản sửa đổi.",
    noPredecessor: "Chưa ghi nhận văn bản đời trước.",
    noSuccessor: "Chưa ghi nhận văn bản đời sau.",
    noGuide: "Chưa ghi nhận văn bản hướng dẫn.",
    guideCount: (n) => `${n} văn bản`,
    seeAll: "xem trong gia phả",
  },
  strip: {
    label: "Các đời văn bản",
    previous: "Đời trước",
    current: "Đang xem",
    next: "Đời sau",
    noPrevious: "Chưa ghi nhận văn bản đời trước.",
    noNext: "Chưa ghi nhận văn bản đời sau.",
    prevAria: (n) => `Lùi về đời trước: ${n}`,
    nextAria: (n) => `Tiến tới đời sau: ${n}`,
  },
  actions: {
    label: "Thao tác với văn bản",
    follow: "Theo dõi",
    following: "Đang theo dõi",
    save: "Lưu vào bộ hồ sơ",
    saveTitle: "Bộ hồ sơ",
    newMatter: "Tên bộ hồ sơ mới",
    create: "Tạo",
    noMatters: "Chưa có bộ hồ sơ nào.",
    compare: "So sánh",
    cite: "Sao chép trích dẫn",
    cited: "Đã sao chép trích dẫn ✓",
    share: "Chia sẻ",
    shared: "Đã sao chép liên kết ✓",
    export: "Xuất",
    print: "In hoặc lưu PDF",
    json: "Tải bản ghi (JSON)",
    text: "Sao chép bản tóm tắt",
    textCopied: "Đã sao chép bản tóm tắt ✓",
    report: "Báo lỗi",
  },
  trust: {
    title: "Nguồn và kiểm chứng",
    verified: "Đã kiểm tra nguồn",
    crossCheck: "Cần đối chiếu thêm",
    source: "Nguồn chính",
    noSource: "Chưa có nguồn chính thống cho bản ghi này.",
    checked: "Kiểm tra lần cuối",
    checkedTip: (d) => `Nguồn đã được kiểm tra ngày ${d}`,
    count: (n) => `${n} nguồn đã mở`,
    all: "Xem tất cả nguồn",
    report: "Báo thiếu / sai dữ liệu",
  },
  graph: {
    zoomIn: "Phóng to",
    zoomOut: "Thu nhỏ",
    fit: "Vừa khung",
    reset: "Cỡ thật",
    collapse: (n) => `Thu gọn nhánh hướng dẫn (${n})`,
    expand: (n) => `Mở nhánh hướng dẫn (${n})`,
    show: "Xem hình gia phả",
    hide: "Ẩn hình",
    drag: "Kéo để di chuyển hình. Giữ Ctrl và cuộn để phóng to.",
    asOf: (d) => `Văn bản mờ không có hiệu lực tại ngày ${d}.`,
  },
  timeline: {
    setDate: (d) => `Xem pháp luật tại ngày ${d}`,
  },
  missing: {
    successor: "Chưa ghi nhận văn bản đời sau.",
    guidance: "Chưa ghi nhận văn bản hướng dẫn.",
    report: "Báo thiếu văn bản",
  },
};

const en: DocPanelCopy = {
  crumbs: "Breadcrumb",
  since: (d) => `since ${d}`,
  until: (d) => `since ${d}`,
  replacedBy: "replaced by",
  atDate: (d) => `On ${d}`,
  facts: {
    issued: "Issued",
    effective: "In force",
    checked: "Data checked",
    data: "Data status",
    verified: "Checked against an official source",
    crossCheck: "Needs further checking",
  },
  answers: {
    title: "This instrument in its lineage",
    amendedBy: "Amended by",
    replaces: "Replaces",
    replacedBy: "Replaced by",
    guidedBy: "Implemented by",
    guides: "Details the instrument",
    amends: "Amends",
    none: "None recorded",
    noAmender: "No amending instrument recorded.",
    noPredecessor: "No predecessor recorded.",
    noSuccessor: "No successor recorded.",
    noGuide: "No implementing instrument recorded.",
    guideCount: (n) => `${n} ${n === 1 ? "instrument" : "instruments"}`,
    seeAll: "see the lineage",
  },
  strip: {
    label: "Generations",
    previous: "Predecessor",
    current: "This instrument",
    next: "Successor",
    noPrevious: "No predecessor recorded.",
    noNext: "No successor recorded.",
    prevAria: (n) => `Back to the predecessor: ${n}`,
    nextAria: (n) => `On to the successor: ${n}`,
  },
  actions: {
    label: "Instrument actions",
    follow: "Follow",
    following: "Following",
    save: "Save to a matter",
    saveTitle: "Matters",
    newMatter: "New matter name",
    create: "Create",
    noMatters: "No matters yet.",
    compare: "Compare",
    cite: "Copy citation",
    cited: "Citation copied ✓",
    share: "Share",
    shared: "Link copied ✓",
    export: "Export",
    print: "Print or save as PDF",
    json: "Download record (JSON)",
    text: "Copy a summary",
    textCopied: "Summary copied ✓",
    report: "Report",
  },
  trust: {
    title: "Source and verification",
    verified: "Source checked",
    crossCheck: "Needs further checking",
    source: "Primary source",
    noSource: "No official source for this record yet.",
    checked: "Last checked",
    checkedTip: (d) => `Source checked on ${d}`,
    count: (n) => `${n} ${n === 1 ? "source" : "sources"} opened`,
    all: "See every source",
    report: "Report missing or wrong data",
  },
  graph: {
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
    fit: "Fit",
    reset: "Actual size",
    collapse: (n) => `Collapse implementing branches (${n})`,
    expand: (n) => `Expand implementing branches (${n})`,
    show: "Show the lineage drawing",
    hide: "Hide drawing",
    drag: "Drag to move the drawing. Hold Ctrl and scroll to zoom.",
    asOf: (d) => `Faded instruments were not in force on ${d}.`,
  },
  timeline: {
    setDate: (d) => `Show the law as of ${d}`,
  },
  missing: {
    successor: "No successor recorded.",
    guidance: "No implementing instrument recorded.",
    report: "Report a missing instrument",
  },
};

export const docPanel: Record<Lang, DocPanelCopy> = { vi, en };

export function getDocPanel(lang: Lang): DocPanelCopy {
  return docPanel[lang];
}
