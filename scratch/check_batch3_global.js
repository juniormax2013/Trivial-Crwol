const fs = require('fs');
const path = require('path');

const scratchDir = 'c:/Users/junio/Desktop/200/Juego/Trivial App/scratch';

const rawFile = path.join(scratchDir, 'batch3_raw.json');
const rawData = JSON.parse(fs.readFileSync(rawFile, 'utf8'));
const rawIds = rawData.map(q => q.id);

const files = fs.readdirSync(scratchDir);
const translationFiles = files.filter(f => f.startsWith('fr_') && f.endsWith('.json'));

const allTranslatedIds = new Set();
translationFiles.forEach(f => {
    try {
        const data = JSON.parse(fs.readFileSync(path.join(scratchDir, f), 'utf8'));
        if (Array.isArray(data)) {
            data.forEach(q => allTranslatedIds.add(q.id));
        }
    } catch (e) {}
});

const missing = rawIds.filter(id => !allTranslatedIds.has(id));

console.log('Batch 3 Raw total: ' + rawIds.length);
console.log('Total unique translated IDs found in all fr_*.json: ' + allTranslatedIds.size);
console.log('Missing from all translation files: ' + missing.length);

if (missing.length > 0) {
    console.log('Missing IDs: ' + missing.join(', '));
} else {
    console.log('All 100 questions from batch3_raw.json are accounted for in the translation files!');
}
