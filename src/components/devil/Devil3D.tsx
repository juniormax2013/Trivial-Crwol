'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { devil3DAnimationMap, type Devil3DAction } from '@/src/config/devil3DAnimations';

interface Devil3DProps {
  action: Devil3DAction;
  size?: number;
  className?: string;
  onActionComplete?: (action: Devil3DAction) => void;
}

// Global cache to avoid reloading files
const glbCache: Record<string, THREE.Group> = {};
const animationsCache: Record<string, THREE.AnimationClip[]> = {};

export default function Devil3D({
  action,
  size = 280,
  className = '',
  onActionComplete,
}: Devil3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Keep persistent references to ThreeJS objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  
  // Keep track of current model and mixer
  const currentModelRef = useRef<THREE.Group | null>(null);
  const currentMixerRef = useRef<THREE.AnimationMixer | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States to handle smooth cross-fading via opacity transition
  const [renderAction, setRenderAction] = useState<Devil3DAction>(action);
  const [opacity, setOpacity] = useState(1);

  // Smooth out swapping by fading opacity to 0, then changing the rendering action
  useEffect(() => {
    if (action === renderAction) return;

    setOpacity(0);
    const timer = setTimeout(() => {
      setRenderAction(action);
    }, 180); // wait for fade out to complete before swapping action

    return () => clearTimeout(timer);
  }, [action, renderAction]);

  // Initialize ThreeJS Scene once
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || size;
    const height = container.clientHeight || size;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera Setup (Fixed front view)
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 50);
    camera.position.set(0, 1.1, 3.2); // Framed on body
    cameraRef.current = camera;

    // 3. Renderer Setup (Transparent background)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.0);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight('#ffffff', '#0A84FF', 0.6);
    hemiLight.position.set(0, 15, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight('#ffffff', 1.6);
    dirLight.position.set(3, 6, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 512;
    dirLight.shadow.mapSize.height = 512;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    // Grid helper subtle
    const grid = new THREE.GridHelper(10, 10, '#0A84FF', '#e2e8f0');
    grid.position.y = 0;
    if (Array.isArray(grid.material)) {
      grid.material.forEach((m) => {
        m.transparent = true;
        m.opacity = 0.08;
      });
    } else {
      grid.material.transparent = true;
      grid.material.opacity = 0.08;
    }
    scene.add(grid);

    // 5. Animation Loop
    const clock = new THREE.Clock();
    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (currentMixerRef.current) {
        currentMixerRef.current.update(delta);
      }
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, []);

  // Handle Action Changes (Load and swap model/animation)
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const glbUrl = devil3DAnimationMap[renderAction];
    if (!glbUrl) return;

    const isLoop = renderAction === 'idle';

    const setupModel = (model: THREE.Group, animations: THREE.AnimationClip[]) => {
      console.log("Loaded devil animation:", renderAction, animations.length, animations.map(a => a.name));

      // Remove current active model
      const oldModel = currentModelRef.current;
      if (oldModel && oldModel !== model) {
        scene.remove(oldModel);
      }

      // Position model
      model.position.set(0, 0, 0);

      // Ensure model mesh settings are correct
      model.traverse((node) => {
        if ((node as THREE.Mesh).isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          const mesh = node as THREE.Mesh;
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat: any) => {
              mat.transparent = false;
              mat.opacity = 1;
            });
          } else if (mesh.material) {
            const mat = mesh.material as any;
            mat.transparent = false;
            mat.opacity = 1;
          }
        }
      });

      scene.add(model);
      currentModelRef.current = model;

      // 3. Play Animation
      const mixer = new THREE.AnimationMixer(model);
      currentMixerRef.current = mixer;

      if (animations && animations.length > 0) {
        const clip = animations[0];
        const animAction = mixer.clipAction(clip);

        animAction.reset();
        if (!isLoop) {
          animAction.setLoop(THREE.LoopOnce, 1);
          animAction.clampWhenFinished = true;
        }

        animAction.play();

        // Idle slow down adjustment (0.5x)
        if (renderAction === 'idle') {
          mixer.timeScale = 0.52;
        } else {
          mixer.timeScale = 1.0;
        }

        // Action completion callbacks
        if (!isLoop) {
          const duration = 10000; // 10 seconds
          const timer = setTimeout(() => {
            if (onActionComplete) {
              onActionComplete(renderAction);
            }
          }, duration);

          // Fade back in once model is fully loaded and animation has started playing
          setOpacity(1);
          return () => clearTimeout(timer);
        }
      } else {
        console.warn("No animation found in GLB for action:", renderAction);
      }

      // Fade back in for looping/static poses as well
      setOpacity(1);
    };

    // Check Cache
    if (glbCache[glbUrl]) {
      setupModel(glbCache[glbUrl], animationsCache[glbUrl]);
    } else {
      setLoading(true);
      setError(null);
      const loader = new GLTFLoader();
      loader.load(
        glbUrl,
        (gltf) => {
          setLoading(false);
          glbCache[glbUrl] = gltf.scene;
          animationsCache[glbUrl] = gltf.animations;
          setupModel(gltf.scene, gltf.animations);
        },
        undefined,
        (err) => {
          console.error(`Error al cargar animación 3D ${renderAction}:`, err);
          setLoading(false);
          setError('Error al cargar.');
        }
      );
    }
  }, [renderAction, onActionComplete]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden flex items-center justify-center ${className}`}
      style={{ 
        width: size, 
        height: size, 
        opacity: opacity,
        transition: 'opacity 180ms cubic-bezier(0.4, 0, 0.2, 1)' 
      }}
    >
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-transparent pointer-events-none">
          <div className="w-6 h-6 border-2 border-[#0A84FF] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/10 text-[10px] text-red-500 font-bold uppercase tracking-wider">
          ⚠️ Err 3D
        </div>
      )}
    </div>
  );
}
