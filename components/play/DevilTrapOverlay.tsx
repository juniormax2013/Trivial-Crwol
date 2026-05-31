'use client';

import React, { useEffect, useState, useRef } from 'react';
import type { DevilAnimState } from '@/hooks/useDevilTrap';
import DevilCharacter from '@/src/components/DevilCharacter';

// ─── Background image remover ──────────────────────────────────────────────
// Removes the white background from the devil PNG using flood-fill on client.
interface TransparentImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

function TransparentImage({ src, alt, className, style }: TransparentImageProps) {
  const [processedSrc, setProcessedSrc] = useState<string>('');

  useEffect(() => {
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
        // Fine-edge smoothing
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
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={processedSrc} alt={alt} className={className} style={style} />;
}

// ─── CSS keyframes injected once ──────────────────────────────────────────
const DEVIL_CSS = `
  /* Embers */
  @keyframes ember-rise {
    0%   { transform: translateY(0) scale(1);   opacity: 0.7; }
    100% { transform: translateY(-110vh) scale(0.3); opacity: 0; }
  }

  /* Screen shake on appear */
  @keyframes screen-shake {
    0%,100% { transform: translate(0,0) rotate(0deg); }
    15%  { transform: translate(-3px,-2px) rotate(-0.5deg); }
    30%  { transform: translate(3px,2px)  rotate(0.5deg); }
    45%  { transform: translate(-2px,3px) rotate(0deg); }
    60%  { transform: translate(2px,-1px) rotate(0.5deg); }
    75%  { transform: translate(-3px,1px) rotate(-0.5deg); }
    90%  { transform: translate(3px,3px)  rotate(0deg); }
  }

  /* APPEAR — slide in from left with bounce */
  @keyframes devil-appear {
    0%   { transform: translateX(-200px) rotate(-15deg) scale(0.6); opacity: 0; }
    55%  { transform: translateX(18px)  rotate(4deg) scale(1.08); opacity: 1; }
    75%  { transform: translateX(-8px)   rotate(-2deg)  scale(0.97); }
    90%  { transform: translateX(5px)  rotate(1deg) scale(1.02); }
    100% { transform: translateX(0)     rotate(0deg)  scale(1);    opacity: 1; }
  }

  /* IDLE — breathing + gentle sway */
  @keyframes devil-idle {
    0%,100% { transform: scaleY(1)    scaleX(1)    translateY(0)   rotate(0deg); }
    30%     { transform: scaleY(1.03) scaleX(0.98) translateY(-4px) rotate(-1.5deg); }
    60%     { transform: scaleY(0.98) scaleX(1.02) translateY(-2px) rotate(1deg); }
  }

  /* WALK — horizontal march with vertical bounce (suavizado y lento en la esquina) */
  @keyframes devil-walk-pos {
    0%   { left: 8px; }
    50%  { left: 12%; }
    100% { left: 8px; }
  }
  @keyframes devil-walk-body {
    0%,100% { transform: translateY(0)   rotate(0deg); }
    25%      { transform: translateY(-2px) rotate(-0.5deg); }
    50%      { transform: translateY(0)   rotate(0deg); }
    75%      { transform: translateY(-2px) rotate(0.5deg); }
  }

  /* TAUNT — lean in, vibrate, show malice */
  @keyframes devil-taunt {
    0%   { transform: scale(1)    rotate(0deg)  translateX(0)   translateY(0); }
    20%  { transform: scale(1.14) rotate(-4deg) translateX(-8px) translateY(-6px); }
    35%  { transform: scale(1.16) rotate(4deg)  translateX(6px)  translateY(-8px); }
    50%  { transform: scale(1.18) rotate(-3deg) translateX(-4px) translateY(-10px); }
    65%  { transform: scale(1.15) rotate(3deg)  translateX(5px)  translateY(-7px); }
    80%  { transform: scale(1.12) rotate(-2deg) translateX(-3px) translateY(-4px); }
    100% { transform: scale(1)    rotate(0deg)  translateX(0)   translateY(0); }
  }

  /* CELEBRATE — jump, spin, big energy */
  @keyframes devil-celebrate {
    0%   { transform: translateY(0)    scale(1)    rotate(0deg); }
    20%  { transform: translateY(-22px) scale(1.18) rotate(-6deg); }
    35%  { transform: translateY(-30px) scale(1.22) rotate(8deg); }
    50%  { transform: translateY(-18px) scale(1.15) rotate(-4deg); }
    65%  { transform: translateY(-24px) scale(1.2)  rotate(6deg); }
    80%  { transform: translateY(-10px) scale(1.1)  rotate(-3deg); }
    100% { transform: translateY(0)    scale(1)    rotate(0deg); }
  }

  /* DEFEAT — shrink, wilt, fade out */
  @keyframes devil-defeat {
    0%   { transform: scale(1)    rotate(0deg)  translateX(0)   translateY(0);   opacity: 1; }
    15%  { transform: scale(0.9)  rotate(8deg)  translateX(5px)  translateY(5px);  opacity: 0.9; }
    35%  { transform: scale(0.78) rotate(-5deg) translateX(-8px) translateY(10px); opacity: 0.7; }
    55%  { transform: scale(0.65) rotate(4deg)  translateX(3px)  translateY(18px); opacity: 0.45; }
    75%  { transform: scale(0.5)  rotate(-2deg) translateX(-5px) translateY(26px); opacity: 0.25; }
    100% { transform: scale(0.3)  rotate(0deg)  translateX(-100px) translateY(40px); opacity: 0; }
  }

  /* Aura glow pulse */
  @keyframes aura-pulse {
    0%,100% { opacity: 0.25; transform: scale(1); }
    50%     { opacity: 0.5;  transform: scale(1.1); }
  }

  /* Speech bubble bounce */
  @keyframes bubble-bounce {
    0%,100% { transform: translateY(0) scale(1); }
    50%     { transform: translateY(-4px) scale(1.03); }
  }

  /* Fire particle celebrate burst */
  @keyframes fire-burst {
    0%   { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-60px) scale(0); opacity: 0; }
  }
`;

// ─── Particle ember types ──────────────────────────────────────────────────
interface Ember { id: number; left: number; size: number; delay: number; duration: number; }

// ─── State config ──────────────────────────────────────────────────────────
function getBubbleText(state: DevilAnimState): string {
  switch (state) {
    case 'appear':    return '¡Aquí estoy! 😈';
    case 'walk':      return '¡Ja ja ja! 🔥';
    case 'taunt':     return '¡Trampa activada! 😏';
    case 'celebrate': return '¡MUAJAJA! 🎉';
    case 'defeat':    return '¡Nooo! 😱';
    default:          return '¡Muajaja! 😈';
  }
}

// ─── Main component ────────────────────────────────────────────────────────
interface DevilTrapOverlayProps {
  isActive: boolean;
  devilState?: DevilAnimState;
  devilMode?: 'POWER_MODE' | 'OBSERVER_MODE';
  devilEvent?: string | null;
}

export default function DevilTrapOverlay({ 
  isActive, 
  devilState = 'idle',
  devilMode = 'POWER_MODE',
  devilEvent = null
}: DevilTrapOverlayProps) {
  const [embers, setEmbers] = useState<Ember[]>([]);
  const [fireBursts, setFireBursts] = useState<{ id: number; left: number; bottom: number }[]>([]);
  const cssInjected = useRef(false);

  // Inject CSS once
  useEffect(() => {
    if (cssInjected.current) return;
    cssInjected.current = true;
    const style = document.createElement('style');
    style.textContent = DEVIL_CSS;
    document.head.appendChild(style);
  }, []);

  // Generate embers when active
  useEffect(() => {
    if (!isActive) { setEmbers([]); return; }
    setEmbers(
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: Math.random() * 6 + 3,
        delay: Math.random() * 5,
        duration: Math.random() * 4 + 4,
      }))
    );
  }, [isActive]);

  // Fire bursts on celebrate
  useEffect(() => {
    if (devilState !== 'celebrate') { setFireBursts([]); return; }
    setFireBursts(
      Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        left: 30 + Math.random() * 60,
        bottom: 20 + Math.random() * 40,
      }))
    );
  }, [devilState]);

  if (!isActive || devilState === 'hidden') return null;

  // ── Character animation style per state ──
  const charStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = { transformOrigin: 'bottom center' };
    switch (devilState) {
      case 'appear':
        return { ...base, animation: 'devil-appear 1s cubic-bezier(0.34,1.56,0.64,1) forwards' };
      case 'idle':
        return { ...base, animation: 'devil-idle 3.5s ease-in-out infinite' };
      case 'walk':
        return { ...base, animation: 'devil-walk-body 2.4s ease-in-out infinite' };
      case 'taunt':
        return { ...base, animation: 'devil-taunt 1.4s ease-in-out forwards' };
      case 'celebrate':
        return { ...base, animation: 'devil-celebrate 0.7s ease-out 2' };
      case 'defeat':
        return { ...base, animation: 'devil-defeat 1.8s ease-in forwards' };
      default:
        return base;
    }
  };

  // Walk changes position; other states stay fixed bottom-right
  const wrapperStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'fixed',
      bottom: '80px',
      zIndex: 48,
      pointerEvents: 'none',
    };
    if (devilState === 'walk') {
      return { ...base, left: '8px', animation: 'devil-walk-pos 12s ease-in-out infinite' };
    }
    return { ...base, left: '8px' };
  };

  // Aura color varies per state
  const auraColor = () => {
    if (devilState === 'celebrate') return 'rgba(251,146,60,0.6)';
    if (devilState === 'defeat') return 'rgba(100,100,100,0.3)';
    if (devilState === 'taunt') return 'rgba(239,68,68,0.7)';
    return 'rgba(239,68,68,0.35)';
  };

  const dropShadow = () => {
    if (devilState === 'defeat') return 'drop-shadow(0 0 8px rgba(150,150,150,0.4))';
    if (devilState === 'taunt') return 'drop-shadow(0 0 28px rgba(239,68,68,1))';
    if (devilState === 'celebrate') return 'drop-shadow(0 0 24px rgba(251,146,60,0.9))';
    return 'drop-shadow(0 0 18px rgba(239,68,68,0.75))';
  };

  const charSize = devilState === 'celebrate' ? 'w-36 h-36 md:w-44 md:h-44' : 'w-28 h-28 md:w-36 md:h-36';

  return (
    <>
      {/* Badge de Diablo Observando en OBSERVER_MODE */}
      {isActive && devilMode === 'OBSERVER_MODE' && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[50] animate-bounce pointer-events-none">
          <div className="bg-slate-900/95 dark:bg-slate-950/98 text-cyan-400 border border-cyan-500/30 text-xs font-black uppercase tracking-widest px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
            <span>El diablo está observando la partida</span>
          </div>
        </div>
      )}

      {/* Screen shake div — only on appear */}
      {devilState === 'appear' && (
        <div
          className="fixed inset-0 pointer-events-none z-[49]"
          style={{ animation: 'screen-shake 0.6s ease-out forwards' }}
        />
      )}

      {/* Background fiery ambient overlay deshabilitado para evitar alterar el fondo del juego */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-all duration-1000"
        style={{
          background: 'transparent',
          backdropFilter: 'none',
        }}
      />

      {/* Embers particle system */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]">
        {embers.map((e) => (
          <div
            key={e.id}
            className="absolute bottom-0 rounded-full"
            style={{
              width: `${e.size}px`,
              height: `${e.size}px`,
              left: `${e.left}%`,
              background: devilState === 'defeat'
                ? 'radial-gradient(circle, #666, #333)'
                : 'radial-gradient(circle, #fb923c, #ef4444)',
              opacity: devilState === 'defeat' ? 0.2 : 0.6,
              animation: `ember-rise ${e.duration}s linear infinite`,
              animationDelay: `${e.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Fire bursts (celebrate only) */}
      {fireBursts.map((b) => (
        <div
          key={b.id}
          className="fixed pointer-events-none z-[2] text-xl"
          style={{
            left: `${b.left}%`,
            bottom: `${b.bottom}%`,
            animation: `fire-burst 0.8s ease-out forwards`,
            animationDelay: `${b.id * 0.08}s`,
          }}
        >
          🔥
        </div>
      ))}

      {/* ── Devil Character ── */}
      <div style={wrapperStyle()}>
        <div className="flex flex-col items-center select-none">

          {/* Aura glow ring */}
          <div
            className="absolute inset-0 rounded-full blur-3xl"
            style={{
              background: auraColor(),
              animation: devilState === 'defeat' ? 'none' : 'aura-pulse 2s ease-in-out infinite',
            }}
          />

          {/* Nuevo Renderizado Animado Premium con las 11 ilustraciones del diablo */}
          <div
            className="relative overflow-visible flex items-center justify-center"
          >
            <DevilCharacter
              event={
                devilEvent ? devilEvent :
                devilState === 'appear' ? 'devil_enter_screen' :
                devilState === 'celebrate' ? 'user_answer_wrong' :
                devilState === 'defeat' ? 'user_won_against_devil' :
                devilState === 'taunt' ? 'devil_power_activated' :
                devilState === 'walk' ? 'devil_power_activated' :
                devilState === 'idle' ? 'devil_idle' :
                'devil_idle'
              }
              size={200}
            />
          </div>

          {/* Speech bubble — hidden during defeat */}
          {devilState !== 'defeat' && (
            <div
              className="mt-1 bg-red-950/95 text-red-200 border border-red-500/30 text-[9px] uppercase font-black tracking-widest px-3 py-1 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.5)] backdrop-blur-sm whitespace-nowrap"
              style={{ animation: 'bubble-bounce 1.8s ease-in-out infinite' }}
            >
              {getBubbleText(devilState)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
