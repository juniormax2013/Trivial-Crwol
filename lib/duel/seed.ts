// ---------------------------------------------------------------
// DUEL MODULE — SEED / MOCK DATA
// ---------------------------------------------------------------
// Used in mock mode when Firebase is not configured.
// Provides 4 sample duels, 3 opponent profiles, and Bible
// trivia questions in Haitian Creole.

import {
  DuelModel,
  DuelRound,
  DuelQuestion,
  DuelOpponent,
} from './models';

// ─── DEMO USER ──────────────────────────────────────────────────
export const DEMO_USER_ID = 'demo-user';
export const DEMO_USER_NAME = 'Ou (Demo)';
export const DEMO_USER_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA5H4koFsQtazU2XokLfTghHi8STlFTmMUDtL0wQwJ8Xw9HVf74AEktBxceDNJuNHfmaJD4j2w4FIPevIMRlivcHv_1UfdbgzDYYzmsaSkCRIn3ia7Xvm3YlhST_8w4O0klPua17oUQWJYeQIwpGmoEyJSJC-goJVy6FYGYJSYfbpYAr4GtL1jy9_FpY4vd1Ivd68yW0TK3CliByvBULY6s1RNbg6sv-D-8o3yygacGSfhDs1Wx31PJNP5MvH0NwXGvGU4JaCCGrgY';

// ─── OPPONENTS ──────────────────────────────────────────────────
export const MOCK_OPPONENTS: DuelOpponent[] = [
  {
    uid: 'opp-daniel-cruz',
    name: 'Daniel Cruz',
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Daniel&backgroundColor=7345b6&fontFamily=Georgia',
    level: 14,
    crowns: 1850,
  },
  {
    uid: 'opp-ruth-mendez',
    name: 'Ruth Méndez',
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Ruth&backgroundColor=c2185b&fontFamily=Georgia',
    level: 9,
    crowns: 920,
  },
  {
    uid: 'opp-esther-paulino',
    name: 'Esther Paulino',
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Esther&backgroundColor=1b5e20&fontFamily=Georgia',
    level: 17,
    crowns: 3100,
  },
  {
    uid: 'opp-samuel-pierre',
    name: 'Samuel Pierre',
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Samuel&backgroundColor=01579b&fontFamily=Georgia',
    level: 21,
    crowns: 4250,
  },
];

// ─── QUESTIONS ──────────────────────────────────────────────────

import { ALL_QUESTIONS_HT } from './questionsHT_standardized';
import { ALL_QUESTIONS_FR } from './questionsFR_standardized';
import { ALL_QUESTIONS_ES } from './questionsES';

export const ALL_DUEL_QUESTIONS: DuelQuestion[] = [
  ...ALL_QUESTIONS_HT,
  ...ALL_QUESTIONS_FR,
  ...ALL_QUESTIONS_ES,
];

// ─── MOCK ROUNDS ────────────────────────────────────────────────

/** Pre-built round for the "active" duel (Round 2, already playing) */
export const MOCK_ACTIVE_ROUND_1: DuelRound = {
  id: 'round-active-1',
  roundNumber: 1,
  categoryId: 'milagros',
  categoryName: 'Mirak Jezi',
  questionIds: ['dq-mil-001', 'dq-mil-002', 'dq-mil-003'],
  playerAnswers: {
    [DEMO_USER_ID]: [
      { questionId: 'dq-mil-001', selectedOptionId: 'a', correctOptionId: 'a', isCorrect: true, responseTimeMs: 6200, pointsEarned: 110 },
      { questionId: 'dq-mil-002', selectedOptionId: 'c', correctOptionId: 'c', isCorrect: true, responseTimeMs: 9100, pointsEarned: 100 },
      { questionId: 'dq-mil-003', selectedOptionId: 'b', correctOptionId: 'c', isCorrect: false, responseTimeMs: 14000, pointsEarned: 0 },
    ],
    ['opp-esther-paulino']: [
      { questionId: 'dq-mil-001', selectedOptionId: 'a', correctOptionId: 'a', isCorrect: true, responseTimeMs: 4800, pointsEarned: 115 },
      { questionId: 'dq-mil-002', selectedOptionId: 'c', correctOptionId: 'c', isCorrect: true, responseTimeMs: 7500, pointsEarned: 110 },
      { questionId: 'dq-mil-003', selectedOptionId: 'c', correctOptionId: 'c', isCorrect: true, responseTimeMs: 11000, pointsEarned: 100 },
    ],
  },
  playerScores: {
    [DEMO_USER_ID]: 210,
    ['opp-esther-paulino']: 325,
  },
  playersCompleted: [DEMO_USER_ID, 'opp-esther-paulino'],
  status: 'completed',
  startedAt: new Date(Date.now() - 3 * 3600_000).toISOString(),
  completedAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
};

