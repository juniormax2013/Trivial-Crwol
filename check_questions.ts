import { ALL_DUEL_QUESTIONS } from './lib/duel/seed';
console.log('Total questions:', ALL_DUEL_QUESTIONS.length);
const languages = [...new Set(ALL_DUEL_QUESTIONS.map(q => q.language))];
console.log('Languages:', languages);
const categories = [...new Set(ALL_DUEL_QUESTIONS.map(q => q.categoryId))];
console.log('Categories:', categories);
