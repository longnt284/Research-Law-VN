import type { Bilingual } from "@/data/types";

/**
 * Phân loại nguồn đã tra của một văn bản.
 *
 * Người đọc trang này là pháp chế doanh nghiệp và luật sư. Với họ, câu hỏi về
 * một đường dẫn không phải "trang nào" mà là "có viện dẫn được không": bản trên
 * Công báo và bản trên một cơ sở dữ liệu tư nhân có thể cùng chữ, nhưng chỉ bản
 * thứ nhất đưa được vào hồ sơ. Vì vậy mỗi nguồn được gắn một loại, và loại suy ra
 * từ chính địa chỉ chứ không ghi tay trong bản ghi, để thêm văn bản mới không
 * phải nhớ thêm một trường.
 */

export type SourceKind =
  /** Trang của cơ quan nhà nước hoặc cơ quan Đảng: tên miền .gov.vn, chinhphu.vn, vbpl.vn… */
  | "official"
  /** Trang của chính tổ chức ban hành một văn bản không phải văn bản nhà nước, như quy tắc trọng tài. */
  | "issuer"
  /** Trang văn bản trên một cơ sở dữ liệu pháp luật không phải của nhà nước. */
  | "database"
  /** Bài viết, tin tức, phân tích: dùng để lần ra văn bản, không thay được văn bản. */
  | "reference";

export interface SourceInfo {
  url: string;
  /** Tên miền, bỏ tiền tố `www.`. Luôn hiển thị, kể cả khi đã có tên trang. */
  host: string;
  /** Tên dễ đọc của trang nguồn; trang chưa có trong bảng thì trùng với `host`. */
  name: Bilingual;
  kind: SourceKind;
  /**
   * Thứ tự ưu tiên khi chọn nguồn cho nút "Đọc toàn văn": số nhỏ đứng trước.
   * `null` nghĩa là trang không chứa toàn văn, hoặc không rõ có chứa hay không,
   * nên không được đưa lên nút.
   */
  fullTextRank: number | null;
}

/**
 * Tên của các trang nguồn hay gặp. Chỉ ghi tên đã chắc chắn; tên miền không có
 * ở đây vẫn hiển thị bằng chính tên miền, không đoán tên cơ quan quản lý.
 */
const SITE_NAMES: Record<string, Bilingual> = {
  "vbpl.vn": {
    vi: "Cơ sở dữ liệu quốc gia về pháp luật",
    en: "National Legal Database",
  },
  "congbao.chinhphu.vn": { vi: "Công báo", en: "Official Gazette" },
  "vanban.chinhphu.vn": {
    vi: "Cổng TTĐT Chính phủ · Hệ thống văn bản",
    en: "Government portal · Legal documents",
  },
  "chinhphu.vn": { vi: "Cổng Thông tin điện tử Chính phủ", en: "Government portal" },
  "xaydungchinhsach.chinhphu.vn": {
    vi: "Cổng TTĐT Chính phủ · Xây dựng chính sách",
    en: "Government portal · Policy making",
  },
  "baochinhphu.vn": { vi: "Báo Điện tử Chính phủ", en: "Government online newspaper" },
  "quochoi.vn": { vi: "Cổng Thông tin điện tử Quốc hội", en: "National Assembly portal" },
  "tulieuvankien.dangcongsan.vn": {
    vi: "Báo điện tử Đảng Cộng sản Việt Nam · Tư liệu văn kiện",
    en: "Communist Party of Vietnam online · Document archive",
  },
  "dangkykinhdoanh.gov.vn": {
    vi: "Cổng thông tin quốc gia về đăng ký doanh nghiệp",
    en: "National business registration portal",
  },
  "moit.gov.vn": { vi: "Bộ Công Thương", en: "Ministry of Industry and Trade" },
  "thuvienphapluat.vn": { vi: "Thư Viện Pháp Luật", en: "Thu Vien Phap Luat" },
  "luatvietnam.vn": { vi: "LuatVietnam", en: "LuatVietnam" },
  "english.luatvietnam.vn": { vi: "LuatVietnam (bản tiếng Anh)", en: "LuatVietnam (English)" },
  "viac.vn": {
    vi: "Trung tâm Trọng tài Quốc tế Việt Nam (VIAC)",
    en: "Vietnam International Arbitration Centre (VIAC)",
  },
  "iccwbo.org": {
    vi: "Phòng Thương mại Quốc tế (ICC)",
    en: "International Chamber of Commerce (ICC)",
  },
};

/** Tổ chức tự ban hành quy tắc của mình; trang của họ là bản gốc của quy tắc đó. */
const ISSUER_HOSTS = new Set(["viac.vn", "iccwbo.org"]);

