import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ChatPanel from "@/components/chat/ChatPanel";
import { getChatCopy } from "@/i18n/chat";
import { isLang } from "@/i18n/dictionary";
import { alternatesFor, shareMeta } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const p = getChatCopy(lang).page;
  return {
    title: p.title,
    description: p.lede,
    alternates: alternatesFor(lang, "/hoi-dap"),
    ...shareMeta(lang, "/hoi-dap", p.title, p.lede),
  };
}

/**
 * Trang hỏi đáp: khung chat toàn trang, cột trái là lịch sử 5 cuộc gần nhất.
 * Cuộc trò chuyện nằm trong trình duyệt, nên trang dựng sẵn chỉ có khung trống.
 */
export default async function AskPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <div className="mx-auto w-full max-w-[76rem] px-3 py-3 sm:px-8 sm:py-6">
      <ChatPanel lang={lang} variant="page" />
    </div>
  );
}
