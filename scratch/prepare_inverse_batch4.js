const fs = require('fs');
const path = require('path');

const fullDataPath = path.join(__dirname, 'full_standardization.json');
const fullData = JSON.parse(fs.readFileSync(fullDataPath, 'utf8'));

// Filter items that have FR but NO HT
const pendingHT = fullData.filter(q => q.fr && (!q.ht || !q.ht.questionText));

console.log(`Total questions missing HT: ${pendingHT.length}`);

const batchSize = 60;
const batch = pendingHT.slice(0, batchSize).map(q => {
    return {
        newId: q.newId,
        fr: q.fr
    };
});

const batchFile = path.join(__dirname, 'fr_to_translate_inverse_batch4.json');
fs.writeFileSync(batchFile, JSON.stringify(batch, null, 2));

console.log(`Created ${batchFile} with ${batch.length} questions.`);
console.log(`Remaining questions missing HT: ${pendingHT.length - batch.length}`);
