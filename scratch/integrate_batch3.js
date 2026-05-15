const fs = require('fs');

const fullData = JSON.parse(fs.readFileSync('full_standardization.json', 'utf8'));
const batch3 = JSON.parse(fs.readFileSync('fr_translated_batch3.json', 'utf8'));

let integratedCount = 0;

batch3.forEach(translatedItem => {
    const originalItem = fullData.find(q => q.newId === translatedItem.newId);
    if (originalItem) {
        originalItem.fr = translatedItem.fr;
        originalItem.matchType = 'full'; // Now it has both
        integratedCount++;
    } else {
        console.log(`Warning: ID ${translatedItem.newId} not found in master file.`);
    }
});

fs.writeFileSync('full_standardization.json', JSON.stringify(fullData, null, 2));

console.log(`Successfully integrated ${integratedCount} translations from Batch 3.`);
