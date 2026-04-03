"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function ModelViewer() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 3;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    mountRef.current.appendChild(renderer.domElement);

    // Light
    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(2, 2, 5);
    scene.add(dirLight);

    // Load Model
    let model: THREE.Object3D | undefined;
    let mixer: THREE.AnimationMixer | undefined;
    const clock = new THREE.Clock();
    let rafId: number | undefined;
    let targetScrollProgress = 0;
    let smoothScrollProgress = 0;
    const scrollDamp = 16;
    const scrollYMul = 4;
    const scrollRotateMul = Math.PI * 2.5;

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

    // Animation loop
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

      if (model) {
        model.position.y = -smoothScrollProgress * scrollYMul;
        model.rotation.y = smoothScrollProgress * scrollRotateMul;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // Scroll animation
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.body.scrollHeight - window.innerHeight;
      targetScrollProgress = maxScroll > 0 ? scrollY / maxScroll : 0;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (rafId) cancelAnimationFrame(rafId);
      if (mountRef.current && renderer.domElement.parentElement === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="w-full h-screen fixed top-0 left-0 z-0" />;
}   