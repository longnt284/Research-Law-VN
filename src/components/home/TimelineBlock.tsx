import { documents, LATEST_VERIFIED_ON } from "@/data/documents";
import type { Lang } from "@/data/types";
import { formatDate } from "@/i18n/dictionary";
import { getHome } from "@/i18n/home";
import { corpusSpan, undatedCount, yearOf } from "@/lib/corpus";

/**
 * Khối "Trục thời gian" của trang chủ: số văn bản có hiệu lực theo từng năm.
 *
 * Mỗi cột chia ba phần theo tình trạng tại ngày tra cứu: còn hiệu lực (kể cả đã
 * bị sửa đổi) tô đặc, chưa tới ngày hiệu lực tô sọc, đã hết hiệu lực chỉ còn
 * viền. Ba cách tô khác nhau về hình chứ không chỉ về màu, nên in đen trắng vẫn
 * đọc được. Vạch dọc là ngày tra cứu gần nhất của tập dữ liệu, đặt đúng vị trí
 * trong năm của nó.
 *
 * Các năm trước mốc `FIRST` gộp thành một cột: tập dữ liệu có vài văn bản rất
 * cũ, và trải chúng ra theo năm thì phần lớn trục là khoảng trống.
 */

const FIRST = 2010;
const W = 720;
const H = 250;
const PAD = { l: 30, r: 12, t: 44, b: 36 };

interface Bucket {
  label: string;
  year: number | null;
  live: number;
  pending: number;
  expired: number;
}

