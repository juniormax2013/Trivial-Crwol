const fs = require('fs');

const data = JSON.parse(fs.readFileSync('full_standardization.json', 'utf8'));
const untranslated = data.filter(q => !q.fr);
const untranslatedIds = new Set(untranslated.map(q => q.ht.id));
console.log('Total untranslated in full_standardization:', untranslatedIds.size);
console.log('Sample untranslated IDs:', Array.from(untranslatedIds).slice(0, 5));

const sourceFile = 'ht_to_translate.json';
const rawArray = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
console.log('Total items in ht_to_translate.json:', rawArray.length);

const pending = [];
rawArray.forEach((str, index) => {
    // The source strings use id:\"...\"
    const match = str.match(/id:\\"([^\\"]+)\\"/);
    if (match) {
        const id = match[1];
        if (index < 5) console.log(`Source ID at ${index}: ${id}`);
        if (untranslatedIds.has(id)) {
            // Fix the string to be valid JSON
            // 1. Unescape quotes
            let unescaped = str.replace(/\\"/g, '"');
            // 2. Quote keys
            let fixed = unescaped.replace(/(^|\{|,)\s*([a-zA-Z0-9]+)\s*:/g, '$1"$2":');
            // 3. Fix nested quotes in values
            let evenMoreFixed = fixed.replace(/:\s*"([^"]*)"/g, (m, p1) => {
                return ': "' + p1.replace(/"/g, '\\"') + '"';
            });

            try {
                const obj = JSON.parse(evenMoreFixed);
                pending.push(obj);
            } catch (e) {
                // console.error(`Failed to parse item ID: ${id}`);
            }
        }
    } else {
        // Try without escaped quotes
        const match2 = str.match(/id:"([^"]+)"/);
        if (match2) {
            const id = match2[1];
            if (index < 5) console.log(`Source ID at ${index} (no escape): ${id}`);
            if (untranslatedIds.has(id)) {
                let fixed = str.replace(/(^|\{|,)\s*([a-zA-Z0-9]+)\s*:/g, '$1"$2":');
                let evenMoreFixed = fixed.replace(/:\s*"([^"]*)"/g, (m, p1) => {
                    return ': "' + p1.replace(/"/g, '\\"') + '"';
                });
                try {
                    const obj = JSON.parse(evenMoreFixed);
                    pending.push(obj);
                } catch (e) {
                    // console.error(`Failed to parse item ID: ${id}`);
                }
            }
        }
    }
});

console.log(`Found ${pending.length} pending items.`);

const batch5 = pending.slice(0, 45);
const batch6 = pending.slice(45);

fs.writeFileSync('ht_to_translate_batch5.json', JSON.stringify(batch5, null, 2));
fs.writeFileSync('ht_to_translate_batch6.json', JSON.stringify(batch6, null, 2));

console.log(`Created ht_to_translate_batch5.json with ${batch5.length} questions`);
console.log(`Created ht_to_translate_batch6.json with ${batch6.length} questions`);
