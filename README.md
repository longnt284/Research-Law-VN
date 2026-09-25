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

Mười lĩnh vực: Xây dựng, Năng lượng, Hợp đồng thương mại, Tố tụng và Trọng tài,
Doanh nghiệp, Đầu tư, Lao động, Thuế, Đất đai và Bất động sản, Đối tác công tư.
Hai lĩnh vực sau cùng được thêm trong đợt rà soát ngày 24/9/2026, mỗi lĩnh vực
có cây văn bản riêng dựng từ các văn bản trụ cột đã đọc trên vbpl.vn.

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

Đợt rà soát ngày 24/9/2026 đọc lại toàn bộ văn bản Việt Nam trên Cơ sở dữ liệu
quốc gia về pháp luật (vbpl.vn), là nguồn ghi tình trạng hiệu lực bằng chữ kèm
ngày cập nhật. Ngày ban hành và ngày có hiệu lực còn thiếu được lấy từ Công báo
hoặc Cổng Thông tin điện tử Chính phủ. Bản ghi đọc được trang của chính văn bản
trên vbpl.vn được nâng lên `confidence: "verified"`, mang đường dẫn tới trang đó
và `verifiedOn: VERIFIED_2026_09_24`. Nhãn "Hết hiệu lực một phần" của vbpl.vn
ứng với trạng thái `amended`, nay hiển thị là "Còn hiệu lực, đã sửa đổi hoặc hết
hiệu lực một phần".

Khi hai nguồn nhà nước nói khác nhau, bản ghi không lặng lẽ chọn một bên: mâu
thuẫn được ghi trong trường `note` và hiển thị trên trang. Các trường hợp đã ghi
gồm Luật Bảo hiểm xã hội 41/2024/QH15 (vbpl.vn ghi hết hiệu lực toàn bộ nhưng
không tìm thấy văn bản thay thế), Luật Tổ chức Tòa án nhân dân 62/2014/QH13
(vbpl.vn vẫn ghi còn hiệu lực dù Luật 34/2024/QH15 đã chấm dứt hiệu lực của nó),
Luật Quản lý thuế 38/2019/QH14 (ngày hiệu lực trên vbpl.vn khác Công báo), và các
luật hết hiệu lực ngày 01/7/2026 mà nhãn trên vbpl.vn được cập nhật trước mốc đó.

Các nghị định thi hành Luật Xây dựng 2025 chưa có trang trên vbpl.vn được thêm
với ngày đối chiếu trên Công báo và điều khoản hiệu lực, chuyển tiếp đọc trên
toàn văn; chúng giữ `confidence: "cross-check"` cho tới khi đọc được tình trạng
hiệu lực từ nguồn nhà nước. Nhật ký rà soát từng văn bản không nằm trong kho mã;
nguồn của mỗi bản ghi là nơi lần lại.

## Hiệu lực tại một ngày và tra theo điều khoản

`src/lib/validity.ts` trả lời câu hỏi "tại ngày X, văn bản này còn hiệu lực
không" từ chính quan hệ trong tập dữ liệu: trước ngày có hiệu lực là chưa có
hiệu lực; từ ngày văn bản thay thế có hiệu lực là hết hiệu lực; từ ngày văn bản
sửa đổi có hiệu lực là còn hiệu lực nhưng phải đọc cùng văn bản sửa đổi. Luật sửa
đổi được ghi hết hiệu lực mà không có văn bản thay trực tiếp thì hết hiệu lực khi
luật mà nó sửa bị thay thế. Chỗ dữ liệu không đủ, hàm trả về "không xác định
được" thay vì đoán.

Trang văn bản hiện dòng thời gian các mốc đó và một ô chọn ngày. Ô chọn ngày nhận
các đoạn đã tính sẵn ở máy chủ (`validitySegments`, kiểu ở
`src/lib/validity-segment.ts`), nên trình duyệt không phải tải cả tập dữ liệu.
Danh mục văn bản nhận một ngày, gắn lại nhãn cho mọi bản ghi theo ngày đó, lọc
được văn bản đang có hiệu lực và đếm tổng.

