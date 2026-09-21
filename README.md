# Research-Law-VN — Bản đồ Không gian Pháp luật

Công cụ tra cứu quan hệ giữa các văn bản quy phạm pháp luật Việt Nam. Mỗi điểm
trên bản đồ là một văn bản, mỗi đường nối là một quan hệ có thật: quy định chi
tiết, sửa đổi bổ sung, hoặc thay thế.

Trang có hai phiên bản đầy đủ, tiếng Việt tại `/vi` và tiếng Anh tại `/en`.

Trang chủ `/vi` là phần mở đầu ba chiều; bản đồ tương tác nằm ở `/vi/ban-do`.

## Trang mở đầu ba chiều

Trang chủ trước đây mở thẳng vào bản đồ. Hai việc khác nhau bị nhồi vào một địa
chỉ: người mở lần đầu cần biết trang này làm gì, người đã biết cần vào thẳng
công cụ. Nay trang chủ là sáu màn cuộn trên một cảnh ba chiều duy nhất, và có
lối vào bản đồ ở cả sáu màn lẫn thanh dưới cùng.

Cảnh không phải hình trang trí. `src/lib/space.ts` sinh toàn bộ hình học từ
`documents` và `relations`: mỗi điểm sáng là một văn bản, mỗi thanh nối là một
quan hệ có thật, và sáu màn là sáu cách sắp xếp cùng tập điểm đó.

1. **Khối** — toàn bộ tập văn bản như một thiên thể, luật ở lõi, thông tư ở lớp vỏ.
2. **Thứ bậc** — bốn tầng theo hiệu lực pháp lý, trục đứng mang nghĩa.
3. **Lĩnh vực** — tám chùm, mỗi chùm một sắc màu dùng chung với bản đồ hai chiều.
4. **Quan hệ** — văn bản bị nhiều văn bản khác dẫn chiếu bị kéo vào tâm, nên các
   đường nối cắt qua lòng khối thay vì bò trên mặt.
5. **Thời gian** — trục ngang là năm có hiệu lực, trục đứng vẫn là thứ bậc.
6. **Ngưỡng** — hai vành lồng vào nhau, trước lối vào bản đồ.

Một điểm giữ nguyên danh tính qua cả sáu màn, nên chuyển màn là các văn bản di
chuyển sang chỗ mới chứ không phải một cảnh tắt đi và một cảnh khác hiện ra.
Camera, đèn, sương, độ đậm đường nối và sắc độ cùng đọc một bảng trạng thái duy
nhất, nên chúng luôn đổi đồng bộ với hình khối. Thêm một nghị định vào tập dữ
liệu là cảnh có thêm một điểm, không phải sửa mã.

Ba cam kết kỹ thuật, và cả ba đều đến từ ràng buộc có sẵn của trang. Không render
target và không postprocessing, để cảnh dựng được trên GPU tích hợp đời cũ. Không
tài nguyên bên thứ ba, nên `Content-Security-Policy` khoá `default-src 'self'`
không phải nới ra dòng nào. Vì vậy kim loại dùng một hộp sáng giả đọc từ pháp
tuyến (`src/lib/surface.ts`, dùng chung với khối quan hệ của trang lĩnh vực) thay
cho envMap; quầng sáng của văn bản cấp luật là tấm phẳng cộng dồn thay cho bloom;
và lớp bụi đổi hành vi ngay trong vertex shader.

Ba đường để phần này không bao giờ chặn nội dung. Toàn bộ chữ nằm trong HTML dựng
sẵn nên đọc được khi JavaScript bị chặn. Chuyển động chỉ do GSAP đặt, nên gói mã
hỏng thì chữ vẫn hiện chứ không mất. Và cảnh nằm sau một ranh giới lỗi: WebGL
không dựng được thì trang tiếp tục như một trang chữ. Bảng tùy chỉnh ở thanh dưới
cùng có nút dừng chuyển động, giảm chuyển động và tắt tác động của con trỏ; lựa
chọn của hệ điều hành được tôn trọng cho tới khi người đọc tự chọn.

