const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scratch/full_standardization.json', 'utf8'));

const pending = data.filter(m => m.ht && !m.fr);

const batchSize = 40;
const batch14 = pending.slice(0, batchSize).map(m => {
  return {
    newId: m.newId,
    ht: m.ht
  };
});

fs.writeFileSync('scratch/ht_to_translate_batch14.json', JSON.stringify(batch14, null, 2));

console.log(`Created scratch/ht_to_translate_batch14.json with ${batch14.length} questions.`);
console.log(`Remaining pending after this batch: ${Math.max(0, pending.length - batch14.length)}`);
