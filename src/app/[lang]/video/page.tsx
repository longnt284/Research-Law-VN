import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LuxBackdrop } from "@/components/LuxBackdrop";
import { ShowcasePlayer, type Chapter } from "@/components/showcase/ShowcasePlayer";
import type { Lang } from "@/data/types";
import { isLang } from "@/i18n/dictionary";
import { getSearchCopy } from "@/i18n/search";
import { alternatesFor, shareMeta } from "@/lib/site";

const SRC = "/video/luat-chay-bang-code.mp4";
const WEBM = "/video/luat-chay-bang-code.webm";
const POSTER = "/video/luat-chay-bang-code.jpg";

/**
 * Mốc chương tính theo nhịp của bản nhạc: 128 nhịp mỗi phút, mỗi nhịp 0,46875
 * giây. Các mốc trùng với ranh giới cảnh trong `video/scene.js`.
 */
const BEAT = 60 / 128;
const AT = [0, 4, 10, 20, 32, 40, 46, 54, 62].map((b) => b * BEAT);

/**
 * Nguồn của bốn văn bản xuất hiện trong video. Bốn văn bản này chưa có trong
 * kho dữ liệu của trang, nên dẫn thẳng tới trang văn bản trên cổng Chính phủ,
 * nơi số hiệu và ngày hiệu lực đã được đối chiếu khi dựng video.
 */
const SOURCES = [
  {
    no: "05/2025/NQ-CP",
    url: "https://vanban.chinhphu.vn/?pageid=27160&docid=215249",
    vi: { name: "Nghị quyết về triển khai thí điểm thị trường tài sản mã hóa tại Việt Nam", when: "Ban hành và có hiệu lực ngày 09/09/2025" },
    en: { name: "Resolution on piloting the crypto-asset market in Viet Nam", when: "Issued and effective 9 September 2025" },
  },
  {
    no: "71/2025/QH15",
    url: "https://vanban.chinhphu.vn/?pageid=27160&docid=214609&classid=1&typegroupid=3",
    vi: { name: "Luật Công nghiệp công nghệ số", when: "Có hiệu lực từ ngày 01/01/2026" },
    en: { name: "Law on Digital Technology Industry", when: "Effective 1 January 2026" },
  },
  {
    no: "91/2025/QH15",
    url: "https://chinhphu.vn/?pageid=27160&docid=214590&classid=1&typegroupid=3",
    vi: { name: "Luật Bảo vệ dữ liệu cá nhân", when: "Có hiệu lực từ ngày 01/01/2026" },
    en: { name: "Law on Personal Data Protection", when: "Effective 1 January 2026" },
  },
  {
    no: "134/2025/QH15",
    url: "https://vanban.chinhphu.vn/?pageid=27160&docid=216334&classid=1&typegroupid=3",
    vi: { name: "Luật Trí tuệ nhân tạo", when: "Thông qua ngày 10/12/2025, có hiệu lực từ ngày 01/03/2026" },
    en: { name: "Law on Artificial Intelligence", when: "Passed 10 December 2025, effective 1 March 2026" },
  },
];

const copy: Record<
  Lang,
  {
    title: string;
    lede: string;
    videoTitle: string;
    chapters: string;
    list: Omit<Chapter, "t">[];
    facts: [string, string][];
    sourcesH: string;
    sourcesP: string;
    howH: string;
    howP: string[];
    download: string;
    note: string;
  }
