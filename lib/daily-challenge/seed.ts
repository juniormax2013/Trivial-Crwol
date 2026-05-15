// ---------------------------------------------------------------
// DAILY CHALLENGE — SEED / MOCK DATA
// ---------------------------------------------------------------
// Used for development, demo mode, and testing when Firebase
// is not configured. Also used by the seed utility.

import { DailyChallengeModel, QuestionModel } from './models';

/** Returns today's date as "YYYY-MM-DD" */
export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

import { ALL_DUEL_QUESTIONS } from '../duel/seed';

export const MOCK_QUESTIONS: QuestionModel[] = ALL_DUEL_QUESTIONS.map(q => ({
  ...q,
  questionType: 'multiple_choice',
  status: 'active'
} as unknown as QuestionModel));

function getDailySeed(): number {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function getSeededRandom(seed: number) {
  return function() {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
}

/** Returns the mock Daily Challenge for today */
export function getMockDailyChallenge(language: string = 'es'): DailyChallengeModel {
  const dateKey = getTodayDateKey();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const rng = getSeededRandom(getDailySeed());
  // Filter the pool of mock questions by the given language
  const pool = MOCK_QUESTIONS.filter(q => q.language === language);
  
  // Custom shuffle function using the seeded random
  const shuffleArray = (array: QuestionModel[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Group by difficulty
  const easyQuestions = pool.filter(q => q.difficulty === 'easy');
  const mediumQuestions = pool.filter(q => q.difficulty === 'medium');
  const hardQuestions = pool.filter(q => q.difficulty === 'hard');

  // Shuffle each group
  shuffleArray(easyQuestions);
  shuffleArray(mediumQuestions);
  shuffleArray(hardQuestions);

  // Pick progressively harder questions (3 easy, 2 medium, 2 hard)
  // Fallback to pool if there aren't enough questions in the filtered arrays
  const dailyQuestions = [
    ...easyQuestions.slice(0, 3),
    ...mediumQuestions.slice(0, 2),
    ...hardQuestions.slice(0, 2),
  ];

  return {
    id: `dc-${dateKey}-${language}`,
    dateKey: dateKey,
    title: '',
    description: '',
    language: language,
    difficulty: 'medium',
    questionIds: dailyQuestions.map(q => q.id),
    reward: {
      xp: 70,       // Max XP (10 per question * 7)
      coins: 70,    // Max Coins (10 per question if excellent precision)
      gems: 0,
      crowns: 0,
    },
    status: 'active',
    startsAt: startOfDay,
    endsAt: endOfDay,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
