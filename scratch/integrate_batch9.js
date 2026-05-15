const fs = require('fs');

const fullDataPath = 'full_standardization.json';
const batch9Path = 'fr_translated_batch9.json';

if (!fs.existsSync(fullDataPath)) {
    console.error(`Error: Master file ${fullDataPath} not found.`);
    process.exit(1);
}

if (!fs.existsSync(batch9Path)) {
    console.error(`Error: Batch 9 file ${batch9Path} not found.`);
    process.exit(1);
}

const fullData = JSON.parse(fs.readFileSync(fullDataPath, 'utf8'));
const batch9 = JSON.parse(fs.readFileSync(batch9Path, 'utf8'));

let integratedCount = 0;
let notFoundCount = 0;

batch9.forEach(translatedItem => {
    // In batch 9, the 'id' field corresponds to the 'newId' in the master file
    const masterItem = fullData.find(q => q.newId === translatedItem.id);
    if (masterItem) {
        masterItem.fr = translatedItem;
        masterItem.matchType = 'full';
        integratedCount++;
    } else {
        console.warn(`Warning: ID ${translatedItem.id} not found in master file.`);
        notFoundCount++;
    }
});

fs.writeFileSync(fullDataPath, JSON.stringify(fullData, null, 2));

console.log(`Successfully integrated ${integratedCount} translations from Batch 9.`);
if (notFoundCount > 0) {
    console.log(`Failed to find ${notFoundCount} IDs in the master file.`);
}
