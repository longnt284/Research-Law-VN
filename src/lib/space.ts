import { domains, relations as allRelations, documents } from "@/data/documents";
import type { DocType, LegalDoc, Relation } from "@/data/types";

/**
 * Hình học của trang mở đầu, sinh thẳng từ tập dữ liệu.
 *
 * Không có toạ độ nào ở đây được đặt bằng tay. Mỗi điểm trong cảnh ba chiều là
 * một văn bản có thật trong `src/data/documents.ts`, mỗi đường nối là một quan
 * hệ có thật trong `relations`. Thêm một nghị định vào tập dữ liệu thì cảnh mở
 * đầu có thêm một điểm, không phải sửa file này.
 *
 * Tách khỏi phần dựng hình vì hai lý do. Thứ nhất, toàn bộ phép tính ở đây là
 * hàm thuần và tất định — cùng tập dữ liệu thì cho ra cùng một mảng số, nên nó
 * chạy được ở cả phía máy chủ lẫn trình duyệt và kiểm tra được mà không cần
 * WebGL. Thứ hai, thành phần dựng hình vì vậy chỉ còn lo việc vẽ.
 */

/** Thứ bậc hiệu lực. Trùng thang với `DomainGraph3D` để hai nơi không nói khác nhau. */
const TIER: Record<DocType, number> = {
  "bo-luat": 0,
  luat: 0,
  "dieu-uoc": 0,
  "nghi-quyet": 1,
  vbhn: 1,
  "nghi-dinh": 2,
  "quyet-dinh": 2,
  "thong-tu": 3,
  "quy-tac": 3,
};

/** Sáu chương của trang mở đầu. Thứ tự này cũng là thứ tự cuộn. */
export const ACTS = ["khoi", "thu-bac", "linh-vuc", "quan-he", "thoi-gian", "nguong"] as const;
export type ActId = (typeof ACTS)[number];
export const ACT_COUNT = ACTS.length;

const TAU = Math.PI * 2;
/** Góc vàng, dùng cho mọi phép rải điểm phyllotaxis bên dưới. */
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

/**
 * Nguồn ngẫu nhiên tất định. `Math.random` không dùng được ở đây: trang sinh
 * tĩnh, nên máy chủ và trình duyệt phải ra đúng cùng một mảng số, nếu không
 * khung hình đầu tiên sẽ nhảy một cái khi React nhận lại cây.
 */
function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export interface SpaceNode {
  id: string;
  /** Số hiệu, dùng cho nhãn nổi trên điểm đang được nhấn mạnh. */
  number: string;
  tier: number;
  /** Chỉ số lĩnh vực chính, tức lĩnh vực đầu tiên trong bản ghi. */
  domain: number;
  hue: number;
  /** Văn bản cấp luật: vẽ lớn hơn và có quầng sáng. */
  anchor: boolean;
  /** Năm có hiệu lực; rơi về năm ban hành khi chưa xác minh được ngày hiệu lực. */
  year: number;
  /** Số quan hệ chạm tới văn bản này, tính cả hai chiều. */
  degree: number;
}

export interface SpaceLink {
  a: number;
  b: number;
  /** 0 quy định chi tiết · 1 sửa đổi bổ sung · 2 thay thế. */
  kind: number;
}

export interface Space {
  nodes: SpaceNode[];
  links: SpaceLink[];
  /** Một mảng toạ độ cho mỗi chương, dài `nodes.length * 3`. */
  layouts: Float32Array[];
  /** Trục bung của từng điểm ở từng chương, dùng cho nhịp nảy giữa hai chương. */
  bursts: Float32Array[];
  /** Năm sớm nhất và muộn nhất, để trục thời gian có nhãn thật. */
  span: { from: number; to: number };
}

const KIND_INDEX: Record<Relation["kind"], number> = { guides: 0, amends: 1, replaces: 2 };

function yearOf(doc: LegalDoc): number {
  const iso = doc.effectiveOn || doc.issuedOn;
  const y = Number(iso.slice(0, 4));
  return Number.isFinite(y) && y > 1900 ? y : 0;
}

