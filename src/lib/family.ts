import { documents, documentsById, relations } from "@/data/documents";
import type { LegalDoc, RelationKind } from "@/data/types";
import { whenOf } from "@/lib/corpus";

/**
 * Gia phả của một văn bản.
 *
 * Ý tưởng của cả trang: một văn bản pháp luật có dòng dõi như một người trong
 * gia phả. Nó có đời trước (văn bản nó thay thế), đời sau (văn bản thay thế
 * nó), các nhánh hướng dẫn (nghị định, thông tư quy định chi tiết nó), văn bản
 * cấp trên mà chính nó hướng dẫn, và những lần được sửa đổi, bổ sung.
 *
 * Phép so sánh chỉ là cách sắp xếp. Mỗi vai trong gia phả ứng đúng một loại
 * quan hệ có trong trường quan hệ của bản ghi, không vai nào được suy đoán:
 *
 *   đời trước           văn bản này `replaces` văn bản kia
 *   đời sau             văn bản kia `replaces` văn bản này
 *   văn bản cấp trên    văn bản này `guides` văn bản kia
 *   nhánh hướng dẫn     văn bản kia `guides` văn bản này
 *   được sửa đổi bởi    văn bản kia `amends` văn bản này
 *   sửa đổi             văn bản này `amends` văn bản kia
 *
 * Đời trước và đời sau đi tiếp tối đa `DEPTH` đời, vì một luật thay luật cũ,
 * luật cũ lại từng thay một luật cũ hơn. Nhánh hướng dẫn đi thêm đúng một bậc:
 * thông tư hướng dẫn nghị định hướng dẫn luật.
 */

export const DEPTH = 3;

/** Một văn bản trên dòng kế tục, kèm các đời xa hơn nối vào nó. */
export interface LineNode {
  doc: LegalDoc;
  next: LineNode[];
}

export interface Branch {
  doc: LegalDoc;
  /** Văn bản hướng dẫn chính nhánh này. */
  children: LegalDoc[];
}

export interface Family {
  focus: LegalDoc;
  /** Đời trước, gần nhất trước; mỗi nút mang các đời xa hơn của nó. */
  ancestors: LineNode[];
  /** Đời sau, gần nhất trước. */
  successors: LineNode[];
  /** Văn bản cấp trên mà văn bản này quy định chi tiết. */
  parents: LegalDoc[];
  /** Văn bản mà văn bản này sửa đổi, bổ sung. */
  amends: LegalDoc[];
  /** Văn bản sửa đổi, bổ sung văn bản này. */
  amendedBy: LegalDoc[];
  /** Nhánh hướng dẫn. */
  children: Branch[];
  /** Số văn bản khác có mặt trong gia phả. */
  size: number;
}

const byTime = (a: LegalDoc, b: LegalDoc) =>
  whenOf(a).localeCompare(whenOf(b)) || a.id.localeCompare(b.id);

function linked(id: string, kind: RelationKind, dir: "out" | "in"): LegalDoc[] {
  return relations
    .filter((r) => r.kind === kind && (dir === "out" ? r.from === id : r.to === id))
    .map((r) => documentsById.get(dir === "out" ? r.to : r.from))
    .filter((d): d is LegalDoc => !!d)
    .sort(byTime);
}

/** Dòng kế tục theo một chiều, dừng ở `DEPTH` đời và không đi vòng. */
function line(id: string, dir: "out" | "in", depth: number, seen: Set<string>): LineNode[] {
  if (depth === 0) return [];
  return linked(id, "replaces", dir)
    .filter((d) => !seen.has(d.id))
    .map((doc) => {
      seen.add(doc.id);
      return { doc, next: line(doc.id, dir, depth - 1, seen) };
    });
}

function count(nodes: LineNode[]): number {
  return nodes.reduce((n, x) => n + 1 + count(x.next), 0);
}