function isOfficialHost(host: string): boolean {
  return (
    host === "vbpl.vn" ||
    host === "quochoi.vn" ||
    host === "baochinhphu.vn" ||
    host === "chinhphu.vn" ||
    host.endsWith(".chinhphu.vn") ||
    host.endsWith(".gov.vn") ||
    host.endsWith(".dangcongsan.vn")
  );
}

/**
 * Trang nguồn chính thống có chứa toàn văn hay không, và đứng thứ mấy.
 *
 * Nhận diện theo dạng đường dẫn của từng cổng: cùng một tên miền có cả trang
 * văn bản lẫn trang tin, và trang tin không được đưa lên nút "Đọc toàn văn".
 */
function officialFullTextRank(u: URL, host: string): number | null {
  if (host === "vbpl.vn" && u.pathname.startsWith("/van-ban/chi-tiet/")) return 0;
  if (host === "congbao.chinhphu.vn" && u.pathname.startsWith("/van-ban/")) return 1;
  if ((host === "vanban.chinhphu.vn" || host === "chinhphu.vn") && u.searchParams.has("docid")) {
    return 2;
  }
  if (host === "xaydungchinhsach.chinhphu.vn" && u.pathname.startsWith("/toan-van-")) return 3;
  if (host === "dangkykinhdoanh.gov.vn" && /ChiTietVanBan/i.test(u.pathname)) return 3;
  if (host === "tulieuvankien.dangcongsan.vn" && u.pathname.startsWith("/he-thong-van-ban/")) {
    return 3;
  }
  return null;
}

/** Trang văn bản trên cơ sở dữ liệu pháp luật, phân biệt với bài viết cùng tên miền. */
function isDatabaseDocument(u: URL, host: string): boolean {
  if (host === "thuvienphapluat.vn") return u.pathname.startsWith("/van-ban/");
  if (host === "luatvietnam.vn") return /-d\d+\.html$/.test(u.pathname);
  if (host === "english.luatvietnam.vn") return /-doc\d+\.html$/.test(u.pathname);
  if (host === "luatminhkhue.vn") return u.pathname.startsWith("/van-ban/");
  if (host === "vcci.com.vn") return u.pathname.startsWith("/legal-document/");
  if (host === "wipo.int") return u.pathname.startsWith("/wipolex/");
  return false;
}

export function describeSource(url: string): SourceInfo {
  const u = new URL(url);
  const host = u.hostname.replace(/^www\./, "");
  const name = SITE_NAMES[host] ?? { vi: host, en: host };

  if (isOfficialHost(host)) {
    return { url, host, name, kind: "official", fullTextRank: officialFullTextRank(u, host) };
  }
  if (ISSUER_HOSTS.has(host)) {
    return { url, host, name, kind: "issuer", fullTextRank: 10 };
  }
  if (isDatabaseDocument(u, host)) {
    return { url, host, name, kind: "database", fullTextRank: 20 };
  }
  return { url, host, name, kind: "reference", fullTextRank: null };
}

const KIND_ORDER: Record<SourceKind, number> = {
  official: 0,
  issuer: 1,
  database: 2,
  reference: 3,
};

/**
 * Nguồn của một văn bản, xếp theo mức viện dẫn được: chính thống trước, bài
 * viết sau. Trong cùng một loại, trang có toàn văn đứng trước; còn lại giữ thứ
 * tự ghi trong bản ghi.
 */
export function describeSources(urls: readonly string[]): SourceInfo[] {
  return urls
    .map((url, i) => ({ info: describeSource(url), i }))
    .sort(
      (a, b) =>
        KIND_ORDER[a.info.kind] - KIND_ORDER[b.info.kind] ||
        (a.info.fullTextRank ?? Infinity) - (b.info.fullTextRank ?? Infinity) ||
        a.i - b.i,
    )
    .map((x) => x.info);
}

/**
 * Nguồn đưa lên nút "Đọc toàn văn" ở đầu trang: trang toàn văn có thứ hạng cao
 * nhất. Không trang nào chứa toàn văn thì không có nút, thay vì dẫn người đọc
 * tới một bài tin và gọi đó là văn bản.
 */
export function primarySource(sources: readonly SourceInfo[]): SourceInfo | null {
  let best: SourceInfo | null = null;
  for (const s of sources) {
    if (s.fullTextRank === null) continue;
    if (!best || s.fullTextRank < (best.fullTextRank ?? Infinity)) best = s;
  }
  return best;
}

/** Bản ghi có ít nhất một nguồn chính thống hoặc của tổ chức ban hành. */
export function hasAuthoritativeSource(sources: readonly SourceInfo[]): boolean {
  return sources.some((s) => s.kind === "official" || s.kind === "issuer");
}
