// ---------------------------------------------------------------
// USER MODULE — FIRESTORE REPOSITORY
// ---------------------------------------------------------------

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  Timestamp, 
  deleteDoc,
  serverTimestamp,
  increment,
  runTransaction,
  writeBatch
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { AppUserModel, DEFAULT_USER_SETTINGS, INITIAL_USER_STATS } from "./models";

const COLLECTION_NAME = "users";

/**
 * HELPER: MAP USER DOCUMENT TO FULL MODEL
 */
export function mapUserDoc(data: any): AppUserModel {
  return {
    ...INITIAL_USER_STATS,
    role: 'user',
    ...data,
    settings: {
      ...DEFAULT_USER_SETTINGS,
      ...(data.settings || {})
    }
  } as AppUserModel;
}

/**
 * FETCH USER BY UID
 */
export async function getUser(uid: string): Promise<AppUserModel | null> {
  try {
    const userDoc = await getDoc(doc(db, COLLECTION_NAME, uid));
    if (userDoc.exists()) {
      return mapUserDoc(userDoc.data());
    }
    return null;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
}

/**
 * CREATE NEW USER DOCUMENT
 */
export async function createUser(userData: Partial<AppUserModel> & { language?: string }): Promise<AppUserModel> {
  const { uid, email, username, photoURL, provider } = userData;
  
  if (!uid) throw new Error("Missing UID for user creation");

  const firstName = userData.firstName || "";
  const lastName = userData.lastName || "";
  const fullName = userData.fullName || `${firstName} ${lastName}`.trim() || "Noble Peregrino";

  const now = new Date().toISOString();

  // Resolve language from argument or localStorage fallback
  const resolvedLang = (userData.language as 'es' | 'en' | 'ht' | undefined)
    ?? DEFAULT_USER_SETTINGS.language;
  
  const newProfile: AppUserModel = {
    uid,
    email: email || null,
    username: username || `user_${uid.substring(0, 5)}`,
    firstName,
    lastName,
    fullName,
    photoURL: photoURL || null,
    provider: provider || "password",
    bio: "Empezando mi camino real en Bible Crown.",
    favoriteVerse: "Lámpara es a mis pies tu palabra, y lumbrera a mi camino.",
    favoriteCategoryId: "general",
    country: "Colombia", // Default
    role: 'user',
    status: 'active',
    ...INITIAL_USER_STATS,
    settings: { ...DEFAULT_USER_SETTINGS, language: resolvedLang },
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
  };

  try {
    await setDoc(doc(db, COLLECTION_NAME, uid), newProfile);
    return newProfile;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
}


/**
 * UPDATE USER FIELDS
 */
export async function updateUser(uid: string, data: Partial<AppUserModel>): Promise<void> {
  try {
    const userRef = doc(db, COLLECTION_NAME, uid);
    
    // Construct derived fullName if names are updated
    let updateData = { ...data };
    
    if (data.firstName !== undefined || data.lastName !== undefined) {
      // If we only have one part, we might need to fetch the existing one to be perfect,
      // but if both are provided (like in ProfileEdit), we just join them.
      // For now, let's just make sure fullName is updated if both are present in the update object.
      if (data.firstName !== undefined && data.lastName !== undefined) {
        updateData.fullName = `${data.firstName} ${data.lastName}`.trim();
      }
    }

    await updateDoc(userRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

/**
 * UPLOAD PROFILE PHOTO TO FIREBASE STORAGE
 */
export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  try {
    const storageRef = ref(storage, `avatars/${uid}_${Date.now()}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Update user profile with the new URL
    await updateUser(uid, { photoURL: downloadURL });
    
    return downloadURL;
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    throw error;
  }
}

/**
 * ADMIN: LIST ALL USERS
 */
export async function listAllUsers(pageSize: number = 20): Promise<AppUserModel[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME), 
      orderBy("createdAt", "desc"), 
      limit(pageSize)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => mapUserDoc(doc.data()));
  } catch (error) {
    console.error("Error listing users:", error);
    throw error;
  }
}

/**
 * ADMIN: SEARCH USERS
 */
export async function searchUsers(searchTerm: string): Promise<AppUserModel[]> {
  try {
    // Basic search on username / fullName is limited in Firestore without Algolia
    // For this app, we'll try to find by exact username match first
    const q = query(
      collection(db, COLLECTION_NAME),
      where("username", "==", searchTerm),
      limit(10)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => mapUserDoc(doc.data()));
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
}

/**
 * DELETE USER (Safe soft delete flag or hard delete)
 */
export async function deleteUser(uid: string, hardDelete: boolean = false): Promise<void> {
  try {
    if (hardDelete) {
      await deleteDoc(doc(db, COLLECTION_NAME, uid));
    } else {
      await updateUser(uid, { status: 'deleted' });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

/**
 * UPDATE USER STATS FOR GAME REWARDS
 * correctAnswers / totalQuestionsPlayed are optional; when provided,
 * the cumulative accuracyRate is recalculated and persisted.
 * Uses a transaction to ensure atomicity and prevent race conditions in calculations.
 */
export async function updateUserStats(
  uid: string,
  stats: {
    xp: number;
    coins: number;
    crowns: number;
    isWin?: boolean;
    isTie?: boolean;
    isLoss?: boolean;
    correctAnswers?: number;
    totalQuestionsPlayed?: number;
  }
): Promise<void> {
  try {
    const userRef = doc(db, COLLECTION_NAME, uid);

    await runTransaction(db, async (transaction) => {
      // 1. ALL READS FIRST
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) {
        throw new Error(`User document not found for uid: ${uid}`);
      }
      
      const userData = userSnap.data() as AppUserModel;

      // 2. LOGIC AND CALCULATIONS
      const updateData: any = {
        xp: (userData.xp || 0) + stats.xp,
        coins: (userData.coins || 0) + stats.coins,
        crowns: (userData.crowns || 0) + stats.crowns,
        totalGames: (userData.totalGames || 0) + 1,
        updatedAt: new Date().toISOString(),
      };

      if (stats.isWin) {
        updateData.totalWins = (userData.totalWins || 0) + 1;
      } else if (stats.isLoss) {
        updateData.totalLosses = (userData.totalLosses || 0) + 1;
      }

      // Handle accuracy calculation if question data is provided
      if (
        stats.correctAnswers !== undefined &&
        stats.totalQuestionsPlayed !== undefined &&
        stats.totalQuestionsPlayed > 0
      ) {
        const wrongAnswers = Math.max(
          0,
          stats.totalQuestionsPlayed - stats.correctAnswers
        );

        const currentTotalCorrect = userData.totalCorrectAnswers ?? 0;
        const currentTotalWrong   = userData.totalWrongAnswers   ?? 0;
        
        const newTotalCorrect = currentTotalCorrect + stats.correctAnswers;
        const newTotalWrong   = currentTotalWrong   + wrongAnswers;
        const totalAnswers    = newTotalCorrect + newTotalWrong;
        
        const newAccuracyRate = totalAnswers > 0
          ? Math.round((newTotalCorrect / totalAnswers) * 100)
          : 0;

        updateData.totalCorrectAnswers = newTotalCorrect;
        updateData.totalWrongAnswers   = newTotalWrong;
        updateData.accuracyRate        = newAccuracyRate;
      }

      // 3. ALL WRITES AFTER
      transaction.update(userRef, updateData);
    });
  } catch (error) {
    console.error("Error updating user stats:", error);
    throw error;
  }
}

/**
 * JWE BIB LA: CHECK AND RESET DAILY RESOURCES
 */
export async function checkAndResetJweResources(uid: string, currentResetDate: string): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    if (currentResetDate === today) return;

    const userRef = doc(db, COLLECTION_NAME, uid);
    await updateDoc(userRef, {
      jweEnergy: INITIAL_USER_STATS.jweEnergy,
      jweHearts: INITIAL_USER_STATS.jweHearts,
      lastJweResetDate: today,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error resetting Jwe resources:", error);
  }
}

/**
 * JWE BIB LA: CONSUME 1 ENERGY
 */
export async function consumeJweEnergy(uid: string): Promise<void> {
  try {
    const userRef = doc(db, COLLECTION_NAME, uid);
    await updateDoc(userRef, {
      jweEnergy: increment(-1),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error consuming Jwe energy:", error);
    throw error;
  }
}

/**
 * JWE BIB LA: CONSUME 1 HEART
 */
export async function consumeJweHeart(uid: string): Promise<void> {
  try {
    const userRef = doc(db, COLLECTION_NAME, uid);
    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) return;
      
      const userData = userSnap.data();
      const currentHearts = userData.jweHearts ?? 0;
      
      if (currentHearts <= 0) {
        // Already at zero, don't go negative
        return;
      }
      
      transaction.update(userRef, {
        jweHearts: currentHearts - 1,
        updatedAt: new Date().toISOString()
      });
    });
  } catch (error) {
    console.error("Error consuming Jwe heart:", error);
    throw error;
  }
}

/**
 * JWE BIB LA: GRANT FIXED REWARDS
 * Rewards: 3 crowns, 25 XP, 7 coins
 */
export async function grantJweRewards(uid: string): Promise<void> {
  try {
    const userRef = doc(db, COLLECTION_NAME, uid);
    await updateDoc(userRef, {
      crowns: increment(3),
      xp: increment(25),
      coins: increment(7),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error granting Jwe rewards:", error);
    throw error;
  }
}

/**
 * GET TOP USERS BY XP
 */
export async function getTopUsersByXP(limitCount: number = 50): Promise<AppUserModel[]> {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("xp", ">", 0),
      where("role", "==", "user"),
      orderBy("xp", "desc"),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as AppUserModel);
  } catch (error) {
    console.error("Error getting top users:", error);
    throw error;
  }
}

/**
 * ADMIN: RESET ALL USERS ENERGY AND HEARTS
 * Resets energy to 28 and hearts to 5 for all users.
 */
export async function resetAllUsersEnergy(): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const userSnapshot = await getDocs(collection(db, COLLECTION_NAME));
    
    // Use batches (Firestore limit is 500 per batch)
    let batch = writeBatch(db);
    let count = 0;
    
    for (const userDoc of userSnapshot.docs) {
      batch.update(userDoc.ref, {
        jweEnergy: INITIAL_USER_STATS.jweEnergy,
        jweHearts: INITIAL_USER_STATS.jweHearts,
        lastJweResetDate: today,
        updatedAt: new Date().toISOString()
      });
      
      count++;
      
      // If we reach 500, commit and start a new batch
      if (count === 500) {
        await batch.commit();
        batch = writeBatch(db);
        count = 0;
      }
    }
    
    // Commit remaining updates
    if (count > 0) {
      await batch.commit();
    }
    
    console.log(`Successfully reset energy for ${userSnapshot.size} users.`);
  } catch (error) {
    console.error("Error resetting all users energy:", error);
    throw error;
  }
}
