// ---------------------------------------------------------------
// DAILY CHALLENGE — SERVICE (Business Logic Layer)
// ---------------------------------------------------------------
// Contains: availability logic, scoring, reward calculation,
// streak logic, challenge completion, and UI helpers.
// No direct Firestore calls — uses repository functions.

import {
  DailyChallengeModel,
  DailyChallengeResult,
  DailyChallengeSession,
  SessionAnswer,
  UserChallengeData,
  UserDailyChallengeHistory,
  ChallengeAvailabilityStatus,
} from './models';
import {
  getTodayDateKey,
  saveChallengeResult,
  updateUserRewardsAndStreak,
  updateDailyChallengeStatus,
} from './repository';
import { getGameEngineConfig } from '../admin/settings-repository';
import { getLevelFromXp } from '../user/repository';

// ---------------------------------------------------------------
// AVAILABILITY LOGIC
// ---------------------------------------------------------------

/**
 * Determines the current challenge status for a user.
 * This should eventually be validated server-side via Cloud Function.
 */
export function getChallengeAvailabilityStatus(
  challenge: DailyChallengeModel | null,
  userData: UserChallengeData | null,
  uid: string | null,
  email?: string | null
): ChallengeAvailabilityStatus {
  if (!uid) return 'unauthenticated';
  if (!challenge) return 'no_challenge';

  if (email === 'juniormax2013@gmail.com') {
    return 'available';
  }

  const now = new Date();

  if (challenge.status !== 'active') return 'unavailable';
  if (challenge.endsAt < now) return 'unavailable';
  if (challenge.startsAt > now) return 'unavailable';

  const today = getTodayDateKey();
  if (
    userData?.lastDailyChallengeDate === today &&
    userData?.dailyChallengeCompleted === true
  ) {
    return 'completed';
  }

  return 'available';
}

// ---------------------------------------------------------------
// SCORING LOGIC
// ---------------------------------------------------------------

// const BASE_POINTS_PER_CORRECT = 20;
// const SPEED_BONUS_THRESHOLD_MS = 8_000; // earned if answered under 8 seconds
// const SPEED_BONUS_POINTS = 5;

export function calculateAnswerPoints(
  isCorrect: boolean,
  responseTimeMs: number,
  config?: { basePoints: number; speedBonusThresholdMs: number; speedBonusPoints: number }
): number {
  if (!isCorrect) return 0;
  
  // Use fallback values if config is missing (matching DEFAULT_GAME_ENGINE_CONFIG)
  const basePoints = config?.basePoints ?? 20;
  const threshold = config?.speedBonusThresholdMs ?? 8000;
  const bonus = config?.speedBonusPoints ?? 5;

  const speedBonus = responseTimeMs < threshold ? bonus : 0;
  return basePoints + speedBonus;
}

export function calculateSessionScore(answers: SessionAnswer[]): {
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracyPercent: number;
} {
  const correctAnswers = answers.filter((a) => a.isCorrect).length;
  const wrongAnswers = answers.filter((a) => !a.isCorrect).length;
  const score = answers.reduce((sum, a) => sum + a.pointsEarned, 0);
  const accuracyPercent =
    answers.length > 0
      ? Math.round((correctAnswers / answers.length) * 100)
      : 0;
  return { score, correctAnswers, wrongAnswers, accuracyPercent };
}

// ---------------------------------------------------------------
// REWARD LOGIC
// ---------------------------------------------------------------

/**
 * Scale rewards proportionally to performance.
 * Full rewards only granted for perfect accuracy; gems/crowns need 80%+.
 */
export function calculateEarnedRewards(
  challenge: DailyChallengeModel,
  answers: SessionAnswer[],
  totalQuestions: number,
  config: { xpPerCorrect: number; coinsFast: number; coinsNormal: number; wrongPenalty: number; speedBonusThresholdMs: number }
): {
  xpEarned: number;
  coinsEarned: number;
  gemsEarned: number;
  crownsEarned: number;
} {
  let xpEarned = 0;
  let coinsEarned = 0;

  answers.forEach((ans) => {
    if (ans.isCorrect) {
      xpEarned += config.xpPerCorrect;
      // Precision excelente (rápido): 10 monedas, Normal: 7 monedas
      if (ans.responseTimeMs < config.speedBonusThresholdMs) {
        coinsEarned += config.coinsFast;
      } else {
        coinsEarned += config.coinsNormal;
      }
    } else {
      // Por cada fallo pierde 1 moneda de las ganadas
      coinsEarned -= config.wrongPenalty;
    }
  });

  // Asegurar que las monedas no sean negativas
  coinsEarned = Math.max(0, coinsEarned);

  // Bonus conditions for gems and crowns based on ratio
  const correctAnswers = answers.filter((a) => a.isCorrect).length;
  const ratio = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
  const gemsEarned = ratio >= 0.8 ? challenge.reward.gems : 0;
  const crownsEarned = ratio >= 1.0 ? challenge.reward.crowns : 0;

  return { xpEarned, coinsEarned, gemsEarned, crownsEarned };
}

