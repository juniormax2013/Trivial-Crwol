import { db } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { 
  BattlePassSeasonModel, 
  BattlePassTierModel, 
  BattlePassMissionModel,
  UserBattlePassProgressModel,
  UserBattlePassMissionProgressModel,
  UserBattlePassClaimModel
} from './models';

// ------------------------------------------------------------------
// REPOSITORY: BATTLE PASS
// Handles all direct Firestore communications for the Battle Pass
// ------------------------------------------------------------------

/**
 * Fetch the active Battle Pass season
 */
export async function getActiveSeason(): Promise<BattlePassSeasonModel | null> {
  // Ideally, query by status == 'active'. For now, we take the first active one.
  const q = query(
    collection(db, 'battle_pass_seasons'),
    where('status', '==', 'active')
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as BattlePassSeasonModel;
}

/**
 * Fetch all tiers for a specific season
 */
export async function getSeasonTiers(seasonId: string): Promise<BattlePassTierModel[]> {
  const q = query(
    collection(db, `battle_pass_seasons/${seasonId}/tiers`),
    orderBy('tierNumber', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as BattlePassTierModel);
}

/**
 * Fetch all missions for a specific season
 */
export async function getSeasonMissions(seasonId: string): Promise<BattlePassMissionModel[]> {
  const q = query(
    collection(db, `battle_pass_seasons/${seasonId}/missions`),
    where('status', '==', 'active'),
    orderBy('order', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as BattlePassMissionModel);
}

// ------------------------------------------------------------------
// USER PROGRESS REPOSITORY
// ------------------------------------------------------------------

/**
 * Get or initialize user progress for a season
 */
export async function getUserProgress(userId: string, seasonId: string): Promise<UserBattlePassProgressModel> {
  const progressId = `${userId}_${seasonId}`;
  const ref = doc(db, 'user_battle_pass_progress', progressId);
  const snap = await getDoc(ref);
  
  if (snap.exists()) {
    return snap.data() as UserBattlePassProgressModel;
  }
  
  // Initialize progress
  const initialData: UserBattlePassProgressModel = {
    id: progressId,
    userId,
    seasonId,
    seasonXp: 0,
    currentTier: 1,
    premiumOwned: false,
    premiumPurchasedAt: null,
    lastProgressAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'active'
  };
  
  await setDoc(ref, initialData);
  return initialData;
}

/**
 * Set user progress (used inside service layer)
 */
export async function updateUserProgress(progressId: string, data: Partial<UserBattlePassProgressModel>) {
  const ref = doc(db, 'user_battle_pass_progress', progressId);
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date().toISOString()
  });
}

/**
 * Get the mission progress for a specific user and mission
 */
export async function getUserMissionProgress(
  userId: string, 
  seasonId: string, 
  missionId: string
): Promise<UserBattlePassMissionProgressModel | null> {
  const ref = doc(db, `user_battle_pass_progress/${userId}_${seasonId}/missions`, missionId);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as UserBattlePassMissionProgressModel;
  return null;
}

/**
 * Save mission progress
 */
export async function setUserMissionProgress(
  userId: string, 
  seasonId: string, 
  progress: UserBattlePassMissionProgressModel
) {
  const ref = doc(db, `user_battle_pass_progress/${userId}_${seasonId}/missions`, progress.missionId);
  await setDoc(ref, progress);
}

/**
 * Fetch all claimed rewards for a user and season
 */
export async function getUserClaims(userId: string, seasonId: string): Promise<UserBattlePassClaimModel[]> {
  const q = query(
    collection(db, 'user_battle_pass_claims'),
    where('userId', '==', userId),
    where('seasonId', '==', seasonId)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as UserBattlePassClaimModel);
}

/**
 * Register a claim
 */
export async function registerClaim(claim: UserBattlePassClaimModel) {
  const ref = doc(db, 'user_battle_pass_claims', claim.id);
  await setDoc(ref, claim);
}
