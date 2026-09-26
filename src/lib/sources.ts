/**
 * Phân loại nguồn của một bản ghi.
 *
 * Nguồn chính thức là nơi cơ quan nhà nước công bố văn bản hoặc tình trạng hiệu
 * lực của nó: Cơ sở dữ liệu quốc gia về pháp luật, Công báo, hệ thống văn bản
 * và cổng thông tin của Chính phủ, cổng của Quốc hội và của các bộ, ngành, địa
 * phương (tên miền `.gov.vn`). Với quy tắc tố tụng của một trung tâm trọng tài,
 * nguồn chính thức là trang của chính tổ chức ban hành quy tắc.
 *
 * Mọi nguồn khác (trang tra cứu tư nhân, báo, công ty luật) là nguồn tham khảo:
 * có ích để đối chiếu chéo, nhưng không phải nơi văn bản được công bố. Phân loại
 * chỉ dựa trên tên miền, nên nó kiểm được và không đoán theo nội dung trang.
 */

export type SourceKind = "official" | "reference";

/** Tên miền của tổ chức ban hành quy tắc trọng tài có trong tập dữ liệu. */
const ISSUERS = new Set(["iccwbo.org", "viac.vn"]);

/** Tên gọi của các nguồn chính thức hay gặp, thay cho tên miền trần. */
const NAMES: Record<string, { vi: string; en: string }> = {
  "vbpl.vn": { vi: "CSDL quốc gia về pháp luật", en: "National Legal Database" },
  "congbao.chinhphu.vn": { vi: "Công báo", en: "Official Gazette" },
  "vanban.chinhphu.vn": { vi: "Hệ thống văn bản Chính phủ", en: "Government documents system" },
  "chinhphu.vn": { vi: "Cổng Thông tin điện tử Chính phủ", en: "Government portal" },
  "quochoi.vn": { vi: "Cổng thông tin Quốc hội", en: "National Assembly portal" },
};

export function hostOf(url: string): string {
  return new URL(url).hostname.replace(/^www\./, "");
}

export function sourceKind(url: string): SourceKind {
  const host = hostOf(url);
  if (host === "vbpl.vn" || host === "quochoi.vn" || ISSUERS.has(host)) return "official";
  if (host === "chinhphu.vn" || host.endsWith(".chinhphu.vn")) return "official";
  if (host.endsWith(".gov.vn")) return "official";
  return "reference";
}

/** Tên hiển thị của một nguồn: tên cơ quan nếu biết, tên miền nếu không. */
export function sourceName(url: string, lang: "vi" | "en"): string {
  const host = hostOf(url);
  return NAMES[host]?.[lang] ?? host;
}

/** Nguồn của một bản ghi, tách hai nhóm, giữ thứ tự ghi trong bản ghi. */
export function splitSources(sources: readonly string[]): Record<SourceKind, string[]> {
  const out: Record<SourceKind, string[]> = { official: [], reference: [] };
  for (const s of sources) out[sourceKind(s)].push(s);
  return out;
}
