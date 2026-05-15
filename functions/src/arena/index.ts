import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Callable function to finalize an Arena match and distribute rewards.
 * This should be called once by the host (or automatically by a trigger if we had one).
 */
export const completeArenaMatch = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Falta autenticación.");
  }

  const { arenaId } = request.data;
  if (!arenaId) {
    throw new HttpsError("invalid-argument", "arenaId es requerido.");
  }

  const arenaRef = db.collection("arenas").doc(arenaId);
  const arenaSnap = await arenaRef.get();

  if (!arenaSnap.exists) {
    throw new HttpsError("not-found", "Arena no encontrada.");
  }

  const arenaData = arenaSnap.data()!;
  
  // Prevent multiple executions for the same arena
  if (arenaData.status === "finished" && arenaData.rewardsDistributed) {
    return { status: "already_finished", message: "Las recompensas ya fueron distribuidas." };
  }

  // Get all players
  const playersSnap = await arenaRef.collection("players").get();
  if (playersSnap.empty) {
    throw new HttpsError("failed-precondition", "No hay jugadores en esta arena.");
  }

  interface ArenaPlayer {
    uid: string;
    score: number;
    totalResponseTime: number;
    status: string;
    isFinished: boolean;
    name: string;
    correctAnswersCount: number;
  }

  const players = playersSnap.docs.map(d => ({
    uid: d.id,
    ...d.data()
  } as ArenaPlayer));

  // CHECK: Are all players finished?
  // We only count players who are NOT 'left'
  const activePlayers = players.filter(p => p.status !== 'left');
  const allFinished = activePlayers.every(p => p.isFinished === true);

  if (!allFinished) {
    return { 
      status: "waiting", 
      message: "Esperando a que todos los jugadores terminen.",
      finishedCount: activePlayers.filter(p => p.isFinished).length,
      totalCount: activePlayers.length
    };
  }

  // Sort by score (desc), then by response time (asc)
  players.sort((a, b) => {
    if ((b.score || 0) !== (a.score || 0)) {
      return (b.score || 0) - (a.score || 0);
    }
    return (a.totalResponseTime || 0) - (b.totalResponseTime || 0);
  });

  const batch = db.batch();
  const now = admin.firestore.FieldValue.serverTimestamp();

  // Define rewards based on rank
  const getRewards = (rank: number) => {
    switch(rank) {
      case 1: return { crowns: 250, xp: 500, coins: 100 };
      case 2: return { crowns: 100, xp: 300, coins: 50 };
      case 3: return { crowns: 50, xp: 200, coins: 25 };
      default: return { crowns: 10, xp: 100, coins: 5 };
    }
  };

  const playerResults = [];

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const rank = i + 1;
    const rewards = getRewards(rank);

    // Update Player Doc in Arena subcollection
    const playerArenaRef = arenaRef.collection("players").doc(player.uid);
    batch.update(playerArenaRef, {
      rank: rank,
      rewards: rewards,
      updatedAt: now
    });

    // Update User Global Profile
    const userRef = db.collection("users").doc(player.uid);
    batch.update(userRef, {
      xp: admin.firestore.FieldValue.increment(rewards.xp),
      coins: admin.firestore.FieldValue.increment(rewards.coins),
      crowns: admin.firestore.FieldValue.increment(rewards.crowns),
      totalGames: admin.firestore.FieldValue.increment(1),
      totalWins: admin.firestore.FieldValue.increment(rank === 1 ? 1 : 0),
      totalCorrectAnswers: admin.firestore.FieldValue.increment(player.correctAnswersCount || 0),
      updatedAt: now
    });

    playerResults.push({
      uid: player.uid,
      name: player.name,
      rank,
      rewards
    });
  }

  // Update Arena Status
  batch.update(arenaRef, {
    status: "finished",
    rewardsDistributed: true,
    finishedAt: now,
    updatedAt: now
  });

  await batch.commit();

  return {
    status: "finished",
    results: playerResults
  };
});
