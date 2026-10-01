import { documents } from "@/data/documents";
import type { DomainId, Lang, LegalDoc } from "@/data/types";
import { getChatCopy } from "@/i18n/chat";
import { domainDocs, mentioned, statusText, todayVn } from "@/lib/chat/docs";
export { OFFLINE_MODEL } from "@/lib/chat/models";
import type { ChatEvent } from "@/lib/chat/provider";
import { fold } from "@/lib/search-engine";
import { amenders, replacers } from "@/lib/validity";

/**
 * Câu trả lời tra cứu tự động: dùng khi mọi model đều không nhận câu hỏi (hết
 * lượt, quá tải, khóa hỏng, chưa cấu hình), để trợ lý vẫn trả lời thay vì báo
 * lỗi.
 *
 * Không gọi mô hình nào. Câu trả lời chỉ dựng từ dữ liệu công khai của trang:
 * tình trạng hiệu lực hôm nay của văn bản được nhắc số hiệu (kèm văn bản thay
 * thế, sửa đổi nó), văn bản có tên khớp câu hỏi, văn bản chính của lĩnh vực mà
 * câu hỏi chạm tới, và vài dòng hướng dẫn dùng trang khi câu hỏi hỏi về trang.
 * Không dùng gói skill: thân skill là tài sản riêng, và gói có thể chính là thứ
 * đang hỏng.
 */

const MAX_DOCS = 6;
const PER_DOMAIN = 3;

/*
  Cặp âm tiết có trong tên của rất nhiều văn bản: khớp những cặp này không nói
  lên văn bản nào liên quan, nên không tính.
*/
const GENERIC = [
  "bộ luật", "nghị định", "thông tư", "quyết định", "nghị quyết", "văn bản", "sửa đổi", "bổ sung",
  "hướng dẫn", "chi tiết", "quy định", "một số", "hợp nhất", "điều của", "của luật", "luật số",
  "còn hiệu", "hiệu lực", "lực không", "có hiệu", "the law", "law on", "decree on", "of the",
  "in force",
];
const GENERIC_MARKED = new Set(GENERIC.map((g) => g.normalize("NFC")));
const GENERIC_PLAIN = new Set(GENERIC.map(fold));
/** Tên văn bản phải chứa ít nhất chừng này cặp âm tiết của câu hỏi. */
const MIN_PAIRS = 2;

/*
  Câu có dấu so với tên có dấu, câu gõ không dấu so với tên đã bỏ dấu: bỏ dấu
  cả hai phía thì "có sổ" khớp nhầm "cơ sở".
*/
function words(text: string, plain: boolean): string[] {
  const t = text.normalize("NFC").toLowerCase();
  return (plain ? fold(t) : t)
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .split(" ")
    .filter(Boolean);
}

/** Cặp âm tiết liền nhau, trừ cặp chung chung. */
function pairs(text: string, plain: boolean): Set<string> {
  const w = words(text, plain);
  const generic = plain ? GENERIC_PLAIN : GENERIC_MARKED;
  const out = new Set<string>();
  for (let i = 0; i + 1 < w.length; i++) {
    const p = `${w[i]} ${w[i + 1]}`;
    if (!generic.has(p)) out.add(p);
  }
  return out;
}

/** Văn bản có tên chứa nhiều cặp âm tiết của câu hỏi nhất. */
function titleMatches(text: string, lang: Lang): LegalDoc[] {
  const plain = fold(text) === text.toLowerCase();
  const want = pairs(text, plain);
  if (want.size < MIN_PAIRS) return [];
  return documents
    .map((d) => {
      const title = ` ${words(d.title[lang], plain).join(" ")} `;
      let score = 0;
      for (const p of want) if (title.includes(` ${p} `)) score++;
      return { d, score };
    })
    .filter((x) => x.score >= MIN_PAIRS)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.d);
}

const SITE_WORDS = [
  "cách dùng", "sử dụng trang", "hướng dẫn sử dụng", "trang này", "tìm văn bản", "tra cứu",
  "tại ngày", "tại một ngày", "thời điểm", "tài khoản", "mua lượt", "lịch sử", "how do i",
  "how to", "this site", "account", "credits", "past date",
].map((w) => ` ${fold(w)} `);

function asksAboutSite(text: string): boolean {
  const t = ` ${fold(text).replace(/[^\p{L}\p{N}]+/gu, " ")} `;
  return SITE_WORDS.some((w) => t.includes(w));
}

/** Chữ Markdown của câu trả lời tra cứu tự động cho câu hỏi `text`. */
export function offlineAnswer(opts: { lang: Lang; text: string; domains: DomainId[] }): string {
  const { lang, text } = opts;
  const t = getChatCopy(lang).offline;
  const today = todayVn();

  const picked = new Set<LegalDoc>();
  for (const d of mentioned(text)) [d, ...replacers(d), ...amenders(d)].forEach((x) => picked.add(x));
  titleMatches(text, lang).forEach((d) => picked.add(d));
  for (const dom of opts.domains) domainDocs(dom, today).slice(0, PER_DOMAIN).forEach((d) => picked.add(d));
  const docs = [...picked].slice(0, MAX_DOCS);
  const site = asksAboutSite(text);

  const out = [t.note];
  if (site) out.push(`### ${t.guideTitle}`, t.guide.map((g) => `- ${g}`).join("\n"));
  if (docs.length > 0) {
    out.push(
      `### ${t.related}`,
      docs
        .map((d) => `- **${d.number}**, ${d.title[lang]}: ${statusText(d, lang, today)}. [${t.open}](/${lang}/van-ban/${d.id})`)
        .join("\n"),
    );
  } else if (!site) {
    out.push(t.none);
  }
  out.push(t.retry);
  return out.join("\n\n");
}

/** Luồng NDJSON một sự kiện, cùng dạng với câu trả lời của mô hình. */
export function offlineBody(answer: string): ReadableStream<Uint8Array> {
  const event: ChatEvent = { t: answer };
  const bytes = new TextEncoder().encode(`${JSON.stringify(event)}\n`);
  return new ReadableStream({
    start(out) {
      out.enqueue(bytes);
      out.close();
    },
  });
}
