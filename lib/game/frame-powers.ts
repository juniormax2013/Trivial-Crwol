// ---------------------------------------------------------------
// GAME MODULE — FRAME POWERS
// ---------------------------------------------------------------
// Each frame grants passive powers that activate automatically
// when the frame is equipped. No user interaction required.
//
// Effect timing:
//   - 'perQuestion': applied automatically at the start of each question
//   - 'endGame'    : applied once at the end of the game session

export type FramePowerId = 'fire' | 'gold' | 'crow' | 'crown' | string;

export interface FramePowerDef {
  id: FramePowerId;
  name: string;
  description: string;
  /** Short bullets shown in the store card */
  powerBullets: string[];
  icon: string;
  /** Minimum user level required to activate frame powers in-game */
  minLevel: number;
  /** IDs of per-question effects applied passively each round */
  effects: string[];
  /** Whether this frame doubles coins & crowns at end of game */
  hasDoubleRewards: boolean;
}

export const FRAME_POWERS: Record<string, FramePowerDef> = {
  // ── Gold Frame ── Nivel mínimo: 10
  gold: {
    id: 'gold',
    name: 'Marco Dorado',
    description: 'Duplica las monedas y coronas obtenidas al finalizar la partida.',
    powerBullets: [
      '💰 Duplica monedas al finalizar',
      '👑 Duplica coronas al finalizar',
    ],
    icon: '/assets/store/frames/gold.png',
    minLevel: 10,
    effects: [],
    hasDoubleRewards: true,
  },

  // ── Fire Frame ── Nivel mínimo: 15
  fire: {
    id: 'fire',
    name: 'Marco de Fuego',
    description: 'Elimina 2 respuestas incorrectas por pregunta y otorga una segunda oportunidad si fallas.',
    powerBullets: [
      '🔥 Elimina 2 respuestas incorrectas',
      '🛡️ Segunda oportunidad si fallas',
    ],
    icon: '/assets/store/frames/fire.png',
    minLevel: 15,
    effects: ['removeTwo', 'secondChance'],
    hasDoubleRewards: false,
  },

  // ── Crown Frame ── Nivel mínimo: 30
  crown: {
    id: 'crown',
    name: 'Marco Corona',
    description: 'Combina Fire y Gold: elimina 2 respuestas incorrectas, da segunda oportunidad y duplica recompensas al final.',
    powerBullets: [
      '🔥 Elimina 2 respuestas incorrectas',
      '🛡️ Segunda oportunidad si fallas',
      '💰 Duplica monedas y coronas al final',
    ],
    icon: '/assets/store/frames/crown.png',
    minLevel: 30,
    effects: ['removeTwo', 'secondChance'],
    hasDoubleRewards: true,
  },

  // ── Crow Frame (alias legacy → crown) ──
  crow: {
    id: 'crow',
    name: 'Marco Corona',
    description: 'Combina Fire y Gold: elimina 2 respuestas incorrectas, da segunda oportunidad y duplica recompensas al final.',
    powerBullets: [
      '🔥 Elimina 2 respuestas incorrectas',
      '🛡️ Segunda oportunidad si fallas',
      '💰 Duplica monedas y coronas al final',
    ],
    icon: '/assets/store/frames/crown.png',
    minLevel: 30,
    effects: ['removeTwo', 'secondChance'],
    hasDoubleRewards: true,
  },
};

// ── Helpers ────────────────────────────────────────────────────────

/** Returns the full FramePowerDef for a given frame ID, or null if not found. */
export const getFramePower = (
  frameId: string | null | undefined
): FramePowerDef | null => {
  if (!frameId) return null;
  const aliases: Record<string, string> = {
    gold_frame:  'gold',
    fire_frame:  'fire',
    crown_frame: 'crown',
    crow_frame:  'crown',
  };
  const normalized = aliases[frameId] ?? frameId;
  return FRAME_POWERS[normalized] ?? null;
};

/**
 * Returns true if the user's level meets the frame's minLevel requirement.
 */
export const canUseFramePower = (
  frameId: string | null | undefined,
  userLevel: number
): boolean => {
  const power = getFramePower(frameId);
  if (!power) return false;
  return userLevel >= power.minLevel;
};

/**
 * Returns the list of per-question effect IDs for a given frame.
 */
export const getFrameInGameEffects = (
  frameId: string | null | undefined
): string[] => {
  return getFramePower(frameId)?.effects ?? [];
};

/**
 * Returns true if the equipped frame doubles coins & crowns at end of game.
 */
export const frameHasDoubleRewards = (
  frameId: string | null | undefined
): boolean => {
  return getFramePower(frameId)?.hasDoubleRewards ?? false;
};
