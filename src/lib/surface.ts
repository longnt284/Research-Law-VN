import type * as THREE from "three";

/**
 * Hộp sáng giả cho bề mặt kim loại.
 *
 * Đèn trực tiếp một mình không đủ để một bề mặt ra kim loại. Cái mắt đọc ra là
 * "bóng" không phải độ sáng mà là hình phản chiếu: một vùng trời ở trên, một
 * mặt sàn ở dưới, và một dải sáng hẹp ở ngang tầm mắt. Thiếu môi trường để phản
 * chiếu thì dù rọi bao nhiêu đèn, khối vẫn đọc ra là nhựa xám.
 *
 * Cách thường làm là một envMap thật qua `PMREMGenerator`. Ở đây không dùng
 * được: nó cần một render target, mà cả hai cảnh ba chiều của trang đều dựng
 * trên cam kết không tạo render target nào để chạy được trên GPU tích hợp đời
 * cũ, và nó thường kéo theo một tệp HDR tải từ ngoài, mà trang gửi kèm
 * `Content-Security-Policy` khoá `default-src 'self'`.
 *
 * Thay vào đó, pháp tuyến trong hệ toạ độ khung nhìn được dùng thẳng làm toạ độ
 * tra cứu một hộp sáng dựng bằng vài phép toán. Kết quả cho ra đúng thứ cần —
 * bề mặt có chân trời để phản chiếu — với giá bằng vài phép tính trên mỗi điểm
 * ảnh và không một byte tài nguyên nào.
 *
 * Hai cảnh ba chiều của trang dùng chung tệp này để chúng nói cùng một thứ tiếng
 * về ánh sáng: khối quan hệ ở trang lĩnh vực và không gian ở trang mở đầu phải
 * trông như cùng một chất liệu, nếu không người đọc sẽ thấy hai trang của hai
 * sản phẩm khác nhau.
 */
export interface EnvBoxUniforms {
  /** Màu viền sáng Fresnel, vẽ dọc mép khối nơi pháp tuyến gần vuông góc hướng nhìn. */
  uRim: { value: THREE.Color };
  uRimPower: { value: number };
  uRimStrength: { value: number };
  /** Màu nửa trên của hộp sáng. */
  uEnvSky: { value: THREE.Color };
  /** Màu nửa dưới. */
  uEnvGround: { value: THREE.Color };
  uEnvStrength: { value: number };
}

const DECLARE =
  "#include <common>\n" +
  "uniform vec3 uRim,uEnvSky,uEnvGround;uniform float uRimPower,uRimStrength,uEnvStrength;";

const APPLY = `
 vec3 envNormal=normalize(normal);
 float envUp=envNormal.y;
 vec3 envBox=mix(uEnvGround,uEnvSky,smoothstep(-0.85,0.85,envUp));
 float envHorizon=smoothstep(0.14,0.0,abs(envUp));
 float envFresnel=pow(1.0-saturate(dot(envNormal,normalize(vViewPosition))),uRimPower);
 outgoingLight+=envBox*uEnvStrength*0.22+uEnvSky*envHorizon*uEnvStrength*0.5;
 outgoingLight+=uRim*envFresnel*uRimStrength;
 #include <opaque_fragment>`;

/**
 * Gắn hộp sáng vào một vật liệu chuẩn hoặc vật liệu vật lý.
 *
 * Nhiều vật liệu truyền vào cùng một đối tượng `uniforms` thì chúng dùng chung
 * đúng các ô giá trị đó, nên đổi giao diện sáng tối chỉ cần ghi một lần. Muốn
 * mỗi vật liệu một cường độ riêng thì truyền mỗi vật liệu một đối tượng riêng:
 * `onBeforeCompile` được gọi một lần cho từng vật liệu, và giá trị uniform vẫn
 * nạp theo từng vật liệu kể cả khi chúng dùng lại cùng một chương trình đã biên
 * dịch.
 */
export function attachEnvBox(material: THREE.Material, uniforms: EnvBoxUniforms): void {
  material.userData.envBox = uniforms;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", DECLARE)
      .replace("#include <opaque_fragment>", APPLY);
  };
}