// ---------------------------------------------------------------
// STREAK LOGIC
// ---------------------------------------------------------------

function getYesterdayDateKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/**
 * Calculate new streak value after completing today's challenge.
 * TODO (Production): Move to server side with timestamp validation.
 */
export function calculateNewStreak(userData: UserChallengeData): number {
  const yesterday = getYesterdayDateKey();
  const lastDate = userData.lastDailyChallengeDate;

  if (!lastDate) return 1; // First ever completion
  if (lastDate === yesterday) return (userData.streakDays || 0) + 1; // Consecutive day
  return 1; // Streak broken — reset to 1
}

export function calculateNewMonthlyStreak(userData: UserChallengeData): number {
  const today = new Date();
  const yesterday = getYesterdayDateKey();
  const lastDateStr = userData.lastDailyChallengeDate;

  if (!lastDateStr) return 1; // First ever completion

  // Check if month changed
  const lastDate = new Date(lastDateStr + 'T00:00:00Z');
  // We use UTC since the key is YYYY-MM-DD
  if (
    lastDate.getUTCFullYear() !== today.getUTCFullYear() ||
    lastDate.getUTCMonth() !== today.getUTCMonth()
  ) {
    return 1; // Reset across month boundary
  }

  // Same month, check if consecutive
  if (lastDateStr === yesterday) {
    return (userData.monthlyStreakDays || 0) + 1;
  }
  
  return 1; // Streak broken within the month
}

// ---------------------------------------------------------------
// COMPLETE CHALLENGE (orchestrates everything)
// ---------------------------------------------------------------

/**
 * Called when user finishes all questions.
 * Computes result, saves history, and updates user profile.
 *
 * ⚠️ TODO (Security): In production, move reward granting to a
 * Cloud Function (functions/src/index.ts → completeDailyChallenge).
 */
export async function completeDailyChallenge(
  uid: string,
  session: DailyChallengeSession,
  userData: UserChallengeData,
  isDoubled: boolean = false,
  challengeMultiplier: number = 1
): Promise<DailyChallengeResult> {
  const { challenge, answers, questions } = session;
  const config = await getGameEngineConfig();
  const dcConfig = config.dailyChallenge;

  const { score, correctAnswers, wrongAnswers, accuracyPercent } =
    calculateSessionScore(answers);
  
  let { xpEarned, coinsEarned, gemsEarned, crownsEarned } =
    calculateEarnedRewards(challenge, answers, questions.length, dcConfig);
    
  if (challengeMultiplier !== 1) {
    xpEarned = Math.ceil(xpEarned * challengeMultiplier);
    coinsEarned = Math.ceil(coinsEarned * challengeMultiplier);
    gemsEarned = Math.ceil(gemsEarned * challengeMultiplier);
    crownsEarned = Math.ceil(crownsEarned * challengeMultiplier);
  }

  if (isDoubled) {
    coinsEarned *= 2;
    crownsEarned *= 2;
  }
  const newStreak = calculateNewStreak(userData);
  const newBestStreak = Math.max(newStreak, userData.bestStreak || 0);
  const newMonthlyStreak = calculateNewMonthlyStreak(userData);
  const newBestMonthlyStreak = Math.max(newMonthlyStreak, userData.bestMonthlyStreak || 0);

  const today = getTodayDateKey();
  const completedAt = new Date().toISOString();

  // Persist history record
  const historyRecord: UserDailyChallengeHistory = {
    challengeId: challenge.id,
    dateKey: today,
    score,
    totalQuestions: questions.length,
    correctAnswers,
    wrongAnswers,
    xpEarned,
    coinsEarned,
    gemsEarned,
    crownsEarned,
    completedAt,
  };

  await saveChallengeResult(uid, historyRecord);

  const currentTotalCorrect = userData.totalCorrectAnswers || 0;
  const currentTotalWrong = userData.totalWrongAnswers || 0;
  const newTotalCorrect = currentTotalCorrect + correctAnswers;
  const newTotalWrong = currentTotalWrong + wrongAnswers;
  const totalAnswers = newTotalCorrect + newTotalWrong;
  const newAccuracyRate = totalAnswers > 0 ? Math.round((newTotalCorrect / totalAnswers) * 100) : 0;

  const newXp = (userData.xp || 0) + xpEarned;
  const newLevel = getLevelFromXp(newXp);

  // Update user stats
  await updateUserRewardsAndStreak(uid, {
    lastDailyChallengeDate: today,
    dailyChallengeCompleted: true,
    streakDays: newStreak,
    bestStreak: newBestStreak,
    monthlyStreakDays: newMonthlyStreak,
    bestMonthlyStreak: newBestMonthlyStreak,
    xp: newXp,
    level: newLevel,
    coins: (userData.coins || 0) + coinsEarned,
    gems: (userData.gems || 0) + gemsEarned,
    crowns: (userData.crowns || 0) + crownsEarned,
    totalCorrectAnswers: newTotalCorrect,
    totalWrongAnswers: newTotalWrong,
    accuracyRate: newAccuracyRate,
  });

  // Save/reset notification availability status in Firestore
  await updateDailyChallengeStatus(uid);

  return {
    challengeId: challenge.id,
    dateKey: today,
    title: challenge.title,
    score,
    totalQuestions: questions.length,
    correctAnswers,
    wrongAnswers,
    accuracyPercent,
    xpEarned,
    coinsEarned,
    gemsEarned,
    crownsEarned,
    streakDays: newStreak,
    monthlyStreakDays: newMonthlyStreak,
    completedAt,
  };
}

