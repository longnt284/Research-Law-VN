import type { Metadata } from "next";
import Link from "next/link";
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
 * Mốc thời gian tính theo nhịp của bản nhạc: 110 nhịp mỗi phút, 110 nhịp cả bài.
 * Các mốc trùng với `SYNC.scenes` trong `video/scene.js`: mở đầu, gia phả, trợ
 * lý AI, công cụ, phạm vi, chốt.
 */
const BEAT = 60 / 110;
const DURATION = 110 * BEAT;
const CHAPTER_AT = [0, 12, 24, 68, 80, 92].map((b) => b * BEAT);

/**
 * Văn bản tiêu biểu của từng lĩnh vực, hiện trên ô lĩnh vực dưới video. Số hiệu
 * và tên đọc từ tập dữ liệu, nên lưới luôn khớp với trang văn bản. Video không
 * giới thiệu riêng từng lĩnh vực, nên ô dẫn tới trang lĩnh vực.
 */
const FLAGSHIP: Record<DomainId, string> = {
  "xay-dung": "luat-xay-dung-2025",
  "nang-luong": "luat-dien-luc-2024",
  "hop-dong": "luat-thuong-mai-2005",
  "dan-su": "blds-2015",
  "to-tung": "bltds-2015",
  "an-le": "nq-04-2019-hdtp",
  "doanh-nghiep": "luat-dn-2020",
  "dau-tu": "luat-dau-tu-2025",
  "lao-dong": "blld-2019",
  thue: "luat-qlt-2025",
  "dat-dai": "luat-dat-dai-2024",
  ppp: "luat-ppp-2020",
  fintech: "luat-cncns-2025",
  "du-lieu": "luat-bvdlcn-2025",
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
    ask: string;
    download: string;
    note: string;
    transcript: string;
  }
