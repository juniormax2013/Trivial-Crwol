const fs = require('fs');
const path = require('path');

const scratchDir = 'scratch';
const masterPath = path.join(scratchDir, 'full_standardization.json');

if (!fs.existsSync(masterPath)) {
    console.error('Master file not found');
    process.exit(1);
}

let master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const masterMap = new Map();
master.forEach((q, index) => {
    masterMap.set(q.newId, index);
});

function integrateBatch(filename, langKey) {
    const filePath = path.join(scratchDir, filename);
    if (!fs.existsSync(filePath)) return;

    console.log(`Processing ${filename}...`);
    const batch = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let count = 0;

    batch.forEach(item => {
        const id = item.newId || item.id;
        if (masterMap.has(id)) {
            const index = masterMap.get(id);
            // If the item has the language key directly (e.g. item.ht or item.fr)
            if (item[langKey]) {
                master[index][langKey] = item[langKey];
                count++;
            } 
            // Or if the item IS the language object itself
            else if (item.language === langKey) {
                master[index][langKey] = item;
                count++;
            }
        }
    });
    console.log(`  Integrated ${count} items.`);
}

// 1. Integrate French batches (FR)
for (let i = 1; i <= 14; i++) {
    integrateBatch(`fr_translated_batch${i}.json`, 'fr');
}

// 2. Integrate Inverse Haitian Creole batches (HT)
for (let i = 1; i <= 5; i++) {
    integrateBatch(`ht_translated_inverse_batch${i}.json`, 'ht');
}

// 2.1 Integrate other HT batches
for (let i = 2; i <= 14; i++) {
    integrateBatch(`ht_to_translate_batch${i}.json`, 'ht');
}

// 3. Integrate Batch 5 & 6 (Special naming)
// Note: Based on inspection, these specific files contain HT translations
integrateBatch('fr_translated_batch5_part1.json', 'ht');
integrateBatch('fr_translated_batch5_part2.json', 'ht');
integrateBatch('fr_translated_batch6_part1.json', 'ht');
integrateBatch('fr_translated_batch6_part2.json', 'ht');

// 4. Integrate the newly generated Batch 5 Part 2
integrateBatch('ht_translated_inverse_batch5_part2.json', 'ht');

// Save updated master
fs.writeFileSync(masterPath, JSON.stringify(master, null, 2));
console.log('\nMaster file updated successfully.');

// Audit final status
const frOnly = master.filter(q => q.fr && !q.ht);
const htOnly = master.filter(q => q.ht && !q.fr);
const both = master.filter(q => q.fr && q.ht);
console.log({ 
    total: master.length,
    frOnly: frOnly.length, 
    htOnly: htOnly.length, 
    both: both.length 
});

if (frOnly.length > 0) {
    fs.writeFileSync(path.join(scratchDir, 'remaining_fr_only.json'), JSON.stringify(frOnly, null, 2));
    console.log(`Saved ${frOnly.length} remaining French-only questions to scratch/remaining_fr_only.json`);
}
