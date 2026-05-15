const fs = require('fs');
const path = require('path');

const scratchDir = 'scratch';
const fullDataPath = path.join(scratchDir, 'full_standardization.json');

if (!fs.existsSync(fullDataPath)) {
    console.error(`Error: Master file ${fullDataPath} not found.`);
    process.exit(1);
}

let fullData = JSON.parse(fs.readFileSync(fullDataPath, 'utf8'));
let totalIntegrated = 0;

// Main batches
for (let i = 1; i <= 14; i++) {
    const batchPath = path.join(scratchDir, `fr_translated_batch${i}.json`);
    if (fs.existsSync(batchPath)) {
        console.log(`Processing ${batchPath}...`);
        const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
        let batchCount = 0;
        
        batch.forEach(translatedItem => {
            const id = translatedItem.id || translatedItem.newId;
            if (!id) return;
            
            const masterItem = fullData.find(q => q.newId === id);
            if (masterItem) {
                masterItem.fr = translatedItem;
                masterItem.matchType = 'full';
                batchCount++;
                totalIntegrated++;
            }
        });
        console.log(`  Integrated ${batchCount} items from Batch ${i}.`);
    }
}

// Special case for Batch 5 and 6 which might have part1/part2
const specialBatches = ['5_part1', '5_part2', '6_part1', '6_part2'];
specialBatches.forEach(suffix => {
    const batchPath = path.join(scratchDir, `fr_translated_batch${suffix}.json`);
    if (fs.existsSync(batchPath)) {
        console.log(`Processing ${batchPath}...`);
        const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
        let batchCount = 0;
        batch.forEach(translatedItem => {
            const id = translatedItem.id || translatedItem.newId;
            const masterItem = fullData.find(q => q.newId === id);
            if (masterItem) {
                masterItem.fr = translatedItem;
                masterItem.matchType = 'full';
                batchCount++;
                totalIntegrated++;
            }
        });
        console.log(`  Integrated ${batchCount} items from ${batchPath}.`);
    }
});

fs.writeFileSync(fullDataPath, JSON.stringify(fullData, null, 2));
console.log(`\nFinished! Total integrated across all batches: ${totalIntegrated}`);
console.log(`Updated ${fullDataPath}`);