export function familyOf(id: string): Family | null {
  const focus = documentsById.get(id);
  if (!focus) return null;
  const seen = new Set([id]);
  const ancestors = line(id, "out", DEPTH, seen);
  const successors = line(id, "in", DEPTH, seen);
  const children = linked(id, "guides", "in").map((doc) => ({
    doc,
    children: linked(doc.id, "guides", "in").filter((d) => d.id !== id),
  }));
  const parents = linked(id, "guides", "out");
  const amends = linked(id, "amends", "out");
  const amendedBy = linked(id, "amends", "in");
  const size =
    count(ancestors) +
    count(successors) +
    parents.length +
    amends.length +
    amendedBy.length +
    children.reduce((n, b) => n + 1 + b.children.length, 0);
  return { focus, ancestors, successors, parents, amends, amendedBy, children, size };
}

/**
 * Gia phả đặt ở trang chủ: gia phả lớn nhất của một văn bản còn hiệu lực.
 *
 * Chọn bằng phép đếm chứ không chọn tay, nên khi tập dữ liệu có thêm một luật
 * với nhiều nghị định hướng dẫn hơn thì trang chủ tự đổi theo. Hòa nhau thì lấy
 * văn bản có hiệu lực gần đây hơn.
 */
export const featuredFamily: Family | null = (() => {
  let best: Family | null = null;
  for (const doc of documents) {
    if (doc.status === "expired" || doc.status === "pending") continue;
    const fam = familyOf(doc.id);
    if (!fam || fam.size === 0) continue;
    if (
      !best ||
      fam.size > best.size ||
      (fam.size === best.size && whenOf(fam.focus) > whenOf(best.focus))
    ) {
      best = fam;
    }
  }
  return best;
})();

/* ── Bố cục hình gia phả ─────────────────────────────────────────────────── */

export const FAMILY = {
  nodeW: 188,
  nodeH: 58,
  focusW: 236,
  focusH: 72,
  /** Khoảng giữa hai đời trên dòng kế tục, đủ chỗ cho mũi tên. */
  genGap: 60,
  /** Khoảng giữa hai văn bản cùng hàng. */
  sibGap: 18,
  /** Khoảng giữa hai văn bản xếp chồng trong cùng một đời. */
  stackGap: 12,
  /** Khoảng dọc giữa hai hàng, chứa nhãn hàng và đường nối. */
  rowGap: 64,
  /** Số nhánh hướng dẫn tối đa trên một hàng. */
  perRow: 4,
  /** Nhánh hướng dẫn bậc hai thụt vào trong so với nhánh cha. */
  indent: 26,
  pad: 8,
};

export type Role =
  | "focus"
  | "ancestor"
  | "successor"
  | "parent"
  | "amends"
  | "amendedBy"
  | "child"
  | "grandchild";

