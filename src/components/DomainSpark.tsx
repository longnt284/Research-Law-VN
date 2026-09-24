import type { DomainId } from "@/data/types";
import { buildDomainSpark, SPARK_H, SPARK_W, sparkRowY } from "@/lib/spark";

/**
 * Vệt thứ bậc của một lĩnh vực, vẽ bằng SVG.
 *
 * Bốn hàng ngang là bốn tầng hiệu lực: luật trên cùng, nghị quyết và văn bản
 * hợp nhất kế đó, nghị định ở giữa, thông tư dưới cùng. Nhìn vào vệt là thấy
 * ngay lĩnh vực nặng về luật hay nặng về văn bản hướng dẫn.
 *
 * Thành phần máy chủ, SVG tĩnh nặng vài trăm byte: thẻ có hình mà trang danh
 * sách không phải tải thêm gì.
 */
export function DomainSpark({ id, hue }: { id: DomainId; hue: number }) {
  const { dots, edges } = buildDomainSpark(id);

  return (
    <svg
      className="spark"
      viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      {/* Bốn đường kẻ mảnh làm nền: chúng nói rằng hàng trống là một tầng không
          có văn bản, chứ không phải một chỗ hình bị cắt. */}
      {[0, 1, 2, 3].map((tier) => (
        <line
          key={`t${tier}`}
          x1={3}
          y1={sparkRowY(tier)}
          x2={SPARK_W - 3}
          y2={sparkRowY(tier)}
          className="spark-tier"
        />
      ))}
      {edges.map((e, i) => (
        <line
          key={`e${i}`}
          x1={e.x1}
          y1={e.y1}
          x2={e.x2}
          y2={e.y2}
          className={`spark-edge spark-edge-${e.kind}`}
        />
      ))}
      {dots.map((d, i) => (
        <circle
          key={`d${i}`}
          cx={d.x}
          cy={d.y}
          r={d.r}
          fill={`hsl(${hue} var(--node-chroma) var(--node-lightness))`}
        />
      ))}
    </svg>
  );
}
