// ---------------------------------------------------------------
// DAILY CHALLENGE — TYPE MODELS
// ---------------------------------------------------------------
// This file defines all shared TypeScript interfaces for the
// Daily Challenge module. It has no side effects.

export interface QuestionOption {
  id: string;
  text: string;
}

export interface QuestionModel {
  id: string;
  questionText: string;
  questionType: 'multiple_choice';
  categoryId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
  bibleReference: string;
  status: 'active' | 'draft' | 'archived';
}

export interface DailyChallengeReward {
  xp: number;
  coins: number;
  gems: number;
  crowns: number;
  optionalRewardLabel?: string;
}

export interface DailyChallengeModel {
  id: string;
  dateKey: string; // format: "YYYY-MM-DD"
  title: string;
  description: string;
  language: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionIds: string[];
  reward: DailyChallengeReward;
  status: 'scheduled' | 'active' | 'completed' | 'archived';
  startsAt: Date;
  endsAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Status of the daily challenge for the current user
export type ChallengeAvailabilityStatus =
  | 'loading'
  | 'available'
  | 'completed'
  | 'unavailable'
  | 'no_challenge'
  | 'error'
  | 'unauthenticated';

// Per-question answer recorded during a session
export interface SessionAnswer {
  questionId: string;
  selectedOptionId: string | null; // null = timed out
  correctOptionId: string;
  isCorrect: boolean;
  responseTimeMs: number;
  pointsEarned: number;
}

// In-memory gameplay session
export interface DailyChallengeSession {
  challenge: DailyChallengeModel;
  questions: QuestionModel[];
  currentQuestionIndex: number;
  answers: SessionAnswer[];
  startedAt: Date;
  status: 'playing' | 'completed';
}

// Final result (serializable for sessionStorage / Firestore)
export interface DailyChallengeResult {
  challengeId: string;
  dateKey: string;
  title: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracyPercent: number;
  xpEarned: number;
  coinsEarned: number;
  gemsEarned: number;
  crownsEarned: number;
  streakDays: number;
  monthlyStreakDays?: number; // Add monthly streak
  completedAt: string; // ISO string
}

// History record stored per user
export interface UserDailyChallengeHistory {
  challengeId: string;
  dateKey: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  xpEarned: number;
  coinsEarned: number;
  gemsEarned: number;
  crownsEarned: number;
  completedAt: string;
}

// Subset of user document fields used by this module
export interface UserChallengeData {
  lastDailyChallengeDate: string | null; // "YYYY-MM-DD" or null
  dailyChallengeCompleted: boolean;
  streakDays: number;
  bestStreak: number;
  monthlyStreakDays?: number;
  bestMonthlyStreak?: number;
  xp: number;
  coins: number;
  gems: number;
  crowns: number;
  totalCorrectAnswers?: number;
  totalWrongAnswers?: number;
  accuracyRate?: number;
}
