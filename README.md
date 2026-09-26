# Lex & Lineage — Gia phả văn bản pháp luật Việt Nam

Công cụ tra cứu dòng dõi của các văn bản quy phạm pháp luật Việt Nam. Mỗi văn
bản được trình bày như một người trong cuốn gia phả: đời trước (văn bản nó thay
thế), đời sau (văn bản thay thế nó), các nhánh hướng dẫn (nghị định, thông tư
quy định chi tiết nó), văn bản cấp trên mà nó hướng dẫn, và những lần được sửa
đổi, bổ sung. Mỗi vai ứng đúng một quan hệ có thật trong bản ghi: quy định chi
tiết, sửa đổi bổ sung, hoặc thay thế.

Lời hứa của sản phẩm: **tra cứu hiệu lực, theo dấu sửa đổi, hiểu toàn bộ dòng
đời của pháp luật Việt Nam.** Muốn đọc toàn văn thì có nhiều cơ sở dữ liệu pháp
luật; muốn biết một văn bản đứng ở đâu trong hệ thống, đã thay đổi thế nào và áp
dụng tại thời điểm nào thì mở Lex & Lineage.

Trang có hai phiên bản đầy đủ, tiếng Việt tại `/vi` và tiếng Anh tại `/en`.

## Tên và dấu hiệu

Tên trang là **Lex & Lineage**: *lex* là luật trong tiếng La-tinh, *lineage* là
dòng dõi. Hai chữ nối bằng dấu "&" như tên một văn phòng luật, và dòng định
danh đi kèm là "Gia phả văn bản pháp luật Việt Nam" / "The genealogy of
Vietnamese law".

Dấu hiệu (`src/components/brand/BrandMark.tsx`) là một cán cân mà trụ đỡ mọc
thành rễ cây: nửa trên là luật, nửa dưới là gia phả, ba rễ kết thúc bằng ba nút
tròn như ba đời văn bản đứng trước. Có hai dạng cùng một hình học:

- `seal`: huy hiệu lớn ở đầu trang chủ. Nền tròn màu mực, viền đôi có vành hạt,
  tên trang chạy theo vòng cung, hai nhánh nguyệt quế, nét vàng lá có ánh kim.
  Nét được vẽ dần một lần khi trang mở; một vệt sáng lướt chậm qua mặt dấu.
- `badge`: dấu nhỏ ở thanh điều hướng và chân trang, bỏ chữ và nguyệt quế, nét
  dày gấp đôi để còn đọc được ở cỡ ba mươi điểm ảnh.

`src/app/icon.svg` là dạng `badge` xuất ra tệp tĩnh, và ảnh chia sẻ đọc đúng
tệp đó, nên biểu tượng tab, ảnh chia sẻ và dấu trên trang là một hình.

## Trang chủ: dùng trước, giải thích sau

Người quay lại trang phải tra được một văn bản trong vài giây, không phải đọc
phần giới thiệu trước. Thứ tự trang chủ vì vậy là:

1. **Phần đầu**: câu khẩu hiệu "Mỗi văn bản pháp luật đều có một gia phả.", lời
   hứa của sản phẩm và **ô tìm kiếm lớn** — thứ lớn nhất trên màn hình đầu tiên.
   Dưới ô là bốn lối tắt: kiểm tra hiệu lực, xem gia phả, so sánh văn bản, luật
   tại một thời điểm. Bên phải là một dòng đời văn bản có thật, dựng từ gia phả
   tiêu biểu (`src/lib/hero-lineage.ts`): rê chuột vào một văn bản thì quan hệ
   của nó sáng lên; khi đã đặt ngày tra cứu, văn bản không có hiệu lực vào ngày
   đó nhạt đi.
2. **Bạn muốn làm gì?** Bốn ô công cụ mang dữ liệu thật: ba văn bản ở ba tình
   trạng khác nhau (chọn bằng phép lọc, không viết tay), dòng dõi của gia phả
   tiêu biểu, bản đối chiếu mới nhất đã có điểm nội dung, và ô chọn ngày.
3. **Thay đổi gần đây** (`src/lib/changes.ts`): mốc hiệu lực, sửa đổi, thay thế,
   hướng dẫn đọc từ bản ghi, chia "sắp có hiệu lực" và "đã diễn ra" theo ngày
   tra cứu gần nhất của kho.
