// Real-time 3D Ghost Map. Loaded lazily on the client only (see src/routes/map.tsx).
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, Stars, useProgress, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject } from "react";

import moonColorAsset from "@/assets/textures/moon_color_2k.jpg.asset.json";
import moonHeightAsset from "@/assets/textures/moon_height_1k.jpg.asset.json";
import marsColorAsset from "@/assets/textures/mars_color_2k.jpg.asset.json";
import marsHeightAsset from "@/assets/textures/mars_height_1k.jpg.asset.json";
import earthColorAsset from "@/assets/textures/earth_color_2k.jpg.asset.json";

import { getArtifact, type Destination } from "@/lib/artifacts";
import {
  AXIAL_TILT_DEG,
  BODY_POSITION,
  BODY_RADIUS,
  FACING_LON,
  MAX_DISTANCE_RADII,
  MIN_DISTANCE_RADII,
  SURFACE_FEATURES,
  VIEW_DIR,
  VIEW_DISTANCE_RADII,
  arcControl,
  bezier,
  easeInOutCubic,
  flightDuration,
  flightFov,
  latLonToVec3,
  spinToFace,
  type MapPin,
  type Vec3,
} from "@/lib/space";
import { createDustPositions, createGlowTexture, createSkyTexture, createSunTexture } from "./skyTextures";

export interface SceneApi {
  zoom: (factor: number) => void;
  reset: () => void;
  focusPin: (pin: MapPin) => void;
}

export interface SpaceSceneProps {
  world: Destination;
  paused: boolean;
  pins: MapPin[];
  selectedKey: string | null;
  onSelectPin: (pin: MapPin) => void;
  apiRef: MutableRefObject<SceneApi | null>;
  onReady: () => void;
}

const BASE_FOV = 42;
const SPIN_SPEED: Record<Destination, number> = { Moon: 0.035, Mars: 0.05 }; // rad/s, not real time
const SCIENCE = new THREE.Color("#78C8E8");
const AMBER = new THREE.Color("#F0A35B");

type Flight = {
  mode: "travel" | "orbit";
  t: number;
  dur: number;
  widen: number;
  fromPos: THREE.Vector3;
  toPos: THREE.Vector3;
  ctrl: THREE.Vector3;
  fromTarget: THREE.Vector3;
  toTarget: THREE.Vector3;
  body: Destination;
};

interface Sim {
  paused: boolean;
  reducedMotion: boolean;
  spin: Record<Destination, number>;
  spinGroups: Partial<Record<Destination, THREE.Object3D>>;
  flight: Flight | null;
  body: Destination;
}

const v3 = (v: Vec3) => new THREE.Vector3(v[0], v[1], v[2]);
const toVec3 = (v: THREE.Vector3): Vec3 => [v.x, v.y, v.z];

function defaultView(body: Destination) {
  const centre = v3(BODY_POSITION[body]);
  const pos = v3(VIEW_DIR[body]).multiplyScalar(BODY_RADIUS[body] * VIEW_DISTANCE_RADII).add(centre);
  return { centre, pos };
}

/* ---------------------------------- sky ---------------------------------- */

function SkyDome() {
  const tex = useMemo(() => createSkyTexture(), []);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh renderOrder={-10}>
      <sphereGeometry args={[2400, 64, 32]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} depthWrite={false} toneMapped={false} fog={false} />
    </mesh>
  );
}

