import { comparisons } from "@/data/comparisons";
import { documents, documentsById } from "@/data/documents";
import type { Lang } from "@/data/types";
import { norm, skillLibrary } from "@/lib/chat/skills";
import { fold } from "@/lib/search-engine";

/**
 * Tìm trong tư liệu những đoạn liên quan tới câu hỏi, để gửi kèm câu hỏi thay
 * vì gửi nguyên cả bộ tư liệu.
 *
 * Hai nguồn, xếp hạng riêng và có hạn mức riêng:
 *
 * - Thư viện: mọi mục của gói skill (thân skill và tệp tham chiếu), cắt theo đầu
 *   mục Markdown. Thân của skill chính không tìm lại, vì đã gửi nguyên văn.
 * - Trang: tóm tắt và ghi chú của từng văn bản trong kho, và từng điểm đối chiếu
 *   cũ và mới, mỗi đoạn kèm đường dẫn của nó trên trang.
 *
 * Xếp hạng bằng BM25 trên âm tiết và cặp âm tiết liền nhau, vì tiếng Việt viết
 * một từ bằng nhiều âm tiết ("hợp đồng", "đất đai"). Câu gõ không dấu so với chữ
 * đã bỏ dấu, câu có dấu so với chữ có dấu, như cách chọn skill ở `skills.ts`.
 * Không tốn thêm lượt gọi mô hình nào.
 */

/** Độ dài tối đa của một đoạn thư viện. Đầu mục dài hơn được chia theo đoạn văn. */
const MAX_CHUNK = 2400;
/** Đoạn ngắn hơn thế chỉ là đầu mục hay một dòng dẫn, bỏ. */
const MIN_CHUNK = 80;
/** Hạn mức chữ của mỗi nguồn trong prompt. */
const LIBRARY_CHARS = 8000;
const SITE_CHARS = 3000;
/**
 * Ba ngưỡng để không kéo đoạn chỉ khớp một từ chung ("tài sản", "chào"). Đoạn
 * phải khớp ít nhất `MIN_HITS` âm tiết khác nhau của câu hỏi. Độ phủ là điểm của
 * đoạn chia cho điểm tối đa câu hỏi có thể đạt; âm tiết mà tư liệu không hề có
 * vẫn tính vào điểm tối đa, nên câu hỏi tư liệu không bàn tới (hình sự, nấu ăn)
 * không kéo được đoạn nào. Cặp âm tiết không có trong tư liệu thì không tính, vì
 * phần lớn là cặp nối qua ranh giới hai từ ("cọc thì"). Đoạn còn phải đạt một
 * phần điểm của đoạn cao nhất.
 */
const MIN_HITS = 2;
const MIN_COVER = 0.2;
const MIN_RELATIVE = 0.4;

const STOP_WORDS = (
  "của và là có không được cho các những một trong với khi thì này đó theo về để từ người như nào gì " +
  "thế sao bị bởi hay hoặc đến ở tại mà nên nếu vì do đã đang sẽ cũng rất vẫn còn ra vào lên lại hơn " +
  "nhiều ít mọi mỗi tôi bạn anh chị em mình họ chúng ta ạ nhé à ơi vậy thôi phải cần muốn xin giúp hỏi " +
  "bao nhiêu lâu đâu " +
  "the a an of on at in by for to is are was were be been and or not with this that these those it its " +
  "as from what which how do does did can could should would i you we they my your"
).split(" ");
const STOP = new Set(STOP_WORDS.map((w) => norm(w).trim()));
const STOP_PLAIN = new Set([...STOP].map(fold));

/** Âm tiết (trừ từ nối) và mọi cặp âm tiết liền nhau không phải hai từ nối. */
function terms(text: string, plain: boolean): string[] {
  const t = norm(text).trim();
  const words = (plain ? fold(t) : t).split(" ").filter(Boolean);
  const stop = plain ? STOP_PLAIN : STOP;
  const out: string[] = [];
  words.forEach((w, i) => {
    if (!stop.has(w)) out.push(w);
    const next = words[i + 1];
    if (next && !(stop.has(w) && stop.has(next))) out.push(`${w} ${next}`);
  });
  return out;
}

function counts(list: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of list) m.set(t, (m.get(t) ?? 0) + 1);
  return m;
}

interface Bm25 {
  docs: { tf: Map<string, number>; len: number }[];
  df: Map<string, number>;
  avg: number;
}

