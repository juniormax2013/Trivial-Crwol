const fs = require('fs');

const data = JSON.parse(fs.readFileSync('scratch/full_standardization.json', 'utf8'));

// Get all IDs that are already translated or in existing batches
const translatedIds = new Set();

const files = [
    'scratch/fr_translated_batch1.json',
    'scratch/fr_translated_batch2.json',
    'scratch/fr_translated_batch3.json',
    'scratch/fr_translated_batch4.json',
    'scratch/fr_translated_batch5_part1.json',
    'scratch/fr_translated_batch5_part2.json',
    'scratch/fr_translated_batch6_part1.json',
    'scratch/fr_translated_batch6_part2.json',
    'scratch/fr_translated_batch7.json',
    'scratch/fr_translated_batch8.json'
];

files.forEach(file => {
    if (fs.existsSync(file)) {
        const content = JSON.parse(fs.readFileSync(file, 'utf8'));
        content.forEach(item => {
            if (item.id) {
                translatedIds.add(item.id);
            } else if (item.newId) {
                translatedIds.add(item.newId);
            } else if (item.ht && item.ht.id) {
                translatedIds.add(item.ht.id);
            }
        });
    }
});

const batch9 = [];
for (const item of data) {
    if (!item.fr && !translatedIds.has(item.ht.id)) {
        batch9.push(item.ht);
        if (batch9.length >= 50) break;
    }
}

fs.writeFileSync('scratch/ht_to_translate_batch9.json', JSON.stringify(batch9, null, 2));
console.log(`Created ht_to_translate_batch9.json with ${batch9.length} questions.`);
