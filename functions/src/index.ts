import { onCall, HttpsError, CallableRequest } from "firebase-functions/v2/https";
import { beforeUserCreated, AuthBlockingEvent } from "firebase-functions/v2/identity";
import * as v1 from "firebase-functions/v1";
import * as admin from "firebase-admin";

admin.initializeApp();


const db = admin.firestore();

// -----------------------------------------------------------------
// PLAYER FUNCTIONS MVP
// -----------------------------------------------------------------

/**
 * Triggered when a new user signs up.
 * Creates a default user document in Firestore.
 */
export const createUserProfile = v1.auth.user().onCreate(async (user: admin.auth.UserRecord) => {
  if (!user) return;
  
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
export const startQuickGame = onCall(async (request: CallableRequest) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión para jugar.");
  }
  
  const { categoryIds, mode="quick_play" } = request.data;
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
export const submitGameAnswer = onCall(async (request: CallableRequest) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión.");
  }
  
  const { gameId, questionId, selectedOptionId, responseTimeMs } = request.data;
  const uid = request.auth.uid;
  
  // Verify game ownership and active status
  const gameRef = db.collection("games").doc(gameId);
  const gameSnap = await gameRef.get();
  
  if (!gameSnap.exists || gameSnap.data()?.userId !== uid || gameSnap.data()?.status !== "active") {
    throw new HttpsError("failed-precondition", "Juego no válido o finalizado.");
  }
  
  // Verify answer
  const questionSnap = await db.collection("questions").doc(questionId).get();
  if (!questionSnap.exists) {
    throw new HttpsError("not-found", "Pregunta no encontrada.");
  }
  
  const qData = questionSnap.data()!;
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
export const finishGame = onCall(async (request: CallableRequest) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Falta autenticación.");
  }
  
  const { gameId } = request.data;
  const uid = request.auth.uid;
  
  const gameRef = db.collection("games").doc(gameId);
  const gameSnap = await gameRef.get();
  
  if (!gameSnap.exists || gameSnap.data()?.userId !== uid || gameSnap.data()?.status !== "active") {
    throw new HttpsError("failed-precondition", "Juego inválido.");
  }
  
  const gData = gameSnap.data()!;
  
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
export const grantDailyReward = onCall(async (request: CallableRequest) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Falta autenticación.");
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
export const assignAdminRole = onCall(async (request: CallableRequest) => {
  if (!request.auth || !request.auth.token.admin) {
    // Only super_admin can do this. The first admin should be established via Firebase CLI / Custom script.
    throw new HttpsError("permission-denied", "Acceso denegado.");
  }

  const { uid, role } = request.data;
  
  if (!["super_admin", "editor", "reviewer", "moderator", "support"].includes(role)) {
    throw new HttpsError("invalid-argument", "Rol no válido.");
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
export const importQuestionsFromCsv = onCall(async (request: CallableRequest) => {
  if (!request.auth || !request.auth.token.role) {
    throw new HttpsError("permission-denied", "Solo administradores pueden importar.");
  }
  
  const { questions } = request.data; // Expecting an array of question objects
  if (!Array.isArray(questions)) {
    throw new HttpsError("invalid-argument", "Debe enviar un array de preguntas.");
  }
  
  const batch = db.batch();
  let count = 0;
  
  for (const q of questions) {
    const qRef = db.collection("questions").doc();
    batch.set(qRef, {
      ...q,
      status: q.status || "draft",
      createdBy: request.auth.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
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
export const auditAdminAction = v1.firestore.document("system_settings/{docId}").onWrite(async (change: v1.Change<v1.firestore.DocumentSnapshot>, context: v1.EventContext) => {
    if (!change) return;
    
    // If it's an update or delete, we log the action
    const beforeData = change.before.exists ? change.before.data() : null;
    const afterData = change.after.exists ? change.after.data() : null;
    
    // Note: To capture who did it, usually you either pass the uid in the document being written,
    // or you rely on Cloud Audit Logs. But for a simple trigger, the user info is not completely available 
    // without passing it inside the doc. Assuming 'updatedBy' is provided:
    const actorUid = afterData?.updatedBy || "unknown";

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
export const beforeCreate = beforeUserCreated((event: AuthBlockingEvent) => {
  console.log(`Checking user ${event.data?.uid} before creation`);
  // Add custom logic here if needed, e.g., blocking certain emails or setting claims
  return;
});

// -----------------------------------------------------------------
// TOURNAMENT FUNCTIONS
// -----------------------------------------------------------------
export * from "./tournaments";

// -----------------------------------------------------------------
// RANKING & LEAGUES FUNCTIONS
// -----------------------------------------------------------------
export * from "./ranking";
// -----------------------------------------------------------------
// ARENA FUNCTIONS
// -----------------------------------------------------------------
export * from "./arena";
// -----------------------------------------------------------------
// DUEL FUNCTIONS
// -----------------------------------------------------------------
export * from "./duel";

// -----------------------------------------------------------------
// NOTIFICATION FUNCTIONS
// -----------------------------------------------------------------
export * from "./notifications";
