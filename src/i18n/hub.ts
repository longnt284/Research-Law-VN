import type { Lang } from "@/data/types";

/**
 * Lời của khối lối vào ở trang chủ.
 *
 * Cùng lý do với `home.ts`: từ điển chính đóng bằng `as const`, nên một
 * mảng năm thẻ ở đó sẽ thành năm kiểu chữ nguyên văn khác nhau cho mỗi thứ
 * tiếng và không duyệt được bằng `map`. Khai báo `Record<Lang, HubCopy>` cho ra
 * đúng một kiểu, mà thiếu một câu ở bản tiếng Anh thì `tsc` vẫn dừng lại.
 */

/** Khoá thẻ. Trang chủ tra đường dẫn, số đếm và hình thu nhỏ theo khoá này. */
export type HubCardKey = "ban-do" | "linh-vuc" | "van-ban" | "doi-chieu" | "phuong-phap";

export interface HubCard {
  key: HubCardKey;
  title: string;
  text: string;
  /** Đơn vị đứng sau con số lấy thẳng từ tập dữ liệu. */
  meta: string;
  cta: string;
}

export interface HubCopy {
  eyebrow: string;
  title: string;
  lede: string;
  cards: HubCard[];
  statDocs: string;
  statRelations: string;
  statDomains: string;
  statPairs: string;
  spanLabel: string;
  verifiedPrefix: string;
}

export const hub: Record<Lang, HubCopy> = {
  vi: {
    eyebrow: "LỐI VÀO",
    title: "Năm cách đi vào cùng một tập dữ liệu",
    lede: "Ba khối ở trên cho thấy tập văn bản được sắp xếp thế nào. Bên dưới là năm công cụ cùng đọc tập văn bản ấy, mỗi công cụ trả lời một câu hỏi khác nhau. Mọi con số trên các thẻ được đếm thẳng từ tập dữ liệu, không nhập tay.",
    cards: [
      {
        key: "ban-do",
        title: "Bản đồ tương tác",
        text: "Toàn bộ văn bản và quan hệ trên một mặt phẳng kéo thả được. Lọc theo lĩnh vực, bấm vào một điểm để đọc tóm tắt rồi mở trang chi tiết.",
        meta: "quan hệ đã vẽ",
        cta: "Mở bản đồ",
      },
      {
        key: "linh-vuc",
        title: "Cây văn bản theo lĩnh vực",
        text: "Mỗi lĩnh vực có một cây văn bản riêng: luật ở tầng trên, nghị định ở giữa, thông tư dưới cùng, và từng mắt xích quan hệ nối chúng với nhau. Bấm vào một văn bản để mở trang chi tiết.",
        meta: "lĩnh vực",
        cta: "Xem các lĩnh vực",
      },
      {
        key: "van-ban",
        title: "Danh mục văn bản",
        text: "Danh sách đầy đủ, tìm được bằng số hiệu, từ khóa trong tên hoặc số điều. Chọn một ngày để xem văn bản nào đang có hiệu lực tại ngày đó; mỗi bản ghi mở ra trang chi tiết kèm nguồn đã tra và ngày tra.",
        meta: "văn bản",
        cta: "Mở danh mục",
      },
      {
        key: "doi-chieu",
        title: "Đối chiếu văn bản",
        text: "Hai văn bản của một cặp thay thế hoặc sửa đổi đặt cạnh nhau: bảng dữ kiện, các câu suy ra từ dữ liệu, và phép so sánh câu chữ ngay trên trình duyệt.",
        meta: "cặp đối chiếu",
        cta: "Mở trang đối chiếu",
      },
      {
        key: "phuong-phap",
        title: "Phương pháp và giới hạn",
        text: "Cách tập dữ liệu được lập, điều gì đã được xác minh, điều gì chưa, và những gì trang này cố ý không làm.",
        meta: "ngày tra cứu",
        cta: "Đọc phương pháp",
      },
    ],
    statDocs: "văn bản",
    statRelations: "quan hệ",
    statDomains: "lĩnh vực",
    statPairs: "cặp đối chiếu",
    spanLabel: "Mốc hiệu lực",
    verifiedPrefix: "Dữ liệu tra cứu ngày",
  },
  en: {
    eyebrow: "WAYS IN",
    title: "Five ways into the same body of instruments",
    lede: "The three blocks above show how the instruments are arranged. Below are five tools that read the same instruments, each answering a different question. Every figure on these cards is counted straight from the dataset, never typed in by hand.",
    cards: [
      {
        key: "ban-do",
        title: "Interactive map",
        text: "Every instrument and relation on one pannable plane. Filter by domain, open a summary on any point, then go through to its detail page.",
        meta: "relations drawn",
        cta: "Open the map",
      },
      {
        key: "linh-vuc",
        title: "Instrument trees by domain",
        text: "Each domain has its own tree of instruments: laws on the top tier, decrees in the middle, circulars at the base, and every relation drawn as a link between them. Select an instrument to open its detail page.",
        meta: "domains",
        cta: "See the domains",
      },
      {
        key: "van-ban",
        title: "Index of instruments",
        text: "The full list, searchable by number, by words in the title or by article. Pick a date to see which instruments were in force that day; every record opens a detail page carrying the sources consulted and the date of the search.",
        meta: "instruments",
        cta: "Open the index",
      },
      {
        key: "doi-chieu",
        title: "Instrument comparison",
        text: "The two instruments of a replacing or amending pair, side by side: a table of facts, the notes derived from them, and a word-level comparison that runs in the browser.",
        meta: "pairs",
        cta: "Open the comparison",
      },
      {
        key: "phuong-phap",
        title: "Method and limits",
        text: "How the dataset was built, what was verified and what was not, and what this site deliberately does not do.",
        meta: "date searched",
        cta: "Read the method",
      },
    ],
    statDocs: "instruments",
    statRelations: "relations",
    statDomains: "domains",
    statPairs: "pairs",
    spanLabel: "Force from",
    verifiedPrefix: "Dataset searched on",
  },
};

export function getHub(lang: Lang): HubCopy {
  return hub[lang];
}
