import { documents, relations } from "@/data/documents";
import type { DomainId } from "@/data/types";
import { buildSpace, TIER } from "@/lib/space";

/**
 * Hình thu nhỏ hai chiều của các bố cục trong cảnh mở đầu.
 *
 * Trang chủ cần một hình cho mỗi lối vào, mà tám hình WebGL trên một trang thì
 * quạt máy chạy và trang cuộn giật. Ở đây cùng một tập toạ độ của `buildSpace`
 * được chiếu xuống mặt phẳng và xuất ra SVG tĩnh: không ngữ cảnh WebGL nào,
 * không một byte `three` nào phải tải, mà hình vẫn là hình của đúng tập dữ liệu
 * chứ không phải một hình trang trí vẽ tay.
 *
 * Toàn bộ phép tính ở đây là hàm thuần và tất định, nên máy chủ dựng ra đúng
 * chuỗi SVG mà trình duyệt sẽ dựng, và React không phải vá lại cây sau khi nhận.
 */

/** Khung nhìn của mọi hình thu nhỏ. Tỷ lệ 8:5, hợp với thẻ nằm ngang. */
export const PREVIEW_W = 160;
export const PREVIEW_H = 100;

export interface PreviewDot {
  x: number;
  y: number;
  /** Bán kính đã tính sẵn theo chiều sâu và theo việc điểm có phải văn bản cấp luật không. */
  r: number;
  hue: number;
  /** 0 ở xa nhất, 1 ở gần nhất. Dùng cho độ đậm, để hình có chiều sâu. */
  depth: number;
}

export interface PreviewEdge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** 0 quy định chi tiết · 1 sửa đổi bổ sung · 2 thay thế. Trùng thang với cảnh ba chiều. */
  kind: number;
  depth: number;
}

export interface Preview {
  dots: PreviewDot[];
  edges: PreviewEdge[];
}

