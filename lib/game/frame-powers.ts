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
  icon: string;
  /** IDs of per-question effects applied passively each round */
  effects: string[];
  /** Whether this frame doubles coins & crowns at end of game */
  hasDoubleRewards: boolean;
}

export const FRAME_POWERS: Record<string, FramePowerDef> = {
  // ── Fire Frame ──────────────────────────────────────────────────
  // Per question: removes 2 wrong answers + grants a second chance
  fire: {
    id: 'fire',
    name: 'Marco de Fuego',
    description:
      'Elimina 2 respuestas incorrectas por pregunta y otorga una segunda oportunidad si fallas.',
    icon: '/assets/store/frames/fire-frame.png',
    effects: ['removeTwo', 'secondChance'],
    hasDoubleRewards: false,
  },

  // ── Gold Frame ──────────────────────────────────────────────────
  // End-game: doubles all coins & crowns earned
  gold: {
    id: 'gold',
    name: 'Marco Dorado',
    description: 'Duplica las monedas y coronas obtenidas al finalizar la partida.',
    icon: '/assets/store/frames/gold-frame.png',
    effects: [],
    hasDoubleRewards: true,
  },

  // ── Crow Frame ─────────────────────────────────────────────────
  // Combines Fire + Gold: per-question help AND end-game doubling
  crow: {
    id: 'crow',
    name: 'Marco Crow',
    description:
      'Combina Fire y Gold: elimina 2 respuestas incorrectas, da segunda oportunidad y duplica recompensas al final.',
    icon: '/assets/store/frames/crow-frame.png',
    effects: ['removeTwo', 'secondChance'],
    hasDoubleRewards: true,
  },

  // ── Crown Frame (legacy / existing) ────────────────────────────
  crown: {
    id: 'crown',
    name: 'Pouvwa Kouwòn',
    description: 'Retire 2 repons epi ba ou yon 2yèm chans!',
    icon: '/assets/store/frames/crown-frame.png',
    effects: ['removeTwo', 'secondChance'],
    hasDoubleRewards: false,
  },
};

// ── Helpers ────────────────────────────────────────────────────────

/** Returns the full FramePowerDef for a given frame ID, or null if not found. */
export const getFramePower = (
  frameId: string | null | undefined
): FramePowerDef | null => {
  if (!frameId) return null;
  return FRAME_POWERS[frameId] ?? null;
};

/**
 * Returns the list of per-question effect IDs for a given frame.
 * These are applied automatically at the start of each question.
 */
export const getFrameInGameEffects = (
  frameId: string | null | undefined
): string[] => {
  return getFramePower(frameId)?.effects ?? [];
};

/**
 * Returns true if the equipped frame doubles coins & crowns at
 * the end of the game session.
 */
export const frameHasDoubleRewards = (
  frameId: string | null | undefined
): boolean => {
  return getFramePower(frameId)?.hasDoubleRewards ?? false;
};
