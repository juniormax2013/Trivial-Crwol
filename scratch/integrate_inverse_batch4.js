const fs = require('fs');
const path = require('path');

const masterPath = path.join(__dirname, 'full_standardization.json');
const batchPath = path.join(__dirname, 'ht_translated_inverse_batch4.json');

if (!fs.existsSync(masterPath)) {
    console.error('Master file not found');
    process.exit(1);
}

if (!fs.existsSync(batchPath)) {
    console.error('Batch file not found');
    process.exit(1);
}

const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));

console.log(`Master records: ${master.length}`);
console.log(`Batch records: ${batch.length}`);

let updatedCount = 0;
const masterMap = new Map();
master.forEach((q, index) => {
    masterMap.set(q.newId, index);
});

batch.forEach(translatedQ => {
    if (masterMap.has(translatedQ.newId)) {
        const index = masterMap.get(translatedQ.newId);
        // Only update if ht is missing or empty
        if (!master[index].ht || !master[index].ht.questionText) {
            master[index].ht = translatedQ.ht;
            updatedCount++;
        }
    } else {
        console.warn(`Warning: ID ${translatedQ.newId} not found in master`);
    }
});

console.log(`Updated ${updatedCount} records in master.`);

fs.writeFileSync(masterPath, JSON.stringify(master, null, 2));
console.log('Master file updated successfully.');
