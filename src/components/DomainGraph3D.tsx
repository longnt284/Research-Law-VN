"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import type { DomainId, Lang, LegalDoc, Relation } from "@/data/types";
import { getDict } from "@/i18n/dictionary";
import { attachEnvBox, type EnvBoxUniforms } from "@/lib/surface";

/** Thứ bậc quyết định tầng: luật ở trên, thông tư ở dưới. */
const TIER: Record<LegalDoc["type"], number> = {
  "bo-luat": 0,
  luat: 0,
  "dieu-uoc": 0,
  "nghi-quyet": 1,
  vbhn: 1,
  "nghi-dinh": 2,
  "quyet-dinh": 2,
  "thong-tu": 3,
  "quy-tac": 3,
};

/**
 * Cây quan hệ ba chiều của một lĩnh vực.
 *
 * Trục đứng mang nghĩa: luật nằm trên, nghị định ở giữa, thông tư dưới cùng.
 * Đó là lý do dựng ba chiều ở đây có ích chứ không chỉ để đẹp — thứ bậc hiệu
 * lực vốn là một trục thật, và trên mặt phẳng hai chiều nó phải tranh chỗ với
 * cách sắp xếp theo quan hệ.
 *
 * Khối này là phần bổ trợ, không phải đường đi chính: danh sách văn bản dạng
 * chữ nằm ngay dưới trang vẫn là thứ dùng được bằng bàn phím và trình đọc màn
 * hình. Vì vậy canvas được đánh dấu ẩn khỏi cây trợ năng.
 */
