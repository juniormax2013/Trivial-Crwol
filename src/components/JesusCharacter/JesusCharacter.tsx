'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useJesusEmotion } from '../../hooks/useJesusEmotion';
import type { JesusGameEvent } from '../../data/jesusEmotionMap';
import Jesus3D from '../jesus/Jesus3D';
import { type Jesus3DAction, jesus3DAnimationMap } from '@/src/config/jesus3DAnimations';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE RENDERIZADO DE JESÚS (2D vs 3D)
// ─────────────────────────────────────────────────────────────────────────────
const JESUS_RENDER_MODE: '2d' | '3d' = '3d';

const FILENAME_TO_3D_ACTION: Record<string, Jesus3DAction> = {
  'bendicion.png': 'appear',
  'idle_sereno.png': 'idle',
  'saludo_al_jugador.png': 'appear',
  'bendicion_inicio.png': 'power',
  'celebracion_acierto.png': 'clap',
  'compasion_fallo.png': 'idle',
  'revelar_respuesta.png': 'power',
  'proteccion_contra_diablo.png': 'power',
  'sabiduria_divina.png': 'power',
  'autoridad_santa.png': 'power',
  'victoria_gloriosa.png': 'clap',
  'desaparecer_en_luz.png': 'idle',
};

const JESUS_CHARACTER_CSS = `
  /* Entrada celestial */
  @keyframes jesus-img-in {
    0%   { opacity: 0; transform: scale(0.9) translateY(12px); filter: brightness(1.5) blur(4px); }
    100% { opacity: 1; transform: scale(1) translateY(0); filter: brightness(1) blur(0); }
  }

  /* Respiración serena */
  @keyframes jesus-breathe {
    0%, 100% { transform: scale(1) translateY(0); }
    50%       { transform: scale(1.015) translateY(-2px); }
  }

  /* Resplandor divino */
  @keyframes jesus-glow-pulse {
    0%   { filter: drop-shadow(0 0 10px rgba(253,224,71,0.4)) brightness(1); }
    50%  { filter: drop-shadow(0 0 25px rgba(253,224,71,0.8)) brightness(1.15); }
    100% { filter: drop-shadow(0 0 10px rgba(253,224,71,0.4)) brightness(1); }
  }

  /* Barrera protectora */
  @keyframes jesus-shield {
    0%   { transform: scale(1); filter: drop-shadow(0 0 15px rgba(56,189,248,0.5)); }
    50%  { transform: scale(1.05); filter: drop-shadow(0 0 35px rgba(56,189,248,0.9)); }
    100% { transform: scale(1); filter: drop-shadow(0 0 15px rgba(56,189,248,0.5)); }
  }

  /* Partículas de luz celestial */
  @keyframes light-particle {
    0%   { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0; }
    50%  { opacity: 0.8; }
    100% { transform: translate(var(--tx), var(--ty)) scale(0) rotate(180deg); opacity: 0; }
  }

  /* Efecto destello de luz celestial */
  @keyframes light-flare-3d {
    0%   { transform: scale(0.4); opacity: 0; filter: blur(5px); }
    40%  { opacity: 0.95; filter: blur(2px); }
    100% { transform: scale(1.35); opacity: 0; filter: blur(14px); }
  }

  .jesus-char-enter {
    animation: jesus-img-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .jesus-char-breathe {
    animation: jesus-breathe 4.5s ease-in-out infinite;
  }
  .jesus-char-glow {
    animation: jesus-glow-pulse 1.2s ease-in-out infinite;
  }
  .jesus-char-protect {
    animation: jesus-shield 0.8s ease-in-out infinite;
  }
  .jesus-light-overlay {
    animation: light-flare-3d 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
`;

const LIGHT_PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  tx: `${(Math.random() - 0.5) * 140}px`,
  ty: `${-(Math.random() * 100 + 50)}px`,
  delay: `${i * 0.1}s`,
  emoji: ['✨', '🌟', '☀️', '💫', '💛'][i % 5],
}));

