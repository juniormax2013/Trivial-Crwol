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

console.log(`Found ${translatedIds.size} translated IDs.`);

const sourceFile = 'ht_to_translate.json';
const rawArray = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
console.log(`Source file has ${rawArray.length} items.`);

const pending = [];
rawArray.forEach((str, index) => {
    const match = str.match(/id:"([^"]+)"/);
    if (match) {
        const id = match[1];
        if (!translatedIds.has(id)) {
            let fixed = str.replace(/([a-zA-Z0-9]+):/g, '"$1":');
            // Fix nested quotes in values like "Jozye "8":1"
            // This is tricky. A simple way is to replace ": with \": if it's not at the start of a key/value pair.
            // Actually, let's just try to escape quotes that are not following a colon or preceded by a colon.
            // Or more simply, since we know the keys are now quoted, we can look for "Key": "Value" pattern.
            
            try {
                const obj = JSON.parse(fixed);
                pending.push(obj);
            } catch (e) {
                // Try a more aggressive fix for nested quotes
                // Replace " inside a string value (between : and , or })
                let evenMoreFixed = fixed.replace(/:\s*"([^"]*)"/g, (m, p1) => {
                    return ': "' + p1.replace(/"/g, '\\"') + '"';
                });
                try {
                    const obj = JSON.parse(evenMoreFixed);
                    pending.push(obj);
                } catch (e2) {
                    console.error(`Failed to parse item at index ${index} (ID: ${id}):`, fixed);
                }
            }
        }
    }
});

console.log(`Found ${pending.length} pending items.`);

fs.writeFileSync('ht_to_translate_batch5.json', JSON.stringify(pending.slice(0, 45), null, 2));
fs.writeFileSync('ht_to_translate_batch6.json', JSON.stringify(pending.slice(45), null, 2));

console.log(`Created ht_to_translate_batch5.json (${pending.slice(0, 45).length} questions)`);
console.log(`Created ht_to_translate_batch6.json (${pending.slice(45).length} questions)`);

