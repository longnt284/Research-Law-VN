import type { DomainId } from "@/data/types";

/**
 * Biểu tượng nét của từng lĩnh vực.
 *
 * Mỗi hình là một vật mà người làm nghề trong lĩnh vực ấy nhận ra ngay: cần cẩu
 * và khối nhà cho xây dựng, cột điện cho năng lượng, trang hợp đồng có chữ ký,
 * cán cân, tòa văn phòng, đồ thị tăng trưởng, mũ bảo hộ, biên lai thuế, thửa đất
 * có mốc giới, cây cầu hạ tầng. Không có khối hình học trừu tượng nào: hình phải
 * tự nói lĩnh vực trước khi người đọc kịp đọc nhãn.
 *
 * Nét vẽ bằng `currentColor`, nên màu do nơi gọi quyết định — thường là sắc của
 * lĩnh vực — và đổi nền sáng tối không cần vẽ lại.
 */

const GLYPHS: Record<DomainId, React.ReactNode> = {
  "xay-dung": (
    <>
      <path d="M12 44V8M7 8h33M12 8l6-4 6 4M36 8v11" />
      <path d="M33 19h6v3.5h-6z" />
      <rect x="21" y="26" width="17" height="18" />
      <path d="M25 31h3M31 31h3M25 36.5h3M31 36.5h3M5 44h38" />
    </>
  ),
  "nang-luong": (
    <>
      <path d="M24 4 15 44M24 4l9 40M14.5 13h19M12 21h24M17.5 31h13" />
      <path d="M16 13l15 8M32 13l-15 8M13 21l16 10M35 21 19 31" />
      <path d="M9 44h30" />
    </>
  ),
  "hop-dong": (
    <>
      <path d="M10 4h19l9 9v31H10z" />
      <path d="M29 4v9h9" />
      <path d="M15 18h17M15 23h17M15 28h11" />
      <path d="M15 38c3-4 5 2 8-1s4 1 7-1 3 0 4 0" />
    </>
  ),
  "to-tung": (
    <>
      <path d="M24 5v37M15 42h18M9 12h30" />
      <circle cx="24" cy="7.5" r="2" />
      <path d="M9 12 4 26M9 12l5 14M39 12l-5 14M39 12l5 14" />
      <path d="M3 26h12a6 5 0 0 1-12 0zM33 26h12a6 5 0 0 1-12 0z" />
    </>
  ),
  "doanh-nghiep": (
    <>
      <rect x="9" y="7" width="19" height="37" />
      <rect x="28" y="19" width="12" height="25" />
      <path d="M13 13h3.5M20.5 13H24M13 19h3.5M20.5 19H24M13 25h3.5M20.5 25H24M13 31h3.5M20.5 31H24" />
      <path d="M32 25h4M32 31h4M16.5 44v-6h4v6M5 44h39" />
    </>
  ),
  "dau-tu": (
    <>
      <path d="M6 42h36M6 42V7" />
      <path d="M10 34l8.5-8.5 7 6L37 18" />
      <path d="M31 18h6v6" />
      <circle cx="38" cy="35" r="4.5" />
      <path d="M38 32.5v5" />
    </>
  ),
  "lao-dong": (
    <>
      <path d="M10 31a14 14 0 0 1 28 0" />
      <path d="M6 31h36v4H6z" />
      <path d="M20.5 18.2V13h7v5.2M24 13v18" />
      <path d="M14 41h20" />
    </>
  ),
  thue: (
    <>
      <path d="M12 4h24v40l-4-3-4 3-4-3-4 3-4-3-4 3z" />
      <path d="M18 30l12-12" />
      <circle cx="19" cy="19" r="2.2" />
      <circle cx="29" cy="29" r="2.2" />
      <path d="M18 36h12" />
    </>
  ),
  "dat-dai": (
    <>
      <path d="M5 37 14 12l23 5 6 21-21 6z" />
      <circle cx="5" cy="37" r="1.8" />
      <circle cx="14" cy="12" r="1.8" />
      <circle cx="37" cy="17" r="1.8" />
      <circle cx="43" cy="38" r="1.8" />
      <circle cx="22" cy="44" r="1.8" />
      <path d="M24 32V18l8 3-8 3" />
    </>
  ),
  ppp: (
    <>
      <path d="M3 31h42M12 31V13M36 31V13" />
      <path d="M12 13q12 16 24 0M12 13 4 31M36 13l8 18" />
      <path d="M18 31v-7M24 31v-5M30 31v-7" />
      <path d="M8 38c4-2 8 2 12 0s8 2 12 0 8 2 12 0" />
    </>
  ),
};

export function DomainGlyph({
  id,
  className,
  title,
}: {
  id: DomainId;
  className?: string;
  /** Khi có, hình được đọc như một ảnh có tên; khi không, hình chỉ để trang trí. */
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={`glyph ${className ?? ""}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {GLYPHS[id]}
    </svg>
  );
}
