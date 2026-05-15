const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scratch/full_standardization.json', 'utf8'));

const pending = data.filter(m => m.ht && !m.fr);

const batchSize = 40;
const batch13 = pending.slice(0, batchSize).map(m => {
  return {
    newId: m.newId,
    ht: m.ht
  };
});

fs.writeFileSync('scratch/ht_to_translate_batch13.json', JSON.stringify(batch13, null, 2));

console.log(`Created scratch/ht_to_translate_batch13.json with ${batch13.length} questions.`);
console.log(`Remaining pending after this batch: ${pending.length - batch13.length}`);
