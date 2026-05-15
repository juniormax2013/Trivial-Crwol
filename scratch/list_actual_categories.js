const fs = require('fs');

const frContent = fs.readFileSync('c:/Users/junio/Desktop/200/Juego/Trivial App/lib/duel/questionsFR_standardized.ts', 'utf8');
const htContent = fs.readFileSync('c:/Users/junio/Desktop/200/Juego/Trivial App/lib/duel/questionsHT_standardized.ts', 'utf8');

function getUniqueCategories(content) {
    const regex = /categoryId:\s*['"]([^'"]+)['"]/g;
    const categories = new Set();
    let match;
    while ((match = regex.exec(content)) !== null) {
        categories.add(match[1]);
    }
    return Array.from(categories).sort();
}

console.log("Unique Categories in HT:");
console.log(getUniqueCategories(htContent));

console.log("\nUnique Categories in FR:");
console.log(getUniqueCategories(frContent));
