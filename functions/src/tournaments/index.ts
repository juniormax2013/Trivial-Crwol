import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const joinTournament = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión para unirte.");
  }
  const uid = request.auth.uid;
  const { tournamentId } = request.data;
  if (!tournamentId) throw new HttpsError("invalid-argument", "tournamentId requerido");

  // Usamos una trasacción para asegurar el cupo
  const result = await db.runTransaction(async (transaction) => {
    const tRef = db.collection("tournaments").doc(tournamentId);
    const pRef = tRef.collection("participants").doc(uid);

    const tDoc = await transaction.get(tRef);
    if (!tDoc.exists) throw new HttpsError("not-found", "Torneo no existe");

    const tData = tDoc.data()!;
    if (tData.status !== "registration_open") {
      throw new HttpsError("failed-precondition", "El registro está cerrado.");
    }
    
    if (tData.currentParticipants >= tData.maxParticipants) {
      throw new HttpsError("resource-exhausted", "El torneo está lleno.");
    }

    const pDoc = await transaction.get(pRef);
    if (pDoc.exists) {
      throw new HttpsError("already-exists", "Ya estás inscrito en este torneo.");
    }

    const userDoc = await transaction.get(db.collection("users").doc(uid));
    const userData = userDoc.data() || {};

    // Crear participante
    transaction.set(pRef, {
      userId: uid,
      displayName: userData.fullName || userData.email || "Jugador",
      avatarUrl: userData.photoURL || "",
      joinedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "registered",
      score: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      averageResponseTimeMs: 0,
      currentRank: 0,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      ties: 0,
      rewardClaimed: false
    });

    // Subir el conteo
    transaction.update(tRef, {
      currentParticipants: admin.firestore.FieldValue.increment(1)
    });

    // Crear evento
    const eventRef = tRef.collection("events").doc();
    transaction.set(eventRef, {
      type: "joined",
      actorUid: uid,
      message: `${userData.fullName || "Un jugador"} se unió al torneo`,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { status: "registered" };
  });

  return result;
});

export const startTournamentRound = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Auth requerida");
  const uid = request.auth.uid;
  const { tournamentId, roundId } = request.data;
  if (!tournamentId || !roundId) throw new HttpsError("invalid-argument", "Faltan parámetros");

  const tRef = db.collection("tournaments").doc(tournamentId);
  const pRef = tRef.collection("participants").doc(uid);
  const rRef = tRef.collection("rounds").doc(roundId);

  // Todo debe leerse; verificaciones
  const [tDoc, pDoc, rDoc] = await Promise.all([tRef.get(), pRef.get(), rRef.get()]);
  if (!tDoc.exists || !pDoc.exists || !rDoc.exists) throw new HttpsError("not-found", "Recursos no encontrados");

  if (tDoc.data()!.status !== "active") throw new HttpsError("failed-precondition", "El torneo no está activo");
  if (rDoc.data()!.status !== "active") throw new HttpsError("failed-precondition", "La ronda no está activa");
  
  if (pDoc.data()!.status !== "registered" && pDoc.data()!.status !== "active") {
      throw new HttpsError("failed-precondition", "Participante no apto");
  }

  // Comprobar que no haya jugado ya esta ronda.
  // Guardamos las respuestas de ronda del jugador para auditoría antihack en "tournament_round_answers" (Global o subcolección)
  const pRoundRef = pRef.collection("round_state").doc(roundId);
  const pRoundDoc = await pRoundRef.get();
  
  if (pRoundDoc.exists && pRoundDoc.data()!.completed) {
      throw new HttpsError("failed-precondition", "Ya jugegaste esta ronda");
  }

  if (!pRoundDoc.exists) {
      await pRoundRef.set({
          startedAt: admin.firestore.FieldValue.serverTimestamp(),
          completed: false,
          answers: {},
          score: 0,
          correct: 0,
          wrong: 0,
      });
      if (pDoc.data()!.status === "registered") {
          await pRef.update({ status: "active" });
      }
  }

  // Traer las preguntas "limpias" para el usuario (sin id de respuesta correcta)
  const qIds = rDoc.data()!.questionIds || [];
  const questionsData = [];
  
  for (const qId of qIds) {
      const qDoc = await db.collection("questions").doc(qId).get();
      if (qDoc.exists) {
          const qd = qDoc.data()!;
          const opts = qd.options || [];
          questionsData.push({
              id: qDoc.id,
              questionText: qd.questionText,
              options: opts.map((o: { id: string; text: string }) => ({ id: o.id, text: o.text })) // omitimos correctOptionId
          });
      }
  }

  return { questions: questionsData };
});

