// ---------------------------------------------------------------
// DUEL MODULE — REPOSITORY (FIRESTORE)
// ---------------------------------------------------------------
import {
  DuelModel,
  DuelRound,
  DuelAnswer,
  DuelResult,
  DuelRewardConfig,
  DuelOpponent,
} from './models';
import { getGameEngineConfig } from '../admin/settings-repository';

const REWARD_BY_DIFFICULTY: Record<string, DuelRewardConfig> = {
  easy: { xp: 50, coins: 20, crowns: 1 },
  medium: { xp: 100, coins: 50, crowns: 1 },
  hard: { xp: 200, coins: 100, crowns: 3 },
};

const TIME_BY_DIFFICULTY: Record<string, number> = {
  easy: 30,
  medium: 20,
  hard: 15,
};

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  setDoc, 
  updateDoc, 
  Timestamp, 
  serverTimestamp, 
  increment,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ALL_DUEL_QUESTIONS, DUEL_CATEGORIES } from './seed';
import { updateUserStats } from '@/lib/user/repository';
import { calculateDuelRewards } from './service';

function getCategoryName(id: string, language: string = 'ht'): string {
  const cat = DUEL_CATEGORIES.find(c => c.id === id);
  if (!cat) return id;
  return language === 'fr' ? (cat.nameFR || cat.name) : cat.name;
}

export function subscribeToDuelsForUser(uid: string, onUpdate: (duels: DuelModel[]) => void): () => void {
  if (!uid) return () => {};
  
  const q = query(
    collection(db, 'duels'), 
    where('participantIds', 'array-contains', uid)
  );
  
  return onSnapshot(q, (snap) => {
    const duels = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DuelModel));
    // Sort by creation date descending
    const sorted = duels.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    onUpdate(sorted);
  }, (error) => {
    if (error.code === 'permission-denied') {
      console.warn('Duel subscription permission denied (likely sign-out)');
      onUpdate([]);
    } else {
      console.error('Error in subscribeToDuelsForUser:', error);
    }
  });
}

export function subscribeToDuelById(duelId: string, onUpdate: (duel: DuelModel | null) => void): () => void {
  const duelRef = doc(db, 'duels', duelId);
  return onSnapshot(duelRef, (docSnap) => {
    if (!docSnap.exists()) {
      onUpdate(null);
    } else {
      onUpdate({ id: docSnap.id, ...docSnap.data() } as DuelModel);
    }
  }, (error) => {
    if (error.code === 'permission-denied') {
      console.warn('Duel detailed subscription permission denied (likely sign-out)');
      onUpdate(null);
    } else {
      console.error('Error in subscribeToDuelById:', error);
    }
  });
}

