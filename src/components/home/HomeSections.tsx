import Link from "next/link";

import { DomainGlyph } from "@/components/art/DomainGlyph";
import { AsOfForm } from "@/components/asof/AsOfForm";
import { BrandMark } from "@/components/brand/BrandMark";
import { EventList } from "@/components/changes/EventList";
import { StatusBadge } from "@/components/DocMeta";
import { FocusSearchButton } from "@/components/home/HeroSearch";
import { documents, domains, LATEST_VERIFIED_ON, relations } from "@/data/documents";
import type { Lang, LegalDoc } from "@/data/types";
import { formatDate, getDict } from "@/i18n/dictionary";
import { getFamilyCopy } from "@/i18n/family";
import { getLanding } from "@/i18n/landing";
import { recentChanges } from "@/lib/changes";
import { pairs } from "@/lib/compare";
import { featuredFamily } from "@/lib/family";
import { lineages } from "@/lib/lineage";
import { amenders, replacers, startOf } from "@/lib/validity";

/**
 * Các khối của trang chủ sau phần đầu, theo thứ tự dùng trước, giải thích sau:
 * công cụ, thay đổi gần đây, khám phá, gia phả tiêu biểu, phạm vi dữ liệu, cách
 * hoạt động, độ tin cậy.
 *
 * Mọi văn bản, con số và ví dụ ở đây do phép đếm hoặc phép chọn trên tập dữ
 * liệu quyết định; không có số hiệu nào viết tay.
 */

function SectionHead({
  eyebrow,
  title,
  lede,
  id,
  action,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  id: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="sec-head">
      <div className="min-w-0">
        <p className="eyebrow eyebrow-tick">{eyebrow}</p>
        <h2 id={id} className="sec-title">
          {title}
        </h2>
        {lede && <p className="sec-lede">{lede}</p>}
      </div>
      {action && <div className="sec-action">{action}</div>}
    </div>
  );
}

/* ── Ba ví dụ tình trạng cho thẻ "Kiểm tra hiệu lực" ─────────────────────── */

function statusExamples(): LegalDoc[] {
  const out: LegalDoc[] = [];
  const focus = featuredFamily?.focus;
  if (focus) out.push(focus);
  const byLatest = (f: (d: LegalDoc) => LegalDoc[]) => (a: LegalDoc, b: LegalDoc) =>
    startOf(f(b).at(-1) ?? b).localeCompare(startOf(f(a).at(-1) ?? a));
  const amended = documents
    .filter((d) => d.status === "amended" && d.confidence === "verified" && amenders(d).length > 0)
    .sort(byLatest(amenders))[0];
  if (amended && !out.includes(amended)) out.push(amended);
  const replaced = documents
    .filter(
      (d) =>
        d.status === "expired" &&
        d.confidence === "verified" &&
        replacers(d).length > 0 &&
        !featuredFamily?.ancestors.some((a) => a.doc.id === d.id),
    )
    .sort(byLatest(replacers))[0];
  if (replaced && !out.includes(replaced)) out.push(replaced);
  return out;
}

