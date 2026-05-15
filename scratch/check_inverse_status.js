const fs = require('fs');
const files = fs.readdirSync('scratch').filter(f => f.startsWith('fr_to_translate_inverse_batch'));
let total = 0;
files.sort().forEach(f => {
    const data = JSON.parse(fs.readFileSync('scratch/' + f, 'utf8'));
    total += data.length;
    console.log(`${f}: ${data.length}`);
});
console.log(`Total inverse batches: ${total}`);

const htTranslatedFiles = fs.readdirSync('scratch').filter(f => f.startsWith('ht_translated_inverse_batch'));
let htTotal = 0;
htTranslatedFiles.sort().forEach(f => {
    const data = JSON.parse(fs.readFileSync('scratch/' + f, 'utf8'));
    htTotal += data.length;
    console.log(`${f}: ${data.length}`);
});
console.log(`Total HT translated inverse: ${htTotal}`);
