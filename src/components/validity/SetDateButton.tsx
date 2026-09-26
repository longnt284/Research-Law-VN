"use client";

import { setAsOf } from "@/lib/client-store";

/**
 * Một mốc trên dòng thời gian bấm được: đặt ngày tra cứu của cả trang về đúng
 * mốc ấy, để gia phả, ô chọn ngày và thanh "pháp luật tại ngày" cùng đổi theo.
 */
export function SetDateButton({
  date,
  label,
  title,
}: {
  date: string;
  label: string;
  title: string;
}) {
  return (
    <button type="button" className="vt-date-btn tnum" title={title} onClick={() => setAsOf(date)}>
      {label}
    </button>
  );
}
