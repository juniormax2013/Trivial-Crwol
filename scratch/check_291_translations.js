const fs = require('fs');

function getIds(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(/{\s*id:\s*"(dq-[^"]+)"/g);
    if (!matches) return [];
    return matches.map(m => m.match(/"(dq-[^"]+)"/)[1]);
}

const frIds = getIds('lib/duel/questionsFR_standardized.ts');
const htIds = getIds('lib/duel/questionsHT_standardized.ts');
const htSet = new Set(htIds);

const frOnlyInTs = frIds.filter(id => !htSet.has(id));
console.log(`Only FR in TS: ${frOnlyInTs.length}`);

const master = JSON.parse(fs.readFileSync('scratch/full_standardization.json', 'utf8'));
const masterMap = new Map();
master.forEach(q => {
    masterMap.set(q.newId || (q.fr && q.fr.id), q);
});

let hasHtInMaster = 0;
let missingHtInMaster = 0;

frOnlyInTs.forEach(id => {
    const q = masterMap.get(id);
    if (q) {
        if (q.ht) hasHtInMaster++;
        else missingHtInMaster++;
    } else {
        missingHtInMaster++;
    }
});

console.log(`Of the 291 missing in HT TS:`);
console.log(`- Have HT in Master: ${hasHtInMaster}`);
console.log(`- Missing HT in Master: ${missingHtInMaster}`);
