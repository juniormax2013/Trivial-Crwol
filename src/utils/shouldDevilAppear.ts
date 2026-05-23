import { getDevilSettings } from '../data/devilSettings';

export interface DevilAppearanceResult {
  appear: boolean;
  mode?: 'POWER_MODE' | 'OBSERVER_MODE';
}

/**
 * Evalúa probabilísticamente si el Diablo debe irrumpir y en qué modo de juego.
 *
 * @param currentGameMode El modo de juego activo actual (ej: "classic", "time_attack")
 * @param devilHasAlreadyAppeared Indica si el diablo ya apareció previamente en esta partida
 * @returns DevilAppearanceResult con la decisión y el modo asignado
 */
export function evaluateDevilAppearance(
  currentGameMode: string,
  devilHasAlreadyAppeared: boolean
): DevilAppearanceResult {
  const settings = getDevilSettings();

  // 1. Validar si el sistema del diablo está activado globalmente
  if (!settings.enabled) {
    return { appear: false };
  }

  // 2. Validar si el modo de juego actual tiene permitido el diablo
  const isModeAllowed = settings.allowedGameModes.includes(currentGameMode);
  if (!isModeAllowed) {
    return { appear: false };
  }

  // 3. Validar restricción de única aparición por partida
  if (settings.canAppearOnlyOncePerMatch && devilHasAlreadyAppeared) {
    return { appear: false };
  }

  // ── A. EVALUAR PRIMERO POWER_MODE ──
  const randomPower = Math.random() * 100;
  if (randomPower < settings.appearanceChance) {
    return { appear: true, mode: 'POWER_MODE' };
  }

  // ── B. EVALUAR SEGUNDO OBSERVER_MODE (Si el primero no se activó) ──
  if (settings.observerModeEnabled) {
    const randomObserver = Math.random() * 100;
    if (randomObserver < settings.observerModeAppearanceChance) {
      return { appear: true, mode: 'OBSERVER_MODE' };
    }
  }

  return { appear: false };
}

/**
 * Evalúa si el Diablo debe irrumpir (versión booleana simplificada para compatibilidad).
 */
export function shouldDevilAppear(
  currentGameMode: string,
  devilHasAlreadyAppeared: boolean
): boolean {
  return evaluateDevilAppearance(currentGameMode, devilHasAlreadyAppeared).appear;
}
