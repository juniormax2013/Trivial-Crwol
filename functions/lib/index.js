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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.beforeCreate = exports.auditAdminAction = exports.importQuestionsFromCsv = exports.assignAdminRole = exports.grantDailyReward = exports.finishGame = exports.submitGameAnswer = exports.startQuickGame = exports.createUserProfile = void 0;
const https_1 = require("firebase-functions/v2/https");
const identity_1 = require("firebase-functions/v2/identity");
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const db = admin.firestore();
// -----------------------------------------------------------------
// PLAYER FUNCTIONS MVP
// -----------------------------------------------------------------
/**
 * Triggered when a new user signs up.
 * Creates a default user document in Firestore.
 */
exports.createUserProfile = functions.auth.user().onCreate(async (user) => {
    if (!user)
        return;
    const userRef = db.collection("users").doc(user.uid);
    await userRef.set({
        uid: user.uid,
        email: user.email || "",
        fullName: user.displayName || "",
        username: "",
        photoURL: user.photoURL || "",
        provider: user.providerData.length ? user.providerData[0].providerId : "password",
        language: "es", // Default language
        country: "",
        favoriteVerse: "",
        favoriteCategoryId: "",
        bio: "",
        level: 1,
        xp: 0,
        coins: 0,
        gems: 0,
        crowns: 0,
        streakDays: 0,
        bestStreak: 0,
        totalGames: 0,
        totalWins: 0,
        totalLosses: 0,
        totalCorrectAnswers: 0,
        totalWrongAnswers: 0,
        accuracyRate: 0,
        status: "active",
        isProfilePublic: true,
        allowFriendRequests: true,
        allowNotifications: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`User profile created for ${user.uid}`);
});
/**
 * Callable function to start a new quick game.
 */
exports.startQuickGame = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Debes iniciar sesión para jugar.");
    }
    const { categoryIds, mode = "quick_play" } = request.data;
    const uid = request.auth.uid;
    // Create a new game document
    const gameRef = db.collection("games").doc();
    // Note: Question selection logic should ideally happen here.
    // For the MVP, we just initialize the game doc.
    await gameRef.set({
        userId: uid,
        mode: mode,
        categoryIds: categoryIds || [],
        questionIds: [], // To be populated
        score: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        xpEarned: 0,
        coinsEarned: 0,
        crownsEarned: 0,
        averageResponseTimeMs: 0,
        startedAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "active"
    });
    return { gameId: gameRef.id };
});
/**
 * Callable function to submit an answer.
 */
exports.submitGameAnswer = (0, https_1.onCall)(async (request) => {
    var _a, _b;
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Debes iniciar sesión.");
    }
    const { gameId, questionId, selectedOptionId, responseTimeMs } = request.data;
    const uid = request.auth.uid;
    // Verify game ownership and active status
    const gameRef = db.collection("games").doc(gameId);
    const gameSnap = await gameRef.get();
    if (!gameSnap.exists || ((_a = gameSnap.data()) === null || _a === void 0 ? void 0 : _a.userId) !== uid || ((_b = gameSnap.data()) === null || _b === void 0 ? void 0 : _b.status) !== "active") {
        throw new https_1.HttpsError("failed-precondition", "Juego no válido o finalizado.");
    }
    // Verify answer
    const questionSnap = await db.collection("questions").doc(questionId).get();
    if (!questionSnap.exists) {
        throw new https_1.HttpsError("not-found", "Pregunta no encontrada.");
    }
    const qData = questionSnap.data();
    const isCorrect = qData.correctOptionId === selectedOptionId;
    const pointsEarned = isCorrect ? 10 : 0; // Simple logic
    // Save answer
    await gameRef.collection("answers").add({
        questionId,
        selectedOptionId,
        correctOptionId: qData.correctOptionId,
        isCorrect,
        responseTimeMs,
        pointsEarned,
        answeredAt: admin.firestore.FieldValue.serverTimestamp()
    });
    // Update temporary score in game document
    await gameRef.update({
        score: admin.firestore.FieldValue.increment(pointsEarned),
        correctAnswers: admin.firestore.FieldValue.increment(isCorrect ? 1 : 0),
        wrongAnswers: admin.firestore.FieldValue.increment(isCorrect ? 0 : 1)
    });
    return {
        isCorrect,
        correctOptionId: qData.correctOptionId,
        explanation: qData.explanation,
        bibleReference: qData.bibleReference,
        pointsEarned
    };
});
/**
 * Callable function to end the game and calculate final rewards.
 */
exports.finishGame = (0, https_1.onCall)(async (request) => {
    var _a, _b;
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Falta autenticación.");
    }
    const { gameId } = request.data;
    const uid = request.auth.uid;
    const gameRef = db.collection("games").doc(gameId);
    const gameSnap = await gameRef.get();
    if (!gameSnap.exists || ((_a = gameSnap.data()) === null || _a === void 0 ? void 0 : _a.userId) !== uid || ((_b = gameSnap.data()) === null || _b === void 0 ? void 0 : _b.status) !== "active") {
        throw new https_1.HttpsError("failed-precondition", "Juego inválido.");
    }
    const gData = gameSnap.data();
    // Calculate resources earned
    const xpEarned = gData.correctAnswers * 20;
    const coinsEarned = gData.correctAnswers * 5;
    const crownsEarned = gData.correctAnswers >= 5 ? 1 : 0; // Example rule
    // Update Game
    await gameRef.update({
        status: "completed",
        endedAt: admin.firestore.FieldValue.serverTimestamp(),
        xpEarned,
        coinsEarned,
        crownsEarned
    });
    // Update User Stats
    const userRef = db.collection("users").doc(uid);
    await userRef.update({
        xp: admin.firestore.FieldValue.increment(xpEarned),
        coins: admin.firestore.FieldValue.increment(coinsEarned),
        crowns: admin.firestore.FieldValue.increment(crownsEarned),
        totalGames: admin.firestore.FieldValue.increment(1),
        totalCorrectAnswers: admin.firestore.FieldValue.increment(gData.correctAnswers),
        totalWrongAnswers: admin.firestore.FieldValue.increment(gData.wrongAnswers)
    });
    return { status: "completed", xpEarned, coinsEarned, crownsEarned };
});
/**
 * Grant daily reward (Streak)
 */
