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
    configOrProbability?: number | any
  ) => {
    let shouldTrigger = false;

    let spawnProb = 0.15;
    let obsEnabled = true;
    let powerW = 50;
    let observerW = 50;
    let correctToDefeat = 2;
    let wrongToWin = 3;

    if (typeof configOrProbability === 'number') {
      spawnProb = configOrProbability;
      obsEnabled = false;
      powerW = 100;
      observerW = 0;
    } else if (configOrProbability && typeof configOrProbability === 'object') {
      spawnProb = configOrProbability.spawnProbability ?? 0.15;
      obsEnabled = configOrProbability.observerModeEnabled ?? true;
      powerW = configOrProbability.powerModeWeight ?? 50;
      observerW = configOrProbability.observerModeWeight ?? 50;
      correctToDefeat = configOrProbability.correctAnswersToDefeat ?? 2;
      wrongToWin = configOrProbability.wrongAnswersToWin ?? 3;
    } else {
      const local = typeof window !== 'undefined' ? localStorage.getItem('devil_settings') : null;
      const settings = local ? JSON.parse(local) : null;
      spawnProb = settings?.appearanceChance ?? 0.15;
      obsEnabled = settings?.observerModeEnabled ?? true;
      powerW = settings?.powerModeWeight ?? 50;
      observerW = settings?.observerModeWeight ?? 50;
      correctToDefeat = settings?.correctAnswersToDefeat ?? 2;
      wrongToWin = settings?.wrongAnswersToWin ?? 3;
    }

    setCorrectAnswersToDefeat(correctToDefeat);
    setWrongAnswersToWin(wrongToWin);

    // 1. Determinar / fijar el modo exclusivo de la partida si no está definido
    let currentMatchMode = devilModeForMatch;
    if (!currentMatchMode) {
      const activeObsW = obsEnabled ? observerW : 0;
      const totalW = powerW + activeObsW;
      if (totalW > 0) {
        const rand = Math.random() * totalW;
        currentMatchMode = rand < powerW ? 'POWER_MODE' : 'OBSERVER_MODE';
      } else {
        currentMatchMode = 'POWER_MODE';
      }
      setDevilModeForMatch(currentMatchMode);
    }

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
          scheduleState('idle', 1200);
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

    // Regla del usuario: 3 aciertos -> devil_sorprendido, 4 aciertos -> devil_enojo
    if (newCorrectStreak === 3) {
      setDevilEvent('user_answer_correct'); // devil_sorprendido
    } else if (newCorrectStreak === 4) {
      setDevilEvent('user_correct_streak'); // devil_enojo
    } else {
      setDevilEvent(null);
    }

    if (devilMode === 'OBSERVER_MODE') {
      setDevilState('defeat');
      // En modo observador el diablo no se retira, vuelve a idle tras 2 segundos
      scheduleState('idle', 2000);
    } else {
      // En POWER_MODE el diablo se oculta en humo y se desactiva SI se alcanza correctAnswersToDefeat
      if (newCorrectStreak >= correctAnswersToDefeat) {
        setDevilState('defeat');
        scheduleState('hidden', 1800);
        setTimeout(() => {
          setIsDevilActive(false);
          setDevilMode(null);
        }, 1800);
      } else {
        // Si no se alcanza, permanece y vuelve a caminar para seguir bloqueando
        setDevilState('defeat');
        scheduleState('walk', 2000);
      }
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
      scheduleState('idle', 2000);
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
        setDevilState('celebrate');
        scheduleState('walk', 2000);
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
