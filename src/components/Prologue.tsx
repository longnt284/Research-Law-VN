"use client";

import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Component, useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { PointerState, SpaceSignal } from "@/components/LegalSpace";
import { domains, VERIFIED_ON } from "@/data/documents";
import type { Lang } from "@/data/types";
import { formatDate, getDict } from "@/i18n/dictionary";
import { getPrologue } from "@/i18n/prologue";
import { ACT_COUNT, buildSpace } from "@/lib/space";

/**
 * Phần mở đầu của trang chủ.
 *
 * Sáu màn chữ cuộn trên một cảnh ba chiều duy nhất. Chữ và cảnh đọc chung một
 * nguồn tiến độ: `ScrollTrigger` ghi vào `signal`, cảnh đọc `signal` trong vòng
 * lặp vẽ. Không có trạng thái React nào đổi theo từng khung hình, nên cuộn
 * không kéo theo một lượt dựng lại cây React nào.
 *
 * Ba điều kiện để phần này không bao giờ chặn nội dung. Toàn bộ chữ nằm trong
 * HTML dựng sẵn, đọc được khi JavaScript bị chặn. Chuyển động chỉ do GSAP đặt,
 * nên gói mã hỏng thì chữ vẫn hiện chứ không mất. Và cảnh ba chiều nằm sau một
 * ranh giới lỗi: WebGL không dựng được thì trang tiếp tục như một trang chữ.
 */

// ScrollTrigger và ScrollToPlugin đụng tới `window` ngay khi đăng ký. Thành phần
// này tuy là client component nhưng vẫn được dựng một lượt ở máy chủ để lấy HTML
// tĩnh, nên phép đăng ký phải đứng sau một lần kiểm tra môi trường.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  ScrollTrigger.config({ ignoreMobileResize: true });
}

// Cảnh chỉ tải ở trình duyệt: dựng ở máy chủ thì `three` vào thẳng gói HTML mà
// không vẽ được gì, còn `next/dynamic` giữ nó ở một chunk riêng tải sau.
const LegalSpace = dynamic(() => import("@/components/LegalSpace"), { ssr: false });

/** Đọc hash ngay lúc nạp module, trước khi bất kỳ hiệu ứng nào kịp ghi đè địa chỉ. */
const INITIAL_HASH =
  typeof location === "undefined" ? "" : decodeURIComponent(location.hash.slice(1));

/** Chữ số khổng lồ phía sau mỗi màn trôi mỗi màn một tốc độ; chênh lệch đó là thứ tạo chiều sâu. */
const DRIFT = [-12, -20, -27, -22, -30, -14];
/** Bên đặt khối chữ. Hai màn cuối căn đáy để nhường chỗ cho trục thời gian và lối vào. */
const SIDE = ["left", "right", "left", "right", "wide", "close"] as const;

function readIsLight(): boolean {
  if (typeof document === "undefined") return true;
  const set = document.documentElement.dataset.theme;
  if (set === "light") return true;
  if (set === "dark") return false;
  return !window.matchMedia("(prefers-color-scheme: dark)").matches;
}

class SceneBoundary extends Component<
  { children: React.ReactNode; onError: () => void; message: string },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  // Cảnh hỏng thì màn mở đầu phải nhấc lên ngay, không bắt người đọc chờ hết thời gian dự phòng.
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? (
      <p className="space-note" role="status">
        {this.props.message}
      </p>
    ) : (
      this.props.children
    );
  }
}

