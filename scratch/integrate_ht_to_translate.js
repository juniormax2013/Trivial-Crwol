const fs = require('fs');
const path = require('path');

const masterPath = path.join(__dirname, 'full_standardization.json');
const toTranslatePath = path.join(__dirname, 'ht_to_translate.json');

const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const toTranslateStrings = JSON.parse(fs.readFileSync(toTranslatePath, 'utf8'));

const masterMap = new Map();
master.forEach((q, index) => {
    masterMap.set(q.newId, index);
});

let integratedCount = 0;
let errors = 0;

toTranslateStrings.forEach(s => {
    try {
        // Clean the string: remove trailing comma and wrap in parentheses for eval-like parsing
        // But since it's a stringified JS object literal, we can do a bit of regex cleanup
        // to make it valid JSON, or just use a simple eval-like approach.
        // The format is: {id:"...", ...}
        
        // Let's try to make it valid JSON by adding quotes to keys
        let jsonStr = s.replace(/,$/, '')
            .replace(/([{,])(\s*)([a-zA-Z0-9]+)\s*:/g, '$1"$3":')
            .replace(/:/g, ':');
        
        // Handle double escaped quotes in strings
        // The source has \" which becomes " when parsed as JSON string, but then it's in the text.
        // Actually, the strings in the array are already JSON-escaped.
        
        // Simpler way: use a function to return the object
        const obj = new Function('return ' + s.replace(/,$/, ''))();
        
        if (masterMap.has(obj.id)) {
            const index = masterMap.get(obj.id);
            master[index].ht = obj;
            integratedCount++;
        } else {
            console.warn(`ID ${obj.id} not found in master`);
        }
    } catch (e) {
        console.error(`Error parsing string: ${s.substring(0, 50)}...`);
        console.error(e.message);
        errors++;
    }
});

console.log(`Integrated ${integratedCount} records from ht_to_translate.json.`);
console.log(`Errors: ${errors}`);

fs.writeFileSync(masterPath, JSON.stringify(master, null, 2));
console.log('Master file updated successfully.');
