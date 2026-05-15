const fs = require('fs');
const path = require('path');

const missingIds = JSON.parse(fs.readFileSync('scratch/missing_ht_ids.json', 'utf8'));
const scratchDir = 'scratch';

const inverseBatches = [
    'ht_translated_inverse_batch1.json',
    'ht_translated_inverse_batch2.json',
    'ht_translated_inverse_batch3.json',
    'ht_translated_inverse_batch4.json',
    'ht_translated_inverse_batch5.json',
    'ht_translated_inverse_batch5_part2.json'
];

missingIds.forEach(id => {
    let found = false;
    inverseBatches.forEach(batchFile => {
        const batchPath = path.join(scratchDir, batchFile);
        if (fs.existsSync(batchPath)) {
            const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
            if (batch.some(item => item.newId === id)) {
                console.log(`ID ${id} found in ${batchFile}`);
                found = true;
            }
        }
    });
    if (!found) {
        console.log(`ID ${id} NOT FOUND in any inverse batch.`);
    }
});
