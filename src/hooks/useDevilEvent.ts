'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { DevilGameEvent } from '../data/devilEmotionMap';
import { getDevilSettings } from '../data/devilSettings';
import { evaluateDevilAppearance } from '../utils/shouldDevilAppear';

export type DevilModeType = 'POWER_MODE' | 'OBSERVER_MODE';

export interface UseDevilEventReturn {
  /** Indica si el diablo está actualmente activo e irrumpiendo en pantalla */
  devilActive: boolean;
  /** El modo en el que irrumpió el diablo: "POWER_MODE" (tapa cartas) o "OBSERVER_MODE" (observa) */
  devilMode: DevilModeType | null;
  /** Indica si el diablo ya apareció al menos una vez en la partida en curso */
  devilHasAppeared: boolean;
  /** Indica si el poder especial de tapar respuestas está activo en este momento */
  isDevilPowerActive: boolean;
  /** Contador de respuestas correctas logradas por el jugador durante la trampa (POWER_MODE) */
  devilCorrectCounter: number;
  /** Contador de respuestas incorrectas (fallos) cometidas durante la trampa (POWER_MODE) */
  devilWrongCounter: number;
  
  // ── CONTADORES EXCLUSIVOS DE OBSERVER_MODE ──
  /** Racha actual de respuestas correctas consecutivas del jugador en modo observador */
  playerCorrectStreak: number;
  /** Racha actual de fallos consecutivos del jugador en modo observador */
  playerWrongStreak: number;
  
  /** Evento actual de emoción del diablo (controla la ilustración renderizada) */
  devilEvent: DevilGameEvent;
  /** true si el diablo fue derrotado exitosamente en el combate (POWER_MODE) */
  devilDefeated: boolean;
  /** true si el diablo venció al usuario al lograr 3 fallos (POWER_MODE) */
  devilWon: boolean;
  
  /** Evalúa probabilísticamente en cada pregunta si el diablo debe aparecer y en qué modo */
  evaluateAppearance: (gameMode: string) => boolean;
  /** Registra que el jugador acertó una pregunta (reacciona según el modo activo) */
  registerCorrectAnswer: () => void;
  /** Registra que el jugador falló una pregunta (reacciona según el modo activo) */
  registerWrongAnswer: () => void;
  /** Fuerza la irrupción inmediata en el modo seleccionado (POWER_MODE por defecto) */
  forceAppearance: (mode?: DevilModeType) => void;
  /** Fuerza la salida del diablo con humo y desactivación */
  forceExit: () => void;
  /** Reinicia por completo el estado del diablo para una nueva partida de juego */
  resetMatchState: () => void;
  /** Reacción cuando el jugador gana la partida completa con el diablo de observador */
  triggerUserWonGame: () => void;
  /** Reacción cuando el jugador pierde la partida completa con el diablo de observador */
  triggerUserLostGame: () => void;
}

/**
 * HOOK PRINCIPAL: useDevilEvent
 * Controla todo el ciclo de vida del diablo (tanto POWER_MODE como OBSERVER_MODE).
 * Maneja la máquina de estados de animaciones y las reglas del panel administrativo.
 */
