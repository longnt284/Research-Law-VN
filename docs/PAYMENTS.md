# Thanh toán và lượt Pro

Người dùng đã đăng nhập mua **lượt Pro** cho trợ lý hỏi đáp bằng chuyển khoản
ngân hàng qua mã VietQR của [payOS](https://payos.vn). Tiền vào tài khoản thì
lượt được cộng tự động, không cần ai duyệt tay. MoMo chưa được tích hợp ở giai
đoạn này.

## Kiến trúc

```text
Trang Tài khoản (BillingPanel)
  │ POST /api/payments/create { planId, provider: "payos", lang }
  ▼
Máy chủ: xác minh phiên Supabase → lấy giá từ src/lib/plans.ts
  → tạo đơn PENDING (orders) → gọi payOS tạo link → lưu mã link, QR
  ▼
Trình duyệt hiện QR, hỏi GET /api/payments/status/:orderId mỗi 3 giây
  │
Người dùng chuyển khoản ──► payOS ──► POST /api/webhooks/payos
                                       │ kiểm chữ ký HMAC-SHA256 (Checksum Key)
                                       ▼
                     confirm_payos_payment() trong Postgres, một giao dịch:
                     khóa đơn → đối chiếu nhà cung cấp, số tiền, tiền tệ, mã link
                     → đơn PAID → sổ cái +lượt → số dư +lượt
  ▼
Lần hỏi trạng thái kế tiếp thấy PAID → trang báo thành công, nạp lại số dư
```

Nguồn xác nhận duy nhất là webhook payOS có chữ ký hợp lệ. Trang payOS chuyển
người dùng về (`returnUrl`, `cancelUrl`) chỉ dùng để biết theo dõi đơn nào; nó
không đổi trạng thái đơn. Trình duyệt không đọc, ghi thẳng ba bảng thanh toán:
mọi thao tác đi qua API, bằng khóa bí mật phía máy chủ, sau khi API đã xác minh
người gọi.

### Lượt Pro trong trợ lý

`/api/chat` vẫn cho mỗi địa chỉ IP một hạn mức Gemini 3.1 Pro và suy luận mở
rộng miễn phí mỗi ngày. Hết hạn mức đó, nếu người hỏi đăng nhập và còn lượt mua,
máy chủ trừ lượt (`spend_credits`, trừ có điều kiện trong một câu lệnh) và giữ
nguyên Pro, suy luận mở rộng. Giá mỗi câu: 1 lượt cho Pro, 1 lượt cho suy luận
mở rộng, cộng dồn (`turnCost` trong `src/lib/plans.ts`). Không trả lời được thì
hoàn lượt (`refund_credits`); Pro lùi về Flash vì Google hết hạn mức thì hoàn
phần Pro. Trình duyệt chỉ gửi access token của phiên; quyền dùng Pro dựa vào số
dư trong cơ sở dữ liệu, sửa yêu cầu gửi lên không mở được Pro.

Ba gói hiện chỉ khác nhau ở số lượt. Muốn gói cao mở thêm model hay tính năng,
thêm thuộc tính vào `Plan` và đọc nó trong `/api/chat`.

## Tệp

| Tệp | Việc |
| --- | --- |
| `src/lib/plans.ts` | Bảng giá, số lượt mỗi gói, giá lượt mỗi câu hỏi |
| `src/lib/payments/payos.ts` | Gọi API payOS, tạo và kiểm chữ ký, đọc webhook |
| `src/lib/payments/server.ts` | Kết nối Supabase quyền máy chủ, xác minh người gọi, trừ, hoàn lượt, nhật ký |
| `src/app/api/payments/create/route.ts` | Tạo đơn và link thanh toán |
| `src/app/api/payments/status/[orderId]/route.ts` | Trạng thái đơn (chỉ chủ đơn) |
| `src/app/api/webhooks/payos/route.ts` | Webhook payOS |
| `src/app/api/user/billing/route.ts` | Số dư và 10 đơn gần nhất |
| `src/components/account/BillingPanel.tsx` | Giao diện mua lượt trên trang Tài khoản |
| `supabase/migrations/20261002090000_payments.sql` | Bảng và hàm cơ sở dữ liệu |
| `supabase/tests/payments_test.sql` | Kiểm thử cơ sở dữ liệu (chạy rồi rollback) |
| `tests/*.test.mjs` | Kiểm thử chữ ký, bảng giá và các route (`npm test`) |

## Cơ sở dữ liệu

- `orders`: `id` (uuid), `user_id`, `plan_id`, `provider` (`payos`),
  `amount_vnd`, `currency` (`VND`), `credits`, `status` (`PENDING`, `PAID`,
  `FAILED`, `CANCELLED`, `EXPIRED`), `provider_order_id` (orderCode gửi payOS,
  cơ sở dữ liệu cấp, bắt đầu từ 100001), `provider_link_id`,
  `provider_transaction_id` (mã giao dịch ngân hàng), `checkout_url`, `qr_code`,
  `expires_at`, `created_at`, `paid_at`, `updated_at`.
- `credit_ledger`: mỗi lần cộng, trừ lượt là một hàng (`PURCHASE`, `USAGE`,
  `REFUND`). `order_id` là `UNIQUE`: một đơn chỉ cộng lượt một lần, cơ sở dữ liệu
  chặn chứ không chỉ mã ứng dụng.
- `billing_accounts`: số dư hiện tại, `CHECK (credit_balance >= 0)`.
- Hàm `confirm_payos_payment`, `spend_credits`, `refund_credits`: chỉ
  `service_role` gọi được.
- Xóa tài khoản: số dư bị xóa; đơn và sổ cái được giữ nhưng mất liên kết với
  người dùng (`on delete set null`), để còn đối soát với payOS.

Truy vấn tra cứu nhanh (SQL Editor):

```sql
select provider_order_id, plan_id, amount_vnd, status, created_at, paid_at
from orders order by created_at desc limit 50;

select user_id, credit_balance from billing_accounts order by credit_balance desc;
```

## Biến môi trường

Đặt trên Vercel (Settings → Environment Variables), chỉ phía máy chủ, không có
tiền tố `NEXT_PUBLIC_`:

| Biến | Lấy ở đâu |
| --- | --- |
| `SUPABASE_SECRET_KEY` | Supabase → Project Settings → API Keys → Secret key (`sb_secret_…`), hoặc khóa `service_role` cũ |
| `PAYOS_CLIENT_ID` | my.payos.vn → Kênh thanh toán → Client ID |
| `PAYOS_API_KEY` | như trên → Api Key |
| `PAYOS_CHECKSUM_KEY` | như trên → Checksum Key |

Đã có sẵn và vẫn cần: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL` (địa chỉ gốc, dùng cho
trang quay về sau thanh toán).

Thiếu `SUPABASE_SECRET_KEY` thì mục mua lượt bị ẩn và trợ lý chạy như trước.
Thiếu khóa payOS thì trang vẫn hiện số dư nhưng không cho tạo đơn mới.

## Webhook URL

Production: `https://lexnlineage.vercel.app/api/webhooks/payos`
(hoặc `<NEXT_PUBLIC_SITE_URL>/api/webhooks/payos` nếu đổi tên miền).

Khi lưu URL, payOS gửi một webhook dữ liệu mẫu để kiểm URL. Route trả 200 cho
mọi webhook có chữ ký đúng, kể cả đơn lạ, nên payOS chấp nhận URL; đơn lạ không
được cộng gì (nhật ký ghi `payment_rejected`, `unknown_order`).

## Thiết lập production

1. Tạo tài khoản ở <https://my.payos.vn>, xác thực tổ chức hoặc cá nhân.
2. Liên kết tài khoản ngân hàng nhận tiền, tạo **Kênh thanh toán**.
3. Trong kênh thanh toán: chép Client ID, Api Key, Checksum Key vào Vercel
   (bảng trên), cho môi trường Production.
4. Chép Secret key của Supabase vào `SUPABASE_SECRET_KEY`.
5. Redeploy.
6. Trong kênh thanh toán, đặt Webhook URL như mục trên, bấm lưu (payOS kiểm URL).
7. Mua thử gói Starter (10.000đ) bằng tài khoản thật, kiểm theo mục dưới.

## Thử nghiệm

payOS không có môi trường sandbox riêng: API production là môi trường duy nhất
được ghi trong tài liệu. Cách thử an toàn là một **kênh thanh toán riêng cho
thử nghiệm** (khóa riêng, webhook riêng trỏ về bản Preview hoặc máy phát triển),
và giao dịch thật nhỏ nhất là gói Starter 10.000đ. Không dùng chung một kênh cho
hai cơ sở dữ liệu: `orderCode` của hai nơi sẽ trùng nhau.

Trên máy phát triển:

1. Tạo `.env.local` từ `.env.example`, điền khóa Supabase và khóa kênh thử.
2. `npm run dev`.
3. Mở đường hầm công khai tới cổng 3000 (ví dụ `cloudflared tunnel --url
   http://localhost:3000` hoặc `ngrok http 3000`), đặt Webhook URL của kênh thử
   là `<địa chỉ đường hầm>/api/webhooks/payos`.
4. Đăng nhập, vào `/vi/tai-khoan`, chọn Starter, bấm Thanh toán.
5. Quét QR, chuyển 10.000đ.
6. Trang tự chuyển sang "Thanh toán thành công". Kiểm trong SQL Editor: đơn
   `PAID`, `credit_ledger` có đúng một hàng `PURCHASE`, `billing_accounts` tăng
   đúng số lượt.
7. Nếu payOS gửi lại webhook của giao dịch đó, số dư không đổi và nhật ký ghi
   `duplicate_webhook`. Trường hợp này đã có kiểm thử tự động ở dưới.

Kiểm thử tự động:

- `npm test`: chữ ký theo mẫu chính thức của payOS, bảng giá, và các route với
  Supabase, payOS giả lập (giá lấy từ máy chủ, chưa đăng nhập, gói sai, chữ ký
  sai, sai số tiền, đơn lạ, webhook lặp, người khác đọc đơn).
- `supabase/tests/payments_test.sql`: dán vào SQL Editor. Chạy trong một giao
  dịch rồi rollback: xác nhận hợp lệ, sai số tiền, tiền tệ, mã link, đơn lạ,
  webhook lặp ba lần chỉ cộng một lần, ràng buộc `UNIQUE` của sổ cái, trừ, hoàn
  lượt, và người dùng đăng nhập không đọc, gọi hàm trực tiếp được.

## Đổi giá, số lượt

Sửa `PLANS` trong `src/lib/plans.ts` rồi deploy. Đơn đã tạo giữ giá, số lượt lúc
tạo. Giá 10.000đ / 50.000đ / 100.000đ là giá đã chốt; số lượt (20 / 120 / 300)
là con số khởi điểm, chỉnh theo chi phí Gemini thực tế. Giá lượt mỗi câu hỏi ở
`turnCost`.

## Webhook gửi lại

payOS có thể gửi một giao dịch nhiều lần. `confirm_payos_payment` khóa hàng đơn
(`for update`), thấy đơn đã `PAID` thì trả `duplicate` và không làm gì; ràng
buộc `UNIQUE (order_id)` của sổ cái là lớp chặn cuối. Route trả 200 để payOS
thôi gửi. Lỗi cơ sở dữ liệu trả 500 để payOS gửi lại sau.

Đơn đã `EXPIRED` vẫn nhận xác nhận nếu tiền đến muộn: webhook hợp lệ nghĩa là
tiền đã vào tài khoản.

## Xử lý sự cố

Nhật ký (Vercel → Logs) là các dòng JSON `{"scope":"payments","event":…}`:

| event | Nghĩa |
| --- | --- |
| `payment_created` | Đã tạo đơn và link |
| `order_reused` | Bấm lại cùng gói, dùng lại đơn còn hạn |
| `create_failed` | payOS từ chối tạo link (xem `reason`); đơn thành `FAILED` |
| `webhook_received` | Nhận webhook có chữ ký đúng |
| `signature_invalid` | Chữ ký sai: kiểm `PAYOS_CHECKSUM_KEY` đúng kênh chưa |
| `payment_confirmed`, `entitlement_granted` | Đơn PAID, đã cộng lượt |
| `duplicate_webhook` | Webhook lặp, không cộng thêm |
| `payment_rejected` | Không cộng lượt; `reason`: `unknown_order`, `amount_mismatch`, `currency_mismatch`, `link_mismatch`, `no_user` |
| `db_error` | Lỗi cơ sở dữ liệu (xem `step`, `reason`) |

- Mục mua lượt không hiện: thiếu `SUPABASE_SECRET_KEY`, hoặc chưa đăng nhập.
- Không có nút Thanh toán: thiếu một trong ba khóa payOS.
- Tạo đơn báo lỗi payOS: xem `create_failed`; thường do khóa sai kênh, kênh tạm
  dừng, hoặc tài khoản ngân hàng chưa kích hoạt.
- Đã chuyển tiền mà trang vẫn chờ: xem có `webhook_received` không. Không có thì
  Webhook URL trên payOS sai hoặc trỏ nhầm môi trường. Có mà `payment_rejected`
  thì xem `reason`.
