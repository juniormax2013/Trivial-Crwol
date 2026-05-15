import { auth, db } from '../firebase';
import { doc, setDoc, writeBatch, collection } from 'firebase/firestore';

export async function seedTournaments() {
  const batch = writeBatch(db);

  // Tournament 1: Registration Open
  const t1 = doc(collection(db, 'tournaments'));
  batch.set(t1, {
    title: "Torneo de los Evangelios",
    subtitle: "Pon a prueba tu conocimiento sobre la vida de Jesús",
    type: "trivia",
    difficulty: "medium",
    status: "registration_open",
    rewardConfig: { crowns: 500, xp: 300, badge: 'evangelios_master' },
    maxParticipants: 100,
    currentParticipants: 0,
    registrationStartsAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Tournament 2: Active
  const t2 = doc(collection(db, 'tournaments'));
  batch.set(t2, {
    title: "Copa de Sabiduría",
    subtitle: "Compite por la corona del conocimiento",
    type: "trivia",
    difficulty: "hard",
    status: "active",
    currentRound: 2,
    maxParticipants: 50,
    currentParticipants: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Seed participant in T2
  const p2 = doc(t2, 'participants', 'seed_user_id'); // We'll assume a random string or let auth user create
  batch.set(p2, {
    userId: 'seed_user_id',
    displayName: "Sample User",
    avatarUrl: "",
    status: "active",
    score: 120,
    correctAnswers: 5,
    wrongAnswers: 1,
    averageResponseTimeMs: 4500,
    currentRank: 1,
    matchesPlayed: 1
  });

  // Tournament 3: Completed
  const t3 = doc(collection(db, 'tournaments'));
  batch.set(t3, {
    title: "Gran Desafío de Proverbios",
    subtitle: "Un torneo para los amantes de la sabiduría",
    type: "trivia",
    difficulty: "medium",
    status: "completed",
    maxParticipants: 200,
    currentParticipants: 200,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await batch.commit();
  console.log("Tournaments seeded successfully!");
}
