import Link from "next/link";

import type { Lang, LegalDoc, RelationKind } from "@/data/types";
import { getDict } from "@/i18n/dictionary";
import { getFamilyCopy } from "@/i18n/family";
import { yearOf } from "@/lib/corpus";
import { type Family, type LineNode, layoutFamily, type PlacedNode } from "@/lib/family";

/**
 * Gia phả của một văn bản, vẽ thành hình và viết thành phả ký.
 *
 * `FamilyChart` là hình: dòng kế tục nằm ngang ở giữa, các quan hệ ra ngoài
 * dòng dõi ở trên, nhánh hướng dẫn ở dưới. Ba kiểu nét dùng đúng quy ước của
 * cây lĩnh vực — liền cho quy định chi tiết, đứt cho sửa đổi, chấm đỏ cho thay
 * thế — và mũi tên luôn chỉ vào văn bản bị tác động. Mỗi văn bản là một liên
 * kết thật, dùng được bằng bàn phím, mang tên đầy đủ trong `aria-label`.
 *
 * `FamilyList` là phả ký: cùng gia phả viết thành danh sách có tiêu đề, tên văn
 * bản đầy đủ không cắt, đi kèm hình trên màn hình rộng. Hình rộng hơn màn hình
 * điện thoại nên chỉ hiện từ cỡ máy tính bảng; trên điện thoại, `FamilyStack`
 * dựng cùng gia phả theo chiều dọc.
 *
 * Cả ba là thành phần máy chủ, không một byte JavaScript nào.
 */