function bm25(texts: string[], plain: boolean): Bm25 {
  const docs = texts.map((t) => {
    const list = terms(t, plain);
    return { tf: counts(list), len: list.length };
  });
  const df = new Map<string, number>();
  for (const d of docs) for (const t of d.tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  const avg = docs.reduce((n, d) => n + d.len, 0) / Math.max(docs.length, 1);
  return { docs, df, avg };
}

/**
 * Cộng điểm của câu hỏi vào `scores` và số âm tiết khớp vào `hits` của từng
 * đoạn; trả về điểm tối đa câu hỏi có thể đạt.
 */
function addScores(ix: Bm25, query: Map<string, number>, scores: number[], hits: number[]): number {
  const k1 = 1.2;
  const b = 0.75;
  const n = ix.docs.length;
  let max = 0;
  for (const [t, qw] of query) {
    const df = ix.df.get(t) ?? 0;
    const single = !t.includes(" ");
    const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5));
    if (df || single) max += qw * idf * (k1 + 1);
    if (!df) continue;
    ix.docs.forEach((d, i) => {
      const tf = d.tf.get(t);
      if (!tf) return;
      scores[i] += qw * idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * d.len) / ix.avg)));
      if (single) hits[i]++;
    });
  }
  return max;
}

interface Chunk {
  /** Mục phát sinh ra đoạn: khóa trong gói skill, hoặc mã văn bản, mã cặp đối chiếu. */
  owner: string;
  head: string;
  body: string;
  link?: string;
}

/** Một nguồn đã dựng chỉ mục: có dấu và bỏ dấu. */
interface Source {
  chunks: Chunk[];
  marked: Bm25;
  plain: Bm25;
}

function source(chunks: Chunk[], indexText: (c: Chunk) => string): Source {
  const texts = chunks.map(indexText);
  return { chunks, marked: bm25(texts, false), plain: bm25(texts, true) };
}

/** Chia phần thân dài theo đoạn văn; đoạn văn quá dài (thường là bảng) chia theo dòng. */
function pieces(body: string): string[] {
  if (body.length <= MAX_CHUNK) return [body];
  const units = body.split(/\n{2,}/).flatMap((p) => (p.length > MAX_CHUNK ? p.split("\n") : [p]));
  const out: string[] = [];
  let cur = "";
  for (const u of units) {
    if (cur && cur.length + u.length + 2 > MAX_CHUNK) {
      out.push(cur);
      cur = "";
    }
    cur = cur ? `${cur}\n\n${u}` : u;
  }
  if (cur) out.push(cur);
  return out;
}

