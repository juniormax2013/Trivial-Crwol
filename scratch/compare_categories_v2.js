const fs = require('fs');

const DUEL_CATEGORIES = [
  { id: 'pentateuco' }, { id: 'historia' }, { id: 'sabiduria' }, { id: 'profetas-may' },
  { id: 'profetas-men' }, { id: 'evangelios' }, { id: 'hechos' }, { id: 'cartas-pablo' },
  { id: 'cartas-gen' }, { id: 'apocalipsis' }, { id: 'personajes' }, { id: 'lugares' },
  { id: 'eventos' }, { id: 'temas' }, { id: 'genesis' }, { id: 'exodo' },
  { id: 'reyes' }, { id: 'salmos' }, { id: 'milagros' }, { id: 'parabolas' },
  { id: 'mujeres' }, { id: 'personajes-at' }, { id: 'personajes-nt' }, { id: 'doctrina' }
];

const frContent = fs.readFileSync('c:/Users/junio/Desktop/200/Juego/Trivial App/lib/duel/questionsFR_standardized.ts', 'utf8');
const htContent = fs.readFileSync('c:/Users/junio/Desktop/200/Juego/Trivial App/lib/duel/questionsHT_standardized.ts', 'utf8');

function getUniqueCategories(content) {
    const regex = /categoryId:\s*['"]([^'"]+)['"]/g;
    const categories = new Set();
    let match;
    while ((match = regex.exec(content)) !== null) {
        categories.add(match[1]);
    }
    return categories;
}

const htCats = getUniqueCategories(htContent);
const frCats = getUniqueCategories(frContent);
const canonCats = new Set(DUEL_CATEGORIES.map(c => c.id));

console.log("Categories in questions but NOT in seed.ts:");
const inFilesNotSeed = new Set([...htCats, ...frCats]);
canonCats.forEach(c => inFilesNotSeed.delete(c));
console.log(Array.from(inFilesNotSeed).sort());

console.log("\nCategories in seed.ts but NOT in questions:");
const inSeedNotFiles = new Set([...canonCats]);
htCats.forEach(c => inSeedNotFiles.delete(c));
frCats.forEach(c => inSeedNotFiles.delete(c));
console.log(Array.from(inSeedNotFiles).sort());