Cảnh ba chiều chỉ sống ở phần mở đầu. Từ khối kết trở xuống, nền phẳng trở lại:
nền động sau một đoạn văn dài làm mắt trượt khỏi dòng đang đọc, mà đây là trang
để đọc điều luật.

Thư viện tham khảo và lý do chọn hoặc loại từng thư viện nằm ở `references/`.

## Khối lối vào ở trang chủ

Hết sáu màn, trang chủ trả lời câu hỏi kế tiếp: vào đâu bây giờ. Khối lối vào
(`src/components/HomeHub.tsx`) đặt năm thẻ — bản đồ tương tác, khối lĩnh vực ba
chiều, danh mục văn bản, đối chiếu, phương pháp — kèm một dải số liệu và lối
quay lại màn đầu. Mọi con số trên các thẻ đếm thẳng từ tập dữ liệu; không có con
số nào viết tay trong file lời.

Mỗi thẻ mang một hình thu nhỏ, và hình đó là một bố cục thật của cảnh mở đầu
chiếu xuống mặt phẳng (`src/lib/preview.ts`, `src/components/SpaceThumb.tsx`).
Hình xuất ra SVG tĩnh ở máy chủ: không ngữ cảnh WebGL nào được mở thêm, không
một byte `three` nào phải tải, và hình có mặt cả khi JavaScript bị chặn. Đầu các
trang danh mục, lĩnh vực, đối chiếu và phương pháp lặp lại đúng hình của thẻ dẫn
tới nó, nên người đọc bấm một hình rồi gặp lại chính hình ấy ở trang đích.

Thẻ lĩnh vực ở `/vi/linh-vuc` mang một vệt bốn tầng hiệu lực của riêng lĩnh vực
đó (`src/components/DomainSpark.tsx`), cũng là SVG tĩnh. Giới hạn cũ vẫn giữ
nguyên: tám thẻ trên một trang không được phép là tám ngữ cảnh WebGL, nên vật
thể ba chiều để dành cho trang riêng của từng lĩnh vực.

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

Đợt bổ sung ngày 21/9/2026 gồm hai mươi lăm văn bản, tra trong đúng điều kiện đó
và cũng mang `confidence: "cross-check"`. Từ đợt này, ngày tra cứu được ghi ở
từng bản ghi qua trường `verifiedOn`; bản ghi không ghi thì thuộc đợt gốc và lấy
`VERIFIED_ON`. Chân trang và các trang thống kê đọc `LATEST_VERIFIED_ON`, tính
từ chính tập dữ liệu, nên thêm một đợt là con số tự đúng theo.

## Cơ chế đối chiếu văn bản

Trang `/vi/doi-chieu` đặt điểm cũ và điểm mới của từng cặp văn bản cạnh nhau.
Cơ chế gồm năm lớp, tách bạch để biết mỗi dòng chữ đến từ đâu:

1. **Cặp văn bản** suy ra từ quan hệ `replaces` và `amends` trong
   `src/data/documents.ts`. Không cặp nào được thêm bằng tay, nên danh sách cặp
   luôn khớp với bản đồ quan hệ.
2. **Bảng dữ kiện và nhận định suy ra** (`src/lib/compare.ts`): loại văn bản,
   tình trạng hiệu lực, ngày ban hành, ngày hiệu lực, khoảng cách giữa hai mốc,
   lĩnh vực thêm hoặc bớt. Toàn bộ là phép so sánh và phép trừ ngày.
3. **Điểm đối chiếu nội dung** (`src/data/comparisons.ts`): mỗi điểm gồm nội
   dung ở văn bản cũ, nội dung ở văn bản mới, một nhãn phân loại lấy từ danh
   sách đóng chín loại thay đổi, một câu nhận định, và căn cứ trỏ về đúng chỗ mà
   mỗi vế được đọc ra. Căn cứ của hai vế hiển thị tách riêng, không gộp làm một.