export async function getDuelsForUser(uid: string): Promise<DuelModel[]> {
  const q = query(collection(db, 'duels'), where('participantIds', 'array-contains', uid));
  const snap = await getDocs(q);
  const duels = snap.docs.map(d => ({ id: d.id, ...d.data() } as DuelModel));
  return duels.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getDuelById(duelId: string): Promise<DuelModel | null> {
  const d = await getDoc(doc(db, 'duels', duelId));
  if (!d.exists()) return null;
  return { id: d.id, ...d.data() } as DuelModel;
}

export async function getRoundsForDuel(duelId: string): Promise<DuelRound[]> {
  const q = query(collection(db, `duels/${duelId}/rounds`));
  const snaps = await getDocs(q);
  const rounds = snaps.docs.map(d => ({ id: d.id, ...d.data() } as DuelRound));
  return rounds.sort((a, b) => a.roundNumber - b.roundNumber);
}

export async function getRoundByNumber(duelId: string, roundNumber: number): Promise<DuelRound | null> {
  const rounds = await getRoundsForDuel(duelId);
  return rounds.find((r) => r.roundNumber === roundNumber) ?? null;
}

export async function acceptDuel(duelId: string, uid: string): Promise<DuelModel> {
  const duelRef = doc(db, 'duels', duelId);
  const duelSnap = await getDoc(duelRef);
  if (!duelSnap.exists()) throw new Error(`Duel not found: ${duelId}`);

  const duel = { id: duelSnap.id, ...duelSnap.data() } as DuelModel;
  const now = new Date().toISOString();

  // Update participant status
  const participants = { ...duel.participants };
  if (participants[uid]) {
    participants[uid].status = 'accepted';
  }

  // Check if all guests have responded
  const nonCreators = duel.participantIds.filter(id => id !== duel.createdBy);
  const everyoneResponded = nonCreators.every(id => participants[id].status !== 'pending');
  const anyoneAccepted = nonCreators.some(id => participants[id].status === 'accepted');

  // If already active, stay active. Otherwise, check if we should transition.
  let newStatus = duel.status;
  if (duel.status === 'pending') {
    const is1v1 = duel.participantIds.length === 2;
    
    if (is1v1) {
      // For 1v1, start as soon as the opponent accepts
      if (anyoneAccepted) {
        newStatus = 'active';
      } else if (everyoneResponded) {
        newStatus = 'declined';
      }
    } else {
      // For multiplayer, stay pending until the creator manually starts,
      // OR if everyone has responded, we can transition to active or declined.
      if (everyoneResponded) {
        newStatus = anyoneAccepted ? 'active' : 'declined';
      }
      // If someone accepted but not everyone responded, we stay 'pending' 
      // so the creator can see the "Start" button and decide.
    }
  }

  const updatedData: Partial<DuelModel> = {
    status: newStatus,
    participants,
    acceptedAt: now,
    startedAt: (duel.startedAt || (newStatus === 'active')) ? (duel.startedAt || now) : undefined,
    updatedAt: now,
    lastActionAt: now,
    currentTurnUid: duel.currentTurnUid || duel.participantIds[0],
  };

  await updateDoc(duelRef, updatedData);

  // Create round 1 if it doesn't exist
  const roundRef = doc(db, `duels/${duelId}/rounds`, `${duelId}-round-1`);
  const roundSnap = await getDoc(roundRef);
  
  if (!roundSnap.exists()) {
    const categoryId = duel.selectedCategories[0] ?? 'evangelios';
    const round1: DuelRound = {
      id: `${duelId}-round-1`,
      roundNumber: 1,
      categoryId,
      categoryName: getCategoryName(categoryId, duel.language),
      questionIds: await getQuestionIdsForCategoryAndDifficulty(categoryId, duel.difficulty, duel.language),
      playerAnswers: {},
      playerScores: {},
      playersCompleted: [],
      status: 'active',
      startedAt: now,
    };
    await setDoc(roundRef, round1);
  }

  return { ...duel, ...updatedData } as DuelModel;
}

export async function declineDuel(duelId: string, uid: string): Promise<DuelModel> {
  const duelRef = doc(db, 'duels', duelId);
  const duelSnap = await getDoc(duelRef);
  if (!duelSnap.exists()) throw new Error(`Duel not found`);

  const duel = duelSnap.data() as DuelModel;
  const participants = { ...duel.participants };
  if (participants[uid]) {
    participants[uid].status = 'declined';
  }

  const nonCreators = duel.participantIds.filter(id => id !== duel.createdBy);
  const everyoneResponded = nonCreators.every(id => participants[id].status !== 'pending');
  const anyoneAccepted = nonCreators.some(id => participants[id].status === 'accepted');

  const is1v1 = duel.participantIds.length === 2;
  let newStatus = duel.status;
  
  if (duel.status === 'pending') {
    if (is1v1) {
      newStatus = 'declined';
    } else if (everyoneResponded) {
      newStatus = anyoneAccepted ? 'active' : 'declined';
    }
  }

  const updatedData: Partial<DuelModel> = {
    participants,
    status: newStatus,
    updatedAt: new Date().toISOString(),
    lastActionAt: new Date().toISOString(),
  };

  // If it was this user's turn, move it forward
  if (duel.currentTurnUid === uid) {
    const playersInDuel = duel.participantIds.filter(id => 
      participants[id].status === 'accepted' || participants[id].status === 'pending'
    );
    if (playersInDuel.length > 0) {
      const myIdx = duel.participantIds.indexOf(uid);
      // Find the next available player after myIdx who hasn't declined
      const nextId = duel.participantIds.find((id, idx) => idx > myIdx && playersInDuel.includes(id)) 
                   || playersInDuel[0];
      updatedData.currentTurnUid = nextId;
    }
  }

  await updateDoc(duelRef, updatedData);
  return { ...duel, ...updatedData, id: duelSnap.id } as DuelModel;
}

export async function startDuel(duelId: string): Promise<DuelModel> {
  const duelRef = doc(db, 'duels', duelId);
  const duelSnap = await getDoc(duelRef);
  if (!duelSnap.exists()) throw new Error(`Duel not found`);

  const duel = { id: duelSnap.id, ...duelSnap.data() } as DuelModel;
  const now = new Date().toISOString();

  // Check if at least one guest accepted
  const acceptedGuests = Object.values(duel.participants).filter(p => p.uid !== duel.createdBy && p.status === 'accepted');
  if (acceptedGuests.length === 0) throw new Error('At least one guest must accept before starting');

  const updatedData: Partial<DuelModel> = {
    status: 'active',
    startedAt: now,
    updatedAt: now,
    lastActionAt: now,
  };

  await updateDoc(duelRef, updatedData);

  // Create round 1 if it doesn't exist
  const roundRef = doc(db, `duels/${duelId}/rounds`, `${duelId}-round-1`);
  const roundSnap = await getDoc(roundRef);
  
  if (!roundSnap.exists()) {
    const categoryId = duel.selectedCategories[0] ?? 'evangelios';
    const round1: DuelRound = {
      id: `${duelId}-round-1`,
      roundNumber: 1,
      categoryId,
      categoryName: getCategoryName(categoryId, duel.language),
      questionIds: await getQuestionIdsForCategoryAndDifficulty(categoryId, duel.difficulty, duel.language),
      playerAnswers: {},
      playerScores: {},
      playersCompleted: [],
      status: 'active',
      startedAt: now,
    };
    await setDoc(roundRef, round1);
  }

  return { ...duel, ...updatedData } as DuelModel;
}

export async function submitRoundAnswers(
  duelId: string,
  roundNumber: number,
  playerId: string,
  answers: DuelAnswer[],
  score: number,
  correctAnswers: number
): Promise<{ duel: DuelModel; round: DuelRound; isRoundComplete: boolean; isDuelComplete: boolean }> {
  
  const duelRef = doc(db, 'duels', duelId);
  const duelSnap = await getDoc(duelRef);
  const duel = { id: duelSnap.id, ...duelSnap.data() } as DuelModel;

  const rounds = await getRoundsForDuel(duelId);
  const round = rounds.find(r => r.roundNumber === roundNumber);
  if (!round) throw new Error('Round not found');

  const now = new Date().toISOString();

  // Update participant in DuelModel
  const participants = { ...duel.participants };
  if (participants[playerId]) {
    participants[playerId].score += score;
    participants[playerId].correctAnswers += correctAnswers;
  }

  // Update player in Round
  const playerAnswers = { ...round.playerAnswers, [playerId]: answers };
  const playerScores = { ...round.playerScores, [playerId]: score };
  const playersCompleted = Array.from(new Set([...round.playersCompleted, playerId]));

  round.playerAnswers = playerAnswers;
  round.playerScores = playerScores;
  round.playersCompleted = playersCompleted;

  // ─── Round Completion & Turn Management ────────────────────────
  // We only include players who have accepted the duel in the active rotation.
  // This prevents the game from getting stuck waiting for players who haven't responded yet.
  const playersInDuel = duel.participantIds.filter(id => 
    participants[id].status === 'accepted'
  );
  
  const isRoundComplete = playersInDuel.every(uid => playersCompleted.includes(uid));

  if (isRoundComplete) {
    round.status = 'completed';
    round.completedAt = now;
  }

  // Move turn to the next player in the predefined participantIds order
  const currentIndex = playersInDuel.indexOf(playerId);
  if (currentIndex !== -1 && currentIndex < playersInDuel.length - 1) {
    // Next person in line (might need to accept first)
    duel.currentTurnUid = playersInDuel[currentIndex + 1];
  } else {
    // Round complete or last player finished, reset to first player for next round
    duel.currentTurnUid = playersInDuel[0];
  }

  // Update Round
  await setDoc(doc(db, `duels/${duelId}/rounds`, round.id), round);

  let isDuelComplete = false;
  const nextRound = roundNumber + 1;

  if (isRoundComplete && nextRound <= duel.totalRounds) {
    // ── Pre-generate next round ───────────────────────────
    const catIdx = nextRound - 1;
    const categoryId = duel.selectedCategories[catIdx] ?? duel.selectedCategories[0];
    const newRound: DuelRound = {
      id: `${duelId}-round-${nextRound}`,
      roundNumber: nextRound,
      categoryId,
      categoryName: getCategoryName(categoryId, duel.language),
      questionIds: await getQuestionIdsForCategoryAndDifficulty(categoryId, duel.difficulty, duel.language),
      playerAnswers: {},
      playerScores: {},
      playersCompleted: [],
      status: 'active',
      startedAt: now,
    };
    await setDoc(doc(db, `duels/${duelId}/rounds`, newRound.id), newRound);
    duel.currentRound = nextRound;

  } else if (isRoundComplete && nextRound > duel.totalRounds) {
    // ── All regular rounds done — check scores ───────────────────
    const sortedPlayers = Object.values(participants)
      .filter(p => p.status === 'accepted')
      .sort((a, b) => b.score - a.score);
    
    const topScore = sortedPlayers[0].score;
    const winners = sortedPlayers.filter(p => p.score === topScore);

    if (winners.length === 1) {
      // Single winner
      isDuelComplete = true;
      duel.status = 'completed';
      duel.endedAt = now;
      duel.winnerIds = [winners[0].uid];
      duel.loserIds = sortedPlayers.filter(p => p.score < topScore).map(p => p.uid);
      duel.isTie = false;
      Object.keys(participants).forEach(uid => {
        if (participants[uid].status === 'accepted') participants[uid].completed = true;
      });
    } else {
      // ── TIE → Sudden-death ────────────────────────────────────
      const wasTiebreaker = round.isTiebreakerRound === true;
      
      // En multijugador, si hay empate tras tiebreaker, seguimos hasta que alguien gane o termine.
      // Para simplificar, si tras un tiebreaker alguien tiene más puntos en esa ronda, gana.
      const roundWinners = winners.filter(w => (playerScores[w.uid] || 0) > 0); 
      // (En realidad, el tiebreaker debería ser el primero que acierte).

      if (wasTiebreaker) {
        // Did andyone win THIS round?
        const bestInRound = Math.max(...winners.map(w => playerScores[w.uid] || 0));
        const winnersInRound = winners.filter(w => (playerScores[w.uid] || 0) === bestInRound && bestInRound > 0);

        if (winnersInRound.length === 1) {
          isDuelComplete = true;
          duel.status = 'completed';
          duel.endedAt = now;
          duel.winnerIds = [winnersInRound[0].uid];
          duel.isTie = false;
        } else {
          await createTiebreakerRound(duelId, duel, nextRound, now);
          duel.tiebreakerRoundNumber = nextRound;
          duel.currentRound = nextRound;
        }
      } else {
        await createTiebreakerRound(duelId, duel, nextRound, now);
        duel.tiebreakerRoundNumber = nextRound;
        duel.currentRound = nextRound;
      }
    }
  }

  duel.participants = participants;
  duel.updatedAt = now;
  duel.lastActionAt = now;

  // Update Duel doc
  const { id: _, ...duelData } = duel;
  await updateDoc(duelRef, duelData);

  // Sync Stats... (Handled by Cloud Function trigger on status change to 'completed')
  if (isDuelComplete) {
    // We only update the local duel doc state if needed, but rewards are backend-side now.
    console.log(`[Duel] Complete. Waiting for Cloud Function rewards...`);
  }

  return { duel, round, isRoundComplete, isDuelComplete };
}


export async function createDuel(
  creatorUid: string,
  creatorName: string,
  creatorAvatar: string,
  opponents: DuelOpponent[],
  categories: string[],
  difficulty: 'easy' | 'medium' | 'hard',
  totalRounds: number = 3,
  language: string = 'ht'
): Promise<DuelModel> {
  const now = new Date().toISOString();
  const duelRef = doc(collection(db, 'duels'));
  
  const participants: Record<string, any> = {
    [creatorUid]: {
      uid: creatorUid,
      name: creatorName,
      avatarUrl: creatorAvatar,
      score: 0,
      correctAnswers: 0,
      status: 'accepted',
      completed: false
    }
  };
  const participantIds = [creatorUid];

  opponents.forEach(opp => {
    participants[opp.uid] = {
      uid: opp.uid,
      name: opp.name,
      avatarUrl: opp.avatarUrl,
      score: 0,
      correctAnswers: 0,
      status: 'pending',
      completed: false
    };
    participantIds.push(opp.uid);
  });

  const newDuel: DuelModel = {
    id: duelRef.id,
    createdBy: creatorUid,
    participants,
    participantIds,
    status: 'pending',
    winnerIds: [],
    loserIds: [],
    isTie: false,
    language,
    difficulty,
    selectedCategories: categories,
    totalRounds,
    currentRound: 1,
    currentTurnUid: creatorUid,
    rewardConfig: { xp: 0, coins: 0, crowns: 0 },
    turnTimeLimitSeconds: 20,
    duelType: 'friend',
    createdAt: now,
    updatedAt: now,
    expiresAt: new Date(Date.now() + 24 * 3600_000).toISOString(),
    lastActionAt: now,
  };

  const config = await getGameEngineConfig();
  const diffSetting = config.duels.difficultySettings[difficulty];
  
  newDuel.rewardConfig = diffSetting.rewards;
  newDuel.turnTimeLimitSeconds = diffSetting.timeLimit;

  await setDoc(duelRef, newDuel);
  return newDuel;
}

export async function saveDuelResult(result: DuelResult): Promise<void> {
  await setDoc(doc(db, 'duel_results', `${result.duelId}_${Date.now()}`), result);
}

export async function getDuelResults(): Promise<DuelResult[]> {
  const q = query(collection(db, 'duel_results'));
  const snaps = await getDocs(q);
  return snaps.docs.map(d => d.data() as DuelResult);
}


function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Returns question IDs for a category filtered and sized by difficulty:
 *  easy   →  9 questions (easy only)
 *  medium → 12 questions (easy + medium)
 *  hard   → 15 questions (all levels)
 */
async function getQuestionIdsForCategoryAndDifficulty(
  categoryId: string,
  difficulty: string,
  language: string = 'ht'
): Promise<string[]> {
  const config = await getGameEngineConfig();
  const diffSetting = config.duels.difficultySettings[difficulty as keyof typeof config.duels.difficultySettings];
  
  // Try to get questions in requested language
  let pool = ALL_DUEL_QUESTIONS.filter(
    (q) => q.categoryId === categoryId && q.language === language
  );

  // FALLBACK 1: If no questions for this language, try 'ht'
  if (pool.length === 0 && language !== 'ht') {
    pool = ALL_DUEL_QUESTIONS.filter(
      (q) => q.categoryId === categoryId && q.language === 'ht'
    );
  }

  // FALLBACK 2: If still no questions (invalid category?), use any available category in 'ht'
  if (pool.length === 0) {
    pool = ALL_DUEL_QUESTIONS.filter((q) => q.language === 'ht').slice(0, 50);
  }

  let count = diffSetting ? diffSetting.questionsPerRound : 15;
  let filtered = pool;

  if (difficulty === 'easy') {
    const easyPool = pool.filter(q => q.difficulty === 'easy');
    if (easyPool.length > 0) {
      filtered = easyPool;
      count = Math.min(easyPool.length, 9);
    }
  } else if (difficulty === 'medium') {
    const mediumPool = pool.filter(q => q.difficulty !== 'hard');
    if (mediumPool.length > 0) {
      filtered = mediumPool;
      count = Math.min(mediumPool.length, 12);
    }
  }

  // Final count safety
  count = Math.min(filtered.length, count);

  return shuffleArray(filtered).slice(0, count).map(q => q.id);
}

function getDefaultQuestionIdsForCategory(categoryId: string, language: string = 'ht'): string[] {
  let pool = ALL_DUEL_QUESTIONS.filter((q) => q.categoryId === categoryId && q.language === language);
  
  if (pool.length === 0 && language !== 'ht') {
    pool = ALL_DUEL_QUESTIONS.filter((q) => q.categoryId === categoryId && q.language === 'ht');
  }

  if (pool.length === 0) {
    pool = ALL_DUEL_QUESTIONS.slice(0, 10);
  }

  return shuffleArray(pool).slice(0, 3).map(q => q.id);
}

/**
 * Creates a sudden-death tiebreaker round with a single question.
 * The category is chosen by cycling through selectedCategories.
 */
async function createTiebreakerRound(
  duelId: string,
  duel: DuelModel,
  roundNumber: number,
  now: string
): Promise<void> {
  // Pick category: cycle through selected categories
  const catIdx = (roundNumber - 1) % duel.selectedCategories.length;
  const categoryId = duel.selectedCategories[catIdx];

  // For sudden death, use only 1 question — respecting duel language.
  const allQIds = getDefaultQuestionIdsForCategory(categoryId, duel.language);
  const tiebreakerQId = allQIds[0];

  const tbRound: DuelRound = {
    id: `${duelId}-round-${roundNumber}`,
    roundNumber,
    categoryId,
    categoryName: getCategoryName(categoryId, duel.language),
    questionIds: [tiebreakerQId],   // ← Only 1 question (sudden death)
    playerAnswers: {},
    playerScores: {},
    playersCompleted: [],
    status: 'active',
    startedAt: now,
    isTiebreakerRound: true,
  };

  await setDoc(doc(db, `duels/${duelId}/rounds`, tbRound.id), tbRound);
}