export function IntentTools({ lang }: { lang: Lang }) {
  const l = getLanding(lang).intents;
  const t = getDict(lang);
  const fc = getFamilyCopy(lang);
  const examples = statusExamples();
  const fam = featuredFamily;
  const pair = pairs.find((p) => p.entry && p.confidence === "verified") ?? pairs.find((p) => p.entry);

  return (
    <section className="home-sec" aria-labelledby="intents-title">
      <SectionHead eyebrow={l.eyebrow} title={l.title} id="intents-title" />
      <div className="tools">
        <article className="tool">
          <h3 className="tool-title">
            <span className="tool-index tnum">01</span>
            {l.validity.title}
          </h3>
          <p className="tool-text">{l.validity.text}</p>
          <ul className="tool-docs">
            {examples.map((d) => {
              const by = replacers(d)[0];
              return (
                <li key={d.id}>
                  <Link href={`/${lang}/van-ban/${d.id}`} className="tool-doc">
                    <span className="tool-doc-num tnum">{d.number}</span>
                    <span className="tool-doc-title">{d.title[lang]}</span>
                  </Link>
                  <span className="tool-doc-status">
                    <StatusBadge status={d.status} lang={lang} size="sm" />
                    {by && (
                      <span className="tool-doc-by tnum">
                        → {by.number}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="tool-foot">
            <FocusSearchButton label={l.validity.cta} />
          </div>
        </article>

        {fam && (
          <article className="tool">
            <h3 className="tool-title">
              <span className="tool-index tnum">02</span>
              {l.lineage.title}
            </h3>
            <p className="tool-text">{l.lineage.text}</p>
            <ol className="tool-chain" aria-label={fam.focus.number}>
              {fam.ancestors[0] && (
                <li className="tool-chain-node is-past">
                  <span className="tool-chain-role">{fc.role.ancestor.short}</span>
                  <span className="tnum">{fam.ancestors[0].doc.number}</span>
                </li>
              )}
              <li className="tool-chain-node is-focus">
                <span className="tool-chain-role">{fc.role.focus.short}</span>
                <span className="tnum">{fam.focus.number}</span>
              </li>
              {fam.children.length > 0 && (
                <li className="tool-chain-node is-branch">
                  <span className="tool-chain-role">{fc.role.child.short}</span>
                  <span className="tnum">+{fam.children.length}</span>
                </li>
              )}
            </ol>
            <div className="tool-foot">
              <Link href={`/${lang}/van-ban/${fam.focus.id}#gia-pha`} className="btn btn-quiet btn-sm">
                {l.lineage.cta}
              </Link>
            </div>
          </article>
        )}

        {pair && pair.entry && (
          <article className="tool">
            <h3 className="tool-title">
              <span className="tool-index tnum">03</span>
              {l.compare.title}
            </h3>
            <p className="tool-text">{l.compare.text}</p>
            <div className="tool-pair">
              <span className="tool-pair-side">
                <span className="eyebrow">{t.compare.oldSide}</span>
                <span className="tnum tool-pair-old">{pair.oldDoc.number}</span>
              </span>
              <span aria-hidden="true" className="tool-pair-arrow">
                →
              </span>
              <span className="tool-pair-side">
                <span className="eyebrow">{t.compare.newSide}</span>
                <span className="tnum tool-pair-new">{pair.newDoc.number}</span>
              </span>
            </div>
            <p className="tool-meta tnum">
              {pair.kind === "replaces" ? t.compare.kindReplaces : t.compare.kindAmends} ·{" "}
              {l.compare.points(pair.entry.points.length)}
            </p>
            <div className="tool-foot">
              <Link href={`/${lang}/doi-chieu/${pair.id}`} className="btn btn-quiet btn-sm">
                {l.compare.cta}
              </Link>
            </div>
          </article>
        )}

        <article className="tool">
          <h3 className="tool-title">
            <span className="tool-index tnum">04</span>
            {l.asOf.title}
          </h3>
          <p className="tool-text">{l.asOf.text}</p>
          <AsOfForm lang={lang} id="tool-asof" label={l.asOf.label} submit={l.asOf.cta} hint={false} />
        </article>
      </div>
    </section>
  );
}

/* ── Thay đổi gần đây ─────────────────────────────────────────────────────── */

export function RecentChanges({ lang }: { lang: Lang }) {
  const l = getLanding(lang).changes;
  const r = recentChanges(8, 3);
  const future = r.future;
  // Có mốc sắp tới thì cột "đã diễn ra" hẹp hơn, sáu mục là đủ; không có thì
  // danh sách trải hai cột và tám mục lấp đủ bốn hàng.
  const done = future.length ? r.done.slice(0, 6) : r.done;
  return (
    <section className="home-sec" aria-labelledby="changes-title">
      <SectionHead
        eyebrow={l.eyebrow}
        title={l.title}
        lede={l.lede}
        id="changes-title"
        action={
          <Link href={`/${lang}/thay-doi`} className="btn btn-quiet btn-sm">
            {l.all} →
          </Link>
        }
      />
      <div className={`changes-cols${future.length === 0 ? " changes-cols--single" : ""}`}>
        {future.length > 0 && (
          <div>
            <h3 className="changes-sub">
              {l.upcoming}
              <span className="tnum"> · {formatDate(LATEST_VERIFIED_ON, lang, LATEST_VERIFIED_ON)}</span>
            </h3>
            <EventList events={future} lang={lang} />
          </div>
        )}
        <div>
          <h3 className="changes-sub">{l.past}</h3>
          <EventList events={done} lang={lang} />
        </div>
      </div>
    </section>
  );
}

/* ── Khám phá theo lĩnh vực ───────────────────────────────────────────────── */

export function ExploreDomains({ lang }: { lang: Lang }) {
  const l = getLanding(lang).explore;
  const rows = domains
    .map((d) => ({ d, n: documents.filter((x) => x.domains.includes(d.id)).length }))
    .sort((a, b) => b.n - a.n);
  const max = Math.max(...rows.map((r) => r.n), 1);
  return (
    <section className="home-sec" aria-labelledby="explore-title">
      <SectionHead
        eyebrow={l.eyebrow}
        title={l.title}
        lede={l.lede}
        id="explore-title"
        action={
          <Link href={`/${lang}/linh-vuc`} className="btn btn-quiet btn-sm">
            {l.all} →
          </Link>
        }
      />
      <ul className="domain-bars">
        {rows.map(({ d, n }) => (
          <li key={d.id}>
            <Link
              href={`/${lang}/linh-vuc/${d.id}`}
              className="domain-bar"
              style={{ ["--hue" as string]: d.hue, ["--w" as string]: `${(n / max) * 100}%` }}
            >
              <DomainGlyph id={d.id} className="domain-bar-glyph" />
              <span className="domain-bar-label">{d.label[lang]}</span>
              <span className="domain-bar-track" aria-hidden="true">
                <span className="domain-bar-fill" />
              </span>
              <span className="domain-bar-count tnum">
                {n} <span className="sr-only">{l.docs}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ── Chuỗi văn bản tiêu biểu ──────────────────────────────────────────────── */

export function FeaturedChains({ lang }: { lang: Lang }) {
  const l = getLanding(lang).featured;
  const list = lineages.slice(0, 4);
  if (list.length === 0) return null;
  return (
    <div className="chains">
      <p className="eyebrow">{l.chains}</p>
      <ul className="chains-list">
        {list.map((c) => (
          <li key={c.id}>
            <Link href={`/${lang}/doi-chieu/chuoi/${c.id}`} className="chain-card">
              <span className="chain-track" aria-hidden="true">
                {c.spine.map((d, i) => (
                  <span key={d.id} className={`chain-dot${i === c.spine.length - 1 ? " is-current" : ""}`} />
                ))}
              </span>
              <span className="chain-title">{c.current.title[lang]}</span>
              <span className="chain-meta tnum">
                {c.spine.map((d) => d.number).join(" → ")}
              </span>
              <span className="chain-meta">{l.chainDocs(c.docs.length)}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href={`/${lang}/doi-chieu#chuoi`} className="ref-link">
        {l.allChains} →
      </Link>
    </div>
  );
}

/* ── Phạm vi dữ liệu ──────────────────────────────────────────────────────── */

export function Coverage({ lang }: { lang: Lang }) {
  const l = getLanding(lang).coverage;
  const verified = documents.filter((d) => d.confidence === "verified").length;
  const cross = documents.length - verified;
  const stats = [
    { n: documents.length, label: l.docs },
    { n: relations.length, label: l.relations },
    { n: pairs.length, label: l.pairs },
    { n: domains.length, label: l.domains },
  ];
  return (
    <section className="home-sec" aria-labelledby="coverage-title">
      <SectionHead eyebrow={l.eyebrow} title={l.title} lede={l.lede} id="coverage-title" />
      <dl className="cov-stats">
        {stats.map((s) => (
          <div key={s.label}>
            <dd className="tnum">{s.n}</dd>
            <dt>{s.label}</dt>
          </div>
        ))}
      </dl>
      <div className="cov-split" role="img" aria-label={`${verified} ${l.verified}, ${cross} ${l.crossCheck}`}>
        <span className="cov-split-verified" style={{ flexGrow: verified }} />
        <span className="cov-split-cross" style={{ flexGrow: cross }} />
      </div>
      <p className="cov-legend tnum">
        <span className="cov-key cov-key--verified" aria-hidden="true" /> {verified} {l.verified}
        <span className="cov-key cov-key--cross" aria-hidden="true" /> {cross} {l.crossCheck}
      </p>
      <div className="cov-actions">
        <Link href={`/${lang}/phuong-phap#pham-vi`} className="btn btn-quiet btn-sm">
          {l.more} →
        </Link>
        <Link href={`/${lang}/gop-y?loai=bo-sung`} className="btn btn-quiet btn-sm">
          {l.request}
        </Link>
      </div>
    </section>
  );
}

/* ── Cách hoạt động (đầu khối) và độ tin cậy ──────────────────────────────── */

export function HowHead({ lang }: { lang: Lang }) {
  const l = getLanding(lang).how;
  return (
    <div className="home-sec home-sec--flush">
      <SectionHead eyebrow={l.eyebrow} title={l.title} lede={l.lede} id="how-title" />
    </div>
  );
}

export function Trust({ lang }: { lang: Lang }) {
  const l = getLanding(lang).trust;
  const t = getDict(lang);
  return (
    <section className="home-sec trust" aria-labelledby="trust-title">
      <div className="trust-grid">
        <div>
          <SectionHead eyebrow={l.eyebrow} title={l.title} lede={l.lede} id="trust-title" />
          <ul className="trust-points">
            {l.points.map((p) => (
              <li key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ul>
          <div className="cov-actions">
            <Link href={`/${lang}/phuong-phap`} className="btn btn-solid btn-sm">
              {l.method}
            </Link>
            <Link href={`/${lang}/gop-y`} className="btn btn-quiet btn-sm">
              {l.report}
            </Link>
          </div>
        </div>
        <div className="trust-seal" aria-hidden="true">
          <BrandMark variant="seal" id="trust" title={t.siteName} className="brand-seal" />
        </div>
      </div>
    </section>
  );
}
