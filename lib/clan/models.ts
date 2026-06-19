export type ClanRole = 'founder' | 'admin' | 'moderator' | 'member';

export interface ClanModel {
  id: string;
  name: string;
  motto: string;
  icon: string; // The fruit ID (e.g., 'love')
  creatorId: string;
  creatorName: string;
  membersCount: number;
  points: number;
  xp: number;
  createdAt: string;
  power?: number; // Calculated dynamic power
  
  // Custom Settings
  type: 'public' | 'private';
  minLevel: number;
  welcomeMessage: string;
  language: string;
  region: string;
  color: string;
  mutedMembers?: Record<string, string>; // Maps uid to ISO datetime string when mute expires
}

export interface ClanRequestModel {
  id: string;
  clanId: string;
  uid: string;
  username: string;
  fullName: string;
  level: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}


export interface FruitInfo {
  id: string;
  name: Record<'es' | 'en' | 'fr' | 'ht', string>;
  description: Record<'es' | 'en' | 'fr' | 'ht', string>;
  color: string; // Tailwind background gradient/color
  iconColor: string; // Tailwind text color
  imageUrl: string; // Path to the copied PNG file
}

export const SPIRIT_FRUITS: FruitInfo[] = [
  {
    id: 'love',
    name: {
      es: 'Caridad / Amor',
      en: 'Charity / Love',
      fr: 'Charité / Amour',
      ht: 'Karite / Lanmou'
    },
    description: {
      es: 'El vínculo perfecto de unión.',
      en: 'The perfect bond of unity.',
      fr: 'Le lien parfait de l\'unité.',
      ht: 'Lyen pafè inite a.'
    },
    color: 'from-rose-500 to-red-600',
    iconColor: 'text-rose-500',
    imageUrl: '/images/fruits/1.png'
  },
  {
    id: 'joy',
    name: {
      es: 'Gozo',
      en: 'Joy',
      fr: 'Joie',
      ht: 'Jwa'
    },
    description: {
      es: 'Regocijo constante en el Espíritu.',
      en: 'Constant rejoicing in the Spirit.',
      fr: 'Réjouissance constante dans l\'Esprit.',
      ht: 'Lajwa konstan nan Lespri a.'
    },
    color: 'from-amber-400 to-orange-500',
    iconColor: 'text-amber-500',
    imageUrl: '/images/fruits/2.png'
  },
  {
    id: 'peace',
    name: {
      es: 'Paz',
      en: 'Peace',
      fr: 'Paix',
      ht: 'Lapè'
    },
    description: {
      es: 'Tranquilidad que sobrepasa todo entendimiento.',
      en: 'Tranquility that surpasses all understanding.',
      fr: 'La tranquillité qui surpasse toute intelligence.',
      ht: 'Lapè ki depase tout konpreyansyon.'
    },
    color: 'from-sky-400 to-blue-500',
    iconColor: 'text-sky-500',
    imageUrl: '/images/fruits/3.png'
  },
  {
    id: 'patience',
    name: {
      es: 'Paciencia',
      en: 'Patience',
      fr: 'Patience',
      ht: 'Pasyans'
    },
    description: {
      es: 'Resistencia amorosa y constancia.',
      en: 'Loving endurance and perseverance.',
      fr: 'Endurance aimante et persévérance.',
      ht: 'Andirans ak pasyans nan renmen.'
    },
    color: 'from-teal-400 to-emerald-600',
    iconColor: 'text-teal-500',
    imageUrl: '/images/fruits/4.png'
  },
  {
    id: 'kindness',
    name: {
      es: 'Benignidad',
      en: 'Kindness',
      fr: 'Bénignité',
      ht: 'Bonte'
    },
    description: {
      es: 'Dulzura, empatía y trato compasivo.',
      en: 'Gentleness, empathy, and compassionate treatment.',
      fr: 'Douceur, empathie et compassion.',
      ht: 'Dousè, senpati ak bon kè.'
    },
    color: 'from-purple-400 to-indigo-600',
    iconColor: 'text-purple-500',
    imageUrl: '/images/fruits/5.png'
  },
  {
    id: 'goodness',
    name: {
      es: 'Bondad',
      en: 'Goodness',
      fr: 'Bonté',
      ht: 'Byenfesans'
    },
    description: {
      es: 'Hacer el bien activamente a los demás.',
      en: 'Actively doing good to others.',
      fr: 'Faire activement le bien aux autres.',
      ht: 'Fè byen ak lòt moun aktivman.'
    },
    color: 'from-yellow-400 to-amber-600',
    iconColor: 'text-yellow-500',
    imageUrl: '/images/fruits/6.png'
  },
  {
    id: 'faithfulness',
    name: {
      es: 'Fidelidad',
      en: 'Faithfulness',
      fr: 'Fidélité',
      ht: 'Lafwa'
    },
    description: {
      es: 'Lealtad firme y confianza inquebrantable.',
      en: 'Firm loyalty and unwavering trust.',
      fr: 'Loyauté ferme et confiance inébranlable.',
      ht: 'Lwayote fèm ak konfyans ki pa ka brannen.'
    },
    color: 'from-cyan-400 to-blue-600',
    iconColor: 'text-cyan-500',
    imageUrl: '/images/fruits/7.png'
  },
  {
    id: 'gentleness',
    name: {
      es: 'Mansedumbre',
      en: 'Gentleness',
      fr: 'Douceur',
      ht: 'Dousè'
    },
    description: {
      es: 'Fuerza bajo control y humildad.',
      en: 'Strength under control and humility.',
      fr: 'Force sous contrôle et humilité.',
      ht: 'Fòs anba kontwòl ak imilite.'
    },
    color: 'from-pink-400 to-rose-600',
    iconColor: 'text-pink-500',
    imageUrl: '/images/fruits/8.png'
  },
  {
    id: 'self_control',
    name: {
      es: 'Templanza',
      en: 'Self-control',
      fr: 'Maîtrise de soi',
      ht: 'Kontwòl tèt yo'
    },
    description: {
      es: 'Dominio propio frente a los deseos.',
      en: 'Self-mastery over desires and impulses.',
      fr: 'Maîtrise de soi sur les désirs y impulsions.',
      ht: 'Kontwòl sou pwòp tèt ou ak dezi yo.'
    },
    color: 'from-violet-400 to-fuchsia-600',
    iconColor: 'text-violet-500',
    imageUrl: '/images/fruits/9.png'
  }
];
