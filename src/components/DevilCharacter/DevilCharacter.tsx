'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useDevilEmotion } from '../../hooks/useDevilEmotion';
import type { DevilGameEvent } from '../../data/devilEmotionMap';
import dynamic from 'next/dynamic';
import { type Devil3DAction, devil3DAnimationMap } from '@/src/config/devil3DAnimations';

const Devil3D = dynamic(() => import('../devil/Devil3D'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-transparent pointer-events-none">
      <div className="w-6 h-6 border-2 border-[#0A84FF] border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE RENDERIZADO DEL DIABLO (2D vs 3D)
// Cambia a '2d' si deseas volver temporalmente al sprite original
// ─────────────────────────────────────────────────────────────────────────────
const DEVIL_RENDER_MODE: '2d' | '3d' = '2d';

// Mapeo canónico: nombre de archivo de ilustración original ➔ acción semántica 3D
const FILENAME_TO_3D_ACTION: Record<string, Devil3DAction> = {
  'devil_idle.png': 'idle',
  'devil_aparecer_humo.png': 'appear',
  'devil_desaparecer_humo.png': 'disappear',
  'devil_risa_malvada.png': 'evilLaugh',
  'devil_victoria.png': 'evilLaugh',
  'devil_derrota.png': 'crouch',
  'devil_ataque.png': 'attack',
  'devil_sorprendido.png': 'crouch',
  'devil_pensando.png': 'idle',
  'devil_enojo.png': 'crouch',
  'devil_saludo.png': 'appear',
};

// ─────────────────────────────────────────────────────────────────────────────
// CSS DE ANIMACIONES — inyectado una sola vez en el <head>
// ─────────────────────────────────────────────────────────────────────────────
const DEVIL_CHARACTER_CSS = `
  /* Entrada suave */
  @keyframes devil-img-in {
    0%   { opacity: 0; transform: scale(0.88) translateY(8px); }
    60%  { opacity: 1; transform: scale(1.04) translateY(-4px); }
    80%  { transform: scale(0.98) translateY(2px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }

  /* Respiración idle */
  @keyframes devil-breathe {
    0%, 100% { transform: scaleY(1) scaleX(1) translateY(0); }
    40%       { transform: scaleY(1.025) scaleX(0.985) translateY(-3px); }
    70%       { transform: scaleY(0.985) scaleX(1.015) translateY(-1px); }
  }

  /* Shake — fallo del usuario */
  @keyframes devil-shake {
    0%, 100% { transform: translateX(0) rotate(0deg); }
    15%      { transform: translateX(-7px) rotate(-2deg); }
    30%      { transform: translateX(7px) rotate(2deg); }
    45%      { transform: translateX(-5px) rotate(-1.5deg); }
    60%      { transform: translateX(5px) rotate(1.5deg); }
    75%      { transform: translateX(-3px) rotate(-0.5deg); }
    90%      { transform: translateX(3px) rotate(0.5deg); }
  }

  /* Burst de ataque */
  @keyframes devil-attack-burst {
    0%   { transform: scale(1) rotate(0deg); filter: brightness(1); }
    20%  { transform: scale(1.18) rotate(-4deg); filter: brightness(1.4) drop-shadow(0 0 20px rgba(239,68,68,0.9)); }
    50%  { transform: scale(1.22) rotate(4deg); filter: brightness(1.6) drop-shadow(0 0 30px rgba(239,68,68,1)); }
    75%  { transform: scale(1.12) rotate(-2deg); filter: brightness(1.2); }
    100% { transform: scale(1) rotate(0deg); filter: brightness(1); }
  }

  /* Partícula de fuego en ataque */
  @keyframes fire-particle {
    0%   { transform: translate(0, 0) scale(1); opacity: 1; }
    100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
  }

  /* Efecto de humo purpúreo para 3D */
  @keyframes smoke-puff-3d {
    0%   { transform: scale(0.35); opacity: 0; filter: blur(4px); }
    30%  { opacity: 0.9; filter: blur(2px); }
    100% { transform: scale(1.4); opacity: 0; filter: blur(16px); }
  }

  .devil-char-enter {
    animation: devil-img-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  .devil-char-breathe {
    animation: devil-breathe 3.8s ease-in-out infinite;
  }
  .devil-char-shake {
    animation: devil-shake 0.55s ease-in-out forwards;
  }
  .devil-char-attack {
    animation: devil-attack-burst 0.65s ease-in-out forwards;
  }
  .devil-smoke-overlay {
    animation: smoke-puff-3d 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
`;

const FIRE_PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  tx: `${(Math.random() - 0.5) * 120}px`,
  ty: `${-(Math.random() * 80 + 40)}px`,
  delay: `${i * 0.06}s`,
  emoji: ['🔥', '✨', '💥', '⚡'][i % 4],
}));

interface DevilCharacterProps {
  event: DevilGameEvent | string;
  size?: number;
  className?: string;
  showEventBadge?: boolean;
}

