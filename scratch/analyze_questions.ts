
import { ALL_QUESTIONS_FR } from '../lib/duel/questionsFR_standardized';
import { ALL_QUESTIONS_HT } from '../lib/duel/questionsHT_standardized';

const categories = [
  'pentateuco', 'historia', 'sabiduria', 'profetas-may', 'profetas-men',
  'evangelios', 'hechos', 'cartas-pablo', 'cartas-gen', 'apocalipsis',
  'personajes', 'lugares', 'eventos', 'temas', 'genesis', 'exodo',
  'reyes', 'salmos', 'milagros', 'parabolas', 'mujeres', 'personajes-at',
  'personajes-nt', 'doctrina'
];

function analyze(questions: any[], lang: string) {
  console.log(`\nAnalysis for ${lang.toUpperCase()}:`);
  const stats: Record<string, { easy: number, medium: number, hard: number, total: number }> = {};
  
  questions.forEach(q => {
    if (!stats[q.categoryId]) stats[q.categoryId] = { easy: 0, medium: 0, hard: 0, total: 0 };
    stats[q.categoryId][q.difficulty as 'easy' | 'medium' | 'hard']++;
    stats[q.categoryId].total++;
  });

  categories.forEach(catId => {
    const s = stats[catId] || { easy: 0, medium: 0, hard: 0, total: 0 };
    console.log(`${catId.padEnd(15)} | Total: ${s.total.toString().padStart(3)} | Easy: ${s.easy} | Medium: ${s.medium} | Hard: ${s.hard}`);
  });

  const unknownCats = Object.keys(stats).filter(cat => !categories.includes(cat));
  if (unknownCats.length > 0) {
    console.log(`\nUNKNOWN CATEGORIES in ${lang}: ${unknownCats.join(', ')}`);
  }
}

analyze(ALL_QUESTIONS_FR, 'fr');
analyze(ALL_QUESTIONS_HT, 'ht');
