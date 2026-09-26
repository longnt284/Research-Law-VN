import { documents, domains } from "@/data/documents";
import type { Lang } from "@/data/types";
import { getDict } from "@/i18n/dictionary";
import { getFreeCompareCopy } from "@/i18n/free-compare";
import { getSearchCopy } from "@/i18n/search";
import { articlePages, articlePath } from "@/lib/article-pages";
import { formatCitation, formatPinpoint } from "@/lib/citation";
import { pairs } from "@/lib/compare";
import { fold, type SearchItem } from "@/lib/search";
import { pathFor } from "@/lib/site";

/**
 * Chỉ mục của hộp tìm toàn trang, dựng ở máy chủ cho từng thứ tiếng.
 *
 * Gồm năm loại mục: văn bản, điều khoản đã có trang riêng, cặp đối chiếu, lĩnh
 * vực và các trang công cụ. Văn bản mang cả tên hai thứ tiếng trong phần tìm
 * được, nên người đọc bản tiếng Anh gõ "luat dat dai" vẫn ra Luật Đất đai.
 */
export function buildSearchIndex(lang: Lang): SearchItem[] {
  const t = getDict(lang);
  const fc = getFreeCompareCopy(lang);
  const sc = getSearchCopy(lang);
  const out: SearchItem[] = [];
  const num = (n: string) => fold(n).replace(/\s+/g, "");

  for (const d of documents) {
    const title = `${d.number} — ${d.title[lang]}`;
    out.push({
      kind: "doc",
      href: pathFor(lang, `/van-ban/${d.id}`),
      title,
      sub: t.type[d.type],
      status: d.status,
      num: num(d.number),
      head: fold(d.title[lang]),
      body: fold(`${d.number} ${d.title.vi} ${d.title.en} ${d.summary[lang]} ${t.type[d.type]}`),
    });
  }

  for (const a of articlePages) {
    const doc = documents.find((d) => d.id === a.docId);
    if (!doc) continue;
    const pin = formatPinpoint(a.cite, lang);
    out.push({
      kind: "article",
      href: pathFor(lang, articlePath(a.docId, a.dieu)),
      title: `${pin} — ${doc.number}`,
      sub: doc.title[lang],
      num: num(doc.number),
      head: fold(pin),
      // Cả hai cách gọi điều, để "dieu 38" và "article 38" đều ra cùng một mục.
      body: fold(`${formatCitation(a.cite, "vi")} ${formatCitation(a.cite, "en")}`),
    });
  }

  for (const p of pairs) {
    out.push({
      kind: "pair",
      href: pathFor(lang, `/doi-chieu/${p.id}`),
      title: `${p.oldDoc.number} ${t.compare.versus} ${p.newDoc.number}`,
      sub: `${p.kind === "replaces" ? t.compare.kindReplaces : t.compare.kindAmends}${
        p.entry ? ` · ${p.entry.points.length} ${t.compare.curatedBadge}` : ""
      }`,
      num: "",
      head: fold(`${p.oldDoc.title[lang]} ${p.newDoc.title[lang]}`),
      body: fold(
        `${p.oldDoc.number} ${p.newDoc.number} ${t.compare.title} ${p.oldDoc.title.vi} ${p.newDoc.title.vi} ${p.oldDoc.title.en} ${p.newDoc.title.en}`,
      ),
    });
  }

  for (const d of domains) {
    out.push({
      kind: "domain",
      href: pathFor(lang, `/linh-vuc/${d.id}`),
      title: d.label[lang],
      sub: t.nav.domains,
      num: "",
      head: fold(d.label[lang]),
      body: fold(`${d.label.vi} ${d.label.en} ${d.blurb[lang]}`),
    });
  }

  const pages: [string, string, string][] = [
    ["/van-ban", t.list.title, t.list.lede],
    ["/linh-vuc", t.domainPage.title, t.domainPage.lede],
    ["/doi-chieu", t.compare.title, t.compare.lede],
    ["/doi-chieu/tu-chon", fc.title, fc.lede],
    ["/phuong-phap", t.about.title, t.about.lede],
  ];
  for (const [sub, title, lede] of pages) {
    out.push({
      kind: "page",
      href: pathFor(lang, sub),
      title,
      sub: sc.kind.page,
      num: "",
      head: fold(title),
      body: fold(`${title} ${lede}`),
    });
  }

  return out;
}