function head(x: number, y: number, angle: number, size = 7): string {
  const p = (a: number) =>
    `${(x - Math.cos(a) * size).toFixed(1)},${(y - Math.sin(a) * size).toFixed(1)}`;
  return `${x},${y} ${p(angle - 0.42)} ${p(angle + 0.42)}`;
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

function Node({ n, lang, linkFocus }: { n: PlacedNode; lang: Lang; linkFocus: boolean }) {
  const t = getDict(lang);
  const c = getFamilyCopy(lang);
  const focus = n.role === "focus";
  const year = yearOf(n.doc);
  // Số ký tự mỗi dòng theo bề rộng thẻ: nhánh bậc hai thụt vào nên hẹp hơn.
  const [l1, l2] = twoLines(n.doc.title[lang], focus ? 35 : Math.floor((n.w - 24) / 5.6));
  const pad = focus ? 14 : 12;
  const top = focus ? 34 : 19;

  const body = (
    <>
      <title>{`${n.doc.number} — ${n.doc.title[lang]}`}</title>
      <rect x={n.x} y={n.y} width={n.w} height={n.h} className="family-box" />
      <rect x={n.x} y={n.y} width={focus ? n.w : 3} height={focus ? 3 : n.h} className="family-bar" />
      {focus && (
        <text x={n.x + pad} y={n.y + 17} className="family-tag">
          {c.focusTag}
        </text>
      )}
      {year > 0 && (
        <text x={n.x + n.w - 10} y={n.y + (focus ? 17 : 19)} className="family-year" textAnchor="end">
          {year}
        </text>
      )}
      <text x={n.x + pad} y={n.y + top} className="family-number">
        {n.doc.number}
      </text>
      <text x={n.x + pad} y={n.y + top + (focus ? 17 : 15)} className="family-title">
        {l1}
      </text>
      {l2 && (
        <text x={n.x + pad} y={n.y + top + (focus ? 31 : 28)} className="family-title">
          {l2}
        </text>
      )}
    </>
  );

  const cls = `family-node role-${n.role} is-${n.doc.status}`;
  const label = `${focus ? c.role.focus.short : c.role[n.role === "grandchild" ? "child" : n.role].short}: ${n.doc.number}, ${n.doc.title[lang]}, ${t.status[n.doc.status]}`;

  if (focus && !linkFocus) {
    return (
      <g className={cls} role="img" aria-label={label}>
        {body}
      </g>
    );
  }
  return (
    <a href={`/${lang}/van-ban/${n.doc.id}`} className={cls} aria-label={label}>
      {body}
    </a>
  );
}

export function FamilyChart({
  fam,
  lang,
  linkFocus = false,
  className,
}: {
  fam: Family;
  lang: Lang;
  /** Trang chủ cho văn bản đang xem thành liên kết; trang văn bản thì không cần. */
  linkFocus?: boolean;
  className?: string;
}) {
  const c = getFamilyCopy(lang);
  const layout = layoutFamily(fam);

  return (
    <div className={`family-scroll thin-scroll ${className ?? ""}`}>
      <svg
        className="family"
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        // Hình co theo khung tới bốn phần năm cỡ thật; hẹp hơn nữa thì chữ quá
        // nhỏ để đọc, nên khung cuộn ngang thay vì co tiếp.
        style={{ width: "100%", maxWidth: layout.width, minWidth: Math.round(layout.width * 0.8) }}
        role="group"
        aria-label={`${c.chartLabel} ${fam.focus.number}`}
      >
        <g aria-hidden="true">
          {layout.labels.map((l) => (
            <text key={l.role} x={l.x} y={l.y} textAnchor={l.anchor} className="family-label">
              {c.role[l.role].short}
            </text>
          ))}
          {layout.edges.map((e, i) => (
            <g key={i} className={`family-edge family-edge-${e.kind}`}>
              <path d={e.d} />
              {e.tip && <polygon points={head(e.tip.x, e.tip.y, e.tip.angle)} />}
            </g>
          ))}
        </g>
        {layout.nodes.map((n) => (
          <Node key={`${n.role}-${n.doc.id}`} n={n} lang={lang} linkFocus={linkFocus} />
        ))}
      </svg>
    </div>
  );
}

/** Chú giải ba kiểu nét và khung hết hiệu lực. */
export function FamilyLegend({ lang }: { lang: Lang }) {
  const c = getFamilyCopy(lang);
  const kinds: RelationKind[] = ["guides", "amends", "replaces"];
  return (
    <div className="family-legend">
      <p className="eyebrow">{c.legendTitle}</p>
      <ul>
        {kinds.map((k) => (
          <li key={k}>
            <svg viewBox="0 0 34 10" aria-hidden="true" focusable="false" className={`family-edge family-edge-${k}`}>
              <path d="M2 5H30" />
            </svg>
            {c.legend[k]}
          </li>
        ))}
        <li>
          <svg viewBox="0 0 34 14" aria-hidden="true" focusable="false" className="family-legend-box">
            <rect x="1" y="1" width="32" height="12" />
          </svg>
          {c.legend.expired}
        </li>
      </ul>
      <p className="family-legend-hint">{c.hint}</p>
    </div>
  );
}

function Item({ doc, lang, children }: { doc: LegalDoc; lang: Lang; children?: React.ReactNode }) {
  const t = getDict(lang);
  const flagged = doc.status === "expired" || doc.status === "pending";
  return (
    <li className={`family-item is-${doc.status}`}>
      <Link href={`/${lang}/van-ban/${doc.id}`} className="group family-item-link">
        <span className="family-item-number tnum">{doc.number}</span>
        <span className="family-item-body">
          <span className="family-item-title">{doc.title[lang]}</span>
          {flagged && <span className="family-item-status">{t.status[doc.status]}</span>}
        </span>
      </Link>
      {children}
    </li>
  );
}

function LineItems({ nodes, lang }: { nodes: LineNode[]; lang: Lang }) {
  return (
    <>
      {nodes.map((n) => (
        <Item key={n.doc.id} doc={n.doc} lang={lang}>
          {n.next.length > 0 && (
            <ul className="family-sublist">
              <LineItems nodes={n.next} lang={lang} />
            </ul>
          )}
        </Item>
      ))}
    </>
  );
}

/**
 * Phả ký: gia phả viết thành danh sách. Thứ tự nhóm đi theo câu hỏi người đọc
 * hay hỏi trước: văn bản này thay ai, ai thay nó, nó đã bị sửa những gì, rồi
 * mới tới văn bản cấp trên và các nhánh hướng dẫn.
 */
export function FamilyList({
  fam,
  lang,
  showFocus = false,
  className,
}: {
  fam: Family;
  lang: Lang;
  showFocus?: boolean;
  className?: string;
}) {
  const c = getFamilyCopy(lang);
  const groups: { key: string; title: string; body: React.ReactNode }[] = [];
  if (fam.ancestors.length > 0)
    groups.push({ key: "a", title: c.role.ancestor.full, body: <LineItems nodes={fam.ancestors} lang={lang} /> });
  if (fam.successors.length > 0)
    groups.push({ key: "s", title: c.role.successor.full, body: <LineItems nodes={fam.successors} lang={lang} /> });
  const flat = (key: string, title: string, docs: LegalDoc[]) => {
    if (docs.length > 0)
      groups.push({
        key,
        title,
        body: docs.map((d) => <Item key={d.id} doc={d} lang={lang} />),
      });
  };
  flat("ab", c.role.amendedBy.full, fam.amendedBy);
  flat("am", c.role.amends.full, fam.amends);
  flat("p", c.role.parent.full, fam.parents);
  if (fam.children.length > 0)
    groups.push({
      key: "c",
      title: c.role.child.full,
      body: fam.children.map((b) => (
        <Item key={b.doc.id} doc={b.doc} lang={lang}>
          {b.children.length > 0 && (
            <ul className="family-sublist" aria-label={c.grandchild}>
              {b.children.map((g) => (
                <Item key={g.id} doc={g} lang={lang} />
              ))}
            </ul>
          )}
        </Item>
      )),
    });

  return (
    <div className={`family-list ${className ?? ""}`}>
      {showFocus && (
        <Link href={`/${lang}/van-ban/${fam.focus.id}`} className="family-list-focus">
          <span className="eyebrow">{c.role.focus.short}</span>
          <span className="family-item-number tnum">{fam.focus.number}</span>
          <span className="family-item-title">{fam.focus.title[lang]}</span>
        </Link>
      )}
      {groups.length === 0 ? (
        <p className="text-sm text-[var(--ink-3)]">{c.empty}</p>
      ) : (
        groups.map((g) => (
          <section key={g.key} className="family-group">
            <h3 className="family-group-title">{g.title}</h3>
            <ul>{g.body}</ul>
          </section>
        ))
      )}
    </div>
  );
}

/** Các đời trên dòng kế tục, đời gần văn bản đang xem trước. */
function generationsOf(nodes: LineNode[]): LegalDoc[][] {
  const out: LegalDoc[][] = [];
  let level = nodes;
  while (level.length > 0) {
    out.push(level.map((n) => n.doc));
    level = level.flatMap((n) => n.next);
  }
  return out;
}

/**
 * Gia phả dựng dọc cho màn hình hẹp.
 *
 * Cùng bố cục với hình rộng, xoay chín mươi độ: quan hệ ra ngoài dòng dõi ở
 * trên, dòng kế tục ở giữa với thời gian chảy từ trên xuống — đời xa nhất trên
 * cùng, văn bản đang xem, rồi các đời sau — và nhánh hướng dẫn ở dưới. Mỗi nhóm
 * nối bằng một đường dọc theo đúng kiểu nét của hình rộng: chấm đỏ cho thay thế,
 * nét đứt cho sửa đổi, nét liền màu đồng cho quy định chi tiết. Toàn bộ là danh
 * sách HTML có tiêu đề, nên trình đọc màn hình đọc được như phả ký.
 */
export function FamilyStack({
  fam,
  lang,
  linkFocus = false,
  className,
}: {
  fam: Family;
  lang: Lang;
  linkFocus?: boolean;
  className?: string;
}) {
  const c = getFamilyCopy(lang);
  const older = generationsOf(fam.ancestors).reverse();
  const newer = generationsOf(fam.successors);
  const upper = (
    [
      ["parent", "guides", fam.parents],
      ["amends", "amends", fam.amends],
      ["amendedBy", "amends", fam.amendedBy],
    ] as const
  ).filter(([, , docs]) => docs.length > 0);

  const focus = (
    <>
      <span className="eyebrow">{c.role.focus.short}</span>
      <span className="family-item-number tnum">{fam.focus.number}</span>
      <span className="family-item-title">{fam.focus.title[lang]}</span>
    </>
  );

  return (
    <div className={`family-stack ${className ?? ""}`}>
      {upper.map(([role, kind, docs]) => (
        <section key={role} className={`stack-group stack-${kind}`}>
          <h3 className="family-group-title">{c.role[role].full}</h3>
          <ul>
            {docs.map((d) => (
              <Item key={d.id} doc={d} lang={lang} />
            ))}
          </ul>
        </section>
      ))}

      <section className="stack-group stack-replaces stack-spine">
        {older.length > 0 && <h3 className="family-group-title">{c.role.ancestor.full}</h3>}
        <ol>
          {older.map((gen, i) => (
            <li key={`o${i}`}>
              <ul>
                {gen.map((d) => (
                  <Item key={d.id} doc={d} lang={lang} />
                ))}
              </ul>
            </li>
          ))}
          <li className="stack-focus">
            {linkFocus ? (
              <Link href={`/${lang}/van-ban/${fam.focus.id}`} className="family-list-focus">
                {focus}
              </Link>
            ) : (
              <div className="family-list-focus">{focus}</div>
            )}
          </li>
          {newer.map((gen, i) => (
            <li key={`n${i}`}>
              {i === 0 && <h3 className="family-group-title">{c.role.successor.full}</h3>}
              <ul>
                {gen.map((d) => (
                  <Item key={d.id} doc={d} lang={lang} />
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      {fam.children.length > 0 && (
        <section className="stack-group stack-guides">
          <h3 className="family-group-title">{c.role.child.full}</h3>
          <ul>
            {fam.children.map((b) => (
              <Item key={b.doc.id} doc={b.doc} lang={lang}>
                {b.children.length > 0 && (
                  <ul className="stack-sub" aria-label={c.grandchild}>
                    {b.children.map((g) => (
                      <Item key={g.id} doc={g} lang={lang} />
                    ))}
                  </ul>
                )}
              </Item>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
