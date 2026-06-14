// ---------------------------------------------------------------
// CROWN ARENA MODULE — REPOSITORY
// ---------------------------------------------------------------

import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  onSnapshot, 
  serverTimestamp,
  increment,
  writeBatch,
  getDoc,
  limit,
  orderBy
} from 'firebase/firestore';
import { db, functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { toast } from 'sonner';
import { 
  ArenaSession, 
  ArenaPlayer, 
  ArenaStatus, 
  ArenaMode, 
  ArenaAnswer,
  ArenaInvitation 
} from './models';
import { DuelQuestion, Difficulty } from '@/lib/duel/models';
import { ALL_DUEL_QUESTIONS } from '@/lib/duel/seed';

const ARENA_COLLECTION = 'arenas';

export async function createArenaSession(
  hostId: string, 
  hostName: string,
  hostAvatar: string | null,
  mode: ArenaMode,
  maxPlayers: number,
  language: string,
  categoryIds: string[]
): Promise<string> {
  const arenaRef = doc(collection(db, ARENA_COLLECTION));
  const arenaId = arenaRef.id;

  // 1. Select 20 questions with progressive difficulty
  const questionIds = await selectProgressiveQuestions(categoryIds, language);

  const now = new Date().toISOString();
  
  const marathon: ArenaSession = {
    id: arenaId,
    hostId,
    mode,
    status: 'waiting',
    maxPlayers,
    currentPlayersCount: 1,
    currentQuestionIndex: -1,
    questionIds,
    categoryIds,
    categoryName: categoryIds.includes('random') ? 'Mixed' : 'Custom',
    language,
    createdAt: now,
    updatedAt: now
  };

  await setDoc(arenaRef, marathon);

  // 2. Add host as first player
  const playerRef = doc(db, `${ARENA_COLLECTION}/${arenaId}/players`, hostId);
  const hostPlayer: ArenaPlayer = {
    id: hostId,
    userId: hostId,
    name: hostName,
    avatarUrl: hostAvatar,
    status: 'ready', // Host is ready by default
    score: 0,
    correctAnswersCount: 0,
    streak: 0,
    totalResponseTime: 0,
    lastAnswerCorrect: false,
    isFinished: false,
    joinedAt: now
  };

  await setDoc(playerRef, hostPlayer);

  return arenaId;
}

/**
 * Selects 20 questions: 7 Easy, 7 Medium, 6 Hard
 */
export async function selectProgressiveQuestions(categoryIds: string[], language: string): Promise<string[]> {
  const isRandom = categoryIds.includes('random');
  
  // If random, we can pick a few categories to keep it diverse but focused
  const targetCategories = isRandom 
    ? ['milagros', 'parabolas', 'profecias', 'sabiduria', 'historia'].sort(() => Math.random() - 0.5).slice(0, 4)
    : categoryIds;

  const getPool = (diff: Difficulty) => 
    ALL_DUEL_QUESTIONS.filter(q => 
      q.language === language && 
      q.difficulty === diff && 
      (isRandom || targetCategories.includes(q.categoryId))
    );

  let easyPool = getPool('easy');
  let mediumPool = getPool('medium');
  let hardPool = getPool('hard');

  // Fallback: If not enough in category, get from any category but same language/difficulty
  if (easyPool.length < 7) {
    easyPool = ALL_DUEL_QUESTIONS.filter(q => q.language === language && q.difficulty === 'easy');
  }
  if (mediumPool.length < 7) {
    mediumPool = ALL_DUEL_QUESTIONS.filter(q => q.language === language && q.difficulty === 'medium');
  }
  if (hardPool.length < 6) {
    hardPool = ALL_DUEL_QUESTIONS.filter(q => q.language === language && q.difficulty === 'hard');
  }

  // SECONDARY FALLBACK: If still not enough, add from 'ht' to fill the gap
  const fillPool = (currentPool: DuelQuestion[], diff: Difficulty, count: number) => {
    if (currentPool.length >= count) return currentPool;
    const htPool = ALL_DUEL_QUESTIONS.filter(q => q.language === 'ht' && q.difficulty === diff && !currentPool.some(p => p.id === q.id));
    return [...currentPool, ...htPool];
  };

  if (language !== 'ht') {
    easyPool = fillPool(easyPool, 'easy', 7);
    mediumPool = fillPool(mediumPool, 'medium', 7);
    hardPool = fillPool(hardPool, 'hard', 6);
  }

  const shuffle = <T>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);

  const selectedEasy = shuffle(easyPool).slice(0, 7).map(q => q.id);
  const selectedMedium = shuffle(mediumPool).slice(0, 7).map(q => q.id);
  const selectedHard = shuffle(hardPool).slice(0, 6).map(q => q.id);

  const finalIds = [...selectedEasy, ...selectedMedium, ...selectedHard];

  // Final emergency check
  if (finalIds.length < 20 && language !== 'ht') {
     console.warn(`[REPO] Still only have ${finalIds.length} questions. Forcing HT fallback.`);
     return selectProgressiveQuestions(categoryIds, 'ht');
  }

  return finalIds;
}

