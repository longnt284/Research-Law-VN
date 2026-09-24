import { DomainGlyph } from "@/components/art/DomainGlyph";
import { domains, LATEST_VERIFIED_ON } from "@/data/documents";
import type { Lang } from "@/data/types";
import { getHome } from "@/i18n/home";
import { tierCounts } from "@/lib/corpus";

/**
 * Hình minh họa ở đầu các trang và trên thẻ lối vào của trang chủ.
 *
 * Trước đây chỗ này là hình chiếu của một khối điểm ba chiều. Người làm luật
 * nhìn vào đó không đọc ra được gì. Mỗi hình ở đây vẽ đúng cái vật mà trang dẫn
 * tới làm việc với: bản đồ là một luật cùng các nghị định, thông tư quanh nó;
 * danh mục là tháp thứ bậc; đối chiếu là hai trang văn bản có chỗ gạch, chỗ
 * chèn; phương pháp là kính lúp trên số hiệu và danh sách những gì đã kiểm.
 *
 * Tất cả là SVG dựng ở máy chủ: có mặt khi JavaScript bị chặn, không tải thêm
 * tài nguyên nào nên chính sách `default-src 'self'` không phải nới. Số liệu
 * trên hình — số văn bản mỗi tầng, ngày tra cứu — đếm thẳng từ tập dữ liệu.
 * Chuyển động nằm trong CSS, dừng khi hệ điều hành báo giảm chuyển động hoặc
 * khi người đọc bấm nút dừng ở trang chủ.
 */

const W = 320;
const H = 200;

const L = {
  vi: {
    law: "Luật",
    oldLaw: "Luật cũ",
    amending: "Luật sửa đổi",
    decree: "Nghị định",
    circular: "Thông tư",
    constitution: "Hiến pháp",
    oldText: "Văn bản cũ",
    newText: "Văn bản mới",
    article: "Điều 38",
    checks: ["Số hiệu", "Ngày hiệu lực", "Nguồn đã mở"],
    stamp: "ĐÃ TRA",
  },
  en: {
    law: "Law",
    oldLaw: "Former law",
    amending: "Amending law",
    decree: "Decree",
    circular: "Circular",
    constitution: "Constitution",
    oldText: "Earlier text",
    newText: "Later text",
    article: "Article 38",
    checks: ["Number", "Date of force", "Source opened"],
    stamp: "CHECKED",
  },
} as const;

