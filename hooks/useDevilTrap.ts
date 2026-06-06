import { useState, useCallback, useRef } from 'react';

export type DevilAnimState = 'idle' | 'appear' | 'walk' | 'taunt' | 'celebrate' | 'defeat' | 'hidden';

export function useDevilTrap() {
  const [isDevilActive, setIsDevilActive] = useState(false);
  const [devilMode, setDevilMode] = useState<'POWER_MODE' | 'OBSERVER_MODE' | null>(null);
  const [devilModeForMatch, setDevilModeForMatch] = useState<'POWER_MODE' | 'OBSERVER_MODE' | null>(null);
  const [hasDevilSpawnedInMatch, setHasDevilSpawnedInMatch] = useState(false);
  const [matchCorrectStreak, setMatchCorrectStreak] = useState(0);
  const [matchWrongStreak, setMatchWrongStreak] = useState(0);
  const [correctAnswersToDefeat, setCorrectAnswersToDefeat] = useState(2);
  const [wrongAnswersToWin, setWrongAnswersToWin] = useState(3);
  const [devilEvent, setDevilEvent] = useState<string | null>(null);
  const [revealedOptions, setRevealedOptions] = useState<string[]>([]);
  const [shuffledOptions, setShuffledOptions] = useState<any[]>([]);
  const [devilState, setDevilState] = useState<DevilAnimState>('hidden');
  const stateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleState = (state: DevilAnimState, delayMs: number) => {
    if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
    stateTimerRef.current = setTimeout(() => {
      setDevilState(state);
      if (state === 'idle') {
        setDevilEvent(null); // Volver a pose relajada al volver a idle
      }
    }, delayMs);
  };

  const triggerDevilTrap = useCallback((
    originalOptions: any[], 
    force = false, 
    configOrProbability?: number | any,
    isJesusActive = false
  ) => {
    if (isJesusActive) {
      setIsDevilActive(false);
      setDevilMode(null);
      setDevilState('hidden');
      return false;
    }
    let shouldTrigger = false;

    let spawnProb = 0.50; // Fijo al 50%
    let obsEnabled = true;
    let powerW = 0;
    let observerW = 100;
    let correctToDefeat = 2;
    let wrongToWin = 3;

    setCorrectAnswersToDefeat(correctToDefeat);
    setWrongAnswersToWin(wrongToWin);

    // 1. Determinar / fijar el modo exclusivo de la partida (Forzado a OBSERVER_MODE para eliminar el poder de bloquear)
    const currentMatchMode = 'OBSERVER_MODE' as const;
    setDevilModeForMatch('OBSERVER_MODE');

    // 2. Decidir si el diablo irrumpe en la pregunta actual
    // Si el diablo ya apareció en esta partida en cualquier modo y sigue activo, se mantiene en pantalla de forma fija
    if (hasDevilSpawnedInMatch && isDevilActive) {
      shouldTrigger = true;
    } else if (force) {
      shouldTrigger = true;
      setHasDevilSpawnedInMatch(true);
    } else {
      const randomTrigger = Math.random();
      if (randomTrigger < spawnProb) {
        shouldTrigger = true;
        setHasDevilSpawnedInMatch(true);
      }
    }

    if (shouldTrigger && originalOptions && originalOptions.length > 0) {
      setIsDevilActive(true);
      setDevilMode(currentMatchMode);
      setRevealedOptions([]);
      const shuffled = [...originalOptions].sort(() => Math.random() - 0.5);
      setShuffledOptions(shuffled);

      if (currentMatchMode === 'OBSERVER_MODE') {
        // En modo observador, solo realiza la animación de aparición y se queda observando de fondo en idle
        if (devilState === 'hidden' || devilState === 'defeat' || devilState === 'celebrate') {
          setDevilState('appear');
          scheduleState('idle', 10000);
        } else {
          setDevilState('idle');
        }
      } else {
        // Secuencia completa de POWER_MODE (tapa respuestas)
        // Si ya estaba activo, evitamos reiniciar con "appear" para no interrumpir visualmente la trampa
        if (devilState === 'hidden' || devilState === 'defeat' || devilState === 'celebrate') {
          setDevilState('appear');
          scheduleState('idle', 1200);
          scheduleState('walk', 3000);
          scheduleState('taunt', 5500);
          scheduleState('idle', 7500);
        } else {
          setDevilState('walk');
        }
      }
      return true;
    } else {
      // Si ya se activó previamente en la partida y sigue activo, no lo ocultamos en ningún modo
      if (hasDevilSpawnedInMatch && isDevilActive) {
        setIsDevilActive(true);
        setDevilMode(currentMatchMode);
        setDevilState(currentMatchMode === 'OBSERVER_MODE' ? 'idle' : 'walk');
        setRevealedOptions([]);
        setShuffledOptions(originalOptions || []);
        return true;
      }

      setIsDevilActive(false);
      setDevilMode(null);
      setDevilState('hidden');
      setRevealedOptions([]);
      setShuffledOptions(originalOptions || []);
      return false;
    }
  }, [devilModeForMatch, hasDevilSpawnedInMatch, devilState, isDevilActive]);

  const revealOption = useCallback((optionId: string) => {
    setRevealedOptions((prev) => {
      if (prev.includes(optionId)) return prev;
      return [...prev, optionId];
    });
  }, []);

  /** Call when player answers CORRECTLY — devil is defeated/sad */
  const devilDefeat = useCallback(() => {
    const newCorrectStreak = matchCorrectStreak + 1;
    setMatchCorrectStreak(newCorrectStreak);
    setMatchWrongStreak(0);

    if (newCorrectStreak >= 2) {
      setDevilEvent('devil_exit_screen');
      setDevilState('defeat');
      scheduleState('hidden', 10000);
      setTimeout(() => {
        setIsDevilActive(false);
        setDevilMode(null);
      }, 10000);
    } else {
      setDevilEvent('user_answer_correct');
      setDevilState('defeat');
    }
  }, [devilMode, matchCorrectStreak, correctAnswersToDefeat]);

  /** Call when player answers INCORRECTLY — devil celebrates */
  const devilCelebrate = useCallback(() => {
    const newWrongStreak = matchWrongStreak + 1;
    setMatchWrongStreak(newWrongStreak);
    setMatchCorrectStreak(0);

    // Regla del usuario: 3 fallos -> devil_saludo, 4 o más fallos -> devil_victoria
    if (newWrongStreak === 3) {
      setDevilEvent('devil_greeting'); // devil_saludo
    } else if (newWrongStreak >= 4) {
      setDevilEvent('user_lost_game'); // devil_victoria
    } else {
      setDevilEvent(null);
    }

    if (devilMode === 'OBSERVER_MODE') {
      setDevilState('celebrate');
    } else {
      // En POWER_MODE se retira en humo si se alcanza wrongAnswersToWin (diablo gana)
      if (newWrongStreak >= wrongAnswersToWin) {
        setDevilState('celebrate');
        scheduleState('hidden', 2000);
        setTimeout(() => {
          setIsDevilActive(false);
          setDevilMode(null);
        }, 2000);
      } else {
        // Permanece celebrando en pose de celebrate
        setDevilState('celebrate');
      }
    }
  }, [devilMode, matchWrongStreak, wrongAnswersToWin]);

  const resetDevilTrap = useCallback((forceFullReset = false) => {
    if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
    
    // Si NO es un reinicio global/final y el diablo ya apareció y sigue activo, lo conservamos en pantalla
    if (!forceFullReset && hasDevilSpawnedInMatch && isDevilActive) {
      setRevealedOptions([]);
      setIsDevilActive(true);
      setDevilMode(devilModeForMatch);
      setDevilState(devilModeForMatch === 'OBSERVER_MODE' ? 'idle' : 'walk');
      setDevilEvent(null);
      return;
    }

    setIsDevilActive(false);
    setDevilMode(null);
    setDevilModeForMatch(null); 
    setHasDevilSpawnedInMatch(false);
    setMatchCorrectStreak(0);
    setMatchWrongStreak(0);
    setDevilState('hidden');
    setDevilEvent(null);
    setRevealedOptions([]);
    setShuffledOptions([]);
  }, [devilModeForMatch, hasDevilSpawnedInMatch, isDevilActive]);

  return {
    isDevilActive,
    devilMode,
    revealedOptions,
    shuffledOptions,
    devilState,
    devilEvent,
    triggerDevilTrap,
    revealOption,
    resetDevilTrap,
    devilDefeat,
    devilCelebrate,
    setDevilEvent,
    setDevilState,
  };
}
