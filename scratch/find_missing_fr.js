
const fs = require('fs');
const path = require('path');

function getIds(fileName) {
  const filePath = path.join(__dirname, '..', 'lib', 'duel', fileName);
  const content = fs.readFileSync(filePath, 'utf8');
  const idRegex = /id:"([^"]+)"/g;
  const ids = [];
  let match;
  while ((match = idRegex.exec(content)) !== null) {
    ids.push(match[1]);
  }
  return ids;
}

const htIds = getIds('questionsHT_standardized.ts');
const frIds = getIds('questionsFR_standardized.ts');

const missingInFr = htIds.filter(id => !frIds.includes(id));

console.log('Total HT IDs:', htIds.length);
console.log('Total FR IDs:', frIds.length);
console.log('Missing in FR:', missingInFr.length);

// Group by category prefix (e.g. dq-pent)
const grouped = {};
missingInFr.forEach(id => {
  const prefix = id.split('-').slice(0, 2).join('-');
  grouped[prefix] = (grouped[prefix] || 0) + 1;
});

console.log('\nMissing by ID Prefix:');
Object.entries(grouped).forEach(([prefix, count]) => {
  console.log(`${prefix.padEnd(20)}: ${count}`);
});
