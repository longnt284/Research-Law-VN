import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Link from "next/link";

import { MethodArt } from "@/components/art/PageArt";
import { LuxBackdrop } from "@/components/LuxBackdrop";
import { Reveal } from "@/components/Reveal";
import { LATEST_VERIFIED_ON, documents, domains, verifiedOnOf } from "@/data/documents";
import type { Lang } from "@/data/types";
import { formatDate, getDict, isLang } from "@/i18n/dictionary";
import { tierOf } from "@/lib/corpus";
import { alternatesFor, shareMeta } from "@/lib/site";
import { describeSources, type SourceKind } from "@/lib/sources";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = getDict(lang);
  return {
    title: t.about.title,
    description: t.about.lede,
    alternates: alternatesFor(lang, "/phuong-phap"),
    ...shareMeta(lang, "/phuong-phap", t.about.title, t.about.lede),
  };
}

/**
 * Nội dung trang này viết trực tiếp bằng hai thứ tiếng thay vì đi qua từ điển
 * giao diện. Đây là văn xuôi, và câu chữ pháp lý dịch sát từng chuỗi thường ra
 * thứ tiếng Anh cứng đờ; viết riêng từng bản cho mỗi ngôn ngữ đọc tự nhiên hơn.
 *
 * Trang chỉ giữ hai mục cốt lõi: cách kiểm chứng dữ liệu và giới hạn của trang.
 * Phần giải thích từng tính năng đã bỏ; người dùng hỏi trợ lý khi cần.
 */