interface JesusCharacterProps {
  event: JesusGameEvent | string;
  size?: number;
  className?: string;
  showEventBadge?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE AUXILIAR TRANSPARENT IMAGE (SOLO PARA MODO 2D)
// ─────────────────────────────────────────────────────────────────────────────
interface TransparentImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

function TransparentImage({ src, alt, className, style }: TransparentImageProps) {
  const [processedSrc, setProcessedSrc] = React.useState<string>('');

  React.useEffect(() => {
    let active = true;
    const img = new window.Image();
    if (src.startsWith('http')) img.crossOrigin = 'anonymous';

    const processImage = () => {
      if (!active) return;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const w = canvas.width;
        const h = canvas.height;
        const visited = new Uint8Array(w * h);
        const queue: { x: number; y: number }[] = [];
        const getIdx = (x: number, y: number) => (y * w + x) * 4;
        const getVI = (x: number, y: number) => y * w + x;
        const isBg = (x: number, y: number) => {
          const i = getIdx(x, y);
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a === 0) return false;
          if (r > 200 && g > 200 && b > 200) return true;
          if (Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && r > 165) return true;
          return false;
        };
        const addSeed = (x: number, y: number) => {
          const vi = getVI(x, y);
          if (!visited[vi] && isBg(x, y)) { visited[vi] = 1; queue.push({ x, y }); }
        };
        for (let x = 0; x < w; x++) { addSeed(x, 0); addSeed(x, h - 1); }
        for (let y = 0; y < h; y++) { addSeed(0, y); addSeed(w - 1, y); }
        const dx = [1, -1, 0, 0, 1, 1, -1, -1];
        const dy = [0, 0, 1, -1, 1, -1, 1, -1];
        while (queue.length > 0) {
          const curr = queue.shift()!;
          data[getIdx(curr.x, curr.y) + 3] = 0;
          for (let i = 0; i < 8; i++) {
            const nx = curr.x + dx[i], ny = curr.y + dy[i];
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              const vi = getVI(nx, ny);
              if (!visited[vi] && isBg(nx, ny)) { visited[vi] = 1; queue.push({ x: nx, y: ny }); }
            }
          }
        }
        // Suavizado fino de bordes
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = getIdx(x, y);
            if (data[idx + 3] > 0 && data[idx] > 210 && data[idx + 1] > 210 && data[idx + 2] > 210) {
              for (let i = 0; i < 4; i++) {
                const nx = x + dx[i], ny = y + dy[i];
                if (nx >= 0 && nx < w && ny >= 0 && ny < h && data[getIdx(nx, ny) + 3] === 0) {
                  data[idx + 3] = 0; break;
                }
              }
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
        if (active) setProcessedSrc(canvas.toDataURL('image/png'));
      } catch {
        if (active) setProcessedSrc(src);
      }
    };

    img.onload = processImage;
    img.src = src;
    if (img.complete) processImage();
    return () => { active = false; };
  }, [src]);

  if (!processedSrc) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={style}>
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={processedSrc} alt={alt} className={className} style={style} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

