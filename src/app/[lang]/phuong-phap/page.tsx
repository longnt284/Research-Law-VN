import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { VERIFIED_ON, documents } from "@/data/documents";
import type { Lang } from "@/data/types";
import { formatDate, getDict, isLang } from "@/i18n/dictionary";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = getDict(lang);
  return { title: t.about.title, description: t.about.lede };
}

/**
 * Nội dung trang này viết trực tiếp bằng hai thứ tiếng thay vì đi qua từ điển
 * giao diện. Đây là văn xuôi dài, và câu chữ pháp lý dịch sát từng chuỗi thường
 * ra thứ tiếng Anh cứng đờ; viết riêng từng bản cho mỗi ngôn ngữ đọc tự nhiên hơn.
 */
const body: Record<Lang, { h: string; p: string[] }[]> = {
  vi: [
    {
      h: "Vì sao lại là một bản đồ",
      p: [
        "Người mới đọc pháp luật Việt Nam thường vấp cùng một chỗ: tìm được đúng điều luật nhưng không biết điều đó còn hiệu lực hay không, và không biết có nghị định nào đã nói khác đi. Một luật đặt nguyên tắc, nghị định quy định chi tiết, thông tư hướng dẫn thi hành, rồi vài năm sau một luật sửa đổi đến và thay đổi cả ba tầng cùng lúc. Đọc từng văn bản riêng lẻ thì không thấy được chuyện đó.",
        "Trang này chọn cách trình bày theo quan hệ thay vì theo danh mục. Mỗi điểm trên bản đồ là một văn bản, mỗi đường nối là một quan hệ có thật: quy định chi tiết, sửa đổi bổ sung, hoặc thay thế. Khi bấm vào một văn bản, các đường nối tới nó sáng lên, và người đọc thấy ngay văn bản đó đứng ở đâu.",
      ],
    },
    {
      h: "Dữ liệu được kiểm chứng thế nào",
      p: [
        "Nguyên tắc duy nhất khi dựng tập dữ liệu này là không đưa vào bất kỳ số hiệu nào chưa được tra cứu. Trí nhớ về số hiệu văn bản là thứ không đáng tin: các số rất giống nhau, và một văn bản từng đúng vẫn có thể đã bị thay thế mà không ai để ý. Toàn bộ văn bản trong tập này đều được tra qua Cổng thông tin điện tử Chính phủ, Thư viện Pháp luật hoặc LuatVietnam trước khi được ghi vào.",
        "Việc tra cứu cho thấy vài điều đáng chú ý. Luật Xây dựng 2014 đã hết hiệu lực từ ngày 01 tháng 7 năm 2026 và được thay bằng Luật Xây dựng số 135/2025/QH15. Luật Đầu tư 2020 cũng đã được thay bằng Luật Đầu tư số 143/2025/QH15, nhưng Điều 7 và Phụ lục IV của luật cũ vẫn còn hiệu lực tới ngày 01 tháng 7 năm 2026, tạo ra một giai đoạn giao thoa dễ nhầm. Luật Quản lý thuế 2019 hết hiệu lực từ ngày 30 tháng 6 năm 2026. Đây đều là những thay đổi mà một người dựa vào trí nhớ sẽ bỏ sót.",
        "Những bản ghi còn ít nhất một chi tiết chưa đối chiếu được với nguồn chính thống, thường là ngày ban hành chính xác, đều mang cảnh báo hiển thị công khai trên trang chi tiết. Không có bản ghi nào được làm tròn cho đẹp.",
      ],
    },
    {
      h: "Giới hạn phải nói rõ",
      p: [
        "Kết quả tra cứu văn bản pháp luật chỉ có giá trị tại thời điểm tra. Pháp luật Việt Nam trong các lĩnh vực đầu tư, thuế và xây dựng thay đổi nhanh; một văn bản đúng hôm nay có thể đã bị sửa sau vài tháng. Trước khi dùng bất kỳ nội dung nào ở đây vào hồ sơ chính thức, hãy đối chiếu lại với Công báo Chính phủ hoặc cơ quan ban hành.",
        "Tập dữ liệu này không đầy đủ và không cố tỏ ra đầy đủ. Nó tập trung vào tám lĩnh vực và chỉ chọn những văn bản trụ cột cùng quan hệ giữa chúng. Rất nhiều thông tư chuyên ngành, quyết định của Thủ tướng và văn bản địa phương không có mặt ở đây. Bản đồ này giúp định vị, không thay thế việc tra cứu đầy đủ.",
        "Cuối cùng, trang này là công cụ tra cứu, không phải ý kiến pháp lý. Một điều luật đọc đúng vẫn có thể áp dụng sai nếu tách khỏi tình tiết cụ thể của vụ việc. Với vấn đề có rủi ro thật, hãy làm việc với luật sư.",
      ],
    },
    {
      h: "Ghi chú kỹ thuật",
      p: [
        "Bản đồ vẽ trên canvas hai chiều với bố cục tính sẵn một lần, tất định, không dùng mô phỏng lực chạy theo thời gian thực. Đồ thị lực trông sinh động trong ảnh chụp nhưng khi dùng thật thì các điểm trôi liên tục và trình duyệt phải tính lại mỗi khung hình. Ở đây, kéo và phóng to chỉ đánh dấu khung hình là cần vẽ lại; khi không còn gì thay đổi, vòng lặp vẽ dừng hẳn thay vì quay vô ích.",
        "Nhãn trên bản đồ có kiểm tra chồng lấn: mỗi nhãn được đặt theo thứ tự ưu tiên và bị bỏ qua nếu giao với nhãn đã đặt trước. Đó là lý do chữ không bao giờ đè lên nhau, kể cả khi thu nhỏ hết cỡ. Bản đồ cũng dùng được hoàn toàn bằng bàn phím: phím mũi tên để di chuyển, cộng và trừ để phóng to thu nhỏ, Home để về khung nhìn mặc định.",
      ],
    },
  ],
  en: [
    {
      h: "Why a map",
      p: [
        "Newcomers to Vietnamese law tend to stumble at the same point: they find the right article but cannot tell whether it is still in force, or whether some decree has since said otherwise. A law states the principle, a decree fills in the detail, a circular explains the practice, and a few years later an amending law arrives and changes all three tiers at once. Reading each instrument in isolation hides that entirely.",
        "This site presents the material by relation rather than by list. Each point on the map is an instrument; each line is a relation that actually exists — detailing, amending, or replacing. Selecting an instrument lights up the lines that touch it, and its place in the system becomes visible at a glance.",
      ],
    },
    {
      h: "How the data was checked",
      p: [
        "One rule governed the building of this dataset: no document number appears unless it was actually looked up. Memory for document numbers is not to be trusted — the numbers resemble one another closely, and an instrument that was once correct may have been replaced without anyone noticing. Every entry here was traced through the Government Portal, Thư viện Pháp luật or LuatVietnam before it was recorded.",
        "The exercise turned up several things worth noting. The 2014 Construction Law ceased to have effect on 1 July 2026 and was replaced by Law No. 135/2025/QH15. The 2020 Investment Law was likewise replaced by Law No. 143/2025/QH15, yet Article 7 and Appendix IV of the older law remain in force until 1 July 2026, creating an overlap that is easy to misread. The 2019 Tax Administration Law ceased to have effect on 30 June 2026. Each of these would have been missed by anyone working from recollection.",
        "Entries with at least one detail that could not be confirmed against an official source — usually the precise date of issue — carry a warning displayed openly on the record. Nothing has been rounded off for the sake of a tidy page.",
      ],
    },
    {
      h: "Limits worth stating plainly",
      p: [
        "A search of legislation is only good as at the date it was run. Vietnamese law in investment, tax and construction moves quickly; an instrument that is current today may be amended within months. Before relying on anything here in a formal filing, check it against the Official Gazette or the issuing authority.",
        "This dataset is not comprehensive and does not pretend to be. It covers eight domains and selects the load-bearing instruments together with the relations between them. A great many sector circulars, Prime Ministerial decisions and provincial instruments are absent. The map helps with orientation; it does not replace a full search.",
        "Finally, this is a reference tool, not legal advice. An article read correctly can still be applied wrongly when detached from the facts of a matter. Where real risk is involved, work with a lawyer.",
      ],
    },
    {
      h: "A technical note",
      p: [
        "The map is drawn on a 2D canvas from a layout computed once and deterministically, with no real-time force simulation. Force-directed graphs look lively in a screenshot, but in use the points drift continuously and the browser must recompute every frame. Here, panning and zooming merely mark the frame as needing a redraw; when nothing is changing, the render loop stops altogether rather than spinning for nothing.",
        "Labels are collision-tested: each is placed in priority order and dropped if it would overlap one already placed. That is why the text never sits on top of itself, even at the smallest zoom. The map is also fully operable from the keyboard — arrow keys pan, plus and minus zoom, and Home returns to the default view.",
      ],
    },
  ],
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

  const counts = {
    total: documents.length,
    verified: documents.filter((d) => d.confidence === "verified").length,
    crossCheck: documents.filter((d) => d.confidence === "cross-check").length,
  };

  return (
    <article className="mx-auto w-full max-w-[76rem] px-5 py-10 sm:px-8 sm:py-14">
      <h1 className="max-w-[20ch] text-3xl leading-tight sm:text-[2.4rem]">
        {t.about.title}
      </h1>
      <p className="measure mt-5 text-[1.125rem] leading-relaxed text-[var(--ink-2)]">
        {t.about.lede}
      </p>

      <dl className="tnum mt-9 grid max-w-2xl grid-cols-3 gap-6 border-y border-[var(--rule)] py-5">
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

      <div className="mt-10 space-y-12">
        {body[lang].map((section) => (
          <section key={section.h}>
            <h2 className="text-[1.4rem] leading-snug">{section.h}</h2>
            <div className="measure mt-3 space-y-4">
              {section.p.map((para, i) => (
                <p key={i} className="leading-[1.75] text-[var(--ink-2)]">
                  {para}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="tnum mt-14 border-t border-[var(--rule)] pt-5 text-sm text-[var(--ink-3)]">
        {t.footer.verifiedPrefix} {formatDate(VERIFIED_ON, lang, VERIFIED_ON)}.
      </p>
    </article>
  );
}
