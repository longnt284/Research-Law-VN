"use client";

import { useEffect, useRef } from "react";

/**
 * Lớp nền sang trọng cho phần đầu trang, có dịch chuyển theo cuộn.
 *
 * Toàn bộ phần nhìn thấy được — ba vùng sáng trôi chậm và lớp hạt lấp lánh —
 * nằm trong CSS ở `.lux-field`. Thành phần này chỉ làm một việc mà CSS chưa làm
 * được ở mọi trình duyệt: đọc vị trí cuộn rồi ghi vào biến `--lux-par`.
 *
 * Ba điều kiện dừng, cùng lý do: không đốt khung hình cho một lớp trang trí.
 * Không tính khi lớp nền đã cuộn ra khỏi màn hình. Không tính quá một lần mỗi
 * khung hình, dù trình duyệt bắn sự kiện cuộn dày hơn thế. Và không tính gì cả
 * nếu hệ điều hành báo người dùng đã tắt hiệu ứng chuyển động — khi đó lớp nền
 * đứng yên, đúng như phần còn lại của trang.
 */
export function LuxBackdrop({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    let raf: number | null = null;
    let inView = true;

    const apply = () => {
      raf = null;
      const top = el.getBoundingClientRect().top;
      // Hệ số 0.12: lớp nền đi cùng chiều với trang nhưng chậm hơn hẳn, nên nó
      // lùi ra sau chữ. Lớn hơn nữa thì nó trượt nhanh tới mức thành thứ gây
      // chú ý, mà việc của nó là đứng sau.
      el.style.setProperty("--lux-par", String(Math.round(-top * 0.12)));
    };

    const onScroll = () => {
      if (!inView || raf !== null) return;
      raf = requestAnimationFrame(apply);
    };

    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      if (inView) onScroll();
    });
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    apply();

    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden="true" className={`lux-field ${className ?? ""}`} />
  );
}
