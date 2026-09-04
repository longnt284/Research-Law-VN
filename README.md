# Research-Law-VN — Bản đồ Không gian Pháp luật

Công cụ tra cứu quan hệ giữa các văn bản quy phạm pháp luật Việt Nam. Mỗi điểm
trên bản đồ là một văn bản, mỗi đường nối là một quan hệ có thật: quy định chi
tiết, sửa đổi bổ sung, hoặc thay thế.

Trang có hai phiên bản đầy đủ, tiếng Việt tại `/vi` và tiếng Anh tại `/en`.

## Phạm vi

Tám lĩnh vực: Xây dựng, Năng lượng, Hợp đồng thương mại, Tố tụng và Trọng tài,
Doanh nghiệp, Đầu tư, Lao động, Thuế.

## Nguyên tắc về dữ liệu

Không đưa vào tập dữ liệu bất kỳ số hiệu văn bản nào chưa được tra cứu. Mỗi bản
ghi trong `src/data/documents.ts` kèm danh sách nguồn đã mở và một trường
`confidence`; bản ghi còn chi tiết chưa đối chiếu được với nguồn chính thống sẽ
hiện cảnh báo công khai trên giao diện thay vì được làm tròn cho đẹp.

Ngày tra cứu của toàn bộ tập dữ liệu nằm ở hằng `VERIFIED_ON`. Kết quả tra cứu
văn bản pháp luật chỉ có giá trị tại thời điểm tra; trước khi dùng vào hồ sơ
chính thức phải đối chiếu lại với Công báo hoặc cơ quan ban hành.

Đợt bổ sung ngày 04/9/2026 gồm năm mươi văn bản được tra trong điều kiện không
mở được trang nguồn Tier 1: phiên làm việc bị chặn thuvienphapluat.vn,
vanban.chinhphu.vn, vbpl.vn và luatvietnam.vn. Số hiệu và các mốc thời gian của
từng bản ghi được đối chiếu giữa ít nhất hai kết quả tìm kiếm độc lập; chi tiết
không khớp hoặc không xuất hiện thì để trống. Cả năm mươi bản ghi mang
`confidence: "cross-check"` nên giao diện hiện cảnh báo, và `sources` ở nhóm này
là địa chỉ trang tìm được chứ không phải trang đã mở.

## Cơ chế đối chiếu văn bản

Trang `/vi/doi-chieu` đặt điểm cũ và điểm mới của từng cặp văn bản cạnh nhau.
Cơ chế gồm bốn lớp, tách bạch để biết mỗi dòng chữ đến từ đâu:

1. **Cặp văn bản** suy ra từ quan hệ `replaces` và `amends` trong
   `src/data/documents.ts`. Không cặp nào được thêm bằng tay, nên danh sách cặp
   luôn khớp với bản đồ quan hệ.
2. **Bảng dữ kiện và nhận định suy ra** (`src/lib/compare.ts`): loại văn bản,
   tình trạng hiệu lực, ngày ban hành, ngày hiệu lực, khoảng cách giữa hai mốc,
   lĩnh vực thêm hoặc bớt. Toàn bộ là phép so sánh và phép trừ ngày.
3. **Điểm đối chiếu nội dung** (`src/data/comparisons.ts`): mỗi điểm gồm nội
   dung ở văn bản cũ, nội dung ở văn bản mới, một nhãn phân loại lấy từ danh
   sách đóng chín loại thay đổi, một câu nhận định, và căn cứ trỏ về bản ghi mà
   mỗi vế được đọc ra.
4. **Phép kiểm tính khách quan** (`src/lib/objectivity.ts`): mọi chuỗi trong
   phần đối chiếu được soi qua danh sách từ ngữ mang nghĩa khuyên nhủ, xếp hạng
   hoặc suy đoán, kèm yêu cầu dẫn đủ căn cứ ở cả hai vế. Dính một lỗi là
   `next build` dừng lại — tính khách quan là điều kiện để trang lên được, không
   phải một lời hứa.

