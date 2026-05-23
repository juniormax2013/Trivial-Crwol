import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, Transaction } from 'firebase/firestore';

export interface DifficultySetting {
  timeLimit: number;
  questionsPerRound: number;
  rewards: {
    xp: number;
    coins: number;
    crowns: number;
  };
}

export interface GameEngineConfig {
  duels: {
    difficultySettings: {
      easy: DifficultySetting;
      medium: DifficultySetting;
      hard: DifficultySetting;
    };
    defaultRounds: number;
  };
  dailyChallenge: {
    basePoints: number;
    speedBonusThresholdMs: number;
    speedBonusPoints: number;
    xpPerCorrect: number;
    coinsFast: number;
    coinsNormal: number;
    wrongPenalty: number;
  };
  pwa?: {
    showInstallPrompt: boolean;
  };
  devilTrap?: {
    spawnProbability: number;
    observerModeEnabled?: boolean;
    observerModeAppearanceChance?: number;
    observerModeCanReactToPlayer?: boolean;
    observerModeCanLeaveAfterGoodStreak?: boolean;
    observerModeGoodStreakToLeave?: number;
    powerModeWeight?: number;
    observerModeWeight?: number;
    correctAnswersToDefeat?: number;
    wrongAnswersToWin?: number;
  };
  specialChallenge?: {
    spawnProbability: number;
  };
  updatedAt: string;
}

const COLLECTION_NAME = 'settings';
const DOCUMENT_ID = 'game_engine';

export const DEFAULT_GAME_ENGINE_CONFIG: GameEngineConfig = {
  duels: {
    difficultySettings: {
      easy: {
        timeLimit: 30,
        questionsPerRound: 9,
        rewards: { xp: 50, coins: 20, crowns: 1 }
      },
      medium: {
        timeLimit: 20,
        questionsPerRound: 12,
        rewards: { xp: 100, coins: 50, crowns: 1 }
      },
      hard: {
        timeLimit: 15,
        questionsPerRound: 15,
        rewards: { xp: 200, coins: 100, crowns: 3 }
      }
    },
    defaultRounds: 3
  },
  dailyChallenge: {
    basePoints: 20,
    speedBonusThresholdMs: 8000,
    speedBonusPoints: 5,
    xpPerCorrect: 10,
    coinsFast: 10,
    coinsNormal: 7,
    wrongPenalty: 1
  },
  pwa: {
    showInstallPrompt: false,
  },
  devilTrap: {
    spawnProbability: 0.15,
    observerModeEnabled: true,
    observerModeAppearanceChance: 0.20,
    observerModeCanReactToPlayer: true,
    observerModeCanLeaveAfterGoodStreak: false,
    observerModeGoodStreakToLeave: 5,
    powerModeWeight: 50,
    observerModeWeight: 50,
    correctAnswersToDefeat: 2,
    wrongAnswersToWin: 3,
  },
  specialChallenge: {
    spawnProbability: 0.50,
  },
  updatedAt: new Date().toISOString()
};

/**
 * GET GAME ENGINE CONFIG
 * Retrieves the current settings from Firestore or returns defaults.
 * Supports optional transaction for atomicity.
 */
export async function getGameEngineConfig(transaction?: Transaction): Promise<GameEngineConfig> {
  try {
    const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
    const snap = transaction ? await transaction.get(docRef) : await getDoc(docRef);
    
    if (snap.exists()) {
      return { ...DEFAULT_GAME_ENGINE_CONFIG, ...snap.data() } as GameEngineConfig;
    }
    
    // If it doesn't exist, we might want to initialize it or just return defaults
    return DEFAULT_GAME_ENGINE_CONFIG;
  } catch (err) {
    console.error("Error fetching game engine config:", err);
    return DEFAULT_GAME_ENGINE_CONFIG;
  }
}

/**
 * UPDATE GAME ENGINE CONFIG
 * Saves the new settings to Firestore.
 */
export async function updateGameEngineConfig(config: GameEngineConfig): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, DOCUMENT_ID);
  await setDoc(docRef, {
    ...config,
    updatedAt: new Date().toISOString()
  });
}

/**
 * RESET TO DEFAULTS
 * Restores the original hardcoded settings.
 */
export async function resetGameEngineConfig(): Promise<GameEngineConfig> {
  await updateGameEngineConfig(DEFAULT_GAME_ENGINE_CONFIG);
  return DEFAULT_GAME_ENGINE_CONFIG;
}
