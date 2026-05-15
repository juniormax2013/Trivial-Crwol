const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, 'fr_to_translate_inverse_batch4.json');
const genScriptPath = path.join(__dirname, 'generate_ht_batch4.js');

const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const genScriptContent = fs.readFileSync(genScriptPath, 'utf8');

const missing = sourceData.filter(item => !genScriptContent.includes(item.newId));

fs.writeFileSync(path.join(__dirname, 'missing_objects_batch4.json'), JSON.stringify(missing, null, 2));
console.log(`Extracted ${missing.length} missing objects.`);