export interface PreviewOptions {
  /** Số điểm giữ lại. Thẻ nhỏ không đọc nổi hai trăm điểm, nên hình được rút gọn có chủ ý. */
  maxDots?: number;
  maxEdges?: number;
  /** Góc xoay quanh trục đứng, radian. Mỗi lối vào một góc để năm hình không trùng nhau. */
  turn?: number;
  /** Độ nghiêng của máy ảnh, 0 là nhìn ngang. */
  tilt?: number;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

const cache = new Map<string, Preview>();

/**
 * Chiếu bố cục thứ `act` xuống mặt phẳng.
 *
 * Phép chiếu là phép chiếu trực giao có xoay và nghiêng, không phải phối cảnh:
 * ở khổ 160×100 thì phối cảnh chỉ làm các điểm ở mép chụm lại mà không thêm
 * được thông tin nào. Chiều sâu vẫn được giữ lại trong trường `depth` để điểm ở
 * xa vẽ nhạt hơn điểm ở gần.
 */
export function buildPreview(act: number, options: PreviewOptions = {}): Preview {
  const maxDots = options.maxDots ?? 72;
  const maxEdges = options.maxEdges ?? 34;
  const turn = options.turn ?? 0.6;
  const tilt = options.tilt ?? 0.34;

  const key = `${act}|${maxDots}|${maxEdges}|${turn}|${tilt}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const space = buildSpace();
  const layout = space.layouts[act] ?? space.layouts[0];
  const n = space.nodes.length;

  const cos = Math.cos(turn);
  const sin = Math.sin(turn);
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);

  // Chiếu toàn bộ điểm trước, kể cả điểm sẽ bị lược bỏ: mốc chuẩn hoá phải tính
  // trên cả bố cục, nếu không thì mỗi lần đổi số điểm giữ lại hình sẽ đổi khung.
  const px = new Float64Array(n);
  const py = new Float64Array(n);
  const pz = new Float64Array(n);
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  for (let i = 0; i < n; i++) {
    const x = layout[i * 3];
    const y = layout[i * 3 + 1];
    const z = layout[i * 3 + 2];
    const rx = x * cos + z * sin;
    const rz = z * cos - x * sin;
    const sy = y * cosT - rz * sinT;
    const sz = rz * cosT + y * sinT;
    px[i] = rx;
    py[i] = sy;
    pz[i] = sz;
    if (rx < minX) minX = rx;
    if (rx > maxX) maxX = rx;
    if (sy < minY) minY = sy;
    if (sy > maxY) maxY = sy;
    if (sz < minZ) minZ = sz;
    if (sz > maxZ) maxZ = sz;
  }

  // Một bố cục dẹt theo một trục (trục thời gian gần như phẳng) vẫn phải vẽ
  // được, nên bề rộng nhỏ nhất được kẹp thay vì chia cho không.
  const spanX = Math.max(maxX - minX, 1e-3);
  const spanY = Math.max(maxY - minY, 1e-3);
  const spanZ = Math.max(maxZ - minZ, 1e-3);
  const pad = 10;
  // Cùng một hệ số cho hai trục: hình giữ đúng tỷ lệ của bố cục thật, không bị
  // kéo giãn cho vừa khung.
  const scale = Math.min((PREVIEW_W - pad * 2) / spanX, (PREVIEW_H - pad * 2) / spanY);
  const offX = (PREVIEW_W - spanX * scale) / 2 - minX * scale;
  const offY = (PREVIEW_H - spanY * scale) / 2 - minY * scale;

  const sx = (i: number) => offX + px[i] * scale;
  // Trục đứng của SVG chỉ xuống dưới, còn trục đứng của cảnh chỉ lên trên.
  const sy = (i: number) => PREVIEW_H - (offY + py[i] * scale);
  const depthOf = (i: number) => (pz[i] - minZ) / spanZ;

  /*
    Chọn điểm giữ lại: ưu tiên văn bản được dẫn chiếu nhiều và văn bản cấp luật,
    rồi rải đều phần còn lại theo bước nhảy cố định. Lấy thuần theo bậc thì hình
    chỉ còn cái lõi, lấy thuần theo bước nhảy thì mất đúng những điểm làm nên
    hình dạng của bố cục quan hệ.
  */
  const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => {
    const na = space.nodes[a];
    const nb = space.nodes[b];
    const wa = na.degree * 2 + (na.anchor ? 3 : 0);
    const wb = nb.degree * 2 + (nb.anchor ? 3 : 0);
    return wb - wa || a - b;
  });

  const keep = new Set<number>();
  // Một phần ba lấy theo trọng số, phần còn lại rải đều. Lấy quá nửa theo trọng
  // số thì hình nghiêng hẳn về tầng luật — văn bản cấp luật vừa có quầng sáng
  // vừa được dẫn chiếu nhiều nhất — và bố cục thứ bậc hiện ra sai: đông ở trên,
  // thưa ở dưới, trong khi tập dữ liệu thì ngược lại.
  const strong = Math.min(Math.ceil(maxDots * 0.34), n);
  for (let i = 0; i < strong; i++) keep.add(order[i]);
  if (keep.size < maxDots && n > 0) {
    const step = Math.max(1, Math.floor(n / Math.max(maxDots - keep.size, 1)));
    for (let i = 0; i < n && keep.size < maxDots; i += step) keep.add(i);
  }

  const dots: PreviewDot[] = [];
  for (const i of keep) {
    const node = space.nodes[i];
    const depth = depthOf(i);
    dots.push({
      x: round(sx(i)),
      y: round(sy(i)),
      r: round((node.anchor ? 2.1 : 1.35) * (0.72 + depth * 0.5)),
      hue: node.hue,
      depth: round(depth),
    });
  }
  // Vẽ điểm ở xa trước, điểm ở gần sau: SVG không có bộ đệm chiều sâu, thứ tự
  // trong tài liệu chính là thứ tự chồng lớp.
  dots.sort((a, b) => a.depth - b.depth);

  const edges: PreviewEdge[] = [];
  const ranked = space.links
    .filter((l) => keep.has(l.a) && keep.has(l.b))
    .sort((p, q) => {
      const wp = space.nodes[p.a].degree + space.nodes[p.b].degree;
      const wq = space.nodes[q.a].degree + space.nodes[q.b].degree;
      return wq - wp || p.a - q.a || p.b - q.b;
    })
    .slice(0, maxEdges);

  for (const link of ranked) {
    edges.push({
      x1: round(sx(link.a)),
      y1: round(sy(link.a)),
      x2: round(sx(link.b)),
      y2: round(sy(link.b)),
      kind: link.kind,
      depth: round((depthOf(link.a) + depthOf(link.b)) / 2),
    });
  }
  edges.sort((a, b) => a.depth - b.depth);

  const preview: Preview = { dots, edges };
  cache.set(key, preview);
  return preview;
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
 * Thẻ lĩnh vực trên trang danh sách cố ý không mang vật thể WebGL — tám ngữ
 * cảnh WebGL trên một trang thì máy yếu chạy quạt và trang cuộn giật. Vệt này
 * là câu trả lời cho cùng nhu cầu ấy bằng SVG tĩnh: nó cho thấy lĩnh vực nặng
 * về luật hay nặng về thông tư, và nó nặng vài trăm byte.
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
