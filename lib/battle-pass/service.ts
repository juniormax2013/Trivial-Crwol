import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  getActiveSeason, 
  getSeasonMissions, 
  getSeasonTiers, 
  getUserClaims, 
  getUserMissionProgress, 
  getUserProgress, 
  registerClaim, 
  setUserMissionProgress, 
  updateUserProgress 
} from './repository';
import { 
  MissionEventType, 
  RewardTrackType, 
  UserBattlePassClaimModel 
} from './models';
import { AppUserModel } from '../user/models';

// ------------------------------------------------------------------
// BATTLE PASS SERVICE
// Core business logic engine for Battle Pass progression.
// 
// IMPORTANT - ANTI-CHEAT & BACKEND READINESS:
// These functions currently evaluate logic client-side and write to Firestore.
// For production, these logic blocks MUST be migrated to Firebase Cloud 
// Functions or Next.js Server Actions to securely grant XP, unlock tiers, 
// and write rewards without trusting the client.
// ------------------------------------------------------------------

/**
 * Triggers progress for missions matching a specific event.
 * E.g., evaluateMissionProgress('uid123', 'win_duel', 1)
 */
export async function evaluateMissionProgress(userId: string, event: MissionEventType, value: number = 1) {
  try {
    const season = await getActiveSeason();
    if (!season) return;

    const missions = await getSeasonMissions(season.id);
    // Find missions tracking this event
    const relevantMissions = missions.filter(m => m.eventType === event);

    let seasonXpToGrant = 0;

    for (const mission of relevantMissions) {
      const progress = await getUserMissionProgress(userId, season.id, mission.id);
      
      const currentVal = progress ? progress.progress : 0;
      if (progress?.isCompleted) {
        // If repeatable, maybe reset. For now, skip if completed.
        if (!mission.isRepeatable) continue;
      }
      
      const newVal = Math.min(currentVal + value, mission.targetValue);
      const isCompleted = newVal >= mission.targetValue;
      
      await setUserMissionProgress(userId, season.id, {
        missionId: mission.id,
        progress: newVal,
        targetValue: mission.targetValue,
        isCompleted: isCompleted,
        isClaimed: false, // Auto-claim or manual claim based on design
        completedAt: isCompleted ? new Date().toISOString() : null,
        claimedAt: null,
        lastUpdatedAt: new Date().toISOString()
      });

      // Simple Auto-Claim implementation for mission XP
      if (isCompleted && (!progress || !progress.isCompleted)) {
        seasonXpToGrant += mission.rewardSeasonXp;
      }
    }

    if (seasonXpToGrant > 0) {
      await grantSeasonXp(userId, season.id, seasonXpToGrant);
    }
  } catch (error) {
    console.error("Error evaluating mission progress:", error);
  }
}

/**
 * Grants Season XP to a user and calculates tier-ups.
 * SERVER VALIDATION REQUIRED: Client shouldn't pass arbitrary XP directly.
 */
export async function grantSeasonXp(userId: string, seasonId: string, amount: number) {
  try {
    const progress = await getUserProgress(userId, seasonId);
    const newXp = progress.seasonXp + amount;
    
    // Calculate new tier
    const tiers = await getSeasonTiers(seasonId);
    let newTier = 1;
    
    // Basic logic: highest tier whose requiredSeasonXp is <= newXp
    for (const tier of tiers) {
      if (newXp >= tier.requiredSeasonXp) {
        newTier = tier.tierNumber;
      } else {
        break; // Tiers should be ordered ASC
      }
    }

    await updateUserProgress(progress.id, {
      seasonXp: newXp,
      currentTier: newTier
    });

  } catch (error) {
    console.error("Error granting Season XP:", error);
  }
}

/**
 * Validates and claims a specific tier reward.
 * SERVER VALIDATION REQUIRED: Verify tier has been reached and track eligibility.
 */
export async function claimTierReward(
  userId: string, 
  seasonId: string, 
  tierNumber: number, 
  track: RewardTrackType
) {
  try {
    // 1. Fetch user progress to ensure tier is unlocked
    const progress = await getUserProgress(userId, seasonId);
    if (progress.currentTier < tierNumber) {
      throw new Error("Tier not unlocked yet.");
    }

    // 2. Premium validation
    if (track === 'premium' && !progress.premiumOwned) {
      throw new Error("Premium Pass required.");
    }

    // 3. Prevent double claim
    const claims = await getUserClaims(userId, seasonId);
    const existingClaim = claims.find(c => c.tierNumber === tierNumber && c.track === track);
    if (existingClaim) {
      throw new Error("Reward already claimed.");
    }

    // 4. Fetch reward logic
    const tiers = await getSeasonTiers(seasonId);
    const tier = tiers.find(t => t.tierNumber === tierNumber);
    if (!tier) throw new Error("Tier not found.");

    const reward = track === 'free' ? tier.freeReward : tier.premiumReward;
    if (!reward) throw new Error("No reward exists for this track at this tier.");

    // 5. Build Claim Object
    const claimId = `${userId}_${seasonId}_${tierNumber}_${track}`;
    const claimDoc: UserBattlePassClaimModel = {
      id: claimId,
      userId,
      seasonId,
      tierNumber,
      track,
      reward,
      claimedAt: new Date().toISOString(),
      grantedBy: 'client_service'
    };

    // 6. Register claim
    await registerClaim(claimDoc);

    // 7. Inject Reward into User DB 
    // -> NOTE: Emulating reward grant. In prod, update atoms directly.
    await grantRewardToUser(userId, reward.type, reward.amount);

    return reward;
  } catch (error) {
    console.error("Error claiming reward:", error);
    throw error;
  }
}

/**
 * Grants specific rewards directly to the User profile
 */
async function grantRewardToUser(userId: string, type: string, amount: number) {
  const userRef = doc(db, 'users', userId);
  
  if (type === 'crowns') {
    // Basic increment implementation placeholder
    // In production, use increment() helper: updateDoc(userRef, { crowns: increment(amount) })
  } else if (type === 'coins') {
    // Coins logic
  } else if (type === 'xp') {
    // Standard User XP logic
  }
  // Other cosmetics could be recorded in a user_cosmetics collection
}
