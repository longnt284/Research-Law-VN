"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

import { ACT_COUNT, buildSpace } from "@/lib/space";
import { attachEnvBox, type EnvBoxUniforms } from "@/lib/surface";

/**
 * Không gian ba chiều của trang mở đầu.
 *
 * Một canvas duy nhất nằm cố định sau phần chữ. Mỗi điểm là một văn bản trong
 * `src/data/documents.ts`, mỗi thanh nối là một quan hệ có thật. Sáu chương là
 * sáu cách sắp xếp cùng một tập điểm đó, nên chuyển chương là các văn bản di
 * chuyển sang chỗ mới chứ không phải một cảnh tắt đi và một cảnh khác hiện ra.
 *
 * Cam kết kỹ thuật, giữ nguyên xuyên suốt: không render target, không
 * postprocessing, không tải tài nguyên từ bên thứ ba. Trang này gửi kèm
 * `Content-Security-Policy` khoá `default-src 'self'`, và mọi hiệu ứng ở đây —
 * hộp sáng giả cho kim loại, quầng sáng cộng dồn, lớp bụi — đều là shader tự
 * viết chạy trên hình học đã có sẵn. Nhờ vậy cảnh dựng được trên cả GPU tích
 * hợp đời cũ, và không khoá bảo mật nào phải nới ra vì phần trang trí.
 */

/** Trạng thái dùng chung giữa phần cuộn và phần dựng hình. Ghi mỗi khung hình, không qua React state. */
export interface SpaceSignal {
  /** Tiến độ chương, số thực trong khoảng 0 tới ACT_COUNT-1. */
  p: number;
  /** Bản đã làm mượt của `p`, do chính cảnh cập nhật. */
  smooth: number;
  /** Vận tốc cuộn thô, dùng cho nhịp nảy và độ mở ống kính. */
  v: number;
  /** Góc xoay do người đọc tự thêm. */
  turn: number;
  /** Gọi để xin vẽ thêm một khung khi vòng lặp đang ở chế độ theo yêu cầu. */
  invalidate: (() => void) | null;
}

export interface PointerState {
  x: number;
  y: number;
}

const TAU = Math.PI * 2;
const { clamp, lerp, smoothstep, smootherstep, damp } = THREE.MathUtils;

/**
 * Cửa sổ biến hình bắt đầu muộn. Mỗi chương vì vậy có ba pha: tới, ở lại đủ lâu
 * để người đọc kịp nhìn, rồi mới chuyển sang chương sau. Nếu biến hình chạy suốt
 * cả chương thì không chương nào có hình hài rõ ràng.
 */
const MORPH = 0.42;

/**
 * Hai bảng màu, đọc thẳng từ token của trang.
 *
 * `nodeSat` và `nodeLum` trùng đúng `--node-chroma` và `--node-lightness` trong
 * `globals.css`, nên một lĩnh vực có cùng một màu ở bản đồ hai chiều, ở khối ba
 * chiều của trang lĩnh vực và ở đây.
 *
 * `add` âm ở giao diện sáng: cộng dồn trên nền tối là ánh sáng, nhưng cộng dồn
 * trên nền giấy chỉ đẩy mọi thứ về trắng. Trên giấy, các họ đường phải làm tối
 * xuống mới đọc ra là nét kẻ.
 */
const PALETTE = {
  light: {
    bg: "#f2eee5",
    bottom: "#ded5c3",
    top: "#fbf9f4",
    glow: "#c8ab6d",
    rim: "#ffffff",
    rimStrength: 0.3,
    envSky: "#fffdf7",
    envGround: "#9d9483",
    envStrength: 0.42,
    ambient: 0.46,
    hemiSky: "#ffffff",
    hemiGround: "#c2b8a4",
    hemi: 0.95,
    key: 2.2,
    keyColor: "#fffaf0",
    fill: 1.0,
    fillColor: "#c8ab6d",
    nodeSat: 0.46,
    nodeLum: 0.42,
    anchorEmissive: "#9a7b34",
    emissive: 0.26,
    linkColors: ["#8d8779", "#a8503f", "#7a2c1f"],
    linkMetal: 0.25,
    mote: "#6b6250",
    moteOpacity: 0.28,
    moteBlend: THREE.NormalBlending,
    vignette: 0.14,
    add: -0.85,
    core: 0.3,
    halo: 0.085,
  },
  dark: {
    bg: "#0a0c10",
    bottom: "#06080b",
    top: "#151b25",
    glow: "#7a6132",
    rim: "#f0dcae",
    rimStrength: 0.62,
    envSky: "#9aa8bd",
    envGround: "#0b0f14",
    /*
      Hộp sáng và ánh tự phát đều là ánh sáng cộng thêm, mà cộng thêm trên nền
      tối thì đẩy mọi thứ về trắng. Ở bản trước, hai lượng này đủ lớn để nuốt
      sắc lĩnh vực: cả khối ngả vàng kem, và màu — thứ dữ liệu duy nhất trên
      điểm nói văn bản thuộc lĩnh vực nào — không đọc ra được ở giao diện tối.
      Hạ xuống để `--node-chroma` và `--node-lightness` còn sống tới màn hình;
      phần rực rỡ đã có quầng sáng của tầng luật lo.
    */
    envStrength: 0.8,
    ambient: 0.4,
    hemiSky: "#dfe6f0",
    hemiGround: "#12161d",
    hemi: 1.1,
    key: 2.2,
    keyColor: "#fff6e6",
    fill: 1.3,
    fillColor: "#c9a961",
    nodeSat: 0.52,
    nodeLum: 0.66,
    anchorEmissive: "#c9a961",
    emissive: 0.3,
    linkColors: ["#8d8779", "#e0917f", "#c9705c"],
    linkMetal: 0.55,
    mote: "#d8c188",
    moteOpacity: 0.7,
    moteBlend: THREE.AdditiveBlending,
    vignette: 0.42,
    add: 1,
    core: 1,
    halo: 0.24,
  },
} as const;

type Theme = (typeof PALETTE)["dark"];

/**
 * Hình khối của một điểm nói tầng hiệu lực của văn bản.
 *
 * Bản trước vẽ cả trăm văn bản bằng đúng một khối hai mươi mặt, nên thứ bậc chỉ
 * còn nằm ở chỗ đứng: đọc ra được ở chương Thứ bậc, mất sạch ở năm chương còn
 * lại. Ở đây số mặt tăng dần khi hiệu lực pháp lý giảm — luật là một khối tám
 * mặt sắc cạnh, thông tư là một hạt gần tròn — nên một điểm bất kỳ, ở chương
 * nào, cũng tự nói nó thuộc tầng nào.
 *
 * Bốn hình là bốn lệnh vẽ thay vì một, và cả bốn đều là hình nguyên thuỷ dựng
 * tại chỗ. Tổng cộng khoảng hai nghìn tam giác cho cả cảnh, và không một byte
 * tài nguyên nào tải thêm, nên `default-src 'self'` không phải nới ra dòng nào.
 */
function tierGeometry(tier: number): THREE.BufferGeometry {
  if (tier <= 0) return new THREE.OctahedronGeometry(0.5, 0);
  if (tier === 1) return new THREE.DodecahedronGeometry(0.5, 0);
  if (tier === 2) return new THREE.IcosahedronGeometry(0.5, 0);
  return new THREE.IcosahedronGeometry(0.5, 1);
}

