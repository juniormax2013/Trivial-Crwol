'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  type DevilGameEvent,
  getDevilImageForEvent,
  getDevilImageFilename,
  DEVIL_FALLBACK_IMAGE,
} from '../data/devilEmotionMap';

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────────────────────

export interface DevilEmotionState {
  /** Evento activo actualmente */
  currentEvent: DevilGameEvent | string;
  /** Ruta pública de la imagen activa */
  currentImage: string;
  /** Nombre del archivo (sin ruta) para mostrar en UI */
  currentFilename: string;
  /** true mientras la imagen está en transición (fade out/in) */
  isTransitioning: boolean;
  /** true si el evento activo tiene efecto de shake */
  isShaking: boolean;
  /** true si el evento activo tiene efecto de burst/ataque */
  isAttacking: boolean;
}

export interface UseDevilEmotionReturn extends DevilEmotionState {
  /** Dispara un evento y cambia la imagen con transición suave */
  triggerEvent: (event: DevilGameEvent | string) => void;
  /** Resetea al estado idle */
  reset: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE EFECTOS POR EVENTO
// ─────────────────────────────────────────────────────────────────────────────

const SHAKE_EVENTS = new Set<string>(['user_answer_wrong', 'user_correct_streak']);
const ATTACK_EVENTS = new Set<string>(['devil_power_activated', 'devil_enter_screen']);

const TRANSITION_DURATION_MS = 300; // duración del fade out antes de cambiar imagen

// ─────────────────────────────────────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook reactivo que gestiona el estado visual del diablo.
 *
 * @example
 * const { currentImage, currentFilename, triggerEvent, isShaking } = useDevilEmotion();
 * triggerEvent('user_answer_wrong'); // cambia la imagen con transición
 */
export function useDevilEmotion(
  initialEvent: DevilGameEvent | string = 'devil_idle'
): UseDevilEmotionReturn {
  const [currentEvent, setCurrentEvent] = useState<DevilGameEvent | string>(initialEvent);
  const [currentImage, setCurrentImage] = useState<string>(
    () => getDevilImageForEvent(initialEvent)
  );
  const [currentFilename, setCurrentFilename] = useState<string>(
    () => getDevilImageFilename(initialEvent)
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);

  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const effectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerEvent = useCallback((event: DevilGameEvent | string) => {
    // Limpiar timers previos
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    if (effectTimer.current) clearTimeout(effectTimer.current);

    // Activar efectos según el tipo de evento
    setIsShaking(SHAKE_EVENTS.has(event));
    setIsAttacking(ATTACK_EVENTS.has(event));

    // Apagar efectos especiales tras su duración
    if (SHAKE_EVENTS.has(event) || ATTACK_EVENTS.has(event)) {
      effectTimer.current = setTimeout(() => {
        setIsShaking(false);
        setIsAttacking(false);
      }, 700);
    }

    // Fade out → cambiar imagen → fade in
    setIsTransitioning(true);

    transitionTimer.current = setTimeout(() => {
      const newImage = getDevilImageForEvent(event);
      const newFilename = getDevilImageFilename(event);

      setCurrentEvent(event);
      setCurrentImage(newImage);
      setCurrentFilename(newFilename);
      setIsTransitioning(false);
    }, TRANSITION_DURATION_MS);
  }, []);

  const reset = useCallback(() => {
    triggerEvent('devil_idle');
  }, [triggerEvent]);

  // Verificar que la imagen carga correctamente (solo en browser)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const img = new window.Image();
    img.onerror = () => {
      console.error(
        `[useDevilEmotion] ❌ No se pudo cargar la imagen: "${currentImage}". ` +
        `Verifica que el archivo existe en public${currentImage}`
      );
    };
    img.src = encodeURI(currentImage);
  }, [currentImage]);

  return {
    currentEvent,
    currentImage,
    currentFilename,
    isTransitioning,
    isShaking,
    isAttacking,
    triggerEvent,
    reset,
  };
}
