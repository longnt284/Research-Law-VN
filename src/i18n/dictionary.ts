import type { Lang } from "@/data/types";

export const LANGS: Lang[] = ["vi", "en"];

export function isLang(v: string): v is Lang {
  return v === "vi" || v === "en";
}

/**
 * Toàn bộ chuỗi giao diện. Giữ trong một file để khi sửa câu chữ ở bản tiếng
 * Việt thì bản tiếng Anh nằm ngay cạnh, không bị quên.
 */
export const dict = {
  vi: {
    siteName: "Bản đồ Không gian Pháp luật",
    siteTagline: "Tra cứu quan hệ giữa các văn bản quy phạm pháp luật Việt Nam",
    nav: {
      map: "Bản đồ",
      documents: "Văn bản",
      domains: "Lĩnh vực",
      about: "Phương pháp",
    },
    home: {
      eyebrow: "Bản đồ quan hệ · Dữ liệu đã tra cứu từng số hiệu",
      lede: "Một văn bản pháp luật hiếm khi đứng một mình. Luật đặt nguyên tắc, nghị định quy định chi tiết, thông tư hướng dẫn thi hành, rồi một luật sửa đổi khác đến và thay đổi cả ba. Trang này vẽ lại các mối nối đó để người đọc thấy được vị trí của một văn bản trong hệ thống, thay vì đọc nó tách rời.",
      mapHint: "Kéo để di chuyển, cuộn để phóng to, bấm vào một điểm để xem chi tiết.",
      filterDomain: "Lọc theo lĩnh vực",
      filterAll: "Tất cả lĩnh vực",
      legend: "Chú giải",
      legendGuides: "Quy định chi tiết, hướng dẫn thi hành",
      legendAmends: "Sửa đổi, bổ sung",
      legendReplaces: "Thay thế",
      reset: "Về mặc định",
      selectPrompt: "Chưa chọn văn bản nào",
      selectHint: "Bấm vào một điểm trên bản đồ để đọc tóm tắt và mở trang chi tiết.",
      openDetail: "Xem trang chi tiết",
      relatedTitle: "Văn bản liên quan",
      statsDocs: "văn bản",
      statsRelations: "quan hệ",
      statsDomains: "lĩnh vực",
    },
    list: {
      title: "Danh mục văn bản",
      lede: "Toàn bộ văn bản trong tập dữ liệu, xếp theo lĩnh vực và thứ bậc hiệu lực. Ô tìm kiếm nhận cả số hiệu lẫn từ khóa trong tên văn bản.",
      searchLabel: "Tìm theo số hiệu hoặc tên văn bản",
      searchPlaceholder: "Ví dụ: 135/2025 hoặc điện lực",
      empty: "Không có văn bản nào khớp với từ khóa.",
      emptyHint: "Thử tìm bằng số hiệu, hoặc bỏ bớt bộ lọc lĩnh vực.",
      countOne: "văn bản",
      countMany: "văn bản",
      sortBy: "Sắp xếp",
      sortHierarchy: "Theo thứ bậc",
      sortNewest: "Mới hiệu lực trước",
    },
    doc: {
      issuedOn: "Ngày ban hành",
      effectiveOn: "Ngày có hiệu lực",
      status: "Tình trạng hiệu lực",
      domains: "Lĩnh vực",
      type: "Loại văn bản",
      summary: "Nội dung chính",
      note: "Lưu ý về hiệu lực",
      relations: "Quan hệ với văn bản khác",
      sources: "Nguồn đã tra cứu",
      verifiedOn: "Ngày tra cứu",
      unknownDate: "Chưa xác minh được",
      backToList: "Về danh mục",
      viewOnMap: "Xem trên bản đồ",
      relGuidesOut: "Quy định chi tiết cho",
      relGuidesIn: "Được quy định chi tiết bởi",
      relAmendsOut: "Sửa đổi, bổ sung",
      relAmendsIn: "Bị sửa đổi, bổ sung bởi",
      relReplacesOut: "Thay thế",
      relReplacesIn: "Bị thay thế bởi",
      noRelations: "Chưa ghi nhận quan hệ với văn bản nào khác trong tập dữ liệu này.",
    },
    status: {
      active: "Còn hiệu lực",
      amended: "Còn hiệu lực, đã bị sửa đổi",
      pending: "Chưa tới ngày có hiệu lực",
      expired: "Hết hiệu lực",
    },
    type: {
      "bo-luat": "Bộ luật",
      luat: "Luật",
      "nghi-quyet": "Nghị quyết",
      "nghi-dinh": "Nghị định",
      "quyet-dinh": "Quyết định",
      "thong-tu": "Thông tư",
      vbhn: "Văn bản hợp nhất",
      "dieu-uoc": "Điều ước quốc tế",
      "quy-tac": "Quy tắc tố tụng",
    },
    confidence: {
      crossCheckLabel: "Cần đối chiếu thêm",
      crossCheckNote:
        "Số hiệu và nội dung chính của văn bản này đã tra được, nhưng còn ít nhất một chi tiết chưa đối chiếu được với nguồn chính thống. Hãy kiểm tra lại trước khi dùng vào hồ sơ chính thức.",
    },
    about: {
      title: "Phương pháp và giới hạn",
      lede: "Trang này được dựng theo một nguyên tắc duy nhất: không đưa vào bất kỳ số hiệu văn bản nào chưa được tra cứu.",
    },
    footer: {
      disclaimerTitle: "Miễn trừ trách nhiệm",
      disclaimer:
        "Nội dung trên trang phục vụ mục đích tra cứu và tham khảo, không thay thế ý kiến pháp lý cho một vụ việc cụ thể. Trước khi sử dụng trong hồ sơ chính thức, hãy đối chiếu lại với Công báo hoặc cơ quan ban hành.",
      verifiedPrefix: "Dữ liệu tra cứu ngày",
      switchLang: "English",
      switchLangFull: "Chuyển sang tiếng Anh",
    },
    a11y: {
      skipToContent: "Bỏ qua, tới nội dung chính",
      mapLabel: "Bản đồ quan hệ văn bản pháp luật, có thể dùng phím mũi tên để di chuyển",
      closePanel: "Đóng bảng chi tiết",
      toggleTheme: "Đổi nền sáng / tối",
    },
  },
  en: {
    siteName: "Vietnamese Legal Space Map",
    siteTagline: "Tracing how Vietnam's legal instruments connect to one another",
    nav: {
      map: "Map",
      documents: "Documents",
      domains: "Domains",
      about: "Method",
    },
    home: {
      eyebrow: "Relational map · Every number traced to source",
      lede: "A legal instrument rarely stands alone. A law sets the principle, a decree fills in the detail, a circular explains the practice — and then an amending law arrives and changes all three. This site draws those joints, so that an instrument can be read in its place within the system rather than in isolation.",
      mapHint: "Drag to pan, scroll to zoom, click a node to open its summary.",
      filterDomain: "Filter by domain",
      filterAll: "All domains",
      legend: "Legend",
      legendGuides: "Details or implements",
      legendAmends: "Amends or supplements",
      legendReplaces: "Replaces",
      reset: "Reset view",
      selectPrompt: "No instrument selected",
      selectHint: "Click a node on the map to read its summary and open the full record.",
      openDetail: "Open full record",
      relatedTitle: "Related instruments",
      statsDocs: "instruments",
      statsRelations: "relations",
      statsDomains: "domains",
    },
    list: {
      title: "Index of instruments",
      lede: "Every instrument in the dataset, ordered by domain and legal rank. The search box accepts both document numbers and words from the title.",
      searchLabel: "Search by number or title",
      searchPlaceholder: "For example: 135/2025 or electricity",
      empty: "No instrument matches that search.",
      emptyHint: "Try searching by document number, or clear the domain filter.",
      countOne: "instrument",
      countMany: "instruments",
      sortBy: "Order",
      sortHierarchy: "By legal rank",
      sortNewest: "Most recently in force",
    },
    doc: {
      issuedOn: "Date of issue",
      effectiveOn: "In force from",
      status: "Status",
      domains: "Domains",
      type: "Instrument type",
      summary: "Substance",
      note: "Note on effect",
      relations: "Relations to other instruments",
      sources: "Sources consulted",
      verifiedOn: "Date consulted",
      unknownDate: "Not verified",
      backToList: "Back to index",
      viewOnMap: "Show on map",
      relGuidesOut: "Details or implements",
      relGuidesIn: "Detailed or implemented by",
      relAmendsOut: "Amends",
      relAmendsIn: "Amended by",
      relReplacesOut: "Replaces",
      relReplacesIn: "Replaced by",
      noRelations: "No relation to another instrument in this dataset has been recorded.",
    },
    status: {
      active: "In force",
      amended: "In force, as amended",
      pending: "Not yet in force",
      expired: "No longer in force",
    },
    type: {
      "bo-luat": "Code",
      luat: "Law",
      "nghi-quyet": "Resolution",
      "nghi-dinh": "Decree",
      "quyet-dinh": "Decision",
      "thong-tu": "Circular",
      vbhn: "Consolidated text",
      "dieu-uoc": "Treaty",
      "quy-tac": "Institutional rules",
    },
    confidence: {
      crossCheckLabel: "Needs further checking",
      crossCheckNote:
        "The number and substance of this instrument were traced, but at least one detail could not be confirmed against an official source. Verify it before relying on this record in a formal filing.",
    },
    about: {
      title: "Method and limits",
      lede: "This site was built on a single rule: no document number appears here unless it was actually looked up.",
    },
    footer: {
      disclaimerTitle: "Disclaimer",
      disclaimer:
        "This material is for reference only and does not substitute for legal advice on a specific matter. Before relying on it in a formal filing, check the text against the Official Gazette or the issuing authority.",
      verifiedPrefix: "Data consulted on",
      switchLang: "Tiếng Việt",
      switchLangFull: "Switch to Vietnamese",
    },
    a11y: {
      skipToContent: "Skip to main content",
      mapLabel: "Map of relations between legal instruments; arrow keys pan the view",
      closePanel: "Close detail panel",
      toggleTheme: "Switch light / dark",
    },
  },
} as const;

export type Dict = (typeof dict)[Lang];

export function getDict(lang: Lang): Dict {
  return dict[lang];
}

/** Định dạng ngày theo quy ước của từng ngôn ngữ, chấp nhận chuỗi rỗng. */
export function formatDate(iso: string, lang: Lang, fallback: string): string {
  if (!iso) return fallback;
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return fallback;
  return lang === "vi"
    ? `${d}/${m}/${y}`
    : new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      });
}
