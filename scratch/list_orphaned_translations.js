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

const notInMaster = [];

translatedInverseFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        content.forEach(q => {
            const id = q.newId || q.id;
            if (!masterMap.has(id)) {
                notInMaster.push({ id, file, q });
            }
        });
    }
});

console.log(`Total Not in Master: ${notInMaster.length}`);
notInMaster.forEach(item => {
    console.log(`${item.id} (from ${item.file})`);
});
