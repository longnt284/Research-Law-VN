/**
 * Bộ máy tìm kiếm chạy trên trình duyệt.
 *
 * Nhận chỉ mục dựng sẵn (`src/lib/search-types.ts`) và một câu tìm, trả về văn
 * bản khớp kèm cách đọc câu tìm. Hàm thuần, không nhập tập dữ liệu.
 *
 * Câu tìm được đọc theo năm lớp, mỗi lớp chỉ dựa vào chữ người đọc gõ:
 *
 * 1. Ngày ("01/05/2024", "2024-05-01"): tình trạng của mọi kết quả tính tại ngày
 *    đó thay vì ngày tra cứu.
 * 2. Điều khoản ("Điều 76"): tra chỉ mục điều khoản đã đọc.
 * 3. Ý định ("thay thế", "sửa đổi", "hướng dẫn", "còn hiệu lực"): quyết định
 *    phần trả lời có cấu trúc nói gì, không đổi danh sách kết quả.
 * 4. Số hiệu và phần số ("58/2025", "Nghị định 58"): khớp theo từng đoạn của số
 *    hiệu, và theo số hiệu của văn bản có quan hệ.
 * 5. Chữ còn lại: mọi từ phải có mặt (bỏ dấu), tên văn bản khớp cụm thì lên trước.
 *
 * Không có bước nào đoán: câu tìm không nhận ra được thì chỉ còn tìm theo chữ.
 */

import type { DocType, DomainId } from "@/data/types";
import { articleQuery, type ArticleEntry } from "@/lib/article-query";
import type { IndexDoc, SearchIndex } from "@/lib/search-types";
import { segmentAt, type ValiditySegment } from "@/lib/validity-segment";

const MARKS = /[̀-ͯ]/g;

/**
 * Bỏ dấu và viết thường, giữ đúng độ dài chuỗi: ký tự thứ i của kết quả ứng với
 * ký tự thứ i của chuỗi gốc. Nhờ vậy chỗ khớp tìm trên chuỗi bỏ dấu tô được
 * thẳng lên chuỗi có dấu.
 */
export function fold(s: string): string {
  let out = "";
  for (const ch of s) {
    if (ch === "đ" || ch === "Đ") {
      out += "d";
      continue;
    }
    const base = ch.normalize("NFD").replace(MARKS, "");
    const one = base.length === ch.length ? base : ch;
    const low = one.toLowerCase();
    out += low.length === one.length ? low : one;
  }
  return out;
}

export type Intent = "replace" | "amend" | "guide" | "validity";

const INTENTS: [RegExp, Intent][] = [
  [/\b(?:thay the|replac\w*|successor\w*|predecessor\w*|doi sau|doi truoc)\b/g, "replace"],
  [/\b(?:sua doi|bo sung|amend\w*)\b/g, "amend"],
  [/\b(?:huong dan|quy dinh chi tiet|guid\w*|implement\w*)\b/g, "guide"],
  [/\b(?:con hieu luc|het hieu luc|hieu luc|in force|valid\w*|effective|ap dung|appl\w*)\b/g, "validity"],
];

/**
 * Loại văn bản nhắc trong câu tìm, viết thành dãy từ đã bỏ dấu. Dãy dài xét
 * trước, nên "bộ luật" không bị đọc thành "luật".
 */
const TYPE_WORDS: [string[], DocType][] = [
  [["bo", "luat"], "bo-luat"],
  [["nghi", "dinh"], "nghi-dinh"],
  [["thong", "tu"], "thong-tu"],
  [["nghi", "quyet"], "nghi-quyet"],
  [["quyet", "dinh"], "quyet-dinh"],
  [["code"], "bo-luat"],
  [["decree"], "nghi-dinh"],
  [["decrees"], "nghi-dinh"],
  [["nd"], "nghi-dinh"],
  [["circular"], "thong-tu"],
  [["circulars"], "thong-tu"],
  [["tt"], "thong-tu"],
  [["resolution"], "nghi-quyet"],
  [["resolutions"], "nghi-quyet"],
  [["nq"], "nghi-quyet"],
  [["decision"], "quyet-dinh"],
  [["decisions"], "quyet-dinh"],
  [["qd"], "quyet-dinh"],
  [["luat"], "luat"],
  [["law"], "luat"],
  [["laws"], "luat"],
];

/** Từ hỏi và từ nối, chỉ bỏ khi câu tìm có dáng một câu hỏi. */
const STOP = new Set(
  "nao gi khong co con cua la tai ngay vao nay cho nhung cac mot duoc bi boi va hay hoac den voi ve thi ma o nhu hien hanh nay which what is are was were the a an of on at in by for to does do did still now today currently".split(
    " ",
  ),
);
const QUESTION = /\?|\b(?:nao|gi|khong|which|what|does|is)\b/;

export interface ParsedQuery {
  raw: string;
  /** Ngày ISO đọc được trong câu tìm. */
  date?: string;
  /** Số điều, khi câu tìm nhắc tới một điều. */
  article?: string;
  intent?: Intent;
  type?: DocType;
  /** Mảnh có chữ số: số hiệu hoặc phần của số hiệu. */
  nums: string[];
  /** Từ còn lại, đã bỏ dấu. */
  words: string[];
}

