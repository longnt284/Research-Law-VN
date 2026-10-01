"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import { DomainGlyph } from "@/components/art/DomainGlyph";
import type { DomainId } from "@/data/types";

export interface Chapter {
  /** Giây bắt đầu của chương trong video. */
  t: number;
  label: string;
}

export interface DomainMark {
  id: DomainId;
  /**
   * Giây lĩnh vực xuất hiện riêng trong video, kèm độ dài đoạn đó. Bỏ trống khi
   * video không có đoạn riêng cho lĩnh vực: ô lúc đó là một đường dẫn tới trang
   * lĩnh vực thay vì nút tua video.
   */
  t?: number;
  len?: number;
  hue: number;
  name: string;
  law: string;
  number: string;
  href: string;
}

/**
 * Video giới thiệu: sân khấu tối có khung 16:9, dải chương, và lưới các lĩnh
 * vực bên dưới. Lĩnh vực có đoạn riêng trong video thì ô là nút tua tới đoạn
 * đó; không có thì ô dẫn thẳng tới trang lĩnh vực.
 *
 * Dùng thẻ `<video>` gốc của trình duyệt, có sẵn nút điều khiển, phím tắt và
 * trình đọc màn hình. Video không tự phát: người đã đặt chế độ giảm chuyển động
 * không bị ép xem một đoạn nhiều hiệu ứng.
 *
 * Chương và lĩnh vực đang phát được đánh dấu bằng `aria-current`, cập nhật theo
 * `timeupdate`. Bấm một lĩnh vực khi khung video đã cuộn khỏi màn hình thì trang
 * cuộn khung về giữa trước khi phát.
 */
export function IntroPlayer({
  head,
  src,
  webm,
  poster,
  title,
  chapters,
  chaptersLabel,
  domainsHead,
  domains,
  playLabel,
  openLabel,
  children,
}: {
  head: ReactNode;
  src: string;
  webm: string;
  poster: string;
  title: string;
  chapters: Chapter[];
  chaptersLabel: string;
  domainsHead: ReactNode;
  domains: DomainMark[];
  playLabel: string;
  openLabel: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onTime = () => setNow(v.currentTime);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("seeked", onTime);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("seeked", onTime);
    };
  }, []);

  let chapter = 0;
  for (let k = 0; k < chapters.length; k++) if (now >= chapters[k].t - 0.05) chapter = k;
  const domain = domains.findIndex(
    (d) => d.t !== undefined && d.len !== undefined && now >= d.t - 0.05 && now < d.t + d.len - 0.05,
  );

  const seek = (t: number) => {
    const v = ref.current;
    if (!v) return;
    const box = v.getBoundingClientRect();
    if (box.bottom < 0 || box.top > window.innerHeight) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      v.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    }
    v.currentTime = t;
    void v.play().catch(() => {});
  };

  return (
    <>
      <section className="intro-stage">
        <div className="intro-wrap">
          {head}
          <figure className="intro-frame">
            <video
              ref={ref}
              className="intro-video"
              controls
              playsInline
              preload="metadata"
              poster={poster}
              aria-label={title}
              width={1920}
              height={1080}
            >
              {/* MP4 (H.264/AAC) đứng trước vì Safari chỉ phát định dạng này.
                  WebM (VP9/Opus) cho các bản trình duyệt không có codec H.264. */}
              <source src={src} type="video/mp4" />
              <source src={webm} type="video/webm" />
            </video>
          </figure>
          <nav aria-label={chaptersLabel} className="intro-chapters">
            <ol>
              {chapters.map((c, i) => (
                <li key={c.t}>
                  <button
                    type="button"
                    onClick={() => seek(c.t)}
                    aria-current={i === chapter ? "true" : undefined}
                    className="intro-chip"
                  >
                    <span className="intro-chip-time tnum">{fmt(c.t)}</span>
                    {c.label}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[76rem] px-5 py-10 sm:px-8 sm:py-12">
        {domainsHead}
        <ol className="intro-tiles">
          {domains.map((d, i) => {
            const t = d.t;
            const body = (
              <>
                <span className="intro-tile-name">{d.name}</span>
                <span className="intro-tile-law">{d.law}</span>
                <span className="intro-tile-no tnum">{d.number}</span>
              </>
            );
            return (
              <li key={d.id} className="intro-tile" style={{ "--hue": d.hue } as CSSProperties}>
                {t === undefined ? (
                  <Link href={d.href} className="intro-tile-btn">
                    <span className="intro-tile-top">
                      <DomainGlyph id={d.id} className="intro-tile-glyph" />
                      <span className="intro-tile-time" aria-hidden="true">
                        →
                      </span>
                    </span>
                    {body}
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => seek(t)}
                      aria-current={i === domain ? "true" : undefined}
                      className="intro-tile-btn"
                    >
                      <span className="sr-only">{playLabel} </span>
                      <span className="intro-tile-top">
                        <DomainGlyph id={d.id} className="intro-tile-glyph" />
                        <span className="intro-tile-time tnum">
                          <span aria-hidden="true">▶</span> {fmt(t)}
                        </span>
                      </span>
                      {body}
                    </button>
                    <Link href={d.href} className="intro-tile-link link-sweep">
                      {openLabel}
                      <span className="sr-only"> {d.name}</span> <span aria-hidden="true">→</span>
                    </Link>
                  </>
                )}
              </li>
            );
          })}
        </ol>
        {children}
      </section>
    </>
  );
}

function fmt(t: number) {
  const s = Math.floor(t);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
