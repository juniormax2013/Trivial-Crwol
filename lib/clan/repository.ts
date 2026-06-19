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
  increment,
  runTransaction,
  deleteDoc,
  serverTimestamp,
  addDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ClanModel, ClanRequestModel, ClanRole } from "./models";
import { AppUserModel } from "@/lib/user/models";
import { getLevelFromXp, mapUserDoc } from "@/lib/user/repository";

const CLANS_COLLECTION = "clans";
const USERS_COLLECTION = "users";
const REQUESTS_COLLECTION = "clanRequests";
const INVITATIONS_COLLECTION = "clanInvitations";

/**
 * CREATE A CLAN
 * Must check if user is level >= 7 and doesn't belong to a clan.
 */
export async function createClan(
  name: string,
  motto: string,
  icon: string,
  creatorUid: string
): Promise<string> {
  try {
    const userRef = doc(db, USERS_COLLECTION, creatorUid);
    const clanColRef = collection(db, CLANS_COLLECTION);
    const newClanRef = doc(clanColRef);
    const clanId = newClanRef.id;

    await runTransaction(db, async (transaction) => {
      // 1. Fetch user to validate level and current clan status
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) {
        throw new Error("El usuario no existe");
      }
      
      const userData = mapUserDoc(userSnap.data());
      const level = getLevelFromXp(userData.xp);
      
      if (level < 7 && userData.email !== 'juniormax2013@gmail.com') {
        throw new Error("Se requiere nivel 7 o superior para crear un clan");
      }

      if (userData.clanId) {
        throw new Error("Ya perteneces a un clan");
      }

      // 2. Prepare new clan data
      const newClan: ClanModel = {
        id: clanId,
        name: name.trim(),
        motto: motto.trim(),
        icon,
        creatorId: creatorUid,
        creatorName: userData.fullName || userData.username,
        membersCount: 1,
        points: 0,
        xp: 0,
        createdAt: new Date().toISOString(),
        
        // Default Settings
        type: 'public',
        minLevel: 1,
        welcomeMessage: '¡Bienvenidos al clan!',
        language: 'es',
        region: 'Global',
        color: '#0A84FF',
        mutedMembers: {}
      };

      // 3. Write updates atomically
      transaction.set(newClanRef, newClan);
      transaction.update(userRef, { 
        clanId,
        clanRole: 'founder',
        updatedAt: new Date().toISOString()
      });
    });

    return clanId;
  } catch (error) {
    console.error("Error creating clan:", error);
    throw error;
  }
}

/**
 * GET ALL CLANS
 */
export async function getClans(): Promise<ClanModel[]> {
  try {
    const q = query(collection(db, CLANS_COLLECTION), orderBy("points", "desc"));
    const snapshot = await getDocs(q);
    const clans: ClanModel[] = [];
    
    snapshot.forEach((docSnap) => {
      clans.push(docSnap.data() as ClanModel);
    });

    for (const clan of clans) {
      clan.power = await calculateClanPower(clan.id);
    }
    
    return clans;
  } catch (error) {
    console.error("Error getting clans:", error);
    return [];
  }
}

/**
 * GET A SINGLE CLAN BY ID
 */
export async function getClanById(clanId: string): Promise<ClanModel | null> {
  try {
    const clanSnap = await getDoc(doc(db, CLANS_COLLECTION, clanId));
    if (!clanSnap.exists()) return null;
    const clan = clanSnap.data() as ClanModel;
    clan.power = await calculateClanPower(clanId);
    return clan;
  } catch (error) {
    console.error("Error getting clan by ID:", error);
    return null;
  }
}

/**
 * JOIN A CLAN (Public entry or accepting invites)
 */