4. **Khám phá theo lĩnh vực**: mười lĩnh vực, thanh đếm số văn bản thật.
5. **Gia phả tiêu biểu** và các chuỗi văn bản đang động.
6. **Phạm vi dữ liệu**: số văn bản, quan hệ, cặp đối chiếu, lĩnh vực, và tỷ lệ
   bản ghi đã đối chiếu nguồn chính thống.
7. **Cách Lex & Lineage hoạt động**: ba khối giải thích cũ — thứ bậc hiệu lực, ba
   mối quan hệ, trục thời gian — nay nằm dưới phần công cụ.
8. **Độ tin cậy**: nguyên tắc dữ liệu, dẫn tới trang phương pháp và trang góp ý.

Nút "Dừng chuyển động" chuyển xuống chân trang và áp cho cả trang.

## Tra cứu, bảng lệnh và "pháp luật tại ngày"

**Chỉ mục tìm kiếm** (`src/lib/search-index.ts`) dựng lúc build thành tệp tĩnh
`/vi/search-index.json` và `/en/search-index.json`: số hiệu, tên hai thứ tiếng,
tóm tắt, tình trạng, các mốc, đoạn hiệu lực tính sẵn, quan hệ, trang toàn văn.
Tệp chỉ được tải khi người đọc chạm vào ô tìm (khoảng 30 kB sau nén), nên trang
mở ra không mang theo nó.

**Bộ máy tìm** (`src/lib/search-engine.ts`) chạy trên trình duyệt, đọc câu tìm
theo năm lớp: ngày (`01/05/2024`), điều khoản (`Điều 76`), ý định (thay thế, sửa
đổi, hướng dẫn, còn hiệu lực), số hiệu hoặc phần số hiệu (`58/2025`, `Nghị định
58`), rồi chữ còn lại (bỏ dấu, mọi từ phải khớp). Câu tìm nhắm đúng một văn bản
thì kết quả mở đầu bằng **khối trả lời có cấu trúc**: tình trạng tại ngày được
hỏi, văn bản thay thế, văn bản sửa đổi, số văn bản hướng dẫn, kèm nút xem gia
phả, so sánh, toàn văn. Không có câu văn nào được sinh ra; chỗ dữ liệu không ghi
nhận thì nói là chưa ghi nhận. Câu tìm có ngày thì văn bản đang có hiệu lực vào
ngày đó lên trước.

**Bảng lệnh** mở bằng Ctrl K, ⌘ K hoặc phím `/` ở mọi trang
(`src/components/search/CommandPalette.tsx`, chỉ tải khi mở lần đầu): văn bản,
điều khoản, trang, lĩnh vực, văn bản vừa xem, văn bản đang theo dõi, và các thao
tác đặt ngày tra cứu, đổi nền, đổi ngôn ngữ, báo lỗi dữ liệu.

**Pháp luật tại ngày**: một ngày tra cứu dùng chung cho cả trang, giữ trong
`sessionStorage` và trên địa chỉ trang (`?ngay=2024-05-01`, nên đường dẫn gửi đi
mở ra đúng ngày). Khi đã đặt, dải dưới thanh điều hướng luôn nhắc ngày đó kèm
nút bỏ; ô tìm, bảng lệnh, danh mục, phần đầu trang văn bản và hình gia phả đều
tính tình trạng theo ngày ấy. Bấm vào một mốc trên dòng thời gian hiệu lực là
xem pháp luật tại đúng mốc đó.

**Trạng thái hiệu lực** có một hệ nhãn chung (`src/components/legal/LegalStatus.tsx`):
mỗi tình trạng nói bằng chữ, hình biểu tượng (● ◐ ◌ ⊘ ?), kiểu viền và độ đậm
của chữ; màu chỉ đi kèm. Rê chuột lên nhãn đọc được lời giải thích.

## Gia phả của một văn bản

`src/lib/family.ts` dựng gia phả của một văn bản từ chính trường quan hệ của các
bản ghi, không vai nào được suy đoán:

| Vai trong gia phả | Quan hệ trong bản ghi |
| --- | --- |
| Đời trước | văn bản này `replaces` văn bản kia |
| Đời sau | văn bản kia `replaces` văn bản này |
| Văn bản cấp trên | văn bản này `guides` văn bản kia |
| Nhánh hướng dẫn | văn bản kia `guides` văn bản này |
| Được sửa đổi bởi | văn bản kia `amends` văn bản này |
| Văn bản này sửa đổi | văn bản này `amends` văn bản kia |

