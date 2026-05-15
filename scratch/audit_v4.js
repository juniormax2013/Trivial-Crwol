const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'full_standardization_v4.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log(`Total questions in v4: ${data.length}`);

let missingFr = 0;
let missingHt = 0;
let validCount = 0;

data.forEach((q, index) => {
    // Check for questionText instead of question
    const hasFr = q.fr && q.fr.questionText && q.fr.options && q.fr.options.length === 4;
    const hasHt = q.ht && q.ht.questionText && q.ht.options && q.ht.options.length === 4;

    if (!hasFr) missingFr++;
    if (!hasHt) missingHt++;
    if (hasFr && hasHt) validCount++;
});

console.log(`Questions with valid French: ${data.length - missingFr}`);
console.log(`Questions with valid Haitian: ${data.length - missingHt}`);
console.log(`Questions with 100% parity: ${validCount}`);

if (validCount === 1049) {
    console.log('SUCCESS: All 1049 questions are standardized and translated.');
} else {
    console.log('FAILURE: Parity audit failed.');
}
