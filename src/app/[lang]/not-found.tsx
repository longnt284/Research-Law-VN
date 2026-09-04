import Link from "next/link";

/**
 * Trang 404.
 *
 * Không để người đọc rơi vào ngõ cụt: luôn có hai lối ra rõ ràng, về bản đồ hoặc
 * về danh mục văn bản.
 */
export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-[76rem] px-5 py-24 sm:px-8">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 max-w-[24ch] text-3xl leading-tight">
        Không tìm thấy trang này
        <span className="mt-1 block text-[var(--ink-3)]">Page not found</span>
      </h1>
      <p className="measure mt-4 leading-relaxed text-[var(--ink-2)]">
        Đường dẫn có thể đã thay đổi, hoặc văn bản bạn tìm chưa có trong tập dữ liệu.
        The address may have changed, or the instrument you are looking for is not yet
        in the dataset.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link
          href="/vi"
          className="border border-[var(--accent)] px-4 py-2 text-sm text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--paper)]"
        >
          Về bản đồ
        </Link>
        <Link
          href="/vi/van-ban"
          className="border border-[var(--rule-strong)] px-4 py-2 text-sm transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          Danh mục văn bản
        </Link>
      </div>
    </div>
  );
}
