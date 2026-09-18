import type { Lang } from "@/data/types";
import type { ActId } from "@/lib/space";

/**
 * Lời của trang mở đầu.
 *
 * Giữ ngoài `dictionary.ts` vì từ điển chính đóng bằng `as const`: ở đó mỗi
 * chuỗi mang kiểu chữ nguyên văn của chính nó, nên một mảng sáu chương sẽ thành
 * hai bộ ba mươi kiểu khác nhau cho hai thứ tiếng và không duyệt được bằng
 * `map`. Khai báo `Record<Lang, PrologueCopy>` ở đây cho ra đúng một kiểu, mà
 * vẫn giữ nguyên điều mà quy ước một-file muốn bảo đảm: thiếu một câu ở bản
 * tiếng Anh là `tsc` dừng lại, và hai bản dịch nằm ngay cạnh nhau khi sửa.
 */

export interface PrologueAct {
  id: ActId;
  /** Nhãn nhỏ phía trên tiêu đề. */
  eyebrow: string;
  /** Tiêu đề tách sẵn thành hai dòng: mỗi dòng là một đơn vị chuyển động riêng. */
  title: [string, string];
  text: string;
  /** Câu chú ở mép khung, nói về chính cách sắp xếp đang hiện trên màn hình. */
  note: string;
  /** Tên ngắn trong thanh điều hướng chương. */
  short: string;
}

export interface PrologueCopy {
  acts: PrologueAct[];
  /** Nhãn của liên kết bỏ qua phần mở đầu. */
  skip: string;
  navLabel: string;
  goToAct: string;
  enterMap: string;
  enterMethod: string;
  restart: string;
  loading: string;
  unavailable: string;
  scrollHint: string;
  /** Ba con số ở chân màn hình đầu, ghép với số đếm lấy thẳng từ tập dữ liệu. */
  statDocs: string;
  statRelations: string;
  statDomains: string;
  spanLabel: string;
  settings: string;
  settingsTitle: string;
  motion: string;
  motionRunning: string;
  motionPaused: string;
  viewpoint: string;
  viewpointNudge: string;
  pointerField: string;
  reduceMotion: string;
  verifiedPrefix: string;
}

