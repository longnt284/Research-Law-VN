# Chính sách bảo mật · Security policy

## Báo lỗ hổng

Nếu bạn tìm thấy lỗ hổng bảo mật trên trang Lex & Lineage hoặc trong kho mã
này, xin **không mở issue công khai**. Báo riêng theo một trong hai cách:

1. GitHub: tab **Security** → **Report a vulnerability** (báo cáo riêng, chỉ
   chủ sở hữu đọc được).
2. Email: longnt284.lawyer@gmail.com, tiêu đề bắt đầu bằng `[security]`.

Xin gửi kèm: đường dẫn hoặc tệp bị ảnh hưởng, các bước tái hiện, tác động có
thể xảy ra. Không cần gửi dữ liệu thật của người dùng khác; nếu vô tình truy
cập được, xin dừng lại và báo ngay.

Chúng tôi xác nhận đã nhận báo cáo trong 3 ngày làm việc và báo tiến độ xử lý
trong 14 ngày.

## Phạm vi

- Trang đang chạy (địa chỉ ở phần giới thiệu kho mã) và mã nguồn trong kho này.
- Cấu hình cơ sở dữ liệu trong `supabase/migrations/`.

Ngoài phạm vi: tấn công từ chối dịch vụ, gửi thư rác, lừa đảo qua mạng xã hội,
và lỗ hổng của nền tảng bên thứ ba (Vercel, Supabase, GitHub) — xin báo trực
tiếp cho nhà cung cấp đó.

## Nguyên tắc

Không truy cập, sửa hay xóa dữ liệu không phải của bạn. Không làm gián đoạn
dịch vụ. Cho chúng tôi thời gian hợp lý để sửa trước khi công bố.

---

## Reporting a vulnerability

If you find a security issue in Lex & Lineage or this repository, please
**do not open a public issue**. Report it privately via GitHub (**Security** →
**Report a vulnerability**) or by email to longnt284.lawyer@gmail.com with a
subject starting `[security]`. Include the affected URL or file, steps to
reproduce, and the likely impact. We acknowledge reports within 3 business
days and give a status update within 14 days.

In scope: the live site and the code and database configuration in this
repository. Out of scope: denial of service, spam, social engineering, and
vulnerabilities in third-party platforms (Vercel, Supabase, GitHub).

Do not access, modify or delete data that is not yours, do not disrupt the
service, and allow reasonable time for a fix before disclosure.
