import type { Lang } from "@/data/types";
import type { Role } from "@/lib/family";

/**
 * Lời của hình gia phả và danh sách phả ký.
 *
 * Mỗi vai trong gia phả có hai nhãn: nhãn ngắn in trên hình, và câu đầy đủ nói
 * đúng quan hệ pháp lý đứng sau vai đó. Câu đầy đủ là thứ người đọc cần khi dẫn
 * vào hồ sơ, nên nó luôn đi kèm, không để phép so sánh gia phả đứng một mình.
 */

export interface FamilyCopy {
  role: Record<Exclude<Role, "grandchild">, { short: string; full: string }>;
  grandchild: string;
  chartLabel: string;
  focusTag: string;
  legendTitle: string;
  legend: { guides: string; amends: string; replaces: string; expired: string };
  hint: string;
  empty: string;
}

export const family: Record<Lang, FamilyCopy> = {
  vi: {
    role: {
      focus: { short: "Văn bản đang xem", full: "Văn bản đang xem" },
      ancestor: { short: "Đời trước", full: "Đời trước: bị văn bản này thay thế" },
      successor: { short: "Đời sau", full: "Đời sau: thay thế văn bản này" },
      parent: {
        short: "Văn bản cấp trên",
        full: "Văn bản cấp trên: được văn bản này quy định chi tiết",
      },
      amends: { short: "Văn bản được sửa đổi", full: "Văn bản này sửa đổi, bổ sung" },
      amendedBy: { short: "Văn bản sửa đổi", full: "Được sửa đổi, bổ sung bởi" },
      child: {
        short: "Nhánh hướng dẫn",
        full: "Nhánh hướng dẫn: quy định chi tiết, hướng dẫn thi hành văn bản này",
      },
    },
    grandchild: "hướng dẫn tiếp",
    chartLabel: "Gia phả của văn bản",
    focusTag: "ĐANG XEM",
    legendTitle: "Đọc gia phả",
    legend: {
      guides: "Nét liền: quy định chi tiết, hướng dẫn thi hành",
      amends: "Nét đứt: sửa đổi, bổ sung",
      replaces: "Chấm đỏ: thay thế, nối đời trước với đời sau",
      expired: "Khung đứt, chữ nhạt: đã hết hiệu lực",
    },
    hint: "Mũi tên chỉ vào văn bản bị tác động. Bấm vào một văn bản để mở gia phả của chính nó.",
    empty: "Tập dữ liệu chưa ghi nhận quan hệ nào của văn bản này với văn bản khác.",
  },
  en: {
    role: {
      focus: { short: "This instrument", full: "This instrument" },
      ancestor: { short: "Predecessor", full: "Predecessor: replaced by this instrument" },
      successor: { short: "Successor", full: "Successor: replaces this instrument" },
      parent: {
        short: "Parent instrument",
        full: "Parent instrument: detailed or implemented by this one",
      },
      amends: { short: "Amended here", full: "This instrument amends" },
      amendedBy: { short: "Amending instrument", full: "Amended or supplemented by" },
      child: {
        short: "Implementing branch",
        full: "Implementing branch: details or implements this instrument",
      },
    },
    grandchild: "implemented further by",
    chartLabel: "Lineage of the instrument",
    focusTag: "THIS RECORD",
    legendTitle: "Reading the lineage",
    legend: {
      guides: "Solid line: details or implements",
      amends: "Dashed line: amends or supplements",
      replaces: "Red dots: replaces, joining one generation to the next",
      expired: "Dashed frame, faint text: no longer in force",
    },
    hint: "The arrow points at the instrument acted upon. Select an instrument to open its own lineage.",
    empty: "The dataset records no relation between this instrument and any other.",
  },
};

export function getFamilyCopy(lang: Lang): FamilyCopy {
  return family[lang];
}
