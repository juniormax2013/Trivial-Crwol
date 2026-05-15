const fs = require('fs');
const data = JSON.parse(fs.readFileSync('full_standardization.json', 'utf8'));

let fixedCount = 0;

data.forEach(q => {
    if (q.fr && q.fr.fr) {
        q.fr = q.fr.fr;
        fixedCount++;
    }
});

fs.writeFileSync('full_standardization.json', JSON.stringify(data, null, 2));
console.log(`Fixed ${fixedCount} questions with nested fr key.`);
