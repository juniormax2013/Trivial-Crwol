
const fs = require('fs');
const path = require('path');

// Mocking the data imports since we are running in Node
const frContent = fs.readFileSync('c:/Users/junio/Desktop/200/Juego/Trivial App/lib/duel/questionsFR_standardized.ts', 'utf8');
const htContent = fs.readFileSync('c:/Users/junio/Desktop/200/Juego/Trivial App/lib/duel/questionsHT_standardized.ts', 'utf8');

function extractCategories(content) {
    const regex = /categoryId:\s*['"]([^'"]+)['"]/g;
    const categories = new Set();
    let match;
    while ((match = regex.exec(content)) !== null) {
        categories.add(match[1]);
    }
    return Array.from(categories);
}

function countByDifficulty(content, categoryId) {
    const regex = new RegExp(`categoryId:\\s*['"]${categoryId}['"].*?difficulty:\\s*['"]([^'"]+)['"]`, 'gs');
    const counts = { easy: 0, medium: 0, hard: 0 };
    let match;
    // This is a bit naive because of the global flag and how questions are structured, 
    // but let's try to match blocks.
    const questionBlocks = content.split('},');
    questionBlocks.forEach(block => {
        const hasCategory = block.includes(`categoryId:"${categoryId}"`) || 
                          block.includes(`categoryId: "${categoryId}"`) ||
                          block.includes(`categoryId:'${categoryId}'`) ||
                          block.includes(`categoryId: '${categoryId}'`);
        
        if (hasCategory) {
            if (block.includes(`difficulty:"easy"`) || block.includes(`difficulty: "easy"`) ||
                block.includes(`difficulty:'easy'`) || block.includes(`difficulty: 'easy'`)) counts.easy++;
            if (block.includes(`difficulty:"medium"`) || block.includes(`difficulty: "medium"`) ||
                block.includes(`difficulty:'medium'`) || block.includes(`difficulty: 'medium'`)) counts.medium++;
            if (block.includes(`difficulty:"hard"`) || block.includes(`difficulty: "hard"`) ||
                block.includes(`difficulty:'hard'`) || block.includes(`difficulty: 'hard'`)) counts.hard++;
        }
    });
    return counts;
}

const frCategories = extractCategories(frContent);
const htCategories = extractCategories(htContent);

const DUEL_CATEGORIES = [
  { id: 'pentateuco', name: 'Pentatèk / Lalwa', nameFR: 'Loi / Pentateuque', icon: '📜' },
  { id: 'historia', name: 'Istwa Izrayèl', nameFR: "Histoire d'Israël", icon: '🏛️' },
  { id: 'sabiduria', name: 'Sajès ak Pwezi', nameFR: 'Sagesse et Poésie', icon: '🕊️' },
  { id: 'profetas-may', name: 'Gwo Pwofèt yo', nameFR: 'Grands Prophètes', icon: '🗣️' },
  { id: 'profetas-men', name: 'Ti Pwofèt yo', nameFR: 'Petits Prophètes', icon: '📢' },
  { id: 'evangelios', name: 'Bòn Nouvèl (Evanjil)', nameFR: 'Évangiles', icon: '📖' },
  { id: 'hechos', name: 'Travay Apòt yo', nameFR: "Actes des Apótres", icon: '🎬' },
  { id: 'cartas-pablo', name: 'Lèt Pòl yo', nameFR: 'Épîtres de Paul', icon: '✉️' },
  { id: 'cartas-gen', name: 'Lèt Jeneral yo', nameFR: 'Épîtres Générales', icon: '📝' },
  { id: 'apocalipsis', name: 'Apokalips', nameFR: 'Apocalypse', icon: '🔥' },
  { id: 'personajes', name: 'Pèsonaj', nameFR: 'Personnages Bibliques', icon: '👤' },
  { id: 'lugares', name: 'Kote (Lye)', nameFR: 'Lieux Bibliques', icon: '🗺️' },
  { id: 'eventos', name: 'Evènman', nameFR: 'Événements Bibliques', icon: '📅' },
  { id: 'temas', name: 'Tèm', nameFR: 'Thèmes Bibliques', icon: '📚' },
  { id: 'genesis', name: 'Jenèz', nameFR: 'Genèse', icon: '🌍' },
  { id: 'exodo', name: 'Egzòd', nameFR: 'Exode', icon: '🌊' },
  { id: 'reyes', name: 'Wa yo ak Pwofèt yo', nameFR: 'Rois et Prophètes', icon: '👑' },
  { id: 'salmos', name: 'Sòm yo', nameFR: 'Psaumes', icon: '🎶' },
  { id: 'milagros', name: 'Mirak Jezi yo', nameFR: 'Miracles de Jésus', icon: '✨' },
  { id: 'parabolas', name: 'Parabòl Jezi yo', nameFR: 'Paraboles de Jésus', icon: '📖' },
  { id: 'mujeres', name: 'Fanm nan Bib la', nameFR: 'Femmes de la Bible', icon: '👩' },
  { id: 'personajes-at', name: 'Pèsonaj Ansyen Testaman', nameFR: "Ancien Testament", icon: '🧔' },
  { id: 'personajes-nt', name: 'Pèsonaj Nouvo Testaman', nameFR: "Nouveau Testament", icon: '🧑' },
  { id: 'doctrina', name: 'Doktrin Biblik', nameFR: 'Doctrine Biblique', icon: '⚖️' },
];

console.log("CATEGORY COVERAGE REPORT (FRENCH)");
console.log("=================================");
console.log(`${'Category ID'.padEnd(20)} | ${'FR Count'.padEnd(10)} | ${'HT Count'.padEnd(10)} | ${'Status'}`);
console.log("-".repeat(60));

DUEL_CATEGORIES.forEach(cat => {
    const frCounts = countByDifficulty(frContent, cat.id);
    const htCounts = countByDifficulty(htContent, cat.id);
    const frTotal = frCounts.easy + frCounts.medium + frCounts.hard;
    const htTotal = htCounts.easy + htCounts.medium + htCounts.hard;
    
    let status = "OK";
    if (frTotal === 0 && htTotal > 0) status = "MISSING FR (Falls back to HT)";
    if (frTotal === 0 && htTotal === 0) status = "EMPTY EVERYWHERE (Falls back to random)";
    
    console.log(`${cat.id.padEnd(20)} | ${frTotal.toString().padEnd(10)} | ${htTotal.toString().padEnd(10)} | ${status}`);
});
