const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'ht_to_translate.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const ids = data.map(s => {
    const match = s.match(/id:"(.*?)"/);
    if (match) return match[1];
    const escapedMatch = s.match(/id:\\"(.*?)\\"/);
    if (escapedMatch) return escapedMatch[1];
    return null;
}).filter(x => x);

console.log(`IDs found in ht_to_translate.json: ${ids.length}`);
console.log(`Sample IDs: ${ids.slice(0, 5).join(', ')}`);

const masterPath = path.join(__dirname, 'full_standardization.json');
const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const masterIds = new Set(master.map(q => q.newId));

const found = ids.filter(id => masterIds.has(id));
console.log(`Found in master: ${found.length}`);
if (found.length > 0) {
    console.log(`Sample found: ${found.slice(0, 5).join(', ')}`);
}
