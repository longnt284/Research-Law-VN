import { documents, domains, relations } from "@/data/documents";
import type { DocType, DomainId, LegalDoc, RelationKind } from "@/data/types";

/**
 * Bố cục bản đồ.
 *
 * Chủ ý kỹ thuật: KHÔNG dùng mô phỏng lực chạy theo thời gian thực. Đồ thị lực
 * trông sinh động trong ảnh chụp nhưng khi dùng thật thì các điểm trôi liên tục,
 * người đọc mất mốc, và trình duyệt phải tính lại mỗi khung hình — đó chính là
 * nguồn giật lag. Ở đây toàn bộ tọa độ được tính một lần, tất định: cùng dữ liệu
 * vào thì cùng bố cục ra, lần mở nào cũng giống lần nào.
 *
 * Cấu trúc: mỗi lĩnh vực là một chòm đặt trên một hình elip lớn. Trong mỗi chòm,
 * văn bản có thứ bậc cao (bộ luật, luật) nằm gần tâm, văn bản dưới luật tỏa ra
 * các vòng ngoài.
 */

export interface NodeLayout {
  id: string;
  x: number;
  y: number;
  r: number;
  doc: LegalDoc;
  domain: DomainId;
  hue: number;
  rank: number;
  /** Số quan hệ nối vào node, dùng để quyết định thứ tự ưu tiên khi vẽ nhãn. */
  degree: number;
}

export interface EdgeLayout {
  from: string;
  to: string;
  kind: RelationKind;
  fx: number;
  fy: number;
  tx: number;
  ty: number;
}

/** Thứ bậc hiệu lực, quyết định vị trí trong chòm và kích thước điểm. */
const RANK: Record<DocType, number> = {
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

/**
 * Khung toạ độ ảo.
 *
 * Tỷ lệ khoảng 2:1, chọn theo hình dạng thật của vùng vẽ. Một khung vuông sẽ để
 * thừa hai dải trống hai bên khi hiển thị trên màn hình ngang.
 */
export const WORLD = { w: 2240, h: 1850 };

/** Lưới chòm: bốn cột, hai hàng. */
const GRID_COLS = 4;

const NODE_RADIUS = [17, 13.5, 11, 9.5];

/**
 * Tính bố cục một lần cho toàn bộ tập dữ liệu.
 *
 * Hàm thuần, không phụ thuộc DOM, nên có thể chạy cả trên máy chủ lẫn trong bài
 * kiểm thử mà không cần canvas.
 */
export function buildLayout(): { nodes: NodeLayout[]; edges: EdgeLayout[] } {
  const degree = new Map<string, number>();
  for (const rel of relations) {
    degree.set(rel.from, (degree.get(rel.from) ?? 0) + 1);
    degree.set(rel.to, (degree.get(rel.to) ?? 0) + 1);
  }

  // Gom văn bản theo lĩnh vực chính. Văn bản thuộc nhiều lĩnh vực được đặt ở
  // lĩnh vực đầu tiên, nhưng vẫn hiện khi lọc theo bất kỳ lĩnh vực nào của nó.
  const byDomain = new Map<DomainId, LegalDoc[]>();
  for (const d of domains) byDomain.set(d.id, []);
  for (const doc of documents) {
    const primary = doc.domains[0];
    byDomain.get(primary)?.push(doc);
  }

  const rows = Math.ceil(domains.length / GRID_COLS);
  const cellW = WORLD.w / GRID_COLS;
  const cellH = WORLD.h / rows;

  const nodes: NodeLayout[] = [];

  domains.forEach((domain, di) => {
    const group = byDomain.get(domain.id) ?? [];
    if (group.length === 0) return;

    // Mỗi lĩnh vực chiếm một ô của lưới. Bố cục lưới lấp kín khung chữ nhật,
    // khác với bố cục vòng tròn vốn để trống cả phần giữa lẫn bốn góc.
    const col = di % GRID_COLS;
    const row = Math.floor(di / GRID_COLS);
    // Hàng lẻ đẩy ngang nửa ô: các chòm so le nhìn có nhịp hơn là xếp thẳng
    // thành bàn cờ, và các đường nối giữa hai hàng cũng bớt chồng lên nhau.
    const stagger = row % 2 === 1 ? cellW * 0.16 : -cellW * 0.16;
    const gx = cellW * (col + 0.5) + stagger;
    const gy = cellH * (row + 0.5);

    // Chòm nhiều văn bản thì rộng hơn, nhưng theo căn bậc hai để chòm lớn không
    // nuốt mất chỗ của chòm bên cạnh.
    const spread = 46 + Math.sqrt(group.length) * 40;

    const sorted = [...group].sort((a, b) => {
      const ra = RANK[a.type] - RANK[b.type];
      if (ra !== 0) return ra;
      return (degree.get(b.id) ?? 0) - (degree.get(a.id) ?? 0);
    });

    const core = sorted.filter((d) => RANK[d.type] === 0);
    const outer = sorted.filter((d) => RANK[d.type] > 0);

    const place = (doc: LegalDoc, x: number, y: number) => {
      const rank = RANK[doc.type];
      nodes.push({
        id: doc.id,
        x,
        y,
        r: NODE_RADIUS[rank],
        doc,
        domain: domain.id,
        hue: domain.hue,
        rank,
        degree: degree.get(doc.id) ?? 0,
      });
    };

    if (core.length === 1) {
      place(core[0], gx, gy);
    } else {
      const coreR = core.length > 1 ? 20 + core.length * 9 : 0;
      core.forEach((doc, i) => {
        const a = (i / Math.max(core.length, 1)) * Math.PI * 2 - Math.PI / 2;
        place(doc, gx + Math.cos(a) * coreR, gy + Math.sin(a) * coreR);
      });
    }

    // Vòng ngoài: chia đều theo góc, lệch pha nửa bước mỗi vòng để hai vòng liền
    // nhau không xếp thẳng hàng thành các nan hoa.
    const perRing = 7;
    outer.forEach((doc, i) => {
      const ring = Math.floor(i / perRing);
      const idxInRing = i % perRing;
      const countInRing = Math.min(perRing, outer.length - ring * perRing);
      const a =
        (idxInRing / countInRing) * Math.PI * 2 -
        Math.PI / 2 +
        (ring % 2 === 1 ? Math.PI / countInRing : 0);
      const rr = spread + ring * 62;
      place(doc, gx + Math.cos(a) * rr, gy + Math.sin(a) * rr);
    });
  });

  const pos = new Map(nodes.map((n) => [n.id, n]));
  const edges: EdgeLayout[] = [];
  for (const rel of relations) {
    const a = pos.get(rel.from);
    const b = pos.get(rel.to);
    if (!a || !b) continue;
    edges.push({
      from: rel.from,
      to: rel.to,
      kind: rel.kind,
      fx: a.x,
      fy: a.y,
      tx: b.x,
      ty: b.y,
    });
  }

  return { nodes, edges };
}

/** Màu của một điểm, suy từ sắc độ của lĩnh vực. */
export function nodeColor(hue: number, lightness: number, chroma: number): string {
  return `hsl(${hue} ${chroma}% ${lightness}%)`;
}
