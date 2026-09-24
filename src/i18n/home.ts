import type { Lang, RelationKind } from "@/data/types";

/**
 * Lời của trang chủ.
 *
 * Giữ ngoài `dictionary.ts` vì cùng lý do với `hub.ts`: từ điển chính đóng bằng
 * `as const`, nên các mảng tên tầng ở đó sẽ thành những kiểu chữ nguyên văn
 * riêng cho mỗi thứ tiếng. `Record<Lang, HomeCopy>` cho ra đúng một kiểu, mà
 * thiếu một câu ở bản tiếng Anh thì `tsc` vẫn dừng lại.
 */

export interface HomeCopy {
  hero: {
    eyebrow: string;
    /** Tiêu đề tách sẵn thành hai dòng. */
    title: [string, string];
    lede: string;
    statDocs: string;
    statRelations: string;
    statDomains: string;
    statSpan: string;
    enterMap: string;
    enterDocs: string;
    /** Câu tóm tắt dải minh họa cho trình đọc màn hình. `{docs}` và `{links}` được thay bằng số đếm. */
    fieldSummary: string;
    legendTitle: string;
    legendHint: string;
    pause: string;
    play: string;
  };
  /** Động từ của từng loại quan hệ, đặt giữa hai số hiệu: "A quy định chi tiết B". */
  verb: Record<RelationKind, string>;
  /** Nhãn ngắn in trên mắt xích. */
  linkLabel: Record<RelationKind, string>;
  hierarchy: {
    eyebrow: string;
    title: [string, string];
    text: string;
    tiers: [string, string, string, string];
    tierNames: [string, string, string, string];
    /** Tên gọn của bốn tầng, cho những chỗ hẹp như tấm bảng lĩnh vực và hình tháp. */
    tierShort: [string, string, string, string];
    high: string;
    low: string;
    note: string;
  };
  relations: {
    eyebrow: string;
    title: [string, string];
    text: string;
    kinds: Record<RelationKind, { title: string; text: string }>;
    count: string;
    direction: string;
  };
  timeline: {
    eyebrow: string;
    title: [string, string];
    text: string;
    before: string;
    verified: string;
    active: string;
    expired: string;
    pending: string;
    undated: string;
    axis: string;
  };
  stamp: { expired: string; amended: string; pending: string };
}