4. **Phép kiểm tính khách quan** (`src/lib/objectivity.ts`): mọi chuỗi trong
   phần đối chiếu được soi qua danh sách từ ngữ mang nghĩa khuyên nhủ, xếp hạng
   hoặc suy đoán, kèm yêu cầu dẫn đủ căn cứ ở cả hai vế. Dính một lỗi là
   `next build` dừng lại — tính khách quan là điều kiện để trang lên được, không
   phải một lời hứa.
5. **Chuỗi văn bản** (`src/lib/lineage.ts`): một cặp chỉ thấy hai mắt xích,
   trong khi một hợp đồng thường sống qua cả đời văn bản. Chuỗi dựng từ cùng dữ
   liệu quan hệ — các lần `replaces` nối nhau thành trục, các bản ghi `amends`
   treo vào mắt xích mà chúng chạm tới — rồi đặt lên một dòng thời gian tỷ lệ và
   một bảng dữ kiện nhiều cột, mỗi cột một đời văn bản. Chuỗi từ ba văn bản trở
   lên có trang riêng ở `/vi/doi-chieu/chuoi/<mã văn bản mở đầu>`; chuỗi hai văn
   bản đã là một cặp nên không cần trang riêng.

Nhận định trong phần này chỉ mô tả chênh lệch đọc được giữa hai văn bản. Nó
không đánh giá quy định nào hợp lý hơn, không dự đoán hệ quả, và không thay thế
ý kiến pháp lý cho một vụ việc cụ thể.

Cuối mỗi trang đối chiếu có ô so sánh hai đoạn văn bản do người đọc tự dán vào
(`src/lib/diff.ts`). Phép so sánh chạy trong trình duyệt, thuần cơ học: nó chỉ
ra chữ nào thêm, chữ nào bớt, không kết luận nghĩa của điều luật đã đổi hay chưa.
Cùng phép so sánh đó chạy được ngay trên hai vế của từng điểm đối chiếu, mở theo
yêu cầu để một trang nhiều điểm không phải dựng sẵn hàng chục bảng quy hoạch
động.

Danh sách cặp có bộ lọc theo lĩnh vực, loại quan hệ và mức đối chiếu, kèm ô tìm
theo số hiệu hoặc tên văn bản. Dòng dữ liệu cho bộ lọc được rút gọn ở máy chủ,
và danh sách đầy đủ vẫn nằm trong HTML dựng sẵn nên đọc được khi JavaScript bị
chặn.

## Cơ chế dẫn trích

Một căn cứ trỏ tới cả một văn bản chỉ nói được nên mở quyển nào. `src/lib/citation.ts`
cho phép trỏ tới đúng điều khoản. Trích dẫn viết trong dữ liệu là một chuỗi:

```
"luat-xay-dung-2025"                     cả văn bản
"luat-xay-dung-2025#dieu:38"             Điều 38
"luat-xay-dung-2025#dieu:38.khoan:3"     khoản 3 Điều 38
"luat-dau-tu-2020#phuluc:IV"             Phụ lục IV
```

Sáu thành phần nhận được: `phuluc`, `chuong`, `muc`, `dieu`, `khoan`, `diem`.
Bộ hiển thị theo quy ước của từng thứ tiếng — tiếng Việt đi từ hẹp ra rộng
(`điểm a khoản 3 Điều 38 Luật Xây dựng (135/2025/QH15)`), tiếng Anh gộp số vào
sau tên điều (`Article 38(3)(a), Law on Construction (No. 135/2025/QH15)`). Số
hiệu luôn đi kèm: tên văn bản lặp lại qua các đời luật, số hiệu thì không.

Phần chỉ chỗ chỉ được ghi ở chỗ chính bản ghi nói ra; bản ghi dừng ở cấp văn bản
thì trích dẫn cũng dừng ở đó. Cú pháp đi qua cùng cổng chặn với phép kiểm từ
ngữ: sai tên thành phần, bỏ trống giá trị hay trỏ tới mã không có thật đều làm
`next build` dừng lại. Trang chi tiết mỗi văn bản có khối trích dẫn kèm nút sao
chép.

