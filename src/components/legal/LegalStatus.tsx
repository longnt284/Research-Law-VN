/**
 * Nhãn tình trạng hiệu lực, dùng chung cho mọi chỗ trên trang.
 *
 * Mỗi tình trạng được nói bằng bốn thứ cùng lúc: chữ, hình biểu tượng, kiểu
 * viền và độ đậm của chữ. Màu chỉ là lớp thứ năm. Người không phân biệt được
 * màu, người in trang ra giấy đen trắng, hay người dùng trình đọc màn hình đều
 * đọc được tình trạng mà không cần màu:
 *
 *   ●  còn hiệu lực            viền liền, chữ đậm
 *   ◐  còn hiệu lực, có sửa đổi viền liền
 *   ◌  chưa có hiệu lực         viền đứt, kim đồng hồ
 *   ⊘  hết hiệu lực            viền liền nhạt, chữ nhạt
 *   ?  không xác định được     viền đứt
 *
 * Thành phần thuần, không có trạng thái, dùng được ở máy chủ lẫn trình duyệt.
 */

export type StatusTone = "active" | "amended" | "pending" | "expired" | "unknown";

export function StatusGlyph({
  tone,
  className,
  box,
}: {
  tone: StatusTone;
  className?: string;
  /** Vị trí và cỡ khi đặt lồng trong một hình SVG khác. */
  box?: { x: number; y: number; size: number };
}) {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      focusable="false"
      className={`lstatus-glyph ${className ?? ""}`}
      {...(box ? { x: box.x, y: box.y, width: box.size, height: box.size } : {})}
    >
      {tone === "active" && <circle cx="6" cy="6" r="4.4" fill="currentColor" />}
      {tone === "amended" && (
        <>
          <circle cx="6" cy="6" r="4.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <path d="M6 1.6A4.4 4.4 0 0 0 6 10.4Z" fill="currentColor" />
        </>
      )}
      {tone === "pending" && (
        <>
          <circle
            cx="6"
            cy="6"
            r="4.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="2 1.5"
          />
          <path d="M6 3.4V6.2H8.2" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </>
      )}
      {tone === "expired" && (
        <>
          <circle cx="6" cy="6" r="4.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <path d="M2.9 9.1 9.1 2.9" stroke="currentColor" strokeWidth="1.3" />
        </>
      )}
      {tone === "unknown" && (
        <>
          <circle
            cx="6"
            cy="6"
            r="4.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="2 1.5"
          />
          <path
            d="M4.7 4.8a1.4 1.4 0 1 1 2 1.3c-.5.2-.7.5-.7 1v.3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          <circle cx="6" cy="8.7" r="0.6" fill="currentColor" />
        </>
      )}
    </svg>
  );
}

export function LegalStatus({
  tone,
  label,
  detail,
  title,
  size = "md",
  className,
}: {
  tone: StatusTone;
  label: string;
  /** Phần phụ sau nhãn, ví dụ "từ 01/07/2026". */
  detail?: React.ReactNode;
  /** Lời giải thích hiện khi rê chuột. */
  title?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span
      className={`lstatus lstatus--${tone} lstatus--${size} ${className ?? ""}`}
      title={title}
    >
      <StatusGlyph tone={tone} />
      <span className="lstatus-label">{label}</span>
      {detail && <span className="lstatus-detail">{detail}</span>}
    </span>
  );
}
