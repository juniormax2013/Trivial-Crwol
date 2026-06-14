// ---------------------------------------------------------------
// REFERRAL MODULE — DATA MODELS
// ---------------------------------------------------------------

/**
 * REFERRAL CODE DOCUMENT (Stored in referralCodes/{code})
 * Maps a unique referral code to the user who generated it.
 */
export interface ReferralCodeDoc {
  code: string;
  uid: string;
  createdAt: string;
}

/**
 * REFERRAL RELATION DOCUMENT (Stored in referrals/{referredUid})
 * Documents the referral link between a referred user and their referrer.
 */
export interface ReferralRelationDoc {
  referredUid: string;
  referrerUid: string;
  status: 'registered' | 'qualified';
  createdAt: string;
  qualifiedAt?: string;
  firstGameId?: string;
  rewardClaimed?: boolean;
}

/**
 * REFERRAL STATS
 * Aggregated statistics stored on the referrer's profile to track progress.
 */
export interface ReferralStats {
  registeredCount: number;
  qualifiedCount: number;
  claimedLevels: number[]; // e.g. [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
}

/**
 * REFERRAL REWARDS DEFINITIONS
 */
export interface ReferralReward {
  level: number;
  requiredQualified: number;
  rewardDescription: {
    es: string;
    en: string;
    fr: string;
    ht: string;
  };
  coins: number;
  gems: number;
  crowns: number;
  jweEnergy: number;
  frameId?: string;
}

/**
 * The 10 levels of progressive rewards.
 */
