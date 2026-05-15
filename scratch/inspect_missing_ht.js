const fs = require('fs');
const path = require('path');

const fullDataPath = path.join('scratch', 'full_standardization.json');
const fullData = JSON.parse(fs.readFileSync(fullDataPath, 'utf8'));

const missingHT = fullData.filter(q => !q.ht);
console.log(`Found ${missingHT.length} items missing HT.`);

if (missingHT.length > 0) {
    console.log('\nSample items missing HT:');
    console.log(JSON.stringify(missingHT.slice(0, 2), null, 2));
}