/**
 * Join an existing session
 */
export async function joinArenaSession(
  arenaId: string, 
  user: { uid: string; displayName: string; photoURL: string | null }
): Promise<void> {
  const arenaRef = doc(db, ARENA_COLLECTION, arenaId);
  const arenaSnap = await getDoc(arenaRef);
  
  if (!arenaSnap.exists()) throw new Error('Arena not found');
  const arena = arenaSnap.data() as ArenaSession;
  
  const now = new Date().toISOString();
  const playerRef = doc(db, `${ARENA_COLLECTION}/${arenaId}/players`, user.uid);
  const playerSnap = await getDoc(playerRef);
  
  // If player already exists and hasn't left, just return (idempotent)
  if (playerSnap.exists() && playerSnap.data()?.status !== 'left') {
    return;
  }

  if (arena.currentPlayersCount >= arena.maxPlayers) throw new Error('Arena is full');
  
  const newPlayer: ArenaPlayer = {
    id: user.uid,
    userId: user.uid,
    name: user.displayName || 'Anonymous',
    avatarUrl: user.photoURL,
    status: 'accepted',
    score: 0,
    correctAnswersCount: 0,
    streak: 0,
    totalResponseTime: 0,
    lastAnswerCorrect: false,
    isFinished: false,
    joinedAt: now
  };

  await setDoc(playerRef, newPlayer);
  await updateDoc(arenaRef, {
    currentPlayersCount: increment(1),
    updatedAt: now
  });
}

/**
 * Leave a session
 */
export async function leaveArenaSession(arenaId: string, userId: string): Promise<void> {
  const playerRef = doc(db, `${ARENA_COLLECTION}/${arenaId}/players`, userId);
  const arenaRef = doc(db, ARENA_COLLECTION, arenaId);
  
  await updateDoc(playerRef, { status: 'left' });
  await updateDoc(arenaRef, {
    currentPlayersCount: increment(-1),
    updatedAt: new Date().toISOString()
  });
}

/**
 * Start the game (Host only)
 */
export async function startArenaGame(arenaId: string): Promise<void> {
  console.log('[REPO] startArenaGame called for:', arenaId);
  try {
    const arenaRef = doc(db, ARENA_COLLECTION, arenaId);
    console.log('[REPO] Fetching arena doc...');
    const arenaSnap = await getDoc(arenaRef);
    
    if (!arenaSnap.exists()) {
      console.error('[REPO] Arena not found in Firestore:', arenaId);
      throw new Error('Arena not found');
    }

    const arenaData = arenaSnap.data();
    console.log('[REPO] Current arena status:', arenaData?.status, 'hostId:', arenaData?.hostId);
    
    if (arenaData?.status !== 'waiting') {
      console.warn('[REPO] startArenaGame: Arena is already in status:', arenaData?.status);
      return;
    }

    const now = new Date().toISOString();
    const nextQTime = new Date(Date.now() + 5000).toISOString();
    
    const updatePayload = {
      status: 'starting' as ArenaStatus,
      updatedAt: now,
      startedAt: now,
      currentQuestionIndex: 0,
      nextQuestionAt: nextQTime
    };

    console.log('[REPO] Updating arena document with payload:', updatePayload);
    
    await updateDoc(arenaRef, updatePayload);
    console.log('[REPO] updateDoc successful!');
  } catch (error: any) {
    console.error('[REPO] startArenaGame failed:', error);
    if (error.code === 'permission-denied') {
      toast.error('Error de permisos: No tienes permiso para iniciar esta partida');
    } else {
      toast.error('Error al iniciar: ' + (error.message || 'Error desconocido'));
    }
    throw error;
  }
}

/**
 * Submit an answer and calculate points
 * Rules:
 * - Fast (< 3s): 100 pts
 * - Normal: 70 pts
 * - Streak/3: +50 bonus
 */
