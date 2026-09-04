"use client";

import { useEffect, useRef } from "react";

/**
 * Khối nội dung hiện dần khi cuộn tới.
 *
 * Quan sát viên ngắt ngay sau lần đầu khối lọt vào màn hình. Một khối đã hiện
 * thì không có lý do gì mờ lại khi người đọc cuộn ngược lên: chữ nhấp nháy theo
 * hướng cuộn là thứ gây khó chịu chứ không phải hiệu ứng.
 *
 * Trạng thái ẩn ban đầu nằm trong CSS và chỉ có hiệu lực dưới `html.js`, nên
 * trang không chạy được JavaScript vẫn hiện đủ nội dung.
 */
export function Reveal({
  children,
  className,
  delay,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Báo cho đoạn script ở đầu <body> biết mã của trang đã chạy được, để nó
    // không gỡ lớp `js` và trả trang về trạng thái không hiệu ứng.
    document.documentElement.dataset.reveal = "on";

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.classList.add("is-in");
        io.disconnect();
      },
      // Lùi mép dưới vào trong một chút: khối bắt đầu hiện khi đã vào hẳn màn
      // hình, chứ không phải lúc mới ló một hàng pixel ở đáy.
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className ?? ""}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
