import type { Lang } from "@/data/types";
import type { SearchKind } from "@/lib/search";

/** Lời của hộp tìm toàn trang. */
export interface SearchCopy {
  open: string;
  label: string;
  placeholder: string;
  close: string;
  kind: Record<SearchKind, string>;
  all: string;
  filter: string;
  loading: string;
  failed: string;
  empty: (q: string) => string;
  hint: string;
  seeAll: (q: string) => string;
  suggestions: string;
  count: (n: number) => string;
}

const vi: SearchCopy = {
  open: "Tìm",
  label: "Tìm văn bản, điều khoản, cặp đối chiếu",
  placeholder: "Số hiệu, tên văn bản, từ khóa hoặc “Điều 38”",
  close: "Đóng",
  kind: {
    doc: "Văn bản",
    article: "Điều khoản",
    pair: "Đối chiếu",
    domain: "Lĩnh vực",
    page: "Trang",
  },
  all: "Tất cả",
  filter: "Lọc kết quả",
  loading: "Đang tải chỉ mục…",
  failed: "Không tải được chỉ mục tìm kiếm. Hãy thử lại, hoặc dùng ô tìm ở trang Danh mục.",
  empty: (q) => `Không có mục nào khớp với “${q}”.`,
  hint: "↑ ↓ để chọn · Enter để mở · Esc để đóng",
  seeAll: (q) => `Tìm “${q}” trong Danh mục, kèm bộ lọc đầy đủ`,
  suggestions: "Đi tới",
  count: (n) => `${n} kết quả`,
};

const en: SearchCopy = {
  open: "Search",
  label: "Search instruments, provisions, comparisons",
  placeholder: "Number, title, keyword or “Article 38”",
  close: "Close",
  kind: {
    doc: "Instrument",
    article: "Provision",
    pair: "Comparison",
    domain: "Domain",
    page: "Page",
  },
  all: "All",
  filter: "Filter results",
  loading: "Loading the index…",
  failed: "The search index could not be loaded. Try again, or use the search box on the index page.",
  empty: (q) => `Nothing matches “${q}”.`,
  hint: "↑ ↓ to move · Enter to open · Esc to close",
  seeAll: (q) => `Search “${q}” in the index, with every filter`,
  suggestions: "Go to",
  count: (n) => `${n} ${n === 1 ? "result" : "results"}`,
};

export function getSearchCopy(lang: Lang): SearchCopy {
  return lang === "vi" ? vi : en;
}
