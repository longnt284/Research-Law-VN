# Lex & Lineage — video giới thiệu

Video ngang 16:9 (1920×1080, 60 fps, ~55 giây) giới thiệu trang: câu hỏi hiệu lực theo ngày,
gia phả văn bản, mười hai lĩnh vực pháp luật và ba công cụ tra cứu. Mọi khung hình được vẽ bằng
Canvas 2D thuần, là hàm thuần của thời gian `t`, rồi render qua Chromium headless và mã hóa bằng
ffmpeg. Nhạc nền được tổng hợp bằng code (110 BPM, Rê thứ), khóa nhịp với hình qua khối `SYNC`
trong `scene.js`.

Bảng màu, phông chữ và ba kiểu nét quan hệ (hướng dẫn, sửa đổi, thay thế) lấy đúng chế độ tối
của trang (`src/app/globals.css`). Dấu hiệu và biểu tượng lĩnh vực vẽ lại từ
`src/components/brand/BrandMark.tsx` và `src/components/art/DomainGlyph.tsx`.

## Cấu trúc

| Tệp | Vai trò |
| --- | --- |
| `index.html`, `scene.js` | Toàn bộ cảnh, chuyển cảnh, hậu kỳ (quét sáng, vignette, hạt) |
| `audio.py` | Tổng hợp nhạc: drone, pad, pluck, chuông, trống nhẹ, tiếng đồng hồ, dấu mộc, reverb |
| `render.mjs` | Render song song nhiều worker, ghép segment |
| `fonts/` | Lora, Be Vietnam Pro (SIL OFL, giấy phép kèm theo) |
| `../public/video/gioi-thieu.*` | Bản xuất cho web (MP4 H.264/AAC, WebM VP9/Opus, ảnh bìa), phát ở trang `/vi/video` |

## Kịch bản (theo nhịp)

| Nhịp | Cảnh |
| --- | --- |
| 0–12 | Luật Xây dựng 50/2014/QH13: "còn hiệu lực không?"; ngày tra cứu chạy tới 01/07/2026, đóng dấu hết hiệu lực; 135/2025/QH15 thay thế; hợp đồng ký trước mốc vẫn theo luật cũ |
| 12–24 | Gia phả của Luật Xây dựng 2025 (thay thế, sửa đổi, bảy nghị định hướng dẫn), rồi dấu hiệu và tên trang |
| 24–76 | "12 lĩnh vực pháp luật", mỗi lĩnh vực một ô nhịp: biểu tượng, từ khóa, văn bản nền tảng |
| 76–88 | Ba công cụ: tra hiệu lực theo ngày, so sánh phiên bản, theo dõi thay đổi |
| 88–100 | Vòng mười hai lĩnh vực thu về dấu hiệu; chốt tên trang và lời miễn trừ |

Ranh giới cảnh không viết tay: `scene.js` và `audio.py` cùng tính `T4 = 28 + 4 × số lĩnh vực`
(bắt đầu cảnh công cụ) và `T5 = T4 + 12` (bắt đầu cảnh chốt) từ `DOMAINS` và khối `SYNC`. Thêm
một lĩnh vực là thêm một phần tử vào `DOMAINS`, `GLYPH` và `SYNC.domains`, dời các mốc `flip`,
`rows`, `feed` và hai mốc `impacts` cuối thêm bốn nhịp, rồi tăng `TOTAL_BEATS` ở cả hai tệp.

## Nguồn nội dung pháp lý

Mọi số hiệu và ngày trên màn hình lấy từ `src/data/documents.ts` (bản ghi `verified`) và
`src/data/comparisons.ts`. Khi dữ liệu đổi, sửa `DOMAINS`, các cảnh S1, S2, S4 trong `scene.js`
và bảng `FLAGSHIP` ở `src/app/[lang]/video/page.tsx` cho khớp, rồi render lại.

Cảnh "tra hiệu lực theo ngày" đổi ngày bằng một lần lật, không chạy liên tục: từ 01/01/2026 tới
30/06/2026 nhóm quy định miễn giấy phép của Luật 135/2025/QH15 đã áp dụng, nên không được hiện
một ngày trong khoảng đó kèm nhãn "chưa có hiệu lực".

## Build

```bash
pip install numpy scipy imageio-ffmpeg
export FFMPEG=$(python3 -c "import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())")
node render.mjs video 4          # -> out/video_silent.mp4
python3 audio.py                 # -> out/audio.wav
cd out
# MP4 cho web, mã hóa 2 lượt
$FFMPEG -y -i video_silent.mp4 -c:v libx264 -preset slow -profile:v high -level:v 4.2 -b:v 4M -maxrate 6M -bufsize 8M -pix_fmt yuv420p -pass 1 -an -f mp4 /dev/null
$FFMPEG -y -i video_silent.mp4 -i audio.wav -c:v libx264 -preset slow -profile:v high -level:v 4.2 -b:v 4M -maxrate 6M -bufsize 8M -pix_fmt yuv420p -pass 2 \
  -c:a aac -b:a 192k -shortest -movflags +faststart ../../public/video/gioi-thieu.mp4
# WebM cho trình duyệt không có H.264
$FFMPEG -y -i video_silent.mp4 -i audio.wav -c:v libvpx-vp9 -b:v 0 -crf 36 -row-mt 1 -c:a libopus -b:a 128k -shortest ../../public/video/gioi-thieu.webm
# Ảnh bìa: khung dấu hiệu, nhịp 22.9
node ../render.mjs stills 12.49 && cp stills/t012.49.jpg ../../public/video/gioi-thieu.jpg
```

Xem trước trực tiếp: `npx http-server video` rồi mở `index.html?preview`.
