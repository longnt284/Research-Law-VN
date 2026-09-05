import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MapExplorer } from "@/components/MapExplorer";
import { isLang } from "@/i18n/dictionary";
import { alternatesFor } from "@/lib/site";

/**
 * Trang bản đồ nhận tiêu đề và mô tả từ layout; ở đây chỉ khai báo bản dịch,
 * thứ mà layout không tự biết được.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return { alternates: alternatesFor(lang) };
}

export default async function MapPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  // Toàn bộ trang bản đồ nằm trong một khối flex duy nhất do MapExplorer dựng.
  // Chiều cao vùng vẽ được suy ra từ chỗ còn thừa chứ không tính tay bằng calc,
  // nên phần giới thiệu có cao thấp thế nào thì bản đồ vẫn vừa đúng màn hình.
  return <MapExplorer lang={lang} />;
}
