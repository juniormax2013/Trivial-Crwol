// ---------------------------------------------------------------
// DAILY CHALLENGE — REPOSITORY (Data Access Layer)
// ---------------------------------------------------------------
// All data reads/writes go through this file.
// Currently operates in MOCK MODE using localStorage when
// Firebase is not configured (NEXT_PUBLIC_FIREBASE_API_KEY absent).
//
// TODO (Production): Replace each function body with Firestore calls.
// Reward writing MUST move to a Cloud Function for security.

import {
  DailyChallengeModel,
  QuestionModel,
  UserChallengeData,
  UserDailyChallengeHistory,
} from './models';
import { getMockDailyChallenge, MOCK_QUESTIONS, getTodayDateKey } from './seed';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, serverTimestamp, query, where, limit, getDocs } from 'firebase/firestore';

// ---------------------------------------------------------------
// CONFIGURATION
// ---------------------------------------------------------------

/** Demo user UID used when authentication is not yet configured */
export const DEMO_USER_UID = 'demo-user';

const MOCK_USER_STORAGE_KEY = 'bible_crown_challenge_user';

function isMockMode(): boolean {
  // Use mock mode only if no firebase api key is present.
  return !process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
}

// ---------------------------------------------------------------
// MOCK USER STATE (localStorage)
// ---------------------------------------------------------------

function getDefaultUserData(): UserChallengeData {
  return {
    lastDailyChallengeDate: null,
    dailyChallengeCompleted: false,
    streakDays: 3, // demo starting streak
    bestStreak: 7,
    xp: 1250,
    coins: 340,
    gems: 5,
    crowns: 12,
  };
}

function loadMockUser(): UserChallengeData {
  if (typeof window === 'undefined') return getDefaultUserData();
  try {
    const raw = localStorage.getItem(MOCK_USER_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as UserChallengeData;
  } catch {
    // corrupted data — reset
  }
  return getDefaultUserData();
}

function saveMockUser(data: UserChallengeData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MOCK_USER_STORAGE_KEY, JSON.stringify(data));
}

// ---------------------------------------------------------------
// CHALLENGE READS
// ---------------------------------------------------------------

/**
 * Fetch today's active daily challenge.
 * TODO (Firebase): query daily_challenges where dateKey == today && language == language && status == 'active'
 */
