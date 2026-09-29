"use client";

import { useEffect, useRef, useState } from "react";

export interface Chapter {
  /** Giây bắt đầu của chương trong video. */
  t: number;
  label: string;
  /** Chữ xuất hiện trên màn hình trong chương, để đọc được khi không xem hình. */
  onScreen: string;
}

/**
 * Trình phát video dọc kèm danh sách chương.
 *
 * Dùng thẻ `<video>` gốc của trình duyệt, có sẵn nút điều khiển, phím tắt và
 * trình đọc màn hình. Video không tự phát: trang này là nơi xem chủ động, và
 * người đã đặt chế độ giảm chuyển động không bị ép xem một đoạn nhiều hiệu ứng.
 *
 * Bấm một chương thì nhảy tới đúng giây đó và phát. Chương đang phát được đánh
 * dấu bằng `aria-current`, cập nhật theo sự kiện `timeupdate`.
 */
export function ShowcasePlayer({
  src,
  webm,
  poster,
  title,
  chapters,
  chaptersLabel,
}: {
  src: string;
  webm: string;
  poster: string;
  title: string;
  chapters: Chapter[];
  chaptersLabel: string;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onTime = () => {
      let i = 0;
      for (let k = 0; k < chapters.length; k++) if (v.currentTime >= chapters[k].t - 0.05) i = k;
      setActive(i);
    };
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("seeked", onTime);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("seeked", onTime);
    };
  }, [chapters]);

  const jump = (t: number) => {
    const v = ref.current;
    if (!v) return;
    v.currentTime = t;
    void v.play().catch(() => {});
  };

  return (
    <div className="showcase-grid">
      <figure className="showcase-frame">
        <video
          ref={ref}
          className="showcase-video"
          controls
          playsInline
          preload="metadata"
          poster={poster}
          aria-label={title}
          width={1080}
          height={1920}
        >
          {/* MP4 (H.264/AAC) đứng trước vì Safari chỉ phát định dạng này.
              WebM (VP9/Opus) cho các bản trình duyệt không có codec H.264. */}
          <source src={src} type="video/mp4" />
          <source src={webm} type="video/webm" />
        </video>
      </figure>

      <nav aria-label={chaptersLabel} className="showcase-chapters">
        <p className="eyebrow eyebrow-tick">{chaptersLabel}</p>
        <ol>
          {chapters.map((c, i) => (
            <li key={c.t}>
              <button
                type="button"
                onClick={() => jump(c.t)}
                aria-current={i === active ? "true" : undefined}
                className="showcase-chapter"
              >
                <span className="showcase-time tnum">{fmt(c.t)}</span>
                <span className="min-w-0">
                  <span className="showcase-chapter-label">{c.label}</span>
                  <span className="showcase-onscreen">{c.onScreen}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  );
}

function fmt(t: number) {
  const s = Math.floor(t);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