/**
 * Bù cỡ cho từng hình. Bốn hình cùng bán kính ngoại tiếp 0.5 nhưng khối càng ít
 * mặt thì càng lọt sâu vào trong quả cầu đó, nên nếu không bù thì khối tám mặt
 * của tầng luật trông nhỏ hơn hạt của tầng thông tư — đúng ngược điều muốn nói.
 */
const TIER_GAIN = [1.2, 1.06, 1.0, 0.97];

/**
 * Tình trạng hiệu lực, đọc theo thang `STATE` của `lib/space.ts`.
 *
 * Quy ước lấy nguyên từ bản đồ hai chiều và khối quan hệ của trang lĩnh vực:
 * văn bản hết hiệu lực phải trông xỉn hơn văn bản đang áp dụng. Ở đây "xỉn" là
 * lui về phía màu nền chứ không phải tối đi — trên nền giấy, tối đi là nổi lên.
 * Văn bản hết hiệu lực cũng mất hẳn quầng sáng: một văn bản đã bị thay thế thì
 * không còn là mốc để các văn bản khác quy về.
 */
const STATE_FADE = [0, 0.14, 0.26, 0.52];
const STATE_SIZE = [1, 0.97, 0.92, 0.82];
const STATE_HALO = [1, 0.92, 0.7, 0];

/**
 * Đường nối là một cung, không phải một dây cung thẳng.
 *
 * Mỗi quan hệ được chia thành bốn đoạn trên một đường bậc hai, và bốn đoạn ấy
 * mua về ba thứ mà một hình trụ thẳng không có. Một, cung tách nhau ra thay vì
 * chồng lên nhau, nên chương Quan hệ đọc ra là một bản vẽ chứ không phải một
 * cuộn dây. Hai, bán kính thu dần theo cấp số nhân nên cả sợi là một nét vuốt
 * có đầu có đuôi. Ba, màu của từng đoạn nhạt dần về phía nền, đúng quy ước đã
 * dùng ở khối quan hệ của trang lĩnh vực: đầu đậm là văn bản dẫn chiếu, đầu
 * nhạt là văn bản được dẫn chiếu. Chiều của quan hệ vì vậy đọc được cả khi
 * khối đang quay và cả khi in ra đen trắng.
 *
 * Giá phải trả là bốn lần số thể hiện, tức khoảng ba trăm rưởi thay vì tám
 * mươi bảy — vẫn nằm trong một lệnh vẽ duy nhất và vẫn là một phần nghìn ngân
 * sách của cảnh.
 */
const LINK_SEG = 4;
/** Bán kính ở hai đầu, tính theo bề dày gốc. Đầu dày là văn bản dẫn chiếu. */
const LINK_HEAD = 1.5;
const LINK_TAIL = 0.55;
/**
 * Tỷ lệ thu giữa hai đoạn liền nhau. Hình trụ gốc có đáy 1 và ngọn đúng bằng tỷ
 * lệ này, nên ngọn đoạn trước và đáy đoạn sau luôn bằng nhau: nét vuốt liền
 * mạch, không có bậc thang ở mối nối.
 */
const LINK_TAPER = Math.pow(LINK_TAIL / LINK_HEAD, 1 / LINK_SEG);
const LINK_STEP = Array.from({ length: LINK_SEG }, (_, k) => Math.pow(LINK_TAPER, k));
/** Quan hệ càng mạnh càng đậm nét: quy định chi tiết · sửa đổi bổ sung · thay thế. */
const LINK_KIND = [0.85, 1.05, 1.3];
/** Độ võng của cung tại điểm giữa, tính theo chiều dài dây cung. */
const LINK_BOW = 0.12;
/** Độ nhạt tối đa về phía nền, ở đoạn cuối cùng. */
const LINK_FADE = 0.6;

/** Một điểm trên đường bậc hai qua `a` và `b`, uốn theo điểm điều khiển `c`. */
function bezier(
  a: THREE.Vector3,
  c: THREE.Vector3,
  b: THREE.Vector3,
  t: number,
  out: THREE.Vector3,
) {
  const u = 1 - t;
  out.set(0, 0, 0)
    .addScaledVector(a, u * u)
    .addScaledVector(c, 2 * u * t)
    .addScaledVector(b, t * t);
}

/**
 * Một bảng trạng thái duy nhất cho camera, đèn, sương, độ đậm đường nối và sắc
 * độ. Mỗi chương có hai hàng: hàng chẵn là lúc chương vừa tới, hàng lẻ là lúc
 * chương đã nói hết điều nó muốn nói. Nhờ hàng thứ hai, cảnh vẫn chuyển động
 * ngay giữa lòng một chương thay vì đứng yên chờ chương sau.
 *
 *  0 cx  1 cy  2 cz | 3 tx  4 ty  5 tz | 6 fov
 *  7 kx  8 ky  9 kz | 10 key 11 fill 12 ambient 13 rim
 * 14 sương gần 15 sương sâu | 16 độ đậm đường nối 17 cỡ điểm 18 độ sáng nền
 * 19 lệch sắc (vòng) 20 hệ số bão hoà 21 lệch sáng
 */
const SN = 22;
const KEYS = [
  // 01 Khối — đứng xa nhìn toàn bộ tập văn bản như một thiên thể, rồi tiến vào rất chậm.
  [0.0, 0.1, 8.6, 0, 0, 0, 40, 5, 6, 4, 0.85, 0.7, 0.8, 1.3, 4.2, 9.5, 0.16, 1.0, 0.85, 0.0, 1.0, 0.0],
  [0.0, 0.06, 7.2, 0, 0, 0, 42, 5, 5, 4, 0.95, 0.78, 0.86, 1.24, 3.8, 9.0, 0.2, 1.02, 0.95, 0.004, 1.04, 0.008],
  // 02 Thứ bậc — nâng lên cao và nhìn chếch xuống, vì bốn tầng chỉ đọc ra khi có góc nhìn.
  [0.3, 1.05, 7.8, 0, 0.15, 0, 43, 4, 7, 5, 1.0, 0.82, 0.92, 1.1, 4.0, 10.0, 0.22, 1.0, 0.8, -0.02, 0.95, 0.01],
  [0.75, 1.65, 6.9, 0.1, 0.1, 0, 45, 3, 8, 4, 1.08, 0.76, 0.98, 1.05, 3.6, 9.4, 0.24, 0.98, 0.78, -0.026, 0.92, 0.016],
  // 03 Lĩnh vực — lùi ra đủ xa để tám chùm tách bạch, bão hoà đẩy lên cho màu lĩnh vực nói được.
  [-0.4, 0.55, 9.8, 0, 0, 0, 41, -3, 6, 6, 1.0, 1.05, 0.94, 1.15, 5.0, 12.5, 0.2, 0.96, 0.92, 0.014, 1.14, 0.0],
  [-1.1, 0.3, 9.2, -0.25, 0, 0, 43, -5, 5, 6, 1.06, 1.15, 0.98, 1.12, 4.6, 11.8, 0.22, 0.96, 1.0, 0.02, 1.2, -0.004],
  // 04 Quan hệ — vào gần, bão hoà rút bớt để các đường nối là thứ sáng nhất trong khung.
  [0.55, 0.22, 7.4, 0, 0, 0, 46, 6, 3, 5, 0.88, 1.25, 0.86, 1.35, 3.4, 8.6, 1.0, 0.88, 1.05, 0.0, 0.88, -0.012],
  [0.15, 0.1, 5.9, 0, 0, -0.25, 49, 7, 2, 4, 0.8, 1.4, 0.8, 1.45, 2.8, 8.0, 1.0, 0.84, 1.15, -0.006, 0.82, -0.018],
  // 05 Thời gian — hạ xuống ngang tầm mắt rồi trôi dọc trục, từ mốc cũ nhất sang mốc mới nhất.
  [-2.1, -0.1, 6.4, -1.2, -0.05, 0, 47, -2, 5, 6, 1.02, 1.1, 1.0, 1.0, 3.2, 8.8, 0.3, 0.92, 0.88, 0.03, 1.0, 0.004],
  [2.1, -0.05, 6.2, 1.25, -0.02, 0, 47, 2, 5, 6, 1.02, 1.1, 1.0, 1.0, 3.2, 8.8, 0.3, 0.92, 0.88, 0.036, 1.02, 0.008],
  // 06 Ngưỡng — về chính diện, lõi sáng mạnh nhất cả hành trình, sẵn sàng cho lối vào bản đồ.
  [0.0, 0.08, 6.9, 0, 0, 0, 42, 0, 5, 7, 1.05, 0.95, 1.05, 1.22, 4.4, 10.5, 0.26, 1.08, 1.1, 0.0, 0.96, 0.012],
  [0.0, 0.04, 6.3, 0, 0, 0, 41, 1, 5, 6, 1.0, 0.9, 1.1, 1.28, 4.2, 10.2, 0.24, 1.12, 1.2, -0.004, 0.9, 0.016],
];

