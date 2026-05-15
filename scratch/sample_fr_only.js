const fs = require('fs');
const data = JSON.parse(fs.readFileSync('full_standardization.json', 'utf8'));
const frOnly = data.filter(q => !q.ht && q.fr);

console.log('Sample FR Only Questions:');
frOnly.slice(0, 10).forEach(q => {
    console.log(`- [${q.newId}] ${q.fr.questionText}`);
});
