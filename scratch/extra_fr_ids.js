
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

const inFrButNotHt = frIds.filter(id => !htIds.includes(id));

console.log('In FR but NOT in HT:', inFrButNotHt.length);
if (inFrButNotHt.length > 0) {
    console.log('Sample extra IDs:', inFrButNotHt.slice(0, 10));
}
