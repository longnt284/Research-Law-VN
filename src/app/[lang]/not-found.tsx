import Link from "next/link";

/**
 * Trang 404.
 *
 * Không để người đọc rơi vào ngõ cụt: luôn có hai lối ra rõ ràng, về trang chủ
 * hoặc về danh mục văn bản.
 */
export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-[76rem] px-5 py-24 sm:px-8">
      <p className="eyebrow eyebrow-tick rise">404</p>
      <h1 className="display rise rise-1 mt-3 max-w-[24ch]">
        Không tìm thấy trang này
        <span className="mt-1 block text-[var(--ink-3)]">Page not found</span>
      </h1>
      <p className="measure rise rise-2 mt-5 leading-relaxed text-[var(--ink-2)]">
        Đường dẫn có thể đã thay đổi, hoặc văn bản bạn tìm chưa có trong tập dữ liệu.
        The address may have changed, or the instrument you are looking for is not yet
        in the dataset.
      </p>
      <div className="rise rise-3 mt-7 flex flex-wrap gap-3">
        <Link href="/vi" className="btn btn-outline">
          Về trang chủ
        </Link>
        <Link href="/vi/van-ban" className="btn btn-quiet">
          Danh mục văn bản
        </Link>
      </div>
    </div>
  );
}
