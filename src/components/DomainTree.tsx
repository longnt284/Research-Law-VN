import type { Lang, LegalDoc, Relation } from "@/data/types";
import { getDict } from "@/i18n/dictionary";
import { getHome } from "@/i18n/home";
import { buildTree, TREE } from "@/lib/tree";

/**
 * Cây văn bản của một lĩnh vực: mỗi cột một tầng hiệu lực, mỗi đường một quan hệ.
 *
 * Thay cho khối quan hệ ba chiều trước đây. Cùng dữ liệu, nhưng đọc được ngay
 * mà không phải xoay: luật ở cột trái, văn bản hướng dẫn ở các cột bên phải,
 * mũi tên chỉ vào văn bản bị tác động. Ba kiểu nét dùng đúng quy ước của gia phả
 * — liền cho quy định chi tiết, đứt cho sửa đổi, chấm đỏ cho thay thế — nên
 * người đọc không phải học hai bộ ký hiệu.
 *
 * Thành phần máy chủ, SVG tĩnh. Mỗi văn bản là một liên kết thật, dùng được
 * bằng bàn phím; cây rộng hơn màn hình thì cuộn ngang trong khung của nó chứ
 * không đẩy cả trang.
 */

const HEAD = 30;

/** Bỏ tên loại ở đầu tiêu đề: số hiệu đã nói loại văn bản, lặp lại chỉ tốn chỗ. */
function shortTitle(doc: LegalDoc, lang: Lang, typeLabel: string): string {
  const title = doc.title[lang];
  return title.toLowerCase().startsWith(typeLabel.toLowerCase() + " ")
    ? title.slice(typeLabel.length + 1).replace(/^./, (c) => c.toUpperCase())
    : title;
}

/** Ngắt tiêu đề thành tối đa hai dòng theo số ký tự, dòng hai cắt bằng dấu ba chấm. */
function twoLines(text: string, max: number): [string, string] {
  if (text.length <= max) return [text, ""];
  const words = text.split(" ");
  let first = "";
  let i = 0;
  while (i < words.length && (first + " " + words[i]).trim().length <= max) {
    first = (first + " " + words[i]).trim();
    i++;
  }
  let rest = words.slice(i).join(" ");
  if (rest.length > max) rest = rest.slice(0, max - 1).trimEnd() + "…";
  return [first || text.slice(0, max), rest];
}

function head(x: number, y: number, angle: number, size = 7): string {
  const p = (a: number) =>
    `${(x - Math.cos(a) * size).toFixed(1)},${(y - Math.sin(a) * size).toFixed(1)}`;
  return `${x},${y} ${p(angle - 0.42)} ${p(angle + 0.42)}`;
}

export function DomainTree({
  lang,
  docs,
  relations,
  label,
}: {
  lang: Lang;
  docs: LegalDoc[];
  relations: Relation[];
  /** Nhãn của cả hình cho trình đọc màn hình. */
  label: string;
}) {
  const t = getDict(lang);
  const tierNames = getHome(lang).hierarchy.tierNames;
  const tree = buildTree(docs, relations);
  const { nodeW, nodeH } = TREE;

  return (
    <div className="tree-scroll thin-scroll">
      <svg
        className="tree"
        viewBox={`0 0 ${tree.width} ${tree.height + HEAD}`}
        width={tree.width}
        height={tree.height + HEAD}
        role="group"
        aria-label={label}
      >
        {tree.tiers.map((tier, c) => (
          <text key={tier} x={tree.columnX[c]} y={16} className="tree-col">
            {tierNames[tier]}
          </text>
        ))}

        <g transform={`translate(0 ${HEAD})`}>
          <g aria-hidden="true">
            {tree.edges.map((e, i) => (
              <g key={i} className={`tree-edge tree-edge-${e.kind}`}>
                <path d={e.d} />
                <polygon points={head(e.tip.x, e.tip.y, e.tip.angle)} />
              </g>
            ))}
          </g>

          {tree.nodes.map((n) => {
            const typeLabel = t.type[n.doc.type];
            const [l1, l2] = twoLines(shortTitle(n.doc, lang, typeLabel), 34);
            return (
              <a
                key={n.doc.id}
                href={`/${lang}/van-ban/${n.doc.id}`}
                className={`tree-node is-${n.doc.status}`}
                aria-label={`${n.doc.number}, ${n.doc.title[lang]}, ${t.status[n.doc.status]}`}
              >
                <rect x={n.x} y={n.y} width={nodeW} height={nodeH} className="tree-box" />
                <rect x={n.x} y={n.y} width={3} height={nodeH} className="tree-bar" />
                <text x={n.x + 12} y={n.y + 17} className="tree-number">
                  {n.doc.number}
                </text>
                <text x={n.x + 12} y={n.y + 32} className="tree-title">
                  {l1}
                </text>
                {l2 && (
                  <text x={n.x + 12} y={n.y + 45} className="tree-title">
                    {l2}
                  </text>
                )}
              </a>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
