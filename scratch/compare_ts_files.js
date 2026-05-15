const fs = require('fs');

function getIds(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(/{\s*id:\s*"(dq-[^"]+)"/g);
    if (!matches) return [];
    return matches.map(m => m.match(/"(dq-[^"]+)"/)[1]);
}

const frIds = getIds('lib/duel/questionsFR_standardized.ts');
const htIds = getIds('lib/duel/questionsHT_standardized.ts');

const frSet = new Set(frIds);
const htSet = new Set(htIds);

const frOnly = frIds.filter(id => !htSet.has(id));
const htOnly = htIds.filter(id => !frSet.has(id));
const common = frIds.filter(id => htSet.has(id));

console.log(`FR total: ${frIds.length}`);
console.log(`HT total: ${htIds.length}`);
console.log(`Common: ${common.length}`);
console.log(`Only FR in TS: ${frOnly.length}`);
console.log(`Only HT in TS: ${htOnly.length}`);

// Sample some Only HT
console.log(`\nSample Only HT: ${htOnly.slice(0, 10).join(', ')}`);