/** Chữ bên nào thì khối dồn về phía đối diện. Hai chương cuối căn giữa nên khối được nâng lên. */
const SHIFT = [1.5, -1.5, 1.4, -1.4, 0, 0];
const LIFT = [0, -0.15, 0, 0, 0.38, 0.42];
/** Trường ảnh hưởng của con trỏ. Dương là đẩy ra, âm là hút vào — chương Quan hệ kéo mạng lưới về phía con trỏ. */
const PFIELD = [0.12, 0.18, 0.28, -0.42, 0.2, 0.3];
/**
 * Góc nhìn của từng màn, tính bằng radian quanh trục đứng.
 *
 * Bản trước cộng dồn một lượng cố định cho mỗi màn, nên tới màn thứ sáu khối đã
 * quay hơn sáu mươi độ và hai vành lồng nhau bị nhìn gần như từ cạnh: đọc ra là
 * một vệt chứ không phải một hình. Mỗi bố cục có một hướng riêng để đọc được —
 * trục thời gian cần gần chính diện thì trục ngang mới ra trục ngang, còn vành
 * khép ở màn cuối phải quay thẳng mặt về người xem.
 */
const TURN = [-0.22, 0.05, 0.42, 0.62, 0.14, 0.0];

/**
 * Danh tính của nền từng chương.
 *
 * Nền không phải một bầu trời khoa học viễn tưởng mà là mặt giấy: dòng kẻ ngang
 * cho chương Thứ bậc, nan quạt cho chương Lĩnh vực, lưới ô cho chương Quan hệ,
 * vạch chia dọc cho chương Thời gian. Cùng một công thức, chỉ khác tham số, nên
 * số phép tính trên mỗi điểm ảnh không đổi theo số chương và chuyển chương là
 * nội suy tham số chứ không phải bật tắt lớp.
 *
 * 0 tần x  1 tần y  2 độ sắc  3 biên độ | 4 tần góc 5 tần bán kính 6 tốc độ 7 biên độ
 * 8 nhiễu hạt 9 lắng về gradient 10 trôi 11 thêm họ vuông góc | 12 lõi sáng 13 bóng mờ thêm
 */
const BN = 14;
const ENVS = [
  // 01 Khối — mặt giấy trống, chỉ có một vùng sáng ở giữa.
  [0, 0, 2, 0, 0, 0, 0, 0, 0.05, 0, 0.0, 0, 0.3, 0],
  // 02 Thứ bậc — dòng kẻ ngang, đúng mặt giấy có dòng.
  [0, 15, 3.0, 0.15, 0, 0, 0, 0, 0.055, 0, 0.012, 0, 0.16, 0],
  // 03 Lĩnh vực — tám nan quạt toả từ tâm, trùng số lĩnh vực.
  [0, 0, 2, 0, 8, 0, -0.045, 0.13, 0.05, 0, 0.0, 0, 0.22, 0],
  // 04 Quan hệ — lưới ô vuông, nền của một bản vẽ quan hệ.
  [10, 10, 2.2, 0.085, 0, 0, 0, 0, 0.045, 0, 0.006, 1, 0.2, 0.05],
  // 05 Thời gian — vạch chia dọc trôi ngang, như thước đo thời gian chạy qua.
  [22, 0, 5.0, 0.14, 0, 0, 0, 0, 0.05, 0, 0.05, 0, 0.14, 0],
  // 06 Ngưỡng — mọi nét kẻ tắt, nền lắng về gradient thuần và lõi sáng mạnh nhất.
  [0, 0, 2, 0, 0, 0, 0, 0, 0.045, 0.62, 0.0, 0, 0.4, 0],
];

interface EnvState {
  top: THREE.Color;
  bottom: THREE.Color;
  glow: THREE.Color;
  bg: Float64Array;
  /** Trọng số từng chương cho lớp bụi, đọc trong vertex shader. */
  w: Float64Array;
  vel: number;
  focus: number;
  focusY: number;
  px: number;
  py: number;
  intro: number;
}

function bump(p: number, c: number, w: number) {
  return smoothstep(1 - Math.abs(p - c) / w, 0, 1);
}

/** Hai hệ số nhân riêng của từng vai trò, giữ ngoài uniform vì bảng trạng thái nhân lại chúng mỗi khung hình. */
interface Surface extends THREE.MeshStandardMaterial {
  userData: { envBox: EnvBoxUniforms; envBase: number; rimBase: number };
}

/**
 * Bề mặt của điểm và của đường nối.
 *
 * Phần hộp sáng giả nằm ở `src/lib/surface.ts` và dùng chung với khối quan hệ
 * của trang lĩnh vực. Ở đây chỉ còn việc riêng của cảnh này: mỗi vai trò nhận
 * một cường độ khác nhau, và hai màu của hộp đi theo sắc độ từng màn nên phản
 * chiếu trên khối đổi màu cùng nhịp với nền.
 */
function makeSurface(theme: Theme, kind: "node" | "link") {
  const m = new THREE.MeshStandardMaterial(
    kind === "node"
      ? { metalness: 0.68, roughness: 0.3, flatShading: true }
      : {
          metalness: theme.linkMetal,
          roughness: 0.44,
          transparent: true,
          opacity: 0.5,
          depthWrite: false,
        },
  );
  const envBase = kind === "node" ? 1 : 0.45;
  const rimBase = kind === "node" ? 1 : 0.55;
  attachEnvBox(m, {
    uRim: { value: new THREE.Color(theme.rim) },
    uRimPower: { value: 2.6 },
    uRimStrength: { value: theme.rimStrength * rimBase },
    uEnvSky: { value: new THREE.Color(theme.envSky) },
    uEnvGround: { value: new THREE.Color(theme.envGround) },
    uEnvStrength: { value: theme.envStrength * envBase },
  });
  m.userData.envBase = envBase;
  m.userData.rimBase = rimBase;
  return m as Surface;
}

const BACKDROP_VERT =
  "varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,1.0,1.0);}";

