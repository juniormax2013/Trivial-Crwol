// ---------------------------------------------------------------
// CHALLENGE QUESTIONS — SEED / MOCK DATA
// ---------------------------------------------------------------

import { ChallengeQuestion } from './models';

export const SEED_CHALLENGE_QUESTIONS: ChallengeQuestion[] = [
  // ==========================================
  // SPANISH QUESTIONS (ES)
  // ==========================================
  {
    id: 'ch-q-es-mc-1',
    language: 'es',
    questionType: 'multiple_choice',
    questionText: '¿Quién fue el rey más sabio de Israel, conocido por construir el primer templo?',
    options: [
      { id: 'a', text: 'David' },
      { id: 'b', text: 'Saúl' },
      { id: 'c', text: 'Salomón' },
      { id: 'd', text: 'Roboam' }
    ],
    correctAnswer: 'c',
    explanation: 'El rey Salomón pidió sabiduría a Dios para gobernar al pueblo y edificó el gran templo en Jerusalén.',
    bibleReference: '1 Reyes 3:9, 1 Reyes 6:1'
  },
  {
    id: 'ch-q-es-mc-2',
    language: 'es',
    questionType: 'multiple_choice',
    questionText: '¿Qué apóstol negó a Jesús tres veces antes de que cantara el gallo?',
    options: [
      { id: 'a', text: 'Juan' },
      { id: 'b', text: 'Pedro' },
      { id: 'c', text: 'Tomás' },
      { id: 'd', text: 'Judas' }
    ],
    correctAnswer: 'b',
    explanation: 'Pedro juró no dejar a Jesús, pero le negó tres veces antes del canto del gallo, tal como Jesús profetizó.',
    bibleReference: 'Lucas 22:60-62'
  },
  {
    id: 'ch-q-es-tf-1',
    language: 'es',
    questionType: 'true_false',
    questionText: 'Matusalén es el hombre más longevo registrado en la Biblia, habiendo vivido 969 años.',
    correctAnswer: 'Verdadero',
    explanation: 'La genealogía de Génesis registra que Matusalén vivió novecientos sesenta y nueve años y murió.',
    bibleReference: 'Génesis 5:27'
  },
  {
    id: 'ch-q-es-tf-2',
    language: 'es',
    questionType: 'true_false',
    questionText: 'El apóstol Pablo fue uno de los doce discípulos originales que caminaron con Jesús en Galilea.',
    correctAnswer: 'Falso',
    explanation: 'Pablo se convirtió en apóstol después de la resurrección de Jesús camino a Damasco; no fue uno de los doce originales.',
    bibleReference: 'Hechos 9:3-6'
  },
  {
    id: 'ch-q-es-fb-1',
    language: 'es',
    questionType: 'fill_blanks',
    questionText: 'Lámpara es a mis pies tu ______ y lumbrera a mi camino.',
    options: [
      { id: '1', text: 'gracia' },
      { id: '2', text: 'ley' },
      { id: '3', text: 'palabra' },
      { id: '4', text: 'verdad' }
    ],
    correctAnswer: 'palabra',
    explanation: 'El Salmo 119 exalta la palabra de Dios como guía espiritual indispensable contra la oscuridad.',
    bibleReference: 'Salmos 119:105'
  },
  {
    id: 'ch-q-es-fb-2',
    language: 'es',
    questionType: 'fill_blanks',
    questionText: 'El ______ es el principio de la sabiduría.',
    options: [
      { id: '1', text: 'conocimiento' },
      { id: '2', text: 'temor de Jehová' },
      { id: '3', text: 'amor fraterno' },
      { id: '4', text: 'estudio constante' }
    ],
    correctAnswer: 'temor de Jehová',
    explanation: 'Proverbios declara que el temor reverente a Dios es la base fundamental del verdadero conocimiento.',
    bibleReference: 'Proverbios 1:7'
  },
  {
    id: 'ch-q-es-mc-col-1',
    language: 'es',
    questionType: 'match_columns',
    questionText: 'Relaciona cada gran líder bíblico con el evento u objeto con el que Dios lo respaldó:',
    matchPairs: [
      { left: 'Moisés', right: 'El Mar Rojo' },
      { left: 'Noé', right: 'El Arca de madera' },
      { left: 'David', right: 'La honda y piedra' },
      { left: 'Josué', right: 'Los muros de Jericó' }
    ],
    correctAnswer: 'Moisés=El Mar Rojo,Noé=El Arca de madera,David=La honda y piedra,Josué=Los muros de Jericó',
    explanation: 'Dios usó diferentes instrumentos y milagros para respaldar el liderazgo y obediencia de sus siervos.',
    bibleReference: 'Éxodo 14, Génesis 6, 1 Samuel 17, Josué 6'
  },

  // ==========================================
  // HAITIAN CREOLE QUESTIONS (HT)
  // ==========================================
  {
    id: 'ch-q-ht-mc-1',
    language: 'ht',
    questionType: 'multiple_choice',
    questionText: 'Kiyès nan moun sa yo ki te bati lach la pou sove fanmi li ak bèt yo anba gwo inondasyon an?',
    options: [
      { id: 'a', text: 'Abraham' },
      { id: 'b', text: 'Moyiz' },
      { id: 'c', text: 'Noe' },
      { id: 'd', text: 'Lòt' }
    ],
    correctAnswer: 'c',
    explanation: 'Bondye te bay Noe lòd pou li fè yon gwo lach bwa pou sove tèt li, fanmi li ak espès bèt yo.',
    bibleReference: 'Jenèz 6:14'
  },
  {
    id: 'ch-q-ht-tf-1',
    language: 'ht',
    questionType: 'true_false',
    questionText: 'Jezi te fèt nan vil Jerizalèm, ki se kapital peyi Jide a.',
    correctAnswer: 'Falso', // Matches UI translations
    explanation: 'Jezi te fèt nan vil Betleyèm nan peyi Jide, jan pwofèt yo te anonse sa.',
    bibleReference: 'Matye 2:1'
  },
  {
    id: 'ch-q-ht-tf-2',
    language: 'ht',
    questionType: 'true_false',
    questionText: 'Moyiz te travèse Lanmè Wouj la ansanm ak pèp Izrayèl la sou tè sèk.',
    correctAnswer: 'Verdadero',
    explanation: 'Seyè a te fann dlo yo ak yon gwo van lès, pèp Izrayèl la pase nan mitan lanmè a sou tè sèk.',
    bibleReference: 'Egzòd 14:21-22'
  },
  {
    id: 'ch-q-ht-fb-1',
    language: 'ht',
    questionType: 'fill_blanks',
    questionText: 'Nan konmansman, Bondye te kreye ______ yo ak tè a.',
    options: [
      { id: '1', text: 'lanmè' },
      { id: '2', text: 'syèl' },
      { id: '3', text: 'zanj' },
      { id: '4', text: 'zetwal' }
    ],
    correctAnswer: 'syèl',
    explanation: 'Premye vèsè nan Bib la di klèman se syèl la ak tè a Bondye te kreye nan konmansman.',
    bibleReference: 'Jenèz 1:1'
  },
  {
    id: 'ch-q-ht-col-1',
    language: 'ht',
    questionType: 'match_columns',
    questionText: 'Konekte chak pèsonaj ak evènman oswa karakteristik ki koresponn lan:',
    matchPairs: [
      { left: 'David', right: 'Golyat' },
      { left: 'Moyiz', right: 'Lanmè Wouj' },
      { left: 'Samson', right: 'Cheve long' },
      { left: 'Jonas', right: 'Gwo pwason' }
    ],
    correctAnswer: 'David=Golyat,Moyiz=Lanmè Wouj,Samson=Cheve long,Jonas=Gwo pwason',
    explanation: 'Istwa pèsonaj sa yo montre kijan Bondye te aji nan lavi yo nan fason espesyal.',
    bibleReference: '1 Samyèl 17, Egzòd 14, Jij 16, Jonas 1'
  },

  // ==========================================
  // FRENCH QUESTIONS (FR)
  // ==========================================
  {
    id: 'ch-q-fr-mc-1',
    language: 'fr',
    questionType: 'multiple_choice',
    questionText: 'Quel jeune berger a battu le géant philistin Goliath avec une fronde et une pierre ?',
    options: [
      { id: 'a', text: 'Saül' },
      { id: 'b', text: 'David' },
      { id: 'c', text: 'Salomon' },
      { id: 'd', text: 'Samuel' }
    ],
    correctAnswer: 'b',
    explanation: 'David a terrassé le géant Goliath au nom de l\'Éternel des armées avec sa fronde.',
    bibleReference: '1 Samuel 17:45-50'
  },
  {
    id: 'ch-q-fr-tf-1',
    language: 'fr',
    questionType: 'true_false',
    questionText: 'Jésus a accompli son premier miracle public en changeant l\'eau en vin lors des noces de Cana.',
    correctAnswer: 'Verdadero', // Match UI values
    explanation: 'C\'est à Cana en Galilée que Jésus fit son premier miracle, manifestant ainsi sa gloire.',
    bibleReference: 'Jean 2:11'
  },
  {
    id: 'ch-q-fr-fb-1',
    language: 'fr',
    questionType: 'fill_blanks',
    questionText: 'Au commencement, Dieu créa les ______ et la terre.',
    options: [
      { id: '1', text: 'océans' },
      { id: '2', text: 'cieux' },
      { id: '3', text: 'anges' },
      { id: '4', text: 'hommes' }
    ],
    correctAnswer: 'cieux',
    explanation: 'Genèse 1:1 déclare : "Au commencement, Dieu créa les cieux et la terre".',
    bibleReference: 'Genèse 1:1'
  },
  {
    id: 'ch-q-fr-col-1',
    language: 'fr',
    questionType: 'match_columns',
    questionText: 'Associez chaque personnage à son symbole ou miracle marquant :',
    matchPairs: [
      { left: 'Noé', right: 'L\'Arche de bois' },
      { left: 'Moïse', right: 'La Mer Rouge' },
      { left: 'Jonas', right: 'Le Grand poisson' },
      { left: 'Élie', right: 'Le Char de feu' }
    ],
    correctAnswer: 'Noé=L\'Arche de bois,Moïse=La Mer Rouge,Jonas=Le Grand poisson,Élie=Le Char de feu',
    explanation: 'Dieu s\'est révélé à travers des signes et des miracles marquants tout au long de l\'histoire biblique.',
    bibleReference: 'Genèse 6, Exode 14, Jonas 1, 2 Rois 2'
  }
];

/**
 * Returns a random challenge question matching the requested language.
 * Falls back to Spanish if no question matches the language.
 */
export function getRandomChallengeQuestion(language: string): ChallengeQuestion {
  const normLang = (language || 'es').toLowerCase().substring(0, 2);
  let pool = SEED_CHALLENGE_QUESTIONS.filter(q => q.language === normLang);
  
  if (pool.length === 0) {
    // Fallback to Spanish
    pool = SEED_CHALLENGE_QUESTIONS.filter(q => q.language === 'es');
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