export async function submitArenaAnswer(
  arenaId: string,
  userId: string,
  questionId: string,
  selectedOptionId: string | null,
  isCorrect: boolean,
  responseTimeMs: number
): Promise<void> {
  const playerRef = doc(db, `${ARENA_COLLECTION}/${arenaId}/players`, userId);
  const playerSnap = await getDoc(playerRef);
  if (!playerSnap.exists()) return;
  
  const player = playerSnap.data() as ArenaPlayer;
  
  let points = 0;
  let newStreak = isCorrect ? player.streak + 1 : 0;
  
  if (isCorrect) {
    points = responseTimeMs < 3000 ? 100 : 70;
    if (newStreak > 0 && newStreak % 3 === 0) {
      points += 50; // Streak bonus
    }
  }

  const now = new Date().toISOString();
  
  // Update Player Stats
  await updateDoc(playerRef, {
    score: increment(points),
    correctAnswersCount: increment(isCorrect ? 1 : 0),
    streak: newStreak,
    totalResponseTime: increment(responseTimeMs),
    lastAnswerCorrect: isCorrect,
    updatedAt: now
  });

  // Log Answer
  const answerRef = doc(collection(db, `${ARENA_COLLECTION}/${arenaId}/answers`));
  const answer: ArenaAnswer = {
    userId,
    questionId,
    selectedOptionId,
    isCorrect,
    responseTimeMs,
    pointsEarned: points,
    answeredAt: now
  };
  await setDoc(answerRef, answer);
}

/**
 * Listen to Arena Session
 */
export function subscribeToArenaSession(arenaId: string, callback: (arena: ArenaSession | null) => void) {
  return onSnapshot(doc(db, ARENA_COLLECTION, arenaId), (snap) => {
    if (!snap.exists()) callback(null);
    else callback({ id: snap.id, ...snap.data() } as ArenaSession);
  }, (error) => {
    if (error.code === 'permission-denied') {
      console.warn('Arena session subscription permission denied');
      callback(null);
    } else {
      console.error('Error in subscribeToArenaSession:', error);
    }
  });
}

/**
 * Listen to Players in Arena
 */
export function subscribeToArenaPlayers(arenaId: string, callback: (players: ArenaPlayer[]) => void) {
  return onSnapshot(query(collection(db, `${ARENA_COLLECTION}/${arenaId}/players`), where('status', '!=', 'left')), (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as ArenaPlayer)));
  }, (error) => {
    if (error.code === 'permission-denied') {
      console.warn('Arena players subscription permission denied');
      callback([]);
    } else {
      console.error('Error in subscribeToArenaPlayers:', error);
    }
  });
}

/**
 * Combined subscription for the Lobby
 * Returns an object with ArenaSession + players array
 */
export function subscribeToArenaRoom(arenaId: string, callback: (room: (ArenaSession & { players: ArenaPlayer[] }) | null) => void) {
  let currentSession: ArenaSession | null = null;
  let currentPlayers: ArenaPlayer[] = [];
  let isUnsubscribed = false;

  const notify = () => {
    if (isUnsubscribed) return;
    if (currentSession) {
      callback({ ...currentSession, players: currentPlayers });
    }
  };

  console.log('Subscribing to arena room:', arenaId);

  const unsubSession = onSnapshot(doc(db, ARENA_COLLECTION, arenaId), (snap) => {
    if (isUnsubscribed) return;
    if (!snap.exists()) {
      console.warn('Arena session doc does not exist:', arenaId);
      callback(null);
      return;
    }
    const data = snap.data();
    console.log('Arena session update:', data.status);
    currentSession = { id: snap.id, ...data } as ArenaSession;
    notify();
  }, (error) => {
    if (isUnsubscribed) return;
    console.error('Error in subscribeToArenaRoom session:', error);
    if (error.code === 'permission-denied') {
      toast.error('Error de permisos al acceder a la sala');
    }
    callback(null);
  });

  const unsubPlayers = onSnapshot(collection(db, `${ARENA_COLLECTION}/${arenaId}/players`), (snap) => {
    if (isUnsubscribed) return;
    console.log('[REPO] Arena players subcollection update, total docs:', snap.docs.length);
    // Filter out players who left in memory
    currentPlayers = snap.docs
      .map(d => ({ id: d.id, ...d.data() } as ArenaPlayer))
      .filter((p: ArenaPlayer) => p.status !== 'left');
    
    console.log('[REPO] Active players count after filtering:', currentPlayers.length);
    notify();
  }, (error) => {
    if (isUnsubscribed) return;
    console.error('[REPO] Error in subscribeToArenaRoom players listener:', error);
    if (error.code === 'permission-denied') {
      console.warn('[REPO] Permission denied for players subcollection.');
    }
  });

  return () => {
    console.log('Unsubscribing from arena room:', arenaId);
    isUnsubscribed = true;
    unsubSession();
    unsubPlayers();
  };
}