export function useDevilEvent(): UseDevilEventReturn {
  const [devilActive, setDevilActive] = useState(false);
  const [devilMode, setDevilMode] = useState<DevilModeType | null>(null);
  const [devilModeForMatch, setDevilModeForMatch] = useState<DevilModeType | null>(null);
  const [devilHasAppeared, setDevilHasAppeared] = useState(false);
  const [isDevilPowerActive, setIsDevilPowerActive] = useState(false);
  const [devilCorrectCounter, setDevilCorrectCounter] = useState(0);
  const [devilWrongCounter, setDevilWrongCounter] = useState(0);
  
  // Contadores para reacciones de Observer Mode
  const [playerCorrectStreak, setPlayerCorrectStreak] = useState(0);
  const [playerWrongStreak, setPlayerWrongStreak] = useState(0);

  const [devilEvent, setDevilEvent] = useState<DevilGameEvent>('devil_idle');
  const [devilDefeated, setDevilDefeated] = useState(false);
  const [devilWon, setDevilWon] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Limpiar timers en desmontaje
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const addTimer = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  };

  /**
   * Flujo de entrada del diablo según el modo elegido
   */
  const triggerDevilAppearance = useCallback((mode: DevilModeType = 'POWER_MODE') => {
    // Cancelar cualquier transición pendiente
    timers.current.forEach(clearTimeout);
    timers.current = [];

    const settings = getDevilSettings();

    setDevilActive(true);
    setDevilMode(mode);
    setDevilHasAppeared(true);
    
    // Inicializar contadores comunes
    setDevilCorrectCounter(0);
    setDevilWrongCounter(0);
    setDevilDefeated(false);
    setDevilWon(false);
    
    // Inicializar contadores del observador
    setPlayerCorrectStreak(0);
    setPlayerWrongStreak(0);
    
    // 1. Mostrar humo de aparición
    setDevilEvent('devil_enter_screen');

    // 2. Transición tras la aparición (1.5s)
    addTimer(() => {
      if (mode === 'POWER_MODE') {
        setIsDevilPowerActive(settings.hideAnswersPowerEnabled);
        setDevilEvent('devil_power_activated'); // Ataque
      } else {
        // En OBSERVER_MODE NUNCA se activa el poder de tapar respuestas
        setIsDevilPowerActive(false);
        setDevilEvent('devil_idle'); // Espera pasiva
      }
    }, 1500);
  }, []);

  /** Fuerza la aparición directa en el modo especificado */
  const forceAppearance = useCallback((mode: DevilModeType = 'POWER_MODE') => {
    triggerDevilAppearance(mode);
  }, [triggerDevilAppearance]);

  /** Evalúa probabilísticamente según la probabilidad general y fija un único modo por partida */
  const evaluateAppearance = useCallback((gameMode: string): boolean => {
    const settings = getDevilSettings();

    // 1. Validaciones globales
    if (!settings.enabled) return false;
    if (!settings.allowedGameModes.includes(gameMode)) return false;
    if (settings.canAppearOnlyOncePerMatch && devilHasAppeared) return false;

    // 2. Determinar / fijar el modo exclusivo de la partida
    let currentMatchMode = devilModeForMatch;
    if (!currentMatchMode) {
      const powerW = settings.powerModeWeight ?? 50;
      const observerW = settings.observerModeWeight ?? 50;
      const obsEnabledForMatch = settings.observerModeEnabled ?? true;

      const activeObsW = obsEnabledForMatch ? observerW : 0;
      const totalW = powerW + activeObsW;

      if (totalW > 0) {
        const rand = Math.random() * totalW;
        currentMatchMode = rand < powerW ? 'POWER_MODE' : 'OBSERVER_MODE';
      } else {
        currentMatchMode = 'POWER_MODE';
      }
      setDevilModeForMatch(currentMatchMode);
    }

    // 3. Decidir si irrumpe usando la Probabilidad General
    const randomTrigger = Math.random() * 100;
    if (randomTrigger < settings.appearanceChance) {
      triggerDevilAppearance(currentMatchMode);
      return true;
    }

    return false;
  }, [devilHasAppeared, devilModeForMatch, triggerDevilAppearance]);

  /** Fuerza la salida con humo */
  const forceExit = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setIsDevilPowerActive(false);
    setDevilEvent('devil_exit_screen');
    addTimer(() => {
      setDevilActive(false);
      setDevilMode(null);
      setDevilEvent('devil_idle');
    }, 1500);
  }, []);

  /**
   * Registra una respuesta correcta:
   * Reacciona de forma diferente según el modo activo.
   */
  const registerCorrectAnswer = useCallback(() => {
    if (!devilActive) return;

    const settings = getDevilSettings();

    // ─── CASO A: JUEGO EN POWER_MODE ───
    if (devilMode === 'POWER_MODE') {
      if (devilDefeated || devilWon) return;
      const nextCorrect = devilCorrectCounter + 1;
      setDevilCorrectCounter(nextCorrect);

      const nextStreak = playerCorrectStreak + 1;
      setPlayerCorrectStreak(nextStreak);
      setPlayerWrongStreak(0);

      // Regla de racha: 3 correctas -> sorprendido, 4 correctas -> enojo
      if (nextStreak === 3) {
        setDevilEvent('user_answer_correct'); // devil_sorprendido
      } else if (nextStreak === 4) {
        setDevilEvent('user_correct_streak'); // devil_enojo
      } else if (nextCorrect >= settings.correctAnswersToDefeat) {
        setIsDevilPowerActive(false); // apagar trampa inmediatamente
        setDevilEvent('user_two_correct_answers'); // Sorpresa

        addTimer(() => {
          setDevilEvent('user_won_against_devil'); // Derrota del diablo (vil)
        }, 1200);

        addTimer(() => {
          setDevilEvent('devil_exit_screen'); // Humo de salida
        }, 2700);

        addTimer(() => {
          setDevilActive(false);
          setDevilMode(null);
          setDevilDefeated(true);
        }, 4000);
        return;
      } else {
        setDevilEvent('user_correct_streak'); // Enojo intermedio
      }

      // Si no fue derrota final, vuelve a idle tras 1.5s
      if (nextCorrect < settings.correctAnswersToDefeat) {
        addTimer(() => {
          setDevilEvent('devil_idle');
        }, 1500);
      }
    }
    
    // ─── CASO B: JUEGO EN OBSERVER_MODE ───
    else if (devilMode === 'OBSERVER_MODE') {
      // Limpiar timers de reacciones previas para evitar encabalgamiento
      timers.current.forEach(clearTimeout);
      timers.current = [];

      const nextStreak = playerCorrectStreak + 1;
      setPlayerCorrectStreak(nextStreak);
      setPlayerWrongStreak(0); // resetear racha de fallos

      // Regla de racha: 3 correctas -> sorprendido, 4 correctas -> enojo
      if (nextStreak === 3) {
        setDevilEvent('user_answer_correct'); // devil_sorprendido
      } else if (nextStreak === 4) {
        setDevilEvent('user_correct_streak'); // devil_enojo
      } else if (settings.observerModeCanReactToPlayer) {
        if (nextStreak === 1) {
          setDevilEvent('user_answer_correct'); // Sorprendido/asombrado
        } else if (nextStreak === 2) {
          setDevilEvent('user_two_correct_answers'); // Muy sorprendido
        } else {
          setDevilEvent('user_correct_streak'); // Furioso (enojo)
        }
      } else {
        setDevilEvent('user_answer_correct');
      }

      // Vuelve a idle tras 1.5 segundos para seguir observando
      addTimer(() => {
        setDevilEvent('devil_idle');
      }, 1500);
    }
  }, [devilActive, devilMode, devilCorrectCounter, devilDefeated, devilWon, playerCorrectStreak]);

  /**
   * Registra una respuesta incorrecta (fallo):
   * Reacciona diferente según el modo.
   */
  const registerWrongAnswer = useCallback(() => {
    if (!devilActive) return;

    const settings = getDevilSettings();

    // ─── CASO A: JUEGO EN POWER_MODE ───
    if (devilMode === 'POWER_MODE') {
      if (devilDefeated || devilWon) return;
      const nextWrong = devilWrongCounter + 1;
      setDevilWrongCounter(nextWrong);

      const nextWrongStreak = playerWrongStreak + 1;
      setPlayerWrongStreak(nextWrongStreak);
      setPlayerCorrectStreak(0);

      // Regla de racha: 3 fallos -> saludo, 4 o más fallos -> victoria
      if (nextWrongStreak === 3) {
        setDevilEvent('devil_greeting'); // devil_saludo
      } else if (nextWrongStreak >= 4) {
        setDevilEvent('user_lost_game'); // devil_victoria
      } else {
        setDevilEvent('user_answer_wrong'); // Risa malvada
      }

      if (nextWrong >= settings.wrongAnswersToWin) {
        setIsDevilPowerActive(false);
        addTimer(() => {
          setDevilEvent('user_lost_to_devil'); // Festejo de victoria del diablo
        }, 1200);

        addTimer(() => {
          setDevilEvent('devil_exit_screen'); // Se va en humo
        }, 2700);

        addTimer(() => {
          setDevilActive(false);
          setDevilMode(null);
          setDevilWon(true);
        }, 4000);
      } else {
        addTimer(() => {
          // Vuelve a su estado de poder tras la risa
          if (nextWrongStreak < 3) {
            setDevilEvent('devil_power_activated');
          } else {
            setDevilEvent('devil_idle');
          }
        }, 1800);
      }
    }
    
    // ─── CASO B: JUEGO EN OBSERVER_MODE ───
    else if (devilMode === 'OBSERVER_MODE') {
      timers.current.forEach(clearTimeout);
      timers.current = [];

      const nextWrongStreak = playerWrongStreak + 1;
      setPlayerWrongStreak(nextWrongStreak);
      setPlayerCorrectStreak(0); // resetear racha de aciertos

      // Regla de racha: 3 fallos -> saludo, 4 o más fallos -> victoria
      if (nextWrongStreak === 3) {
        setDevilEvent('devil_greeting'); // devil_saludo
      } else if (nextWrongStreak >= 4) {
        setDevilEvent('user_lost_game'); // devil_victoria
      } else if (settings.observerModeCanReactToPlayer) {
        if (nextWrongStreak >= 2) {
          setDevilEvent('user_bad_streak'); // Victoria triunfante
        } else {
          setDevilEvent('user_answer_wrong'); // Risa malvada
        }
      } else {
        setDevilEvent('user_answer_wrong');
      }

      // Vuelve a idle tras 1.8 segundos
      addTimer(() => {
        setDevilEvent('devil_idle');
      }, 1800);
    }
  }, [devilActive, devilMode, devilWrongCounter, devilDefeated, devilWon, playerWrongStreak]);

  /** Reiniciar todo el estado */
  const resetMatchState = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setDevilActive(false);
    setDevilMode(null);
    setDevilModeForMatch(null); // Resetear modo sorteado para una nueva partida limpia
    setDevilHasAppeared(false);
    setIsDevilPowerActive(false);
    setDevilCorrectCounter(0);
    setDevilWrongCounter(0);
    setPlayerCorrectStreak(0);
    setPlayerWrongStreak(0);
    setDevilEvent('devil_idle');
    setDevilDefeated(false);
    setDevilWon(false);
  }, []);

  /** Reacción cuando el jugador gana la partida */
  const triggerUserWonGame = useCallback(() => {
    if (!devilActive) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setDevilEvent('user_won_game');
  }, [devilActive]);

  /** Reacción cuando el jugador pierde la partida */
  const triggerUserLostGame = useCallback(() => {
    if (!devilActive) return;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setDevilEvent('user_lost_game');
  }, [devilActive]);

  return {
    devilActive,
    devilMode,
    devilHasAppeared,
    isDevilPowerActive,
    devilCorrectCounter,
    devilWrongCounter,
    playerCorrectStreak,
    playerWrongStreak,
    devilEvent,
    devilDefeated,
    devilWon,
    evaluateAppearance,
    registerCorrectAnswer,
    registerWrongAnswer,
    forceAppearance,
    forceExit,
    resetMatchState,
    triggerUserWonGame,
    triggerUserLostGame,
  };
}
