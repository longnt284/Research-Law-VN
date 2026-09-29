import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/JsonLd";
import { IntroPlayer, type DomainMark } from "@/components/showcase/IntroPlayer";
import { documentsById, domains } from "@/data/documents";
import type { DomainId, Lang } from "@/data/types";
import { isLang } from "@/i18n/dictionary";
import { alternatesFor, pathFor, shareMeta, SITE_URL } from "@/lib/site";

const SRC = "/video/gioi-thieu.mp4";
const WEBM = "/video/gioi-thieu.webm";
const POSTER = "/video/gioi-thieu.jpg";

/**
 * Mốc thời gian tính theo nhịp của bản nhạc: 110 nhịp mỗi phút, 92 nhịp cả bài.
 * Các mốc trùng với ranh giới cảnh trong `video/scene.js`: năm chương ở nhịp 0,
 * 12, 24, 68, 80; mỗi lĩnh vực chiếm một ô nhịp bốn phách, bắt đầu từ nhịp 28.
 */
const BEAT = 60 / 110;
const DURATION = 92 * BEAT;
const CHAPTER_AT = [0, 12, 24, 68, 80].map((b) => b * BEAT);
const DOMAIN_AT = (i: number) => (28 + 4 * i) * BEAT;
const DOMAIN_LEN = 4 * BEAT;

/**
 * Văn bản nền tảng của từng lĩnh vực, đúng như video trình bày. Số hiệu và tên
 * đọc từ tập dữ liệu, nên lưới bên dưới video luôn khớp với trang văn bản.
 */
const FLAGSHIP: Record<DomainId, string> = {
  "xay-dung": "luat-xay-dung-2025",
  "nang-luong": "luat-dien-luc-2024",
  "hop-dong": "blds-2015",
  "to-tung": "bltds-2015",
  "doanh-nghiep": "luat-dn-2020",
  "dau-tu": "luat-dau-tu-2025",
  "lao-dong": "blld-2019",
  thue: "luat-qlt-2025",
  "dat-dai": "luat-dat-dai-2024",
  ppp: "luat-ppp-2020",
};

const copy: Record<
  Lang,
  {
    eyebrow: string;
    title: string;
    lede: string;
    videoTitle: string;
    chaptersLabel: string;
    chapters: { label: string; onScreen: string }[];
    domainsH: string;
    domainsP: string;
    play: string;
    open: string;
    download: string;
    note: string;
    transcript: string;
  }
