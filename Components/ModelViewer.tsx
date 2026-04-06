"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

const FLOAT_POINTS = [
  { left: 48, top: 86 },
  { left: 82, top: 26 },
  { left: 46, top: 52 },
  { left: 16, top: 46 },
  { left: 64, top: 70 },
] as const;

const INITIAL_ROTATION_Y = -Math.PI / 2;

function floatAt(t: number) {
  const p = THREE.MathUtils.clamp(t, 0, 1);
  const max = FLOAT_POINTS.length - 1;
  const f = p * max;
  const i = Math.min(Math.floor(f), max - 1);
  const u = f - i;
  return {
    left: THREE.MathUtils.lerp(FLOAT_POINTS[i].left, FLOAT_POINTS[i + 1].left, u),
    top: THREE.MathUtils.lerp(FLOAT_POINTS[i].top, FLOAT_POINTS[i + 1].top, u),
  };
}

export default function ModelViewer() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(25, 1, 0.1, 1000);
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    const resizeRenderer = () => {
      const el = mountRef.current;
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w < 1 || h < 1) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    resizeRenderer();
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";

    const ro = new ResizeObserver(resizeRenderer);
    ro.observe(mount);

    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(2, 2, 5);
    scene.add(dirLight);

    let model: THREE.Object3D | undefined;
    let mixer: THREE.AnimationMixer | undefined;
    const clock = new THREE.Clock();
    let rafId: number | undefined;
    let targetScrollProgress = 0;
    let smoothScrollProgress = 0;
    let smoothRotationY = INITIAL_ROTATION_Y;
    const scrollDamp = 28;
    const rotationDamp = 16;
    const scrollRotateMul = Math.PI * 2.75;

    const loader = new GLTFLoader();
    loader.load("/models/bee/scene.glb", (gltf: GLTF) => {
      model = gltf.scene;

      model.scale.set(1.4, 1.4, 1.4);
      model.position.set(0, 0, 0);

      scene.add(model);

      if (gltf.animations?.length) {
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => mixer!.clipAction(clip).play());
      }
    });

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      mixer?.update(dt);

      smoothScrollProgress = THREE.MathUtils.damp(
        smoothScrollProgress,
        targetScrollProgress,
        scrollDamp,
        dt
      );

      const { left, top } = floatAt(smoothScrollProgress);
      mount.style.left = `${left}%`;
      mount.style.top = `${top}%`;

      if (model) {
        model.position.y = 0;
        model.position.x = 0;
        model.position.z = 0;
        model.rotation.x = 0;
        model.rotation.z = 0;
        const targetRotationY =
          INITIAL_ROTATION_Y + smoothScrollProgress * scrollRotateMul;
        smoothRotationY = THREE.MathUtils.damp(
          smoothRotationY,
          targetRotationY,
          rotationDamp,
          dt
        );
        model.rotation.y = smoothRotationY;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      targetScrollProgress = maxScroll > 0 ? scrollY / maxScroll : 0;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
      if (mountRef.current && renderer.domElement.parentElement === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="pointer-events-none fixed z-1 h-[min(500px,40vw)] w-[min(500px,40vw)] shrink-0 -translate-x-1/2 -translate-y-1/2"
      style={{ left: "10%", top: "6%" }}
    />
  );
}
