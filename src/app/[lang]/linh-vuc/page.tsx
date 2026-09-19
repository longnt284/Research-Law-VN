import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DomainSpark } from "@/components/DomainSpark";
import { LuxBackdrop } from "@/components/LuxBackdrop";
import { Reveal } from "@/components/Reveal";
import { SpaceThumb } from "@/components/SpaceThumb";
import { documents, domains } from "@/data/documents";
import type { Lang } from "@/data/types";
import { getDict, isLang } from "@/i18n/dictionary";
import { alternatesFor } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = getDict(lang);
  return {
    title: t.domainPage.title,
    description: t.domainPage.lede,
    alternates: alternatesFor(lang, "/linh-vuc"),
  };
}

export default async function DomainsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const t = getDict(lang);

  return (
    <>
      <section className="rule-b hero-lux">
        <LuxBackdrop />
        <div className="hero-split mx-auto w-full max-w-[76rem] px-5 py-10 sm:px-8 sm:py-14">
          <div className="min-w-0">
            <p className="eyebrow eyebrow-tick rise">
              {domains.length} {t.home.statsDomains}
            </p>
            <h1 className="display rise rise-1 mt-3">{t.domainPage.title}</h1>
            <p className="measure rise rise-2 mt-4 text-[1.0625rem] leading-relaxed text-[var(--ink-2)]">
              {t.domainPage.lede}
            </p>
          </div>
          {/* Cùng hình với thẻ lĩnh vực ở trang chủ: người đọc bấm vào một hình
              rồi gặp lại chính hình đó ở đầu trang đích, nên biết mình đã tới
              đúng chỗ mà không cần một dòng chữ nói điều đó. */}
          <div className="hero-art rise rise-2">
            <SpaceThumb act={2} turn={1.1} tilt={0.42} maxDots={58} maxEdges={14} />
          </div>
        </div>
      </section>

      {/*
        Hiệu ứng hiện dần bọc cả lưới, không bọc từng thẻ. Đường kẻ giữa các thẻ
        chính là nền của lưới lộ qua khe một pixel; thẻ nào mờ đi thì chỗ đó hở
        ra một mảng nền kẻ xám. Bọc cả lưới thì nền và thẻ cùng hiện, và khoảng
        trống đó không bao giờ xuất hiện.
      */}
      <Reveal>
        <div className="mx-auto w-full max-w-[76rem] px-5 py-8 sm:px-8">
          {/* Lề của trang nằm ở khối ngoài, không nằm trong khối tô nền kẻ. Đặt
              lề vào khối tô nền thì phần lề cũng mang màu kẻ và lưới thẻ trông
              như bị đóng trong một khung nâu dày. */}
          <div className="grid gap-px border border-[var(--rule)] bg-[var(--rule)] md:grid-cols-2">
            {domains.map((d) => {
              const count = documents.filter((doc) => doc.domains.includes(d.id)).length;
              return (
                <Link
                  key={d.id}
                  href={`/${lang}/linh-vuc/${d.id}`}
                  className="group card-lux row-mark flex h-full flex-col gap-4 bg-[var(--paper)] p-5 transition-colors hover:bg-[var(--paper-2)] sm:p-6"
                >
                  {/*
                    Ở đây cố ý KHÔNG đặt vật thể ba chiều. Tám thẻ nghĩa là tám
                    ngữ cảnh WebGL cùng sống trên một trang; trình duyệt chịu được
                    nhưng máy yếu thì quạt chạy và trang cuộn giật, đổi lấy tám
                    hình trang trí. Vật thể để dành cho trang riêng của từng lĩnh
                    vực, nơi nó đứng một mình và có chỗ để nhìn.

                    Cái thay vào chỗ đó là một vệt SVG tĩnh dựng từ chính tập dữ
                    liệu: bốn tầng hiệu lực của riêng lĩnh vực này. Nó nặng vài
                    trăm byte, không mở ngữ cảnh vẽ nào, và nói được một điều mà
                    dòng chữ đếm văn bản không nói: lĩnh vực nặng về luật hay nặng
                    về văn bản hướng dẫn.
                  */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="inline-block h-2 w-2 shrink-0 rounded-full"
                        style={{
                          background: `hsl(${d.hue} var(--node-chroma) var(--node-lightness))`,
                        }}
                      />
                      <span className="eyebrow tnum">
                        {count} {t.domainPage.countDocs}
                      </span>
                    </div>
                    <h2
                      className="mt-1.5 text-[1.3rem] leading-snug transition-colors group-hover:text-[var(--accent)]"
                      style={{ fontFamily: "var(--font-serif)" }}
                    >
                      {d.label[lang]}
                    </h2>
                    <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-[var(--ink-2)]">
                      {d.blurb[lang]}
                    </p>
                  </div>
                  <div className="domain-spark mt-auto">
                    <DomainSpark id={d.id} hue={d.hue} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </Reveal>
    </>
  );
}
