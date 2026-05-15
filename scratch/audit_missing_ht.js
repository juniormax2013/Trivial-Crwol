const fs = require('fs');
const path = require('path');

const fullDataPath = 'scratch/full_standardization.json';
const fullData = JSON.parse(fs.readFileSync(fullDataPath, 'utf8'));

const missingHt = fullData.filter(q => !q.ht);
const hasHt = fullData.filter(q => q.ht);

console.log(`Total questions: ${fullData.length}`);
console.log(`Questions with HT: ${hasHt.length}`);
console.log(`Questions missing HT: ${missingHt.length}`);

// Sample some missing HT IDs
console.log('\nSample IDs missing HT:');
console.log(missingHt.slice(0, 10).map(q => q.newId));