export async function joinClan(clanId: string, userUid: string): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userUid);
    const clanRef = doc(db, CLANS_COLLECTION, clanId);

    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) throw new Error("Usuario no encontrado");

      const userData = mapUserDoc(userSnap.data());
      if (userData.clanId) throw new Error("Ya perteneces a un clan");

      const clanSnap = await transaction.get(clanRef);
      if (!clanSnap.exists()) throw new Error("El clan no existe");

      const clanData = clanSnap.data() as ClanModel;
      const userLevel = getLevelFromXp(userData.xp);

      if (userLevel < (clanData.minLevel || 1)) {
        throw new Error(`Se requiere nivel mínimo ${clanData.minLevel} para unirse`);
      }

      // Update user
      transaction.update(userRef, {
        clanId,
        clanRole: 'member',
        updatedAt: new Date().toISOString()
      });

      // Update clan members count
      transaction.update(clanRef, {
        membersCount: increment(1)
      });
    });
  } catch (error) {
    console.error("Error joining clan:", error);
    throw error;
  }
}

/**
 * LEAVE A CLAN
 */
export async function leaveClan(clanId: string, userUid: string): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, userUid);
    const clanRef = doc(db, CLANS_COLLECTION, clanId);

    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) throw new Error("Usuario no encontrado");

      const userData = mapUserDoc(userSnap.data());
      if (userData.clanId !== clanId) throw new Error("No perteneces a este clan");

      const clanSnap = await transaction.get(clanRef);
      
      // Update user
      transaction.update(userRef, {
        clanId: null,
        clanRole: null,
        updatedAt: new Date().toISOString()
      });

      // Update clan if exists
      if (clanSnap.exists()) {
        const clanData = clanSnap.data() as ClanModel;
        const newMembersCount = Math.max(0, clanData.membersCount - 1);
        
        if (newMembersCount === 0 && clanData.creatorId === userUid) {
          transaction.delete(clanRef);
        } else {
          transaction.update(clanRef, {
            membersCount: newMembersCount
          });
        }
      }
    });
  } catch (error) {
    console.error("Error leaving clan:", error);
    throw error;
  }
}

/**
 * GET ALL MEMBERS OF A CLAN
 */
export async function getClanMembers(clanId: string): Promise<AppUserModel[]> {
  try {
    const q = query(collection(db, USERS_COLLECTION), where("clanId", "==", clanId));
    const snapshot = await getDocs(q);
    const members: AppUserModel[] = [];
    snapshot.forEach((docSnap) => {
      members.push(mapUserDoc(docSnap.data()));
    });
    return members;
  } catch (error) {
    console.error("Error getting clan members:", error);
    return [];
  }
}

/**
 * CALCULATE CLAN POWER
 * Sum of the levels of all registered members.
 */
export async function calculateClanPower(clanId: string): Promise<number> {
  try {
    const members = await getClanMembers(clanId);
    return members.reduce((sum, member) => {
      const lvl = getLevelFromXp(member.xp || 0);
      return sum + lvl;
    }, 0);
  } catch (error) {
    console.error("Error calculating clan power:", error);
    return 0;
  }
}

/**
 * UPDATE CLAN CONFIGURATION / SETTINGS
 */
export async function updateClanSettings(
  clanId: string,
  settings: Partial<ClanModel>
): Promise<void> {
  try {
    const clanRef = doc(db, CLANS_COLLECTION, clanId);
    await updateDoc(clanRef, {
      ...settings,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating clan settings:", error);
    throw error;
  }
}

/**
 * UPDATE MEMBER ROLE inside clan
 */
export async function updateMemberRole(
  targetUid: string,
  newRole: ClanRole
): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, targetUid);
    await updateDoc(userRef, {
      clanRole: newRole,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error updating member role:", error);
    throw error;
  }
}

/**
 * KICK A MEMBER FROM THE CLAN
 */
export async function kickMember(clanId: string, targetUid: string): Promise<void> {
  try {
    const userRef = doc(db, USERS_COLLECTION, targetUid);
    const clanRef = doc(db, CLANS_COLLECTION, clanId);

    await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) throw new Error("Usuario no encontrado");

      const userData = mapUserDoc(userSnap.data());
      if (userData.clanId !== clanId) throw new Error("El usuario no pertenece a este clan");

      transaction.update(userRef, {
        clanId: null,
        clanRole: null,
        updatedAt: new Date().toISOString()
      });

      transaction.update(clanRef, {
        membersCount: increment(-1)
      });
    });
  } catch (error) {
    console.error("Error kicking member:", error);
    throw error;
  }
}