/** Current round (round 2) for the active duel — opponent already played */
export const MOCK_ACTIVE_ROUND_2: DuelRound = {
  id: 'round-active-2',
  roundNumber: 2,
  categoryId: 'profecias',
  categoryName: 'Pwofesi Mesiya a',
  questionIds: ['dq-pro-001', 'dq-pro-002', 'dq-pro-003'],
  playerAnswers: {
    [DEMO_USER_ID]: [], // current user hasn't played yet
    ['opp-esther-paulino']: [
      { questionId: 'dq-pro-001', selectedOptionId: 'a', correctOptionId: 'a', isCorrect: true, responseTimeMs: 5500, pointsEarned: 115 },
      { questionId: 'dq-pro-002', selectedOptionId: 'b', correctOptionId: 'b', isCorrect: true, responseTimeMs: 8000, pointsEarned: 105 },
      { questionId: 'dq-pro-003', selectedOptionId: 'c', correctOptionId: 'c', isCorrect: true, responseTimeMs: 4200, pointsEarned: 115 },
    ],
  },
  playerScores: {
    [DEMO_USER_ID]: 0,
    ['opp-esther-paulino']: 335,
  },
  playersCompleted: ['opp-esther-paulino'],
  status: 'active',
  startedAt: new Date(Date.now() - 3600_000).toISOString(),
};

