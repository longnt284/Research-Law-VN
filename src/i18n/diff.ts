import type { Lang } from "@/data/types";

/** Lời của lớp đối chiếu có điều khiển trên trang cặp văn bản. */
export interface DiffCopy {
  modes: { overview: string; changes: string; all: string };
  modesLabel: string;
  overviewTitle: string;
  overviewNote: string;
  points: (n: number) => string;
  changed: (n: number) => string;
  same: (n: number) => string;
  /** Nhãn đi dưới con số lớn trong phần tổng quan. */
  statLabels: { points: string; changed: string; same: string };
  byKind: string;
  jump: string;
  search: string;
  searchPlaceholder: string;
  noMatch: string;
  showing: (shown: number, total: number) => string;
  prev: string;
  next: string;
  position: (i: number, n: number) => string;
  side: { label: string; both: string; old: string; new: string };
  collapsed: string;
  expand: string;
  copy: string;
  copied: string;
  print: string;
  keys: string;
}

const vi: DiffCopy = {
  modes: { overview: "Tổng quan", changes: "Chỉ điểm thay đổi", all: "Toàn bộ" },
  modesLabel: "Cách xem bản đối chiếu",
  overviewTitle: "Tổng quan bản đối chiếu",
  overviewNote:
    "Số liệu đếm từ các điểm đối chiếu người biên soạn đã viết cho cặp này, không phải từ toàn văn hai văn bản. Một điểm có thể gồm nhiều điều khoản.",
  points: (n) => `${n} điểm đối chiếu`,
  changed: (n) => `${n} điểm có thay đổi`,
  same: (n) => `${n} điểm tương đương`,
  statLabels: { points: "điểm đối chiếu", changed: "điểm có thay đổi", same: "điểm tương đương" },
  byKind: "Theo loại thay đổi",
  jump: "Đi tới điểm",
  search: "Tìm trong bản đối chiếu",
  searchPlaceholder: "Từ khóa, số điều, thời hạn…",
  noMatch: "Không có điểm nào khớp với từ khóa.",
  showing: (s, n) => `${s}/${n} điểm đang hiện`,
  prev: "Điểm trước",
  next: "Điểm sau",
  position: (i, n) => `${i} / ${n}`,
  side: { label: "Vế hiển thị", both: "Cả hai", old: "Cũ", new: "Mới" },
  collapsed: "Nội dung tương đương, đã thu gọn.",
  expand: "Mở",
  copy: "Sao chép bản đối chiếu",
  copied: "Đã sao chép bản đối chiếu ✓",
  print: "In hoặc lưu PDF",
  keys: "Phím J / K: điểm sau / điểm trước",
};

const en: DiffCopy = {
  modes: { overview: "Overview", changes: "Changes only", all: "Everything" },
  modesLabel: "How to view the comparison",
  overviewTitle: "Comparison overview",
  overviewNote:
    "Counts are taken from the comparison points written by the editor for this pair, not from the full text of either instrument. One point may cover several provisions.",
  points: (n) => `${n} comparison ${n === 1 ? "point" : "points"}`,
  changed: (n) => `${n} with a change`,
  same: (n) => `${n} equivalent`,
  statLabels: { points: "comparison points", changed: "with a change", same: "equivalent" },
  byKind: "By kind of change",
  jump: "Go to point",
  search: "Search this comparison",
  searchPlaceholder: "Keyword, article, deadline…",
  noMatch: "No point matches.",
  showing: (s, n) => `${s} of ${n} points shown`,
  prev: "Previous point",
  next: "Next point",
  position: (i, n) => `${i} / ${n}`,
  side: { label: "Side shown", both: "Both", old: "Earlier", new: "Later" },
  collapsed: "Equivalent content, collapsed.",
  expand: "Open",
  copy: "Copy the comparison",
  copied: "Comparison copied ✓",
  print: "Print or save as PDF",
  keys: "Keys J / K: next / previous point",
};

export const diffCopy: Record<Lang, DiffCopy> = { vi, en };

export function getDiffCopy(lang: Lang): DiffCopy {
  return diffCopy[lang];
}
