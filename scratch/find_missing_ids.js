const fs = require('fs');

function getIds(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const regex = /id:\s*"([^"]+)"/g;
    const ids = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
        ids.push(match[1]);
    }
    return ids;
}

const frIds = new Set(getIds('lib/duel/questionsFR_standardized.ts'));
const htIds = getIds('lib/duel/questionsHT_standardized.ts');

const missingInFr = htIds.filter(id => !frIds.has(id));

console.log('Total HT IDs:', htIds.length);
console.log('Total FR IDs:', frIds.size);
console.log('Missing in FR:', missingInFr.length);

if (missingInFr.length > 0) {
    console.log('First 5 missing IDs:', missingInFr.slice(0, 5));
    fs.writeFileSync('scratch/missing_ids.json', JSON.stringify(missingInFr, null, 2));
}
