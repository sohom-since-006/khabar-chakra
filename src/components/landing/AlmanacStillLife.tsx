'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function AlmanacStillLife() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [tier, setTier] = useState<'T2' | 'T1' | 'T0'>(() => {
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return 'T0';
      }
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return 'T0';
      } catch {
        return 'T0';
      }
    }
    return 'T2';
  });

  useEffect(() => {
    if (tier === 'T0') return;

    const container = mountRef.current;
    if (!container) return;

    // WebGL capability check
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      setTimeout(() => setTier('T0'), 0);
      return;
    }

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    // Warm Studio Lighting for Still Life
    const ambientLight = new THREE.AmbientLight(0xfffaed, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff3d6, 2.2);
    keyLight.position.set(3, 4, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x0b6e3c, 1.0);
    rimLight.position.set(-3, -2, -2);
    scene.add(rimLight);

    // Art-directed Still Life: A stylized sculptural Mango / Citrus fruit
    const group = new THREE.Group();

    // Fruit body (smooth deformed sphere)
    const fruitGeo = new THREE.SphereGeometry(1.0, 32, 28);
    // Scale slightly to make mango/citrus teardrop profile
    fruitGeo.scale(1.0, 1.25, 0.85);

    const fruitMat = new THREE.MeshStandardMaterial({
      color: 0xffc93c, // Mango token
      roughness: 0.35,
      metalness: 0.05,
    });
    const fruit = new THREE.Mesh(fruitGeo, fruitMat);
    group.add(fruit);

    // Leaf stem
    const leafGeo = new THREE.ConeGeometry(0.3, 0.9, 16);
    leafGeo.scale(1, 0.15, 1);
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x0b6e3c, // Basil token
      roughness: 0.4,
    });
    const leaf = new THREE.Mesh(leafGeo, leafMat);
    leaf.position.set(0.1, 1.35, 0);
    leaf.rotation.z = -0.55;
    group.add(leaf);

    // Ceramic display pedestal base
    const baseGeo = new THREE.CylinderGeometry(1.3, 1.4, 0.15, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0xFAFDF6,
      roughness: 0.8,
    });
    const pedestal = new THREE.Mesh(baseGeo, baseMat);
    pedestal.position.set(0, -1.35, 0);
    group.add(pedestal);

    scene.add(group);

    // Interaction & Animation Loop
    let animationFrameId: number;
    const lastTime = performance.now();
    let frameCount = 0;

    const animate = (time: number) => {
      // FPS watchdog check over 60 frames
      frameCount++;
      if (frameCount === 60) {
        const delta = time - lastTime;
        const fps = 60000 / delta;
        if (fps < 24) {
          // Downgrade to static T0 on poor performance
          setTier('T0');
          cancelAnimationFrame(animationFrameId);
          return;
        }
      }

      group.rotation.y = time * 0.00045;
      group.rotation.x = Math.sin(time * 0.0003) * 0.08;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      fruitGeo.dispose();
      fruitMat.dispose();
      leafGeo.dispose();
      leafMat.dispose();
      baseGeo.dispose();
      baseMat.dispose();
      renderer.dispose();
    };
  }, [tier]);

  if (tier === 'T0') {
    return (
      <div className="w-full h-80 flex flex-col items-center justify-center p-6 border border-[var(--kc-hairline)] bg-[var(--kc-card)] rounded-sm text-center">
        <div className="w-24 h-24 rounded-full bg-[var(--kc-mango)] opacity-90 flex items-center justify-center text-4xl mb-3 shadow-inner">
          🥭
        </div>
        <div className="font-mono text-xs uppercase text-[var(--kc-muted)]">STILL LIFE NO. 01</div>
        <div className="font-semibold text-sm text-[var(--kc-ink)] mt-1">Market Fresh Surplus Specimen</div>
        <div className="font-annotation text-xs mt-1 text-[var(--kc-muted)]">&ldquo;Grown with care, rescued before dusk&rdquo;</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-80 sm:h-96 flex items-center justify-center">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute bottom-2 left-4 font-mono text-[10px] text-[var(--kc-muted)] tracking-wider">
        PLATE I · BOTANICAL STILL LIFE · ASANSOL SPECIMEN
      </div>
    </div>
  );
}
