const fs = require('fs');
const path = require('path');

const scratchDir = 'c:/Users/junio/Desktop/200/Juego/Trivial App/scratch';
const files = fs.readdirSync(scratchDir);
const translationFiles = files.filter(f => f.startsWith('fr_translated_batch') && f.endsWith('.json'));

const allTranslatedIds = new Set();
translationFiles.forEach(f => {
    try {
        const data = JSON.parse(fs.readFileSync(path.join(scratchDir, f), 'utf8'));
        if (Array.isArray(data)) {
            data.forEach(q => allTranslatedIds.add(q.id));
        }
    } catch (e) {}
});

console.log('Total unique IDs in fr_translated_batch*.json files: ' + allTranslatedIds.size);
