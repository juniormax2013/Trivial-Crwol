// ---------------------------------------------------------------
// BIBLE JOURNEY MODULE — STATIC DATA & SCHEMA DEFINITIONS
// ---------------------------------------------------------------

export interface BibleBook {
  id: string;
  name: string;
  testament: 'Antiguo Testamento' | 'Nuevo Testamento';
  order_number: number;
  total_chapters: number;
  description: string;
  is_active: boolean;
}

export interface BibleUnit {
  id: string;
  book_id: string;
  title: string;
  description: string;
  order_number: number;
  is_locked: boolean;
}

export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blanks'
  | 'order_events'
  | 'match_columns'
  | 'comprehension';

export interface LessonQuestion {
  id: string;
  lesson_id: string;
  question_type: QuestionType;
  question_text: string;
  correct_answer: string; // The correct selection, word, list ordering, or matching list
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  order_number: number;
  hint?: string;
  options?: string[]; // For multiple choice, true/false, fill in blanks selection
  ordered_events?: { id: number; text: string }[]; // For ordering events
  match_pairs?: { left: string; right: string }[]; // For columns matching
}

export interface BibleLesson {
  id: string;
  unit_id: string;
  book_id: string;
  chapter_start: number;
  chapter_end: number;
  title: string;
  summary: string;
  description: string;
  order_number: number;
  xp_reward: number;
  is_boss_level: boolean;
  image_url: string;
  thumbnail_url: string;
  learning_goals: string[];
  estimated_time: string;
  exercises_count: number;
  questions: LessonQuestion[];
}

// ==========================================
// 📚 STATIC BIBLE DATABASE (GENESIS MVP)
// ==========================================

export const BIBLE_BOOKS: BibleBook[] = [
  {
    id: 'genesis',
    name: 'Génesis',
    testament: 'Antiguo Testamento',
    order_number: 1,
    total_chapters: 50,
    description: 'El libro de los comienzos: la creación, la caída, el diluvio y la historia de los patriarcas Abraham, Isaac, Jacob y José.',
    is_active: true,
  }
];

export const BIBLE_UNITS: BibleUnit[] = [
  {
    id: 'genesis_unit_1',
    book_id: 'genesis',
    title: 'El Comienzo',
    description: 'Aprende sobre la creación, Adán y Eva, la entrada del pecado, y los primeros hermanos de la historia.',
    order_number: 1,
    is_locked: false,
  }
];

