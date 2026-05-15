const fs = require('fs');
const data = JSON.parse(fs.readFileSync('full_standardization.json', 'utf8'));

// Get HT only questions
const htOnly = data.filter(q => q.ht && !q.fr);

// Take 50 for Batch 3
const batch3 = htOnly.slice(0, 50);

fs.writeFileSync('ht_to_translate_batch3.json', JSON.stringify(batch3, null, 2));

console.log(`Prepared Batch 3 with ${batch3.length} questions.`);
