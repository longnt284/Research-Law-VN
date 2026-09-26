import type { Lang } from "@/data/types";

/**
 * Phép tính khoảng thời gian giữa hai mốc: phần thuần, không chạm tới tập dữ
 * liệu, nên chạy được cả ở máy chủ lẫn trên trình duyệt.
 */

/** Số tháng tròn giữa hai mốc ISO; trả về null khi thiếu một trong hai mốc. */
export function monthsBetween(from: string, to: string): number | null {
  if (!from || !to) return null;
  const [fy, fm, fd] = from.split("-").map(Number);
  const [ty, tm, td] = to.split("-").map(Number);
  if (!fy || !fm || !fd || !ty || !tm || !td) return null;
  let months = (ty - fy) * 12 + (tm - fm);
  if (td < fd) months -= 1;
  return months;
}

/**
 * Số tháng viết thành chữ theo quy ước của từng thứ tiếng.
 *
 * Dùng chung cho trang cặp và trang chuỗi, để "1 năm 6 tháng" ở hai chỗ không
 * bao giờ đọc khác nhau.
 */
export function spanWords(months: number, lang: Lang): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (lang === "vi") {
    if (y === 0) return `${m} tháng`;
    return m === 0 ? `${y} năm` : `${y} năm ${m} tháng`;
  }
  if (y === 0) return `${m} month${m === 1 ? "" : "s"}`;
  const yPart = `${y} year${y === 1 ? "" : "s"}`;
  return m === 0 ? yPart : `${yPart} ${m} month${m === 1 ? "" : "s"}`;
}
