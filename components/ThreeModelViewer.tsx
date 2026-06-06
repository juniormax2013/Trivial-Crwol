'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface ThreeModelViewerProps {
  modelPath: string;
}

export default function ThreeModelViewer({ modelPath }: ThreeModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 400;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#faf9fc');

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2, 5);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.minDistance = 1;
    controls.maxDistance = 15;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.9);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight('#ffffff', '#0A84FF', 0.5);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight('#ffffff', 1.4);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 20;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    // Ground shadow receiver
    const floorGeo = new THREE.PlaneGeometry(50, 50);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.12 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid helper
    const grid = new THREE.GridHelper(10, 10, '#0A84FF', '#e2e8f0');
    grid.position.y = 0.01;
    if (Array.isArray(grid.material)) {
      grid.material.forEach((m) => {
        m.transparent = true;
        m.opacity = 0.15;
      });
    } else {
      grid.material.transparent = true;
      grid.material.opacity = 0.15;
    }
    scene.add(grid);

    // 6. Loading GLB Model
    let mixer: THREE.AnimationMixer | null = null;
    let currentModel: THREE.Group | null = null;
    const loader = new GLTFLoader();

    setLoading(true);
    setError(null);

    loader.load(
      modelPath,
      (gltf) => {
        setLoading(false);
        currentModel = gltf.scene;

        currentModel.traverse((node) => {
          if ((node as THREE.Mesh).isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });

        // Center and fit model in screen
        const box = new THREE.Box3().setFromObject(currentModel);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Center feet on origin
        currentModel.position.x += (currentModel.position.x - center.x);
        currentModel.position.z += (currentModel.position.z - center.z);
        currentModel.position.y -= box.min.y;

        scene.add(currentModel);

        // Adjust camera view
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / (2 * Math.tan(fov / 2)));
        cameraZ *= 1.25; // Closer view with proper margin
        camera.position.set(0, size.y * 0.5, cameraZ);
        controls.target.set(0, size.y * 0.5, 0);
        controls.update();

        // Play animations
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(currentModel);
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();
        }
      },
      undefined,
      (err) => {
        console.error('Error loading GLB:', err);
        setLoading(false);
        setError('Error al cargar la animación 3D. Asegúrate de que el archivo existe.');
      }
    );

    // 7. Animation Loop
    const clock = new THREE.Clock();
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      if (mixer) mixer.update(delta);

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
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
      controls.dispose();
      renderer.dispose();
      if (currentModel) scene.remove(currentModel);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelPath]);

  return (
    <div className="relative w-full h-full min-h-[380px] bg-[#faf9fc] rounded-[24px] overflow-hidden flex items-center justify-center border border-slate-100 shadow-inner">
      <div ref={containerRef} className="w-full h-full absolute inset-0 z-10" />

      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm gap-3">
          <div className="w-10 h-10 border-4 border-[#0A84FF] border-t-transparent rounded-full animate-spin" />
          <p className="text-[12px] font-black text-[#0A84FF] uppercase tracking-widest animate-pulse">Cargando Animación 3D...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white p-6 text-center gap-2">
          <span className="text-3xl">⚠️</span>
          <p className="text-[13px] font-black text-rose-600 uppercase tracking-wider">{error}</p>
          <p className="text-[11px] text-slate-500 max-w-xs">{modelPath}</p>
        </div>
      )}
    </div>
  );
}
