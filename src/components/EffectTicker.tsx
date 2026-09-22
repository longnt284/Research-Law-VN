import Link from "next/link";

import { LATEST_VERIFIED_ON, documents } from "@/data/documents";
import type { Lang, LegalDoc } from "@/data/types";
import { formatDate, getDict } from "@/i18n/dictionary";

/**
 * Dải mốc hiệu lực chạy ngang.
 *
 * Nội dung là mốc hiệu lực gần ngày tra cứu nhất — thứ duy nhất trên trang này
 * thực sự thay đổi theo thời gian, nên nó đáng được chuyển động. Một dải chạy
 * chỉ để trang trí thì chỉ tổ làm người đọc mất tập trung.
 *
 * Cách chạy: danh sách được nhân đôi rồi dịch trái đúng 50% chiều rộng, nên khi
 * hết chu kỳ thì bản sao thứ hai đã nằm đúng chỗ bản đầu và vòng lặp không có
 * mối nối. Toàn bộ bằng CSS, không có JavaScript nào chạy mỗi khung hình.
 */
export function EffectTicker({ lang }: { lang: Lang }) {
  const t = getDict(lang);

  const items = documents
    .filter((d) => d.effectiveOn)
    .map((d) => ({
      doc: d,
      gap: Math.abs(Date.parse(d.effectiveOn) - Date.parse(LATEST_VERIFIED_ON)),
    }))
    .sort((a, b) => a.gap - b.gap)
    .slice(0, 14)
    .map((x) => x.doc)
    .sort((a, b) => a.effectiveOn.localeCompare(b.effectiveOn));

  if (items.length === 0) return null;

  const line = (d: LegalDoc) => (
    <>
      <span className="tnum font-semibold text-[var(--accent)]">
        {formatDate(d.effectiveOn, lang, t.doc.unknownDate)}
      </span>
      <span className="text-[var(--ink-2)]">{d.title[lang]}</span>
      <span className="tnum text-[var(--ink-3)]">{d.number}</span>
      <span className="text-[var(--ink-3)]">
        {d.effectiveOn > LATEST_VERIFIED_ON ? t.home.tickerFuture : t.home.tickerPast}
      </span>
    </>
  );

  const list = (dup: boolean) => (
    <ul aria-hidden={dup || undefined} className="flex items-center gap-6 pr-6">
      {items.map((d) => (
        <li key={d.id} className="flex shrink-0 items-center gap-2.5">
          {dup ? (
            <span className="flex items-baseline gap-2 whitespace-nowrap">
              {line(d)}
            </span>
          ) : (
            <Link
              href={`/${lang}/van-ban/${d.id}`}
              className="flex items-baseline gap-2 whitespace-nowrap transition-colors hover:text-[var(--accent)]"
            >
              {line(d)}
            </Link>
          )}
          <span aria-hidden="true" className="text-[var(--brass)]">
            ◆
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="rule-b marquee shrink-0 bg-[var(--paper-2)] py-2 text-[0.8125rem]">
      {/*
        Bản sao thứ hai chỉ để nối vòng, không mang thông tin mới, nên nó bị ẩn
        khỏi trình đọc màn hình và không nhận được tiêu điểm bàn phím.
      */}
      <div className="marquee__track">
        {list(false)}
        {list(true)}
      </div>
    </div>
  );
}