## Cổng chặn của kho văn bản

`src/lib/integrity.ts` chạy khi nạp `src/data/documents.ts`, trước mọi thứ suy
ra từ nó. Bảy ràng buộc:

1. Mã và số hiệu không trùng nhau giữa hai bản ghi.
2. Số hiệu khớp quy ước đánh số của loại văn bản (`…/NĐ-CP` cho nghị định,
   `…/QH<khóa>` cho luật, `…/TT-…` cho thông tư).
3. Ngày ghi theo ISO, và ngày hiệu lực không sớm hơn ngày ban hành.
4. Mỗi bản ghi thuộc ít nhất một lĩnh vực có trong danh sách, không lặp.
5. Mỗi bản ghi dẫn ít nhất một nguồn, và mọi nguồn là địa chỉ `https`.
6. Quan hệ chỉ trỏ tới bản ghi có thật, không trỏ về chính nó, không lặp.
7. Văn bản đã bị một văn bản đang có hiệu lực thay thế không còn được ghi là còn
   hiệu lực.

Cả bảy đều khẳng định được từ chính tập dữ liệu, không cần tra cứu bên ngoài —
điều kiện để chúng còn chạy được lâu dài.

## Chạy dự án

```bash
npm install
npm run dev        # môi trường phát triển
npm run build      # dựng bản production
npm run typecheck  # kiểm tra kiểu
npm run lint       # kiểm tra quy tắc mã nguồn
```

### Biến môi trường

`NEXT_PUBLIC_SITE_URL` là địa chỉ gốc của trang khi triển khai, ví dụ
`https://vidu.vn`. Thẻ canonical, thẻ khai báo bản dịch và `sitemap.xml` đều cần
địa chỉ tuyệt đối, mà địa chỉ đó thì không suy ra được từ mã nguồn. Trên Vercel,
biến `VERCEL_PROJECT_PRODUCTION_URL` của nền tảng được dùng thay khi không đặt.
Không có cả hai thì rơi về `http://localhost:3000`: đúng cho lúc chạy phát
triển, và sai một cách dễ thấy nếu quên đặt trước khi triển khai.

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

Khối quan hệ ba chiều ở trang lĩnh vực và vật thể biểu trưng đều đọc lại bảng
màu khi người đọc đổi nền sáng/tối, thay vì nướng cứng màu lúc dựng cảnh. Nhãn
trên cả bản đồ hai chiều lẫn khối ba chiều được đo một lần rồi mới dùng cho phép
chống chồng; phép đo chạy lại đúng một lần nữa khi phông chữ thật đã thay phông
dự phòng, vì lúc đó bề rộng chữ mới đổi.

`sitemap.xml` và `robots.txt` sinh từ chính tập dữ liệu, dùng cùng nguồn với
`generateStaticParams` của từng trang, nên không có trang nào lên được mà thiếu
trong sitemap. Thẻ canonical và thẻ khai báo bản dịch đặt ở từng trang, xem
`src/lib/site.ts`.

Bản dựng production gửi kèm `Content-Security-Policy` khoá `default-src 'self'`:
trang không nạp mã, kiểu dáng, ảnh hay phông chữ từ bên thứ ba nên khoá này
không làm hỏng gì. Riêng `script-src` phải nhận `'unsafe-inline'` vì toàn bộ
trang là HTML dựng sẵn, không có yêu cầu nào để sinh `nonce` cho từng lần tải.
Chi tiết và lý do nằm trong `next.config.ts`.

Cấu trúc chính:

