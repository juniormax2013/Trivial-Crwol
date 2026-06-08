// ---------------------------------------------------------------
// CROWN ARENA MODULE — TYPE MODELS
// ---------------------------------------------------------------

export type ArenaStatus = 'waiting' | 'starting' | 'playing' | 'finished';
export type ArenaMode = 'friends' | 'random';
export type PlayerStatus = 'invited' | 'accepted' | 'ready' | 'playing' | 'left';

export interface ArenaPlayer {
  id: string;
  userId: string;
  name: string;
  avatarUrl: string | null;
  status: PlayerStatus;
  score: number;
  correctAnswersCount: number;
  streak: number;
  totalResponseTime: number; // ms
  lastAnswerCorrect: boolean;
  joinedAt: string;
  currentQuestion?: number;
  isFinished?: boolean;
  rank?: number;
  rewards?: {
    coins: number;
    xp: number;
    crowns: number;
  };
}

export interface ArenaAnswer {
  userId: string;
  questionId: string;
  selectedOptionId: string | null;
  isCorrect: boolean;
  responseTimeMs: number;
  pointsEarned: number;
  answeredAt: string;
}

export interface ArenaSession {
  id: string;
  hostId: string; // Updated from hostUserId to match usage
  hostUserId?: string; // Keep as optional for backward compatibility
  mode: ArenaMode;
  status: ArenaStatus;
  maxPlayers: number;
  currentPlayersCount: number;
  currentQuestionIndex: number; // -1: lobby, 0-19: playing
  questionIds: string[];
  categoryIds: string[];
  categoryId?: string; // Added for single-category usage
  categoryName: string;
  language: string; // 'es' | 'ht'
  
  // Timing
  startTime?: string;
  nextQuestionAt?: string; // ISO string for the end of the current question
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  finishedAt?: string;
}

export interface ArenaRankingEntry {
  userId: string;
  username: string;
  photoURL: string | null;
  rank: number;
  score: number;
  correctAnswers: number;
  totalTime: number;
  rewards: {
    coins: number;
    xp: number;
    crowns: number;
  };
}

export interface ArenaInvitation {
  id: string;
  arenaId: string;
  hostId: string;
  hostName: string;
  hostAvatar: string | null;
  receiverId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  gameMode?: 'crown_arena' | 'reto_sagrado';
}
