# Research-Law-VN — Bản đồ Không gian Pháp luật

Công cụ tra cứu quan hệ giữa các văn bản quy phạm pháp luật Việt Nam. Mỗi điểm
trên bản đồ là một văn bản, mỗi đường nối là một quan hệ có thật: quy định chi
tiết, sửa đổi bổ sung, hoặc thay thế.

Trang có hai phiên bản đầy đủ, tiếng Việt tại `/vi` và tiếng Anh tại `/en`.

Trang chủ `/vi` là dải văn bản nối xích; bản đồ tương tác nằm ở `/vi/ban-do`.

## Trang chủ: văn bản nối xích

Trang chủ mở bằng ba dải thẻ văn bản chạy không dứt, nối nhau bằng mắt xích.
Hình không phải trang trí: mỗi thẻ là một văn bản có thật trong tập dữ liệu, mỗi
mắt xích là một quan hệ có thật, và thứ tự thẻ do `src/lib/strands.ts` quyết
định. Thư viện đó chia toàn bộ quan hệ thành các sợi — đường đơn đi qua mỗi quan
hệ đúng một lần — nên sợi dài nhất xuất hiện đúng ở chỗ một luật sửa đổi nhiều
luật cùng lúc bắc cầu giữa hai hệ văn bản. Thêm một nghị định hướng dẫn vào tập
dữ liệu là một sợi dài thêm một mắt, không phải sửa mã.

Mắt xích nói loại quan hệ bằng ba cách cùng lúc: kim loại đồng cho quy định chi
tiết, thép cho sửa đổi bổ sung, son đỏ cho thay thế; một nhãn chữ có mũi tên chỉ
vào văn bản bị tác động; và một câu đầy đủ trong `title`. Chấm sáng chạy dọc xích
đi từ văn bản tác động sang văn bản bị tác động. Thẻ văn bản hết hiệu lực, đã sửa
đổi hoặc chưa có hiệu lực mang một con dấu tình trạng.

Dưới dải là ba khối, mỗi khối trả lời một câu hỏi người làm hồ sơ vẫn hỏi:

1. **Thứ bậc hiệu lực** — bốn bậc thang, mỗi ô nhỏ là một văn bản tô theo màu
   lĩnh vực.
2. **Quan hệ** — ba loại mắt xích, mỗi loại một ví dụ thật do `exampleOf` chọn
   từ tập dữ liệu, ưu tiên cặp đã xác minh.
3. **Trục thời gian** — số văn bản có hiệu lực theo năm, chia theo tình trạng,
   kèm vạch ngày tra cứu; bảng số đi kèm cho trình đọc màn hình.

Toàn bộ là HTML và SVG dựng ở máy chủ. Không có WebGL, không có thư viện đồ họa
phải tải: `three` và `@react-three/fiber` đã rời khỏi `dependencies`. Chuyển động
nằm trong CSS và chỉ dịch `transform`, nên trình duyệt đẩy xuống bộ tổng hợp.
Chuyển động dừng khi rê chuột vào một làn, khi bấm nút "Dừng chuyển động" (lựa
chọn được nhớ và áp cho cả lớp nền đầu trang), và khi hệ điều hành báo giảm
chuyển động — lúc đó dải thành một hàng cuộn ngang bằng tay. Dải được ẩn khỏi
cây trợ năng và thẻ trong dải không nhận tiêu điểm bàn phím; một câu tóm tắt thay
chỗ, và cùng nội dung nằm ở danh mục và bản đồ dưới dạng đọc được.

## Hình minh họa ở các trang

Hình ở đầu mỗi trang và trên thẻ lối vào trang chủ vẽ đúng vật mà trang đó làm
việc cùng (`src/components/art/PageArt.tsx`): bản đồ là một luật cùng văn bản cũ
nó thay thế, luật sửa đổi nó và các nghị định, thông tư hướng dẫn; danh mục là
tháp thứ bậc với số văn bản thật mỗi tầng; đối chiếu là hai trang cùng một điều
có dòng bị gạch và dòng được chèn; phương pháp là kính lúp trên số hiệu cùng danh
sách những gì đã kiểm và con dấu ngày tra. Mỗi lĩnh vực có một biểu tượng nét
(`src/components/art/DomainGlyph.tsx`): cần cẩu, cột điện, trang hợp đồng có chữ
ký, cán cân, tòa văn phòng, đồ thị tăng trưởng, mũ bảo hộ, biên lai thuế, thửa
đất có mốc giới, cây cầu hạ tầng.

