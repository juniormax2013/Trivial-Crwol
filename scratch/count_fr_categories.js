
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'lib', 'duel', 'questionsFR_standardized.ts');
const content = fs.readFileSync(filePath, 'utf8');

// Regex to find categoryId in the objects
const categoryRegex = /categoryId:"([^"]+)"/g;
let match;
const counts = {};

while ((match = categoryRegex.exec(content)) !== null) {
  const catId = match[1];
  counts[catId] = (counts[catId] || 0) + 1;
}

console.log('--- French Questions Count by Category (Raw Parse) ---');
Object.entries(counts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([id, count]) => {
    console.log(`${id.padEnd(20)}: ${count}`);
  });

const total = Object.values(counts).reduce((a, b) => a + b, 0);
console.log('\nTotal Questions Found:', total);