/**
 * Sáu bố cục.
 *
 * Mỗi hàm nhận danh sách điểm đã sắp xếp sẵn và ghi thẳng vào mảng toạ độ. Điểm
 * thứ `i` giữ nguyên danh tính qua cả sáu chương: chuyển chương là cùng một văn
 * bản di chuyển sang chỗ mới, không phải một điểm biến mất và một điểm khác hiện
 * ra. Đó là lý do cảnh đọc ra được "vẫn từng ấy văn bản, sắp xếp theo cách khác".
 */

/** 01 Khối — toàn bộ tập văn bản là một thiên thể. Luật ở lõi, thông tư ở lớp vỏ. */
function layoutCorpus(nodes: SpaceNode[], out: Float32Array) {
  const n = nodes.length;
  for (let i = 0; i < n; i++) {
    const node = nodes[i];
    const y = 1 - (2 * (i + 0.5)) / n;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const a = i * GOLDEN;
    const radius = 0.72 + node.tier * 0.42 + hash(i * 3.1) * 0.24;
    out[i * 3] = radius * r * Math.cos(a);
    out[i * 3 + 1] = radius * y;
    out[i * 3 + 2] = radius * r * Math.sin(a);
  }
}

/** 02 Thứ bậc — bốn tầng theo hiệu lực pháp lý, trục đứng mang nghĩa. */
function layoutStrata(nodes: SpaceNode[], out: Float32Array) {
  const seen = [0, 0, 0, 0];
  const total = [0, 0, 0, 0];
  for (const node of nodes) total[node.tier]++;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const k = seen[node.tier]++;
    const count = Math.max(total[node.tier], 1);
    // Rải phyllotaxis trên một đĩa: mật độ đều từ tâm ra mép, không đọng thành vòng.
    const rr = Math.sqrt((k + 0.5) / count) * (1.15 + node.tier * 0.42);
    const a = k * GOLDEN;
    out[i * 3] = rr * Math.cos(a);
    out[i * 3 + 1] = 1.72 - node.tier * 1.16 + (hash(i * 7.7) - 0.5) * 0.1;
    out[i * 3 + 2] = rr * Math.sin(a);
  }
}

/** 03 Lĩnh vực — tám chùm trên một vành nghiêng, mỗi chùm một sắc màu. */
function layoutDomains(nodes: SpaceNode[], out: Float32Array) {
  const count = Math.max(domains.length, 1);
  const seen = new Array(count).fill(0);
  const total = new Array(count).fill(0);
  for (const node of nodes) total[node.domain]++;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const d = node.domain;
    const a = (d / count) * TAU;
    const R = 2.62;
    const cx = R * Math.cos(a);
    const cy = Math.sin(a * 2) * 0.46;
    const cz = R * Math.sin(a) * 0.62;
    const k = seen[d]++;
    const m = Math.max(total[d], 1);
    const yy = 1 - (2 * (k + 0.5)) / m;
    const rr = Math.sqrt(Math.max(0, 1 - yy * yy));
    const ang = k * GOLDEN;
    const spread = 0.34 + Math.min(m, 24) * 0.018;
    out[i * 3] = cx + spread * rr * Math.cos(ang);
    out[i * 3 + 1] = cy + spread * yy;
    out[i * 3 + 2] = cz + spread * rr * Math.sin(ang);
  }
}

/** 04 Quan hệ — văn bản bị nhiều văn bản khác dẫn chiếu bị kéo vào tâm. */
function layoutWeb(nodes: SpaceNode[], out: Float32Array) {
  const n = nodes.length;
  for (let i = 0; i < n; i++) {
    const node = nodes[i];
    // Bậc càng cao càng vào sâu, nên đường nối cắt qua lòng khối thay vì bò trên mặt.
    const pull = Math.min(node.degree, 6) / 6;
    const radius = 2.5 - pull * 1.62;
    const y = 1 - (2 * (i + 0.5)) / n;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const a = i * GOLDEN + node.domain * 0.42;
    out[i * 3] = radius * r * Math.cos(a);
    out[i * 3 + 1] = radius * y * 0.78 + (1.5 - node.tier) * 0.16;
    out[i * 3 + 2] = radius * r * Math.sin(a);
  }
}

/** 05 Thời gian — trục ngang là năm có hiệu lực, trục đứng vẫn là thứ bậc. */
function layoutTime(nodes: SpaceNode[], out: Float32Array, span: { from: number; to: number }) {
  const width = Math.max(span.to - span.from, 1);
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const t = node.year > 0 ? (node.year - span.from) / width : 0.5;
    out[i * 3] = t * 7.4 - 3.7;
    out[i * 3 + 1] = 1.38 - node.tier * 0.86 + (hash(i * 5.3) - 0.5) * 0.32;
    out[i * 3 + 2] = (hash(i * 9.1) - 0.5) * 1.9;
  }
}

