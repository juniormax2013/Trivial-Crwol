import { useState, useCallback, useRef } from 'react';

export type DevilAnimState = 'idle' | 'appear' | 'walk' | 'taunt' | 'celebrate' | 'defeat' | 'hidden';

export function useDevilTrap() {
  const [isDevilActive, setIsDevilActive] = useState(false);
  const [revealedOptions, setRevealedOptions] = useState<string[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<any[]>([]);
  const [devilState, setDevilState] = useState<DevilAnimState>('hidden');
  const stateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleState = (state: DevilAnimState, delayMs: number) => {
    if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
    stateTimerRef.current = setTimeout(() => setDevilState(state), delayMs);
  };

  const triggerDevilTrap = useCallback((originalOptions: any[], force = false, probability = 0.15) => {
    const shouldTrigger = force || Math.random() < probability;
    
    if (shouldTrigger && originalOptions && originalOptions.length > 0) {
      setIsDevilActive(true);
      setRevealedOptions([]);
      const shuffled = [...originalOptions].sort(() => Math.random() - 0.5);
      setShuffledOptions(shuffled);

      // Animation sequence: appear → idle → walk → taunt → idle
      setDevilState('appear');
      scheduleState('idle', 1200);
      scheduleState('walk', 3000);
      scheduleState('taunt', 5500);
      scheduleState('idle', 7500);
    } else {
      setIsDevilActive(false);
      setDevilState('hidden');
      setRevealedOptions([]);
      setShuffledOptions(originalOptions || []);
    }
  }, []);

  const revealOption = useCallback((optionId: string) => {
    setRevealedOptions((prev) => {
      if (prev.includes(optionId)) return prev;
      return [...prev, optionId];
    });
  }, []);

  /** Call when player answers CORRECTLY — devil is defeated */
  const devilDefeat = useCallback(() => {
    setDevilState('defeat');
    scheduleState('hidden', 1800);
  }, []);

  /** Call when player answers INCORRECTLY — devil celebrates */
  const devilCelebrate = useCallback(() => {
    setDevilState('celebrate');
    scheduleState('idle', 2000);
  }, []);

  const resetDevilTrap = useCallback(() => {
    if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
    setIsDevilActive(false);
    setDevilState('hidden');
    setRevealedOptions([]);
    setShuffledOptions([]);
  }, []);

  return {
    isDevilActive,
    revealedOptions,
    shuffledOptions,
    devilState,
    triggerDevilTrap,
    revealOption,
    resetDevilTrap,
    devilDefeat,
    devilCelebrate,
  };
}
