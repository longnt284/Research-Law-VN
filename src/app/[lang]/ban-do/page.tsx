import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MapExplorer } from "@/components/MapExplorer";
import { getDict, isLang } from "@/i18n/dictionary";
import { alternatesFor } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = getDict(lang);
  return {
    title: t.nav.map,
    description: t.siteTagline,
    alternates: alternatesFor(lang, "/ban-do"),
  };
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
