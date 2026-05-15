const fs = require('fs');
const path = require('path');

const masterPath = path.join(__dirname, 'full_standardization.json');
const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const masterMap = new Map(master.map(q => [q.newId, q]));

const translatedInverseFiles = [
    'ht_translated_inverse_batch1.json',
    'ht_translated_inverse_batch2.json',
    'ht_translated_inverse_batch3.json',
    'ht_translated_inverse_batch4.json',
    'ht_translated_inverse_batch5.json',
    'ht_translated_inverse_batch5_part2.json'
];

let totalInBatches = 0;
let alreadyInMasterWithHt = 0;
let missingInMasterWithHt = 0;
let notInMasterAtAll = 0;

translatedInverseFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        content.forEach(q => {
            totalInBatches++;
            const id = q.newId || q.id;
            const mq = masterMap.get(id);
            if (mq) {
                if (mq.ht && mq.ht.questionText) {
                    alreadyInMasterWithHt++;
                } else {
                    missingInMasterWithHt++;
                }
            } else {
                notInMasterAtAll++;
            }
        });
    }
});

console.log(`Total in inverse batches: ${totalInBatches}`);
console.log(`Already in Master with HT: ${alreadyInMasterWithHt}`);
console.log(`In Master but missing HT: ${missingInMasterWithHt}`);
console.log(`Not in Master at all: ${notInMasterAtAll}`);