Trang của từng lĩnh vực thay khối quan hệ ba chiều bằng cây văn bản phẳng
(`src/lib/tree.ts`, `src/components/DomainTree.tsx`): mỗi cột một tầng hiệu lực,
thứ tự trong cột theo phép trọng tâm để đường nối ít cắt nhau, quan hệ giữa hai
văn bản cùng cột vẽ thành cung bên trái cột. Mỗi văn bản trên cây là một liên kết
thật dùng được bằng bàn phím.

Bản đồ hai chiều giữ nguyên cơ chế, thêm ký hiệu theo tầng hiệu lực: luật là
hình vuông, nghị quyết và văn bản hợp nhất là hình thoi, nghị định là hình tròn,
thông tư là tam giác, văn bản hết hiệu lực rỗng ruột. Chú giải liệt kê đủ bốn
hình và ba kiểu nét.

Ba kiểu nét quan hệ dùng chung ở mọi hình: nét liền cho quy định chi tiết, nét
đứt cho sửa đổi bổ sung, nét chấm đỏ cho thay thế. Thang bốn tầng hiệu lực và
các con số dùng chung nằm ở `src/lib/corpus.ts`, nên không có hai hình nào xếp
cùng một văn bản vào hai tầng khác nhau.

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

Nhãn trên bản đồ hai chiều được đo một lần rồi mới dùng cho phép chống chồng;
phép đo chạy lại đúng một lần nữa khi phông chữ thật đã thay phông dự phòng, vì
lúc đó bề rộng chữ mới đổi.

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
  app/[lang]/page.tsx       # trang chủ: dải văn bản nối xích và ba khối
  app/[lang]/ban-do/        # bản đồ tương tác
  app/sitemap.ts            # sitemap sinh từ tập dữ liệu
  app/robots.ts             # robots.txt
  components/               # bản đồ, danh mục, các mảnh giao diện dùng lại
  components/home/          # dải xích, thẻ văn bản, ba khối của trang chủ
  components/art/           # hình minh họa đầu trang và biểu tượng lĩnh vực
  components/DomainTree.tsx # cây văn bản của một lĩnh vực
  components/HomeHub.tsx    # khối lối vào ở trang chủ
  components/DomainSpark.tsx # vệt bốn tầng của một lĩnh vực
  data/                     # tập dữ liệu văn bản và kiểu dữ liệu
  i18n/                     # từ điển giao diện hai thứ tiếng
  lib/corpus.ts             # thang thứ bậc và các con số dùng chung
  lib/strands.ts            # chia quan hệ thành sợi cho dải xích
  lib/tree.ts               # bố cục cây văn bản của một lĩnh vực
  lib/layout.ts             # thuật toán bố cục bản đồ
  lib/compare.ts            # ghép cặp và tính dữ kiện đối chiếu
  lib/objectivity.ts        # phép kiểm tính khách quan, chạy khi dựng trang
  lib/diff.ts               # so sánh cơ học hai đoạn văn bản
  lib/site.ts               # địa chỉ gốc, canonical và khai báo bản dịch
references/                 # thư viện đã khảo sát, và lý do dùng hay loại
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

The home page opens with three strips of instrument cards running without end,
joined by chain links. Each card is a real instrument and each link a real
relation; `src/lib/strands.ts` splits every relation into single paths so that
each relation appears in exactly one strand, and the longest strands form where
one amending law bridges several bodies of legislation. A link states its kind
three ways at once — brass for detailing, steel for amending, red for replacing;
a label whose arrow points at the instrument acted upon; and a full sentence in
its `title`. Below the strips, three blocks answer the questions a practitioner
asks: which instrument ranks above which, how they are related (with a real
example of each kind), and how many came into force in each year, with the
search date marked.

Everything is server-rendered HTML and SVG. There is no WebGL and no graphics
library to download — `three` and `@react-three/fiber` have left the
dependencies. Motion lives in CSS, pauses on hover, stops with a remembered
"Pause motion" button, and gives way to a hand-scrolled row when the system asks
for reduced motion. The strip is hidden from assistive technology and its cards
take no keyboard focus; a summary sentence stands in, and the same content is
readable in the index and on the map.

The other pages carry explicit illustrations instead of point clouds: a law with
its predecessor, amending law and implementing decrees for the map; a hierarchy
pyramid with real counts for the index; two pages of the same article, one line
struck and one inserted, for the comparison pages; a magnifier over a document
number with a checklist and a dated stamp for the method page. Each domain has a
line glyph, and each domain page replaces the old three-dimensional block with a
flat tree of instruments, one column per stratum of legal force, every node a
real keyboard-reachable link. The two-dimensional map keeps its mechanics and
now draws each stratum with its own shape: square for laws, diamond for
resolutions and consolidated texts, circle for decrees, triangle for circulars.

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
