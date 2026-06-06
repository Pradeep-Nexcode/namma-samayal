"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sky, Cloud, Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/contexts/LanguageContext";

const SLIDE_COUNT = 5;

/* ── Cube colors for the scrolling items ── */
const CUBE_COLORS = [
  "#e74c3c", // red
  "#f39c12", // orange
  "#2ecc71", // green
  "#3498db", // blue
  "#9b59b6", // purple
  "#1abc9c", // teal
  "#e67e22", // dark orange
  "#e91e63", // pink
];

/* ── Scrolling Cubes that orbit on the table ── */
function ScrollingCubes() {
  const groupRef = useRef<THREE.Group>(null);
  const midR = (8.0 + 6.2) / 2; // mid-point of the table width

  // Rotate the cubes group continuously
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y -= delta * 0.3; // slow continuous rotation
    }
  });

  return (
    <group ref={groupRef}>
      {CUBE_COLORS.map((color, i) => {
        const angle = (i / CUBE_COLORS.length) * Math.PI * 2;
        const x = Math.cos(angle) * midR;
        const z = Math.sin(angle) * midR;
        return (
          <mesh
            key={i}
            position={[x, 0.7, z]}
            castShadow
          >
            <boxGeometry args={[0.7, 0.7, 0.7]} />
            <meshStandardMaterial
              color={color}
              roughness={0.3}
              metalness={0.15}
              envMapIntensity={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/* ── 3D Full Circle Table ── */
function CircleTable() {
  const groupRef = useRef<THREE.Group>(null);

  // Gentle floating animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.4) * 0.06;
    }
  });

  /*
   * Build full-circle annulus (ring) table:
   * - The 2D shape is a full annulus (0 to 2*PI) on the XY plane.
   * - After extrusion along Z, we rotate so it lies flat on XZ.
   */
  const { tableGeometry, topSurfaceGeometry } = useMemo(() => {
    const outerR = 8.0;
    const innerR = 6.2;
    const thickness = 0.55;
    const segs = 120;

    const shape = new THREE.Shape();
    // Outer circle
    shape.moveTo(outerR, 0);
    for (let i = 1; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      shape.lineTo(Math.cos(a) * outerR, Math.sin(a) * outerR);
    }
    shape.closePath();

    // Inner hole
    const hole = new THREE.Path();
    hole.moveTo(innerR, 0);
    for (let i = 1; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      hole.lineTo(Math.cos(a) * innerR, Math.sin(a) * innerR);
    }
    shape.holes.push(hole);

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: thickness,
      bevelEnabled: true,
      bevelThickness: 0.07,
      bevelSize: 0.07,
      bevelSegments: 5,
      curveSegments: 1,
    };

    const tableGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    tableGeo.rotateX(-Math.PI / 2);

    // Top surface overlay
    const topGeo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.02,
      bevelEnabled: false,
      curveSegments: 1,
    });
    topGeo.rotateX(-Math.PI / 2);
    topGeo.translate(0, 0.28, 0);

    return { tableGeometry: tableGeo, topSurfaceGeometry: topGeo };
  }, []);

  // Brass rim: tube along the outer circle
  const outerRimGeo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 120; i++) {
      const a = (i / 120) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * 8.0, 0.32, -Math.sin(a) * 8.0));
    }
    const curve = new THREE.CatmullRomCurve3(pts, true);
    return new THREE.TubeGeometry(curve, 120, 0.08, 12, true);
  }, []);

  // Brass rim: tube along the inner circle
  const innerRimGeo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 120; i++) {
      const a = (i / 120) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * 6.2, 0.32, -Math.sin(a) * 6.2));
    }
    const curve = new THREE.CatmullRomCurve3(pts, true);
    return new THREE.TubeGeometry(curve, 120, 0.06, 12, true);
  }, []);

  // Brass accent bar positions (evenly around full circle)
  const brassAccents = useMemo(() => {
    const count = 10;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const midR = (8.0 + 6.2) / 2;
      return {
        position: [
          Math.cos(angle) * midR,
          0.15,
          -Math.sin(angle) * midR,
        ] as [number, number, number],
        rotation: [0, -angle + Math.PI / 2, 0] as [number, number, number],
      };
    });
  }, []);

  // Wood grain lines (full circles)
  const woodGrainGeos = useMemo(() => {
    const geos: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 5; i++) {
      const r = 6.4 + i * 0.28;
      const pts: THREE.Vector3[] = [];
      for (let j = 0; j <= 80; j++) {
        const a = (j / 80) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * r, 0.3, -Math.sin(a) * r));
      }
      geos.push(new THREE.BufferGeometry().setFromPoints(pts));
    }
    return geos;
  }, []);

  return (
    <group ref={groupRef}>
      {/* Main table body — white marble */}
      <mesh geometry={tableGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          color="#f8f9fa"
          roughness={0.15}
          metalness={0.05}
          envMapIntensity={1.0}
        />
      </mesh>

      {/* Top surface — polished white stone */}
      <mesh geometry={topSurfaceGeometry}>
        <meshStandardMaterial
          color="#ffffff"
          roughness={0.1}
          metalness={0.05}
          envMapIntensity={1.2}
        />
      </mesh>

      {/* Stone polish rings */}
      {woodGrainGeos.map((geo, i) => (
        <line key={i} geometry={geo}>
          <lineBasicMaterial color="#e0e5eb" opacity={0.3} transparent />
        </line>
      ))}

      {/* Outer trim — polished light stone/silver */}
      <mesh geometry={outerRimGeo}>
        <meshStandardMaterial
          color="#edf2f7"
          roughness={0.1}
          metalness={0.3}
          envMapIntensity={1.0}
        />
      </mesh>

      {/* Inner trim — polished light stone/silver */}
      <mesh geometry={innerRimGeo}>
        <meshStandardMaterial
          color="#e2e8f0"
          roughness={0.1}
          metalness={0.3}
          envMapIntensity={1.0}
        />
      </mesh>

      {/* Vertical accent bars — white stone */}
      {brassAccents.map((acc, i) => (
        <mesh key={i} position={acc.position} rotation={acc.rotation}>
          <boxGeometry args={[0.07, 0.56, 1.4]} />
          <meshStandardMaterial
            color="#f7fafc"
            roughness={0.15}
            metalness={0.1}
            envMapIntensity={1.0}
          />
        </mesh>
      ))}

      {/* Shadow disc */}
      <mesh
        position={[0, -0.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[10, 64]} />
        <meshStandardMaterial
          color="#000000"
          transparent
          opacity={0.06}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ── Heavenly Cloud Layer ── */
function HeavenClouds() {
  return (
    <group>
      {/* ═══ EDGE-HIDING CLOUDS ═══ */}
      {/* Dense clouds at left and right edges to hide where the table extends off-screen */}

      {/* Left edge */}
      {/* @ts-expect-error Drei Cloud props */}
      <Cloud position={[-10, -0.5, 0]} speed={0.05} opacity={0.95} width={7} depth={5} segments={30} color="#ffffff" />
      {/* @ts-expect-error Drei Cloud props */}
      <Cloud position={[-11, 0.5, -2]} speed={0.04} opacity={0.85} width={6} depth={4} segments={25} color="#f8f9ff" />

      {/* Right edge */}
      {/* @ts-expect-error Drei Cloud props */}
      <Cloud position={[10, -0.5, 0]} speed={0.05} opacity={0.95} width={7} depth={5} segments={30} color="#ffffff" />
      {/* @ts-expect-error Drei Cloud props */}
      <Cloud position={[11, 0.5, -2]} speed={0.04} opacity={0.85} width={6} depth={4} segments={25} color="#f8f9ff" />

      {/* ═══ BACK CLOUD BANK (Dense and Closer) ═══ */}
      {/* Main back-fill */}
      {/* @ts-expect-error Drei Cloud props */}
      <Cloud position={[0, -1, -8]} speed={0.04} opacity={1.0} width={25} depth={10} segments={45} color="#ffffff" />

      {/* Middle obstruction (covering the back arc) */}
      {/* @ts-expect-error Drei Cloud props */}
      <Cloud position={[-6.5, 0.5, -3]} speed={0.03} opacity={0.95} width={9} depth={6} segments={30} color="#ffffff" />
      {/* @ts-expect-error Drei Cloud props */}
      <Cloud position={[6.5, 0.5, -3]} speed={0.03} opacity={0.95} width={9} depth={6} segments={30} color="#ffffff" />
      {/* @ts-expect-error Drei Cloud props */}
      <Cloud position={[0, 1.2, -4.5]} speed={0.025} opacity={1.0} width={14} depth={7} segments={35} color="#ffffff" />

      {/* ═══ BOTTOM CLOUD FLOOR ═══ */}
      {/* @ts-expect-error Drei Cloud props */}
      <Cloud position={[0, -4, 0]} speed={0.06} opacity={0.85} width={25} depth={10} segments={40} color="#ffffff" />

      {/* ═══ UPPER ATMOSPHERE ═══ */}
      {/* @ts-expect-error Drei Cloud props */}
      <Cloud position={[0, 8, -14]} speed={0.02} opacity={0.2} width={22} depth={5} segments={14} color="#f0f4ff" />
    </group>
  );
}

/* ── Lighting Rig ── */
function Lighting() {
  return (
    <>
      {/* Main bright sunlight */}
      <directionalLight
        position={[3, 12, -5]}
        intensity={4}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      {/* Bright fill to remove shadows on clouds */}
      <directionalLight position={[-8, 6, 8]} intensity={1.5} color="#ffffff" />
      {/* Strong backlight to keep everything glowy */}
      <directionalLight position={[0, 4, -10]} intensity={2.5} color="#ffffff" />
      {/* Strong Ambient */}
      <ambientLight intensity={1.2} color="#ffffff" />
      {/* Large soft fill */}
      <pointLight position={[0, 10, 0]} intensity={3} color="#ffffff" distance={30} decay={1} />
    </>
  );
}

/* ── Main Scene ── */
function Scene() {
  return (
    <>
      <Lighting />
      <Sky
        distance={450000}
        sunPosition={[5, 30, -10]}
        inclination={0.6}
        azimuth={0.25}
        rayleigh={0.1}
        turbidity={1.5}
        mieCoefficient={0.1}
        mieDirectionalG={0.95}
      />
      <Environment preset="city" environmentIntensity={1.0} />
      <HeavenClouds />
      <CircleTable />
      <ScrollingCubes />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        target={[0, -0.6, -1]}
        minPolarAngle={Math.PI / 2.8}
        maxPolarAngle={Math.PI / 2.8}
        minAzimuthAngle={-Math.PI / 6.5}
        maxAzimuthAngle={Math.PI / 6.5}
        autoRotate={false}
      />
    </>
  );
}

/* ── Exported Component ── */
export function HeroTable() {
  const [index, setIndex] = useState(0);
  const { t } = useLang();

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDE_COUNT);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const active = {
    heading: t(`home.heroSlides.${index}.heading`),
    subtext: t(`home.heroSlides.${index}.subtext`),
    button: t(`home.heroSlides.${index}.button`),
  };

  return (
    <section className="relative w-full h-screen overflow-hidden bg-white">

      {/* 3D Scene */}
      <Canvas
        shadows
        camera={{
          position: [0, 6, 14],
          fov: 48,
          near: 0.1,
          far: 1000,
        }}
        style={{ width: "100%", height: "100%" }}
        gl={{ antialias: true, alpha: false }}
      >
        <Scene />
      </Canvas>

      {/* Hero Content Overlay (Cycles every 5s) */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center px-6 z-10">
        <div className="max-w-4xl min-h-[300px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-8"
            >
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-800 leading-[1.1]">
                {active.heading}
              </h1>

              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                {active.subtext}
              </p>

              <div className="pt-4">
                <button className="pointer-events-auto group relative px-10 py-4 bg-slate-900 text-white rounded-full font-semibold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
                  <span className="relative z-10 flex items-center gap-2">
                    {active.button}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom subtle gradient for transition */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </section>
  );
}
