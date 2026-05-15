
const fs = require('fs');
const path = require('path');

function getCategories(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const categoryIds = new Set();
  const regex = /categoryId:"([^"]+)"/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    categoryIds.add(match[1]);
  }
  return categoryIds;
}

const seedCategories = [
  'pentateuco', 'historia', 'sabiduria', 'profetas-may', 'profetas-men',
  'evangelios', 'hechos', 'cartas-pablo', 'cartas-gen', 'apocalipsis',
  'personajes', 'lugares', 'eventos', 'temas', 'genesis', 'exodo',
  'reyes', 'salmos', 'milagros', 'parabolas', 'mujeres', 'personajes-at',
  'personajes-nt', 'doctrina'
];

const frCats = getCategories(path.join(__dirname, '../lib/duel/questionsFR_standardized.ts'));
const htCats = getCategories(path.join(__dirname, '../lib/duel/questionsHT_standardized.ts'));

console.log('Category Analysis:');
console.log(`${'Category ID'.padEnd(20)} | ${'In FR?'.padEnd(8)} | ${'In HT?'.padEnd(8)}`);
console.log('-'.repeat(40));

seedCategories.forEach(id => {
  const inFR = frCats.has(id) ? 'YES' : 'NO';
  const inHT = htCats.has(id) ? 'YES' : 'NO';
  console.log(`${id.padEnd(20)} | ${inFR.padEnd(8)} | ${inHT.padEnd(8)}`);
});
