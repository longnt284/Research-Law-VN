import { documents, relations } from "@/data/documents";
import type { DomainId } from "@/data/types";
import { TIER } from "@/lib/corpus";

/**
 * Vệt thứ bậc trên thẻ lĩnh vực.
 *
 * Bốn hàng ngang là bốn tầng hiệu lực; mỗi chấm là một văn bản của lĩnh vực.
 * Dùng chung thang thứ bậc `TIER` với mọi hình khác của trang, nên vệt trên thẻ
 * và cây ở trang lĩnh vực không bao giờ xếp một văn bản vào hai tầng khác nhau.
 */

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/* ── Vệt lĩnh vực ─────────────────────────────────────────────────────────── */

/** Khung nhìn của vệt lĩnh vực. Thấp và rộng, vừa một góc thẻ. */
export const SPARK_W = 200;
export const SPARK_H = 44;

/**
 * Trục đứng của một tầng trong vệt. Cả hình và bốn đường kẻ nền đều gọi hàm này,
 * nên không có chỗ nào chép lại công thức rồi lệch đi khi khung nhìn đổi.
 */
export function sparkRowY(tier: number): number {
  return 7 + tier * 10;
}

export interface SparkDot {
  x: number;
  y: number;
  r: number;
}

export interface SparkEdge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  kind: number;
}

export interface Spark {
  dots: SparkDot[];
  edges: SparkEdge[];
  /** Số văn bản ở từng tầng, kể cả phần không vẽ hết. Dùng cho nhãn đọc màn hình. */
  tiers: [number, number, number, number];
}

const sparkCache = new Map<string, Spark>();

/**
 * Vệt thứ bậc của một lĩnh vực: bốn hàng, mỗi hàng một tầng hiệu lực.
 *
 * Vệt cho thấy lĩnh vực nặng về luật hay nặng về văn bản hướng dẫn, bằng SVG
 * tĩnh nặng vài trăm byte.
 */
export function buildDomainSpark(domainId: DomainId, perRow = 13): Spark {
  const key = `${domainId}|${perRow}`;
  const hit = sparkCache.get(key);
  if (hit) return hit;

  const docs = documents.filter((d) => d.domains.includes(domainId));
  const tiers: [number, number, number, number] = [0, 0, 0, 0];
  const rows: { id: string; tier: number; anchor: boolean }[][] = [[], [], [], []];

  for (const doc of docs) {
    const tier = TIER[doc.type] ?? 3;
    tiers[tier]++;
    // Cắt ở `perRow`: hàng dài hơn thì các điểm dính vào nhau thành một vạch
    // liền và vệt không còn đọc ra được số lượng nữa.
    if (rows[tier].length < perRow) {
      rows[tier].push({
        id: doc.id,
        tier,
        anchor: doc.type === "bo-luat" || doc.type === "luat" || doc.type === "dieu-uoc",
      });
    }
  }

  const padX = 6;
  const step = (SPARK_W - padX * 2) / (perRow - 1);

  const place = new Map<string, { x: number; y: number }>();
  const dots: SparkDot[] = [];
  for (let tier = 0; tier < 4; tier++) {
    const row = rows[tier];
    for (let i = 0; i < row.length; i++) {
      const x = round(padX + i * step);
      const y = round(sparkRowY(tier));
      place.set(row[i].id, { x, y });
      dots.push({ x, y, r: row[i].anchor ? 2.2 : 1.6 });
    }
  }

  const edges: SparkEdge[] = [];
  for (const rel of relations) {
    const a = place.get(rel.from);
    const b = place.get(rel.to);
    // Chỉ vẽ quan hệ mà cả hai đầu đều nằm trong lĩnh vực này và đều được vẽ.
    // Một đường chạy tới chỗ trống là một lời hứa mà hình không giữ được.
    if (!a || !b) continue;
    edges.push({
      x1: a.x,
      y1: a.y,
      x2: b.x,
      y2: b.y,
      kind: rel.kind === "guides" ? 0 : rel.kind === "amends" ? 1 : 2,
    });
  }

  const spark: Spark = { dots, edges, tiers };
  sparkCache.set(key, spark);
  return spark;
}