/** All 3 rounds for the completed duel */
export const MOCK_COMPLETED_ROUNDS: DuelRound[] = [
  {
    id: 'round-comp-1',
    roundNumber: 1,
    categoryId: 'milagros',
    categoryName: 'Mirak Jezi',
    questionIds: ['dq-mil-001', 'dq-mil-002', 'dq-mil-003'],
    playerAnswers: {
      [DEMO_USER_ID]: [
        { questionId: 'dq-mil-001', selectedOptionId: 'a', correctOptionId: 'a', isCorrect: true, responseTimeMs: 5100, pointsEarned: 115 },
        { questionId: 'dq-mil-002', selectedOptionId: 'c', correctOptionId: 'c', isCorrect: true, responseTimeMs: 7800, pointsEarned: 105 },
        { questionId: 'dq-mil-003', selectedOptionId: 'c', correctOptionId: 'c', isCorrect: true, responseTimeMs: 12000, pointsEarned: 100 },
      ],
      ['opp-samuel-pierre']: [
        { questionId: 'dq-mil-001', selectedOptionId: 'b', correctOptionId: 'a', isCorrect: false, responseTimeMs: 8000, pointsEarned: 0 },
        { questionId: 'dq-mil-002', selectedOptionId: 'c', correctOptionId: 'c', isCorrect: true, responseTimeMs: 6000, pointsEarned: 110 },
        { questionId: 'dq-mil-003', selectedOptionId: 'c', correctOptionId: 'c', isCorrect: true, responseTimeMs: 10000, pointsEarned: 100 },
      ],
    },
    playerScores: {
      [DEMO_USER_ID]: 320,
      ['opp-samuel-pierre']: 210,
    },
    playersCompleted: [DEMO_USER_ID, 'opp-samuel-pierre'],
    status: 'completed',
    startedAt: new Date(Date.now() - 48 * 3600_000).toISOString(),
    completedAt: new Date(Date.now() - 47 * 3600_000).toISOString(),
  },
  {
    id: 'round-comp-2',
    roundNumber: 2,
    categoryId: 'profecias',
    categoryName: 'Pwofesi Mesiya a',
    questionIds: ['dq-pro-001', 'dq-pro-002', 'dq-pro-003'],
    playerAnswers: {
      [DEMO_USER_ID]: [
        { questionId: 'dq-pro-001', selectedOptionId: 'a', correctOptionId: 'a', isCorrect: true, responseTimeMs: 4500, pointsEarned: 115 },
        { questionId: 'dq-pro-002', selectedOptionId: 'b', correctOptionId: 'b', isCorrect: true, responseTimeMs: 6100, pointsEarned: 110 },
        { questionId: 'dq-pro-003', selectedOptionId: 'c', correctOptionId: 'c', isCorrect: true, responseTimeMs: 7000, pointsEarned: 105 },
      ],
      ['opp-samuel-pierre']: [
        { questionId: 'dq-pro-001', selectedOptionId: 'a', correctOptionId: 'a', isCorrect: true, responseTimeMs: 7000, pointsEarned: 105 },
        { questionId: 'dq-pro-002', selectedOptionId: 'a', correctOptionId: 'b', isCorrect: false, responseTimeMs: 9500, pointsEarned: 0 },
        { questionId: 'dq-pro-003', selectedOptionId: 'c', correctOptionId: 'c', isCorrect: true, responseTimeMs: 8000, pointsEarned: 105 },
      ],
    },
    playerScores: {
      [DEMO_USER_ID]: 330,
      ['opp-samuel-pierre']: 210,
    },
    playersCompleted: [DEMO_USER_ID, 'opp-samuel-pierre'],
    status: 'completed',
    startedAt: new Date(Date.now() - 46 * 3600_000).toISOString(),
    completedAt: new Date(Date.now() - 45 * 3600_000).toISOString(),
  },
  {
    id: 'round-comp-3',
    roundNumber: 3,
    categoryId: 'parabolas',
    categoryName: 'Parabòl Jezi yo',
    questionIds: ['dq-par-001', 'dq-par-002', 'dq-par-003'],
    playerAnswers: {
      [DEMO_USER_ID]: [
        { questionId: 'dq-par-001', selectedOptionId: 'c', correctOptionId: 'c', isCorrect: true, responseTimeMs: 5800, pointsEarned: 110 },
        { questionId: 'dq-par-002', selectedOptionId: 'b', correctOptionId: 'b', isCorrect: true, responseTimeMs: 7200, pointsEarned: 105 },
        { questionId: 'dq-par-003', selectedOptionId: 'b', correctOptionId: 'b', isCorrect: true, responseTimeMs: 6500, pointsEarned: 110 },
      ],
      ['opp-samuel-pierre']: [
        { questionId: 'dq-par-001', selectedOptionId: 'c', correctOptionId: 'c', isCorrect: true, responseTimeMs: 6000, pointsEarned: 110 },
        { questionId: 'dq-par-002', selectedOptionId: 'b', correctOptionId: 'b', isCorrect: true, responseTimeMs: 8000, pointsEarned: 100 },
        { questionId: 'dq-par-003', selectedOptionId: 'a', correctOptionId: 'b', isCorrect: false, responseTimeMs: 13000, pointsEarned: 0 },
      ],
    },
    playerScores: {
      [DEMO_USER_ID]: 325,
      ['opp-samuel-pierre']: 210,
    },
    playersCompleted: [DEMO_USER_ID, 'opp-samuel-pierre'],
    status: 'completed',
    startedAt: new Date(Date.now() - 44 * 3600_000).toISOString(),
    completedAt: new Date(Date.now() - 43 * 3600_000).toISOString(),
  },
];

// ─── MOCK DUELS ──────────────────────────────────────────────────

function futureDateISO(hoursFromNow: number): string {
  return new Date(Date.now() + hoursFromNow * 3600_000).toISOString();
}

function pastDateISO(hoursAgo: number): string {
  return new Date(Date.now() - hoursAgo * 3600_000).toISOString();
}

/** Duel 1: RECEIVED — Daniel Cruz challenged the user */
export const MOCK_DUEL_RECEIVED: DuelModel = {
  id: 'duel-received-001',
  createdBy: 'opp-daniel-cruz',
  participants: {
    ['opp-daniel-cruz']: {
      uid: 'opp-daniel-cruz',
      name: 'Daniel Cruz',
      avatarUrl: MOCK_OPPONENTS[0].avatarUrl,
      score: 0,
      correctAnswers: 0,
      status: 'accepted',
      completed: false
    },
    [DEMO_USER_ID]: {
      uid: DEMO_USER_ID,
      name: DEMO_USER_NAME,
      avatarUrl: DEMO_USER_AVATAR,
      score: 0,
      correctAnswers: 0,
      status: 'pending',
      completed: false
    }
  },
  participantIds: ['opp-daniel-cruz', DEMO_USER_ID],
  status: 'pending',
  winnerIds: [],
  loserIds: [],
  isTie: false,
  language: 'ht',
  difficulty: 'medium',
  selectedCategories: ['milagros', 'profecias', 'parabolas'],
  totalRounds: 3,
  currentRound: 1,
  rewardConfig: { xp: 200, coins: 100, crowns: 150 },
  turnTimeLimitSeconds: 20,
  duelType: 'friend',
  createdAt: pastDateISO(4),
  updatedAt: pastDateISO(4),
  expiresAt: futureDateISO(20),
  lastActionAt: pastDateISO(4),
};