Ô tìm kiếm của danh mục nhận số điều ("Điều 76", "Article 53"), có hoặc không kèm
số hiệu. Chỉ mục (`src/lib/articles.ts`) dựng từ các căn cứ có chỉ điểm tới điều
khoản trong `src/data/comparisons.ts`, tức chỉ những điều đã thực sự được đọc và
dẫn; kết quả dẫn thẳng tới điểm đối chiếu qua neo `#<mã điểm>`.

## Soát căn cứ pháp lý

Trang `/vi/soat-can-cu` nhận khối "Căn cứ…" của một hợp đồng, công văn hay đơn
do người đọc dán vào, cùng một ngày (mặc định là hôm nay). Mỗi số hiệu đọc được
trong đoạn văn được tra vào tập dữ liệu và nhận một trong sáu kết quả: đang có
hiệu lực, có hiệu lực nhưng đã sửa đổi (kèm văn bản sửa đổi đã có hiệu lực tại
ngày đó), chưa có hiệu lực, đã hết hiệu lực (kèm chuỗi thay thế tới văn bản
đang có hiệu lực), chưa xác định được, hoặc chưa có trong tập dữ liệu.

- Bộ đọc số hiệu (`src/lib/basis-check.ts`) nhận dạng số/năm/cơ quan
  (`91/2015/QH13`, `15/2021/NĐ-CP`) và số hiệu không có năm (`768/QĐ-TTg`),
  bất kể chữ Đ gõ bằng ký tự nào, gạch nối hay gạch ngang, có số 0 đứng đầu
  hay không. Số của chính hợp đồng (`…/HĐ…`) bị bỏ qua. Số hiệu không theo
  khuôn đó (`CISG 1980`, `Quy tắc VIAC 2026`) được so nguyên văn. Cổng chặn của
  kho văn bản so số hiệu sau khi chuẩn hóa, nên hai bản ghi không thể mang hai
  cách viết của cùng một số hiệu.
- Dòng nêu tên văn bản mà không có số hiệu không được đoán ra văn bản nào, vì
  tên lặp lại qua các đời luật; trang liệt kê riêng các dòng đó.
- Số hiệu không có trong tập dữ liệu được ghi là chưa có dữ liệu, không phải là
  sai. Khi tập dữ liệu có số hiệu cùng số, cùng năm và cùng nhóm cơ quan, trang
  gợi ý số hiệu đó.
- Bản ghi cần đối chiếu thêm, hoặc mang lưu ý về hiệu lực (hiệu lực từng
  phần, chuyển tiếp, hai nguồn nhà nước ghi khác nhau), được đánh dấu ngay trên
  dòng kết quả kèm liên kết tới trang văn bản: phép soát không tự đọc lưu ý đó.
- Tình trạng tại ngày dùng đúng phép tính của `src/lib/validity.ts`. Máy chủ
  dựng sẵn các đoạn hiệu lực cho từng văn bản (`src/lib/basis-rows.ts`); trình
  duyệt chỉ tìm đoạn chứa ngày được chọn.
- Đoạn văn người đọc dán vào chỉ được xử lý trong trình duyệt: không lưu vào bộ
  nhớ trình duyệt, không gửi đi. Chính sách `connect-src 'self'` và việc không
  có mã theo dõi nào là lý do lời hứa đó giữ được.
- Nút "Sao chép kết quả" cho ra một bản chữ thường, dán được vào bản ghi nhớ.
  Đoạn mẫu trên trang dựng từ tên và số hiệu trong tập dữ liệu, không viết tay.

## Chia sẻ và công cụ tìm kiếm

Trang văn bản mang một khối JSON-LD kiểu `Legislation` của schema.org: số hiệu,
loại, ngày ban hành, tình trạng hiệu lực kèm ngày tra cứu
(`legislationLegalForce`, `legislationDateVersion`), quan hệ sửa đổi
(`legislationAmends`) và thay thế (`legislationChanges`), cùng đường dẫn tới
trang của văn bản trên vbpl.vn (`sameAs`). Trạng thái `amended` không được ánh
xạ, vì nó gộp hai trường hợp mà schema.org tách riêng. Trang văn bản và trang
đối chiếu còn mang dòng vị trí `BreadcrumbList`. Xem `src/lib/structured-data.ts`.

