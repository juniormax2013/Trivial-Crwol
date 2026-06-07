import { ALL_QUESTIONS_ES } from '../duel/questionsES';
import { ALL_QUESTIONS_FR } from '../duel/questionsFR_standardized';
import { ALL_QUESTIONS_HT } from '../duel/questionsHT_standardized';

export interface SacredQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'complete_sentence' | 'order_events' | 'image_question' | 'trick_question';
  questionText: string;
  options: string[]; 
  correctAnswer: string | string[]; // string for single answer, string[] for ordered items
  explanation: string;
  bibleReference: string;
  language: 'es' | 'ht' | 'fr';
  imageType?: 'ark' | 'tablets' | 'cross' | 'rainbow' | 'fish'; // custom icons to render
  difficulty?: 'easy' | 'medium' | 'hard';
}

export function getSacredQuestions(lang: 'es' | 'ht' | 'fr'): SacredQuestion[] {
  const custom = SACRED_QUESTIONS.filter(q => q.language === lang);

  let duelSource: any[] = [];
  if (lang === 'es') duelSource = ALL_QUESTIONS_ES;
  else if (lang === 'fr') duelSource = ALL_QUESTIONS_FR;
  else if (lang === 'ht') duelSource = ALL_QUESTIONS_HT;

  const converted: SacredQuestion[] = duelSource.map((dq, index) => {
    const originalOptions = dq.options.map((o: any) => o.text);
    const correctAnswer = dq.options.find((o: any) => o.id === dq.correctOptionId)?.text || '';
    
    // Distribute format types sequentially for variation
    const typeIndex = index % 4; // 0 = multiple_choice, 1 = true_false, 2 = complete_sentence, 3 = trick_question
    
    let result: SacredQuestion;

    if (typeIndex === 1) {
      // TRUE/FALSE
      const makeTrue = Math.random() > 0.5;
      if (makeTrue) {
        let text = '';
        let opts: string[] = [];
        let ans = '';
        if (lang === 'ht') {
          text = `Èske se verite oswa manti ke repons pou: "${dq.questionText}" se "${correctAnswer}"?`;
          opts = ['Verite', 'Manti'];
          ans = 'Verite';
        } else if (lang === 'fr') {
          text = `Est-il vrai ou faux que la réponse à: "${dq.questionText}" est "${correctAnswer}" ?`;
          opts = ['Vrai', 'Faux'];
          ans = 'Vrai';
        } else {
          text = `¿Es verdadero o falso que la respuesta a: "${dq.questionText}" es "${correctAnswer}"?`;
          opts = ['Verdadero', 'Falso'];
          ans = 'Verdadero';
        }
        result = {
          id: dq.id,
          type: 'true_false',
          questionText: text,
          options: opts,
          correctAnswer: ans,
          explanation: dq.explanation || '',
          bibleReference: dq.bibleReference || '',
          language: lang
        };
      } else {
        const incorrects = dq.options.filter((o: any) => o.id !== dq.correctOptionId).map((o: any) => o.text);
        const wrongAns = incorrects[Math.floor(Math.random() * incorrects.length)] || '';
        let text = '';
        let opts: string[] = [];
        let ans = '';
        if (lang === 'ht') {
          text = `Èske se verite oswa manti ke repons pou: "${dq.questionText}" se "${wrongAns}"?`;
          opts = ['Verite', 'Manti'];
          ans = 'Manti';
        } else if (lang === 'fr') {
          text = `Est-il vrai ou faux que la réponse à: "${dq.questionText}" est "${wrongAns}" ?`;
          opts = ['Vrai', 'Faux'];
          ans = 'Faux';
        } else {
          text = `¿Es verdadero o falso que la respuesta a: "${dq.questionText}" es "${wrongAns}"?`;
          opts = ['Verdadero', 'Falso'];
          ans = 'Falso';
        }
        result = {
          id: dq.id,
          type: 'true_false',
          questionText: text,
          options: opts,
          correctAnswer: ans,
          explanation: dq.explanation || '',
          bibleReference: dq.bibleReference || '',
          language: lang
        };
      }
    } else if (typeIndex === 2) {
      // COMPLETE SENTENCE
      let text = '';
      if (lang === 'ht') {
        text = `Ranpli deklarasyon sa a: Repons pou "${dq.questionText}" se ______.`;
      } else if (lang === 'fr') {
        text = `Complétez l'affirmation : La réponse à "${dq.questionText}" est ______.`;
      } else {
        text = `Completa la afirmación: La respuesta a "${dq.questionText}" es ______.`;
      }
      result = {
        id: dq.id,
        type: 'complete_sentence',
        questionText: text,
        options: originalOptions,
        correctAnswer: correctAnswer,
        explanation: dq.explanation || '',
        bibleReference: dq.bibleReference || '',
        language: lang
      };
    } else if (typeIndex === 3) {
      // TRICK QUESTION
      let text = '';
      if (lang === 'ht') {
        text = `⚡ Kesyon pyèj: ${dq.questionText}`;
      } else if (lang === 'fr') {
        text = `⚡ Question piège : ${dq.questionText}`;
      } else {
        text = `⚡ Pregunta con trampa: ${dq.questionText}`;
      }
      result = {
        id: dq.id,
        type: 'trick_question',
        questionText: text,
        options: originalOptions,
        correctAnswer: correctAnswer,
        explanation: dq.explanation || '',
        bibleReference: dq.bibleReference || '',
        language: lang
      };
    } else {
      // MULTIPLE CHOICE
      result = {
        id: dq.id,
        type: 'multiple_choice',
        questionText: dq.questionText,
        options: originalOptions,
        correctAnswer: correctAnswer,
        explanation: dq.explanation || '',
        bibleReference: dq.bibleReference || '',
        language: lang
      };
    }

    result.difficulty = dq.difficulty;
    return result;
  });

  return [...custom, ...converted];
}