export default function DevilCharacter({
  event,
  size = 280,
  className = '',
  showEventBadge = false,
}: DevilCharacterProps) {
  const cssInjected = useRef(false);
  const [activeAction3D, setActiveAction3D] = useState<Devil3DAction>('idle');
  const [showSmoke, setShowSmoke] = useState(false);

  const {
    currentImage,
    currentFilename,
    currentEvent,
    isTransitioning,
    isShaking,
    isAttacking,
    triggerEvent,
  } = useDevilEmotion(event);

  // Sincronizar evento de entrada y mapear a acción 3D
  useEffect(() => {
    triggerEvent(event);
  }, [event, triggerEvent]);

  // Actualizar la acción 3D activa al cambiar la ilustración 2D resuelta
  useEffect(() => {
    if (DEVIL_RENDER_MODE === '3d') {
      const targetAction = FILENAME_TO_3D_ACTION[currentFilename] || 'idle';
      setActiveAction3D(targetAction);

      // Disparar humo en aparición
      if (targetAction === 'appear') {
        setShowSmoke(true);
        const smokeTimer = setTimeout(() => setShowSmoke(false), 1400);
        return () => clearTimeout(smokeTimer);
      }
    }
  }, [currentFilename]);

  // Inyectar CSS una sola vez
  useEffect(() => {
    if (cssInjected.current) return;
    cssInjected.current = true;
    const style = document.createElement('style');
    style.setAttribute('data-devil-char', 'true');
    style.textContent = DEVIL_CHARACTER_CSS;
    document.head.appendChild(style);
  }, []);

  const handleActionComplete = (finishedAction: Devil3DAction) => {
    // No retornar a idle automáticamente; mantener el fotograma final de la animación hasta una nueva acción.
  };

  const animClass = isShaking
    ? 'devil-char-shake'
    : isAttacking
    ? 'devil-char-attack'
    : 'devil-char-breathe';

  // Si está desmontado
  const isHidden = false;

  if (isHidden) return null;

  return (
    <div
      className={`relative flex flex-col items-center select-none ${className}`}
      style={{ width: size, minHeight: size }}
    >
      {/* Aura de fondo */}
      <div
        className="absolute inset-0 rounded-full blur-2xl pointer-events-none"
        style={{
          background: isAttacking
            ? 'radial-gradient(circle, rgba(239,68,68,0.35) 0%, transparent 70%)'
            : isShaking
            ? 'radial-gradient(circle, rgba(251,146,60,0.25) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(139,0,0,0.12) 0%, transparent 70%)',
          transition: 'background 0.4s ease',
        }}
      />

      {/* Partículas de fuego en ataque */}
      {isAttacking && FIRE_PARTICLES.map((p) => (
        <span
          key={p.id}
          className="absolute text-lg pointer-events-none z-10"
          style={{
            top: '30%',
            left: '50%',
            ['--tx' as string]: p.tx,
            ['--ty' as string]: p.ty,
            animation: `fire-particle 0.7s ease-out forwards`,
            animationDelay: p.delay,
          }}
        >
          {p.emoji}
        </span>
      ))}

      {/* Humo 3D Overlay */}
      {showSmoke && (
        <div 
          className="absolute inset-0 z-30 pointer-events-none rounded-full flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <div 
            className="w-[85%] h-[85%] bg-gradient-to-tr from-purple-800/40 via-[#ef4444]/25 to-transparent rounded-full devil-smoke-overlay"
          />
        </div>
      )}

      {/* Renderizado Condicional: 3D vs 2D */}
      {DEVIL_RENDER_MODE === '3d' ? (
        <div 
          className="relative flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <Devil3D 
            action={activeAction3D} 
            size={size} 
            onActionComplete={handleActionComplete} 
          />
        </div>
      ) : (
        <div
          className={`relative transition-opacity duration-300 ${animClass}`}
          style={{
            width: size,
            height: size,
            opacity: isTransitioning ? 0 : 1,
          }}
        >
          <Image
            key={currentImage}
            src={currentImage}
            alt={`Diablo: ${currentEvent}`}
            fill
            className="object-contain devil-char-enter"
            priority
            onError={() => {
              console.error(
                `[DevilCharacter] ❌ Imagen no encontrada: "${currentImage}".`
              );
            }}
          />
        </div>
      )}

      {/* Badge de evento (opcional) */}
      {showEventBadge && (
        <div className="mt-2 flex flex-col items-center gap-1 z-20">
          <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-950/60 border border-red-800/40 rounded-full px-3 py-0.5">
            {DEVIL_RENDER_MODE === '3d' ? `3D: ${activeAction3D}` : currentEvent}
          </span>
          <span className="text-[9px] text-slate-500 font-mono">
            {DEVIL_RENDER_MODE === '3d' ? devil3DAnimationMap[activeAction3D].split('/').pop() : currentFilename}
          </span>
        </div>
      )}
    </div>
  );
}