export async function getTodayChallenge(
  language = 'ht'
): Promise<DailyChallengeModel | null> {
  if (isMockMode()) {
    await simulateLatency(300);
    return getMockDailyChallenge(language);
  }

  try {
    const today = getTodayDateKey();
    const q = query(
      collection(db, 'daily_challenges'),
      where('dateKey', '==', today),
      where('language', '==', language),
      where('status', '==', 'active'),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return getMockDailyChallenge(language); // Fallback si no hay retos en Firestore
    return snap.docs[0].data() as DailyChallengeModel;
  } catch (error) {
    console.error('[DailyChallenge] firebase fetch failed, falling back to mock:', error);
    return getMockDailyChallenge(language);
  }
}

/**
 * Fetch questions for a challenge by IDs.
 * TODO (Firebase): batch fetch from 'questions' collection
 */
export async function getChallengeQuestions(
  questionIds: string[],
  language: string = 'ht'
): Promise<QuestionModel[]> {
  if (isMockMode()) {
    await simulateLatency(200);
    return MOCK_QUESTIONS.filter(
      (q) => questionIds.includes(q.id) && q.status === 'active' && q.language === language
    );
  }

  // TODO: Firebase implementation
  // const refs = questionIds.map((id) => db.collection('questions').doc(id));
  // const snaps = await db.getAll(...refs);
  // return snaps
  //   .filter((s) => s.exists && s.data()?.status === 'active')
  //   .map((s) => s.data() as QuestionModel);

  return MOCK_QUESTIONS.filter((q) => questionIds.includes(q.id) && q.language === language);
}

// ---------------------------------------------------------------
// USER DATA
// ---------------------------------------------------------------

/**
 * Read user daily challenge fields from Firestore.
 * TODO (Firebase): db.collection('users').doc(uid).get()
 */
export async function getUserDailyChallengeData(
  uid: string
): Promise<UserChallengeData> {
  if (isMockMode() || !uid || !db) {
    return loadMockUser();
  }

  try {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return loadMockUser();
    
    const d = snap.data();
    return {
      lastDailyChallengeDate: d.lastDailyChallengeDate ?? null,
      dailyChallengeCompleted: d.dailyChallengeCompleted ?? false,
      streakDays: d.streakDays ?? 0,
      bestStreak: d.bestStreak ?? 0,
      monthlyStreakDays: d.monthlyStreakDays ?? 0,
      bestMonthlyStreak: d.bestMonthlyStreak ?? 0,
      xp: d.xp ?? 0,
      coins: d.coins ?? 0,
      gems: d.gems ?? 0,
      crowns: d.crowns ?? 0,
      totalCorrectAnswers: d.totalCorrectAnswers ?? 0,
      totalWrongAnswers: d.totalWrongAnswers ?? 0,
      accuracyRate: d.accuracyRate ?? 0,
    };
  } catch (error) {
    console.error('[DailyChallenge] Error getting user stats:', error);
    return loadMockUser();
  }
}

// ---------------------------------------------------------------
// WRITES  (TODO: move to Cloud Function in production)
// ---------------------------------------------------------------

/**
 * Save a completed challenge record to user history.
 * ⚠️ TODO (Security): This MUST move to a Cloud Function to prevent
 * client-side manipulation of rewards.
 */
export async function saveChallengeResult(
  uid: string,
  result: UserDailyChallengeHistory
): Promise<void> {
  if (isMockMode()) {
    const key = `bible_crown_history_${uid}`;
    const raw = localStorage.getItem(key);
    const history: UserDailyChallengeHistory[] = raw ? JSON.parse(raw) : [];
    history.unshift(result);
    localStorage.setItem(key, JSON.stringify(history));
    return;
  }

  try {
    await addDoc(collection(db, `users/${uid}/daily_challenge_history`), result);
  } catch (error) {
    console.error('[DailyChallenge] Error saving history:', error);
  }
}

/**
 * Update user XP, coins, streak, and completion status.
 * ⚠️ TODO (Security): This MUST move to a Cloud Function in production.
 */
export async function updateUserRewardsAndStreak(
  uid: string,
  updates: Partial<UserChallengeData>
): Promise<void> {
  if (isMockMode() || !uid || !db) {
    const current = loadMockUser();
    saveMockUser({ ...current, ...updates });
    return;
  }

  try {
    await updateDoc(doc(db, "users", uid), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('[DailyChallenge] Error updating user profile:', error);
  }
}

// ---------------------------------------------------------------
// DEV / TEST UTILITIES
// ---------------------------------------------------------------

/**
 * [DEV ONLY] Reset daily challenge completion for the current user.
 * Allows repeated testing of the full flow.
 */
export async function resetDailyChallengeForTesting(uid: string): Promise<void> {
  console.warn('[DEV] Resetting daily challenge for user:', uid);

  if (isMockMode()) {
    const current = loadMockUser();
    saveMockUser({
      ...current,
      lastDailyChallengeDate: null,
      dailyChallengeCompleted: false,
    });
    return;
  }

  try {
    await updateDoc(doc(db, 'users', uid), {
      lastDailyChallengeDate: null,
      dailyChallengeCompleted: false,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('[DailyChallenge] Error resetting testing:', error);
  }
}

/** Simulate network latency in mock mode for realistic UX */
function simulateLatency(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Sync read for server-side rendering (returns default, no localStorage) */
export function getUserDailyChallengeDataSync(): UserChallengeData {
  return loadMockUser();
}

/** Get today's date key */
export { getTodayDateKey };
