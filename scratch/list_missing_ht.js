const fs = require('fs');
const path = require('path');

const fullData = JSON.parse(fs.readFileSync('scratch/full_standardization.json', 'utf8'));

const missingHT = fullData.filter(q => !q.ht);

console.log(`Total questions missing HT: ${missingHT.length}`);
missingHT.forEach(q => {
    console.log(`- ${q.newId} (${q.categoryId})`);
});

fs.writeFileSync('scratch/missing_ht_ids.json', JSON.stringify(missingHT.map(q => q.newId), null, 2));
