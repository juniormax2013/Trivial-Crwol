import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createTestEvent() {
  const eventId = "copa_sabiduria_biblica_2026";
  const eventRef = doc(db, "clanEvents", eventId);

  const testEvent = {
    title: "Copa de Sabiduría Bíblica",
    description: "Compite junto a tu clan respondiendo preguntas bíblicas. Cada respuesta correcta suma puntos para tu clan. Al final, los mejores clanes recibirán grandes recompensas.",
    type: "CLAN_BATTLE",
    status: "active",
    startAt: new Date().toISOString(),
    endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    bannerUrl: "",
    showInArena: true,
    rules: {
      difficulties: {
        easy: {
          label: "Fácil",
          questionsPerMatch: 20,
          pointsCorrect: 10,
          multiplier: 1
        },
        normal: {
          label: "Normal",
          questionsPerMatch: 30,
          pointsCorrect: 10,
          multiplier: 1.5
        },
        hard: {
          label: "Difícil",
          questionsPerMatch: 40,
          pointsCorrect: 10,
          multiplier: 2
        }
      },
      pointsFastAnswer: 3,
      fastAnswerMaxSeconds: 7,
      pointsStreak5: 25,
      pointsHardQuestion: 20,
      pointsPerfectMatch: 100,
      minContributionToReward: 300,
      maxDailyPointsPerUser: 3000,
      allowedQuestionTypes: [
        "multiple_choice",
        "true_false",
        "complete_phrase",
        "order_events",
        "image_based",
        "trap_question"
      ]
    },
    rewards: {
      top1: {
        coins: 3000,
        crowns: 500,
        clanXp: 1000,
        chest: "legendary"
      },
      top2to5: {
        coins: 2000,
        crowns: 300,
        clanXp: 700,
        chest: "epic"
      },
      top6to20: {
        coins: 1000,
        crowns: 150,
        clanXp: 400,
        chest: "rare"
      },
      participation: {
        coins: 300,
        crowns: 50,
        clanXp: 100,
        chest: "small"
      }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  console.log("Creating test clan event in Firestore...");
  await setDoc(eventRef, testEvent);
  console.log(`Test clan event created successfully! ID: ${eventId}`);
  process.exit(0);
}

createTestEvent().catch((e) => {
  console.error(e);
  process.exit(1);
});
