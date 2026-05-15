
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'lib', 'duel', 'questionsHT_standardized.ts');
const content = fs.readFileSync(filePath, 'utf8');

const targetCategories = [
  'tabernakulo', 'lideres', 'nuevo-testamento', 'oracion', 'espiritu-santo',
  'mision', 'escatologia', 'viajes-pablo', 'at-general', 'cultura',
  'intertestamentario', 'guerras'
];

// This is a bit tricky with raw text, but I'll try to extract full objects
const questions = [];
const lines = content.split('\n');

lines.forEach(line => {
    targetCategories.forEach(cat => {
        if (line.includes(`categoryId:"${cat}"`)) {
            questions.push(line.trim());
        }
    });
});

fs.writeFileSync(path.join(__dirname, 'ht_to_translate.json'), JSON.stringify(questions, null, 2));
console.log(`Extracted ${questions.length} questions for translation.`);
