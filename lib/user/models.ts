import { ReferralStats } from './referralModels';

// ---------------------------------------------------------------
// USER MODULE — DATA MODELS
// ---------------------------------------------------------------

/**
 * USER ROLES
 */
export type UserRole = 
  | 'user' 
  | 'super_admin' 
  | 'editor' 
  | 'reviewer' 
  | 'moderator' 
  | 'support';

/**
 * USER STATUS
 */
export type UserStatus = 'active' | 'suspended' | 'blocked' | 'deleted';

/**
 * USER SETTINGS MODEL
 */
export interface UserSettingsModel {
  // General
  language: 'es' | 'en' | 'ht' | 'fr';
  
  // Notifications
  allowNotifications: boolean;
  pushNotifications: boolean;
  duelNotifications: boolean;
  dailyChallengeNotifications: boolean;
  tournamentNotifications: boolean;
  rewardNotifications: boolean;
  devotionalNotifications: boolean;
  
  // Privacy
  isProfilePublic: boolean;
  allowFriendRequests: boolean;
  showActivityStatus: boolean;
  showOnLeaderboards: boolean;
  allowChallengeInvites: boolean;
  
  // Experience
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  answerFeedbackSound: boolean;
  menuSoundEffects: boolean;
  hapticsEnabled: boolean;
}

/**
 * APP USER MODEL (Stored in users/{uid})
 */
export interface AppUserModel {
  // Auth Identity
  uid: string;
  email: string | null;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  photoURL: string | null;
  provider: string; // 'password', 'google.com', 'apple.com'
  
  // Profile info
  bio: string;
  favoriteVerse: string;
  favoriteCategoryId: string;
  country: string;
  
  // Roles & Security
  role: UserRole;
  status: UserStatus;
  
  // Game Stats (CORE)
  level: number;
  xp: number;
  coins: number;
  gems: number;
  crowns: number;
  
  // Detailed Stats
  streakDays: number;
  bestStreak: number;
  totalGames: number;
  totalWins: number;
  totalLosses: number;
  totalCorrectAnswers: number;
  totalWrongAnswers: number;
  accuracyRate: number; // 0-100
  
  // Timestamps
  lastLoginAt: string;
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
  isOnline?: boolean;
  
  // Jwe Bib la Mode (Haitian Creole)
  jweEnergy: number;
  jweHearts: number;
  lastJweResetDate: string;
  
  // Store & Inventory
  inventory: Record<string, number>;
  ownedFrames: string[];
  ownedAvatars: string[];
  activeFrame: string | null;
  activeAvatar: string | null;
  
  // Settings (Nested for easy access)
  settings: UserSettingsModel;
  
  // Custom access overrides by Admin
  customAccess?: {
    allies?: boolean;
    dailyChallenge?: boolean;
    bibleJourney?: boolean;
    sacredChallenge?: boolean;
    crownArena?: boolean;
    duelArena?: boolean;
  };
  
  // Optional Ranking info
  ranking?: number;

  // Referral System
  referralCode?: string;
  referredBy?: string;
  firstGameCompleted?: boolean;
  referralStats?: ReferralStats;

  // Clan System
  clanId?: string;
  clanRole?: 'founder' | 'admin' | 'moderator' | 'member';
}

/**
 * DEFAULT VALUES FOR NEW USERS
 */
export const DEFAULT_USER_SETTINGS: UserSettingsModel = {
  language: 'es',
  allowNotifications: true,
  pushNotifications: true,
  duelNotifications: true,
  dailyChallengeNotifications: true,
  tournamentNotifications: true,
  rewardNotifications: true,
  devotionalNotifications: false,
  isProfilePublic: true,
  allowFriendRequests: true,
  showActivityStatus: true,
  showOnLeaderboards: true,
  allowChallengeInvites: true,
  soundEnabled: true,
  vibrationEnabled: true,
  answerFeedbackSound: true,
  menuSoundEffects: true,
  hapticsEnabled: true,
};

export const INITIAL_USER_STATS = {
  level: 1,
  xp: 0,
  coins: 0,
  gems: 0,
  crowns: 0,
  streakDays: 0,
  bestStreak: 0,
  totalGames: 0,
  totalWins: 0,
  totalLosses: 0,
  totalCorrectAnswers: 0,
  totalWrongAnswers: 0,
  accuracyRate: 0,
  jweEnergy: 28,
  jweHearts: 5,
  lastJweResetDate: new Date().toISOString().split('T')[0],
  inventory: {},
  ownedFrames: [],
  ownedAvatars: [],
  activeFrame: null,
  activeAvatar: null,
  referralStats: {
    registeredCount: 0,
    qualifiedCount: 0,
    claimedLevels: [],
  },
};

