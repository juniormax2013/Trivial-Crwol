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
  serverTimestamp,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface ClanEventModel {
  id: string;
  title: string;
  description: string;
  titleES?: string;
  titleFR?: string;
  titleHT?: string;
  descriptionES?: string;
  descriptionFR?: string;
  descriptionHT?: string;
  type: "CLAN_BATTLE";
  status: "upcoming" | "active" | "ended";
  startAt: any;
  endAt: any;
  bannerUrl: string;
  showInArena: boolean;
  rules: {
    difficulties: {
      easy: { label: string; questionsPerMatch: number; pointsCorrect: number; multiplier: number };
      normal: { label: string; questionsPerMatch: number; pointsCorrect: number; multiplier: number };
      hard: { label: string; questionsPerMatch: number; pointsCorrect: number; multiplier: number };
    };
    pointsFastAnswer: number;
    fastAnswerMaxSeconds: number;
    pointsStreak5: number;
    pointsHardQuestion: number;
    pointsPerfectMatch: number;
    minContributionToReward: number;
    maxDailyPointsPerUser: number;
    allowedQuestionTypes: string[];
  };
  rewards: {
    top1: { coins: number; crowns: number; clanXp: number; chest: string };
    top2to5: { coins: number; crowns: number; clanXp: number; chest: string };
    top6to20: { coins: number; crowns: number; clanXp: number; chest: string };
    participation: { coins: number; crowns: number; clanXp: number; chest: string };
  };
  createdAt: any;
  updatedAt: any;
  slideshowImages?: string[];
}

export interface ClanEventScoreModel {
  clanId: string;
  clanName: string;
  clanBadge: string;
  totalPoints: number;
  matchesPlayed: number;
  membersCount: number;
  lastUpdated: any;
}

export interface ClanEventMemberScoreModel {
  userId: string;
  displayName: string;
  photoURL: string;
  points: number;
  matchesPlayed: number;
  correctAnswers: number;
  perfectMatches: number;
  easyMatchesPlayed: number;
  normalMatchesPlayed: number;
  hardMatchesPlayed: number;
  lastDifficultyPlayed: "easy" | "normal" | "hard";
  lastPlayedAt: any;
  rewardClaimed: boolean;
  joinedClanBeforeEvent: boolean;
}

export interface UserClanEventStatsModel {
  clanId: string;
  points: number;
  matchesPlayed: number;
  correctAnswers: number;
  selectedDifficulties: {
    easy: number;
    normal: number;
    hard: number;
  };
  rewardClaimed: boolean;
  lastPlayedAt: any;
}

/**
 * GET ACTIVE CLAN EVENT
 */
