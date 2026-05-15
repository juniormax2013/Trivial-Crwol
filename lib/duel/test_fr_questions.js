
const { ALL_QUESTIONS_FR } = require('./questionsFR_standardized');
const { ALL_QUESTIONS_HT } = require('./questionsHT_standardized');

const ALL_DUEL_QUESTIONS = [...ALL_QUESTIONS_HT, ...ALL_QUESTIONS_FR];

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function getQuestionIdsForCategoryAndDifficulty(
  categoryId,
  difficulty,
  language = 'ht'
) {
  // Mocking diff settings
  const diffSettings = {
    easy: { questionsPerRound: 9 },
    medium: { questionsPerRound: 12 },
    hard: { questionsPerRound: 15 }
  };
  const diffSetting = diffSettings[difficulty];
  
  let pool = ALL_DUEL_QUESTIONS.filter(
    (q) => q.categoryId === categoryId && q.language === language
  );

  if (pool.length === 0 && language !== 'ht') {
    pool = ALL_DUEL_QUESTIONS.filter(
      (q) => q.categoryId === categoryId && q.language === 'ht'
    );
  }

  if (pool.length === 0) {
    pool = ALL_DUEL_QUESTIONS.filter((q) => q.language === 'ht').slice(0, 50);
  }

  let count = diffSetting ? diffSetting.questionsPerRound : 15;
  let filtered = pool;

  if (difficulty === 'easy') {
    const easyPool = pool.filter(q => q.difficulty === 'easy');
    if (easyPool.length > 0) {
      filtered = easyPool;
      count = Math.min(easyPool.length, 9);
    }
  } else if (difficulty === 'medium') {
    const mediumPool = pool.filter(q => q.difficulty !== 'hard');
    if (mediumPool.length > 0) {
      filtered = mediumPool;
      count = Math.min(mediumPool.length, 12);
    }
  }

  count = Math.min(filtered.length, count);
  return shuffleArray(filtered).slice(0, count).map(q => ({ id: q.id, text: q.questionText.substring(0, 30) + '...', lang: q.language }));
}

async function test() {
  const categories = ['pentateuco', 'historia', 'sabiduria', 'milagros'];
  const difficulties = ['easy', 'medium', 'hard'];
  const language = 'fr';

  for (const cat of categories) {
    console.log(`\nCategory: ${cat}`);
    for (const diff of difficulties) {
      const questions = await getQuestionIdsForCategoryAndDifficulty(cat, diff, language);
      console.log(`  Diff: ${diff} -> Count: ${questions.length}`);
      if (questions.length > 0) {
        console.log(`    Sample: ${questions[0].lang} - ${questions[0].text}`);
      } else {
        console.log(`    Warning: No questions found for ${cat} in ${language} at ${diff} level.`);
      }
    }
  }
}

test();
