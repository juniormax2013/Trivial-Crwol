// ─────────────────────────────────────────────────────────────────────────────
// DEVIL EMOTION MAP
// Fuente de verdad única: evento de juego → ruta pública de imagen del diablo.
// Las rutas comienzan con "/" porque viven dentro de /public.
// La carpeta tiene un espacio intencional en su nombre ("Devil image").
// ─────────────────────────────────────────────────────────────────────────────

/** Todos los eventos de juego reconocidos por el sistema del diablo */
export type DevilGameEvent =
  | 'devil_enter_screen'
  | 'devil_idle'
  | 'devil_exit_screen'
  | 'user_answer_wrong'
  | 'user_lost_game'
  | 'user_won_game'
  | 'devil_power_activated'
  | 'user_two_correct_answers'
  | 'app_loading'
  | 'user_correct_streak'
  | 'devil_greeting'
  | 'user_won_against_devil'
  | 'user_lost_to_devil'
  | 'user_answer_correct'
  | 'user_bad_streak';

/** Ruta pública de la imagen fallback (siempre disponible) */
export const DEVIL_FALLBACK_IMAGE = '/images/Devil image/devil_idle.png' as const;

/**
 * Mapeo canónico: evento → ruta pública de imagen.
 * Si un evento no está en este mapa, se usa DEVIL_FALLBACK_IMAGE.
 */
export const DEVIL_EMOTION_MAP: Record<DevilGameEvent, string> = {
  devil_enter_screen:       '/images/Devil image/devil_aparecer_humo.png',
  devil_idle:               '/images/Devil image/devil_idle.png',
  devil_exit_screen:        '/images/Devil image/devil_desaparecer_humo.png',
  user_answer_wrong:        '/images/Devil image/devil_risa_malvada.png',
  user_lost_game:           '/images/Devil image/devil_victoria.png',
  user_won_game:            '/images/Devil image/devil_derrota.png',
  devil_power_activated:    '/images/Devil image/devil_ataque.png',
  user_two_correct_answers: '/images/Devil image/devil_sorprendido.png',
  app_loading:              '/images/Devil image/devil_pensando.png',
  user_correct_streak:      '/images/Devil image/devil_enojo.png',
  devil_greeting:           '/images/Devil image/devil_saludo.png',
  user_won_against_devil:   '/images/Devil image/devil_derrota.png',
  user_lost_to_devil:       '/images/Devil image/devil_victoria.png',
  user_answer_correct:      '/images/Devil image/devil_sorprendido.png',
  user_bad_streak:          '/images/Devil image/devil_victoria.png',
};

/**
 * Devuelve la ruta pública de la imagen para un evento dado.
 * Si el evento es desconocido, retorna el fallback y loguea en consola.
 *
 * @example
 * getDevilImageForEvent('user_answer_wrong')
 * // → '/images/Devil image/devil_risa_malvada.png'
 */
export function getDevilImageForEvent(event: string): string {
  const path = DEVIL_EMOTION_MAP[event as DevilGameEvent];

  if (!path) {
    console.warn(
      `[DevilEmotionMap] Evento desconocido: "${event}". ` +
      `Usando fallback: "${DEVIL_FALLBACK_IMAGE}". ` +
      `Eventos válidos: ${Object.keys(DEVIL_EMOTION_MAP).join(', ')}`
    );
    return DEVIL_FALLBACK_IMAGE;
  }

  return path;
}

/**
 * Devuelve solo el nombre del archivo (sin la ruta completa).
 * Útil para mostrar en la UI de pruebas.
 *
 * @example
 * getDevilImageFilename('user_answer_wrong')
 * // → 'devil_risa_malvada.png'
 */
export function getDevilImageFilename(event: string): string {
  const path = getDevilImageForEvent(event);
  return path.split('/').pop() ?? 'devil_idle.png';
}

/** Lista de todos los eventos válidos (útil para iterar en la UI de pruebas) */
export const ALL_DEVIL_EVENTS = Object.keys(DEVIL_EMOTION_MAP) as DevilGameEvent[];
