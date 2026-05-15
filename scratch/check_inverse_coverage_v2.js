const fs = require('fs');
const path = require('path');

const masterPath = path.join(__dirname, 'full_standardization.json');
const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const masterIds = new Set(master.map(q => q.newId));

const translatedInverseFiles = [
    'ht_translated_inverse_batch1.json',
    'ht_translated_inverse_batch2.json',
    'ht_translated_inverse_batch3.json',
    'ht_translated_inverse_batch4.json',
    'ht_translated_inverse_batch5.json',
    'ht_translated_inverse_batch5_part2.json'
];

let totalTranslated = 0;
const translatedIds = new Set();

translatedInverseFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        content.forEach(q => {
            const id = q.newId || q.id;
            translatedIds.add(id);
            totalTranslated++;
        });
    }
});

console.log(`Total translated questions in inverse batches: ${totalTranslated}`);
console.log(`Unique translated IDs: ${translatedIds.size}`);

// Check how many of the 59 "missing HT" are in these batches
const frPath = path.join(__dirname, '../lib/duel/questionsFR_standardized.ts');
const htPath = path.join(__dirname, '../lib/duel/questionsHT_standardized.ts');
const frContent = fs.readFileSync(frPath, 'utf8');
const htContent = fs.readFileSync(htPath, 'utf8');
const frIds = [...frContent.matchAll(/id:\s*["'](dq-[^"']+)["']/g)].map(m => m[1]);
const htIdsSet = new Set([...htContent.matchAll(/id:\s*["'](dq-[^"']+)["']/g)].map(m => m[1]));
const onlyFrInTS = frIds.filter(id => !htIdsSet.has(id));

const masterMap = new Map(master.map(q => [q.newId, q]));
const missingHtInMaster = onlyFrInTS.filter(id => {
    const q = masterMap.get(id);
    return q && (!q.ht || !q.ht.questionText);
});

console.log(`Missing HT in Master (out of 291): ${missingHtInMaster.length}`);

const coveredByBatches = missingHtInMaster.filter(id => translatedIds.has(id));
console.log(`Covered by existing translated batches: ${coveredByBatches.length}`);

const stillTrulyMissing = missingHtInMaster.filter(id => !translatedIds.has(id));
console.log(`Truly missing (not in Master, not in batches): ${stillTrulyMissing.length}`);
if (stillTrulyMissing.length > 0) {
    console.log(`Sample truly missing: ${stillTrulyMissing.slice(0, 10).join(', ')}`);
}