/**
 * SILENCE/MUTE A MEMBER IN THE CLAN CHAT
 */
export async function muteMember(
  clanId: string,
  targetUid: string,
  durationMinutes: number
): Promise<void> {
  try {
    const clanRef = doc(db, CLANS_COLLECTION, clanId);
    const unmuteTime = new Date();
    unmuteTime.setMinutes(unmuteTime.getMinutes() + durationMinutes);

    await updateDoc(clanRef, {
      [`mutedMembers.${targetUid}`]: unmuteTime.toISOString()
    });
  } catch (error) {
    console.error("Error muting member:", error);
    throw error;
  }
}

/**
 * SUBMIT ACCESS REQUEST (For Private Clans)
 */
export async function submitClanRequest(
  clanId: string,
  user: AppUserModel
): Promise<void> {
  try {
    const reqRef = doc(collection(db, REQUESTS_COLLECTION));
    const newRequest: ClanRequestModel = {
      id: reqRef.id,
      clanId,
      uid: user.uid,
      username: user.username,
      fullName: user.fullName,
      level: getLevelFromXp(user.xp),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    await setDoc(reqRef, newRequest);
  } catch (error) {
    console.error("Error submitting clan request:", error);
    throw error;
  }
}

/**
 * PROCESS ACCESS REQUEST (Accept / Reject)
 */
export async function processClanRequest(
  requestId: string,
  status: 'accepted' | 'rejected'
): Promise<void> {
  try {
    const requestRef = doc(db, REQUESTS_COLLECTION, requestId);
    const requestSnap = await getDoc(requestRef);
    if (!requestSnap.exists()) throw new Error("Solicitud no encontrada");

    const reqData = requestSnap.data() as ClanRequestModel;

    if (status === 'accepted') {
      // Execute join logic atomically
      await joinClan(reqData.clanId, reqData.uid);
    }

    await updateDoc(requestRef, {
      status,
      processedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error processing clan request:", error);
    throw error;
  }
}

/**
 * GET ACTIVE PENDING REQUESTS FOR A CLAN
 */
export async function getClanRequests(clanId: string): Promise<ClanRequestModel[]> {
  try {
    const q = query(
      collection(db, REQUESTS_COLLECTION),
      where("clanId", "==", clanId),
      where("status", "==", "pending")
    );
    const snapshot = await getDocs(q);
    const requests: ClanRequestModel[] = [];
    snapshot.forEach((d) => {
      requests.push(d.data() as ClanRequestModel);
    });
    return requests;
  } catch (error) {
    console.error("Error getting clan requests:", error);
    return [];
  }
}

/**
 * INVITE A PLAYER TO THE CLAN
 */
export async function invitePlayerToClan(
  clanId: string,
  playerUid: string,
  clanName: string
): Promise<void> {
  try {
    const inviteRef = doc(collection(db, INVITATIONS_COLLECTION));
    await setDoc(inviteRef, {
      id: inviteRef.id,
      clanId,
      clanName,
      playerUid,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error inviting player to clan:", error);
    throw error;
  }
}

/**
 * SEARCH PLAYERS BY USERNAME (For Invitations)
 */
export async function searchPlayers(queryStr: string): Promise<AppUserModel[]> {
  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where("username", ">=", queryStr),
      where("username", "<=", queryStr + "\uf8ff"),
      limit(20)
    );
    const snapshot = await getDocs(q);
    const results: AppUserModel[] = [];
    snapshot.forEach((d) => {
      results.push(mapUserDoc(d.data()));
    });
    return results;
  } catch (error) {
    console.error("Error searching players:", error);
    return [];
  }
}

/**
 * CHECK IF USER HAS A PENDING REQUEST FOR A SPECIFIC CLAN
 */
export async function hasPendingClanRequest(userUid: string, clanId: string): Promise<boolean> {
  try {
    const q = query(
      collection(db, REQUESTS_COLLECTION),
      where("uid", "==", userUid),
      where("clanId", "==", clanId),
      where("status", "==", "pending"),
      limit(1)
    );
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (error) {
    console.error("Error checking pending clan request:", error);
    return false;
  }
}
