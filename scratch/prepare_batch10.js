const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scratch/full_standardization.json', 'utf8'));

const pending = data.filter(m => m.ht && !m.fr);

const batchSize = 50;
const batch10 = pending.slice(0, batchSize).map(m => m.ht);

fs.writeFileSync('scratch/ht_to_translate_batch10.json', JSON.stringify(batch10, null, 2));

console.log(`Created scratch/ht_to_translate_batch10.json with ${batch10.length} questions.`);
console.log(`Remaining pending: ${pending.length - batch10.length}`);
