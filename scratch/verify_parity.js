const fs = require('fs');
const path = require('path');

const fullDataPath = path.join('scratch', 'full_standardization.json');
const fullData = JSON.parse(fs.readFileSync(fullDataPath, 'utf8'));

let withHT = 0;
let withFR = 0;
let both = 0;

fullData.forEach(q => {
    if (q.ht) withHT++;
    if (q.fr) withFR++;
    if (q.ht && q.fr) both++;
});

console.log(`Total items: ${fullData.length}`);
console.log(`Items with HT: ${withHT}`);
console.log(`Items with FR: ${withFR}`);
console.log(`Items with both: ${both}`);