export const REFERRAL_REWARDS: ReferralReward[] = [
  {
    level: 1,
    requiredQualified: 1,
    rewardDescription: {
      es: "Nivel 1: Iniciación Santa (+500 monedas, +5 gemas, +1 corona)",
      en: "Level 1: Holy Initiation (+500 coins, +5 gems, +1 crown)",
      fr: "Niveau 1: Initiation Sainte (+500 pièces, +5 gemmes, +1 couronne)",
      ht: "Nivo 1: Inisyasyon Sen (+500 pyès monnen, +5 gems, +1 kouròn)"
    },
    coins: 500,
    gems: 5,
    crowns: 1,
    jweEnergy: 5
  },
  {
    level: 2,
    requiredQualified: 2,
    rewardDescription: {
      es: "Nivel 2: Discípulo de la Palabra (+1,000 monedas, +10 gemas, +2 coronas)",
      en: "Level 2: Disciple of the Word (+1,000 coins, +10 gems, +2 crowns)",
      fr: "Niveau 2: Disciple de la Parole (+1 000 pièces, +10 gemmes, +2 couronnes)",
      ht: "Nivo 2: Disip Pawòl la (+1,000 pyès monnen, +10 gems, +2 kouròn)"
    },
    coins: 1000,
    gems: 10,
    crowns: 2,
    jweEnergy: 10
  },
  {
    level: 3,
    requiredQualified: 3,
    rewardDescription: {
      es: "Nivel 3: Compañero de Fe (+1,500 monedas, +15 gemas, +3 coronas)",
      en: "Level 3: Companion of Faith (+1,500 coins, +15 gems, +3 crowns)",
      fr: "Niveau 3: Compagnon de Foi (+1 500 pièces, +15 gemmes, +3 couronnes)",
      ht: "Nivo 3: Konpayon lafwa (+1,500 pyès monnen, +15 gems, +3 kouròn)"
    },
    coins: 1500,
    gems: 15,
    crowns: 3,
    jweEnergy: 15
  },
  {
    level: 4,
    requiredQualified: 4,
    rewardDescription: {
      es: "Nivel 4: Mensajero de Verdad (+2,000 monedas, +20 gemas, +4 coronas)",
      en: "Level 4: Messenger of Truth (+2,000 coins, +20 gems, +4 crowns)",
      fr: "Niveau 4: Messager de Vérité (+2 000 pièces, +20 gemmes, +4 couronnes)",
      ht: "Nivo 4: Mesaje verite (+2,000 pyès monnen, +20 gems, +4 kouròn)"
    },
    coins: 2000,
    gems: 20,
    crowns: 4,
    jweEnergy: 20
  },
  {
    level: 5,
    requiredQualified: 5,
    rewardDescription: {
      es: "Nivel 5: Evangelista de la Corona (+3,000 monedas, +30 gemas, +5 coronas, Marco Exclusivo: Evangelista)",
      en: "Level 5: Crown Evangelist (+3,000 coins, +30 gems, +5 crowns, Exclusive Frame: Evangelist)",
      fr: "Niveau 5: Évangéliste de la Couronne (+3 000 pièces, +30 gemmes, +5 couronnes, Cadre Exclusif: Évangéliste)",
      ht: "Nivo 5: Evanjelis Kouròn lan (+3,000 pyès monnen, +30 gems, +5 kouròn, Kad Eksklizif: Evanjelis)"
    },
    coins: 3000,
    gems: 30,
    crowns: 5,
    jweEnergy: 30,
    frameId: "evangelist_frame"
  },
  {
    level: 6,
    requiredQualified: 6,
    rewardDescription: {
      es: "Nivel 6: Sembrador de Luz (+4,000 monedas, +35 gemas, +6 coronas)",
      en: "Level 6: Sower of Light (+4,000 coins, +35 gems, +6 crowns)",
      fr: "Niveau 6: Semeur de Lumière (+4 000 pièces, +35 gemmes, +6 couronnes)",
      ht: "Nivo 6: Moun k'ap simen limyè (+4,000 pyès monnen, +35 gems, +6 kouròn)"
    },
    coins: 4000,
    gems: 35,
    crowns: 6,
    jweEnergy: 35
  },
  {
    level: 7,
    requiredQualified: 7,
    rewardDescription: {
      es: "Nivel 7: Guardián del Templo (+5,000 monedas, +40 gemas, +7 coronas)",
      en: "Level 7: Guardian of the Temple (+5,000 coins, +40 gems, +7 crowns)",
      fr: "Niveau 7: Gardien du Temple (+5 000 pièces, +40 gemmes, +7 couronnes)",
      ht: "Nivo 7: Gadyen Tanp lan (+5,000 pyès monnen, +40 gems, +7 kouròn)"
    },
    coins: 5000,
    gems: 40,
    crowns: 7,
    jweEnergy: 40
  },
  {
    level: 8,
    requiredQualified: 8,
    rewardDescription: {
      es: "Nivel 8: Guerrero Celestial (+6,000 monedas, +45 gemas, +8 coronas)",
      en: "Level 8: Celestial Warrior (+6,000 coins, +45 gems, +8 crowns)",
      fr: "Niveau 8: Guerrier Céleste (+6 000 pièces, +45 gemmes, +8 couronnes)",
      ht: "Nivo 8: Gèrye Selès (+6,000 pyès monnen, +45 gems, +8 kouròn)"
    },
    coins: 6000,
    gems: 45,
    crowns: 8,
    jweEnergy: 45
  },
  {
    level: 9,
    requiredQualified: 9,
    rewardDescription: {
      es: "Nivel 9: Apóstol del Saber (+8,000 monedas, +50 gemas, +9 coronas)",
      en: "Level 9: Apostle of Knowledge (+8,000 coins, +50 gems, +9 crowns)",
      fr: "Niveau 9: Apôtre du Savoir (+8 000 pièces, +50 gemmes, +9 couronnes)",
      ht: "Nivo 9: Apot Konesans (+8,000 pyès monnen, +50 gems, +9 kouròn)"
    },
    coins: 8000,
    gems: 50,
    crowns: 9,
    jweEnergy: 50
  },
  {
    level: 10,
    requiredQualified: 10,
    rewardDescription: {
      es: "Nivel 10: Leyenda de la Corona (+10,000 monedas, +100 gemas, +10 coronas, Marco Exclusivo: Leyenda)",
      en: "Level 10: Legend of the Crown (+10,000 coins, +100 gems, +10 crowns, Exclusive Frame: Legend)",
      fr: "Niveau 10: Légende de la Couronne (+10 000 pièces, +100 gemmes, +10 couronnes, Cadre Exclusif: Légende)",
      ht: "Nivo 10: Lejann nan Kouròn lan (+10,000 pyès monnen, +100 gems, +10 kouròn, Kad Eksklizif: Lejann)"
    },
    coins: 10000,
    gems: 100,
    crowns: 10,
    jweEnergy: 100,
    frameId: "legend_frame"
  }
];