export function Prologue({ lang }: { lang: Lang }) {
  const t = getDict(lang);
  const p = getPrologue(lang);
  const space = useMemo(buildSpace, []);

  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pointerOn, setPointerOn] = useState(true);
  const [light, setLight] = useState(true);
  const [hidden, setHidden] = useState(false);
  const [ready, setReady] = useState(false);
  const [panel, setPanel] = useState(false);
  const [inView, setInView] = useState(true);
  const [routed, setRouted] = useState(false);

  const signal = useRef<SpaceSignal>({ p: 0, smooth: 0, v: 0, turn: 0, invalidate: null });
  const pointer = useRef<PointerState>({ x: 0, y: 0 });
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const rail = useRef<HTMLSpanElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelButton = useRef<HTMLButtonElement>(null);
  /** Người đọc đã tự chọn trong bảng tùy chỉnh; từ lúc đó hệ điều hành không ghi đè nữa. */
  const ownReduced = useRef(false);

  // Giao diện sáng tối do `ThemeToggle` ghi lên thẻ <html>. Cảnh phải đọc lại giá
  // trị đó chứ không giữ một bản sao riêng, nếu không đổi nền xong cảnh vẫn giữ
  // bảng màu cũ. Quan sát viên bắt cả trường hợp người đọc đổi cài đặt hệ điều hành.
  useEffect(() => {
    setLight(readIsLight());
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const observer = new MutationObserver(() => setLight(readIsLight()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => setLight(readIsLight());
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => {
      if (!ownReduced.current) setReduced(motion.matches);
    };
    const onVisibility = () => setHidden(document.hidden);
    scheme.addEventListener("change", onScheme);
    motion.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      scheme.removeEventListener("change", onScheme);
      motion.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // `html { scroll-behavior: smooth }` của trang và `ScrollToPlugin` cùng muốn
  // điều khiển vị trí cuộn: trình duyệt nội suy tới đích trong khi GSAP cũng đang
  // ghi từng khung hình, và kết quả là cú nhảy chương giật rồi dừng sai chỗ. Phần
  // mở đầu vì vậy tắt cuộn mượt của trình duyệt trong lúc nó còn trên màn hình và
  // trả lại nguyên trạng khi rời đi, để các trang còn lại không bị ảnh hưởng.
  useEffect(() => {
    const el = document.documentElement;
    const previous = el.style.scrollBehavior;
    el.style.scrollBehavior = "auto";
    return () => {
      el.style.scrollBehavior = previous;
    };
  }, []);

  // Thanh chương và thanh tiến độ là hai phần tử cố định; qua khỏi phần mở đầu
  // chúng che mất chân trang. Điều kiện ẩn đo thẳng trên khối các màn chữ bằng một
  // quan sát viên giao cắt, không suy ra từ mốc cuộn: mốc cuộn còn phải đo lại mỗi
  // lần bố cục đổi, còn "khối này có còn nằm trong khung hình không" thì luôn đúng,
  // kể cả khi người đọc mở thẳng một liên kết sâu vào giữa trang.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  // Màn mở đầu nhấc lên khi cảnh thật sự vẽ xong. Thời gian dự phòng để trang
  // không bao giờ kẹt sau tấm màn khi gói mã của cảnh tải hỏng.
  useEffect(() => {
    const id = setTimeout(() => setReady(true), 4200);
    return () => clearTimeout(id);
  }, []);

  // Cùng giao ước với `Reveal`: báo cho đoạn script ở đầu <body> biết gói mã của
  // trang đã chạy được, để nó không gỡ lớp `js` sau bốn giây và kéo tấm màn xuống
  // ngay giữa lúc cảnh đang dựng.
  useEffect(() => {
    document.documentElement.dataset.reveal = "on";
  }, []);

  useEffect(() => {
    if (ready) document.documentElement.dataset.spaceReady = "on";
    return () => {
      delete document.documentElement.dataset.spaceReady;
    };
  }, [ready]);

  const go = useCallback(
    (i: number) => {
      const el = document.getElementById(`act-${p.acts[i].id}`);
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY;
      gsap.killTweensOf(window);
      if (reduced) {
        window.scrollTo(0, y);
        return;
      }
      // Cuộn mượt của trình duyệt để trình duyệt quyết thời lượng. Ở đây thời lượng
      // kẹp theo quãng đường, nên nhảy xa là một chuyển cảnh có nhịp chứ không phải
      // một đoạn tua nhanh qua bốn màn.
      gsap.to(window, {
        scrollTo: { y, autoKill: true },
        ease: "power3.inOut",
        duration: gsap.utils.clamp(0.7, 1.4, Math.abs(y - window.scrollY) / 2400),
      });
    },
    [p.acts, reduced],
  );

  // Phông chữ đổi bề rộng chữ, tức đổi chiều cao khối, tức đổi mọi mốc cuộn. Link
  // sâu phải đợi đúng mốc đó: trình duyệt tự nhảy tới anchor trước khi React dựng
  // xong các màn nên luôn dừng ở màn một, còn đo trước khi phông về thì lệch.
  useEffect(() => {
    const settle = () => {
      ScrollTrigger.refresh();
      const i = p.acts.findIndex((a) => a.id === INITIAL_HASH);
      const el = i > 0 ? document.getElementById(`act-${p.acts[i].id}`) : null;
      if (el) {
        window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
        ScrollTrigger.update();
      }
      setRouted(true);
    };
    (document.fonts?.ready ?? Promise.resolve()).then(settle).catch(settle);
  }, [p.acts]);

  useEffect(() => {
    if (!routed) return;
    const want = active > 0 ? `#${p.acts[active].id}` : "";
    if (location.hash !== want) {
      history.replaceState(null, "", location.pathname + location.search + want);
    }
  }, [active, routed, p.acts]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>(".act");
      if (sections.length === 0) return;

      let tops: number[] = [];
      const measure = () => {
        const y = window.scrollY;
        tops = sections.map((s) => s.getBoundingClientRect().top + y);
      };
      // Các màn không cao bằng nhau (màn hình thấp, điện thoại), nên tiến độ phải
      // tra qua mốc thật của từng màn chứ không chia đều tổng chiều cao.
      const actAt = (y: number) => {
        if (tops.length < 2) return 0;
        if (y <= tops[0]) return 0;
        for (let i = 0; i < tops.length - 1; i++) {
          if (y < tops[i + 1]) return i + (y - tops[i]) / (tops[i + 1] - tops[i]);
        }
        return tops.length - 1;
      };

      const barTo = bar.current
        ? gsap.quickTo(bar.current, "scaleX", { duration: 0.5, ease: "power2.out" })
        : null;
      const railTo = rail.current
        ? gsap.quickTo(rail.current, "scaleY", { duration: 0.5, ease: "power2.out" })
        : null;

      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        refreshPriority: -1,
        onRefresh: measure,
        onUpdate: (self) => {
          const y = self.scroll();
          const progress = actAt(y);
          signal.current.p = progress;
          signal.current.v = self.getVelocity();
          signal.current.invalidate?.();
          barTo?.(self.progress);
          railTo?.(progress / (ACT_COUNT - 1));
        },
      });

      measure();
      signal.current.p = actAt(window.scrollY);
      signal.current.smooth = signal.current.p;
      barTo?.(0);
      railTo?.(signal.current.p / (ACT_COUNT - 1));

      sections.forEach((section, i) => {
        ScrollTrigger.create({
          trigger: section,
          start: "top 50%",
          end: "bottom 50%",
          onToggle: (self) => {
            if (self.isActive) setActive(i);
          },
        });
        if (reduced) return;

        const lines = section.querySelectorAll(".act-title .line-in");
        const detail = section.querySelectorAll(".act-detail");
        const ordinal = section.querySelector(".act-ordinal");

        // Màn đầu tiên không hiện dần theo cuộn: nó đã ở trong khung hình ngay khi
        // trang mở, nên hiệu ứng theo cuộn sẽ giữ nó ẩn cho tới lúc người đọc cuộn.
        if (i > 0) {
          gsap.fromTo(
            lines,
            { yPercent: 44, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              stagger: 0.12,
              ease: "none",
              scrollTrigger: { trigger: section, start: "top 84%", end: "top 30%", scrub: 0.4 },
            },
          );
          gsap.fromTo(
            detail,
            { y: 28, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              stagger: 0.1,
              ease: "none",
              scrollTrigger: { trigger: section, start: "top 76%", end: "top 26%", scrub: 0.4 },
            },
          );
        }
        if (ordinal) {
          gsap.to(ordinal, {
            yPercent: DRIFT[i] ?? -20,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: true },
          });
        }
      });
    }, root);
    return () => ctx.revert();
  }, [reduced]);

  // Màn chào chỉ chạy sau khi tấm màn nhấc lên, nếu không nó diễn ra sau tấm màn
  // và người đọc không thấy gì.
  useEffect(() => {
    if (reduced || !ready) return;
    const ctx = gsap.context(() => {
      gsap.from(".act-0 .act-title .line-in", {
        yPercent: 56,
        opacity: 0,
        duration: 1.15,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.2,
      });
      gsap.from(".act-0 .act-detail", {
        y: 24,
        opacity: 0,
        duration: 0.95,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.55,
      });
      gsap.from(".space-bar, .act-nav", {
        opacity: 0,
        duration: 1,
        ease: "power2.out",
        delay: 0.85,
      });
    }, root);
    return () => ctx.revert();
  }, [reduced, ready]);

  // Bảng tùy chỉnh không khoá trang: người đọc vẫn cuộn được trong lúc chỉnh. Đóng
  // bằng Esc hoặc bấm ra ngoài, và tiêu điểm quay lại đúng nút đã mở nó.
  useEffect(() => {
    if (!panel) return;
    panelRef.current?.querySelector<HTMLElement>("button,input")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setPanel(false);
      panelButton.current?.focus();
    };
    const out = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!panelRef.current?.contains(target) && !panelButton.current?.contains(target)) {
        setPanel(false);
      }
    };
    document.addEventListener("keydown", key, true);
    document.addEventListener("pointerdown", out);
    return () => {
      document.removeEventListener("keydown", key, true);
      document.removeEventListener("pointerdown", out);
    };
  }, [panel]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      const tag = el?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (el as HTMLElement)?.isContentEditable) return;
      if (!inView) return;
      const step = (n: number) => {
        e.preventDefault();
        go(Math.min(ACT_COUNT - 1, Math.max(0, active + n)));
      };
      if (e.key === "ArrowDown" || e.key === "PageDown") step(1);
      else if (e.key === "ArrowUp" || e.key === "PageUp") step(-1);
      else if (e.key === "Home") {
        e.preventDefault();
        go(0);
      } else if (e.key === "End") {
        e.preventDefault();
        go(ACT_COUNT - 1);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [active, go, inView]);

  const mapHref = `/${lang}/ban-do`;

  return (
    <>
      {/* Màn mở đầu là HTML dựng sẵn: nó có mặt trong gói HTML đầu tiên nên người
          đọc không bao giờ thấy một khung trống trong lúc chunk của cảnh đang tải.
          React gỡ nó khi cảnh báo đã dựng xong hoặc khi hết thời gian dự phòng. */}
      <div id="space-curtain" role="status" aria-live="polite">
        <span className="space-curtain-mark" aria-hidden="true">
          §
        </span>
        <span className="space-curtain-bar" aria-hidden="true">
          <i />
        </span>
        <span className="space-curtain-note">{p.loading}</span>
      </div>

      <a className="space-skip" href="#prologue-outro">
        {p.skip}
      </a>

      {/* Cả canvas, các màn chữ và phần kết nằm chung một khối: khối này là hộp
          chứa của phần tử dính, nên nó quyết định canvas rời đi lúc nào. `root`
          chỉ trỏ vào riêng các màn chữ, vì tiến độ chương và thanh điều hướng
          không được chạy tiếp sang phần kết. */}
      <div className="prologue">
        <div className="space-world" aria-hidden="true">
          <SceneBoundary onError={() => setReady(true)} message={p.unavailable}>
            <LegalSpace
              signal={signal}
              pointer={pointer}
              pointerOn={pointerOn}
              paused={paused}
              reduced={reduced}
              hidden={hidden}
              light={light}
              onReady={() => setReady(true)}
            />
          </SceneBoundary>
        </div>

        <div className="prologue-acts" ref={root}>
          {p.acts.map((act, i) => (
            <section
              key={act.id}
              id={`act-${act.id}`}
              className={`act act-${i} act-${SIDE[i]}`}
              aria-labelledby={`act-title-${act.id}`}
            >
              <span className="act-ordinal" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="act-inner">
                <div className="act-copy">
                  <p className="eyebrow eyebrow-tick act-detail">{act.eyebrow}</p>
                  {i === 0 ? (
                    <h1 id={`act-title-${act.id}`} className="act-title">
                      {act.title.map((line) => (
                        <span className="line" key={line}>
                          <span className="line-in">{line}</span>
                        </span>
                      ))}
                  </h1>
                ) : (
                  <h2 id={`act-title-${act.id}`} className="act-title">
                    {act.title.map((line) => (
                      <span className="line" key={line}>
                        <span className="line-in">{line}</span>
                      </span>
                    ))}
                  </h2>
                )}
                <p className="act-text act-detail">{act.text}</p>

                {i === 0 && (
                  <dl className="act-stats act-detail">
                    <div>
                      <dt>{p.statDocs}</dt>
                      <dd className="tnum">{space.nodes.length}</dd>
                    </div>
                    <div>
                      <dt>{p.statRelations}</dt>
                      <dd className="tnum">{space.links.length}</dd>
                    </div>
                    <div>
                      <dt>{p.statDomains}</dt>
                      <dd className="tnum">{domains.length}</dd>
                    </div>
                  </dl>
                )}

                {i === 4 && (
                  <p className="act-span act-detail tnum">
                    {p.spanLabel} {space.span.from} — {space.span.to}
                  </p>
                )}

                {i === ACT_COUNT - 1 && (
                  <div className="act-actions act-detail">
                    <Link href={mapHref} className="btn btn-solid">
                      {p.enterMap}
                    </Link>
                    <Link href={`/${lang}/phuong-phap`} className="btn btn-outline">
                      {p.enterMethod}
                    </Link>
                  </div>
                )}
              </div>
              <p className="act-note act-detail">{act.note}</p>
            </div>
          </section>
        ))}
        </div>

        <section className="prologue-outro" id="prologue-outro">
          <div className="prologue-outro-inner">
            <p className="eyebrow eyebrow-tick">{t.home.eyebrow}</p>
            <h2 className="display-sm mt-3">{t.siteName}</h2>
            <p className="measure mt-4 text-[0.9375rem] leading-relaxed text-[var(--ink-2)]">
              {t.home.lede}
            </p>
            <div className="act-actions mt-7">
              <Link href={mapHref} className="btn btn-solid">
                {p.enterMap}
              </Link>
              <Link href={`/${lang}/van-ban`} className="btn btn-outline">
                {t.nav.documents}
              </Link>
              <Link href={`/${lang}/doi-chieu`} className="btn btn-quiet">
                {t.nav.compare}
              </Link>
            </div>
            <p className="mt-8 text-sm text-[var(--ink-3)] tnum">
              {p.verifiedPrefix} {formatDate(VERIFIED_ON, lang, VERIFIED_ON)}
            </p>
          </div>
        </section>
      </div>

      <nav className="act-nav" aria-label={p.navLabel} data-live={inView ? "on" : "off"}>
        <span className="act-rail" aria-hidden="true">
          <span className="act-rail-fill" ref={rail} />
        </span>
        {p.acts.map((act, i) => (
          <button
            key={act.id}
            type="button"
            onClick={() => go(i)}
            aria-label={`${p.goToAct} ${i + 1}, ${act.short}`}
            aria-current={active === i ? "step" : undefined}
          >
            <span className="act-nav-label">
              <span className="act-nav-index tnum">{String(i + 1).padStart(2, "0")}</span>
              {act.short}
            </span>
            <span className="act-nav-tick" />
          </button>
        ))}
      </nav>

      <div className="space-bar" data-live={inView ? "on" : "off"}>
        <span className="space-bar-progress" aria-hidden="true">
          <span className="space-bar-fill" ref={bar} />
        </span>
        <div className="space-bar-now" aria-live="polite">
          <span className="tnum space-bar-count">
            {String(active + 1).padStart(2, "0")} / {String(ACT_COUNT).padStart(2, "0")}
          </span>
          <span>{p.acts[active].short}</span>
        </div>
        <div className="space-bar-actions">
          <Link href={mapHref} className="space-bar-cta">
            {p.enterMap}
          </Link>
          <button
            type="button"
            ref={panelButton}
            className="space-bar-panel-button"
            aria-expanded={panel}
            aria-controls="space-settings"
            onClick={() => setPanel((v) => !v)}
          >
            {p.settings}
          </button>
        </div>
        {panel && (
          <div
            className="space-settings"
            id="space-settings"
            ref={panelRef}
            role="group"
            aria-label={p.settingsTitle}
          >
            <p className="eyebrow">{p.settingsTitle}</p>
            <div className="space-settings-row">
              <span>{p.motion}</span>
              <button
                type="button"
                className="space-settings-toggle"
                aria-pressed={paused}
                onClick={() => setPaused((v) => !v)}
              >
                {paused ? p.motionPaused : p.motionRunning}
              </button>
            </div>
            <div className="space-settings-row">
              <span>{p.viewpoint}</span>
              <button
                type="button"
                className="space-settings-toggle"
                onClick={() => {
                  signal.current.turn += Math.PI / 6;
                  signal.current.invalidate?.();
                }}
              >
                {p.viewpointNudge}
              </button>
            </div>
            <label className="space-settings-row check">
              <input
                type="checkbox"
                checked={pointerOn}
                onChange={(e) => setPointerOn(e.target.checked)}
              />
              {p.pointerField}
            </label>
            <label className="space-settings-row check">
              <input
                type="checkbox"
                checked={reduced}
                onChange={(e) => {
                  ownReduced.current = true;
                  setReduced(e.target.checked);
                }}
              />
              {p.reduceMotion}
            </label>
          </div>
        )}
      </div>
    </>
  );
}