/** 06 Ngưỡng — hai vành lồng vào nhau, hệ thống khép lại trước khi mở bản đồ. */
function layoutSeal(nodes: SpaceNode[], out: Float32Array) {
  const n = nodes.length;
  const half = Math.ceil(n / 2);
  for (let i = 0; i < n; i++) {
    const inner = i >= half;
    const k = inner ? i - half : i;
    const m = Math.max(inner ? n - half : half, 1);
    const a = (k / m) * TAU;
    const R = inner ? 1.32 : 1.94;
    const wobble = (hash(i * 2.7) - 0.5) * 0.12;
    if (inner) {
      // Vành trong dựng đứng, vuông góc với vành ngoài.
      out[i * 3] = (R + wobble) * Math.cos(a);
      out[i * 3 + 1] = (R + wobble) * Math.sin(a) * 0.42;
      out[i * 3 + 2] = (R + wobble) * Math.sin(a) * 0.9;
    } else {
      out[i * 3] = (R + wobble) * Math.cos(a);
      out[i * 3 + 1] = (R + wobble) * Math.sin(a);
      out[i * 3 + 2] = wobble * 2.4;
    }
  }
}

let cached: Space | null = null;

/**
 * Dựng toàn bộ hình học một lần rồi giữ lại.
 *
 * Tập dữ liệu là hằng nhập lúc dựng bản, không đổi trong vòng đời trang, nên
 * tính lại ở mỗi lần gắn thành phần chỉ tốn thêm vài mili giây trên thiết bị yếu.
 */
export function buildSpace(): Space {
  if (cached) return cached;

  const nodes: SpaceNode[] = documents.map((doc) => ({
    id: doc.id,
    number: doc.number,
    tier: TIER[doc.type] ?? 3,
    domain: Math.max(
      0,
      domains.findIndex((d) => d.id === doc.domains[0]),
    ),
    hue: domains.find((d) => d.id === doc.domains[0])?.hue ?? 40,
    anchor: doc.type === "bo-luat" || doc.type === "luat" || doc.type === "dieu-uoc",
    year: yearOf(doc),
    degree: 0,
  }));

  const index = new Map(nodes.map((node, i) => [node.id, i]));
  const links: SpaceLink[] = [];
  for (const rel of allRelations) {
    const a = index.get(rel.from);
    const b = index.get(rel.to);
    if (a === undefined || b === undefined) continue;
    nodes[a].degree++;
    nodes[b].degree++;
    links.push({ a, b, kind: KIND_INDEX[rel.kind] });
  }

  const years = nodes.map((node) => node.year).filter((y) => y > 0);
  const span = {
    from: years.length ? Math.min(...years) : 2000,
    to: years.length ? Math.max(...years) : 2026,
  };

  const n = nodes.length;
  const layouts = Array.from({ length: ACT_COUNT }, () => new Float32Array(n * 3));
  layoutCorpus(nodes, layouts[0]);
  layoutStrata(nodes, layouts[1]);
  layoutDomains(nodes, layouts[2]);
  layoutWeb(nodes, layouts[3]);
  layoutTime(nodes, layouts[4], span);
  layoutSeal(nodes, layouts[5]);

  // Trục bung: hướng ra xa tâm của chính bố cục đó. Điểm nằm đúng tâm không có
  // hướng nào để đi nên được cấp một trục cố định thay vì trục rỗng.
  const bursts = layouts.map((layout) => {
    const out = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const x = layout[i * 3];
      const y = layout[i * 3 + 1];
      const z = layout[i * 3 + 2];
      const len = Math.hypot(x, y, z);
      if (len < 1e-4) {
        out[i * 3] = Math.cos(i * 2.4);
        out[i * 3 + 1] = Math.sin(i * 1.7);
        out[i * 3 + 2] = Math.cos(i * 3.1);
      } else {
        out[i * 3] = x / len;
        out[i * 3 + 1] = y / len;
        out[i * 3 + 2] = z / len;
      }
    }
    return out;
  });

  cached = { nodes, links, layouts, bursts, span };
  return cached;
}
