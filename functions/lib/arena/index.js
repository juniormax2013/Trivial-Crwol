"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeArenaMatch = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
/**
 * Callable function to finalize an Arena match and distribute rewards.
 * This should be called once by the host (or automatically by a trigger if we had one).
 */
exports.completeArenaMatch = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Falta autenticación.");
    }
    const { arenaId } = request.data;
    if (!arenaId) {
        throw new https_1.HttpsError("invalid-argument", "arenaId es requerido.");
    }
    const arenaRef = db.collection("arenas").doc(arenaId);
    const arenaSnap = await arenaRef.get();
    if (!arenaSnap.exists) {
        throw new https_1.HttpsError("not-found", "Arena no encontrada.");
    }
    const arenaData = arenaSnap.data();
    // Prevent multiple executions for the same arena
    if (arenaData.status === "finished" && arenaData.rewardsDistributed) {
        return { status: "already_finished", message: "Las recompensas ya fueron distribuidas." };
    }
    // Get all players
    const playersSnap = await arenaRef.collection("players").get();
    if (playersSnap.empty) {
        throw new https_1.HttpsError("failed-precondition", "No hay jugadores en esta arena.");
    }
    const players = playersSnap.docs.map(d => (Object.assign({ uid: d.id }, d.data())));
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
    const getRewards = (rank) => {
        switch (rank) {
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
//# sourceMappingURL=index.js.map