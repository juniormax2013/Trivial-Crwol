const fs = require('fs');
const path = require('path');

const master = JSON.parse(fs.readFileSync('c:/Users/junio/Desktop/200/Juego/Trivial App/scratch/full_standardization.json', 'utf8'));
const frOnly = master.filter(q => q.fr && !q.ht);
const frOnlyIds = new Set(frOnly.map(q => q.newId));

console.log(`Found ${frOnlyIds.size} FR-only questions in master.`);

const scratchDir = 'c:/Users/junio/Desktop/200/Juego/Trivial App/scratch';
const files = fs.readdirSync(scratchDir);

const batchFiles = files.filter(f => 
    f.startsWith('ht_to_translate_batch') || 
    f.startsWith('ht_translated_inverse_batch') ||
    f.startsWith('fr_translated_batch') ||
    f.startsWith('ht_to_translate.json')
);

let foundInBatches = 0;
const matchingFiles = {};

for (const file of batchFiles) {
    try {
        const filePath = path.join(scratchDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(content);
        
        for (const item of data) {
            const id = item.newId || item.id;
            if (frOnlyIds.has(id)) {
                if (item.ht) {
                    foundInBatches++;
                    if (!matchingFiles[file]) matchingFiles[file] = [];
                    matchingFiles[file].push(id);
                }
            }
        }
    } catch (e) {
        // Skip malformed or non-json
    }
}

console.log(`Found ${foundInBatches} missing translations already present in batch files.`);
console.log('Files containing missing translations:', Object.keys(matchingFiles));
if (foundInBatches > 0) {
    console.log('Sample IDs:', Object.values(matchingFiles)[0].slice(0, 5));
}
