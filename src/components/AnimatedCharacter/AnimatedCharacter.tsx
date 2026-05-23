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
    if (!rive || !currentAction || riveError) return;

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
  }, [currentAction, rive, stateInput, triggerActionInput, isEnragedInput, riveError]);

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
        {riveError ? (
          // FALLBACK PREMIUM CON IMAGEN PREVIEW GENERADA POR IA + ANIMACIONES CSS
          <div className="relative w-full h-full flex flex-col items-center justify-center select-none">
            {/* Glow de fuego enojado/activo */}
            {(event === 'user_answer_wrong' || event === 'user_correct_streak') && (
              <div className="absolute top-8 text-red-500 animate-bounce">
                <Flame className="w-8 h-8 fill-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
              </div>
            )}

            {/* Render de la imagen del Diablo Elegante */}
            <div className={`relative w-48 h-48 transition-all duration-500 ${
              event === 'app_loading'
                ? 'animate-pulse scale-95'
                : event === 'user_answer_wrong'
                ? 'animate-bounce scale-105 saturate-120'
                : event === 'user_correct_streak'
                ? 'animate-bounce scale-105 brightness-110 drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                : event === 'user_won_game'
                ? 'scale-90 opacity-80 brightness-75 grayscale'
                : 'animate-none'
            }`}>
              <Image
                src="/assets/characters/devil/devil_preview.png"
                alt="Diablo Elegante"
                fill
                className="object-contain pointer-events-none rounded-2xl drop-shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
                priority
              />
            </div>
            
            {/* Aviso informativo de archivo Rive pendiente */}
            <div className="absolute bottom-3 left-4 right-4 bg-amber-500/10 border border-amber-500/20 px-3 py-2.5 rounded-2xl flex flex-col items-center justify-center gap-0.5 backdrop-blur-md text-center">
              <span className="text-[9px] font-black text-[#310065] dark:text-[#f59e0b] uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                Rive file pendiente
              </span>
              <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">
                agrega devil.riv en assets/characters/devil/devil.riv
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
        <div className="mt-4 px-4 py-2 bg-white/80 dark:bg-slate-900/90 border border-slate-200/50 dark:border-slate-800/60 rounded-2xl shadow-md backdrop-blur-md flex flex-col items-center gap-0.5 text-center min-w-[240px]">
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
              currentAction.type === 'trigger'
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                : currentAction.type === 'boolean'
                ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                : 'bg-[#310065]/10 text-[#310065] dark:text-[#a855f7]'
            }`}>
              {currentAction.type}
            </span>
            <span className="text-[13px] font-black text-[#1b1b1e] dark:text-slate-100 uppercase tracking-tight">
              {currentAction.name}
            </span>
          </div>
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-400 max-w-[220px] leading-tight">
            {currentAction.description}
          </span>
        </div>
      )}
    </div>
  );
}