/** Duel 2: SENT — User challenged Ruth Méndez */
export const MOCK_DUEL_SENT: DuelModel = {
  id: 'duel-sent-001',
  createdBy: DEMO_USER_ID,
  participants: {
    [DEMO_USER_ID]: {
      uid: DEMO_USER_ID,
      name: DEMO_USER_NAME,
      avatarUrl: DEMO_USER_AVATAR,
      score: 0,
      correctAnswers: 0,
      status: 'accepted',
      completed: false
    },
    ['opp-ruth-mendez']: {
      uid: 'opp-ruth-mendez',
      name: 'Ruth Méndez',
      avatarUrl: MOCK_OPPONENTS[1].avatarUrl,
      score: 0,
      correctAnswers: 0,
      status: 'pending',
      completed: false
    }
  },
  participantIds: [DEMO_USER_ID, 'opp-ruth-mendez'],
  status: 'pending',
  winnerIds: [],
  loserIds: [],
  isTie: false,
  language: 'ht',
  difficulty: 'easy',
  selectedCategories: ['profecias', 'parabolas'],
  totalRounds: 3,
  currentRound: 1,
  rewardConfig: { xp: 150, coins: 75, crowns: 100 },
  turnTimeLimitSeconds: 20,
  duelType: 'friend',
  createdAt: pastDateISO(8),
  updatedAt: pastDateISO(8),
  expiresAt: futureDateISO(16),
  lastActionAt: pastDateISO(8),
};

/** Duel 3: ACTIVE — vs Esther Paulino, Round 2, USER's turn */
export const MOCK_DUEL_ACTIVE: DuelModel = {
  id: 'duel-active-001',
  createdBy: DEMO_USER_ID,
  participants: {
    [DEMO_USER_ID]: {
      uid: DEMO_USER_ID,
      name: DEMO_USER_NAME,
      avatarUrl: DEMO_USER_AVATAR,
      score: 210,
      correctAnswers: 2,
      status: 'accepted',
      completed: false
    },
    ['opp-esther-paulino']: {
      uid: 'opp-esther-paulino',
      name: 'Esther Paulino',
      avatarUrl: MOCK_OPPONENTS[2].avatarUrl,
      score: 325,
      correctAnswers: 3,
      status: 'accepted',
      completed: false
    }
  },
  participantIds: [DEMO_USER_ID, 'opp-esther-paulino'],
  status: 'active',
  winnerIds: [],
  loserIds: [],
  isTie: false,
  language: 'ht',
  difficulty: 'medium',
  selectedCategories: ['milagros', 'profecias', 'parabolas'],
  totalRounds: 3,
  currentRound: 2,
  rewardConfig: { xp: 200, coins: 100, crowns: 150 },
  turnTimeLimitSeconds: 20,
  duelType: 'friend',
  createdAt: pastDateISO(24),
  updatedAt: pastDateISO(1),
  acceptedAt: pastDateISO(23),
  startedAt: pastDateISO(23),
  expiresAt: futureDateISO(24),
  lastActionAt: pastDateISO(1),
};

/** Duel 4: COMPLETED — vs Samuel Pierre, USER won */
export const MOCK_DUEL_COMPLETED: DuelModel = {
  id: 'duel-completed-001',
  createdBy: 'opp-samuel-pierre',
  participants: {
    [DEMO_USER_ID]: {
      uid: DEMO_USER_ID,
      name: DEMO_USER_NAME,
      avatarUrl: DEMO_USER_AVATAR,
      score: 975,
      correctAnswers: 9,
      status: 'accepted',
      completed: true
    },
    ['opp-samuel-pierre']: {
      uid: 'opp-samuel-pierre',
      name: 'Samuel Pierre',
      avatarUrl: MOCK_OPPONENTS[3].avatarUrl,
      score: 630,
      correctAnswers: 7,
      status: 'accepted',
      completed: true
    }
  },
  participantIds: [DEMO_USER_ID, 'opp-samuel-pierre'],
  status: 'completed',
  winnerIds: [DEMO_USER_ID],
  loserIds: ['opp-samuel-pierre'],
  isTie: false,
  language: 'ht',
  difficulty: 'medium',
  selectedCategories: ['milagros', 'profecias', 'parabolas'],
  totalRounds: 3,
  currentRound: 3,
  rewardConfig: { xp: 200, coins: 100, crowns: 200 },
  turnTimeLimitSeconds: 20,
  duelType: 'invite',
  createdAt: pastDateISO(50),
  updatedAt: pastDateISO(43),
  acceptedAt: pastDateISO(49),
  startedAt: pastDateISO(48),
  endedAt: pastDateISO(43),
  expiresAt: pastDateISO(26),
  lastActionAt: pastDateISO(43),
};