export default function JesusCharacter({
  event,
  size = 280,
  className = '',
  showEventBadge = false,
}: JesusCharacterProps) {
  const cssInjected = useRef(false);
  const [activeAction3D, setActiveAction3D] = useState<Jesus3DAction>('idle');
  const [showLightFlare, setShowLightFlare] = useState(false);

  const {
    currentImage,
    currentFilename,
    currentEvent,
    isTransitioning,
    isGlowing,
    isProtecting,
    triggerEvent,
  } = useJesusEmotion(event);

  // Sincronizar evento de entrada y mapear a acción 3D
  useEffect(() => {
    triggerEvent(event);
  }, [event, triggerEvent]);

  // Actualizar la acción 3D activa al cambiar la ilustración 2D resuelta
  useEffect(() => {
    if (JESUS_RENDER_MODE === '3d') {
      const targetAction = FILENAME_TO_3D_ACTION[currentFilename] || 'idle';
      setActiveAction3D(targetAction);

      // Disparar destello de luz en aparición
      if (targetAction === 'appear') {
        setShowLightFlare(true);
        const timer = setTimeout(() => setShowLightFlare(false), 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [currentFilename]);

  // Inyectar CSS una sola vez
  useEffect(() => {
    if (cssInjected.current) return;
    cssInjected.current = true;
    const style = document.createElement('style');
    style.setAttribute('data-jesus-char', 'true');
    style.textContent = JESUS_CHARACTER_CSS;
    document.head.appendChild(style);
  }, []);

  const handleActionComplete = (finishedAction: Jesus3DAction) => {
    // No retornar a idle automáticamente; mantener el fotograma final de la animación hasta una nueva acción.
  };

  const animClass = isProtecting
    ? 'jesus-char-protect'
    : isGlowing
    ? 'jesus-char-glow'
    : 'jesus-char-breathe';

  // Si está desmontado
  const isHidden = false;

  if (isHidden) return null;

  return (
    <div
      className={`relative flex flex-col items-center select-none ${className}`}
      style={{ width: size, minHeight: size }}
    >
      {/* Halo y Aura celestial de fondo */}
      <div
        className="absolute inset-0 rounded-full blur-3xl pointer-events-none"
        style={{
          background: isProtecting
            ? 'radial-gradient(circle, rgba(56,189,248,0.3) 0%, transparent 70%)'
            : isGlowing
            ? 'radial-gradient(circle, rgba(253,224,71,0.25) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(253,224,71,0.1) 0%, transparent 70%)',
          transition: 'background 0.5s ease',
        }}
      />

      {/* Partículas de luz celestial */}
      {(isGlowing || isProtecting) && LIGHT_PARTICLES.map((p) => (
        <span
          key={p.id}
          className="absolute text-lg pointer-events-none z-10"
          style={{
            top: '40%',
            left: '50%',
            ['--tx' as string]: p.tx,
            ['--ty' as string]: p.ty,
            animation: `light-particle 1.2s ease-out forwards`,
            animationDelay: p.delay,
          }}
        >
          {p.emoji}
        </span>
      ))}

      {/* Capa de destello de luz para el modo 3D */}
      {showLightFlare && (
        <div 
          className="absolute inset-0 z-30 pointer-events-none rounded-full flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <div 
            className="w-[85%] h-[85%] bg-gradient-to-tr from-amber-300/40 via-yellow-100/20 to-transparent rounded-full jesus-light-overlay"
          />
        </div>
      )}

      {/* Renderizado Condicional: 3D vs 2D */}
      {JESUS_RENDER_MODE === '3d' ? (
        <div 
          className="relative flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <Jesus3D 
            action={activeAction3D} 
            size={size} 
            onActionComplete={handleActionComplete} 
          />
        </div>
      ) : (
        <div
          className={`relative transition-all duration-300 ${animClass}`}
          style={{
            width: size,
            height: size,
            opacity: isTransitioning ? 0 : 1,
          }}
        >
          <TransparentImage
            key={currentImage}
            src={currentImage}
            alt={`Jesús: ${currentEvent}`}
            className="w-full h-full object-contain jesus-char-enter"
          />
        </div>
      )}

      {/* Badge de evento (opcional) */}
      {showEventBadge && (
        <div className="mt-2 flex flex-col items-center gap-1 z-20">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-950/20 border border-amber-500/20 rounded-full px-3 py-0.5">
            {JESUS_RENDER_MODE === '3d' ? `3D: ${activeAction3D}` : currentEvent}
          </span>
          <span className="text-[9px] text-slate-400 font-mono">
            {JESUS_RENDER_MODE === '3d' ? jesus3DAnimationMap[activeAction3D].split('/').pop() : currentFilename}
          </span>
        </div>
      )}
    </div>
  );
}