/**
 * Nền là một mặt giấy có nét kẻ, không phải tám lớp bật tắt theo chương.
 *
 * Trình biên dịch shader gộp phẳng nhánh điều kiện, nên sáu khối `if` vẫn chạy
 * trên mọi điểm ảnh ở mọi chương và giá nhân lên theo số lớp. Ở đây chỉ có hai
 * nguyên thủy — một họ đường thẳng và một họ đường toả từ tâm — cộng vài số vô
 * hướng. Danh tính của từng chương nằm ở tham số, không ở việc có chạy hay không.
 */
const BACKDROP_FRAG = `
uniform vec3 uTop,uBottom,uGlow;
uniform float uTime,uAspect,uVel,uCore,uVignette,uAdd,uCoreGlow,uSettle,uGrain,uCross,uDrift;
uniform vec2 uFocus;uniform vec4 uR1,uR2;varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
 return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
void main(){
 vec2 uv=vUv;
 vec2 p=(uv-uFocus)*vec2(uAspect,1.0);
 float d=length(p);
 vec3 grad=mix(uBottom,uTop,smoothstep(0.0,1.0,uv.y));
 vec3 col=grad;
 col+=uGlow*(1.0-smoothstep(0.0,0.92,d))*uCoreGlow*uCore;
 // Một trường khí quyển rất nhạt để nền không phẳng lì, cùng vai trò với lớp hạt giấy của phần chữ.
 float atmo=noise(vec2(uv.x*2.1+uTime*0.03,uv.y*1.5-uTime*0.02));
 col+=uGlow*uAdd*atmo*0.10*(1.0-smoothstep(0.1,1.2,d));
 // Họ đường thẳng: dòng kẻ ngang, lưới ô, vạch chia dọc. Cùng công thức, khác tham số.
 float fade=1.0-smoothstep(0.28,1.34,d);
 float ph1=p.x*uR1.x+p.y*uR1.y+uTime*uDrift;
 col+=uGlow*uAdd*pow(0.5+0.5*sin(ph1),uR1.z)*uR1.w*fade;
 // Họ vuông góc dựng lưới ô mà không cần thêm một bộ tham số thứ ba.
 float ph1b=p.x*(-uR1.y)+p.y*uR1.x+uTime*uDrift;
 col+=uGlow*uAdd*pow(0.5+0.5*sin(ph1b),uR1.z)*uR1.w*uCross*fade;
 // Họ toả từ tâm. atan nhảy bậc ở trục ±pi và tần số góc là số nội suy nên hiếm khi
 // là số nguyên; tắt đường đi trong khoảng sáu độ quanh trục để không thấy mối nối.
 float ang=atan(p.y,p.x);
 float seam=smoothstep(1.0,0.965,abs(ang)*0.3183);
 float ph2=ang*uR2.x+d*uR2.y+uTime*uR2.z;
 col+=uGlow*uAdd*pow(0.5+0.5*sin(ph2),4.0)*uR2.w*seam*(1.0-smoothstep(0.24,1.28,d))*(1.0+uVel*0.6);
 // Chương cuối lắng về gradient thuần: độ phức tạp giảm dần thay vì tắt phụt.
 col=mix(col,mix(col,grad,0.6),uSettle);
 col*=1.0-uVignette*smoothstep(0.32,1.2,length((uv-0.5)*vec2(uAspect,1.0)));
 col*=1.0+(hash(uv*vec2(1733.0,1097.0)+fract(uTime)*19.0)-0.5)*uGrain*2.2;
 gl_FragColor=vec4(col,1.0);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;

function Backdrop({ env, theme }: { env: EnvState; theme: Theme }) {
  const { size } = useThree();
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color() },
      uBottom: { value: new THREE.Color() },
      uGlow: { value: new THREE.Color() },
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uVel: { value: 0 },
      uCore: { value: 1 },
      uVignette: { value: 0.4 },
      uAdd: { value: 1 },
      uCoreGlow: { value: 0.3 },
      uSettle: { value: 0 },
      uGrain: { value: 0.012 },
      uCross: { value: 0 },
      uDrift: { value: 0 },
      uFocus: { value: new THREE.Vector2(0.5, 0.52) },
      uR1: { value: new THREE.Vector4() },
      uR2: { value: new THREE.Vector4() },
    }),
    [],
  );

  useFrame((_, dt) => {
    const s = Math.min(dt, 0.05);
    const b = env.bg;
    uniforms.uTime.value += s;
    uniforms.uAspect.value = size.width / Math.max(size.height, 1);
    uniforms.uTop.value.copy(env.top);
    uniforms.uBottom.value.copy(env.bottom);
    uniforms.uGlow.value.copy(env.glow);
    uniforms.uVel.value = env.vel;
    uniforms.uFocus.value.set(
      0.5 + (env.focus * 0.5) / Math.max(uniforms.uAspect.value, 0.2),
      env.focusY,
    );
    uniforms.uR1.value.set(b[0], b[1], b[2], b[3]);
    uniforms.uR2.value.set(b[4], b[5], b[6], b[7]);
    uniforms.uGrain.value = b[8];
    uniforms.uSettle.value = b[9];
    uniforms.uDrift.value = b[10];
    uniforms.uCross.value = b[11];
    uniforms.uCoreGlow.value = b[12];
    // Bóng mờ bốn góc cho chiều sâu trên nền tối, nhưng trên nền giấy nó chỉ là một lớp xám bẩn.
    uniforms.uVignette.value = theme.vignette + b[13];
    uniforms.uAdd.value = theme.add;
    uniforms.uCore.value = theme.core;
  });

  return (
    <mesh renderOrder={-1} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={BACKDROP_VERT}
        fragmentShader={BACKDROP_FRAG}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * Lớp bụi đổi hành vi theo chương ngay trong vertex shader: lắng xuống, tụ về
 * lõi, dâng lên theo tầng, trôi ngang theo trục thời gian. CPU không đụng tới
 * từng hạt, chỉ ghi bốn trọng số mỗi khung hình.
 */
const MOTE_VERT = `
uniform float uTime,uSize,uPixelRatio,uVel;uniform vec2 uPointer;uniform vec4 uW1,uW2;
attribute float aSeed;varying float vAlpha;
void main(){
 vec3 q=position;
 float s=aSeed;
 float calm=1.0-(uW1.y+uW2.z)*0.4;
 q.x+=sin(uTime*0.16+s*6.283)*0.62*calm;
 q.y+=cos(uTime*0.11+s*4.11)*0.46*calm;
 q.z+=sin(uTime*0.08+s*2.73)*0.55*calm;
 // Chương Khối và chương Ngưỡng kéo bụi về lõi; chương Lĩnh vực đẩy nó ra ngoài.
 q*=mix(1.0,0.72,uW1.x);
 q*=mix(1.0,0.78,uW2.w);
 q+=normalize(q+vec3(0.001))*uW1.z*1.4;
 // Chương Thời gian: bụi trôi ngang thành một dòng, cùng chiều với trục dữ liệu.
 float ph=fract(s*3.17+uTime*0.05*(1.0+uVel*1.5));
 q.x=mix(q.x,(ph-0.5)*16.0,uW2.z);
 vec2 toP=q.xy-uPointer*vec2(5.4,3.4);
 q.xy+=normalize(toP+vec2(0.001))*(uW2.y*0.8)/(1.0+dot(toP,toP)*0.22);
 vec4 mv=modelViewMatrix*vec4(q,1.0);
 gl_Position=projectionMatrix*mv;
 gl_PointSize=uSize*uPixelRatio*(1.0/max(-mv.z,0.1))*(0.55+s);
 vAlpha=(0.2+0.6*s)*mix(1.0,smoothstep(0.0,0.07,ph)*smoothstep(1.0,0.93,ph),uW2.z);
}`;

const MOTE_FRAG = `
uniform vec3 uColor;uniform float uOpacity;varying float vAlpha;
void main(){
 float d=length(gl_PointCoord-0.5);
 if(d>0.5)discard;
 gl_FragColor=vec4(uColor,smoothstep(0.5,0.0,d)*vAlpha*uOpacity);
 #include <colorspace_fragment>
}`;

function Motes({
  theme,
  env,
  still,
  count,
}: {
  theme: Theme;
  env: EnvState;
  still: boolean;
  count: number;
}) {
  const { viewport } = useThree();
  const mat = useRef<THREE.ShaderMaterial>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 11;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 9 - 1;
      seed[i] = Math.random();
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 22 },
      uPixelRatio: { value: 1 },
      uVel: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uColor: { value: new THREE.Color() },
      uOpacity: { value: 0 },
      uW1: { value: new THREE.Vector4() },
      uW2: { value: new THREE.Vector4() },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uColor.value.set(theme.mote);
    const m = mat.current;
    if (m && m.blending !== theme.moteBlend) {
      m.blending = theme.moteBlend;
      m.needsUpdate = true;
    }
  }, [theme, uniforms]);

  useEffect(() => () => geo.dispose(), [geo]);

  useFrame((_, dt) => {
    const s = Math.min(dt, 0.05);
    if (!still) uniforms.uTime.value += s;
    uniforms.uPixelRatio.value = viewport.dpr;
    uniforms.uVel.value = env.vel;
    uniforms.uPointer.value.set(env.px, env.py);
    uniforms.uW1.value.set(env.w[0], env.w[1], env.w[2], env.w[3]);
    uniforms.uW2.value.set(env.w[4], env.w[5], env.w[6], env.w[7]);
    uniforms.uOpacity.value = damp(
      uniforms.uOpacity.value,
      theme.moteOpacity * env.intro,
      2.5,
      s,
    );
  });

  return (
    <points frustumCulled={false}>
      <primitive object={geo} attach="geometry" />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={MOTE_VERT}
        fragmentShader={MOTE_FRAG}
        transparent
        depthWrite={false}
        blending={theme.moteBlend}
      />
    </points>
  );
}

/**
 * Quầng sáng cho văn bản cấp luật.
 *
 * Viền sáng cộng thẳng vào `outgoingLight` bị tone-mapping kéo xuống, nên trên
 * ảnh chụp các điểm neo chỉ còn là chấm xám. Lớp này là một tấm phẳng cho mỗi
 * điểm, luôn quay mặt về camera, vẽ một vệt sáng mềm cộng dồn. Một lệnh vẽ cho
 * toàn bộ, không render target — rẻ hơn một lượt bloom rất nhiều.
 */
const HALO_VERT = `
uniform float uScale;varying vec2 vUv;
void main(){
 vUv=uv;
 vec4 c=modelViewMatrix*instanceMatrix*vec4(0.0,0.0,0.0,1.0);
 c.xy+=position.xy*length(instanceMatrix[0].xyz)*uScale;
 gl_Position=projectionMatrix*c;
}`;

const HALO_FRAG = `
uniform vec3 uColor;uniform float uOpacity;varying vec2 vUv;
void main(){
 float d=length(vUv-0.5)*2.0;
 if(d>1.0)discard;
 gl_FragColor=vec4(uColor,(pow(1.0-d,3.2)+pow(1.0-d,1.35)*0.42)*uOpacity);
 #include <colorspace_fragment>
}`;

interface CorpusProps {
  signal: React.RefObject<SpaceSignal>;
  pointer: React.RefObject<PointerState>;
  pointerOn: boolean;
  paused: boolean;
  reduced: boolean;
  theme: Theme;
  still: boolean;
  env: EnvState;
  low: boolean;
}

function Corpus({
  signal,
  pointer,
  pointerOn,
  paused,
  reduced,
  theme,
  still,
  env,
  low,
}: CorpusProps) {
  const space = useMemo(buildSpace, []);
  const { nodes, links, layouts, bursts } = space;
  const n = nodes.length;

  const group = useRef<THREE.Group>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const fill = useRef<THREE.DirectionalLight>(null);
  const amb = useRef<THREE.AmbientLight>(null);
  const time = useRef(0);
  const spin = useRef(0);
  const vel = useRef(0);
  const shift = useRef(0);

  const { size, invalidate, camera, scene } = useThree();

  const geometries = useMemo(
    () => ({
      node: [0, 1, 2, 3].map(tierGeometry),
      // Hình trụ hở hai đầu: hai đầu sợi nằm sâu trong khối của điểm nên nắp
      // không bao giờ lộ ra, mà bỏ nắp thì mối nối giữa hai đoạn không còn hai
      // mặt trùng nhau cùng vẽ lên một chỗ.
      link: new THREE.CylinderGeometry(LINK_TAPER, 1, 1, 6, 1, true),
      halo: new THREE.PlaneGeometry(1, 1),
    }),
    [],
  );

  /**
   * Chỗ của mỗi văn bản trong khối thể hiện của tầng nó. Tính một lần: tầng là
   * thuộc tính của loại văn bản, không đổi trong vòng đời trang.
   */
  const tierSlots = useMemo(() => {
    const slot = new Int32Array(n);
    const counts = [0, 0, 0, 0];
    for (let i = 0; i < n; i++) {
      const t = clamp(nodes[i].tier, 0, 3) | 0;
      slot[i] = counts[t]++;
    }
    return { slot, counts };
  }, [nodes, n]);

  const materials = useMemo(
    () => ({ node: makeSurface(theme, "node"), link: makeSurface(theme, "link") }),
    // Vật liệu dựng một lần rồi được ghi đè màu trong hiệu ứng bên dưới: dựng lại
    // theo giao diện sẽ buộc trình điều khiển biên dịch lại shader mỗi lần đổi nền.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const haloUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color() },
      uOpacity: { value: 0 },
      uScale: { value: low ? 2.6 : 3.3 },
    }),
    [low],
  );

  const nodeMeshes = useMemo(
    () =>
      geometries.node.map((geo, t) => {
        const count = tierSlots.counts[t];
        const mesh = new THREE.InstancedMesh(geo, materials.node, Math.max(count, 1));
        mesh.frustumCulled = false;
        // Tầng rỗng vẫn dựng một chỗ để bộ đệm hợp lệ, nhưng không vẽ thể hiện nào.
        mesh.count = count;
        return mesh;
      }),
    [geometries.node, materials.node, tierSlots],
  );

  const linkMesh = useMemo(() => {
    const mesh = new THREE.InstancedMesh(
      geometries.link,
      materials.link,
      Math.max(links.length * LINK_SEG, 1),
    );
    mesh.frustumCulled = false;
    mesh.renderOrder = 1;
    return mesh;
  }, [geometries.link, materials.link, links.length]);

  const haloMesh = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: haloUniforms,
      vertexShader: HALO_VERT,
      fragmentShader: HALO_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const mesh = new THREE.InstancedMesh(geometries.halo, mat, n);
    mesh.frustumCulled = false;
    mesh.renderOrder = 2;
    return mesh;
  }, [geometries.halo, haloUniforms, n]);

  // Màu của điểm và của đường nối đọc lại bảng màu khi người đọc đổi nền, thay vì
  // được nướng cứng lúc dựng cảnh.
  useEffect(() => {
    const c = new THREE.Color();
    // Lui về phía nền, không lui về phía đen: trên nền giấy, tối đi là nổi lên.
    const back = new THREE.Color(theme.bg);
    for (let i = 0; i < n; i++) {
      const node = nodes[i];
      c.setHSL(
        node.hue / 360,
        theme.nodeSat,
        theme.nodeLum * (node.anchor ? 1.12 : 1) + (node.anchor ? 0.02 : 0),
      );
      c.lerp(back, STATE_FADE[node.state] ?? 0);
      nodeMeshes[clamp(node.tier, 0, 3) | 0].setColorAt(tierSlots.slot[i], c);
    }
    for (const mesh of nodeMeshes) {
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }

    for (let i = 0; i < links.length; i++) {
      const base = theme.linkColors[links[i].kind] ?? theme.linkColors[0];
      for (let k = 0; k < LINK_SEG; k++) {
        c.set(base).lerp(back, (k / (LINK_SEG - 1)) * LINK_FADE);
        linkMesh.setColorAt(i * LINK_SEG + k, c);
      }
    }
    if (linkMesh.instanceColor) linkMesh.instanceColor.needsUpdate = true;

    materials.node.emissive.set(theme.anchorEmissive);
    materials.node.emissiveIntensity = theme.emissive * 0.35;
    materials.link.metalness = theme.linkMetal;
    for (const m of [materials.node, materials.link]) {
      m.userData.envBox.uRim.value.set(theme.rim);
    }
    invalidate();
  }, [theme, nodes, links, nodeMeshes, tierSlots, linkMesh, materials, n, invalidate]);

  useEffect(
    () => () => {
      for (const mesh of nodeMeshes) mesh.dispose();
      linkMesh.dispose();
      haloMesh.dispose();
      (haloMesh.material as THREE.Material).dispose();
      for (const geo of geometries.node) geo.dispose();
      geometries.link.dispose();
      geometries.halo.dispose();
      materials.node.dispose();
      materials.link.dispose();
    },
    [nodeMeshes, linkMesh, haloMesh, geometries, materials],
  );

  useEffect(() => {
    const s = signal.current;
    s.invalidate = invalidate;
    return () => {
      s.invalidate = null;
    };
  }, [invalidate, signal]);

  const cur = useMemo(() => new Float64Array(SN), []);
  const d = useMemo(() => new THREE.Object3D(), []);
  const base = useMemo(
    () => ({
      top: new THREE.Color(theme.top),
      bottom: new THREE.Color(theme.bottom),
      glow: new THREE.Color(theme.glow),
      key: new THREE.Color(theme.keyColor),
      fill: new THREE.Color(theme.fillColor),
      rim: new THREE.Color(theme.rim),
      envSky: new THREE.Color(theme.envSky),
      envGround: new THREE.Color(theme.envGround),
    }),
    [theme],
  );
  const scratch = useMemo(
    () => ({
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      mid: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      up: new THREE.Vector3(0, 1, 0),
      bow: new THREE.Vector3(),
      ctrl: new THREE.Vector3(),
      p0: new THREE.Vector3(),
      p1: new THREE.Vector3(),
      seg: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      tgt: new THREE.Vector3(),
      ray: new THREE.Vector3(),
      hit: new THREE.Vector3(),
      fwd: new THREE.Vector3(),
    }),
    [],
  );
  /** Toạ độ đã tính của từng điểm trong khung hình này; đường nối đọc lại chính mảng đó. */
  const live = useMemo(() => new Float32Array(n * 3), [n]);

  useFrame((_, raw) => {
    const g = group.current;
    if (!g || !key.current || !fill.current || !amb.current) return;

    const dt = Math.min(raw, 0.05);
    const s = signal.current;
    env.intro = reduced || still ? 1 : Math.min(1, env.intro + dt / 1.4);

    const target = clamp(s.p, 0, ACT_COUNT - 1);
    s.smooth = still ? target : damp(s.smooth, target, 5.5, dt);
    const p = s.smooth;
    const a = reduced ? Math.round(p) : Math.floor(p);
    const b = Math.min(a + 1, ACT_COUNT - 1);
    const frac = reduced ? 0 : clamp(p - a, 0, 1);

    vel.current = damp(vel.current, clamp(Math.abs(s.v) / 2600, 0, 1), 4, dt);
    const ease = 1 - Math.pow(1 - env.intro, 3);
    const morph = reduced ? 0 : smoothstep(frac, MORPH, 1);
    // Nảy nhẹ đúng lúc đang biến hình, để thấy các văn bản tự sắp xếp lại chứ không
    // dùng nó che chuyển cảnh.
    const burst =
      reduced
        ? 0
        : Math.max(Math.pow(Math.sin(Math.PI * morph), 1.6) * 0.34, 1 - ease) *
          (1 + vel.current * 0.3);
    const alive = paused || reduced ? 0 : 1;
    const touch = pointerOn ? alive : 0;
    if (alive) time.current += dt;
    spin.current = damp(spin.current, s.v / 9000, 3, dt);
    s.v = still ? 0 : s.v * Math.exp(-6 * dt);

    const narrow = size.width < 760;
    const wanted = narrow ? 0 : lerp(SHIFT[a], SHIFT[b], morph);
    shift.current = still ? wanted : damp(shift.current, wanted, 6, dt);
    g.position.set(shift.current, (narrow ? 1.15 : 0) + lerp(LIFT[a], LIFT[b], morph), 0);
    g.scale.setScalar((narrow ? 0.74 : 0.9) * lerp(0.84, 1, ease));
    g.rotation.set(
      0.14 + pointer.current.y * 0.1 * touch,
      lerp(TURN[a], TURN[b], morph) + time.current * 0.045 + s.turn + spin.current,
      -0.06 + pointer.current.x * 0.07 * touch + spin.current * 0.2,
    );
    g.updateMatrixWorld();

    // Con trỏ thành một điểm thật trong hệ toạ độ của nhóm: bắn tia từ camera qua con
    // trỏ rồi cắt mặt phẳng đi qua tâm nhóm và vuông góc hướng nhìn. Nhờ vậy trường
    // ảnh hưởng vẫn đúng chỗ sau khi nhóm đã xoay.
    let pmx = 0;
    let pmy = 0;
    const field = lerp(PFIELD[a], PFIELD[b], morph) * touch;
    if (Math.abs(field) > 0.001) {
      scratch.ray
        .set(pointer.current.x, -pointer.current.y, 0.5)
        .unproject(camera)
        .sub(camera.position)
        .normalize();
      camera.getWorldDirection(scratch.fwd);
      scratch.hit.setFromMatrixPosition(g.matrixWorld).sub(camera.position);
      const denom = scratch.ray.dot(scratch.fwd);
      const dist = Math.abs(denom) < 1e-4 ? 8 : scratch.hit.dot(scratch.fwd) / denom;
      scratch.hit.copy(camera.position).addScaledVector(scratch.ray, clamp(dist, 0.5, 40));
      g.worldToLocal(scratch.hit);
      pmx = scratch.hit.x;
      pmy = scratch.hit.y;
    }

    // Bảng trạng thái đọc trước, vì cỡ điểm và độ đậm đường nối nằm trong đó.
    const kf = reduced ? a * 2 : clamp(p * 2, 0, KEYS.length - 1);
    const ka = Math.min(Math.floor(kf), KEYS.length - 1);
    const kb = Math.min(ka + 1, KEYS.length - 1);
    const kt = smootherstep(kf - ka, 0, 1);
    const KA = KEYS[ka];
    const KB = KEYS[kb];
    for (let j = 0; j < SN; j++) cur[j] = lerp(KA[j], KB[j], kt);
    if (reduced) for (let j = 0; j < 7; j++) cur[j] = KEYS[0][j] + (cur[j] - KEYS[0][j]) * 0.3;

    const LA = layouts[a];
    const LB = layouts[b];
    const BA = bursts[a];
    const BB = bursts[b];
    const nodeScale = cur[17];

    for (let i = 0; i < n; i++) {
      const node = nodes[i];
      const i3 = i * 3;
      const seed = ((i * 53) % 97) / 97;
      const push = burst * (0.3 + seed * 0.7);
      let x = lerp(LA[i3], LB[i3], morph) + lerp(BA[i3], BB[i3], morph) * push;
      let y = lerp(LA[i3 + 1], LB[i3 + 1], morph) + lerp(BA[i3 + 1], BB[i3 + 1], morph) * push;
      const z = lerp(LA[i3 + 2], LB[i3 + 2], morph) + lerp(BA[i3 + 2], BB[i3 + 2], morph) * push;
      if (field !== 0) {
        const dx = x - pmx;
        const dy = y - pmy;
        const inv = field / (1.6 + 2 * (dx * dx + dy * dy));
        x += dx * inv;
        y += dy * inv;
      }
      live[i3] = x;
      live[i3 + 1] = y;
      live[i3 + 2] = z;

      d.position.set(x, y, z);
      d.rotation.set(i * 0.7 + time.current * 0.08, i * 1.3 + time.current * 0.05, i * 0.4);
      const breathe = 1 + Math.sin(time.current * 0.7 + seed * TAU) * 0.03 * alive;
      const tier = clamp(node.tier, 0, 3) | 0;
      const r =
        (node.anchor ? 0.152 : 0.088 + (3 - node.tier) * 0.011) *
        nodeScale *
        TIER_GAIN[tier] *
        (STATE_SIZE[node.state] ?? 1);
      d.scale.setScalar(r * ease * breathe * (1 - burst * 0.16));
      d.updateMatrix();
      nodeMeshes[tier].setMatrixAt(tierSlots.slot[i], d.matrix);

      // Quầng dùng lại đúng vị trí của điểm nên không bao giờ lệch khỏi điểm nó thuộc về.
      const halo = node.anchor ? (STATE_HALO[node.state] ?? 1) : 0;
      d.scale.setScalar(halo > 0 ? r * ease * 1.15 * halo : 0);
      d.updateMatrix();
      haloMesh.setMatrixAt(i, d.matrix);
    }
    for (const mesh of nodeMeshes) mesh.instanceMatrix.needsUpdate = true;
    haloMesh.instanceMatrix.needsUpdate = true;

    // Đường nối đọc lại toạ độ vừa tính, nên nó luôn dính đúng hai đầu kể cả giữa
    // lúc biến hình hay khi con trỏ đang kéo mạng lưới.
    const weight = cur[16];
    const thick = (0.006 + weight * 0.016) * ease;
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const ai = link.a * 3;
      const bi = link.b * 3;
      scratch.a.set(live[ai], live[ai + 1], live[ai + 2]);
      scratch.b.set(live[bi], live[bi + 1], live[bi + 2]);
      scratch.mid.addVectors(scratch.a, scratch.b).multiplyScalar(0.5);
      scratch.dir.subVectors(scratch.b, scratch.a);
      const len = scratch.dir.length();
      if (len < 1e-5) {
        d.position.copy(scratch.mid);
        d.quaternion.identity();
        d.scale.set(0, 0, 0);
        d.updateMatrix();
        for (let k = 0; k < LINK_SEG; k++) linkMesh.setMatrixAt(i * LINK_SEG + k, d.matrix);
        continue;
      }
      scratch.dir.divideScalar(len);
      /*
        Hướng võng là phần của điểm giữa vuông góc với dây cung, tức hướng từ
        tâm cảnh ra chỗ sợi đi gần tâm nhất. Sợi vì vậy uốn ra ngoài chứ không
        uốn về một phía tuỳ tiện, và hai sợi song song nhau vẫn tách được ra.
        Sợi xuyên đúng qua tâm không có hướng nào như thế nên mượn một trục
        vuông góc — tất định theo chính hướng sợi, không phải một số ngẫu nhiên.
      */
      scratch.bow
        .copy(scratch.mid)
        .addScaledVector(scratch.dir, -scratch.mid.dot(scratch.dir));
      if (scratch.bow.lengthSq() < 1e-6) scratch.bow.crossVectors(scratch.dir, scratch.up);
      if (scratch.bow.lengthSq() < 1e-6) scratch.bow.set(0, 0, 1);
      scratch.bow.normalize();
      // Điểm điều khiển đặt gấp đôi độ võng mong muốn: đường bậc hai chỉ đi
      // được nửa đường tới điểm điều khiển của nó.
      scratch.ctrl.copy(scratch.mid).addScaledVector(scratch.bow, len * LINK_BOW * 2);

      const head = thick * LINK_HEAD * (LINK_KIND[link.kind] ?? 1);
      bezier(scratch.a, scratch.ctrl, scratch.b, 0, scratch.p0);
      for (let k = 0; k < LINK_SEG; k++) {
        bezier(scratch.a, scratch.ctrl, scratch.b, (k + 1) / LINK_SEG, scratch.p1);
        scratch.seg.subVectors(scratch.p1, scratch.p0);
        const sl = scratch.seg.length();
        scratch.mid.addVectors(scratch.p0, scratch.p1).multiplyScalar(0.5);
        d.position.copy(scratch.mid);
        if (sl < 1e-6) {
          d.quaternion.identity();
          d.scale.set(0, 0, 0);
        } else {
          scratch.seg.divideScalar(sl);
          d.quaternion.copy(scratch.q.setFromUnitVectors(scratch.up, scratch.seg));
          const rk = head * LINK_STEP[k];
          d.scale.set(rk, sl, rk);
        }
        d.updateMatrix();
        linkMesh.setMatrixAt(i * LINK_SEG + k, d.matrix);
        scratch.p0.copy(scratch.p1);
      }
    }
    linkMesh.instanceMatrix.needsUpdate = true;
    materials.link.opacity = clamp(0.1 + weight * 0.62, 0, 1) * ease;
    linkMesh.visible = materials.link.opacity > 0.015;

    // Camera, đèn, sương và nền cùng đọc một bảng nên chúng luôn đổi đồng bộ với hình khối.
    const px = pointer.current.x * 0.36 * touch;
    const py = -pointer.current.y * 0.24 * touch;
    camera.position.x = damp(camera.position.x, cur[0] + px, 4, dt);
    camera.position.y = damp(camera.position.y, cur[1] + py, 4, dt);
    camera.position.z = damp(
      camera.position.z,
      cur[2] + (narrow ? 1.5 : 0) + burst * 0.45 + vel.current * 0.4,
      4,
      dt,
    );
    scratch.tgt.set(cur[3], cur[4] + (narrow ? 0.62 : 0), cur[5]);
    camera.lookAt(scratch.tgt);
    const persp = camera as THREE.PerspectiveCamera;
    const fov = cur[6] + (narrow ? 5 : 0) + vel.current * 3.2 - burst * 1.1;
    if (Math.abs(persp.fov - fov) > 0.01) {
      persp.fov = fov;
      persp.updateProjectionMatrix();
    }

    key.current.position.set(cur[7], cur[8], cur[9]);
    key.current.intensity = theme.key * cur[10];
    fill.current.intensity = theme.fill * cur[11];
    amb.current.intensity = theme.ambient * cur[12];
    for (const m of [materials.node, materials.link]) {
      m.userData.envBox.uRimStrength.value =
        theme.rimStrength * m.userData.rimBase * cur[13];
    }

    const sat = (cur[20] - 1) * 0.45;
    env.top.copy(base.top).offsetHSL(cur[19], sat, cur[21]);
    env.bottom.copy(base.bottom).offsetHSL(cur[19], sat, cur[21] * 0.7);
    env.glow
      .copy(base.glow)
      .offsetHSL(cur[19], sat * 1.2, cur[21] * 0.5)
      .multiplyScalar(cur[18]);

    // Hộp sáng giả đọc đúng bảng màu vừa tính, nên phản chiếu trên các khối đổi màu
    // cùng nhịp với nền thay vì đứng nguyên một tông suốt sáu chương.
    for (const m of [materials.node, materials.link]) {
      const u = m.userData.envBox;
      u.uEnvSky.value.copy(base.envSky).offsetHSL(cur[19], sat * 0.8, cur[21] * 0.4);
      u.uEnvGround.value.copy(base.envGround).offsetHSL(cur[19], sat * 0.6, cur[21] * 0.3);
      u.uEnvStrength.value = theme.envStrength * m.userData.envBase * (0.75 + cur[18] * 0.35);
    }

    haloUniforms.uColor.value.copy(env.glow).lerp(base.rim, 0.6);
    haloUniforms.uOpacity.value = theme.halo * ease * clamp(cur[18] * 0.6, 0, 1.1);
    haloMesh.visible = haloUniforms.uOpacity.value > 0.012;

    if (scene.fog instanceof THREE.Fog) {
      const cd = camera.position.length();
      scene.fog.color.copy(env.bottom).lerp(env.top, 0.45);
      scene.fog.near = Math.max(0.1, cd - cur[14]);
      scene.fog.far = cd + cur[15];
    }

    // Nền đọc theo cùng đường cong pha với hình khối, không theo tiến độ cuộn thô:
    // môi trường của chương giữ nguyên suốt pha tới rồi mới chuyển ở pha biến hình.
    const EA = ENVS[a];
    const EB = ENVS[b];
    for (let j = 0; j < BN; j++) env.bg[j] = lerp(EA[j], EB[j], morph);
    if (low) {
      env.bg[3] *= 0.8;
      env.bg[7] *= 0.8;
    }

    const wp = a + morph;
    for (let c = 0; c < 6; c++) env.w[c] = bump(wp, c, 1.2);
    // Hai ô cuối là trọng số hành vi chứ không phải chương: hút về con trỏ và trôi ngang.
    env.w[6] = env.w[4];
    env.w[7] = Math.max(env.w[0], env.w[5]);

    env.vel = vel.current;
    env.focus = (narrow ? 0 : shift.current / 4.4) + pointer.current.x * 0.05 * touch;
    env.focusY = (narrow ? 0.64 : 0.52) - pointer.current.y * 0.03 * touch;
    env.px = pointer.current.x * touch;
    env.py = -pointer.current.y * touch;
  });

  return (
    <>
      <ambientLight ref={amb} intensity={theme.ambient} color="#efe9dd" />
      <hemisphereLight args={[theme.hemiSky, theme.hemiGround, theme.hemi]} />
      <directionalLight
        ref={key}
        position={[5, 6, 4]}
        intensity={theme.key}
        color={theme.keyColor}
      />
      <directionalLight
        ref={fill}
        position={[-4, -2, 3]}
        intensity={theme.fill}
        color={theme.fillColor}
      />
      <group ref={group}>
        <primitive object={linkMesh} />
        {nodeMeshes.map((mesh, t) => (
          <primitive key={t} object={mesh} />
        ))}
        <primitive object={haloMesh} />
      </group>
    </>
  );
}

function FallbackForm() {
  return (
    <div className="space-fallback" role="status">
      <span className="space-fallback-form" aria-hidden="true" />
    </div>
  );
}

/** Nhánh mất ngữ cảnh WebGL: ở đây không còn `onCreated` nào chạy nữa nên phải tự báo. */
function LostFallback({ onReady }: { onReady?: () => void }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);
  return <FallbackForm />;
}

export interface LegalSpaceProps {
  signal: React.RefObject<SpaceSignal>;
  pointer: React.RefObject<PointerState>;
  pointerOn: boolean;
  paused: boolean;
  reduced: boolean;
  hidden: boolean;
  light: boolean;
  onReady?: () => void;
}

export default function LegalSpace(props: LegalSpaceProps) {
  const [contextLost, setContextLost] = useState(false);
  const theme = (props.light ? PALETTE.light : PALETTE.dark) as Theme;
  const still = props.paused || props.reduced || props.hidden;

  // Bề rộng phải được đo lại khi xoay máy: bố cục và số hạt bụi cùng đọc một ngưỡng
  // thì phải cùng đổi, nếu không xoay tablet sẽ cho ra bố cục mới với mật độ cũ.
  const [low, setLow] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 760,
  );
  useEffect(() => {
    const measure = () => setLow(window.innerWidth < 760);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);

  const env = useMemo<EnvState>(
    () => ({
      top: new THREE.Color(),
      bottom: new THREE.Color(),
      glow: new THREE.Color(),
      bg: new Float64Array(BN),
      w: new Float64Array(8),
      vel: 0,
      focus: 0,
      focusY: 0.52,
      px: 0,
      py: 0,
      intro: 0,
    }),
    [],
  );

  useEffect(() => {
    if (!contextLost) return;
    const id = setTimeout(() => setContextLost(false), 1200);
    return () => clearTimeout(id);
  }, [contextLost]);

  if (contextLost) return <LostFallback onReady={props.onReady} />;

  return (
    <Canvas
      fallback={<FallbackForm />}
      frameloop={still ? "demand" : "always"}
      dpr={[1, 1.25]}
      camera={{ position: [0, 0, 8.6], fov: 40 }}
      gl={{
        alpha: false,
        antialias: true,
        powerPreference: "default",
        failIfMajorPerformanceCaveat: false,
      }}
      onCreated={({ gl }) => {
        const onLost = (event: Event) => {
          event.preventDefault();
          setContextLost(true);
        };
        gl.domElement.addEventListener("webglcontextlost", onLost);
        gl.domElement.addEventListener("webglcontextrestored", () => setContextLost(false));
        // Màn mở đầu chỉ nhấc lên khi context thật sự dựng xong, không phải khi gói mã vừa tải về.
        props.onReady?.();
      }}
    >
      <color attach="background" args={[theme.bg]} />
      <fog attach="fog" args={[theme.bg, 4, 18]} />
      <Corpus {...props} theme={theme} still={still} env={env} low={low} />
      <Backdrop env={env} theme={theme} />
      <Motes theme={theme} env={env} still={still} count={low ? 220 : 420} />
    </Canvas>
  );
}
