// ─────────────────────────────────────────────────────────────────────────────
// JESUS EMOTION MAP
// Fuente de verdad única: evento de juego → ruta pública de imagen de Jesús.
// Las rutas comienzan con "/" porque viven dentro de /public.
// ─────────────────────────────────────────────────────────────────────────────

export type JesusGameEvent =
  | 'jesus_appear'
  | 'jesus_idle'
  | 'jesus_greeting'
  | 'jesus_blessing_start'
  | 'jesus_celebrate_correct'
  | 'jesus_compassion_wrong'
  | 'jesus_reveal_answer'
  | 'jesus_protect_devil'
  | 'jesus_divine_wisdom'
  | 'jesus_holy_authority'
  | 'jesus_glorious_victory'
  | 'jesus_disappear';

/** Ruta pública de la imagen fallback (siempre disponible) */
export const JESUS_FALLBACK_IMAGE = '/images/Image Jesus/idle_sereno.png' as const;

/**
 * Mapeo canónico: evento → ruta pública de imagen.
 * Si un evento no está en este mapa, se usa JESUS_FALLBACK_IMAGE.
 */
export const JESUS_EMOTION_MAP: Record<JesusGameEvent, string> = {
  jesus_appear:            '/images/Image Jesus/bendicion.png', // Fallback para aparecer_en_luz
  jesus_idle:              '/images/Image Jesus/idle_sereno.png',
  jesus_greeting:          '/images/Image Jesus/saludo_al_jugador.png',
  jesus_blessing_start:    '/images/Image Jesus/bendicion_inicio.png',
  jesus_celebrate_correct: '/images/Image Jesus/celebracion_acierto.png',
  jesus_compassion_wrong:  '/images/Image Jesus/compasion_fallo.png',
  jesus_reveal_answer:     '/images/Image Jesus/revelar_respuesta.png',
  jesus_protect_devil:     '/images/Image Jesus/proteccion_contra_diablo.png',
  jesus_divine_wisdom:     '/images/Image Jesus/sabiduria_divina.png',
  jesus_holy_authority:    '/images/Image Jesus/autoridad_santa.png',
  jesus_glorious_victory:  '/images/Image Jesus/victoria_gloriosa.png',
  jesus_disappear:         '/images/Image Jesus/desaparecer_en_luz.png',
};

/**
 * Devuelve la ruta pública de la imagen para un evento dado.
 */
export function getJesusImageForEvent(event: string): string {
  const path = JESUS_EMOTION_MAP[event as JesusGameEvent];

  if (!path) {
    console.warn(
      `[JesusEmotionMap] Evento desconocido: "${event}". ` +
      `Usando fallback: "${JENSUS_FALLBACK_IMAGE_NAME()}"`
    );
    return JESUS_FALLBACK_IMAGE;
  }

  return path;
}

function JENSUS_FALLBACK_IMAGE_NAME(): string {
  return JESUS_FALLBACK_IMAGE;
}

/**
 * Devuelve solo el nombre del archivo (sin la ruta completa).
 */
export function getJesusImageFilename(event: string): string {
  const path = getJesusImageForEvent(event);
  return path.split('/').pop() ?? 'idle_sereno.png';
}

/** Lista de todos los eventos válidos de Jesús */
export const ALL_JESUS_EVENTS = Object.keys(JESUS_EMOTION_MAP) as JesusGameEvent[];
