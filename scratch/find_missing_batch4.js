const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, 'fr_to_translate_inverse_batch4.json');
const genScriptPath = path.join(__dirname, 'generate_ht_batch4.js');

const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const genScriptContent = fs.readFileSync(genScriptPath, 'utf8');

const missing = [];
for (const item of sourceData) {
    if (!genScriptContent.includes(item.newId)) {
        missing.push(item);
    }
}

console.log(`Total source: ${sourceData.length}`);
console.log(`Missing in script: ${missing.length}`);
console.log(JSON.stringify(missing.map(m => ({ id: m.newId, fr: m.fr.questionText })), null, 2));
