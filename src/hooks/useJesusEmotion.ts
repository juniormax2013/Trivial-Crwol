'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  type JesusGameEvent,
  getJesusImageForEvent,
  getJesusImageFilename,
  JESUS_FALLBACK_IMAGE,
} from '../data/jesusEmotionMap';

export interface JesusEmotionState {
  currentEvent: JesusGameEvent | string;
  currentImage: string;
  currentFilename: string;
  isTransitioning: boolean;
  isGlowing: boolean;
  isProtecting: boolean;
}

export interface UseJesusEmotionReturn extends JesusEmotionState {
  triggerEvent: (event: JesusGameEvent | string) => void;
  reset: () => void;
}

const GLOW_EVENTS = new Set<string>(['jesus_reveal_answer', 'jesus_glorious_victory', 'jesus_blessing_start']);
const PROTECT_EVENTS = new Set<string>(['jesus_protect_devil', 'jesus_holy_authority']);

const TRANSITION_DURATION_MS = 250;

export function useJesusEmotion(
  initialEvent: JesusGameEvent | string = 'jesus_idle'
): UseJesusEmotionReturn {
  const [currentEvent, setCurrentEvent] = useState<JesusGameEvent | string>(initialEvent);
  const [currentImage, setCurrentImage] = useState<string>(
    () => getJesusImageForEvent(initialEvent)
  );
  const [currentFilename, setCurrentFilename] = useState<string>(
    () => getJesusImageFilename(initialEvent)
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);
  const [isProtecting, setIsProtecting] = useState(false);

  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const effectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerEvent = useCallback((event: JesusGameEvent | string) => {
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    if (effectTimer.current) clearTimeout(effectTimer.current);

    setIsGlowing(GLOW_EVENTS.has(event));
    setIsProtecting(PROTECT_EVENTS.has(event));

    if (GLOW_EVENTS.has(event) || PROTECT_EVENTS.has(event)) {
      effectTimer.current = setTimeout(() => {
        setIsGlowing(false);
        setIsProtecting(false);
      }, 1000); // Duración de los efectos dorados
    }

    setIsTransitioning(true);

    transitionTimer.current = setTimeout(() => {
      const newImage = getJesusImageForEvent(event);
      const newFilename = getJesusImageFilename(event);

      setCurrentEvent(event);
      setCurrentImage(newImage);
      setCurrentFilename(newFilename);
      setIsTransitioning(false);
    }, TRANSITION_DURATION_MS);
  }, []);

  const reset = useCallback(() => {
    triggerEvent('jesus_idle');
  }, [triggerEvent]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const img = new window.Image();
    img.onerror = () => {
      console.error(
        `[useJesusEmotion] ❌ No se pudo cargar la imagen: "${currentImage}". ` +
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
    isGlowing,
    isProtecting,
    triggerEvent,
    reset,
  };
}
