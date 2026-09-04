# Skill dùng chung của dự án

Hai skill trong thư mục này được sao chép nguyên văn từ hai kho mã nguồn mở bên
ngoài. Sao chép vào repo để lệnh chạy được ngay trong mọi phiên Claude Code —
kể cả phiên chạy trên web — mà không cần bước cài plugin.

## Lệnh

| Lệnh | Tác dụng |
|---|---|
| `/caveman` | Bật chế độ trả lời nén tối đa. Mức: `lite`, `full` (mặc định), `ultra`, `wenyan-lite`, `wenyan-full`, `wenyan-ultra`. Tắt bằng `/caveman off` hoặc câu "stop caveman". |
| `/karpathy-guidelines` | Nạp bộ nguyên tắc hạn chế lỗi thường gặp khi LLM viết code: nghĩ trước khi code, ưu tiên đơn giản, sửa đúng chỗ, đặt tiêu chí nghiệm thu. |

Cả hai giữ hiệu lực đến hết phiên hoặc đến khi được tắt.

Lưu ý: skill đặt trong `.claude/skills/` nên Claude có thể tự kích hoạt khi ngữ
cảnh khớp mô tả trong phần frontmatter, không chỉ khi gõ lệnh. Với `caveman`,
mô tả gốc có bao gồm cả cụm "be brief". Nếu không muốn, gõ `/caveman off`.

## Nguồn và giấy phép

| Skill | Kho nguồn | Commit ghim | Đường dẫn gốc | Giấy phép |
|---|---|---|---|---|
| `caveman` | https://github.com/JuliusBrussee/caveman | `367fdb7f0f8f8e7994b5aab632c7ce5014802b32` | `skills/caveman/SKILL.md` | MIT |
| `karpathy-guidelines` | https://github.com/multica-ai/andrej-karpathy-skills | `2c606141936f1eeef17fa3043a72095b4765b9c2` | `skills/karpathy-guidelines/SKILL.md` | MIT |

Kho `caveman` dùng mô hình giấy phép tách đôi: `LICENSING.md` của kho ghi rõ
thư mục `skills/` thuộc MIT, phần Business Source License 1.1 chỉ áp cho các thư
mục engine (`engine/`, `proxy/`, `rewriter/`, `browse/`, `mcp/`, `shrink/`,
`shared/platform/`) — những thư mục đó không được sao chép vào đây. Bản MIT gốc
nằm tại `caveman/LICENSE`.

Kho `andrej-karpathy-skills` không có file `LICENSE` riêng; giấy phép MIT được
khai trong `.claude-plugin/plugin.json` và trong frontmatter của chính SKILL.md.

Nội dung `SKILL.md` giữ nguyên văn, không sửa một chữ, để đối chiếu được với
thượng nguồn.

## Cập nhật

```bash
./scripts/update-vendored-skills.sh
```

Script kéo bản mới nhất từ hai kho, ghi đè hai file `SKILL.md` và in ra commit
mới. Sau khi chạy, cập nhật lại cột "Commit ghim" ở bảng trên rồi commit.

## Bản plugin đầy đủ

`.claude/settings.json` đã khai hai kho này dưới dạng plugin marketplace. Nếu
muốn dùng trọn bộ (caveman có thêm `cavecrew`, `caveman-compress`,
`caveman-stats`, các hook thống kê token…), cài thêm:

```bash
claude plugin install caveman@caveman
claude plugin install andrej-karpathy-skills@karpathy-skills
```

Skill của plugin có tiền tố tên plugin — `/caveman:caveman`,
`/andrej-karpathy-skills:karpathy-guidelines` — nên không xung đột với hai lệnh
ngắn ở trên. Bản plugin `caveman` có cài hook chạy Node ở mỗi lần khởi tạo phiên
và mỗi lần gửi prompt; cân nhắc trước khi bật.
