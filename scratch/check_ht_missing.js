const fs = require('fs');
const path = require('path');

const masterPath = path.join('scratch', 'full_standardization.json');
const htToTranslatePath = path.join('scratch', 'ht_to_translate.json');

const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const htToTranslate = JSON.parse(fs.readFileSync(htToTranslatePath, 'utf8'));

const masterIds = new Set(master.map(q => q.newId));
const missingInMaster = htToTranslate.filter(q => !masterIds.has(q.newId));

console.log(`HT to Translate count: ${htToTranslate.length}`);
console.log(`Missing in master: ${missingInMaster.length}`);

if (missingInMaster.length > 0) {
    console.log('Sample missing IDs:', missingInMaster.slice(0, 5).map(q => q.newId));
    fs.writeFileSync('scratch/ht_missing_from_master.json', JSON.stringify(missingInMaster, null, 2));
    console.log('Saved missing questions to scratch/ht_missing_from_master.json');
}
