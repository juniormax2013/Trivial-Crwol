'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useDevilEmotion } from '../../hooks/useDevilEmotion';
import type { DevilGameEvent } from '../../data/devilEmotionMap';

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
`;

// ─────────────────────────────────────────────────────────────────────────────
// PARTÍCULAS DE FUEGO (solo en ataque)
// ─────────────────────────────────────────────────────────────────────────────

const FIRE_PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  tx: `${(Math.random() - 0.5) * 120}px`,
  ty: `${-(Math.random() * 80 + 40)}px`,
  delay: `${i * 0.06}s`,
  emoji: ['🔥', '✨', '💥', '⚡'][i % 4],
}));

// ─────────────────────────────────────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────────────────────────────────────

interface DevilCharacterProps {
  /** Evento de juego — determina qué imagen se muestra */
  event: DevilGameEvent | string;
  /** Tamaño en píxeles (cuadrado). Por defecto: 280 */
  size?: number;
  /** Clase CSS adicional para el contenedor raíz */
  className?: string;
  /** Muestra badge de evento debajo del personaje */
  showEventBadge?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────────────────────────────────────

export default function DevilCharacter({
  event,
  size = 280,
  className = '',
  showEventBadge = false,
}: DevilCharacterProps) {
  const cssInjected = useRef(false);

  const {
    currentImage,
    currentFilename,
    currentEvent,
    isTransitioning,
    isShaking,
    isAttacking,
    triggerEvent,
  } = useDevilEmotion(event);

  // Sync: cuando la prop event cambia externamente, re-trigger
  useEffect(() => {
    triggerEvent(event);
  }, [event, triggerEvent]);

  // Inyectar CSS de animaciones una sola vez
  useEffect(() => {
    if (cssInjected.current) return;
    cssInjected.current = true;
    const style = document.createElement('style');
    style.setAttribute('data-devil-char', 'true');
    style.textContent = DEVIL_CHARACTER_CSS;
    document.head.appendChild(style);
  }, []);

  // Determinar clase de animación activa
  const animClass = isShaking
    ? 'devil-char-shake'
    : isAttacking
    ? 'devil-char-attack'
    : 'devil-char-breathe';

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

      {/* Partículas de fuego (solo en ataque) */}
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

      {/* Imagen del diablo */}
      <div
        className={`relative transition-opacity duration-300 ${animClass}`}
        style={{
          width: size,
          height: size,
          opacity: isTransitioning ? 0 : 1,
        }}
      >
        <Image
          key={currentImage} // fuerza re-mount con animación de entrada en cada cambio
          src={currentImage}
          alt={`Diablo: ${currentEvent}`}
          fill
          className="object-contain devil-char-enter"
          priority
          onError={() => {
            console.error(
              `[DevilCharacter] ❌ Imagen no encontrada: "${currentImage}". ` +
              `Verifica que el archivo existe en: public${currentImage}`
            );
          }}
        />
      </div>

      {/* Badge de evento (opcional) */}
      {showEventBadge && (
        <div className="mt-2 flex flex-col items-center gap-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-red-400 bg-red-950/60 border border-red-800/40 rounded-full px-3 py-0.5">
            {currentEvent}
          </span>
          <span className="text-[9px] text-slate-500 font-mono">
            {currentFilename}
          </span>
        </div>
      )}
    </div>
  );
}