Đời trước và đời sau đi tiếp tối đa ba đời; nhánh hướng dẫn đi thêm một bậc
(thông tư hướng dẫn nghị định hướng dẫn luật).

Trang của mỗi văn bản có hai cách đọc cùng gia phả (`src/components/FamilyTree.tsx`):

- **Hình**: dòng kế tục nằm ngang ở giữa, đời trước bên trái, đời sau bên phải;
  văn bản cấp trên và các quan hệ sửa đổi ở trên; nhánh hướng dẫn ở dưới, tối đa
  bốn nhánh một hàng, nối về văn bản đang xem bằng một thân dọc. Bố cục tính sẵn,
  tất định. Mỗi văn bản là một liên kết thật dùng được bằng bàn phím. Hình chỉ
  hiện từ cỡ máy tính bảng.
- **Phả ký**: cùng gia phả viết thành danh sách có tiêu đề cho từng vai, tên văn
  bản đầy đủ không cắt. Đây là bản đọc trên điện thoại và bằng trình đọc màn hình.

Ba kiểu nét dùng chung ở mọi hình: nét liền cho quy định chi tiết, nét đứt cho
sửa đổi bổ sung, chấm đỏ cho thay thế; mũi tên luôn chỉ vào văn bản bị tác động.

## Trang văn bản: bảng điều khiển

Phần đầu trang văn bản trả lời ngay: văn bản nào, còn hiệu lực không, từ ngày
nào (và bị văn bản nào thay nếu đã hết hiệu lực), ngày ban hành, ngày hiệu lực,
ngày kiểm tra dữ liệu, mức xác minh. Dưới đó là **thanh thao tác dính** khi cuộn:
theo dõi, lưu vào bộ hồ sơ, so sánh, sao chép trích dẫn, chia sẻ, xuất (in hoặc
lưu PDF, sao chép bản tóm tắt, tải bản ghi JSON) và báo lỗi.

Thân trang mở bằng **dải đời trước · đang xem · đời sau** để đi ngược xuôi qua
các đời văn bản, cùng các quan hệ trực tiếp (được sửa đổi bởi, được hướng dẫn
bởi, văn bản cấp trên). Ô nào không có dữ liệu thì nói "chưa ghi nhận" kèm nút
báo thiếu văn bản. Cột bên có khối **nguồn và kiểm chứng**: nguồn chính, ngày
kiểm tra lần cuối, số nguồn đã mở; dấu kiểm chỉ hiện khi bản ghi đã đối chiếu
và có nguồn chính thống.

Hình gia phả nằm trong **khung có điều khiển** (`src/components/lineage/GraphViewport.tsx`):
phóng to, thu nhỏ, vừa khung, cỡ thật, kéo để di chuyển, Ctrl + con lăn để
phóng, thu gọn nhánh hướng dẫn, và rê chuột vào một văn bản để tô các quan hệ
của nó. Hình vẫn là SVG dựng ở máy chủ; khung chỉ đổi phép biến hình. Trên điện
thoại phả ký bằng chữ là bản đọc mặc định, hình mở bằng một nút.

Thẻ mô tả cho công cụ tìm kiếm (`src/lib/doc-brief.ts`) nói tình trạng kèm ngày
tra cứu và dòng dõi trước, tóm tắt sau.

## Đối chiếu có điều khiển

Trang cặp đối chiếu có ba cách xem: **Tổng quan** (số điểm đối chiếu theo loại
thay đổi, đếm từ các điểm đã viết, kèm mục lục các điểm), **Chỉ điểm thay đổi**
(bỏ các điểm "nội dung tương đương") và **Toàn bộ** (điểm tương đương thu gọn,
mở được). Có ô tìm trong bản đối chiếu, nút nổi đi tới điểm trước / sau (phím J
/ K), chọn vế hiển thị trên điện thoại, sao chép cả bản đối chiếu và in. Số liệu
tổng quan chỉ đếm điểm đối chiếu đã viết; trang không tính "số điều khoản thay
đổi" vì tập dữ liệu không chứa toàn văn.

## Thay đổi, Theo dõi, Góp ý dữ liệu

