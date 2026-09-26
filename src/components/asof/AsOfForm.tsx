"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Lang } from "@/data/types";
import { getSearchCopy } from "@/i18n/search";
import { isIsoDate, setAsOf, todayIso, useAsOf, withAsOf } from "@/lib/client-store";

/**
 * Ô chọn "pháp luật tại ngày…": đặt ngày tra cứu cho cả trang rồi mở danh mục
 * tại ngày đó. Dùng ở lối tắt trên đầu trang chủ và ở thẻ công cụ.
 */
export function AsOfForm({
  lang,
  id,
  label,
  submit,
  hint = true,
}: {
  lang: Lang;
  id: string;
  label?: string;
  submit?: string;
  hint?: boolean;
}) {
  const c = getSearchCopy(lang);
  const router = useRouter();
  const asOf = useAsOf();
  const [date, setDate] = useState("");
  const value = date || asOf || "";

  return (
    <form
      className="asof-form"
      onSubmit={(e) => {
        e.preventDefault();
        const v = value || todayIso();
        if (!isIsoDate(v)) return;
        setAsOf(v);
        router.push(withAsOf(`/${lang}/van-ban`, v));
      }}
    >
      <label htmlFor={id} className="eyebrow">
        {label ?? c.asOf.label}
      </label>
      <div className="asof-form-row">
        <input
          id={id}
          type="date"
          value={value}
          onChange={(e) => setDate(e.target.value)}
          className="field tnum"
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
        <button type="submit" className="btn btn-solid">
          {submit ?? c.asOf.apply}
        </button>
      </div>
      {hint && (
        <p id={`${id}-hint`} className="asof-form-hint">
          {c.asOf.hint}
        </p>
      )}
    </form>
  );
}
