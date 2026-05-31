// ─────────────────────────────────────────────────────────────────────────────
// JESUS SETTINGS
// Configuración por defecto para el sistema especial de Jesús en la trivia.
// Controla la aparición, los poderes divinos y la protección contra el diablo.
// ─────────────────────────────────────────────────────────────────────────────

export interface JesusSettings {
  /** Activar o desactivar por completo a Jesús */
  enabled: boolean;
  /** Modo de aparición general */
  appearanceMode: 'probability' | 'equipped' | 'always';
  /** Probabilidad general de aparición (0 a 100). Ej: 25 = 25% */
  appearanceChance: number;
  /** Cantidad de preguntas que deben pasar antes de que pueda volver a activarse */
  cooldownQuestions: number;
  /** Número máximo de activaciones o apariciones por partida */
  maxActivationsPerMatch: number;
  /** Si Jesús solo funciona cuando el jugador lo tiene equipado */
  onlyIfEquipped: boolean;
  /** Si Jesús permanece visible en pantalla cuando está equipado */
  alwaysVisibleIfEquipped: boolean;
  /** Permitir que aparezca aunque no esté equipado */
  canAppearWithoutEquip: boolean;
  /** Prioridad frente a otros eventos (número mayor = más prioridad) */
  priorityLevel: number;

  // ── REACCIONES POR EVENTO ──
  reactOnAppear: boolean;
  reactOnCorrectAnswer: boolean;
  reactOnWrongAnswer: boolean;
  reactOnDevilAppear: boolean;
  reactOnDevilAttack: boolean;
  reactOnVictory: boolean;
  reactOnDefeat: boolean;

  // ── PODERES / AYUDAS ──
  canRevealCorrectAnswer: boolean;
  revealUsesPerMatch: number;
  canProtectAgainstDevil: boolean;
  protectionUsesPerMatch: number;
  canGrantSecondChance: boolean;
  secondChanceUsesPerMatch: number;
  canAddExtraTime: boolean;
  extraTimeSeconds: number;
  canRemovePenalty: boolean;
  canCalmNegativeEffect: boolean;

  // ── COMPORTAMIENTO CONTRA EL DIABLO ──
  reactWhenDevilAppears: boolean;
  reactWithAngerFromDevil: boolean;
  devilEscalatesToFury: boolean;
  canBlockDevilAttack: boolean;
  canReduceDevilAttack: boolean;
  canCancelDevilEffect: boolean;
  jesusWinsVisualClash: boolean;

  // ── VISUAL / TIMING ──
  animationDurationMs: number;
  effectDurationMs: number;
  idleLoopEnabled: boolean;
  autoReturnToIdle: boolean;
  showAuraEffects: boolean;
  showHalo: boolean;
  showParticles: boolean;
}

export const DEFAULT_JESUS_SETTINGS: JesusSettings = {
  enabled: true,
  appearanceMode: 'probability',
  appearanceChance: 25, // 25% por defecto
  cooldownQuestions: 2,
  maxActivationsPerMatch: 2,
  onlyIfEquipped: false,
  alwaysVisibleIfEquipped: false,
  canAppearWithoutEquip: true,
  priorityLevel: 10, // Mayor prioridad que el diablo por defecto

  // REACCIONES
  reactOnAppear: true,
  reactOnCorrectAnswer: true,
  reactOnWrongAnswer: true,
  reactOnDevilAppear: true,
  reactOnDevilAttack: true,
  reactOnVictory: true,
  reactOnDefeat: true,

  // PODERES / AYUDAS
  canRevealCorrectAnswer: true,
  revealUsesPerMatch: 1,
  canProtectAgainstDevil: true,
  protectionUsesPerMatch: 1,
  canGrantSecondChance: true,
  secondChanceUsesPerMatch: 1,
  canAddExtraTime: true,
  extraTimeSeconds: 10,
  canRemovePenalty: true,
  canCalmNegativeEffect: true,

  // COMPORTAMIENTO CONTRA EL DIABLO
  reactWhenDevilAppears: true,
  reactWithAngerFromDevil: true,
  devilEscalatesToFury: true,
  canBlockDevilAttack: true,
  canReduceDevilAttack: false,
  canCancelDevilEffect: true,
  jesusWinsVisualClash: true,

  // VISUAL / TIMING
  animationDurationMs: 1500,
  effectDurationMs: 3000,
  idleLoopEnabled: true,
  autoReturnToIdle: true,
  showAuraEffects: true,
  showHalo: true,
  showParticles: true,
};

/**
 * Carga la configuración de Jesús guardada en el panel administrativo local o remoto.
 * Utiliza localStorage del navegador como almacenamiento local dinámico.
 */
export function getJesusSettings(): JesusSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_JESUS_SETTINGS;
  }
  try {
    const saved = localStorage.getItem('jesus_settings');
    if (!saved) return DEFAULT_JESUS_SETTINGS;

    const parsed = JSON.parse(saved);
    return {
      ...DEFAULT_JESUS_SETTINGS,
      ...parsed,
    };
  } catch (e) {
    console.error('[JesusSettings] Error al parsear configuración guardada:', e);
    return DEFAULT_JESUS_SETTINGS;
  }
}

/**
 * Guarda los nuevos ajustes de Jesús definidos por el panel administrativo.
 */
export function saveJesusSettings(settings: Partial<JesusSettings>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getJesusSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem('jesus_settings', JSON.stringify(updated));
    // Dispara un evento global en la ventana para notificar a los hooks activos
    window.dispatchEvent(new Event('jesus_settings_changed'));
  } catch (e) {
    console.error('[JesusSettings] Error al guardar configuración:', e);
  }
}