- `/thay-doi`: mọi mốc đọc được từ tập dữ liệu, nhóm theo tháng, lọc theo loại
  bằng HTML và CSS thuần.
- `/theo-doi`: văn bản đang theo dõi (kèm các mốc đổi tình trạng kể từ ngày bắt
  đầu theo dõi), bộ hồ sơ và văn bản vừa xem. Tất cả lưu trong trình duyệt
  (`src/lib/client-store.ts`), không có tài khoản, không gửi đi đâu; khi có tài
  khoản chỉ cần thay phần đọc ghi ở tệp đó.
- `/gop-y`: báo thiếu / sai dữ liệu (sáu loại vấn đề) và yêu cầu bổ sung văn
  bản. Không có máy chủ nhận thư, nên nút gửi soạn sẵn email tới địa chỉ liên
  hệ đang dùng; có nút sao chép khi máy không có ứng dụng email.

Trang phương pháp có thêm các mục **phạm vi dữ liệu** (lĩnh vực × tầng hiệu lực
× mức xác minh), **nguồn dữ liệu**, **nhật ký dữ liệu** (các đợt tra cứu và số
bản ghi mỗi đợt), **báo lỗi và sửa dữ liệu**, **quyền riêng tư** — mọi con số
đếm thẳng từ tập dữ liệu. Chân trang chia bốn cột: sản phẩm, dữ liệu, pháp lý,
liên hệ.

## Tài khoản người dùng

Tài khoản là tùy chọn: mọi công cụ dùng được khi chưa đăng nhập, dữ liệu khi
ấy nằm trong trình duyệt. Có tài khoản thì văn bản đang theo dõi và bộ hồ sơ
đi theo người dùng trên mọi máy.

Backend là Supabase, không có máy chủ riêng:

- **Supabase Auth**: tạo tài khoản bằng email và mật khẩu, xác nhận email, quên
  mật khẩu, đổi mật khẩu.
- **Hai bảng** trong `supabase/migrations/20260926090000_user_accounts.sql`:
  `follows` (văn bản theo dõi, ngày bắt đầu theo dõi) và `matters` (bộ hồ sơ).
  Không bảng nào chép dữ liệu văn bản; mọi thứ nối với tập dữ liệu qua mã văn
  bản. Row Level Security bật trên cả hai: mỗi người chỉ đọc, ghi được hàng của
  mình, nên trình duyệt gọi thẳng cơ sở dữ liệu bằng khóa công khai.
- **Hàm `delete_my_account()`** cho người dùng tự xóa vĩnh viễn tài khoản; mọi
  hàng của họ xóa theo. Hàm chạy `security definer` nhưng chỉ xóa đúng người
  đang gọi (trình kiểm tra bảo mật của Supabase có cảnh báo chung cho kiểu hàm
  này; ở đây là chủ ý).

Phía trang (`src/lib/account.ts`, `src/components/account/`): trang
`/vi/tai-khoan` để đăng ký, đăng nhập, đổi mật khẩu, đăng xuất, xóa tài khoản;
nút tài khoản trên thanh điều hướng. Thư viện Supabase chỉ tải khi mở trang tài
khoản hoặc khi trình duyệt có phiên đăng nhập. Lần đầu đăng nhập trên một trình
duyệt, dữ liệu đã lưu trước đó được gộp vào tài khoản; những lần sau máy chủ là
bản gốc. Đăng xuất xóa danh sách theo dõi và bộ hồ sơ khỏi trình duyệt.

Biến môi trường (cả hai công khai, đã đặt trên Vercel):

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable key>
```

Thiếu hai biến thì tài khoản tự tắt, trang vẫn chạy như trước. Địa chỉ
Supabase được thêm vào `connect-src` của Content-Security-Policy.

Cấu hình cần làm trong bảng điều khiển Supabase (Authentication):

1. **URL Configuration**: Site URL là địa chỉ trang thật; thêm
   `https://<tên-miền>/**` vào Redirect URLs, để liên kết xác nhận email và
   đặt lại mật khẩu quay về `/vi/tai-khoan`.
2. **SMTP**: dịch vụ email mặc định của Supabase chỉ gửi tới thành viên của tổ
   chức và giới hạn vài email mỗi giờ. Để người ngoài đăng ký được, cấu hình
   SMTP riêng (Resend, SendGrid, Amazon SES…), hoặc tắt "Confirm email".

## Toàn văn và nguồn tra cứu