/** Cắt một tệp Markdown theo đầu mục cấp 1 tới 3; dòng trong khối mã không phải đầu mục. */
function splitMarkdown(owner: string, text: string): Chunk[] {
  const out: Chunk[] = [];
  const heads = ["", "", ""];
  let lines: string[] = [];
  let fenced = false;
  const flush = () => {
    const body = lines.join("\n").trim();
    lines = [];
    if (body.length < MIN_CHUNK) return;
    const head = heads.filter(Boolean).join(" › ");
    for (const p of pieces(body)) out.push({ owner, head, body: p });
  };
  for (const line of text.split("\n")) {
    if (line.startsWith("```")) fenced = !fenced;
    const m = fenced ? null : /^(#{1,3})\s+(.+)$/.exec(line);
    if (!m) {
      lines.push(line);
      continue;
    }
    flush();
    const level = m[1].length - 1;
    heads[level] = m[2].trim();
    heads.fill("", level + 1);
  }
  flush();
  return out;
}

let library: Source | undefined;
const site = new Map<Lang, Source>();

function librarySource(): Source {
  library ??= source(
    Object.entries(skillLibrary()).flatMap(([key, text]) => splitMarkdown(key, text)),
    (c) => `${c.head}\n${c.body}`,
  );
  return library;
}

/*
  Đoạn của trang hiển thị theo ngôn ngữ trang, nhưng chỉ mục gồm cả hai thứ
  tiếng, để câu hỏi tiếng Việt trên trang tiếng Anh vẫn tìm ra.
*/
function siteSource(lang: Lang): Source {
  const cached = site.get(lang);
  if (cached) return cached;
  const index = new Map<Chunk, string>();
  const chunks: Chunk[] = [];
  for (const d of documents) {
    const c: Chunk = {
      owner: d.id,
      head: `${d.number} — ${d.title[lang]}`,
      body: [d.summary[lang], d.note?.[lang]].filter(Boolean).join(" "),
      link: `/${lang}/van-ban/${d.id}`,
    };
    chunks.push(c);
    index.set(c, [d.number, d.title.vi, d.title.en, d.summary.vi, d.summary.en, d.note?.vi, d.note?.en].join("\n"));
  }
  const words =
    lang === "vi"
      ? { pair: "Đối chiếu", with: "với", before: "Trước", after: "Sau", note: "Nhận xét" }
      : { pair: "Comparison of", with: "with", before: "Before", after: "After", note: "Observation" };
  for (const e of comparisons) {
    const newer = documentsById.get(e.newId)?.number ?? e.newId;
    const older = documentsById.get(e.oldId)?.number ?? e.oldId;
    for (const p of e.points) {
      const c: Chunk = {
        owner: `${e.newId}--${e.oldId}`,
        head: `${words.pair} ${newer} ${words.with} ${older} › ${p.topic[lang]}`,
        body: `${words.before}: ${p.before[lang]}\n${words.after}: ${p.after[lang]}\n${words.note}: ${p.observation[lang]}`,
        link: `/${lang}/doi-chieu/${e.newId}--${e.oldId}#${p.id}`,
      };
      chunks.push(c);
      index.set(
        c,
        [newer, older, p.topic.vi, p.topic.en, p.before.vi, p.before.en, p.after.vi, p.after.en].join("\n"),
      );
    }
  }
  const s = source(chunks, (c) => index.get(c) ?? "");
  site.set(lang, s);
  return s;
}

/**
 * Câu hỏi thành trọng số của từng từ: tin cuối tính gấp đôi. Mỗi tin so ở một
 * kiểu chữ: không dấu thì so với chỉ mục bỏ dấu.
 */
function queryOf(texts: string[]): { marked: Map<string, number>; plain: Map<string, number> } {
  const marked = new Map<string, number>();
  const plain = new Map<string, number>();
  texts.forEach((text, i) => {
    const weight = i === texts.length - 1 ? 2 : 1;
    const n = norm(text);
    const isPlain = fold(n) === n;
    const into = isPlain ? plain : marked;
    for (const t of new Set(terms(text, isPlain))) into.set(t, (into.get(t) ?? 0) + weight);
  });
  return { marked, plain };
}

function pick(s: Source, texts: string[], budget: number, perOwner: number, skip?: string): Chunk[] {
  const q = queryOf(texts);
  const scores = new Array<number>(s.chunks.length).fill(0);
  const hits = new Array<number>(s.chunks.length).fill(0);
  const max = addScores(s.marked, q.marked, scores, hits) + addScores(s.plain, q.plain, scores, hits);
  const order = scores
    .map((score, i) => ({ score, c: s.chunks[i], ok: hits[i] >= MIN_HITS }))
    .filter((x) => x.ok && x.score > 0 && x.score >= max * MIN_COVER && x.c.owner !== skip)
    .sort((a, b) => b.score - a.score);
  if (order.length === 0) return [];
  const floor = order[0].score * MIN_RELATIVE;
  const out: Chunk[] = [];
  const used = new Map<string, number>();
  let size = 0;
  for (const { score, c } of order) {
    if (score < floor) break;
    const n = used.get(c.owner) ?? 0;
    const len = c.head.length + c.body.length;
    if (n >= perOwner || size + len > budget) continue;
    out.push(c);
    used.set(c.owner, n + 1);
    size += len;
  }
  return out;
}

function render(c: Chunk): string {
  return `### ${c.head}${c.link ? ` (${c.link})` : ""}\n\n${c.body}`;
}

/**
 * Mục "Tư liệu tra cứu" của system prompt. `texts` là các tin gần đây của người
 * dùng theo thứ tự thời gian; `mainSkill` là skill đã gửi nguyên văn.
 */
export function retrieve(opts: { lang: Lang; texts: string[]; mainSkill: string }): string {
  const lib = pick(librarySource(), opts.texts, LIBRARY_CHARS, 2, opts.mainSkill);
  const own = pick(siteSource(opts.lang), opts.texts, SITE_CHARS, 1);
  const parts = ["# Tư liệu tra cứu"];
  parts.push(
    lib.length > 0
      ? `## Tư liệu của chủ trang\n\n${lib.map(render).join("\n\n")}`
      : "## Tư liệu của chủ trang\n\nKhông có đoạn nào khớp với câu hỏi này.",
  );
  if (own.length > 0) parts.push(`## Trích từ nội dung của trang\n\n${own.map(render).join("\n\n")}`);
  return parts.join("\n\n");
}
