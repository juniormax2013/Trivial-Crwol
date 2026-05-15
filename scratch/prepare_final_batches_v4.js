const fs = require('fs');

const data = JSON.parse(fs.readFileSync('full_standardization.json', 'utf8'));
const untranslatedIds = new Set(data.filter(q => !q.fr).map(q => q.ht.id));

const sourceFile = 'ht_to_translate.json';
const rawArray = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));

const pending = [];
rawArray.forEach((str, index) => {
    // 1. Extract ID to check if pending
    const idMatch = str.match(/id:\\"([^\\"]+)\\"/) || str.match(/id:"([^"]+)"/);
    if (idMatch) {
        const id = idMatch[1];
        if (untranslatedIds.has(id)) {
            // Remove trailing comma if any
            let work = str.trim().replace(/,$/, '');
            
            // Quote keys
            work = work.replace(/(^|\{|,)\s*([a-zA-Z0-9]+)\s*:/g, '$1"$2":');
            
            // Normalize quotes for values
            work = work.replace(/:\\"/g, ':"');
            work = work.replace(/\\"(,|\})/g, '"$1');
            
            try {
                const obj = JSON.parse(work);
                pending.push(obj);
            } catch (e) {
                // Try to escape quotes inside values
                // Values are now like "key": "value with " inside"
                // This regex is a bit risky but let's try.
                // It looks for " that is not preceded by : and not followed by , or }
                let fixed = work.replace(/([^:])"([^,}])/g, '$1\\"$2');
                try {
                    const obj = JSON.parse(fixed);
                    pending.push(obj);
                } catch (e2) {
                    // One last attempt: unescape everything first then try to fix
                    // This is for cases where it's really messy
                }
            }
        }
    }
});

console.log(`Successfully parsed ${pending.length} pending questions.`);

const batch5 = pending.slice(0, 45);
const batch6 = pending.slice(45);

fs.writeFileSync('ht_to_translate_batch5.json', JSON.stringify(batch5, null, 2));
fs.writeFileSync('ht_to_translate_batch6.json', JSON.stringify(batch6, null, 2));

console.log(`Created batches with ${batch5.length} and ${batch6.length} questions.`);