Nhận định trong phần này chỉ mô tả chênh lệch đọc được giữa hai văn bản. Nó
không đánh giá quy định nào hợp lý hơn, không dự đoán hệ quả, và không thay thế
ý kiến pháp lý cho một vụ việc cụ thể.

Cuối mỗi trang đối chiếu có ô so sánh hai đoạn văn bản do người đọc tự dán vào
(`src/lib/diff.ts`). Phép so sánh chạy trong trình duyệt, thuần cơ học: nó chỉ
ra chữ nào thêm, chữ nào bớt, không kết luận nghĩa của điều luật đã đổi hay chưa.

## Chạy dự án

```bash
npm install
npm run dev        # môi trường phát triển
npm run build      # dựng bản production
npm run typecheck  # kiểm tra kiểu
```

## Skill Claude Code

Repo có sẵn hai skill dùng chung cho phiên Claude Code: `/caveman` (chế độ trả
lời nén tối đa) và `/karpathy-guidelines` (nguyên tắc hạn chế lỗi code do LLM
gây ra). Xem `.claude/skills/README.md` để biết nguồn, giấy phép, cách cập nhật.

## Ghi chú kỹ thuật

Bản đồ vẽ trên canvas 2D với bố cục tính sẵn một lần, tất định, không dùng mô
phỏng lực chạy theo thời gian thực. Thao tác kéo và phóng to không kích hoạt
render lại của React mà chỉ đánh dấu khung hình cần vẽ; khi không còn gì thay
đổi, vòng lặp vẽ dừng hẳn. Nhãn trên bản đồ có kiểm tra chồng lấn nên chữ không
đè lên nhau ở bất kỳ mức phóng nào.

Cấu trúc chính:

```
src/
  app/[lang]/          # định tuyến song ngữ, sinh tĩnh toàn bộ
  components/          # bản đồ, danh mục, các mảnh giao diện dùng lại
  data/                # tập dữ liệu văn bản và kiểu dữ liệu
  i18n/                # từ điển giao diện hai thứ tiếng
  lib/layout.ts        # thuật toán bố cục bản đồ
  lib/compare.ts       # ghép cặp và tính dữ kiện đối chiếu
  lib/objectivity.ts   # phép kiểm tính khách quan, chạy khi dựng trang
  lib/diff.ts          # so sánh cơ học hai đoạn văn bản
```

## Miễn trừ trách nhiệm

Nội dung phục vụ mục đích tra cứu và tham khảo, không thay thế ý kiến pháp lý
cho một vụ việc cụ thể.

---

# Research-Law-VN — Vietnamese Legal Space Map

A reference tool for tracing how Vietnam's legal instruments connect to one
another. Each point on the map is an instrument; each line is a relation that
actually exists — detailing, amending, or replacing. Fully available in
Vietnamese at `/vi` and English at `/en`.

Data rule: no document number appears unless it was actually looked up. Every
record carries its sources and a confidence flag, and records with an unconfirmed
detail display that fact openly. A search of legislation is only good as at the
date it was run; check against the Official Gazette before relying on it in a
formal filing.

The comparison pages at `/en/doi-chieu` set the earlier and later position of
each pair side by side, in four separate layers: pairs derived from the
`replaces` and `amends` relations; a table of facts and notes computed from the
two records; content comparison points written by an editor, each citing the
record it was read from; and a lexical check that scans every string in the
comparison layer for advisory, evaluative or speculative language and fails the
build on a single hit. An observation there describes only the difference that
can be read off the two texts — it ranks nothing, predicts nothing, and is not
legal advice. Each page also carries a browser-side word diff for pasting two
passages of your own.

The fifty instruments added on 4 September 2026 were compiled without access to
Tier 1 sources — the session's network blocked thuvienphapluat.vn,
vanban.chinhphu.vn, vbpl.vn and luatvietnam.vn. Each number and date was
corroborated across at least two independent search results, and anything that
did not agree was left blank. All fifty carry `confidence: "cross-check"`, so the
interface flags them, and their `sources` are addresses found rather than pages
opened.
