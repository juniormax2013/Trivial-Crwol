const fs = require('fs');
const path = require('path');

const sourceFile = path.join('scratch', 'ht_to_translate.json');
if (fs.existsSync(sourceFile)) {
    const data = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
    console.log(`Total questions in ht_to_translate.json: ${data.length}`);
} else {
    console.log('ht_to_translate.json not found.');
}
