import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { LATEST_VERIFIED_ON } from "@/data/documents";
import type { DocStatus, Lang } from "@/data/types";
import { formatDate, getDict } from "@/i18n/dictionary";

/**
 * Ảnh chia sẻ (Open Graph) của trang.
 *
 * Khi một đường dẫn được dán vào Zalo, Facebook hay LinkedIn, thứ người nhận
 * thấy trước tiên là ảnh này, trước cả tiêu đề. Ảnh chung cho cả trang thì mọi
 * đường dẫn trông như nhau; ở đây mỗi văn bản, mỗi cặp đối chiếu có ảnh riêng
 * mang số hiệu, tên và tình trạng hiệu lực, lấy thẳng từ bản ghi.
 *
 * Ảnh dựng một lần lúc `next build`, không dựng lại theo từng lượt xem. Phông
 * chữ đọc từ `src/og/fonts`: Lora và Be Vietnam Pro, cùng hai họ chữ của trang,
 * ở dạng TTF tĩnh vì bộ dựng ảnh không đọc được WOFF2 mà `next/font` tải về, và
 * không đọc được phông biến thiên. Giấy phép OFL của hai phông nằm cùng thư mục.
 * Không phông nào có mũi tên, nên mũi tên trong ảnh là hình SVG.
 */

export const OG_SIZE = { width: 1200, height: 630 };

/** Màu của bản sáng, chép từ `globals.css`. Ảnh chia sẻ không có chế độ tối. */
export const C = {
  paper: "#faf8f4",
  paper2: "#f3efe8",
  paper3: "#e9e3d8",
  ink: "#16181d",
  ink2: "#3d434e",
  ink3: "#6b7280",
  rule: "#d9d2c4",
  ruleStrong: "#b9b0a0",
  accent: "#7a2c1f",
  brass: "#9a7b34",
};

/** Màu nhãn tình trạng, cùng thang với `StatusBadge` (Tailwind 800 / 600). */
const STATUS_TONE: Record<DocStatus, { fg: string; dot: string; hollow?: boolean }> = {
  active: { fg: "#065f46", dot: "#059669" },
  amended: { fg: "#92400e", dot: "#f59e0b" },
  pending: { fg: "#075985", dot: "#0ea5e9" },
  expired: { fg: C.ink3, dot: C.ink3, hollow: true },
};

const FONT_DIR = join(process.cwd(), "src/og/fonts");

let fonts: Promise<{ name: string; data: Buffer; weight: 400 | 600 }[]> | null = null;

/** Nạp phông một lần cho cả lượt dựng, không đọc đĩa lại cho từng ảnh. */
function loadFonts() {
  fonts ??= Promise.all([
    readFile(join(FONT_DIR, "Lora-SemiBold.ttf")).then((data) => ({
      name: "Lora",
      data,
      weight: 600 as const,
    })),
    readFile(join(FONT_DIR, "BeVietnamPro-Regular.ttf")).then((data) => ({
      name: "Be Vietnam Pro",
      data,
      weight: 400 as const,
    })),
    readFile(join(FONT_DIR, "BeVietnamPro-SemiBold.ttf")).then((data) => ({
      name: "Be Vietnam Pro",
      data,
      weight: 600 as const,
    })),
  ]);
  return fonts;
}

export const SERIF = "Lora";
export const SANS = "Be Vietnam Pro";

/** Khung chung: đầu ảnh mang dấu § và tên trang, chân ảnh mang ngày tra cứu. */
export async function renderCard(
  lang: Lang,
  eyebrow: string,
  body: React.ReactNode,
  footer?: React.ReactNode,
): Promise<ImageResponse> {
  const t = getDict(lang);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: C.paper,
          padding: "56px 72px 48px",
          fontFamily: SANS,
          color: C.ink,
          // Một vệt đồng mảnh bên trái, gợi gáy của một tập hồ sơ.
          borderLeft: `14px solid ${C.accent}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                border: `2px solid ${C.accent}`,
                color: C.accent,
                fontFamily: SERIF,
                fontSize: 28,
              }}
            >
              §
            </div>
            <div style={{ display: "flex", fontFamily: SERIF, fontSize: 28 }}>{t.siteName}</div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              letterSpacing: 3,
              color: C.ink3,
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "center" }}>
          {body}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `2px solid ${C.ruleStrong}`,
            paddingTop: 22,
            fontSize: 22,
            color: C.ink3,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>{footer}</div>
          <div style={{ display: "flex" }}>
            {t.footer.verifiedPrefix} {formatDate(LATEST_VERIFIED_ON, lang, LATEST_VERIFIED_ON)}
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await loadFonts() },
  );
}

/** Nhãn tình trạng hiệu lực, cùng cách mã hóa bằng chấm và chữ như trên trang. */
export function StatusPill({ status, lang }: { status: DocStatus; lang: Lang }) {
  const t = getDict(lang);
  const tone = STATUS_TONE[status];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        border: `2px solid ${tone.fg}55`,
        color: tone.fg,
        padding: "6px 14px",
        fontSize: 22,
        fontWeight: 600,
      }}
    >
      <div
        style={{
          display: "flex",
          width: 12,
          height: 12,
          borderRadius: 6,
          background: tone.hollow ? "transparent" : tone.dot,
          border: tone.hollow ? `2px solid ${tone.dot}` : "none",
        }}
      />
      {t.status[status]}
    </div>
  );
}

/** Mũi tên ngang: không phông nào của trang có ký tự mũi tên. */
export function Arrow({ color, dotted }: { color: string; dotted?: boolean }) {
  return (
    <svg width="96" height="24" viewBox="0 0 96 24">
      <line
        x1="4"
        y1="12"
        x2="80"
        y2="12"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={dotted ? "0.1 10" : undefined}
      />
      <polygon points="92,12 76,3 76,21" fill={color} />
    </svg>
  );
}