export const ALL_MOCK_DUELS: DuelModel[] = [
  MOCK_DUEL_RECEIVED,
  MOCK_DUEL_SENT,
  MOCK_DUEL_ACTIVE,
  MOCK_DUEL_COMPLETED,
];

// ─── ROUND STORE ─────────────────────────────────────────────────

export const MOCK_ROUNDS_BY_DUEL: Record<string, DuelRound[]> = {
  'duel-active-001': [MOCK_ACTIVE_ROUND_1, MOCK_ACTIVE_ROUND_2],
  'duel-completed-001': MOCK_COMPLETED_ROUNDS,
};

// ─── QUESTION LOOKUP ─────────────────────────────────────────────

export function getQuestionsByIds(ids: string[], language: string = 'ht'): DuelQuestion[] {
  return ids.map(id => {
    // Try preferred language
    const translated = ALL_DUEL_QUESTIONS.find(q => q.id === id && q.language === language);
    if (translated) return translated;
    
    // Fallback to any language
    return ALL_DUEL_QUESTIONS.find(q => q.id === id);
  }).filter(Boolean) as DuelQuestion[];
}

export function getQuestionsForCategory(categoryId: string, language: string = 'ht', count = 3): DuelQuestion[] {
  let pool = ALL_DUEL_QUESTIONS.filter((q) => q.categoryId === categoryId && q.language === language);
  
  // Opcional: mezclar un poco para mayor aleatoriedad usando Sort
  pool = pool.sort(() => 0.5 - Math.random());
  
  return pool.slice(0, count);
}

