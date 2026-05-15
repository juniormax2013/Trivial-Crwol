export type TournamentStatus = 'registration_open' | 'active' | 'completed';

export interface TournamentReward {
  crowns?: number;
  xp?: number;
  coins?: number;
  badge?: string;
}

export interface Tournament {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: TournamentStatus;
  rewardConfig: TournamentReward;
  maxParticipants: number;
  currentParticipants: number;
  currentRound?: number;
  registrationStartsAt?: Date;
  registrationEndsAt?: Date;
  startsAt?: Date;
  endsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TournamentParticipant {
  id: string; // user uid
  userId: string;
  displayName: string;
  avatarUrl: string;
  status: 'registered' | 'active' | 'disqualified' | 'completed';
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  averageResponseTimeMs: number;
  currentRank: number;
  matchesPlayed: number;
  wins?: number;
  losses?: number;
  ties?: number;
  rewardClaimed?: boolean;
}
