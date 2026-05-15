const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scratch/full_standardization.json', 'utf8'));

const pending = data.filter(m => m.ht && !m.fr);

const batchSize = 50;
const batch11 = pending.slice(0, batchSize).map(m => m.ht);

fs.writeFileSync('scratch/ht_to_translate_batch11.json', JSON.stringify(batch11, null, 2));

console.log(`Created scratch/ht_to_translate_batch11.json with ${batch11.length} questions.`);
console.log(`Remaining pending after this batch: ${pending.length - batch11.length}`);
