const fs = require('fs');
const path = require('path');

const frPath = path.join(__dirname, '../lib/duel/questionsFR_standardized.ts');
const htPath = path.join(__dirname, '../lib/duel/questionsHT_standardized.ts');
const masterPath = path.join(__dirname, 'full_standardization.json');

const frContent = fs.readFileSync(frPath, 'utf8');
const htContent = fs.readFileSync(htPath, 'utf8');
const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

const extractIds = (content) => {
    return [...content.matchAll(/id:\s*["'](dq-[^"']+)["']/g)].map(m => m[1]);
};

const frIds = extractIds(frContent);
const htIdsSet = new Set(extractIds(htContent));
const onlyFrInTS = frIds.filter(id => !htIdsSet.has(id));

const masterMap = new Map(master.map(q => [q.newId, q]));

const missingHtList = [];
onlyFrInTS.forEach(id => {
    const q = masterMap.get(id);
    if (q && (!q.ht || !q.ht.questionText)) {
        missingHtList.push(q);
    }
});

console.log(`Total missing HT: ${missingHtList.length}`);

// We already did batch 6 with 0-50
if (missingHtList.length > 50) {
    const batch7 = missingHtList.slice(50);
    fs.writeFileSync(path.join(__dirname, 'fr_to_translate_inverse_batch7.json'), JSON.stringify(batch7, null, 2));
    console.log(`Saved ${batch7.length} questions to fr_to_translate_inverse_batch7.json`);
}
