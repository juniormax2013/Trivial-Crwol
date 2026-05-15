const fs = require('fs');
const path = require('path');

const fullData = JSON.parse(fs.readFileSync('scratch/full_standardization.json', 'utf8'));
const missingIds = JSON.parse(fs.readFileSync('scratch/missing_ht_ids.json', 'utf8'));

const batch = [];

missingIds.forEach(id => {
    const item = fullData.find(q => q.newId === id);
    if (item && item.fr) {
        batch.push({
            newId: item.newId,
            categoryId: item.categoryId || item.fr.categoryId,
            difficulty: item.difficulty || item.fr.difficulty,
            language: 'fr',
            fr: item.fr
        });
    } else {
        console.warn(`WARNING: ID ${id} not found or missing FR data.`);
    }
});

// Group by category for stats
const categories = {};
batch.forEach(item => {
    const cat = item.categoryId || 'unknown';
    categories[cat] = (categories[cat] || 0) + 1;
});

console.log(`\nPrepared ${batch.length} questions for FR→HT translation.`);
console.log(`\nBreakdown by category:`);
Object.entries(categories).sort().forEach(([cat, count]) => {
    console.log(`  ${cat}: ${count}`);
});

fs.writeFileSync(
    'scratch/fr_to_translate_inverse_final.json',
    JSON.stringify(batch, null, 2)
);
console.log(`\nSaved to: scratch/fr_to_translate_inverse_final.json`);
