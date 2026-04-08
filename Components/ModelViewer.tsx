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

const INITIAL_ROTATION_Y = Math.PI / 2 + Math.PI;

function pickFlyingClip(clips: THREE.AnimationClip[]) {
  const byName = clips.find((c) => /fly|flying|wing/i.test(c.name));
  if (byName) return byName;

  const nonRest = clips.filter((c) => !/idle|rest|resting|sit|stand|sleep|landing|take_off_and_land|take_off/i.test(c.name));
  const pool = nonRest.length ? nonRest : clips;

  return pool.reduce((best, c) => (c.duration > best.duration ? c : best), pool[0]);
}

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

function fitCameraToObject(
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D,
  renderer: THREE.WebGLRenderer,
  fitRatio = 0.5
) {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);

  // center the model at origin so rotation doesn't swing it out of frame
  object.position.sub(center);

  const width = size.x;
  const height = size.y;
  const depth = size.z;

  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const aspect = renderer.domElement.width / renderer.domElement.height;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);

  const distanceForHeight = (height / 2) / Math.tan(vFov / 2);
  const distanceForWidth = (width / 2) / Math.tan(hFov / 2);
  const distance = Math.max(distanceForHeight, distanceForWidth) / fitRatio;

  camera.position.set(0, 0, distance + depth / 2);
  camera.near = Math.max(0.01, (distance - depth * 2) / 10);
  camera.far = distance + depth * 10;
  camera.updateProjectionMatrix();
  camera.lookAt(0, 0, 0);
}

export default function ModelViewer() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    THREE.Cache.enabled = true;

    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(15, 1, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    let model: THREE.Object3D | undefined;
    let mixer: THREE.AnimationMixer | undefined;

    const resizeRenderer = () => {
      const el = mountRef.current;
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w < 1 || h < 1) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (model) fitCameraToObject(camera, model, renderer);
    };

    resizeRenderer();
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";

    const ro = new ResizeObserver(resizeRenderer);
    ro.observe(mount);

    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(2, 5, 5);
    scene.add(dirLight);
    const clock = new THREE.Clock();
    let rafId: number | undefined;
    let targetScrollProgress = 0;
    let smoothScrollProgress = 0;
    let smoothRotationY = INITIAL_ROTATION_Y;
    const scrollDamp = 28;
    const rotationDamp = 16;
    const maxYaw = Math.PI / 2; // front <-> side only
    const frontShakeAmp = 0.06;
    const frontShakeFreq = 6.5;

    const loader = new GLTFLoader();
    loader.load("/models/bee/scene.glb", (gltf: GLTF) => {
      model = gltf.scene;

      model.scale.set(1.5, 1.5, 1.5);

      scene.add(model);
      fitCameraToObject(camera, model, renderer);

      if (gltf.animations?.length) {
        mixer = new THREE.AnimationMixer(model);
        const clip = pickFlyingClip(gltf.animations);
        const action = mixer.clipAction(clip);
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.play();
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
        model.rotation.x = 0;
        model.rotation.z = 0;

        // triangle wave: 0 at ends (front), 1 at middle (side)
        const viewT = 1 - Math.abs(2 * smoothScrollProgress - 1);
        const targetRotationY = INITIAL_ROTATION_Y + viewT * maxYaw;

        smoothRotationY = THREE.MathUtils.damp(
          smoothRotationY,
          targetRotationY,
          rotationDamp,
          dt
        );

        // slight "head shake" when near front view (viewT ~ 0)
        const frontness = 1 - viewT;
        const shakeWeight = frontness * frontness;
        const shake = Math.sin(clock.elapsedTime * frontShakeFreq) * frontShakeAmp * shakeWeight;

        model.rotation.y = smoothRotationY + shake;
        camera.lookAt(0, 0, 0);
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
      className="pointer-events-none fixed z-1 h-[min(500px,40vw)] w-[min(800px,80vw)] shrink-0 -translate-x-1/2 -translate-y-1/2"
      style={{ left: "30%", top: "6%" }}
    />
  );
}
