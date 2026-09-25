/**
 * Dấu hiệu của Lex & Lineage.
 *
 * Hình giữa là một cán cân mà trụ đỡ mọc thành rễ cây. Nửa trên là luật: cán
 * cân, đỉnh hình thoi, hai đĩa cân. Nửa dưới là gia phả: trụ tách thành ba rễ,
 * mỗi rễ kết thúc bằng một nút tròn như một đời văn bản đứng trước. Hai nửa
 * đọc thành một câu: công lý đứng trên dòng dõi của chính nó.
 *
 * Có hai dạng, cùng một hình học:
 *
 * - `seal`: huy hiệu lớn ở đầu trang chủ. Nền tròn màu mực, viền đôi, tên trang
 *   chạy theo vòng cung phía trên, hai nhánh nguyệt quế phía dưới, nét vàng lá
 *   có ánh kim. Nét được vẽ dần khi trang mở và có một vệt sáng lướt chậm qua
 *   mặt dấu; cả hai dừng theo nút dừng chuyển động và theo lựa chọn giảm chuyển
 *   động của hệ điều hành.
 * - `badge`: dấu nhỏ ở thanh điều hướng và chân trang. Bỏ chữ và nguyệt quế,
 *   nét dày gấp đôi để còn đọc được ở cỡ ba mươi điểm ảnh.
 *
 * Toàn bộ là SVG dựng ở máy chủ, không tải phông hay ảnh nào. Dải màu dùng id
 * riêng cho từng chỗ đặt dấu (`id`), vì cùng một trang có thể mang ba dấu và
 * hai `<linearGradient>` trùng id thì trình duyệt chỉ đọc cái đầu tiên.
 */

const C = 100;

/** Điểm trên vòng tròn tâm (100, 100), góc tính bằng độ theo chiều SVG (0° là hướng đông, 90° là hướng nam). */
function polar(r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
}

const f = (n: number) => Number(n.toFixed(2));

/** Lá nguyệt quế: một thấu kính dài mười đơn vị, gốc tại (0, 0), mũi hướng theo trục x. */
const LEAF = "M0 0C3 -3.4 7 -3.4 10.5 0C7 3.4 3 3.4 0 0Z";

/**
 * Một nhánh nguyệt quế mọc dọc vòng tròn bán kính `r`, từ góc `from` tới góc
 * `to`. Lá mọc so le hai bên cuống, nghiêng về phía ngọn, và nhỏ dần về phía
 * ngọn như một nhánh thật.
 */
function sprig(from: number, to: number, r: number, count: number) {
  const dir = Math.sign(to - from);
  const [x0, y0] = polar(r, from);
  const [x1, y1] = polar(r, to);
  const stem = `M${f(x0)} ${f(y0)}A${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${f(x1)} ${f(y1)}`;
  const leaves: { x: number; y: number; rot: number; s: number }[] = [];
  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const deg = from + (to - from) * t;
    const [x, y] = polar(r, deg);
    // Hướng tiếp tuyến theo chiều nhánh mọc, đo bằng độ.
    const tangent = deg + 90 * dir;
    const side = i % 2 === 0 ? 1 : -1;
    leaves.push({ x: f(x), y: f(y), rot: f(tangent - 38 * side * dir), s: f(1 - t * 0.28) });
  }
  const [tx, ty] = polar(r, to);
  leaves.push({ x: f(tx), y: f(ty), rot: f(to + 90 * dir), s: 0.72 });
  return { stem, leaves };
}

const LEFT = sprig(116, 166, 75, 9);
const RIGHT = sprig(64, 14, 75, 9);

/** Hình giữa. `w` nhân độ dày nét; dạng nhỏ cần nét dày hơn để không nhòe. */
function Emblem({ gold, w, draw }: { gold: string; w: number; draw: boolean }) {
  const line = (d: string, width: number, i: number) => (
    <path
      d={d}
      stroke={gold}
      strokeWidth={f(width * w)}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={draw ? 1 : undefined}
      className={draw ? "seal-draw" : undefined}
      style={draw ? ({ "--i": i } as React.CSSProperties) : undefined}
    />
  );
  const solid = (el: React.ReactElement, i: number) => (
    <g className={draw ? "seal-fill" : undefined} style={draw ? ({ "--i": i } as React.CSSProperties) : undefined}>
      {el}
    </g>
  );
  return (
    <g>
      {/* Trụ, rồi cán cân, rồi dây treo: thứ tự vẽ theo thứ tự một người dựng cân. */}
      {line("M100 46V134", 3, 0)}
      {line("M50 64Q100 55 150 64", 2.6, 1)}
      {line("M50 64L35 101M50 64L65 101", 1.3, 2)}
      {line("M150 64L135 101M150 64L165 101", 1.3, 2)}
      {line("M100 131C100 145 89 151 76 156", 2.4, 3)}
      {line("M100 131C100 145 111 151 124 156", 2.4, 3)}
      {line("M100 134V155", 2.4, 3)}

      {solid(<path d="M100 32L106 40L100 48L94 40Z" fill={gold} />, 1)}
      {solid(<circle cx={50} cy={64} r={f(2.6 * Math.min(w, 1.6))} fill={gold} />, 2)}
      {solid(<circle cx={150} cy={64} r={f(2.6 * Math.min(w, 1.6))} fill={gold} />, 2)}
      {solid(<path d="M31 101H69A19 11 0 0 1 31 101Z" fill={gold} />, 3)}
      {solid(<path d="M131 101H169A19 11 0 0 1 131 101Z" fill={gold} />, 3)}
      {solid(<circle cx={76} cy={157} r={f(3.8 * Math.min(w, 1.7))} fill={gold} />, 4)}
      {solid(<circle cx={100} cy={160} r={f(3.8 * Math.min(w, 1.7))} fill={gold} />, 4)}
      {solid(<circle cx={124} cy={157} r={f(3.8 * Math.min(w, 1.7))} fill={gold} />, 4)}
    </g>
  );
}

