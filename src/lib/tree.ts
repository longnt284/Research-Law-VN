import type { LegalDoc, Relation, RelationKind } from "@/data/types";
import { type Tier, tierOf, whenOf } from "@/lib/corpus";

/**
 * Bố cục cây văn bản của một lĩnh vực, vẽ phẳng.
 *
 * Trước đây trang lĩnh vực dựng khối quan hệ ba chiều. Khối đó xoay được nhưng
 * người đọc phải xoay mới thấy luật nào nối với nghị định nào. Cây ở đây trải
 * cùng dữ liệu ra mặt phẳng theo đúng cách người làm hồ sơ vẫn vẽ tay: mỗi cột
 * một tầng hiệu lực, luật ở cột trái, thông tư ở cột phải, và mỗi đường nối là
 * một quan hệ có thật.
 *
 * Thứ tự trong cột theo phép trọng tâm: văn bản đứng gần vị trí trung bình của
 * những văn bản nối với nó ở cột khác, nên đường nối ít cắt nhau. Hai lượt quét
 * xuôi rồi ngược là đủ cho cỡ một lĩnh vực; không cần một bộ dàn đồ thị đầy đủ.
 *
 * Quan hệ giữa hai văn bản cùng cột — thường là luật sửa đổi hay thay thế luật —
 * vẽ thành một cung cong ra bên trái cột, như dấu ngoặc nối hai dòng trong một
 * bản ghi chú.
 */

export const TREE = {
  nodeW: 212,
  nodeH: 54,
  rowGap: 12,
  colGap: 78,
  padX: 44,
  padY: 16,
};

export interface TreeNode {
  doc: LegalDoc;
  tier: Tier;
  x: number;
  y: number;
}

export interface TreeEdge {
  from: string;
  to: string;
  kind: RelationKind;
  d: string;
  /** Hai điểm cuối của đoạn cuối, để đặt đầu mũi tên đúng hướng. */
  tip: { x: number; y: number; angle: number };
}

export interface Tree {
  nodes: TreeNode[];
  edges: TreeEdge[];
  width: number;
  height: number;
  /** Các tầng có văn bản, theo thứ tự cột. */
  tiers: Tier[];
  columnX: number[];
}

export function buildTree(docs: LegalDoc[], relations: Relation[]): Tree {
  const linked = new Set<string>();
  for (const r of relations) {
    linked.add(r.from);
    linked.add(r.to);
  }
  // Chỉ văn bản có ít nhất một quan hệ trong lĩnh vực. Danh sách đầy đủ nằm ngay
  // dưới cây; đưa cả văn bản đứng lẻ vào cây thì cây dài gấp đôi mà không thêm
  // một đường nối nào.
  const members = docs.filter((d) => linked.has(d.id));

  const tiers = ([0, 1, 2, 3] as Tier[]).filter((t) => members.some((d) => tierOf(d) === t));
  const colOf = new Map<Tier, number>(tiers.map((t, i) => [t, i]));
  const cols: LegalDoc[][] = tiers.map((t) =>
    members
      .filter((d) => tierOf(d) === t)
      .sort((a, b) => whenOf(a).localeCompare(whenOf(b)) || a.id.localeCompare(b.id)),
  );

  const neighbours = new Map<string, string[]>();
  for (const r of relations) {
    neighbours.set(r.from, [...(neighbours.get(r.from) ?? []), r.to]);
    neighbours.set(r.to, [...(neighbours.get(r.to) ?? []), r.from]);
  }

  const index = new Map<string, number>();
  const reindex = () => cols.forEach((col) => col.forEach((d, i) => index.set(d.id, i)));
  reindex();

  const sweep = (order: number[]) => {
    for (const c of order) {
      const col = cols[c];
      const score = new Map<string, number>();
      for (const d of col) {
        const others = (neighbours.get(d.id) ?? []).filter((id) => {
          const doc = members.find((m) => m.id === id);
          return doc && colOf.get(tierOf(doc)) !== c;
        });
        score.set(
          d.id,
          others.length
            ? others.reduce((s, id) => s + (index.get(id) ?? 0), 0) / others.length
            : (index.get(d.id) ?? 0),
        );
      }
      col.sort((a, b) => (score.get(a.id) ?? 0) - (score.get(b.id) ?? 0));
      reindex();
    }
  };
  const forward = cols.map((_, i) => i);
  sweep(forward.slice(1));
  sweep([...forward].reverse().slice(1));
  sweep(forward.slice(1));

  const { nodeW, nodeH, rowGap, colGap, padX, padY } = TREE;
  const columnX = cols.map((_, c) => padX + c * (nodeW + colGap));
  const pos = new Map<string, TreeNode>();
  const nodes: TreeNode[] = [];
  cols.forEach((col, c) =>
    col.forEach((doc, r) => {
      const node = { doc, tier: tierOf(doc), x: columnX[c], y: padY + r * (nodeH + rowGap) };
      pos.set(doc.id, node);
      nodes.push(node);
    }),
  );

  const edges: TreeEdge[] = [];
  for (const rel of relations) {
    const a = pos.get(rel.from);
    const b = pos.get(rel.to);
    if (!a || !b) continue;
    const ay = a.y + nodeH / 2;
    const by = b.y + nodeH / 2;
    if (a.x === b.x) {
      // Cùng cột: cung cong ra bên trái, độ cong tăng theo khoảng cách hai dòng.
      const bow = Math.min(padX - 6, 14 + Math.abs(by - ay) * 0.08);
      const x = a.x;
      edges.push({
        ...rel,
        d: `M${x} ${ay} C${x - bow} ${ay} ${x - bow} ${by} ${x} ${by}`,
        tip: { x, y: by, angle: 0 },
      });
      continue;
    }
    // Khác cột: đi từ mép gần của văn bản này sang mép gần của văn bản kia.
    const leftToRight = a.x < b.x;
    const x1 = leftToRight ? a.x + nodeW : a.x;
    const x2 = leftToRight ? b.x : b.x + nodeW;
    const mid = (x1 + x2) / 2;
    edges.push({
      ...rel,
      d: `M${x1} ${ay} C${mid} ${ay} ${mid} ${by} ${x2} ${by}`,
      tip: { x: x2, y: by, angle: leftToRight ? 0 : Math.PI },
    });
  }

  const rows = Math.max(1, ...cols.map((c) => c.length));
  return {
    nodes,
    edges,
    width: padX * 2 + cols.length * nodeW + Math.max(0, cols.length - 1) * colGap,
    height: padY * 2 + rows * nodeH + (rows - 1) * rowGap,
    tiers,
    columnX,
  };
}
