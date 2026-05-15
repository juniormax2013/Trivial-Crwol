const fs = require('fs');
const path = require('path');

const fullDataPath = path.join('scratch', 'full_standardization.json');
const fullData = JSON.parse(fs.readFileSync(fullDataPath, 'utf8'));

const total = fullData.length;
const translated = fullData.filter(q => q.fr).length;
const pending = fullData.filter(q => !q.fr);

console.log(`Total questions: ${total}`);
console.log(`Translated (FR): ${translated}`);
console.log(`Pending: ${pending.length}`);

if (pending.length > 0) {
    console.log('\nNext 20 pending questions:');
    const sample = pending.slice(0, 20);
    sample.forEach(q => {
        console.log(`- ${q.newId}: ${q.category}`);
    });
}