exports.grantDailyReward = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError("unauthenticated", "Falta autenticación.");
    }
    const uid = request.auth.uid;
    const userRef = db.collection("users").doc(uid);
    // Very simplified version for MVP
    // In production, you would check last login date, timezone, and compare exactly.
    await userRef.update({
        coins: admin.firestore.FieldValue.increment(50),
        streakDays: admin.firestore.FieldValue.increment(1) // Assuming they kept the streak
    });
    return { message: "Recompensa diaria obtenida", coinsGranted: 50 };
});
// -----------------------------------------------------------------
// ADMIN FUNCTIONS MVP
// -----------------------------------------------------------------
/**
 * Assign Custom Claims (Role)
 */
exports.assignAdminRole = (0, https_1.onCall)(async (request) => {
    if (!request.auth || !request.auth.token.admin) {
        // Only super_admin can do this. The first admin should be established via Firebase CLI / Custom script.
        throw new https_1.HttpsError("permission-denied", "Acceso denegado.");
    }
    const { uid, role } = request.data;
    if (!["super_admin", "editor", "reviewer", "moderator", "support"].includes(role)) {
        throw new https_1.HttpsError("invalid-argument", "Rol no válido.");
    }
    await admin.auth().setCustomUserClaims(uid, { role, admin: role === "super_admin" });
    // Also register in admin_users col
    await db.collection("admin_users").doc(uid).set({
        uid,
        role,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    return { message: `Rol ${role} asignado a ${uid}` };
});
/**
 * Import Questions Batch
 */
exports.importQuestionsFromCsv = (0, https_1.onCall)(async (request) => {
    if (!request.auth || !request.auth.token.role) {
        throw new https_1.HttpsError("permission-denied", "Solo administradores pueden importar.");
    }
    const { questions } = request.data; // Expecting an array of question objects
    if (!Array.isArray(questions)) {
        throw new https_1.HttpsError("invalid-argument", "Debe enviar un array de preguntas.");
    }
    const batch = db.batch();
    let count = 0;
    for (const q of questions) {
        const qRef = db.collection("questions").doc();
        batch.set(qRef, Object.assign(Object.assign({}, q), { status: q.status || "draft", createdBy: request.auth.uid, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() }));
        count++;
        // Firestore batches limit to 500
        if (count % 450 === 0) {
            await batch.commit();
        }
    }
    if (count % 450 !== 0) {
        await batch.commit();
    }
    return { message: `${count} preguntas importadas correctamente.` };
});
/**
 * Audit Log Trigger
 */
exports.auditAdminAction = functions.firestore.document("system_settings/{docId}").onWrite(async (change, context) => {
    if (!change)
        return;
    // If it's an update or delete, we log the action
    const beforeData = change.before.exists ? change.before.data() : null;
    const afterData = change.after.exists ? change.after.data() : null;
    // Note: To capture who did it, usually you either pass the uid in the document being written,
    // or you rely on Cloud Audit Logs. But for a simple trigger, the user info is not completely available 
    // without passing it inside the doc. Assuming 'updatedBy' is provided:
    const actorUid = (afterData === null || afterData === void 0 ? void 0 : afterData.updatedBy) || "unknown";
    await db.collection("audit_logs").add({
        actorUid,
        action: !change.before.exists ? "CREATE" : (!change.after.exists ? "DELETE" : "UPDATE"),
        targetCollection: "system_settings",
        targetId: context.params.docId,
        beforeData,
        afterData,
    });
});
/**
 * Blocking function to validate or modify user before creation.
 * v2 Identity implementation as requested.
 */
exports.beforeCreate = (0, identity_1.beforeUserCreated)((event) => {
    var _a;
    console.log(`Checking user ${(_a = event.data) === null || _a === void 0 ? void 0 : _a.uid} before creation`);
    // Add custom logic here if needed, e.g., blocking certain emails or setting claims
    return;
});
// -----------------------------------------------------------------
// TOURNAMENT FUNCTIONS
// -----------------------------------------------------------------
__exportStar(require("./tournaments"), exports);
// -----------------------------------------------------------------
// RANKING & LEAGUES FUNCTIONS
// -----------------------------------------------------------------
__exportStar(require("./ranking"), exports);
// -----------------------------------------------------------------
// ARENA FUNCTIONS
// -----------------------------------------------------------------
__exportStar(require("./arena"), exports);
// -----------------------------------------------------------------
// DUEL FUNCTIONS
// -----------------------------------------------------------------
__exportStar(require("./duel"), exports);
//# sourceMappingURL=index.js.map