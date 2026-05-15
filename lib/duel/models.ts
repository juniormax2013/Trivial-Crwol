// ---------------------------------------------------------------
// DUEL MODULE — TYPE MODELS
// ---------------------------------------------------------------
// All TypeScript interfaces for the Duel system.
// No side effects — pure types only.

// ─── Core enums / unions ────────────────────────────────────────

export type DuelStatus =
  | 'pending'        // waiting for opponent to accept
  | 'active'         // opponent accepted, in progress
  | 'waiting_turn'   // current player completed their turn, waiting for opponent
  | 'completed'      // all rounds done
  | 'expired'        // challenger didn't respond in time
  | 'declined'       // opponent declined
  | 'cancelled';     // creator cancelled

export type DuelType = 'friend' | 'random' | 'invite';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type RoundStatus = 'pending' | 'active' | 'completed';

// ─── Question (shared with daily-challenge format) ───────────────

export interface DuelQuestionOption {
  id: string;
  text: string;
}

export interface DuelQuestion {
  id: string;
  questionText: string;
  categoryId: string;
  categoryName: string;
  difficulty: Difficulty;
  language: string;
  options: DuelQuestionOption[];
  correctOptionId: string;
  explanation: string;
  bibleReference: string;
}

// ─── Answer ─────────────────────────────────────────────────────

export interface DuelAnswer {
  questionId: string;
  selectedOptionId: string | null; // null = timed out
  correctOptionId: string;
  isCorrect: boolean;
  responseTimeMs: number;
  pointsEarned: number;
}

// ─── Round ──────────────────────────────────────────────────────

export interface DuelRound {
  id: string;
  roundNumber: number;
  categoryId: string;
  categoryName: string;
  questionIds: string[];
  /** Answers per user: { [uid]: DuelAnswer[] } */
  playerAnswers: Record<string, DuelAnswer[]>;
  /** Scores per user for this specific round: { [uid]: number } */
  playerScores: Record<string, number>;
  /** List of UIDs who have finished this round */
  playersCompleted: string[];
  status: RoundStatus;
  startedAt: string;
  completedAt?: string;
  /** true when this is an extra tiebreaker round (sudden death) */
  isTiebreakerRound?: boolean;
}

// ─── Reward Config ───────────────────────────────────────────────

export interface DuelRewardConfig {
  xp: number;
  coins: number;
  crowns: number;
}

// ─── Opponent Profile ────────────────────────────────────────────

export interface DuelOpponent {
  uid: string;
  name: string;
  avatarUrl: string;
  level: number;
  crowns: number;
}

// ─── Participant ────────────────────────────────────────────────

export interface DuelParticipant {
  uid: string;
  name: string;
  avatarUrl: string;
  score: number;
  correctAnswers: number;
  status: 'pending' | 'accepted' | 'declined';
  completed: boolean;
}

// ─── Main Duel Document ──────────────────────────────────────────

export interface DuelModel {
  id: string;
  /** The creator of the duel */
  createdBy: string;
  /** Participant data including creator and all guests */
  participants: Record<string, DuelParticipant>;
  /** Order of UIDs for display purposes */
  participantIds: string[];
  status: DuelStatus;
  /** UIDs of winners. Multiple for ties. */
  winnerIds: string[];
  /** UIDs of losers. */
  loserIds: string[];
  isTie: boolean;
  /** Round number of the current active tiebreaker, undefined when no tie yet */
  tiebreakerRoundNumber?: number;
  language: string;
  difficulty: Difficulty;
  selectedCategories: string[];
  totalRounds: number;
  currentRound: number;        // 1-indexed
  /** UID of the player whose turn it is now */
  currentTurnUid?: string;
  rewardConfig: DuelRewardConfig;
  turnTimeLimitSeconds: number;
  duelType: DuelType;
  createdAt: string;           // ISO string
  updatedAt: string;
  acceptedAt?: string;
  startedAt?: string;
  endedAt?: string;
  expiresAt: string;
  lastActionAt: string;
}

// ─── Result (for result screen + history) ───────────────────────

export interface DuelResult {
  duelId: string;
  opponentName: string;
  opponentAvatar: string;
  outcome: 'win' | 'loss' | 'tie';
  finalScore: { mine: number; theirs: number };
  correctAnswers: { mine: number; theirs: number };
  roundsDetail: Array<{
    roundNumber: number;
    categoryName: string;
    myScore: number;
    theirScore: number;
  }>;
  xpEarned: number;
  crownsEarned: number;
  coinsEarned: number;
  completedAt: string;
}

// ─── UI state helpers ────────────────────────────────────────────

/** Derived view-state for a duel from the current user's perspective */
export interface DuelViewState {
  duel: DuelModel;
  myId: string;
  myName: string;
  myAvatar: string;
  opponentId: string;
  opponentName: string;
  opponentAvatar: string;
  myScore: number;
  theirScore: number;
  isMyTurn: boolean;
  isCreatedByMe: boolean;
  /** 'play' | 'wait' | 'accept' | 'view' | 'ended' */
  ctaType: 'play' | 'wait' | 'accept' | 'view' | 'ended';
}

// ─── Notification ────────────────────────────────────────────────

export interface DuelNotification {
  id: string;
  title: string;
  body: string;
  type: 'challenge_received' | 'challenge_accepted' | 'challenge_declined' | 'your_turn' | 'duel_completed' | 'reward_granted';
  relatedId: string;          // duelId
  isRead: boolean;
  createdAt: string;
}
