const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scratch/full_standardization.json', 'utf8'));
const untranslated = data.filter(q => !q.fr);
console.log('Untranslated in full_standardization.json:', untranslated.length);

// What about the translated batches?
const batches = [
    'scratch/fr_translated_batch1.json',
    'scratch/fr_translated_batch2.json',
    'scratch/fr_translated_batch3.json',
    'scratch/fr_translated_batch4.json',
    'scratch/fr_translated_batch5_part1.json',
    'scratch/fr_translated_batch5_part2.json',
    'scratch/fr_translated_batch6_part1.json',
    'scratch/fr_translated_batch6_part2.json',
    'scratch/fr_translated_batch7.json'
];

const batchIds = new Set();
batches.forEach(f => {
    if (fs.existsSync(f)) {
        const batchData = JSON.parse(fs.readFileSync(f, 'utf8'));
        batchData.forEach(q => {
            const id = q.id || (q.ht && q.ht.id) || q.newId;
            if (id) batchIds.add(id);
        });
    }
});
console.log('Unique IDs in all translated batches (1-7):', batchIds.size);

let trulyUntranslated = 0;
const trulyUntranslatedIds = [];
untranslated.forEach(q => {
    if (q.ht && !batchIds.has(q.ht.id)) {
        trulyUntranslated++;
        trulyUntranslatedIds.push(q.ht.id);
    }
});

console.log('Questions yet to be translated (neither in full nor in batches):', trulyUntranslated);
console.log('Sample IDs:', trulyUntranslatedIds.slice(0, 5));
