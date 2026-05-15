const fs = require('fs');
const path = require('path');

const scratchDir = 'c:/Users/junio/Desktop/200/Juego/Trivial App/scratch';
const masterFile = path.join(scratchDir, 'full_standardization.json');
const masterData = JSON.parse(fs.readFileSync(masterFile, 'utf8'));
const masterIds = new Set(masterData.map(q => q.newId));

const files = fs.readdirSync(scratchDir);
const translationFiles = files.filter(f => f.startsWith('fr_translated_batch') && f.endsWith('.json'));

let inMaster = 0;
let notInMaster = 0;
const notInMasterList = [];

translationFiles.forEach(f => {
    try {
        const data = JSON.parse(fs.readFileSync(path.join(scratchDir, f), 'utf8'));
        if (Array.isArray(data)) {
            data.forEach(q => {
                if (masterIds.has(q.id)) {
                    inMaster++;
                } else {
                    notInMaster++;
                    notInMasterList.push(q.id);
                }
            });
        }
    } catch (e) {}
});

console.log('Total IDs in translated batches: ' + (inMaster + notInMaster));
console.log('Already in master: ' + inMaster);
console.log('Not in master: ' + notInMaster);

if (notInMaster > 0) {
    console.log('First 10 missing from master: ' + notInMasterList.slice(0, 10).join(', '));
}