export const BIBLE_LESSONS: BibleLesson[] = [
  {
    id: 'genesis_l1',
    unit_id: 'genesis_unit_1',
    book_id: 'genesis',
    chapter_start: 1,
    chapter_end: 1,
    title: 'Dios crea el mundo',
    summary: 'Aprende cómo Dios creó los cielos, la tierra, la luz, los animales y al ser humano en perfecto orden.',
    description: 'En esta lección aprenderás cómo comenzó todo. Génesis enseña que Dios creó los cielos y la tierra con su palabra, orden y propósito, y que todo lo que hizo era bueno en gran manera.',
    order_number: 1,
    xp_reward: 10,
    is_boss_level: false,
    image_url: '/images/bible-journey/image (6).png',
    thumbnail_url: '/images/bible-journey/image (1).png',
    learning_goals: [
      'Reconocer a Dios como el Creador supremo de todo lo existente.',
      'Aprender el orden y propósito de los días de la creación.',
      'Comprender la importancia del descanso establecido en el séptimo día.'
    ],
    estimated_time: '5 min',
    exercises_count: 6,
    questions: [
      {
        id: 'gl1_q1',
        lesson_id: 'genesis_l1',
        question_type: 'multiple_choice',
        question_text: '¿Quién creó los cielos y la tierra?',
        options: ['Moisés', 'Abraham', 'Dios', 'Adán'],
        correct_answer: 'Dios',
        explanation: 'Génesis 1:1 comienza mostrando a Dios como el Creador absoluto de todo el universo en el principio.',
        difficulty: 'easy',
        order_number: 1,
        hint: 'Lee el primer versículo de la Biblia.'
      },
      {
        id: 'gl1_q2',
        lesson_id: 'genesis_l1',
        question_type: 'true_false',
        question_text: 'Dios creó la luz antes de crear a los animales y plantas.',
        options: ['Verdadero', 'Falso'],
        correct_answer: 'Verdadero',
        explanation: 'Dios creó la luz en el Día 1, mientras que las plantas fueron en el Día 3, y los animales en los Días 5 y 6.',
        difficulty: 'easy',
        order_number: 2,
        hint: 'La luz fue la primera manifestación de orden frente a la oscuridad.'
      },
      {
        id: 'gl1_q3',
        lesson_id: 'genesis_l1',
        question_type: 'fill_blanks',
        question_text: 'En el principio creó Dios los ______ y la tierra.',
        options: ['mares', 'cielos', 'ángeles', 'hombres'],
        correct_answer: 'cielos',
        explanation: 'El texto exacto de Génesis 1:1 es: "En el principio creó Dios los cielos y la tierra".',
        difficulty: 'easy',
        order_number: 3,
        hint: 'Es la parte superior que vemos arriba llena de estrellas.'
      },
      {
        id: 'gl1_q4',
        lesson_id: 'genesis_l1',
        question_type: 'order_events',
        question_text: 'Ordena cronológicamente estos eventos de la creación en Génesis 1:',
        ordered_events: [
          { id: 1, text: 'Dios creó la luz' },
          { id: 2, text: 'Dios separó las aguas de los cielos' },
          { id: 3, text: 'Dios creó las plantas y árboles' },
          { id: 4, text: 'Dios creó al hombre y la mujer' }
        ],
        correct_answer: '1,2,3,4',
        explanation: 'El orden de la creación es: Luz (Día 1), Expansión de aguas (Día 2), Plantas (Día 3), y finalmente el Ser Humano (Día 6).',
        difficulty: 'medium',
        order_number: 4,
        hint: 'Piensa en cómo Dios primero preparó el hogar y luego colocó la vida en él.'
      },
      {
        id: 'gl1_q5',
        lesson_id: 'genesis_l1',
        question_type: 'match_columns',
        question_text: 'Relaciona correctamente cada día con su obra correspondiente:',
        match_pairs: [
          { left: 'Día 1', right: 'La luz y las tinieblas' },
          { left: 'Día 3', right: 'Las plantas y árboles' },
          { left: 'Día 6', right: 'Los animales terrestres y el hombre' },
          { left: 'Día 7', right: 'El descanso divino' }
        ],
        correct_answer: 'Día 1=La luz y las tinieblas,Día 3=Las plantas y árboles,Día 6=Los animales terrestres y el hombre,Día 7=El descanso divino',
        explanation: 'Dios organizó su creación en etapas y bendijo el séptimo día apartándolo como un día sagrado de reposo.',
        difficulty: 'medium',
        order_number: 5,
        hint: 'Asocia el inicio con la luz y el final con el reposo absoluto.'
      },
      {
        id: 'gl1_q6',
        lesson_id: 'genesis_l1',
        question_type: 'comprehension',
        question_text: '¿Qué nos enseña Génesis 1 sobre Dios en relación con su obra?',
        options: [
          'Que Dios creó todo con orden, propósito y poder',
          'Que Dios no se interesa por su creación y la dejó sola',
          'Que el hombre creó la tierra y Dios solo lo observó',
          'Que la creación ocurrió por puro accidente y sin diseño'
        ],
        correct_answer: 'Que Dios creó todo con orden, propósito y poder',
        explanation: 'Cada paso de la creación es ordenado sistemáticamente, demostrando que Dios diseña con amor, inteligencia y poder absoluto.',
        difficulty: 'medium',
        order_number: 6,
        hint: 'Dios repite continuamente en este capítulo que lo que hizo era "bueno".'
      }
    ]
  },
  {
    id: 'genesis_l2',
    unit_id: 'genesis_unit_1',
    book_id: 'genesis',
    chapter_start: 2,
    chapter_end: 2,
    title: 'Adán y Eva',
    summary: 'Conoce sobre el primer hombre, la primera mujer, la plantación del Jardín del Edén y la primera unión.',
    description: 'En esta lección aprenderás sobre la creación detallada del primer hombre, Adán, soplado por el aliento de vida, el establecimiento del jardín de Edén como hogar perfecto, y cómo Dios diseñó a Eva como la compañera idónea de Adán.',
    order_number: 2,
    xp_reward: 10,
    is_boss_level: false,
    image_url: '/images/bible-journey/image (7).png',
    thumbnail_url: '/images/bible-journey/image (2).png',
    learning_goals: [
      'Aprender que el hombre fue creado a imagen y semejanza de Dios del polvo.',
      'Identificar la geografía básica del jardín del Edén y el árbol de la vida.',
      'Comprender la institución del primer matrimonio y la ayuda idónea.'
    ],
    estimated_time: '6 min',
    exercises_count: 5,
    questions: [
      {
        id: 'gl2_q1',
        lesson_id: 'genesis_l2',
        question_type: 'multiple_choice',
        question_text: '¿De qué material formó Dios al primer hombre, Adán?',
        options: ['Del agua del mar', 'Del polvo de la tierra', 'De las hojas de los árboles', 'De una piedra preciosa'],
        correct_answer: 'Del polvo de la tierra',
        explanation: 'Génesis 2:7 enseña que Dios formó al hombre del polvo de la tierra, y sopló en su nariz aliento de vida.',
        difficulty: 'easy',
        order_number: 1,
        hint: 'Tiene que ver con la tierra fértil que pisamos.'
      },
      {
        id: 'gl2_q2',
        lesson_id: 'genesis_l2',
        question_type: 'true_false',
        question_text: 'Dios colocó al hombre en el jardín de Edén para que lo labrara y lo guardase.',
        options: ['Verdadero', 'Falso'],
        correct_answer: 'Verdadero',
        explanation: 'Génesis 2:15 dice claramente que tomó Dios al hombre y lo puso en el huerto de Edén, dándole un propósito de trabajo y cuidado.',
        difficulty: 'easy',
        order_number: 2,
        hint: 'El trabajo no era un castigo, sino parte del diseño de mayordomía original.'
      },
      {
        id: 'gl2_q3',
        lesson_id: 'genesis_l2',
        question_type: 'fill_blanks',
        question_text: 'No es bueno que el hombre esté ______; le haré ayuda idónea para él.',
        options: ['ocioso', 'triste', 'solo', 'cansado'],
        correct_answer: 'solo',
        explanation: 'En Génesis 2:18, Dios ve que la soledad del hombre no es buena y decide crear una compañera perfecta.',
        difficulty: 'easy',
        order_number: 3,
        hint: 'Es el antónimo de estar acompañado.'
      },
      {
        id: 'gl2_q4',
        lesson_id: 'genesis_l2',
        question_type: 'order_events',
        question_text: 'Ordena la secuencia de eventos de Génesis 2:',
        ordered_events: [
          { id: 1, text: 'Dios forma a Adán y sopla aliento de vida' },
          { id: 2, text: 'Dios planta el huerto de Edén y pone al hombre allí' },
          { id: 3, text: 'Adán pone nombre a todos los animales' },
          { id: 4, text: 'Dios hace caer en sueño profundo a Adán y crea a Eva' }
        ],
        correct_answer: '1,2,3,4',
        explanation: 'Primero Adán es creado, luego puesto en Edén; trabaja nombrando a los animales, y finalmente Dios crea a Eva de su costilla.',
        difficulty: 'medium',
        order_number: 4,
        hint: 'La creación de la mujer cierra el capítulo glorioso de la compañía humana.'
      },
      {
        id: 'gl2_q5',
        lesson_id: 'genesis_l2',
        question_type: 'match_columns',
        question_text: 'Relaciona correctamente los siguientes conceptos de Génesis 2:',
        match_pairs: [
          { left: 'Adán', right: 'Formado del polvo de la tierra' },
          { left: 'Eva', right: 'Ayuda idónea creada de la costilla' },
          { left: 'Edén', right: 'Huerto de delicias plantado por Dios' },
          { left: 'Árbol Prohibido', right: 'De la ciencia del bien y del mal' }
        ],
        correct_answer: 'Adán=Formado del polvo de la tierra,Eva=Ayuda idónea creada de la costilla,Edén=Huerto de delicias plantado por Dios,Árbol Prohibido=De la ciencia del bien y del mal',
        explanation: 'Génesis 2 profundiza en la relación perfecta del ser humano con la tierra, entre sí, y con el mandato divino de obediencia.',
        difficulty: 'medium',
        order_number: 5,
        hint: 'Empareja los personajes con su origen y los elementos con su propósito.'
      }
    ]
  },
  {
    id: 'genesis_l3',
    unit_id: 'genesis_unit_1',
    book_id: 'genesis',
    chapter_start: 3,
    chapter_end: 3,
    title: 'La caída',
    summary: 'Aprende sobre la tentación de la serpiente, la desobediencia y las graves consecuencias del pecado original.',
    description: 'En esta lección estudiarás Génesis 3, donde la serpiente astuta tienta a Eva a dudar de la palabra de Dios, desencadenando la desobediencia del fruto prohibido, el nacimiento de la vergüenza, y la expulsión del paraíso.',
    order_number: 3,
    xp_reward: 10,
    is_boss_level: false,
    image_url: '/images/bible-journey/image (8).png',
    thumbnail_url: '/images/bible-journey/image (6).png',
    learning_goals: [
      'Entender cómo opera la tentación a través de la duda y el orgullo.',
      'Identificar la desobediencia voluntaria de Adán y Eva.',
      'Analizar los efectos del pecado: vergüenza, miedo y separación de Dios.'
    ],
    estimated_time: '7 min',
    exercises_count: 5,
    questions: [
      {
        id: 'gl3_q1',
        lesson_id: 'genesis_l3',
        question_type: 'multiple_choice',
        question_text: '¿Qué criatura utilizó la astucia para engañar a Eva en el Edén?',
        options: ['El león', 'La serpiente', 'El águila', 'El escorpión'],
        correct_answer: 'La serpiente',
        explanation: 'Génesis 3:1 declara que la serpiente era astuta, más que todos los animales del campo que Jehová Dios había hecho.',
        difficulty: 'easy',
        order_number: 1,
        hint: 'Es un reptil que se arrastra por el suelo.'
      },
      {
        id: 'gl3_q2',
        lesson_id: 'genesis_l3',
        question_type: 'true_false',
        question_text: 'Inmediatamente después de desobedecer, Adán y Eva se sintieron orgullosos y buscaron a Dios.',
        options: ['Verdadero', 'Falso'],
        correct_answer: 'Falso',
        explanation: 'Al contrario, sus ojos fueron abiertos, sintieron vergüenza al verse desnudos y se escondieron de la presencia de Dios entre los árboles.',
        difficulty: 'easy',
        order_number: 2,
        hint: 'La culpa produce miedo y deseos de esconderse.'
      },
      {
        id: 'gl3_q3',
        lesson_id: 'genesis_l3',
        question_type: 'fill_blanks',
        question_text: 'Dios les dijo: El día que de él comieres, ciertamente ______.',
        options: ['crecerás', 'morirás', 'reinarás', 'sanarás'],
        correct_answer: 'morirás',
        explanation: 'En Génesis 2:17 y recordado en el capítulo 3, la advertencia de Dios sobre comer del fruto prohibido era clara: traería la muerte (espiritual y física).',
        difficulty: 'medium',
        order_number: 3,
        hint: 'Es el fin de la vida.'
      },
      {
        id: 'gl3_q4',
        lesson_id: 'genesis_l3',
        question_type: 'order_events',
        question_text: 'Ordena cronológicamente la caída humana:',
        ordered_events: [
          { id: 1, text: 'La serpiente siembra duda sobre el mandato de Dios' },
          { id: 2, text: 'Eva y Adán comen del fruto del árbol prohibido' },
          { id: 3, text: 'Cosen hojas de higuera al darse cuenta que están desnudos' },
          { id: 4, text: 'Dios los confronta y los expulsa del huerto de Edén' }
        ],
        correct_answer: '1,2,3,4',
        explanation: 'La caída inicia con la tentación, sigue con el acto de desobediencia, la autoconciencia de desnudez y finaliza con el juicio y expulsión.',
        difficulty: 'medium',
        order_number: 4,
        hint: 'El juicio de Dios ocurre siempre después de que el pecado ya se consumó.'
      },
      {
        id: 'gl3_q5',
        lesson_id: 'genesis_l3',
        question_type: 'match_columns',
        question_text: 'Relaciona cada personaje con la consecuencia que recibió en Génesis 3:',
        match_pairs: [
          { left: 'Serpiente', right: 'Maldita entre las bestias y se arrastrará' },
          { left: 'Eva', right: 'Multiplicación de dolores en los embarazos' },
          { left: 'Adán', right: 'Trabajo con dolor y espinos de la tierra' },
          { left: 'Querubín', right: 'Guardar el camino al árbol de la vida' }
        ],
        correct_answer: 'Serpiente=Maldita entre las bestias y se arrastrará,Eva=Multiplicación de dolores en los embarazos,Adán=Trabajo con dolor y espinos de la tierra,Querubín=Guardar el camino al árbol de la vida',
        explanation: 'El pecado alteró la armonía de la creación entera, trayendo juicios específicos y una espada encendida para guardar el Edén.',
        difficulty: 'hard',
        order_number: 5,
        hint: 'La serpiente cae a la tierra, los humanos sufren fatiga, y los ángeles protegen la santidad.'
      }
    ]
  },
  {
    id: 'genesis_l4',
    unit_id: 'genesis_unit_1',
    book_id: 'genesis',
    chapter_start: 4,
    chapter_end: 4,
    title: 'Caín y Abel',
    summary: 'Aprende sobre la envidia, el primer homicidio de la historia y el peso de la responsabilidad personal.',
    description: 'En esta lección aprenderás sobre la historia de Caín y Abel. Verás cómo el corazón de cada uno influyó en sus acciones y ofrendas, qué es el pecado latente en la puerta, y por qué es de vital importancia responsabilizarnos ante Dios de nuestros hermanos.',
    order_number: 4,
    xp_reward: 10,
    is_boss_level: false,
    image_url: '/images/bible-journey/image (4).png',
    thumbnail_url: '/images/bible-journey/image (3).png',
    learning_goals: [
      'Entender la diferencia entre la actitud del corazón de Caín y el de Abel.',
      'Comprender la advertencia de Dios a Caín sobre dominar el pecado.',
      'Analizar las trágicas consecuencias de la ira descontrolada y la envidia.'
    ],
    estimated_time: '5 min',
    exercises_count: 8,
    questions: [
      {
        id: 'gl4_q1',
        lesson_id: 'genesis_l4',
        question_type: 'multiple_choice',
        question_text: '¿Cuál era el oficio o ocupación de Abel?',
        options: ['Labrador de la tierra', 'Pastor de ovejas', 'Constructor de tiendas', 'Cazador de fieras'],
        correct_answer: 'Pastor de ovejas',
        explanation: 'Génesis 4:2 dice: "Y Abel fue pastor de ovejas, y Caín fue labrador de la tierra".',
        difficulty: 'easy',
        order_number: 1,
        hint: 'Trabajaba cuidando y guiando rebaños de lana.'
      },
      {
        id: 'gl4_q2',
        lesson_id: 'genesis_l4',
        question_type: 'true_false',
        question_text: 'Dios miró con agrado la ofrenda de Abel, pero no la de Caín.',
        options: ['Verdadero', 'Falso'],
        correct_answer: 'Verdadero',
        explanation: 'Dios miró con agrado a Abel y a su ofrenda porque fue presentada con fe y de lo mejor de su primogénito, pero a Caín y su ofrenda no miró con agrado.',
        difficulty: 'easy',
        order_number: 2,
        hint: 'El corazón y la fe del dador definen la calidad de su ofrenda.'
      },
      {
        id: 'gl4_q3',
        lesson_id: 'genesis_l4',
        question_type: 'multiple_choice',
        question_text: '¿Qué hizo Dios con agrado?',
        options: ['La ofrenda de Caín', 'La ofrenda de Abel', 'La ciudad de Enoc', 'La tierra de Nod'],
        correct_answer: 'La ofrenda de Abel',
        explanation: 'En Génesis 4:4, Dios aprobó con fuego u agrado la ofrenda de Abel, la cual consistía en lo más gordo y primogénito de sus ovejas.',
        difficulty: 'easy',
        order_number: 3,
        hint: 'Abel dio de lo mejor de su corazón y sus bienes.'
      },
      {
        id: 'gl4_q4',
        lesson_id: 'genesis_l4',
        question_type: 'fill_blanks',
        question_text: 'Caín dijo: ¿Soy yo acaso ______ de mi hermano?',
        options: ['juez', 'guarda', 'señor', 'amigo'],
        correct_answer: 'guarda',
        explanation: 'Cuando Dios le preguntó a Caín por Abel, Caín intentó evadir su culpa respondiendo con arrogancia: "¿Soy yo acaso guarda de mi hermano?".',
        difficulty: 'medium',
        order_number: 4,
        hint: 'Es un sinónimo de protector, cuidador o vigilante.'
      },
      {
        id: 'gl4_q5',
        lesson_id: 'genesis_l4',
        question_type: 'order_events',
        question_text: 'Ordena la trágica historia de los primeros hermanos:',
        ordered_events: [
          { id: 1, text: 'Caín y Abel presentan sus ofrendas delante de Dios' },
          { id: 2, text: 'Caín se enoja en gran manera porque su ofrenda es rechazada' },
          { id: 3, text: 'Caín ataca a su hermano Abel en el campo y le quita la vida' },
          { id: 4, text: 'Dios maldice a Caín a ser errante y le pone una marca de protección' }
        ],
        correct_answer: '1,2,3,4',
        explanation: 'La rivalidad nace de las ofrendas, escala por la ira no controlada de Caín, culmina en el asesinato y cierra con el exilio y juicio de Dios.',
        difficulty: 'medium',
        order_number: 5,
        hint: 'La confrontación con Dios ocurre al final, exigiendo justicia por la sangre derramada.'
      },
      {
        id: 'gl4_q6',
        lesson_id: 'genesis_l4',
        question_type: 'match_columns',
        question_text: 'Relaciona a cada personaje de Génesis 4 con su rol o destino:',
        match_pairs: [
          { left: 'Abel', right: 'Mártir cuya sangre clama desde la tierra' },
          { left: 'Caín', right: 'Errante y extranjero en la tierra de Nod' },
          { left: 'Set', right: 'Hijo nacido después para sustituir a Abel' },
          { left: 'Jehová', right: 'Juez que pone una señal para proteger la vida' }
        ],
        correct_answer: 'Abel=Mártir cuya sangre clama desde la tierra,Caín=Errante y extranjero en la tierra de Nod,Set=Hijo nacido después para sustituir a Abel,Jehová=Juez que pone una señal para proteger la vida',
        explanation: 'A pesar del juicio sobre Caín, Dios mostró misericordia al protegerlo de la venganza de otros mediante una señal.',
        difficulty: 'hard',
        order_number: 6,
        hint: 'Relaciona las víctimas y los culpables con sus destinos proféticos.'
      },
      {
        id: 'gl4_q7',
        lesson_id: 'genesis_l4',
        question_type: 'comprehension',
        question_text: '¿Qué le advirtió Dios a Caín antes de que cometiera el pecado contra Abel?',
        options: [
          'Que el pecado está a la puerta, pero él debía dominarlo',
          'Que debía cambiar de profesión y ser pastor',
          'Que huyera inmediatamente del huerto de Edén',
          'Que no se preocupara, pues todo saldría bien'
        ],
        correct_answer: 'Que el pecado está a la puerta, pero él debía dominarlo',
        explanation: 'En Génesis 4:7, Dios le advierte amorosamente a Caín que el pecado lo acecha como una fiera, pero que él tiene la responsabilidad y capacidad de gobernarlo.',
        difficulty: 'hard',
        order_number: 7,
        hint: 'Dios nos advierte y da la oportunidad de frenar nuestras malas intenciones.'
      },
      {
        id: 'gl4_q8',
        lesson_id: 'genesis_l4',
        question_type: 'multiple_choice',
        question_text: '¿Hacia qué tierra huyó Caín después de ser sentenciado por Dios?',
        options: ['Tierra de Nod', 'Tierra de Canaán', 'Tierra de Egipto', 'Tierra de Ur'],
        correct_answer: 'Tierra de Nod',
        explanation: 'Génesis 4:16 indica que salió Caín de delante de Jehová, y habitó en la tierra de Nod, al oriente de Edén.',
        difficulty: 'medium',
        order_number: 8,
        hint: 'Significa "tierra de vagabundeo o exilio".'
      }
    ]
  },
  {
    id: 'genesis_l5',
    unit_id: 'genesis_unit_1',
    book_id: 'genesis',
    chapter_start: 1,
    chapter_end: 4,
    title: 'Repaso de la Unidad 1',
    summary: 'Pon a prueba tus conocimientos sobre la Creación, Adán y Eva, la Caída, y Caín y Abel en este examen de unidad.',
    description: '¡Felicidades por llegar al final de la primera Unidad de Génesis! Esta lección especial de repaso consolida todo lo aprendido sobre los orígenes del mundo, el diseño humano, la desobediencia en el Edén, y las lecciones morales de los primeros hermanos.',
    order_number: 5,
    xp_reward: 50,
    is_boss_level: true,
    image_url: '/images/bible-journey/image (5).png',
    thumbnail_url: '/images/bible-journey/image (5).png',
    learning_goals: [
      'Consolidar la cronología de Génesis 1 al 4.',
      'Demostrar el dominio de los conceptos teológicos de la creación y la caída.',
      'Superar la prueba final para desbloquear la Unidad 2 de Noé y el diluvio.'
    ],
    estimated_time: '8 min',
    exercises_count: 5,
    questions: [
      {
        id: 'gl5_q1',
        lesson_id: 'genesis_l5',
        question_type: 'multiple_choice',
        question_text: '¿En qué día de la creación descansó Dios de toda su obra?',
        options: ['El tercer día', 'El sexto día', 'El séptimo día', 'El primer día'],
        correct_answer: 'El séptimo día',
        explanation: 'Dios santificó y descansó en el séptimo día, coronando su obra y estableciendo el principio del reposo.',
        difficulty: 'easy',
        order_number: 1,
        hint: 'Es el último día de la semana bíblica.'
      },
      {
        id: 'gl5_q2',
        lesson_id: 'genesis_l5',
        question_type: 'true_false',
        question_text: 'Eva fue tentada directamente por Caín para comer del fruto prohibido.',
        options: ['Verdadero', 'Falso'],
        correct_answer: 'Falso',
        explanation: 'Eva fue tentada por la serpiente en el jardín de Edén. Caín nació después de que fueron expulsados del Edén.',
        difficulty: 'easy',
        order_number: 2,
        hint: 'La tentación original vino de la serpiente astuta.'
      },
      {
        id: 'gl5_q3',
        lesson_id: 'genesis_l5',
        question_type: 'fill_blanks',
        question_text: 'Dios formó a la mujer de la ______ del hombre.',
        options: ['mano', 'cabeza', 'costilla', 'pierna'],
        correct_answer: 'costilla',
        explanation: 'Jehová Dios hizo caer sueño profundo sobre Adán y tomó una de sus costillas para formar a Eva.',
        difficulty: 'easy',
        order_number: 3,
        hint: 'Hueso del pecho que protege los órganos vitales.'
      },
      {
        id: 'gl5_q4',
        lesson_id: 'genesis_l5',
        question_type: 'multiple_choice',
        question_text: '¿Quién ofreció un sacrificio de los primogénitos de sus ovejas y de lo más gordo de ellas?',
        options: ['Caín', 'Adán', 'Moisés', 'Abel'],
        correct_answer: 'Abel',
        explanation: 'Abel trajo una ofrenda de las ovejas más selectas de su rebaño, demostrando adoración verdadera y fe.',
        difficulty: 'medium',
        order_number: 4,
        hint: 'Era el hermano menor que trabajaba como pastor.'
      },
      {
        id: 'gl5_q5',
        lesson_id: 'genesis_l5',
        question_type: 'comprehension',
        question_text: '¿Cuál fue el resultado geográfico inmediato de la caída de Adán y Eva?',
        options: [
          'Fueron obligados a mudar su campamento a la tierra de Nod',
          'Fueron expulsados del Jardín de Edén para trabajar la tierra',
          'Tuvieron que construir un gran arca para salvarse de un diluvio',
          'Se quedaron en el Edén pero tuvieron que pagar impuestos'
        ],
        correct_answer: 'Fueron expulsados del Jardín de Edén para trabajar la tierra',
        explanation: 'A causa de su pecado de desobediencia, Dios los expulsó del huerto para cultivar la tierra de la cual fueron tomados.',
        difficulty: 'medium',
        order_number: 5,
        hint: 'Dios colocó querubines con espadas para impedir su regreso.'
      }
    ]
  }
];

// Helper functions for easy metadata access
export function getBookById(bookId: string): BibleBook | undefined {
  return BIBLE_BOOKS.find(b => b.id === bookId);
}

export function getUnitById(unitId: string): BibleUnit | undefined {
  return BIBLE_UNITS.find(u => u.id === unitId);
}

export function getLessonById(lessonId: string): BibleLesson | undefined {
  return BIBLE_LESSONS.find(l => l.id === lessonId);
}

export function getLessonsByUnit(unitId: string): BibleLesson[] {
  return BIBLE_LESSONS.filter(l => l.unit_id === unitId);
}
