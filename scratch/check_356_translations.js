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

const htOnlyInTs = htIds.filter(id => !frSet.has(id));
console.log(`Only HT in TS: ${htOnlyInTs.length}`);

const master = JSON.parse(fs.readFileSync('scratch/full_standardization.json', 'utf8'));
const masterMap = new Map();
master.forEach(q => {
    masterMap.set(q.newId || (q.fr && q.fr.id), q);
});

let hasFrInMaster = 0;
let missingFrInMaster = 0;

htOnlyInTs.forEach(id => {
    const q = masterMap.get(id);
    if (q) {
        if (q.fr) hasFrInMaster++;
        else missingFrInMaster++;
    } else {
        missingFrInMaster++;
    }
});

console.log(`Of the 356 missing in FR TS:`);
console.log(`- Have FR in Master: ${hasFrInMaster}`);
console.log(`- Missing FR in Master: ${missingFrInMaster}`);
