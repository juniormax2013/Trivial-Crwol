
const fs = require('fs');
const path = require('path');

const frFile = path.join(__dirname, '../lib/duel/questionsFR_standardized.ts');
const categories = [
  'pentateuco', 'historia', 'sabiduria', 'profetas-may', 'profetas-men',
  'evangelios', 'hechos', 'cartas-pablo', 'cartas-gen', 'apocalipsis',
  'personajes', 'lugares', 'eventos', 'temas', 'genesis', 'exodo',
  'reyes', 'salmos', 'milagros', 'parabolas', 'mujeres', 'personajes-at',
  'personajes-nt', 'doctrina'
];

const content = fs.readFileSync(frFile, 'utf8');

const stats = {};
categories.forEach(cat => {
    stats[cat] = { easy: 0, medium: 0, hard: 0, total: 0 };
});

// Regex to find categoryId and difficulty in each question object
const questionRegex = /\{[\s\S]+?categoryId\s*:\s*'([^']+)'[\s\S]+?difficulty\s*:\s*'([^']+)'[\s\S]+?\}/g;
let match;
let totalQuestions = 0;

while ((match = questionRegex.exec(content)) !== null) {
    const catId = match[1];
    const difficulty = match[2];
    totalQuestions++;

    if (stats[catId]) {
        stats[catId].total++;
        if (stats[catId][difficulty] !== undefined) {
            stats[catId][difficulty]++;
        }
    }
}

console.log('--- French Question Distribution (Robust Analysis) ---');
console.log(`Total questions found: ${totalQuestions}`);
console.log('Category'.padEnd(20) + ' | Total | Easy | Medium | Hard');
console.log('-'.repeat(55));

categories.forEach(id => {
    const s = stats[id];
    console.log(`${id.padEnd(20)} | ${s.total.toString().padStart(5)} | ${s.easy.toString().padStart(4)} | ${s.medium.toString().padStart(6)} | ${s.hard.toString().padStart(4)}`);
});

const emptyCats = categories.filter(id => stats[id].total === 0);
if (emptyCats.length > 0) {
    console.log('\n--- CRITICAL: Categories with ZERO French questions ---');
    emptyCats.forEach(id => console.log(`- ${id}`));
} else {
    console.log('\nAll categories have at least one French question.');
}
