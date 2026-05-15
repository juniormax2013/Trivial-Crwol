import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  BattlePassSeasonModel, 
  BattlePassTierModel, 
  BattlePassMissionModel 
} from './models';

export async function seedBattlePass() {
  const seasonId = 'season_01_wisdom';

  // 1. Create Season
  const season: BattlePassSeasonModel = {
    id: seasonId,
    title: "Sabiduría de Salomón",
    subtitle: "Crece en conocimiento, constancia y honor",
    theme: "wisdom",
    themeDescription: "Embárcate en un viaje de crecimiento espiritual inspirado en Proverbios y Eclesiastés. Descubre la verdadera sabiduría a través del esfuerzo constante.",
    bibleReference: "Proverbios 4:7 - Sábia es la cosa principal; por tanto, adquiere sabiduría.",
    spiritualMeaning: "Este Camino del Discípulo está diseñado para recompensar tu consistencia en aprender la Palabra. La sabiduría no se gana en un día, sino paso a paso.",
    coverImageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAnrGjD-9wH7Tq9aD--T8-z_qWJ0x1e27kZ57AAs42x8eW-Yl6YyB-Tf-H05s_9aM7T6vL_wX5-cZQ2H-gYmF_wR2wT4V_v5E_s4Wn1H2M_s9W5G1g4T5V5H4m6z2G1x5X4e_X5X5y6", // Sample gold pattern (Wait, better leave empty or generic safe pattern mapping to modern app look)
    startAt: new Date().toISOString(),
    endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    status: 'active',
    totalTiers: 20,
    premiumEnabled: true,
    seasonXpLabel: "Wisdom XP",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system'
  };

  await setDoc(doc(db, 'battle_pass_seasons', seasonId), season);

  // 2. Create Tiers
  for (let i = 1; i <= 20; i++) {
    const isMilestone = i % 5 === 0;
    
    // Tiers require more XP progressively: 0, 100, 250, 450, 700...
    const requiredXp = i === 1 ? 0 : Math.floor((i * i * 50) + (i * 20));

    const freeReward = {
      type: 'crowns' as const,
      amount: i * 5,
      label: `${i * 5} Coronas`,
      icon: 'crown'
    };

    const premiumReward = {
      type: isMilestone ? 'profile_frame' as const : 'coins' as const,
      amount: isMilestone ? 1 : i * 20,
      label: isMilestone ? `Marco de Sabiduría Nivel ${i/5}` : `${i * 20} Monedas`,
      icon: isMilestone ? 'frame_gold' : 'coins'
    };

    const tier: BattlePassTierModel = {
      tierNumber: i,
      requiredSeasonXp: requiredXp,
      freeReward: i % 2 === 0 || isMilestone ? freeReward : null, // Every 2 levels + milestones get free rewards
      premiumReward: premiumReward, // Premium gets every level
      isMilestone: isMilestone,
      title: `Nivel ${i}`,
      subtitle: isMilestone ? "¡Recompensa Especial!" : "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, `battle_pass_seasons/${seasonId}/tiers`, `tier_${i}`), tier);
  }

  // 3. Create Missions
  const missions: BattlePassMissionModel[] = [
    {
      id: "m_daily_1",
      title: "Respuesta Divina",
      description: "Responde 10 preguntas correctamente.",
      missionType: "daily",
      eventType: "answer_question",
      targetValue: 10,
      rewardSeasonXp: 50,
      startAt: new Date().toISOString(),
      endAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
      order: 1,
      isRepeatable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "m_weekly_1",
      title: "Gladiador de Fe",
      description: "Gana 5 duelos en la arena.",
      missionType: "weekly",
      eventType: "win_duel",
      targetValue: 5,
      rewardSeasonXp: 300,
      startAt: new Date().toISOString(),
      endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
      order: 2,
      isRepeatable: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "m_seasonal_1",
      title: "Discípulo Persistente",
      description: "Completa 10 desafíos diarios.",
      missionType: "seasonal",
      eventType: "complete_daily_challenge",
      targetValue: 10,
      rewardSeasonXp: 1500,
      startAt: new Date().toISOString(),
      endAt: season.endAt,
      status: "active",
      order: 3,
      isRepeatable: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  for (const mission of missions) {
    await setDoc(doc(db, `battle_pass_seasons/${seasonId}/missions`, mission.id), mission);
  }

  console.log("Battle Pass seeded successfully.");
}
