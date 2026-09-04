"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import type { DomainId, Lang, LegalDoc, Relation } from "@/data/types";
import { getDict } from "@/i18n/dictionary";

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
        const radius = list.length === 1 ? 0 : Math.min(1.9, 0.45 + list.length * 0.18);
        maxRadius = Math.max(maxRadius, radius);
        list.forEach((d, i) => {
          const a = (i / list.length) * Math.PI * 2 + tier * 0.6;
          pos.set(
            d.id,
            new THREE.Vector3(Math.cos(a) * radius, tierY(tier), Math.sin(a) * radius),
          );
        });
      }

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setClearAlpha(0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      host.appendChild(renderer.domElement);
      const canvas = renderer.domElement;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      canvas.style.touchAction = "none";
      canvas.style.cursor = "grab";

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      scene.add(new THREE.AmbientLight(0xffffff, 2));
      const key = new THREE.DirectionalLight(0xffffff, 1.6);
      key.position.set(3, 6, 4);
      scene.add(key);

      const nodeGroup = new THREE.Group();
      scene.add(nodeGroup);
      const meshes: { mesh: InstanceType<typeof THREE.Mesh>; doc: LegalDoc }[] = [];

      const makeNode = (d: LegalDoc) => {
        const dark = isDark();
        const expired = d.status === "expired";
        const color = new THREE.Color().setHSL(
          hue / 360,
          expired ? 0 : dark ? 0.5 : 0.45,
          expired ? (dark ? 0.4 : 0.72) : dark ? 0.62 : 0.44,
        );
        const r = TIER[d.type] === 0 ? 0.24 : TIER[d.type] === 1 ? 0.19 : 0.15;
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(r, 24, 18),
          new THREE.MeshStandardMaterial({
            color,
            roughness: 0.5,
            metalness: 0.05,
            // Văn bản hết hiệu lực vẽ rỗng, giống quy ước đã dùng trên bản đồ
            // hai chiều: người đọc không phải học hai bộ ký hiệu.
            wireframe: expired,
          }),
        );
        mesh.position.copy(pos.get(d.id)!);
        nodeGroup.add(mesh);
        meshes.push({ mesh, doc: d });
      };
      docs.forEach(makeNode);

      // ── Cạnh ──
      const edgeMat = new THREE.LineBasicMaterial({
        color: new THREE.Color(isDark() ? 0x6b7280 : 0x9a9184),
        transparent: true,
        opacity: 0.75,
      });
      const points: InstanceType<typeof THREE.Vector3>[] = [];
      for (const rel of relations) {
        const a = pos.get(rel.from);
        const b = pos.get(rel.to);
        if (!a || !b) continue;
        points.push(a.clone(), b.clone());
      }
      if (points.length) {
        const geo = new THREE.BufferGeometry().setFromPoints(points);
        scene.add(new THREE.LineSegments(geo, edgeMat));
      }

      // ── Nhãn: phần tử HTML chiếu theo toạ độ, không phải chữ vẽ trong ảnh ──
      // Chữ HTML nét sắc ở mọi mức thu phóng và tự dùng đúng phông của trang.
      const labelLayer = document.createElement("div");
      labelLayer.className = "pointer-events-none absolute inset-0 overflow-hidden";
      host.appendChild(labelLayer);
      const labels = meshes.map(({ doc }) => {
        const el = document.createElement("span");
        el.textContent = doc.number;
        el.className =
          "tnum absolute whitespace-nowrap bg-[color-mix(in_oklab,var(--paper)_88%,transparent)] px-1 text-[0.6875rem] leading-tight text-[var(--ink-2)]";
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
        color: new THREE.Color(isDark() ? 0x4a5058 : 0xc4bbaa),
        transparent: true,
        opacity: 0.9,
      });
      const tierMarks: { y: number; el: HTMLSpanElement }[] = [];
      const tierLabelLayer = document.createElement("div");
      tierLabelLayer.className = "pointer-events-none absolute inset-0 overflow-hidden";
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
          "eyebrow absolute whitespace-nowrap bg-[color-mix(in_oklab,var(--paper)_88%,transparent)] px-1";
        tierLabelLayer.appendChild(el);
        tierMarks.push({ y, el });
      }

      // ── Máy ảnh quay quanh khối ──
      let yaw = 0.7;
      // Góc nhìn thấp: gần ngang tầm mắt thì chênh lệch độ cao giữa các tầng đọc
      // được ngay, nhìn từ trên xuống thì không.
      let pitch = 0.16;
      let dist = 8.6;
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
      const onDown = (e: PointerEvent) => {
        dragging = true;
        dragMoved = false;
        lastX = e.clientX;
        lastY = e.clientY;
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
        yaw -= dx * 0.006;
        // Chặn ở gần hai cực: qua khỏi đó thì hình lộn ngược và trục thứ bậc,
        // thứ duy nhất khối này muốn nói, không còn đọc được.
        pitch = Math.max(-0.25, Math.min(1.15, pitch + dy * 0.005));
        applyCamera();
      };
      const onUp = (e: PointerEvent) => {
        dragging = false;
        canvas.style.cursor = "grab";
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
      };
      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        dist = Math.max(4, Math.min(13, dist * Math.exp(e.deltaY * 0.0012)));
        applyCamera();
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

      const frame = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        // Tự quay chậm cho tới khi người dùng chạm vào, để khối tự cho biết nó
        // xoay được mà không cần một dòng hướng dẫn nữa.
        if (!dragging && !reduce.matches) {
          yaw += dt * 0.12;
          applyCamera();
        }
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
        cand.sort((a, b) => a.z - b.z);
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
          const mw = mark.el.offsetWidth || 48;
          const mh = mark.el.offsetHeight || 13;
          const visibleMark = side.z <= 1 && x > 2 && x + mw < r.width - 2;
          mark.el.style.opacity = visibleMark ? "1" : "0";
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
          const w = el.offsetWidth || 54;
          const h = el.offsetHeight || 14;
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
          el.style.opacity = "1";
        }
        labels.forEach((el, i) => {
          if (!shown.has(i)) el.style.opacity = "0";
        });


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

      cleanup = () => {
        if (raf !== null) cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
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

  return <div ref={hostRef} className={`relative ${className ?? ""}`} />;
}
