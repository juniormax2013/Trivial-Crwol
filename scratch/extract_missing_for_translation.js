const fs = require('fs');

let htContent = fs.readFileSync('lib/duel/questionsHT_standardized.ts', 'utf8');
// Strip imports and exports to make it valid JS
htContent = htContent.replace(/import\s+{[^}]+}\s+from\s+['"][^'"]+['"];/g, '');
htContent = htContent.replace(/export\s+const\s+\w+:\s+DuelQuestion\[\]\s+=/g, 'module.exports =');

const htQuestions = eval(htContent);

const frContent = fs.readFileSync('lib/duel/questionsFR_standardized.ts', 'utf8');
const idRegex = /id:\s*"([^"]+)"/g;

function getIds(content) {
    const ids = new Set();
    let match;
    while ((match = idRegex.exec(content)) !== null) {
        ids.add(match[1]);
    }
    return ids;
}

const frIds = getIds(frContent);
const missingQuestions = htQuestions.filter(q => !frIds.has(q.id));

console.log(`Missing in FR: ${missingQuestions.length}`);

fs.writeFileSync('scratch/missing_from_fr.json', JSON.stringify(missingQuestions, null, 2));
console.log('Saved missing questions to scratch/missing_from_fr.json');
