import { db } from '../firebase';
import { doc, setDoc, writeBatch, collection } from 'firebase/firestore';

export async function seedLeagues() {
  const batch = writeBatch(db);

  const leagues = [
    { id: "bronze", name: "Bronce", minPoints: 0, maxPoints: 299, order: 1, color: "#CD7F32", divisionCount: 3 },
    { id: "silver", name: "Plata", minPoints: 300, maxPoints: 699, order: 2, color: "#C0C0C0", divisionCount: 3 },
    { id: "gold", name: "Oro", minPoints: 700, maxPoints: 1199, order: 3, color: "#FFD700", divisionCount: 3 },
    { id: "platinum", name: "Platino", minPoints: 1200, maxPoints: 1799, order: 4, color: "#E5E4E2", divisionCount: 3 },
    { id: "diamond", name: "Diamante", minPoints: 1800, maxPoints: 2499, order: 5, color: "#b9f2ff", divisionCount: 3 },
    { id: "crown_master", name: "Corona Maestra", minPoints: 2500, maxPoints: 999999, order: 6, color: "#8a2be2", divisionCount: 1 }
  ];

  for (const l of leagues) {
    const lRef = doc(collection(db, 'ranking_leagues'), l.id);
    batch.set(lRef, l);
  }

  // Active season
  const sRef = doc(collection(db, 'ranking_seasons'), 'season_1');
  batch.set(sRef, {
      title: "Temporada de la Revelación",
      status: "active",
      startAt: new Date(),
      endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      rewardConfig: { crown_master: 1000, diamond: 500, gold: 200 }
  });

  await batch.commit();
  console.log("Leagues and Active Season seeded successfully!");
}
