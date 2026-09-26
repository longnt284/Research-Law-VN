import { documentsById, verifiedOnOf } from "@/data/documents";
import type { Lang, LegalDoc } from "@/data/types";
import { formatDate, getDict } from "@/i18n/dictionary";
import { getDocPanel } from "@/i18n/doc-panel";
import { citeDocument } from "@/lib/citation";
import type { Family } from "@/lib/family";
import { clip, pathFor, SITE_URL } from "@/lib/site";
import { describeSources, primarySource } from "@/lib/sources";
import { amenders, replacers } from "@/lib/validity";

/**
 * Bản tóm tắt dạng chữ của một văn bản: tình trạng, mốc, quan hệ, nguồn.
 *
 * Dùng ở ba chỗ cần cùng một câu trả lời: thẻ mô tả cho công cụ tìm kiếm, nút
 * "sao chép bản tóm tắt" và tệp xuất. Mọi dòng đọc từ bản ghi; tình trạng luôn
 * đi kèm ngày tra cứu, vì nó chỉ đúng tại ngày đó.
 */

function numbers(docs: LegalDoc[]): string {
  return docs.map((d) => d.number).join(", ");
}

function relationParts(doc: LegalDoc, fam: Family | null, lang: Lang): string[] {
  const c = getDocPanel(lang).answers;
  const parts: string[] = [];
  const rep = (doc.replaces ?? []).map((id) => documentsById.get(id)).filter((d): d is LegalDoc => !!d);
  if (rep.length) parts.push(`${c.replaces} ${numbers(rep)}`);
  const by = replacers(doc);
  if (by.length) parts.push(`${c.replacedBy} ${numbers(by)}`);
  const am = amenders(doc);
  if (am.length) parts.push(`${c.amendedBy} ${numbers(am)}`);
  const kids = fam?.children.length ?? 0;
  if (kids) parts.push(`${c.guidedBy} ${c.guideCount(kids)}`);
  return parts;
}

/** Mô tả cho thẻ `<meta name="description">`: tình trạng và dòng dõi trước, tóm tắt sau. */
export function docDescription(doc: LegalDoc, fam: Family | null, lang: Lang): string {
  const t = getDict(lang);
  const checked = formatDate(verifiedOnOf(doc), lang, verifiedOnOf(doc));
  const head =
    lang === "vi"
      ? `${t.status[doc.status]} (tra cứu ${checked}).`
      : `${t.status[doc.status]} (as checked on ${checked}).`;
  const rel = relationParts(doc, fam, lang);
  return clip([head, rel.length ? `${rel.join(". ")}.` : "", doc.summary[lang]].filter(Boolean).join(" "), 220);
}

/** Bản tóm tắt nhiều dòng để dán vào ghi chú, email hay bản ghi nhớ. */
export function docPlainText(doc: LegalDoc, fam: Family | null, lang: Lang): string {
  const t = getDict(lang);
  const p = getDocPanel(lang);
  const checked = formatDate(verifiedOnOf(doc), lang, verifiedOnOf(doc));
  const source = primarySource(describeSources(doc.sources));
  const lines = [
    `${doc.number} — ${doc.title[lang]}`,
    `${t.doc.status} (${t.doc.verifiedOn.toLowerCase()} ${checked}): ${t.status[doc.status]}`,
    `${p.facts.issued}: ${formatDate(doc.issuedOn, lang, t.doc.unknownDate)} · ${p.facts.effective}: ${formatDate(doc.effectiveOn, lang, t.doc.unknownDate)}`,
    ...relationParts(doc, fam, lang),
    ...(source ? [`${p.trust.source}: ${source.url}`] : []),
    `${t.doc.citation}: ${citeDocument(doc, lang)}`,
    `${t.siteName} — ${SITE_URL}${pathFor(lang, `/van-ban/${doc.id}`)}`,
  ];
  return lines.join("\n");
}