```
src/
  app/[lang]/               # định tuyến song ngữ, sinh tĩnh toàn bộ
  app/[lang]/page.tsx       # trang mở đầu ba chiều
  app/[lang]/ban-do/        # bản đồ tương tác
  app/sitemap.ts            # sitemap sinh từ tập dữ liệu
  app/robots.ts             # robots.txt
  components/               # bản đồ, danh mục, các mảnh giao diện dùng lại
  components/Prologue.tsx   # sáu màn cuộn, GSAP ScrollTrigger
  components/LegalSpace.tsx # cảnh ba chiều, React Three Fiber
  components/HomeHub.tsx    # khối lối vào ở trang chủ
  components/SpaceThumb.tsx # hình thu nhỏ của một bố cục, SVG tĩnh
  components/DomainSpark.tsx # vệt bốn tầng của một lĩnh vực
  data/                     # tập dữ liệu văn bản và kiểu dữ liệu
  i18n/                     # từ điển giao diện hai thứ tiếng
  lib/layout.ts             # thuật toán bố cục bản đồ
  lib/space.ts              # sáu bố cục ba chiều, sinh từ tập dữ liệu
  lib/preview.ts            # chiếu bố cục xuống mặt phẳng cho hình thu nhỏ
  lib/surface.ts            # hộp sáng giả, dùng chung cho hai cảnh ba chiều
  lib/compare.ts            # ghép cặp và tính dữ kiện đối chiếu
  lib/objectivity.ts        # phép kiểm tính khách quan, chạy khi dựng trang
  lib/diff.ts               # so sánh cơ học hai đoạn văn bản
  lib/site.ts               # địa chỉ gốc, canonical và khai báo bản dịch
references/                 # thư viện 3D đã khảo sát, và lý do dùng hay loại
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

The home page is a three-dimensional prologue; the interactive map lives at
`/en/ban-do`. The prologue is not decoration: `src/lib/space.ts` derives all of
its geometry from `documents` and `relations`, and its six acts are six
arrangements of that same set of points — the corpus as one body, four strata of
legal force, eight domain clusters, the relation web, the time axis, and a
closing pair of rings. A point keeps its identity across all six, so moving
between acts moves the instruments rather than swapping one scene for another.
Adding a decree to the dataset adds a point to the scene.

Three technical commitments, all inherited from constraints the site already
had: no render targets and no postprocessing, so the scene builds on old
integrated GPUs, and no third-party assets, so the `default-src 'self'` policy
needed no loosening. Metal therefore uses a fake light box read off the surface
normal (`src/lib/surface.ts`, shared with the relation block on the domain
pages) in place of an environment map, the glow on primary legislation is an
additive billboard in place of bloom, and the dust layer changes behaviour in
the vertex shader. All of the prose sits in the prerendered HTML, motion is
applied only by GSAP, and the scene is wrapped in an error boundary — so with
JavaScript blocked, a broken bundle, or no WebGL, the page continues as a text
page. The scene is confined to the prologue; below it the background goes flat
again, because this is a site for reading legislation.

Below the prologue, the home page answers the question that follows it — where
to go now. The hub (`src/components/HomeHub.tsx`) sets out five ways in: the
interactive map, the three-dimensional domain bodies, the index of instruments,
the comparison pages and the method. Every figure on those cards is counted
from the dataset itself. Each card carries a thumbnail that is one of the
prologue's own layouts projected onto the plane (`src/lib/preview.ts`,
`src/components/SpaceThumb.tsx`), emitted as static SVG on the server: no extra
WebGL context, no `three` to download, and the figure is there with JavaScript
blocked. The index, domain, comparison and method pages open with the same
figure as the card that leads to them. On `/en/linh-vuc`, each domain card
carries a four-strata spark of its own instruments
(`src/components/DomainSpark.tsx`) — also static SVG, because eight cards on one
page must not become eight WebGL contexts.

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

To deploy, set `NEXT_PUBLIC_SITE_URL` to the site's origin. Canonical tags,
hreflang tags and `sitemap.xml` all need absolute addresses, and that address
cannot be derived from the source. On Vercel the platform's
`VERCEL_PROJECT_PRODUCTION_URL` is used when the variable is unset; with neither,
the build falls back to `http://localhost:3000`.