function Sun() {
  const surface = useMemo(() => createSunTexture(), []);
  const glow = useMemo(() => createGlowTexture(), []);
  const halo = useMemo(() => createGlowTexture("255,214,160", "255,140,60"), []);
  useEffect(() => () => [surface, glow, halo].forEach((t) => t.dispose()), [surface, glow, halo]);
  const pos = BODY_POSITION.Sun;
  return (
    <group position={pos}>
      <mesh>
        <sphereGeometry args={[16, 48, 24]} />
        <meshBasicMaterial map={surface} color={[2.2, 1.85, 1.4]} toneMapped={false} />
      </mesh>
      <sprite scale={[150, 150, 1]}>
        <spriteMaterial map={glow} blending={THREE.AdditiveBlending} depthWrite={false} transparent toneMapped={false} />
      </sprite>
      <sprite scale={[520, 520, 1]}>
        <spriteMaterial map={halo} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0.35} toneMapped={false} />
      </sprite>
      <pointLight intensity={3.2} decay={0} distance={0} color="#fff4e6" />
    </group>
  );
}

function CosmicDust() {
  const ref = useRef<THREE.Points>(null);
  const tex = useMemo(() => createGlowTexture("230,236,245", "160,180,210"), []);
  const geo = useMemo(() => {
    const centres: [number, number, number][] = [
      BODY_POSITION.Moon,
      BODY_POSITION.Mars,
      ...Array.from({ length: 6 }, (_, i) => toVec3(v3(BODY_POSITION.Moon).lerp(v3(BODY_POSITION.Mars), (i + 0.5) / 6))),
    ];
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(createDustPositions(centres, 420, 16), 3));
    return g;
  }, []);
  useEffect(() => () => { geo.dispose(); tex.dispose(); }, [geo, tex]);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += Math.min(delta, 0.05) * 0.004;
  });
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial map={tex} size={0.09} sizeAttenuation transparent opacity={0.5} depthWrite={false} blending={THREE.AdditiveBlending} color="#c9d6e6" />
    </points>
  );
}

/* ------------------------------ atmospheres ------------------------------ */

function Atmosphere({ radius, color, intensity, power = 3 }: { radius: number; color: string; intensity: number; power?: number }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uSun: { value: v3(BODY_POSITION.Sun) },
          uIntensity: { value: intensity },
          uPower: { value: power },
        },
        vertexShader: /* glsl */ `
          varying vec3 vN; varying vec3 vW;
          void main() {
            vec4 w = modelMatrix * vec4(position, 1.0);
            vW = w.xyz;
            vN = normalize(mat3(modelMatrix) * normal);
            gl_Position = projectionMatrix * viewMatrix * w;
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor; uniform vec3 uSun; uniform float uIntensity; uniform float uPower;
          varying vec3 vN; varying vec3 vW;
          void main() {
            vec3 V = normalize(cameraPosition - vW);
            float rim = clamp(1.0 - clamp(dot(vN, V), 0.0, 1.0), 0.0, 1.0);
            float r = exp2(log2(max(rim, 1e-4)) * uPower);
            float day = smoothstep(-0.3, 0.4, dot(vN, normalize(uSun - vW)));
            float a = clamp(r * day * uIntensity, 0.0, 1.0);
            gl_FragColor = vec4(uColor * a, a);
          }`,
      }),
    [color, intensity, power],
  );
  useEffect(() => () => mat.dispose(), [mat]);
  return (
    <mesh material={mat}>
      <sphereGeometry args={[radius, 96, 48]} />
    </mesh>
  );
}

/* --------------------------------- bodies -------------------------------- */

function useSurfaceTextures(color: string, height: string) {
  const gl = useThree((s) => s.gl);
  const [map, bump] = useTexture([color, height]) as [THREE.Texture, THREE.Texture];
  useLayoutEffect(() => {
    const aniso = Math.min(8, gl.capabilities.getMaxAnisotropy());
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = aniso;
    bump.anisotropy = aniso;
    map.needsUpdate = true;
    bump.needsUpdate = true;
  }, [map, bump, gl]);
  return { map, bump };
}

