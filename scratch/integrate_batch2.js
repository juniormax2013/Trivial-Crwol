const fs = require('fs');

const standardized = JSON.parse(fs.readFileSync('scratch/full_standardization.json', 'utf8'));
const batch1 = JSON.parse(fs.readFileSync('scratch/fr_translated_batch1.json', 'utf8'));
const batch2 = JSON.parse(fs.readFileSync('scratch/fr_translated_batch2.json', 'utf8'));

const allBatchTranslations = [...batch1, ...batch2];
const translationMap = new Map(allBatchTranslations.map(q => [q.id, q]));

let updatedCount = 0;
const updatedData = standardized.map(q => {
  if (translationMap.has(q.newId) && !q.fr) {
    updatedCount++;
    return {
      ...q,
      fr: translationMap.get(q.newId)
    };
  }
  return q;
});

fs.writeFileSync('scratch/full_standardization.json', JSON.stringify(updatedData, null, 2));

const totalHT = updatedData.filter(q => q.ht).length;
const totalFR = updatedData.filter(q => q.fr).length;

console.log(`Integración completada.`);
console.log(`Nuevas traducciones integradas: ${updatedCount}`);
console.log(`Total HT: ${totalHT}`);
console.log(`Total FR: ${totalFR}`);
console.log(`Faltan: ${totalHT - totalFR} traducciones.`);
