import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line, Stars } from "@react-three/drei";
import * as THREE from "three";
import {
  LAWS,
  Law,
  NODE_POS,
  EDGES,
  NODE_DEGREE,
  REL_LABEL,
  STATUS_META,
  FIELDS,
  fmtDate,
} from "../data/laws";
import { useApp } from "../store";
import { IcReset, IcOrbit, IcZoomIn, IcZoomOut, IcCube, IcArrow, StatusBadge } from "./ui";

const STATUS_COLOR: Record<string, string> = {
  active: "#3ad294",
  expiring: "#f2b63d",
  expired: "#ef7a74",
};
const HOME_POS = new THREE.Vector3(0, 22, 54);
const HOME_TARGET = new THREE.Vector3(0, 0, 0);

function NodeMesh({
  law,
  dimmed,
  selected,
  hovered,
  onHover,
  onLeave,
  onClick,
  onDblClick,
  reduced,
}: {
  law: Law;
  dimmed: boolean;
  selected: boolean;
  hovered: boolean;
  onHover: (id: string) => void;
  onLeave: () => void;
  onClick: (id: string) => void;
  onDblClick: (id: string) => void;
  reduced: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const pos = NODE_POS[law.id];
  const degree = NODE_DEGREE[law.id] ?? 0;
  const size = law.id === "hienphap2013" ? 2.7 : Math.min(2.2, 0.9 + degree * 0.2);
  const color = STATUS_COLOR[law.status];
  const phase = useMemo(() => (law.id.length * 7) % 10, [law.id]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.y = reduced ? pos.y : pos.y + Math.sin(t * 0.7 + phase) * 0.3;
    const s = hovered || selected ? 1.22 : 1;
    ref.current.scale.lerp(new THREE.Vector3(s, s, s), 0.18);
  });

  return (
    <group position={[pos.x, 0, pos.z]}>
      <mesh
        ref={ref}
        position={[0, pos.y, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(law.id);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          onLeave();
          document.body.style.cursor = "auto";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(law.id);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onDblClick(law.id);
        }}
      >
        <sphereGeometry args={[size, 36, 36]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.6 : selected ? 0.45 : dimmed ? 0.02 : 0.2}
          transparent
          opacity={dimmed ? 0.14 : 1}
          roughness={0.38}
          metalness={0.22}
        />
      </mesh>
      {law.id === "hienphap2013" && !dimmed && (
        <mesh position={[0, pos.y, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[size + 1, 0.05, 8, 64]} />
          <meshBasicMaterial color="#e5b054" transparent opacity={0.7} />
        </mesh>
      )}
      {selected && (
        <mesh position={[0, pos.y, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[size + 0.65, 0.06, 8, 64]} />
          <meshBasicMaterial color="#f2cd8b" transparent opacity={0.9} />
        </mesh>
      )}
      {hovered && !dimmed && (
        <Html position={[0, pos.y + size + 1.6, 0]} center zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
          <div className="w-56 rounded-lg border border-line bg-[#0b1322f2] p-3 shadow-[0_18px_44px_-12px_rgba(0,0,0,0.9)]">
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] tracking-wide text-dim">{law.number}</span>
              <StatusBadge status={law.status} />
            </div>
            <div className="font-display text-[14px] font-semibold leading-snug text-fog">{law.name}</div>
            <div className="mt-1 text-[10.5px] text-dim">Hiệu lực: {fmtDate(law.effectiveDate)} · Nhấp đúp để mở</div>
          </div>
        </Html>
      )}
    </group>
  );
}

function CameraRig({
  focus,
  controlsRef,
  reduced,
}: {
  focus: { pos: THREE.Vector3; dist: number } | null;
  controlsRef: React.MutableRefObject<any>;
  reduced: boolean;
}) {
  const desired = useRef<{ p: THREE.Vector3; t: THREE.Vector3 } | null>(null);
  useEffect(() => {
    if (!focus) {
      desired.current = { p: HOME_POS.clone(), t: HOME_TARGET.clone() };
      return;
    }
    const cam = (controlsRef.current as any)?.object as THREE.Camera | undefined;
    const dir = cam ? cam.position.clone().sub(focus.pos).normalize() : new THREE.Vector3(0.4, 0.55, 1).normalize();
    desired.current = { p: focus.pos.clone().add(dir.multiplyScalar(focus.dist)), t: focus.pos.clone() };
  }, [focus, controlsRef]);

  useFrame(({ camera }, delta) => {
    const c = controlsRef.current;
    if (!c || !desired.current) return;
    const k = reduced ? 1 : 1 - Math.pow(0.0025, delta);
    c.target.lerp(desired.current.t, k);
    camera.position.lerp(desired.current.p, k);
    c.update();
  });
  return null;
}

export default function Graph3D({
  visibleIds,
  initialFocusId = null,
  compact = false,
  height = 520,
}: {
  visibleIds: Set<string>;
  initialFocusId?: string | null;
  compact?: boolean;
  height?: number;
}) {
  const nav = useApp((s) => s.nav);
  const reduced = useApp((s) => s.reducedMotion);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(initialFocusId);
  const [rotating, setRotating] = useState(!reduced && !compact);
  const [focus, setFocus] = useState<{ pos: THREE.Vector3; dist: number } | null>(() => {
    const p = initialFocusId ? NODE_POS[initialFocusId] : null;
    return p ? { pos: new THREE.Vector3(p.x, p.y, p.z), dist: 18 } : null;
  });
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (initialFocusId === null) return;
    const p = NODE_POS[initialFocusId];
    if (p) {
      setFocus({ pos: new THREE.Vector3(p.x, p.y, p.z), dist: 17 });
      setSelectedId(initialFocusId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialFocusId]);

  const focusOn = (id: string) => {
    const p = NODE_POS[id];
    setFocus({ pos: new THREE.Vector3(p.x, p.y, p.z), dist: 17 });
    setSelectedId(id);
  };

  const selectedLaw = selectedId ? LAWS.find((l) => l.id === selectedId) : null;

  const edges = useMemo(() => EDGES.filter((e) => NODE_POS[e.a] && NODE_POS[e.b]), []);

  const clusterLabels = useMemo(() => {
    const groups: Record<string, { x: number; y: number; z: number; n: number; color: string; name: string }> = {};
    FIELDS.forEach((f) => {
      const members = LAWS.filter((l) => l.field === f.id);
      if (!members.length) return;
      const sum = members.reduce(
        (acc, l) => {
          const p = NODE_POS[l.id];
          return { x: acc.x + p.x, y: acc.y + p.y, z: acc.z + p.z };
        },
        { x: 0, y: 0, z: 0 }
      );
      groups[f.id] = {
        x: sum.x / members.length,
        y: sum.y / members.length + 6.5,
        z: sum.z / members.length,
        n: members.length,
        color: f.color,
        name: f.name,
      };
    });
    return Object.values(groups);
  }, []);

  const zoom = (dir: number) => {
    const c = controlsRef.current;
    if (!c) return;
    const cam = c.object as THREE.PerspectiveCamera;
    const d = cam.position.clone().sub(c.target).multiplyScalar(dir);
    cam.position.copy(c.target.clone().add(d));
  };

  return (
    <div className="relative w-full overflow-hidden rounded-[10px] border border-line bg-[#060b14]" style={{ height }}>
      <Canvas dpr={[1, 1.6]} camera={{ position: [HOME_POS.x, HOME_POS.y, HOME_POS.z], fov: 48, near: 0.1, far: 420 }}>
        <fog attach="fog" args={["#060b14", 70, 200]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[14, 26, 10]} intensity={1.05} color="#d5e7ff" />
        <pointLight position={[-36, 8, -26]} intensity={420} color="#1899d6" distance={160} />
        <pointLight position={[30, -6, 22]} intensity={320} color="#e5b054" distance={140} />
        <Stars radius={150} depth={50} count={1300} factor={3.4} saturation={0} fade speed={reduced ? 0 : 0.5} />
        <gridHelper args={[150, 30, "#182a49", "#0e1b33"]} position={[0, -9, 0]} />

        {edges.map((e, i) => {
          const a = NODE_POS[e.a];
          const b = NODE_POS[e.b];
          const dim = !visibleIds.has(e.a) || !visibleIds.has(e.b);
          const hot = selectedId && (e.a === selectedId || e.b === selectedId);
          return (
            <Line
              key={i}
              points={[
                [a.x, a.y, a.z],
                [b.x, b.y, b.z],
              ]}
              color={REL_LABEL[e.kind].color}
              lineWidth={hot ? 1.6 : 1}
              transparent
              opacity={dim ? 0.05 : hot ? 0.95 : 0.42}
            />
          );
        })}

        {LAWS.filter((l) => NODE_POS[l.id]).map((law) => (
          <NodeMesh
            key={law.id}
            law={law}
            reduced={reduced}
            dimmed={!visibleIds.has(law.id)}
            selected={selectedId === law.id}
            hovered={hoveredId === law.id}
            onHover={setHoveredId}
            onLeave={() => setHoveredId(null)}
            onClick={setSelectedId}
            onDblClick={focusOn}
          />
        ))}

        {clusterLabels.map((c, i) => (
          <Html key={i} position={[c.x, c.y, c.z]} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
            <div
              className="whitespace-nowrap font-mono text-[9.5px] uppercase tracking-[0.18em] opacity-80"
              style={{ color: c.color, textShadow: "0 2px 10px rgba(0,0,0,0.9)" }}
            >
              {c.name} · {c.n}
            </div>
          </Html>
        ))}

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.08}
          minDistance={10}
          maxDistance={130}
          autoRotate={rotating && !reduced}
          autoRotateSpeed={0.45}
          makeDefault
        />
        <CameraRig focus={focus} controlsRef={controlsRef} reduced={reduced} />
      </Canvas>

      {/* legend */}
      <div className="pointer-events-none absolute left-3 top-3 z-40 rounded-lg border border-line bg-[#0a1220d9] px-3 py-2.5">
        <div className="mb-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-dim">Hiệu lực</div>
        {(Object.keys(STATUS_COLOR) as (keyof typeof STATUS_COLOR)[]).map((k) => (
          <div key={k} className="flex items-center gap-2 py-0.5 text-[11px] text-mist">
            <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLOR[k] }} />
            {STATUS_META[k as keyof typeof STATUS_META].label}
          </div>
        ))}
      </div>

      {/* toolbar */}
      <div className="absolute right-3 top-3 z-40 flex gap-1.5">
        <button className="btn !px-2.5 !py-2" onClick={() => zoom(0.82)} aria-label="Phóng to">
          <IcZoomIn size={15} />
        </button>
        <button className="btn !px-2.5 !py-2" onClick={() => zoom(1.22)} aria-label="Thu nhỏ">
          <IcZoomOut size={15} />
        </button>
        <button
          className={`btn !px-2.5 !py-2 ${rotating ? "!border-[rgba(229,176,84,0.55)] !text-gold-soft" : ""}`}
          onClick={() => setRotating((r) => !r)}
          aria-label="Bật tắt tự xoay"
          title="Tự động xoay"
        >
          <IcOrbit size={15} />
        </button>
        <button
          className="btn !px-2.5 !py-2"
          onClick={() => {
            setFocus(null);
            setSelectedId(null);
          }}
          aria-label="Đặt lại camera"
          title="Đặt lại camera"
        >
          <IcReset size={15} />
        </button>
        {compact && (
          <button className="btn btn-primary !px-2.5 !py-2" onClick={() => nav({ name: "graph" })} aria-label="Mở bản đồ toàn màn hình">
            <IcCube size={15} />
          </button>
        )}
      </div>

      {/* selected node panel */}
      {selectedLaw && (
        <div className="absolute bottom-3 left-3 z-40 w-[270px] rounded-lg border border-line bg-[#0b1322f5] p-3.5 shadow-[0_20px_50px_-16px_rgba(0,0,0,0.9)]">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] text-dim">{selectedLaw.number}</span>
            <button className="text-dim transition hover:text-fog" onClick={() => setSelectedId(null)} aria-label="Đóng">
              ✕
            </button>
          </div>
          <div className="font-display text-[15px] font-semibold leading-snug text-fog">{selectedLaw.name}</div>
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-dim">
            <StatusBadge status={selectedLaw.status} />
            <span>HL: {fmtDate(selectedLaw.effectiveDate)}</span>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              className="btn btn-primary flex-1 !py-1.5 !text-[12px]"
              onClick={() => nav({ name: "detail", lawId: selectedLaw.id })}
            >
              Xem chi tiết <IcArrow size={13} />
            </button>
            <button className="btn !py-1.5 !text-[12px]" onClick={() => focusOn(selectedLaw.id)}>
              Tập trung
            </button>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-3 right-3 z-30 font-mono text-[9.5px] tracking-wide text-dim/70">
        kéo để xoay · cuộn để thu phóng · nhấp đúp để tập trung
      </div>
    </div>
  );
}
