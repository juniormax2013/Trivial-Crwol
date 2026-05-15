const fs = require('fs');
const path = require('path');

const scratchDir = 'scratch';
const masterPath = path.join(scratchDir, 'full_standardization.json');

if (!fs.existsSync(masterPath)) {
    console.error('Master file not found');
    process.exit(1);
}

let master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const allQuestions = new Map();

// Initialize allQuestions with existing master data
master.forEach(q => {
    allQuestions.set(q.newId, { ...q });
});

const files = fs.readdirSync(scratchDir);

function processBatch(filename) {
    const filePath = path.join(scratchDir, filename);
    let langKey = null;
    
    // Determine language from filename
    if (filename.startsWith('fr_')) langKey = 'fr';
    else if (filename.startsWith('ht_')) langKey = 'ht';
    
    if (!langKey) return;

    // Skip non-data files
    if (!filename.endsWith('.json')) return;
    if (filename === 'full_standardization.json' || filename === 'full_standardization_v2.json') return;

    console.log(`Processing ${filename} (detected as ${langKey})...`);
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const batch = Array.isArray(data) ? data : (data.questions || []);
        
        let count = 0;
        batch.forEach(item => {
            // Some items are { newId, ht: { ... } } or { newId, fr: { ... } }
            // Some items are just the question object
            const id = item.newId || item.id;
            if (!id) return;

            if (!allQuestions.has(id)) {
                allQuestions.set(id, { newId: id, fr: null, ht: null, matchType: 'full' });
            }

            const q = allQuestions.get(id);

            // Handle nested formats
            if (item.fr && langKey === 'fr') {
                q.fr = item.fr;
                count++;
            } else if (item.ht && langKey === 'ht') {
                q.ht = item.ht;
                count++;
            }
            // Handle direct format
            else if (item.language === 'fr' && langKey === 'fr') {
                q.fr = item;
                count++;
            } else if (item.language === 'ht' && langKey === 'ht') {
                q.ht = item;
                count++;
            }
            // Fallback for items that don't have 'language' but are in a batch
            else if (langKey === 'fr' && !q.fr) {
                 q.fr = item;
                 count++;
            }
            else if (langKey === 'ht' && !q.ht) {
                 q.ht = item;
                 count++;
            }
        });
        console.log(`  Integrated ${count} items.`);
    } catch (e) {
        console.error(`  Error processing ${filename}: ${e.message}`);
    }
}

// Order matters slightly: load more specific/newer files later
// But Map handles updates fine.
files.forEach(f => processBatch(f));

// Convert Map back to Array
const finalData = Array.from(allQuestions.values());

// Post-processing: ensure all fr objects have the correct ID and no nested 'fr'
finalData.forEach(q => {
    if (q.fr) {
        if (q.fr.fr) q.fr = q.fr.fr; // Fix nesting
        q.fr.id = q.newId;
    }
    if (q.ht) {
        if (q.ht.ht) q.ht = q.ht.ht; // Fix nesting
        q.ht.id = q.newId;
    }
});

// Sort by ID
finalData.sort((a, b) => a.newId.localeCompare(b.newId));

// Summary
const both = finalData.filter(q => q.fr && q.ht);
const frOnly = finalData.filter(q => q.fr && !q.ht);
const htOnly = finalData.filter(q => q.ht && !q.fr);

console.log('\nFinal Integration Summary:');
console.log(`Total unique IDs: ${finalData.length}`);
console.log(`Bilingual (Parity): ${both.length}`);
console.log(`French Only: ${frOnly.length}`);
console.log(`Haitian Only: ${htOnly.length}`);

const outputPath = path.join(scratchDir, 'full_standardization_v3.json');
fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));
console.log(`\nFinal master file saved to ${outputPath}`);
