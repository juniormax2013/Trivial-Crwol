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
const htIds = extractIds(htContent);

const frIdsSet = new Set(frIds);
const htIdsSet = new Set(htIds);

const onlyFrInTS = frIds.filter(id => !htIdsSet.has(id));

console.log(`Total only in FR TS: ${onlyFrInTS.length}`);

const masterMap = new Map(master.map(q => [q.newId, q]));

let countInMaster = 0;
let countWithHtInMaster = 0;
let countMissingHtInMaster = 0;
let countNotInMaster = 0;

const missingHtList = [];
const haveHtList = [];
const notInMasterList = [];

onlyFrInTS.forEach(id => {
    const q = masterMap.get(id);
    if (q) {
        countInMaster++;
        if (q.ht && q.ht.questionText) {
            countWithHtInMaster++;
            haveHtList.push(q);
        } else {
            countMissingHtInMaster++;
            missingHtList.push(q);
        }
    } else {
        countNotInMaster++;
        notInMasterList.push(id);
    }
});

console.log(`In Master: ${countInMaster}`);
console.log(`  - With HT in Master: ${countWithHtInMaster}`);
console.log(`  - Missing HT in Master: ${countMissingHtInMaster}`);
console.log(`Not in Master: ${countNotInMaster}`);

if (countNotInMaster > 0) {
    console.log(`Sample Not in Master: ${notInMasterList.slice(0, 10).join(', ')}`);
}

// Prepare batch for missing HT
if (missingHtList.length > 0) {
    fs.writeFileSync(path.join(__dirname, 'fr_to_translate_inverse_batch6.json'), JSON.stringify(missingHtList.slice(0, 50), null, 2));
    console.log(`Saved 50 questions to fr_to_translate_inverse_batch6.json`);
}
