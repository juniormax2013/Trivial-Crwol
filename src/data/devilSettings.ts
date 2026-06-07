// ─────────────────────────────────────────────────────────────────────────────
// DEVIL SETTINGS
// Configuración por defecto para el sistema especial del diablo en la trivia.
// Estos campos controlan la aparición, el poder y la dificultad del combate.
// ─────────────────────────────────────────────────────────────────────────────

export interface DevilSettings {
  /** Activar o desactivar por completo la aparición del diablo */
  enabled: boolean;
  /** Probabilidad de aparición en porcentaje (de 0 a 100). Ej: 30 = 30% */
  appearanceChance: number;
  /** Modos de juego en los que el diablo tiene permitido irrumpir */
  allowedGameModes: string[];
  /** Cantidad de respuestas correctas consecutivas o acumuladas requeridas para vencer al diablo */
  correctAnswersToDefeat: number;
  /** Cantidad de respuestas incorrectas que el diablo necesita que cometas para ganarte */
  wrongAnswersToWin: number;
  /** Activar el poder de tapar respuestas con cartas cubiertas */
  hideAnswersPowerEnabled: boolean;
  /** Si es true, el diablo solo puede aparecer una vez por partida */
  canAppearOnlyOncePerMatch: boolean;
  
  // ── OBSERVER MODE SETTINGS ──
  /** Activar o desactivar el modo observador */
  observerModeEnabled: boolean;
  /** Probabilidad de aparición en modo observador (0 a 100). Ej: 20 = 20% */
  observerModeAppearanceChance: number;
  /** Permite al diablo gesticular y reaccionar visualmente a los aciertos/errores */
  observerModeCanReactToPlayer: boolean;
  /** Permite al diablo irse voluntariamente tras una buena racha del jugador */
  observerModeCanLeaveAfterGoodStreak: boolean;
  /** Cantidad de aciertos seguidos para que el diablo decida retirarse en modo observador */
  observerModeGoodStreakToLeave: number;
  /** Peso de distribución proporcional para el modo poder */
  powerModeWeight?: number;
  /** Peso de distribución proporcional para el modo observador */
  observerModeWeight?: number;
}

export const DEFAULT_DEVIL_SETTINGS: DevilSettings = {
  enabled: true,
  appearanceChance: 30, // 30% por defecto
  allowedGameModes: ['classic', 'time_attack', 'multiplayer', 'survival'],
  correctAnswersToDefeat: 2,
  wrongAnswersToWin: 3,
  hideAnswersPowerEnabled: false,
  canAppearOnlyOncePerMatch: true,
  
  // OBSERVER MODE DEFAULTS
  observerModeEnabled: true,
  observerModeAppearanceChance: 20,
  observerModeCanReactToPlayer: true,
  observerModeCanLeaveAfterGoodStreak: false,
  observerModeGoodStreakToLeave: 5,
  powerModeWeight: 50,
  observerModeWeight: 50,
};

/**
 * Carga la configuración del diablo guardada en el panel administrativo local o remoto.
 * Utiliza localStorage del navegador como almacenamiento local dinámico.
 */
export function getDevilSettings(): DevilSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_DEVIL_SETTINGS;
  }
  try {
    const saved = localStorage.getItem('devil_settings');
    if (!saved) return DEFAULT_DEVIL_SETTINGS;
    
    const parsed = JSON.parse(saved);
    return {
      ...DEFAULT_DEVIL_SETTINGS,
      ...parsed,
    };
  } catch (e) {
    console.error('[DevilSettings] Error al parsear configuración guardada:', e);
    return DEFAULT_DEVIL_SETTINGS;
  }
}

/**
 * Guarda los nuevos ajustes del diablo definidos por el panel administrativo.
 */
export function saveDevilSettings(settings: Partial<DevilSettings>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getDevilSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem('devil_settings', JSON.stringify(updated));
    // Dispara un evento global en la ventana para notificar a los hooks activos
    window.dispatchEvent(new Event('devil_settings_changed'));
  } catch (e) {
    console.error('[DevilSettings] Error al guardar configuración:', e);
  }
}