export interface PlacedNode {
  doc: LegalDoc;
  role: Role;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PlacedEdge {
  kind: RelationKind;
  /**
   * Hai đầu của quan hệ: văn bản tác động và văn bản bị tác động. Đoạn nối dùng
   * chung của nhiều nhánh (thanh ngang, thân dọc) để trống `from`.
   */
  from: string;
  to: string;
  d: string;
  /** Đầu mũi tên, đặt ở văn bản bị tác động. Đoạn nối giữa chừng thì không có. */
  tip: { x: number; y: number; angle: number } | null;
}

export interface PlacedLabel {
  role: Exclude<Role, "focus" | "grandchild">;
  x: number;
  y: number;
  anchor: "start" | "middle" | "end";
}

export interface FamilyLayout {
  nodes: PlacedNode[];
  edges: PlacedEdge[];
  labels: PlacedLabel[];
  width: number;
  height: number;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/**
 * Xếp gia phả lên mặt phẳng.
 *
 * Bốn hàng từ trên xuống, hàng nào trống thì bỏ:
 *
 * 1. Văn bản cấp trên, văn bản được sửa đổi và văn bản sửa đổi: những quan hệ
 *    đi ra ngoài dòng dõi, xếp thành ba nhóm phía trên.
 * 2. Dòng kế tục: đời trước bên trái, văn bản đang xem ở giữa, đời sau bên
 *    phải. Thời gian chảy từ trái sang phải như dòng chữ.
 * 3. Nhánh hướng dẫn, mỗi hàng tối đa `perRow` văn bản, nối về văn bản đang
 *    xem bằng một thân dọc. Hàng không phải hàng cuối luôn có số chẵn văn bản
 *    nên thân dọc đi qua khe giữa hai văn bản, không cắt qua văn bản nào.
 * 4. Nhánh bậc hai treo ngay dưới nhánh cha, thụt vào như một dòng ghi chú.
 *
 * Mọi tọa độ tính quanh tâm văn bản đang xem rồi dịch về gốc; hàm thuần, cùng
 * gia phả thì luôn cho cùng hình.
 */
export function layoutFamily(fam: Family): FamilyLayout {
  const F = FAMILY;
  const nodes: PlacedNode[] = [];
  const edges: PlacedEdge[] = [];
  const labels: PlacedLabel[] = [];

  const place = (doc: LegalDoc, role: Role, x: number, y: number, w = F.nodeW, h = F.nodeH) => {
    const n = { doc, role, x, y, w, h };
    nodes.push(n);
    return n;
  };

  // Hàng trên.
  const upper: { role: "parent" | "amends" | "amendedBy"; docs: LegalDoc[] }[] = (
    [
      { role: "parent", docs: fam.parents },
      { role: "amends", docs: fam.amends },
      { role: "amendedBy", docs: fam.amendedBy },
    ] as const
  ).filter((g) => g.docs.length > 0);

  const generations = (roots: LineNode[]) => {
    const cols: { node: LineNode; parent: LegalDoc }[][] = [];
    let level = roots.map((node) => ({ node, parent: fam.focus }));
    while (level.length > 0) {
      cols.push(level);
      level = level.flatMap(({ node }) => node.next.map((n) => ({ node: n, parent: node.doc })));
    }
    return cols;
  };
  const leftCols = generations(fam.ancestors);
  const rightCols = generations(fam.successors);

  // Một đời có thể có hai văn bản xếp chồng, cao hơn văn bản đang xem. Hàng kế
  // tục được hạ xuống đủ để cột cao nhất không chạm hàng trên.
  const stackH = (n: number) => n * F.nodeH + (n - 1) * F.stackGap;
  const tallest = Math.max(F.focusH, ...[...leftCols, ...rightCols].map((c) => stackH(c.length)));
  const upperTop = 0;
  const spineTop = (upper.length > 0 ? F.nodeH + F.rowGap : 0) + (tallest - F.focusH) / 2;
  const spineMid = spineTop + F.focusH / 2;

  const focus = place(fam.focus, "focus", -F.focusW / 2, spineTop, F.focusW, F.focusH);

  const placed = new Map<string, PlacedNode>([[fam.focus.id, focus]]);
  let spineBottom = spineTop + F.focusH;

  const lineSide = (
    cols: { node: LineNode; parent: LegalDoc }[][],
    side: -1 | 1,
    role: "ancestor" | "successor",
  ) => {
    let sideTop = spineTop;
    cols.forEach((col, k) => {
      const top = spineMid - stackH(col.length) / 2;
      sideTop = Math.min(sideTop, top);
      const x =
        side < 0
          ? -F.focusW / 2 - F.genGap - F.nodeW - k * (F.nodeW + F.genGap)
          : F.focusW / 2 + F.genGap + k * (F.nodeW + F.genGap);
      col.forEach(({ node, parent }, i) => {
        const n = place(node.doc, role, x, top + i * (F.nodeH + F.stackGap));
        placed.set(node.doc.id, n);
        spineBottom = Math.max(spineBottom, n.y + n.h);
        const p = placed.get(parent.id)!;
        // Mũi tên luôn chỉ vào văn bản bị thay thế: bên trái là đời trước bị
        // văn bản bên phải thay, nên đầu mũi tên nằm ở mép phải của văn bản cũ.
        const older = side < 0 ? n : p;
        const newer = side < 0 ? p : n;
        const x0 = newer.x;
        const y0 = newer.y + newer.h / 2;
        const x1 = older.x + older.w;
        const y1 = older.y + older.h / 2;
        const mx = r1((x0 + x1) / 2);
        edges.push({
          kind: "replaces",
          from: newer.doc.id,
          to: older.doc.id,
          d:
            Math.abs(y0 - y1) < 0.5
              ? `M${r1(x0)} ${r1(y0)}H${r1(x1)}`
              : `M${r1(x0)} ${r1(y0)}H${mx}V${r1(y1)}H${r1(x1)}`,
          tip: { x: r1(x1), y: r1(y1), angle: Math.PI },
        });
      });
    });
    if (cols.length > 0) {
      const x = side < 0 ? -F.focusW / 2 - F.genGap : F.focusW / 2 + F.genGap;
      labels.push({ role, x, y: sideTop - 14, anchor: side < 0 ? "end" : "start" });
    }
  };
  lineSide(leftCols, -1, "ancestor");
  lineSide(rightCols, 1, "successor");

  // Hàng trên: các nhóm đặt cạnh nhau, cả hàng canh giữa trên văn bản đang xem.
  if (upper.length > 0) {
    const groupW = (g: (typeof upper)[number]) =>
      g.docs.length * F.nodeW + (g.docs.length - 1) * F.sibGap;
    const total = upper.reduce((n, g) => n + groupW(g), 0) + (upper.length - 1) * F.genGap;
    let gx = -total / 2;
    // Mỗi nhóm nối vào một điểm riêng trên mép trên của văn bản đang xem, nên
    // mũi tên đi lên và mũi tên đi xuống không chung một đường.
    const ports = upper.map((_, i) =>
      r1(-F.focusW / 2 + (F.focusW * (i + 1)) / (upper.length + 1)),
    );
    upper.forEach((g, gi) => {
      labels.push({ role: g.role, x: gx, y: upperTop - 14, anchor: "start" });
      const busY = r1(upperTop + F.nodeH + F.rowGap / 2 + (gi - (upper.length - 1) / 2) * 8);
      const port = ports[gi];
      g.docs.forEach((doc, i) => {
        const n = place(doc, g.role, gx + i * (F.nodeW + F.sibGap), upperTop);
        const cx = r1(n.x + n.w / 2);
        const top = n.y + n.h;
        const kind: RelationKind = g.role === "parent" ? "guides" : "amends";
        const path = `M${port} ${spineTop}V${busY}H${cx}V${top}`;
        // Văn bản cấp trên và văn bản được sửa đổi bị văn bản đang xem tác
        // động, nên mũi tên chỉ lên; văn bản sửa đổi thì tác động xuống.
        edges.push(
          g.role === "amendedBy"
            ? {
                kind,
                from: doc.id,
                to: fam.focus.id,
                d: `M${cx} ${top}V${busY}H${port}V${spineTop}`,
                tip: { x: port, y: spineTop, angle: Math.PI / 2 },
              }
            : {
                kind,
                from: fam.focus.id,
                to: doc.id,
                d: path,
                tip: { x: cx, y: top, angle: -Math.PI / 2 },
              },
        );
      });
      gx += groupW(g) + F.genGap;
    });
  }

  // Nhánh hướng dẫn.
  if (fam.children.length > 0) {
    const rows: Branch[][] = [];
    for (let i = 0; i < fam.children.length; i += F.perRow) {
      rows.push(fam.children.slice(i, i + F.perRow));
    }
    let top = spineBottom + F.rowGap;
    labels.push({ role: "child", x: F.focusW / 2 + 14, y: spineBottom + 22, anchor: "start" });
    const trunkTop = focus.y + focus.h;
    let trunkBottom = trunkTop;
    rows.forEach((row) => {
      const rowW = row.length * F.nodeW + (row.length - 1) * F.sibGap;
      const busY = r1(top - F.rowGap / 2 + 6);
      trunkBottom = busY;
      let rowBottom = top + F.nodeH;
      const centers: number[] = [];
      row.forEach((branch, i) => {
        const n = place(branch.doc, "child", -rowW / 2 + i * (F.nodeW + F.sibGap), top);
        const cx = r1(n.x + n.w / 2);
        centers.push(cx);
        edges.push({
          kind: "guides",
          from: branch.doc.id,
          to: fam.focus.id,
          d: `M${cx} ${top}V${busY}`,
          tip: null,
        });
        // Nhánh bậc hai: một thanh dọc bên trái nhánh cha, mỗi văn bản treo
        // vào thanh bằng một gạch ngang ngắn.
        let gy = n.y + n.h + 14;
        const railX = r1(n.x + 12);
        branch.children.forEach((gc) => {
          const g = place(gc, "grandchild", n.x + F.indent, gy, F.nodeW - F.indent);
          const mid = r1(g.y + g.h / 2);
          edges.push({
            kind: "guides",
            from: gc.id,
            to: branch.doc.id,
            d: `M${r1(g.x)} ${mid}H${railX}V${r1(n.y + n.h)}`,
            tip: { x: railX, y: r1(n.y + n.h), angle: -Math.PI / 2 },
          });
          gy += F.nodeH + F.stackGap;
          rowBottom = Math.max(rowBottom, g.y + g.h);
        });
      });
      const lo = Math.min(0, ...centers);
      const hi = Math.max(0, ...centers);
      if (hi > lo) {
        edges.push({ kind: "guides", from: "", to: fam.focus.id, d: `M${lo} ${busY}H${hi}`, tip: null });
      }
      top = rowBottom + F.rowGap;
    });
    // Thân dọc nối mọi hàng nhánh về văn bản đang xem; mũi tên ở mép dưới của
    // văn bản đang xem, vì mọi nhánh đều quy định chi tiết chính văn bản ấy.
    edges.push({
      kind: "guides",
      from: "",
      to: fam.focus.id,
      d: `M0 ${r1(trunkBottom)}V${r1(trunkTop)}`,
      tip: { x: 0, y: r1(trunkTop), angle: -Math.PI / 2 },
    });
  }

  // Dịch mọi thứ về gốc tọa độ, chừa lề cho nhãn hàng.
  const minX = Math.min(...nodes.map((n) => n.x), ...labels.map((l) => l.x - (l.anchor === "end" ? 150 : 0)));
  const maxX = Math.max(...nodes.map((n) => n.x + n.w), ...labels.map((l) => l.x + (l.anchor === "start" ? 150 : 0)));
  const minY = Math.min(...nodes.map((n) => n.y), ...labels.map((l) => l.y - 12));
  const maxY = Math.max(...nodes.map((n) => n.y + n.h));
  const dx = F.pad - minX;
  const dy = F.pad - minY;

  const shiftPath = (d: string) =>
    d.replace(/([MHV])(-?[\d.]+)(?: (-?[\d.]+))?/g, (_, cmd: string, a: string, b?: string) => {
      if (cmd === "M") return `M${r1(+a + dx)} ${r1(+b! + dy)}`;
      if (cmd === "H") return `H${r1(+a + dx)}`;
      return `V${r1(+a + dy)}`;
    });

  return {
    nodes: nodes.map((n) => ({ ...n, x: r1(n.x + dx), y: r1(n.y + dy) })),
    edges: edges.map((e) => ({
      ...e,
      d: shiftPath(e.d),
      tip: e.tip && { ...e.tip, x: r1(e.tip.x + dx), y: r1(e.tip.y + dy) },
    })),
    labels: labels.map((l) => ({ ...l, x: r1(l.x + dx), y: r1(l.y + dy) })),
    width: Math.ceil(maxX - minX + 2 * F.pad),
    height: Math.ceil(maxY - minY + 2 * F.pad),
  };
}