export const SACRED_QUESTIONS: SacredQuestion[] = [
  // ==========================================
  // SPANISH (ES)
  // ==========================================
  {
    id: 'sq-es-001',
    type: 'multiple_choice',
    questionText: '¿Quién construyó el arca según las instrucciones de Dios?',
    options: ['Moisés', 'Noé', 'David', 'Abraham'],
    correctAnswer: 'Noé',
    explanation: 'Dios mandó a Noé a construir un arca para salvar a su familia y parejas de animales del Diluvio.',
    bibleReference: 'Génesis 6:14-22',
    language: 'es'
  },
  {
    id: 'sq-es-002',
    type: 'true_false',
    questionText: '¿Jesús nació en la ciudad de Belén?',
    options: ['Verdadero', 'Falso'],
    correctAnswer: 'Verdadero',
    explanation: 'Jesús nació en Belén de Judea en los días del rey Herodes, tal como estaba profetizado.',
    bibleReference: 'Mateo 2:1',
    language: 'es'
  },
  {
    id: 'sq-es-003',
    type: 'complete_sentence',
    questionText: '“El Señor es mi ______; nada me faltará.”',
    options: ['Rey', 'Camino', 'Pastor', 'Salvador'],
    correctAnswer: 'Pastor',
    explanation: 'El Salmo 23 es uno de los salmos más conocidos del rey David, que inicia comparando al Señor con un pastor amoroso.',
    bibleReference: 'Salmos 23:1',
    language: 'es'
  },
  {
    id: 'sq-es-004',
    type: 'order_events',
    questionText: 'Ordena cronológicamente estos importantes eventos bíblicos de primero a último:',
    options: ['El Diluvio', 'Nacimiento de Jesús', 'La Creación', 'El Éxodo'],
    correctAnswer: ['La Creación', 'El Diluvio', 'El Éxodo', 'Nacimiento de Jesús'],
    explanation: 'La historia bíblica comienza con la Creación del mundo, seguida del Diluvio en tiempos de Noé, luego la liberación de Egipto (Éxodo) y finalmente el nacimiento del Mesías.',
    bibleReference: 'Génesis 1 - Mateo 1',
    language: 'es'
  },
  {
    id: 'sq-es-005',
    type: 'image_question',
    questionText: '¿Qué gran líder y profeta bíblico recibió estas dos tablas de piedra con la ley de Dios?',
    options: ['Aarón', 'Josué', 'Moisés', 'Elías'],
    correctAnswer: 'Moisés',
    explanation: 'Moisés subió al Monte Sinaí donde Dios le entregó los Diez Mandamientos escritos en dos tablas de piedra.',
    bibleReference: 'Éxodo 31:18',
    imageType: 'tablets',
    language: 'es'
  },
  {
    id: 'sq-es-006',
    type: 'trick_question',
    questionText: '¿Cuál de los discípulos negó a Jesús tres veces antes de que cantara el gallo?',
    options: ['Judas', 'Pedro', 'Tomás', 'Juan'],
    correctAnswer: 'Pedro',
    explanation: 'Pedro juró que nunca dejaría a Jesús, pero esa misma noche lo negó tres veces por temor, tras lo cual cantó el gallo.',
    bibleReference: 'Lucas 22:54-62',
    language: 'es'
  },

  // ==========================================
  // HAITIAN CREOLE (HT)
  // ==========================================
  {
    id: 'sq-ht-001',
    type: 'multiple_choice',
    questionText: 'Kilès ki te bati lach la dapre enstriksyon Bondye te bay yo?',
    options: ['Moyiz', 'Noye', 'David', 'Abraram'],
    correctAnswer: 'Noye',
    explanation: 'Bondye te bay Noye lòd pou li bati yon lach pou sove fanmi li ak bèt yo anba gwo delij la.',
    bibleReference: 'Jenèz 6:14-22',
    language: 'ht'
  },
  {
    id: 'sq-ht-002',
    type: 'true_false',
    questionText: 'Èske Jezi te fèt nan lavil Betleyèm?',
    options: ['Verite', 'Manti'],
    correctAnswer: 'Verite',
    explanation: 'Jezi te fèt nan lavil Betleyèm nan jwif yo, nan tan wa Ewòd, jan pwofèt yo te anonse sa.',
    bibleReference: 'Matye 2:1',
    language: 'ht'
  },
  {
    id: 'sq-ht-003',
    type: 'complete_sentence',
    questionText: '“Seyè a se ______ mwen; mwen p ap manke anyen.”',
    options: ['Wa', 'Chemen', 'Bèje', 'Sovè'],
    correctAnswer: 'Bèje',
    explanation: 'Sòm 23 se youn nan sòm ki pi popilè wa David te ekri, kote li konpare Seyè a ak yon bèje ki gen lanmou.',
    bibleReference: 'Sòm 23:1',
    language: 'ht'
  },
  {
    id: 'sq-ht-004',
    type: 'order_events',
    questionText: 'Mete gwo evènman biblik sa yo nan lòd kwonolojik, depi premye a jouk dènye a:',
    options: ['Delij la', 'Jezi fèt', 'Kreyasyon an', 'Egzòd la'],
    correctAnswer: ['Kreyasyon an', 'Delij la', 'Egzòd la', 'Jezi fèt'],
    explanation: 'Istwa biblik la kòmanse ak Kreyasyon lemonn, apre sa Delij nan tan Noye, liberasyon anba peyi Lejip (Egzòd) epi finalman nesans Jezi.',
    bibleReference: 'Jenèz 1 - Matye 1',
    language: 'ht'
  },
  {
    id: 'sq-ht-005',
    type: 'image_question',
    questionText: 'Ki gwo lidè ak pwofèt biblik ki te resevwa de tablèt wòch sa yo ak lalwa Bondye a?',
    options: ['Arawon', 'Jozye', 'Moyiz', 'Eli'],
    correctAnswer: 'Moyiz',
    explanation: 'Moyiz te moute sou mòn Sinayi a kote Bondye te ba li Dis Kòmandman yo ekri sou de tablèt wòch.',
    bibleReference: 'Egzòd 31:18',
    imageType: 'tablets',
    language: 'ht'
  },
  {
    id: 'sq-ht-006',
    type: 'trick_question',
    questionText: 'Kilès nan disip yo ki te nye Jezi twa fwa anvan kòk la chante?',
    options: ['Jida', 'Pyè', 'Toma', 'Jan'],
    correctAnswer: 'Pyè',
    explanation: 'Pyè te pwomèt li pa t ap janm abandone Jezi, men menm jou lannwit sa a li nye li twa fwa akòz laperèz.',
    bibleReference: 'Lik 22:54-62',
    language: 'ht'
  },

  // ==========================================
  // FRENCH (FR)
  // ==========================================
  {
    id: 'sq-fr-001',
    type: 'multiple_choice',
    questionText: 'Qui a construit l’arche selon les instructions de Dieu ?',
    options: ['Moïse', 'Noé', 'David', 'Abraham'],
    correctAnswer: 'Noé',
    explanation: 'Dieu ordonna à Noé de construire une arche pour sauver sa famille et les couples d’animaux du Déluge.',
    bibleReference: 'Genèse 6:14-22',
    language: 'fr'
  },
  {
    id: 'sq-fr-002',
    type: 'true_false',
    questionText: 'Jésus est-il né dans la ville de Bethléem ?',
    options: ['Vrai', 'Faux'],
    correctAnswer: 'Vrai',
    explanation: 'Jésus naquit à Bethléem en Judée à l’époque du roi Hérode, conformément aux prophéties.',
    bibleReference: 'Matthieu 2:1',
    language: 'fr'
  },
  {
    id: 'sq-fr-003',
    type: 'complete_sentence',
    questionText: '« L’Éternel est mon ______ ; je ne manquerai de rien. »',
    options: ['Roi', 'Chemin', 'Berger', 'Sauveur'],
    correctAnswer: 'Berger',
    explanation: 'Le Psaume 23 est l’un des psaumes les plus célèbres du roi David, commençant par comparer le Seigneur à un tendre berger.',
    bibleReference: 'Psaumes 23:1',
    language: 'fr'
  },
  {
    id: 'sq-fr-004',
    type: 'order_events',
    questionText: 'Ordonnez chronologiquement ces événements bibliques importants du premier au dernier :',
    options: ['Le Déluge', 'Naissance de Jésus', 'La Création', 'L’Exode'],
    correctAnswer: ['La Création', 'Le Déluge', 'L’Exode', 'Naissance de Jésus'],
    explanation: 'L’histoire biblique s’ouvre avec la Création, suivie du Déluge à l’époque de Noé, puis de la libération d’Égypte (Exode) et enfin de la venue de Jésus.',
    bibleReference: 'Genèse 1 - Matthieu 1',
    language: 'fr'
  },
  {
    id: 'sq-fr-005',
    type: 'image_question',
    questionText: 'Quel grand chef et prophète biblique reçut ces deux tables de pierre avec la loi de Dieu ?',
    options: ['Aaron', 'Josué', 'Moïse', 'Élie'],
    correctAnswer: 'Moïse',
    explanation: 'Moïse monta sur le mont Sinaï où Dieu lui remit les Dix Commandements écrits sur deux tables de pierre.',
    bibleReference: 'Exode 31:18',
    imageType: 'tablets',
    language: 'fr'
  },
  {
    id: 'sq-fr-006',
    type: 'trick_question',
    questionText: 'Lequel des disciples a renié Jésus trois fois avant que le coq ne chante ?',
    options: ['Judas', 'Pierre', 'Thomas', 'Jean'],
    correctAnswer: 'Pierre',
    explanation: 'Pierre jura de ne jamais renier son Maître, mais cette nuit-là, la peur le poussa à renier Jésus trois fois de suite.',
    bibleReference: 'Luc 22:54-62',
    language: 'fr'
  }
];
