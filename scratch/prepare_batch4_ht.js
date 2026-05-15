const fs = require('fs');
const data = JSON.parse(fs.readFileSync('full_standardization.json', 'utf8'));

// Get HT only questions (those that have ht.questionText but no fr.questionText)
const htOnly = data.filter(q => (q.ht && q.ht.questionText) && !(q.fr && q.fr.questionText));

// Take 50 for Batch 4
const batch4 = htOnly.slice(0, 50);

fs.writeFileSync('ht_to_translate_batch4.json', JSON.stringify(batch4, null, 2));

console.log(`Prepared Batch 4 (HT->FR) with ${batch4.length} questions.`);
console.log(`Remaining HT-only: ${htOnly.length - batch4.length}`);