// ─── CATEGORY OPTIONS ────────────────────────────────────────────
export const DUEL_CATEGORIES = [
  { id: 'pentateuco', name: 'Pentatèk / Lalwa', nameES: 'Pentateuco / Ley', nameFR: 'Loi / Pentateuque', icon: '📜' },
  { id: 'historia', name: 'Istwa Izrayèl', nameES: 'Historia de Israel', nameFR: "Histoire d'Israël", icon: '🏛️' },
  { id: 'sabiduria', name: 'Sajès ak Pwezi', nameES: 'Sabiduría y Poesía', nameFR: 'Sagesse et Poésie', icon: '🕊️' },
  { id: 'profetas-may', name: 'Gwo Pwofèt yo', nameES: 'Profetas Mayores', nameFR: 'Grands Prophètes', icon: '🗣️' },
  { id: 'profetas-men', name: 'Ti Pwofèt yo', nameES: 'Profetas Menores', nameFR: 'Petits Prophètes', icon: '📢' },
  { id: 'evangelios', name: 'Bòn Nouvèl (Evanjil)', nameES: 'Evangelios', nameFR: 'Évangiles', icon: '📖' },
  { id: 'hechos', name: 'Travay Apòt yo', nameES: 'Hechos de los Apóstoles', nameFR: "Actes des Apôtres", icon: '🎬' },
  { id: 'cartas-pablo', name: 'Lèt Pòl yo', nameES: 'Epístolas de Pablo', nameFR: 'Épîtres de Paul', icon: '✉️' },
  { id: 'cartas-gen', name: 'Lèt Jeneral yo', nameES: 'Epístolas Generales', nameFR: 'Épîtres Générales', icon: '📝' },
  { id: 'apocalipsis', name: 'Apokalips', nameES: 'Apocalipsis', nameFR: 'Apocalypse', icon: '🔥' },
  { id: 'personajes', name: 'Pèsonaj', nameES: 'Personajes', nameFR: 'Personnages Bibliques', icon: '👤' },
  { id: 'lugares', name: 'Kote (Lye)', nameES: 'Lugares Bíblicos', nameFR: 'Lieux Bibliques', icon: '🗺️' },
  { id: 'eventos', name: 'Evènman', nameES: 'Eventos Bíblicos', nameFR: 'Événements Bibliques', icon: '📅' },
  { id: 'temas', name: 'Tèm', nameES: 'Temas Bíblicos', nameFR: 'Thèmes Bibliques', icon: '📚' },
  { id: 'genesis', name: 'Jenèz', nameES: 'Génesis', nameFR: 'Genèse', icon: '🌍' },
  { id: 'exodo', name: 'Egzòd', nameES: 'Éxodo', nameFR: 'Exode', icon: '🌊' },
  { id: 'reyes', name: 'Wa yo ak Pwofèt yo', nameES: 'Reyes y Profetas', nameFR: 'Rois et Prophètes', icon: '👑' },
  { id: 'salmos', name: 'Sòm yo', nameES: 'Salmos', nameFR: 'Psaumes', icon: '🎶' },
  { id: 'milagros', name: 'Mirak Jezi yo', nameES: 'Milagros de Jesús', nameFR: 'Miracles de Jésus', icon: '✨' },
  { id: 'parabolas', name: 'Parabòl Jezi yo', nameES: 'Parábolas de Jesús', nameFR: 'Paraboles de Jésus', icon: '📖' },
  { id: 'mujeres', name: 'Fanm nan Bib la', nameES: 'Mujeres de la Biblia', nameFR: 'Femmes de la Bible', icon: '👩' },
  { id: 'personajes-at', name: 'Pèsonaj Ansyen Testaman', nameES: 'Personajes del Antiguo Testamento', nameFR: "Ancien Testament", icon: '🧔' },
  { id: 'personajes-nt', name: 'Pèsonaj Nouvo Testaman', nameES: 'Personajes del Nuevo Testamento', nameFR: "Nouveau Testament", icon: '🧑' },
  { id: 'doctrina', name: 'Doktrin Biblik', nameES: 'Doctrina Bíblica', nameFR: 'Doctrine Blique', icon: '⚖️' },
  { id: 'vida-cristiana', name: 'Lavi Kretyen', nameES: 'Vida Cristiana', nameFR: 'Vie Chrétienne', icon: '✝️' },
  { id: 'iglesia', name: 'Legliz', nameES: 'La Iglesia', nameFR: 'Église', icon: '⛪' },
  { id: 'espiritu-santo', name: 'Sentespri', nameES: 'El Espíritu Santo', nameFR: 'Saint-Esprit', icon: '🕊️' },
  { id: 'escatologia', name: 'Eskatoloji', nameES: 'Escatología', nameFR: 'Eschatologie', icon: '🎺' },
  { id: 'mision', name: 'Misyon', nameES: 'La Misión', nameFR: 'Mission', icon: '🌍' },
  { id: 'ley-moral', name: 'Lwa Moral', nameES: 'Ley Moral', nameFR: 'Loi Morale', icon: '📜' },
  { id: 'nuevo-testamento', name: 'Nouvo Testaman (Jeneral)', nameES: 'Nuevo Testamento (General)', nameFR: 'Nouveau Testament (Général)', icon: '📖' },
  { id: 'tabernakulo', name: 'Tabènak ak Tanp', nameES: 'Tabernáculo y Templo', nameFR: 'Tabernacle et Temple', icon: '⛺' },
  { id: 'lideres', name: 'Lidè nan Bib la', nameES: 'Líderes Bíblicos', nameFR: 'Leaders Bibliques', icon: '👥' },
  { id: 'viajes-pablo', name: 'Vwayaj Pòl yo', nameES: 'Viajes de Pablo', nameFR: 'Voyages de Paul', icon: '⛵' },
  { id: 'cultura', name: 'Kilti ak Sosyete', nameES: 'Cultura y Sociedad', nameFR: 'Culture et Société', icon: '🏺' },
  { id: 'oracion', name: 'Lapriyè', nameES: 'La Oración', nameFR: 'Prière', icon: '🙏' },
  { id: 'at-general', name: 'Ansyen Testaman (Jeneral)', nameES: 'Antiguo Testamento (General)', nameFR: 'Ancien Testament (Général)', icon: '📜' },
  { id: 'intertestamentario', name: 'Peryòd Entètestamantè', nameES: 'Período Intertestamentario', nameFR: 'Période Intertestamentaire', icon: '⏳' },
  { id: 'guerras', name: 'Lagè ak Batay', nameES: 'Guerras y Batallas', nameFR: 'Guerres et Batailles', icon: '⚔️' },
];
