import type { Lang } from "@/data/types";

/**
 * Lời của trang điều khoản và khối điều khoản trên trang văn bản.
 */
export interface ArticleCopy {
  eyebrow: string;
  sectionTitle: string;
  sectionHint: string;
  noText: string;
  readFull: string;
  citeTitle: string;
  citeHint: string;
  copy: string;
  copied: string;
  copyLink: string;
  linkCopied: string;
  usesTitle: (n: number) => string;
  side: { before: string; after: string; both: string };
  thisSide: string;
  openPoint: string;
  crossTitle: string;
  crossHint: string;
  crossEmpty: string;
  backToDoc: string;
  pinNotice: string;
  pinArticle: string;
}

const vi: ArticleCopy = {
  eyebrow: "Điều khoản đã đọc",
  sectionTitle: "Điều khoản đã được đọc",
  sectionHint:
    "Những điều của văn bản này mà phần đối chiếu đã đọc tới. Mỗi điều có trang riêng: trích dẫn, các khoản đã dẫn và điều khoản tương ứng ở văn bản kia.",
  noText:
    "Trang chưa có toàn văn của điều này. Nội dung dưới đây là những chỗ trong tập dữ liệu đã đọc tới điều này, mỗi chỗ kèm câu chữ đã đọc được và căn cứ của nó.",
  readFull: "Đọc toàn văn tại nguồn chính thức:",
  citeTitle: "Trích dẫn",
  citeHint:
    "Mỗi dòng có đường dẫn riêng. Khoản và điểm là những chỗ đã được dẫn trong phần đối chiếu, không phải danh sách đầy đủ của điều.",
  copy: "Sao chép trích dẫn",
  copied: "Đã sao chép",
  copyLink: "Sao chép liên kết",
  linkCopied: "Đã sao chép liên kết",
  usesTitle: (n) => `Được đọc tới trong ${n} điểm đối chiếu`,
  side: { before: "Vế trước", after: "Vế sau", both: "Cả hai vế" },
  thisSide: "điều này nằm ở",
  openPoint: "Mở điểm đối chiếu",
  crossTitle: "Dẫn chiếu chéo",
  crossHint:
    "Điều khoản và văn bản được dẫn cùng điều này trong những điểm đối chiếu trên: chỗ tương ứng của quy định ở văn bản trước hoặc sau, và căn cứ được đọc cùng nó.",
  crossEmpty: "Chưa có điều khoản nào được đặt cạnh điều này.",
  backToDoc: "Về trang văn bản",
  pinNotice: "Đường dẫn này trỏ tới",
  pinArticle: "Mở trang của điều",
};

const en: ArticleCopy = {
  eyebrow: "Provisions read",
  sectionTitle: "Provisions already read",
  sectionHint:
    "The articles of this instrument that the comparisons have read. Each has its own page: the citation, the clauses cited and the corresponding provisions of the other instrument.",
  noText:
    "This page does not yet carry the full text of the article. What follows is every place in the dataset where the article was read, each with the wording read and its basis.",
  readFull: "Read the full text at the official source:",
  citeTitle: "Citation",
  citeHint:
    "Each line has its own link. The clauses and points listed are those cited in the comparisons, not a full breakdown of the article.",
  copy: "Copy citation",
  copied: "Copied",
  copyLink: "Copy link",
  linkCopied: "Link copied",
  usesTitle: (n) => `Read in ${n} comparison ${n === 1 ? "point" : "points"}`,
  side: { before: "Earlier side", after: "Later side", both: "Both sides" },
  thisSide: "this article:",
  openPoint: "Open the comparison point",
  crossTitle: "Cross-references",
  crossHint:
    "Provisions and instruments cited alongside this article in the comparison points above: where the rule sits in the earlier or later instrument, and the bases read together with it.",
  crossEmpty: "No provision has been set beside this article yet.",
  backToDoc: "Back to the instrument",
  pinNotice: "This link points to",
  pinArticle: "Open the article's page",
};

export function getArticleCopy(lang: Lang): ArticleCopy {
  return lang === "vi" ? vi : en;
}
