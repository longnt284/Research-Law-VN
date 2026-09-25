"use client";

import { useEffect, useState } from "react";

/**
 * Nút dừng mọi chuyển động tự chạy trên trang.
 *
 * Vệt sáng trên huy hiệu ở trang chủ và lớp nền đầu trang chạy liên tục, và một
 * nội dung tự chuyển động quá năm giây phải có cách dừng lại (WCAG 2.2.2). Lựa
 * chọn ghi lên thẻ <html> dưới dạng `data-motion="off"`, nên cùng một luật CSS
 * dừng được vệt sáng, lớp nền ở đầu các trang và sợi đồng ở thanh điều hướng,
 * còn nét huy hiệu hiện sẵn thay vì vẽ dần. Lựa chọn được nhớ trong
 * `localStorage` và đoạn script ở đầu <body> đọc lại trước khung hình đầu tiên,
 * để người đã dừng không phải thấy hình chạy một nhịp rồi mới đứng.
 */
export function MotionToggle({ pause, play }: { pause: string; play: string }) {
  const [off, setOff] = useState(false);

  useEffect(() => {
    setOff(document.documentElement.dataset.motion === "off");
  }, []);

  const toggle = () => {
    const next = !off;
    setOff(next);
    if (next) document.documentElement.dataset.motion = "off";
    else delete document.documentElement.dataset.motion;
    try {
      if (next) localStorage.setItem("motion", "off");
      else localStorage.removeItem("motion");
    } catch {
      // Trình duyệt chặn bộ nhớ cục bộ: lựa chọn vẫn có hiệu lực tới khi rời trang.
    }
  };

  return (
    <button type="button" className="motion-toggle" aria-pressed={off} onClick={toggle}>
      <span className="motion-toggle-icon" aria-hidden="true" data-off={off ? "on" : undefined} />
      {off ? play : pause}
    </button>
  );
}
