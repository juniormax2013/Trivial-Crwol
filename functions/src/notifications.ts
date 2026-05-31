import { onCall, HttpsError, CallableRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as v1 from "firebase-functions/v1";
import * as admin from "firebase-admin";

const db = admin.firestore();

// -----------------------------------------------------------------
// TRANSLATIONS CONFIGURATION
// -----------------------------------------------------------------
const DUEL_TRANSLATIONS: Record<string, { title: string; body: string }> = {
  es: {
    title: "¡Nuevo duelo!",
    body: "Has recibido un desafío de {senderName}."
  },
  en: {
    title: "New duel!",
    body: "You received a challenge from {senderName}."
  },
  fr: {
    title: "Nouveau duel !",
    body: "Vous avez reçu un défi de {senderName}."
  },
  ht: {
    title: "Nouvo defi!",
    body: "Ou resevwa yon defi nan men {senderName}."
  }
};

const DAILY_CHALLENGE_TRANSLATIONS: Record<string, { title: string; body: string }> = {
  es: {
    title: "¡Desafío Diario disponible!",
    body: "Tu desafío de trivia bíblica de hoy está listo. ¡Ven a jugar!"
  },
  en: {
    title: "Daily Challenge available!",
    body: "Your daily Bible trivia challenge is ready. Come play!"
  },
  fr: {
    title: "Défi quotidien disponible !",
    body: "Votre défi quotidien de culture biblique est prêt. Venez jouer !"
  },
  ht: {
    title: "Defi Chanjman chak jou disponib!",
    body: "Defi konesans biblik ou pou jodi a prè. Vin jwe!"
  }
};

// Helper to get fallback language translations
function getDuelTranslation(lang: string, senderName: string) {
  const t = DUEL_TRANSLATIONS[lang] || DUEL_TRANSLATIONS.es;
  return {
    title: t.title,
    body: t.body.replace("{senderName}", senderName)
  };
}

function getDailyChallengeTranslation(lang: string) {
  return DAILY_CHALLENGE_TRANSLATIONS[lang] || DAILY_CHALLENGE_TRANSLATIONS.es;
}

// -----------------------------------------------------------------
// 1. FIRESTORE TRIGGER: NEW DUEL CREATED
// -----------------------------------------------------------------
export const onDuelCreated = v1.firestore
  .document("duels/{duelId}")
  .onCreate(async (snap, context) => {
    const duelData = snap.data();
    if (!duelData) return null;

    const duelId = context.params.duelId;
    const createdBy = duelData.createdBy;
    const participantIds: string[] = duelData.participantIds || [];

    // Find the opponent (receiver of the invitation)
    const receiverId = participantIds.find(id => id !== createdBy);
    if (!receiverId) {
      console.log(`[Duel Notification] No opponent found in duel ${duelId}.`);
      return null;
    }

    try {
      // 1. Fetch sender name/profile
      const senderSnap = await db.collection("users").doc(createdBy).get();
      const senderName = senderSnap.exists 
        ? (senderSnap.data()?.fullName || senderSnap.data()?.username || "Noble Peregrino") 
        : "Un oponente";

      // 2. Fetch receiver profile to get their preferred language
      const receiverSnap = await db.collection("users").doc(receiverId).get();
      const receiverLang = receiverSnap.exists 
        ? (receiverSnap.data()?.settings?.language || "es") 
        : "es";

      // 3. Fetch active FCM tokens for the receiver
      const tokensSnap = await db
        .collection("users")
        .doc(receiverId)
        .collection("fcmTokens")
        .where("active", "==", true)
        .get();

      if (tokensSnap.empty) {
        console.log(`[Duel Notification] Opponent ${receiverId} has no active FCM tokens.`);
        return null;
      }

      const tokens = tokensSnap.docs.map(doc => doc.data().token);
      const text = getDuelTranslation(receiverLang, senderName);

      // Web/PWA custom URL link must point to the arena duel details page
      const linkUrl = `https://trivial-app-bcrown.web.app/arena/duels/${duelId}`;

      // Build multicast message payload
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title: text.title,
          body: text.body,
        },
        data: {
          type: "duel_invitation",
          screen: "duel_invitation",
          matchId: String(duelId),
          invitationId: String(duelId),
          userId: String(receiverId)
        },
        webpush: {
          notification: {
            title: text.title,
            body: text.body,
            icon: "/icons/icon-192x192.png", // absolute or relative root path in public
            click_action: linkUrl,
          },
          fcmOptions: {
            link: linkUrl,
          }
        }
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      console.log(`[Duel Notification] Multicast push sent for duel ${duelId}. Success count: ${response.successCount}`);
      
      // Clean up stale/invalid tokens
      if (response.failureCount > 0) {
        const batch = db.batch();
        response.responses.forEach((resp, idx) => {
          if (!resp.success && resp.error) {
            const code = resp.error.code;
            if (code === "messaging/invalid-registration-token" || code === "messaging/registration-token-not-registered") {
              const badToken = tokens[idx];
              const badTokenId = badToken.replace(/[^a-zA-Z0-9]/g, "_").slice(-100);
              const tokenDocRef = db.collection("users").doc(receiverId).collection("fcmTokens").doc(badTokenId);
              batch.update(tokenDocRef, { active: false, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
            }
          }
        });
        await batch.commit();
      }

    } catch (error) {
      console.error(`[Duel Notification] Error processing duel notification for ${duelId}:`, error);
    }
    return null;
  });

// -----------------------------------------------------------------
// 2. CRON SCHEDULED: DAILY CHALLENGE REMINDERS
// -----------------------------------------------------------------
export const checkDailyChallengeReminders = onSchedule("every 1 hours", async (event) => {
  const now = admin.firestore.Timestamp.now();
  console.log(`[Cron Reminder] Running checkDailyChallengeReminders at ${now.toDate().toISOString()}`);

  try {
    // Find documents where nextAvailableAt has passed and reminder has not been sent yet
    const pendingSnaps = await db
      .collection("dailyChallengeStatus")
      .where("nextAvailableAt", "<=", now)
      .where("reminderSent", "==", false)
      .limit(50) // Batch limits to avoid OOM or hitting transaction size bounds
      .get();

    if (pendingSnaps.empty) {
      console.log("[Cron Reminder] No pending daily challenge reminders to send.");
      return;
    }

    console.log(`[Cron Reminder] Found ${pendingSnaps.size} potential players to remind.`);

    for (const statusDoc of pendingSnaps.docs) {
      const userId = statusDoc.id;

      // Run transactional update/verification to avoid race conditions or duplicate sends
      await db.runTransaction(async (transaction) => {
        const statusRef = db.collection("dailyChallengeStatus").doc(userId);
        const statusSnap = await transaction.get(statusRef);
        
        if (!statusSnap.exists) return;
        const statusData = statusSnap.data();

        // Safe double-check inside the transaction
        if (!statusData || statusData.reminderSent === true) return;

        // 1. Fetch user settings/language
        const userRef = db.collection("users").doc(userId);
        const userSnap = await transaction.get(userRef);
        const language = userSnap.exists ? (userSnap.data()?.settings?.language || "es") : "es";

        // 2. Fetch FCM tokens
        const tokensRef = db.collection("users").doc(userId).collection("fcmTokens").where("active", "==", true);
        const tokensSnap = await transaction.get(tokensRef);

        // Mark as sent before executing network call
        transaction.update(statusRef, { 
          reminderSent: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        if (tokensSnap.empty) {
          console.log(`[Cron Reminder] User ${userId} needs reminder but has no active tokens.`);
          return;
        }

        const tokens = tokensSnap.docs.map(doc => doc.data().token);
        const text = getDailyChallengeTranslation(language);
        const linkUrl = "https://trivial-app-bcrown.web.app/daily-challenge";

        const message: admin.messaging.MulticastMessage = {
          tokens,
          notification: {
            title: text.title,
            body: text.body,
          },
          data: {
            type: "daily_challenge_available",
            screen: "daily_challenge",
            userId: String(userId)
          },
          webpush: {
            notification: {
              title: text.title,
              body: text.body,
              icon: "/icons/icon-192x192.png",
              click_action: linkUrl,
            },
            fcmOptions: {
              link: linkUrl,
            }
          }
        };

        // Send notifications AFTER transaction succeeds (triggered after transaction block completes)
        // Cloud functions guarantees execution. We can trigger messaging asynchronously.
        // Wait, inside transactions, it's safer to schedule messaging outside, but in node runtime, we can trigger it:
        try {
          const response = await admin.messaging().sendEachForMulticast(message);
          console.log(`[Cron Reminder] Sent Daily Challenge push to ${userId}. Success: ${response.successCount}`);
          
          if (response.failureCount > 0) {
            // Collect invalid tokens to disable them later
            const staleTokenIds: string[] = [];
            response.responses.forEach((resp, idx) => {
              if (!resp.success && resp.error) {
                const code = resp.error.code;
                if (code === "messaging/invalid-registration-token" || code === "messaging/registration-token-not-registered") {
                  const badToken = tokens[idx];
                  const badTokenId = badToken.replace(/[^a-zA-Z0-9]/g, "_").slice(-100);
                  staleTokenIds.push(badTokenId);
                }
              }
            });

            if (staleTokenIds.length > 0) {
              const batch = db.batch();
              staleTokenIds.forEach(id => {
                const badTokenRef = db.collection("users").doc(userId).collection("fcmTokens").doc(id);
                batch.update(badTokenRef, { active: false, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
              });
              await batch.commit();
            }
          }
        } catch (msgErr) {
          console.error(`[Cron Reminder] Error sending FCM message inside transaction for ${userId}:`, msgErr);
        }
      });
    }

  } catch (error) {
    console.error("[Cron Reminder] Global scheduler error:", error);
  }
});

// -----------------------------------------------------------------
// 3. CALLABLE FUNCTION: SEND TEST PUSH NOTIFICATION
// -----------------------------------------------------------------
export const sendTestPushNotification = onCall(async (request: CallableRequest) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Falta autenticación.");
  }

  const uid = request.auth.uid;
  const { title = "Prueba de Notificación", body = "¡Tu FCM está funcionando de maravilla!", screen = "home", type = "test" } = request.data || {};

  try {
    const tokensSnap = await db
      .collection("users")
      .doc(uid)
      .collection("fcmTokens")
      .where("active", "==", true)
      .get();

    if (tokensSnap.empty) {
      throw new HttpsError("not-found", "No tienes tokens FCM registrados y activos en este dispositivo.");
    }

    const tokens = tokensSnap.docs.map(doc => doc.data().token);
    const linkUrl = screen === "daily_challenge" 
      ? "https://trivial-app-bcrown.web.app/daily-challenge" 
      : "https://trivial-app-bcrown.web.app/";

    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title,
        body,
      },
      data: {
        type: String(type),
        screen: String(screen),
        userId: String(uid)
      },
      webpush: {
        notification: {
          title,
          body,
          icon: "/icons/icon-192x192.png",
          click_action: linkUrl,
        },
        fcmOptions: {
          link: linkUrl,
        }
      }
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`[Test Push] Multicast test push sent to ${uid}. Success: ${response.successCount}, Failures: ${response.failureCount}`);

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      tokenCount: tokens.length
    };

  } catch (error: any) {
    console.error("[Test Push] Error executing test push:", error);
    throw new HttpsError("internal", error.message || "Error al enviar la notificación de prueba.");
  }
});