const body: Record<Lang, { h: string; p: string[] }[]> = {
  vi: [
    {
      h: "Dữ liệu được kiểm chứng thế nào",
      p: [
        "Tập dữ liệu dựng theo một nguyên tắc: không ghi vào số hiệu nào chưa được tra cứu. Trí nhớ về số hiệu văn bản không đáng tin, vì các số rất giống nhau và một văn bản từng đúng vẫn có thể đã bị thay thế mà không ai để ý.",
        "Xác minh một văn bản là trả lời hai câu hỏi khác nhau, và mỗi câu có nguồn riêng. Câu thứ nhất là văn bản có tồn tại không, đúng số hiệu, ngày ban hành và ngày có hiệu lực; nguồn chính là Công báo và Cổng Thông tin điện tử Chính phủ. Câu thứ hai là hôm nay văn bản còn hiệu lực không; nguồn chính là Cơ sở dữ liệu quốc gia về pháp luật của Bộ Tư pháp tại vbpl.vn, nơi ghi tình trạng hiệu lực bằng chữ kèm ngày cập nhật.",
        "Khi hai nguồn nhà nước nói khác nhau, bản ghi không lặng lẽ chọn một bên mà nêu mâu thuẫn trong phần lưu ý. Luật Bảo hiểm xã hội số 41/2024/QH15 được vbpl.vn ghi hết hiệu lực toàn bộ, nhưng không tìm thấy văn bản nào thay thế hay tuyên bố chấm dứt hiệu lực của nó, nên bản ghi giữ tình trạng còn hiệu lực và hạ mức xác minh. Luật Tổ chức Tòa án nhân dân số 62/2014/QH13 vẫn được vbpl.vn ghi còn hiệu lực, trong khi điều khoản thi hành của Luật số 34/2024/QH15 đã chấm dứt hiệu lực của nó, nên bản ghi theo văn bản luật. Luật Quản lý thuế số 38/2019/QH14 có ngày hiệu lực trên vbpl.vn khác với Công báo, nên bản ghi theo Công báo.",
      ],
    },
    {
      h: "Giới hạn phải nói rõ",
      p: [
        "Kết quả tra cứu văn bản pháp luật chỉ có giá trị tại thời điểm tra. Pháp luật Việt Nam trong các lĩnh vực đầu tư, thuế, đất đai và xây dựng thay đổi nhanh; một văn bản đúng hôm nay có thể đã bị sửa sau vài tháng. Trước khi dùng bất kỳ nội dung nào ở đây vào hồ sơ chính thức, cần đối chiếu lại với Công báo, Cơ sở dữ liệu quốc gia về pháp luật hoặc cơ quan ban hành.",
        "Tập dữ liệu này không đầy đủ và không cố tỏ ra đầy đủ. Nó tập trung vào mười hai lĩnh vực và chỉ chọn những văn bản trụ cột cùng quan hệ giữa chúng. Rất nhiều thông tư chuyên ngành, quyết định của Thủ tướng và văn bản địa phương không có mặt ở đây. Gia phả giúp định vị, không thay thế việc tra cứu đầy đủ.",
        "Cuối cùng, trang này là công cụ tra cứu, không phải ý kiến pháp lý. Một điều luật đọc đúng vẫn có thể áp dụng sai nếu tách khỏi tình tiết cụ thể của vụ việc. Với vấn đề có rủi ro thật, cần làm việc với luật sư.",
      ],
    },
  ],
  en: [
    {
      h: "How the data was checked",
      p: [
        "One rule governs the dataset: no document number is recorded unless it was actually looked up. Memory for document numbers cannot be trusted, because the numbers resemble one another closely and an instrument that was once correct may have been replaced without anyone noticing.",
        "Verifying an instrument means answering two different questions, each with its own source. The first is whether the instrument exists, with the right number, date of issue and date of commencement; the primary sources are the Official Gazette and the Government portal. The second is whether it is in force today; the primary source is the Ministry of Justice's National Legal Database at vbpl.vn, which states the status in words together with the date it was last updated.",
        "Where two official sources disagree, the record does not quietly pick one; the conflict is stated in its note. Social Insurance Law No. 41/2024/QH15 is labelled wholly expired on vbpl.vn, yet no instrument replacing it or declaring it lapsed was found, so the record keeps it in force at a lower verification level. Law No. 62/2014/QH13 on the Organisation of People's Courts is still labelled in force on vbpl.vn, although the final provisions of Law No. 34/2024/QH15 ended it, so the record follows the statute. Tax Administration Law No. 38/2019/QH14 carries a commencement date on vbpl.vn that differs from the Official Gazette, and the record follows the Gazette.",
      ],
    },
    {
      h: "Limits worth stating plainly",
      p: [
        "A search of legislation is only good as at the date it was run. Vietnamese law on investment, tax, land and construction moves quickly; an instrument that is current today may be amended within months. Before relying on anything here in a formal filing, check it against the Official Gazette, the National Legal Database or the issuing authority.",
        "This dataset is not comprehensive and does not pretend to be. It covers twelve domains and selects the load-bearing instruments together with the relations between them. A great many sector circulars, Prime Ministerial decisions and provincial instruments are absent. A lineage helps with orientation; it does not replace a full search.",
        "Finally, this is a reference tool, not legal advice. An article read correctly can still be applied wrongly when detached from the facts of a matter. Where real risk is involved, work with a lawyer.",
      ],
    },
  ],
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII"];

/** Neo của từng mục, để chân trang và các trang khác dẫn thẳng tới đúng mục. */
const IDS = ["xac-minh", "gioi-han"];

/**
 * Các mục minh bạch dữ liệu: phạm vi, nguồn, nhật ký các đợt tra cứu, cách báo
 * lỗi và quyền riêng tư. Mọi con số trong các mục này đếm thẳng từ tập dữ liệu.
 */
const extra: Record<
  Lang,
  {
    coverage: { h: string; p: string; domain: string; total: string; tiers: [string, string, string, string]; verified: string; cross: string };
    sources: { h: string; p: string; kinds: Record<SourceKind, string>; none: string };
    log: { h: string; p: string; date: string; count: string; verified: string };
    report: { h: string; p: string[]; cta: string };
    privacy: { h: string; p: string[]; cta: string };
  }
> = {
  vi: {
    coverage: {
      h: "Phạm vi dữ liệu",
      p: "Số văn bản của từng lĩnh vực, chia theo tầng hiệu lực và mức xác minh. Một văn bản có thể thuộc nhiều lĩnh vực, nên tổng các hàng lớn hơn tổng số văn bản.",
      domain: "Lĩnh vực",
      total: "Tổng",
      tiers: ["Luật", "Nghị quyết", "Nghị định", "Thông tư"],
      verified: "Đã đối chiếu",
      cross: "Cần kiểm thêm",
    },
    sources: {
      h: "Nguồn dữ liệu",
      p: "Mỗi nguồn được xếp loại theo chính địa chỉ của nó, không ghi tay. Bảng dưới đếm số bản ghi theo loại nguồn tốt nhất mà bản ghi có.",
      kinds: {
        official: "Nguồn chính thống (vbpl.vn, Công báo, cổng Chính phủ, Quốc hội)",
        issuer: "Trang của tổ chức ban hành (VIAC, ICC)",
        database: "Cơ sở dữ liệu pháp luật",
        reference: "Chỉ có bài viết tham khảo",
      },
      none: "bản ghi",
    },
    log: {
      h: "Nhật ký dữ liệu",
      p: "Mỗi bản ghi mang ngày tra cứu của chính nó. Bảng dưới gom bản ghi theo ngày đó: đợt nào được tra, bao nhiêu văn bản, bao nhiêu đã đối chiếu được với nguồn chính thống.",
      date: "Ngày tra cứu",
      count: "Số bản ghi",
      verified: "Đã đối chiếu",
    },
    report: {
      h: "Báo lỗi và sửa dữ liệu",
      p: [
        "Thấy một tình trạng hiệu lực sai, một quan hệ còn thiếu hay một nguồn đã hỏng, hãy báo qua trang góp ý dữ liệu; trang văn bản nào cũng có nút báo lỗi điền sẵn số hiệu. Không cần tài khoản.",
        "Mỗi báo cáo được đối chiếu lại với Công báo hoặc Cơ sở dữ liệu quốc gia về pháp luật trước khi sửa. Bản ghi được sửa mang ngày tra cứu mới, nên người đọc thấy ngay dữ liệu đã được kiểm lại khi nào.",
      ],
      cta: "Mở trang góp ý dữ liệu",
    },
    privacy: {
      h: "Quyền riêng tư",
      p: [
        "Trang không dùng cookie theo dõi và không nạp mã quảng cáo hay đo lường của bên thứ ba. Tài khoản là tùy chọn: mọi công cụ dùng được mà không cần đăng nhập.",
        "Khi chưa đăng nhập, văn bản đang theo dõi, bộ hồ sơ, văn bản vừa xem và câu tìm gần đây chỉ nằm trong bộ nhớ của trình duyệt bạn đang dùng; ngày tra cứu đang đặt chỉ giữ trong phiên.",
        "Khi có tài khoản, Supabase lưu email, mật khẩu đã băm, danh sách văn bản theo dõi, bộ hồ sơ và lần đồng ý chính sách, trên máy chủ tại Seoul, Hàn Quốc, để chúng đi theo bạn trên mọi máy. Văn bản vừa xem và câu tìm gần đây vẫn chỉ ở trong trình duyệt. Mỗi người chỉ đọc được dữ liệu của chính mình. Bạn có thể tải về hoặc xóa vĩnh viễn tài khoản cùng toàn bộ dữ liệu ở trang tài khoản. Góp ý dữ liệu được gửi bằng ứng dụng email của bạn, trang không lưu lại nội dung.",
      ],
      cta: "Đọc chính sách quyền riêng tư đầy đủ",
    },
  },
  en: {
    coverage: {
      h: "Data coverage",
      p: "The number of instruments in each domain, by stratum of force and by confidence. An instrument may belong to several domains, so the rows add up to more than the total.",
      domain: "Domain",
      total: "Total",
      tiers: ["Laws", "Resolutions", "Decrees", "Circulars"],
      verified: "Confirmed",
      cross: "Needs checking",
    },
    sources: {
      h: "Data sources",
      p: "Every source is classified from its own address rather than by hand. The table counts records by the best kind of source each one has.",
      kinds: {
        official: "Official source (vbpl.vn, the Gazette, Government and National Assembly portals)",
        issuer: "Issuing body (VIAC, ICC)",
        database: "Legal database",
        reference: "Commentary only",
      },
      none: "records",
    },
    log: {
      h: "Data log",
      p: "Every record carries the date it was looked up. The table groups records by that date: which review, how many instruments, and how many were confirmed against an official source.",
      date: "Review date",
      count: "Records",
      verified: "Confirmed",
    },
    report: {
      h: "Reporting and correcting data",
      p: [
        "If a status looks wrong, a relation is missing or a source is broken, report it through the data feedback page; every instrument page has a report button with the number filled in. No account is needed.",
        "Each report is checked again against the Official Gazette or the National Legal Database before anything is changed. A corrected record carries a new review date, so readers can see when it was last checked.",
      ],
      cta: "Open the data feedback page",
    },
    privacy: {
      h: "Privacy",
      p: [
        "The site uses no tracking cookies and loads no third-party advertising or analytics code. Accounts are optional: every tool works without signing in.",
        "When you are not signed in, followed instruments, matters, recently viewed instruments and recent searches stay in your own browser; the lookup date is kept for the session only.",
        "With an account, Supabase stores your email, a hashed password, your watchlist, your matters and your policy consent, on servers in Seoul, South Korea, so they follow you across devices. Recently viewed instruments and recent searches still stay in the browser. Each person can read only their own data. You can download or permanently delete the account and all its data from the account page. Data feedback is sent with your own email app; the site keeps no copy.",
      ],
      cta: "Read the full privacy policy",
    },
  },
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const t = getDict(lang);

  const x = extra[lang];
  const rank: Record<SourceKind, number> = { official: 0, issuer: 1, database: 2, reference: 3 };
  const bestSource = new Map<SourceKind, number>();
  for (const d of documents) {
    const best = describeSources(d.sources)
      .map((s) => s.kind)
      .sort((a, b) => rank[a] - rank[b])[0];
    if (best) bestSource.set(best, (bestSource.get(best) ?? 0) + 1);
  }
  const batches = new Map<string, { n: number; v: number }>();
  for (const d of documents) {
    const b = batches.get(verifiedOnOf(d)) ?? { n: 0, v: 0 };
    b.n++;
    if (d.confidence === "verified") b.v++;
    batches.set(verifiedOnOf(d), b);
  }
  const coverage = domains.map((dm) => {
    const docs = documents.filter((d) => d.domains.includes(dm.id));
    const tiers = [0, 0, 0, 0];
    for (const d of docs) tiers[tierOf(d)]++;
    return {
      id: dm.id,
      label: dm.label[lang],
      total: docs.length,
      tiers,
      verified: docs.filter((d) => d.confidence === "verified").length,
    };
  });
  const counts = {
    total: documents.length,
    verified: documents.filter((d) => d.confidence === "verified").length,
    crossCheck: documents.filter((d) => d.confidence === "cross-check").length,
  };

  return (
    <>
      <section className="rule-b hero-lux">
        <LuxBackdrop />
        <div className="hero-split mx-auto w-full max-w-[76rem] px-5 py-10 sm:px-8 sm:py-14">
          <div className="min-w-0">
            <p className="eyebrow eyebrow-tick rise">{t.nav.about}</p>
            <h1 className="display rise rise-1 mt-3 max-w-[20ch]">{t.about.title}</h1>
            <p className="measure rise rise-2 mt-5 text-[1.125rem] leading-relaxed text-[var(--ink-2)]">
              {t.about.lede}
            </p>
          </div>
          <div className="hero-art rise rise-2">
            <MethodArt lang={lang} />
          </div>
        </div>
      </section>

      <article className="mx-auto w-full max-w-[76rem] px-5 py-10 sm:px-8 sm:py-14">
        <dl className="tnum grid max-w-2xl grid-cols-3 gap-6 border-y border-[var(--rule)] py-5">
          <div>
            <dt className="eyebrow">{lang === "vi" ? "Tổng số" : "Total"}</dt>
            <dd className="text-2xl" style={{ fontFamily: "var(--font-serif)" }}>
              {counts.total}
            </dd>
          </div>
          <div>
            <dt className="eyebrow">{lang === "vi" ? "Đã đối chiếu" : "Confirmed"}</dt>
            <dd className="text-2xl" style={{ fontFamily: "var(--font-serif)" }}>
              {counts.verified}
            </dd>
          </div>
          <div>
            <dt className="eyebrow">
              {lang === "vi" ? "Cần kiểm thêm" : "Needs checking"}
            </dt>
            <dd className="text-2xl" style={{ fontFamily: "var(--font-serif)" }}>
              {counts.crossCheck}
            </dd>
          </div>
        </dl>

        {/* Mục được đánh số bằng chữ số La Mã nhỏ đặt bên lề trái trên màn hình
            rộng: cách một bài viết dài tự chỉ đường mà không cần mục lục. */}
        <div className="mt-12 space-y-14">
          {body[lang].map((section, si) => (
            <Reveal key={section.h}>
              <section
                id={IDS[si]}
                className="scroll-mt-24 lg:grid lg:grid-cols-[4rem_1fr] lg:gap-x-6"
              >
                <p
                  aria-hidden="true"
                  className="tnum text-[var(--brass)] lg:pt-1.5 lg:text-right"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  {ROMAN[si] ?? si + 1}
                </p>
                <div className="min-w-0">
                  <h2 className="mt-1 text-[1.45rem] leading-snug lg:mt-0">
                    {section.h}
                  </h2>
                  <div className="measure mt-3 space-y-4">
                    {section.p.map((para, i) => (
                      <p
                        key={i}
                        className={`leading-[1.75] text-[var(--ink-2)] ${
                          si === 0 && i === 0 ? "dropcap" : ""
                        }`}
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              </section>
            </Reveal>
          ))}
        </div>

        {/* Các mục minh bạch dữ liệu. Đánh số tiếp theo các mục văn xuôi ở trên. */}
        <div className="mt-14 space-y-14">
          <section id="pham-vi" className="method-sec scroll-mt-24">
            <p aria-hidden="true" className="method-n tnum">
              {ROMAN[body[lang].length]}
            </p>
            <div className="min-w-0">
              <h2 className="method-h">{x.coverage.h}</h2>
              <p className="measure mt-3 leading-[1.75] text-[var(--ink-2)]">{x.coverage.p}</p>
              <div className="scroll-x thin-scroll mt-5">
                <table className="method-table tnum">
                  <thead>
                    <tr>
                      <th scope="col">{x.coverage.domain}</th>
                      <th scope="col">{x.coverage.total}</th>
                      {x.coverage.tiers.map((tt) => (
                        <th key={tt} scope="col">
                          {tt}
                        </th>
                      ))}
                      <th scope="col">{x.coverage.verified}</th>
                      <th scope="col">{x.coverage.cross}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coverage.map((r) => (
                      <tr key={r.id}>
                        <th scope="row">
                          <Link href={`/${lang}/linh-vuc/${r.id}`} className="link-sweep">
                            {r.label}
                          </Link>
                        </th>
                        <td className="method-total">{r.total}</td>
                        {r.tiers.map((n, i) => (
                          <td key={i}>{n || "–"}</td>
                        ))}
                        <td>{r.verified}</td>
                        <td>{r.total - r.verified || "–"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section id="nguon" className="method-sec scroll-mt-24">
            <p aria-hidden="true" className="method-n tnum">
              {ROMAN[body[lang].length + 1]}
            </p>
            <div className="min-w-0">
              <h2 className="method-h">{x.sources.h}</h2>
              <p className="measure mt-3 leading-[1.75] text-[var(--ink-2)]">{x.sources.p}</p>
              <dl className="method-list tnum">
                {(["official", "issuer", "database", "reference"] as const).map((k) => (
                  <div key={k}>
                    <dt>{x.sources.kinds[k]}</dt>
                    <dd>
                      {bestSource.get(k) ?? 0} {x.sources.none}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section id="nhat-ky" className="method-sec scroll-mt-24">
            <p aria-hidden="true" className="method-n tnum">
              {ROMAN[body[lang].length + 2]}
            </p>
            <div className="min-w-0">
              <h2 className="method-h">{x.log.h}</h2>
              <p className="measure mt-3 leading-[1.75] text-[var(--ink-2)]">{x.log.p}</p>
              <table className="method-table method-table--narrow tnum mt-5">
                <thead>
                  <tr>
                    <th scope="col">{x.log.date}</th>
                    <th scope="col">{x.log.count}</th>
                    <th scope="col">{x.log.verified}</th>
                  </tr>
                </thead>
                <tbody>
                  {[...batches.entries()]
                    .sort((a, b) => b[0].localeCompare(a[0]))
                    .map(([date, b]) => (
                      <tr key={date}>
                        <th scope="row">{formatDate(date, lang, date)}</th>
                        <td>{b.n}</td>
                        <td>{b.v}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="bao-loi" className="method-sec scroll-mt-24">
            <p aria-hidden="true" className="method-n tnum">
              {ROMAN[body[lang].length + 3]}
            </p>
            <div className="min-w-0">
              <h2 className="method-h">{x.report.h}</h2>
              <div className="measure mt-3 space-y-4">
                {x.report.p.map((para) => (
                  <p key={para} className="leading-[1.75] text-[var(--ink-2)]">
                    {para}
                  </p>
                ))}
              </div>
              <Link href={`/${lang}/gop-y`} className="btn btn-quiet mt-5">
                {x.report.cta} →
              </Link>
            </div>
          </section>

          <section id="rieng-tu" className="method-sec scroll-mt-24">
            <p aria-hidden="true" className="method-n tnum">
              {ROMAN[body[lang].length + 4]}
            </p>
            <div className="min-w-0">
              <h2 className="method-h">{x.privacy.h}</h2>
              <div className="measure mt-3 space-y-4">
                {x.privacy.p.map((para) => (
                  <p key={para} className="leading-[1.75] text-[var(--ink-2)]">
                    {para}
                  </p>
                ))}
              </div>
              <Link href={`/${lang}/chinh-sach#rieng-tu`} className="btn btn-quiet mt-5">
                {x.privacy.cta} →
              </Link>
            </div>
          </section>
        </div>

        <p className="tnum mt-14 border-t border-[var(--rule)] pt-5 text-sm text-[var(--ink-3)]">
          {t.footer.verifiedPrefix} {formatDate(LATEST_VERIFIED_ON, lang, LATEST_VERIFIED_ON)}.
        </p>
      </article>
    </>
  );
}
