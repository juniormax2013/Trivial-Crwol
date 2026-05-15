const fs = require('fs');

const data = JSON.parse(fs.readFileSync('full_standardization.json', 'utf8'));

let onlyHt = 0;
let onlyFr = 0;
let both = 0;
let total = data.length;

data.forEach(q => {
    const hasHt = !!(q.ht && q.ht.questionText);
    const hasFr = !!(q.fr && q.fr.questionText);
    
    if (hasHt && hasFr) both++;
    else if (hasHt) onlyHt++;
    else if (hasFr) onlyFr++;
});

console.log(`Total: ${total}`);
console.log(`Both HT & FR: ${both}`);
console.log(`Only HT: ${onlyHt}`);
console.log(`Only FR: ${onlyFr}`);
console.log(`Parity Gap (FR needs HT): ${onlyFr}`);
console.log(`Parity Gap (HT needs FR): ${onlyHt}`);
