import { documents, documentsById, domains, LATEST_VERIFIED_ON, verifiedOnOf } from "@/data/documents";
import type { Lang, LegalDoc } from "@/data/types";
import { articleEntries } from "@/lib/articles";
import { pairsFor } from "@/lib/compare";
import type { DocRef, IndexDoc, SearchIndex } from "@/lib/search-types";
import { describeSources, primarySource } from "@/lib/sources";
import { amenders, replacers, validitySegments } from "@/lib/validity";

/**
 * Chỉ mục tìm kiếm của một thứ tiếng, dựng lúc `next build`.
 *
 * Mọi trường lấy thẳng từ bản ghi và từ các phép suy ra đã có (hiệu lực theo
 * ngày, cặp đối chiếu, nguồn toàn văn). Không có trường nào được thêm chỉ để
 * làm đẹp kết quả tìm kiếm: ô tìm nói đúng những gì trang văn bản nói.
 *
 * Chỉ mục được phục vụ như một tệp JSON tĩnh và chỉ được tải khi người đọc bắt
 * đầu tìm, nên trang mở ra không phải mang theo nó.
 */

const ref = (d: LegalDoc): DocRef => [d.id, d.number];

const guidedCount = new Map<string, number>();
for (const doc of documents) {
  for (const id of doc.guides ?? []) {
    if (documentsById.has(id)) guidedCount.set(id, (guidedCount.get(id) ?? 0) + 1);
  }
}

function refs(ids: readonly string[] | undefined): DocRef[] {
  return (ids ?? [])
    .map((id) => documentsById.get(id))
    .filter((d): d is LegalDoc => !!d)
    .map(ref);
}

export function buildSearchIndex(lang: Lang): SearchIndex {
  const other: Lang = lang === "vi" ? "en" : "vi";
  const docs: IndexDoc[] = documents.map((d) => {
    const pairs = pairsFor(d.id);
    const ft = primarySource(describeSources(d.sources));
    return {
      id: d.id,
      n: d.number,
      ty: d.type,
      st: d.status,
      t: d.title[lang],
      o: d.title[other],
      s: d.summary[lang],
      iss: d.issuedOn,
      eff: d.effectiveOn,
      ver: verifiedOnOf(d),
      cc: d.confidence === "cross-check",
      dom: d.domains,
      seg: validitySegments(d),
      rep: refs(d.replaces),
      by: replacers(d).map(ref),
      amBy: amenders(d).map(ref),
      am: refs(d.amends),
      up: refs(d.guides),
      kids: guidedCount.get(d.id) ?? 0,
      ...(pairs[0] ? { pair: pairs[0].id } : {}),
      ...(ft ? { ft: ft.url } : {}),
    };
  });

  return {
    lang,
    verified: LATEST_VERIFIED_ON,
    docs,
    articles: articleEntries(lang),
    domains: domains.map((dm) => ({
      id: dm.id,
      label: dm.label[lang],
      alt: dm.label[other],
      hue: dm.hue,
      count: documents.filter((d) => d.domains.includes(dm.id)).length,
    })),
  };
}
