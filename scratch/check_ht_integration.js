const fs = require('fs');
const path = require('path');

const fullDataPath = path.join('scratch', 'full_standardization.json');
const sourceFile = path.join('scratch', 'ht_to_translate.json');

const fullData = JSON.parse(fs.readFileSync(fullDataPath, 'utf8'));
const sourceData = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));

const masterIds = new Set(fullData.map(q => q.newId));
const results = {
    alreadyInMasterWithHT: 0,
    alreadyInMasterWithoutHT: 0,
    notInMaster: 0,
    details: []
};

sourceData.forEach(str => {
    const match = str.match(/id:"([^"]+)"/);
    if (match) {
        const id = match[1];
        const masterItem = fullData.find(q => q.newId === id);
        
        if (masterItem) {
            if (masterItem.ht) {
                results.alreadyInMasterWithHT++;
            } else {
                results.alreadyInMasterWithoutHT++;
                results.details.push({ id, status: 'In Master (FR-only), need to add HT' });
            }
        } else {
            results.notInMaster++;
            results.details.push({ id, status: 'Not in Master at all' });
        }
    }
});

console.log(`Total questions in ht_to_translate.json: ${sourceData.length}`);
console.log(`Already in Master with HT: ${results.alreadyInMasterWithHT}`);
console.log(`Already in Master but missing HT: ${results.alreadyInMasterWithoutHT}`);
console.log(`Not in Master at all: ${results.notInMaster}`);

if (results.details.length > 0) {
    console.log('\nDetails (first 10):');
    console.log(results.details.slice(0, 10));
}
