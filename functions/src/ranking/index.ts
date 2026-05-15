import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

const db = admin.firestore();

// Ejemplo de las ligas con sus umbrales
const LEAGUES = [
  { id: "bronze", min: 0, max: 299 },
  { id: "silver", min: 300, max: 699 },
  { id: "gold", min: 700, max: 1199 },
  { id: "platinum", min: 1200, max: 1799 },
  { id: "diamond", min: 1800, max: 2499 },
  { id: "crown_master", min: 2500, max: 999999 }
];

function determineLeague(points: number): string {
    const l = LEAGUES.find(le => points >= le.min && points <= le.max);
    return l ? l.id : "bronze";
}

/**
 * Callable para actualizar puntos de rango post-partida.
 * En un sistema real, esto sería invocado por triggers internos de Firestore
 * o mediante una function privada tras completar un duelo Ranked.
 * Lo expondremos como Callable protegido para la MVP.
 */
export const updateRankedPoints = onCall(async (request) => {
    // Si queremos bloquear este endpoint para que solo ciertos "servicios" o calls autenticados (juez)
    // lo procesen, en un entorno de Serverless, esto debe llamarse desde otro trigger.
    // Para simplificar la MVP, se recibe desde el cliente y se valida (simulando).
    
    if (!request.auth) throw new HttpsError("unauthenticated", "Auth requerida");
    const uid = request.auth.uid;
    const { outcome } = request.data; // 'win', 'loss', 'tie'

    let pointsDelta = 0;
    if (outcome === "win") pointsDelta = 30;
    else if (outcome === "loss") pointsDelta = -15;
    else if (outcome === "tie") pointsDelta = 5;
    else throw new HttpsError("invalid-argument", "Outcome no válido");

    const userRef = db.collection("users").doc(uid);
    const rankingRef = db.collection("user_rankings").doc(uid);

    await db.runTransaction(async (transaction) => {
        const rDoc = await transaction.get(rankingRef);
        
        let newPoints = pointsDelta;
        let currentLeague = "bronze";

        if (rDoc.exists) {
            const currentPoints = rDoc.data()!.rankedPoints || 0;
            newPoints = Math.max(0, currentPoints + pointsDelta);
            currentLeague = determineLeague(newPoints);

            transaction.update(rankingRef, {
                rankedPoints: newPoints,
                leagueId: currentLeague,
                wins: admin.firestore.FieldValue.increment(outcome === 'win' ? 1 : 0),
                losses: admin.firestore.FieldValue.increment(outcome === 'loss' ? 1 : 0),
                ties: admin.firestore.FieldValue.increment(outcome === 'tie' ? 1 : 0),
                rankedGamesPlayed: admin.firestore.FieldValue.increment(1),
                lastMatchAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        } else {
            currentLeague = determineLeague(newPoints);
            transaction.set(rankingRef, {
                userId: uid,
                currentSeasonId: "season_1",
                rankedPoints: newPoints,
                leagueId: currentLeague,
                division: 1,
                wins: outcome === 'win' ? 1 : 0,
                losses: outcome === 'loss' ? 1 : 0,
                ties: outcome === 'tie' ? 1 : 0,
                rankedGamesPlayed: 1,
                lastMatchAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        // También sincronizamos el user global para accesos rápidos
        transaction.update(userRef, {
            rankedPoints: newPoints
        });
    });

    return { success: true };
});