Mỗi trang đặt thẻ Open Graph và Twitter của riêng nó (`shareMeta` trong
`src/lib/site.ts`). Mỗi văn bản, mỗi cặp đối chiếu và trang soát căn cứ có ảnh
chia sẻ riêng, dựng lúc `next build` bằng `next/og`: số hiệu, tên, tình trạng
hiệu lực và ngày tra cứu lấy thẳng từ bản ghi. Trang khác dùng ảnh mặc định mang
tên trang và các con số của tập dữ liệu. Ảnh dùng Lora và Be Vietnam Pro ở dạng
TTF tĩnh trong `src/og/fonts`, kèm giấy phép SIL Open Font License của từng
phông.

Trang văn bản và trang đối chiếu có nút chia sẻ: trên điện thoại là bảng chia sẻ
của hệ điều hành (gửi thẳng sang Zalo, Messenger, email), trên máy tính là nút
sao chép đường dẫn, kèm hai liên kết thường tới Facebook và LinkedIn. Không có
đoạn mã nào của bên thứ ba được nạp.

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
  app/[lang]/soat-can-cu/   # soát căn cứ pháp lý
  app/[lang]/**/opengraph-image.tsx # ảnh chia sẻ dựng lúc build
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
  lib/basis-check.ts        # đọc số hiệu và chuỗi thay thế cho soát căn cứ
  lib/structured-data.ts    # JSON-LD Legislation và BreadcrumbList
  og/                       # khung ảnh chia sẻ và phông TTF kèm giấy phép
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
each pair side by side, in five separate layers: pairs derived from the
`replaces` and `amends` relations; a table of facts and notes computed from the
two records; content comparison points written by an editor, each citing the
record or provision it was read from; a lexical check that scans every string in
the comparison layer for advisory, evaluative or speculative language and fails
the build on a single hit; and lineages that string replacements and amendments
into one timeline. An observation there describes only the difference that
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

The dataset covers ten domains; Land & Real Estate and Public-Private
Partnership were added in the review of 24 September 2026. In that review every
Vietnamese instrument was read again on the National Legal Database (vbpl.vn),
which states each instrument's status in words with the date it was last
updated; missing dates came from the Official Gazette or the Government portal.
Records whose own vbpl.vn page was read are marked `verified`. Where two official
sources disagree, the conflict is stated in the record's note rather than
resolved silently. New construction decrees not yet on vbpl.vn were added with
Gazette dates and their commencement and transitional articles read in full,
and stay at `cross-check` until their status can be read from an official
source.

`src/lib/validity.ts` answers whether an instrument was in force on a given
date, using only the relations in the dataset, and says "cannot be determined"
where the data is not enough. Each document page shows a dated timeline and a
date picker; the document index re-labels every record for a chosen date and can
hide what was not in force. The index search also takes article numbers
("Article 53", "Điều 76") and lists every comparison point that cites that
article, from an index built only of provisions actually read.

The legal basis check at `/en/soat-can-cu` takes the "Pursuant to…" recitals
of a contract, letter or application and a date. It reads every document number
out of the pasted text — however the letter Đ was typed, with a hyphen or a
dash, with or without a leading zero — and reports each instrument's status on
that date by the same rule as the date picker: in force, amended (with the
amending instruments already in force), not yet in force, or no longer in force
with the replacement chain up to the instrument in force. A number outside the
dataset is reported as having no data, never as wrong, and a line that names an
instrument without a number is listed rather than guessed. The pasted text is
processed in the browser only and is neither stored nor sent.

Each document page carries schema.org `Legislation` JSON-LD (number, type, date
of issue, legal force as at the review date, amendment and replacement
relations, and the vbpl.vn page as `sameAs`). Every page sets its own Open Graph
and Twitter tags, and every instrument, comparison pair and the basis-check page
has its own preview image rendered at build time with `next/og` from the record
itself. Document and pair pages have share controls: the operating system's
share sheet on phones, copy-link on desktops, and plain links to Facebook and
LinkedIn; no third-party script is loaded.

To deploy, set `NEXT_PUBLIC_SITE_URL` to the site's origin. Canonical tags,
hreflang tags and `sitemap.xml` all need absolute addresses, and that address
cannot be derived from the source. On Vercel the platform's
`VERCEL_PROJECT_PRODUCTION_URL` is used when the variable is unset; with neither,
the build falls back to `http://localhost:3000`.
