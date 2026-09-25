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
    /** Câu khẩu hiệu, đặt làm tiêu đề trang. */
    motto: string;
    lede: string;
    statDocs: string;
    statRelations: string;
    statDomains: string;
    statSpan: string;
    enterFamily: string;
    enterDocs: string;
    pause: string;
    play: string;
  };
  featured: {
    eyebrow: string;
    title: [string, string];
    /** `{number}` được thay bằng số hiệu văn bản của gia phả tiêu biểu. */
    text: string;
    open: string;
  };
  /** Động từ của từng loại quan hệ, đặt giữa hai số hiệu: "A quy định chi tiết B". */
  verb: Record<RelationKind, string>;
  /** Nhãn ngắn in trên đường nối giữa hai thẻ. */
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
    /** `kin`: tên vai trong gia phả; `title`: tên pháp lý của quan hệ. */
    kinds: Record<RelationKind, { kin: string; title: string; text: string }>;
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
      eyebrow: "GIA PHẢ VĂN BẢN PHÁP LUẬT VIỆT NAM",
      motto: "Mỗi văn bản pháp luật đều có một gia phả.",
      lede: "Luật mới thay luật cũ, nghị định quy định chi tiết, thông tư hướng dẫn thi hành, rồi một luật sửa đổi ghi thêm vào đời văn bản ấy. Lex & Lineage chép lại dòng dõi đó cho từng văn bản, như một cuốn gia phả: đời trước, đời sau, các nhánh hướng dẫn và những lần sửa đổi. Mỗi số hiệu đều đã được tra cứu, mỗi quan hệ đều ghi trong chính bản ghi.",
      statDocs: "văn bản",
      statRelations: "quan hệ",
      statDomains: "lĩnh vực",
      statSpan: "mốc hiệu lực",
      enterFamily: "Xem một gia phả",
      enterDocs: "Tra danh mục văn bản",
      pause: "Dừng chuyển động",
      play: "Chạy lại chuyển động",
    },
    featured: {
      eyebrow: "GIA PHẢ TIÊU BIỂU",
      title: ["Một văn bản,", "cả dòng dõi của nó."],
      text: "Đây là gia phả lớn nhất trong tập dữ liệu mà văn bản đứng giữa còn hiệu lực, chọn bằng phép đếm chứ không chọn tay: {number}. Trên hình, đời trước ở bên trái, văn bản sửa đổi và văn bản cấp trên ở bên trên, nhánh hướng dẫn ở bên dưới. Trang của mỗi văn bản đều có gia phả như thế.",
      open: "Mở trang văn bản",
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
      eyebrow: "BA MỐI QUAN HỆ TRONG GIA PHẢ",
      title: ["Ba mối quan hệ.", "Không mối nào vẽ thêm."],
      text: "Mỗi quan hệ được suy ra từ trường quan hệ của chính bản ghi, nên những gì vẽ ở đây luôn khớp với gia phả trên trang từng văn bản, với cây văn bản theo lĩnh vực và với các cặp trên trang đối chiếu. Ba ví dụ dưới đây lấy thẳng từ tập dữ liệu.",
      kinds: {
        guides: {
          kin: "Nhánh hướng dẫn",
          title: "Quy định chi tiết, hướng dẫn thi hành",
          text: "Văn bản cấp dưới cụ thể hóa điều mà văn bản cấp trên giao. Đọc luật mà bỏ qua nghị định hướng dẫn thì thiếu điều kiện, hồ sơ và thời hạn thực tế.",
        },
        amends: {
          kin: "Ghi chú sửa đổi",
          title: "Sửa đổi, bổ sung",
          text: "Văn bản gốc vẫn còn hiệu lực nhưng một số điều đã được viết lại. Nội dung đang áp dụng là văn bản gốc đọc cùng các lần sửa đổi.",
        },
        replaces: {
          kin: "Đời trước, đời sau",
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
      text: "Mỗi cột đếm số văn bản có hiệu lực trong năm đó. Văn bản đã ban hành nhưng chưa tới ngày hiệu lực nằm bên phải vạch tra cứu: kết quả tra cứu văn bản pháp luật chỉ đúng tại thời điểm tra. Danh mục văn bản trả lời cùng câu hỏi cho bất kỳ ngày nào người đọc chọn.",
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
      eyebrow: "THE GENEALOGY OF VIETNAMESE LAW",
      motto: "Every law has a lineage.",
      lede: "A new law replaces the old, a decree supplies the detail, a circular guides its execution, and an amending law writes itself into the record. Lex & Lineage keeps that line of descent for every instrument, the way a family register would: predecessors, successors, implementing branches and amendments. Every number was looked up; every relation sits in the record itself.",
      statDocs: "instruments",
      statRelations: "relations",
      statDomains: "domains",
      statSpan: "years of force",
      enterFamily: "See a lineage",
      enterDocs: "Browse the index",
      pause: "Pause motion",
      play: "Resume motion",
    },
    featured: {
      eyebrow: "A LINEAGE IN FULL",
      title: ["One instrument,", "its whole line of descent."],
      text: "This is the largest lineage in the dataset around an instrument still in force, chosen by count rather than by hand: {number}. In the drawing, predecessors sit to the left, amending and parent instruments above, implementing branches below. Every instrument's own page carries a lineage like this one.",
      open: "Open the instrument",
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
      eyebrow: "THREE TIES IN A LINEAGE",
      title: ["Three kinds of tie.", "Not one of them added."],
      text: "Every relation is derived from the relation fields of the record itself, so what is drawn here always matches the lineage on each instrument's page, the domain trees and the pairs on the comparison pages. The three examples below are taken directly from the dataset.",
      kinds: {
        guides: {
          kin: "Implementing branch",
          title: "Detailing and implementation",
          text: "A lower instrument gives effect to what a higher one delegates. Reading the law without its implementing decree leaves out the conditions, filings and deadlines that apply in practice.",
        },
        amends: {
          kin: "Note of amendment",
          title: "Amendment and supplement",
          text: "The original instrument remains in force, but some of its articles have been rewritten. The text that applies is the original read together with every amendment.",
        },
        replaces: {
          kin: "Predecessor and successor",
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
      text: "Each column counts the instruments that entered into force in that year. An instrument issued but not yet in force sits to the right of the search line: a search of legislation is only good as at the date it was run. The index answers the same question for any date a reader picks.",
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
