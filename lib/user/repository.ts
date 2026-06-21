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
import { ReferralCodeDoc, ReferralRelationDoc, ReferralStats, REFERRAL_REWARDS } from "./referralModels";

const COLLECTION_NAME = "users";

/**
 * Calculate player level from cumulative XP using a geometric progression.
 * Each level requires double the XP of the previous level:
 * Niv 1 -> 2: 1000 XP
 * Niv 2 -> 3: 2000 XP
 * Niv 3 -> 4: 4000 XP
 * ...
 * Formula: Level = floor(log2(XP / 1000 + 1)) + 1
 */
export function getLevelFromXp(xp: number): number {
  if (!xp || xp <= 0) return 1;
  return Math.floor(Math.log2(xp / 1000 + 1)) + 1;
}

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
      const newXp = (userData.xp || 0) + stats.xp;
      const newLevel = getLevelFromXp(newXp);

      const updateData: any = {
        xp: newXp,
        level: newLevel,
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
    const userSnap = await getDoc(userRef);
    if (userSnap.exists() && userSnap.data()?.email === 'juniormax2013@gmail.com') {
      return;
    }
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
      if (userData?.email === 'juniormax2013@gmail.com') {
        return;
      }
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
export async function grantJweRewards(uid: string, isDoubled: boolean = false, challengeMultiplier: number = 1): Promise<void> {
  try {
    const multiplier = isDoubled ? 2 : 1;
    const baseCrowns = Math.ceil(3 * challengeMultiplier);
    const baseXp = Math.ceil(25 * challengeMultiplier);
    const baseCoins = Math.ceil(7 * challengeMultiplier);
    
    const userRef = doc(db, COLLECTION_NAME, uid);
    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) {
        throw new Error(`User document not found for uid: ${uid}`);
      }
      const userData = userSnap.data() as AppUserModel;
      
      const newXp = (userData.xp || 0) + baseXp;
      const newLevel = getLevelFromXp(newXp);
      
      transaction.update(userRef, {
        crowns: (userData.crowns || 0) + (baseCrowns * multiplier),
        xp: newXp,
        level: newLevel,
        coins: (userData.coins || 0) + (baseCoins * multiplier),
        updatedAt: new Date().toISOString()
      });
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

/**
 * SAVE A COMPLETED GAME TO USER GAME HISTORY
 */
export async function saveGamePlay(
  uid: string,
  record: {
    gameMode: 'reto_sagrado' | 'jwe_bib_la' | 'daily_challenge';
    score: number;
    outcome: 'win' | 'loss' | 'tie';
    opponentName?: string;
    opponentScore?: number;
  }
): Promise<void> {
  try {
    const newRecord = {
      ...record,
      createdAt: new Date().toISOString(),
    };
    
    // Clean undefined fields to avoid Firebase setDoc() crash
    const cleanedRecord: any = {};
    Object.keys(newRecord).forEach((key) => {
      const val = (newRecord as any)[key];
      if (val !== undefined) {
        cleanedRecord[key] = val;
      }
    });

    if (typeof window !== 'undefined' && (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || !db)) {
      const unifiedKey = `bible_crown_game_history_${uid}`;
      const uniRaw = localStorage.getItem(unifiedKey);
      const uniHistory = uniRaw ? JSON.parse(uniRaw) : [];
      uniHistory.unshift(cleanedRecord);
      localStorage.setItem(unifiedKey, JSON.stringify(uniHistory));
      return;
    }
    const historyRef = collection(db, `users/${uid}/game_history`);
    const docRef = doc(historyRef);
    await setDoc(docRef, cleanedRecord);
  } catch (error) {
    console.error("Error saving game history record:", error);
  }
}

/**
 * GET USER GAME HISTORY FOR THE LAST 7 DAYS
 */
export async function getRecentGameHistory(uid: string): Promise<any[]> {
  try {
    if (typeof window !== 'undefined' && (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || !db)) {
      const unifiedKey = `bible_crown_game_history_${uid}`;
      const uniRaw = localStorage.getItem(unifiedKey);
      return uniRaw ? JSON.parse(uniRaw) : [];
    }
    const historyRef = collection(db, `users/${uid}/game_history`);
    const q = query(
      historyRef,
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.warn("Error getting recent game history:", error);
    return [];
  }
}

// ---------------------------------------------------------------
// REFERRAL SYSTEM FUNCTIONS
// ---------------------------------------------------------------

/**
 * Genera o recupera un código de referido único para el usuario.
 * Si ya existe, lo devuelve sin crear uno nuevo.
 */
export async function getOrCreateReferralCode(uid: string): Promise<string> {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) throw new Error("User not found");
    const userData = userSnap.data() as AppUserModel;

    // Si ya tiene código, devolver el existente
    if (userData.referralCode) return userData.referralCode;

    // Generar nuevo código único: 8 chars alfanuméricos en mayúsculas
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const now = new Date().toISOString();
    const codeDoc: ReferralCodeDoc = { code, uid, createdAt: now };

    // Guardar en referralCodes/{code} y en el perfil del usuario
    const batch = writeBatch(db);
    batch.set(doc(db, "referralCodes", code), codeDoc);
    batch.update(userRef, { referralCode: code, updatedAt: now });
    await batch.commit();

    return code;
  } catch (error) {
    console.error("Error getting/creating referral code:", error);
    throw error;
  }
}

/**
 * Aplica un código de referido al momento del registro.
 * Valida que el código exista, que no sea auto-referido y que
 * el usuario no haya sido referido antes.
 */
export async function applyReferralOnRegister(
  newUserId: string,
  code: string
): Promise<void> {
  try {
    // 1. Resolver a quién pertenece el código
    const codeSnap = await getDoc(doc(db, "referralCodes", code));
    if (!codeSnap.exists()) {
      console.warn("Referral code not found:", code);
      return;
    }
    const codeData = codeSnap.data() as ReferralCodeDoc;

    // 2. Evitar auto-referido
    if (codeData.uid === newUserId) {
      console.warn("Self-referral attempt blocked");
      return;
    }

    // 3. Verificar que este usuario no haya sido referido antes
    const existingReferral = await getDoc(doc(db, "referrals", newUserId));
    if (existingReferral.exists()) {
      console.warn("User already has a referral record");
      return;
    }

    const now = new Date().toISOString();
    const relation: ReferralRelationDoc = {
      referredUid: newUserId,
      referrerUid: codeData.uid,
      status: "registered",
      createdAt: now,
    };

    // 4. Guardar relación y marcar al nuevo usuario con referredBy
    const batch = writeBatch(db);
    batch.set(doc(db, "referrals", newUserId), relation);
    batch.update(doc(db, "users", newUserId), {
      referredBy: codeData.uid,
      updatedAt: now,
    });
    // Incrementar contador de registrados en el referidor
    batch.update(doc(db, "users", codeData.uid), {
      "referralStats.registeredCount": increment(1),
      updatedAt: now,
    });
    await batch.commit();
  } catch (error) {
    console.error("Error applying referral on register:", error);
  }
}

/**
 * Verifica y califica un referido cuando completa su primera partida.
 * Solo dispara si: el usuario fue referido Y no está aún calificado.
 * Tras calificar, entrega recompensas progresivas al referidor.
 */
export async function checkAndQualifyReferral(
  referredUid: string,
  firstGameId?: string
): Promise<void> {
  try {
    // Verificar si el usuario fue referido
    const referralSnap = await getDoc(doc(db, "referrals", referredUid));
    if (!referralSnap.exists()) return;

    const referral = referralSnap.data() as ReferralRelationDoc;
    // Ya está calificado, no hacer nada
    if (referral.status === "qualified") return;

    const now = new Date().toISOString();
    const referrerUid = referral.referrerUid;

    // Obtener el perfil del referidor para conocer el nivel actual
    const referrerSnap = await getDoc(doc(db, "users", referrerUid));
    if (!referrerSnap.exists()) return;
    const referrerData = referrerSnap.data() as AppUserModel;

    const currentStats: ReferralStats = referrerData.referralStats ?? {
      registeredCount: 0,
      qualifiedCount: 0,
      claimedLevels: [],
    };

    const newQualifiedCount = (currentStats.qualifiedCount ?? 0) + 1;

    // Determinar las recompensas desbloqueadas (niveles nuevos)
    const batch = writeBatch(db);

    // Marcar el referido como calificado
    batch.update(doc(db, "referrals", referredUid), {
      status: "qualified",
      qualifiedAt: now,
      ...(firstGameId ? { firstGameId } : {}),
    });

    // Marcar primera partida completada en el referido
    batch.update(doc(db, "users", referredUid), {
      firstGameCompleted: true,
      updatedAt: now,
    });

    // Calcular recompensas acumuladas por niveles nuevos desbloqueados
    const claimedLevels = currentStats.claimedLevels ?? [];
    let totalCoins = 0;
    let totalGems = 0;
    let totalCrowns = 0;
    let totalEnergy = 0;
    const newFrames: string[] = [];
    const newClaimed: number[] = [...claimedLevels];

    for (const reward of REFERRAL_REWARDS) {
      if (
        newQualifiedCount >= reward.requiredQualified &&
        !claimedLevels.includes(reward.level)
      ) {
        totalCoins += reward.coins;
        totalGems += reward.gems;
        totalCrowns += reward.crowns;
        totalEnergy += reward.jweEnergy;
        if (reward.frameId) newFrames.push(reward.frameId);
        newClaimed.push(reward.level);
      }
    }

    // Actualizar perfil del referidor con recompensas y stats
    const referrerUpdate: Record<string, any> = {
      "referralStats.qualifiedCount": newQualifiedCount,
      "referralStats.claimedLevels": newClaimed,
      updatedAt: now,
    };
    if (totalCoins > 0) referrerUpdate.coins = increment(totalCoins);
    if (totalGems > 0) referrerUpdate.gems = increment(totalGems);
    if (totalCrowns > 0) referrerUpdate.crowns = increment(totalCrowns);
    if (totalEnergy > 0) referrerUpdate.jweEnergy = increment(totalEnergy);
    if (newFrames.length > 0) {
      const existingFrames = referrerData.ownedFrames ?? [];
      referrerUpdate.ownedFrames = [...new Set([...existingFrames, ...newFrames])];
    }

    batch.update(doc(db, "users", referrerUid), referrerUpdate);

    await batch.commit();

    console.log(
      `Referral qualified: ${referredUid} → ${referrerUid}. New level count: ${newQualifiedCount}`
    );
  } catch (error) {
    console.error("Error qualifying referral:", error);
  }
}