export function TimelineBlock({ lang }: { lang: Lang }) {
  const c = getHome(lang).timeline;
  const last = Math.max(corpusSpan.to, Number(LATEST_VERIFIED_ON.slice(0, 4)));

  const buckets: Bucket[] = [
    { label: `${c.before} ${FIRST}`, year: null, live: 0, pending: 0, expired: 0 },
  ];
  for (let y = FIRST; y <= last; y++) {
    buckets.push({ label: String(y), year: y, live: 0, pending: 0, expired: 0 });
  }
  for (const doc of documents) {
    const y = yearOf(doc);
    if (y === 0) continue;
    const b = y < FIRST ? buckets[0] : buckets[y - FIRST + 1];
    if (!b) continue;
    if (doc.status === "expired") b.expired++;
    else if (doc.status === "pending") b.pending++;
    else b.live++;
  }

  const max = Math.max(1, ...buckets.map((b) => b.live + b.pending + b.expired));
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;
  const col = innerW / buckets.length;
  const bar = Math.min(26, col * 0.64);
  const yOf = (n: number) => (n / max) * innerH;
  const base = H - PAD.b;

  // Vị trí của ngày tra cứu: giữa cột năm của nó, lệch theo phần năm đã qua.
  const vYear = Number(LATEST_VERIFIED_ON.slice(0, 4));
  const start = Date.UTC(vYear, 0, 1);
  const frac = (Date.parse(LATEST_VERIFIED_ON) - start) / (Date.UTC(vYear + 1, 0, 1) - start);
  const vIndex = vYear < FIRST ? 0 : vYear - FIRST + 1;
  const vX = PAD.l + vIndex * col + col * frac;

  const ticks = [0, Math.round(max / 2), max];

  return (
    <section className="home-block" aria-labelledby="home-time-title">
      <div className="home-block-copy">
        <p className="eyebrow eyebrow-tick">{c.eyebrow}</p>
        <h2 id="home-time-title" className="display-sm mt-3">
          <span className="block">{c.title[0]}</span>
          <span className="block">{c.title[1]}</span>
        </h2>
        <p className="home-block-text">{c.text}</p>
        {undatedCount > 0 && (
          <p className="home-block-note tnum">
            {undatedCount} {c.undated}
          </p>
        )}
      </div>

      <figure className="tl-figure">
        <svg
          className="tl-svg"
          viewBox={`0 0 ${W} ${H}`}
          aria-hidden="true"
          focusable="false"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern id="tl-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="5" className="tl-hatch-line" />
            </pattern>
          </defs>

          {ticks.map((n) => (
            <g key={n}>
              <line x1={PAD.l} x2={W - PAD.r} y1={base - yOf(n)} y2={base - yOf(n)} className="tl-grid" />
              <text x={PAD.l - 8} y={base - yOf(n) + 4} className="tl-tick" textAnchor="end">
                {n}
              </text>
            </g>
          ))}

          {buckets.map((b, i) => {
            const x = PAD.l + i * col + (col - bar) / 2;
            const hl = yOf(b.live);
            const hp = yOf(b.pending);
            const he = yOf(b.expired);
            const total = b.live + b.pending + b.expired;
            // Nhãn năm cách một cột một nhãn, bỏ riêng năm mốc: nó đứng ngay cạnh
            // cột gộp "trước năm mốc" và hai nhãn sẽ dính vào nhau.
            const showLabel =
              i === 0 ||
              b.year === last ||
              (b.year !== null && b.year !== FIRST && (b.year - FIRST) % 2 === 0);
            return (
              <g key={b.label} className="tl-col" style={{ "--i": i } as React.CSSProperties}>
                <title>{`${b.label}: ${total}`}</title>
                <g className="tl-bars">
                  {b.live > 0 && <rect x={x} y={base - hl} width={bar} height={hl} className="tl-live" />}
                  {b.pending > 0 && (
                    <rect x={x} y={base - hl - hp} width={bar} height={hp} className="tl-pending" />
                  )}
                  {b.expired > 0 && (
                    <rect
                      x={x + 0.75}
                      y={base - hl - hp - he + 0.75}
                      width={bar - 1.5}
                      height={Math.max(0, he - 1.5)}
                      className="tl-expired"
                    />
                  )}
                </g>
                {total > 0 && (
                  <text x={x + bar / 2} y={base - hl - hp - he - 6} className="tl-count" textAnchor="middle">
                    {total}
                  </text>
                )}
                {showLabel && (
                  <text x={x + bar / 2} y={base + 18} className="tl-year" textAnchor="middle">
                    {i === 0 ? `<${FIRST}` : b.label}
                  </text>
                )}
              </g>
            );
          })}

          <line x1={PAD.l} x2={W - PAD.r} y1={base} y2={base} className="tl-axis" />

          <g className="tl-now">
            <line x1={vX} x2={vX} y1={12} y2={base + 4} />
            <circle cx={vX} cy={12} r="3.2" />
            <text x={vX - 7} y={16} textAnchor="end" className="tl-now-label">
              {c.verified} {formatDate(LATEST_VERIFIED_ON, lang, LATEST_VERIFIED_ON)}
            </text>
          </g>
        </svg>

        <figcaption className="tl-caption">
          <span className="tl-key">
            <i className="tl-key-live" /> {c.active}
          </span>
          <span className="tl-key">
            <i className="tl-key-pending" /> {c.pending}
          </span>
          <span className="tl-key">
            <i className="tl-key-expired" /> {c.expired}
          </span>
          <span className="tl-axis-note">{c.axis}</span>
        </figcaption>

        {/* Bảng số cho trình đọc màn hình: hình cột không đọc được, bảng thì đọc được. */}
        <table className="sr-only">
          <caption>{c.eyebrow}</caption>
          <thead>
            <tr>
              <th scope="col">{c.axis}</th>
              <th scope="col">{c.active}</th>
              <th scope="col">{c.pending}</th>
              <th scope="col">{c.expired}</th>
            </tr>
          </thead>
          <tbody>
            {buckets
              .filter((b) => b.live + b.pending + b.expired > 0)
              .map((b) => (
                <tr key={b.label}>
                  <th scope="row">{b.label}</th>
                  <td>{b.live}</td>
                  <td>{b.pending}</td>
                  <td>{b.expired}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </figure>
    </section>
  );
}