export async function getActiveClanEvent(): Promise<ClanEventModel | null> {
  try {
    const q = query(
      collection(db, "clanEvents"),
      where("status", "==", "active"),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as ClanEventModel;
  } catch (error) {
    console.error("Error getting active clan event:", error);
    return null;
  }
}

/**
 * GET ACTIVE ARENA CLAN EVENT
 */
export async function getActiveArenaClanEvent(): Promise<ClanEventModel | null> {
  try {
    const event = await getActiveClanEvent();
    if (event && event.showInArena) {
      return event;
    }
    return null;
  } catch (error) {
    console.error("Error getting active arena clan event:", error);
    return null;
  }
}

/**
 * GET CLAN EVENT BY ID
 */
export async function getClanEventById(eventId: string): Promise<ClanEventModel | null> {
  try {
    const docSnap = await getDoc(doc(db, "clanEvents", eventId));
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as ClanEventModel;
  } catch (error) {
    console.error("Error getting clan event by ID:", error);
    return null;
  }
}

/**
 * GET CLAN EVENT SCORE FOR A CLAN
 */
export async function getClanEventScore(
  eventId: string,
  clanId: string
): Promise<ClanEventScoreModel | null> {
  try {
    const docSnap = await getDoc(
      doc(db, `clanEventScores/${eventId}/clans`, clanId)
    );
    if (!docSnap.exists()) return null;
    return docSnap.data() as ClanEventScoreModel;
  } catch (error) {
    console.error("Error getting clan event score:", error);
    return null;
  }
}

/**
 * GET USER CLAN EVENT STATS
 */
export async function getUserClanEventStats(
  eventId: string,
  userId: string
): Promise<UserClanEventStatsModel | null> {
  try {
    const docSnap = await getDoc(
      doc(db, `users/${userId}/clanEventStats`, eventId)
    );
    if (!docSnap.exists()) return null;
    return docSnap.data() as UserClanEventStatsModel;
  } catch (error) {
    console.error("Error getting user clan event stats:", error);
    return null;
  }
}

/**
 * GET QUESTIONS MIXED BY DIFFICULTY
 */
export async function getClanEventQuestions(
  eventId: string,
  difficulty: "easy" | "normal" | "hard",
  lang: "es" | "fr" | "ht"
): Promise<any[]> {
  try {
    const event = await getClanEventById(eventId);
    if (!event) throw new Error("Evento no encontrado");

    const count = event.rules.difficulties[difficulty]?.questionsPerMatch || 20;

    let duelSource: any[] = [];
    if (lang === "es") {
      const mod = await import("../duel/questionsES");
      duelSource = mod.ALL_QUESTIONS_ES;
    } else if (lang === "fr") {
      const mod = await import("../duel/questionsFR_standardized");
      duelSource = mod.ALL_QUESTIONS_FR;
    } else {
      const mod = await import("../duel/questionsHT_standardized");
      duelSource = mod.ALL_QUESTIONS_HT;
    }

    // Filter by difficulty mapped: easy -> easy, normal -> medium/easy, hard -> hard/medium
    let pool = duelSource.filter((q) => {
      if (difficulty === "easy") return q.difficulty === "easy";
      if (difficulty === "normal") return q.difficulty === "medium" || q.difficulty === "easy";
      return q.difficulty === "hard" || q.difficulty === "medium";
    });

    if (pool.length < count) {
      pool = pool.concat(duelSource.filter(q => !pool.includes(q)));
    }

    // Shuffle pool
    pool = [...pool].sort(() => 0.5 - Math.random());

    // Take count elements
    const selected = pool.slice(0, count);

    // Map each question into different types dynamically to create variety
    return selected.map((dq, index) => {
      const typeIndex = index % 5; 
      // 0, 4: multiple_choice
      // 1: true_false
      // 2: complete_phrase
      // 3: trap_question

      const originalOptions = dq.options.map((o: any) => o.text);
      const correctAnswerText = dq.options.find((o: any) => o.id === dq.correctOptionId)?.text || "";

      if (typeIndex === 1) {
        // True/False
        const makeTrue = Math.random() > 0.5;
        let text = "";
        let options = [];
        let correctId = "a";

        if (makeTrue) {
          if (lang === "ht") {
            text = `Èske se verite oswa manti ke repons pou: "${dq.questionText}" se "${correctAnswerText}"?`;
            options = [{ id: "a", text: "Verite" }, { id: "b", text: "Manti" }];
          } else if (lang === "fr") {
            text = `Est-il vrai ou faux que la réponse à: "${dq.questionText}" est "${correctAnswerText}" ?`;
            options = [{ id: "a", text: "Vrai" }, { id: "b", text: "Faux" }];
          } else {
            text = `¿Es verdadero o falso que la respuesta a: "${dq.questionText}" es "${correctAnswerText}"?`;
            options = [{ id: "a", text: "Verdadero" }, { id: "b", text: "Falso" }];
          }
          correctId = "a";
        } else {
          const incorrects = dq.options.filter((o: any) => o.id !== dq.correctOptionId).map((o: any) => o.text);
          const wrongAns = incorrects[Math.floor(Math.random() * incorrects.length)] || "";
          if (lang === "ht") {
            text = `Èske se verite oswa manti ke repons pou: "${dq.questionText}" se "${wrongAns}"?`;
            options = [{ id: "a", text: "Verite" }, { id: "b", text: "Manti" }];
          } else if (lang === "fr") {
            text = `Est-il vrai ou faux que la réponse à: "${dq.questionText}" est "${wrongAns}" ?`;
            options = [{ id: "a", text: "Vrai" }, { id: "b", text: "Faux" }];
          } else {
            text = `¿Es verdadero o falso que la respuesta a: "${dq.questionText}" es "${wrongAns}"?`;
            options = [{ id: "a", text: "Verdadero" }, { id: "b", text: "Falso" }];
          }
          correctId = "b";
        }

        return {
          id: dq.id,
          type: "true_false",
          questionText: text,
          options,
          correctOptionId: correctId,
          explanation: dq.explanation || "",
          bibleReference: dq.bibleReference || "",
          difficulty: dq.difficulty,
        };
      } else if (typeIndex === 2) {
        // Complete phrase
        let text = "";
        if (lang === "ht") {
          text = `Ranpli deklarasyon sa a: Repons pou "${dq.questionText}" se ______.`;
        } else if (lang === "fr") {
          text = `Complétez l'affirmation : La réponse à "${dq.questionText}" est ______.`;
        } else {
          text = `Completa la afirmación: La respuesta a "${dq.questionText}" es ______.`;
        }
        return {
          id: dq.id,
          type: "complete_phrase",
          questionText: text,
          options: dq.options,
          correctOptionId: dq.correctOptionId,
          explanation: dq.explanation || "",
          bibleReference: dq.bibleReference || "",
          difficulty: dq.difficulty,
        };
      } else if (typeIndex === 3) {
        // Trap Question
        let text = "";
        if (lang === "ht") {
          text = `⚡ Kesyon pyèj: ${dq.questionText}`;
        } else if (lang === "fr") {
          text = `⚡ Question piège : ${dq.questionText}`;
        } else {
          text = `⚡ Pregunta con trampa: ${dq.questionText}`;
        }
        return {
          id: dq.id,
          type: "trap_question",
          questionText: text,
          options: dq.options,
          correctOptionId: dq.correctOptionId,
          explanation: dq.explanation || "",
          bibleReference: dq.bibleReference || "",
          difficulty: dq.difficulty,
        };
      } else {
        // Multiple Choice
        return {
          id: dq.id,
          type: "multiple_choice",
          questionText: dq.questionText,
          options: dq.options,
          correctOptionId: dq.correctOptionId,
          explanation: dq.explanation || "",
          bibleReference: dq.bibleReference || "",
          difficulty: dq.difficulty,
        };
      }
    });
  } catch (error) {
    console.error("Error getting clan event questions:", error);
    return [];
  }
}

/**
 * CALCULATE CLAN EVENT MATCH POINTS
 */
export function calculateClanEventPoints(
  matchResult: {
    correctAnswers: number;
    totalQuestions: number;
    fastAnswers: number;
    streaksOf5: number;
    hardQuestionsCorrect: number;
    isPerfect: boolean;
  },
  rules: any,
  difficulty: "easy" | "normal" | "hard"
): number {
  let subtotal = 0;
  
  // Base correct answers
  subtotal += matchResult.correctAnswers * (rules.pointsCorrect ?? 10);
  // Fast answers bonus
  subtotal += matchResult.fastAnswers * (rules.pointsFastAnswer ?? 3);
  // Streaks of 5 bonus
  subtotal += matchResult.streaksOf5 * (rules.pointsStreak5 ?? 25);
  // Hard questions correct bonus
  subtotal += matchResult.hardQuestionsCorrect * (rules.pointsHardQuestion ?? 20);
  // Perfect match bonus
  if (matchResult.isPerfect) {
    subtotal += (rules.pointsPerfectMatch ?? 100);
  }

  // Multiplier
  const mult = rules.difficulties[difficulty]?.multiplier ?? 1;
  return Math.round(subtotal * mult);
}

/**
 * SUBMIT EVENT MATCH RESULT ATOMIC TRANSACTION
 */
export async function submitClanEventMatchResult(
  eventId: string,
  userId: string,
  clanId: string,
  matchResult: {
    correctAnswers: number;
    totalQuestions: number;
    fastAnswers: number;
    streaksOf5: number;
    hardQuestionsCorrect: number;
    isPerfect: boolean;
    difficulty: "easy" | "normal" | "hard";
  }
): Promise<number> {
  const eventRef = doc(db, "clanEvents", eventId);
  const clanScoreRef = doc(db, `clanEventScores/${eventId}/clans`, clanId);
  const memberScoreRef = doc(db, `clanEventScores/${eventId}/clans/${clanId}/members`, userId);
  const userStatsRef = doc(db, `users/${userId}/clanEventStats`, eventId);
  const userRef = doc(db, "users", userId);
  const clanRef = doc(db, "clans", clanId);

  let finalPointsGained = 0;

  await runTransaction(db, async (transaction) => {
    // 1. Fetch all configurations & data (All Reads first)
    const eventSnap = await transaction.get(eventRef);
    if (!eventSnap.exists()) throw new Error("El evento no existe.");
    const eventData = eventSnap.data() as ClanEventModel;
    if (eventData.status !== "active") throw new Error("El evento no está activo.");

    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) throw new Error("Usuario no encontrado.");
    const userData = userSnap.data();
    if (userData.clanId !== clanId) throw new Error("El usuario no pertenece al clan especificado.");

    const memberSnap = await transaction.get(memberScoreRef);
    const userStatsSnap = await transaction.get(userStatsRef);
    const clanScoreSnap = await transaction.get(clanScoreRef);
    const clanSnap = await transaction.get(clanRef);

    // Calculate points & stats
    const pointsGained = calculateClanEventPoints(matchResult, eventData.rules, matchResult.difficulty);
    finalPointsGained = pointsGained;

    let currentMemberPoints = 0;
    let memberMatchesPlayed = 0;
    let memberCorrect = 0;
    let memberPerfect = 0;
    let easyPlayed = 0;
    let normalPlayed = 0;
    let hardPlayed = 0;

    if (memberSnap.exists()) {
      const m = memberSnap.data();
      currentMemberPoints = m.points || 0;
      memberMatchesPlayed = m.matchesPlayed || 0;
      memberCorrect = m.correctAnswers || 0;
      memberPerfect = m.perfectMatches || 0;
      easyPlayed = m.easyMatchesPlayed || 0;
      normalPlayed = m.normalMatchesPlayed || 0;
      hardPlayed = m.hardMatchesPlayed || 0;
    }

    const updatedPoints = currentMemberPoints + pointsGained;

    let userSelectedDifficulties = { easy: 0, normal: 0, hard: 0 };
    if (userStatsSnap.exists()) {
      userSelectedDifficulties = userStatsSnap.data().selectedDifficulties || userSelectedDifficulties;
    }
    userSelectedDifficulties[matchResult.difficulty] += 1;

    let clanTotalPoints = 0;
    let clanMatchesPlayed = 0;
    if (clanScoreSnap.exists()) {
      clanTotalPoints = clanScoreSnap.data().totalPoints || 0;
      clanMatchesPlayed = clanScoreSnap.data().matchesPlayed || 0;
    }

    const clanName = clanSnap.exists() ? clanSnap.data().name : "Clan";
    const clanBadge = clanSnap.exists() ? clanSnap.data().icon : "";

    // 2. Perform all writes
    // Write Member Event Score
    transaction.set(memberScoreRef, {
      userId,
      displayName: userData.fullName || userData.username || "Jugador",
      photoURL: userData.photoURL || "",
      points: updatedPoints,
      matchesPlayed: memberMatchesPlayed + 1,
      correctAnswers: memberCorrect + matchResult.correctAnswers,
      perfectMatches: memberPerfect + (matchResult.isPerfect ? 1 : 0),
      easyMatchesPlayed: easyPlayed + (matchResult.difficulty === "easy" ? 1 : 0),
      normalMatchesPlayed: normalPlayed + (matchResult.difficulty === "normal" ? 1 : 0),
      hardMatchesPlayed: hardPlayed + (matchResult.difficulty === "hard" ? 1 : 0),
      lastDifficultyPlayed: matchResult.difficulty,
      lastPlayedAt: new Date().toISOString(),
      rewardClaimed: false,
      joinedClanBeforeEvent: true
    }, { merge: true });

    // Write User Stats subcollection
    transaction.set(userStatsRef, {
      clanId,
      points: updatedPoints,
      matchesPlayed: memberMatchesPlayed + 1,
      correctAnswers: memberCorrect + matchResult.correctAnswers,
      selectedDifficulties: userSelectedDifficulties,
      rewardClaimed: false,
      lastPlayedAt: new Date().toISOString()
    }, { merge: true });

    // Write Clan Event Score
    transaction.set(clanScoreRef, {
      clanId,
      clanName,
      clanBadge,
      totalPoints: clanTotalPoints + pointsGained,
      matchesPlayed: clanMatchesPlayed + 1,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
  });

  return finalPointsGained;
}

/**
 * GET CLAN EVENT RANKING
 */
export async function getClanEventRanking(eventId: string): Promise<ClanEventScoreModel[]> {
  try {
    const q = query(
      collection(db, `clanEventScores/${eventId}/clans`),
      orderBy("totalPoints", "desc"),
      orderBy("matchesPlayed", "asc"),
      orderBy("lastUpdated", "asc")
    );
    const snap = await getDocs(q);
    const ranks: ClanEventScoreModel[] = [];
    snap.forEach((d) => {
      ranks.push(d.data() as ClanEventScoreModel);
    });
    return ranks;
  } catch (error) {
    console.error("Error getting clan event ranking:", error);
    return [];
  }
}

/**
 * GET CLAN EVENT TOP RANKING (Resumen principal)
 */
export async function getClanEventTopRanking(
  eventId: string,
  limitCount: number = 10
): Promise<ClanEventScoreModel[]> {
  try {
    const q = query(
      collection(db, `clanEventScores/${eventId}/clans`),
      orderBy("totalPoints", "desc"),
      orderBy("matchesPlayed", "asc"),
      orderBy("lastUpdated", "asc"),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    const ranks: ClanEventScoreModel[] = [];
    snap.forEach((d) => {
      ranks.push(d.data() as ClanEventScoreModel);
    });
    return ranks;
  } catch (error) {
    console.error("Error getting clan event top ranking:", error);
    return [];
  }
}

/**
 * GET CLAN MEMBERS RANKING
 */
export async function getClanMembersEventRanking(
  eventId: string,
  clanId: string
): Promise<ClanEventMemberScoreModel[]> {
  try {
    const q = query(
      collection(db, `clanEventScores/${eventId}/clans/${clanId}/members`),
      orderBy("points", "desc"),
      orderBy("matchesPlayed", "asc")
    );
    const snap = await getDocs(q);
    const ranks: ClanEventMemberScoreModel[] = [];
    snap.forEach((d) => {
      ranks.push(d.data() as ClanEventMemberScoreModel);
    });
    return ranks;
  } catch (error) {
    console.error("Error getting clan members event ranking:", error);
    return [];
  }
}

/**
 * GET PROJECTED REWARD
 */
export function getProjectedClanReward(
  event: ClanEventModel,
  rank: number
): { coins: number; crowns: number; clanXp: number; chest: string; tierLabel: string } {
  if (rank === 1) {
    return { ...event.rewards.top1, tierLabel: "Top 1" };
  } else if (rank >= 2 && rank <= 5) {
    return { ...event.rewards.top2to5, tierLabel: "Top 2 al 5" };
  } else if (rank >= 6 && rank <= 20) {
    return { ...event.rewards.top6to20, tierLabel: "Top 6 al 20" };
  } else {
    return { ...event.rewards.participation, tierLabel: "Participación" };
  }
}

/**
 * GET MY CLAN RANK DETAILS
 */
export async function getMyClanEventRank(
  eventId: string,
  clanId: string
): Promise<{
  position: number;
  points: number;
  pointsToNext: number;
  projectedReward: any;
} | null> {
  try {
    const ranking = await getClanEventRanking(eventId);
    const myRankIdx = ranking.findIndex((c) => c.clanId === clanId);
    if (myRankIdx === -1) return null;

    const myClanScore = ranking[myRankIdx];
    const position = myRankIdx + 1;

    let pointsToNext = 0;
    if (myRankIdx > 0) {
      const nextClan = ranking[myRankIdx - 1];
      pointsToNext = (nextClan.totalPoints - myClanScore.totalPoints) + 1;
    }

    const event = await getClanEventById(eventId);
    const projectedReward = event ? getProjectedClanReward(event, position) : null;

    return {
      position,
      points: myClanScore.totalPoints,
      pointsToNext,
      projectedReward,
    };
  } catch (error) {
    console.error("Error getting my clan event rank details:", error);
    return null;
  }
}

/**
 * CLAIM REWARDS ATOMIC TRANSACTION
 */
export async function claimClanEventReward(
  eventId: string,
  userId: string,
  clanId: string
): Promise<{ coins: number; crowns: number; clanXp: number; chest: string }> {
  const memberScoreRef = doc(db, `clanEventScores/${eventId}/clans/${clanId}/members`, userId);
  const userStatsRef = doc(db, `users/${userId}/clanEventStats`, eventId);
  const userRef = doc(db, "users", userId);
  const clanRef = doc(db, "clans", clanId);
  const eventRef = doc(db, "clanEvents", eventId);

  let claimedReward = { coins: 0, crowns: 0, clanXp: 0, chest: "" };

  // 1. Find Clan position in ranking outside the transaction (Firestore transactions do not support queries)
  const rankingRef = collection(db, `clanEventScores/${eventId}/clans`);
  const q = query(
    rankingRef,
    orderBy("totalPoints", "desc"),
    orderBy("matchesPlayed", "asc"),
    orderBy("lastUpdated", "asc")
  );
  const rankingSnap = await getDocs(q);
  let position = 999;
  let idx = 1;
  rankingSnap.forEach((docD) => {
    if (docD.id === clanId) {
      position = idx;
    }
    idx++;
  });

  await runTransaction(db, async (transaction) => {
    // 2. Fetch Event
    const eventSnap = await transaction.get(eventRef);
    if (!eventSnap.exists()) throw new Error("El evento no existe.");
    const eventData = eventSnap.data() as ClanEventModel;
    if (eventData.status !== "ended") throw new Error("El evento aún no ha terminado.");

    // 3. Fetch User Stats & check contribution
    const statsSnap = await transaction.get(userStatsRef);
    if (!statsSnap.exists()) throw new Error("No tienes estadísticas registradas para este evento.");
    const userStats = statsSnap.data() as UserClanEventStatsModel;
    if (userStats.rewardClaimed) throw new Error("Ya has reclamado la recompensa de este evento.");
    
    const minCont = eventData.rules.minContributionToReward || 300;
    if (userStats.points < minCont) {
      throw new Error(`Necesitas aportar un mínimo de ${minCont} puntos para reclamar la recompensa.`);
    }

    const reward = getProjectedClanReward(eventData, position);
    claimedReward = {
      coins: reward.coins,
      crowns: reward.crowns,
      clanXp: reward.clanXp,
      chest: reward.chest,
    };

    // 4. Fetch User Profile
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) throw new Error("Usuario no encontrado.");
    const userData = userSnap.data();

    // 5. Fetch Clan Data
    const clanSnap = await transaction.get(clanRef);

    // 6. Perform all updates/writes
    transaction.update(userRef, {
      coins: (userData.coins || 0) + reward.coins,
      crowns: (userData.crowns || 0) + reward.crowns,
      pendingChestReward: reward.chest, // save chest if chest system not yet fully present
      updatedAt: new Date().toISOString(),
    });

    if (clanSnap.exists()) {
      const clanData = clanSnap.data();
      transaction.update(clanRef, {
        xp: (clanData.xp || 0) + reward.clanXp,
        updatedAt: new Date().toISOString(),
      });
    }

    // Update Claim flags
    transaction.update(memberScoreRef, { rewardClaimed: true });
    transaction.update(userStatsRef, { rewardClaimed: true });
  });

  return claimedReward;
}

/**
 * GET ALL CLAN EVENTS FOR ADMIN
 */
export async function getAllClanEvents(): Promise<ClanEventModel[]> {
  try {
    const q = query(
      collection(db, "clanEvents"),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    const list: ClanEventModel[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as ClanEventModel);
    });
    return list;
  } catch (error) {
    console.error("Error getting all clan events:", error);
    return [];
  }
}

/**
 * CREATE CLAN EVENT
 */
export async function createClanEvent(
  eventData: Omit<ClanEventModel, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const newRef = doc(collection(db, "clanEvents"));
  const now = new Date().toISOString();
  await setDoc(newRef, {
    ...eventData,
    createdAt: now,
    updatedAt: now,
  });
  return newRef.id;
}

/**
 * UPDATE CLAN EVENT
 */
export async function updateClanEvent(
  eventId: string,
  eventData: Partial<ClanEventModel>
): Promise<void> {
  const docRef = doc(db, "clanEvents", eventId);
  await updateDoc(docRef, {
    ...eventData,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * DELETE CLAN EVENT
 */
export async function deleteClanEvent(eventId: string): Promise<void> {
  const docRef = doc(db, "clanEvents", eventId);
  await deleteDoc(docRef);
}

/**
 * DISTRIBUTE CLAN EVENT REWARDS & END THE EVENT SYSTEMATICALLY
 */
export async function distributeClanEventRewards(eventId: string): Promise<void> {
  const eventRef = doc(db, "clanEvents", eventId);
  try {
    const eventSnap = await getDoc(eventRef);
    if (!eventSnap.exists()) return;
    const eventData = eventSnap.data() as ClanEventModel;
    
    // Check if already distributed/marked as ended
    if (eventData.status === "ended") return;

    // Update status to ended immediately
    await updateDoc(eventRef, {
      status: "ended",
      updatedAt: new Date().toISOString()
    });

    // 1. Get entire ranking of clans
    const ranking = await getClanEventRanking(eventId);
    if (ranking.length === 0) return;

    const topClan = ranking[0];

    // 2. Iterate through each clan and distribute rewards to eligible members
    for (let pos = 1; pos <= ranking.length; pos++) {
      const clanScore = ranking[pos - 1];
      const reward = getProjectedClanReward(eventData, pos);
      
      // Update Clan XP
      const clanRef = doc(db, "clans", clanScore.clanId);
      const clanSnap = await getDoc(clanRef);
      if (clanSnap.exists()) {
        const currentXp = clanSnap.data().xp || 0;
        await updateDoc(clanRef, {
          xp: currentXp + reward.clanXp,
          updatedAt: new Date().toISOString()
        });
      }

      // Fetch all members who participated in this clan
      const members = await getClanMembersEventRanking(eventId, clanScore.clanId);
      const minCont = eventData.rules.minContributionToReward || 300;

      for (const member of members) {
        if (member.points >= minCont && !member.rewardClaimed) {
          // Grant reward to member
          const userRef = doc(db, "users", member.userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            await updateDoc(userRef, {
              coins: (userData.coins || 0) + reward.coins,
              crowns: (userData.crowns || 0) + reward.crowns,
              pendingChestReward: reward.chest,
              updatedAt: new Date().toISOString()
            });
          }

          // Mark as claimed
          const memberScoreRef = doc(db, `clanEventScores/${eventId}/clans/${clanScore.clanId}/members`, member.userId);
          await updateDoc(memberScoreRef, { rewardClaimed: true });
          
          const userStatsRef = doc(db, `users/${member.userId}/clanEventStats`, eventId);
          await updateDoc(userStatsRef, { rewardClaimed: true });
        }
      }

      // Send announcement to the clan's chat room
      try {
        const clanChatId = `clan_${clanScore.clanId}`;
        const chatRef = doc(db, "chats", clanChatId);
        const messagesCollection = collection(db, "chats", clanChatId, "messages");
        
        const messageText = `📢 El evento de clan "${eventData.titleES || eventData.title}" ha finalizado. El clan ganador absoluto ha sido "${topClan.clanName}" con ${topClan.totalPoints} pts. Nuestro clan ha quedado en la posición #${pos} y los miembros calificados recibieron: ${reward.coins} 🪙, ${reward.crowns} 👑 y un ${reward.chest}!`;

        await addDoc(messagesCollection, {
          text: messageText,
          senderId: "system_announcement",
          senderName: "Sistema de Eventos",
          senderAvatar: "https://api.dicebear.com/9.x/bottts/svg?seed=system",
          createdAt: serverTimestamp(),
          deleted: false,
          reportedCount: 0,
        });

        await setDoc(chatRef, {
          type: "clan",
          participants: [],
          lastMessage: messageText,
          lastMessageSenderId: "system_announcement",
          lastMessageAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (chatError) {
        console.error("Error sending clan event result to chat:", chatError);
      }
    }
  } catch (error) {
    console.error("Error in distributeClanEventRewards:", error);
  }
}
