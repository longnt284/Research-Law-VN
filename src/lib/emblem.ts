import type * as THREE_NS from "three";

import type { DomainId } from "@/data/types";

/**
 * Vật thể biểu trưng cho từng lĩnh vực, dựng bằng hình khối cơ bản.
 *
 * Chủ ý: không dùng file mô hình .glb. Một tệp mô hình cho tám lĩnh vực là vài
 * megabyte tải thêm, phải kèm giấy phép sử dụng, và khi cần sửa thì phải mở
 * phần mềm dựng hình. Hình khối cơ bản dựng trong mã nguồn nặng vài trăm byte,
 * đổi màu theo lĩnh vực được, và sửa bằng cách sửa một con số.
 *
 * Mỗi vật thể nằm gọn trong khối lập phương cạnh 2, tâm ở gốc toạ độ, để máy
 * ảnh đặt một lần dùng chung cho cả tám.
 */
export function buildEmblem(
  THREE: typeof THREE_NS,
  id: DomainId,
  hue: number,
  dark: boolean,
): THREE_NS.Group {
  const group = new THREE.Group();

  const color = new THREE.Color().setHSL(hue / 360, dark ? 0.5 : 0.42, dark ? 0.6 : 0.45);
  const colorSoft = new THREE.Color().setHSL(
    hue / 360,
    dark ? 0.32 : 0.26,
    dark ? 0.42 : 0.68,
  );

  const solid = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.55,
    metalness: 0.08,
  });
  const soft = new THREE.MeshStandardMaterial({
    color: colorSoft,
    roughness: 0.7,
    metalness: 0.04,
  });

  const box = (
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    mat = solid,
  ) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    group.add(m);
    return m;
  };

  const cyl = (
    rt: number,
    rb: number,
    h: number,
    x: number,
    y: number,
    z: number,
    mat = solid,
  ) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, 24), mat);
    m.position.set(x, y, z);
    group.add(m);
    return m;
  };

  switch (id) {
    // Ba khối nhà cao thấp và một cần trục: hình ảnh của một công trường.
    case "xay-dung": {
      box(0.5, 1.4, 0.5, -0.55, -0.3, 0);
      box(0.5, 0.9, 0.5, 0.05, -0.55, 0.1, soft);
      box(0.45, 0.6, 0.45, 0.6, -0.7, -0.1);
      const mast = cyl(0.04, 0.04, 1.9, 0.75, 0.05, 0.35, soft);
      mast.name = "static";
      box(0.9, 0.06, 0.06, 0.45, 0.95, 0.35, solid);
      cyl(0.02, 0.02, 0.3, 0.15, 0.8, 0.35, solid);
      break;
    }

    // Tua-bin gió: trụ và ba cánh, rotor quay chậm.
    case "nang-luong": {
      cyl(0.06, 0.11, 1.7, 0, -0.15, 0, soft);
      const rotor = new THREE.Group();
      rotor.position.set(0, 0.72, 0.1);
      for (let i = 0; i < 3; i++) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.85, 0.03), solid);
        blade.position.set(0, 0.42, 0);
        const arm = new THREE.Group();
        arm.rotation.z = (i * Math.PI * 2) / 3;
        arm.add(blade);
        rotor.add(arm);
      }
      const hub = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), solid);
      rotor.add(hub);
      rotor.name = "spin";
      group.add(rotor);
      break;
    }

    // Hai tờ văn bản chồng nhau và một con dấu đặt bên trên.
    case "hop-dong": {
      const a = box(1.15, 0.04, 0.85, -0.12, -0.35, 0.05, soft);
      a.rotation.set(0, 0.18, 0);
      const b = box(1.15, 0.04, 0.85, 0.08, -0.25, -0.08, solid);
      b.rotation.set(0, -0.14, 0);
      cyl(0.26, 0.26, 0.1, 0.15, 0.02, 0.1, solid);
      cyl(0.12, 0.12, 0.45, 0.15, 0.28, 0.1, soft);
      break;
    }

    // Cân công lý: trụ, đòn ngang và hai đĩa treo.
    case "to-tung": {
      cyl(0.4, 0.45, 0.09, 0, -0.85, 0, soft);
      cyl(0.05, 0.05, 1.5, 0, -0.1, 0, soft);
      box(1.6, 0.06, 0.06, 0, 0.65, 0, solid);
      for (const x of [-0.7, 0.7]) {
        cyl(0.01, 0.01, 0.42, x, 0.44, 0, soft);
        cyl(0.26, 0.2, 0.07, x, 0.2, 0, solid);
      }
      break;
    }

    // Sơ đồ tổ chức: một khối trên, hai khối giữa, ba khối dưới.
    case "doanh-nghiep": {
      box(0.42, 0.42, 0.42, 0, 0.62, 0);
      box(0.36, 0.36, 0.36, -0.42, 0.02, 0, soft);
      box(0.36, 0.36, 0.36, 0.42, 0.02, 0, soft);
      box(0.3, 0.3, 0.3, -0.62, -0.58, 0);
      box(0.3, 0.3, 0.3, 0, -0.58, 0);
      box(0.3, 0.3, 0.3, 0.62, -0.58, 0);
      break;
    }

    // Bốn cột tăng dần và một mũi tên đi lên.
    case "dau-tu": {
      const hs = [0.4, 0.7, 1.0, 1.35];
      hs.forEach((h, i) => {
        box(0.28, h, 0.28, -0.72 + i * 0.42, -0.9 + h / 2, 0, i === 3 ? solid : soft);
      });
      const shaft = cyl(0.035, 0.035, 1.0, 0.15, 0.3, 0.42, solid);
      shaft.rotation.z = -0.72;
      const head = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.3, 20), solid);
      head.position.set(0.5, 0.72, 0.42);
      head.rotation.z = -0.72;
      group.add(head);
      break;
    }

    // Năm trụ đứng thành vòng cung: một tập thể lao động.
    case "lao-dong": {
      for (let i = 0; i < 5; i++) {
        const a = -0.9 + (i * 1.8) / 4;
        const x = Math.sin(a) * 0.72;
        const z = Math.cos(a) * 0.4 - 0.1;
        const h = 0.62 + (i % 2) * 0.16;
        cyl(0.13, 0.15, h, x, -0.5 + h / 2, z, i % 2 ? soft : solid);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 18, 14), solid);
        head.position.set(x, -0.5 + h + 0.14, z);
        group.add(head);
      }
      break;
    }

    // Chồng đồng xu lệch nhau.
    case "thue": {
      for (let i = 0; i < 6; i++) {
        const c = cyl(
          0.46,
          0.46,
          0.13,
          Math.sin(i * 1.1) * 0.07,
          -0.75 + i * 0.16,
          Math.cos(i * 1.1) * 0.07,
          i % 2 ? soft : solid,
        );
        c.rotation.set(0.04, i * 0.4, 0.03);
      }
      break;
    }
  }

  return group;
}
