const fs = require('fs');
const path = require('path');

const fullDataPath = path.join('scratch', 'full_standardization.json');
const fullData = JSON.parse(fs.readFileSync(fullDataPath, 'utf8'));

let withES = 0;
fullData.forEach(q => {
    if (q.es) withES++;
});

console.log(`Items with ES: ${withES}`);
console.log(`Sample with ES:`);
console.log(JSON.stringify(fullData.find(q => q.es), null, 2));
