const fs = require('fs');
const content = fs.readFileSync('lib/duel/questionsHT_standardized.ts', 'utf8');
const regex = /categoryId:"([^"]+)"/g;
const counts = {};
let match;
while ((match = regex.exec(content)) !== null) {
  const id = match[1];
  counts[id] = (counts[id] || 0) + 1;
}
console.log(JSON.stringify(counts, null, 2));
