import { buildPreview, PREVIEW_H, PREVIEW_W, type PreviewOptions } from "@/lib/preview";

/**
 * Hình thu nhỏ của một bố cục trong cảnh mở đầu, vẽ bằng SVG.
 *
 * Đây là một thành phần máy chủ: hình nằm sẵn trong gói HTML đầu tiên, không
 * chờ JavaScript, không mở thêm ngữ cảnh WebGL nào. Nhờ vậy trang chủ đặt được
 * năm hình cạnh nhau mà máy yếu vẫn cuộn mượt.
 *
 * Chuyển động duy nhất là một nhịp trôi rất chậm của cả nhóm, đặt trong CSS ở
 * `.thumb` và tự tắt khi hệ điều hành báo đã giảm chuyển động. Không có phần tử
 * nào tự chạy hoạt ảnh riêng: bảy mươi điểm nhấp nháy lệch pha là một thứ gây
 * mất tập trung chứ không phải một hiệu ứng.
 */
export function SpaceThumb({
  act,
  className,
  ...options
}: { act: number; className?: string } & PreviewOptions) {
  const { dots, edges } = buildPreview(act, options);

  return (
    <svg
      className={`thumb ${className ?? ""}`}
      viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <g className="thumb-drift">
        {edges.map((e, i) => (
          <line
            key={`e${i}`}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            className={`thumb-edge thumb-edge-${e.kind}`}
            // Đường ở xa mảnh và nhạt hơn đường ở gần: đó là toàn bộ chiều sâu
            // mà một hình phẳng cỡ này cần.
            strokeOpacity={Math.round((0.2 + e.depth * 0.38) * 100) / 100}
          />
        ))}
        {dots.map((d, i) => (
          <circle
            key={`d${i}`}
            cx={d.x}
            cy={d.y}
            r={d.r}
            fill={`hsl(${d.hue} var(--node-chroma) var(--node-lightness))`}
            fillOpacity={Math.round((0.42 + d.depth * 0.5) * 100) / 100}
          />
        ))}
      </g>
    </svg>
  );
}