function Defs({ id }: { id: string }) {
  return (
    <defs>
      {/* Vàng lá: năm điểm dừng sáng tối xen nhau cho ra ánh kim, không phải một mảng vàng phẳng. */}
      <linearGradient id={`${id}-gold`} gradientUnits="userSpaceOnUse" x1="24" y1="18" x2="176" y2="182">
        <stop offset="0" stopColor="#8a6a28" />
        <stop offset="0.28" stopColor="#f1dc9c" />
        <stop offset="0.52" stopColor="#b8913f" />
        <stop offset="0.74" stopColor="#f6e6b0" />
        <stop offset="1" stopColor="#7d5e22" />
      </linearGradient>
      <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.5" stopColor="#fff8e0" stopOpacity="0.2" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <radialGradient id={`${id}-field`} cx="0.38" cy="0.3" r="0.8">
        <stop offset="0" stopColor="#2b2f39" />
        <stop offset="0.55" stopColor="#16181e" />
        <stop offset="1" stopColor="#0b0c10" />
      </radialGradient>
    </defs>
  );
}

export function BrandMark({
  variant,
  id,
  className,
  title,
}: {
  variant: "seal" | "badge";
  /** Tiền tố id cho dải màu, riêng cho từng chỗ đặt dấu trên cùng một trang. */
  id: string;
  className?: string;
  /** Có `title` thì dấu là một hình có tên; không có thì dấu chỉ để trang trí. */
  title?: string;
}) {
  const gold = `url(#${id}-gold)`;
  const a11y = title
    ? { role: "img" as const, "aria-label": title }
    : { "aria-hidden": true as const, focusable: "false" as const };

  if (variant === "badge") {
    return (
      <svg viewBox="0 0 200 200" className={className} {...a11y}>
        <Defs id={id} />
        <circle cx={C} cy={C} r={98} fill={`url(#${id}-field)`} />
        <circle cx={C} cy={C} r={89} fill="none" stroke={gold} strokeWidth={5} />
        <g transform="translate(100 104) scale(0.9) translate(-100 -100)">
          <Emblem gold={gold} w={2.3} draw={false} />
        </g>
      </svg>
    );
  }

  const [ax, ay] = polar(81, 180);
  const [bx, by] = polar(81, 360);
  const [dx, dy] = polar(84, 90);

  return (
    <svg viewBox="0 0 200 200" className={`seal ${className ?? ""}`} {...a11y}>
      <Defs id={id} />
      <clipPath id={`${id}-disc`}>
        <circle cx={C} cy={C} r={97} />
      </clipPath>

      <circle cx={C} cy={C} r={97} fill={`url(#${id}-field)`} />
      <circle cx={C} cy={C} r={96} fill="none" stroke={gold} strokeWidth={1.6} />
      <circle cx={C} cy={C} r={91} fill="none" stroke={gold} strokeWidth={0.6} opacity={0.8} />
      {/* Vành hạt nhỏ giữa hai vòng, như mép một con dấu đúc. */}
      <circle
        cx={C}
        cy={C}
        r={93.5}
        fill="none"
        stroke={gold}
        strokeWidth={1.4}
        strokeDasharray="0.01 3.2"
        strokeLinecap="round"
        opacity={0.7}
      />

      <path id={`${id}-arc`} d={`M${f(ax)} ${f(ay)}A81 81 0 0 1 ${f(bx)} ${f(by)}`} fill="none" />
      <text className="seal-text" fill={gold}>
        <textPath href={`#${id}-arc`} startOffset="50%" textAnchor="middle">
          LEX &amp; LINEAGE
        </textPath>
      </text>

      <g className="seal-laurel">
        {[LEFT, RIGHT].map((s, k) => (
          <g key={k}>
            <path d={s.stem} fill="none" stroke={gold} strokeWidth={1} strokeLinecap="round" />
            {s.leaves.map((l, i) => (
              <path
                key={i}
                d={LEAF}
                fill={gold}
                transform={`translate(${l.x} ${l.y}) rotate(${l.rot}) scale(${l.s})`}
              />
            ))}
          </g>
        ))}
        <path
          d={`M${f(dx)} ${f(dy - 4)}L${f(dx + 3)} ${f(dy)}L${f(dx)} ${f(dy + 4)}L${f(dx - 3)} ${f(dy)}Z`}
          fill={gold}
        />
      </g>

      <Emblem gold={gold} w={1} draw />

      {/* Vệt sáng lướt qua mặt dấu, cắt theo đúng hình tròn. */}
      <g clipPath={`url(#${id}-disc)`}>
        <g className="seal-sheen">
          <rect x={-70} y={-20} width={56} height={240} fill={`url(#${id}-sheen)`} transform="skewX(-16)" />
        </g>
      </g>
    </svg>
  );
}

/**
 * Tên trang dạng chữ. Dấu "&" đặt nghiêng, màu đồng: chỗ nối của hai chữ cũng
 * là chỗ nối của luật với dòng dõi của nó.
 */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`wordmark ${className ?? ""}`} aria-hidden="true">
      Lex <em>&amp;</em> Lineage
    </span>
  );
}
