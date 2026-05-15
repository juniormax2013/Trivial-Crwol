const fs = require('fs');
const path = require('path');

const scratchDir = 'c:/Users/junio/Desktop/200/Juego/Trivial App/scratch';

const rawFile = path.join(scratchDir, 'batch3_raw.json');
const transFile1 = path.join(scratchDir, 'fr_batch3_translated.json');
const transFile2 = path.join(scratchDir, 'fr_batch3a_translated.json');

const rawData = JSON.parse(fs.readFileSync(rawFile, 'utf8'));
const transData1 = JSON.parse(fs.readFileSync(transFile1, 'utf8'));
const transData2 = JSON.parse(fs.readFileSync(transFile2, 'utf8'));

const rawIds = rawData.map(q => q.id);
const transIds1 = new Set(transData1.map(q => q.id));
const transIds2 = new Set(transData2.map(q => q.id));

const missing = rawIds.filter(id => !transIds1.has(id) && !transIds2.has(id));
const inTrans1 = rawIds.filter(id => transIds1.has(id));
const inTrans2 = rawIds.filter(id => transIds2.has(id));

console.log('Batch 3 Raw total: ' + rawIds.length);
console.log('Found in fr_batch3_translated: ' + inTrans1.length);
console.log('Found in fr_batch3a_translated: ' + inTrans2.length);
console.log('Missing from both: ' + missing.length);

if (missing.length > 0) {
    console.log('Missing IDs (first 10): ' + missing.slice(0, 10).join(', '));
}
