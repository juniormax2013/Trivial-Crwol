const fs = require('fs');

const standardized = JSON.parse(fs.readFileSync('scratch/full_standardization.json', 'utf8'));
const frBatch1 = JSON.parse(fs.readFileSync('scratch/fr_translated_batch1.json', 'utf8'));

const totalHT = standardized.filter(q => q.ht).length;
const existingFR = standardized.filter(q => q.fr).length;

// If we integrate batch 1, we add those to FR
const batch1Count = frBatch1.length;

console.log(`Total preguntas HT (Haitian): ${totalHT}`);
console.log(`Preguntas FR (French) existentes en archivo principal: ${existingFR}`);
console.log(`Preguntas FR en Batch 1 (nuevo): ${batch1Count}`);
console.log(`Total FR si integramos Batch 1: ${existingFR + batch1Count}`);
console.log(`Faltan para paridad total: ${totalHT - (existingFR + batch1Count)}`);
