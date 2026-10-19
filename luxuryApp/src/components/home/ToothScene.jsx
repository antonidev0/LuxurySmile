/* eslint-disable react/no-unknown-property -- las props de three.js (position, args…) no son atributos HTML */
import { ContactShadows, Environment, Float, Lightformer, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { createCrownGeometry, createRootGeometry } from "./toothGeometry";

const easeOutBack = (t) => {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
};

const Tooth = ({ reducedMotion }) => {
  const group = useRef();
  const intro = useRef(0);

  const crown = useMemo(createCrownGeometry, []);
  const root = useMemo(() => createRootGeometry(), []);

  const enamel = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#f8f4ec",
        roughness: 0.16,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        sheen: 0.4,
        sheenColor: new THREE.Color("#fff6e0"),
        sheenRoughness: 0.5,
      }),
    []
  );

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    // Entrada: crece y gira hasta su posición
    intro.current = Math.min(1, intro.current + delta / (reducedMotion ? 0.01 : 1.6));
    const p = easeOutBack(intro.current);
    g.scale.setScalar(Math.max(0.001, p));

    const spin = reducedMotion ? 0 : (1 - intro.current) * Math.PI * 2;
    const idle = reducedMotion ? 0 : state.clock.elapsedTime * 0.25;

    // Sigue suavemente al puntero
    const targetY = state.pointer.x * 0.5 + idle + spin;
    const targetX = -state.pointer.y * 0.25 + 0.15;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetY, 4, delta);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetX, 4, delta);
  });

  return (
    <group ref={group} position={[0, 0.35, 0]}>
      <mesh geometry={crown} material={enamel} castShadow />
      <mesh geometry={root} material={enamel} position={[0.3, -0.55, 0]} rotation={[0, 0, 0.12]} />
      <mesh geometry={root} material={enamel} position={[-0.3, -0.55, 0]} rotation={[0, Math.PI, 0.12]} />
    </group>
  );
};

const GoldRing = ({ radius, tilt, speed, reducedMotion }) => {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current && !reducedMotion) ref.current.rotation.z += delta * speed;
  });
  return (
    <group rotation={tilt}>
      <mesh ref={ref}>
        <torusGeometry args={[radius, 0.012, 16, 160]} />
        <meshStandardMaterial color="#d9bc82" metalness={1} roughness={0.25} />
      </mesh>
    </group>
  );
};

/**
 * Escena 3D de la portada: un molar de esmalte con anillos dorados y destellos.
 * Todo es geometría generada en código: no descarga modelos ni texturas.
 */
const ToothScene = ({ active = true, reducedMotion = false }) => (
  <Canvas
    frameloop={active ? "always" : "never"}
    dpr={[1, 1.75]}
    camera={{ position: [0, 0.2, 7.4], fov: 35 }}
    gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    style={{ touchAction: "pan-y" }}
  >
    <hemisphereLight args={["#ffffff", "#e9dcc3", 0.9]} />
    <directionalLight position={[3, 5, 4]} intensity={1.6} />
    <directionalLight position={[-4, 2, -3]} intensity={0.6} color="#cfe3ff" />
    <directionalLight position={[0, -3, 5]} intensity={0.9} color="#fff4e2" />

    <Float speed={reducedMotion ? 0 : 1.6} rotationIntensity={0.25} floatIntensity={reducedMotion ? 0 : 0.8}>
      <Tooth reducedMotion={reducedMotion} />
      <GoldRing radius={1.65} tilt={[1.25, 0.2, 0]} speed={0.35} reducedMotion={reducedMotion} />
      <GoldRing radius={1.9} tilt={[1.1, -0.35, 0.3]} speed={-0.22} reducedMotion={reducedMotion} />
    </Float>

    <Sparkles count={60} scale={[6, 4, 3]} size={2.2} speed={reducedMotion ? 0 : 0.35} color="#e6d2a8" opacity={0.8} />
    <ContactShadows position={[0, -1.85, 0]} opacity={0.28} scale={7} blur={2.6} far={3} color="#0f2f37" />

    {/* Reflejos de estudio generados localmente (sin descargar HDRI) */}
    <Environment resolution={256}>
      <Lightformer form="rect" intensity={2.2} position={[0, 4, 2]} scale={[8, 3, 1]} />
      <Lightformer form="rect" intensity={1.2} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} />
      <Lightformer form="rect" intensity={1.2} position={[5, 1, 1]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} />
      <Lightformer form="ring" color="#e6d2a8" intensity={1.5} position={[0, -2, 4]} scale={2} />
    </Environment>
  </Canvas>
);

export default ToothScene;