> = {
  vi: {
    eyebrow: "Lex & Lineage",
    title: "Video Giới thiệu",
    lede: "50 giây về mười lĩnh vực pháp luật, một gia phả văn bản, và câu hỏi người làm luật nào cũng gặp: văn bản còn hiệu lực vào ngày nào?",
    videoTitle: "Video giới thiệu Lex & Lineage",
    chaptersLabel: "Chương",
    chapters: [
      {
        label: "Còn hiệu lực không?",
        onScreen:
          "Luật Xây dựng số 50/2014/QH13, có hiệu lực từ 01/01/2015. Câu hỏi: văn bản này còn hiệu lực không? Ngày tra cứu chạy tới 01/07/2026 thì văn bản bị đóng dấu hết hiệu lực, và Luật Xây dựng số 135/2025/QH15 thay thế. Hợp đồng xây dựng ký trước 01/07/2026, về nguyên tắc, vẫn theo luật cũ.",
      },
      {
        label: "Gia phả văn bản",
        onScreen:
          "Luật 135/2025/QH15 thay thế Luật 50/2014/QH13, luật cũ từng được Luật 62/2020/QH14 sửa đổi; bảy nghị định năm 2026 hướng dẫn luật mới. Mỗi văn bản pháp luật đều có một gia phả. Lex & Lineage, gia phả văn bản pháp luật Việt Nam.",
      },
      {
        label: "10 lĩnh vực",
        onScreen:
          "10 lĩnh vực pháp luật, từ công trường đến phòng xử án. Mỗi lĩnh vực đi kèm một văn bản nền tảng, số hiệu và ngày có hiệu lực, như lưới bên dưới.",
      },
      {
        label: "Ba công cụ",
        onScreen:
          "Tra hiệu lực theo ngày: ngày 15/12/2025 và ngày 01/07/2026 cho hai kết quả khác nhau với Luật Xây dựng 2014 và 2025. So sánh phiên bản: mốc hiệu lực, miễn giấy phép xây dựng, văn bản thi hành. Theo dõi thay đổi: bốn luật có hiệu lực trong năm 2026.",
      },
      {
        label: "Lex & Lineage",
        onScreen:
          "10 lĩnh vực, hơn 140 văn bản, một gia phả. Mỗi văn bản kèm nguồn chính thức và ngày tra cứu. Thông tin tham khảo, không thay thế ý kiến pháp lý cho vụ việc cụ thể.",
      },
    ],
    domainsH: "10 lĩnh vực trong video",
    domainsP: "Bấm một lĩnh vực để xem đúng đoạn đó.",
    play: "Xem trong video từ",
    open: "Mở lĩnh vực",
    download: "Tải video (MP4)",
    note: "Video mang tính giới thiệu, không phải ý kiến pháp lý. Đối chiếu toàn văn văn bản tại nguồn chính thức trước khi áp dụng.",
    transcript: "Chữ trên màn hình",
  },
  en: {
    eyebrow: "Lex & Lineage",
    title: "Introductory Video",
    lede: "Fifty seconds on ten practice areas, one family tree of legal instruments, and the question every lawyer meets: is this law in force on that date?",
    videoTitle: "Lex & Lineage introductory video",
    chaptersLabel: "Chapters",
    chapters: [
      {
        label: "Still in force?",
        onScreen:
          "Construction Law No. 50/2014/QH13, in force from 1 January 2015. The question: is this instrument still in force? The lookup date runs to 1 July 2026, the instrument is stamped as no longer in force, and Construction Law No. 135/2025/QH15 replaces it. Construction contracts signed before 1 July 2026 in principle stay under the old Law.",
      },
      {
        label: "A family tree",
        onScreen:
          "Law 135/2025/QH15 replaces Law 50/2014/QH13, which Law 62/2020/QH14 had amended; seven 2026 decrees implement the new Law. Every legal instrument has a family tree. Lex & Lineage, the genealogy of Vietnamese law.",
      },
      {
        label: "Ten areas",
        onScreen:
          "Ten practice areas, from the building site to the courtroom. Each comes with one foundational instrument, its number and its date of effect, as in the grid below.",
      },
      {
        label: "Three tools",
        onScreen:
          "Validity on a date: 15 December 2025 and 1 July 2026 give different answers for the 2014 and 2025 Construction Laws. Version comparison: dates of effect, permit exemption, implementing instruments. Change tracking: four Laws that took effect in 2026.",
      },
      {
        label: "Lex & Lineage",
        onScreen:
          "10 practice areas, 140+ instruments, one family tree. Every instrument carries its official source and the date it was checked. For reference only; not legal advice on a specific matter.",
      },
    ],
    domainsH: "The ten areas in the video",
    domainsP: "Pick an area to jump to its part of the video.",
    play: "Watch in the video from",
    open: "Open area",
    download: "Download video (MP4)",
    note: "The on-screen text is in Vietnamese. The video is an introduction, not legal advice; check the full text at an official source before relying on it.",
    transcript: "On-screen text",
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

  const chapters = c.chapters.map((ch, i) => ({ label: ch.label, t: CHAPTER_AT[i] }));
  const marks: DomainMark[] = domains.map((d, i) => {
    const doc = documentsById.get(FLAGSHIP[d.id]);
    if (!doc) throw new Error(`Thiếu văn bản nền tảng cho lĩnh vực ${d.id}`);
    return {
      id: d.id,
      t: DOMAIN_AT(i),
      len: DOMAIN_LEN,
      hue: d.hue,
      name: d.label[lang],
      law: doc.title[lang],
      number: doc.number,
      href: pathFor(lang, `/linh-vuc/${d.id}`),
    };
  });

  const videoLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: c.videoTitle,
    description: c.lede,
    inLanguage: "vi",
    uploadDate: "2026-09-29",
    duration: `PT${Math.round(DURATION)}S`,
    thumbnailUrl: `${SITE_URL}${POSTER}`,
    contentUrl: `${SITE_URL}${SRC}`,
    url: `${SITE_URL}${pathFor(lang, "/video")}`,
  };

  return (
    <>
      <JsonLd data={videoLd} />
      <IntroPlayer
        head={
          <header className="intro-head">
            <p className="eyebrow eyebrow-tick rise">{c.eyebrow}</p>
            <h1 className="display intro-title rise rise-1">{c.title}</h1>
            <p className="intro-lede rise rise-2">{c.lede}</p>
          </header>
        }
        src={SRC}
        webm={WEBM}
        poster={POSTER}
        title={c.videoTitle}
        chapters={chapters}
        chaptersLabel={c.chaptersLabel}
        domainsHead={
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h2 className="display-sm">{c.domainsH}</h2>
            <p className="text-sm text-[var(--ink-3)]">{c.domainsP}</p>
          </div>
        }
        domains={marks}
        playLabel={c.play}
        openLabel={c.open}
      >
        <div className="intro-foot">
          <a href={SRC} download className="btn btn-outline">
            {c.download} <span aria-hidden="true">↓</span>
          </a>
          <p className="text-sm text-[var(--ink-3)]">{c.note}</p>
        </div>
        <details className="intro-transcript">
          <summary>{c.transcript}</summary>
          <ol>
            {c.chapters.map((ch) => (
              <li key={ch.label}>
                <span className="intro-transcript-label">{ch.label}</span>
                <span>{ch.onScreen}</span>
              </li>
            ))}
          </ol>
        </details>
      </IntroPlayer>
    </>
  );
}