Người đọc chính của trang là pháp chế doanh nghiệp và luật sư, nên câu hỏi về một
đường dẫn nguồn là "có viện dẫn được không". `src/lib/sources.ts` xếp mỗi nguồn
vào một trong bốn loại, suy ra từ chính địa chỉ chứ không ghi tay trong bản ghi:
nguồn chính thống (cổng của cơ quan nhà nước, vbpl.vn, Công báo), tổ chức ban
hành (VIAC, ICC cho quy tắc của chính họ), cơ sở dữ liệu pháp luật (trang văn bản
trên Thư Viện Pháp Luật, LuatVietnam…) và bài viết tham khảo.

Dưới tên văn bản có nút "Đọc toàn văn", trỏ tới trang toàn văn có thứ hạng cao
nhất: vbpl.vn, rồi Công báo, rồi Cổng Thông tin điện tử Chính phủ. Bản ghi không
có trang nào chứa toàn văn thì không có nút, thay vì dẫn tới một bài tin. Ngay
sau phần tóm tắt là danh sách đầy đủ các nguồn, mỗi nguồn một ô ghi tên trang,
tên miền và loại nguồn, nguồn chính thống xếp trước. Bản ghi không có nguồn
chính thống nào hiện lời nhắc đối chiếu số hiệu trước khi viện dẫn.

## Hình minh họa ở các trang

Hình ở đầu mỗi trang và trên thẻ lối vào trang chủ vẽ đúng vật mà trang đó làm
việc cùng (`src/components/art/PageArt.tsx`): danh mục là tháp thứ bậc với số văn bản thật mỗi tầng; đối chiếu là hai trang cùng một điều
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

## Chia sẻ và công cụ tìm kiếm

Trang văn bản mang một khối JSON-LD kiểu `Legislation` của schema.org: số hiệu,
loại, ngày ban hành, tình trạng hiệu lực kèm ngày tra cứu
(`legislationLegalForce`, `legislationDateVersion`), quan hệ sửa đổi
(`legislationAmends`) và thay thế (`legislationChanges`), cùng đường dẫn tới
trang của văn bản trên vbpl.vn (`sameAs`). Trạng thái `amended` không được ánh
xạ, vì nó gộp hai trường hợp mà schema.org tách riêng. Trang văn bản và trang
đối chiếu còn mang dòng vị trí `BreadcrumbList`. Xem `src/lib/structured-data.ts`.

Mỗi trang đặt thẻ Open Graph và Twitter của riêng nó (`shareMeta` trong
`src/lib/site.ts`). Mỗi văn bản và mỗi cặp đối chiếu có ảnh chia sẻ riêng, dựng
lúc `next build` bằng `next/og`: số hiệu, tên, tình trạng hiệu lực và ngày tra
cứu lấy thẳng từ bản ghi. Trang khác dùng ảnh mặc định mang dòng định danh, câu
khẩu hiệu và các con số của tập dữ liệu. Mọi ảnh mang dấu hiệu ở góc trên, đọc
thẳng từ `src/app/icon.svg`. Ảnh dùng Lora và Be Vietnam Pro ở dạng
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
   luôn khớp với gia phả văn bản.
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