function Earth() {
  const gl = useThree((s) => s.gl);
  const map = useTexture(earthColorAsset.url) as THREE.Texture;
  const ref = useRef<THREE.Mesh>(null);
  useLayoutEffect(() => {
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    map.needsUpdate = true;
  }, [map, gl]);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.y += Math.min(d, 0.05) * 0.03;
  });
  const r = BODY_RADIUS.Earth;
  return (
    <group position={BODY_POSITION.Earth} rotation={[0, 0, THREE.MathUtils.degToRad(23.44)]}>
      <mesh ref={ref}>
        <sphereGeometry args={[r, 96, 48]} />
        <meshStandardMaterial map={map} roughness={0.85} metalness={0} />
      </mesh>
      <Atmosphere radius={r * 1.035} color="#6fb4ff" intensity={1.6} power={2.4} />
    </group>
  );
}

function SurfaceLabel({ position, children, tone }: { position: THREE.Vector3; children: string; tone: "pin" | "feature" }) {
  const groupRef = useRef<THREE.Group>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const tmp = useMemo(() => ({ w: new THREE.Vector3(), c: new THREE.Vector3(), n: new THREE.Vector3() }), []);
  useFrame(({ camera }) => {
    const g = groupRef.current;
    const el = labelRef.current;
    if (!g || !el || !g.parent) return;
    g.getWorldPosition(tmp.w);
    g.parent.getWorldPosition(tmp.c);
    tmp.n.copy(tmp.w).sub(tmp.c).normalize();
    const facing = tmp.n.dot(tmp.c.copy(camera.position).sub(tmp.w).normalize());
    el.style.opacity = String(THREE.MathUtils.clamp((facing - 0.05) * 5, 0, 1));
  });
  return (
    <group ref={groupRef} position={position}>
      <Html center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
        <div
          ref={labelRef}
          className={
            tone === "pin"
              ? "eyebrow whitespace-nowrap rounded bg-card/90 px-2 py-1 text-[0.6rem] text-science shadow-card"
              : "whitespace-nowrap font-display text-[0.65rem] tracking-[0.18em] uppercase text-foreground/60"
          }
          style={{ transition: "opacity .25s", transform: tone === "pin" ? "translateY(-18px)" : undefined }}
        >
          {children}
        </div>
      </Html>
    </group>
  );
}

