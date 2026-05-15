const fs = require('fs');
const path = require('path');

const masterPath = path.join(__dirname, 'full_standardization.json');
const frPath = path.join(__dirname, '../lib/duel/questionsFR_standardized.ts');

const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const masterIds = new Set(master.map(q => q.newId));

const frContent = fs.readFileSync(frPath, 'utf8');
const frIds = [...frContent.matchAll(/id:\s*["'](dq-[^"']+)["']/g)].map(m => m[1]);

const missing = frIds.filter(id => !masterIds.has(id));

console.log(`Total IDs in questionsFR_standardized.ts: ${frIds.length}`);
console.log(`IDs missing in Master: ${missing.length}`);
if (missing.length > 0) {
    console.log(`Sample missing IDs: ${missing.slice(0, 10).join(', ')}`);
}
