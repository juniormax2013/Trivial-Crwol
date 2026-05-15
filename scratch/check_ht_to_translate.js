const fs = require('fs');
const path = require('path');

const masterPath = path.join(__dirname, 'full_standardization.json');
const pendingPath = path.join(__dirname, 'ht_to_translate.json');

const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const pendingRaw = JSON.parse(fs.readFileSync(pendingPath, 'utf8'));

const masterMap = new Map();
master.forEach(q => {
    masterMap.set(q.newId, q);
});

const results = {
    notFound: [],
    missingHT: [],
    alreadyIn: []
};

pendingRaw.forEach(line => {
    // Try to extract ID using regex since it's not valid JSON
    const idMatch = line.match(/id:"([^"]+)"/);
    if (idMatch) {
        const id = idMatch[1];
        if (!masterMap.has(id)) {
            results.notFound.push(id);
        } else {
            const masterQ = masterMap.get(id);
            if (!masterQ.ht || !masterQ.ht.questionText) {
                results.missingHT.push(id);
            } else {
                results.alreadyIn.push(id);
            }
        }
    }
});

console.log(`Summary of ht_to_translate.json (Total ${pendingRaw.length} entries):`);
console.log(`- Not found in master: ${results.notFound.length}`);
console.log(`- Found but missing HT in master: ${results.missingHT.length}`);
console.log(`- Already integrated: ${results.alreadyIn.length}`);

if (results.notFound.length > 0) {
    console.log('IDs not found in master:', results.notFound.join(', '));
}

if (results.missingHT.length > 0) {
    console.log('IDs found but missing HT:', results.missingHT.join(', '));
}
