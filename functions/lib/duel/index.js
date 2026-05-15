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
exports.onDuelUpdate = void 0;
const v1_1 = require("firebase-functions/v1");
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
/**
 * Triggered when a duel document is updated.
 * Distributes rewards when the duel status changes to 'completed'.
 */
exports.onDuelUpdate = v1_1.firestore.document("duels/{duelId}").onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();
    if (!newData || !oldData)
        return null;
    // Trigger only when status changes to 'completed'
    if (newData.status === "completed" && oldData.status !== "completed") {
        const duelId = context.params.duelId;
        const participantIds = newData.participantIds || [];
        const winnerIds = newData.winnerIds || [];
        const isTie = newData.isTie || false;
        const rewardConfig = newData.rewardConfig || { xp: 0, coins: 0, crowns: 0 };
        const participants = newData.participants || {};
        const totalRounds = newData.totalRounds || 1;
        console.log(`[Duel Rewards] Processing completion for duel: ${duelId}`);
        for (const uid of participantIds) {
            const rewardKey = `rewardsGranted_${uid}`;
            // Avoid duplicate rewards
            if (newData[rewardKey] === true) {
                console.log(`[Duel Rewards] User ${uid} already received rewards for duel ${duelId}`);
                continue;
            }
            // Determine outcome for this player
            let outcome = 'loss';
            if (isTie)
                outcome = 'tie';
            else if (winnerIds.includes(uid))
                outcome = 'win';
            // Calculate rewards based on outcome
            let xp = 0;
            let coins = 0;
            let crowns = 0;
            if (outcome === 'win') {
                xp = rewardConfig.xp;
                coins = rewardConfig.coins;
                crowns = rewardConfig.crowns;
            }
            else if (outcome === 'tie') {
                xp = Math.floor(rewardConfig.xp * 0.5);
                coins = Math.floor(rewardConfig.coins * 0.5);
                crowns = Math.floor(rewardConfig.crowns * 0.3);
            }
            else {
                xp = Math.floor(rewardConfig.xp * 0.2);
                coins = Math.floor(rewardConfig.coins * 0.2);
                crowns = 0;
            }
            const pData = participants[uid] || {};
            const correctAnswers = pData.correctAnswers || 0;
            const totalQuestionsPlayed = totalRounds * 10; // 10 questions per round
            // Use a transaction to ensure accuracy calculation is correct
            const userRef = db.collection("users").doc(uid);
            try {
                await db.runTransaction(async (transaction) => {
                    const userSnap = await transaction.get(userRef);
                    if (!userSnap.exists)
                        return;
                    const userData = userSnap.data() || {};
                    const currentTotalCorrect = userData.totalCorrectAnswers || 0;
                    const currentTotalPlayed = userData.totalQuestionsPlayed || 0;
                    const newTotalCorrect = currentTotalCorrect + correctAnswers;
                    const newTotalPlayed = currentTotalPlayed + totalQuestionsPlayed;
                    const accuracyRate = newTotalPlayed > 0 ? (newTotalCorrect / newTotalPlayed) : 0;
                    const updateData = {
                        xp: admin.firestore.FieldValue.increment(xp),
                        coins: admin.firestore.FieldValue.increment(coins),
                        crowns: admin.firestore.FieldValue.increment(crowns),
                        totalGames: admin.firestore.FieldValue.increment(1),
                        totalCorrectAnswers: admin.firestore.FieldValue.increment(correctAnswers),
                        totalQuestionsPlayed: admin.firestore.FieldValue.increment(totalQuestionsPlayed),
                        accuracyRate: accuracyRate,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    };
                    if (outcome === 'win') {
                        updateData.totalWins = admin.firestore.FieldValue.increment(1);
                    }
                    else if (outcome === 'loss') {
                        updateData.totalLosses = admin.firestore.FieldValue.increment(1);
                    }
                    transaction.update(userRef, updateData);
                    // Mark as granted in the duel
                    transaction.update(change.after.ref, {
                        [rewardKey]: true
                    });
                });
                console.log(`[Duel Rewards] Successfully rewarded user ${uid} for duel ${duelId}`);
            }
            catch (err) {
                console.error(`[Duel Rewards] Failed to reward user ${uid}:`, err);
            }
        }
    }
    return null;
});
//# sourceMappingURL=index.js.map