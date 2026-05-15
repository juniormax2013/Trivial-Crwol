const fs = require('fs');
const missing = JSON.parse(fs.readFileSync('scratch/missing_from_fr.json', 'utf8'));
const batch3 = missing.slice(50, 150);
fs.writeFileSync('scratch/batch3_raw.json', JSON.stringify(batch3, null, 2));
console.log('Batch 3 raw saved. Count:', batch3.length);
console.log('First ID:', batch3[0].id);
console.log('Last ID:', batch3[batch3.length - 1].id);
