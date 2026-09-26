import type { DocStatus, Lang, LegalDoc, RelationKind } from "@/data/types";
import { getDict } from "@/i18n/dictionary";
import { yearOf } from "@/lib/corpus";
import { familyOf, featuredFamily } from "@/lib/family";
import { validitySegments } from "@/lib/validity";
import type { ValiditySegment } from "@/lib/validity-segment";

/**
 * Hình dòng đời thu nhỏ ở đầu trang chủ.
 *
 * Dựng từ gia phả tiêu biểu (`featuredFamily`, chọn bằng phép đếm), không từ
 * một ví dụ vẽ tay: đời trước của văn bản đứng giữa, các văn bản đã sửa đổi đời
 * trước ấy, văn bản đứng giữa, rồi tối đa ba nhánh hướng dẫn. Mỗi đường nối là
 * một quan hệ có thật, mũi tên chỉ vào văn bản bị tác động — cùng quy ước với
 * hình gia phả đầy đủ trên trang văn bản.
 *
 * Bố cục tính sẵn ở máy chủ; phần trình duyệt chỉ đổi lớp khi rê chuột.
 */

export interface HeroNode {
  id: string;
  number: string;
  title: string;
  kicker: string;
  status: DocStatus;
  segs: ValiditySegment[];
  role: "focus" | "ancestor" | "amender" | "child";
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface HeroEdge {
  id: string;
  from: string;
  to: string;
  kind: RelationKind;
  d: string;
  tip: { x: number; y: number; angle: number };
  label?: { x: number; y: number; text: string; anchor: "start" | "middle" | "end" };
}

export interface HeroLineageLayout {
  nodes: HeroNode[];
  edges: HeroEdge[];
  width: number;
  height: number;
  focusNumber: string;
}

const W = 150;
const H = 62;
const FW = 168;
const COL = 18;
const RIGHT = 342;
const WIDTH = 520;

const LINK: Record<Lang, Record<RelationKind, string>> = {
  vi: { guides: "hướng dẫn", amends: "sửa đổi", replaces: "thay thế" },
  en: { guides: "implements", amends: "amends", replaces: "replaces" },
};

export function heroLineage(lang: Lang): HeroLineageLayout | null {
  const fam = featuredFamily;
  if (!fam) return null;
  const t = getDict(lang);
  const link = LINK[lang];

  const node = (doc: LegalDoc, role: HeroNode["role"], x: number, y: number, w = W): HeroNode => {
    const year = yearOf(doc);
    return {
      id: doc.id,
      number: doc.number,
      title: doc.title[lang],
      kicker: `${t.type[doc.type]}${year ? ` · ${year}` : ""}`,
      status: doc.status,
      segs: validitySegments(doc),
      role,
      x,
      y,
      w,
      h: H,
    };
  };

  const nodes: HeroNode[] = [];
  const edges: HeroEdge[] = [];
  const ancestor = fam.ancestors[0]?.doc;
  const amenders = ancestor ? (familyOf(ancestor.id)?.amendedBy ?? []).slice(0, 1) : [];

  let y = 24;
  if (ancestor) {
    const a = node(ancestor, "ancestor", COL, y);
    nodes.push(a);
    for (const am of amenders) {
      const m = node(am, "amender", RIGHT, y);
      nodes.push(m);
      const my = y + H / 2;
      edges.push({
        id: `${am.id}>${ancestor.id}`,
        from: am.id,
        to: ancestor.id,
        kind: "amends",
        d: `M${m.x} ${my}H${a.x + a.w}`,
        tip: { x: a.x + a.w, y: my, angle: Math.PI },
        label: { x: (m.x + a.x + a.w) / 2, y: my - 8, text: link.amends, anchor: "middle" },
      });
    }
    y += H + 84;
  }

  const f = node(fam.focus, "focus", COL, y, FW);
  nodes.push(f);
  const fcx = f.x + f.w / 2;
  if (ancestor) {
    const a = nodes[0];
    const acx = a.x + a.w / 2;
    edges.push({
      id: `${fam.focus.id}>${ancestor.id}`,
      from: fam.focus.id,
      to: ancestor.id,
      kind: "replaces",
      d: `M${acx} ${f.y}V${a.y + a.h}`,
      tip: { x: acx, y: a.y + a.h, angle: -Math.PI / 2 },
      label: { x: acx + 10, y: (f.y + a.y + a.h) / 2 + 4, text: link.replaces, anchor: "start" },
    });
  }

  const kids = fam.children.slice(0, 3).map((b) => b.doc);
  if (kids.length) {
    const cy = y + H + 88;
    const busY = y + H + 44;
    const step = (WIDTH - 2 * COL - W) / Math.max(kids.length - 1, 1);
    kids.forEach((k, i) => {
      const x = kids.length === 1 ? COL : COL + i * step;
      const c = node(k, "child", x, cy);
      nodes.push(c);
      const ccx = c.x + c.w / 2;
      edges.push({
        id: `${k.id}>${fam.focus.id}`,
        from: k.id,
        to: fam.focus.id,
        kind: "guides",
        d: `M${ccx} ${cy}V${busY}H${fcx}V${f.y + f.h}`,
        tip: { x: fcx, y: f.y + f.h, angle: -Math.PI / 2 },
        ...(i === 0
          ? { label: { x: fcx + 10, y: busY - 10, text: link.guides, anchor: "start" as const } }
          : {}),
      });
    });
    y = cy;
  }

  return {
    nodes,
    edges,
    width: WIDTH,
    height: y + H + 20,
    focusNumber: fam.focus.number,
  };
}
