const fs = require('fs');
const data = JSON.parse(fs.readFileSync('full_standardization.json', 'utf8'));

// Get FR only questions (those that have fr.questionText but no ht.questionText)
const frOnly = data.filter(q => (q.fr && q.fr.questionText) && !(q.ht && q.ht.questionText));

// Take 50 for Batch 1 (FR direction)
const batch1Fr = frOnly.slice(0, 50);

fs.writeFileSync('fr_to_translate_batch1.json', JSON.stringify(batch1Fr, null, 2));

console.log(`Prepared Batch 1 (FR->HT) with ${batch1Fr.length} questions.`);
console.log(`Remaining FR-only: ${frOnly.length - batch1Fr.length}`);
