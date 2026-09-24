# Thư viện tham khảo cho lớp hình ảnh

> Ghi chú ngày 24/09/2026: lớp ba chiều đã được gỡ khỏi trang. Trang chủ nay là
> dải văn bản nối xích, các trang khác dùng hình minh họa SVG tường minh (xem
> `README.md` ở gốc repo). `three` và `@react-three/fiber` không còn trong
> `dependencies`; GSAP cũng không còn được dùng, vì mọi chuyển động nay nằm
> trong CSS. Bảng dưới giữ lại làm hồ sơ của đợt khảo sát trước.

Khảo sát và clone ngày 18/09/2026. Số hiệu commit của từng bản clone nằm trong
`repositories.json`. Mã nguồn upstream **không** nằm trong repo này: bảng dưới
ghi lại đã đọc gì và dùng được gì, để lần sau ai mở lại `LegalSpace.tsx` thì
biết từng quyết định đến từ đâu. Giấy phép của từng dự án vẫn áp dụng nguyên
vẹn; không chạy script từ repo tham khảo.

| Repository | Vai trò ở đây |
| --- | --- |
| [three.js](https://github.com/mrdoob/three.js) | Runtime dựng hình. Đã có sẵn trong `dependencies` từ trước cho khối quan hệ của trang lĩnh vực. Chuỗi shader chunk `opaque_fragment` là điểm chèn của hộp sáng giả |
| [GSAP](https://github.com/greensock/GSAP) | Runtime cuộn và chuyển chữ của trang mở đầu: `ScrollTrigger` và `ScrollToPlugin` |
| [GSAP skills](https://github.com/greensock/gsap-skills) | Tài liệu animation chính thức, và là tài liệu có ảnh hưởng nhiều nhất tới mã ở đây. Ba điều lấy thẳng từ đó: `gsap.context` kèm `ctx.revert()` trong hàm dọn dẹp của `useEffect` (`gsap-react`); `refreshPriority` và một lần `ScrollTrigger.refresh()` sau khi phông chữ tải xong, cùng đúng một `ScrollTrigger` lo tiến độ chung (`gsap-scrolltrigger`); `gsap.quickTo` cho giá trị cập nhật liên tục và chỉ animate `transform` với `opacity` (`gsap-performance`) |
| [drei](https://github.com/pmndrs/drei) | Tham khảo cách gói các helper cho React Three Fiber. Không đưa vào `dependencies`: thứ cần ở đây là `Environment` và `Instances`, mà cả hai đều kéo theo render target hoặc tài nguyên HDR — trái với cam kết không render target và `default-src 'self'` |
| [Vanta](https://github.com/tengbao/vanta) | Tham khảo nền WebGL tương tác theo con trỏ. Lấy ý niệm "nền là một shader tham số hoá", không lấy mã: nền ở đây là mặt giấy có nét kẻ chứ không phải hiệu ứng khí quyển |
| [3D developer portfolio](https://github.com/adrianhajdin/project_3D_developer_portfolio) | Tham khảo tổ chức thành phần React quanh một canvas 3D, và cách tách phần tải cảnh khỏi phần bố cục |
| [img2threejs](https://github.com/img2threejs/img2threejs) | Tham khảo hướng sinh hình học từ dữ liệu. Ở đây dữ liệu là tập văn bản chứ không phải ảnh, nên toàn bộ bố cục do `src/lib/space.ts` tự tính |
| [Trois](https://github.com/troisjs/trois) | Lưu cho nghiên cứu; không trộn Vue vào một dự án React |
| [A-Frame](https://github.com/aframevr/aframe) | Lưu cho hướng WebXR về sau |
| [Animate.css](https://github.com/animate-css/animate.css) | Chỉ tham khảo. Không thêm vào dự án: mọi chuyển động của trang mở đầu đều theo tiến độ cuộn, mà thư viện này làm animation theo thời lượng cố định |
| [diagram-design](https://github.com/cathrynlavery/diagram-design) | Lưu cho thiết kế sơ đồ biên tập |
| [Hyperframes](https://github.com/heygen-com/hyperframes) | Lưu cho khả năng xuất video từ HTML về sau |

## Nghiên cứu thiết kế

[Awwwards Sites of the Year](https://www.awwwards.com/websites/sites_of_the_year/)
là điểm xuất phát. Điều rút ra và áp dụng được là ba nguyên tắc, không phải một
hiệu ứng nào cụ thể: một vật thể ba chiều cỡ lớn giữ vai trò chủ đạo thay vì
nhiều hiệu ứng nhỏ rải rác; điều hướng tối giản để mắt không bị chia; và bố cục
chữ bất đối xứng, lệch hẳn về một bên để chừa chỗ cho vật thể. Không sao chép
tài sản hay mã của bất kỳ trang nào trong danh mục.

Trang chị em [limen-interactive-exhibition](https://github.com/longnt284/limen-interactive-exhibition)
là nơi các kỹ thuật này được thử trước. Bốn thứ mang sang gần như nguyên vẹn:
bảng trạng thái đôi cho camera, đèn và nền; hộp sáng giả đọc từ pháp tuyến thay
cho envMap; quầng sáng bằng tấm phẳng cộng dồn thay cho postprocessing; và lớp
mờ đặt sau khối chữ thay vì đổ bóng lên từng ký tự.

## Khác biệt so với LIMEN

LIMEN là một triển lãm nghệ thuật, hình khối ở đó do chính nó nghĩ ra. Trang này
là công cụ tra cứu pháp luật, nên mọi toạ độ phải suy ra từ `src/data/documents.ts`:
một điểm là một văn bản, một thanh nối là một quan hệ, bốn tầng là bốn bậc hiệu
lực. Một hiệu ứng không nói được điều gì về tập dữ liệu thì không được đưa vào,
và cảnh ba chiều dừng lại ở phần mở đầu — từ khối `.prologue-outro` trở xuống,
nền phẳng trở lại để đọc điều luật.