function isoFrom(d: number, m: number, y: number): string | undefined {
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900 || y > 2100) return undefined;
  const iso = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const check = new Date(`${iso}T00:00:00Z`);
  return check.toISOString().slice(0, 10) === iso ? iso : undefined;
}

export function parseQuery(raw: string): ParsedQuery {
  let q = ` ${fold(raw.trim())} `;
  const out: ParsedQuery = { raw, nums: [], words: [] };

  // 1. Ngày. Ba phần, năm bốn chữ số ở cuối, nên "15/2021/nd-cp" không bị đọc thành ngày.
  const dmy = q.match(/(?<![\d/])(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})(?![\d/])/);
  if (dmy) {
    const iso = isoFrom(Number(dmy[1]), Number(dmy[2]), Number(dmy[3]));
    if (iso) {
      out.date = iso;
      q = q.replace(dmy[0], " ");
    }
  } else {
    const ymd = q.match(/(?<![\d/])(\d{4})-(\d{2})-(\d{2})(?![\d/])/);
    const iso = ymd && isoFrom(Number(ymd[3]), Number(ymd[2]), Number(ymd[1]));
    if (ymd && iso) {
      out.date = iso;
      q = q.replace(ymd[0], " ");
    }
  }

  // 2. Điều khoản.
  const art = articleQuery(q.trim());
  if (art) {
    out.article = art.article;
    q = ` ${art.rest} `;
  }

  // 3. Ý định: ghi nhận rồi bỏ khỏi phần chữ.
  for (const [re, intent] of INTENTS) {
    if (re.test(q)) {
      out.intent ??= intent;
      q = q.replace(re, " ");
    }
    re.lastIndex = 0;
  }

  const tokens = q
    .replace(/[,;:!?()"“”«»]/g, " ")
    .split(/\s+/)
    .map((x) => x.replace(/^[.\-/]+|[.\-/]+$/g, ""))
    .filter(Boolean);
  const asks = QUESTION.test(fold(raw)) || !!out.intent || !!out.date;

  // Loại văn bản: tách khỏi phần chữ, dùng để xếp hạng. Chỉ xét từ đứng riêng,
  // không xét mảnh nằm trong số hiệu như "80/2021/tt-btc".
  const words: string[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const hit = TYPE_WORDS.find(([seq]) => seq.every((w, k) => tokens[i + k] === w));
    if (hit) {
      out.type ??= hit[1];
      i += hit[0].length - 1;
      continue;
    }
    words.push(tokens[i]);
  }

  const seen = new Set<string>();
  for (const tok of words) {
    if (seen.has(tok)) continue;
    seen.add(tok);
    if (/\d/.test(tok)) out.nums.push(tok);
    else if (!(asks && STOP.has(tok)) && !(asks && (tok === "van" || tok === "ban"))) {
      out.words.push(tok);
    }
  }
  return out;
}

export interface Prepared {
  doc: IndexDoc;
  num: string;
  title: string;
  hay: string;
  summary: string;
  rel: string[];
}

/**
 * Chuẩn bị chỉ mục cho việc tìm: bỏ dấu một lần cho mọi trường.
 *
 * `extra` là nhãn loại văn bản và nhãn lĩnh vực ở cả hai thứ tiếng, để "nghị
 * định" hay "năng lượng" khớp được dù chữ đó không nằm trong tên văn bản.
 */
export function prepare(
  index: SearchIndex,
  typeLabels: Record<DocType, string>,
  domainLabels: Partial<Record<DomainId, string>>,
): Prepared[] {
  return index.docs.map((doc) => {
    const num = fold(doc.n);
    const title = fold(doc.t);
    const extra = [typeLabels[doc.ty], ...doc.dom.map((d) => domainLabels[d] ?? "")].join(" ");
    return {
      doc,
      num,
      title,
      hay: ` ${num} ${title} ${fold(doc.o)} ${fold(extra)} `,
      summary: fold(doc.s),
      rel: [...doc.rep, ...doc.by, ...doc.amBy, ...doc.am, ...doc.up].map(([, n]) => fold(n)),
    };
  });
}

const TIER: Record<DocType, number> = {
  "bo-luat": 0,
  luat: 0,
  "dieu-uoc": 0,
  "nghi-quyet": 1,
  vbhn: 1,
  "nghi-dinh": 2,
  "quyet-dinh": 2,
  "thong-tu": 3,
  "quy-tac": 3,
};

export interface Hit {
  doc: IndexDoc;
  score: number;
  /** Khớp qua số hiệu của một văn bản có quan hệ, không phải qua chính nó. */
  viaRelation: boolean;
}

function numScore(p: Prepared, tok: string): { s: number; via: boolean } {
  const n = p.num;
  if (n === tok) return { s: 1000, via: false };
  if (n.startsWith(`${tok}/`) || n.startsWith(`${tok}-`)) return { s: 700, via: false };
  if (n.startsWith(tok)) return { s: 300, via: false };
  if (n.includes(`/${tok}/`) || n.endsWith(`/${tok}`)) return { s: 160, via: false };
  if (n.includes(tok)) return { s: 110, via: false };
  if (p.rel.some((r) => r === tok || r.startsWith(`${tok}/`) || r.startsWith(`${tok}-`))) {
    return { s: 90, via: true };
  }
  if (p.hay.includes(tok)) return { s: 40, via: false };
  return { s: -1, via: false };
}

export function search(prepared: Prepared[], q: ParsedQuery): Hit[] {
  if (q.nums.length === 0 && q.words.length === 0 && !q.type) return [];
  // Câu tìm chỉ còn loại văn bản ("Luật nào áp dụng ngày…"): lọc đúng loại đó.
  const typeOnly = q.nums.length === 0 && q.words.length === 0;
  const phrase = q.words.join(" ");
  const hits: Hit[] = [];
  for (const p of prepared) {
    let score = 0;
    let via = false;
    let directNum = false;
    let miss = false;
    for (const tok of q.nums) {
      const r = numScore(p, tok);
      if (r.s < 0) {
        miss = true;
        break;
      }
      score += r.s;
      if (r.via) via = true;
      else if (r.s >= 300) directNum = true;
    }
    if (miss) continue;
    for (const w of q.words) {
      const inTitle = p.title.indexOf(w);
      if (inTitle >= 0) score += inTitle === 0 || p.title[inTitle - 1] === " " ? 40 : 15;
      else if (p.hay.includes(w)) score += 8;
      // Từ chỉ có trong phần tóm tắt vẫn tính, nhưng nhẹ nhất: tên văn bản
      // khớp thì luôn đứng trước.
      else if (p.summary.includes(w)) score += 3;
      else {
        miss = true;
        break;
      }
    }
    if (miss) continue;
    if (phrase.length > 2) {
      if (p.title.startsWith(phrase)) score += 180;
      else if (p.title.includes(phrase)) score += 120;
    }
    if (q.type) {
      if (p.doc.ty === q.type || (q.type === "luat" && p.doc.ty === "bo-luat")) score += 80;
      else if (typeOnly) continue;
      else if (q.nums.length > 0) score -= 400;
      else score -= 30;
    }
    hits.push({ doc: p.doc, score, viaRelation: via && !directNum });
  }
  return hits.sort(
    (a, b) =>
      b.score - a.score ||
      TIER[a.doc.ty] - TIER[b.doc.ty] ||
      (b.doc.eff || "").localeCompare(a.doc.eff || ""),
  );
}

/**
 * Văn bản mà câu tìm rõ ràng nhắm tới: số hiệu khớp và bỏ xa kết quả thứ hai.
 * Khi có, ô tìm trả lời thẳng bằng một khối có cấu trúc thay vì chỉ liệt kê.
 */
export function focusOf(hits: Hit[]): IndexDoc | null {
  const [a, b] = hits;
  if (!a || a.viaRelation || a.score < 700) return null;
  if (b && b.score >= a.score * 0.75) return null;
  return a.doc;
}

/** Điều khoản đã đọc khớp với câu tìm, lọc theo số hiệu nếu câu tìm có số hiệu. */
export function articleHits(
  articles: ArticleEntry[],
  q: ParsedQuery,
  hits: Hit[],
): ArticleEntry[] {
  if (!q.article) return [];
  const pool = articles.filter((a) => a.dieu === q.article);
  if (q.nums.length === 0 && q.words.length === 0) return pool;
  const ids = new Set(hits.filter((h) => !h.viaRelation).map((h) => h.doc.id));
  return pool.filter((a) => ids.has(a.docId));
}

/** Tình trạng của văn bản tại một ngày, từ các đoạn tính sẵn. */
export function stateAt(doc: IndexDoc, date: string): ValiditySegment {
  return segmentAt(doc.seg, date);
}

/**
 * Chia chuỗi thành các đoạn có và không khớp, để tô chỗ khớp. So trên chuỗi bỏ
 * dấu, cắt trên chuỗi gốc: `fold` giữ nguyên độ dài nên chỉ số dùng chung được.
 */
export function highlight(text: string, terms: string[]): { t: string; hit: boolean }[] {
  const f = fold(text);
  const ranges: [number, number][] = [];
  for (const term of terms) {
    if (term.length < 2 && !/\d/.test(term)) continue;
    let i = f.indexOf(term);
    while (i >= 0) {
      ranges.push([i, i + term.length]);
      i = f.indexOf(term, i + term.length);
    }
  }
  if (ranges.length === 0) return [{ t: text, hit: false }];
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([...r]);
  }
  const out: { t: string; hit: boolean }[] = [];
  let pos = 0;
  for (const [s, e] of merged) {
    if (s > pos) out.push({ t: text.slice(pos, s), hit: false });
    out.push({ t: text.slice(s, e), hit: true });
    pos = e;
  }
  if (pos < text.length) out.push({ t: text.slice(pos), hit: false });
  return out;
}
