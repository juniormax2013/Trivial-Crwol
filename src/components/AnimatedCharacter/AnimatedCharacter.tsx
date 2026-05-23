'use client';

import React, { useEffect, useState } from 'react';
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import Image from 'next/image';
import { useCharacterAction, GameEvent } from '../../hooks/useCharacterAction';
import { Sparkles, Flame } from 'lucide-react';

interface AnimatedCharacterProps {
  event: GameEvent;
  className?: string;
  showInfoBadge?: boolean;
}

export default function AnimatedCharacter({
  event,
  className = '',
  showInfoBadge = true,
}: AnimatedCharacterProps) {
  // 1. Obtener la acción activa y el mapeo a través del Hook de Rive
  const {
    stateMachineName,
    currentAction,
    triggerEvent,
  } = useCharacterAction('devil');

  const [riveError, setRiveError] = useState(false);

  // Bandera inteligente para forzar el modo visualizador premium (fallback interactivo)
  // mientras el archivo Rive real (.riv) esté pendiente de ser animado y cargado en el proyecto.
  // Cambia FORCE_FALLBACK a false para activar el canvas de WebGL una vez que devil.riv sea real.
  const FORCE_FALLBACK = true;
  const showFallback = riveError || FORCE_FALLBACK;

  // Sincronizar la prop de evento con el hook interno
  useEffect(() => {
    triggerEvent(event);
  }, [event, triggerEvent]);

  // 2. Inicialización del canvas de Rive
  const { rive, RiveComponent } = useRive({
    src: '/assets/characters/devil/devil.riv',
    stateMachines: stateMachineName,
    autoplay: true,
    onLoadError: () => {
      // Capturar si falla la carga del binario .riv (útil porque devil.riv es un placeholder en este momento)
      setRiveError(true);
    },
  });

  // 3. Obtener Inputs de Rive
  const stateInput = useStateMachineInput(rive, stateMachineName, 'state');
  const triggerActionInput = useStateMachineInput(rive, stateMachineName, 'triggerAction');
  const isEnragedInput = useStateMachineInput(rive, stateMachineName, 'isEnraged');

  // 4. Aplicar los valores de los Inputs en respuesta a la Acción Activa
  useEffect(() => {
    if (!rive || !currentAction || showFallback) return;

    // Resetear enojo por defecto para no arrastrar estados viejos
    if (currentAction.name !== 'enojo' && isEnragedInput) {
      isEnragedInput.value = false;
    }

    if (currentAction.type === 'state' && stateInput) {
      stateInput.value = currentAction.value as number;
    } else if (currentAction.type === 'trigger' && triggerActionInput) {
      triggerActionInput.fire();
    } else if (currentAction.type === 'boolean' && isEnragedInput) {
      isEnragedInput.value = true;
    }
  }, [currentAction, rive, stateInput, triggerActionInput, isEnragedInput, showFallback]);

  // 5. Obtener la clase de animación física basada en el evento
  const getAnimationClass = () => {
    switch (event) {
      case 'app_loading':
        return 'devil-anim-pensando';
      case 'user_answer_wrong':
        return 'devil-anim-risa';
      case 'user_correct_streak':
        return 'devil-anim-enojo';
      case 'user_won_game':
        return 'devil-anim-derrota';
      case 'user_lost_game':
        return 'devil-anim-victoria';
      case 'devil_power_activated':
        return 'devil-anim-ataque';
      case 'user_two_correct_answers':
        return 'devil-anim-sorprendido';
      case 'devil_exit_screen':
        return 'devil-anim-desaparecer';
      case 'devil_enter_screen':
        return 'devil-anim-aparecer';
      case 'default_state':
      default:
        if (currentAction?.name === 'saludo') return 'devil-anim-saludo';
        return 'devil-anim-idle';
    }
  };

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* ── CONTENEDOR PRINCIPAL PREMIUM ── */}
      <div className="relative w-72 h-72 rounded-[2.5rem] bg-gradient-to-br from-white/95 to-slate-50/80 dark:from-slate-900/90 dark:to-slate-950/80 border border-white/20 dark:border-slate-800/60 shadow-[0_24px_60px_-20px_rgba(49,0,101,0.15)] flex items-center justify-center overflow-hidden group p-4 transition-all duration-500 hover:shadow-[0_30px_70px_-15px_rgba(49,0,101,0.22)]">
        
        {/* Destellos de iluminación trasera */}
        <div className={`absolute -inset-10 rounded-[3rem] transition-all duration-700 blur-[40px] opacity-15 pointer-events-none ${
          event === 'user_answer_wrong' || event === 'user_correct_streak'
            ? 'bg-red-500 animate-pulse'
            : event === 'user_lost_game'
            ? 'bg-[#e9c349]'
            : event === 'user_won_game'
            ? 'bg-blue-500'
            : 'bg-[#310065]'
        }`} />

        {/* ── RENDERING / FALLBACK LOGIC ── */}
        {showFallback ? (
          // FALLBACK PREMIUM CON IMAGEN PREVIEW GENERADA POR IA + DIÁLOGOS DINÁMICOS + EFECTOS VISUALES + MOVIMIENTO FÍSICO
          <div className="relative w-full h-full flex flex-col items-center justify-center select-none p-4">
            
            {/* Burbuja de Diálogo Interactiva (Voz del Diablo) */}
            {currentAction && (
              <div 
                key={currentAction.name} // Forzar re-render para gatillar la animación de entrada
                className="absolute top-1 left-1/2 -translate-x-1/2 bg-slate-950/95 dark:bg-white text-white dark:text-slate-950 text-[10px] font-black px-3.5 py-2.5 rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.25)] border border-purple-500/30 dark:border-slate-200/50 w-[85%] max-w-[220px] text-center animate-bounce z-20 leading-snug tracking-tight"
              >
                <p>
                  {currentAction.name === 'risa_malvada' && '😈 "¡Jajaja! ¿En serio elegiste eso? ¡Qué ingenuo!"'}
                  {currentAction.name === 'victoria' && '🏆 "¡He triunfado! Tu racha ha terminado en mis manos."'}
                  {currentAction.name === 'derrota' && '💀 "¡Nooo! ¡Esto es imposible! ¡¿Cómo pudiste vencerme?!"'}
                  {currentAction.name === 'ataque' && '⚡ "¡Siente mi poder! ¡Activando trampa oscura ahora!"'}
                  {currentAction.name === 'sorprendido' && '😲 "¿¡Qué?! ¡¿Cómo respondiste bien?! ¡Debes estar haciendo trampa!"'}
                  {currentAction.name === 'pensando' && '🤔 "Mmm... interesante... analizando tu siguiente movimiento..."'}
                  {currentAction.name === 'enojo' && '😡 "¡Suficiente! ¡Esa racha de aciertos me está molestando demasiado!"'}
                  {currentAction.name === 'aparecer_humo' && '💨 "*Aparece entre humo elegante* ¡El juego comienza ahora!"'}
                  {currentAction.name === 'desaparecer_humo' && '🌪️ "*Desaparece en las sombras* ¡Esto no ha terminado!"'}
                  {currentAction.name === 'saludo' && '🎩 "Permíteme presentarme... soy tu rival hoy. ¿Jugamos?"'}
                  {currentAction.name === 'idle' && '⌛ "¿Vas a responder o te quedarás admirando mi traje impecable?"'}
                </p>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-950 dark:bg-white rotate-45 border-r border-b border-purple-500/30 dark:border-slate-200/50" />
              </div>
            )}

            {/* Glow de fuego/energía dinámico de fondo */}
            <div className={`absolute inset-6 rounded-[2.5rem] transition-all duration-700 blur-[30px] opacity-25 pointer-events-none ${
              event === 'user_answer_wrong' || event === 'user_correct_streak'
                ? 'bg-red-600 scale-110'
                : event === 'user_lost_game'
                ? 'bg-yellow-500 scale-110'
                : event === 'user_won_game'
                ? 'bg-blue-600 scale-90'
                : event === 'devil_power_activated'
                ? 'bg-purple-600 scale-125 animate-pulse'
                : 'bg-transparent'
            }`} />

            {/* Render de la imagen del Diablo Elegante con Efectos de Estados y Movimientos Físicos CSS */}
            <div className={`relative w-48 h-48 transition-all duration-500 ease-out select-none ${getAnimationClass()} ${
              event === 'user_won_game' ? 'opacity-40 grayscale blur-[1px]' : ''
            }`}>
              <Image
                src="/assets/characters/devil/devil_preview.png"
                alt="Diablo Elegante"
                fill
                className="object-contain pointer-events-none rounded-2xl drop-shadow-[0_12px_28px_rgba(0,0,0,0.15)]"
                priority
              />
            </div>
            
            {/* Aviso informativo de archivo Rive pendiente */}
            <div className="absolute bottom-1 left-4 right-4 bg-purple-950/80 border border-purple-500/30 px-3 py-1.5 rounded-2xl flex items-center justify-center gap-1.5 backdrop-blur-md text-center shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
              <span className="text-[8px] font-black text-purple-300 uppercase tracking-widest">
                Visualizador Interactivo Activo
              </span>
            </div>
          </div>
        ) : (
          // CANVAS DE RIVE REAL (Se cargará cuando el usuario integre el archivo .riv real)
          <RiveComponent className="w-full h-full object-contain" />
        )}
      </div>

      {/* ── BADGE INFORMATIVO DE ACCIONES (Punto de Vista del Diablo) ── */}
      {showInfoBadge && currentAction && (
        <div className="mt-4 px-4 py-2.5 bg-white/90 dark:bg-slate-900/95 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md flex flex-col items-center gap-0.5 text-center min-w-[240px]">
          <div className="flex items-center gap-1.5">
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
              currentAction.type === 'trigger'
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                : currentAction.type === 'boolean'
                ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
            }`}>
              {currentAction.type}
            </span>
            <span className="text-[12px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
              {currentAction.name}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 max-w-[220px] leading-tight">
            {currentAction.description}
          </span>
        </div>
      )}

      {/* ── ESTILOS CSS INYECTADOS PARA MOVIMIENTOS FÍSICOS PREMIUM DE CADA ESTADO ── */}
      <style>{`
        @keyframes devil-idle {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(0.8deg); }
        }
        @keyframes devil-saludo {
          0% { transform: scale(1) translateY(0) rotate(0deg); }
          30% { transform: scale(0.96) translateY(10px) rotate(-6deg); }
          70% { transform: scale(0.96) translateY(10px) rotate(-6deg); }
          100% { transform: scale(1) translateY(0) rotate(0deg); }
        }
        @keyframes devil-risa {
          0%, 100% { transform: translateY(0) scale(1) rotate(0deg); }
          20% { transform: translateY(-10px) scale(1.02) rotate(-2deg); }
          40% { transform: translateY(2px) scale(0.98) rotate(2deg); }
          60% { transform: translateY(-8px) scale(1.02) rotate(-1.5deg); }
          80% { transform: translateY(1px) scale(0.99) rotate(1.5deg); }
        }
        @keyframes devil-victoria {
          0%, 100% { transform: translateY(0) scale(1) rotate(0deg); }
          25% { transform: translateY(-20px) scale(1.04) rotate(2deg); }
          50% { transform: translateY(2px) scale(0.97) rotate(-1deg); }
          75% { transform: translateY(-12px) scale(1.02) rotate(-2deg); }
        }
        @keyframes devil-derrota {
          0% { transform: translateY(0) rotate(0deg) scale(1); filter: grayscale(0); }
          100% { transform: translateY(20px) rotate(10deg) scale(0.8); filter: grayscale(0.8); }
        }
        @keyframes devil-ataque {
          0% { transform: translateX(0) scale(1); }
          15% { transform: translateX(-15px) scale(0.97) rotate(-3deg); }
          35% { transform: translateX(35px) scale(1.08) rotate(4deg); }
          60% { transform: translateX(-5px) scale(1.01); }
          100% { transform: translateX(0) scale(1); }
        }
        @keyframes devil-sorprendido {
          0% { transform: scale(1) translateY(0); }
          15% { transform: scale(1.15) translateY(-15px) rotate(-4deg); }
          40% { transform: scale(0.96) translateY(4px) rotate(2deg); }
          70% { transform: scale(1.03) translateY(-1px); }
          100% { transform: scale(1) translateY(0); }
        }
        @keyframes devil-pensando {
          0%, 100% { transform: translateX(0) translateY(0) rotate(0deg); }
          33% { transform: translateX(-3px) translateY(-2px) rotate(-1deg); }
          66% { transform: translateX(3px) translateY(1px) rotate(1deg); }
        }
        @keyframes devil-enojo {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          10%, 90% { transform: translate(-1.5px, 0.5px) rotate(-0.5deg); }
          20%, 80% { transform: translate(1.5px, -0.5px) rotate(0.5deg); }
          30%, 70% { transform: translate(-2px, -0.5px) rotate(-1deg); }
          40%, 60% { transform: translate(2px, 0.5px) rotate(1deg); }
          50% { transform: translate(-0.5px, 1.5px) rotate(0deg); }
        }
        @keyframes devil-aparecer {
          0% { transform: scale(0) rotate(-120deg) translateY(40px); filter: blur(10px); opacity: 0; }
          100% { transform: scale(1) rotate(0deg) translateY(0); filter: blur(0); opacity: 1; }
        }
        @keyframes devil-desaparecer {
          0% { transform: scale(1) rotate(0deg) translateY(0); filter: blur(0); opacity: 1; }
          100% { transform: scale(0.3) rotate(120deg) translateY(-60px); filter: blur(12px); opacity: 0; }
        }

        .devil-anim-idle { animation: devil-idle 2.5s ease-in-out infinite; }
        .devil-anim-saludo { animation: devil-saludo 1.2s ease-in-out forwards; }
        .devil-anim-risa { animation: devil-risa 0.7s ease-in-out infinite; }
        .devil-anim-victoria { animation: devil-victoria 1.3s ease-in-out infinite; }
        .devil-anim-derrota { animation: devil-derrota 1.5s ease-in-out forwards; }
        .devil-anim-ataque { animation: devil-ataque 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards; }
        .devil-anim-sorprendido { animation: devil-sorprendido 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .devil-anim-pensando { animation: devil-pensando 3.5s ease-in-out infinite; }
        .devil-anim-enojo { animation: devil-enojo 0.12s linear infinite; }
        .devil-anim-aparecer { animation: devil-aparecer 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .devil-anim-desaparecer { animation: devil-desaparecer 0.7s cubic-bezier(0.36, 0, 0.66, -0.56) forwards; }
      `}</style>
    </div>
  );
}
