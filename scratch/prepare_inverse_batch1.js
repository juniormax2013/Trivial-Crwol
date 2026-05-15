const fs = require('fs');
const path = require('path');

const fullDataPath = path.join('scratch', 'full_standardization.json');
const fullData = JSON.parse(fs.readFileSync(fullDataPath, 'utf8'));

// Filter items that have FR but NO HT
const pendingHT = fullData.filter(q => q.fr && !q.ht);

console.log(`Total questions missing HT: ${pendingHT.length}`);

const batchSize = 40;
const batch = pendingHT.slice(0, batchSize).map(q => {
    return {
        newId: q.newId,
        fr: q.fr
    };
});

const batchFile = path.join('scratch', 'fr_to_translate_inverse_batch1.json');
fs.writeFileSync(batchFile, JSON.stringify(batch, null, 2));

console.log(`Created ${batchFile} with ${batch.length} questions.`);
console.log(`Remaining questions missing HT: ${pendingHT.length - batch.length}`);