function Frame({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <svg
      className={`art ${className}`}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/** Đầu mũi tên tam giác đặt ở điểm cuối của đoạn thẳng. Không dùng `<marker>` để khỏi lo trùng id giữa nhiều hình. */
function head(x1: number, y1: number, x2: number, y2: number, size = 6): string {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const p = (ang: number) =>
    `${(x2 - Math.cos(ang) * size).toFixed(1)},${(y2 - Math.sin(ang) * size).toFixed(1)}`;
  return `${x2},${y2} ${p(a - 0.45)} ${p(a + 0.45)}`;
}

function Arrow({
  x1,
  y1,
  x2,
  y2,
  kind,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  kind: "guides" | "amends" | "replaces";
}) {
  return (
    <g className={`art-edge art-edge-${kind}`}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <polygon points={head(x1, y1, x2, y2)} />
    </g>
  );
}

/** Thẻ bản đồ: một luật ở giữa, văn bản cũ nó thay thế, luật sửa đổi nó, và các văn bản hướng dẫn. */
export function MapArt({ lang }: { lang: Lang }) {
  const l = L[lang];
  return (
    <Frame className="art-map">
      <Arrow x1={144} y1={58} x2={78} y2={58} kind="replaces" />
      <Arrow x1={246} y1={58} x2={177} y2={58} kind="amends" />
      <Arrow x1={116} y1={127} x2={150} y2={75} kind="guides" />
      <Arrow x1={204} y1={127} x2={170} y2={75} kind="guides" />
      <Arrow x1={252} y1={154} x2={221} y2={142} kind="guides" />

      <rect x={49} y={45} width={26} height={26} className="art-law art-expired" />
      <circle cx={160} cy={58} r={24} className="art-pulse" />
      <rect x={145} y={43} width={30} height={30} className="art-law art-focus" />
      <rect x={249} y={46} width={24} height={24} className="art-law" />
      <circle cx={112} cy={138} r={11} className="art-decree" />
      <circle cx={208} cy={138} r={11} className="art-decree" />
      <polygon points="264,142 276,164 252,164" className="art-circular" />

      <text x={62} y={90} className="art-label" textAnchor="middle">{l.oldLaw}</text>
      <text x={160} y={92} className="art-label art-label-strong" textAnchor="middle">{l.law}</text>
      <text x={261} y={88} className="art-label" textAnchor="middle">{l.amending}</text>
      <text x={112} y={166} className="art-label" textAnchor="middle">{l.decree}</text>
      <text x={196} y={170} className="art-label" textAnchor="middle">{l.decree}</text>
      <text x={264} y={180} className="art-label" textAnchor="middle">{l.circular}</text>
    </Frame>
  );
}

/**
 * Thẻ danh mục: tháp thứ bậc. Đỉnh tháp là Hiến pháp, vẽ nhạt vì không nằm trong
 * tập dữ liệu; bốn tầng dưới mang số văn bản thật của từng tầng.
 */
export function HierarchyArt({ lang }: { lang: Lang }) {
  const l = L[lang];
  const cx = 96;
  const top = 12;
  const hw = (y: number) => (y - top) * 0.5;
  const band = (y0: number, y1: number) =>
    `${cx - hw(y0)},${y0} ${cx + hw(y0)},${y0} ${cx + hw(y1)},${y1} ${cx - hw(y1)},${y1}`;
  const rows = [0, 1, 2, 3].map((i) => {
    const y0 = 50 + i * 36;
    return { i, y0, y1: y0 + 31 };
  });
  return (
    <Frame className="art-hier">
      <polygon points={`${cx},${top} ${cx + hw(45)},45 ${cx - hw(45)},45`} className="art-tier art-tier-apex" />
      <line x1={cx + hw(30)} y1={30} x2={196} y2={30} className="art-leader" />
      <text x={202} y={34} className="art-label art-dim">{l.constitution}</text>
      {rows.map(({ i, y0, y1 }) => (
        <g key={i} className="art-tier-row" style={{ "--i": i } as React.CSSProperties}>
          <polygon points={band(y0, y1)} className={`art-tier art-tier-${i}`} />
          <line
            x1={cx + hw((y0 + y1) / 2)}
            y1={(y0 + y1) / 2}
            x2={196}
            y2={(y0 + y1) / 2}
            className="art-leader"
          />
          <text x={202} y={(y0 + y1) / 2 + 4} className="art-label">
            {getHome(lang).hierarchy.tierShort[i]}
          </text>
          <text x={306} y={(y0 + y1) / 2 + 4} className="art-count" textAnchor="end">
            {tierCounts[i]}
          </text>
        </g>
      ))}
    </Frame>
  );
}

function Page({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const f = 14;
  return (
    <g className="art-page">
      <path d={`M${x} ${y}h${w - f}l${f} ${f}v${h - f}h${-w}z`} />
      <path d={`M${x + w - f} ${y}v${f}h${f}`} className="art-fold" />
    </g>
  );
}

function Lines({ x, ys, widths }: { x: number; ys: number[]; widths: number[] }) {
  return (
    <>
      {ys.map((y, i) => (
        <rect key={y} x={x} y={y} width={widths[i % widths.length]} height={4} rx={2} className="art-text" />
      ))}
    </>
  );
}

/** Thẻ đối chiếu: hai trang cùng một điều, trang cũ có dòng bị bỏ, trang mới có dòng được chèn. */
export function CompareArt({ lang }: { lang: Lang }) {
  const l = L[lang];
  return (
    <Frame className="art-compare">
      <text x={36} y={16} className="art-label">{l.oldText}</text>
      <text x={176} y={16} className="art-label">{l.newText}</text>

      <Page x={36} y={24} w={108} h={156} />
      <text x={48} y={46} className="art-heading">{l.article}</text>
      <Lines x={48} ys={[58, 68, 78]} widths={[84, 76, 80]} />
      <rect x={48} y={92} width={78} height={4} rx={2} className="art-text art-del" />
      <line x1={45} y1={94} x2={129} y2={94} className="art-strike" />
      <Lines x={48} ys={[106, 116, 130, 140, 150]} widths={[82, 70, 84, 60, 76]} />

      <Page x={176} y={24} w={108} h={156} />
      <text x={188} y={46} className="art-heading">{l.article}</text>
      <Lines x={188} ys={[58, 68, 78]} widths={[84, 76, 80]} />
      <rect x={185} y={88} width={88} height={24} className="art-insert" />
      <rect x={188} y={92} width={80} height={4} rx={2} className="art-text art-ins" />
      <rect x={188} y={102} width={62} height={4} rx={2} className="art-text art-ins" />
      <Lines x={188} ys={[120, 130, 140, 150]} widths={[82, 70, 84, 60]} />

      <Arrow x1={148} y1={100} x2={172} y2={100} kind="replaces" />
    </Frame>
  );
}

/** Thẻ phương pháp: kính lúp trên số hiệu, danh sách những gì đã kiểm, và con dấu ngày tra. */
export function MethodArt({ lang }: { lang: Lang }) {
  const l = L[lang];
  // Con dấu ghi ngày dạng số ở cả hai thứ tiếng: ngày viết bằng chữ tiếng Anh
  // dài gấp đôi và tràn khỏi vòng dấu.
  const [y, m, d] = LATEST_VERIFIED_ON.split("-");
  const date = `${d}.${m}.${y}`;
  return (
    <Frame className="art-method">
      <Page x={30} y={22} w={116} h={156} />
      <Lines x={42} ys={[42, 52, 62, 118, 128, 138, 148, 158]} widths={[88, 70, 92, 84, 64, 90, 72, 80]} />

      <g className="art-lens">
        <circle cx={104} cy={90} r={36} className="art-lens-glass" />
        <text x={104} y={87} className="art-lens-text" textAnchor="middle">135/2025</text>
        <text x={104} y={101} className="art-lens-text" textAnchor="middle">/QH15</text>
        <line x1={130} y1={116} x2={150} y2={136} className="art-lens-handle" />
      </g>

      {l.checks.map((label, i) => {
        const y = 44 + i * 30;
        return (
          <g key={label} className="art-check" style={{ "--i": i } as React.CSSProperties}>
            <rect x={178} y={y - 10} width={14} height={14} className="art-box" />
            <path d={`M181 ${y - 3}l3 4 6-8`} className="art-tick" />
            <text x={200} y={y + 1} className="art-label">{label}</text>
          </g>
        );
      })}

      <g className="art-stamp" transform="rotate(-10 252 156)">
        <circle cx={252} cy={156} r={30} />
        <circle cx={252} cy={156} r={25} className="art-stamp-inner" />
        <text x={252} y={153} textAnchor="middle" className="art-stamp-text">{l.stamp}</text>
        <text x={252} y={166} textAnchor="middle" className="art-stamp-date">{date}</text>
      </g>
    </Frame>
  );
}

/**
 * Ngắt tên lĩnh vực thành tối đa hai dòng cho vừa ô. Chỉ ngắt giữa hai từ, không
 * cắt cụt: cắt "Đối tác công tư" thành "Đối tác công" thì sai nghĩa, còn hai dòng
 * "Đối tác / công tư" thì đọc được. Tên có dấu "&" chỉ lấy vế đầu.
 */
function labelLines(label: string, max = 10): string[] {
  const words = label.split(/\s*[&,]\s*/)[0].split(" ");
  const lines: string[] = [words[0]];
  for (const w of words.slice(1)) {
    const last = lines[lines.length - 1];
    if ((last + " " + w).length <= max) lines[lines.length - 1] = last + " " + w;
    else lines.push(w);
  }
  return lines.slice(0, 2);
}

/** Thẻ lĩnh vực: biểu tượng của từng lĩnh vực, tô theo sắc lĩnh vực dùng chung với bản đồ. */
export function DomainsArt({ lang }: { lang: Lang }) {
  const cols = Math.ceil(domains.length / 2);
  const cw = W / cols;
  return (
    <Frame className="art-domains">
      {domains.map((d, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = col * cw + cw / 2;
        const y = row * 96 + 12;
        return (
          <g
            key={d.id}
            className="art-domain"
            style={
              {
                color: `hsl(${d.hue} var(--node-chroma) var(--node-lightness))`,
                "--i": i,
              } as React.CSSProperties
            }
          >
            <svg x={x - 22} y={y} width={44} height={44} viewBox="0 0 48 48" overflow="visible">
              <DomainGlyph id={d.id} />
            </svg>
            <text x={x} y={y + 62} className="art-label art-domain-label" textAnchor="middle">
              {labelLines(d.short?.[lang] ?? d.label[lang]).map((line, k) => (
                <tspan key={k} x={x} dy={k === 0 ? 0 : 12}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        );
      })}
    </Frame>
  );
}
