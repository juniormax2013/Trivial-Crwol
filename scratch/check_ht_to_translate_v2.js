const fs = require('fs');
const path = require('path');

const masterPath = path.join(__dirname, 'full_standardization.json');
const toTranslatePath = path.join(__dirname, 'ht_to_translate.json');

const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const toTranslate = JSON.parse(fs.readFileSync(toTranslatePath, 'utf8'));

console.log(`Master records: ${master.length}`);
console.log(`To Translate records: ${toTranslate.length}`);

const masterMap = new Map();
master.forEach(q => {
    masterMap.set(q.newId, q);
});

let alreadyTranslated = 0;
let missingInMaster = 0;
let needsTranslation = 0;

toTranslate.forEach(q => {
    if (masterMap.has(q.newId)) {
        const mq = masterMap.get(q.newId);
        if (mq.ht && mq.ht.questionText) {
            alreadyTranslated++;
        } else {
            needsTranslation++;
        }
    } else {
        missingInMaster++;
    }
});

console.log(`Already translated in master: ${alreadyTranslated}`);
console.log(`Needs translation (in master but no HT): ${needsTranslation}`);
console.log(`Missing in master entirely: ${missingInMaster}`);
