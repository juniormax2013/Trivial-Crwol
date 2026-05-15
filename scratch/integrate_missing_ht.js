const fs = require('fs');
const path = require('path');

const masterFile = 'c:/Users/junio/Desktop/200/Juego/Trivial App/scratch/full_standardization.json';
const htFile = 'c:/Users/junio/Desktop/200/Juego/Trivial App/scratch/ht_translated_inverse_final.json';

const masterData = JSON.parse(fs.readFileSync(masterFile, 'utf8'));
const htData = JSON.parse(fs.readFileSync(htFile, 'utf8'));

const htMap = new Map();
htData.forEach(q => {
    const id = q.newId || (q.ht && q.ht.id);
    if (id) {
        htMap.set(id, q.ht);
    }
});

let updatedCount = 0;
const updatedData = masterData.map(item => {
    const id = item.newId || (item.fr && item.fr.id);
    if (!item.ht && id && htMap.has(id)) {
        updatedCount++;
        return {
            ...item,
            ht: htMap.get(id),
            matchType: 'full'
        };
    }
    return item;
});

console.log('Total entries in master: ' + masterData.length);
console.log('HT translations found in mapping: ' + htMap.size);
console.log('Entries successfully updated in master: ' + updatedCount);

if (updatedCount > 0) {
    fs.writeFileSync(masterFile, JSON.stringify(updatedData, null, 2));
    console.log('Master file full_standardization.json updated successfully!');
} else {
    console.log('No updates were made.');
}
