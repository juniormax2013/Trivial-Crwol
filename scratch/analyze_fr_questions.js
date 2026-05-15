const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../lib/duel/questionsFR_standardized.ts');
const content = fs.readFileSync(filePath, 'utf8');

const categoryIds = new Set();
const regex = /categoryId:"([^"]+)"/g;
let match;

while ((match = regex.exec(content)) !== null) {
  categoryIds.add(match[1]);
}

console.log('Unique Category IDs in French Questions:');
console.log(Array.from(categoryIds).sort());

// Also count by difficulty
const counts = {};
const diffRegex = /difficulty:"([^"]+)"/g;
const questionRegex = /{id:"([^"]+)",questionText:"[^"]+",categoryId:"([^"]+)",categoryName:"[^"]+",difficulty:"([^"]+)",language:"fr"/g;

let qMatch;
while ((qMatch = questionRegex.exec(content)) !== null) {
  const [_, id, cat, diff] = qMatch;
  if (!counts[cat]) counts[cat] = { easy: 0, medium: 0, hard: 0, total: 0 };
  counts[cat][diff]++;
  counts[cat].total++;
}

console.log('\nQuestion Distribution:');
console.table(counts);