Bản đồ tương tác (`/ban-do`) và trang soát căn cứ pháp lý (`/soat-can-cu`) đã
được gỡ khi trang đổi sang ý tưởng gia phả. Đường dẫn cũ chuyển hướng vĩnh viễn
tới trang đang làm đúng việc gần nhất: bản đồ tới cây văn bản theo lĩnh vực,
soát căn cứ tới danh mục có ô chọn ngày hiệu lực. Xem `next.config.ts`.

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
  app/[lang]/page.tsx       # trang chủ: ô tìm, công cụ, thay đổi, khám phá, giải thích
  app/[lang]/search-index.json/ # chỉ mục tìm kiếm tĩnh của từng thứ tiếng
  app/[lang]/thay-doi/      # dòng thay đổi của cả kho
  app/[lang]/theo-doi/      # theo dõi, bộ hồ sơ, vừa xem (lưu trong trình duyệt)
  app/[lang]/gop-y/         # báo lỗi dữ liệu, yêu cầu bổ sung văn bản
  app/product.css           # kiểu dáng của lớp sản phẩm
  app/icon.svg              # dấu hiệu dạng nhỏ, dùng cho tab và ảnh chia sẻ
  app/[lang]/**/opengraph-image.tsx # ảnh chia sẻ dựng lúc build
  app/sitemap.ts            # sitemap sinh từ tập dữ liệu
  app/robots.ts             # robots.txt
  components/               # danh mục, các mảnh giao diện dùng lại
  components/brand/         # dấu hiệu Lex & Lineage và tên dạng chữ
  components/FamilyTree.tsx # hình gia phả và phả ký của một văn bản
  components/home/          # phần đầu, công cụ, gia phả tiêu biểu, ba khối giải thích
  components/search/        # ô tìm, bảng lệnh, hiển thị kết quả
  components/legal/         # nhãn trạng thái, thanh thao tác văn bản
  components/lineage/       # dải đời trước / đời sau, khung xem gia phả
  components/compare/       # lớp điều khiển của bản đối chiếu
  components/trust/         # khối nguồn và kiểm chứng, mẫu góp ý dữ liệu
  components/art/           # hình minh họa đầu trang và biểu tượng lĩnh vực
  components/DomainTree.tsx # cây văn bản của một lĩnh vực
  components/DomainSpark.tsx # vệt bốn tầng của một lĩnh vực
  data/                     # tập dữ liệu văn bản và kiểu dữ liệu
  i18n/                     # từ điển giao diện hai thứ tiếng
  lib/corpus.ts             # thang thứ bậc và các con số dùng chung
  lib/family.ts             # gia phả của một văn bản và bố cục hình gia phả
  lib/tree.ts               # bố cục cây văn bản của một lĩnh vực
  lib/compare.ts            # ghép cặp và tính dữ kiện đối chiếu
  lib/objectivity.ts        # phép kiểm tính khách quan, chạy khi dựng trang
  lib/diff.ts               # so sánh cơ học hai đoạn văn bản
  lib/structured-data.ts    # JSON-LD Legislation và BreadcrumbList
  lib/search-index.ts       # dựng chỉ mục tìm kiếm lúc build
  lib/search-engine.ts      # bộ máy tìm chạy trên trình duyệt
  lib/client-store.ts       # theo dõi, vừa xem, bộ hồ sơ, ngày tra cứu
  lib/changes.ts            # dòng thay đổi của cả kho
  lib/account.ts            # tài khoản Supabase và đồng bộ theo dõi, bộ hồ sơ
  app/[lang]/tai-khoan/     # đăng ký, đăng nhập, đổi mật khẩu, xóa tài khoản
supabase/migrations/        # bảng follows, matters, RLS, hàm xóa tài khoản
  og/                       # khung ảnh chia sẻ và phông TTF kèm giấy phép
  lib/site.ts               # địa chỉ gốc, canonical và khai báo bản dịch
