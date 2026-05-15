const fs = require('fs');
const path = require('path');

const scratchDir = 'scratch';
const fullDataPath = path.join(scratchDir, 'full_standardization.json');
const batchPath = path.join(scratchDir, 'ht_translated_inverse_batch1.json');

if (!fs.existsSync(fullDataPath)) {
    console.error(`Error: Master file ${fullDataPath} not found.`);
    process.exit(1);
}

if (!fs.existsSync(batchPath)) {
    console.error(`Error: Batch file ${batchPath} not found.`);
    process.exit(1);
}

let fullData = JSON.parse(fs.readFileSync(fullDataPath, 'utf8'));
const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));

let totalIntegrated = 0;
let fixedNesting = 0;

batch.forEach(item => {
    const id = item.newId;
    let htContent = item.ht;

    if (!id || !htContent) return;

    // Fix double nesting if it exists (e.g., { ht: { ht: { ... } } })
    if (htContent.ht) {
        htContent = htContent.ht;
        fixedNesting++;
    }

    const masterItem = fullData.find(q => q.newId === id);
    if (masterItem) {
        masterItem.ht = htContent;
        totalIntegrated++;
    } else {
        console.warn(`Warning: ID ${id} not found in master file.`);
    }
});

fs.writeFileSync(fullDataPath, JSON.stringify(fullData, null, 2));

console.log(`Integration complete!`);
console.log(`Total items integrated: ${totalIntegrated}`);
console.log(`Double nesting issues fixed: ${fixedNesting}`);
console.log(`Updated ${fullDataPath}`);