export function DomainGraph3D({
  lang,
  domain,
  hue,
  docs,
  relations,
  className,
}: {
  lang: Lang;
  domain: DomainId;
  hue: number;
  docs: LegalDoc[];
  relations: Relation[];
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const host = hostRef.current;
    if (!host || docs.length === 0) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;
    const t = getDict(lang);

    (async () => {
      const THREE = await import("three");
      if (disposed || !hostRef.current) return;

      const isDark = () => {
        const attr = document.documentElement.dataset.theme;
        if (attr === "dark") return true;
        if (attr === "light") return false;
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
      };

      // ── Bố cục: tính một lần, tất định ──
      // Mỗi tầng là một vòng tròn; văn bản trong tầng rải đều trên vòng đó. Cùng
      // dữ liệu vào thì cùng hình ra, lần mở nào cũng giống lần nào — như bản đồ
      // hai chiều, và vì cùng lý do: người đọc cần một hình quen thuộc.
      const byTier = new Map<number, LegalDoc[]>();
      for (const d of docs) {
        const t = TIER[d.type];
        if (!byTier.has(t)) byTier.set(t, []);
        byTier.get(t)!.push(d);
      }
      // Khoảng cách giữa hai tầng phải lớn hơn bán kính vòng, nếu không thì ở
      // góc nhìn thường các tầng chồng lên nhau trên màn hình và trục thứ bậc —
      // thứ duy nhất khiến ba chiều có ích ở đây — không đọc ra được.
      const TIER_GAP = 1.6;
      const tierY = (tier: number) => 2.1 - tier * TIER_GAP;
      const pos = new Map<string, InstanceType<typeof THREE.Vector3>>();
      let maxRadius = 1;
      for (const [tier, list] of byTier) {
        /*
          Tầng đông rải làm hai vòng đồng tâm, lệch nhau một chút theo chiều
          đứng; tầng thưa giữ một vòng. Ép chín nghị định trở lên vào cùng một
          vòng thì chỉ còn hai lối, và cả hai đều hỏng: nới bán kính cho đủ chỗ
          thì vòng rộng hơn khoảng cách giữa hai tầng và các tầng chồng lên nhau
          trên màn hình, còn giữ bán kính cũ thì các quả cầu dính thành một vệt.
        */
        const rings = list.length > 8 ? 2 : 1;
        const perRing = Math.ceil(list.length / rings);
        const outer = Math.min(1.95, 0.45 + perRing * 0.2);
        maxRadius = Math.max(maxRadius, outer);
        list.forEach((d, i) => {
          const ring = i % rings;
          const countInRing = ring === 0 ? perRing : list.length - perRing;
          const indexInRing = Math.floor(i / rings);
          const radius =
            list.length === 1 ? 0 : ring === 0 ? outer : outer * 0.55;
          // Lệch pha giữa hai vòng để quả cầu vòng trong không nấp đúng sau quả
          // cầu vòng ngoài ở góc nhìn mặc định.
          const a =
            (indexInRing / Math.max(countInRing, 1)) * Math.PI * 2 +
            tier * 0.6 +
            ring * 0.55;
          pos.set(
            d.id,
            new THREE.Vector3(
              Math.cos(a) * radius,
              tierY(tier) + (rings === 1 ? 0 : ring === 0 ? 0.14 : -0.14),
              Math.sin(a) * radius,
            ),
          );
        });
      }

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setClearAlpha(0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      // Ánh xạ tông màu ACES: vùng sáng trên mặt cầu cuộn dần thay vì cháy
      // trắng thành một mảng phẳng. Đây là thứ khiến quả cầu trông có chất
      // liệu chứ không phải một đĩa màu.
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.95;
      host.appendChild(renderer.domElement);
      const canvas = renderer.domElement;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      canvas.style.touchAction = "none";
      canvas.style.cursor = "grab";

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);

      /*
        Bốn nguồn sáng, mỗi nguồn một việc. Ánh sáng nền giữ cho mặt tối không
        đen kịt. Ánh sáng bán cầu đổ màu trời xuống đỉnh và màu nền hắt lên
        đáy, nên quả cầu có trên có dưới. Đèn chính ngả ấm tạo vùng sáng chính.
        Đèn viền đặt sau lưng vật thể vẽ một đường sáng dọc mép — không có nó
        thì quả cầu tối lẫn vào nền tối.
      */
      /*
        Tổng cường độ giữ ở mức thấp một cách có chủ ý. Đèn mạnh làm mặt cầu
        cháy về phía trắng, và thứ mất đi khi đó chính là màu lĩnh vực — dấu
        hiệu duy nhất trên khối nói văn bản này thuộc về đâu. Ở đây độ bóng
        đến từ lớp phủ và đèn viền, không đến từ việc rọi thêm ánh sáng.
      */
      const ambient = new THREE.AmbientLight(0xffffff);
      scene.add(ambient);
      const hemi = new THREE.HemisphereLight();
      scene.add(hemi);
      const key = new THREE.DirectionalLight(0xfff2e0);
      key.position.set(3, 6, 4);
      scene.add(key);
      const rim = new THREE.DirectionalLight();
      rim.position.set(-4.5, 1.5, -5);
      scene.add(rim);

      const applyLighting = (dark: boolean) => {
        ambient.intensity = dark ? 0.32 : 0.5;
        hemi.color.set(dark ? 0x93a9c8 : 0xffffff);
        hemi.groundColor.set(dark ? 0x15181e : 0xcfc7b6);
        hemi.intensity = dark ? 0.65 : 0.85;
        key.intensity = dark ? 1.5 : 1.7;
        rim.color.set(dark ? 0xffd9a4 : 0xffffff);
        rim.intensity = dark ? 0.9 : 0.5;
      };

      const nodeGroup = new THREE.Group();
      scene.add(nodeGroup);
      const meshes: { mesh: InstanceType<typeof THREE.Mesh>; doc: LegalDoc }[] = [];

      /*
        Hộp sáng giả, dùng chung với không gian ba chiều của trang mở đầu. Bốn
        đèn ở trên cho quả cầu có sáng có tối, nhưng lớp phủ bóng thì không có
        gì để phản chiếu, nên vệt sáng nó vẽ ra là vệt của một nguồn điểm chứ
        không phải của một môi trường. Hộp này cấp cho nó một vùng trời, một mặt
        sàn và một dải chân trời — đúng thứ làm nên cảm giác chất liệu.

        Mọi quả cầu chia nhau đúng một bộ giá trị: chúng ở cùng một môi trường
        nên không có lý do gì để khác nhau, và đổi nền sáng tối vì thế chỉ phải
        ghi một lần thay vì đi qua từng vật liệu.
      */
      const envBox: EnvBoxUniforms = {
        uRim: { value: new THREE.Color() },
        uRimPower: { value: 2.6 },
        uRimStrength: { value: 0 },
        uEnvSky: { value: new THREE.Color() },
        uEnvGround: { value: new THREE.Color() },
        uEnvStrength: { value: 0 },
      };
      const applyEnvBox = (dark: boolean) => {
        envBox.uRim.value.set(dark ? 0xf0dcae : 0xffffff);
        // Trên nền giấy, thêm ánh sáng chỉ đẩy màu lĩnh vực về phía trắng, mà màu
        // lĩnh vực là dấu hiệu duy nhất trên khối nói văn bản này thuộc về đâu.
        envBox.uRimStrength.value = dark ? 0.34 : 0.16;
        envBox.uEnvSky.value.set(dark ? 0x9aa8bd : 0xfffdf7);
        envBox.uEnvGround.value.set(dark ? 0x0b0f14 : 0x9d9483);
        envBox.uEnvStrength.value = dark ? 0.58 : 0.28;
      };

      // Độ bão hoà nhỉnh hơn màu chấm tròn trên bản đồ hai chiều một chút: ánh
      // sáng và ánh xạ tông màu bao giờ cũng kéo màu nhạt đi, nên đưa vào đúng
      // bằng màu đích thì ra màn hình sẽ nhạt hơn màu đích.
      const nodeColor = (expired: boolean, dark: boolean) =>
        new THREE.Color().setHSL(
          hue / 360,
          expired ? 0 : dark ? 0.58 : 0.55,
          expired ? (dark ? 0.4 : 0.72) : dark ? 0.55 : 0.42,
        );

      const makeNode = (d: LegalDoc) => {
        const dark = isDark();
        const expired = d.status === "expired";
        const color = nodeColor(expired, dark);
        const r = TIER[d.type] === 0 ? 0.24 : TIER[d.type] === 1 ? 0.19 : 0.15;
        /*
          Quả cầu đặc dựng 40×28 thay vì 24×18: ở cỡ này viền hết gợn cạnh khi
          khối quay chậm, và vài chục đỉnh thêm cho mỗi quả là chi phí không
          đáng kể.

          Quả cầu rỗng thì ngược lại, phải để lưới thưa. Vẽ lưới 40×28 ra màn
          hình thì các sợi sít vào nhau thành một mảng đặc, và quy ước "rỗng là
          hết hiệu lực" mất luôn tác dụng phân biệt.
        */
        const mesh = new THREE.Mesh(
          expired
            ? new THREE.SphereGeometry(r, 14, 10)
            : new THREE.SphereGeometry(r, 40, 28),
          new THREE.MeshPhysicalMaterial({
            color,
            roughness: expired ? 0.6 : 0.34,
            metalness: expired ? 0.02 : 0.16,
            /*
              Lớp phủ bóng: một tầng trong suốt nằm trên bề mặt, cho đúng một
              vệt sáng gọn thay vì cả mặt cầu hơi bóng đều. Văn bản hết hiệu
              lực không có lớp này — chúng vốn phải trông xỉn hơn.
            */
            clearcoat: expired ? 0 : 0.65,
            clearcoatRoughness: 0.28,
            // Một chút tự phát sáng để quả cầu không chìm hẳn khi quay vào
            // vùng khuất sáng; giữ rất thấp, nếu không màu sẽ bợt đi.
            emissive: color,
            emissiveIntensity: expired ? 0 : dark ? 0.07 : 0,
            // Văn bản hết hiệu lực vẽ rỗng, giống quy ước đã dùng trên bản đồ
            // hai chiều: người đọc không phải học hai bộ ký hiệu.
            wireframe: expired,
          }),
        );
        // Văn bản hết hiệu lực vẽ rỗng và phải trông xỉn: cho nó phản chiếu thì
        // nó sáng ngang văn bản còn hiệu lực và quy ước rỗng mất tác dụng.
        if (!expired) {
          attachEnvBox(mesh.material as InstanceType<typeof THREE.Material>, envBox);
        }
        mesh.position.copy(pos.get(d.id)!);
        nodeGroup.add(mesh);
        meshes.push({ mesh, doc: d });
      };
      applyEnvBox(isDark());
      docs.forEach(makeNode);

      /*
        Màu được nướng vào chất liệu lúc tạo chứ không đọc từ biến CSS mỗi khung
        hình, nên đổi nền sáng/tối phải sơn lại. Hình khối thì giữ nguyên: quả
        cầu rỗng hay đặc do tình trạng hiệu lực quyết định, không do nền.
      */
      const paintNodes = (dark: boolean) => {
        for (const { mesh, doc } of meshes) {
          const expired = doc.status === "expired";
          const mat = mesh.material as InstanceType<
            typeof THREE.MeshPhysicalMaterial
          >;
          const c = nodeColor(expired, dark);
          mat.color.copy(c);
          mat.emissive.copy(c);
          mat.emissiveIntensity = expired ? 0 : dark ? 0.07 : 0;
        }
      };

      // ── Cạnh ──
      /*
        Màu đổ dọc theo sợi: đầu ở văn bản hướng dẫn nhận màu lĩnh vực, đầu ở
        văn bản cấp trên nhạt về màu đường kẻ. Một sợi cùng một màu chỉ nói
        "có quan hệ"; sợi đổ màu nói thêm quan hệ đó chạy về phía nào, và trong
        một khối đang quay thì đó là khác biệt giữa đọc được và không.
      */
      const edgeMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
      });
      const edgeNeutral = new THREE.Color();
      const edgeTint = new THREE.Color();
      const points: InstanceType<typeof THREE.Vector3>[] = [];
      for (const rel of relations) {
        const a = pos.get(rel.from);
        const b = pos.get(rel.to);
        if (!a || !b) continue;
        points.push(a.clone(), b.clone());
      }
      let edgeColorAttr: InstanceType<typeof THREE.Float32BufferAttribute> | null =
        null;
      if (points.length) {
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        edgeColorAttr = new THREE.Float32BufferAttribute(
          new Float32Array(points.length * 3),
          3,
        );
        geo.setAttribute("color", edgeColorAttr);
        scene.add(new THREE.LineSegments(geo, edgeMat));
      }

      // Mỗi cạnh là hai đỉnh liền nhau, nên bảng màu đi theo bước sáu số: ba số
      // cho đầu mang màu lĩnh vực, ba số cho đầu nhạt về màu đường kẻ.
      const paintEdges = (dark: boolean) => {
        edgeMat.opacity = dark ? 0.8 : 0.7;
        edgeNeutral.set(dark ? 0x6b7280 : 0x9a9184);
        edgeTint.setHSL(hue / 360, dark ? 0.45 : 0.4, dark ? 0.58 : 0.5);
        if (!edgeColorAttr) return;
        const arr = edgeColorAttr.array as Float32Array;
        for (let i = 0; i + 5 < arr.length; i += 6) {
          arr[i] = edgeTint.r;
          arr[i + 1] = edgeTint.g;
          arr[i + 2] = edgeTint.b;
          arr[i + 3] = edgeNeutral.r;
          arr[i + 4] = edgeNeutral.g;
          arr[i + 5] = edgeNeutral.b;
        }
        edgeColorAttr.needsUpdate = true;
      };

      // ── Nhãn: phần tử HTML chiếu theo toạ độ, không phải chữ vẽ trong ảnh ──
      // Chữ HTML nét sắc ở mọi mức thu phóng và tự dùng đúng phông của trang.
      /*
        `overflow: hidden` đặt thẳng bằng style chứ không qua lớp tiện ích. Lớp
        này được gán lúc chạy, nên nó không nằm trong mã nguồn mà Tailwind quét
        để sinh CSS cho từng tuyến; trên trang lĩnh vực, quy tắc tương ứng không
        có trong gói CSS của tuyến và nhãn tràn ra ngoài khung, kéo cả trang cuộn
        ngang hơn một trăm điểm ảnh trên điện thoại. Style nội tuyến thì không
        phụ thuộc vào việc quét.
      */
      const labelLayer = document.createElement("div");
      labelLayer.className = "pointer-events-none absolute inset-0";
      labelLayer.style.overflow = "hidden";
      host.appendChild(labelLayer);
      const labels = meshes.map(({ doc }) => {
        const el = document.createElement("span");
        el.textContent = doc.number;
        el.className =
          "tnum absolute whitespace-nowrap bg-[color-mix(in_oklab,var(--paper)_88%,transparent)] px-1 text-[0.6875rem] leading-tight text-[var(--ink-2)] transition-opacity duration-300 ease-[var(--ease-out-soft)]";
        // Bắt đầu từ mờ hẳn: nhãn đầu tiên cũng hiện lên bằng một lần chuyển
        // màu, chứ không bật ra rồi mới có hiệu ứng từ lần thứ hai.
        el.style.opacity = "0";
        labelLayer.appendChild(el);
        return el;
      });

      // ── Vành tầng và nhãn tầng ──
      // Mỗi tầng có một vòng mảnh nằm ngang kèm tên loại văn bản. Không có hai
      // thứ này thì khối chỉ là một đám cầu lơ lửng; có chúng thì trục đứng nói
      // đúng điều nó muốn nói.
      const TIER_NAME: Record<number, string> = {
        0: t.type.luat,
        1: t.type["nghi-quyet"],
        2: t.type["nghi-dinh"],
        3: t.type["thong-tu"],
      };
      const ringMat = new THREE.LineBasicMaterial({
        transparent: true,
        opacity: 0.9,
      });
      // `on` giữ trạng thái hiện tại để mỗi khung hình không ghi lại một giá trị
      // không đổi — ghi lại sẽ huỷ và khởi động lại hiệu ứng chuyển màu.
      const tierMarks: {
        y: number;
        el: HTMLSpanElement;
        on: boolean;
        w: number;
        h: number;
      }[] = [];
      const tierLabelLayer = document.createElement("div");
      tierLabelLayer.className = "pointer-events-none absolute inset-0";
      tierLabelLayer.style.overflow = "hidden";
      host.appendChild(tierLabelLayer);

      for (const tier of [...byTier.keys()].sort((a, b) => a - b)) {
        const y = tierY(tier);
        const ringPts: InstanceType<typeof THREE.Vector3>[] = [];
        const rr = maxRadius + 0.45;
        for (let i = 0; i <= 72; i++) {
          const a = (i / 72) * Math.PI * 2;
          ringPts.push(new THREE.Vector3(Math.cos(a) * rr, y, Math.sin(a) * rr));
        }
        scene.add(
          new THREE.Line(new THREE.BufferGeometry().setFromPoints(ringPts), ringMat),
        );

        const el = document.createElement("span");
        el.textContent = TIER_NAME[tier] ?? "";
        el.className =
          "eyebrow absolute whitespace-nowrap bg-[color-mix(in_oklab,var(--paper)_88%,transparent)] px-1 transition-opacity duration-300 ease-[var(--ease-out-soft)]";
        el.style.opacity = "0";
        tierLabelLayer.appendChild(el);
        tierMarks.push({ y, el, on: false, w: 48, h: 13 });
      }

      /*
        Kích thước nhãn đo một lần, không đo mỗi khung hình. `offsetWidth` đọc
        ngay sau khi vòng vẽ vừa ghi `transform` buộc trình duyệt dựng lại bố
        cục tại chỗ, một lần cho mỗi nhãn, sáu mươi lượt mỗi giây. Cỡ chữ ở đây
        cố định nên một lần đo là đủ; chỉ đo lại khi phông chữ thật đã thay phông
        dự phòng, vì lúc đó bề rộng mới đổi.
      */
      const labelSize = labels.map(() => ({ w: 54, h: 14 }));
      const measureLabels = () => {
        labels.forEach((el, i) => {
          labelSize[i] = { w: el.offsetWidth || 54, h: el.offsetHeight || 14 };
        });
        for (const mark of tierMarks) {
          mark.w = mark.el.offsetWidth || 48;
          mark.h = mark.el.offsetHeight || 13;
        }
      };
      measureLabels();
      document.fonts?.ready.then(() => {
        if (!disposed) measureLabels();
      });

      /*
        Một chỗ duy nhất đặt toàn bộ màu theo nền sáng hay tối. Trước đây màu
        được đọc một lần lúc dựng scene, nên sau khi bấm nút đổi nền thì khối
        vẫn đứng dưới bảng màu cũ: quả cầu, cạnh và vành tầng giữ nguyên độ sáng
        của nền kia, còn chữ quanh nó thì đã đổi. Vật thể biểu trưng ở đầu trang
        vốn đã xử lý đúng việc này, nên hai khối trên cùng một trang lệch nhau.
      */
      const applyTheme = (dark: boolean) => {
        applyEnvBox(dark);
        applyLighting(dark);
        paintNodes(dark);
        paintEdges(dark);
        ringMat.color.set(dark ? 0x4a5058 : 0xc4bbaa);
      };
      applyTheme(isDark());

      // ── Máy ảnh quay quanh khối ──
      /*
        Mỗi trục có hai giá trị: giá trị đang vẽ và giá trị muốn tới. Khung hình
        nào cũng kéo giá trị đang vẽ về phía giá trị muốn tới theo hàm mũ, nên
        thao tác nào cũng vào chỗ bằng một đường cong chứ không bằng một bước
        nhảy. Đây là chỗ khác biệt giữa "quay được" và "quay mượt".

        Trục ngang thì không dùng đích mà dùng vận tốc: kéo tay là đặt vận tốc,
        thả tay là để vận tốc tan dần rồi hoà về nhịp tự quay. Nếu ép trục ngang
        theo đích thì khối dừng đánh rụp ngay khi nhấc tay, mất hẳn cảm giác
        quán tính của một vật thật.
      */
      const AUTO_SPIN = 0.11;
      let yaw = 0.7;
      let yawVel = AUTO_SPIN;
      // Góc nhìn thấp: gần ngang tầm mắt thì chênh lệch độ cao giữa các tầng đọc
      // được ngay, nhìn từ trên xuống thì không.
      let pitch = 0.16;
      let pitchTarget = pitch;
      let dist = 8.6;
      let distTarget = dist;

      /*
        Tiến dần về đích, không phụ thuộc tốc độ khung hình. `tau` là thời gian
        để đi hết khoảng 63% quãng còn lại. Viết theo kiểu `cur += (target-cur)
        * 0.1` thì máy chạy 120 khung hình mỗi giây sẽ tới đích nhanh gấp đôi
        máy chạy 60 — cùng một đoạn mã cho ra hai tốc độ khác nhau.
      */
      const approach = (cur: number, target: number, tau: number, dt: number) =>
        cur + (target - cur) * (1 - Math.exp(-dt / tau));
      // Nhìn vào giữa những tầng thực sự có văn bản. Lĩnh vực chỉ có luật và
      // nghị định mà vẫn ngắm vào tâm bốn tầng thì khối dồn lên nửa trên khung
      // và nửa dưới bỏ trống.
      const tiers = [...byTier.keys()];
      const centerY = (tierY(Math.min(...tiers)) + tierY(Math.max(...tiers))) / 2;

      const applyCamera = () => {
        camera.position.set(
          Math.sin(yaw) * Math.cos(pitch) * dist,
          centerY + Math.sin(pitch) * dist,
          Math.cos(yaw) * Math.cos(pitch) * dist,
        );
        camera.lookAt(0, centerY, 0);
      };

      let dragging = false;
      let dragMoved = false;
      let lastX = 0;
      let lastY = 0;
      let lastMoveAt = 0;
      // Vận tốc ném, đo bằng radian mỗi giây, làm mượt qua vài lần di chuột.
      let flingVel = 0;

      const onDown = (e: PointerEvent) => {
        dragging = true;
        dragMoved = false;
        lastX = e.clientX;
        lastY = e.clientY;
        lastMoveAt = e.timeStamp;
        flingVel = 0;
        yawVel = 0;
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = "grabbing";
      };

      const onMove = (e: PointerEvent) => {
        if (!dragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        if (Math.abs(dx) + Math.abs(dy) > 3) dragMoved = true;

        const dYaw = -dx * 0.006;
        // Trục ngang bám tay ngay lập tức. Cho nó đi qua bộ giảm chấn nữa thì
        // khối lê sau con trỏ, và độ trễ đó đọc ra là chậm chứ không phải mượt.
        yaw += dYaw;
        // Chặn ở gần hai cực: qua khỏi đó thì hình lộn ngược và trục thứ bậc,
        // thứ duy nhất khối này muốn nói, không còn đọc được.
        pitchTarget = Math.max(-0.25, Math.min(1.15, pitchTarget + dy * 0.005));

        /*
          Vận tốc ném lấy trung bình trượt chứ không lấy đúng lần di chuột cuối.
          Ngón tay hay khựng lại ngay trước khi nhấc lên; đọc mỗi lần cuối thì
          một cú ném dài thường ra vận tốc gần bằng không.
        */
        const gap = Math.max((e.timeStamp - lastMoveAt) / 1000, 1 / 240);
        lastMoveAt = e.timeStamp;
        flingVel = flingVel * 0.72 + (dYaw / gap) * 0.28;
      };

      const onUp = (e: PointerEvent) => {
        if (dragging) {
          // Chặn trên: một cú vẩy rất nhanh vẫn không được phép biến khối thành
          // cái chong chóng, vì lúc đó nhãn không kịp đọc.
          yawVel = Math.max(-4, Math.min(4, flingVel));
        }
        dragging = false;
        canvas.style.cursor = "grab";
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
      };

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        // Chỉ dời đích. Khoảng cách thật do vòng vẽ kéo tới, nên một nấc lăn
        // chuột thành một chuyển động vào chỗ chứ không phải một cú giật.
        distTarget = Math.max(4, Math.min(13, distTarget * Math.exp(e.deltaY * 0.0012)));
      };

      // ── Bấm vào một điểm để mở văn bản ──
      const ray = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const pick = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect();
        ndc.set(
          ((e.clientX - r.left) / r.width) * 2 - 1,
          -((e.clientY - r.top) / r.height) * 2 + 1,
        );
        ray.setFromCamera(ndc, camera);
        const hit = ray.intersectObjects(nodeGroup.children, false)[0];
        if (!hit) return null;
        return meshes.find((m) => m.mesh === hit.object) ?? null;
      };
      const onClick = (e: PointerEvent) => {
        if (dragMoved) return;
        const found = pick(e);
        if (found) router.push(`/${lang}/van-ban/${found.doc.id}`);
      };
      const onHover = (e: PointerEvent) => {
        if (dragging) return;
        canvas.style.cursor = pick(e) ? "pointer" : "grab";
      };

      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointermove", onHover);
      canvas.addEventListener("pointerup", onUp);
      canvas.addEventListener("pointercancel", onUp);
      canvas.addEventListener("click", onClick as EventListener);
      canvas.addEventListener("wheel", onWheel, { passive: false });

      const resize = () => {
        const r = host.getBoundingClientRect();
        const w = Math.max(1, Math.round(r.width));
        const h = Math.max(1, Math.round(r.height));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        applyCamera();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
      let visible = true;
      let raf: number | null = null;
      let last = performance.now();
      const project = new THREE.Vector3();
      // Tập nhãn đang hiện ở khung hình trước, dùng cho thứ tự ưu tiên bên dưới.
      let shownPrev = new Set<number>();

      const frame = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;

        if (!dragging) {
          /*
            Tự quay chậm cho tới khi người dùng chạm vào, để khối tự cho biết
            nó xoay được mà không cần một dòng hướng dẫn nữa. Sau khi thả tay,
            vận tốc ném tan dần về đúng nhịp này — không có một mốc nào để mắt
            nhận ra khối đã hết trớn và bắt đầu tự quay.

            Người đã tắt hiệu ứng chuyển động thì nhịp nền bằng không: cú ném
            của chính họ vẫn chạy hết đà rồi dừng hẳn, và khối không tự động
            làm gì thêm.
          */
          const idle = reduce.matches ? 0 : AUTO_SPIN;
          yawVel = idle + (yawVel - idle) * Math.exp(-dt / 0.6);
          yaw += yawVel * dt;
        }
        pitch = approach(pitch, pitchTarget, 0.1, dt);
        dist = approach(dist, distTarget, 0.13, dt);
        applyCamera();

        renderer.render(scene, camera);

        // Nhãn: chiếu toạ độ, xếp theo độ sâu rồi bỏ nhãn nào giao với nhãn đã
        // đặt — cùng cách chống chồng chữ như bản đồ hai chiều.
        const r = canvas.getBoundingClientRect();
        const cand = meshes.map(({ mesh }, i) => {
          project.copy(mesh.position).project(camera);
          return {
            i,
            x: ((project.x + 1) / 2) * r.width,
            y: ((1 - project.y) / 2) * r.height,
            z: project.z,
          };
        });
        /*
          Nhãn đang hiện được xét trước, rồi mới tới nhãn ở gần. Nếu chỉ xếp
          theo độ sâu thì mỗi lần khối quay, một nhãn vừa nhích lên trước sẽ
          hất nhãn đang hiện ra khỏi chỗ, và cả vùng chữ nhấp nháy liên tục.
          Cho nhãn đang hiện quyền giữ chỗ là đủ để hết nhấp nháy, mà vẫn không
          giữ lại nhãn nào đã quay ra sau lưng — chỗ đó do phép thử độ sâu ở
          dưới loại đi.
        */
        cand.sort(
          (a, b) =>
            Number(shownPrev.has(b.i)) - Number(shownPrev.has(a.i)) || a.z - b.z,
        );
        const placed: { x1: number; y1: number; x2: number; y2: number }[] = [];

        // Nhãn tầng đặt trước và chiếm chỗ trước: tên tầng là khung đọc của cả
        // khối, số hiệu văn bản thì còn tra được ở danh sách bên dưới.
        // Hướng "sang trái của người xem" trên mặt phẳng ngang là vector vuông
        // góc với hướng nhìn, nên nhãn luôn nằm ngoài rìa vành tầng dù khối quay.
        const side = new THREE.Vector3();
        for (const mark of tierMarks) {
          side
            .set(-Math.cos(yaw), 0, Math.sin(yaw))
            .multiplyScalar(maxRadius + 0.75);
          side.y = mark.y;
          side.project(camera);
          const x = ((side.x + 1) / 2) * r.width;
          const y = ((1 - side.y) / 2) * r.height;
          const mw = mark.w;
          const mh = mark.h;
          const visibleMark = side.z <= 1 && x > 2 && x + mw < r.width - 2;
          if (visibleMark !== mark.on) {
            mark.el.style.opacity = visibleMark ? "1" : "0";
            mark.on = visibleMark;
          }
          if (!visibleMark) continue;
          mark.el.style.transform = `translate(${Math.round(x)}px, ${Math.round(
            y - mh / 2,
          )}px)`;
          placed.push({ x1: x - 4, y1: y - mh / 2 - 2, x2: x + mw + 4, y2: y + mh / 2 + 2 });
        }

        const shown = new Set<number>();
        for (const c of cand) {
          if (c.z > 1) continue;
          const el = labels[c.i];
          const { w, h } = labelSize[c.i];
          // Đẩy nhãn ra khỏi bán kính quả cầu lớn nhất, nếu không thì chữ đầu
          // của số hiệu bị chính quả cầu che mất.
          const box = { x1: c.x + 15, y1: c.y - h / 2, x2: c.x + 15 + w, y2: c.y + h / 2 };
          if (box.x2 > r.width - 2 || box.x1 < 2) continue;
          const clash = placed.some(
            (b) => box.x1 < b.x2 && box.x2 > b.x1 && box.y1 < b.y2 && box.y2 > b.y1,
          );
          if (clash) continue;
          placed.push(box);
          shown.add(c.i);
          el.style.transform = `translate(${Math.round(box.x1)}px, ${Math.round(box.y1)}px)`;
          // Chỉ ghi khi trạng thái đổi. Ghi lại cùng một giá trị mỗi khung hình
          // khiến trình duyệt huỷ và khởi động lại hiệu ứng chuyển màu.
          if (!shownPrev.has(c.i)) el.style.opacity = "1";
        }
        labels.forEach((el, i) => {
          if (!shown.has(i) && shownPrev.has(i)) el.style.opacity = "0";
        });
        shownPrev = shown;


        raf = visible ? requestAnimationFrame(frame) : null;
      };
      raf = requestAnimationFrame(frame);

      const setVisible = (v: boolean) => {
        if (v === visible) return;
        visible = v;
        if (v && raf === null) {
          last = performance.now();
          raf = requestAnimationFrame(frame);
        }
      };
      const io = new IntersectionObserver(
        ([e]) => setVisible(e.isIntersecting && !document.hidden),
        { threshold: 0.02 },
      );
      io.observe(host);
      const onVis = () => setVisible(!document.hidden);
      document.addEventListener("visibilitychange", onVis);

      // Hai nguồn đổi nền: thuộc tính `data-theme` do nút trên thanh điều hướng
      // ghi, và cài đặt của hệ điều hành khi người dùng chưa bấm gì.
      const onTheme = () => applyTheme(isDark());
      const themeObserver = new MutationObserver(onTheme);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
      const themeMq = window.matchMedia("(prefers-color-scheme: dark)");
      themeMq.addEventListener("change", onTheme);

      cleanup = () => {
        if (raf !== null) cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        themeObserver.disconnect();
        themeMq.removeEventListener("change", onTheme);
        document.removeEventListener("visibilitychange", onVis);
        canvas.removeEventListener("pointerdown", onDown);
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointermove", onHover);
        canvas.removeEventListener("pointerup", onUp);
        canvas.removeEventListener("pointercancel", onUp);
        canvas.removeEventListener("click", onClick as EventListener);
        canvas.removeEventListener("wheel", onWheel);
        scene.traverse((o) => {
          const m = o as unknown as {
            geometry?: { dispose(): void };
            material?: { dispose(): void };
          };
          m.geometry?.dispose();
          m.material?.dispose();
        });
        renderer.dispose();
        canvas.remove();
        labelLayer.remove();
        tierLabelLayer.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [docs, relations, lang, domain, hue, router]);

  /*
    Ẩn khỏi cây trợ năng: khối này chỉ thao tác được bằng chuột và ngón tay, và
    mọi văn bản trong đó đều có mặt ở danh sách chữ ngay dưới trang, nơi dùng
    được bằng bàn phím và trình đọc màn hình. Để nó lộ ra thì trình đọc màn hình
    thông báo một vùng trống không đi vào được.
  */
  return (
    <div ref={hostRef} aria-hidden="true" className={`relative ${className ?? ""}`} />
  );
}
