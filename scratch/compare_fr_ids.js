const fs = require('fs');

const master = JSON.parse(fs.readFileSync('c:/Users/junio/Desktop/200/Juego/Trivial App/scratch/full_standardization.json', 'utf8'));
const masterIds = new Set(master.map(q => q.newId));

const frIdsFile = fs.readFileSync('c:/Users/junio/Desktop/200/Juego/Trivial App/fr_ids.txt', 'utf8');
const frIds = frIdsFile.split(/\r?\n/).filter(id => id.trim() !== '');

const missingInMaster = frIds.filter(id => !masterIds.has(id));

console.log(`IDs in fr_ids.txt: ${frIds.length}`);
console.log(`IDs from fr_ids.txt missing in master: ${missingInMaster.length}`);
if (missingInMaster.length > 0) {
    console.log('Sample missing IDs:', missingInMaster.slice(0, 5));
}
