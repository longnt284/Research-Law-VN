import { LAWS, Law, Article, allArticles, FIELDS } from "../data/laws";

export let lastQuery = "";
export const setLastQuery = (q: string) => {
  lastQuery = q;
};

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

const tokenize = (q: string) =>
  normalize(q)
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

export interface ArticleHit {
  law: Law;
  article: Article;
  snippet: string;
}
export interface LawResult {
  law: Law;
  score: number;
  articleHits: ArticleHit[];
}

const makeSnippet = (text: string, tokens: string[], span = 110) => {
  const n = normalize(text);
  let idx = -1;
  for (const t of tokens) {
    const i = n.indexOf(t);
    if (i !== -1) {
      idx = i;
      break;
    }
  }
  if (idx === -1) return text.length > span ? text.slice(0, span) + "…" : text;
  // map normalized index back to original index (NFD stripping shifts indices only for accented chars; approximation is fine)
  const start = Math.max(0, Math.min(idx - 30, text.length - 1));
  const end = Math.min(text.length, start + span);
  return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
};

const articleText = (a: Article) =>
  a.clauses.map((c) => c.text + (c.points ? " " + c.points.map((p) => p.text).join(" ") : "")).join(" ");

export function searchAll(query: string, laws: Law[] = LAWS): LawResult[] {
  const q = query.trim();
  const results: LawResult[] = laws.map((law) => ({ law, score: 0, articleHits: [] }));

  if (!q) {
    return results
      .map((r) => ({ ...r, score: Date.parse(r.law.effectiveDate) }))
      .sort((a, b) => b.score - a.score);
  }

  const tokens = tokenize(q);
  const nq = normalize(q);

  // "Điều 12 Luật Đất đai" style parsing
  const articleMatch = nq.match(/(?:dieu|dieukhoan|dk)\s*(\d+)/);
  const articleNum = articleMatch ? parseInt(articleMatch[1], 10) : null;

  for (const r of results) {
    const { law } = r;
    const nName = normalize(law.name);
    const nNum = normalize(law.number);
    const nField = normalize(FIELDS.find((f) => f.id === law.field)?.name ?? "");

    if (nNum.includes(nq) && nq.length > 2) r.score += 120;
    tokens.forEach((t) => {
      if (t.length < 2) return;
      if (nName.includes(t)) r.score += 40 + (nName.startsWith(t) ? 15 : 0);
      if (nNum.includes(t)) r.score += 45;
      if (law.keywords.some((k) => normalize(k).includes(t))) r.score += 22;
      if (nField.includes(t)) r.score += 8;
    });
    if (articleNum !== null) {
      const hasNum = allArticles(law).some((a) => a.number === articleNum);
      if (hasNum) r.score += 30;
    }

    const hits: { a: Article; s: number; snippet: string }[] = [];
    for (const a of allArticles(law)) {
      const body = articleText(a);
      const nBody = normalize(body);
      let s = 0;
      if (articleNum !== null && a.number === articleNum) s += 55;
      tokens.forEach((t) => {
        if (t.length < 2) return;
        if (nBody.includes(t)) s += 12;
        if (normalize(a.title).includes(t)) s += 18;
      });
      if (s > 0) hits.push({ a, s, snippet: makeSnippet(body, tokens) });
    }
    hits.sort((x, y) => y.s - x.s);
    r.articleHits = hits.slice(0, 3).map((h) => ({ law, article: h.a, snippet: h.snippet }));
    r.score += Math.min(30, hits.reduce((s, h) => s + h.s, 0));
  }

  return results.filter((r) => r.score > 0).sort((a, b) => b.score - a.score);
}

export interface Suggestion {
  type: "law" | "article" | "field";
  label: string;
  sub?: string;
  lawId: string;
  articleId?: string;
  fieldId?: string;
}

export function suggest(query: string, limit = 6): Suggestion[] {
  const q = query.trim();
  if (!q) return [];
  const res: Suggestion[] = [];
  const seen = new Set<string>();

  const lawHits = searchAll(q).slice(0, limit);
  lawHits.forEach((r) => {
    res.push({ type: "law", label: r.law.name, sub: `${r.law.type} · ${r.law.number}`, lawId: r.law.id });
    seen.add(r.law.id);
  });

  const articlePool: Suggestion[] = [];
  for (const r of lawHits) {
    for (const h of r.articleHits) {
      articlePool.push({
        type: "article",
        label: `Điều ${h.article.number} · ${h.article.title}`,
        sub: h.law.name,
        lawId: h.law.id,
        articleId: h.article.id,
      });
    }
  }
  articlePool.slice(0, limit).forEach((s) => res.push(s));

  const nq = normalize(q);
  FIELDS.forEach((f) => {
    if (res.length >= limit * 2) return;
    if (normalize(f.name).includes(nq) || tokenize(q).some((t) => t.length > 2 && normalize(f.name).includes(t))) {
      res.push({ type: "field", label: f.name, sub: "Lĩnh vực", lawId: "", fieldId: f.id });
    }
  });

  return res.slice(0, limit * 2);
}

export const POPULAR_QUERIES = [
  "hợp đồng lao động",
  "thành lập doanh nghiệp",
  "thừa kế",
  "điều kiện kết hôn",
  "phạt vi phạm 8%",
  "nồng độ cồn",
  "sổ đỏ",
  "trộm cắp tài sản",
];