> = {
  vi: {
    title: "Khi luật chạy bằng code",
    lede: "Video ngắn 34 giây về nơi pháp luật, công nghệ và tài chính gặp nhau: tài sản số, dữ liệu cá nhân và trí tuệ nhân tạo, qua bốn văn bản có hiệu lực trong năm 2025 và 2026.",
    videoTitle: "Video: Khi luật chạy bằng code",
    chapters: "Chương",
    list: [
      { label: "Mở đầu", onScreen: "> law.compile()" },
      { label: "Luật × Code × Tiền", onScreen: "LUẬT · CODE · TIỀN — Pháp lý, Công nghệ, Tài chính" },
      { label: "Cán cân mới", onScreen: "CÁN CÂN MỚI — Luật · Công nghệ · Tài chính" },
      { label: "Bốn cột mốc pháp lý số", onScreen: "NQ 05/2025/NQ-CP · Luật 71/2025/QH15 · Luật 91/2025/QH15 · Luật 134/2025/QH15" },
      { label: "Tài sản số", onScreen: "TIỀN ĐANG SỐ HÓA — TÀI SẢN SỐ // đã có khung pháp lý" },
      { label: "Dữ liệu cá nhân", onScreen: "DỮ LIỆU CÁ NHÂN — KHÔNG ĐỂ MUA BÁN" },
      { label: "Trí tuệ nhân tạo", onScreen: "AI PHỤC VỤ CON NGƯỜI — KHÔNG THAY THẾ THẨM QUYỀN & TRÁCH NHIỆM CỦA CON NGƯỜI" },
      { label: "Từ khóa", onScreen: "Hợp đồng thông minh · Blockchain · KYC · Dữ liệu · AI · Token · Fintech · Legaltech · Tuân thủ · Bảo mật · Thanh toán số · Pháp lý số" },
      { label: "Kết", onScreen: "KHI LUẬT CHẠY BẰNG CODE. Bạn đã sẵn sàng?" },
    ],
    facts: [
      ["Thời lượng", "34 giây"],
      ["Khung hình", "1080 × 1920, dọc 9:16"],
      ["Tốc độ", "60 hình/giây"],
      ["Nhạc", "128 nhịp/phút, tổng hợp bằng mã"],
    ],
    sourcesH: "Văn bản trong video",
    sourcesP: "Số hiệu, ngày ban hành và ngày hiệu lực của bốn văn bản dưới đây được đối chiếu trên cổng văn bản của Chính phủ trước khi đưa vào video. Câu về Luật Trí tuệ nhân tạo diễn lại nguyên tắc của luật: trí tuệ nhân tạo phục vụ con người, không thay thế thẩm quyền và trách nhiệm của con người.",
    howH: "Video được làm thế nào",
    howP: [
      "Mỗi khung hình là một hàm của thời gian, vẽ bằng Canvas 2D: chữ động, hạt ráp thành cán cân, dòng thời gian, nến giá hóa khối chuỗi, quét vân tay, mạng nơ-ron và đường hầm tốc độ. Không dùng cảnh quay hay hình ảnh tải về.",
      "Nhạc nền được tổng hợp bằng mã ở cùng nhịp với hình, nên mỗi cú dập chữ rơi đúng tiếng trống. Mã nguồn nằm trong thư mục video của kho mã.",
    ],
    download: "Tải video (MP4)",
    note: "Video mang tính giới thiệu, không phải ý kiến pháp lý. Trước khi áp dụng, đối chiếu toàn văn văn bản tại nguồn chính thức.",
  },
  en: {
    title: "When law runs on code",
    lede: "A 34-second short on where law, technology and finance meet: digital assets, personal data and artificial intelligence, told through four instruments that took effect in 2025 and 2026.",
    videoTitle: "Video: When law runs on code",
    chapters: "Chapters",
    list: [
      { label: "Opening", onScreen: "> law.compile()" },
      { label: "Law × Code × Money", onScreen: "LUẬT · CODE · TIỀN — law, technology, finance" },
      { label: "A new balance", onScreen: "CÁN CÂN MỚI (A new balance) — law · technology · finance" },
      { label: "Four digital-law milestones", onScreen: "Resolution 05/2025/NQ-CP · Laws 71/2025/QH15, 91/2025/QH15, 134/2025/QH15" },
      { label: "Digital assets", onScreen: "Money is going digital — digital assets now have a legal framework" },
      { label: "Personal data", onScreen: "Personal data — not for sale" },
      { label: "Artificial intelligence", onScreen: "AI serves people — it does not replace human authority and responsibility" },
      { label: "Keywords", onScreen: "Smart contracts · Blockchain · KYC · Data · AI · Token · Fintech · Legaltech · Compliance · Security · Digital payments · Digital law" },
      { label: "Close", onScreen: "When law runs on code. Are you ready?" },
    ],
    facts: [
      ["Length", "34 seconds"],
      ["Frame", "1080 × 1920, vertical 9:16"],
      ["Frame rate", "60 fps"],
      ["Music", "128 BPM, synthesised in code"],
    ],
    sourcesH: "Instruments in the video",
    sourcesP: "The numbers, dates of issue and dates of effect of the four instruments below were checked on the Government's document portal before they went into the video. The line on the AI Law restates the law's principle: artificial intelligence serves people and does not replace human authority and responsibility.",
    howH: "How the video was made",
    howP: [
      "Every frame is a function of time drawn with Canvas 2D: kinetic type, particles assembling a scale of justice, a timeline, price candles turning into chain blocks, a fingerprint scan, a neural network and a speed tunnel. No footage or downloaded images are used.",
      "The soundtrack is synthesised in code on the same beat grid as the picture, so every type slam lands on a drum hit. The source lives in the video folder of the repository.",
    ],
    download: "Download video (MP4)",
    note: "The on-screen text is in Vietnamese. The video is an introduction, not legal advice; check the full text at an official source before relying on it.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const c = copy[lang];
  return {
    title: c.title,
    description: c.lede,
    alternates: alternatesFor(lang, "/video"),
    ...shareMeta(lang, "/video", c.title, c.lede),
  };
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const c = copy[lang];
  const nav = getSearchCopy(lang).nav;
  const chapters: Chapter[] = c.list.map((ch, i) => ({ ...ch, t: AT[i] }));

  return (
    <>
      <section className="rule-b hero-lux">
        <LuxBackdrop />
        <div className="mx-auto w-full max-w-[76rem] px-5 py-10 sm:px-8 sm:py-14">
          <p className="eyebrow eyebrow-tick rise">{nav.video}</p>
          <h1 className="display rise rise-1 mt-3 max-w-[20ch]">{c.title}</h1>
          <p className="measure rise rise-2 mt-5 text-[1.125rem] leading-relaxed text-[var(--ink-2)]">
            {c.lede}
          </p>
        </div>
      </section>

      <article className="mx-auto w-full max-w-[76rem] px-5 py-10 sm:px-8 sm:py-14">
        <ShowcasePlayer
          src={SRC}
          webm={WEBM}
          poster={POSTER}
          title={c.videoTitle}
          chapters={chapters}
          chaptersLabel={c.chapters}
        />

        <dl className="showcase-facts tnum mt-10">
          {c.facts.map(([k, v]) => (
            <div key={k}>
              <dt className="eyebrow">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
          <a href={SRC} download className="btn btn-outline">
            {c.download} <span aria-hidden="true">↓</span>
          </a>
          <p className="text-sm text-[var(--ink-3)]">{c.note}</p>
        </div>

        <div className="mt-14 space-y-14">
          <section id="van-ban" className="method-sec scroll-mt-24">
            <p aria-hidden="true" className="method-n tnum">I</p>
            <div className="min-w-0">
              <h2 className="method-h">{c.sourcesH}</h2>
              <p className="measure mt-3 leading-[1.75] text-[var(--ink-2)]">{c.sourcesP}</p>
              <ul className="showcase-sources">
                {SOURCES.map((s) => (
                  <li key={s.no}>
                    <a href={s.url} target="_blank" rel="noopener" className="link-sweep font-medium">
                      {s[lang].name} <span aria-hidden="true">↗</span>
                    </a>
                    <span className="showcase-source-meta tnum">
                      {s.no} · {s[lang].when}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section id="cach-lam" className="method-sec scroll-mt-24">
            <p aria-hidden="true" className="method-n tnum">II</p>
            <div className="min-w-0">
              <h2 className="method-h">{c.howH}</h2>
              <div className="measure mt-3 space-y-4">
                {c.howP.map((p) => (
                  <p key={p} className="leading-[1.75] text-[var(--ink-2)]">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </section>
        </div>
      </article>
    </>
  );
}