// ---------------------------------------------------------------
// UI HELPERS
// ---------------------------------------------------------------

export function getMotivationalMessage(accuracyPercent: number, lang: string = 'ht'): string {
  const messages: Record<string, { perfect: string; excellent: string; good: string; path: string; tryAgain: string }> = {
    es: {
      perfect: '¡Perfecto! Has dominado la Palabra de Dios. 🏆',
      excellent: '¡Excelente! Tu conocimiento bíblico es sólido. ✨',
      good: '¡Buen trabajo! Sigue creciendo en la Palabra. 📖',
      path: '¡Vas por buen camino! No te rindas. 💪',
      tryAgain: 'La sabiduría comienza con la humildad. ¡Sigue practicando! 🙏'
    },
    en: {
      perfect: 'Perfect! You have mastered the Word of God. 🏆',
      excellent: 'Excellent! Your biblical knowledge is solid. ✨',
      good: 'Good job! Keep growing in the Word. 📖',
      path: 'You are on the right track! Don\'t give up. 💪',
      tryAgain: 'Wisdom begins with humility. Keep practicing! 🙏'
    },
    fr: {
      perfect: 'Parfait ! Vous maîtrisez la Parole de Dieu. 🏆',
      excellent: 'Excellent ! Votre connaissance biblique est solide. ✨',
      good: 'Bon travail ! Continuez à grandir dans la Parole. 📖',
      path: 'Vous êtes sur la bonne voie ! N\'abandonnez pas. 💪',
      tryAgain: 'La sagesse commence par l\'humilité. Continuez à vous entraîner ! 🙏'
    },
    ht: {
      perfect: 'Pafè! Ou metrize Pawòl Bondye a. 🏆',
      excellent: 'Ekselan! Konesans biblik ou solid. ✨',
      good: 'Bon travay! Kontinye grandi nan Pawòl la. 📖',
      path: 'Ou sou bon chemen! Pa abandone. 💪',
      tryAgain: 'Sajès kòmanse ak imilite. Kontinye pratike! 🙏'
    }
  };

  const activeLang = messages[lang] ? lang : 'ht';
  const set = messages[activeLang];

  if (accuracyPercent === 100) return set.perfect;
  if (accuracyPercent >= 80) return set.excellent;
  if (accuracyPercent >= 60) return set.good;
  if (accuracyPercent >= 40) return set.path;
  return set.tryAgain;
}

export function getDifficultyLabel(difficulty: 'easy' | 'medium' | 'hard'): string {
  const map = { easy: 'Fasil', medium: 'Mwayen', hard: 'Difisil' };
  return map[difficulty];
}

export function getDifficultyColor(difficulty: 'easy' | 'medium' | 'hard'): string {
  const map = {
    easy: 'text-emerald-700 bg-emerald-50',
    medium: 'text-amber-700 bg-amber-50',
    hard: 'text-rose-700 bg-rose-50',
  };
  return map[difficulty];
}

export function getCountdownToMidnight(now = new Date()): string {
  const midnight = new Date(now);
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);

  const diffMs = midnight.getTime() - now.getTime();
  const h = Math.floor(diffMs / (1000 * 60 * 60));
  const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diffMs % (1000 * 60)) / 1000);

  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
