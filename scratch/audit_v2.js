const fs = require('fs');
const path = require('path');

const masterPath = path.join(__dirname, 'full_standardization.json');
const htToTranslatePath = path.join(__dirname, 'ht_to_translate.json');

const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const htToTranslate = JSON.parse(fs.readFileSync(htToTranslatePath, 'utf8'));

const totalQuestions = master.length;
const both = master.filter(q => q.fr && q.ht).length;
const frOnly = master.filter(q => q.fr && !q.ht).length;
const htOnly = master.filter(q => q.ht && !q.fr).length;

console.log('--- Master Audit ---');
console.log(`Total questions in master: ${totalQuestions}`);
console.log(`Questions with both FR and HT: ${both}`);
console.log(`Questions with only FR: ${frOnly}`);
console.log(`Questions with only HT: ${htOnly}`);

console.log('\n--- Pending Translation Audit ---');
console.log(`Questions in ht_to_translate.json: ${htToTranslate.length}`);

// Check if questions in ht_to_translate are in master
let foundInMaster = 0;
let missingInMaster = 0;
let alreadyHasHT = 0;

htToTranslate.forEach(q => {
    const inMaster = master.find(m => m.id === q.id);
    if (inMaster) {
        foundInMaster++;
        if (inMaster.ht) {
            alreadyHasHT++;
        }
    } else {
        missingInMaster++;
    }
});

console.log(`Found in master: ${foundInMaster}`);
console.log(`Missing in master: ${missingInMaster}`);
console.log(`Already have HT in master: ${alreadyHasHT}`);

// List some IDs for FR-only to see if they match the user's "291"
const frOnlyQuestions = master.filter(q => q.fr && !q.ht);
console.log(`\nSample FR-only IDs (total ${frOnlyQuestions.length}):`);
console.log(frOnlyQuestions.slice(0, 5).map(q => q.id));
