import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LuxBackdrop } from "@/components/LuxBackdrop";
import { Reveal } from "@/components/Reveal";
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
        "Nguyên tắc duy nhất khi dựng tập dữ liệu này là không đưa vào bất kỳ số hiệu nào chưa được tra cứu. Trí nhớ về số hiệu văn bản là thứ không đáng tin: các số rất giống nhau, và một văn bản từng đúng vẫn có thể đã bị thay thế mà không ai để ý. Nhóm văn bản dựng trong đợt đầu đều được tra qua Cổng thông tin điện tử Chính phủ, Thư viện Pháp luật hoặc LuatVietnam trước khi được ghi vào.",
        "Đợt bổ sung ngày 04 tháng 9 năm 2026 gồm năm mươi văn bản được tra trong điều kiện khác và phải nói rõ. Phiên làm việc đó không mở được trang nguồn gốc: đường mạng chặn thuvienphapluat.vn, vanban.chinhphu.vn, vbpl.vn và luatvietnam.vn. Số hiệu, ngày ban hành và ngày hiệu lực của từng bản ghi vì vậy được đối chiếu giữa ít nhất hai kết quả tìm kiếm độc lập, chi tiết nào không khớp hoặc không xuất hiện thì để trống thay vì suy ra. Toàn bộ năm mươi bản ghi này mang cảnh báo cần kiểm thêm, và đường dẫn trong mục nguồn là địa chỉ trang tìm được chứ không phải trang đã mở.",
        "Việc tra cứu cho thấy vài điều đáng chú ý. Luật Xây dựng 2014 đã hết hiệu lực từ ngày 01 tháng 7 năm 2026 và được thay bằng Luật Xây dựng số 135/2025/QH15. Luật Đầu tư 2020 cũng đã được thay bằng Luật Đầu tư số 143/2025/QH15, nhưng Điều 7 và Phụ lục IV của luật cũ vẫn còn hiệu lực tới ngày 01 tháng 7 năm 2026, tạo ra một giai đoạn giao thoa dễ nhầm. Luật Quản lý thuế 2019 hết hiệu lực từ ngày 30 tháng 6 năm 2026. Đây đều là những thay đổi mà một người dựa vào trí nhớ sẽ bỏ sót.",
        "Những bản ghi còn ít nhất một chi tiết chưa đối chiếu được với nguồn chính thống, thường là ngày ban hành chính xác, đều mang cảnh báo hiển thị công khai trên trang chi tiết. Không có bản ghi nào được làm tròn cho đẹp.",
      ],
    },
    {
      h: "Đối chiếu điểm cũ và điểm mới",
      p: [
        "Phần lớn câu hỏi thực tế không dừng ở chỗ một văn bản quy định gì, mà ở chỗ nó đã đổi những gì so với văn bản trước. Trang đối chiếu dựng đúng cho việc đó, và dựng theo bốn lớp tách bạch để người đọc biết mỗi dòng chữ mình đang đọc đến từ đâu.",
        "Lớp thứ nhất là cặp văn bản, lấy thẳng từ quan hệ thay thế và sửa đổi đã có trong tập dữ liệu. Không cặp nào được thêm vào bằng tay, nên danh sách cặp luôn khớp với bản đồ quan hệ và không có chỗ cho một cặp được chọn vì nó minh họa đẹp cho một luận điểm. Lớp thứ hai là bảng dữ kiện và mấy câu suy ra từ hai bản ghi: loại văn bản, tình trạng hiệu lực, ngày ban hành, ngày có hiệu lực, khoảng cách giữa hai mốc. Toàn bộ lớp này là phép so sánh và phép trừ ngày, cùng dữ liệu thì ai chạy cũng ra đúng như vậy.",
        "Lớp thứ ba là điểm đối chiếu nội dung do người biên soạn viết, và đây là lớp duy nhất có bàn tay con người. Mỗi điểm gồm nội dung đọc được ở văn bản cũ, nội dung đọc được ở văn bản mới, một nhãn phân loại thay đổi lấy từ danh sách đóng chín loại, và một câu nhận định. Mỗi vế phải dẫn được bản ghi mà nó đọc ra; chỗ nào bản ghi không nói thì viết thẳng là bản ghi không nói, thay vì suy ra từ sự im lặng.",
        "Lớp thứ tư là phép kiểm. Toàn bộ chữ trong phần đối chiếu được soi qua một danh sách từ ngữ mang nghĩa khuyên nhủ, xếp hạng hơn kém hoặc suy đoán hệ quả, cùng với yêu cầu mỗi điểm phải dẫn đủ căn cứ ở cả hai vế. Dính một lỗi là quá trình dựng trang dừng lại. Nói cách khác, tính khách quan của phần này không dựa vào lời hứa sẽ viết cẩn thận mà dựa vào một điều kiện phải thỏa mãn thì trang mới lên được.",
        "Nhận định ở đây vì vậy chỉ có một nghĩa: mô tả chênh lệch đọc được giữa hai bản văn. Nó không nói quy định nào hợp lý hơn, không đoán trước hệ quả, không thay thế ý kiến pháp lý cho một vụ việc. Cuối mỗi trang đối chiếu có thêm một ô để người đọc tự dán hai đoạn văn bản vào và xem câu chữ khác nhau ở đâu; phép so sánh đó chạy trong trình duyệt, thuần cơ học, chỉ ra chữ nào thêm chữ nào bớt chứ không kết luận nghĩa đã đổi hay chưa.",
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
        "One rule governed the building of this dataset: no document number appears unless it was actually looked up. Memory for document numbers is not to be trusted — the numbers resemble one another closely, and an instrument that was once correct may have been replaced without anyone noticing. The entries in the first batch were each traced through the Government Portal, Thư viện Pháp luật or LuatVietnam before being recorded.",
        "The batch added on 4 September 2026 — fifty instruments — was compiled under different conditions, and that must be said plainly. In that session the primary sources could not be opened: the network blocked thuvienphapluat.vn, vanban.chinhphu.vn, vbpl.vn and luatvietnam.vn. Each record's number, date of issue and entry into force was therefore corroborated across at least two independent search results, and any detail that did not agree, or did not appear at all, was left blank rather than inferred. All fifty carry the needs-checking flag, and the links under sources are addresses found, not pages opened.",
        "The exercise turned up several things worth noting. The 2014 Construction Law ceased to have effect on 1 July 2026 and was replaced by Law No. 135/2025/QH15. The 2020 Investment Law was likewise replaced by Law No. 143/2025/QH15, yet Article 7 and Appendix IV of the older law remain in force until 1 July 2026, creating an overlap that is easy to misread. The 2019 Tax Administration Law ceased to have effect on 30 June 2026. Each of these would have been missed by anyone working from recollection.",
        "Entries with at least one detail that could not be confirmed against an official source — usually the precise date of issue — carry a warning displayed openly on the record. Nothing has been rounded off for the sake of a tidy page.",
      ],
    },
    {
      h: "Comparing the old position with the new",
      p: [
        "Most practical questions do not stop at what an instrument says; they turn on what it changed relative to the instrument before it. The comparison pages are built for that, in four separate layers, so that a reader can tell where each line on the page came from.",
        "The first layer is the pair itself, taken directly from the replacement and amendment relations already in the dataset. No pair is added by hand, so the list of pairs always matches the relation map and there is no room for a pair chosen because it illustrates a point nicely. The second layer is the table of facts and the notes computed from the two records: instrument type, status, date of issue, date of effect, and the interval between them. That whole layer is comparison and date arithmetic — on the same data, anyone gets the same output.",
        "The third layer is the content comparison written by an editor, and it is the only layer touched by a human hand. Each point sets out what the earlier instrument records, what the later one records, a label drawn from a closed list of nine kinds of change, and one sentence of observation. Each side must cite the record it was read from, and where a record is silent the page says so rather than inferring anything from that silence.",
        "The fourth layer is the check. Every string in the comparison layer is scanned against a list of advisory, evaluative and speculative terms, and each point must cite a basis on both sides. A single failure stops the build. The objectivity of this material therefore does not rest on a promise to write carefully; it rests on a condition that must be satisfied before the page can exist at all.",
        "An observation here means one thing only: a description of the difference that can be read off the two texts. It does not rank one provision above another, does not predict consequences, and does not stand in for legal advice on a matter. Each comparison page ends with a box where a reader can paste two passages and see where the wording differs; that comparison runs in the browser and is purely mechanical — it shows which words were added and which removed, and says nothing about whether the meaning has changed.",
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

const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

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
    <>
      <section className="rule-b hero-lux">
        <LuxBackdrop />
        <div className="mx-auto w-full max-w-[76rem] px-5 py-10 sm:px-8 sm:py-14">
          <p className="eyebrow eyebrow-tick rise">{t.nav.about}</p>
          <h1 className="display rise rise-1 mt-3 max-w-[20ch]">{t.about.title}</h1>
          <p className="measure rise rise-2 mt-5 text-[1.125rem] leading-relaxed text-[var(--ink-2)]">
            {t.about.lede}
          </p>
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
            rộng — cách một bài viết dài tự chỉ đường mà không cần mục lục. */}
        <div className="mt-12 space-y-14">
          {body[lang].map((section, si) => (
            <Reveal key={section.h}>
              <section className="lg:grid lg:grid-cols-[4rem_1fr] lg:gap-x-6">
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

        <p className="tnum mt-14 border-t border-[var(--rule)] pt-5 text-sm text-[var(--ink-3)]">
          {t.footer.verifiedPrefix} {formatDate(VERIFIED_ON, lang, VERIFIED_ON)}.
        </p>
      </article>
    </>
  );
}
