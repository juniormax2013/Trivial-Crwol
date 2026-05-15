const fs = require('fs');
const path = require('path');

const sourcePath = 'c:/Users/junio/Desktop/200/Juego/Trivial App/scratch/fr_to_translate_inverse_batch5.json';
const sourceData = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

// Extract IDs from part 1 script by reading the file and looking for keys
const part1Path = 'c:/Users/junio/Desktop/200/Juego/Trivial App/scratch/generate_ht_batch5_part1.js';
const part1Content = fs.readFileSync(part1Path, 'utf8');

const sourceIds = sourceData.map(d => d.newId);
const translatedIds = sourceIds.filter(id => part1Content.includes(`"${id}":`));

const missingIds = sourceIds.filter(id => !translatedIds.includes(id));

console.log('Total in source:', sourceIds.length);
console.log('Translated in part 1:', translatedIds.length);
console.log('Missing IDs:', missingIds);

const missingData = sourceData.filter(d => missingIds.includes(d.newId));
fs.writeFileSync('c:/Users/junio/Desktop/200/Juego/Trivial App/scratch/batch5_missing_part2.json', JSON.stringify(missingData, null, 2));
console.log('Saved missing questions to batch5_missing_part2.json');