export const prologue: Record<Lang, PrologueCopy> = {
  vi: {
    acts: [
      {
        id: "khoi",
        short: "Khối",
        eyebrow: "BẢN ĐỒ KHÔNG GIAN PHÁP LUẬT",
        title: ["Không đọc một văn bản", "tách khỏi hệ thống."],
        text: "Luật đặt nguyên tắc, nghị định quy định chi tiết, thông tư hướng dẫn thi hành, rồi một luật sửa đổi đến và thay đổi cả ba. Mỗi điểm trong khối này là một văn bản đã được tra cứu từng số hiệu, kèm nguồn và ngày tra.",
        note: "Cuộn để đi qua sáu cách sắp xếp cùng một tập văn bản.",
      },
      {
        id: "thu-bac",
        short: "Thứ bậc",
        eyebrow: "THỨ BẬC HIỆU LỰC",
        title: ["Trục đứng", "là hiệu lực pháp lý."],
        text: "Bộ luật, luật và điều ước ở tầng trên cùng; nghị quyết và văn bản hợp nhất ở tầng kế; nghị định và quyết định ở giữa; thông tư dưới cùng. Thứ bậc này quyết định văn bản nào nhường chỗ cho văn bản nào khi hai bên quy định khác nhau.",
        note: "Bốn tầng xếp theo hiệu lực pháp lý, không theo ngày ban hành.",
      },
      {
        id: "linh-vuc",
        short: "Lĩnh vực",
        eyebrow: "TÁM LĨNH VỰC",
        title: ["Cùng một hệ thống,", "tám vùng chuyên môn."],
        text: "Xây dựng, Năng lượng, Hợp đồng thương mại, Tố tụng và Trọng tài, Doanh nghiệp, Đầu tư, Lao động, Thuế. Một văn bản có thể thuộc nhiều lĩnh vực; màu ở đây là lĩnh vực đứng đầu trong bản ghi.",
        note: "Màu lĩnh vực dùng chung với bản đồ hai chiều và trang lĩnh vực.",
      },
      {
        id: "quan-he",
        short: "Quan hệ",
        eyebrow: "QUAN HỆ GIỮA CÁC VĂN BẢN",
        title: ["Ba loại đường nối.", "Không đường nào vẽ thêm."],
        text: "Quy định chi tiết, sửa đổi bổ sung, thay thế. Mỗi đường suy ra từ trường quan hệ của chính bản ghi, nên danh sách quan hệ ở đây luôn khớp với tập dữ liệu và với các cặp trên trang đối chiếu.",
        note: "Văn bản càng bị nhiều văn bản khác dẫn chiếu càng nằm sâu vào tâm.",
      },
      {
        id: "thoi-gian",
        short: "Thời gian",
        eyebrow: "TRỤC THỜI GIAN",
        title: ["Hiệu lực", "là một ngày cụ thể."],
        text: "Trục ngang là năm có hiệu lực, trục đứng vẫn là thứ bậc. Văn bản đã ban hành nhưng chưa tới ngày hiệu lực nằm ở mốc tương lai của nó: kết quả tra cứu chỉ có giá trị tại thời điểm tra.",
        note: "Chưa xác minh được ngày hiệu lực thì bản ghi lấy theo ngày ban hành.",
      },
      {
        id: "nguong",
        short: "Ngưỡng",
        eyebrow: "MỞ BẢN ĐỒ",
        title: ["Bắt đầu từ", "một văn bản bất kỳ."],
        text: "Bản đồ tương tác lọc theo lĩnh vực, bấm vào một điểm để đọc tóm tắt, mở trang chi tiết với đầy đủ nguồn đã tra. Trang đối chiếu đặt hai văn bản của một cặp cạnh nhau.",
        note: "Toàn bộ nội dung bên dưới đọc được mà không cần cảnh ba chiều.",
      },
    ],
    skip: "Bỏ qua phần mở đầu, tới bản đồ",
    navLabel: "Các chương của phần mở đầu",
    goToAct: "Đến chương",
    enterMap: "Mở bản đồ tương tác",
    enterMethod: "Đọc phương pháp",
    restart: "Xem lại từ đầu",
    loading: "Đang dựng không gian ba chiều…",
    unavailable:
      "Cảnh ba chiều không khả dụng trên trình duyệt này. Phần giới thiệu và toàn bộ trang vẫn dùng được đầy đủ.",
    scrollHint: "Cuộn để bắt đầu",
    statDocs: "văn bản",
    statRelations: "quan hệ",
    statDomains: "lĩnh vực",
    spanLabel: "Mốc hiệu lực",
    settings: "Tùy chỉnh",
    settingsTitle: "TÙY CHỈNH TRẢI NGHIỆM",
    motion: "Chuyển động",
    motionRunning: "Đang chạy",
    motionPaused: "Đang dừng",
    viewpoint: "Góc nhìn",
    viewpointNudge: "Xoay một nhịp",
    pointerField: "Con trỏ tác động vào cảnh",
    reduceMotion: "Giảm chuyển động",
    verifiedPrefix: "Dữ liệu tra cứu ngày",
  },
  en: {
    acts: [
      {
        id: "khoi",
        short: "Corpus",
        eyebrow: "VIETNAMESE LEGAL SPACE MAP",
        title: ["No instrument reads", "apart from its system."],
        text: "A law sets the principle, a decree details it, a circular guides its execution — and then an amending law arrives and changes all three. Every point in this body is an instrument whose number was actually looked up, with its sources and the date of the search.",
        note: "Scroll to move through six arrangements of the same set of instruments.",
      },
      {
        id: "thu-bac",
        short: "Hierarchy",
        eyebrow: "HIERARCHY OF LEGAL FORCE",
        title: ["The vertical axis", "is legal force."],
        text: "Codes, laws and treaties occupy the top stratum; resolutions and consolidated texts the next; decrees and decisions the middle; circulars the base. This order decides which instrument yields to which when the two provide differently.",
        note: "Four strata ordered by legal force, not by date of issue.",
      },
      {
        id: "linh-vuc",
        short: "Domains",
        eyebrow: "EIGHT DOMAINS",
        title: ["One system,", "eight fields of practice."],
        text: "Construction, Energy, Commercial Contracts, Litigation and Arbitration, Corporate, Investment, Labour, Tax. An instrument may sit in several domains; the colour here is the first domain named in its record.",
        note: "Domain colours are shared with the two-dimensional map and the domain pages.",
      },
      {
        id: "quan-he",
        short: "Relations",
        eyebrow: "RELATIONS BETWEEN INSTRUMENTS",
        title: ["Three kinds of line.", "Not one of them added."],
        text: "Detailing, amending, replacing. Each line is derived from the relation fields of the record itself, so what is drawn here matches the dataset exactly, and matches the pairs on the comparison pages.",
        note: "The more often an instrument is cited by others, the deeper it sits toward the centre.",
      },
      {
        id: "thoi-gian",
        short: "Time",
        eyebrow: "THE TIME AXIS",
        title: ["Entry into force", "is a specific date."],
        text: "The horizontal axis is the year of entry into force; the vertical axis remains hierarchy. An instrument already issued but not yet in force sits at its future mark: a search of legislation is only good as at the date it was run.",
        note: "Where the date of force could not be verified, the record falls back to the date of issue.",
      },
      {
        id: "nguong",
        short: "Threshold",
        eyebrow: "OPEN THE MAP",
        title: ["Begin from", "any single instrument."],
        text: "The interactive map filters by domain, opens a summary on any point, and leads to a detail page carrying every source that was opened. The comparison pages set the two instruments of a pair side by side.",
        note: "Everything below this point reads without the three-dimensional scene.",
      },
    ],
    skip: "Skip the prologue, go to the map",
    navLabel: "Chapters of the prologue",
    goToAct: "Go to chapter",
    enterMap: "Open the interactive map",
    enterMethod: "Read the method",
    restart: "Start again",
    loading: "Building the three-dimensional space…",
    unavailable:
      "The three-dimensional scene is not available in this browser. The prologue and the rest of the site remain fully usable.",
    scrollHint: "Scroll to begin",
    statDocs: "instruments",
    statRelations: "relations",
    statDomains: "domains",
    spanLabel: "Force from",
    settings: "Settings",
    settingsTitle: "EXPERIENCE SETTINGS",
    motion: "Motion",
    motionRunning: "Running",
    motionPaused: "Paused",
    viewpoint: "Viewpoint",
    viewpointNudge: "Turn one step",
    pointerField: "Pointer affects the scene",
    reduceMotion: "Reduce motion",
    verifiedPrefix: "Dataset searched on",
  },
};

export function getPrologue(lang: Lang): PrologueCopy {
  return prologue[lang];
}
