# Khi luật chạy bằng code — motion showcase

Video ngắn 9:16 (1080×1920, 60 fps, ~34 giây) về giao điểm Luật × Công nghệ × Tài chính.
Mọi khung hình được vẽ bằng Canvas 2D thuần, là hàm thuần của thời gian `t`, rồi render
qua Chromium headless và mã hóa bằng ffmpeg. Nhạc nền được tổng hợp bằng code (128 BPM),
khóa nhịp với hình qua cùng danh sách `IMPACTS` trong `scene.js`.

## Cấu trúc

| Tệp | Vai trò |
| --- | --- |
| `index.html`, `scene.js` | Toàn bộ cảnh, chuyển cảnh, hậu kỳ (glitch, RGB split, grain) |
| `audio.py` | Tổng hợp nhạc: kick, clap, hat, bass sidechain, pad, arp, riser, impact, reverb |
| `render.mjs` | Render song song nhiều worker, ghép segment |
| `fonts/` | Be Vietnam Pro, JetBrains Mono (SIL OFL) |
| `../public/video/luat-chay-bang-code.mp4` | Bản xuất cho web (H.264 ~7 Mbps, AAC), phát ở trang `/vi/video` |

## Kịch bản (theo beat)

| Beat | Cảnh |
| --- | --- |
| 0–4 | Hook: gõ lệnh `> law.compile()`, glitch, hút vào |
| 4–10 | LUẬT × CODE × TIỀN — kinetic slam, đổi màu theo beat |
| 10–20 | Chữ tan thành hạt, ráp thành cán cân công lý; đồng ₫ và `</>` cân bằng |
| 20–32 | Timeline 4 cột mốc pháp lý số |
| 32–40 | Nến giá biến thành block chuỗi khối — “Tài sản số” |
| 40–46 | Quét vân tay, mã hóa dữ liệu, khóa — “Dữ liệu cá nhân không để mua bán” |
| 46–54 | Mạng nơ-ron + nguyên tắc của Luật Trí tuệ nhân tạo |
| 54–62 | Đường hầm tốc độ, montage từ khóa |
| 62–72 | Chốt: “Khi luật chạy bằng code.” rồi thu về một điểm |

## Nguồn nội dung pháp lý (đã đối chiếu vanban.chinhphu.vn)

- Nghị quyết 05/2025/NQ-CP (09/09/2025): thí điểm thị trường tài sản mã hóa, thời hạn 5 năm.
- Luật Công nghiệp công nghệ số, số 71/2025/QH15: hiệu lực 01/01/2026.
- Luật Bảo vệ dữ liệu cá nhân, số 91/2025/QH15: hiệu lực 01/01/2026.
- Luật Trí tuệ nhân tạo, số 134/2025/QH15: thông qua 10/12/2025, hiệu lực 01/03/2026.

## Build

```bash
pip install numpy scipy imageio-ffmpeg
export FFMPEG=$(python3 -c "import imageio_ffmpeg as i; print(i.get_ffmpeg_exe())")
node render.mjs video 4          # -> out/video_silent.mp4
python3 audio.py                 # -> out/audio.wav
# Bản master crf 15 rất nặng (~450 MB) vì lớp nhiễu hạt; bản web mã hóa 2 lượt ~7 Mbps (~30 MB)
cd out
$FFMPEG -y -i video_silent.mp4 -c:v libx264 -preset slow -b:v 7M -maxrate 10M -bufsize 14M -pix_fmt yuv420p -pass 1 -an -f mp4 /dev/null
$FFMPEG -y -i video_silent.mp4 -i audio.wav -c:v libx264 -preset slow -b:v 7M -maxrate 10M -bufsize 14M -pix_fmt yuv420p -pass 2 \
  -c:a aac -b:a 192k -shortest -movflags +faststart ../../public/video/luat-chay-bang-code.mp4
```

Xem trước trực tiếp: `npx http-server video` rồi mở `index.html?preview`.
