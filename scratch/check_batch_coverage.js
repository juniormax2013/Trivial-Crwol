const fs = require('fs');

function getIdsFromTs(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(/{\s*id:\s*"(dq-[^"]+)"/g);
    if (!matches) return [];
    return matches.map(m => m.match(/"(dq-[^"]+)"/)[1]);
}

const frIdsTs = getIdsFromTs('lib/duel/questionsFR_standardized.ts');
const htIdsTs = getIdsFromTs('lib/duel/questionsHT_standardized.ts');
const htSetTs = new Set(htIdsTs);

const frOnlyInTs = frIdsTs.filter(id => !htSetTs.has(id));
const frOnlyInTsSet = new Set(frOnlyInTs);

console.log(`Total 291 candidate IDs: ${frOnlyInTs.length}`);

// Check batches
const batchFiles = fs.readdirSync('scratch').filter(f => f.startsWith('fr_to_translate_inverse_batch'));
const batchedIds = new Set();
batchFiles.forEach(f => {
    const data = JSON.parse(fs.readFileSync('scratch/' + f, 'utf8'));
    data.forEach(q => batchedIds.add(q.id || q.newId));
});

console.log(`IDs already in inverse batches: ${batchedIds.size}`);

const missingFromBatches = frOnlyInTs.filter(id => !batchedIds.has(id));
console.log(`Missing from batches: ${missingFromBatches.length}`);
console.log(`Sample missing: ${missingFromBatches.slice(0, 10).join(', ')}`);

// Let's also check if any in batches are NOT in the 291
const inBatchesButNotFrOnly = Array.from(batchedIds).filter(id => !frOnlyInTsSet.has(id));
console.log(`In batches but not in 291: ${inBatchesButNotFrOnly.length}`);
