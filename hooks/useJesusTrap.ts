import { useState, useCallback, useRef, useEffect } from 'react';
import { getJesusSettings, type JesusSettings } from '../src/data/jesusSettings';
import type { JesusGameEvent } from '../src/data/jesusEmotionMap';

export type JesusAnimState =
  | 'hidden'
  | 'appear'
  | 'idle'
  | 'greeting'
  | 'blessing'
  | 'celebrating'
  | 'compassion'
  | 'revealing'
  | 'protecting'
  | 'victory'
  | 'disappearing';

export interface UseJesusTrapProps {
  isDevilActive: boolean;
  devilState: string;
  setDevilEvent?: (event: string | null) => void;
  setDevilState?: (state: any) => void;
  resetDevilTrap?: (force?: boolean) => void;
}

export function useJesusTrap(devilTrap?: UseJesusTrapProps) {
  const [isJesusActive, setIsJesusActive] = useState(false);
  const [jesusState, setJesusState] = useState<JesusAnimState>('hidden');
  const [jesusEvent, setJesusEvent] = useState<JesusGameEvent | null>(null);
  const [questionsSinceLastActive, setQuestionsSinceLastActive] = useState(999); // Cooldown questions counter
  const [activationsThisMatch, setActivationsThisMatch] = useState(0);

  // Contadores de uso por partida
  const [revealUsesRemaining, setRevealUsesRemaining] = useState(1);
  const [protectionUsesRemaining, setProtectionUsesRemaining] = useState(1);
  const [secondChanceUsesRemaining, setSecondChanceUsesRemaining] = useState(1);

  const stateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const devilEscalationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Limpiar timers en desmontaje
  useEffect(() => {
    return () => {
      if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
      if (devilEscalationTimerRef.current) clearTimeout(devilEscalationTimerRef.current);
    };
  }, []);

  const scheduleState = (state: JesusAnimState, delayMs: number, event: JesusGameEvent | null = null) => {
    if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
    stateTimerRef.current = setTimeout(() => {
      setJesusState(state);
      setJesusEvent(event);
    }, delayMs);
  };

  /**
   * Coordina que el Diablo se enoje y luego se enfurezca debido a Jesús
   */
  const triggerDevilAngerAndFury = useCallback(() => {
    if (!devilTrap || !devilTrap.isDevilActive || !devilTrap.setDevilEvent || !devilTrap.setDevilState) return;

    const settings = getJesusSettings();
    if (!settings.reactWithAngerFromDevil) return;

    // Diablo usa enojo
    devilTrap.setDevilState('taunt'); // Pose de molestia
    devilTrap.setDevilEvent('user_correct_streak'); // Imagen de enojo

    if (settings.devilEscalatesToFury) {
      if (devilEscalationTimerRef.current) clearTimeout(devilEscalationTimerRef.current);
      devilEscalationTimerRef.current = setTimeout(() => {
        if (devilTrap.setDevilEvent && devilTrap.setDevilState) {
          // Diablo usa enfurecido (representado por su estado de ataque o trampa extrema)
          devilTrap.setDevilState('walk'); 
          devilTrap.setDevilEvent('user_correct_streak'); // Re-trigger enojo intenso
        }
      }, 1200);
    }
  }, [devilTrap]);

  /**
   * Evalúa la aparición probabilística de Jesús al inicio de una pregunta
   */
  const evaluateJesusAppearance = useCallback((gameMode: string, isFirstQuestion = false): boolean => {
    const settings = getJesusSettings();
    if (!settings.enabled) return false;

    // Verificar cooldown y activaciones máximas
    if (questionsSinceLastActive < settings.cooldownQuestions) {
      setQuestionsSinceLastActive(prev => prev + 1);
      return false;
    }
    if (activationsThisMatch >= settings.maxActivationsPerMatch) {
      return false;
    }

    const rand = Math.random() * 100;
    if (rand < settings.appearanceChance) {
      setIsJesusActive(true);
      setActivationsThisMatch(prev => prev + 1);
      setQuestionsSinceLastActive(0);

      // Si es la primera pregunta, dar la bendición inicial
      if (isFirstQuestion && settings.reactOnAppear) {
        setJesusState('blessing');
        setJesusEvent('jesus_blessing_start');
        scheduleState('idle', 2000, 'jesus_idle');
      } else {
        // Secuencia de entrada estándar
        setJesusState('appear');
        setJesusEvent('jesus_appear');
        scheduleState('greeting', 1200, 'jesus_greeting');
        scheduleState('idle', 2800, 'jesus_idle');
      }

      // Si el diablo está presente, reacciona
      if (devilTrap?.isDevilActive) {
        triggerDevilAngerAndFury();
      }

      return true;
    }

    setQuestionsSinceLastActive(prev => prev + 1);
    return false;
  }, [questionsSinceLastActive, activationsThisMatch, devilTrap?.isDevilActive, triggerDevilAngerAndFury]);

  /**
   * Activa el poder de revelar la respuesta correcta
   */
  const useRevealCorrectAnswer = useCallback(() => {
    const settings = getJesusSettings();
    if (!isJesusActive && !settings.canAppearWithoutEquip) return false;
    if (revealUsesRemaining <= 0) return false;

    setRevealUsesRemaining(prev => prev - 1);
    setIsJesusActive(true);
    setJesusState('revealing');
    setJesusEvent('jesus_reveal_answer');

    // Provocar enojo del Diablo
    if (devilTrap?.isDevilActive) {
      triggerDevilAngerAndFury();
    }

    if (settings.autoReturnToIdle) {
      scheduleState('idle', 2500, 'jesus_idle');
    }
    return true;
  }, [isJesusActive, revealUsesRemaining, devilTrap?.isDevilActive, triggerDevilAngerAndFury]);

  /**
   * Activa la protección divina para cancelar o mitigar un ataque del Diablo
   */
  const useDivineProtection = useCallback(() => {
    if (protectionUsesRemaining <= 0) return false;

    setProtectionUsesRemaining(prev => prev - 1);
    setIsJesusActive(true);
    setJesusState('protecting');
    setJesusEvent('jesus_protect_devil');

    // Provocar enojo del Diablo y quitar la trampa oscura
    if (devilTrap?.isDevilActive) {
      triggerDevilAngerAndFury();
      if (devilTrap.resetDevilTrap) {
        // Quita la trampa (cancela el efecto de tapar respuestas)
        setTimeout(() => {
          if (devilTrap.resetDevilTrap) {
            devilTrap.resetDevilTrap(true);
          }
        }, 1500);
      }
    }

    scheduleState('idle', 2500, 'jesus_idle');
    return true;
  }, [protectionUsesRemaining, devilTrap]);

  /**
   * Reacciona a un acierto
   */
  const reactToCorrectAnswer = useCallback(() => {
    if (!isJesusActive) return;
    const settings = getJesusSettings();
    if (!settings.reactOnCorrectAnswer) return;

    setJesusState('celebrating');
    setJesusEvent('jesus_celebrate_correct');

    if (settings.autoReturnToIdle) {
      scheduleState('idle', 1800, 'jesus_idle');
    }
  }, [isJesusActive]);

  /**
   * Reacciona a un error
   */
  const reactToWrongAnswer = useCallback(() => {
    if (!isJesusActive) return;
    const settings = getJesusSettings();
    if (!settings.reactOnWrongAnswer) return;

    setJesusState('compassion');
    setJesusEvent('jesus_compassion_wrong');

    if (settings.autoReturnToIdle) {
      scheduleState('idle', 1800, 'jesus_idle');
    }
  }, [isJesusActive]);

  /**
   * Reacciona al final del juego (ganar)
   */
  const triggerVictory = useCallback(() => {
    if (!isJesusActive) return;
    setJesusState('victory');
    setJesusEvent('jesus_glorious_victory');

    // Desaparecer gloriosamente después de celebrar
    scheduleState('disappearing', 3000, 'jesus_disappear');
    setTimeout(() => {
      setIsJesusActive(false);
      setJesusState('hidden');
    }, 4500);
  }, [isJesusActive]);

  /**
   * Reacciona al final del juego (perder)
   */
  const triggerDefeat = useCallback(() => {
    if (!isJesusActive) return;
    setJesusState('compassion');
    setJesusEvent('jesus_compassion_wrong'); // Compasión en la derrota
  }, [isJesusActive]);

  /**
   * Fuerza la salida en luz
   */
  const forceExit = useCallback(() => {
    setJesusState('disappearing');
    setJesusEvent('jesus_disappear');
    setTimeout(() => {
      setIsJesusActive(false);
      setJesusState('hidden');
      setJesusEvent(null);
    }, 1500);
  }, []);

  /**
   * Reinicia el estado de Jesús para una nueva partida
   */
  const resetMatchState = useCallback(() => {
    const settings = getJesusSettings();
    setIsJesusActive(false);
    setJesusState('hidden');
    setJesusEvent(null);
    setActivationsThisMatch(0);
    setQuestionsSinceLastActive(999);
    setRevealUsesRemaining(settings.revealUsesPerMatch);
    setProtectionUsesRemaining(settings.protectionUsesPerMatch);
    setSecondChanceUsesRemaining(settings.secondChanceUsesPerMatch);
  }, []);

  /**
   * Consume una segunda oportunidad divina
   */
  const useSecondChance = useCallback(() => {
    if (secondChanceUsesRemaining <= 0) return false;
    setSecondChanceUsesRemaining(prev => prev - 1);
    setJesusState('compassion');
    setJesusEvent('jesus_compassion_wrong');
    return true;
  }, [secondChanceUsesRemaining]);

  return {
    isJesusActive,
    jesusState,
    jesusEvent,
    revealUsesRemaining,
    protectionUsesRemaining,
    secondChanceUsesRemaining,
    evaluateJesusAppearance,
    useRevealCorrectAnswer,
    useDivineProtection,
    useSecondChance,
    reactToCorrectAnswer,
    reactToWrongAnswer,
    triggerVictory,
    triggerDefeat,
    forceExit,
    resetMatchState,
  };
}