references/                 # thư viện đã khảo sát, và lý do dùng hay loại
```

## Miễn trừ trách nhiệm

Lex & Lineage là công cụ tra cứu dành cho pháp chế doanh nghiệp và luật sư. Nội
dung chỉ để tham khảo: không phải ý kiến pháp lý, không thay thế tư vấn cho một
vụ việc cụ thể và không tạo lập quan hệ luật sư với khách hàng. Trước khi viện
dẫn trong hợp đồng, ý kiến pháp lý hay hồ sơ gửi cơ quan nhà nước, hãy đối chiếu
nguyên văn trên Công báo, Cơ sở dữ liệu quốc gia về pháp luật hoặc với cơ quan
ban hành.

## Liên hệ

Điện thoại: 0941 563 789 · Email: longnt284.lawyer@gmail.com

---

# Lex & Lineage — The genealogy of Vietnamese law

A reference tool for tracing the line of descent of Vietnam's legal
instruments. Each instrument is presented the way a family register presents a
person: its predecessors (what it replaced), its successors (what replaced it),
its implementing branches (the decrees and circulars that detail it), the parent
instrument it implements, and the amendments written into it. Every role
corresponds to exactly one relation recorded in the entry — detailing,
amending, or replacing. Fully available in Vietnamese at `/vi` and English at
`/en`.

The product promise: check validity, trace amendments, understand the whole
life of Vietnamese law. The home page now puts a large search box first; search
reads numbers, articles, dates and questions ("Which decree replaced Decree
15/2021?") and answers a targeted query with a structured card built from the
dataset alone. Ctrl K / ⌘ K opens a command palette on every page. A shared
"law as of" date (`?ngay=`) recomputes every status in search, the index, the
instrument header and the lineage drawing. Instrument pages open as a control
panel with a sticky action bar (follow, save to a matter, compare, cite, share,
export, report), a predecessor / successor strip and a source-and-verification
panel; the lineage drawing sits in a zoomable, pannable frame. Comparison pages
offer overview / changes-only / everything modes with next / previous
navigation. New pages: `/thay-doi` (changes), `/theo-doi` (watchlist, stored in
the browser) and `/gop-y` (data corrections and requests, sent via the reader's
own email app).

The name joins *lex*, Latin for law, and *lineage*. The mark
(`src/components/brand/BrandMark.tsx`) is a pair of scales whose pillar grows
into roots ending in three nodes, one for each earlier generation: law above,
lineage below. It comes as a large seal for the home page — an ink field, a
beaded double rim, the name set on an arc, laurel sprigs and gold-leaf lines
that draw themselves once — and as a compact badge for the header, footer,
favicon (`src/app/icon.svg`) and share images.

The home page opens with the motto "Every law has a lineage" and the search
box, then four working tools, recent changes, domains, one real lineage (the
largest in the dataset around an instrument still in force, chosen by count in
`src/lib/family.ts`) and data coverage. The three explanatory blocks — which
instrument ranks above which, the three ties of a lineage, and how many
instruments came into force in each year — now sit below the tools, and the
seal closes the page in the reliability section.

Every instrument page draws its own lineage (`src/components/FamilyTree.tsx`):
predecessors to the left, successors to the right, parent and amending
instruments above, implementing branches below, from a deterministic
server-side layout in which every instrument is a keyboard-reachable link. A
written register says the same thing in words with full titles; it is the only
version on phones, where the drawing would be wider than the screen. A solid
line details, a dashed line amends, red dots replace, and the arrow always
points at the instrument acted upon.

The site is written for in-house legal teams and practising lawyers, for whom
the question about a source link is whether it can be cited.
`src/lib/sources.ts` sorts every source into one of four kinds, derived from
the address itself rather than typed into the record: official source (state
portals, vbpl.vn, the Official Gazette), issuing body (VIAC and ICC for their
own rules), legal database (document pages on Thu Vien Phap Luat, LuatVietnam
and similar) and commentary or news. Under the title of each instrument a
"Read the full text" button opens the highest-ranked full-text page: vbpl.vn,
then the Gazette, then the Government portal. A record with no full-text page
gets no button rather than a link to a news item. The complete list follows the
summary, one card per source with site name, domain and kind, official sources
first; a record with no official source carries a reminder to check the number
before citing it.

The interactive map (`/ban-do`) and the legal basis check (`/soat-can-cu`) were
removed with the move to the lineage concept. Their old addresses redirect
permanently to the domain trees and to the document index with its date
picker.

Everything is server-rendered HTML and SVG with no graphics library to
download. Motion lives in CSS, stops with a remembered "Pause motion" button,
and is skipped when the system asks for reduced motion.

The other pages carry explicit illustrations: a hierarchy pyramid with real
counts for the index; two pages of the same article, one line struck and one
inserted, for the comparison pages; a magnifier over a document number with a
checklist and a dated stamp for the method page. Each domain has a line glyph,
and each domain page carries a flat tree of instruments, one column per stratum
of legal force, every node a real keyboard-reachable link.

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

Each document page carries schema.org `Legislation` JSON-LD (number, type, date
of issue, legal force as at the review date, amendment and replacement
relations, and the vbpl.vn page as `sameAs`). Every page sets its own Open Graph
and Twitter tags, and every instrument and comparison pair has its own preview
image rendered at build time with `next/og` from the record itself, with the
mark read from `src/app/icon.svg`. Document and pair pages have share controls: the operating system's
share sheet on phones, copy-link on desktops, and plain links to Facebook and
LinkedIn; no third-party script is loaded.

To deploy, set `NEXT_PUBLIC_SITE_URL` to the site's origin. Canonical tags,
hreflang tags and `sitemap.xml` all need absolute addresses, and that address
cannot be derived from the source. On Vercel the platform's
`VERCEL_PROJECT_PRODUCTION_URL` is used when the variable is unset; with neither,
the build falls back to `http://localhost:3000`.