export const home: Record<Lang, HomeCopy> = {
  vi: {
    hero: {
      eyebrow: "BẢN ĐỒ KHÔNG GIAN PHÁP LUẬT",
      title: ["Không đọc một văn bản", "tách khỏi hệ thống."],
      lede: "Luật đặt nguyên tắc, nghị định quy định chi tiết, thông tư hướng dẫn thi hành, rồi một luật sửa đổi xuất hiện và đổi cả ba. Mỗi thẻ chạy bên dưới là một văn bản đã được tra số hiệu, mỗi mắt xích là một quan hệ ghi trong chính bản ghi đó.",
      statDocs: "văn bản",
      statRelations: "quan hệ",
      statDomains: "lĩnh vực",
      statSpan: "mốc hiệu lực",
      enterMap: "Mở bản đồ quan hệ",
      enterDocs: "Tra danh mục văn bản",
      fieldSummary:
        "Dải minh họa gồm {docs} thẻ văn bản nối nhau bằng {links} mắt xích. Mỗi mắt xích là một quan hệ quy định chi tiết, sửa đổi bổ sung hoặc thay thế có trong tập dữ liệu. Danh mục văn bản và bản đồ quan hệ trình bày cùng nội dung này ở dạng đọc được bằng bàn phím.",
      legendTitle: "Đọc mắt xích",
      legendHint: "Văn bản bên phía mũi tên chỉ tới là văn bản bị tác động. Rê chuột vào một thẻ để dừng dải và đọc.",
      pause: "Dừng chuyển động",
      play: "Chạy lại chuyển động",
    },
    verb: {
      guides: "quy định chi tiết",
      amends: "sửa đổi, bổ sung",
      replaces: "thay thế",
    },
    linkLabel: {
      guides: "hướng dẫn",
      amends: "sửa đổi",
      replaces: "thay thế",
    },
    hierarchy: {
      eyebrow: "THỨ BẬC HIỆU LỰC",
      title: ["Văn bản nào đứng trên", "văn bản nào."],
      text: "Khi hai văn bản quy định khác nhau về cùng một vấn đề, câu hỏi đầu tiên là văn bản nào có hiệu lực pháp lý cao hơn. Mỗi ô nhỏ dưới đây là một văn bản của tập dữ liệu, xếp vào đúng tầng của nó và tô theo màu lĩnh vực.",
      tiers: ["Tầng 1", "Tầng 2", "Tầng 3", "Tầng 4"],
      tierNames: [
        "Bộ luật, luật, điều ước quốc tế",
        "Nghị quyết, văn bản hợp nhất",
        "Nghị định, quyết định",
        "Thông tư, quy tắc tố tụng",
      ],
      tierShort: ["Luật, bộ luật", "Nghị quyết", "Nghị định", "Thông tư"],
      high: "Hiệu lực cao hơn",
      low: "Hiệu lực thấp hơn",
      note: "Bốn tầng là phép gộp để trình bày, không thay cho thứ bậc đầy đủ theo Luật Ban hành văn bản quy phạm pháp luật.",
    },
    relations: {
      eyebrow: "QUAN HỆ GIỮA CÁC VĂN BẢN",
      title: ["Ba loại mắt xích.", "Không mắt nào vẽ thêm."],
      text: "Mỗi quan hệ được suy ra từ trường quan hệ của chính bản ghi, nên những gì vẽ ở đây luôn khớp với bản đồ, với trang chi tiết từng văn bản và với các cặp trên trang đối chiếu. Ba ví dụ dưới đây lấy thẳng từ tập dữ liệu.",
      kinds: {
        guides: {
          title: "Quy định chi tiết, hướng dẫn thi hành",
          text: "Văn bản cấp dưới cụ thể hóa điều mà văn bản cấp trên giao. Đọc luật mà bỏ qua nghị định hướng dẫn thì thiếu điều kiện, hồ sơ và thời hạn thực tế.",
        },
        amends: {
          title: "Sửa đổi, bổ sung",
          text: "Văn bản gốc vẫn còn hiệu lực nhưng một số điều đã được viết lại. Nội dung đang áp dụng là văn bản gốc đọc cùng các lần sửa đổi.",
        },
        replaces: {
          title: "Thay thế",
          text: "Văn bản mới chấm dứt hiệu lực của văn bản cũ. Hợp đồng ký trước ngày thay thế có thể vẫn chịu quy định chuyển tiếp của văn bản cũ.",
        },
      },
      count: "quan hệ trong tập dữ liệu",
      direction: "Văn bản bên phải tác động lên văn bản bên trái.",
    },
    timeline: {
      eyebrow: "TRỤC THỜI GIAN",
      title: ["Hiệu lực là", "một ngày cụ thể."],
      text: "Mỗi cột đếm số văn bản có hiệu lực trong năm đó. Văn bản đã ban hành nhưng chưa tới ngày hiệu lực nằm bên phải vạch tra cứu: kết quả tra cứu văn bản pháp luật chỉ đúng tại thời điểm tra.",
      before: "Trước",
      verified: "Ngày tra cứu",
      active: "Còn hiệu lực",
      expired: "Đã hết hiệu lực",
      pending: "Chưa tới ngày hiệu lực",
      undated: "bản ghi chưa xác minh được mốc thời gian nào nên không có mặt trên trục.",
      axis: "Năm có hiệu lực. Bản ghi thiếu ngày hiệu lực lấy theo ngày ban hành.",
    },
    stamp: {
      expired: "Hết hiệu lực",
      amended: "Đã sửa đổi",
      pending: "Chưa hiệu lực",
    },
  },
  en: {
    hero: {
      eyebrow: "VIETNAMESE LEGAL SPACE MAP",
      title: ["No instrument reads", "apart from its system."],
      lede: "A law sets the principle, a decree supplies the detail, a circular guides its execution, and then an amending law arrives and changes all three. Each card running below is an instrument whose number was actually looked up; each link in the chain is a relation recorded in that instrument's own entry.",
      statDocs: "instruments",
      statRelations: "relations",
      statDomains: "domains",
      statSpan: "years of force",
      enterMap: "Open the relation map",
      enterDocs: "Browse the index",
      fieldSummary:
        "The illustration shows {docs} instrument cards joined by {links} chain links. Each link is a detailing, amending or replacing relation recorded in the dataset. The index and the relation map present the same content in a form that can be read with a keyboard.",
      legendTitle: "Reading the chain",
      legendHint: "The instrument the arrow points to is the one acted upon. Hover over a card to hold the strip still.",
      pause: "Pause motion",
      play: "Resume motion",
    },
    verb: {
      guides: "details",
      amends: "amends",
      replaces: "replaces",
    },
    linkLabel: {
      guides: "details",
      amends: "amends",
      replaces: "replaces",
    },
    hierarchy: {
      eyebrow: "HIERARCHY OF LEGAL FORCE",
      title: ["Which instrument", "stands above which."],
      text: "Where two instruments provide differently on the same matter, the first question is which carries the higher legal force. Each small tile below is one instrument in the dataset, placed in its stratum and coloured by domain.",
      tiers: ["Stratum 1", "Stratum 2", "Stratum 3", "Stratum 4"],
      tierNames: [
        "Codes, laws, treaties",
        "Resolutions, consolidated texts",
        "Decrees, decisions",
        "Circulars, procedural rules",
      ],
      tierShort: ["Codes, laws", "Resolutions", "Decrees", "Circulars"],
      high: "Higher force",
      low: "Lower force",
      note: "The four strata are a grouping for display. They do not replace the full hierarchy set by the Law on Promulgation of Legal Documents.",
    },
    relations: {
      eyebrow: "RELATIONS BETWEEN INSTRUMENTS",
      title: ["Three kinds of link.", "Not one of them added."],
      text: "Every relation is derived from the relation fields of the record itself, so what is drawn here always matches the map, each instrument's detail page and the pairs on the comparison pages. The three examples below are taken directly from the dataset.",
      kinds: {
        guides: {
          title: "Detailing and implementation",
          text: "A lower instrument gives effect to what a higher one delegates. Reading the law without its implementing decree leaves out the conditions, filings and deadlines that apply in practice.",
        },
        amends: {
          title: "Amendment and supplement",
          text: "The original instrument remains in force, but some of its articles have been rewritten. The text that applies is the original read together with every amendment.",
        },
        replaces: {
          title: "Replacement",
          text: "The new instrument ends the force of the old one. A contract signed before the replacement date may still fall under the transitional provisions of the old instrument.",
        },
      },
      count: "relations in the dataset",
      direction: "The instrument on the right acts on the instrument on the left.",
    },
    timeline: {
      eyebrow: "THE TIME AXIS",
      title: ["Entry into force", "is a specific date."],
      text: "Each column counts the instruments that entered into force in that year. An instrument issued but not yet in force sits to the right of the search line: a search of legislation is only good as at the date it was run.",
      before: "Before",
      verified: "Search date",
      active: "In force",
      expired: "No longer in force",
      pending: "Not yet in force",
      undated: "records have no verified date at all, so they do not appear on the axis.",
      axis: "Year of entry into force. Where that date is missing, the date of issue is used.",
    },
    stamp: {
      expired: "No longer in force",
      amended: "Amended",
      pending: "Not yet in force",
    },
  },
};

export function getHome(lang: Lang): HomeCopy {
  return home[lang];
}
