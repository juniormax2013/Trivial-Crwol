
const fs = require('fs');
const path = require('path');

function parseQuestions(filePath, lang) {
  const content = fs.readFileSync(filePath, 'utf8');
  const questions = [];
  // Better regex to handle escaped quotes
  const questionRegex = /{id:"([^"]+)",questionText:"(?:[^"\\]|\\.)*",categoryId:"([^"]+)",categoryName:"(?:[^"\\]|\\.)*",difficulty:"([^"]+)",language:"([^"]+)"/g;
  
  let match;
  while ((match = questionRegex.exec(content)) !== null) {
    questions.push({
      id: match[1],
      categoryId: match[2],
      difficulty: match[3],
      language: match[4]
    });
  }
  return questions;
}

const htQuestions = parseQuestions(path.join(__dirname, '../lib/duel/questionsHT_standardized.ts'), 'ht');
const frQuestions = parseQuestions(path.join(__dirname, '../lib/duel/questionsFR_standardized.ts'), 'fr');

const ALL_DUEL_QUESTIONS = [...htQuestions, ...frQuestions];

const DUEL_CATEGORIES = [
  { id: 'pentateuco' }, { id: 'historia' }, { id: 'sabiduria' }, { id: 'profetas-may' },
  { id: 'profetas-men' }, { id: 'evangelios' }, { id: 'hechos' }, { id: 'cartas-pablo' },
  { id: 'cartas-gen' }, { id: 'apocalipsis' }, { id: 'personajes' }, { id: 'lugares' },
  { id: 'eventos' }, { id: 'temas' }, { id: 'genesis' }, { id: 'exodo' },
  { id: 'reyes' }, { id: 'salmos' }, { id: 'milagros' }, { id: 'parabolas' },
  { id: 'mujeres' }, { id: 'personajes-at' }, { id: 'personajes-nt' }, { id: 'doctrina' }
];

const difficultySettings = {
  easy: { questionsPerRound: 9 },
  medium: { questionsPerRound: 12 },
  hard: { questionsPerRound: 15 }
};

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getQuestionIdsForCategoryAndDifficulty(categoryId, difficulty, language = 'ht') {
  const diffSetting = difficultySettings[difficulty];
  
  // Try to get questions in requested language
  let pool = ALL_DUEL_QUESTIONS.filter(
    (q) => q.categoryId === categoryId && q.language === language
  );

  let fallback = null;

  // FALLBACK 1: If no questions for this language, try 'ht'
  if (pool.length === 0 && language !== 'ht') {
    pool = ALL_DUEL_QUESTIONS.filter(
      (q) => q.categoryId === categoryId && q.language === 'ht'
    );
    if (pool.length > 0) fallback = 'ht_fallback';
  }

  // FALLBACK 2: If still no questions, use any available category in 'ht'
  if (pool.length === 0) {
    pool = ALL_DUEL_QUESTIONS.filter((q) => q.language === 'ht').slice(0, 50);
    fallback = 'random_ht_fallback';
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
  const selected = shuffleArray(filtered).slice(0, count);

  return {
    count: selected.length,
    languageUsed: selected.length > 0 ? selected[0].language : 'none',
    fallback
  };
}

console.log('--- DUEL SYSTEM VERIFICATION (FRENCH) ---');
console.log(`${'Category'.padEnd(20)} | ${'Diff'.padEnd(8)} | ${'Count'.padEnd(5)} | ${'Lang'.padEnd(5)} | ${'Fallback'}`);
console.log('-'.repeat(65));

const summary = {
  fr_success: 0,
  ht_fallback: 0,
  total: 0
};

for (const cat of DUEL_CATEGORIES) {
  for (const diff of ['easy', 'medium', 'hard']) {
    const result = getQuestionIdsForCategoryAndDifficulty(cat.id, diff, 'fr');
    const fallbackStr = result.fallback || 'none';
    console.log(`${cat.id.padEnd(20)} | ${diff.padEnd(8)} | ${result.count.toString().padEnd(5)} | ${result.languageUsed.padEnd(5)} | ${fallbackStr}`);
    
    summary.total++;
    if (result.languageUsed === 'fr') summary.fr_success++;
    if (result.fallback === 'ht_fallback') summary.ht_fallback++;
  }
}

console.log('\n--- SUMMARY ---');
console.log(`Total Scenarios: ${summary.total}`);
console.log(`French Questions Found: ${summary.fr_success}`);
console.log(`Haitian Creole Fallbacks: ${summary.ht_fallback}`);
console.log(`Coverage: ${((summary.fr_success / summary.total) * 100).toFixed(2)}%`);