/**
 * Find Random Arena
 */
export async function findRandomArena(language: string): Promise<string | null> {
  const q = query(
    collection(db, ARENA_COLLECTION),
    where('status', '==', 'waiting'),
    where('mode', '==', 'random'),
    where('language', '==', language),
    limit(1)
  );
  
  const snap = await getDocs(q);
  if (snap.empty) return null;
  
  const arena = snap.docs[0].data() as ArenaSession;
  if (arena.currentPlayersCount >= arena.maxPlayers) return null;
  
  return snap.docs[0].id;
}

/**
 * Get detailed room info including players
 */
export async function getArenaRoom(arenaId: string): Promise<(ArenaSession & { players: ArenaPlayer[] }) | null> {
  const arenaRef = doc(db, ARENA_COLLECTION, arenaId);
  const arenaSnap = await getDoc(arenaRef);
  
  if (!arenaSnap.exists()) return null;
  
  const playersSnap = await getDocs(collection(db, `${ARENA_COLLECTION}/${arenaId}/players`));
  const players = playersSnap.docs.map(d => ({ id: d.id, ...d.data() } as ArenaPlayer));
  
  return {
    id: arenaSnap.id,
    ...arenaSnap.data(),
    players
  } as ArenaSession & { players: ArenaPlayer[] };
}

/**
 * Update individual player progress
 */
export async function updatePlayerProgress(
  arenaId: string, 
  userId: string, 
  score: number, 
  currentQuestion: number,
  isFinished: boolean
): Promise<void> {
  const playerRef = doc(db, `${ARENA_COLLECTION}/${arenaId}/players`, userId);
  await updateDoc(playerRef, {
    score,
    currentQuestion,
    isFinished,
    updatedAt: new Date().toISOString()
  });
}

/**
 * Mark arena as finished and distribute rewards via Cloud Function
 */
export async function completeArenaMatch(arenaId: string): Promise<void> {
  const completeMatchFn = httpsCallable(functions, 'completeArenaMatch');
  try {
    await completeMatchFn({ arenaId });
  } catch (error: any) {
    console.error('Error in completeArenaMatch, trying client-side fallback:', error);
    // Fallback directly to marking the game status as finished client-side
    try {
      await finishArenaGame(arenaId);
      console.log('Client-side fallback finishArenaGame succeeded.');
    } catch (fallbackError: any) {
      console.error('Fallback finishArenaGame failed too:', fallbackError);
      toast.error('Error al finalizar la partida: ' + (error.message || 'Error desconocido'));
      throw error;
    }
  }
}

/**
 * Mark arena as finished (Simple version)
 */
export async function finishArenaGame(arenaId: string): Promise<void> {
  const arenaRef = doc(db, ARENA_COLLECTION, arenaId);
  await updateDoc(arenaRef, {
    status: 'finished',
    finishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
}

/**
 * Send invitations to a list of friends
 */
export async function sendArenaInvitations(
  arenaId: string,
  host: { uid: string; name: string; avatar: string | null },
  receiverUids: string[],
  gameMode: 'crown_arena' | 'reto_sagrado' = 'crown_arena'
): Promise<string[]> {
  const batch = writeBatch(db);
  const now = new Date().toISOString();
  const invitationIds: string[] = [];

  receiverUids.forEach(uid => {
    const invRef = doc(collection(db, 'arenaInvitations'));
    const invitation: ArenaInvitation = {
      id: invRef.id,
      arenaId,
      hostId: host.uid,
      hostName: host.name,
      hostAvatar: host.avatar,
      receiverId: uid,
      status: 'pending',
      createdAt: now,
      gameMode
    };
    batch.set(invRef, invitation);
    invitationIds.push(invRef.id);
  });

  await batch.commit();
  return invitationIds;
}

/**
 * Listen for pending invitations for a user
 */
export function subscribeToArenaInvitations(userId: string, callback: (invitations: ArenaInvitation[]) => void) {
  const q = query(
    collection(db, 'arenaInvitations'),
    where('receiverId', '==', userId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(doc => ({ ...doc.data() } as ArenaInvitation)));
  }, (error) => {
    if (error.code === 'permission-denied') {
      console.warn('Arena invitations subscription permission denied');
      callback([]);
    } else {
      console.error('Error in subscribeToArenaInvitations:', error);
    }
  });
}

/**
 * Handle invitation status update
 */
export async function updateArenaInvitationStatus(
  invitationId: string,
  status: 'accepted' | 'declined'
): Promise<void> {
  const invRef = doc(db, 'arenaInvitations', invitationId);
  await updateDoc(invRef, { status });
}
