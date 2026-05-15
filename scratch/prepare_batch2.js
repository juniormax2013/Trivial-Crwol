const fs = require('fs');

const standardized = JSON.parse(fs.readFileSync('scratch/full_standardization.json', 'utf8'));
const batch1 = JSON.parse(fs.readFileSync('scratch/fr_translated_batch1.json', 'utf8'));

// IDs que ya tienen FR (originales + batch 1)
const translatedIds = new Set([
  ...standardized.filter(q => q.fr).map(q => q.newId),
  ...batch1.map(q => q.id)
]);

// Preguntas que tienen HT pero NO están en la lista de traducidas
const missingFR = standardized.filter(q => q.ht && !translatedIds.has(q.newId));

// Tomamos las siguientes 45 preguntas para el Batch 2
const batch2 = missingFR.slice(0, 45).map(q => ({
  id: q.newId,
  ht: q.ht
}));

fs.writeFileSync('scratch/ht_to_translate_batch2.json', JSON.stringify(batch2, null, 2));

console.log(`Identificadas ${missingFR.length} preguntas faltantes.`);
console.log(`Batch 2 preparado con ${batch2.length} preguntas en scratch/ht_to_translate_batch2.json`);
