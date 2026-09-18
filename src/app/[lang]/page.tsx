import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Prologue } from "@/components/Prologue";
import { isLang } from "@/i18n/dictionary";
import { alternatesFor } from "@/lib/site";

/**
 * Trang chủ: phần mở đầu ba chiều.
 *
 * Bản đồ tương tác chuyển sang `/[lang]/ban-do` ở đợt này. Lý do là hai việc
 * khác nhau bị nhồi vào một địa chỉ: người mở trang lần đầu cần biết trang này
 * làm gì, còn người đã biết cần vào thẳng công cụ. Trang chủ nay trả lời câu hỏi
 * thứ nhất và dẫn tới công cụ bằng một lối vào rõ ràng ở cả sáu màn lẫn thanh
 * dưới cùng; thanh điều hướng trỏ thẳng tới địa chỉ mới.
 *
 * Tiêu đề và mô tả kế thừa từ layout; ở đây chỉ khai báo bản dịch, thứ mà layout
 * không tự biết được.
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

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <Prologue lang={lang} />;
}
