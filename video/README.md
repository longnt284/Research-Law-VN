# Lex & Lineage — video giới thiệu

Video ngang 16:9 (1920×1080, 60 fps, 60 giây) giới thiệu trang, lấy trợ lý AI hỏi đáp làm cảnh
chính: một câu hỏi được gõ, câu trả lời hiện dần kèm văn bản dẫn chứng và tình trạng hiệu lực,
rồi ba câu hỏi nhanh ở các lĩnh vực khác. Video không giới thiệu lần lượt từng lĩnh vực: mười bốn
lĩnh vực xuất hiện cùng lúc thành một chòm sao ở cảnh phạm vi. Mọi khung hình được vẽ bằng Canvas
2D thuần, là hàm thuần của thời gian `t`, rồi render qua Chromium headless và mã hóa bằng ffmpeg.
Nhạc nền được tổng hợp bằng code (110 BPM, Rê thứ), khóa nhịp với hình qua khối `SYNC` trong
`scene.js`.

Bảng màu, phông chữ và ba kiểu nét quan hệ (hướng dẫn, sửa đổi, thay thế) lấy đúng chế độ tối
của trang (`src/app/globals.css`). Dấu hiệu và biểu tượng lĩnh vực vẽ lại từ
`src/components/brand/BrandMark.tsx` và `src/components/art/DomainGlyph.tsx`. Khung chat dựng
theo khung trợ lý của trang (`src/components/chat/ChatPanel.tsx`, chữ trong `src/i18n/chat.ts`).

## Cấu trúc

| Tệp | Vai trò |
| --- | --- |
| `index.html`, `scene.js` | Toàn bộ cảnh, chuyển cảnh, hậu kỳ (quét sáng, vignette, hạt) |
| `audio.py` | Tổng hợp nhạc: drone, pad, pluck, chuông, trống nhẹ, tiếng gõ phím, tiếng đồng hồ, dấu mộc, reverb |
| `render.mjs` | Render song song nhiều worker, ghép segment |
| `fonts/` | Lora, Be Vietnam Pro (SIL OFL, giấy phép kèm theo) |
| `../public/video/gioi-thieu.*` | Bản xuất cho web (MP4 H.264/AAC, WebM VP9/Opus, ảnh bìa), phát ở trang `/vi/video` |

## Kịch bản (theo nhịp)

| Nhịp | Cảnh |
| --- | --- |
| 0–12 | Luật Xây dựng 50/2014/QH13: "còn hiệu lực không?"; ngày tra cứu chạy tới 01/07/2026, đóng dấu hết hiệu lực; 135/2025/QH15 thay thế; hợp đồng ký trước mốc vẫn theo luật cũ |
| 12–24 | Gia phả của Luật Xây dựng 2025 (thay thế, sửa đổi, bảy nghị định hướng dẫn), rồi dấu hiệu và tên trang |
| 24–68 | Trợ lý AI: gõ câu hỏi về phạt cọc; câu trả lời hiện dần với nhãn CHƯA XÁC MINH ở số điều, chip 91/2015/QH13 và 25/2018/AL kèm tình trạng hiệu lực, dòng "Hiệu lực tính tại hôm nay"; ba câu hỏi nhanh về Quy tắc VIAC, Luật Đất đai 2024 và thi hành án dân sự |
| 68–80 | Ba công cụ: tra hiệu lực theo ngày, so sánh phiên bản, theo dõi thay đổi |
| 80–92 | Phạm vi: mười bốn biểu tượng bùng ra thành một mạng, số đếm 14 lĩnh vực, 199 văn bản, 16 án lệ; mạng thu về dấu hiệu |
| 92–110 | Chốt: dấu hiệu, tên trang, ô hỏi "Hỏi trợ lý AI" với nút "Hỏi ngay", lời miễn trừ |

Ranh giới cảnh không viết tay ở hai nơi: `scene.js` và `audio.py` cùng đọc `SYNC.scenes`. Mọi mốc
âm thanh của cảnh trợ lý (`typing`, `send`, `tag`, `chips`, `today`, `montage`), cảnh công cụ
(`flip`, `rows`, `feed`), cảnh phạm vi (`glyphs`, `counters`, `collapse`) và cảnh chốt (`cta`) cũng
nằm trong `SYNC`, nên dời một mốc là hình và tiếng dời theo.

## Nguồn nội dung pháp lý

Mọi số hiệu, ngày và con số trên màn hình lấy từ `src/data/documents.ts` và
`src/data/comparisons.ts`. Câu trả lời của trợ lý trong video là minh họa giao diện, viết từ cùng
dữ liệu đó và ghi "Giao diện minh họa" dưới khung chat:

- Câu trả lời chính dựa trên Án lệ 25/2018/AL (bên nhận cọc chưa được cấp giấy chứng nhận do cơ
  quan nhà nước thì không phải chịu phạt cọc) và quy định về đặt cọc của Bộ luật Dân sự 2015. Số
  điều 328 mang nhãn CHƯA XÁC MINH, đúng như quy tắc của trợ lý với số điều không có trong kho.
- Ba câu hỏi nhanh đọc từ bản ghi `viac-2026`, `luat-dat-dai-2024` (sửa đổi bởi `luat-43-2024`) và
  `luat-thads-2025` (thay thế `luat-thads-2008`).
- Số đếm ở cảnh phạm vi nằm ở hằng `STATS`.

`tests/video-sync.test.mjs` kiểm ba điều khi chạy `npm test`: thứ tự và màu của mười bốn lĩnh vực
trong `DOMAINS`, các con số trong `STATS`, và mọi số hiệu dạng `…/…/QH…`, `…/…/AL`, `…/…/NĐ-CP`
xuất hiện trong `scene.js` đều có trong kho. Khi dữ liệu đổi mà phép thử báo lỗi, sửa `scene.js`,
chương và lời thoại ở `src/app/[lang]/video/page.tsx`, rồi render lại.

Cảnh "tra hiệu lực theo ngày" đổi ngày bằng một lần lật, không chạy liên tục: từ 01/01/2026 tới
30/06/2026 nhóm quy định miễn giấy phép của Luật 135/2025/QH15 đã áp dụng, nên không được hiện
một ngày trong khoảng đó kèm nhãn "chưa có hiệu lực".

## Build

```bash
pip install numpy scipy
node render.mjs video 4          # -> out/video_silent.mp4 (ffmpeg hệ thống, hoặc đặt FFMPEG)
python3 audio.py                 # -> out/audio.wav
cd out
# MP4 cho web, mã hóa 2 lượt
ffmpeg -y -i video_silent.mp4 -c:v libx264 -preset slow -profile:v high -level:v 4.2 -b:v 4M -maxrate 6M -bufsize 8M -pix_fmt yuv420p -pass 1 -an -f mp4 /dev/null
ffmpeg -y -i video_silent.mp4 -i audio.wav -c:v libx264 -preset slow -profile:v high -level:v 4.2 -b:v 4M -maxrate 6M -bufsize 8M -pix_fmt yuv420p -pass 2 \
  -c:a aac -b:a 192k -shortest -movflags +faststart ../../public/video/gioi-thieu.mp4
# WebM cho trình duyệt không có H.264
ffmpeg -y -i video_silent.mp4 -i audio.wav -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -c:a libopus -b:a 128k -shortest ../../public/video/gioi-thieu.webm
# Ảnh bìa: khung câu trả lời đầy đủ của trợ lý, nhịp 48.6
node ../render.mjs stills 26.51 && cp stills/t026.51.jpg ../../public/video/gioi-thieu.jpg
```

Xem trước trực tiếp: `npx http-server video` rồi mở `index.html?preview`.
