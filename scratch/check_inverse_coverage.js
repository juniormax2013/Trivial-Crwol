const fs = require('fs');
const path = require('path');

const master = JSON.parse(fs.readFileSync('c:/Users/junio/Desktop/200/Juego/Trivial App/scratch/full_standardization.json', 'utf8'));
const masterIds = new Set(master.map(q => q.newId));

const scratchDir = 'c:/Users/junio/Desktop/200/Juego/Trivial App/scratch';

let totalInInverse = 0;
let missingFromMaster = 0;
const missingIds = [];

for (let i = 1; i <= 5; i++) {
    const file = `fr_to_translate_inverse_batch${i}.json`;
    const filePath = path.join(scratchDir, file);
    if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        totalInInverse += data.length;
        for (const item of data) {
            const id = item.newId || item.id;
            if (!masterIds.has(id)) {
                missingFromMaster++;
                missingIds.push({ id, file });
            }
        }
    }
}

console.log(`Total questions in inverse batches 1-5: ${totalInInverse}`);
console.log(`Missing from master: ${missingFromMaster}`);
if (missingIds.length > 0) {
    console.log('First 5 missing IDs:', missingIds.slice(0, 5));
}
