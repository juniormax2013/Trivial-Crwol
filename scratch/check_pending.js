const fs = require('fs');

const batches = [1, 2, 3, 4];
const translatedIds = new Set();

batches.forEach(i => {
    const f = `fr_translated_batch${i}.json`;
    if (fs.existsSync(f)) {
        const data = JSON.parse(fs.readFileSync(f));
        data.forEach(q => {
            if (q.id) translatedIds.add(q.id);
            else if (q.ht && q.ht.id) translatedIds.add(q.ht.id);
            else if (q.newId) translatedIds.add(q.newId);
        });
    }
});

console.log('Total translated IDs in batches:', translatedIds.size);

const sourceFile = 'ht_to_translate.json';
if (fs.existsSync(sourceFile)) {
    let sourceData = fs.readFileSync(sourceFile, 'utf8');
    let rawArray = JSON.parse(sourceData);
    
    const pendingIds = [];
    rawArray.forEach(str => {
        const match = str.match(/id:"([^"]+)"/);
        if (match) {
            const id = match[1];
            if (!translatedIds.has(id)) {
                pendingIds.push(id);
            }
        }
    });

    console.log('Pending IDs in ht_to_translate.json:', pendingIds.length);
    if (pendingIds.length > 0) {
        console.log('Sample pending IDs:', pendingIds.slice(0, 5));
    }
}