> = {
  vi: {
    eyebrow: "Lex & Lineage",
    title: "Video Giới thiệu",
    lede: "60 giây về trợ lý AI hỏi đáp pháp luật: hỏi bằng lời của bạn, nhận câu trả lời dẫn đúng văn bản, kèm tình trạng hiệu lực, trên nền một gia phả văn bản pháp luật Việt Nam.",
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
        label: "Trợ lý AI",
        onScreen:
          "Hỏi bằng lời của bạn. Câu trả lời dẫn đúng văn bản, kèm tình trạng hiệu lực. Câu hỏi: \"Tôi nhận cọc bán nhà, nhưng cơ quan nhà nước chậm cấp sổ nên không kịp ký hợp đồng. Tôi có bị phạt cọc không?\" Trợ lý đối chiếu kho văn bản của trang rồi trả lời: thường là không, chậm cấp sổ do cơ quan nhà nước được xem là lý do khách quan. Theo Điều 328 Bộ luật Dân sự 2015, có nhãn chưa xác minh vì số điều không có trong kho, bên nhận cọc từ chối giao kết hợp đồng thì phải trả lại cọc và một khoản tiền tương đương, trừ khi các bên thỏa thuận khác. Án lệ 25/2018/AL xác định bên nhận cọc chưa được cấp giấy chứng nhận do nguyên nhân từ cơ quan nhà nước có thẩm quyền thì không phải chịu phạt cọc. Nguồn: 91/2015/QH13 và 25/2018/AL, đều đang có hiệu lực; hiệu lực tính tại hôm nay. Ba câu hỏi tiếp theo: Quy tắc VIAC 2026 áp dụng cho tố tụng bắt đầu từ 01/07/2026; Luật Đất đai 31/2024/QH15 còn hiệu lực từ 01/08/2024, đã được sửa đổi bởi Luật 43/2024/QH15; Luật Thi hành án dân sự 106/2025/QH15 có hiệu lực từ 01/07/2026, thay thế Luật 26/2008/QH12. Giao diện trong video là minh họa.",
      },
      {
        label: "Ba công cụ",
        onScreen:
          "Tra hiệu lực theo ngày: ngày 15/12/2025 và ngày 01/07/2026 cho hai kết quả khác nhau với Luật Xây dựng 2014 và 2025. So sánh phiên bản: mốc hiệu lực, miễn giấy phép xây dựng, văn bản thi hành. Theo dõi thay đổi: bốn luật có hiệu lực trong năm 2026.",
      },
      {
        label: "Phạm vi",
        onScreen:
          "Nền của mọi câu trả lời: một kho văn bản đã kiểm chứng. 14 lĩnh vực, 199 văn bản, 16 án lệ, nối với nhau thành một gia phả.",
      },
      {
        label: "Hỏi ngay",
        onScreen:
          "Lex & Lineage, gia phả văn bản pháp luật Việt Nam. Hỏi trợ lý AI về văn bản pháp luật Việt Nam: mục \"Hỏi AI\" trên Lex & Lineage, tiếng Việt và tiếng Anh. Thông tin tham khảo, không thay thế ý kiến pháp lý cho vụ việc cụ thể. Câu trả lời trong video là minh họa.",
      },
    ],
    domainsH: "14 lĩnh vực trên trang",
    domainsP: "Bấm một lĩnh vực để mở cây văn bản của lĩnh vực đó.",
    play: "Xem trong video từ",
    open: "Mở lĩnh vực",
    ask: "Hỏi trợ lý AI",
    download: "Tải video (MP4)",
    note: "Video mang tính giới thiệu, không phải ý kiến pháp lý. Câu trả lời của trợ lý trong video là minh họa giao diện, viết từ dữ liệu của trang; đối chiếu toàn văn văn bản tại nguồn chính thức trước khi áp dụng.",
    transcript: "Chữ trên màn hình",
  },
  en: {
    eyebrow: "Lex & Lineage",
    title: "Introductory Video",
    lede: "Sixty seconds on the AI legal assistant: ask in your own words and get an answer that cites the right instruments with their validity, built on a family tree of Vietnamese law.",
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
        label: "AI assistant",
        onScreen:
          "Ask in your own words. Answers cite the right instruments with their validity. The question: \"I took a deposit to sell a house, but the authorities were late issuing the certificate so the contract could not be signed in time. Do I owe the deposit penalty?\" The assistant checks the site's dataset and answers: usually not, a delay by the authorities in issuing the certificate counts as an objective reason. Under Article 328 of the 2015 Civil Code, flagged as not verified because the article number is not in the dataset, a deposit recipient who refuses to enter into the contract must return the deposit plus an equal sum unless the parties agreed otherwise. Precedent 25/2018/AL holds that a recipient who has not obtained the certificate because of the competent authority does not bear the deposit penalty. Sources: 91/2015/QH13 and 25/2018/AL, both in force; validity computed as of today. Three further questions: the VIAC Rules 2026 apply to arbitrations commenced from 1 July 2026; Land Law 31/2024/QH15 is in force from 1 August 2024, amended by Law 43/2024/QH15; Civil Judgment Enforcement Law 106/2025/QH15 is in force from 1 July 2026, replacing Law 26/2008/QH12. The interface shown is an illustration.",
      },
      {
        label: "Three tools",
        onScreen:
          "Validity on a date: 15 December 2025 and 1 July 2026 give different answers for the 2014 and 2025 Construction Laws. Version comparison: dates of effect, permit exemption, implementing instruments. Change tracking: four Laws that took effect in 2026.",
      },
      {
        label: "Scope",
        onScreen:
          "Behind every answer: one verified dataset. 14 practice areas, 199 instruments, 16 precedents, linked into one family tree.",
      },
      {
        label: "Ask now",
        onScreen:
          "Lex & Lineage, the genealogy of Vietnamese law. Ask the AI assistant about Vietnamese legal instruments: \"Ask AI\" on Lex & Lineage, in Vietnamese and English. For reference only; not legal advice on a specific matter. The answers in the video are illustrations.",
      },
    ],
    domainsH: "The fourteen areas on the site",
    domainsP: "Pick an area to open its tree of instruments.",
    play: "Watch in the video from",
    open: "Open area",
    ask: "Ask the AI assistant",
    download: "Download video (MP4)",
    note: "The on-screen text is in Vietnamese. The video is an introduction, not legal advice. The assistant's answers in the video illustrate the interface and are written from the site's data; check the full text at an official source before relying on it.",
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
  const marks: DomainMark[] = domains.map((d) => {
    const doc = documentsById.get(FLAGSHIP[d.id]);
    if (!doc) throw new Error(`Thiếu văn bản tiêu biểu cho lĩnh vực ${d.id}`);
    return {
      id: d.id,
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
    uploadDate: "2026-10-01",
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
          <Link href={pathFor(lang, "/hoi-dap")} className="btn btn-solid">
            {c.ask} <span aria-hidden="true">→</span>
          </Link>
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
