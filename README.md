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

## Chạy dự án

```bash
npm install
npm run dev        # môi trường phát triển
npm run build      # dựng bản production
npm run typecheck  # kiểm tra kiểu
```

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
