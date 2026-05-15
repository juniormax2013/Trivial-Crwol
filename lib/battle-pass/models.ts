// ------------------------------------------------------------------
// BATTLE PASS / CAMINO DEL DISCÍPULO - DATA MODELS
// ------------------------------------------------------------------

export type BattlePassStatus = 'upcoming' | 'active' | 'completed' | 'archived';
export type MissionType = 'daily' | 'weekly' | 'seasonal';
export type RewardTrackType = 'free' | 'premium';
export type RewardItemType = 'crowns' | 'xp' | 'coins' | 'profile_frame' | 'badge' | 'title' | 'cosmetic' | 'boost';
export type MissionEventType = 
  | 'answer_question' 
  | 'win_duel' 
  | 'complete_daily_challenge' 
  | 'read_devotional' 
  | 'participate_tournament'
  | 'win_tournament'
  | 'login';

/** 
 * Collection: battle_pass_seasons
 */
export interface BattlePassSeasonModel {
  id: string;
  title: string;
  subtitle: string;
  theme: string;
  themeDescription: string;
  bibleReference: string;
  spiritualMeaning: string;
  coverImageUrl: string;
  startAt: string; // ISO Dates or timestamps
  endAt: string;
  status: BattlePassStatus;
  totalTiers: number;
  premiumEnabled: boolean;
  seasonXpLabel: string; // e.g. "Wisdom XP"
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface BattlePassReward {
  type: RewardItemType;
  amount: number;
  label: string;
  icon: string;
}

/** 
 * Collection: battle_pass_seasons/{seasonId}/tiers/{tierId}
 */
export interface BattlePassTierModel {
  tierNumber: number; 
  requiredSeasonXp: number;
  freeReward: BattlePassReward | null;
  premiumReward: BattlePassReward | null;
  isMilestone: boolean;
  title: string;
  subtitle: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Collection: battle_pass_seasons/{seasonId}/missions/{missionId}
 */
export interface BattlePassMissionModel {
  id: string;
  title: string;
  description: string;
  missionType: MissionType;
  eventType: MissionEventType;
  targetValue: number;
  rewardSeasonXp: number;
  startAt: string;
  endAt: string;
  status: 'active' | 'expired' | 'archived';
  order: number;
  isRepeatable: boolean;
  createdAt: string;
  updatedAt: string;
}

// ------------------------------------------------------------------
// USER TRACKING MODELS
// ------------------------------------------------------------------

/**
 * Collection: user_battle_pass_progress
 */
export interface UserBattlePassProgressModel {
  id: string; // {uid}_{seasonId}
  userId: string;
  seasonId: string;
  seasonXp: number;
  currentTier: number;
  premiumOwned: boolean;
  premiumPurchasedAt: string | null;
  lastProgressAt: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'completed' | 'archived';
}

/**
 * Subcollection: user_battle_pass_progress/{id}/missions/{missionId}
 */
export interface UserBattlePassMissionProgressModel {
  missionId: string;
  progress: number;
  targetValue: number;
  isCompleted: boolean;
  isClaimed: boolean;
  completedAt: string | null;
  claimedAt: string | null;
  lastUpdatedAt: string;
}

/**
 * Collection: user_battle_pass_claims
 */
export interface UserBattlePassClaimModel {
  id: string; // {uid}_{seasonId}_{tierNumber}_{track}
  userId: string;
  seasonId: string;
  tierNumber: number;
  track: RewardTrackType;
  reward: BattlePassReward;
  claimedAt: string;
  grantedBy: string; // server or client (dev)
}
