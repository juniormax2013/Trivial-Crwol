const { ALL_DUEL_QUESTIONS } = require('./lib/duel/seed');

console.log('Total Questions:', ALL_DUEL_QUESTIONS.length);

const languages = ['ht', 'fr', 'es'];
languages.forEach(lang => {
  const count = ALL_DUEL_QUESTIONS.filter(q => q.language === lang).length;
  console.log(`Questions in ${lang.toUpperCase()}: ${count}`);
});

// Check for duplicates
const ids = ALL_DUEL_QUESTIONS.map(q => `${q.id}-${q.language}`);
const uniqueIds = new Set(ids);
if (ids.length !== uniqueIds.size) {
  console.error('Warning: Duplicate IDs found!');
} else {
  console.log('No duplicate ID-language pairs found.');
}

// Check some categories
const categories = [...new Set(ALL_DUEL_QUESTIONS.map(q => q.categoryId))];
console.log('Unique Categories:', categories.length);
console.log('Categories:', categories.join(', '));