export const submitTournamentAnswer = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Auth requerida");
  const uid = request.auth.uid;
  const { tournamentId, roundId, questionId, selectedOptionId, responseTimeMs } = request.data;
  
  // Validaciones
  const tRef = db.collection("tournaments").doc(tournamentId);
  const pRoundRef = tRef.collection("participants").doc(uid).collection("round_state").doc(roundId);
  
  const result = await db.runTransaction(async (transaction) => {
      const rDoc = await transaction.get(tRef.collection("rounds").doc(roundId));
      if (!rDoc.exists || rDoc.data()!.status !== "active") {
          throw new HttpsError("failed-precondition", "Ronda no activa");
      }

      const pRoundDoc = await transaction.get(pRoundRef);
      if (!pRoundDoc.exists || pRoundDoc.data()!.completed) {
          throw new HttpsError("failed-precondition", "Ronda no válida o ya completada");
      }

      const prd = pRoundDoc.data()!;
      if (prd.answers && prd.answers[questionId]) {
          throw new HttpsError("already-exists", "Ya respondiste a esta pregunta.");
      }

      const qDoc = await transaction.get(db.collection("questions").doc(questionId));
      if (!qDoc.exists) throw new HttpsError("not-found", "Pregunta inválida");
      
      const qd = qDoc.data()!;
      const isCorrect = qd.correctOptionId === selectedOptionId;
      
      // Calculate points
      let points = 0;
      if (isCorrect) {
          points = 100;
          // Simple speed bonus
          if (responseTimeMs < 5000) points += 50;
          else if (responseTimeMs < 10000) points += 20;
      }
      
      const answerState = {
          selectedOptionId,
          isCorrect,
          responseTimeMs,
          pointsEarned: points,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
      };

      // Guardar el estado
      transaction.update(pRoundRef, {
          [`answers.${questionId}`]: answerState,
          score: admin.firestore.FieldValue.increment(points),
          correct: admin.firestore.FieldValue.increment(isCorrect ? 1 : 0),
          wrong: admin.firestore.FieldValue.increment(isCorrect ? 0 : 1)
      });

      return {
          isCorrect,
          correctOptionId: qd.correctOptionId,
          pointsEarned: points,
          explanation: qd.explanation,
          bibleReference: qd.bibleReference
      };
  });

  return result;
});

export const submitTournamentRound = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Auth requerida");
  const uid = request.auth.uid;
  const { tournamentId, roundId } = request.data;
  
  const pRef = db.collection("tournaments").doc(tournamentId).collection("participants").doc(uid);
  const pRoundRef = pRef.collection("round_state").doc(roundId);

  await db.runTransaction(async (transaction) => {
      const pRoundDoc = await transaction.get(pRoundRef);
      if (!pRoundDoc.exists) throw new HttpsError("failed-precondition", "No hay progreso de ronda");
      
      const prd = pRoundDoc.data()!;
      if (prd.completed) return; // Ya estaba completa, idem.

      // Calcular averageResponseTime
      let totalMs = 0;
      let count = 0;
      for (const key in prd.answers) {
          totalMs += prd.answers[key].responseTimeMs;
          count++;
      }
      const avgMs = count > 0 ? Math.floor(totalMs / count) : 0;
      console.log(`Average time for round: ${avgMs}ms`);

      transaction.update(pRoundRef, {
          completed: true,
          completedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      transaction.update(pRef, {
          score: admin.firestore.FieldValue.increment(prd.score),
          correctAnswers: admin.firestore.FieldValue.increment(prd.correct),
          wrongAnswers: admin.firestore.FieldValue.increment(prd.wrong),
          matchesPlayed: admin.firestore.FieldValue.increment(1)
          // TODO: Average response time logic correctly requires recalculation of whole average.
      });
  });

  return { success: true };
});

export const createTournamentWithRounds = onCall(async (request) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Auth requerida");

  const { title, dateRange, maxParticipants, rewardType, numRounds } = request.data;
  if (!title || !dateRange || !maxParticipants || numRounds == null) {
      throw new HttpsError("invalid-argument", "Missing required parameters");
  }

  // Create tournament doc
  const tRef = db.collection("tournaments").doc();
  
  // Set reward visuals based on simple enum for alpha testing
  let rewardData = { name: "Special Reward", iconType: "medal", imageUrl: "" };
  if (rewardType === "shield") {
      rewardData = { name: "Escudo Sagrado", iconType: "shield", imageUrl: "https://cdn-icons-png.flaticon.com/512/825/825590.png" };
  } else if (rewardType === "coin") {
      rewardData = { name: "Moneda de Gracia", iconType: "coin", imageUrl: "https://cdn-icons-png.flaticon.com/512/2855/2855682.png" };
  } else if (rewardType === "crown") {
      rewardData = { name: "Corona de Fe", iconType: "crown", imageUrl: "https://cdn-icons-png.flaticon.com/512/1000/1000858.png" };
  }

  const tournamentData = {
      title,
      status: "registration_open", // Starts open immediately for simplicity
      dateRange,
      maxParticipants,
      currentParticipants: 0,
      reward: rewardData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: request.auth.uid
  };

  await tRef.set(tournamentData);

  // Generate Rounds
  // We'll just fetch a few questions to assign to the rounds (randomly or first ones)
  const allQsSnap = await db.collection("questions").limit(numRounds * 3).get();
  const docs = allQsSnap.docs;

  for (let i = 0; i < numRounds; i++) {
      const qIds = docs.slice(i * 3, (i * 3) + 3).map(d => d.id);
      
      const rRef = tRef.collection("rounds").doc(`round_${i + 1}`);
      await rRef.set({
          roundIndex: i + 1,
          name: `Ronda ${i + 1}`,
          status: i === 0 ? "active" : "draft", // the first round is active by default
          questionIds: qIds,
          startTime: i === 0 ? admin.firestore.FieldValue.serverTimestamp() : null,
          endTime: null
      });
  }

  return { success: true, tournamentId: tRef.id };
});

