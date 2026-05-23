'use client';

import { useState, useCallback } from 'react';

export interface UseDevilPowerReturn {
  /** Colección de IDs de opciones que el usuario ya tocó y por tanto reveló */
  revealedOptionIds: string[];
  /** Revela una respuesta específica al tocarla */
  revealOption: (optionId: string) => void;
  /** Evalúa si una respuesta específica debe presentarse tapada por la trampa */
  isOptionCovered: (optionId: string, isDevilPowerActive: boolean) => boolean;
  /** Limpia el registro de opciones reveladas (se usa al cambiar de pregunta) */
  resetPower: () => void;
}

/**
 * HOOK DE PODER: useDevilPower
 * Gestiona el estado de tapado y revelación progresiva de las respuestas de trivia
 * cuando el poder de cartas cubiertas del diablo está activo.
 */
export function useDevilPower(): UseDevilPowerReturn {
  const [revealedOptionIds, setRevealedOptionIds] = useState<string[]>([]);

  const revealOption = useCallback((optionId: string) => {
    setRevealedOptionIds((prev) => {
      if (prev.includes(optionId)) return prev;
      return [...prev, optionId];
    });
  }, []);

  const isOptionCovered = useCallback((optionId: string, isDevilPowerActive: boolean): boolean => {
    if (!isDevilPowerActive) return false;
    return !revealedOptionIds.includes(optionId);
  }, [revealedOptionIds]);

  const resetPower = useCallback(() => {
    setRevealedOptionIds([]);
  }, []);

  return {
    revealedOptionIds,
    revealOption,
    isOptionCovered,
    resetPower,
  };
}
