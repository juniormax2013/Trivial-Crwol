'use client';

import React, { useEffect, useState, useRef } from 'react';
import type { JesusAnimState } from '@/hooks/useJesusTrap';
import JesusCharacter from '@/src/components/JesusCharacter';

const JESUS_CSS = `
  /* Resplandor celestial */
  @keyframes jesus-aura-pulse {
    0%, 100% { opacity: 0.2; transform: scale(1); }
    50%     { opacity: 0.45;  transform: scale(1.1); }
  }

  /* Movimiento flotante de Jesús */
  @keyframes jesus-float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50%     { transform: translateY(-5px) rotate(0.5deg); }
  }

  /* Burbuja de diálogo divina */
  @keyframes jesus-bubble-bounce {
    0%, 100% { transform: translateY(0) scale(1); }
    50%     { transform: translateY(-3px) scale(1.02); }
  }

  .jesus-glow-active {
    animation: jesus-aura-pulse 2.5s ease-in-out infinite;
  }
  .jesus-floating-active {
    animation: jesus-float 4s ease-in-out infinite;
  }
`;

function getJesusBubbleText(state: JesusAnimState): string {
  switch (state) {
    case 'appear':      return 'La paz sea contigo. ✨';
    case 'greeting':    return 'No temas, yo te guiaré. 🌟';
    case 'blessing':    return 'Recibe mi bendición. ☀️';
    case 'celebrating': return '¡Excelente respuesta! 💛';
    case 'compassion':  return 'Ten paz, sigue adelante. 🌱';
    case 'revealing':   return 'He aquí la verdad. 🔍';
    case 'protecting':  return 'El mal no prevalecerá. 🛡️';
    case 'victory':     return '¡Victoria gloriosa! 🎉';
    default:            return 'Sigue adelante. ✨';
  }
}

interface JesusTrapOverlayProps {
  isActive: boolean;
  jesusState?: JesusAnimState;
  jesusEvent?: string | null;
}

export default function JesusTrapOverlay({
  isActive,
  jesusState = 'idle',
  jesusEvent = null,
}: JesusTrapOverlayProps) {
  const cssInjected = useRef(false);

  useEffect(() => {
    if (cssInjected.current) return;
    cssInjected.current = true;
    const style = document.createElement('style');
    style.textContent = JESUS_CSS;
    document.head.appendChild(style);
  }, []);

  if (!isActive || jesusState === 'hidden') return null;

  // Estilo del contenedor principal
  const wrapperStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '80px',
    right: '8px',
    zIndex: 48,
    pointerEvents: 'none',
  };

  // Color de aura según estado
  const auraColor = () => {
    if (jesusState === 'protecting') return 'rgba(56,189,248,0.5)'; // Celeste de escudo
    if (jesusState === 'revealing') return 'rgba(253,224,71,0.6)'; // Dorado brillante
    if (jesusState === 'celebrating') return 'rgba(74,222,128,0.4)'; // Verde suave de acierto
    return 'rgba(253,224,71,0.25)'; // Amarillo cálido estándar
  };

  return (
    <div style={wrapperStyle}>
      <div className="flex flex-col items-center select-none jesus-floating-active">
        
        {/* Aura resplandeciente */}
        <div
          className="absolute inset-0 rounded-full blur-3xl jesus-glow-active"
          style={{
            background: auraColor(),
            transition: 'background 0.5s ease',
          }}
        />

        {/* Personaje Jesús */}
        <div className="relative overflow-visible flex items-center justify-center">
          <JesusCharacter
            event={
              jesusEvent ? jesusEvent :
              jesusState === 'appear' ? 'jesus_appear' :
              jesusState === 'greeting' ? 'jesus_greeting' :
              jesusState === 'blessing' ? 'jesus_blessing_start' :
              jesusState === 'celebrating' ? 'jesus_celebrate_correct' :
              jesusState === 'compassion' ? 'jesus_compassion_wrong' :
              jesusState === 'revealing' ? 'jesus_reveal_answer' :
              jesusState === 'protecting' ? 'jesus_protect_devil' :
              jesusState === 'victory' ? 'jesus_glorious_victory' :
              jesusState === 'disappearing' ? 'jesus_disappear' :
              'jesus_idle'
            }
            size={215}
          />
        </div>

        {/* Diálogo de Jesús */}
        <div
          className="mt-1 bg-amber-500/90 text-white border border-amber-300/30 text-[9px] uppercase font-black tracking-widest px-3.5 py-1.5 rounded-full shadow-[0_4px_12px_rgba(251,191,36,0.3)] backdrop-blur-sm whitespace-nowrap"
          style={{ animation: 'jesus-bubble-bounce 2s ease-in-out infinite' }}
        >
          {getJesusBubbleText(jesusState)}
        </div>
      </div>
    </div>
  );
}