function PinMarker({ pin, radius, selected, onSelect }: { pin: MapPin; radius: number; selected: boolean; onSelect: (p: MapPin) => void }) {
  const [hover, setHover] = useState(false);
  const ringRef = useRef<THREE.Mesh>(null);
  const { pos, normal, quatZ, quatY } = useMemo(() => {
    const p = v3(latLonToVec3(pin.lat, pin.lon, radius * 1.003));
    const n = p.clone().normalize();
    return {
      pos: p,
      normal: n,
      quatZ: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n),
      quatY: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n),
    };
  }, [pin.lat, pin.lon, radius]);
  const beamH = radius * 0.16;
  const color = selected ? AMBER : SCIENCE;
  useFrame(({ clock }) => {
    const ring = ringRef.current;
    if (!ring) return;
    const k = (clock.elapsedTime * 0.6) % 1;
    ring.scale.setScalar(1 + k * 1.8);
    (ring.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - k);
  });
  const name = getArtifact(pin.artifactId)?.name ?? pin.note;
  return (
    <group>
      <mesh position={pos} quaternion={quatZ}>
        <ringGeometry args={[radius * 0.018, radius * 0.026, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={ringRef} position={pos} quaternion={quatZ}>
        <ringGeometry args={[radius * 0.02, radius * 0.024, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh position={pos.clone().addScaledVector(normal, beamH / 2)} quaternion={quatY}>
        <cylinderGeometry args={[radius * 0.0025, radius * 0.0025, beamH, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.85} toneMapped={false} />
      </mesh>
      <mesh position={pos.clone().addScaledVector(normal, beamH)}>
        <sphereGeometry args={[radius * 0.011, 16, 8]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {/* Generous invisible hit area for mouse and touch */}
      <mesh
        position={pos.clone().addScaledVector(normal, beamH * 0.5)}
        onClick={(e) => { e.stopPropagation(); onSelect(pin); }}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = ""; }}
      >
        <sphereGeometry args={[radius * 0.085, 12, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>
      {(hover || selected) && (
        <SurfaceLabel position={pos.clone().addScaledVector(normal, beamH * 1.15)} tone="pin">{name}</SurfaceLabel>
      )}
    </group>
  );
}

function Planet({
  body,
  colorUrl,
  heightUrl,
  sim,
  pins,
  selectedKey,
  onSelectPin,
  showLabels,
}: {
  body: Destination;
  colorUrl: string;
  heightUrl: string;
  sim: Sim;
  pins: MapPin[];
  selectedKey: string | null;
  onSelectPin: (p: MapPin) => void;
  showLabels: boolean;
}) {
  const { map, bump } = useSurfaceTextures(colorUrl, heightUrl);
  const spinRef = useRef<THREE.Group>(null);
  const r = BODY_RADIUS[body];
  const base = useMemo(() => spinToFace(FACING_LON[body], VIEW_DIR[body]), [body]);
  const features = useMemo(() => SURFACE_FEATURES.filter((f) => f.world === body), [body]);

  useLayoutEffect(() => {
    if (spinRef.current) sim.spinGroups[body] = spinRef.current;
  }, [body, sim]);
  useFrame(() => {
    if (spinRef.current) spinRef.current.rotation.y = base + sim.spin[body];
  });

  const isMoon = body === "Moon";
  return (
    <group position={BODY_POSITION[body]} rotation={[0, 0, THREE.MathUtils.degToRad(AXIAL_TILT_DEG[body])]}>
      <group ref={spinRef}>
        <mesh>
          <sphereGeometry args={[r, 256, 128]} />
          <meshStandardMaterial
            map={map}
            bumpMap={bump}
            bumpScale={isMoon ? 3.2 : 2.2}
            displacementMap={bump}
            displacementScale={isMoon ? r * 0.012 : r * 0.008}
            displacementBias={isMoon ? -r * 0.006 : -r * 0.003}
            roughness={1}
            metalness={0}
          />
        </mesh>
        {pins.map((p) => (
          <PinMarker key={p.key} pin={p} radius={r} selected={selectedKey === p.key} onSelect={onSelectPin} />
        ))}
        {showLabels &&
          features.map((f) => (
            <SurfaceLabel key={f.name} position={v3(latLonToVec3(f.lat, f.lon, r * 1.01))} tone="feature">
              {f.name}
            </SurfaceLabel>
          ))}
      </group>
      {!isMoon && <Atmosphere radius={r * 1.02} color="#e0a074" intensity={0.9} power={3.2} />}
    </group>
  );
}

/* ------------------------------ camera + api ----------------------------- */

function CameraRig({ sim, world, apiRef }: { sim: Sim; world: Destination; apiRef: MutableRefObject<SceneApi | null> }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const first = useRef(true);

  const startFlight = (
    body: Destination,
    toPos: THREE.Vector3,
    opts: { mode: "travel" | "orbit"; dur?: number; widen?: number },
  ) => {
    const controls = controlsRef.current;
    const fromTarget = controls ? controls.target.clone() : v3(BODY_POSITION[sim.body]);
    const toTarget = v3(BODY_POSITION[body]);
    const fromPos = camera.position.clone();
    const dist = fromPos.distanceTo(toPos);
    sim.flight = {
      mode: opts.mode,
      t: 0,
      dur: opts.dur ?? flightDuration(dist, sim.reducedMotion),
      widen: sim.reducedMotion ? 0 : opts.widen ?? (opts.mode === "travel" ? 16 : 0),
      fromPos,
      toPos,
      ctrl: v3(arcControl(toVec3(fromPos), toVec3(toPos))),
      fromTarget,
      toTarget,
      body,
    };
    sim.body = body;
    if (controls) controls.enabled = false;
  };

  // Intro: drift in from deep space toward the Moon.
  useEffect(() => {
    const { pos } = defaultView(world);
    const startAt = pos.clone().add(new THREE.Vector3(-28, 16, 70));
    camera.position.copy(startAt);
    camera.lookAt(v3(BODY_POSITION[world]));
    if (controlsRef.current) controlsRef.current.target.copy(v3(BODY_POSITION[world]));
    startFlight(world, pos, { mode: "travel", dur: sim.reducedMotion ? 0.01 : 3.6, widen: 8 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    startFlight(world, defaultView(world).pos, { mode: "travel" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world]);

  useEffect(() => {
    apiRef.current = {
      zoom: (factor) => {
        const body = sim.body;
        const centre = v3(BODY_POSITION[body]);
        const r = BODY_RADIUS[body];
        const offset = camera.position.clone().sub(centre);
        const d = THREE.MathUtils.clamp(offset.length() * factor, r * MIN_DISTANCE_RADII, r * MAX_DISTANCE_RADII);
        startFlight(body, centre.clone().add(offset.setLength(d)), { mode: "orbit", dur: sim.reducedMotion ? 0.01 : 0.55 });
      },
      reset: () => startFlight(sim.body, defaultView(sim.body).pos, { mode: "orbit", dur: sim.reducedMotion ? 0.01 : 1.6 }),
      focusPin: (pin) => {
        const body = sim.body;
        const group = sim.spinGroups[body];
        if (!group) return;
        const r = BODY_RADIUS[body];
        group.updateWorldMatrix(true, false);
        const world = group.localToWorld(v3(latLonToVec3(pin.lat, pin.lon, r)));
        const centre = v3(BODY_POSITION[body]);
        const dir = world.sub(centre).normalize();
        // Look down at the site from slightly above, so the horizon stays in view.
        const toPos = centre.clone().add(dir.multiplyScalar(r * 2.3)).add(new THREE.Vector3(0, r * 0.35, 0));
        startFlight(body, toPos, { mode: "orbit", dur: sim.reducedMotion ? 0.01 : 1.8 });
      },
    };
    return () => { apiRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera]);

  const tmp = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), q: new THREE.Quaternion(), q0: new THREE.Quaternion() }), []);

  // The one stepper: spin, then flight, then controls.
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (!sim.paused) {
      sim.spin.Moon += dt * SPIN_SPEED.Moon;
      sim.spin.Mars += dt * SPIN_SPEED.Mars;
    }
    const controls = controlsRef.current;
    const f = sim.flight;
    if (f) {
      f.t = Math.min(1, f.t + dt / f.dur);
      const e = easeInOutCubic(f.t);
      if (f.mode === "travel") {
        camera.position.copy(v3(bezier(toVec3(f.fromPos), toVec3(f.ctrl), toVec3(f.toPos), e)));
        const look = 1 - Math.pow(1 - f.t, 3);
        tmp.a.copy(f.fromTarget).lerp(f.toTarget, look);
      } else {
        const centre = f.toTarget;
        tmp.a.copy(f.fromPos).sub(centre);
        tmp.b.copy(f.toPos).sub(centre);
        const d = THREE.MathUtils.lerp(tmp.a.length(), tmp.b.length(), e);
        tmp.q.setFromUnitVectors(tmp.a.clone().normalize(), tmp.b.clone().normalize());
        tmp.q0.identity().slerp(tmp.q, e);
        camera.position.copy(tmp.a.normalize().applyQuaternion(tmp.q0).multiplyScalar(d).add(centre));
        tmp.a.copy(f.fromTarget).lerp(f.toTarget, e);
      }
      camera.fov = flightFov(BASE_FOV, f.t, f.widen);
      camera.updateProjectionMatrix();
      camera.lookAt(tmp.a);
      if (controls) controls.target.copy(tmp.a);
      if (f.t >= 1) {
        sim.flight = null;
        camera.fov = BASE_FOV;
        camera.updateProjectionMatrix();
        if (controls) {
          const r = BODY_RADIUS[f.body];
          controls.minDistance = r * MIN_DISTANCE_RADII;
          controls.maxDistance = r * MAX_DISTANCE_RADII;
          controls.enabled = true;
          controls.update();
        }
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.07}
      rotateSpeed={0.55}
      zoomSpeed={0.7}
      minDistance={BODY_RADIUS[world] * MIN_DISTANCE_RADII}
      maxDistance={BODY_RADIUS[world] * MAX_DISTANCE_RADII}
    />
  );
}

function ReadyProbe({ onReady }: { onReady: () => void }) {
  const done = useRef(false);
  const frames = useRef(0);
  useFrame(() => {
    if (done.current) return;
    frames.current += 1;
    if (frames.current > 2) {
      done.current = true;
      onReady();
    }
  });
  return null;
}

/* --------------------------------- scene --------------------------------- */

function Scene({ world, paused, pins, selectedKey, onSelectPin, apiRef, onReady }: SpaceSceneProps) {
  const sim = useMemo<Sim>(
    () => ({ paused, reducedMotion: false, spin: { Moon: 0, Mars: 0 }, spinGroups: {}, flight: null, body: world }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  useEffect(() => { sim.paused = paused; }, [paused, sim]);
  useEffect(() => {
    sim.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, [sim]);

  const moonPins = pins.filter((p) => getArtifact(p.artifactId)?.destination === "Moon");
  const marsPins = pins.filter((p) => getArtifact(p.artifactId)?.destination === "Mars");

  return (
    <>
      <color attach="background" args={["#05070D"]} />
      <ambientLight intensity={0.05} />
      <hemisphereLight args={["#9fb4d0", "#1a1410", 0.06]} />
      <SkyDome />
      <Stars radius={700} depth={500} count={7000} factor={5} saturation={0.25} fade speed={0.4} />
      <Sun />
      <CosmicDust />
      <CameraRig sim={sim} world={world} apiRef={apiRef} />
      <Suspense fallback={null}>
        <Planet body="Moon" colorUrl={moonColorAsset.url} heightUrl={moonHeightAsset.url} sim={sim} pins={moonPins} selectedKey={selectedKey} onSelectPin={onSelectPin} showLabels={world === "Moon"} />
        <Planet body="Mars" colorUrl={marsColorAsset.url} heightUrl={marsHeightAsset.url} sim={sim} pins={marsPins} selectedKey={selectedKey} onSelectPin={onSelectPin} showLabels={world === "Mars"} />
        <Earth />
        <ReadyProbe onReady={onReady} />
      </Suspense>
    </>
  );
}

function LoadingVeil({ ready }: { ready: boolean }) {
  const { progress } = useProgress();
  return (
    <div
      aria-hidden={ready}
      className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-background transition-opacity duration-1000"
      style={{ opacity: ready ? 0 : 1 }}
    >
      <div className="relative size-14">
        <span className="absolute inset-0 rounded-full border border-science/30" />
        <span className="absolute inset-0 animate-spin rounded-full border-t border-science" />
      </div>
      <p className="eyebrow text-science">Loading NASA surface maps · {Math.round(progress)}%</p>
    </div>
  );
}

export default function SpaceScene(props: SpaceSceneProps) {
  const [ready, setReady] = useState(false);
  const { onReady } = props;
  return (
    <div className="absolute inset-0" data-scene-ready={ready ? "true" : undefined}>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: BASE_FOV, near: 0.05, far: 6000, position: [20, 10, 80] }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; }}
        style={{ touchAction: "none" }}
      >
        <Scene {...props} onReady={() => { setReady(true); onReady(); }} />
      </Canvas>
      <LoadingVeil ready={ready} />
    </div>
  );
}
