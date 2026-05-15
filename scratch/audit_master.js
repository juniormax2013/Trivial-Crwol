const fs = require('fs');
const path = require('path');

const masterFile = 'c:/Users/junio/Desktop/200/Juego/Trivial App/scratch/full_standardization.json';
const data = JSON.parse(fs.readFileSync(masterFile, 'utf8'));

let fullMatch = 0;
let htOnly = 0;
let frOnly = 0;
let missingFields = 0;

const htOnlyList = [];
const frOnlyList = [];

data.forEach(item => {
    if (item.ht && item.fr) {
        fullMatch++;
    } else if (item.ht && !item.fr) {
        htOnly++;
        htOnlyList.push(item.newId || item.ht.id);
    } else if (!item.ht && item.fr) {
        frOnly++;
        frOnlyList.push(item.newId || item.fr.id);
    } else {
        missingFields++;
    }
});

console.log('--- Master Audit Results ---');
console.log('Total entries: ' + data.length);
console.log('Full matches (HT + FR): ' + fullMatch);
console.log('HT only: ' + htOnly);
console.log('FR only: ' + frOnly);
console.log('Missing both (error): ' + missingFields);

if (htOnly > 0) {
    console.log('\nHT Only IDs (first 10): ' + htOnlyList.slice(0, 10).join(', '));
}
if (frOnly > 0) {
    console.log('\nFR Only IDs (first 10): ' + frOnlyList.slice(0, 10).join(', '));
}

// Check for ID consistency
let inconsistentIds = 0;
data.forEach(item => {
    const ids = [];
    if (item.newId) ids.push(item.newId);
    if (item.ht && item.ht.id) ids.push(item.ht.id);
    if (item.fr && item.fr.id) ids.push(item.fr.id);
    
    const uniqueIds = new Set(ids);
    if (uniqueIds.size > 1) {
        inconsistentIds++;
    }
});

console.log('\nInconsistent IDs (mismatch between newId, ht.id, or fr.id): ' + inconsistentIds);
