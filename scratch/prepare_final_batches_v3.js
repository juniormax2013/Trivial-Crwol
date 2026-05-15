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
            // 2. Convert to valid JSON
            // We need to handle the fact that keys are unquoted and values are quote-escaped or not.
            
            // Strategy: 
            // a. Quote keys and ensure values are quoted.
            // b. Handle escaped quotes inside values.
            
            let work = str.trim();
            // Quote keys at start or after comma
            work = work.replace(/(^|\{|,)\s*([a-zA-Z0-9]+)\s*:/g, '$1"$2":');
            
            // Now we have "key": \"value\" or "key": "value"
            // Let's normalize to "key": "value" (with possible escaped quotes inside)
            work = work.replace(/:\\"/g, ':"');
            work = work.replace(/\\"(,|\})/g, '"$1');
            
            // Now the main issue is " inside values.
            // But if they were escaped as \\" in the original string, they are now \" in our 'work' string.
            // JSON.parse handles \" correctly inside a string.
            
            try {
                const obj = JSON.parse(work);
                pending.push(obj);
            } catch (e) {
                // If it still fails, it's likely due to unescaped quotes that were NOT escaped in the source.
                // Let's try to escape them.
                // A quote is inside a value if it's NOT preceded by : and NOT followed by , or }
                let fixed = work.replace(/([^:])"([^,}])/g, '$1\\"$2');
                try {
                    const obj = JSON.parse(fixed);
                    pending.push(obj);
                } catch (e2) {
                    console.error(`Final fail for ID ${id}: ${e2.message}`);
                    // console.log('Problematic string:', fixed);
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
