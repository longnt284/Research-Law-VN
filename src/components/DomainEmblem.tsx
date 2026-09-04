"use client";

import { useEffect, useRef } from "react";

import type { DomainId } from "@/data/types";

/**
 * Vật thể biểu trưng ba chiều của một lĩnh vực, xoay chậm.
 *
 * Ba quyết định đáng nói:
 *
 * Thư viện three được nạp động, chỉ khi thành phần này thật sự xuất hiện. Trang
 * bản đồ và trang danh mục không tải một byte nào của nó.
 *
 * Vòng vẽ dừng khi khối lăn ra khỏi tầm nhìn, khi người dùng chuyển sang thẻ
 * khác, và khi hệ điều hành báo đã tắt hiệu ứng chuyển động. Một vật trang trí
 * không có quyền quay nền suốt phiên làm việc và ăn pin của người đọc.
 *
 * Nền để trong suốt nên khối nằm trên nền giấy của trang, không phải trên một
 * ô đen viền cứng.
 */
export function DomainEmblem({
  id,
  hue,
  className,
}: {
  id: DomainId;
  hue: number;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const THREE = await import("three");
      if (disposed || !hostRef.current) return;

      const isDark = () => {
        const attr = document.documentElement.dataset.theme;
        if (attr === "dark") return true;
        if (attr === "light") return false;
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
      };

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setClearAlpha(0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      host.appendChild(renderer.domElement);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.style.display = "block";

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      camera.position.set(2.6, 1.9, 3.4);
      camera.lookAt(0, -0.05, 0);

      scene.add(new THREE.AmbientLight(0xffffff, isDark() ? 1.5 : 2.1));
      const key = new THREE.DirectionalLight(0xffffff, isDark() ? 1.7 : 2.2);
      key.position.set(3, 5, 4);
      scene.add(key);
      const fill = new THREE.DirectionalLight(0xffffff, 0.6);
      fill.position.set(-4, 1, -2);
      scene.add(fill);

      const { buildEmblem } = await import("@/lib/emblem");
      if (disposed) return;

      let root = buildEmblem(THREE, id, hue, isDark());
      scene.add(root);

      const resize = () => {
        const r = host.getBoundingClientRect();
        const w = Math.max(1, Math.round(r.width));
        const h = Math.max(1, Math.round(r.height));
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
      let visible = true;
      let raf: number | null = null;
      let last = performance.now();

      const frame = (now: number) => {
        const dt = Math.min((now - last) / 1000, 0.1);
        last = now;
        if (!reduce.matches) {
          root.rotation.y += dt * 0.35;
          // Cánh quạt của tua-bin quay nhanh hơn thân, nếu không thì nó chỉ là
          // một cái cột trôi ngang.
          const spin = root.getObjectByName("spin");
          if (spin) spin.rotation.z += dt * 1.1;
        }
        renderer.render(scene, camera);
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
        { threshold: 0.05 },
      );
      io.observe(host);
      const onVis = () => setVisible(!document.hidden);
      document.addEventListener("visibilitychange", onVis);

      // Đổi nền sáng/tối thì màu vật thể phải dựng lại: màu được nướng vào chất
      // liệu lúc tạo chứ không đọc từ biến CSS mỗi khung hình.
      const rebuild = () => {
        scene.remove(root);
        root.traverse((o) => {
          const mesh = o as unknown as {
            geometry?: { dispose(): void };
            material?: { dispose(): void };
          };
          mesh.geometry?.dispose();
          mesh.material?.dispose();
        });
        root = buildEmblem(THREE, id, hue, isDark());
        scene.add(root);
        renderer.render(scene, camera);
      };
      const themeObserver = new MutationObserver(rebuild);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", rebuild);

      cleanup = () => {
        if (raf !== null) cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        themeObserver.disconnect();
        mq.removeEventListener("change", rebuild);
        document.removeEventListener("visibilitychange", onVis);
        root.traverse((o) => {
          const mesh = o as unknown as {
            geometry?: { dispose(): void };
            material?: { dispose(): void };
          };
          mesh.geometry?.dispose();
          mesh.material?.dispose();
        });
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [id, hue]);

  return <div ref={hostRef} aria-hidden="true" className={className} />;
}
